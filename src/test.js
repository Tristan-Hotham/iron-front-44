/* ============================== TEST HARNESS ==============================
   Kept from Neon Protocol:  #validate  checks every map and unit placement;
   #autoplay  plays every mission AI against AI and reports. */
function validateMission(m) {
  const errs = [], rows = m.map || missionMap(m), W = rows[0].length;
  rows.forEach((r, y) => { if (r.length !== W) errs.push(`row ${y} is ${r.length} wide, expected ${W}`); [...r].forEach((c, x) => { if (!MAPCH[c]) errs.push(`bad char "${c}" at ${x},${y}`); }); });
  if (errs.length) return errs;
  if (m.objective.win === 'hq' && !rows.some(r => r.includes('q'))) errs.push('no enemy HQ for an HQ objective');
  if (m.objective.win === 'survive' && !rows.some(r => r.includes('Q'))) errs.push('no player HQ to hold');
  for (const t of [1, 2]) { const p = t === 1 ? m.p1 : m.p2; if (!CO[p.co] || natBase(CO[p.co].nat) !== natBase(p.nat)) errs.push(`side ${t}: general ${p.co} does not belong to ${p.nat}`); }
  // place everything for real and compare with what the spec asked for
  const save = G; FAST = true;
  try {
    newGame({map:rows, theme:m.theme, teams:{1:Object.assign({}, m.p1), 2:Object.assign({}, m.p2)}, units:m.units, objective:m.objective});
    for (const t of [1, 2]) {
      const asked = parseUnits(m.units[t]).reduce((s, u) => s + u.n, 0), got = G.units.filter(u => u.team === t).length;
      if (got < asked) errs.push(`side ${t}: placed ${got} of ${asked} units`);
      for (const sp of parseUnits(m.units[t])) if (!udef((t === 1 ? m.p1 : m.p2).nat, sp.role)) errs.push(`side ${t}: no ${sp.role} for this army`);
    }
    for (const e of m.events || []) for (const s of parseUnits(e.spawn)) if (s.x >= W || s.y >= rows.length) errs.push(`event spawn off map ${s.x},${s.y}`);
    if (m.objective.win === 'kill' && !G.units.some(u => u.team === 2 && u.role === m.objective.role)) errs.push('no targets for the kill objective');
  } catch (e) { errs.push('build failed: ' + e.message); }
  G = save; FAST = false;
  return errs;
}
/* debugging aid: play a mission AI-vs-AI up to a day and leave G for inspection */
function simTo(id, days) { const r = autoplayMission(MISSIONS[id], days, true); FAST = false; return r; }
function autoplayMission(m, maxDays = 40, keep = false, onMove = null, prep = null, onTurn = null) {
  FAST = true; const cfg = m.map ? JSON.parse(JSON.stringify(m)) : missionCfg(m); cfg.teams[1].ai = true; cfg.teams[2].ai = true;
  newGame(cfg); G.firstTeam = 1; if (prep) prep(cfg);
  const t0 = performance.now(); let steps = 0, powers = 0;
  while (!G.over && G.day <= maxDays) {
    const team = G.turn; startTurn(team); if (onTurn) onTurn(team);
    for (const e of dueEvents()) runEvent(e);
    if (checkEnd()) break;
    const lv = aiPower(team); if (lv) { activatePower(team, lv); powers++; }
    for (let i = 0; i < 400; i++) {
      const pl = aiNext(team, {}); if (!pl) break; steps++;
      const u = pl.u, [x, y] = pl.path[pl.path.length - 1]; u.x = x; u.y = y; if (pl.path.length > 1) { u.dug = false; if (onMove) onMove(u); }
      if (pl.path.length > 1) { mineCheck(u); if (!G.units.includes(u)) { if (checkEnd()) break; continue; } }
      if (pl.act === 'attack' && G.units.includes(pl.target)) attack(u, pl.target);
      else if (pl.act === 'capture') capture(u);
      else if (pl.act === 'clear') clearTile(u, pl.at[0], pl.at[1]);
      else if (pl.act === 'load') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) doLoad(u, t); }
  else if (pl.act === 'bridge') { const r = bridgeWork(u, pl.at[0], pl.at[1]); if (!FAST) { sfx('boom'); fxExplosion(pl.at[0], pl.at[1], 1.6, {crater:false}); drawTile(terrainCanvas.getContext('2d'), pl.at[0], pl.at[1]); fxText(pl.at[0], pl.at[1], 'Bridge blown!', '#ff8a6a'); } }
  else if (pl.act === 'join') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) { joinUnits(u, t); if (!FAST) fxText(t.x, t.y, 'Joined', '#9ae07a'); } }
      else if (pl.act === 'unload') for (const [c, [a, b]] of pl.drops) if (!unitAt(a, b)) doUnload(u, c, a, b);
      if (G.units.includes(u)) { u.done = true; u.moved = true; settle(u); refreshAgain(u); }
      if (checkEnd()) break;
    }
    if (G.over) break;
    aiBuild(team);
    for (const u of G.units) if (u.team === team) u.done = false;
    G.turn = endTurn(); checkEnd();
  }
  const vets = G.units.filter(u => rankOf(u) > 0).length;
  const r = {id:m.id || 'custom', wave:G.waves ? G.waves.n : 0, winner:G.over ? G.over.winner : 0, why:G.over ? G.over.why : 'unfinished', day:G.day, steps, powers, vets, units:[G.units.filter(u => u.team === 1).length, G.units.filter(u => u.team === 2).length], ms:Math.round(performance.now() - t0)};
  FAST = false; if (!keep) G = null;
  return r;
}
function runTests(kind) {
  const out = document.createElement('pre'); out.id = 'testout';
  out.style.cssText = 'position:fixed;inset:10px;z-index:99;background:#111c;color:#cfe8b0;padding:16px;overflow:auto;font:12px monospace;white-space:pre-wrap';
  document.body.append(out);
  const log = s => { out.textContent += s + '\n'; console.log(s); };
  let bad = 0;
  for (const m of Object.values(MISSIONS)) { const e = validateMission(m); bad += e.length; log(`${e.length ? 'FAIL' : 'ok  '} ${m.id}${e.length ? '\n   ' + e.join('\n   ') : ''}`); }
  for (const th of Object.keys(THEMES)) for (let s = 1; s <= 3; s++) { const rows = genMap(th, 30, 20, s * 7919);
    const e = validateMission({id:'sk', map:rows, objective:{win:'hq'}, p1:{nat:'us', co:'patton'}, p2:{nat:'ger', co:'rommel'}, units:{1:skirmishUnits(rows, 1), 2:skirmishUnits(rows, 2)}}); bad += e.length; if (e.length) log(`FAIL skirmish ${th} ${s}: ${e.join('; ')}`); }
  try { for (const n of Object.keys(NATION)) for (const r of ROLE_ORDER) getSprite(n, r, 0); for (const c of Object.keys(CO)) getPortrait(c); log('ok   sprites and portraits'); } catch (e) { bad++; log('FAIL art: ' + e.stack); }
  log(bad ? `${bad} problem(s)` : 'validate: all clear');
  window.TEST = {bad};
  if (kind === 'testers') setTimeout(() => { const q = new URLSearchParams(location.search); window.TEST.testers = runTesters(log, q.get('ids') ? q.get('ids').split(',') : q.has('new') ? Object.keys(NEW_MISSIONS) : undefined, q.get('name') || 'testers'); }, 50);
  if (kind === 'autoplay') setTimeout(() => {
    const res = [];
    for (const m of Object.values(MISSIONS)) { try { const r = autoplayMission(m); res.push(r); log(`${r.id.padEnd(12)} winner ${r.winner} (${r.why}) day ${r.day}  units ${r.units.join('/')}  vets ${r.vets}  powers ${r.powers}  ${r.steps} moves  ${r.ms} ms`); } catch (e) { log(`CRASH ${m.id}: ${e.stack}`); res.push({id:m.id, crash:String(e)}); } }
    window.TEST.autoplay = res; log('autoplay done');
  }, 50);
}

