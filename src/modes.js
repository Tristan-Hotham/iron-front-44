/* ============================== MODES =====================================
   Generals' temperaments (how the computer plays each of them), the Last
   Stand wave-survival mode, and the AI testers: scripted players with
   different temperaments who play every battle and report on it. */

/* yields to the browser without timer throttling (hidden tabs clamp setTimeout to a second or more) */
const yieldNow = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });

/* ---------- temperaments ---------- */
const PERSONAS = {
  methodical: {n:'Methodical', adv:1, cover:1, fear:1, atk:1, cap:1, noise:0, txt:'Weighs every move: cover, fire and ground in balance.'},
  aggressive: {n:'Aggressive', adv:1.45, cover:.6, fear:.35, atk:1.3, cap:1.1, noise:0, txt:'Drives hard for the objective and trades units for ground.'},
  cautious:   {n:'Cautious', adv:.7, cover:1.7, fear:1.9, atk:.9, cap:.9, noise:0, txt:'Stays in cover, out of enemy fire, and lets the enemy come.'},
  opportunist:{n:'Opportunist', adv:1.1, cover:1, fear:.8, atk:1.15, cap:1.7, noise:0, txt:'Grabs towns and depots and picks off stragglers.'},
  reckless:   {n:'Reckless', adv:1.2, cover:.5, fear:.2, atk:1.1, cap:1, noise:1400, txt:'An erratic tester: random moves, ignores danger. Finds the holes in a map.'},
  rusher:     {n:'Rusher', adv:3.2, cover:.2, fear:0, atk:.35, cap:.25, noise:0, txt:'A tester that ignores everything but a dash for the objective. If it wins fast, the mission can be exploited.'},
  sniper:     {n:'Sniper', adv:.8, cover:1.4, fear:1.6, atk:1.7, cap:.8, noise:0, txt:'A tester that hangs back, keeps out of fire and trades shots: shows whether a map can be won by attrition.'},
  turtle:     {n:'Turtle', adv:.35, cover:2.2, fear:2.5, atk:.85, cap:.6, noise:0, txt:'A tester that hardly advances. If it still wins, the mission is too easy.'},
  // the second set of testers: other temperaments, so a battle balanced against the first eight is checked against players they do not resemble
  blitz:      {n:'Blitz', adv:2, cover:.5, fear:.5, atk:1.5, cap:1.3, noise:0, txt:'A tester that drives straight through with everything it has.'},
  counter:    {n:'Counter-puncher', adv:.6, cover:1.5, fear:1.2, atk:1.6, cap:.7, noise:0, txt:'A tester that waits for the enemy to come on, then hits hard.'},
  raider:     {n:'Raider', adv:1.3, cover:.8, fear:1.2, atk:.9, cap:2.2, noise:0, txt:'A tester that slips past the fighting to take towns and objectives.'},
  brawler:    {n:'Brawler', adv:1.6, cover:.4, fear:.1, atk:1.8, cap:.6, noise:0, txt:'A tester that closes in and slugs it out.'},
  novice:     {n:'Novice', adv:1, cover:.6, fear:.5, atk:1, cap:1, noise:2500, txt:'A tester that plays like someone new to the game: often well, sometimes badly.'},
  fortress:   {n:'Fortress', adv:.2, cover:2.5, fear:3, atk:1.2, cap:.4, noise:0, txt:'A tester that hardly moves and shoots anything in reach.'},
  skirmisher: {n:'Skirmisher', adv:1, cover:1.8, fear:1.4, atk:1.3, cap:1.2, noise:0, txt:'A tester that fights from cover while taking ground.'},
  gambler:    {n:'Gambler', adv:1.4, cover:.8, fear:.6, atk:1.2, cap:1.4, noise:700, txt:'A bold tester with a streak of chance.'},
};
const CO_PERSONA = {
  rommel:'aggressive', guderian:'aggressive', patton:'aggressive', konev:'aggressive', horrocks:'aggressive', reinhardt:'aggressive', yamashita:'aggressive', kawaguchi:'aggressive',
  du:'aggressive', vatutin:'aggressive', leclerc:'aggressive', degaulle:'aggressive', rudder:'aggressive', student:'aggressive', isogai:'aggressive', halsey:'aggressive', walker:'aggressive', nagumo:'aggressive',
  heinrici:'cautious', model:'cautious', monty:'cautious', kuribayashi:'cautious', ushijima:'cautious', xue:'cautious', chiang:'cautious', choltitz:'cautious', sucharski:'cautious', jrommel:'cautious',
  mcauliffe:'cautious', percival:'cautious', shibasaki:'cautious', imamura:'cautious', kurita:'cautious', gort:'cautious', huntziger:'cautious', jottrand:'cautious', xie:'cautious', devereux:'cautious', vandegrift:'cautious', sprague:'cautious',
  manstein:'opportunist', zhukov:'methodical', bradley:'methodical', ike:'methodical', chuikov:'opportunist', rokossovsky:'opportunist', okamura:'opportunist', li:'opportunist', sun:'opportunist', yamamoto:'opportunist', donitz:'opportunist', spruance:'opportunist',
};
const TESTER = {1:null, 2:null};                       // a tester persona overrides the general's temperament
function personaOf(team) {
  if (G && G.teams[team] && NATION[G.teams[team].nat] && NATION[G.teams[team].nat].zed && !TESTER[team]) return PERSONAS.horde || PERSONAS.aggressive;
  const id = TESTER[team] || (G && G.persona && G.persona[team]) || (G && team === 2 && G.objective.win === 'survive' && 'aggressive') || (G && G.teams[team] && CO_PERSONA[G.teams[team].co]) || 'methodical';   // whoever must break a hold-out attacks
  return PERSONAS[id] || PERSONAS.methodical;
}

