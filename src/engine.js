/* ============================== ENGINE ====================================
   Game state and rules. No drawing here: the UI calls these and animates. */
let G = null;                                   // the live game
const K = (x, y) => y * 1000 + x;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
let UID = 1;

/* binary heap of [priority, ...payload] for Dijkstra on the bigger maps */
class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(n) { const a = this.a; a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
    if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
}

/* "inf 3,4; tank 5,6 7; lc 2,10 +inf+inf; inf 3,8 !; inf*4 10,2-16,5"
   (number = HP, +cargo, ! = holds position, *n with a rectangle = n units placed on valid tiles inside it) */
function parseUnits(str) {
  if (!str) return [];
  return str.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^(\w+)(?:\*(\d+))?\s+(\d+),(\d+)(?:-(\d+),(\d+))?(?:\s+(\d+))?((?:\s*\+\w+)*)(\s*!)?$/);
    if (!m) throw new Error('bad unit spec: ' + s);
    return {role:m[1], n:m[2] ? +m[2] : 1, x:+m[3], y:+m[4], x2:m[5] != null ? +m[5] : null, y2:m[6] != null ? +m[6] : null,
      hp:m[7] ? +m[7] * 10 : 100, cargo:(m[8].match(/\w+/g) || []), hold:!!m[9]};
  });
}
/* turn specs into concrete placements on tiles the unit can actually occupy */
function placeSpecs(team, specs, seed = 7) {
  const out = [], taken = new Set(G.units.map(u => K(u.x, u.y))); let s = seed;
  const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const okTile = (d, x, y) => inside(x, y) && !taken.has(K(x, y)) && (d.fixed ? !['sea', 'river', 'obst'].includes(terr(x, y)) : moveCost(d, x, y) > 0);
  for (const sp of specs) {
    const d = udef(G.teams[team].nat, sp.role); if (!d) continue;
    if (sp.x2 == null && sp.n === 1) {
      let x = sp.x, y = sp.y;
      if (!okTile(d, x, y)) {                              // spiral out to the nearest tile this unit can stand on
        let found = null;
        for (let r = 1; r < 10 && !found; r++) for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r && !found; dx++)
          if (Math.abs(dx) + Math.abs(dy) === r && okTile(d, x + dx, y + dy) && !TER[terr(x + dx, y + dy)].mines) found = [x + dx, y + dy];
        if (!found) continue; [x, y] = found;
      }
      taken.add(K(x, y)); out.push(Object.assign({}, sp, {x, y})); continue;
    }
    let left = sp.n;
    for (let grow = 0; grow < 5 && left; grow++) {         // spill outward if the rectangle is full
      const x0 = Math.min(sp.x, sp.x2 ?? sp.x) - grow, x1 = Math.max(sp.x, sp.x2 ?? sp.x) + grow, y0 = Math.min(sp.y, sp.y2 ?? sp.y) - grow, y1 = Math.max(sp.y, sp.y2 ?? sp.y) + grow, cand = [];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cand.push([x, y, R()]);
      cand.sort((a, b) => a[2] - b[2]);
      for (const [x, y] of cand) { if (!left) break; if (okTile(d, x, y) && !TER[terr(x, y)].mines) { taken.add(K(x, y)); out.push(Object.assign({}, sp, {x, y, n:1})); left--; } }
    }
  }
  return out;
}