/* ---------- a whole campaign, the way a player meets it: in order, veterans carried forward, the medal at the end ----------
   Plays as team 1 with the tester personas, retrying a lost battle as a player would, and runs the game's own
   bookkeeping after each battle (progress, the core force, medals). The real saved progress is put back afterwards. */
function campaignTest(cid, personas = ['methodical', 'aggressive', 'opportunist', 'cautious'], tries = 4) {
  const camp = CAMPAIGNS.find(c => c.id === cid), saved = localStorage.getItem('if44prog2'), rows = [], medals = [];
  saveProg({done:{}, core:{}, all:false});
  try {
    for (let i = 0; i < camp.missions.length; i++) {
      const id = camp.missions[i], m = MISSIONS[id];
      if (!(i === 0 || loadProg().done[camp.missions[i - 1]])) { rows.push(`${id}: LOCKED after the previous battle was won`); break; }
      let r = null, n = 0, vets = 0, who = '';
      for (; n < tries; n++) {
        who = personas[n % personas.length]; TESTER[1] = who;
        r = autoplayMission(m, 45, true, null, cfg => { deployCore(cfg.mission || m); vets = G.units.filter(u => u.core).length; });
        TESTER[1] = null;
        G.teams[1].ai = false;                                   // the bookkeeping treats team 1 as the human
        const p = loadProg(), won = r.winner === 1;
        if (won) { p.done[id] = true; updateCore(p); } else updateCore(p, true);
        saveProg(p); medals.push(...recordGame(won)); G = null;
        if (won) break;
      }
      const core = (loadProg().core[m.p1.nat] || []).length;
      rows.push(`${id.padEnd(13)} ${r.winner === 1 ? 'won ' : 'LOST'} try ${Math.min(n + 1, tries)} (${who}) day ${r.day}  veterans in ${vets}  core force ${core}`);
      if (r.winner !== 1) break;
    }
    const p = loadProg();
    rows.push(`complete: ${camp.missions.every(id => p.done[id]) ? 'yes' : 'NO'}  medals: ${medals.map(medalName).join(', ') || 'none'}`);
  } catch (e) { rows.push('CRASH ' + e.stack); }
  finally { TESTER[1] = null; FAST = false; if (saved === null) localStorage.removeItem('if44prog2'); else localStorage.setItem('if44prog2', saved); }
  return rows;
}

