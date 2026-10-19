/* ============================== PLAY ======================================
   Camera, drawing, input, menus, the turn loop, campaigns and screens. */
const $ = s => document.querySelector(s);
const cv = $('#cv'), ctx = cv.getContext('2d');
const bcv = $('#battle'), bctx = bcv.getContext('2d');
const cam = {x:0, y:0, z:.8};
let dpr = 1, FAST = false, ME = 1;
const UI = {mode:'idle', sel:null, reach:null, path:null, origin:null, cursor:{x:0, y:0}, targets:[], hoverEnemy:null, busy:false, cargoPick:null, campaign:null};
const sleep = ms => FAST ? Promise.resolve() : new Promise(r => setTimeout(r, SET.aiFast && G && isAI(G.turn) ? ms * .5 : ms));
const isAI = t => G && G.teams[t].ai;
const fmt = n => n.toLocaleString('en-GB');
const U = ART / 32;                                        // world units per art pixel of the 32 grid

/* ---------- fog of war: what the human player can see ---------- */
function viewerTeam() { if (!G) return 0; if (G.online) return G.online.seat; if (G.pbem) return G.turn; const h = [1, 2].filter(t => !G.teams[t].ai); return h.length === 2 ? G.turn : h[0] || 0; }
function refreshVision() { const v = viewerTeam(); UI.vis = v && (G.fog || isNight()) ? computeVision(v) : null; }
const seen = u => { const v = viewerTeam(); return !(v && subHidden(u, v)) && (!UI.vis || u.team === v || !!UI.vis[u.y * G.W + u.x]); };

/* ---------- camera ---------- */
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  if (G) clampCam();
}
/* the camera may run well past every edge: by the height of the HUD actually on screen (phone or desktop, shown or hidden)
   plus a quarter of the screen, so a tile under the top bar can always be dragged into the clear. A small map can be moved too. */
function hudEdges() {
  const bare = document.body.classList.contains('hudless'), h = id => { const el = document.getElementById(id); return !bare && el && !el.closest('[hidden]') ? el.getBoundingClientRect().height : 0; };
  return {top:h('top'), bot:h('bottom')};
}
function clampCam() {
  const vw = innerWidth / cam.z, vh = innerHeight / cam.z, mw = G.W * ART, mh = G.H * ART, e = hudEdges();
  const top = (e.top + innerHeight * .25) / cam.z, bot = (e.bot + innerHeight * .25) / cam.z, side = innerWidth * .3 / cam.z;
  const span = (a, b) => [Math.min(a, b), Math.max(a, b)], [x0, x1] = span(-side, mw - vw + side), [y0, y1] = span(-top, mh - vh + bot);
  cam.x = clamp(cam.x, x0, x1); cam.y = clamp(cam.y, y0, y1);
}
function minZoom() { return Math.min(.3, .9 * Math.min(innerWidth / (G.W * ART), innerHeight / (G.H * ART))); }   // far enough out to see the whole of any map
function fitCamera() {
  const fit = Math.min(innerWidth / (G.W * ART), (innerHeight - 220) / (G.H * ART));
  cam.z = clamp(Math.max(fit, .78), .35, 1.4);
  const mine = G.units.filter(u => u.team === ME);
  const c = mine.length ? {x:mine.reduce((s, u) => s + u.x, 0) / mine.length, y:mine.reduce((s, u) => s + u.y, 0) / mine.length} : {x:G.W / 2, y:G.H / 2};
  centerOn(c.x, c.y);
}
function centerOn(x, y) { cam.x = x * ART + ART / 2 - innerWidth / cam.z / 2; cam.y = y * ART + ART / 2 - innerHeight / cam.z / 2; clampCam(); }
function zoomAt(sx, sy, z) { z = clamp(z, minZoom(), 2.2); const wx = cam.x + sx / cam.z, wy = cam.y + sy / cam.z; cam.z = z; cam.x = wx - sx / z; cam.y = wy - sy / z; clampCam(); }
function focus(x, y) {
  if (FAST) return;
  const sx = (x * ART + ART / 2 - cam.x) * cam.z, sy = (y * ART + ART / 2 - cam.y) * cam.z, m = 130;
  if (sx < m || sy < m + 40 || sx > innerWidth - m || sy > innerHeight - m - 60) centerOn(x, y);
}
const screenToTile = (sx, sy) => [Math.floor((cam.x + sx / cam.z) / ART), Math.floor((cam.y + sy / cam.z) / ART)];

/* ---------- drawing ---------- */
let frame = 0;
function draw(t) {
  requestAnimationFrame(draw);
  if (!G || !terrainCanvas || document.body.dataset.screen !== 'game') return;
  frame = Math.floor(t / 140);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#16170f'; ctx.fillRect(0, 0, cv.width, cv.height);
  const sh = FX.shake > .3 ? FX.shake : 0; FX.shake *= .88;
  const s = dpr * cam.z; ctx.setTransform(s, 0, 0, s, (-cam.x + (Math.random() - .5) * sh) * s, (-cam.y + (Math.random() - .5) * sh) * s); ctx.imageSmoothingEnabled = cam.z < .7;
  ctx.drawImage(terrainCanvas, 0, 0);
  // water glints
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) { const tt = terr(x, y); if (tt !== 'sea' && tt !== 'river') continue;
    const k = (frame + x * 3 + y * 7) % 11; if (k < 3) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x * ART + (hrand(x, y, 9) * 48 | 0), y * ART + 10 + (hrand(x, y, 8) * 40 | 0) + k * 2, 8, 2); } }
  // properties, with flags fluttering
  for (const p of Object.values(G.props)) {
    const img = getPropSprite(terr(p.x, p.y), p.owner, G.theme, (frame + p.x) % 3); ctx.drawImage(img, p.x * ART, p.y * ART - 8 * U);
    if (p.cap < 20) { ctx.fillStyle = '#000a'; ctx.fillRect(p.x * ART + 2, p.y * ART + ART - 12, ART - 4, 10); ctx.fillStyle = '#e8c040'; ctx.fillRect(p.x * ART + 4, p.y * ART + ART - 10, (ART - 8) * p.cap / 20, 6); }
  }
  if (UI.mode === 'move' && UI.reach) {
    for (const n of UI.reach.values()) { if (!canStop(UI.sel, n.x, n.y)) continue; ctx.fillStyle = 'rgba(40,130,255,.42)'; ctx.fillRect(n.x * ART, n.y * ART, ART, ART); ctx.strokeStyle = 'rgba(190,225,255,.75)'; ctx.lineWidth = 2; ctx.strokeRect(n.x * ART + 1, n.y * ART + 1, ART - 2, ART - 2);
      if (TER[terr(n.x, n.y)].mines) { ctx.fillStyle = 'rgba(255,60,40,.25)'; ctx.fillRect(n.x * ART, n.y * ART, ART, ART); } }
    drawPath();
  }
  if (UI.mode === 'move' && UI.zone) drawAttackZone(UI.sel, UI.zone);
  if (UI.hoverEnemy) for (const k of UI.hoverEnemy) { const x = k % 1000, y = Math.floor(k / 1000); ctx.fillStyle = 'rgba(230,60,40,.3)'; ctx.fillRect(x * ART, y * ART, ART, ART); }
  if (['target', 'unload', 'clear', 'bridge'].includes(UI.mode)) for (const [x, y] of UI.targets) { ctx.fillStyle = UI.mode === 'target' ? 'rgba(230,60,40,.45)' : UI.mode === 'clear' ? 'rgba(120,230,120,.4)' : 'rgba(250,210,80,.45)'; ctx.fillRect(x * ART, y * ART, ART, ART); }
  if (UI.vis) {                                        // fog of war: unseen ground is dimmed and hides the enemy
    ctx.fillStyle = isNight() ? 'rgba(6,10,24,.55)' : 'rgba(30,34,40,.42)';
    for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (!UI.vis[y * G.W + x]) ctx.fillRect(x * ART, y * ART, ART, ART);
  }
  if (SET.danger && !isAI(G.turn) && !G.over) drawDanger();
  fxWrecks(ctx);
  const list = G.units.filter(seen).sort((a, b) => (a.d.air ? 1 : 0) - (b.d.air ? 1 : 0) || (a.ry ?? a.y) - (b.ry ?? b.y));
  for (const u of list) drawUnit(u, t);
  fxLife(ctx, t);
  fxDraw(ctx, performance.now());
  if (!isAI(G.turn) && !UI.busy) {
    const {x, y} = UI.cursor, X = x * ART, Y = y * ART, b = (frame % 4 < 2) ? 0 : 3, L = 16, W2 = 4;
    ctx.fillStyle = '#f4e8b0';
    for (const [cx, cy, dx, dy] of [[X - b, Y - b, 1, 1], [X + ART + b, Y - b, -1, 1], [X - b, Y + ART + b, 1, -1], [X + ART + b, Y + ART + b, -1, -1]]) {
      ctx.fillRect(cx - (dx < 0 ? L : 0), cy - (dy < 0 ? W2 : 0), L, W2); ctx.fillRect(cx - (dx < 0 ? W2 : 0), cy - (dy < 0 ? L : 0), W2, L); }
  }
  fxAtmosphere(ctx, t);
  if (frame % 6 === 0) drawMinimap();
}
/* everything this unit could hit this turn: from any tile it can stop on (or from where it stands, for guns that must not move) */
function attackZone(u) {
  const zone = new Set(), [a, b] = rangeOf(u); if (!b || (u.d.air && airGrounded())) return zone;
  const origins = u.d.indirect ? [{x:u.x, y:u.y}] : [...UI.reach.values()].filter(n => canStop(u, n.x, n.y));
  for (const o of origins) for (let dy = -b; dy <= b; dy++) for (let dx = -b; dx <= b; dx++) {
    const d = Math.abs(dx) + Math.abs(dy), x = o.x + dx, y = o.y + dy;
    if (d >= a && d <= b && inside(x, y)) zone.add(K(x, y));
  }
  return zone;
}
function drawAttackZone(u, zone) {
  const moveSet = new Set([...UI.reach.values()].filter(n => canStop(u, n.x, n.y)).map(n => K(n.x, n.y)));
  for (const k of zone) {
    const x = k % 1000, y = Math.floor(k / 1000); if (moveSet.has(k) && !u.d.indirect) continue;
    ctx.fillStyle = 'rgba(235,70,45,.24)'; ctx.fillRect(x * ART, y * ART, ART, ART);
    ctx.strokeStyle = 'rgba(255,140,110,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x * ART + .5, y * ART + .5, ART - 1, ART - 1);
  }
  // enemies in reach: outlined, with the damage they would take
  ctx.font = 'bold 18px "Courier Prime",monospace'; ctx.textAlign = 'center';
  for (const t of G.units) {
    if (t.team === u.team || !seen(t) || !canHit(u, t) || !zone.has(K(t.x, t.y))) continue;
    const lo = calcDamage(u, t, u.hp, 0), hi = calcDamage(u, t, u.hp, 9), X = t.x * ART, Y = t.y * ART;
    ctx.strokeStyle = '#ff5a3a'; ctx.lineWidth = 4; ctx.strokeRect(X + 3, Y + 3, ART - 6, ART - 6);
    const label = hi >= t.hp ? 'KILL' : `${lo}–${hi}%`;
    const w = ctx.measureText(label).width + 10;
    ctx.fillStyle = hi >= t.hp ? '#a8201a' : '#1a1410e8'; ctx.fillRect(X + ART / 2 - w / 2, Y - 18, w, 22);
    ctx.fillStyle = '#ffe08a'; ctx.fillText(label, X + ART / 2, Y - 1);
  }
}
function drawPath() {
  if (!UI.path || UI.path.length < 2) return;
  const h = ART / 2;
  ctx.strokeStyle = 'rgba(250,240,200,.9)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); UI.path.forEach(([x, y], i) => i ? ctx.lineTo(x * ART + h, y * ART + h) : ctx.moveTo(x * ART + h, y * ART + h)); ctx.stroke();
  ctx.strokeStyle = '#b03020'; ctx.lineWidth = 5; ctx.stroke();
  const [ex, ey] = UI.path[UI.path.length - 1]; ctx.fillStyle = '#b03020'; ctx.beginPath(); ctx.arc(ex * ART + h, ey * ART + h, 8, 0, 7); ctx.fill();
}
/* each side's marker colour; when both armies share or nearly share one (a mirror match, British against Soviets), the second side switches to a contrasting colour */
function teamCol(team) {
  const c = t => NATION[G.teams[t].nat].col.team; if (team !== 2) return c(team);
  const key = c(1) + c(2); if (G._tc2 && G._tc2.k === key) return G._tc2.v;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) || 0), d = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  let v = c(2); if (d(c(1), v) < 90) v = ['#f2f2ea', '#e8c040', '#3a9ad8', '#1a1a1a', '#9a4ac8'].sort((a, b) => d(c(1), b) - d(c(1), a))[0];
  G._tc2 = {k:key, v}; return v;
}
function drawUnit(u, t) {
  const rx = u.rx ?? u.x, ry = u.ry ?? u.y, X = rx * ART, Y = ry * ART;
  const nat = G.teams[u.team].nat, faceLeft = u.face ? u.face < 0 : u.team === 2;   // a unit turns to where it last moved or fired
  const anim = SET.anim ? (frame + u.id) % 8 : 0, grey = u.done && u.team === G.turn && !u.d.fixed;
  const f = u.moving || u.d.air || u.d.sea ? anim : (u.d.foot ? (Math.floor(frame / 3) + u.id) % 2 * 2 : 0);
  const img = getSprite(nat, u.role, f, grey, spriteVar(u, G.theme));
  const bob = u.d.air ? Math.round(Math.sin(t / 300 + u.id) * 3) - 8 : 0;
  const wet = (!u.d.sea && !u.d.air && ['sea', 'river', 'shallows'].includes(terr(u.x, u.y)) && !u.moving) || (u.d.sub && !u.revealed && !u.moving);   // DD tanks swimming, U-boats at periscope depth
  if (SET.mine) {                                     // your army at a glance: a pulsing gold ring on yours, a thin red one on theirs
    const own = u.team === (viewerTeam() || G.turn), cy = Y + ART - 7 + (u.d.air ? 1 : 0);
    ctx.strokeStyle = own ? `rgba(255,211,74,${(.7 + .3 * Math.sin(t / 260)).toFixed(2)})` : 'rgba(225,60,45,.75)'; ctx.lineWidth = own ? 4 : 2;
    ctx.beginPath(); ctx.ellipse(X + ART / 2, cy, 27, 7, 0, 0, 7); ctx.stroke();
    if (own) { const ty = Y - 6 + bob + Math.sin(t / 260) * 2; ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = '#1a1814'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X + ART / 2 - 6, ty); ctx.lineTo(X + ART / 2 + 6, ty); ctx.lineTo(X + ART / 2, ty + 7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  }
  if (u.d.air) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(X + ART / 2, Y + ART - 6, 20, 5, 0, 0, 7); ctx.fill(); }
  else if (!u.d.sea && !wet) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(X + ART / 2, Y + ART - 7, 24, 5, 0, 0, 7); ctx.fill(); }
  ctx.save();
  if (wet) { ctx.beginPath(); ctx.rect(X, Y - 20, ART, ART * .78 + 20); ctx.clip(); }
  if (faceLeft) { ctx.translate(X + ART, Y + bob + (wet ? 8 : 0)); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); }
  else ctx.drawImage(img, X, Y + bob + (wet ? 8 : 0));
  ctx.restore();
  if (wet) { ctx.strokeStyle = 'rgba(230,240,245,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(X + ART / 2, Y + ART * .8, 26, 4, 0, 0, 7); ctx.stroke(); }
  if (u.dug && !u.moving) { ctx.fillStyle = '#9a8a62'; for (let i = 0; i < 7; i++) { const a = Math.PI * (.1 + i * .133); ctx.beginPath(); ctx.ellipse(X + ART / 2 + Math.cos(a) * 26, Y + ART - 10 + Math.sin(a) * 7, 5, 3, 0, 0, 7); ctx.fill(); } }
  if (u.flash) { ctx.globalAlpha = .6; ctx.fillStyle = '#fff'; ctx.fillRect(X + 8, Y + 12, ART - 16, ART - 20); ctx.globalAlpha = 1; }
  const tc = teamCol(u.team);
  ctx.fillStyle = tc; ctx.fillRect(X + 2, Y + ART - 9, 8, 8); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(X + 2.5, Y + ART - 8.5, 7, 7);
  const hp = hpBars(u);
  ctx.font = 'bold 18px "Courier Prime",monospace'; ctx.textAlign = 'center';
  if (hp < 10) { ctx.fillStyle = '#111'; ctx.fillRect(X + ART - 20, Y + ART - 20, 20, 20); ctx.fillStyle = '#fff'; ctx.fillText(hp, X + ART - 10, Y + ART - 4); }
  const r = rankOf(u); if (r) { ctx.fillStyle = '#111a'; ctx.fillRect(X + 1, Y + 1, 14, 6 + r * 5); ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = 2;
    for (let i = 0; i < r; i++) { ctx.beginPath(); ctx.moveTo(X + 3, Y + 4 + i * 5); ctx.lineTo(X + 8, Y + 7 + i * 5); ctx.lineTo(X + 13, Y + 4 + i * 5); ctx.stroke(); } }
  if (u.cargo.length) { ctx.fillStyle = '#111'; ctx.fillRect(X + ART - 18, Y + 2, 16, 16); ctx.fillStyle = '#f0d060'; ctx.font = 'bold 14px monospace'; ctx.fillText(u.cargo.length, X + ART - 10, Y + 15); }
  if (u.core) { ctx.fillStyle = '#e8c040'; ctx.beginPath(); ctx.arc(X + 22, Y + 5, 3, 0, 7); ctx.fill(); }
  if (u.again && u.team === G.turn && !u.done) { ctx.fillStyle = '#ff9a4a'; ctx.font = 'bold 13px monospace'; ctx.fillText('×2', X + ART / 2, Y + 10); }
  const p = propAt(u.x, u.y); if (p && p.cap < 20 && u.d.cap && p.owner !== u.team && !u.moving) { ctx.fillStyle = '#e8c040'; ctx.fillRect(X + 4, Y + 18, 3, 14); ctx.fillRect(X + 7, Y + 18, 9, 6); }
}
function fx(type, x, y, dur, extra = {}) { if (type === 'text') fxText(x, y, extra.text, extra.col, dur); else if (type === 'boom') fxExplosion(x, y, .8); else if (type === 'smoke') { const [wx, wy] = T2W(x, y); fxSmoke(wx, wy, 5, .3, 12, 20); } }

