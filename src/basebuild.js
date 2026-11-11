/* ============================== BASE BUILDING ===============================
   A turn-based, Command & Conquer-style mode for up to eight players: build a
   base inside the zone round your HQ, send lorries out to bring in the wheat,
   and destroy every enemy HQ. Design: docs/base-building-mode.md.

   Everything here is switched on only while G.bb exists. The mode reuses the
   engine, the art, the move planner and the turn loop: it wraps a handful of
   functions (the pattern desert.js and italy.js already use for drawTile and
   getPropSprite) instead of editing them, so every other mode runs exactly as
   before. Structures are fixed, unarmed units (a lesson from Neon Protocol,
   whose structures share the unit shape), so combat, fog, the forecast and
   the AI can see, hit and value them with no new rules.

   Sections: 1 rules and data · 2 maps · 3 setting up a game · 4 turn flow,
   harvest and construction · 5 engine and AI hooks · 6 the computer general ·
   7 drawing · 8 player interface · 9 setup screen · 10 headless test runner */

/* ---------- 1. rules and data ---------- */
const BB_S = {
  bbhq:   {n:'Headquarters',  cost:0,    val:20000, turns:0, fuel:6,  req:[],                arm:.6,  crew:1, mend:true, w:'Command post, signals and stores. Your build zone centres here', hpRegen:5},
  bbfuel: {n:'Fuel Dump',     cost:1500, val:3000,  turns:1, fuel:8,  req:[],                arm:.8,  w:'Jerrycans and fuel drums under camouflage netting'},
  bbdepot:{n:'Supply Depot',  cost:3500, val:6000,  turns:2, fuel:-2, req:[],                arm:.7,  makes:['harv'], w:'Granary and loading bay. Lorries unload grain beside it'},
  bbbarr: {n:'Barracks',      cost:2500, val:4000,  turns:1, fuel:-2, req:[],                arm:.7,  makes:['inf', 'eng', 'at', 'mortar'], w:'Nissen huts and a drill square'},
  bbworks:{n:'Vehicle Works', cost:6000, val:8000,  turns:2, fuel:-4, req:['bbdepot'],       arm:.65, makes:['recon', 'apc', 'tank', 'mtank', 'htank', 'art', 'rkt', 'aa'], w:'Workshops, a gantry crane and a vehicle park'},
  bbeng:  {n:'Engineer Yard', cost:5000, val:7000,  turns:2, fuel:-3, req:['bbbarr'],        arm:.7,  crew:1, mend:true, w:'A second construction crew, and the know-how for heavy armour, rockets, anti-tank guns and the airfield'},
  bbair:  {n:'Airfield',      cost:8000, val:10000, turns:3, fuel:-5, req:['bbworks', 'bbeng'], arm:.65, makes:['ftr', 'bmr'], w:'A grass strip, a hangar and a windsock'},
  nest:   {n:'MG Nest',       cost:1500, turns:1, fuel:-1, req:['bbbarr'], unit:true},
  pak:    {n:'Anti-tank Gun', cost:4000, turns:1, fuel:-2, req:['bbeng'], unit:true},
};
const BB_ORDER = ['bbfuel', 'bbdepot', 'bbbarr', 'bbworks', 'bbeng', 'bbair', 'nest', 'pak'];
const BB_TIER2 = new Set(['mtank', 'htank', 'rkt']);                 // need an Engineer Yard
const BB = {seatBonus:1500, hqIncome:1000, gmax:3000, regrow:100, harvCap:2000, harvRate:1000, mendHP:20, save:'if44bb1', budget:2500};
const BB_COLS = ['#d63a2e', '#3a7ad8', '#e8c040', '#4aa84a', '#f2f2ea', '#9a4ac8', '#e07a2a', '#38c0c0'];
const BB_COLN = ['Red', 'Blue', 'Gold', 'Green', 'White', 'Purple', 'Orange', 'Teal'];
/* the period lorry each army sends out with a forage party */
const BB_LORRY = {ger:'Opel Blitz 3.6-36S', us:'GMC CCKW 353', uk:'Bedford OY', su:'ZiS-5', fr:'GMC CCKW 353', it:'Fiat 626', jp:'Isuzu Type 94', pl:'Polski Fiat 621'};
const BB_UNITS = ['inf', 'eng', 'at', 'mortar', 'recon', 'apc', 'tank', 'mtank', 'htank', 'art', 'rkt', 'aa', 'ftr', 'bmr'];

/* new roles: the lorry and the buildings. They live only in this mode's games (names come from G.uover) */
ROLE.harv = {mt:'tire', mv:6, cost:2000, rng:[0, 0], harv:true};
for (const [k, s] of Object.entries(BB_S)) if (!s.unit) ROLE[k] = {mt:'none', mv:0, cost:s.val, rng:[0, 0], fixed:true, struct:true, arm:s.arm};
/* who damages lorries and buildings, and how much: lorries are soft-skinned, buildings take what a dug-in gun takes */
for (const [att, row] of Object.entries(DMG)) {
  row.harv = Math.round(Math.max((row.apc || 0) * 1.1, (row.inf || 0) * .6));
  const b = att === 'ftr' ? 8 : (row.pak || 0);
  for (const k of Object.keys(BB_S)) if (!BB_S[k].unit) row[k] = b;
}