/* ---------- Last Stand: wave survival ---------- */
const WAVE_POOL = [                                    // [role, first wave it appears, weight]
  ['inf', 1, 6], ['at', 1, 2], ['recon', 1, 2], ['mortar', 2, 2], ['eng', 2, 1], ['cav', 1, 1], ['apc', 2, 1], ['tank', 2, 4], ['art', 3, 2],
  ['mtank', 4, 3], ['aa', 4, 1], ['rkt', 5, 1], ['ftr', 5, 1], ['bmr', 6, 2], ['htank', 7, 2], ['tb', 99, 0],
];
function waveCost(n, diff) { return Math.round((7000 + n * 5200 + n * n * 350) * ({easy:.75, normal:1, hard:1.3}[diff] || 1)); }
function waveRoster(n, nat, diff, seed, scale = 1) {
  const zed = NATION[nat] && NATION[nat].zed;
  // the dead come in rounds you can finish: a handful at first, a horde by the sixth; scale grows them with your army
  let budget = waveCost(n, diff) * scale * (zed ? ({easy:.26, normal:.35, hard:.46}[diff] || .35) * (1 + n * .12) : 1), s = seed >>> 0 || 1; const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pool = (zed ? ZED_POOL : WAVE_POOL).filter(([r, w]) => n >= w && udef(nat, r));
  const out = {}; let guard = 0;
  while (budget > 0 && guard++ < 140 && pool.length) {
    const tot = pool.reduce((a, p) => a + p[2], 0); let k = R() * tot, pick = pool[0];
    for (const p of pool) { k -= p[2]; if (k <= 0) { pick = p; break; } }
    const c = udef(nat, pick[0]).cost; if (c > budget * 1.4 && Object.keys(out).length) break;
    out[pick[0]] = (out[pick[0]] || 0) + 1; budget -= c;
  }
  return out;
}
function waveEdge() {                                  // the enemy comes on from the far edge, away from your HQ
  const hq = Object.values(G.props).find(p => p.owner === 1 && terr(p.x, p.y) === 'hq') || {x:0, y:G.H >> 1};
  const east = hq.x < G.W / 2, land = x => { let n = 0; for (let y = 0; y < G.H; y++) if (moveCost(udef(G.teams[2].nat, 'inf') || ROLE.inf, x, y)) n++; return n; };
  let e = east ? G.W - 1 : 0; const step = east ? -1 : 1;
  while (land(e) < 2 && Math.abs(e - (east ? G.W - 1 : 0)) < G.W / 2) e += step;      // an island or a coast: they come ashore on the first land, not into the sea
  const x0 = Math.min(e, e + step * 2), x1 = Math.max(e, e + step * 2);
  return [Math.max(0, x0), 0, Math.min(G.W - 1, x1), G.H - 1];
}
function waveTick() {
  const W = G.waves; if (!W) return;
  if (W.zed && !FAST && typeof sfx === 'function') sfx('chorus');            // the dead, somewhere out in the dark
  if (W.zed) return zedTick(W);
  if (G.day < W.next) return;
  if (G.units.filter(u => u.team === 2).length >= 24 + W.n) { W.next = G.day + 1; return; }   // the front is choked: the next wave waits for room
  W.n++; W.next = G.day + (W.n >= 8 ? 2 : W.every);
  const nat = G.teams[2].nat, roster = waveRoster(W.n, nat, W.diff, W.seed + W.n * 977), [x0, y0, x1, y1] = waveEdge();
  const spec = Object.entries(roster).map(([r, k]) => `${r}*${k} ${x0},${y0}-${x1},${y1}`).join('; ');
  const names = Object.entries(roster).map(([r, k]) => `${k} ${udef(nat, r).n}`).join(', ');
  G.teams[1].funds += 2000 + W.n * 600;
  const big = W.n % 5 === 0;
  if (W.zed) {                                         // Dead of Night: the dead come from more directions as the night wears on
    const z = zedSpec(roster, W.n), zn = Object.entries(roster).map(([r, k]) => `${k} ${ZED_SHORT[r] || r}`).join(', ');
    G.events.push({day:G.day, team:2, done:false, spawn:z.spec + (big ? `; htank ${x0},${y0}-${x1},${y1}` : ''), say:`Wave ${W.n}: the dead come from the ${z.from.join(' and the ')}${big ? ', and something huge moves among them' : ''}. ${zn}. A supply drop brings ${fmt(2000 + W.n * 600)}.`});
    if (!FAST && typeof sfx === 'function') { sfx('groan'); sfx('groan', .7); }
    W.best = Math.max(W.best || 0, W.n - 1);
    return;
  }
  G.events.push({day:G.day, team:2, done:false, spawn:spec + (big ? `; htank ${x0},${y0}-${x1},${y1}` : ''), say:`Wave ${W.n}${big ? ' (a heavy assault)' : ''}: ${names}. Your quartermaster sends ${fmt(2000 + W.n * 600)} in supplies.`});
  W.best = Math.max(W.best || 0, W.n - 1);
}
/* Dead of Night runs in rounds: a wave comes out of the dark close by, you fight it until it is gone, a supply drop
   and a turn's quiet, then a bigger one. A wave that is not cleared in time is joined by the next anyway. */