function newGame(cfg) {
  /* cfg: {map:[rows], theme, teams:{1:{nat,co,funds,ai},2:{...}}, units:{1:str|array,2:...}, mission, objective, events, income} */
  const rows = cfg.map, H = rows.length, W = rows[0].length;
  G = {W, H, ter:[], props:{}, units:[], day:1, turn:1, theme:cfg.theme || 'normandy', over:null, log:[], wrecks:[], craters:[],
    clock:cfg.clock || {start:'1944-07-01T06:00', step:60}, fog:!!cfg.fog,
    teams:{}, mission:cfg.mission || null, objective:cfg.objective || {win:'hq'}, events:(cfg.events || []).map(e => Object.assign({done:false}, e)),
    incomeMul:cfg.income || {}, firstTeam:1, weather:cfg.weather || null, stats:{1:{kills:0, lost:0, dmg:0}, 2:{kills:0, lost:0, dmg:0}}};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = rows[y][x], d = MAPCH[ch];
    if (!d) throw new Error(`bad map char "${ch}" at ${x},${y}`);
    G.ter.push(d[0]);
    if (TER[d[0]].prop) G.props[K(x, y)] = {x, y, owner:d[1] || 0, cap:20};
  }
  G.uover = {}; G.arrived = 0; G.waves = cfg.waves ? Object.assign({}, cfg.waves) : null; G.persona = cfg.persona || null; G.watch = !!cfg.watch;
  G.diff = cfg.diff || (typeof SET !== 'undefined' && SET.difficulty) || 'normal';   // fixed for the whole game: changing the setting mid-battle does not change this one
  for (const t of [1, 2]) {
    const c = cfg.teams[t];
    G.teams[t] = {nat:c.nat, co:c.co, funds:c.funds || 0, ai:!!c.ai, meter:0, power:0, uses:0};
    if (c.u) G.uover[c.nat] = Object.assign(G.uover[c.nat] || {}, c.u);
  }
  if (typeof spriteCache !== 'undefined') spriteCache.clear();
  if (G.objective.win === 'survive') { const mine = Object.values(G.props).filter(p => p.owner === 1).length; G.holdNeed = G.objective.hold != null ? G.objective.hold : Math.max(1, Math.ceil(mine / 2)); G.holdStart = mine; }
  for (const t of [1, 2]) {
    const list = Array.isArray(cfg.units && cfg.units[t]) ? cfg.units[t] : parseUnits(cfg.units && cfg.units[t]);
    for (const s of placeSpecs(t, list, 11 * t)) spawn(t, s);
  }
  return G;
}
function spawn(team, s) {
  const d = udef(G.teams[team].nat, s.role); if (!d) return null;
  const u = {id:UID++, team, role:s.role, x:s.x, y:s.y, hp:s.hp || 100, moved:false, done:false, cargo:[], hold:!!s.hold || !!d.fixed,
    xp:s.xp || 0, name:s.name || unitName(team, s.role), kills:s.kills || 0, core:!!s.core};
  u.d = d;
  for (const r of s.cargo || []) { const c = spawnLoose(team, r); if (c) u.cargo.push(c); }
  G.units.push(u);
  return u;
}
function spawnLoose(team, role, extra) {
  const d = udef(G.teams[team].nat, role); if (!d) return null;
  return Object.assign({id:UID++, team, role, x:0, y:0, hp:100, moved:true, done:true, cargo:[], hold:false, xp:0, name:unitName(team, role), kills:0, d}, extra || {});
}
/* ---------- the clock: G.day counts turns; each turn advances the mission clock by clock.step minutes ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function clockAt(turn, clock = G && G.clock) { const c = clock || {start:'1944-07-01T06:00', step:60}; return new Date(new Date(c.start).getTime() + (turn - 1) * c.step * 60000); }
const hhmm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
function fmtClock(turn, clock = G && G.clock, long = false) {
  const c = clock || {step:60}, d = clockAt(turn, c);
  if (c.step >= 1440) return `${d.getDate()} ${MONTHS[d.getMonth()]}${long ? ' ' + d.getFullYear() : ''}`;
  return `${hhmm(d)}${long || c.step >= 360 ? ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : ''}`;
}
function stepText(step) { return step >= 1440 ? `${step / 1440} day${step > 1440 ? 's' : ''}` : step >= 60 ? `${step / 60} hour${step > 60 ? 's' : ''}` : `${step} minutes`; }
function hourAt(turn = G && G.day) { const d = clockAt(turn); return d.getHours() + d.getMinutes() / 60; }
function isNight(turn = G && G.day) { if (G && G.waves && G.waves.night === 'endless') return true; if (!G || G.clock.step >= 1440) return false; const h = hourAt(turn); return h < 5 || h >= 22; }
/* objective text with real times in place of turn numbers */
function goalText(m) {
  const c = m.clock, o = m.objective;
  return m.goal.replace('{survive}', o.days ? fmtClock(o.days + 1, c, true) : '').replace('{limit}', o.limit ? fmtClock(o.limit + 1, c, true) : '');
}

