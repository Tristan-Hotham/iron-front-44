/* ============================== MULTIPLAYER ===============================
   Three ways to play a human opponent:
   - Hotseat: one machine, a hand-off screen hides the map between turns.
   - Turn codes (play by mail): after each turn the game prints a compressed
     code; paste it into the other player's game to continue.
   - Online: on claude.ai, the page's shared database holds each game. One
     player creates it and shares a 5-letter code, the other joins, and
     every finished turn syncs live, the opponent's moves replayed on the
     map. Both players must be signed in with the game shared to them at
     Contributor level or above. */
const NET = {db:null, user:null, uid:null, ready:null, unsub:null, games:[], unsubList:null};
const isRemote = t => !!(G && G.online && t !== G.online.seat);
const isLocalHotseat = () => G && !G.online && !G.pbem && !G.teams[1].ai && !G.teams[2].ai;

/* ---------- packing a game into a compact string ---------- */
async function packState(str) {
  if (typeof CompressionStream === 'undefined') return 'J' + btoa(unescape(encodeURIComponent(str)));
  const cs = new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf = new Uint8Array(await new Response(cs).arrayBuffer()); let bin = '';
  for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
  return 'Z' + btoa(bin);
}
async function unpackState(code) {
  code = code.trim().replace(/\s+/g, '');
  if (code[0] === 'J') return decodeURIComponent(escape(atob(code.slice(1))));
  const bin = atob(code.slice(1)), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return await new Response(ds).text();
}
function netSerial() { const o = G.online, p = G.pbem; G.online = undefined; G.pbem = undefined; const s = serial(); G.online = o; G.pbem = p; return s; }

/* ---------- hotseat ---------- */
function handoff(team) {
  return new Promise(res => {
    const el = $('#handoff'), T = G.teams[team];
    el.querySelector('.pt').replaceChildren(portraitCanvas(T.co, 1.5));
    el.querySelector('h2').textContent = `${NATION[T.nat].n} to move`;
    el.querySelector('p').textContent = `${CO[T.co].rank} ${CO[T.co].n} · ${fmtClock(G.day, G.clock, true)}. Pass the controls, then click when ready.`;
    el.hidden = false;
    const go = () => { el.hidden = true; el.removeEventListener('click', go); res(); };
    el.addEventListener('click', go);
  });
}

/* ---------- turn codes ---------- */
async function showTurnCode(afterTurn) {
  const code = await packState(netSerial());
  const m = $('#codebox'); m.querySelector('h3').textContent = afterTurn ? 'Your turn is done' : 'Turn code';
  m.querySelector('p').textContent = afterTurn ? `Send this code to your opponent (${NATION[G.teams[G.turn].nat].n}). They paste it under Multiplayer → Turn code to play their turn.` : 'Anyone who pastes this code continues the game from this exact moment.';
  const ta = m.querySelector('textarea'); ta.value = code; ta.readOnly = true;
  m.querySelector('.ok').textContent = 'Copy code';
  m.querySelector('.ok').onclick = async () => { try { await navigator.clipboard.writeText(code); m.querySelector('.ok').textContent = 'Copied'; } catch (e) { ta.select(); m.querySelector('.ok').textContent = 'Press Ctrl+C'; } };
  m.querySelector('.cancel').textContent = afterTurn ? 'Back to menu' : 'Close';
  m.querySelector('.cancel').onclick = () => { m.hidden = true; if (afterTurn) { show('title'); musicMood('title'); } };
  m.querySelector('small').textContent = `${code.length.toLocaleString('en-GB')} characters`;
  m.hidden = false;
}
function askTurnCode() {
  const m = $('#codebox'); m.querySelector('h3').textContent = 'Paste a turn code';
  m.querySelector('p').textContent = 'Paste the code your opponent sent you. You will play whichever side is due to move.';
  const ta = m.querySelector('textarea'); ta.value = ''; ta.readOnly = false; m.querySelector('small').textContent = '';
  m.querySelector('.ok').textContent = 'Load and play';
  m.querySelector('.ok').onclick = async () => {
    try { const s = await unpackState(ta.value); revive(s); }
    catch (e) { m.querySelector('small').textContent = 'That code could not be read. Check it was copied in full.'; return; }
    m.hidden = true; G.pbem = true; G.teams[1].ai = G.teams[2].ai = false; UI.overShown = false;
    enterGame(); beginTurn();
  };
  m.querySelector('.cancel').textContent = 'Cancel'; m.querySelector('.cancel').onclick = () => { m.hidden = true; };
  m.hidden = false; ta.focus();
}