/* ---------- a big panel of testers: generated temperaments spread across the whole range, on every battle ---------- */
function makeTesters(n = 34) {
  let s = 4242; const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296, ids = [];
  for (let i = 0; i < n; i++) {
    const id = 'gen' + String(i + 1).padStart(2, '0');
    PERSONAS[id] = {n:'Generated tester ' + (i + 1), adv:+(.2 + R() * 3).toFixed(2), cover:+(.2 + R() * 2.4).toFixed(2), fear:+(R() * 3).toFixed(2), atk:+(.4 + R() * 1.6).toFixed(2), cap:+(.3 + R() * 2).toFixed(2), noise:R() < .25 ? Math.round(R() * 2500) : 0, txt:'A generated tester.'};
    ids.push(id);
  }
  return ids;
}
async function bigTest(ids, missions = Object.keys(MISSIONS), name = 'big') {
  const lines = [], per = {}, t0 = performance.now();
  for (const mid of missions) {
    const m = MISSIONS[mid], res = [];
    for (const who of ids) {
      TESTER[1] = who; let r; try { r = autoplayMission(m, 45); } catch (e) { r = {crash:String(e && e.message || e)}; } TESTER[1] = null; res.push(r);
      (per[who] = per[who] || [0, 0])[1]++; if (r.winner === 1) per[who][0]++;
      await yieldNow();
    }
    const wins = res.filter(r => r.winner === 1), days = wins.map(r => r.day).sort((a, b) => a - b), crash = res.filter(r => r.crash), why = {};
    for (const r of res) if (!r.crash) { const k = (r.winner === 1 ? 'W ' : r.winner === 2 ? 'L ' : '? ') + r.why; why[k] = (why[k] || 0) + 1; }
    const rate = Math.round(100 * wins.length / res.length);
    lines.push(`${mid.padEnd(13)} ${String(rate).padStart(3)}%  ${rate >= 95 ? 'TOO EASY' : rate <= 15 ? 'TOO HARD' : rate >= 85 ? 'easy    ' : rate <= 30 ? 'hard    ' : 'fair    '}  win days ${days[0] || '-'}-${days[days.length - 1] || '-'} (median ${days[days.length >> 1] || '-'})  ${Object.entries(why).map(([k, v]) => k + ' ' + v).join(', ')}${crash.length ? '  CRASH x' + crash.length + ': ' + crash[0].crash : ''}`);
    window.BIG = {done:lines.length, of:missions.length, min:Math.round((performance.now() - t0) / 60000)};
  }
  lines.push('', 'win rate by tester:', ids.map(id => `${id} ${Math.round(100 * per[id][0] / per[id][1])}%`).join('  '));
  await fetch('/report/' + name, {method:'POST', body:lines.join('\n')}); window.BIG.lines = lines; return lines;
}