function zedTick(W) {
  const alive = G.units.filter(u => u.team === 2).length;
  if (W.n > 0 && alive > 0 && G.day < W.deadline) return;                                    // still fighting this wave
  if (W.n > 0 && alive === 0 && !W.cleared) {                                                 // wave cleared: supplies, and a breath
    W.cleared = G.day; const fast = G.day - W.began <= 2, pay = 2000 + W.n * 450 + (fast ? 1500 : 0);
    G.events.push({day:G.day, team:1, done:false, funds:pay, heal:1, say:`Wave ${W.n} is down${fast ? ', and fast' : ''}. The night goes quiet. A supply drop brings ${fmt(pay)}, and the wounded are patched up. Dig in: the next wave comes in a turn.`});
    W.best = Math.max(W.best || 0, W.n); W.next = G.day + 1; return;
  }
  if (G.day < W.next) return;
  W.n++; W.began = G.day; W.cleared = 0; W.deadline = G.day + 5 + Math.min(3, W.n >> 2);
  // the horde grows with you: an army twice the size it started draws nearly twice the dead, so supply drops cannot snowball into safety
  const army = G.units.filter(u => u.team === 1).reduce((a, u) => a + (u.d.cost || 1000) * u.hp / 100, 0); W.base = W.base || army || 1;
  const roster = waveRoster(W.n, G.teams[2].nat, W.diff, W.seed + W.n * 977, Math.max(1, Math.pow(army / W.base, .9))), big = W.n % 5 === 0, z = zedNear(roster, W.n);
  const zn = Object.entries(roster).map(([r, k]) => `${k} ${ZED_SHORT[r] || r}`).join(', ');
  G.events.push({day:G.day, team:2, done:false, spawn:z.spec + (big ? `; htank ${z.box.join(',').replace(/,(\d+),(\d+)$/, '-$1,$2')}` : ''), say:`Wave ${W.n}: the dead come out of the dark from the ${z.from.join(' and the ')}${big ? ', and something huge moves among them' : ''}. ${zn}.${alive ? ' The last wave is still among you.' : ''}`});
  if (!FAST && typeof sfx === 'function') { sfx('groan'); sfx('groan', .7); }
}
/* where the dead appear: in the dark six to nine tiles from your lines, from one side at first, then from two, then all round */
function zedNear(roster, n) {
  const mine = G.units.filter(u => u.team === 1), hq = Object.values(G.props).find(p => p.owner === 1 && terr(p.x, p.y) === 'hq');
  const cx = mine.length ? Math.round(mine.reduce((a, u) => a + u.x, 0) / mine.length) : hq ? hq.x : G.W >> 1, cy = mine.length ? Math.round(mine.reduce((a, u) => a + u.y, 0) / mine.length) : hq ? hq.y : G.H >> 1;
  const away = hq ? Math.sign(cx - hq.x) || (hq.x < G.W / 2 ? 1 : -1) : 1;                    // the first wave comes from the side facing away from the HQ
  const clampBox = ([x0, y0, x1, y1]) => [Math.max(0, Math.min(G.W - 1, x0)), Math.max(0, Math.min(G.H - 1, y0)), Math.max(0, Math.min(G.W - 1, x1)), Math.max(0, Math.min(G.H - 1, y1))];
  const sides = {east:[cx + 6, cy - 4, cx + 9, cy + 4], west:[cx - 9, cy - 4, cx - 6, cy + 4], north:[cx - 4, cy - 9, cx + 4, cy - 6], south:[cx - 4, cy + 6, cx + 4, cy + 9]};
  const first = away > 0 ? 'east' : 'west', flank = (G.waves.seed + n) % 2 ? ['north', 'south'] : ['south', 'north'], order = [first, ...flank, first === 'east' ? 'west' : 'east'];
  const use = order.slice(0, n < 3 ? 1 : n < 6 ? 2 : 4), boxes = use.map(s => clampBox(sides[s]));
  const parts = {}; let i = 0;
  for (const [r, k] of Object.entries(roster)) for (let j = 0; j < k; j++, i++) { const b = boxes[i % boxes.length].join(','), key = r + '|' + b; parts[key] = (parts[key] || 0) + 1; }
  const spec = Object.entries(parts).map(([key, k]) => { const [r, b] = key.split('|'), [x0, y0, x1, y1] = b.split(','); return `${r}*${k} ${x0},${y0}-${x1},${y1}`; }).join('; ');
  return {spec, from:use, box:boxes[0]};
}
function waveGoal() { const W = G.waves; if (!W) return ''; const left = Math.max(0, W.next - G.day);
  if (W.zed) { const alive = G.units.filter(u => u.team === 2).length;
    return !W.n ? 'The dead are coming. First wave this turn.' : alive ? `Wave ${W.n} · ${alive} of the dead still walking · kill them all before the next wave joins them (${Math.max(0, W.deadline - G.day)} turn${W.deadline - G.day === 1 ? '' : 's'})` : `Wave ${W.n} cleared · the next comes ${left ? 'in ' + left + ' turn' + (left > 1 ? 's' : '') : 'now'}`; }
  const nat = G.teams[2].nat, nx = waveRoster(W.n + 1, nat, W.diff, W.seed + (W.n + 1) * 977), short = r => W.zed && ZED_SHORT[r] || ({inf:'infantry', at:'anti-tank', recon:'recon', mortar:'mortars', eng:'engineers', cav:'cavalry', apc:'carriers', tank:'tanks', art:'guns', mtank:'medium tanks', aa:'flak', rkt:'rockets', ftr:'fighters', bmr:'bombers', htank:'heavy tanks'})[r] || r;
  const scout = ` · scouts report: ${Object.entries(nx).map(([r, k]) => `${k} ${short(r)}`).join(', ')}`;
  return (W.n ? `Wave ${W.n} · ${G.units.filter(u => u.team === 2).length} enemy units · next wave ${left ? 'in ' + left + ' turn' + (left > 1 ? 's' : '') : 'now'}` : `First wave in ${left} turn${left === 1 ? '' : 's'}`) + scout; }