/* ---------- fog of war: what a side can see ---------- */
const HIDES = new Set(['forest', 'bocage', 'ruins', 'block', 'city', 'trench', 'bunker']);
function visionOf(u) {
  let v = u.d.air ? 5 : u.role === 'recon' ? 5 : u.d.foot ? 2 : u.d.sea ? 4 : u.d.fixed ? 3 : 3;
  if (u.d.foot && ['hill', 'cliff'].includes(terr(u.x, u.y))) v += 2;
  if (isNight()) v = Math.max(1, v - 1);
  return v;
}
function computeVision(team) {
  const vis = new Uint8Array(G.W * G.H);
  if (!G.fog && !isNight()) { vis.fill(1); return vis; }
  for (const p of Object.values(G.props)) if (p.owner === team) vis[p.y * G.W + p.x] = 1;
  for (const u of G.units) {
    if (u.team !== team) continue;
    const r = visionOf(u), seesCover = u.d.air || u.role === 'recon';
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const d = Math.abs(dx) + Math.abs(dy), x = u.x + dx, y = u.y + dy;
      if (d > r || !inside(x, y)) continue;
      if (d > 1 && !seesCover && HIDES.has(terr(x, y))) continue;   // woods, hedgerows and buildings hide what is inside them
      vis[y * G.W + x] = 1;
    }
  }
  return vis;
}
const terr = (x, y) => G.ter[y * G.W + x];
const setTerr = (x, y, t) => { G.ter[y * G.W + x] = t; G.terVer = (G.terVer || 0) + 1; };
const inside = (x, y) => x >= 0 && y >= 0 && x < G.W && y < G.H;
const propAt = (x, y) => G.props[K(x, y)];
const unitAt = (x, y) => G.units.find(u => u.x === x && u.y === y);
const enemyOf = t => 3 - t;
const hpBars = u => Math.ceil(u.hp / 10);

/* ---------- names and veterancy ---------- */
const NAMES = {
  us: {coy:['Able', 'Baker', 'Charlie', 'Dog', 'Easy', 'Fox', 'George', 'Item', 'King', 'Love'], fmt:(c, n) => `${c} Coy, ${n}`, units:['1/116th', '2/116th', '3/16th', '2/506th', '1/8th Inf', '3/22nd', '2/12th', '1/26th', '743rd Tk Bn', '70th Tk Bn', '37th Tk Bn', '9th Armd']},
  uk: {coy:['A', 'B', 'C', 'D'], fmt:(c, n) => `${c} Coy, ${n}`, units:['2nd Ox & Bucks', '1st Hampshire', '6th Green Howards', '1st Suffolk', '4th CLY', '13th/18th Hussars', '5th RTR', '2nd Para', '1st Welsh Gds', '2nd Irish Gds']},
  fr: {coy:['1er', '2e', '3e'], fmt:(c, n) => `${c} Esc., ${n}`, units:['501e RCC', '12e Cuirassiers', 'RMT', '9e Cie (La Nueve)', '12e Chasseurs d\'Afrique']},
  su: {coy:['1st', '2nd', '3rd'], fmt:(c, n) => `${c} Bn, ${n}`, units:['79th Gds Rifle', '8th Gds', '150th Rifle Div', '1st Gds Tank', '2nd Gds Tank', '3rd Shock', '5th Gds Tank', '35th Gds']},
  ger:{coy:['1.', '2.', '3.', '5.', '7.', '9.'], fmt:(c, n) => `${c}/${n}`, units:['GR 916', 'GR 726', 'Pz.Rgt 6', 's.Pz.Abt 101', 'FJR 6', 'Pz.Lehr', 'GR 1057', 'Pz.Gren.Rgt 25', 'Volksgren.Rgt 78']},
};
function unitName(team, role) {
  const nat = G && G.teams[team] ? G.teams[team].nat : 'us', N = NAMES[nat] || NAMES[natBase(nat)] || NAMES.us, r = Math.random;
  const ships = (G && G.mission && G.mission.names && G.mission.names[team] && G.mission.names[team][role]) || (SHIPNAMES[nat] && SHIPNAMES[nat][role]);
  if (ships) {                                           // warships and merchantmen carry their real names
    const used = new Set(G.units.filter(u => u.team === team).map(u => u.name)), free = ships.filter(s => !used.has(s));
    if (free.length) return free[0];
  }
  return N.fmt(N.coy[r() * N.coy.length | 0], N.units[r() * N.units.length | 0]);
}
const RANKS = [{n:'Green', xp:0, atk:0, def:0, mv:0}, {n:'Veteran', xp:100, atk:5, def:5, mv:0}, {n:'Elite', xp:250, atk:12, def:10, mv:0}, {n:'Legendary', xp:500, atk:20, def:15, mv:1}];
const rankOf = u => { let r = 0; for (let i = 0; i < RANKS.length; i++) if ((u.xp || 0) >= RANKS[i].xp) r = i; return r; };
function gainXp(u, v) { if (!u || u.hp <= 0) return null; const before = rankOf(u); u.xp = (u.xp || 0) + v; const after = rankOf(u); return after > before ? after : null; }