/* ---------- minimap ---------- */
const mm = $('#minimap'), mmg = mm.getContext('2d');
function drawMinimap() {
  if (!G) return;
  const s = Math.max(2, Math.floor(Math.min(180 / G.W, 120 / G.H))); if (mm.width !== G.W * s) { mm.width = G.W * s; mm.height = G.H * s; }
  const C = PAL[G.theme] || PAL.normandy;
  const col = {plain:C.grass, road:C.road, forest:C.tree, bocage:C.hedge, hill:C.hill, river:C.water, bridge:'#7a6a52', sea:C.sea, beach:C.sand, bunker:'#8e8c84', ruins:'#7e7464', city:C.wall, hq:'#f0d060', fact:'#a08860', air:'#9a9a8e', port:'#7a766c', obst:'#5a5246', shingle:'#9a948a', wire:'#6a6a5a', mines:'#8a5a3a', cliff:'#7a7262', trench:'#6a5a3a', marsh:'#5a7a6a', field:C.wheat, block:'#8a8478'};
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) { mmg.fillStyle = col[terr(x, y)] || TER[terr(x, y)].mm || '#555'; mmg.fillRect(x * s, y * s, s, s); }
  for (const p of Object.values(G.props)) if (p.owner) { mmg.fillStyle = teamCol(p.owner); mmg.fillRect(p.x * s, p.y * s, s, s); }
  for (const u of G.units) { mmg.fillStyle = u.team === 1 ? '#fff' : '#111'; mmg.fillRect(u.x * s + 1, u.y * s + 1, Math.max(1, s - 2), Math.max(1, s - 2)); mmg.fillStyle = teamCol(u.team); mmg.fillRect(u.x * s + s / 2 - .5, u.y * s + s / 2 - .5, 1, 1); }
  mmg.strokeStyle = '#ffde6a'; mmg.lineWidth = 1; mmg.strokeRect(cam.x / ART * s, cam.y / ART * s, innerWidth / cam.z / ART * s, innerHeight / cam.z / ART * s);
}
mm.addEventListener('pointerdown', e => { if (!G) return; const r = mm.getBoundingClientRect(); centerOn((e.clientX - r.left) / r.width * G.W, (e.clientY - r.top) / r.height * G.H); e.stopPropagation(); });

/* ---------- HUD ---------- */
function hud() {
  if (!G) return;
  nextCount();
  for (const t of [1, 2]) {
    const T = G.teams[t], c = CO[T.co], el = $('#co' + t);
    el.classList.toggle('active', G.turn === t);
    el.querySelector('.pt').replaceChildren(portraitCanvas(T.co, 1));
    el.querySelector('.nm').textContent = c.n;
    el.querySelector('.nat').replaceChildren(flagCanvas(T.nat, 18, 12));
    el.querySelector('.fund').textContent = fmt(T.funds);
    const max = c.scop.star, per = STAR * (1 + T.uses * .2), filled = T.meter / per;
    el.querySelector('.meter').innerHTML = Array.from({length:max}, (_, i) => `<i class="${i < Math.floor(filled) ? 'on ' : ''}${i < c.cop.star ? '' : 'big'}" style="--f:${clamp(filled - i, 0, 1)}"></i>`).join('');
    el.querySelector('.pw').textContent = T.power === 1 ? c.cop.n.toUpperCase() : T.power === 2 ? c.scop.n.toUpperCase() : '';
  }
  { const d = clockAt(G.day), daily = G.clock.step >= 1440; $('#day').textContent = daily ? fmtClock(G.day) : hhmm(d);
    $('#turnno').textContent = `${daily ? d.getFullYear() : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear()} · turn ${G.day} · ${stepText(G.clock.step)} each${isNight() ? ' · night' : ''}`; }
  const o = G.objective;
  $('#goal').textContent = o.win === 'waves' ? waveGoal()
    : o.win === 'convoy' ? `Convoy: ${G.arrived} of ${o.need} ships through · ${G.units.filter(u => u.team === 1 && u.role === o.role).length} at sea`
    : o.win === 'survive' ? `Hold until ${fmtClock(o.days + 1, G.clock, true)} · keep ${G.holdNeed || 1} of your positions (${Object.values(G.props).filter(p => p.owner === 1).length} held)${o.protect ? ` · keep ${o.protectN || 1} ${udef(G.teams[1].nat, o.protect).n} afloat` : ''}`
    : o.win === 'kill' ? (o.n ? `Sink ${o.n} ${udef(G.teams[2].nat, o.role).n}s · ${(G.killTotal || 0) - G.units.filter(u => u.team === 2 && u.role === o.role).length} so far` : `Destroy every ${udef(G.teams[2].nat, o.role).n}`) + (o.limit ? ` by ${fmtClock(o.limit + 1, G.clock, true)}` : '')
    : o.limit ? `Take the HQ by ${fmtClock(o.limit + 1, G.clock, true)}` : 'Capture the enemy HQ';
  refreshVision();
  const mine = !isAI(G.turn) && !isRemote(G.turn) && !UI.busy;
  $('#endturn').disabled = !mine; $('#cop').hidden = !(mine && canPower(G.turn, 1)); $('#scop').hidden = !(mine && canPower(G.turn, 2));
  if (!$('#cop').hidden) $('#cop').textContent = CO[G.teams[G.turn].co].cop.n;
  if (!$('#scop').hidden) $('#scop').textContent = CO[G.teams[G.turn].co].scop.n;
  $('#ffwd').hidden = !isAI(G.turn);
  infoPanel();
}
function portraitCanvas(id, s) {                      // the portrait is painted at 192 px; shown at 96 × s, sharp on high-density screens
  const src = getPortrait(id), px = Math.round(Math.max(96 * s, 192)), c = mkCanvas(px, px), g = c.getContext('2d'); g.imageSmoothingEnabled = px < src.width; g.drawImage(src, 0, 0, px, px);
  c.style.width = c.style.height = 96 * s + 'px'; return c;
}
const FLAG_CACHE = {};
function flagCanvas(nat, w, h) { const k = nat + w + 'x' + h; let m = FLAG_CACHE[k]; if (!m) { m = FLAG_CACHE[k] = mkCanvas(w * 2, h * 2); drawFlag(m.getContext('2d'), nat, 0, 0, w * 2, h * 2); }   // each flag painted once; the menus get copies
  const c = mkCanvas(w * 2, h * 2); c.getContext('2d').drawImage(m, 0, 0); c.style.width = w + 'px'; c.style.height = h + 'px'; return c; }
function spriteCanvas(nat, role, s = 1, flip = false) { const src = getSprite(nat, role, 0), c = mkCanvas(ART * s, ART * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (flip) { g.translate(ART * s, 0); g.scale(-1, 1); } g.drawImage(src, 0, 0, ART * s, ART * s); return c; }
function infoPanel() {
  const {x, y} = UI.cursor; if (!G || !inside(x, y)) return;
  const t = terr(x, y), T = TER[t], p = propAt(x, y), u = unitAt(x, y);
  $('#tinfo').innerHTML = `<b>${T.n}</b><span class="stars">${'★'.repeat(T.def)}${'☆'.repeat(Math.max(0, 4 - T.def))}</span>` +
    (p ? `<span>${p.owner ? NATION[G.teams[p.owner].nat].adj : 'Neutral'}${p.cap < 20 ? ` · being captured: ${p.cap} of 20 left` : ''}</span>` : '') +
    `<span class="mvc">${['foot', 'tread', 'tire'].map(m => `${m === 'foot' ? 'Inf' : m === 'tread' ? 'Trk' : 'Whl'} ${T.mv[m] || '–'}`).join(' · ')}</span>` + (T.info ? `<span class="tip">${T.info}</span>` : '');
  const uEl = $('#uinfo');
  if (!u || !seen(u)) { uEl.hidden = true; return; }
  uEl.hidden = false;
  const [a, b] = rangeOf(u), r = rankOf(u);
  uEl.replaceChildren(spriteCanvas(G.teams[u.team].nat, u.role, 1, u.team === 2));
  const d = document.createElement('div');
  d.innerHTML = `<b>${u.d.n}</b><span class="nm2">${u.name}${r ? ` · <em>${RANKS[r].n}</em>` : ''}</span><span>${u.d.w}</span><span>HP ${hpBars(u)}/10${u.dug ? ' · dug in (+1★)' : ''} · Move ${moveOf(u)}${b ? ` · Range ${a === b ? a : a + '–' + b}` : ''}${u.kills ? ` · ${u.kills} kills` : ''}</span>` +
    (u.cargo.length ? `<span>Carrying: ${u.cargo.map(c => c.d.n).join(', ')}</span>` : '') +
    (usesFuel(u) ? `<span${(u.fuel ?? fuelMax(u)) <= 2 ? ' style="color:#ff9a6a"' : ''}>Fuel: ${u.fuel ?? fuelMax(u)} of ${fuelMax(u)} days aloft${(u.fuel ?? fuelMax(u)) <= 2 ? ': head for an airfield, a town you hold or a carrier' : ''}</span>` : '') +
    (u.d.sea && u.d.indirect ? `<span>Main guns at range ${a}–${b}; secondaries, depth charges and flak take on a ship alongside${u.role === 'dd' ? '; she can run in on a U-boat and depth-charge it on the move' : ''}</span>` : '') +
    (u.d.sub ? `<span>${u.revealed ? 'Surfaced: gave herself away by firing' : 'Submerged: invisible to the enemy unless found by asdic, aircraft or a ship alongside'}</span>` : '') +
    (u.d.asw ? '<span>Asdic: finds submerged U-boats within 2 squares</span>' : '') + (u.d.carrier ? '<span>Air strikes up to 8 squares, by day only</span>' : '') +
    `<span class="xp"><i style="width:${Math.min(100, (u.xp || 0) / (RANKS[Math.min(3, r + 1)].xp || 500) * 100)}%"></i></span>`;
  uEl.append(d);
}
function banner(text, sub, col) {
  if (FAST) return Promise.resolve();
  return new Promise(res => { const b = $('#banner'); b.innerHTML = `<div style="color:${col || '#f4e8c8'}">${text}</div><small>${sub || ''}</small>`;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); setTimeout(res, SET.aiFast && isAI(G.turn) ? 600 : 1300); });
}
function say(coId, text) {
  if (FAST) return Promise.resolve();
  return new Promise(res => {
    const d = $('#dialog'); d.querySelector('.pt').replaceChildren(portraitCanvas(coId, 1)); d.querySelector('.who').textContent = CO[coId].rank + ' ' + CO[coId].n;
    const txt = d.querySelector('.txt'); txt.textContent = ''; d.hidden = false;
    // he speaks: the line types out in time with his mumbling voice; a click finishes the line, a second click closes it
    musicDuck(true);
    const v = babble(coId, text, {zed:CO[coId].nat === 'zed'}), ms = Math.max(400, Math.min(v ? v.dur * 1000 : 0, text.length * 45) || text.length * 18), t0 = performance.now();
    let full = false; const tick = setInterval(() => { const n = Math.ceil(text.length * Math.min(1, (performance.now() - t0) / ms)); txt.textContent = text.slice(0, n); if (n >= text.length) { full = true; clearInterval(tick); } }, 30);
    const finish = () => { clearInterval(tick); txt.textContent = text; full = true; if (v) v.stop(); };
    let shut = false;
    const close = () => { if (shut) return; if (!full) return finish(); finish(); shut = true; musicDuck(false); d.hidden = true; d.removeEventListener('click', close); removeEventListener('keydown', key); res(); };
    const key = e => { if (['Enter', ' ', 'z', 'Z', 'Escape'].includes(e.key)) close(); };
    d.addEventListener('click', close); addEventListener('keydown', key);
    if (G && (G.watch || (G.teams[1].ai && G.teams[2].ai))) setTimeout(() => { if (!d.hidden && !shut) { finish(); close(); } }, 2600 + text.length * 25);   // spectators are not asked to click
  });
}