const WAVE_KEY = 'if44waves';
function waveBest(key) { try { return (JSON.parse(localStorage.getItem(WAVE_KEY) || '{}'))[key] || 0; } catch (e) { return 0; } }
function waveSaveBest(key, n) { try { const b = JSON.parse(localStorage.getItem(WAVE_KEY) || '{}'); if (n > (b[key] || 0)) { b[key] = n; localStorage.setItem(WAVE_KEY, JSON.stringify(b)); return true; } } catch (e) {} return false; }
/* builds the game config for a Last Stand on a set of map rows */
/* ---------- choose your own starting force (Last Stand and Dead of Night) ---------- */
const FORCE_ROLES = ['inf', 'eng', 'at', 'mortar', 'cav', 'recon', 'apc', 'tank', 'mtank', 'htank', 'art', 'rkt', 'aa', 'nest', 'pak', 'ftr', 'bmr'];
const FORCE_STD = {inf:4, at:1, mortar:1, recon:1, tank:2, art:1};
/* the 1944 armies that had no fixed defences defined get period ones, so a starting force can dig in */
Object.assign(NATION.us.u, {nest:{n:'M1919A4 Machine-gun Nest', w:'.30 cal Browning in a sandbagged pit', snd:'bar', shape:'nest'}, pak:{n:'3-inch Gun M5 Position', w:'3 in anti-tank gun, dug in', snd:'gun75', shape:'casemate'}});
Object.assign(NATION.fr.u, {nest:{n:'M1919A4 Machine-gun Nest', w:'.30 cal Browning in a sandbagged pit', snd:'bar', shape:'nest'}, pak:{n:'57 mm Gun M1 Position', w:'57 mm anti-tank gun, dug in', snd:'gun50', shape:'casemate', pow:.9}});
Object.assign(NATION.uk.u, {nest:{n:'Vickers MG Nest', w:'.303 Vickers machine gun', snd:'bren', shape:'nest'}, pak:{n:'17-pounder Gun Position', w:'QF 17-pounder, dug in', snd:'gun17pdr', shape:'casemate'}});
NATION.su.u.pak = {n:'ZiS-3 Gun Position', w:'76 mm ZiS-3, dug in', snd:'gun76', shape:'casemate', pow:.95};
/* units placed in a widening block beside your HQ, nearest first; anything that cannot fit is left out */
function forceSpec(rows, counts) {
  const H = rows.length; let hx = 0, hy = 0; rows.forEach((r, y) => { const x = r.indexOf('Q'); if (x >= 0) { hx = x; hy = y; } });
  const total = Object.values(counts).reduce((a, b) => a + b, 0), grow = Math.ceil(total / 10);
  const d = hx < rows[0].length / 2 ? 1 : -1, xa = hx + d, xb = hx + d * (6 + grow * 2), y0 = Math.max(0, hy - 4 - grow), y1 = Math.min(H - 1, hy + 4 + grow);
  const r = `${Math.max(0, Math.min(xa, xb))},${y0}-${Math.min(rows[0].length - 1, Math.max(xa, xb))},${y1}`;
  return FORCE_ROLES.filter(k => counts[k] > 0).map(k => `${k}*${counts[k]} ${r}`).join('; ');
}
function forceBind(root, natSel, key) {
  const mode = root.querySelector('.forcemode'), grid = root.querySelector('.forcegrid'), sum = root.querySelector('.forcesum');
  let counts; try { counts = JSON.parse(localStorage.getItem('if44force:' + key)) || null; } catch (e) { counts = null; }
  counts = counts || Object.assign({}, FORCE_STD);
  const total = () => FORCE_ROLES.reduce((a, r) => a + (udef(natSel.value, r) ? (counts[r] || 0) * udef(natSel.value, r).cost : 0), 0);
  const render = () => {
    const nat = natSel.value, custom = mode.value === 'custom'; grid.hidden = !custom;
    grid.innerHTML = FORCE_ROLES.filter(r => udef(nat, r)).map(r => { const d = udef(nat, r); return `<label title="${d.w}"><span>${d.n}</span><input type="number" min="0" max="20" value="${counts[r] || 0}" data-r="${r}"></label>`; }).join('');
    grid.querySelectorAll('input').forEach(i => i.oninput = () => { counts[i.dataset.r] = Math.max(0, Math.min(20, i.value | 0)); try { localStorage.setItem('if44force:' + key, JSON.stringify(counts)); } catch (e) {} sum.textContent = sumText(); });
    sum.textContent = sumText();
  };
  const sumText = () => mode.value === 'custom' ? `${FORCE_ROLES.reduce((a, r) => a + (udef(natSel.value, r) ? counts[r] || 0 : 0), 0)} units, worth ${fmt(total())}. Gun nests and casemates can only be had here: they cannot be built.` : 'Four infantry, two tanks, anti-tank, mortar, recon and a field gun.';
  mode.onchange = render; natSel.oninput = render; render();
  return () => mode.value === 'custom' ? Object.fromEntries(FORCE_ROLES.filter(r => udef(natSel.value, r) && counts[r] > 0).map(r => [r, counts[r]])) : null;
}
function wavesCfg({rows, theme, nat, co, enemy, eco, diff = 'normal', funds = 6000, name = 'map', every = 3, force = null}) {
  rows = rows.map(r => r.replace(/[qegok]/g, c => ({q:'.', e:'a', g:'f', o:'p', k:'c'})[c]));   // the enemy owns nothing: it comes from off the map
  if (!rows.some(r => r.includes('Q'))) { const y = rows.length >> 1; rows[y] = 'Q' + rows[y].slice(1); }
  const start = {winter:'1944-12-20T06:00', autumn:'1944-11-02T06:00', tropic:'1942-02-08T06:00', desert:'1942-06-01T06:00', tunisia:'1943-02-20T06:00', china:'1938-04-03T06:00', poland:'1939-09-08T06:00', steppe:'1943-07-12T06:00', pacific:'1943-11-20T06:00', volcanic:'1945-02-19T06:00'}[theme] || '1944-07-01T06:00';
  return {map:rows, theme, objective:{win:'waves'}, weather:{winter:'snow', autumn:'rain'}[theme] || 'clear', clock:{start, step:120}, income:{1:.5},
    teams:{1:{nat, co, funds, ai:false}, 2:{nat:enemy, co:eco, funds:0, ai:true}}, units:{1:force ? forceSpec(rows, force) : skirmishUnits(rows, 1), 2:''},
    waves:{n:0, next:3, every, diff, seed:Date.now() % 1e6, key:[name, nat, diff, every].join(':'), std:!force && funds <= 6000 && diff !== 'easy' && every >= 3}};   // records are kept per difficulty and wave interval; medals only for the standard settings or harder
}