/* ---------- CO effects ---------- */
function effects(team) {
  const T = G.teams[team], c = CO[T.co]; if (!c) return [];
  const e = [c.d2d]; if (T.power === 1) e.push(c.cop); if (T.power === 2) e.push(c.scop);
  return e;
}
function sumGroup(team, key, d, terrain) {
  let s = 0;
  for (const e of effects(team)) if (e[key]) for (const [g, v] of Object.entries(e[key])) if (inGroup(d, g, terrain)) s += v;
  return s;
}
const moveOf = u => {
  if (u.d.fixed) return 0;
  let m = u.d.mv + sumGroup(u.team, 'mv', u.d, null) + RANKS[rankOf(u)].mv;
  for (const e of effects(enemyOf(u.team))) if (e.enemyMv) m += e.enemyMv;   // e.g. Heinrici's Seelow Heights slows the attacker
  return Math.max(1, m);
};
function rangeOf(u) {
  let [a, b] = u.d.rng;
  if (u.d.indirect) for (const e of effects(u.team)) if (e.rng) b += e.rng;
  return [a, b];
}
function unitCost(team, role) {
  const d = udef(G.teams[team].nat, role); if (!d) return Infinity; let m = 1;
  for (const e of effects(team)) if (e.cost) for (const [g, v] of Object.entries(e.cost)) if (inGroup(d, g)) m *= v;
  return Math.round(d.cost * m / 100) * 100;
}
function buildable(team, kind) { return MAKES[kind].filter(r => { const d = udef(G.teams[team].nat, r); return d && !d.fixed; }); }

/* ---------- movement ---------- */
function moveCost(d, x, y) {
  const t = terr(x, y);
  if (t === 'cliff' && d.climb) return 1;
  const c = TER[t].mv[d.mt] || 0; if (!c || !G) return c;
  const offRoad = t !== 'road' && t !== 'bridge' && !TER[t].prop;
  if (offRoad && (d.mt === 'tread' || d.mt === 'tire') && (G.weather === 'snow' || G.theme === 'winter')) return c + 1;            // snow: vehicles bog down off the roads
  if (offRoad && d.mt === 'tire' && G.weather === 'rain' && ['plain', 'field', 'bocage', 'forest', 'marsh'].includes(t)) return c + 1;   // rain: mud for wheels
  return c;
}
function canCarry(t, u) {
  if (!t.d.carry || t.team !== u.team || t === u || t.cargo.length >= t.d.carry || u.d.fixed) return false;
  return t.d.carries === 'foot' ? !!u.d.foot : (!u.d.air && !u.d.sea);
}
/* Dijkstra over move points. Returns Map key -> {x,y,c,prev}. Enemy units block; friends can be passed. */
function reach(u, fromX = u.x, fromY = u.y, mvOverride, vis) {
  const mv = mvOverride != null ? mvOverride : moveOf(u), out = new Map(), q = new Heap();
  out.set(K(fromX, fromY), {x:fromX, y:fromY, c:0, prev:null}); q.push([0, fromX, fromY]);
  const climb = u.d.climb || (u.d.foot && hasClimb(u.team)), d = climb ? Object.assign({}, u.d, {climb:true}) : u.d;
  while (q.size) {
    const [c0, nx, ny] = q.pop();
    if (c0 > out.get(K(nx, ny)).c) continue;
    for (const [dx, dy] of DIRS) {
      const x = nx + dx, y = ny + dy; if (!inside(x, y)) continue;
      const mc = moveCost(d, x, y); if (!mc) continue;
      const c = c0 + mc; if (c > mv) continue;
      const o = unitAt(x, y); if (o && o.team !== u.team && (!vis || vis[y * G.W + x])) continue;   // an unseen enemy does not show up in the plan
      const k = K(x, y), cur = out.get(k);
      if (!cur || c < cur.c) { out.set(k, {x, y, c, prev:K(nx, ny)}); q.push([c, x, y]); }
    }
  }
  return out;
}
const hasClimb = team => CO[G.teams[team].co] && CO[G.teams[team].co].d2d.climb;
function canStop(u, x, y) {
  const o = unitAt(x, y);
  return !o || o === u || canCarry(o, u) || canJoin(u, o);
}
/* two understrength units of the same type merge; surplus strength comes back as funds */
function canJoin(u, o) { return !!o && o !== u && o.team === u.team && o.role === u.role && !u.d.fixed && !o.cargo.length && !u.cargo.length && (u.hp < 100 || o.hp < 100); }
function joinUnits(u, o) {
  const total = u.hp + o.hp, refund = Math.max(0, total - 100) * u.d.cost / 100;
  o.hp = Math.min(100, total); o.xp = Math.max(o.xp || 0, u.xp || 0); o.kills = (o.kills || 0) + (u.kills || 0); o.done = true;
  if (u.name && rankOf(u) > rankOf(o)) o.name = u.name;
  G.teams[u.team].funds += Math.round(refund);
  G.units = G.units.filter(x => x !== u);
  return Math.round(refund);
}
function pathTo(r, x, y) {
  const p = []; let k = K(x, y);
  while (k != null) { const n = r.get(k); if (!n) return null; p.unshift([n.x, n.y]); k = n.prev; }
  return p;
}
/* mines bite a ground unit that stops on them */
function mineCheck(u) {
  if (u.d.air || u.d.sea || !TER[terr(u.x, u.y)].mines) return 0;
  const dmg = 20 + Math.floor(Math.random() * 11);
  u.hp -= dmg; if (u.hp <= 0) kill(u, enemyOf(u.team));
  return dmg;
}