/* ---------- actions shared by player and AI ---------- */
async function animateMove(u, path) {
  if (!path || path.length < 2) return;
  if (FAST) { const [x, y] = path[path.length - 1]; if (x !== u.x) u.face = Math.sign(x - u.x); u.x = x; u.y = y; u.dug = false; return; }
  moveSound(u); u.moving = true; u.dug = false;
  const spd = SET.aiFast && isAI(u.team) ? 55 : 110;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1], [bx, by] = path[i], t0 = performance.now();
    if (bx !== ax) u.face = Math.sign(bx - ax);       // turn with the road
    await new Promise(r => { const tick = () => { const k = Math.min(1, (performance.now() - t0) / spd); u.rx = ax + (bx - ax) * k; u.ry = ay + (by - ay) * k; if (k < 1) setTimeout(tick, 16); else r(); }; tick(); });
    const [wx, wy] = T2W(bx, by);
    if (u.d.mt === 'tread' || u.d.mt === 'amphib' || u.d.mt === 'tire') fxDust(wx, wy + 16, 2, G.theme === 'winter' ? '230,236,240' : '150,130,95');
    if (u.d.sea || ['sea', 'river'].includes(terr(bx, by))) part({kind:'ring', x:wx, y:wy + 14, size:6, grow:20, life:600, col:'230,240,245'});
  }
  const [x, y] = path[path.length - 1]; u.x = x; u.y = y; delete u.rx; delete u.ry; u.moving = false;
  if (path.length > 2 && Math.random() < .3) fxBark(u, 'move');                    // a word as they arrive
}
async function afterMove(u) {
  const m = mineCheck(u);
  if (m) { sfx('boom'); fxExplosion(u.x, u.y, .9, {crater:true}); fxText(u.x, u.y, 'MINE! -' + Math.ceil(m / 10), '#ff7a5a'); await sleep(500); hud(); if (!isAI(u.team)) tip('mines', 'A minefield costs 2 to 3 HP to any ground unit that stops on it. Move through rather than stopping, or send engineers to clear it. Mined tiles show red in the move range.'); }
  return G.units.includes(u);
}
function showPromos(res) {
  for (const [u, r] of res.promo || []) if (G.units.includes(u)) { fxText(u.x, u.y, RANKS[r].n.toUpperCase() + '!', '#ffcf4a', 1800); sfx('capture'); if (!isAI(u.team)) tip('veteran', 'Promotion! Veterans fight and defend better (chevrons on the unit). Ranked units that survive a campaign victory join your core force for the next mission.'); }
}
async function doAttack(u, t) {
  focus(t.x, t.y);
  if (t.x !== u.x) { u.face = Math.sign(t.x - u.x); t.face = -u.face; }   // they turn to face each other
  const preA = u.hp, preD = t.hp, ux = u.x, uy = u.y, tx = t.x, ty = t.y;
  if (!FAST && !SET.battle) fxBark(u, 'atk');
  const res = attack(u, t);
  if (!FAST) {
    if (SET.battle) { await battleScene(u, t, res, preA, preD); fxAttackMap({...u, x:ux, y:uy}, {...t, x:tx, y:ty}, res.killed, {quiet:true}); }
    else { const dk = res.killed && deathKind(t.d); await fxAttackMap({...u, x:ux, y:uy}, {...t, x:tx, y:ty, dk}, res.killed); if (res.killed) killSound(t.d, .05, dk); }
    fxText(tx, ty, '-' + (Math.ceil(preD / 10) - Math.max(0, Math.ceil(t.hp / 10))));
    if (res.counter) { if (!SET.battle) { const dk = res.cKilled && deathKind(u.d); await sleep(200); await fxAttackMap({...t, x:tx, y:ty}, {...u, x:ux, y:uy, dk}, res.cKilled); if (res.cKilled) killSound(u.d, .05, dk); } fxText(ux, uy, '-' + (Math.ceil(preA / 10) - Math.max(0, Math.ceil(u.hp / 10)))); }
    if (res.pinned && G.units.includes(res.pinned)) { fxText(res.pinned.x, res.pinned.y, 'PINNED DOWN', '#ffb060', 1800); fxBark(res.pinned, 'hurt'); }
    if (res.killed && G.units.includes(u)) fxBark(u, 'kill');
    else if (G.units.includes(t) && t.hp <= 40) fxBark(t, 'hurt');
    else if (G.units.includes(u) && u.hp <= 30) fxBark(u, 'hurt');
    showPromos(res);
    await sleep(350);
  }
  return res;
}
async function doCapture(u) {
  const r = capture(u); sfx('capture'); if (Math.random() < .7) fxBark(u, 'cap');
  fxText(u.x, u.y, r.done ? 'Captured!' : `${propAt(u.x, u.y).cap} left to capture`, '#f0d060');
  if (r.done) await sleep(400);
  return r;
}
async function doClear(u, x, y) {
  const was = clearTile(u, x, y); sfx(was === 'mines' ? 'boom' : 'bangalore');
  if (!FAST) { fxExplosion(x, y, .8, {crater:false}); terrainCanvas && drawTile(terrainCanvas.getContext('2d'), x, y); fxText(x, y, was === 'mines' ? 'Mines cleared' : 'Lane open', '#9ae07a'); await sleep(500); }
}
function doLoad(u, t) { G.units = G.units.filter(o => o !== u); u.x = t.x; u.y = t.y; t.cargo.push(u); u.done = true; }
function doUnload(t, c, x, y) { t.landed = true; t.cargo = t.cargo.filter(o => o !== c); c.x = x; c.y = y; c.done = true; c.moved = true; G.units.push(c); if (!FAST) fxDust(...T2W(x, y), 3); mineCheck(c); }   // landing on a minefield sets it off
async function usePower(team, lv) {
  const T = G.teams[team], p = lv === 2 ? CO[T.co].scop : CO[T.co].cop;
  const ep = EPOCH; UI.busy = true; hud();
  await powerCutIn(team, lv, p);
  if (stale(ep)) return;                               // the player left during the cut-in: the power never fires in another game
  const plan = activatePower(team, lv);
  await powerEffects(plan);
  if (stale(ep)) return;
  UI.busy = false; hud();
  if (checkEnd()) gameOver();
}
function finishUnit(u) {
  u.done = true; u.moved = true;
  const s = settle(u);
  if (s === 'arrived') { if (!FAST) { fxText(u.x, u.y, 'Safe into harbour!', '#9ae07a', 1800); sfx('capture'); } return; }
  if (s === 'escaped') { if (!FAST) fxText(u.x, u.y, 'Escaped!', '#ff8a6a', 1800); return; }
  if (refreshAgain(u)) { fxText(u.x, u.y, 'Again!', '#ff9a4a'); }
}

/* ---------- turn loop ---------- */
/* every game session gets an epoch: an async turn loop that wakes up in a different game (after quitting, continuing or starting another) stops at once */
let EPOCH = 0;
const stale = ep => ep !== EPOCH || !G;
async function beginTurn() {
  const team = G.turn, ep = EPOCH;
  const {rep, pinned, ditched} = startTurn(team);
  UI.mode = 'idle'; UI.sel = null; UI.reach = null; UI.hoverEnemy = null;
  if (isLocalHotseat() && !FAST) { UI.busy = true; await handoff(team); UI.busy = false; if (stale(ep)) return; }
  hud(); musicMood(isNight() ? 'night' : G.teams[team].nat);
  await banner(fmtClock(G.day), `Turn ${G.day} · ${NATION[G.teams[team].nat].n} · ${CO[G.teams[team].co].n}`); if (stale(ep)) return;
  for (const u of pinned || []) fxText(u.x, u.y, 'PINNED DOWN', '#ffb060', 1800);
  for (const u of ditched || []) { fxText(u.x, u.y, 'OUT OF FUEL: LOST', '#ff8a6a', 2200); fxSmoke(...T2W(u.x, u.y), 4, .6, 10, 16); }
  if (!isAI(team) && G.units.some(u => u.team === team && usesFuel(u))) tip('fuel', 'Aircraft carry fuel for a few days aloft (shown in the unit panel). End a turn on or beside one of your airfields, towns, ports or depots (forward landing grounds), or alongside your carrier, to refuel. An aircraft that runs dry is lost.');
  if ((pinned || []).length && !isAI(team)) tip('pinned', 'Pinned down: a squad cut to half strength in the open on the beach goes to ground and cannot move or fire for a turn. Get them off the sand fast, to the shingle and the cover under the bluffs.');
  for (const u of rep) { fxText(u.x, u.y, '+repair', '#9ae07a'); part({kind:'cross', x:T2W(u.x, u.y)[0], y:T2W(u.x, u.y)[1], life:900}); }
  for (const e of dueEvents()) {
    let made = []; try { made = runEvent(e); } catch (err) { console.error('event failed', err); }
    if (made.length) { focus(made[0].x, made[0].y); for (const u of made) fxDust(...T2W(u.x, u.y), 6); }
    if (e.clear && terrainCanvas) { for (const [x, y] of e.clear) { drawTile(terrainCanvas.getContext('2d'), x, y); fxExplosion(x, y, .6, {crater:false}); } }
    if (e.say) { await say(G.teams[e.team].co, e.say); if (stale(ep)) return; }
  }
  if (checkEnd()) return gameOver();
  hud();
  if (!isAI(team)) { if (isNight()) tip('night', (airGrounded() ? 'Night has fallen. Aircraft are grounded and' : 'Night has fallen, but these crews are trained to attack by flarelight. Still,') + ' you can only see what your units can see. Woods, hedgerows and towns hide the enemy until you are next to them.'); else if (G.fog) tip('fog', 'Fog of war: you only see what your units see. Moving into an unseen enemy springs an ambush and ends the move. Recon cars and aircraft see furthest.');
    if (G.units.some(u => u.d.sub && u.team !== team)) tip('subs', 'Enemy U-boats are lurking submerged and invisible. Your escorts\' asdic finds them within two squares, aircraft spot them when overhead, and any ship alongside will see them. A U-boat that fires gives itself away until its next turn.');
    if (G.waves && G.waves.zed) tip('zed', 'Dead of Night: the dead come in waves, from more directions as the night goes on. Any infantry they kill rises as a Walker, so keep them at a distance: machine-gun nests, artillery and armour. Spitters lob bile over walls; Brutes tear open tanks; an Abomination comes every fifth wave.');
  else if (G.waves) tip('waves', 'Last Stand: waves come from the far edge every few turns, each stronger than the last. Supplies arrive with every wave; spend them at your depots. Dig in: units that hold still gain a star of cover.');
    if (G.objective.win === 'convoy') tip('convoy', 'Convoy battle: steam the merchant ships to the far edge of the map. Screen them with escorts; U-boats will go for the merchantmen.');
    if (canPower(team, 1)) tip('power', 'Your general\'s power is ready. Use it from the button at the bottom right, or click empty ground for the menu. Saving up for the Super Power gives a bigger effect.'); }
  if (isAI(team)) await aiTurn(team);
  else { autosave(); const u = G.units.find(o => o.team === team && !o.d.fixed); if (u) { UI.cursor = {x:u.x, y:u.y}; focus(u.x, u.y); } }
}
async function aiTurn(team) {
  const ep = EPOCH;
  UI.busy = true; hud();
  const lv = aiPower(team); if (lv) { await usePower(team, lv); if (stale(ep)) return; UI.busy = true; }
  for (let guard = 0; guard < 300; guard++) {
    if (G.over) break;
    let plan = null; try { plan = aiNext(team, {}); } catch (e) { console.error('AI planning failed', e); break; }   // an error ends the enemy's moves for this turn instead of freezing the game
    if (!plan) break;
    try { await execPlan(plan); } catch (e) { console.error('AI move failed', e); if (plan.u && G.units.includes(plan.u)) { plan.u.done = true; plan.u.moved = true; } }
    if (stale(ep)) return;                             // the player quit, or loaded another game, while this move played out
    if (checkEnd()) break;
  }
  if (!G.over) try { const made = aiBuild(team); if (made.length) { sfx('build'); for (const u of made) fx('smoke', u.x, u.y); } } catch (e) { console.error('AI build failed', e); }
  UI.busy = false;
  if (G.over) return gameOver();
  if (G.turn !== team) return;                         // never end a turn that is not ours
  await finishTurn();
}
async function execPlan(pl) {
  const u = pl.u, ep = EPOCH;
  if (!FAST) focus(u.x, u.y);
  await animateMove(u, pl.path);
  if (stale(ep)) return;
  if (pl.path && pl.path.length > 1 && !(await afterMove(u))) return;
  if (pl.act === 'attack' && pl.target && G.units.includes(pl.target)) await doAttack(u, pl.target);
  else if (pl.act === 'capture') await doCapture(u);
  else if (pl.act === 'clear') await doClear(u, pl.at[0], pl.at[1]);
  else if (pl.act === 'load') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) doLoad(u, t); }
  else if (pl.act === 'bridge') { const r = bridgeWork(u, pl.at[0], pl.at[1]); if (!FAST) { const g = terrainCanvas.getContext('2d'); for (const [dx, dy] of [[0, 0], ...DIRS]) if (inside(pl.at[0] + dx, pl.at[1] + dy)) drawTile(g, pl.at[0] + dx, pl.at[1] + dy);
    if (r === 'built') { sfx('build'); fxDust(...T2W(pl.at[0], pl.at[1]), 6); fxText(pl.at[0], pl.at[1], 'Bailey bridge built', '#9ae07a'); } else { sfx('boom'); fxExplosion(pl.at[0], pl.at[1], 1.6, {crater:false}); fxText(pl.at[0], pl.at[1], 'Bridge blown!', '#ff8a6a'); } } }
  else if (pl.act === 'join') { const t = G.units.find(o => o !== u && o.x === u.x && o.y === u.y); if (t) { joinUnits(u, t); if (!FAST) fxText(t.x, t.y, 'Joined', '#9ae07a'); } }
  else if (pl.act === 'unload') for (const [c, [x, y]] of pl.drops) if (!unitAt(x, y)) doUnload(u, c, x, y);
  if (G.units.includes(u)) finishUnit(u);
  if (!FAST) { hud(); await sleep(140); }
}
async function finishTurn() {
  if (G.over) return gameOver();
  for (const u of G.units) if (u.team === G.turn) u.done = false;
  G.turn = endTurn();
  const ended = checkEnd();
  if (G.online) { UI.busy = true; hud(); await netPushTurn(); if (ended) return gameOver(); return; }
  if (ended) return gameOver();
  if (G.pbem) { clearAutosave(); return showTurnCode(true); }
  if (!FAST) await beginTurn();
}
async function gameOver() {
  if (FAST || UI.overShown) return; UI.overShown = true;
  const w = G.over.winner, bothHuman = !G.teams[1].ai && !G.teams[2].ai, noHuman = G.teams[1].ai && G.teams[2].ai;
  const human = G.online ? G.online.seat : !G.teams[1].ai ? 1 : !G.teams[2].ai ? 2 : 1, won = w === human;
  const solo = !G.online && !G.pbem && !bothHuman && !noHuman && !G.watch;   // only a one-player game against the computer earns progress, veterans and medals
  const co = G.teams[w].co; UI.lastWon = won;
  await say(co, CO[co].say.win);
  let promoted = [], score = null;
  if (G.mission && solo) {
    const p = loadProg();
    if (won) { p.done[G.mission.id] = true; promoted = updateCore(p); score = missionScore(G.mission); p.rank = p.rank || {}; const old = p.rank[G.mission.id]; if (!old || RANK_ORDER.indexOf(score.rank) > RANK_ORDER.indexOf(old)) p.rank[G.mission.id] = score.rank; }
    else updateCore(p, true);
    saveProg(p);
  }
  clearAutosave();
  const why = {hq:'HQ captured', rout:'enemy routed', survive:'position held', time:'time ran out', kill:'objective destroyed', convoy:'the convoy is through', sunk:'too many ships lost', escape:'the quarry escaped', overrun:'the position was overrun', resign:'the other side resigned'}[G.over.why];
  const r = $('#result');
  r.querySelector('h2').textContent = bothHuman && !G.online ? `${NATION[G.teams[w].nat].n.toUpperCase()} WINS` : won ? 'VICTORY' : 'DEFEAT';   // hotseat: no single "you"
  r.querySelector('.why').textContent = `${NATION[G.teams[w].nat].n} wins: ${why} at ${fmtClock(G.day, G.clock, true)}.`;
  if (G.waves) { const held = G.waves.zed ? G.waves.best || 0 : Math.max(0, G.waves.n - 1), rec = waveSaveBest(G.waves.key, held);
    r.querySelector('h2').textContent = 'OVERRUN'; r.querySelector('.why').textContent = `You held out against ${held} wave${held === 1 ? '' : 's'}${rec ? ': a new record!' : `. Best on this map: ${waveBest(G.waves.key)}.`}`; }
  r.querySelector('.st').innerHTML = [1, 2].map(t => `<div><b>${CO[G.teams[t].co].n}</b><span>${NATION[G.teams[t].nat].n}</span><span>Destroyed: ${G.stats[t].kills}</span><span>Lost: ${G.stats[t].lost}</span></div>`).join('');
  r.querySelector('.score').innerHTML = score ? `<div class="rank r${score.rank}">${score.rank}</div><dl><dt>Speed</dt><dd>${score.speed}</dd><dt>Power</dt><dd>${score.power}</dd><dt>Technique</dt><dd>${score.tech}</dd></dl>` : '';
  const medals = solo ? recordGame(won) : [];
  r.querySelector('.vets').innerHTML = (medals.length ? '<h4>Decorated</h4>' + medals.map(id => `<span>${medalName(id)}</span>`).join('') : '') + (promoted.length ? '<h4>Into the core force</h4>' + promoted.map(c => `<span>${RANKS[rankOf(c)].n} · ${udef(c.nat, c.role).n} · ${c.name}</span>`).join('') : '');
  r.hidden = false;
  musicMood(won ? 'victory' : 'defeat', false, won ? G.teams[w].nat : null);
}