const isBB = () => !!(typeof G !== 'undefined' && G && G.bb);
const bbAllied = (a, b) => a === b || !!(G.bb.team[a] && G.bb.team[a] === G.bb.team[b]);
const bbFoe = (a, b) => a !== b && !(G && G.bb && bbAllied(a, b));
const bbAlive = t => !!G.bb && G.bb.seats.includes(t) && !G.bb.out[t];
const bbHQ = t => G.units.find(u => u.team === t && u.role === 'bbhq');
const bbDone = u => !u.left;                                           // built (not a site still under construction)
const bbOwn = (t, role) => G.units.filter(u => u.team === t && u.role === role && bbDone(u));
const bbHas = (t, role) => G.units.some(u => u.team === t && u.role === role && bbDone(u));
const bbIsStructLike = u => !!(u.d && (u.d.struct || (u.left > 0)));
const bbCount = t => G.units.filter(u => u.team === t && !u.d.fixed).length;
function bbFuel(t) {
  let prod = 0, use = 0;
  for (const u of G.units) if (u.team === t && bbDone(u)) { const s = BB_S[u.role]; if (!s) continue; if (s.fuel > 0) prod += s.fuel; else use -= s.fuel; }
  return {prod, use, low:use > prod};
}
function bbCrews(t) {
  const crews = G.units.filter(u => u.team === t && BB_S[u.role] && BB_S[u.role].crew && bbDone(u)).length;
  const busy = G.units.filter(u => u.team === t && u.left > 0).length;
  return {crews, busy, free:crews - busy};
}
/* the build zone is a square round the HQ; Supply Depots may go further out (forward depots reach the shared fields) */
const BB_DEPOT_REACH = 4;
const bbInZone = (t, x, y, type) => { const h = bbHQ(t); return !!h && Math.max(Math.abs(h.x - x), Math.abs(h.y - y)) <= G.bb.zone + (type === 'bbdepot' ? BB_DEPOT_REACH : 0); };
const BB_GROUND = new Set(['plain', 'road', 'hill', 'ruins']);
function bbCanPlaceAt(t, type, x, y) {
  if (!inside(x, y) || unitAt(x, y) || !BB_GROUND.has(terr(x, y)) || !bbInZone(t, x, y, type)) return false;
  if (BB_S[type].unit) return true;
  return DIRS.some(([dx, dy]) => inside(x + dx, y + dy) && !unitAt(x + dx, y + dy) && moveCost({mt:'tread'}, x + dx, y + dy) > 0);   // a building needs a way out
}
function bbPlaceTiles(t, type) { const out = []; for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (bbCanPlaceAt(t, type, x, y)) out.push([x, y]); return out; }
/* why a building cannot be ordered now ('' = it can) */
function bbLock(t, type) {
  const s = BB_S[type];
  if (!bbHQ(t)) return 'no HQ';
  const miss = s.req.filter(r => !bbHas(t, r)); if (miss.length) return 'needs ' + miss.map(r => BB_S[r].n).join(' and ');
  if (bbCrews(t).free <= 0) return 'crews busy';
  if (s.cost > G.teams[t].funds) return 'need ' + fmt(s.cost);
  return '';
}
function bbPlace(t, type, x, y) {
  const s = BB_S[type], T = G.teams[t];
  T.funds -= s.cost; G.bb.spent[t] = (G.bb.spent[t] || 0) + s.cost;
  const u = spawn(t, {role:type, x, y, hp:100, name:s.n});
  u.left = s.turns + (bbFuel(t).low ? 1 : 0); u.done = u.moved = true; u.face = 1;
  if (!FAST) { sfx('build'); fxDust(...T2W(x, y), 8); fxText(x, y, `${s.n}: ${u.left} turn${u.left === 1 ? '' : 's'}`, '#f0d060', 1800); }
  return u;
}
/* units a building can make now, and why not */
function bbProdList(t, s) { return (BB_S[s.role].makes || []).filter(r => udef(G.teams[t].nat, r) && !udef(G.teams[t].nat, r).fixed); }
function bbProdLock(t, s, role) {
  if (!bbDone(s)) return 'under construction';
  if (s.used) return 'already made a unit this turn';
  if (BB_TIER2.has(role) && !bbHas(t, 'bbeng')) return 'needs an Engineer Yard';
  if (bbCount(t) >= G.bb.cap) return `unit limit (${G.bb.cap})`;
  if (bbFuel(t).low && s.role !== 'bbdepot' && G.day % 2) return 'low fuel: even days only';
  if (unitCost(t, role) > G.teams[t].funds) return 'need ' + fmt(unitCost(t, role));
  if (!bbExit(s, role)) return 'way out blocked';
  return '';
}
function bbExit(s, role) {
  const d = udef(G.teams[s.team].nat, role); if (!d) return null;
  for (let r = 1; r <= 2; r++) for (const [dx, dy] of r === 1 ? DIRS : [[2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const x = s.x + dx, y = s.y + dy; if (inside(x, y) && !unitAt(x, y) && moveCost(d, x, y) > 0) return [x, y]; }
  return null;
}
function bbProduce(t, s, role) {
  const at = bbExit(s, role); if (!at) return null;
  const c = unitCost(t, role); G.teams[t].funds -= c; G.bb.spent[t] = (G.bb.spent[t] || 0) + c;
  const u = spawn(t, {role, x:at[0], y:at[1], hp:100}); u.done = u.moved = true; u.bought = true; s.used = true;
  if (role === 'harv') u.grain = 0;
  (G.bb.made[t] = G.bb.made[t] || {})[role] = (G.bb.made[t][role] || 0) + 1;
  if (!FAST) { sfx('build'); fx('smoke', at[0], at[1]); }
  return u;
}
function bbScore(t) {
  let s = G.teams[t].funds * .5;
  for (const u of G.units) if (u.team === t) s += (u.d.struct ? (BB_S[u.role].val || 0) : u.d.cost) * u.hp / 100;
  return Math.round(s + G.stats[t].kills * 500);
}

/* ---------- 2. maps: painted in one fundamental region, then copied round the map's symmetry group ---------- */
const BB_SYM = {
  rot2:(W, H) => ({T:[(x, y) => [x, y], (x, y) => [W - 1 - x, H - 1 - y]], dom:(x, y) => y < H / 2}),
  rot4:(W, H) => ({T:[(x, y) => [x, y], (x, y) => [W - 1 - y, x], (x, y) => [W - 1 - x, H - 1 - y], (x, y) => [y, H - 1 - x]], dom:(x, y) => x < W / 2 && y < H / 2}),
  d4:(W, H) => ({T:[(x, y) => [x, y], (x, y) => [W - 1 - y, x], (x, y) => [W - 1 - x, H - 1 - y], (x, y) => [y, H - 1 - x],
    (x, y) => [W - 1 - x, y], (x, y) => [x, H - 1 - y], (x, y) => [y, x], (x, y) => [W - 1 - y, H - 1 - x]], dom:(x, y) => x < W / 2 && y < H / 2 && y <= x}),
};
function bbPainter(W, H, seed) {
  const g = Array.from({length:H}, () => Array(W).fill('.')), R = rngSeed(seed);
  const P = {g, R, W, H,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; },
    rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) P.set(x, y, c); },
    blob(cx, cy, r, c, keep = '') { for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { const d = Math.hypot(x - cx, y - cy); if (d <= r - .3 + R() * .6 && !keep.includes((g[y] || [])[x])) P.set(x, y, c); } },
    road(pts, c = '=') { for (let i = 1; i < pts.length; i++) { let [x, y] = pts[i - 1]; const [bx, by] = pts[i]; P.set(x, y, c);
      while (x !== bx || y !== by) { if (x !== bx) x += Math.sign(bx - x); else y += Math.sign(by - y); P.set(x, y, (g[y] || [])[x] === 'r' ? 'b' : c); } } },
  };
  return P;
}
function bbBuildMap(def) {
  const {W, H} = def, P = bbPainter(W, H, def.seed || 7); def.paint(P);
  const S = BB_SYM[def.sym](W, H), rows = [];
  for (let y = 0; y < H; y++) { let r = ''; for (let x = 0; x < W; x++) {
    let best = null; for (const f of S.T) { const [a, b] = f(x, y); if (S.dom(a, b) && (!best || b * W + a < best[1] * W + best[0])) best = [a, b]; }
    r += P.g[best[1]][best[0]]; } rows.push(r); }
  const seen = new Set(), starts = [];                                  // every image of the start, seated clockwise from the top left
  for (const f of S.T) { const [a, b] = f(def.start[0], def.start[1]); if (!seen.has(a + ',' + b)) { seen.add(a + ',' + b); starts.push([a, b]); } }
  const cx = (W - 1) / 2, cy = (H - 1) / 2, ang = ([x, y]) => (Math.atan2(y - cy, x - cx) + Math.PI * 1.25) % (Math.PI * 2);
  starts.sort((p, q) => ang(p) - ang(q));
  return {rows, starts};
}
/* the clear ground and road round each HQ, so every base has room for the same buildings */
function bbClearBase(P, x, y, r = 3) { for (let b = y - r; b <= y + r; b++) for (let a = x - r; a <= x + r; a++) if ((P.g[b] || [])[a] !== undefined && !'=b'.includes(P.g[b][a])) P.set(a, b, '.'); }
const BB_MAPS = [
  {id:'beauce', n:'Beauce Wheatlands', seats:2, W:30, H:20, sym:'rot2', theme:'normandy', cap:40, zone:6, start:[4, 5], seed:11,
    blurb:'Two players. The granary of France: open wheat country, home fields behind each base, a stream with three crossings and a rich harvest in the middle.',
    paint(P) {
      P.blob(7, 1, 1.6, 'T'); P.blob(10, 3, 1.2, 'T'); P.blob(2, 8, 1.5, 'T'); P.blob(18, 4, 1.8, 'T'); P.blob(22, 1, 1.3, 'T'); P.blob(25, 7, 1.4, 'T');
      P.set(12, 1, '^'); P.set(20, 8, '^'); P.set(21, 8, '^'); P.set(9, 7, '^');
      for (let y = 0; y < 10; y++) P.set(14, y, 'r');                    // the stream (the half-turn makes it jog at the middle: a ford)
      bbClearBase(P, 4, 5);
      P.rect(1, 1, 3, 2, ','); P.rect(1, 3, 2, 3, ',');                 // home fields, behind the base
      P.rect(8, 0, 10, 1, ','); P.rect(5, 9, 8, 9, ',');                // flank fields
      P.rect(11, 7, 13, 9, ','); P.rect(16, 0, 18, 2, ',');            // the rich middle, and a field over the stream
      P.rect(0, 9, 1, 9, 'h'); P.rect(4, 8, 4, 9, 'h'); P.rect(11, 6, 13, 6, 'h');
      P.road([[4, 5], [12, 5], [12, 9], [16, 9]]); P.road([[8, 2], [8, 5]]); P.road([[8, 2], [20, 2], [20, 6], [27, 6]]);
    }},
  {id:'kuban', n:'Kuban Steppe', seats:4, W:34, H:34, sym:'rot4', theme:'steppe', cap:30, zone:6, start:[5, 5], seed:23,
    blurb:'Four players. Rolling grain steppe: bases in the corners on a ring road, a shared field between each pair of neighbours and a crossroads farm in the middle.',
    paint(P) {
      P.blob(10, 2, 1.6, 'T'); P.blob(2, 11, 1.4, 'T'); P.blob(12, 12, 1.4, 'T'); P.blob(9, 15, 1.2, '^'); P.blob(15, 9, 1.0, 'T');
      P.set(11, 7, '^'); P.set(7, 11, '^'); P.set(14, 2, '^');
      bbClearBase(P, 5, 5);
      P.rect(0, 0, 2, 2, ','); P.rect(3, 0, 4, 1, ',');                // home fields in the corner
      P.rect(15, 1, 16, 3, ','); P.rect(1, 15, 3, 16, ',');            // shared with the neighbours either side
      P.rect(13, 13, 16, 16, ','); P.set(16, 16, 'x'); P.set(15, 16, 'x');   // the crossroads farm in the middle
      P.road([[5, 5], [16, 5]]); P.road([[5, 5], [5, 16]]); P.road([[5, 5], [8, 5], [8, 8], [11, 8], [11, 11], [14, 11], [14, 12], [16, 12]]);
      P.road([[12, 12], [12, 16]]);
    }},
  {id:'alfold', n:'Great Hungarian Plain', seats:8, W:48, H:48, sym:'d4', theme:'holland', cap:20, zone:5, start:[14, 4], seed:41,
    blurb:'Eight players. The Alföld: two bases on each side of a square plain, a field shared with each neighbour, a ring road and a great harvest at the centre.',
    paint(P) {
      P.blob(20, 2, 1.4, 'T'); P.blob(9, 4, 1.2, 'T'); P.blob(17, 12, 1.6, 'T'); P.blob(23, 15, 1.2, '^'); P.blob(13, 10, 1.0, 'v');
      P.set(6, 2, '^'); P.set(19, 7, '^');
      bbClearBase(P, 14, 4);
      P.rect(11, 0, 17, 1, ',');                                       // home fields, against the edge
      P.rect(21, 2, 23, 5, ',');                                       // shared with the base across the side's middle
      P.rect(7, 6, 10, 9, ',');                                        // shared with the base round the corner
      P.rect(19, 19, 23, 23, ','); P.rect(16, 16, 18, 18, ',');       // the great central harvest
      P.road([[9, 9], [23, 9]]); P.road([[14, 4], [14, 9]]);
      for (let k = 9; k < 23; k++) { P.set(k, k, '='); P.set(k + 1, k, '='); }
    }},
];
const BB_MAP = id => BB_MAPS.find(m => m.id === id);
const BB_BUILT = {};
const bbMapData = id => BB_BUILT[id] || (BB_BUILT[id] = bbBuildMap(BB_MAP(id)));
/* which seats to use when fewer players than starts: spread round the map */
function bbSeatStarts(id, n) { const st = bbMapData(id).starts; if (n >= st.length) return st.slice(); return Array.from({length:n}, (_, i) => st[Math.round(i * st.length / n) % st.length]); }

/* ---------- 3. setting up a game ---------- */
function bbNations() {
  return Object.keys(NATION).filter(n => n !== 'zed' && !NATION[n].zed && (CO_BY_NAT[n] || CO_BY_NAT[natBase(n)] || []).length
    && ['inf', 'at', 'tank', 'art', 'recon'].every(r => NATION[n].u[r]) && BB_UNITS.filter(r => NATION[n].u[r]).length >= 11);
}
const bbGenerals = nat => CO_BY_NAT[nat] || CO_BY_NAT[natBase(nat)] || [];
/* cfg: {map, players:[{nat, co, ai:false|'normal'|'hard', team:''|'A'..}], funds, fog, limit} */
function bbNewGame(cfg) {
  const def = BB_MAP(cfg.map), md = bbMapData(cfg.map), pl = cfg.players.filter(p => p), n = pl.length, starts = bbSeatStarts(cfg.map, n);
  /* moving later costs tempo: in AI-against-AI tests the first seat of a two-player game won 71% of mirrored games, so each later seat starts with a little more */
  const bonus = i => n > 1 ? Math.round((cfg.seatBonus ?? BB.seatBonus) * i / (n - 1) / 100) * 100 : 0;
  const teams = {}; pl.forEach((p, i) => { teams[i + 1] = {nat:p.nat, co:p.co || bbGenerals(p.nat)[0], funds:cfg.funds + bonus(i), ai:!!p.ai}; });
  newGame({map:md.rows, theme:def.theme, teams:{1:teams[1], 2:teams[2] || teams[1]}, units:{}, objective:{win:'bb'}, fog:!!cfg.fog, clock:{start:'1944-07-01T06:00', step:1440}, weather:'clear'});
  G.firstTeam = 1;
  for (let t = 3; t <= n; t++) { G.teams[t] = {nat:teams[t].nat, co:teams[t].co, funds:teams[t].funds, ai:teams[t].ai, meter:0, power:0, uses:0}; G.stats[t] = {kills:0, lost:0, dmg:0}; }
  if (n < 2) { delete G.teams[2]; }
  G.aiMem = {}; G.persona = {}; G.uover = {};
  const B = G.bb = {v:1, map:cfg.map, n, seats:[], start:{}, team:{}, col:{}, diff:{}, out:{}, inc:{}, ai:{}, spent:{}, made:{}, aiMs:{}, maxMs:{}, grain:{},
    zone:def.zone, cap:def.cap, limit:+cfg.limit || 0, lastHuman:0, grownDay:0, funds:cfg.funds};
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (terr(x, y) === 'field') B.grain[K(x, y)] = BB.gmax;
  pl.forEach((p, i) => { const t = i + 1; B.seats.push(t); B.start[t] = starts[i]; B.team[t] = p.team || ''; B.col[t] = p.col != null ? BB_COLS[p.col] : BB_COLS[i]; B.diff[t] = p.ai || '';
    G.aiMem[t] = {}; B.ai[t] = {mode:'mass', target:0}; B.inc[t] = {hq:0, grain:0}; if (p.ai) G.persona[t] = 'methodical';
    bbUover(G.teams[t].nat); });
  for (const t of B.seats) {                                           // HQ, two riflemen and an anti-tank team, set the same way round every base
    const [x, y] = B.start[t], dx = Math.sign((G.W - 1) / 2 - x) || 1, dy = Math.sign((G.H - 1) / 2 - y) || 1;
    const hq = spawn(t, {role:'bbhq', x, y, hp:100, name:'Headquarters'}); hq.face = 1;
    for (const [role, ox, oy] of [['inf', dx, 0], ['inf', 0, dy], ['at', dx, dy]]) { const at = nearestFree(role, t, x + ox, y + oy); if (at) spawn(t, {role, x:at[0], y:at[1], hp:100}); }
  }
  return G;
}
function bbUover(nat) {
  const o = G.uover[nat] = G.uover[nat] || {}, base = natBase(nat), infSnd = (NATION[nat].u.inf || {}).snd || 'bren';
  o.harv = {n:BB_LORRY[nat] || BB_LORRY[base] || 'Requisitioned Lorry', w:'Forage party: cuts and carries 2,000 of grain', shape:'bblorry', snd:infSnd};
  for (const [k, s] of Object.entries(BB_S)) if (!s.unit) o[k] = {n:s.n, w:s.w, shape:k, snd:infSnd};
  if (!NATION[nat].u.nest) o.nest = {n:'MG Nest', w:'Machine gun in a sandbagged pit', snd:infSnd, shape:'nest'};
  if (!NATION[nat].u.pak) o.pak = {n:'Anti-tank Gun Position', w:'Anti-tank gun, dug in', snd:'gun50', shape:'casemate'};
}