/* ---------- combat ---------- */
function baseDmg(a, d) { const t = DMG[a.role]; return t ? t[d.role] : undefined; }
function canHit(a, d) { const b = baseDmg(a.d, d.d); return b !== undefined && b > 0; }
function calcDamage(att, def, attHp = att.hp, luck = 0, ax = att.x, ay = att.y, dx = def.x, dy = def.y) {
  const b = baseDmg(att.d, def.d); if (!b) return 0;
  const pow = att.d.pow * (def.d.armour ? att.d.powArm : 1);
  const atk = (100 + sumGroup(att.team, 'atk', att.d, terr(ax, ay)) + (G.teams[att.team].power ? 10 : 0) + RANKS[rankOf(att)].atk + aiEdge(att.team)) / 100;
  const stars = def.d.air ? 0 : TER[terr(dx, dy)].def + (def.dug && def.x === dx && def.y === dy ? 1 : 0);   // foxholes add a star
  const dco = 100 + sumGroup(def.team, 'def', def.d, terr(dx, dy)) + (G.teams[def.team].power ? 10 : 0) + RANKS[rankOf(def)].def + aiEdge(def.team);
  const dmg = (b * pow * atk + luck) * (Math.ceil(attHp / 10) / 10) * ((200 - (dco + stars * hpBars(def))) / 100) * def.d.arm;
  return clamp(Math.floor(dmg), 0, 100);
}
function inRange(u, x, y, o) { const [a, b] = rangeOf(u), r = Math.abs(o.x - x) + Math.abs(o.y - y); return r >= a && r <= b; }
function targetsFrom(u, x, y, moved) {
  const [, b] = rangeOf(u); if (!b) return [];
  if ((u.d.air || u.d.carrier) && isNight()) return [];  // no air strikes in the dark
  if (u.d.indirect && moved) return [];
  return G.units.filter(o => o.team !== u.team && canHit(u, o) && inRange(u, x, y, o) && !subHidden(o, u.team, x, y, u));
}
/* a submerged U-boat is invisible unless an escort's asdic (2 tiles), a patrol plane overhead or any
   unit right alongside finds it, or it has just given itself away by firing */
function subHidden(o, viewer, ax, ay, att) {
  if (!o || !o.d || !o.d.sub || !viewer || o.team === viewer || o.revealed) return false;
  for (const u of G.units) {
    if (u.team !== viewer) continue;
    const ux = u === att ? ax : u.x, uy = u === att ? ay : u.y, d = Math.abs(ux - o.x) + Math.abs(uy - o.y);
    if (d <= 1 || (u.d.asw && d <= 2) || (u.d.air && d <= 1)) return false;
  }
  return true;
}
function luckRoll() { return Math.floor(Math.random() * 10); }
const canCounter = (def, att) => !def.d.indirect && !att.d.indirect && dist(att, def) === 1 && canHit(def, att);
/* resolves an attack; returns {dmg, counter, killed, cKilled, promo} */
function attack(att, def, rnd = luckRoll) {
  const dmg = calcDamage(att, def, att.hp, rnd());
  if (att.d.sub) att.revealed = true;                    // the torpedo tracks point straight back at her
  def.hp -= dmg; charge(att.team, dmg * def.d.cost / 100 * .5); charge(def.team, dmg * def.d.cost / 100);
  G.stats[att.team].dmg += dmg;
  const res = {dmg, counter:0, killed:false, cKilled:false, promo:[]};
  if (def.hp <= 0) { res.killed = true; att.kills = (att.kills || 0) + 1; kill(def, att.team); const p = gainXp(att, dmg + 30); if (p) res.promo.push([att, p]); return res; }
  { const p = gainXp(att, dmg); if (p) res.promo.push([att, p]); }
  if (canCounter(def, att)) {
    const c = calcDamage(def, att, def.hp, rnd());
    att.hp -= c; res.counter = c; charge(def.team, c * att.d.cost / 100 * .5); charge(att.team, c * att.d.cost / 100);
    G.stats[def.team].dmg += c;
    if (att.hp <= 0) { res.cKilled = true; def.kills = (def.kills || 0) + 1; kill(att, def.team); }
    const p = gainXp(def, c + (res.cKilled ? 30 : 0)); if (p) res.promo.push([def, p]);
  }
  return res;
}
function kill(u, by) {
  G.units = G.units.filter(o => o !== u);
  G.stats[u.team].lost++; if (by) { G.stats[by].kills++; if (u.d.sub) (G.sunkSubs = G.sunkSubs || {})[by] = (G.sunkSubs[by] || 0) + 1; if (u.role === 'bb' || u.role === 'cv') (G.sunkBig = G.sunkBig || {})[by] = (G.sunkBig[by] || 0) + 1; }
  if (!u.d.foot) G.wrecks.push({x:u.x, y:u.y, nat:G.teams[u.team].nat, role:u.role, day:G.day, flip:u.team === 2, sea:!!u.d.sea || ['sea', 'river'].includes(terr(u.x, u.y))});
  const p = propAt(u.x, u.y); if (p && p.owner !== u.team) p.cap = 20;   // capture interrupted
  for (const c of u.cargo) G.stats[u.team].lost++;
  if (typeof zedRise === 'function') zedRise(u, by);                // Dead of Night: the fallen get up again
}