/* ---------- campaign progress and the core force ---------- */
function loadProg() {
  let raw = null; try { raw = localStorage.getItem('if44prog2'); } catch (e) {}
  try { const p = JSON.parse(raw || '{}'); if (!p || typeof p !== 'object') throw new Error('not an object'); return Object.assign({done:{}, core:{}, all:false}, p); }
  catch (e) {                                          // a damaged save is set aside, never wiped by the next save
    try { if (raw && !localStorage.getItem('if44prog2.damaged')) { localStorage.setItem('if44prog2.damaged', raw); localStorage.removeItem('if44prog2'); console.warn('progress save was damaged: kept a copy in if44prog2.damaged'); } } catch (e2) {}
    return {done:{}, core:{}, all:false};
  }
}
/* progress to and from a file: every if44 key in this browser (campaigns, medals, records, saved maps, settings) */
function progExport() {
  const out = {game:'bit-zkrieg', v:1, saved:new Date().toISOString(), keys:{}};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('if44') && !k.startsWith('if44auto')) out.keys[k] = localStorage.getItem(k); } } catch (e) {}
  const name = `bit-zkrieg-progress-${out.saved.slice(0, 10)}.json`, n = Object.keys(out.keys).length, msg = $('#progmsg');
  if (window.claude && claude.use) {                   // inside the claude.ai viewer a plain download link does nothing: the viewer offers the file instead
    msg.textContent = 'Preparing the file…';
    claude.use('downloads').then(dl => { if (!dl) throw {code:'unavailable'}; return dl.save({filename:name, data:JSON.stringify(out)}); })
      .then(() => { msg.textContent = `Saved ${n} records to a file.`; })
      .catch(e => { msg.textContent = e && e.code === 'declined' ? 'Not saved.' : 'Saving a file is not available here. Play at tristanhotham.com to save your progress to a file.'; });
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], {type:'application/json'})); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  msg.textContent = `Saved ${n} records to a file.`;
}
function progImport(file) {
  const msg = $('#progmsg'), rd = new FileReader();
  rd.onload = () => { try { const o = JSON.parse(rd.result); if (!o || o.game !== 'bit-zkrieg' || typeof o.keys !== 'object') throw new Error('this is not a Bit-zkrieg progress file');
      const ks = Object.keys(o.keys).filter(k => k.startsWith('if44') && typeof o.keys[k] === 'string'); if (!ks.length) throw new Error('the file is empty');
      if (!confirm(`Replace the progress in this browser with the file from ${String(o.saved || '').slice(0, 10) || 'an unknown date'}? (${ks.length} records)`)) return;
      try { const cur = localStorage.getItem('if44prog2'); if (cur) localStorage.setItem('if44prog2.before-import', cur); } catch (e) {}
      for (const k of ks) localStorage.setItem(k, o.keys[k]);
      msg.textContent = 'Progress loaded. Reloading…'; setTimeout(() => location.reload(), 900);
    } catch (e) { msg.textContent = 'That file could not be loaded: ' + e.message; } };
  rd.readAsText(file);
}
function saveProg(p) { try { localStorage.setItem('if44prog2', JSON.stringify(p)); } catch (e) {} }
/* survivors with a rank join the core force for their army; the fallen leave it */
const CORE_KEY = {itgv:'it'};                            // one army under two flags of convenience: the Regio Esercito in Greece and in Africa shares its veterans
const coreKey = nat => CORE_KEY[nat] || nat;
function updateCore(p, lostOnly) {
  const nat = G.teams[1].nat, key = coreKey(nat), core = (p.core[key] = p.core[key] || []);
  const alive = new Set(G.units.filter(u => u.team === 1).map(u => u.name));
  for (let i = core.length - 1; i >= 0; i--) if (G.coreNames && G.coreNames.includes(core[i].name) && !alive.has(core[i].name)) core.splice(i, 1);
  if (lostOnly) return [];
  const added = [];
  for (const u of G.units) if (u.team === 1 && rankOf(u) >= 1 && !u.d.fixed) {
    const ex = core.find(c => c.name === u.name);
    if (ex) { ex.xp = u.xp; ex.kills = u.kills; ex.role = u.role; } else { const c = {name:u.name, role:u.role, xp:u.xp, kills:u.kills, nat}; core.push(c); added.push(c); }
  }
  core.sort((a, b) => b.xp - a.xp); core.length = Math.min(core.length, 10);
  return added;
}
function deployCore(m) {
  const p = loadProg(), nat = G.teams[1].nat, core = (p.core[coreKey(nat)] || []).slice(0, m.coreSlots || 4);
  const mine = G.units.filter(u => u.team === 1); if (!mine.length) return;
  const cx = Math.round(mine.reduce((s, u) => s + u.x, 0) / mine.length), cy = Math.round(mine.reduce((s, u) => s + u.y, 0) / mine.length);
  G.coreNames = [];
  for (const c of core) {
    if (!udef(nat, c.role)) continue;
    const at = nearestFree(c.role, 1, cx, cy, 12); if (!at) continue;
    const u = spawn(1, {role:c.role, x:at[0], y:at[1], hp:100, xp:c.xp, name:c.name, kills:c.kills, core:true});
    if (u) G.coreNames.push(c.name);
  }
}

/* ---------- player input ---------- */
function selectTile(x, y) {
  if (!G || UI.busy || isAI(G.turn) || isRemote(G.turn) || G.over || !inside(x, y)) return;
  UI.cursor = {x, y};
  const u = unitAt(x, y);
  if (UI.mode === 'idle') {
    if (u && u.team === G.turn && !u.done) {
      UI.sel = u; UI.origin = {x:u.x, y:u.y}; UI.reach = reach(u, u.x, u.y, undefined, UI.vis); UI.zone = attackZone(u); UI.path = [[u.x, u.y]]; UI.mode = 'move'; sfx('select'); if (Math.random() < .55) fxBark(u, 'sel');
      if (u.d.carry) tip('carry', 'Transports carry two units. Move next to land (boats can beach on sand), then choose <i>Unload</i>. Boats cannot pass beach obstacles.');
      else if (u.d.clears) tip('eng', 'Engineers can <i>Clear obstacles</i> on their own tile or next to them: beach obstacles, wire and minefields. Open lanes for the boats and tanks.');
      else if (u.d.indirect) tip('indirect', 'Artillery, mortars, rockets and destroyers fire over other units but cannot move and fire in the same turn, and never take return fire.');
      return;
    }
    if (u && u.team !== G.turn && seen(u)) { showThreat(u); return; }
    const p = propAt(x, y);
    if (!u && p && p.owner === G.turn && TER[terr(x, y)].makes) { openBuild(p); return; }
    UI.hoverEnemy = null; openGameMenu(); return;
  }
  if (UI.mode === 'move') {
    const foe = unitAt(x, y);
    if (foe && foe.team !== UI.sel.team && seen(foe) && canHit(UI.sel, foe) && !(UI.sel.d.air && airGrounded())) {   // clicking an enemy attacks it: into the best firing position, then confirm on the forecast
      const fr = attackFrom(UI.sel, foe), sel = UI.sel, path = fr ? (fr[0] === sel.x && fr[1] === sel.y ? [[sel.x, sel.y]] : pathTo(UI.reach, fr[0], fr[1])) : null;
      if (path && !path.some(([a, b], i) => i > 0 && unitAt(a, b) && unitAt(a, b).team !== sel.team)) {
        UI.mode = 'busy';
        (async () => { UI.busy = true; await animateMove(sel, path); const alive = path.length < 2 || await afterMove(sel); UI.busy = false;
          if (!alive) { UI.mode = 'idle'; UI.sel = null; UI.reach = null; hud(); if (checkEnd()) gameOver(); return; }
          const tg = targetsFrom(sel, sel.x, sel.y, path.length > 1).filter(seen);
          if (!tg.includes(foe)) { UI.mode = 'menu'; openActions(sel); return; }
          UI.mode = 'target'; UI.targets = tg.map(t => [t.x, t.y]); UI.cursor = {x:foe.x, y:foe.y}; forecast(); })();
        return;
      }
    }
    const n = UI.reach.get(K(x, y));
    if (!n || !canStop(UI.sel, x, y)) { cancel(); return; }
    let path = pathTo(UI.reach, x, y), trapped = false; UI.mode = 'busy';
    for (let i = 1; i < path.length; i++) { const o = unitAt(path[i][0], path[i][1]); if (o && o.team !== UI.sel.team) { path = path.slice(0, i); trapped = true; break; } }   // walked into an unseen enemy
    while (path.length > 1 && unitAt(...path[path.length - 1]) && unitAt(...path[path.length - 1]) !== UI.sel && !canStop(UI.sel, ...path[path.length - 1])) path.pop();
    const sel = UI.sel;
    (async () => { UI.busy = true; await animateMove(sel, path); const alive = path.length < 2 || await afterMove(sel); UI.busy = false;
      if (alive && trapped) { sfx('mg42'); fxText(sel.x, sel.y, 'AMBUSH!', '#ff7a5a', 1600); shakeCam(6); finishAction(sel); return; }
      if (!alive) { UI.mode = 'idle'; UI.sel = null; UI.reach = null; hud(); if (checkEnd()) gameOver(); return; }
      UI.mode = 'menu'; openActions(sel); })();
  }
}
/* every tile a unit could attack on its next turn: from anywhere it can move to, or from where it stands for guns that cannot move and fire */
function threatTiles(e) {
  const set = new Set(), [a, b] = rangeOf(e); if (!b || (e.d.air && airGrounded())) return set;
  const r = e.d.indirect || e.d.fixed ? new Map([[K(e.x, e.y), {x:e.x, y:e.y}]]) : reach(e);
  for (const n of r.values()) for (let dy = -b; dy <= b; dy++) for (let dx = -b; dx <= b; dx++) { const d = Math.abs(dx) + Math.abs(dy); if (d >= a && d <= b && inside(n.x + dx, n.y + dy)) set.add(K(n.x + dx, n.y + dy)); }
  return set;
}
function showThreat(e) {
  UI.hoverEnemy = UI.hoverEnemy && UI.hoverEnemy.src === e ? null : Object.assign([...threatTiles(e)], {src:e});
}
/* ---------- the danger zone: everything every visible enemy can reach next turn (T) ---------- */
const DZ = {key:null, map:null};
function dangerMap() {
  const v = viewerTeam() || G.turn, foes = G.units.filter(u => u.team !== v && seen(u));
  const key = G.day + ':' + G.turn + ':' + v + ':' + (UI.vis ? 'f' : '') + foes.map(u => u.id + '@' + u.x + ',' + u.y + (u.cargo.length ? 'c' : '')).join(';') + ':' + G.units.length;
  if (DZ.key === key && DZ.g === G) return DZ.map;
  const m = new Map();
  for (const e of foes) for (const k of threatTiles(e)) m.set(k, (m.get(k) || 0) + 1);
  DZ.key = key; DZ.g = G; DZ.map = m; return m;
}
function drawDanger() {
  const m = dangerMap(); if (!m.size) return;
  for (const [k, c] of m) { const x = k % 1000, y = Math.floor(k / 1000); ctx.fillStyle = `rgba(214,48,36,${Math.min(.46, .13 + .07 * c).toFixed(2)})`; ctx.fillRect(x * ART, y * ART, ART, ART); }   // darker where several enemies overlap
  ctx.strokeStyle = 'rgba(255,128,96,.9)'; ctx.lineWidth = 3; ctx.beginPath();
  for (const k of m.keys()) { const x = k % 1000, y = Math.floor(k / 1000), X = x * ART, Y = y * ART;
    if (!m.has(k - 1)) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + ART); } if (!m.has(k + 1)) { ctx.moveTo(X + ART, Y); ctx.lineTo(X + ART, Y + ART); }
    if (!m.has(k - 1000)) { ctx.moveTo(X, Y); ctx.lineTo(X + ART, Y); } if (!m.has(k + 1000)) { ctx.moveTo(X, Y + ART); ctx.lineTo(X + ART, Y + ART); } }
  ctx.stroke();
}
function toggleDanger() {
  SET.danger = !SET.danger; saveSet(); const b = $('#danger'); if (b) { b.classList.toggle('on', !!SET.danger); b.setAttribute('aria-pressed', SET.danger ? 'true' : 'false'); }
  if (SET.danger) tip('danger', 'Danger zone: red shows every tile a visible enemy could attack on its next turn, after moving. Darker red means several enemies can reach it. Press T or the Danger button to hide it.');
}
/* ---------- your army at a glance: gold rings on your units, red on the enemy's (U) ---------- */
function toggleMine() {
  SET.mine = !SET.mine; saveSet(); const b = $('#mine'); if (b) { b.classList.toggle('on', !!SET.mine); b.setAttribute('aria-pressed', SET.mine ? 'true' : 'false'); }
}
/* the next unit you have not used: picked up and ready to move (the Next button; Tab only moves the cursor) */
function nextUnit() {
  if (!G || UI.busy || isAI(G.turn) || G.over) return;
  if (UI.mode === 'move') cancel(); if (UI.mode !== 'idle') return;
  const ready = G.units.filter(u => u.team === G.turn && !u.done && !u.d.fixed).sort((a, b) => a.y - b.y || a.x - b.x);
  if (!ready.length) { fxText(UI.cursor.x, UI.cursor.y, 'All units have moved', '#f4e8c8'); return; }
  const i = ready.findIndex(u => u.x === (UI.lastNext || {}).x && u.y === UI.lastNext.y), u = ready[(i + 1) % ready.length];
  UI.lastNext = {x:u.x, y:u.y}; centerOn(u.x, u.y); selectTile(u.x, u.y); hoverUpdate();
}
function nextCount() { const b = $('#nextu'); if (!b || !G) return; const n = G.units.filter(u => u.team === G.turn && !u.done && !u.d.fixed).length; b.textContent = n ? `Next · ${n}` : 'Next'; b.disabled = !n || isAI(G.turn); }
function cancel() {
  if (UI.mode === 'move') { UI.mode = 'idle'; UI.sel = null; UI.reach = null; sfx('cancel'); }
  else if (['menu', 'target', 'unload', 'clear', 'bridge'].includes(UI.mode)) {
    const u = UI.sel; if (UI.mode === 'menu') { if (!u.moved) { u.x = UI.origin.x; u.y = UI.origin.y; } UI.mode = 'move'; UI.reach = reach(u, u.x, u.y, undefined, UI.vis); UI.zone = attackZone(u); closeMenu(); }
    else { UI.mode = 'menu'; openActions(u); }
    sfx('cancel');
  } else if (UI.mode === 'build' || UI.mode === 'gmenu') { closeMenu(); UI.mode = 'idle'; }
  UI.hoverEnemy = null; $('#forecast').hidden = true;
}
function menuAt(items, x, y) {
  const m = $('#menu'); m.innerHTML = ''; m.hidden = false; m.classList.remove('build');
  for (const it of items) { const b = document.createElement('button'); b.innerHTML = it.html || it.label; b.disabled = !!it.disabled; b.onclick = e => { e.stopPropagation(); sfx('click'); it.fn(); }; m.append(b); }
  const sx = (x * ART + ART - cam.x) * cam.z + 10, sy = (y * ART - cam.y) * cam.z;
  m.style.left = Math.min(innerWidth - m.offsetWidth - 10, sx) + 'px'; m.style.top = clamp(sy, 90, innerHeight - m.offsetHeight - 130) + 'px';
  m.querySelector('button:not([disabled])')?.focus();
}
function closeMenu() { $('#menu').hidden = true; }
function openActions(u) {
  const items = [], moved = u.x !== UI.origin.x || u.y !== UI.origin.y;
  const other = G.units.find(o => o !== u && o.x === u.x && o.y === u.y);
  if (other && canCarry(other, u)) items.push({label:'Board', fn:() => { closeMenu(); doLoad(u, other); sfx('select'); finishAction(u); }});
  else if (other && canJoin(u, other) && (tip('join', 'Two damaged units of the same type can <i>Join</i> into one. Any strength over 10 HP comes back as funds.'), true)) items.push({label:'Join', fn:() => { closeMenu(); const r = joinUnits(u, other); sfx('select'); fxText(other.x, other.y, r ? `Joined +${fmt(r)}` : 'Joined', '#9ae07a'); UI.mode = 'idle'; UI.sel = null; hud(); }});
  else {
    const tg = targetsFrom(u, u.x, u.y, moved).filter(seen);
    if (tg.length) items.push({label:'Fire', fn:() => { closeMenu(); UI.mode = 'target'; UI.targets = tg.map(t => [t.x, t.y]); UI.cursor = {x:tg[0].x, y:tg[0].y}; forecast(); }});
    if (canCapture(u, u.x, u.y)) items.push({label:'Capture', fn:async () => { closeMenu(); UI.busy = true; await doCapture(u); UI.busy = false; finishAction(u); }});
    const bs = bridgeSpots(u, u.x, u.y);
    if (bs.some(([a, b]) => terr(a, b) === 'bridge')) items.push({label:'Blow the bridge', fn:() => { closeMenu(); UI.mode = 'bridge'; UI.targets = bs.filter(([a, b]) => terr(a, b) === 'bridge'); }});
    if (bs.some(([a, b]) => terr(a, b) === 'river')) items.push({label:`Bailey bridge (${fmt(BAILEY)})`, fn:() => { closeMenu(); UI.mode = 'bridge'; UI.targets = bs.filter(([a, b]) => terr(a, b) === 'river'); }});
    const cs = clearSpots(u, u.x, u.y);
    if (cs.length) items.push({label:'Clear obstacles', fn:() => { closeMenu(); UI.mode = 'clear'; UI.targets = cs; }});
    for (const c of u.cargo) { const sp = unloadSpots(u, u.x, u.y, c); if (sp.length) items.push({label:'Unload ' + c.d.n, fn:() => { closeMenu(); UI.mode = 'unload'; UI.cargoPick = c; UI.targets = sp; }}); }
    items.push({label:'Wait', fn:() => { closeMenu(); finishAction(u); }});
  }
  menuAt(items, u.x, u.y);
}
/* ---------- the forecast: what an attack will do, before you commit ----------
   Shown when choosing a target (Fire), and when hovering an enemy your selected unit could reach this turn
   (worked out from the best tile it could attack from). Damage range, the target's HP before and after,
   the counter-attack you would take, and why the numbers are what they are. */