/* ---------- 4. turn flow: the harvest, construction, repairs and income at the start of each turn ---------- */
const bbFieldAt = (x, y) => terr(x, y) === 'field' && (G.bb.grain[K(x, y)] || 0) >= 300;   // a field cut down to stubble is not worth stopping on
const bbDepotNear = u => G.units.find(s => s.team === u.team && s.role === 'bbdepot' && bbDone(s) && dist(s, u) === 1);
function bbStartTurn(team) {
  const B = G.bb, T = G.teams[team], inc = B.inc[team] = {hq:0, grain:0, done:[], harv:[]};
  if (B.grownDay !== G.day) { B.grownDay = G.day; for (const k of Object.keys(B.grain)) B.grain[k] = Math.min(BB.gmax, B.grain[k] + BB.regrow); }
  if (bbHQ(team)) { T.funds += BB.hqIncome; inc.hq = BB.hqIncome; }
  for (const u of G.units.filter(o => o.team === team && o.left > 0)) {     // construction
    if (--u.left > 0) continue;
    u.left = 0; inc.done.push(u.role);
    if (u.role === 'bbdepot') { const at = bbExit(u, 'harv'); if (at) { const h = spawn(team, {role:'harv', x:at[0], y:at[1], hp:100}); h.grain = BB.harvCap / 2; h.done = h.moved = true; } }   // a depot ships with a lorry, half loaded (Neon v0.6.4)
    if (!FAST) { fxText(u.x, u.y, `${BB_S[u.role].n} ready`, '#9ae07a', 1800); sfx('capture'); }
  }
  for (const u of G.units) if (u.team === team) {
    if (u.d.struct || u.left > 0) { u.done = u.moved = true; u.used = false; if (bbDone(u) && u.hp < 100 && BB_S[u.role] && u.role !== 'bbhq' && !(u.hitDay >= G.day - 1)) u.hp = Math.min(100, u.hp + 5); }
  }
  { const h = bbHQ(team); if (h && h.hp < 100 && !(h.hitDay >= G.day - 1)) h.hp = Math.min(100, h.hp + BB_S.bbhq.hpRegen); }   // only when left alone for a day
  for (const u of G.units) if (u.team === team && !u.d.struct && !u.d.fixed && u.hp < 100) {   // units beside the HQ or an Engineer Yard are patched up
    if (!G.units.some(s => s.team === team && BB_S[s.role] && BB_S[s.role].mend && bbDone(s) && dist(s, u) === 1)) continue;
    const add = Math.min(BB.mendHP, 100 - u.hp), cost = Math.round(u.d.cost * add / 100);
    if (T.funds >= cost) { T.funds -= cost; u.hp += add; if (!FAST) fxText(u.x, u.y, '+repair', '#9ae07a'); }
  }
  for (const u of G.units.filter(o => o.team === team && o.role === 'harv')) { const g = bbHarvest(u); inc.grain += g; }
  T.funds += inc.grain;
  if (G.teams[team].ai) bbAiPlan(team);
  B.aiMs[team] = 0;
  if (!G.teams[team].ai) B.lastHuman = team;
}
/* a lorry runs itself: unload beside a depot, cut grain where it stands, or drive to the nearest grain (or home when full) */
function bbHarvest(u) {
  u.done = u.moved = true; u.grain = u.grain || 0;
  const deliver = () => { const g = u.grain; if (!g) return 0; u.grain = 0; if (!FAST) { fxText(u.x, u.y, `+${fmt(g)} grain`, '#f0d060', 1600); sfx('capture'); } G.bb.harvested = (G.bb.harvested || 0) + g; return g; };
  const cut = () => { const k = K(u.x, u.y), a = Math.min(BB.harvRate, BB.harvCap - u.grain, G.bb.grain[k] || 0); if (a <= 0) return; u.grain += a; G.bb.grain[k] -= a; if (!FAST) fxDust(...T2W(u.x, u.y), 4, '200,180,110'); };
  if (u.grain > 0 && bbDepotNear(u) && (u.grain >= BB.harvCap || !bbFieldAt(u.x, u.y))) return deliver();
  if (u.grain < BB.harvCap && bbFieldAt(u.x, u.y)) { cut(); return 0; }
  const depots = G.units.filter(s => s.team === u.team && s.role === 'bbdepot' && bbDone(s));
  const full = u.grain >= BB.harvCap || (u.grain > 0 && !Object.values(G.bb.grain).some(v => v > 0));
  let goals = [];
  if (full) { for (const s of depots) for (const [dx, dy] of DIRS) { const x = s.x + dx, y = s.y + dy; if (inside(x, y) && moveCost(u.d, x, y) && (!unitAt(x, y) || unitAt(x, y) === u)) goals.push([x, y]); } }
  else {                                                               // the best grain for the trip: what it can load, against the drive out and the drive back to a depot
    const from = distField(u.d.mt, [[u.x, u.y]]), back = depots.length ? distField(u.d.mt, depots.map(s => [s.x, s.y])) : null, need = BB.harvCap - u.grain, cand = [];
    for (const [k, v] of Object.entries(G.bb.grain)) { if (v < 300) continue; const x = k % 1000, y = Math.floor(k / 1000), o = unitAt(x, y); if (o && o !== u) continue;
      const i = y * G.W + x, trip = from[i] + (back ? back[i] : 0); if (trip >= 1e8) continue;
      cand.push([x, y, Math.min(v, need) / (trip + 8)]); }
    cand.sort((p, q) => q[2] - p[2]); const top = cand.length ? cand[0][2] : 0;
    goals = cand.filter(c => c[2] >= top * .85).slice(0, 6).map(c => [c[0], c[1]]);
  }
  if (!goals.length) return 0;
  const f = distField(u.d.mt, goals), r = reach(u); let best = null, bs = Infinity;
  for (const n of r.values()) { if (!canStop(u, n.x, n.y) || (unitAt(n.x, n.y) && unitAt(n.x, n.y) !== u)) continue; const v = f[n.y * G.W + n.x] + (n.x === u.x && n.y === u.y ? .5 : 0) + Math.random() * .01; if (v < bs) { bs = v; best = n; } }
  if (best && (best.x !== u.x || best.y !== u.y)) { if (!FAST) fxDust(...T2W(u.x, u.y), 3); if (best.x !== u.x) u.face = Math.sign(best.x - u.x); u.x = best.x; u.y = best.y; u.dug = false; }
  if (u.grain > 0 && bbDepotNear(u) && (full || !bbFieldAt(u.x, u.y))) return deliver();
  if (!full && bbFieldAt(u.x, u.y)) cut();
  return 0;
}
function bbNextSeat() {
  const s = G.bb.seats.filter(t => !G.bb.out[t]); if (!s.length) return G.turn;
  const next = s.find(t => t > G.turn) || s[0];
  if (next <= G.turn) G.day++;
  return next;
}
/* a side whose HQ has fallen is out: its army surrenders and its buildings are abandoned */
function bbEliminate(t) {
  const B = G.bb; if (B.out[t]) return; B.out[t] = G.day;
  const by = G.turn !== t && G.teams[G.turn] ? G.turn : 0; if (by) { B.spoils = B.spoils || {}; B.spoils[by] = (B.spoils[by] || 0) + G.teams[t].funds; G.teams[by].funds += G.teams[t].funds; }   // the victor takes the war chest
  G.teams[t].funds = 0;
  const gone = G.units.filter(u => u.team === t);
  if (!FAST) { for (const u of gone.filter(u => u.d.struct)) fxExplosion(u.x, u.y, 1.2, {crater:false}); const h = B.start[t]; fxText(h[0], h[1], `${NATION[G.teams[t].nat].n} (${bbColName(t)}) is out`, '#ff8a6a', 2600); sfx('boom'); shakeCam(8); }
  G.units = G.units.filter(u => u.team !== t);
}
const bbColName = t => BB_COLN[BB_COLS.indexOf(G.bb.col[t])] || 'Side ' + t;
const bbSideKey = t => G.bb.team[t] ? 'T' + G.bb.team[t] : 'P' + t;
function bbCheckEnd() {
  if (G.over) return G.over.winner;
  const B = G.bb;
  for (const t of B.seats) if (!B.out[t] && !bbHQ(t)) bbEliminate(t);
  const alive = B.seats.filter(t => !B.out[t]), sides = [...new Set(alive.map(bbSideKey))];
  if (sides.length <= 1) { endGame(alive[0] || B.seats[0], 'hq'); return G.over.winner; }
  if (B.limit && G.day > B.limit) {
    const tot = {}; for (const t of alive) tot[bbSideKey(t)] = (tot[bbSideKey(t)] || 0) + bbScore(t);
    const best = Object.entries(tot).sort((a, b) => b[1] - a[1])[0][0]; endGame(alive.find(t => bbSideKey(t) === best), 'score'); return G.over.winner;
  }
  return 0;
}