/* ---------- the AI testers ---------- */
/* Plays every battle once per tester temperament, with the computer on both sides, and reports
   win rates, game length, crashes and anomalies (units that never moved, wipe-outs on turn 1). */
async function testerReport(ids = Object.keys(MISSIONS), personas = ['methodical', 'aggressive', 'cautious', 'opportunist', 'reckless'], progress) {
  const rows = [];
  for (const id of ids) {
    await yieldNow(); if (progress) progress(id);
    const m = MISSIONS[id], row = {id, wins:0, games:0, days:[], notes:[]};
    for (const p of personas) {
      TESTER[1] = p;
      try {
        const moved = new Set(), r = autoplayMission(m, 40, true, u => moved.add(u.id));
        row.games++; if (r.winner === 1) row.wins++; row.days.push(r.day); row[p] = r.winner === 1 ? 'W' + r.day : 'L' + r.day;
        const idle = G.units.filter(u => u.team === 1 && !u.d.fixed && !u.hold && !moved.has(u.id) && !u.cargo.length).length;
        if (idle > 3) row.notes.push(`${p}: ${idle} units never moved`);
        if (r.day <= 2 && r.why !== 'kill') row.notes.push(`${p}: over on day ${r.day} (${r.why})`);
        if (p === 'turtle' && r.winner === 1 && m.objective.win !== 'survive' && !['kill', 'rout', 'convoy'].includes(r.why) && m.objective.limit && r.day <= m.objective.limit * .6) row.notes.push(`turtle won on turn ${r.day}: the side that barely advances still wins, too easy?`);
        if (p === 'rusher' && r.winner === 1 && !['kill', 'rout', 'convoy'].includes(r.why) && m.objective.limit && r.day <= m.objective.limit * .45) row.notes.push(`rusher won on turn ${r.day} of ${m.objective.limit}: a rush may be an exploit`);
      } catch (e) { row.notes.push(`${p}: CRASH ${e.message}`); }
    }
    TESTER[1] = null; FAST = false; G = null;
    row.rate = row.games ? row.wins / row.games : 0;
    row.verdict = row.rate === 0 ? 'too hard?' : row.rate >= .8 ? 'easy' : row.rate <= .2 ? 'hard' : 'fair';
    rows.push(row);
  }
  return rows;
}
async function runTesters(log, ids, name = 'testers') {
  const P = (new URLSearchParams(location.search).get('p') || 'methodical,aggressive,cautious,opportunist,reckless,rusher,turtle,sniper').split(','), lines = [], log0 = log;
  const out = s => { lines.push(s); log0(s); };
  log('mission       ' + P.map(p => p.slice(0, 5).padEnd(6)).join('') + ' rate  verdict'); lines.push('mission       ' + P.map(p => p.slice(0, 5).padEnd(6)).join('') + ' rate  verdict');
  const res = await testerReport(ids, P, id => { window.TESTER_AT = id; });
  log = out;
  for (const r of res) log(`${r.id.padEnd(13)} ${P.map(p => String(r[p] || '-').padEnd(6)).join('')} ${(Math.round(r.rate * 100) + '%').padEnd(5)} ${r.verdict}${r.notes.length ? '\n      ' + r.notes.join('\n      ') : ''}`);
  const tot = res.reduce((a, r) => a + r.wins, 0), games = res.reduce((a, r) => a + r.games, 0);
  log(`testers done: side 1 won ${tot} of ${games} games (${Math.round(tot / games * 100)}%)`);
  try { await fetch('/report/' + name, {method:'POST', body:lines.join('\n')}); } catch (e) {}
  window.TESTERS_DONE = true;
  return res;
}

/* the Last Stand difficulty curve: how many waves the computer holds with each army */
async function waveReport(nats = ['us', 'ger', 'su', 'uk40', 'jp', 'cn'], themes = ['normandy', 'steppe'], diff = 'normal') {
  const out = [];
  for (const nat of nats) for (const theme of themes) {
    await yieldNow();
    const enemy = nat === 'ger' || nat === 'ger40' || nat === 'jp' ? 'us' : 'ger', rows = genMap(theme, 34, 22, 4242);
    TESTER[1] = 'cautious';
    try { const r = autoplayMission(wavesCfg({rows, theme, nat, co:CO_BY_NAT[nat][0], enemy, eco:CO_BY_NAT[enemy][0], diff}), 70, true); out.push(`${nat.padEnd(5)} v ${enemy.padEnd(4)} ${theme.padEnd(9)} held ${Math.max(0, G.waves.n - 1)} waves, turn ${r.day} (${r.why})`); }
    catch (e) { out.push(`${nat} ${theme}: CRASH ${e.message}`); }
  }
  TESTER[1] = null; FAST = false; G = null;
  return out;
}