function attackFrom(u, t) {                             // the tile the selected unit would fire from: where it stands, or the safest reachable tile in range
  if ((u.d.indirect && u.role !== 'dd') || u.d.fixed || inRange(u, u.x, u.y, t)) return inRange(u, u.x, u.y, t) ? [u.x, u.y] : null;
  let best = null, bs = -1;
  for (const n of (UI.reach || new Map()).values()) {
    if (!(u.d.indirect ? t.d.sub && closeShot(u, t, Math.abs(t.x - n.x) + Math.abs(t.y - n.y)) : inRange(u, n.x, n.y, t)) || !canStop(u, n.x, n.y) || (unitAt(n.x, n.y) && unitAt(n.x, n.y) !== u)) continue;
    const s = TER[terr(n.x, n.y)].def; if (s > bs) { bs = s; best = [n.x, n.y]; }
  }
  return best;
}
function forecastHTML(u, t, ax, ay, firing) {
  const span = (a, b) => a === b ? String(a) : a + '–' + b, hp = v => Math.max(0, Math.ceil(v / 10));
  const lo = Math.min(t.hp, calcDamage(u, t, u.hp, 0, ax, ay)), hi = Math.min(t.hp, calcDamage(u, t, u.hp, 9, ax, ay));   /* never more than it has left (learned from Neon) */
  const stars = t.d.air ? 0 : TER[terr(t.x, t.y)].def + (t.dug ? 1 : 0);
  let h = `<div class="fc-row"><b class="fc-me">${u.d.n}</b> ▶ <b class="fc-foe">${t.d.n}</b> <span class="fc-dim">${t.d.air ? 'in the air' : TER[terr(t.x, t.y)].n + ' ' + '★'.repeat(stars) + (t.dug ? ' (dug in)' : '')}</span></div>`;
  h += `<div class="fc-row">Damage <b>${span(lo, hi)}%</b> · its HP ${hp(t.hp)} → <b>${span(hp(t.hp - hi), hp(t.hp - lo))}</b>${lo >= t.hp ? ' <b class="fc-kill">DESTROYS</b>' : hi >= t.hp ? ' <span class="fc-may">may destroy</span>' : ''}</div>`;
  const tFrom = Object.assign({}, u, {x:ax, y:ay, dug:ax === u.x && ay === u.y && u.dug});   // a foxhole only counts if it fires from where it dug in
  if (lo < t.hp && canCounter(t, tFrom)) {
    let c1 = calcDamage(Object.assign({}, t, {hp:t.hp - hi}), tFrom, Math.max(1, t.hp - hi), 0, t.x, t.y, ax, ay), c2 = calcDamage(Object.assign({}, t, {hp:t.hp - lo}), tFrom, t.hp - lo, 9, t.x, t.y, ax, ay), cl = v => Math.min(u.hp, v);
    c1 = cl(c1); c2 = cl(Math.max(c1, c2));
    h += `<div class="fc-row">Counter <b class="fc-foe">${span(c1, c2)}%</b> · your HP ${hp(u.hp)} → ${span(hp(u.hp - c2), hp(u.hp - c1))}${c2 >= u.hp ? ' <span class="fc-may">could lose it</span>' : ''}</div>`;
  } else h += `<div class="fc-row fc-dim">${lo >= t.hp ? 'No counter: it will not survive' : u.d.indirect ? 'Indirect fire: no counter' : !canHit(t, u) ? 'It cannot fire back at you' : 'No counter-attack'}</div>`;
  // why: the pieces of the damage sum (engine.js calcDamage)
  const atk = sumGroup(u.team, 'atk', u.d, terr(ax, ay)) + (G.teams[u.team].power ? 10 : 0) + RANKS[rankOf(u)].atk, dco = sumGroup(t.team, 'def', t.d, terr(t.x, t.y)) + (G.teams[t.team].power ? 10 : 0) + RANKS[rankOf(t)].def;
  const why = [`${Math.round(baseDmg(u.d, t.d) * u.d.pow * (t.d.armour ? u.d.powArm : 1))}% base vs ${t.d.n.split(' (')[0]}`];
  if (atk) why.push(`your bonuses ${atk > 0 ? '+' : ''}${atk}%`);
  if (stars) why.push(`its cover −${stars * hp(t.hp)}%`);
  if (dco) why.push(`its bonuses ${dco > 0 ? '+' : ''}${dco}% defence`);
  if (hp(u.hp) < 10) why.push(`your strength ${hp(u.hp)}/10`);
  if (t.d.arm < 1) why.push('fortified');
  h += `<div class="fc-row fc-dim">Why: ${why.join(' · ')}</div>`;
  if (firing) h += `<div class="fc-btns"><button id="fcGo">Attack</button><button id="fcBack" class="ghost">Back</button></div>`;
  else h += `<div class="fc-row fc-dim">${ax === u.x && ay === u.y ? 'From where it stands.' : 'If it moves in and fires from the best cover in reach.'}</div>`;
  return h;
}
function forecast() {
  const el = $('#forecast'), u = UI.sel, t = unitAt(UI.cursor.x, UI.cursor.y);
  const hide = () => { el.hidden = true; el.dataset.k = ''; };
  if (!u || !t || t.team === u.team || !seen(t)) return hide();
  let ax = u.x, ay = u.y, firing = false;
  if (UI.mode === 'target') { if (!UI.targets.some(([x, y]) => x === t.x && y === t.y)) return hide(); firing = true; }
  else if (UI.mode === 'move') { if (!canHit(u, t) || u.d.air && airGrounded()) return hide(); const f = attackFrom(u, t); if (!f) return hide(); [ax, ay] = f; }
  else return hide();
  const key = [u.id, t.id, ax, ay, firing, u.hp, t.hp].join(); if (el.dataset.k === key && !el.hidden) return;
  el.dataset.k = key; el.innerHTML = forecastHTML(u, t, ax, ay, firing); el.hidden = false;
  if (firing) { $('#fcGo').onclick = e => { e.stopPropagation(); fireAt(t); }; $('#fcBack').onclick = e => { e.stopPropagation(); cancel(); }; }
}
async function finishAction(u) {
  if (G.units.includes(u)) finishUnit(u);
  UI.mode = 'idle'; UI.sel = null; UI.reach = null; UI.targets = []; $('#forecast').hidden = true;
  hud();
  if (checkEnd()) return gameOver();
}
function openBuild(p) {
  const kind = TER[terr(p.x, p.y)].makes, T = G.teams[G.turn];
  UI.mode = 'build';
  const roles = buildable(G.turn, kind);
  const items = roles.map(r => { const d = udef(T.nat, r), c = unitCost(G.turn, r);
    return {html:`<span class="bi"></span><span class="bn">${d.n}<small>${d.w} · move ${d.mv}${d.rng[1] ? ' · range ' + (d.rng[0] === d.rng[1] ? d.rng[0] : d.rng[0] + '–' + d.rng[1]) : ''}</small></span><span class="bc">${fmt(c)}</span>`, disabled:c > T.funds, role:r,
      fn:() => { T.funds -= c; const u = spawn(G.turn, {role:r, x:p.x, y:p.y, hp:100}); u.done = true; u.moved = true; u.bought = true; sfx('build'); closeMenu(); autosave();   /* saved at once: a reload must not refund the unit and lose it */ UI.mode = 'idle'; fx('smoke', p.x, p.y); hud(); if (Math.random() < .6) setTimeout(() => fxBark(u, 'new'), 500); }}; });
  items.push({label:'Close', fn:() => { closeMenu(); UI.mode = 'idle'; }});
  menuAt(items, p.x, p.y);
  const m = $('#menu'); m.classList.add('build');
  m.querySelectorAll('.bi').forEach((el, i) => el.append(spriteCanvas(T.nat, items[i].role, .75, G.turn === 2)));
  m.style.top = '96px'; m.style.left = Math.max(10, Math.min(innerWidth - m.offsetWidth - 10, (p.x * ART + ART - cam.x) * cam.z + 10)) + 'px';
}
function openGameMenu() {
  UI.mode = 'gmenu';
  const t = G.turn, items = [];
  if (canPower(t, 1)) items.push({label:'Power: ' + CO[G.teams[t].co].cop.n, fn:() => { closeMenu(); UI.mode = 'idle'; usePower(t, 1); }});
  if (canPower(t, 2)) items.push({label:'Super: ' + CO[G.teams[t].co].scop.n, fn:() => { closeMenu(); UI.mode = 'idle'; usePower(t, 2); }});
  items.push({label:'Adviser: suggest a move (H)', fn:() => { closeMenu(); UI.mode = 'idle'; showHint(); }});
  items.push({label:'End turn', fn:() => { closeMenu(); UI.mode = 'idle'; endTurnClick(); }});
  if (!G.online) items.push({label:'Save as turn code', fn:() => { closeMenu(); UI.mode = 'idle'; showTurnCode(false); }});
  items.push({label:'Intel: ' + CO[G.teams[t].co].n, fn:() => { closeMenu(); UI.mode = 'idle'; showCO(G.teams[t].co); }});
  items.push({label:'Close', fn:() => { closeMenu(); UI.mode = 'idle'; }});
  menuAt(items, UI.cursor.x, UI.cursor.y);
}
function endTurnClick(sure) { if (G && G.online && G.online.pending) { G.online.pending = false; UI.busy = true; netPushTurn(); return; } if (!G || UI.busy || isAI(G.turn) || isRemote(G.turn) || G.over) return;
  const idle = G.units.filter(u => u.team === G.turn && !u.done && !u.d.fixed).length;
  if (idle && !sure && SET.confirmEnd !== false) { UI.mode = 'gmenu'; menuAt([{html:`<span>${idle} unit${idle > 1 ? 's have' : ' has'} no orders yet.</span>`, disabled:true}, {label:'End turn anyway', fn:() => { closeMenu(); UI.mode = 'idle'; endTurnClick(true); }}, {label:'Go back', fn:() => { closeMenu(); UI.mode = 'idle'; cycleUnit(1); }}], UI.cursor.x, UI.cursor.y); return; } closeMenu(); UI.mode = 'idle'; sfx('turn'); finishTurn(); }
function showCO(id) {
  const c = CO[id], d = $('#coinfo');
  d.querySelector('.pt').replaceChildren(portraitCanvas(id, 2));
  d.querySelector('.txt').innerHTML = `<h3>${c.rank} ${c.n}</h3><em>"${c.nick}"</em><p>${c.bio}</p><dl><dt>Always</dt><dd>${c.d2d.txt}</dd><dt>${c.cop.n} (${c.cop.star}★)</dt><dd>${c.cop.txt}</dd><dt>${c.scop.n} (${c.scop.star}★)</dt><dd>${c.scop.txt}</dd></dl>`;
  d.hidden = false;
}

let drag = null;
/* touch: two fingers pinch to zoom; one finger drags the map, and a tap that only looks (terrain, an enemy in range) asks for a second tap to act */
const PTRS = new Map(); let pinch = null;
/* the ghost tap (learned from Neon Protocol): the map acts on pointerup, then the browser fires its own click at the same spot.
   If the tap opened a menu, that click lands on the row under the finger and buys a tank. A touch or pen press that began on the
   map may not click anything else for a second; keyboard and scripted clicks (detail 0) and mouse clicks pass. */