/* ---------- 5. engine and AI hooks: each one steps aside unless a base-building game is running ---------- */
startTurn = (o => function (team) { const r = o.apply(this, arguments); if (isBB()) bbStartTurn(team); return r; })(startTurn);
endTurn = (o => function () { return isBB() ? bbNextSeat() : o.apply(this, arguments); })(endTurn);
checkEnd = (o => function () { return isBB() ? bbCheckEnd() : o.apply(this, arguments); })(checkEnd);
effects = (o => function (team) { if (!G.teams[team]) return []; return o.apply(this, arguments); })(effects);
charge = (o => function () { if (isBB()) return; return o.apply(this, arguments); })(charge);   // generals' powers are off in this mode
attack = (o => function (a, d) { const r = o.apply(this, arguments); if (isBB() && d) d.hitDay = G.day; return r; })(attack);
/* the harvest war pays: a lorry destroyed gives up its load and a bounty of 1,000 (Neon v0.6.1), a building a quarter of its value in salvage */
kill = (o => function (u, by) {
  if (isBB() && by && G.teams[by] && bbFoe(by, u.team)) { const g = u.role === 'harv' ? (u.grain || 0) + 1000 : u.d.struct ? Math.round((BB_S[u.role].val || 0) * .25) : 0;
    if (g) { G.teams[by].funds += g; if (!FAST) fxText(u.x, u.y, `+${fmt(g)} ${u.role === 'harv' ? 'bounty' : 'salvage'}`, '#f0d060', 1800); } }
  return o.apply(this, arguments);
})(kill);
aiEdge = (o => function (team) { if (!isBB()) return o.apply(this, arguments); return G.teams[team] && G.teams[team].ai && G.bb.diff[team] === 'hard' ? 5 : 0; })(aiEdge);
canHit = (o => function (a, d) { if (isBB() && (a.left > 0 || !bbFoe(a.team, d.team))) return false; return o.apply(this, arguments); })(canHit);
targetsFrom = (o => function (u) { const r = o.apply(this, arguments); return isBB() ? r.filter(t => bbFoe(u.team, t.team)) : r; })(targetsFrom);
aiFoes = (o => function (team) { const r = o.apply(this, arguments); return isBB() ? r.filter(t => bbFoe(team, t.team)) : r; })(aiFoes);
aiKnown = (o => function (team) {
  if (!isBB()) return o.apply(this, arguments);
  const r = o.apply(this, arguments).filter(t => bbFoe(team, t.team)), have = new Set(r.map(u => u.id));
  for (const t of G.bb.seats) if (bbFoe(team, t)) { const h = bbHQ(t); if (h && !have.has(h.id)) r.push(h); }   // where every base is, like any skirmish map
  return r;
})(aiKnown);
enemyHQ = (o => function (team) { if (!isBB()) return o.apply(this, arguments); const a = G.bb.ai[team]; if (!a || a.mode !== 'attack') return []; const h = bbHQ(a.target); return h ? [h] : []; })(enemyHQ);
aiGoals = (o => function (team, u) { return isBB() ? bbAiGoals(team, u) : o.apply(this, arguments); })(aiGoals);
aiBuild = (o => function (team) { if (!isBB()) return o.apply(this, arguments); try { return bbAiEconomy(team); } catch (e) { console.error('base AI failed', e); return []; } })(aiBuild);
aiNext = (o => function (team, cache) {
  if (!isBB()) return o.apply(this, arguments);
  const B = G.bb;
  if ((B.aiMs[team] || 0) > B.budget) { for (const u of G.units) if (u.team === team) u.done = true; B.cut = (B.cut || 0) + 1; return null; }   // out of time: the rest hold, the turn ends
  const t0 = performance.now();
  if (cache.odds == null) {                                            // the planner's courage: our army against the enemy it is fighting
    const val = t => G.units.reduce((s, x) => s + (x.team === t && !x.d.struct ? x.d.cost * x.hp / 100 : 0), 0), a = B.ai[team];
    const foes = B.seats.filter(t => bbAlive(t) && bbFoe(team, t));
    cache.odds = val(team) / Math.max(1, a && a.target && bbAlive(a.target) ? val(a.target) : foes.reduce((s, t) => s + val(t), 0) / Math.max(1, foes.length)); }
  const r = o.apply(this, arguments), ms = performance.now() - t0;
  B.aiMs[team] = (B.aiMs[team] || 0) + ms; B.maxMs[team] = Math.max(B.maxMs[team] || 0, B.aiMs[team]);
  return r;
})(aiNext);
viewerTeam = (o => function () {
  if (!isBB()) return o.apply(this, arguments);
  const hum = G.bb.seats.filter(t => !G.teams[t].ai && !G.bb.out[t]);
  if (!hum.length) return 0; if (hum.length === 1) return hum[0];
  return !G.teams[G.turn].ai ? G.turn : G.bb.lastHuman || hum[0];
})(viewerTeam);
/* hot-seat: only people get the hand-over screen, named by their colour as two of them may share an army */
handoff = (o => function (team) {
  if (!isBB()) return o.apply(this, arguments);
  if (G.teams[team].ai) return Promise.resolve();
  const p = o.apply(this, arguments), h = $('#handoff h2'); if (h) h.textContent = `${NATION[G.teams[team].nat].n} (${bbColName(team)}) to move`; return p;
})(handoff);
/* teams share what they see */
computeVision = (o => function (team) {
  const v = o.apply(this, arguments); if (!isBB() || !G.bb.team[team]) return v;
  for (const t of G.bb.seats) if (t !== team && bbAllied(team, t) && !G.bb.out[t]) { const w = o.call(this, t); for (let i = 0; i < v.length; i++) v[i] |= w[i]; }
  return v;
})(computeVision);
teamCol = (o => function (team) { return isBB() ? (G.bb.col[team] || '#888') : o.apply(this, arguments); })(teamCol);
autosave = (o => function () { if (!isBB()) return o.apply(this, arguments); try { if (!G.over && !G.watch) localStorage.setItem(BB.save, serial()); } catch (e) {} })(autosave);
clearAutosave = (o => function () { if (!isBB()) return o.apply(this, arguments); try { localStorage.removeItem(BB.save); } catch (e) {} })(clearAutosave);
fxBark = (o => function (u) { if (isBB() && u && u.d && (u.d.struct || u.left > 0)) return; return o.apply(this, arguments); })(fxBark);
battleScene = (o => function (a, d) { if (isBB() && (a.d.struct || d.d.struct || d.left > 0)) return Promise.resolve(); return o.apply(this, arguments); })(battleScene);
banner = (o => function (text, sub, col) {
  if (isBB() && /^Turn \d/.test(sub || '')) { const i = G.bb.inc[G.turn] || {}; sub = `${sub} · ${bbColName(G.turn)}${i.hq || i.grain ? ` · income ${fmt((i.hq || 0) + (i.grain || 0))}${i.grain ? ` (grain ${fmt(i.grain)})` : ''}` : ''}`; }
  return o.call(this, text, sub, col);
})(banner);

/* ---------- 6. the computer general: economy, base and army plan ---------- */
/* the opening; Fuel Dumps are added whenever the next building would leave the base short, and only the economy's
   own buildings (KEY) make the general save up rather than buy units */
const BB_AI_ORDER = {
  normal:['bbdepot', 'bbbarr', 'bbworks', 'bbdepot', 'nest', 'bbeng', 'bbdepot', 'pak', 'nest', 'bbair', 'pak', 'bbworks', 'nest', 'pak'],
  hard:  ['bbdepot', 'bbbarr', 'bbworks', 'bbdepot', 'bbeng', 'nest', 'bbdepot', 'pak', 'bbair', 'nest', 'bbworks', 'pak', 'nest', 'pak'],
};
const BB_AI_KEY = new Set(['bbdepot', 'bbbarr', 'bbworks', 'bbfuel']);
function bbArmy(t) { return G.units.filter(u => u.team === t && !u.d.fixed && u.role !== 'harv'); }
/* army plan for the turn: gather in front of the base, then go for one enemy HQ and stay on it until it falls */
function bbAiPlan(team) {
  const B = G.bb, a = B.ai[team], hard = B.diff[team] === 'hard', hq = bbHQ(team); if (!hq) return;
  if (!a.target || !bbAlive(a.target) || !bbFoe(team, a.target)) {
    const foes = B.seats.filter(t => bbAlive(t) && bbFoe(team, t)).map(t => [t, dist(hq, bbHQ(t) || {x:0, y:0}) + Math.random() * .5]).sort((p, q) => p[1] - q[1]);
    a.target = foes.length ? foes[0][0] : 0; a.mode = 'mass';
  }
  const army = bbArmy(team), val = army.reduce((s, u) => s + u.d.cost * u.hp / 100, 0);
  const need = hard ? 22000 : 28000, late = G.day >= (hard ? 35 : 45) && val >= need * .55;
  const rich = G.teams[team].funds > 15000 && army.length >= G.bb.cap * .45;   // nothing left to buy with: use what it has
  const theirs = a.target ? bbArmy(a.target).reduce((s, u) => s + u.d.cost * u.hp / 100, 0) : 0, edge = val >= 10000 && val >= theirs * 1.6;   // their wave has just broken on our line: go now
  if (a.mode === 'mass' && a.target && (val >= need || army.length >= G.bb.cap * .6 || late || rich || edge)) { a.mode = 'attack'; a.from = val; }
  else if (a.mode === 'attack' && (army.length < 3 || val < (a.from || need) * .35)) a.mode = 'mass';   // the wave is spent: fall back and gather again
  G.persona[team] = a.mode === 'attack' ? 'aggressive' : 'methodical';   // a wave goes in hard; the rest of the time it fights from cover
  const th = a.target && bbHQ(a.target); a.rally = hq;
  if (th) { const ds = army.map(u => dist(u, th)).sort((p, q) => p - q); a.med = ds.length ? ds[ds.length >> 1] : 0; }   // where the middle of the army is, for keeping the wave together
  if (th) { const d = Math.max(1, Math.hypot(th.x - hq.x, th.y - hq.y)), k = Math.min(5, d / 3); a.rally = {x:clamp(Math.round(hq.x + (th.x - hq.x) / d * k), 0, G.W - 1), y:clamp(Math.round(hq.y + (th.y - hq.y) / d * k), 0, G.H - 1)}; }
}
const bbBaseDist = (t, f) => { let b = 99; for (const s of G.units) if (s.team === t && s.d.struct) b = Math.min(b, dist(s, f)); return b; };
function bbAiGoals(team, u) {
  const a = G.bb.ai[team] || {}, foes = aiKnown(team), hq = bbHQ(team), pos = list => list.map(f => [f.x, f.y]);
  const near = foes.filter(f => !f.d.struct && bbBaseDist(team, f) <= 7);
  if (near.length && (a.mode !== 'attack' || (hq && dist(u, hq) <= 10))) return pos(near);
  if (u.role === 'recon') { const lor = foes.filter(f => f.role === 'harv' && (!hq || dist(f, hq) < 26)); if (lor.length) return pos(lor); }   // the harvest war: armoured cars hunt lorries
  if (a.mode === 'attack' && a.target) {
    const tg = foes.filter(f => f.team === a.target), hit = tg.filter(f => canHit(u, f)), h = bbHQ(a.target);
    if (h && a.med && dist(u, h) < a.med - 5 && dist(u, h) > 6) return [[u.x, u.y]];   // out in front: wait for the rest (Neon's escort rule), unless already at the gates
    const goals = pos(hit.filter(f => !f.d.struct || f.role === 'bbhq' || f.role === 'bbdepot')); if (h) goals.push([h.x, h.y]);   // the army, the HQ, and the depots that feed them
    if (goals.length) return goals;
    const any = foes.filter(f => canHit(u, f)); if (any.length) return pos(any);
  }
  const r = a.rally || hq; return r ? [[r.x, r.y]] : pos(foes);
}
function bbAiPlaceSpot(team, type) {
  const tiles = bbPlaceTiles(team, type); if (!tiles.length) return null;
  const hq = bbHQ(team), a = G.bb.ai[team], th = a && a.target && bbHQ(a.target);
  let best = null, bs = -Infinity;
  for (const [x, y] of tiles) {
    let s = Math.random() * .05;
    const blocked = DIRS.filter(([dx, dy]) => !inside(x + dx, y + dy) || unitAt(x + dx, y + dy) || !moveCost({mt:'tread'}, x + dx, y + dy)).length;
    if (type === 'bbdepot') { let g = 0; for (const [k, v] of Object.entries(G.bb.grain)) { const fx_ = k % 1000, fy = Math.floor(k / 1000), d = Math.abs(fx_ - x) + Math.abs(fy - y); if (d <= 4) g += v / (1 + d); }
      s += g / 400 - dist(hq, {x, y}) * .3; }
    else if (BB_S[type].unit) { const dx = th ? th.x - hq.x : 0, dy = th ? th.y - hq.y : 0, d = Math.max(1, Math.hypot(dx, dy)), px = hq.x + dx / d * 4, py = hq.y + dy / d * 4; s -= Math.hypot(x - px, y - py) * 2; }
    else s -= Math.abs(dist(hq, {x, y}) - 2.5) * 1.5 + (terr(x, y) === 'road' ? 1.5 : 0);
    if (!BB_S[type].unit && blocked >= 2) s -= 6;                     // keep lanes open (Neon's placement rule)
    if (DIRS.some(([dx, dy]) => inside(x + dx, y + dy) && terr(x + dx, y + dy) === 'field') && type !== 'bbdepot') s -= 1;
    if (s > bs) { bs = s; best = [x, y]; }
  }
  return best;
}
function bbAiEconomy(team) {
  const B = G.bb, T = G.teams[team], hard = B.diff[team] === 'hard', out = []; if (!bbHQ(team)) return out;
  const fuel = bbFuel(team), cr = bbCrews(team), foes = aiFoes(team).filter(f => !f.d.struct);
  for (const u of G.units) if (u.team === team && u.left > 0 && BB_S[u.role]) { const f = BB_S[u.role].fuel; if (f > 0) fuel.prod += f; else fuel.use -= f; }   // count the sites too
  const threatened = foes.some(f => bbBaseDist(team, f) <= 6);
  // what to build next: walk the opening order, but fuel comes first when the next building would leave the base short
  let want = null; const cnt = {}, own = r => G.units.filter(u => u.team === team && u.role === r).length;
  const homeGrain = () => { let g = 0; const deps = G.units.filter(s => s.team === team && s.role === 'bbdepot'); for (const [k, v] of Object.entries(B.grain)) { const x = k % 1000, y = Math.floor(k / 1000); if (deps.some(s => Math.abs(s.x - x) + Math.abs(s.y - y) <= 6)) g += v; } return g; };
  for (const r of BB_AI_ORDER[hard ? 'hard' : 'normal']) { cnt[r] = (cnt[r] || 0) + 1; if (own(r) >= cnt[r]) continue;
    if (r === 'bbdepot' && cnt[r] > 1 && homeGrain() > 9000) continue;            // another depot only when the fields near the last one run low
    want = r; break; }
  if (T.funds > 10000 && cr.free > 0 && bbHas(team, 'bbworks')) {      // money piling up: a second line of production
    if (own('bbworks') < 2) want = 'bbworks'; else if (own('bbbarr') < 2 && T.funds > 14000) want = 'bbbarr'; else if (own('bbworks') < 3 && T.funds > 18000) want = 'bbworks'; }
  if (want && BB_S[want].fuel < 0 && fuel.prod - fuel.use + BB_S[want].fuel < 0 && !G.units.some(u => u.team === team && u.role === 'bbfuel' && u.left > 0)) want = 'bbfuel';
  let reserve = 0;
  if (want && cr.free > 0) {
    const lock = bbLock(team, want), key = BB_AI_KEY.has(want) || (want === 'bbeng' && hard), army = bbArmy(team).length;
    const spare = key || threatened && BB_S[want].unit || T.funds >= BB_S[want].cost + (army < 6 ? 6000 : 2500);   // extras only from money the army does not need
    if (!lock && spare) { const at = bbAiPlaceSpot(team, want); if (at) out.push(bbPlace(team, want, at[0], at[1])); }
    else if (lock.startsWith('need ') && key && !threatened) reserve = BB_S[want].cost;
  }
  // production: lorries first (two per depot), then the army, keeping the reserve for the next building
  const harvs = own('harv'), deps = bbOwn(team, 'bbdepot').length, grainLeft = Object.values(B.grain).some(v => v >= 1000);
  const prods = G.units.filter(s => s.team === team && s.d.struct && bbDone(s) && BB_S[s.role].makes).sort(() => Math.random() - .5);
  for (const s of prods.filter(p => p.role === 'bbdepot')) if (grainLeft && harvs + out.filter(u => u.role === 'harv').length < Math.min(deps * 3, hard ? 8 : 6) && !bbProdLock(team, s, 'harv')) { const u = bbProduce(team, s, 'harv'); if (u) out.push(u); }
  const mine = G.units.filter(o => o.team === team), foeArmour = foes.filter(o => o.d.armour).length, foeAir = foes.filter(o => o.d.air).length;
  const mix = foes.length ? foes : null, myInf = mine.filter(o => o.d.foot).length, myInd = mine.filter(o => o.d.indirect).length, myAA = mine.filter(o => o.role === 'aa').length;
  /* once there is a Vehicle Works, riflemen are bought only from money left over after saving for the next tank:
     cheap units bought every turn kept the funds from ever reaching a tank (the build-list trace showed armies of 70 riflemen) */
  const works = prods.some(p => p.role === 'bbworks' && !p.used), footShare = mine.filter(o => o.d.foot && !o.d.fixed).length / Math.max(1, bbArmy(team).length);
  const vehRes = works && myInf >= 3 && footShare >= .35 && !threatened ? unitCost(team, 'tank') : 0;
  for (const s of prods.filter(p => p.role !== 'bbdepot').sort((p, q) => (q.role === 'bbworks') - (p.role === 'bbworks'))) {
    const budget = T.funds - reserve - (s.role === 'bbbarr' ? vehRes : 0);
    const can = bbProdList(team, s).filter(r => r !== 'apc' && r !== 'harv' && (!bbProdLock(team, s, r) || bbProdLock(team, s, r).startsWith('need ')));
    if (!can.length) continue;
    let best = bbAiPick(team, can, foes);                               // what the army needs most; if it cannot be afforded yet, save for it
    if (unitCost(team, best) > budget) { if (!threatened) continue; const cheap = can.filter(r => unitCost(team, r) <= T.funds); if (!cheap.length) continue; best = bbAiPick(team, cheap, foes); }
    if (best) { const u = bbProduce(team, s, best); if (u) out.push(u); }
  }
  return out;
}

