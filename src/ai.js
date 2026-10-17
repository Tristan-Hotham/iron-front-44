/* ============================== AI ========================================
   Objective-aware (the Neon Protocol lesson): every move is scored against
   damage traded in funds, captures, the mission goal (take the HQ, hold the
   HQ, survive, kill the guns) and distance fields to what matters. Engineers
   clear lanes, minefields are avoided, fixed defences fire from where they
   stand. Plans are steps so the UI can animate them; autoplay runs them flat. */
const PROP_VALUE = {hq:30000, fact:9000, air:7000, port:6000, city:4000};
const expDmg = (a, d, ax, ay, ahp) => calcDamage(a, d, ahp == null ? a.hp : ahp, 4.5, ax, ay);

/* multi-source Dijkstra over terrain for a movement type, ignoring units */
const DF_CACHE = {g:null, turn:'', map:new Map()};
function distField(mt, goals, climb) {
  const turn = G.day + ':' + G.turn + ':' + (G.terVer || 0);
  if (DF_CACHE.g !== G || DF_CACHE.turn !== turn) { DF_CACHE.g = G; DF_CACHE.turn = turn; DF_CACHE.map.clear(); }
  const key = mt + (climb ? 'c' : '') + '|' + goals.map(g => g[0] + ',' + g[1]).sort().join(';');
  const hit = DF_CACHE.map.get(key); if (hit) return hit;
  const f = distFieldRaw(mt, goals, climb); if (DF_CACHE.map.size < 400) DF_CACHE.map.set(key, f); return f;
}
function distFieldRaw(mt, goals, climb) {
  const W = G.W, H = G.H, f = new Float32Array(W * H).fill(1e9), q = new Heap(), d = {mt, climb};
  for (const [x, y] of goals) { if (!inside(x, y)) continue; f[y * W + x] = 0; q.push([0, x, y]); }
  while (q.size) {
    const [c, x, y] = q.pop(); if (c > f[y * W + x]) continue;
    for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (!inside(a, b)) continue;
      let mc = moveCost(d, a, b); if (!mc) { if (TER[terr(a, b)].clear && (mt === 'tread' || mt === 'tire' || mt === 'lander' || mt === 'amphib')) mc = 6; else continue; }   // obstacles: a long way round, or wait for engineers
      if (TER[terr(a, b)].mines) mc += 2;
      const nc = c + mc; if (nc < f[b * W + a]) { f[b * W + a] = nc; q.push([nc, a, b]); } }
  }
  return f;
}
/* infantry whose objectives cannot be reached on foot (another island, across the sea) */
function strandedFoot(f) {
  if (!f.d.foot) return false; const goals = aiGoals(f.team, Object.assign({}, f, {cargo:[]})); if (!goals.length) return false;
  const fld = distField(f.d.mt, goals); return fld[f.y * G.W + f.x] >= 1e8;
}
function enemyHQ(team) { return Object.values(G.props).filter(p => p.owner === enemyOf(team) && terr(p.x, p.y) === 'hq'); }
function aiGoals(team, u) {
  const foes = G.units.filter(o => o.team !== team);
  const myHQ = Object.values(G.props).find(p => p.owner === team && terr(p.x, p.y) === 'hq');
  const o = G.objective;
  if (u.d.carry && u.d.sea && !u.cargo.length) {                // empty landing craft: go to a beach next to infantry who need a lift
    const pick = []; for (const f of G.units) if (f.team === team && canCarry(u, f) && strandedFoot(f)) for (const [dx, dy] of [[0, 0], ...DIRS]) { const x = f.x + dx, y = f.y + dy; if (inside(x, y) && moveCost(u.d, x, y) && moveCost(f.d, x, y)) pick.push([x, y]); }
    if (pick.length) return pick;
  }
  if (o.win === 'convoy' && team === 1 && u.role === o.role) return zoneTiles(o.exit);                       // merchantmen steam for harbour
  if (o.escape && team === 2 && u.role === o.role && (o.flee === 'always' || u.hp <= 50)) return zoneTiles(o.escape);   // the quarry runs for safety
  if (o.win === 'convoy' && team === 2) { const ships = foes.filter(f => f.role === o.role); if (ships.length && canHit(u, ships[0])) return ships.map(f => [f.x, f.y]); }   // wolf packs go for the merchantmen
  if (o.win === 'kill' && team === 1) { const tg = foes.filter(f => f.role === o.role && canHit(u, f)); if (tg.length && !u.d.cap) return tg.map(f => [f.x, f.y]); if (tg.length && (u.d.foot || u.d.armour)) return tg.map(f => [f.x, f.y]); }
  if (o.win === 'kill' && team === 1 && (u.d.foot || u.d.armour)) { const tg = foes.filter(f => f.role === o.role); if (tg.length) return tg.map(f => [f.x, f.y]); }
  if (o.protect && team === 2) { const tg = foes.filter(f => f.role === o.protect && canHit(u, f)); if (tg.length) return tg.map(f => [f.x, f.y]); }
  if (u.d.foot && u.d.cap) {                          // spread out: a property a friend is already taking is not a goal
    const open = Object.values(G.props).filter(p => p.owner !== team && !G.units.some(o => o.team === team && o !== u && o.x === p.x && o.y === p.y));
    // one target per capturer: each property is claimed by the nearest friendly capturer, so the infantry fan out instead of queueing for one town
    const capers = G.units.filter(o => o.team === team && o.d.foot && o.d.cap);
    const mine = open.filter(p => { let best = null, bd = 1e9; for (const c of capers) { const d = dist(c, p); if (d < bd || (d === bd && c.id < best.id)) { bd = d; best = c; } } return !best || best.id === u.id; });
    const caps = (mine.length ? mine : open).map(p => [p.x, p.y]);
    return caps.length ? caps : foes.map(o => [o.x, o.y]);
  }
  if (myHQ && foes.some(o => dist(o, myHQ) <= 6)) return foes.filter(o => dist(o, myHQ) <= 8).map(o => [o.x, o.y]);
  const hit = foes.filter(o => canHit(u, o));
  return (hit.length ? hit : foes).map(o => [o.x, o.y]).concat(enemyHQ(team).map(p => [p.x, p.y]));
}
function planUnit(u, cache) {
  const team = u.team, r = reach(u), foes = G.units.filter(o => o.team !== team);
  let best = {score:-1e9};
  const myHQ = Object.values(G.props).find(p => p.owner === team && terr(p.x, p.y) === 'hq');
  const climb = u.d.foot && hasClimb(team);
  const goalKey = u.d.mt + (u.d.foot ? (u.d.cap ? 'F' + u.id : 'f') : 'X') + (u.cargo.length ? 'L' : '') + (u.d.indirect ? 'I' : '') + ':' + (G.objective.role === u.role || G.objective.protect ? u.role : '') + (u.d.sub ? 'S' : '');
  if (!cache[goalKey]) {
    if (u.d.carry && u.cargo.length) {
      const cf = distField(u.cargo[0].d.mt, aiGoals(team, u.cargo[0]), climb);
      const cand = []; let lo = 1e9;                                     // landing spots: the stretches of coast closest to where the cargo needs to go
      for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (moveCost(u.d, x, y)) for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(a, b) && moveCost(u.cargo[0].d, a, b)) { const v = cf[b * G.W + a]; cand.push([x, y, v]); if (v < lo) lo = v; } }
      const goals = cand.filter(c => c[2] <= lo + 14).map(c => [c[0], c[1]]);
      cache[goalKey] = distField(u.d.mt, goals.length ? goals : aiGoals(team, u.cargo[0]));
    } else cache[goalKey] = distField(u.d.mt, aiGoals(team, u), climb);
  }
  const field = cache[goalKey];
  const hqKey = 'HQ' + u.d.mt;
  if (!(hqKey in cache)) { const e = enemyHQ(team); cache[hqKey] = e.length ? distField(u.d.mt, e.map(p => [p.x, p.y]), climb) : null; }
  const urgency = G.objective.limit && team === 1 ? clamp(G.day / G.objective.limit, 0, 1) : G.objective.win === 'survive' && team === 2 ? clamp(G.day / G.objective.days, 0, 1) : 0;   // whoever is racing the clock presses harder as it runs down   // the closer the deadline, the harder the pull to the HQ
  const hqf = cache[hqKey], hqW = u.d.foot ? .55 : .85, late = urgency ? .7 - .35 * urgency : 1;
  const fdAt = i => hqf && !u.cargo.length && G.objective.win !== 'kill' ? Math.min(field[i], hqf[i] * hqW * late) : field[i];
  const cat = u.d.air ? 'ftr' : u.d.sea ? (u.d.sub ? 'sub' : 'dd') : u.d.armour ? (u.role === 'recon' || u.role === 'apc' ? 'recon' : 'tank') : 'inf';
  const thKey = team + ':' + G.day + ':' + G.turn + ':' + G.units.filter(o => o.team !== team).map(o => o.id).join(',');   // enemies do not move during our turn: reuse until one dies
  if (TH_CACHE.key !== thKey || TH_CACHE.g !== G) { TH_CACHE.key = thKey; TH_CACHE.g = G; TH_CACHE.maps = {}; }
  const threat = TH_CACHE.maps[cat] || (TH_CACHE.maps[cat] = threatMap(team, cat));
  if (cache.odds == null) { const val = t => G.units.filter(o => o.team === t).reduce((s, o) => s + o.d.cost * o.hp / 100, 0); cache.odds = val(team) / Math.max(1, val(enemyOf(team))); }
  const fearK = .3 * clamp(1.6 - cache.odds * .6, .35, 1.3) * (1 - urgency * .9) * (1 - clamp((G.day - 8) / 13, 0, .9));   // and as a battle drags on, both sides commit   // outnumbered armies are wary; a strong one, or one running out of time, takes risks
  const PW = personaOf(team);
  if (!cache.cm) { const fs = G.units.filter(o => o.team !== team); cache.cm = fs.length ? [fs.reduce((s, o) => s + o.x, 0) / fs.length, fs.reduce((s, o) => s + o.y, 0) / fs.length] : [G.W / 2, G.H / 2]; }
  const tieB = (x, y) => -Math.hypot(x - cache.cm[0], y - cache.cm[1]) * .01;   // a tie-breaker that looks the same from either side of the map
  for (const n of r.values()) {
    if (u.hold && (n.x !== u.x || n.y !== u.y)) continue;
    if (!canStop(u, n.x, n.y)) continue;
    const o = unitAt(n.x, n.y);
    const moved = n.x !== u.x || n.y !== u.y, here = terr(n.x, n.y), stars = u.d.air ? 0 : TER[here].def;
    const fd = fdAt(n.y * G.W + n.x), th = threat[n.y * G.W + n.x];
    let base = tieB(n.x, n.y) - fd * 120 * PW.adv + stars * (th > 0 ? 60 : 12) * PW.cover - th * u.d.cost * fearK * PW.fear * (1 - Math.min(.5, stars * .1)) + (PW.noise ? (hrand(n.x * 7 + G.day, n.y * 13 + u.id) - .5) * PW.noise : 0);   // cover matters where fire can reach; temperament weighs each term
    const pr = propAt(n.x, n.y);
    if (pr && pr.owner !== team && !u.d.cap) base -= 1500;                      // keep enemy properties clear for the infantry
    if (!u.d.cap && (cache.ehq || (cache.ehq = enemyHQ(team))).some(h => Math.abs(h.x - n.x) + Math.abs(h.y - n.y) === 1)) base -= 700;   // and the approaches to their HQ, or a jam of tanks can lock the capturers out
    if (pr && pr.owner === team && TER[here].makes && G.teams[team].funds >= 4000 && moveCost(u.d, n.x, n.y) && !(u.hp <= 30)) base -= 900;   // do not squat on our own factory when there is money to build
    if (TER[here].mines && !u.d.air && !u.d.sea && moved) base -= u.d.cost * .25 + (u.hp <= 30 ? 3000 : 250);   // the expected cost of the mine, unless it would kill
    if (o && o !== u) {
      if (canCarry(o, u) && !o.done && fd > 4) best = pick(best, {score:base - 400, u, n, act:'load'});
      else if (canJoin(u, o) && u.hp + o.hp <= 120 && Math.min(u.hp, o.hp) <= 50) best = pick(best, {score:base + 600, u, n, act:'join'});   // merge two battered units
      continue;
    }
    for (const t of targetsFrom(u, n.x, n.y, moved)) {
      const dmg = expDmg(u, t, n.x, n.y), left = t.hp - dmg;
      let s = dmg * t.d.cost / 100 + (left <= 0 ? t.d.cost * .4 : 0);
      const p = propAt(t.x, t.y); if (p && p.owner === team && p.cap < 20) s += 5000;
      if (p && p.owner === t.team && terr(t.x, t.y) === 'hq') s += 2500 + (left <= 0 ? 4000 : 0);   // the unit blocking the enemy HQ must go
      if (G.objective.win === 'kill' && team === 1 && t.role === G.objective.role) s += 4000;
      if (left > 0 && dist({x:n.x, y:n.y}, t) === 1 && canCounter(t, u)) { const fake = Object.assign({}, t, {hp:left}), back = expDmg(fake, u, t.x, t.y, left); s -= back * u.d.cost / 100 * .8; if (back >= u.hp) s -= u.d.cost * .6; }   // never trade a unit for a scratch
      s += stars * 50 + (u.d.indirect ? 0 : -fd * 10);
      best = pick(best, {score:s * PW.atk + 200 + Math.random() * .5, u, n, act:'attack', target:t, kill:left <= 0});
    }
    if (canCapture(u, n.x, n.y)) {
      const p = propAt(n.x, n.y), v = PROP_VALUE[terr(n.x, n.y)] || 3000;
      best = pick(best, {score:(v * (hpBars(u) / 10) * (p.cap < 20 && !moved ? 2 : 1) * .5 + 800) * PW.cap + tieB(n.x, n.y) + Math.random() * .3, u, n, act:'capture'});
    }
    if (u.d.clears) for (const [bx, by] of bridgeSpots(u, n.x, n.y)) if (terr(bx, by) === 'bridge' && foes.some(f => !f.d.air && dist(f, {x:bx, y:by}) <= 3) && !G.units.some(f => f.team === team && f !== u && dist(f, {x:bx, y:by}) <= 2 && enemyHQ(team).length && dist(f, enemyHQ(team)[0]) < dist({x:bx, y:by}, enemyHQ(team)[0]))) best = pick(best, {score:base + 1800, u, n, act:'bridge', at:[bx, by]});   // blow the bridge in the enemy's face
    if (u.d.clears && G.teams[team].funds >= BAILEY && G.units.some(f => f.team === team && (f.d.mt === 'tread' || f.d.mt === 'tire'))) for (const [bx, by] of bridgeSpots(u, n.x, n.y)) if (terr(bx, by) === 'river') {   // span a river on the road to the objective so the armour can follow
      const dx = bx - n.x, dy = by - n.y; let across = false;                      // look straight across, over up to three tiles of river
      for (let k = 2; k <= 4; k++) { const ax = n.x + dx * k, ay = n.y + dy * k; if (!inside(ax, ay)) break; const tt = terr(ax, ay); if (tt === 'river' || tt === 'bridge') continue; across = tt !== 'sea' && fdAt(ay * G.W + ax) < fd - 1; break; }
      const beside = [[bx + dy, by + dx], [bx - dy, by - dx]].some(([a, c]) => inside(a, c) && terr(a, c) === 'bridge');   // a crossing already runs alongside
      if (across && !beside) best = pick(best, {score:base + 2400, u, n, act:'bridge', at:[bx, by]}); }
    if (u.d.clears) for (const [cx, cy] of clearSpots(u, n.x, n.y)) {      // engineers: open a lane that leads somewhere useful
      const gain = fdAt(cy * G.W + cx) <= fd + 1 ? 1600 : 700;
      best = pick(best, {score:base + gain + (TER[terr(cx, cy)].mines ? 400 : 0), u, n, act:'clear', at:[cx, cy]});
    }
    if (u.cargo.length) {
      const drops = [], taken = new Set();
      for (const c of u.cargo) { const sp = unloadSpots(u, n.x, n.y, c).filter(([a, b]) => !taken.has(K(a, b)) && !TER[terr(a, b)].mines).sort((a, b) => fdAt(a[1] * G.W + a[0]) - fdAt(b[1] * G.W + b[0]))[0]; if (sp) { taken.add(K(sp[0], sp[1])); drops.push([c, sp]); } }
      if (drops.length && (fd <= 2 || terr(n.x, n.y) === 'beach' || u.d.sea)) best = pick(best, {score:3000 + drops.length * 500 - fd * 100, u, n, act:'unload', drops});
    }
    const p = propAt(n.x, n.y);
    let s = base;
    if (u.hp <= 30 && p && p.owner === team && !u.d.air && !u.d.sea && ['city', 'hq', 'fact'].includes(here)) s += 2500;
    if (myHQ && G.objective.win === 'survive' && team === 1 && !u.d.air && !u.d.sea) s -= Math.max(0, dist({x:n.x, y:n.y}, myHQ) - (u.d.foot ? 1 : 3)) * 400;
    if (u.d.indirect) { s -= (foes.some(f => dist(f, {x:n.x, y:n.y}) <= 2) ? 1500 : 0); if (G.units.some(f => f.team === team && f !== u && !f.d.indirect && dist(f, {x:n.x, y:n.y}) === 1)) s += 200; }   // guns keep a screen of friends
    if (!moved && u.dug) s += 90;                                   // keep a dug-in position
    if (myHQ && n.x === myHQ.x && n.y === myHQ.y && foes.some(f => f.d.cap && dist(f, myHQ) <= moveOf(f) + 2)) s += 3000;   // stand on the HQ so it cannot be taken
    best = pick(best, {score:s, u, n, act:'wait'});
  }
  if (best.n) best.path = pathTo(r, best.n.x, best.n.y);
  return best;
}
function pick(a, b) { return b.score > a.score ? b : a; }
/* expected damage (as a fraction of a full unit) that a unit of class cat would take on each tile next turn */
const TH_CACHE = {key:null, g:null, maps:{}};
function threatMap(team, cat = 'inf') {
  const m = new Float32Array(G.W * G.H);
  for (const e of G.units) {
    if (e.team === team || e.d.rng[1] === 0) continue;
    const base = (DMG[e.role] && DMG[e.role][cat]) || 0; if (!base) continue;
    const r = e.d.indirect || e.d.fixed ? new Map([[K(e.x, e.y), {x:e.x, y:e.y}]]) : reach(e, e.x, e.y);
    const [a, b] = rangeOf(e), add = Math.min(1.2 * 100, base * e.d.pow * e.hp / 100);
    const seen = new Set();
    for (const n of r.values()) for (let dy = -b; dy <= b; dy++) for (let dx = -b; dx <= b; dx++) {
      const d = Math.abs(dx) + Math.abs(dy); if (d < a || d > b) continue;
      const x = n.x + dx, y = n.y + dy; if (!inside(x, y)) continue; const k = y * G.W + x; if (seen.has(k)) continue; seen.add(k); m[k] += add / 100;
    }
  }
  return m;
}
function aiPower(team) {
  const T = G.teams[team]; if (!CO[T.co] || T.power) return 0;
  if (canPower(team, 2)) return 2;
  if (canPower(team, 1) && T.meter < starCost(team, 2) * .8) return 1;
  return 0;
}
function aiBuild(team) {
  const T = G.teams[team], out = [];
  if (NATION[T.nat] && NATION[T.nat].zed) return out;                 // the dead do not build: they recruit
  const fo = G.units.filter(o => o.team !== team), near = p => fo.length ? Math.min(...fo.map(o => Math.hypot(o.x - p.x, o.y - p.y))) : 0;
  const facs = props(team).filter(p => TER[terr(p.x, p.y)].makes && !unitAt(p.x, p.y)).map(p => [p, near(p) + (fo.length ? Math.hypot(p.x - fo.reduce((s, o) => s + o.x, 0) / fo.length, p.y - fo.reduce((s, o) => s + o.y, 0) / fo.length) * .001 : 0) + Math.random() * 1e-6]).sort((a, b) => a[1] - b[1]).map(e => e[0]);   // the depot nearest the fighting buys first
  const foes = G.units.filter(o => o.team !== team), mine = G.units.filter(o => o.team === team);
  const foeArmour = foes.filter(o => o.d.armour).length, foeAir = foes.filter(o => o.d.air).length, myInf = mine.filter(o => o.d.foot).length;
  const neutral = Object.values(G.props).filter(p => p.owner !== team).length;
  for (const p of facs) {
    const kind = TER[terr(p.x, p.y)].makes;
    const needBoats = kind === 'sea' && mine.some(f => strandedFoot(f)) && mine.filter(f => f.role === 'lc').length < 3;   // islands: build landing craft when the infantry is stranded
    const opts = buildable(team, kind).filter(r => r !== 'apc' && (r !== 'lc' || needBoats) && r !== 'ddtank' && unitCost(team, r) <= T.funds);
    if (!opts.length) continue;
    let best = null, bs = -1e9;
    for (const r of opts) {
      const d = udef(T.nat, r), c = unitCost(team, r);
      // what it would do to the enemy, in the same scale as the bonuses below: ships offshore count little for a land depot, and no target counts above 12,000
      let s = foes.reduce((acc, o) => acc + (DMG[r] && DMG[r][o.role] || 0) / 100 * Math.min(o.d.cost, 12000) / 1000 * (o.d.sea && kind !== 'sea' ? .3 : 1), 0) / Math.max(1, foes.length) * 4;
      s += c / 1500;
      if (d.foot && d.cap && myInf < 4 && neutral) s += 25;
      if (r === 'aa') s += foeAir * 12 - 10;
      if (r === 'at' || r === 'htank' || r === 'mtank') s += foeArmour * 3;
      if (d.indirect) s -= mine.filter(o => o.d.indirect).length * 8;
      if (r === 'eng' && !G.ter.some(t => TER[t].clear)) s -= 20;
      if (r === 'lc' && needBoats) s += 40;
      if (T.funds - c < 1000 && facs.length > 1) s -= 10;
      s += Math.random() * 6;
      if (s > bs) { bs = s; best = r; }
    }
    if (best) { T.funds -= unitCost(team, best); const u = spawn(team, {role:best, x:p.x, y:p.y, hp:100}); if (u) { u.moved = u.done = true; out.push(u); } }
  }
  return out;
}
/* Best-first across the army: look at the next few units' best plans and act on
   the most valuable one first. Kills come before damage (so the army focuses its
   fire and nobody wastes a shot on a unit that is already dead), damage before
   captures and engineering, and only then the plain moves, in the old order. */