const TAP = {t:0, onMap:false, touch:false};
addEventListener('pointerdown', e => { TAP.t = performance.now(); TAP.onMap = e.target === cv; TAP.touch = e.pointerType === 'touch' || e.pointerType === 'pen'; }, true);
addEventListener('click', e => { if (TAP.onMap && TAP.touch && e.detail > 0 && e.target !== cv && performance.now() - TAP.t < 1000) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
cv.addEventListener('pointerdown', e => { auInit(); UI.touch = e.pointerType === 'touch'; PTRS.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (UI.touch && G) tip('touch', 'Drag to scroll the map and pinch to zoom. Tap a unit, then tap where it should go. Tap an enemy once to see the odds, and again to attack. Tap empty ground to see what it is; tap it again for the menu.');
  if (PTRS.size === 2) { const [a, b] = [...PTRS.values()]; pinch = {d:Math.hypot(a.x - b.x, a.y - b.y) || 1, z:cam.z}; if (drag) drag.moved = true; return; }   // a second finger turns the drag into a pinch
  drag = {x:e.clientX, y:e.clientY, cx:cam.x, cy:cam.y, moved:false, id:e.pointerId}; });
addEventListener('pointercancel', e => { PTRS.delete(e.pointerId); if (PTRS.size < 2) pinch = null; if (drag && drag.id === e.pointerId) drag = null; });
addEventListener('pointermove', e => {
  if (!G || document.body.dataset.screen !== 'game') return;
  if (PTRS.has(e.pointerId)) PTRS.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (pinch && PTRS.size === 2) { const [a, b] = [...PTRS.values()]; zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d); return; }
  if (drag && e.pointerId === drag.id) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true; if (drag.moved) { cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; clampCam(); } return; }
  if (e.target !== cv) return;
  const [x, y] = screenToTile(e.clientX, e.clientY); if (!inside(x, y)) return;
  if (x !== UI.cursor.x || y !== UI.cursor.y) { UI.cursor = {x, y}; hoverUpdate(); }
});
addEventListener('pointerup', e => {
  PTRS.delete(e.pointerId); if (PTRS.size < 2) pinch = null;
  if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
  if (d.moved || e.target !== cv) return;
  const [x, y] = screenToTile(e.clientX, e.clientY);
  if (e.button === 2) { cancel(); return; }
  if (UI.touch && touchPeek(x, y)) return;
  tileAction(x, y);
});
function touchPeek(x, y) {                                // a finger cannot hover: the first tap shows what a mouse-over would, the second acts
  const k = K(x, y), again = UI.peek === k; UI.peek = null;
  if (again || !G || UI.busy || G.over || isAI(G.turn) || isRemote(G.turn) || !inside(x, y)) return false;
  const u = unitAt(x, y);
  const look = UI.mode === 'move' && UI.sel && u && u.team !== UI.sel.team && seen(u) && canHit(UI.sel, u)   // an enemy in range: the odds first
    || UI.mode === 'idle' && !u && !(propAt(x, y) && propAt(x, y).owner === G.turn && TER[terr(x, y)].makes);   // bare ground: what it is, not the menu
  if (!look) return false;
  UI.peek = k; UI.cursor = {x, y}; hoverUpdate(); sfx('click'); return true;
}
function tileAction(x, y) {
  if (UI.mode === 'target') { const t = unitAt(x, y); if (t && UI.targets.some(([a, b]) => a === x && b === y)) fireAt(t); else cancel(); return; }
  if (UI.mode === 'unload') { if (UI.targets.some(([a, b]) => a === x && b === y)) { const u = UI.sel; doUnload(u, UI.cargoPick, x, y); sfx('select'); if (u.cargo.length && u.cargo.some(c => unloadSpots(u, u.x, u.y, c).length)) { u.moved = true; UI.mode = 'menu'; openActions(u); } else finishAction(u); } else cancel(); return; }
  if (UI.mode === 'bridge') { if (UI.targets.some(([a, b]) => a === x && b === y)) { const u = UI.sel; const r = bridgeWork(u, x, y); sfx(r === 'blown' ? 'boom' : 'build'); if (r === 'blown') fxExplosion(x, y, 1.6, {crater:false}); else fxDust(...T2W(x, y), 8); drawTile(terrainCanvas.getContext('2d'), x, y); fxText(x, y, r === 'blown' ? 'Bridge blown' : 'Bailey bridge up', '#9ae07a'); finishAction(u); } else cancel(); return; }
  if (UI.mode === 'clear') { if (UI.targets.some(([a, b]) => a === x && b === y)) { const u = UI.sel; UI.busy = true; doClear(u, x, y).then(() => { UI.busy = false; finishAction(u); }); } else cancel(); return; }
  if (UI.mode === 'menu' || UI.mode === 'build' || UI.mode === 'gmenu') { cancel(); return; }
  selectTile(x, y);
}
cv.addEventListener('contextmenu', e => { e.preventDefault(); cancel(); });
cv.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, cam.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, {passive:false});
function hoverUpdate() {
  if (UI.mode === 'move' && UI.sel) { const n = UI.reach.get(K(UI.cursor.x, UI.cursor.y)); UI.path = n ? pathTo(UI.reach, UI.cursor.x, UI.cursor.y) : UI.path; }
  forecast(); infoPanel();
}
async function fireAt(t) {
  const u = UI.sel; UI.mode = 'busy'; UI.busy = true; UI.targets = []; $('#forecast').hidden = true;
  await doAttack(u, t);
  UI.busy = false;
  if (G.units.includes(u)) finishAction(u); else { UI.mode = 'idle'; UI.sel = null; hud(); if (checkEnd()) gameOver(); }
}
/* overlays answer the keyboard: Enter takes the main button, Escape the way out, and Tab stays inside them; screen readers hear them as dialogs */
const OVERLAYS = ['#codebox', '#result', '#netbox', '#handoff', '#tip'];
function openOverlay() { for (const id of OVERLAYS) { const el = $(id); if (el && !el.hidden) return el; } return null; }
function overlayButtons(el) { return [...el.querySelectorAll('button:not([disabled]), textarea, input, select')].filter(b => !b.hidden && b.offsetParent !== null); }
function overlayPrimary(el) { return el.querySelector('.ok:not([hidden]), #resultok, button.go, button') ; }
addEventListener('keydown', e => {
  const el = openOverlay(); if (!el) return;
  if (e.key === 'Escape') { const c = el.querySelector('.cancel, .close'); if (c) { e.preventDefault(); e.stopImmediatePropagation(); c.click(); } else if (el.id === 'tip') { e.preventDefault(); e.stopImmediatePropagation(); el.querySelector('button')?.click(); } return; }
  if (e.key === 'Tab') { const bs = overlayButtons(el); if (!bs.length) return; e.preventDefault(); e.stopImmediatePropagation(); const i = bs.indexOf(document.activeElement); bs[(i + (e.shiftKey ? -1 : 1) + bs.length) % bs.length].focus(); return; }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
  if (e.key === 'Enter' && el.id !== 'tip') { const b = el.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON' ? document.activeElement : overlayPrimary(el); if (b) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); } return; }
  if (el.id !== 'tip') e.stopImmediatePropagation();       // the map behind does not take orders while a dialog is up
}, true);
new MutationObserver(ms => { for (const m of ms) { const el = m.target; if (el.hidden || el.id === 'tip' || !OVERLAYS.includes('#' + el.id)) continue; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); const b = overlayPrimary(el); if (b && !el.contains(document.activeElement)) setTimeout(() => (el.querySelector('textarea:not([readonly])') || b).focus(), 30); } })
  .observe(document.body, {subtree:true, attributes:true, attributeFilter:['hidden']});
addEventListener('keydown', e => {
  if (!G || document.body.dataset.screen !== 'game' || !$('#dialog').hidden) return;
  const k = e.key, mv = {ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1], a:[-1, 0], d:[1, 0], w:[0, -1], s:[0, 1]}[k];
  if (!$('#menu').hidden && ['ArrowUp', 'ArrowDown'].includes(k)) {
    const bs = [...$('#menu').querySelectorAll('button:not([disabled])')], i = bs.indexOf(document.activeElement);
    bs[(i + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length]?.focus(); e.preventDefault(); return;
  }
  if (mv && $('#menu').hidden) {
    e.preventDefault();
    if (UI.mode === 'target' || UI.mode === 'unload' || UI.mode === 'clear') { const i = UI.targets.findIndex(([x, y]) => x === UI.cursor.x && y === UI.cursor.y); const [x, y] = UI.targets[(i + 1) % UI.targets.length]; UI.cursor = {x, y}; forecast(); return; }
    UI.cursor = {x:clamp(UI.cursor.x + mv[0], 0, G.W - 1), y:clamp(UI.cursor.y + mv[1], 0, G.H - 1)}; focus(UI.cursor.x, UI.cursor.y); hoverUpdate(); return;
  }
  if ((k === 'Enter' || k === ' ' || k === 'z') && $('#menu').hidden) { e.preventDefault(); tileAction(UI.cursor.x, UI.cursor.y); }
  if (k === 'Escape' || k === 'x') cancel();
  if (k === 'e' || k === 'E') endTurnClick();
  if (k === 'r' || k === 'R') { const u = unitAt(UI.cursor.x, UI.cursor.y); if (u && seen(u)) showThreat(u); }
  if (k === 'Tab') { e.preventDefault(); cycleUnit(e.shiftKey ? -1 : 1); }
  if ((k === 'h' || k === 'H') && UI.mode === 'idle') showHint();
  if (k === 't' || k === 'T') toggleDanger();
  if (k === 'u' || k === 'U') toggleMine();
  if (k === 'n' || k === 'N') nextUnit();
  if (k === 'm' || k === 'M') toggleMinimap();
  if (k === 'v' || k === 'V') toggleHud();
  if (k === 'Escape' && document.body.classList.contains('hudless')) toggleHud(false);
  if (k === '+' || k === '=') zoomAt(innerWidth / 2, innerHeight / 2, cam.z * 1.2);
  if (k === '-') zoomAt(innerWidth / 2, innerHeight / 2, cam.z / 1.2);
});

/* ---------- saves ---------- */
function serial() { return JSON.stringify(Object.assign({}, G, {missionId:G.mission && G.mission.id, mission:null}), (k, v) => k === 'd' || k === 'rx' || k === 'ry' || k === 'flash' || k === 'moving' ? undefined : v); }
function revive(s) {
  G = JSON.parse(s); if (G.missionId) G.mission = MISSIONS[G.missionId];
  const fix = u => { u.d = udef(G.teams[u.team].nat, u.role); u.cargo.forEach(fix); };
  G.units.forEach(fix); UID = Math.max(UID, ...G.units.map(u => u.id + 1), 1); for (const u of G.units) for (const c of u.cargo) UID = Math.max(UID, c.id + 1);
}
/* a move that was never confirmed goes back to where it started, so a save cannot hand out a free move */
function undoPendingMove() {
  const u = UI.sel; if (u && UI.origin && !u.moved && !u.done && G.units.includes(u)) { u.x = UI.origin.x; u.y = UI.origin.y; }
  UI.mode = 'idle'; UI.sel = null; UI.reach = null; UI.zone = null; try { closeMenu(); } catch (e) {}
}
function autosave() { try { if (!G.over && !G.online && !G.edtest && !G.watch) localStorage.setItem('if44auto2', serial()); } catch (e) {} }   // a Map Builder test run never overwrites a real battle's save
function clearAutosave() { try { localStorage.removeItem('if44auto2'); } catch (e) {} }