/* the army it wants, as shares of its strength: what is furthest below its share is bought next, so no single
   type takes over (Iron Front's build-list trace found monocultures of riflemen and of armoured cars) */
function bbAiPick(team, opts, foes) {
  const T = G.teams[team], army = bbArmy(team), n = Math.max(1, army.length), cnt = {}; for (const u of army) cnt[u.role] = (cnt[u.role] || 0) + 1;
  const foeArm = foes.filter(f => f.d.armour).length / Math.max(1, foes.length), foeAir = foes.filter(f => f.d.air).length / Math.max(1, foes.length), hard = G.bb.diff[team] === 'hard';
  const want = {inf:.16, at:.06 + foeArm * .12, mortar:.04, eng:.03, recon:.08, tank:.24, mtank:.12, htank:.06, art:.1, rkt:.05, aa:.02 + foeAir * .3, ftr:.02 + foeAir * .2, bmr:hard ? .07 : .04};
  let best = null, bs = -1e9;
  for (const r of opts) {
    const c = unitCost(team, r), share = (cnt[r] || 0) / n;
    let v = (want[r] || .02) - share + Math.random() * .03 + c / 400000;   // ties go to the heavier unit
    if (r === 'tank' && opts.includes('mtank') && T.funds > 20000) v -= .05;  // with money in the bank, the better tank
    if (v > bs) { bs = v; best = r; }
  }
  return best;
}