/* ---------- Dead of Night: every persona, several maps and settings; how the waves grow, are cleared or pile up ---------- */
function zedTest({personas = ['methodical', 'aggressive', 'cautious', 'opportunist', 'reckless', 'rusher', 'turtle', 'sniper'], maps = ['gen:normandy', 'gen:winter', 'm:stalingrad'], nat = 'us', co = 'patton', diff = 'normal', every = 3, night = 'endless', days = 30} = {}) {
  const rows = [];
  for (const mp of maps) for (const who of personas) {
    const theme = mp.startsWith('gen:') ? mp.slice(4) : MISSIONS[mp.slice(2)].theme;
    const map = mp.startsWith('gen:') ? genMap(theme, 34, 22, 1000 + personas.indexOf(who)) : missionMap(MISSIONS[mp.slice(2)]);
    const cfg = wavesCfg({rows:map, theme, nat, co, enemy:'zed', eco:'horde', diff, funds:6000, every, name:'zedtest'});
    cfg.waves.zed = true; cfg.waves.night = night; cfg.waves.next = 1; cfg.clock = {start:cfg.clock.start.slice(0, 11) + (night === 'endless' ? '23:00' : '18:00'), step:120};
    const log = [], seen = {}; let peak = 0;
    TESTER[1] = who;
    let r; try {
      r = autoplayMission(cfg, days, true, null, null, team => { if (team !== 1 || seen[G.day]) return; seen[G.day] = 1;
        const z = G.units.filter(u => u.team === 2).length, me = G.units.filter(u => u.team === 1).length; peak = Math.max(peak, z); log.push(`${G.day}:w${G.waves.n}/z${z}/m${me}`); });
    } catch (e) { rows.push(`${mp} ${who}: CRASH ${e.message}`); TESTER[1] = null; continue; }
    TESTER[1] = null;
    rows.push(`${mp.padEnd(14)} ${who.padEnd(11)} ${r.winner === 2 ? 'overrun' : 'held'} day ${r.day}  waves ${G.waves.n - 1}  peak ${peak} dead  | ${log.filter((_, i) => i % 3 === 0).join(' ')}`);
    G = null;
  }
  FAST = false; return rows;
}