/* ---------- screens ---------- */
function zoomStep(k) { if (G) zoomAt(innerWidth / 2, innerHeight / 2, cam.z * k); }
function toggleMinimap() { const m = $('#minimap'), off = m.classList.toggle('off'), b = $('#maptoggle'); if (b) { b.setAttribute('aria-pressed', String(!off)); b.classList.toggle('on', !off); } }
/* hide the interface to look at the map: the button stays, everything else steps aside until pressed again (or V) */
function toggleHud(force) {
  const off = typeof force === 'boolean' ? force : !document.body.classList.contains('hudless'), b = $('#hudtoggle');
  document.body.classList.toggle('hudless', off);
  if (b) { b.setAttribute('aria-pressed', String(off)); b.setAttribute('aria-label', off ? 'Show the interface' : 'Hide the interface'); b.querySelector('span').textContent = off ? 'Show UI' : 'Hide UI'; b.classList.toggle('on', !off); }
  if (G && !off) hud();
}
function show(id) {
  if (id !== 'gamehud' && document.body.classList.contains('hudless')) toggleHud(false);
  document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== id);
  document.body.dataset.screen = id === 'gamehud' ? 'game' : id;
  if (id === 'title') drawTitle();
}
function startGame(cfg) {
  let saved = null; try { saved = localStorage.getItem('if44auto2'); } catch (e) {}
  if (saved && !cfg.watch && !cfg.edtest && !FAST && !confirm('You have a battle in progress (Continue, on the title screen). Start this one instead? The saved battle will be lost.')) return false;   // one save slot: never wipe it silently
  EPOCH++; UI.busy = false;
  UI.overShown = false; UID = 1; FX.parts = []; FX.flyers = [];
  newGame(cfg); G.firstTeam = 1;
  if (cfg.mission) deployCore(cfg.mission);
  enterGame();
  (async () => {
    if (cfg.mission) { await say(cfg.teams[1].co, CO[cfg.teams[1].co].say.start); await say(cfg.teams[2].co, CO[cfg.teams[2].co].say.start);
      if (G.coreNames && G.coreNames.length) await say(cfg.teams[1].co, `Your veterans are with us: ${G.coreNames.join(', ')}.`); }
    setTimeout(() => tip('orders', 'Click one of your units to see where it can move (blue). Click a blue square, then pick an order. Right-click steps back. Hover over terrain for its cover and what it does. E ends your turn.'), 2600);
    beginTurn();
  })();
}
function enterGame() {
  spriteCache.clear(); propCache.clear();
  buildTerrain(); show('gamehud'); $('#result').hidden = true; resize(); fitCamera(); hud();
  { const b = $('#danger'); if (b) { b.classList.toggle('on', !!SET.danger); b.setAttribute('aria-pressed', SET.danger ? 'true' : 'false'); } }
  { const b = $('#mine'); if (b) { b.classList.toggle('on', !!SET.mine); b.setAttribute('aria-pressed', SET.mine ? 'true' : 'false'); } }
  musicMood(G.teams[G.turn].nat);
}
function continueGame() {
  try { const s = localStorage.getItem('if44auto2'); if (!s) return; EPOCH++; UI.busy = false; revive(s); } catch (e) { return; }
  UI.overShown = false; enterGame();
  if (isAI(G.turn)) aiTurn(G.turn);
}
function missionCfg(m) {
  return {map:missionMap(m), theme:m.theme, mission:m, objective:m.objective, events:m.events, income:m.income, weather:m.weather, clock:m.clock, fog:!!m.fog,
    teams:{1:Object.assign({ai:false}, m.p1), 2:Object.assign({ai:true}, m.p2)}, units:m.units};
}
function openCampaigns() {
  const p = loadProg(), el = $('#camplist'); el.innerHTML = '';
  for (const c of CAMPAIGNS) {
    const done = c.missions.filter(id => p.done[id]).length, b = document.createElement('button'); b.className = 'campcard';
    b.innerHTML = `<span class="fl"></span><span class="mt"><b>${c.name}</b><small>${c.sub}</small><small>${done} of ${c.missions.length} taken</small></span>`;
    const nats = [...new Set(c.missions.map(id => MISSIONS[id].p1.nat))];
    for (const n of nats) b.querySelector('.fl').append(flagCanvas(n, 30, 20));
    b.onclick = () => { sfx('click'); openCampaign(c); };
    el.append(b);
  }
  const coreEl = $('#corelist'); coreEl.innerHTML = '';
  const all = Object.entries(p.core).flatMap(([nat, list]) => list.map(c => Object.assign({nat}, c)));
  if (!all.length) coreEl.innerHTML = '<p class="dim">No veterans yet. Units that reach Veteran rank and survive a victory join the core force and deploy in later missions.</p>';
  for (const c of all) { const d = document.createElement('div'); d.className = 'vet'; d.append(spriteCanvas(c.nat, c.role, .75));
    const t = document.createElement('span'); t.innerHTML = `<b>${c.name}</b><small>${udef(c.nat, c.role).n} · ${RANKS[rankOf(c)].n} · ${c.kills || 0} kills</small>`; d.append(t); coreEl.append(d); }
  show('campaigns'); musicMood('campaign');
}
function openCampaign(c) {
  UI.campaign = c;
  const p = loadProg(), list = $('#missions'); list.innerHTML = '';
  $('#campname').textContent = c.name; $('#campsub').textContent = c.sub;
  c.missions.forEach((id, i) => {
    const m = MISSIONS[id], open = i === 0 || p.done[c.missions[i - 1]] || p.all, done = p.done[id];
    const b = document.createElement('button'); b.className = 'mission' + (done ? ' done' : '');
    b.disabled = !open;
    const lockWhy = open ? '' : ` · 🔒 win ${MISSIONS[c.missions[i - 1]].name} to unlock`;
    b.innerHTML = `<span class="no">${i + 1}</span><span class="mt"><b>${m.name}</b><small>${m.place} · ${m.date}${open ? diffText(id) : lockWhy}</small></span><span class="fl"></span>${done ? `<span class="stamp">TAKEN${p.rank && p.rank[id] ? ' · ' + p.rank[id] : ''}</span>` : ''}`;
    b.querySelector('.fl').append(flagCanvas(m.p1.nat, 24, 16), flagCanvas(m.p2.nat, 24, 16));
    b.onclick = () => { sfx('click'); openBrief(m); };
    list.append(b);
  });
  const ua = $('#unlockall'); if (ua) ua.textContent = p.all ? 'Restore campaign order' : 'Unlock all missions';
  show('campaign');
  animateWarMap($('#campmap'), c, c.missions.find(id => !p.done[id]) || c.missions[c.missions.length - 1], 'campaign');
}
/* the campaign a mission belongs to, and its place in the chain */
function missionCampaign(m) { return (UI.campaign && UI.campaign.missions.includes(m.id)) ? UI.campaign : CAMPAIGNS.find(c => c.missions.includes(m.id)); }
function opLine(m) { const c = missionCampaign(m); return c ? `${c.name} · battle ${c.missions.indexOf(m.id) + 1} of ${c.missions.length}` : 'Single battle'; }
/* the war-room map keeps pulsing while its screen is up */
function animateWarMap(c, camp, id, screen) {
  const view = camp ? campaignView(camp) : null, cv = c;
  cv.width = Math.min(900, cv.clientWidth || 860) * dpr; cv.height = cv.width * .42;
  const token = cv._loop = (cv._loop || 0) + 1;         // one loop per canvas: reopening the screen replaces the old loop rather than stacking another
  const tick = () => { if (document.body.dataset.screen !== screen || cv._loop !== token) return; drawWarMap(cv, camp, id, view); requestAnimationFrame(tick); };
  tick();
}
function openBrief(m) {
  const b = $('#brief'), h = HISTORY[m.id] || {}, camp = missionCampaign(m);
  b.querySelector('.opline').textContent = opLine(m);
  b.querySelector('h2').textContent = m.name;
  b.querySelector('.when').textContent = `${m.place} · ${m.date} · each turn is ${stepText(m.clock.step)}${m.fog ? ' · fog of war' : ''}${diffText(m.id)}`;
  b.querySelector('.story').textContent = m.brief;
  b.querySelector('.goal').textContent = goalText(m) + (m.objective.win === 'survive' ? ' Keep at least half of the towns, depots and airfields you start with: lose too much ground and the position is overrun.' : '') + (m.hard ? ' This battle was lost in real life: expect one of the hardest fights in the game.' : '');
  b.querySelector('.forces').innerHTML = h.forces ? [m.p1, m.p2].map((p, i) => `<div><h5>${NATION[p.nat].n}: the real forces</h5><p>${h.forces[i]}</p></div>`).join('') : '';
  b.querySelector('.stakes').hidden = !h.win;
  b.querySelector('.stakes .win p').textContent = h.win || ''; b.querySelector('.stakes .lose p').textContent = h.lose || '';
  const cos = b.querySelector('.cos'); cos.innerHTML = '';
  for (const p of [m.p1, m.p2]) { const c = CO[p.co], d = document.createElement('div'); d.className = 'cocard';
    d.append(portraitCanvas(p.co, 1)); const t = document.createElement('div'); t.innerHTML = `<b>${c.rank}<br>${c.n}</b><small>${NATION[p.nat].short}</small><em>"${c.say.start}"</em>`; d.append(t); cos.append(d); }
  const rows = missionMap(m); drawMinimapPreview(b.querySelector('.minimap'), rows, m.theme);
  b.querySelector('.size').textContent = `${rows[0].length} × ${rows.length} tiles`;
  b.querySelector('.go').onclick = () => { sfx('select'); startGame(missionCfg(m)); };
  b.querySelector('.watch').onclick = () => { sfx('select'); const cfg = missionCfg(m); cfg.teams[1].ai = true; cfg.watch = true; startGame(cfg); };
  show('brief'); musicMood('brief');
  animateWarMap(b.querySelector('.warmap'), camp, m.id, 'brief');
}
/* after the battle: what your result means for the campaign, then the real outcome */
function openAftermath(m, won) {
  const a = $('#after'), h = HISTORY[m.id] || {}, camp = missionCampaign(m);
  a.querySelector('.stampmark').textContent = won ? 'VICTORY' : 'DEFEAT';
  a.querySelector('.opline').textContent = opLine(m);
  a.querySelector('h2').textContent = 'Aftermath: ' + m.name;
  a.querySelector('.nexth').textContent = won ? 'What your victory means' : 'What your defeat means';
  a.querySelector('.next').textContent = (won ? h.win : h.lose) || '';
  a.querySelector('.real').textContent = h.real || '';
  a.querySelector('.fates').innerHTML = '<h4>What became of the generals</h4>' + [m.p1.co, m.p2.co].filter(k => CO_FATE[k]).map(k => `<p><b>${CO[k].rank} ${CO[k].n}.</b> ${CO_FATE[k]}</p>`).join('');
  const i = camp ? camp.missions.indexOf(m.id) : -1, next = won && camp && camp.missions[i + 1] ? MISSIONS[camp.missions[i + 1]] : null;
  const go = a.querySelector('.go');
  go.textContent = next ? 'Next battle: ' + next.name : won ? 'Back to campaigns' : 'Try again';
  go.onclick = () => { sfx('select'); if (next) openBrief(next); else if (won) openCampaigns(); else openBrief(m); };
  show('after'); musicMood(won ? 'victory' : 'brief', false, won && m.p1 ? m.p1.nat : null);
  animateWarMap(a.querySelector('.warmap'), camp, next ? next.id : m.id, 'after');
}
function drawMinimapPreview(c, rows, theme) {
  const s = 6, H = rows.length, W = rows[0].length; c.width = W * s; c.height = H * s; const g = c.getContext('2d'), C = PAL[theme] || PAL.normandy;
  const col = {plain:C.grass, road:C.road, forest:C.tree, bocage:C.hedge, hill:C.hill, river:C.water, bridge:'#7a6a52', sea:C.sea, beach:C.sand, bunker:'#8e8c84', ruins:'#7e7464', city:C.wall, hq:'#f0d060', fact:'#a08860', air:'#9a9a8e', port:'#7a766c', obst:'#5a5246', shingle:'#9a948a', wire:'#6a6a5a', mines:'#8a5a3a', cliff:'#7a7262', trench:'#6a5a3a', marsh:'#5a7a6a', field:C.wheat, block:'#8a8478'};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = MAPCH[rows[y][x]]; g.fillStyle = col[d[0]] || TER[d[0]].mm || '#555'; g.fillRect(x * s, y * s, s, s);
    if (d[1]) { g.fillStyle = d[1] === 1 ? '#4f7bd1' : '#c03030'; g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2); } }
}
function openSkirmish() {
  const f = $('#skirm');
  const natSel = (id, val) => { const s = f.querySelector(id); s.innerHTML = Object.entries(NATION).map(([k, n]) => `<option value="${k}">${n.n}</option>`).join(''); s.value = val; };
  natSel('#s1nat', 'us'); natSel('#s2nat', 'ger');
  const coSel = (n, id) => { const s = f.querySelector(id); s.innerHTML = (CO_BY_NAT[f.querySelector(n).value] || []).map(c => `<option value="${c}">${CO[c].n}</option>`).join(''); };
  coSel('#s1nat', '#s1co'); coSel('#s2nat', '#s2co');
  f.querySelector('#s1nat').onchange = () => coSel('#s1nat', '#s1co'); f.querySelector('#s2nat').onchange = () => coSel('#s2nat', '#s2co');
  f.querySelector('#stheme').innerHTML = Object.entries(THEMES).map(([k, t]) => `<option value="${k}">${t.n}</option>`).join('');
  show('skirm');
}
function launchSkirmish() {
  const f = $('#skirm'), v = id => f.querySelector(id).value;
  const size = {s:[22, 14], m:[30, 20], l:[40, 26], xl:[50, 32]}[v('#ssize')], seed = Date.now() % 1e9;
  const rows = genMap(v('#stheme'), size[0], size[1], seed);
  const funds = +v('#sfunds'), theme = v('#stheme');
  startGame({map:rows, theme, objective:{win:'hq'}, weather:{winter:'snow', autumn:'rain', city:'smoke'}[theme] || 'clear', fog:v('#sfog') === 'on',
    clock:{start:'1944-07-01T' + String(v('#shour')).padStart(2, '0') + ':00', step:60},
    teams:{1:{nat:v('#s1nat'), co:v('#s1co'), funds, ai:v('#s1ai') === 'ai'}, 2:{nat:v('#s2nat'), co:v('#s2co'), funds, ai:v('#s2ai') === 'ai'}},
    units:{1:skirmishUnits(rows, 1), 2:skirmishUnits(rows, 2)}, persona:v('#s2pers') ? {2:v('#s2pers')} : null});
}
function openSettings() {
  const f = $('#settings');
  f.querySelector('#optflags').value = SET.flags; f.querySelector('#optbattle').checked = SET.battle; f.querySelector('#optsound').checked = SET.sound;
  f.querySelector('#optmusic').checked = SET.music; f.querySelector('#optfast').checked = SET.aiFast; f.querySelector('#optvol').value = SET.vol; f.querySelector('#optmvol').value = SET.musicVol ?? 1; f.querySelector('#optamb').value = SET.amb ?? .8; f.querySelector('#optfx').checked = SET.fx; f.querySelector('#opttips').checked = SET.tips; f.querySelector('#optdiff').value = SET.difficulty || 'normal'; f.querySelector('#optgore').value = SET.gore || 'standard';
  show('settings');
}
function applySettings() {
  const f = $('#settings');
  SET.flags = f.querySelector('#optflags').value; SET.battle = f.querySelector('#optbattle').checked; SET.sound = f.querySelector('#optsound').checked;
  SET.music = f.querySelector('#optmusic').checked; SET.aiFast = f.querySelector('#optfast').checked; SET.vol = +f.querySelector('#optvol').value; SET.musicVol = +f.querySelector('#optmvol').value; SET.amb = +f.querySelector('#optamb').value; SET.fx = f.querySelector('#optfx').checked; SET.tips = f.querySelector('#opttips').checked; SET.difficulty = f.querySelector('#optdiff').value; SET.gore = f.querySelector('#optgore').value;
  if (AU.master) AU.master.gain.value = SET.vol; saveSet(); propCache.clear(); portraitCache.clear(); musicToggle();
}
function openCredits() {
  $('#credlist').innerHTML = '<h4>Music</h4>' + MUSIC.tracks.map(m => `<p><b>${m.title}</b><br>${m.by} · ${m.lic}</p>`).join('') +
    '<h4>Recorded sound</h4>' + SFX_CREDITS.concat(typeof SFX_LIB_CREDITS !== 'undefined' ? SFX_LIB_CREDITS : []).map(([a, b, c]) => `<p><b>${a}</b><br>${b} · ${c}</p>`).join('') +
    '<p>Music and the first three sounds from Wikimedia Commons; the rest of the sound library from Freesound.org. CC BY / CC BY-SA works are used under those licences; "Duet Musette" by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0.</p>' +
    '<h4>History</h4><p>Unit designations, generals and dates follow the real campaigns of 1937–45, from China to Berlin. German flags can be switched to the Balkenkreuz in Settings.</p>';
  show('credits');
}

/* the Armoury: every army's equipment with its numbers and history */
function openArmoury(nat) { openArchive('arms', nat); }
/* the armoury tabs: several armies share a country, so each is named for its period or theatre */
const ARMY_LABEL = {ger:'Germany 1943–45', ger40:'Germany 1939–43 & at sea', dak:'Afrika Korps 1941–43', us:'US Army, Europe 1943–45', usp:'US forces, Pacific 1941–45', uk:'Britain 1944–45', uk40:'Britain 1939–43, Malaya & at sea',
  uk42:'Britain, Desert 1941–43', su:'Soviet Union 1943–45', su41:'Soviet Union 1941–42', fr:'Free France 1944', ffl:'Free French, Desert 1942', fr40:'France 1940', be:'Belgium 1940',
  pl:'Poland 1939', jp:'Japan 1937–45', cn:'China 1937–45', it:'Italy, Africa 1940–43', itgv:'Italy, Europe 1940–43', itcb:'Italy, Co-Belligerent 1943–45', gr:'Greece 1940–41', gres:'Greek Resistance 1942–44', zed:'The Dead'};
/* the Archive: armoury, generals, battles and glossary */
function openArchive(tab = 'arms', nat = 'ger') {
  document.querySelectorAll('#arctabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  const tabs = $('#armtabs'), list = $('#armlist'); tabs.innerHTML = ''; list.innerHTML = ''; tabs.hidden = tab !== 'arms';
  list.className = tab;
  if (tab === 'arms') {
    for (const [k, n] of Object.entries(NATION)) { const b = document.createElement('button'); b.className = k === nat ? 'on' : ''; b.append(flagCanvas(k, 24, 16), document.createTextNode(' ' + (ARMY_LABEL[k] || n.n))); b.onclick = () => { sfx('click'); openArchive('arms', k); }; tabs.append(b); }
    const note = document.createElement('p'); note.className = 'armnote'; note.textContent = 'Each army is shown as it was equipped at the time, so a country can appear more than once: Germany in 1939–43, in the desert and in 1943–45 fielded very different tanks.'; list.append(note);
    for (const r of ROLE_ORDER) {
      const d = udef(nat, r); if (!d) continue;
      const card = document.createElement('div'); card.className = 'armcard';
      card.append(spriteCanvas(nat, r, 1.5));
      const t = document.createElement('div'), sp = SPECS[d.shape];
      t.innerHTML = `<b>${d.n}</b><small>${d.w}</small><span class="nums">${d.fixed ? 'Fixed defence' : 'Cost ' + fmt(d.cost)} · Move ${d.mv} · ${d.rng[1] ? 'Range ' + (d.rng[0] === d.rng[1] ? d.rng[0] : d.rng[0] + '–' + d.rng[1]) : 'Unarmed'}${d.carry ? ' · Carries ' + d.carry : ''}${d.arm < 1 ? ' · Heavy armour' : ''}</span>` +
        (sp ? `<dl class="specs">${sp.map((v, i) => `<dt>${SPEC_LABEL[i]}</dt><dd>${v}</dd>`).join('')}</dl>` : '') + `<p>${unitInfo(nat, r)}</p>`;
      card.append(t); list.append(card);
    }
  } else if (tab === 'gens') {
    for (const [k, c] of Object.entries(CO)) {
      const card = document.createElement('div'); card.className = 'armcard gen';
      card.append(portraitCanvas(k, 1));
      const t = document.createElement('div');
      t.innerHTML = `<b>${c.rank} ${c.n}</b><small>${NATION[c.nat].n}${c.nick ? ' · "' + c.nick + '"' : ''}</small><p>${c.bio}</p><p class="fate"><i>Fate.</i> ${CO_FATE[k] || ''}</p><span class="nums">${c.cop.n}: ${c.cop.txt}<br>${c.scop.n}: ${c.scop.txt}</span>`;
      card.append(t); list.append(card);
    }
  } else if (tab === 'bats') {
    for (const camp of CAMPAIGNS) {
      const hd = document.createElement('h3'); hd.className = 'archead'; hd.textContent = camp.name; list.append(hd);
      for (const id of camp.missions) {
        const m = MISSIONS[id], h = HISTORY[id] || {}, card = document.createElement('details'); card.className = 'batcard';
        card.innerHTML = `<summary><b>${m.name}</b><small>${m.place} · ${m.date}</small></summary><p>${m.brief}</p>` +
          (h.forces ? `<dl class="specs"><dt>${NATION[m.p1.nat].n}</dt><dd>${h.forces[0]}</dd><dt>${NATION[m.p2.nat].n}</dt><dd>${h.forces[1]}</dd></dl>` : '') + (h.real ? `<h5>What really happened</h5><p>${h.real}</p>` : '');
        list.append(card);
      }
    }
  } else {
    list.innerHTML = '<dl class="gloss">' + GLOSSARY.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('') + '</dl>';
  }
  show('armoury');
}
/* title diorama: a dawn landing drawn with the game's own sprites */
function drawTitle() {
  const c = $('#titlecv'), W = c.width = clamp(innerWidth * dpr, 480, 1400), H = c.height = Math.round(W * .42), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const sky = g.createLinearGradient(0, 0, 0, H * .6); sky.addColorStop(0, '#2e3648'); sky.addColorStop(.6, '#c88a5a'); sky.addColorStop(1, '#e8c890');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,220,180,.18)'; g.beginPath(); g.ellipse(hrand(i, 3) * W, H * (.1 + hrand(i, 4) * .25), W * .12, H * .03, 0, 0, 7); g.fill(); }
  g.fillStyle = '#4e5c4a'; g.beginPath(); g.moveTo(0, H * .52); for (let x = 0; x <= W; x += W / 24) g.lineTo(x, H * .47 - Math.sin(x * .01) * H * .05 - hrand(x | 0, 1) * H * .03); g.lineTo(W, H * .6); g.lineTo(0, H * .6); g.fill();
  g.fillStyle = '#2f5f86'; g.fillRect(0, H * .6, W, H * .4); g.fillStyle = '#d8c690'; g.fillRect(0, H * .57, W, H * .05);
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(hrand(i, 2) * W, H * .64 + hrand(i, 3) * H * .36, 18, 2); }
  for (let i = 0; i < 4; i++) { const x = W * (.55 + i * .1); g.fillStyle = 'rgba(60,54,48,.35)'; g.beginPath(); g.ellipse(x, H * .32, W * .02, H * .2, .2, 0, 7); g.fill(); }   // smoke columns
  const S = Math.max(1, W / 700), put = (nat, role, x, y, flip) => { const img = getSprite(nat, role, 1); g.save(); if (flip) { g.translate(x + 64 * S, y); g.scale(-1, 1); g.drawImage(img, 0, 0, 64 * S, 64 * S); } else g.drawImage(img, x, y, 64 * S, 64 * S); g.restore(); };
  put('us', 'lc', W * .05, H * .7); put('uk', 'lc', W * .2, H * .78); put('us', 'dd', W * .0, H * .82); put('us', 'ddtank', W * .32, H * .66);
  put('us', 'inf', W * .3, H * .5); put('uk', 'tank', W * .4, H * .48); put('us', 'tank', W * .15, H * .49); put('us', 'eng', W * .23, H * .52);
  put('ger', 'pak', W * .63, H * .42, true); put('ger', 'nest', W * .74, H * .45, true); put('ger', 'htank', W * .84, H * .44, true);
  put('uk', 'ftr', W * .48, H * .1); put('us', 'bmr', W * .6, H * .18); put('ger', 'bmr', W * .84, H * .06, true);
  for (const [nat, x] of [['us', .03], ['uk', .09], ['fr', .15], ['su', .21], ['pl', .27], ['cn', .33], ['ger', .86], ['jp', .92]]) { g.fillStyle = '#2a2a24'; g.fillRect(W * x, H * .06, 3, H * .2); drawFlag(g, nat, W * x + 3, H * .06, W * .05, W * .033); }
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  $('#continue').hidden = !(() => { try { return !!localStorage.getItem('if44auto2'); } catch (e) { return false; } })();
}