const AI_LOOK = 8;
function planValue(p) {
  if (!p.n) return -Infinity;
  if (p.act === 'attack') return (p.kill ? 3e6 : p.score > 0 ? 2e6 : 0) + p.score;
  if (['capture', 'unload', 'join', 'clear', 'bridge'].includes(p.act)) return 1e6 + p.score;
  return 0;
}
function aiNext(team, cache) {
  const order = u => (u.d.indirect ? 0 : u.cargo.length ? 3 : u.d.foot ? 2 : 1);
  const fo = G.units.filter(o => o.team !== team), near = u => fo.length ? Math.min(...fo.map(o => Math.hypot(o.x - u.x, o.y - u.y))) : 0;
  for (const u of G.units) if (u.team === team) u.tb = Math.random();
  const ready = G.units.filter(u => u.team === team && !u.done).sort((a, b) => order(a) - order(b) || b.d.cost - a.d.cost || near(a) - near(b) || a.tb - b.tb);
  let first = null, best = null, bv = 0;
  for (const u of ready) {
    const plan = planUnit(u, cache);
    if (!plan.n) { u.done = true; continue; }
    if (!first) first = plan;
    const v = planValue(plan); if (v > bv) { bv = v; best = plan; }
    if (ready.indexOf(u) >= AI_LOOK && first) break;
  }
  return best || first;
}