/* ---------- CO meter and powers ---------- */
const STAR = 9000;
function charge(team, v) {
  const T = G.teams[team], c = CO[T.co]; if (!c || T.power) return;
  T.meter = Math.min(c.scop.star * STAR * (1 + T.uses * .2), T.meter + v);
}
const starCost = (team, lv) => { const T = G.teams[team], c = CO[T.co]; return (lv === 2 ? c.scop.star : c.cop.star) * STAR * (1 + T.uses * .2); };
const canPower = (team, lv) => { const T = G.teams[team]; return !!CO[T.co] && !T.power && T.meter >= starCost(team, lv); };
/* returns a plan the UI animates: {p, heals, hurts:[{u,dmg}], strikes:[{x,y,r}], spawns:[u], again} */
function activatePower(team, lv) {
  const T = G.teams[team], p = lv === 2 ? CO[T.co].scop : CO[T.co].cop, out = {p, team, lv, heals:[], hurts:[], strikes:[], spawns:[]};
  T.meter -= starCost(team, lv); T.power = lv; T.uses++;
  if (p.heal) for (const u of G.units) if (u.team === team && u.hp < 100) { u.hp = Math.min(100, u.hp + p.heal * 10); out.heals.push(u); }
  if (p.hurt) for (const u of G.units) if (u.team !== team) { const d = Math.min(u.hp - 1, p.hurt * 10); if (d > 0) { u.hp -= d; out.hurts.push({u, dmg:d}); } }
  if (p.strike) {                                    // aimed bombardments: pick the densest, most valuable enemy clusters
    const s = p.strike, foes = G.units.filter(u => u.team !== team), hit = new Set();
    for (let i = 0; i < s.n; i++) {
      let best = null, bv = 0;
      for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) {
        let v = 0; for (const f of foes) if (!hit.has(f) && Math.abs(f.x - x) + Math.abs(f.y - y) <= s.r) v += f.d.cost * Math.min(f.hp, s.hp * 10) / 100;
        if (v > bv) { bv = v; best = {x, y}; }
      }
      if (!best) break;
      out.strikes.push({x:best.x, y:best.y, r:s.r, kind:s.kind});
      for (const f of foes) if (!hit.has(f) && Math.abs(f.x - best.x) + Math.abs(f.y - best.y) <= s.r) {
        hit.add(f); const d = Math.min(f.hp - 1, s.hp * 10); if (d > 0) { f.hp -= d; out.hurts.push({u:f, dmg:d}); }
      }
    }
  }
  if (p.spawn) {                                     // reinforcements or airborne drops
    const mine = G.units.filter(u => u.team === team), foes = G.units.filter(u => u.team !== team);
    const base = p.spawn.where === 'front' && mine.length && foes.length
      ? mine.reduce((b, u) => { const d = Math.min(...foes.map(f => dist(u, f))); return !b || d < b.d ? {u, d} : b; }, null).u
      : (props(team).find(q => terr(q.x, q.y) === 'hq') || props(team).find(q => TER[terr(q.x, q.y)].makes) || mine[0]);
    if (base) for (const role of p.spawn.roles) {
      const at = nearestFree(role, team, base.x, base.y); if (!at) continue;
      const u = spawn(team, {role, x:at[0], y:at[1], hp:100}); if (u) { u.done = false; u.moved = false; out.spawns.push(u); }
    }
  }
  if (p.again) out.again = p.again;
  return out;
}
/* "again" powers: a unit of the group that has finished may act once more */
function refreshAgain(u) {
  const T = G.teams[u.team], c = CO[T.co]; if (!T.power || !c) return false;
  const p = T.power === 2 ? c.scop : c.cop;
  if (!p.again || u.again || !inGroup(u.d, p.again)) return false;
  u.again = true; u.done = false; u.moved = false; return true;
}