/* ---------- boot ---------- */
function boot() {
  addEventListener('resize', () => { resize(); if (document.body.dataset.screen === 'title') drawTitle(); });
  resize(); requestAnimationFrame(draw);
  const on = (id, f) => $(id).addEventListener('click', e => { auInit(); sfx('click'); f(e); });
  on('#tmnext', () => { if (!SET.music) { SET.music = true; saveSet(); } if (!MUSIC.mood) musicMood('title', true); else playNext(); titleMusicLabel(); });
  on('#tmmute', () => { SET.music = !SET.music; saveSet(); musicToggle(); if (SET.music && !MUSIC.playing) musicMood('title', true); titleMusicLabel(); });
  on('#bcampaign', openCampaigns); on('#bskirmish', openSkirmish); on('#bsettings', openSettings); on('#bhelp', () => show('help')); on('#bcredits', openCredits); on('#barmoury', () => openArmoury('ger')); on('#bmulti', () => show('multi')); on('#mphot', () => { openSkirmish(); $('#s2ai').value = 'human'; }); on('#mpcode', askTurnCode); on('#mponline', openOnline); on('#netcreate', createOnline); on('#netjoin', joinOnline);
  on('#bjukebox', () => { show('jukebox'); renderJukebox(); });
  on('#continue', continueGame);
  document.querySelectorAll('.back').forEach(b => b.addEventListener('click', () => { sfx('cancel'); const to = b.dataset.to || 'title'; if (to === 'campaign' && UI.campaign) openCampaign(UI.campaign); else if (to === 'campaigns') openCampaigns(); else show(to); }));
  on('#sgo', launchSkirmish); on('#optsave', () => { applySettings(); show('title'); });
  on('#hudtoggle', toggleHud); on('#zoomin', () => zoomStep(1.25)); on('#zoomout', () => zoomStep(1 / 1.25)); on('#maptoggle', toggleMinimap);
  on('#progexport', progExport); on('#progimport', () => $('#progfile').click()); $('#progfile').addEventListener('change', e => { if (e.target.files[0]) progImport(e.target.files[0]); e.target.value = ''; });
  on('#tipsagain', () => { tipsReset(); SET.tips = true; $('#opttips').checked = true; $('#progmsg').textContent = 'The field notes will show again as you play.'; });
  on('#endturn', endTurnClick); on('#danger', toggleDanger); on('#mine', toggleMine); on('#nextu', nextUnit); on('#cop', () => usePower(G.turn, 1)); on('#scop', () => usePower(G.turn, 2));
  on('#ffwd', () => { SET.aiFast = !SET.aiFast; saveSet(); $('#ffwd').classList.toggle('on', SET.aiFast); });
  on('#quit', () => { if (G && !G.over) { undoPendingMove(); autosave(); } EPOCH++; UI.busy = false; show('title'); musicMood('title'); });
  on('#co1', () => showCO(G.teams[1].co)); on('#co2', () => showCO(G.teams[2].co));
  $('#coinfo').addEventListener('click', () => $('#coinfo').hidden = true);
  on('#bwaves', () => openLastStand()); on('#bzed', openZombies); on('#zgo', launchZombies); on('#bwarmap', openWarView); on('#brecord', openRecord); on('#beditor', () => openEditor()); on('#lsgo', launchLastStand); edBoot();
  on('#resultok', () => { $('#result').hidden = true; if (UI.fromEditor && !G.mission) { UI.fromEditor = false; return openEditor(); } G.mission && HISTORY[G.mission.id] ? openAftermath(G.mission, UI.lastWon) : G.mission && UI.campaign ? openCampaign(UI.campaign) : G.mission ? openCampaigns() : show('title'); });
  document.querySelectorAll('#arctabs button').forEach(b => b.addEventListener('click', () => { sfx('click'); openArchive(b.dataset.t); }));
  on('#unlockall', () => {                               // a toggle with a warning: opening every battle skips the campaign's order, and it can be undone
    const p = loadProg();
    if (!p.all && !confirm('Open every battle in every campaign, out of order? You can lock them again here.')) return;
    p.all = !p.all; saveProg(p); if (UI.campaign) openCampaign(UI.campaign);
  });
  document.addEventListener('pointerdown', () => { auInit(); if (!MUSIC.mood) musicMood('title'); }, {once:true});
  show('title'); padPoll(); if (!location.hash) setTimeout(() => showDespatch(), 600);
  if (['#validate', '#autoplay', '#testers'].includes(location.hash)) runTests(location.hash.slice(1));
}

/* ---------- the adviser: the computer's own planner suggests the player's best move ---------- */
function showHint() {
  if (!G || isAI(G.turn) || UI.busy || G.over) return;
  const team = G.turn, cache = {}; let best = null, bv = -Infinity;
  for (const u of G.units) { if (u.team !== team || u.done || u.d.fixed) continue;
    const p = planUnit(u, cache); if (!p.n) continue;
    const v = planValue(p) || p.score; if (v > bv) { bv = v; best = p; } }
  if (!best) { fxText(UI.cursor.x, UI.cursor.y, 'No orders to suggest', '#c8c4b0'); return; }
  const u = best.u, d = best.n, what = {attack:`attack the ${best.target ? best.target.d.n : 'enemy'}`, capture:'capture', clear:'clear the obstacles', unload:'unload', load:'board', join:'join up', bridge:'work on the bridge', wait:'move up'}[best.act] || best.act;
  focus(d.x, d.y); selectTile(u.x, u.y);
  if (UI.reach && UI.reach.has(K(d.x, d.y))) { UI.path = pathTo(UI.reach, d.x, d.y) || UI.path; UI.cursor = {x:d.x, y:d.y}; }
  fxText(d.x, d.y, `Adviser: ${u.d.n} — ${what}`, '#f0d060', 2600);
  if (best.target) fxText(best.target.x, best.target.y, 'Target', '#ff8a6a', 2600);
  sfx('select');
}
/* difficulty as estimated by the AI testers (share of games the computer won playing your side) */
const DIFFICULTY = {};
function diffLevel(id) { const r = DIFFICULTY[id]; return r == null ? 0 : r >= .9 ? 1 : r >= .7 ? 2 : r >= .45 ? 3 : r >= .2 ? 4 : 5; }
function diffText(id) { const l = diffLevel(id); return l ? ` · ${['', 'Easy', 'Moderate', 'Hard', 'Very hard', 'Desperate'][l]} ${'●'.repeat(l)}${'○'.repeat(5 - l)}` : ''; }
/* ---------- despatches: what is new since the player last visited ---------- */
const GAME_VERSION = 15;
const DESPATCH = [
  ['The Desert War', 'A new campaign, Beda Fomm to Tunis: the Easter Battle at Tobruk, Bir Hakeim, Operation Lightfoot through the Devil\'s Gardens, Kasserine Pass and the fall of Tunis. On the Axis side, Hellfire Pass and Rommel\'s capture of Tobruk. The Afrikakorps, the Italian army, the Eighth Army in khaki drill and the Free French, with dunes, wadis, escarpments and the 88.'],
  ['Dead of Night', 'Zombie survival. The dead come in waves from every edge, Walkers, Runners, Spitters, Brutes and an Abomination, and every soldier they kill rises to join them.'],
  ['Choose your force', 'In Last Stand and Dead of Night you can now set your starting money and pick your own troops, gun nests and dug-in guns included.'],
  ['New theatres', 'Fall Weiss (Poland 1939), Fall Gelb (France 1940), Moscow, Stalingrad and Uranus, the War at Sea, the Battle of the Atlantic, the Rising Sun from Pearl Harbor to Singapore, the Pacific War, and China\'s War of Resistance: 37 new battles and 51 new generals and admirals.'],
  ['The war at sea', 'U-boats that hide below the surface, escorts with asdic, battleships, carriers and torpedo bombers, and convoys to fight through.'],
  ['Last Stand', 'Hold your HQ against endless, growing waves, with a daily challenge and your best score kept for every map.'],
  ['Map Builder', 'Paint your own battlefields, place armies and timed reinforcements, set weather, night and fog, then play, watch, balance-check or share them as a code, even online.'],
  ['Smarter generals', 'Each general now fights in character: Rommel and Patton attack, Model and Kuribayashi dig in. Press H in battle for your adviser\'s suggestion, or Watch any battle played out.'],
  ['Service Record', 'Medals and lifetime statistics, and difficulty ratings measured by AI testers on every battle.'],
];
function showDespatch(force) {
  let seen = 0; try { seen = +localStorage.getItem('if44seen') || 0; } catch (e) {}
  if (!force && seen >= GAME_VERSION) return;
  try { localStorage.setItem('if44seen', String(GAME_VERSION)); } catch (e) {}
  let veteran = false; try { veteran = !!(localStorage.getItem('if44prog2') || localStorage.getItem('if44auto2') || localStorage.getItem('if44set')); } catch (e) {}
  if (!force && !seen && !veteran) {                               // a brand-new player has no news to catch up on: point them at Basic Training instead
    const box = $('#codebox'), ta = box.querySelector('#codetext'); box.hidden = false; ta.hidden = true;
    box.querySelector('h3').textContent = 'New recruit?';
    box.querySelector('p').textContent = 'Start with Basic Training: about ten minutes on Salisbury Plain that teaches moving, firing, cover and capturing, one lesson a turn.';
    box.querySelector('small').textContent = ''; box.querySelector('.cancel').textContent = 'Not now'; box.querySelector('.ok').textContent = 'Basic Training';
    const close = () => { box.hidden = true; ta.hidden = false; };
    box.querySelector('.cancel').onclick = close; box.querySelector('.ok').onclick = () => { close(); openBrief(MISSIONS.training); };
    return;
  }
  const box = $('#codebox'); box.hidden = false; box.querySelector('h3').textContent = 'Despatches from the front';
  box.querySelector('p').textContent = 'What has changed since you were last here:';
  const ta = box.querySelector('#codetext'); ta.readOnly = true; ta.value = DESPATCH.map(([a, b]) => `${a.toUpperCase()}\n${b}`).join('\n\n');
  box.querySelector('small').textContent = ''; box.querySelector('.cancel').textContent = 'Close'; box.querySelector('.ok').textContent = 'To the front';
  box.querySelector('.cancel').onclick = box.querySelector('.ok').onclick = () => { box.hidden = true; };
}
/* ---------- the War Map: every battle, coloured by progress ---------- */
function openWarView() {
  show('warview'); musicMood('campaign');
  const c = $('#wvmap'), W = Math.min(1200, c.parentElement.clientWidth || 1000); c.width = W * dpr; c.height = Math.round(W * .52) * dpr;
  const view = [-75, -40, 215, 66], p = loadProg();
  const open = id => { const camp = CAMPAIGNS.find(k => k.missions.includes(id)); if (!camp) return false; const i = camp.missions.indexOf(id); return i === 0 || p.done[camp.missions[i - 1]] || p.all; };
  const pts = [];
  const draw = () => {
    if (document.body.dataset.screen !== 'warview') return;
    drawWarMap(c, null, null, view);
    const g = c.getContext('2d'), [x0, y0, x1, y1] = view, k = Math.cos((y0 + y1) / 2 * Math.PI / 180), s = Math.min(c.width / ((x1 - x0) * k), c.height / (y1 - y0));
    const ox = (c.width - (x1 - x0) * k * s) / 2, oy = (c.height - (y1 - y0) * s) / 2, P = (lon, lat) => [ox + (lon - x0) * k * s, oy + (y1 - lat) * s];
    pts.length = 0;
    for (const camp of CAMPAIGNS) for (const id of camp.missions) { const ll = MISSION_LONLAT[id]; if (!ll) continue; const [x, y] = P(...ll), done = p.done[id], av = open(id);
      pts.push({id, x, y});
      g.fillStyle = done ? '#a8322a' : av ? '#d6b25a' : '#6a6a5a'; g.strokeStyle = '#1a1814'; g.lineWidth = 1.5 * dpr; g.beginPath(); g.arc(x, y, (av && !done ? 6 : 5) * dpr, 0, 7); g.fill(); g.stroke();
      if (av && !done) { g.strokeStyle = '#d6b25a'; g.beginPath(); g.arc(x, y, (9 + Math.sin(performance.now() / 300) * 2) * dpr, 0, 7); g.stroke(); } }
    requestAnimationFrame(draw);
  };
  draw();
  const hit = e => { const r = c.getBoundingClientRect(), mx = (e.clientX - r.left) * c.width / r.width, my = (e.clientY - r.top) * c.height / r.height; let best = null, bd = 14 * dpr; for (const q of pts) { const d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = q; } } return best; };
  c.onmousemove = e => { const q = hit(e), tip = $('#wvtip'); if (!q) { tip.hidden = true; return; } const m = MISSIONS[q.id], camp = CAMPAIGNS.find(k => k.missions.includes(q.id)); tip.hidden = false;
    tip.innerHTML = `<b>${m.name}</b>${m.place} · ${m.date}<br><small>${camp.name}${p.done[q.id] ? ' · taken' : open(q.id) ? ' · open' : ' · locked'}${diffText(q.id)}</small>`;
    const r = c.getBoundingClientRect(); tip.style.left = Math.min(r.width - 270, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; };
  c.onmouseleave = () => { $('#wvtip').hidden = true; };
  c.onclick = e => { const q = hit(e); if (!q) return; if (!open(q.id)) { sfx('cancel'); return; } sfx('click'); UI.campaign = CAMPAIGNS.find(k => k.missions.includes(q.id)); openBrief(MISSIONS[q.id]); };
}