/* ---------- online ---------- */
function netInit() {
  if (NET.ready) return NET.ready;
  NET.ready = (async () => {
    if (!window.claude || !claude.use) return false;
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return false;
    NET.db = db; NET.user = user; NET.uid = await user.id().catch(() => null);
    return !!NET.uid;
  })().catch(() => false);
  return NET.ready;
}
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const newCode = () => Array.from({length:5}, () => CODE_ABC[Math.random() * CODE_ABC.length | 0]).join('');
async function openOnline() {
  show('online');
  const st = $('#netstatus'); st.textContent = 'Connecting…';
  const sel = $('#netmission'), keep = sel.value, mine = Object.keys(edSaved());
  sel.innerHTML = '<option value="skirmish">Skirmish: random Normandy battlefield</option>' + (mine.length ? '<optgroup label="Your maps">' + mine.map(n => `<option value="map:${n.replace(/"/g, '&quot;')}">${n.replace(/</g, '&lt;')}</option>`).join('') + '</optgroup>' : '') + CAMPAIGNS.map(c => `<optgroup label="${c.name}">` + c.missions.map(id => `<option value="${id}">${MISSIONS[id].name} (${MISSIONS[id].date})</option>`).join('') + '</optgroup>').join('');
  if (keep) sel.value = keep;
  const ok = await netInit();
  $('#netbox').hidden = !ok;
  if (!ok) { st.innerHTML = 'Online play works when this game is opened on claude.ai by signed-in players it is shared with at <b>Contributor</b> level or above. You can still play by <b>turn code</b> or <b>hotseat</b>.'; return; }
  st.textContent = 'Connected. Create a game and send your opponent the code, or join theirs.';
  if (!NET.unsubList) NET.unsubList = NET.db.collection('games').where('players', 'array-contains', NET.uid).limit(30).onSnapshot(s => { NET.games = s.docs.map(d => d.data()); renderGameList(); }, () => {});
  renderGameList();
}
function renderGameList() {
  const el = $('#netgames'); if (!el) return; el.innerHTML = '';
  const games = NET.games.filter(g => g.status !== 'over').sort((a, b) => b.updated - a.updated);
  if (!games.length) { el.innerHTML = '<p class="dim">No games in progress.</p>'; return; }
  for (const g of games) {
    const mine = Object.entries(g.seats || {}).find(([, v]) => v === NET.uid), seat = mine ? +mine[0] : 0, myTurn = g.turn === seat && g.status === 'playing';
    const b = document.createElement('button'); b.className = 'netgame' + (myTurn ? ' due' : '');
    b.innerHTML = `<b>${g.title}</b><small>Code ${g.code} · ${g.status === 'waiting' ? 'waiting for an opponent' : myTurn ? 'your move' : 'their move'} · ${g.clock || ''}</small>`;
    b.onclick = () => resumeOnline(g.code); el.append(b);
  }
}
async function createOnline() {
  const st = $('#netstatus'), id = $('#netmission').value, seat = +$('#netseat').value;
  let cfg;
  if (id === 'skirmish') { const rows = genMap('normandy', 30, 20, Date.now() % 1e9); cfg = {map:rows, theme:'normandy', objective:{win:'hq'}, weather:'clear', clock:{start:'1944-07-01T09:00', step:60},
    teams:{1:{nat:'us', co:'patton', funds:5000}, 2:{nat:'ger', co:'rommel', funds:5000}}, units:{1:skirmishUnits(rows, 1), 2:skirmishUnits(rows, 2)}}; }
  else if (id.startsWith('map:')) { const s = edSaved()[id.slice(4)], keepMap = ED.map; ED.map = Object.assign(edBlank(), s, {rows:s.rows.map(r => r.split(''))}); cfg = edCfg(false, false); ED.map = keepMap; }
  else cfg = missionCfg(MISSIONS[id]);
  cfg.teams[1].ai = cfg.teams[2].ai = false;
  UID = 1; newGame(cfg); G.firstTeam = 1;
  const code = newCode(), title = id === 'skirmish' ? 'Skirmish' : id.startsWith('map:') ? id.slice(4) : MISSIONS[id].name;
  G.online = {code, seat, version:1};
  try {
    await NET.db.doc('games/' + code).set({code, title, mission:id, players:[NET.uid], seats:{1:seat === 1 ? NET.uid : null, 2:seat === 2 ? NET.uid : null},
      state:await packState(netSerial()), turn:G.turn, version:1, status:'waiting', updated:Date.now(), clock:fmtClock(G.day, G.clock, true), started:false});
  } catch (e) { st.textContent = e.code === 'invalid_argument' ? 'You do not have permission to create games here. Ask the owner to share the game with you as a Contributor.' : 'Could not create the game: ' + (e.message || e.code); return; }
  st.textContent = `Game created. Code: ${code}`;
  watchGame(code); UI.overShown = false; enterGame();
  netWaitOrPlay();
}
async function joinOnline() {
  const st = $('#netstatus'), code = $('#netcode').value.trim().toUpperCase();
  if (!/^[A-Z]{5}$/.test(code)) { st.textContent = 'A game code is five letters.'; return; }
  const ref = NET.db.doc('games/' + code), snap = await ref.get();
  if (!snap.exists) { st.textContent = 'No game with that code.'; return; }
  const g = snap.data();
  if (Object.values(g.seats).includes(NET.uid)) return resumeOnline(code);
  const free = [1, 2].find(s => !g.seats[s]); if (!free) { st.textContent = 'That game already has two players.'; return; }
  const lease = await ref.acquire({holder:NET.uid, ttlMs:5000});
  if (!lease.acquired) { st.textContent = 'Someone else is joining that game right now. Try again in a moment.'; return; }
  const again = (await ref.get()).data(); if (again.seats[free]) { st.textContent = 'That seat was just taken.'; return; }
  await ref.update({seats:Object.assign({}, again.seats, {[free]:NET.uid}), players:[...again.players, NET.uid], status:'playing', updated:Date.now()});
  resumeOnline(code);
}
async function resumeOnline(code) {
  const snap = await NET.db.doc('games/' + code).get(); if (!snap.exists) return;
  const g = snap.data(), seat = +Object.entries(g.seats).find(([, v]) => v === NET.uid)[0];
  revive(await unpackState(g.state)); G.teams[1].ai = G.teams[2].ai = false;
  G.online = {code, seat, version:g.version}; UI.overShown = false;
  watchGame(code); enterGame(); netWaitOrPlay(g);
}
function watchGame(code) {
  if (NET.unsub) NET.unsub();
  NET.unsub = NET.db.doc('games/' + code).onSnapshot(async snap => {
    if (!snap.exists || !G || !G.online || G.online.code !== code) return;
    const g = snap.data();
    if (g.version > G.online.version) {                 // the opponent finished a turn
      const before = G, s = await unpackState(g.state);
      revive(s); G.teams[1].ai = G.teams[2].ai = false; G.online = {code, seat:before.online.seat, version:g.version};
      buildTerrain(); await replayDiff(before, G);
      if (G.over) return gameOver();
      netWaitOrPlay(g);
    } else if (g.status === 'playing' && G.online.waitingForJoin) { G.online.waitingForJoin = false; netWaitOrPlay(g); }
  }, () => {});
}
/* the opponent's turn, replayed: units slide to their new places, losses burn */
async function replayDiff(a, b) {
  const old = new Map(a.units.map(u => [u.id, u]));
  for (const u of b.units) {
    const o = old.get(u.id); if (!o) continue;
    if (o.x !== u.x || o.y !== u.y) { focus(u.x, u.y); const path = [[o.x, o.y]]; let x = o.x, y = o.y; while (x !== u.x) { x += Math.sign(u.x - x); path.push([x, y]); } while (y !== u.y) { y += Math.sign(u.y - y); path.push([x, y]); }
      const tx = u.x, ty = u.y; u.x = o.x; u.y = o.y; await animateMove(u, path); u.x = tx; u.y = ty; }
    if (u.hp < o.hp) { fxExplosion(u.x, u.y, .7, {crater:false}); fxText(u.x, u.y, '-' + (Math.ceil(o.hp / 10) - Math.ceil(u.hp / 10))); await sleep(180); }
  }
  const alive = new Set(b.units.map(u => u.id));
  for (const o of a.units) if (!alive.has(o.id)) { fxExplosion(o.x, o.y, 1.2); await sleep(200); }
  hud();
}
function netWaitOrPlay(g) {
  if (!G.online) return;
  const seat = G.online.seat, el = $('#netwait');
  if (g && g.status === 'waiting' || !g && G.online.version === 1 && !NET.games.find(x => x.code === G.online.code && x.status === 'playing')) {
    G.online.waitingForJoin = true; UI.busy = true; el.hidden = false; el.querySelector('b').textContent = `Waiting for an opponent to join · code ${G.online.code}`; hud(); return;
  }
  if (G.turn === seat) { el.hidden = true; UI.busy = false; if (!G.online.begun || G.online.begun !== G.online.version) { G.online.begun = G.online.version; beginTurn(); } }
  else { UI.busy = true; el.hidden = false; el.querySelector('b').textContent = `${CO[G.teams[G.turn].co].n} is planning their move…`; hud(); }
}
/* after a local turn in an online game: push the state, then wait */
async function netPushTurn() {
  const ref = NET.db.doc('games/' + G.online.code), v = G.online.version + 1;
  const body = {state:await packState(netSerial()), turn:G.turn, version:v, updated:Date.now(), clock:fmtClock(G.day, G.clock, true)};
  if (G.over) body.status = 'over';
  try { await ref.update(body); G.online.version = v; G.online.begun = v; } catch (e) { G.online.pending = true; UI.busy = false; hud(); $('#endturn').disabled = false; banner('Not sent', 'The turn could not be saved online. Check your connection and press End turn to send it again.', '#ff8a6a'); return; }
  netWaitOrPlay();
}