/* ---------- capture and engineering ---------- */
function canCapture(u, x, y) { const p = propAt(x, y); return !!(u.d.cap && p && p.owner !== u.team); }
function capture(u) {
  const p = propAt(u.x, u.y); p.cap -= hpBars(u) * (u.d.capMul || 1);
  if (p.cap <= 0) {
    const prev = p.owner; p.owner = u.team; p.cap = 20; gainXp(u, 15);
    if (terr(p.x, p.y) === 'hq' && prev) endGame(u.team, 'hq');
    return {done:true, prev};
  }
  return {done:false};
}
function clearSpots(u, x, y) {
  if (!u.d.clears) return [];
  return [[x, y], ...DIRS.map(([dx, dy]) => [x + dx, y + dy])].filter(([a, b]) => inside(a, b) && TER[terr(a, b)].clear && !(unitAt(a, b) && unitAt(a, b).team !== u.team));
}
function clearTile(u, x, y) { const t = terr(x, y); setTerr(x, y, TER[t].clear); gainXp(u, 10); return t; }

/* ---------- difficulty: only ever applied to a computer-controlled side ---------- */
function aiEdge(team) { if (!G.teams[team].ai || G.teams[1].ai === G.teams[2].ai) return 0; return ({easy:-12, normal:0, hard:10}[G.diff || 'normal'] || 0) + (G.waves && team === 2 ? Math.min(25, G.waves.n * 2) : 0); }

/* ---------- digging in and bridging ---------- */
const canDig = d => !!(d.foot || (d.indirect && !d.sea && !d.air && !d.armour));
function settle(u) {
  if (canDig(u.d) && u.x === u.sx && u.y === u.sy && !['sea', 'river', 'marsh', 'reef', 'paddy'].includes(terr(u.x, u.y))) u.dug = true;
  const o = G.objective, inZone = z => z && u.x >= z[0] && u.y >= z[1] && u.x <= z[2] && u.y <= z[3];
  if (o.win === 'convoy' && u.team === 1 && u.role === o.role && inZone(o.exit)) { G.units = G.units.filter(x => x !== u); G.arrived++; return 'arrived'; }   // safe into harbour
  if (o.escape && u.team === 2 && u.role === o.role && inZone(o.escape)) { endGame(2, 'escape'); return 'escaped'; }
}
const zoneTiles = z => { const out = []; for (let y = z[1]; y <= z[3]; y++) for (let x = z[0]; x <= z[2]; x++) if (inside(x, y)) out.push([x, y]); return out; };
const BAILEY = 3000;
function bridgeSpots(u, x, y) {
  if (!u.d.clears) return [];
  return DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inside(a, b) && !unitAt(a, b) &&
    (terr(a, b) === 'bridge' || (terr(a, b) === 'river' && G.teams[u.team].funds >= BAILEY)));
}
function bridgeWork(u, x, y) {
  if (terr(x, y) === 'bridge') { setTerr(x, y, 'river'); gainXp(u, 15); return 'blown'; }
  G.teams[u.team].funds -= BAILEY; setTerr(x, y, 'bridge'); gainXp(u, 15); return 'built';
}

/* ---------- transport ---------- */
function unloadSpots(t, x, y, c) {
  return DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inside(a, b) && !unitAt(a, b) && moveCost(c.d, a, b) > 0);
}