/* ---------- 7. drawing: the buildings, the lorry, and the overlays ---------- */
function bbSandbags(P, x0, x1, y) { for (let x = x0, i = 0; x <= x1; x += 2.6, i++) P.ell(x, y - (i % 2) * .3, 1.6, 1.1, i % 2 ? '#a0906a' : '#8c7c58'); }
function bbFlag(P, nat, x, y, w = 8, h = 5) { P.R(x - .8, y, .7, 12, '#3a3a36'); const g = P.g; g.save(); g.scale(P.S, P.S); drawFlag(g, nat, x, y, w, h); g.restore(); }
Object.assign(EXTRA_SHAPES, {
  bbhq:(P, C, f, nat) => {                                             // a requisitioned farmhouse: the command post, its mast and sandbags
    P.ell(16, 27.5, 15, 2.6, 'rgba(0,0,0,.25)');
    P.R(4, 14, 24, 13, '#c4b494'); for (let i = 0; i < 9; i++) P.R(5 + (i * 7) % 22, 16 + (i * 3) % 10, 2, .6, '#a89a7a');
    P.poly([[2, 15], [8, 7], [24, 7], [30, 15]], '#8a4a32'); P.line(8, 7, 24, 7, '#6a3424', .6); for (let i = 1; i < 4; i++) P.line(2 + i * 1.5, 15 - i * 2, 30 - i * 1.5, 15 - i * 2, '#7a3e2a', .3);
    for (let i = 0; i < 3; i++) { P.R(6 + i * 7, 18, 3, 3, '#2a2e36'); P.R(6 + i * 7, 18, 3, .6, '#8aa0b0'); }
    P.R(23, 19, 3.4, 8, '#3a2a1a'); P.R(26.6, 1, .7, 14, '#3a3a36'); P.line(27, 1, 31, 9, '#55554c', .3); P.line(27, 1, 23, 8, '#55554c', .3);
    bbSandbags(P, 2, 30, 27); bbFlag(P, nat, 5, 1.5);
  },
  bbfuel:(P, C) => {                                                   // a fuel dump: a tanker trailer and stacked drums under netting
    P.ell(16, 27.5, 15, 2.4, 'rgba(0,0,0,.22)');
    P.R(3, 15, 15, 7, '#8a8a7e'); P.ell(3, 18.5, 1.5, 3.5, '#9a9a8e'); P.ell(18, 18.5, 1.5, 3.5, '#7a7a6e'); P.R(3, 15, 15, 1, '#a8a89c'); P.R(9, 13.5, 3, 1.5, '#6a6a60');
    wheel(P, 6, 24, 2.3, 0); wheel(P, 15, 24, 2.3, 0);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4 - r; i++) { const x = 20 + i * 2.8 + r * 1.4, y = 22 - r * 4.4; P.R(x, y, 2.4, 4.2, r ? shade(C.m, -.1) : C.m); P.ell(x + 1.2, y, 1.2, .5, shade(C.m, .25)); P.R(x, y + 1.4, 2.4, .4, shade(C.m, -.3)); }
    for (let i = 0; i < 6; i++) P.R(4 + i * 4.4, 26, 2.2, 1.6, shade(C.m, -.15));                                     // jerrycans
    for (let x = 18; x < 31; x += 2) P.line(x, 11, x + 3, 25, 'rgba(70,80,50,.45)', .3);                                  // camouflage net
  },
  bbdepot:(P, C) => {                                                  // a granary and loading bay, with sacks waiting for the lorries
    P.ell(16, 27.5, 15, 2.4, 'rgba(0,0,0,.22)');
    P.R(3, 12, 18, 15, '#8a6a44'); for (let x = 4; x < 21; x += 2) P.R(x, 12, .4, 15, '#6e5234');
    P.poly([[1, 13], [12, 4], [23, 13]], '#5a4a3a'); P.line(1, 13, 12, 4, '#3e3226', .5);
    P.R(8, 17, 8, 10, '#2a2218'); P.R(8, 17, 8, .8, '#4a3a28');
    P.R(23, 9, 6, 18, '#b8b0a0'); P.poly([[22.5, 9.5], [26, 4], [29.5, 9.5]], '#8a8478'); for (let y = 11; y < 26; y += 3) P.R(23, y, 6, .4, '#9a9284');   // the silo
    for (let i = 0; i < 5; i++) P.ell(4 + i * 3.2, 26 - (i % 2) * 1.2, 1.6, 1.2, i % 2 ? '#d8c890' : '#c8b47a');
    P.R(9, 21, 6, 1.2, C.m);
  },
  bbbarr:(P, C) => {                                                   // Nissen huts behind a sandbag wall
    P.ell(16, 27.5, 15, 2.4, 'rgba(0,0,0,.22)');
    P.ell(22, 15, 8, 6, '#7a7e74'); P.R(14, 15, 16, 6, '#7a7e74');
    P.ell(12, 18, 10, 8, '#8e9288'); P.R(2, 18, 20, 7, '#8e9288'); for (let x = 3; x < 22; x += 2) P.line(x, 11, x, 25, '#7a7e74', .3);
    P.R(10, 19, 4, 6, '#3a3a34'); P.R(4, 19, 3, 2, '#2a2e36'); P.R(17, 19, 3, 2, '#2a2e36');
    bbSandbags(P, 1, 31, 27); P.R(27, 12, .6, 13, '#3a3a36'); P.R(27.6, 12, 3.5, 2.2, C.m);
  },
  bbworks:(P, C) => {                                                  // a vehicle workshop: sawtooth roof, open door, a hull on the stand
    P.ell(16, 27.5, 15, 2.4, 'rgba(0,0,0,.25)');
    P.R(2, 13, 28, 14, '#9a8a70'); for (let i = 0; i < 4; i++) { P.poly([[2 + i * 7, 13], [2 + i * 7, 7], [9 + i * 7, 13]], '#6a5e50'); P.R(2 + i * 7, 7, .6, 6, '#8aa0b0'); }
    P.R(9, 16, 14, 11, '#24221e'); P.R(9, 16, 14, 2, '#4a463c'); for (let y = 16; y < 18; y += .6) P.R(9, y, 14, .2, '#3a3832');
    P.R(11, 22, 10, 3, C.m); P.R(13, 20, 6, 2, shade(C.m, .1)); P.R(18, 20.6, 5, .7, '#2a2a26'); P.R(10.5, 25, 11, 1.4, '#3a3a34');
    P.R(3, 17, 4, 3, '#2a2e36'); P.R(25, 17, 4, 3, '#2a2e36'); P.R(1, 3, .8, 11, '#c8a040'); P.R(1, 3, 9, .8, '#c8a040'); P.R(8.5, 3.6, .3, 4, '#2a2a26');
  },
  bbeng:(P, C) => {                                                    // the engineers' yard: a derrick, stacked timber and bridge panels
    P.ell(16, 27.5, 15, 2.4, 'rgba(0,0,0,.22)');
    P.R(2, 18, 11, 9, '#7a6a52'); P.poly([[1, 19], [7.5, 14], [14, 19]], '#5a5040'); P.R(6, 22, 3, 5, '#3a2a1a');
    for (let i = 0; i < 4; i++) P.R(15, 25 - i * 1.6, 13 - i, 1.4, i % 2 ? '#b8915e' : '#a8865a');
    for (let i = 0; i < 3; i++) { P.R(16 + i * 4, 16, .6, 6, '#6a6a60'); P.line(16 + i * 4, 16, 20 + i * 4, 22, '#6a6a60', .4); } P.R(16, 16, 12, .6, '#6a6a60'); P.R(16, 21.6, 12, .6, '#6a6a60');   // a Bailey panel
    P.line(25, 2, 25, 27, '#3a3a34', .7); P.line(25, 3, 13, 9, '#3a3a34', .6); P.line(13, 9, 13, 13, '#55554c', .2); P.R(12, 13, 2, 1.5, C.m);   // the derrick and its hook
  },
  bbair:(P, C) => {                                                    // a hangar on the edge of a grass strip, and the windsock
    P.R(0, 22, 32, 6, '#8a8a7e'); for (let x = 1; x < 32; x += 6) P.R(x, 24.6, 3, .7, '#e8e8e0');
    P.ell(14, 21, 13, 10, '#6e7268'); P.R(1, 21, 26, 1, '#5e6258'); for (let x = 3; x < 26; x += 2.4) P.line(x, 12, x, 21, '#62665c', .3);
    P.R(8, 15, 12, 6, '#1e1e1c'); P.R(11, 18, 6, 1.4, C.m); P.R(13.5, 16.5, 1, 4, shade(C.m, -.1));                   // an aircraft in the shadow of the door
    P.R(28, 6, .6, 16, '#3a3a36'); P.poly([[28.6, 6], [32, 7.4], [28.6, 9]], '#e07030'); P.R(30, 6.5, .8, 2, '#f0f0ea');
  },
  bblorry:(P, C, f) => {                                               // a period lorry with an open bed full of sacks of grain
    const m = C.m;
    P.R(3, 18, 17, 4, shade(m, -.05)); P.R(3, 17, 17, 1, shade(m, .1));
    P.R(21, 13, 6, 9, m); P.R(27, 16, 3, 6, m); P.R(22, 14, 4, 3, '#9bb8c8'); P.R(27.5, 17, 2, .5, shade(m, -.2));
    P.R(3, 22, 27, 1, '#2a2a24'); wheel(P, 7, 25, 2.7, f); wheel(P, 13, 25, 2.7, f); wheel(P, 26, 25, 2.7, f);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5 - r; i++) P.ell(5 + i * 3.2 + r * 1.6, 15.5 - r * 2.2, 1.7, 1.2, (i + r) % 2 ? '#d8c890' : '#c8b47a');
    return {mx:24, my:18};
  },
});
/* the field turning to stubble as it is cut, the build zone, and where a building can go */
fxWrecks = (o => function (g) {
  if (!isBB()) return o.apply(this, arguments);
  const B = G.bb;
  for (const [k, v] of Object.entries(B.grain)) { const x = k % 1000, y = Math.floor(k / 1000), cut = 1 - v / BB.gmax; if (cut < .05) continue;
    if (UI.vis && !UI.vis[y * G.W + x]) continue;
    g.fillStyle = `rgba(122,96,58,${(cut * .65).toFixed(2)})`; g.fillRect(x * ART, y * ART, ART, ART);
    g.fillStyle = `rgba(70,54,30,${(cut * .5).toFixed(2)})`; for (let i = 0; i < 6; i++) g.fillRect(x * ART + 6 + i * 9, y * ART + 10 + (i % 2) * 22, 3, 14); }
  const me = !G.over && !isAI(G.turn) ? G.turn : 0, h = me && bbHQ(me);
  if (h && (UI.mode === 'bbplace' || SET.bbzone !== false)) {
    const z = B.zone, x0 = Math.max(0, h.x - z), y0 = Math.max(0, h.y - z), x1 = Math.min(G.W - 1, h.x + z), y1 = Math.min(G.H - 1, h.y + z);
    g.save(); g.setLineDash([14, 10]); g.strokeStyle = UI.mode === 'bbplace' ? 'rgba(255,230,120,.9)' : 'rgba(255,230,120,.35)'; g.lineWidth = 4; g.strokeRect(x0 * ART + 2, y0 * ART + 2, (x1 - x0 + 1) * ART - 4, (y1 - y0 + 1) * ART - 4); g.restore();
  }
  if (UI.mode === 'bbplace' && UI.bbTiles) for (const [x, y] of UI.bbTiles) { g.fillStyle = 'rgba(120,230,120,.35)'; g.fillRect(x * ART, y * ART, ART, ART); g.strokeStyle = 'rgba(200,255,200,.7)'; g.lineWidth = 2; g.strokeRect(x * ART + 2, y * ART + 2, ART - 4, ART - 4); }
  return o.apply(this, arguments);
})(fxWrecks);
/* every unit stands on a ring in its side's colour, and every building has a frame and a pennant: two players may field the same army */
drawUnit = (o => function (u, t) {
  if (!isBB()) return o.apply(this, arguments);
  const X = (u.rx ?? u.x) * ART, Y = (u.ry ?? u.y) * ART, col = teamCol(u.team);
  if (u.d.struct || u.left > 0) {
    ctx.fillStyle = col + '40'; ctx.fillRect(X + 2, Y + 2, ART - 4, ART - 4);
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.strokeRect(X + 2.5, Y + 2.5, ART - 5, ART - 5);
  } else { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(X + ART / 2, Y + ART - 8, 25, 7, 0, 0, 7); ctx.stroke(); }
  if (u.left > 0) {                                                    // a building site: the outline of what is coming, scaffolding and the days left
    ctx.save(); ctx.globalAlpha = .4; ctx.drawImage(getSprite(G.teams[u.team].nat, u.role, 0), X, Y); ctx.restore();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(X + 10 + i * 14, Y + 14); ctx.lineTo(X + 10 + i * 14, Y + ART - 8); ctx.stroke(); }
    for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(X + 8, Y + 18 + j * 14); ctx.lineTo(X + ART - 8, Y + 18 + j * 14); ctx.stroke(); }
    ctx.fillStyle = '#111d'; ctx.fillRect(X + ART / 2 - 14, Y + ART / 2 - 12, 28, 24); ctx.fillStyle = '#f0d060'; ctx.font = 'bold 20px "Courier Prime",monospace'; ctx.textAlign = 'center'; ctx.fillText(u.left, X + ART / 2, Y + ART / 2 + 7);
    const hp = hpBars(u); if (hp < 10) { ctx.fillStyle = '#111'; ctx.fillRect(X + ART - 20, Y + ART - 20, 20, 20); ctx.fillStyle = '#fff'; ctx.font = 'bold 18px "Courier Prime",monospace'; ctx.fillText(hp, X + ART - 10, Y + ART - 4); }
    return;
  }
  o.apply(this, arguments);
  if (u.d.struct) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X + ART - 4, Y + 2); ctx.lineTo(X + ART - 4, Y + 18); ctx.lineTo(X + ART - 16, Y + 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke(); }
  if (u.role === 'harv' && u.grain > 0) { const k = u.grain / BB.harvCap; ctx.fillStyle = '#111c'; ctx.fillRect(X + 14, Y + 2, 36, 7); ctx.fillStyle = '#e8c860'; ctx.fillRect(X + 15, Y + 3, 34 * k, 5); }
})(drawUnit);