/* ---------- fairness: the AI must play the same from either side of a mirrored map ---------- */
async function symTest(seeds = [11, 22, 33], personas = ['aggressive', 'methodical', 'cautious'], nat = 'us', co = 'patton', swap = false, theme = 'steppe') {
  const res = {1:0, 2:0, 0:0}, days = [];
  for (const seed of seeds) { let rows = genMap(theme, 30, 20, seed); const W = 30, H = 20;
    newGame({map:rows, theme, teams:{1:{nat, co}, 2:{nat, co}}, units:{1:'', 2:''}});
    let sp1 = placeSpecs(1, parseUnits(skirmishUnits(rows, 1)), 5).map(s => Object.assign({}, s, {n:1, x2:null, y2:null}));
    let sp2 = sp1.map(s => Object.assign({}, s, {x:W - 1 - s.x, y:H - 1 - s.y}));
    if (swap) { rows = rows.map(r => r.replace(/[QFAqge]/g, c => ({Q:'q', F:'g', A:'e', q:'Q', g:'F', e:'A'})[c])); [sp1, sp2] = [sp2, sp1]; }
    for (const p of personas) { TESTER[1] = TESTER[2] = p; await yieldNow();
      const r = autoplayMission({map:rows, theme, objective:{win:'hq'}, clock:{start:'1944-07-01T08:00', step:60}, teams:{1:{nat, co, funds:5000}, 2:{nat, co, funds:5000}}, units:{1:sp1, 2:sp2}}, 30, false); res[r.winner]++; days.push(r.day); } }
  TESTER[1] = TESTER[2] = null; FAST = false;
  return {res, avgDay:Math.round(days.reduce((a, b) => a + b, 0) / days.length)};
}
/* plays a seeded game and its mirror image and returns the first move where they differ */
function mirrorDiff(seed = 22, days = 8) {
  const W = 30, H = 20, rowsA = genMap('steppe', W, H, seed);
  newGame({map:rowsA, theme:'steppe', teams:{1:{nat:'us', co:'patton'}, 2:{nat:'us', co:'patton'}}, units:{1:'', 2:''}});
  const sp1 = placeSpecs(1, parseUnits(skirmishUnits(rowsA, 1)), 5).map(s => Object.assign({}, s, {n:1, x2:null, y2:null})), sp2 = sp1.map(s => Object.assign({}, s, {x:W - 1 - s.x, y:H - 1 - s.y}));
  const rowsB = rowsA.map(r => r.replace(/[QFAqge]/g, c => ({Q:'q', F:'g', A:'e', q:'Q', g:'F', e:'A'})[c]));
  const run = (rows, u1, u2, mirror) => { let s = 999; const rnd = Math.random; Math.random = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; TESTER[1] = TESTER[2] = 'methodical'; const log = [];
    const M = (x, y) => mirror ? `${W - 1 - x},${H - 1 - y}` : `${x},${y}`;
    const src = autoplayMission.toString().replace("if (pl.act === 'attack' && G.units.includes(pl.target)) attack(u, pl.target);", "log.push(`d${G.day} t${team} ${u.role} ${M(pl.path[0][0], pl.path[0][1])}>${M(x, y)} ${pl.act}${pl.target ? ' @' + M(pl.target.x, pl.target.y) : ''}`); if (pl.act === 'attack' && G.units.includes(pl.target)) { const rr = attack(u, pl.target); log.push('   dmg ' + rr.dmg + '/' + rr.counter); }").replace("aiBuild(team);", "{ const mm = aiBuild(team); for (const b of mm) log.push(`d${G.day} t${team} BUILD ${b.role} ${M(b.x, b.y)}`); }");
    const ap = eval('(' + src + ')'); ap({map:rows, theme:'steppe', objective:{win:'hq'}, clock:{start:'1944-07-01T08:00', step:60}, teams:{1:{nat:'us', co:'patton', funds:5000}, 2:{nat:'us', co:'patton', funds:5000}}, units:{1:u1, 2:u2}}, days, false); Math.random = rnd; return log; };
  const A = run(rowsA, sp1, sp2, false), B = run(rowsB, sp2, sp1, true);
  TESTER[1] = TESTER[2] = null; FAST = false;
  let i = 0; while (i < A.length && A[i] === B[i]) i++;
  return {i, len:[A.length, B.length], A:A.slice(Math.max(0, i - 3), i + 5), B:B.slice(Math.max(0, i - 3), i + 5)};
}