/* ---------- turn flow ---------- */
function props(team) { return Object.values(G.props).filter(p => p.owner === team); }
function income(team) {
  let m = G.incomeMul[team] || 1;
  for (const e of effects(team)) if (e.income) m *= e.income;
  return Math.round(props(team).reduce((s, p) => s + (TER[terr(p.x, p.y)].income || 0), 0) * m);
}
function repairs(team) {
  const T = G.teams[team], out = [];
  for (const u of G.units) {
    if (u.team !== team) continue;
    const p = propAt(u.x, u.y); if (!p || p.owner !== team) continue;
    const t = terr(u.x, u.y);
    const ok = u.d.air ? t === 'air' : u.d.sea ? t === 'port' : ['city', 'hq', 'fact'].includes(t);
    if (!ok) continue;
    const add = Math.min(20, 100 - u.hp);
    if (add <= 0) continue;
    const cost = Math.round(u.d.cost * add / 100);
    if (T.funds >= cost) { T.funds -= cost; u.hp = Math.min(100, u.hp + add); out.push(u); }
  }
  return out;
}
function startTurn(team) {
  G.turn = team; const T = G.teams[team];
  T.power = 0;
  for (const u of G.units) if (u.team === team) { u.moved = false; u.done = false; u.again = false; u.sx = u.x; u.sy = u.y; u.revealed = false; }
  const gone = G.units.filter(u => u.team === team && u.d.carry && u.d.sea && u.landed && !u.cargo.length);   // empty landing craft go back to the fleet
  if (gone.length) G.units = G.units.filter(u => !gone.includes(u));
  T.funds += income(team);
  if (G.waves && team === 2 && typeof waveTick === 'function') waveTick();
  G.wrecks = G.wrecks.filter(w => G.day - w.day < 4);
  return {rep:repairs(team)};
}
function endTurn() {
  const next = enemyOf(G.turn);
  if (next === G.firstTeam) G.day++;
  return next;
}
function dueEvents() {
  const out = [];
  for (const e of G.events) if (!e.done && G.day >= e.day && G.turn === e.team) { e.done = true; out.push(e); }
  return out;
}
function runEvent(e) {
  const made = [];
  for (const s of placeSpecs(e.team, Array.isArray(e.spawn) ? e.spawn : parseUnits(e.spawn), G.day * 31)) {
    const u = spawn(e.team, s); if (u) made.push(u);
  }
  for (const u of made) { u.moved = false; u.done = false; }
  if (e.funds) G.teams[e.team].funds += e.funds;
  if (e.heal) for (const u of G.units) if (u.team === e.team) u.hp = Math.min(100, u.hp + e.heal * 10);
  if (e.hurt) for (const u of G.units) if (u.team === e.hurtTeam || (!e.hurtTeam && u.team !== e.team)) u.hp = Math.max(10, u.hp - e.hurt * 10);   // frostbite, typhus, an empty ammunition dump
  if (e.clear) for (const [x, y] of e.clear) if (inside(x, y) && TER[terr(x, y)].clear) setTerr(x, y, TER[terr(x, y)].clear);
  return made;
}
function nearestFree(role, team, x, y, maxR = 8) {
  const d = udef(G.teams[team].nat, role); if (!d) return null;
  if (inside(x, y) && !unitAt(x, y) && moveCost(d, x, y) && !TER[terr(x, y)].mines) return [x, y];
  for (let r = 1; r < maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const a = x + dx, b = y + dy; if (Math.abs(dx) + Math.abs(dy) !== r || !inside(a, b)) continue;
    if (!unitAt(a, b) && moveCost(d, a, b) && !TER[terr(a, b)].mines) return [a, b];
  }
  return null;
}
/* win/loss checks; returns winner or 0 */
function checkEnd() {
  if (G.over) return G.over.winner;
  for (const t of [1, 2]) {
    const mobile = G.units.some(u => u.team === t && !u.d.fixed);
    const any = G.units.some(u => u.team === t);
    if ((!any || (!mobile && t === 2 && G.objective.win !== 'survive' && false)) && (G.day > 1 || G.turn !== t) && !(G.waves && t === 2)) { endGame(enemyOf(t), 'rout'); return G.over.winner; }
  }
  const o = G.objective;
  if (o.win === 'kill' && G.day >= 1) {                 // sink / destroy every one of them, or o.n of them
    const left = G.units.filter(u => u.team === 2 && u.role === o.role).length;
    if (G.killTotal == null) G.killTotal = left;
    if (o.n ? G.killTotal - left >= o.n : !left) { endGame(1, 'kill'); return 1; }
  }
  if (o.protect && G.units.filter(u => u.team === 1 && u.role === o.protect).length < (o.protectN || 1)) { endGame(2, 'sunk'); return 2; }
  if (o.win === 'convoy') {
    if (G.arrived >= o.need) { endGame(1, 'convoy'); return 1; }
    if (G.arrived + G.units.filter(u => u.team === 1 && u.role === o.role).length < o.need) { endGame(2, 'sunk'); return 2; }
  }
  if (o.win === 'survive' && G.holdNeed && Object.values(G.props).filter(p => p.owner === 1).length < G.holdNeed) { endGame(2, 'overrun'); return 2; }   // a hold-out is lost when too much ground is
  if (o.win === 'survive' && G.day > o.days) { endGame(1, 'survive'); return 1; }
  if (o.limit && G.day > o.limit) { endGame(2, 'time'); return 2; }
  return 0;
}
function endGame(winner, why) { if (!G.over) G.over = {winner, why}; }