/* ---------- 8. player interface ---------- */
infoPanel = (o => function () {
  o.apply(this, arguments);
  if (!isBB()) return;
  const {x, y} = UI.cursor; if (!inside(x, y)) return;
  if (terr(x, y) === 'field') { const v = G.bb.grain[K(x, y)] || 0; $('#tinfo').insertAdjacentHTML('beforeend', `<span class="tip">Grain: ${fmt(v)} of ${fmt(BB.gmax)}; regrows ${BB.regrow} a day</span>`); }
  const u = unitAt(x, y), box = $('#uinfo > div'); if (!u || !box || !seen(u)) return;
  let s = '';
  if (u.role === 'harv') s = `Carrying ${fmt(u.grain || 0)} of ${fmt(BB.harvCap)} grain · drives itself at the start of your turn`;
  else if (u.left > 0) s = `Under construction: ready in ${u.left} turn${u.left === 1 ? '' : 's'}`;
  else if (u.d.struct) { const S = BB_S[u.role]; s = `${S.fuel > 0 ? `Fuel +${S.fuel}` : `Uses ${-S.fuel} fuel`}${S.makes ? ` · makes ${S.makes.map(r => (udef(G.teams[u.team].nat, r) || {n:r}).n).filter(Boolean).slice(0, 3).join(', ')}${S.makes.length > 3 ? ' and more' : ''}` : ''}${u.used ? ' · has made a unit this turn' : ''}`; }
  if (s) box.insertAdjacentHTML('beforeend', `<span>${s}</span>`);
  if (u.d.struct) box.querySelectorAll('span').forEach(sp => { if (/^HP \d/.test(sp.textContent)) sp.textContent = `HP ${hpBars(u)}/10 · ${bbColName(u.team)}`; });
})(infoPanel);
hud = (o => function () {
  o.apply(this, arguments);
  const bar = $('#bbbar'), bbtn = $('#bbbuild');
  if (!isBB()) { if (bar) bar.hidden = true; if (bbtn) bbtn.hidden = true; $('#co2').hidden = false; $('#co1').style.borderLeft = ''; return; }
  const B = G.bb, t = G.turn, T = G.teams[t], c = CO[T.co], el = $('#co1');
  el.querySelector('.pt').replaceChildren(portraitCanvas(T.co, 1)); el.querySelector('.nm').textContent = c.n;
  el.querySelector('.nat').replaceChildren(flagCanvas(T.nat, 18, 12)); el.querySelector('.meter').innerHTML = ''; el.querySelector('.pw').textContent = bbColName(t).toUpperCase();
  el.style.borderLeft = `6px solid ${B.col[t]}`; el.classList.add('active');
  const human = !T.ai, fu = bbFuel(t), inc = B.inc[t] || {};
  el.querySelector('.fund').textContent = fmt(T.funds);
  $('#co2').hidden = true;
  $('#goal').textContent = `Destroy every enemy HQ${B.limit ? ` · turn limit ${B.limit}` : ''} · income ${fmt((inc.hq || 0) + (inc.grain || 0))}${inc.grain ? ` (grain ${fmt(inc.grain)})` : ''} · fuel ${fu.use} of ${fu.prod}${fu.low ? ' LOW' : ''} · units ${bbCount(t)} of ${B.cap}`;
  if (bar) {
    bar.hidden = false; const top = $('#top').getBoundingClientRect(); bar.style.top = Math.round(top.bottom + 2) + 'px';
    bar.innerHTML = B.seats.map(s => { const h = bbHQ(s), out = B.out[s], hp = h ? hpBars(h) : 0;
      return `<span class="bbchip${s === t ? ' on' : ''}${out ? ' out' : ''}" style="--c:${B.col[s]}" title="${NATION[G.teams[s].nat].n} · ${bbColName(s)}${B.team[s] ? ' · team ' + B.team[s] : ''}${G.teams[s].ai ? ' · computer' : ''}"><i></i><b>${out ? '✕' : B.team[s] || s}</b><em style="width:${hp * 10}%"></em></span>`; }).join('');
  }
  if (bbtn) { bbtn.hidden = !(human && !UI.busy && !G.over && bbHQ(t)); const fr = bbCrews(t).free; bbtn.textContent = fr > 0 ? 'Build' : 'Build (busy)'; }
})(hud);
selectTile = (o => function (x, y) {
  if (!isBB() || !G || UI.busy || isAI(G.turn) || G.over || !inside(x, y)) return o.apply(this, arguments);
  if (UI.mode === 'bbplace') {
    const ok = (UI.bbTiles || []).some(([a, b]) => a === x && b === y), type = UI.bbType; UI.mode = 'idle'; UI.bbTiles = null;
    if (ok && !bbLock(G.turn, type)) { bbPlace(G.turn, type, x, y); autosave(); tip('bbsite', 'A building site is paid for now and finished at the start of your turn when its count reaches zero. Sites can be shot at, so build behind your army.'); }
    else sfx('cancel');
    hud(); return;
  }
  if (UI.mode === 'idle') { const u = unitAt(x, y);
    if (u && u.team === G.turn && (u.d.struct || u.left > 0)) { UI.cursor = {x, y}; infoPanel();
      if (u.left > 0) { fxText(x, y, `Ready in ${u.left} turn${u.left === 1 ? '' : 's'}`, '#f0d060'); return; }
      if (u.role === 'bbhq') return bbOpenConstruct(u);
      if (BB_S[u.role].makes) return bbOpenProduce(u);
      fxText(x, y, BB_S[u.role].n, '#f4e8c8'); return; }
    if (u && u.team === G.turn && u.role === 'harv') { UI.cursor = {x, y}; infoPanel(); fxText(x, y, `${fmt(u.grain || 0)} grain aboard`, '#f0d060'); tip('bbharv', 'Lorries run themselves: at the start of each of your turns they cut grain, drive to the nearest wheat (fields near your depots first) and unload beside a Supply Depot. Keep them out of the enemy\'s reach.'); return; }
  }
  return o.apply(this, arguments);
})(selectTile);
cancel = (o => function () { if (isBB() && UI.mode === 'bbplace') { UI.mode = 'idle'; UI.bbTiles = null; sfx('cancel'); return; } return o.apply(this, arguments); })(cancel);
openActions = (o => function (u) {
  o.apply(this, arguments);
  if (!isBB() || u.role !== 'eng') return;
  const fix = G.units.filter(s => s.team === u.team && s.d.struct && s.hp < 100 && dist(s, u) === 1);
  if (!fix.length) return;
  const m = $('#menu'), b = document.createElement('button'); b.textContent = 'Repair building';
  b.onclick = e => { e.stopPropagation(); closeMenu(); for (const s of fix) { s.hp = Math.min(100, s.hp + 30); fxText(s.x, s.y, '+3 repaired', '#9ae07a'); } sfx('build'); finishAction(u); };
  m.insertBefore(b, m.lastChild);
})(openActions);
function bbOpenConstruct(hq) {
  const t = G.turn, T = G.teams[t], fu = bbFuel(t), cr = bbCrews(t); UI.mode = 'build';
  const items = [{html:`<span class="bi"></span><span class="bn">Construction<small>Funds ${fmt(T.funds)} · fuel ${fu.use} of ${fu.prod}${fu.low ? ' (low: slower building, production on even days)' : ''} · crews free ${Math.max(0, cr.free)} of ${cr.crews}</small></span>`, disabled:true}];
  for (const k of BB_ORDER) { const s = BB_S[k], lock = bbLock(t, k), d = udef(T.nat, k);
    items.push({html:`<span class="bi"></span><span class="bn">${s.unit ? d.n : s.n}<small>${s.turns} turn${s.turns === 1 ? '' : 's'} · ${s.fuel > 0 ? 'fuel +' + s.fuel : 'uses ' + -s.fuel + ' fuel'}${lock ? ' · ' + lock : ''}</small></span><span class="bc">${fmt(s.cost)}</span>`, disabled:!!lock, role:k,
      fn:() => { closeMenu(); const tiles = bbPlaceTiles(t, k); if (!tiles.length) { UI.mode = 'idle'; fxText(hq.x, hq.y, 'No room in the build zone', '#ff8a6a'); return; }
        UI.mode = 'bbplace'; UI.bbType = k; UI.bbTiles = tiles; const h = bbHQ(t); if (h) focus(h.x, h.y); tip('bbzone', 'Pick a green square inside the dashed line to place it. You can build within ' + G.bb.zone + ' squares of your HQ, on open ground or road, never on a wheat field. Right-click or tap elsewhere to cancel.'); }}); }
  items.push({label:'Close', fn:() => { closeMenu(); UI.mode = 'idle'; }});
  menuAt(items, hq.x, hq.y); const m = $('#menu'); m.classList.add('build');
  m.querySelectorAll('button').forEach((b, i) => { const r = items[i] && items[i].role, el = b.querySelector('.bi'); if (r && el) el.append(spriteCanvas(T.nat, r, .75)); });
  m.style.top = '96px'; m.style.left = Math.max(10, Math.min(innerWidth - m.offsetWidth - 10, (hq.x * ART + ART - cam.x) * cam.z + 10)) + 'px';
  tip('bbbuild', 'Your HQ builds. Supply Depots take in grain and come with a lorry; Fuel Dumps power everything else; Barracks, the Vehicle Works and the Airfield make units, one a turn each. The Engineer Yard adds a second crew and the heavier kit.');
}
function bbOpenProduce(s) {
  const t = G.turn, T = G.teams[t]; UI.mode = 'build';
  const items = bbProdList(t, s).map(r => { const d = udef(T.nat, r), c = unitCost(t, r), lock = bbProdLock(t, s, r);
    return {html:`<span class="bi"></span><span class="bn">${d.n}<small>${d.w}${d.mv ? ' · move ' + moveOf({d, team:t}) : ''}${lock ? ' · ' + lock : ''}</small></span><span class="bc">${fmt(c)}</span>`, disabled:!!lock, role:r,
      fn:() => { closeMenu(); UI.mode = 'idle'; const u = bbProduce(t, s, r); if (u) { autosave(); hud(); if (Math.random() < .6) setTimeout(() => fxBark(u, 'new'), 500); } }}; });
  items.push({label:'Close', fn:() => { closeMenu(); UI.mode = 'idle'; }});
  menuAt(items, s.x, s.y); const m = $('#menu'); m.classList.add('build');
  m.querySelectorAll('.bi').forEach((el, i) => el.append(spriteCanvas(T.nat, items[i].role, .75)));
  m.style.top = '96px'; m.style.left = Math.max(10, Math.min(innerWidth - m.offsetWidth - 10, (s.x * ART + ART - cam.x) * cam.z + 10)) + 'px';
}
gameOver = (o => async function () {
  if (!isBB()) return o.apply(this, arguments);
  if (FAST || UI.overShown) return; UI.overShown = true;
  const B = G.bb, w = G.over.winner, side = bbSideKey(w), winners = B.seats.filter(t => bbSideKey(t) === side), hum = B.seats.filter(t => !G.teams[t].ai);
  await say(G.teams[w].co, CO[G.teams[w].co].say.win);
  try { localStorage.removeItem(BB.save); } catch (e) {}
  const r = $('#result'), won = hum.length === 1 ? winners.includes(hum[0]) : null;
  r.querySelector('h2').textContent = won === true ? 'VICTORY' : won === false ? 'DEFEAT' : B.team[w] ? `TEAM ${B.team[w]} WINS` : `${bbColName(w).toUpperCase()} WINS`;
  r.querySelector('.why').textContent = `${winners.map(t => `${NATION[G.teams[t].nat].n} (${bbColName(t)})`).join(' and ')} win${winners.length === 1 ? 's' : ''}: ${G.over.why === 'score' ? 'the highest score when the turn limit ran out' : 'every enemy HQ destroyed'}, on day ${G.day}.`;
  const rank = B.seats.slice().sort((a, b) => (B.out[b] || 1e6) - (B.out[a] || 1e6) || bbScore(b) - bbScore(a));   // still in first, then the last to fall
  r.querySelector('.st').innerHTML = rank.map(t => `<div style="border-left:5px solid ${B.col[t]};padding-left:6px"><b>${bbColName(t)}${B.team[t] ? ' · team ' + B.team[t] : ''}</b><span>${NATION[G.teams[t].nat].n} · ${CO[G.teams[t].co].n}</span><span>${B.out[t] ? 'Out on day ' + B.out[t] : 'Score ' + fmt(bbScore(t))}</span><span>Destroyed ${G.stats[t].kills} · lost ${G.stats[t].lost}</span></div>`).join('');
  r.querySelector('.score').innerHTML = ''; r.querySelector('.vets').innerHTML = '';
  r.hidden = false;
  musicMood(won === false ? 'defeat' : 'victory', false, G.teams[w].nat);
})(gameOver);

/* ---------- 9. the setup screen and the title-screen entry ---------- */
(function bbScreens() {
  const css = document.createElement('style');
  css.textContent = `
#bbsetup .form > fieldset.players, #bbsetup .bbresume { grid-column: 1 / -1; }
#bbsetup .seats { display:grid; gap:6px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 430px), 1fr)); }
#bbsetup .seat { display:grid; grid-template-columns: 16px 1fr 1.25fr 1.25fr 72px; gap:6px; align-items:center; padding:6px; border:2px solid var(--line, #5a5a44); border-left:8px solid var(--c); background:#0000000f; }
#bbsetup .seat b { font-family: var(--display, monospace); }
#bbsetup .seat select { width:100%; min-width:0; }
#bbsetup .bbmap { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; }
#bbsetup canvas.bbprev { image-rendering:pixelated; border:2px solid var(--line, #5a5a44); max-width:min(260px, 100%); }
#bbsetup .bbresume { margin:0 0 10px; }
#bbbar { position:fixed; left:50%; transform:translateX(-50%); display:flex; gap:4px; z-index:5; pointer-events:none; flex-wrap:wrap; justify-content:center; max-width:calc(100vw - 16px); }
#bbbar .bbchip { position:relative; display:flex; align-items:center; gap:3px; min-width:30px; height:20px; padding:0 5px 3px; background:#1a1b14d0; border:2px solid #000; font:bold 12px "Courier Prime",monospace; color:#f4e8c8; }
#bbbar .bbchip i { width:9px; height:9px; background:var(--c); border:1px solid #000; }
#bbbar .bbchip em { position:absolute; left:0; bottom:0; height:3px; background:var(--c); }
#bbbar .bbchip.on { border-color:var(--c); box-shadow:0 0 0 1px #fff8; }
#bbbar .bbchip.out { opacity:.4; }
@media (max-width: 640px) {
  #bbsetup .seat { grid-template-columns: 14px 1fr 1fr; }
  #bbsetup .seat .co { grid-column: 2; } #bbsetup .seat .tm { grid-column: 3; }
}`;
  document.head.append(css);
  const sec = document.createElement('section'); sec.className = 'screen paper'; sec.id = 'bbsetup'; sec.hidden = true;
  sec.innerHTML = `<header><h2>Base Building</h2><p>Build a base, bring in the harvest and destroy every enemy HQ. Up to eight players, any mix of people on this device and computer generals.</p></header>
  <div class="form">
    <div class="bbresume" hidden><button id="bbresume">Resume saved game</button> <small class="dim"></small></div>
    <fieldset><legend>Battlefield</legend><div class="bbmap"><div><label>Map <select id="bbmapsel"></select></label><p class="dim bbblurb"></p></div><canvas class="bbprev"></canvas></div></fieldset>
    <fieldset class="players"><legend>Players</legend><div class="seats"></div><small class="dim">Teams share victory and never fire on each other. Players on no team fight everyone.</small></fieldset>
    <fieldset><legend>Rules</legend>
      <label>Starting funds <select id="bbfunds"><option value="5000">5,000</option><option value="8000" selected>8,000</option><option value="15000">15,000</option></select></label>
      <label>Fog of war <select id="bbfog"><option value="off">Off</option><option value="on">On</option></select></label>
      <label>Turn limit <select id="bblimit"><option value="0" selected>None: last HQ standing</option><option value="40">40 days, then score</option><option value="60">60 days, then score</option><option value="90">90 days, then score</option></select></label></fieldset>
  </div>
  <footer><button class="back">Back</button><button id="bbgo">Start</button></footer>`;
  document.querySelector('#gamehud') ? document.querySelector('#gamehud').before(sec) : document.body.append(sec);
  const bar = document.createElement('div'); bar.id = 'bbbar'; bar.hidden = true; document.querySelector('#gamehud').append(bar);
  const acts = document.querySelector('#gamehud .acts');
  if (acts) { const b = document.createElement('button'); b.id = 'bbbuild'; b.hidden = true; b.textContent = 'Build'; b.title = 'Construct a building (B)'; acts.prepend(b);
    b.addEventListener('click', () => { if (!isBB() || UI.busy || isAI(G.turn)) return; auInit(); sfx('click'); if (UI.mode !== 'idle') cancel(); const h = bbHQ(G.turn); if (h) bbOpenConstruct(h); }); }
  const modes = document.querySelector('.mainmenu .modes');
  if (modes) { const b = document.createElement('button'); b.id = 'bbase'; b.textContent = 'Base Building'; const sk = modes.querySelector('#bskirmish'); sk ? sk.after(b) : modes.append(b);
    b.addEventListener('click', () => { auInit(); sfx('click'); bbOpenSetup(); }); }
  const man = document.querySelector('#help .manual');
  if (man) { const p = document.createElement('p'); p.innerHTML = '<b>Base Building.</b> Up to eight players, people and computer generals, free-for-all or in teams. Your HQ builds inside the dashed zone round it (press B or Build): Supply Depots take in grain and each comes with a lorry, Fuel Dumps power everything else, Barracks, the Vehicle Works and the Airfield make one unit a turn each, and the Engineer Yard adds a second crew and the heavier kit. Lorries run themselves at the start of your turn, cutting wheat and carrying it to a depot; cut fields regrow slowly. Destroy every enemy HQ to win; a side whose HQ falls is out.'; man.append(p); }
  addEventListener('keydown', e => { if ((e.key === 'b' || e.key === 'B') && isBB() && document.body.dataset.screen === 'game' && $('#menu').hidden && !UI.busy && !isAI(G.turn)) { const h = bbHQ(G.turn); if (h) bbOpenConstruct(h); } });
})();
function bbOpenSetup() {
  const f = $('#bbsetup'), sel = f.querySelector('#bbmapsel');
  if (!sel.options.length) { sel.innerHTML = BB_MAPS.map(m => `<option value="${m.id}">${m.n} (${m.seats} players)</option>`).join(''); sel.onchange = () => bbSeatsUI(); }
  let save = null; try { save = localStorage.getItem(BB.save); } catch (e) {}
  const rb = f.querySelector('.bbresume'); rb.hidden = !save;
  if (save) { try { const s = JSON.parse(save); rb.querySelector('small').textContent = `${BB_MAP(s.bb.map).n}, day ${s.day}, ${s.bb.n} players`; } catch (e) { rb.hidden = true; } }
  f.querySelector('#bbresume').onclick = () => { sfx('click'); bbResume(); };
  f.querySelector('#bbgo').onclick = () => { sfx('click'); bbLaunch(); };
  bbSeatsUI(); show('bbsetup'); musicMood('campaign');
}
function bbSeatsUI() {
  const f = $('#bbsetup'), id = f.querySelector('#bbmapsel').value, def = BB_MAP(id), box = f.querySelector('.seats'), nats = bbNations();
  f.querySelector('.bbblurb').textContent = def.blurb;
  const c = f.querySelector('.bbprev'), rows = bbMapData(id).rows; drawMinimapPreview(c, rows, def.theme);
  { const g = c.getContext('2d'); bbMapData(id).starts.forEach(([x, y], i) => { g.fillStyle = BB_COLS[i]; g.fillRect(x * 6 - 3, y * 6 - 3, 12, 12); g.strokeStyle = '#000'; g.strokeRect(x * 6 - 3, y * 6 - 3, 12, 12); }); }
  const pick = ['us', 'ger', 'uk', 'su', 'fr', 'us', 'ger', 'su'];
  box.innerHTML = '';
  for (let i = 0; i < def.seats; i++) {
    const row = document.createElement('div'); row.className = 'seat'; row.style.setProperty('--c', BB_COLS[i]);
    const nat = nats.includes(pick[i]) ? pick[i] : nats[i % nats.length];
    row.innerHTML = `<b>${i + 1}</b><select class="who" aria-label="Commander, seat ${i + 1}"><option value="human">You</option><option value="normal">Computer</option><option value="hard">Computer (Hard)</option>${i >= 2 ? '<option value="empty">Empty</option>' : ''}</select>
      <select class="nat" aria-label="Army, seat ${i + 1}">${nats.map(n => `<option value="${n}">${(typeof ARMY_LABEL !== 'undefined' && ARMY_LABEL[n]) || NATION[n].n}</option>`).join('')}</select>
      <select class="co" aria-label="General, seat ${i + 1}"></select>
      <select class="tm" aria-label="Team, seat ${i + 1}"><option value="">No team</option><option>A</option><option>B</option><option>C</option><option>D</option></select>`;
    row.querySelector('.who').value = i === 0 ? 'human' : 'normal'; row.querySelector('.nat').value = nat;
    const fillCo = () => { const n = row.querySelector('.nat').value; row.querySelector('.co').innerHTML = bbGenerals(n).map(k => `<option value="${k}">${CO[k].n}</option>`).join(''); };
    row.querySelector('.nat').onchange = fillCo; fillCo();
    box.append(row);
  }
}
function bbReadSetup() {
  const f = $('#bbsetup'), map = f.querySelector('#bbmapsel').value, players = [];
  f.querySelectorAll('.seat').forEach((row, i) => { const who = row.querySelector('.who').value; if (who === 'empty') return;
    players.push({nat:row.querySelector('.nat').value, co:row.querySelector('.co').value, ai:who === 'human' ? false : who, team:row.querySelector('.tm').value, col:i}); });
  return {map, players, funds:+f.querySelector('#bbfunds').value, fog:f.querySelector('#bbfog').value === 'on', limit:+f.querySelector('#bblimit').value};
}
function bbLaunch(cfg = bbReadSetup()) {
  if (cfg.players.length < 2) { alert('A game needs at least two players.'); return false; }
  const sides = new Set(cfg.players.map((p, i) => p.team ? 'T' + p.team : 'P' + i)); if (sides.size < 2) { alert('Everyone is on the same team: put at least one player on another team, or on no team.'); return false; }
  let save = null; try { save = localStorage.getItem(BB.save); } catch (e) {}
  if (save && !FAST && !confirm('You have a base-building game saved. Start a new one instead? The saved game will be lost.')) return false;
  EPOCH++; UI.busy = false; UI.overShown = false; UID = 1; FX.parts = []; FX.flyers = [];
  bbNewGame(cfg);
  G.watch = cfg.players.every(p => p.ai);
  enterGame(); bbCentre();
  (async () => {
    const hum = G.bb.seats.find(t => !G.teams[t].ai);
    setTimeout(() => tip('bbstart', 'Base Building: your HQ (framed in your colour) builds inside the dashed zone. Start with a Supply Depot near the wheat: it comes with a lorry. Then Barracks, a Fuel Dump and a Vehicle Works. Destroy every enemy HQ to win. B or the Build button opens construction.'), 2200);
    if (hum) await say(G.teams[hum].co, CO[G.teams[hum].co].say.start);
    beginTurn();
  })();
  return true;
}
function bbCentre() { const v = viewerTeam() || G.turn, h = bbHQ(v) || bbHQ(G.turn); if (h) centerOn(h.x, h.y); }
function bbResume() {
  let s = null; try { s = localStorage.getItem(BB.save); } catch (e) {} if (!s) return false;
  EPOCH++; UI.busy = false; revive(s); UI.overShown = false;
  enterGame(); bbCentre(); hud();
  if (isAI(G.turn)) aiTurn(G.turn);
  return true;
}

/* ---------- 10. headless runner for the tests: the same rules and the same AI, with no animation ---------- */
function bbSimGame(cfg, maxDays = 120, opt = {}) {
  const keepFast = FAST; FAST = true; UID = 1;
  const t0 = performance.now(); let steps = 0, stalls = 0, maxTurn = 0, errors = [];
  bbNewGame(cfg); G.watch = true;
  let lastSig = '', still = 0;
  while (!G.over && G.day <= maxDays) {
    const team = G.turn, tt = performance.now();
    try {
      startTurn(team);
      if (checkEnd()) break;
      for (let i = 0; i < 400; i++) {
        const pl = aiNext(team, {}); if (!pl) break; steps++;
        const u = pl.u, [x, y] = pl.path[pl.path.length - 1]; u.x = x; u.y = y; if (pl.path.length > 1) u.dug = false;
        if (pl.path.length > 1) { mineCheck(u); if (!G.units.includes(u)) { if (checkEnd()) break; continue; } }
        if (pl.act === 'attack' && G.units.includes(pl.target)) attack(u, pl.target);
        else if (pl.act === 'join') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) joinUnits(u, t); }
        else if (pl.act === 'load') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) doLoad(u, t); }
        else if (pl.act === 'unload') for (const [c, [a, b]] of pl.drops) if (!unitAt(a, b)) doUnload(u, c, a, b);
        else if (pl.act === 'clear') clearTile(u, pl.at[0], pl.at[1]);
        if (G.units.includes(u)) { u.done = true; u.moved = true; settle(u); }
        if (checkEnd()) break;
      }
      if (G.over) break;
      aiBuild(team);
      if (opt.trace && (G.day % (opt.every || 5) === 0)) opt.trace.push(`d${G.day} p${team} ${G.bb.ai[team].mode}>${G.bb.ai[team].target} $${G.teams[team].funds} fuel ${JSON.stringify(bbFuel(team))} ` + Object.entries(G.units.filter(u => u.team === team).reduce((m, u) => (m[u.role + (u.left ? '*' : '')] = (m[u.role + (u.left ? '*' : '')] || 0) + 1, m), {})).map(([k, v]) => k + v).join(' '));
      for (const u of G.units) if (u.team === team) u.done = false;
      G.turn = endTurn(); checkEnd();
    } catch (e) { errors.push(String(e && e.stack || e).slice(0, 300)); G.turn = endTurn(); }
    const ms = performance.now() - tt; maxTurn = Math.max(maxTurn, ms); if (ms > 4000) stalls++;
    const sig = G.units.map(u => u.id + ':' + u.x + ',' + u.y + ':' + u.hp).join('|') + Object.values(G.teams).map(T => T.funds).join(',');
    if (sig === lastSig) { if (++still > G.bb.seats.length * 6) { stalls++; still = 0; } } else still = 0; lastSig = sig;
  }
  const B = G.bb, res = {map:cfg.map, n:B.n, winner:G.over ? G.over.winner : 0, why:G.over ? G.over.why : 'unfinished', day:G.day, steps, stalls, cut:B.cut || 0,
    maxTurnMs:Math.round(maxTurn), maxAiMs:Math.round(Math.max(0, ...Object.values(B.maxMs))), ms:Math.round(performance.now() - t0), errors,
    out:Object.assign({}, B.out), seats:B.seats.slice(), team:Object.assign({}, B.team), made:JSON.parse(JSON.stringify(B.made)), harvested:B.harvested || 0,
    winners:G.over ? B.seats.filter(t => bbSideKey(t) === bbSideKey(G.over.winner)) : [], stats:JSON.parse(JSON.stringify(G.stats)), spent:Object.assign({}, B.spent)};
  FAST = keepFast; if (!opt.keep) G = null;
  return res;
}
/* every map must be the same from every seat: each tile equals its images under the symmetry group */
function bbSymCheck(id) {
  const def = BB_MAP(id), {rows, starts} = bbMapData(id), S = BB_SYM[def.sym](def.W, def.H); let bad = 0;
  for (let y = 0; y < def.H; y++) for (let x = 0; x < def.W; x++) for (const f of S.T) { const [a, b] = f(x, y); if (rows[b][a] !== rows[y][x]) bad++; }
  const fields = rows.join('').split(',').length - 1;
  return {id, bad, starts:starts.length, fields, size:def.W + 'x' + def.H};
}
