/* ============================== BATTLE CUT-IN =============================
   Advance Wars style: attacker on the left, defender on the right, one
   figure per two HP. Every weapon class has its own choreography: rifle and
   MG tracers, bazooka backblast and rocket, tank-gun flash and recoil,
   artillery arcing out and falling in, rocket salvos, flak bursts, strafing
   runs, dive bombing, flamethrowers, satchel charges, naval gunfire.
   Hit figures fall (infantry) or brew up (vehicles). */
const BW = 960, BH = 360;
const BQ = 2;                                           // render quality: the scene is laid out on a 960×360 stage and drawn at twice that (1920×720), models painted at 4× map detail
const BAT = {parts:[], shake:0};
function bp(o) { o.t = 0; BAT.parts.push(o); }
function drawBackdrop(g, X, ter, theme, weather, side) {
  const C = PAL[theme] || PAL.normandy, night = weather === 'night', winter = theme === 'winter';
  const sky = g.createLinearGradient(0, 0, 0, BH * .62);
  if (night) { sky.addColorStop(0, '#0e1424'); sky.addColorStop(1, '#2a3048'); }
  else if (weather === 'smoke') { sky.addColorStop(0, '#6a6458'); sky.addColorStop(1, '#b8a888'); }
  else if (weather === 'overcast' || weather === 'rain' || weather === 'fog') { sky.addColorStop(0, '#7a8690'); sky.addColorStop(1, '#c4ccd0'); }
  else if (winter) { sky.addColorStop(0, '#8a98a6'); sky.addColorStop(1, '#dce2e6'); }
  else { sky.addColorStop(0, '#6a9cc4'); sky.addColorStop(1, '#d8e4d0'); }
  g.fillStyle = sky; g.fillRect(X, 0, BW / 2, BH);
  // clouds
  g.fillStyle = night ? 'rgba(80,90,120,.25)' : 'rgba(255,255,255,.35)';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(X + 60 + i * 120 + hrand(i, side) * 40, 40 + hrand(i, 2) * 50, 70, 16, 0, 0, 7); g.fill(); }
  // far ridge and treeline
  g.fillStyle = shade(winter ? '#9aa6ae' : C.hill, -.25); g.beginPath(); g.moveTo(X, BH * .52);
  for (let x = 0; x <= BW / 2; x += 20) g.lineTo(X + x, BH * .48 - Math.sin((x + side * 70) * .02) * 18 - hrand(x, side) * 10); g.lineTo(X + BW / 2, BH * .6); g.lineTo(X, BH * .6); g.fill();
  const water = ter === 'sea' || ter === 'river';
  const ground = water ? C.sea : ter === 'beach' || ter === 'obst' || ter === 'shingle' ? C.sand : ter === 'ruins' || ter === 'block' ? '#7e7464' : ter === 'road' ? C.road : ter === 'field' ? C.wheat : ter === 'marsh' ? shade(C.grass, -.2) : C.grass;
  g.fillStyle = shade(ground, -.12); g.fillRect(X, BH * .58, BW / 2, BH * .42);
  g.fillStyle = ground; g.fillRect(X, BH * .56, BW / 2, 16);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(0,0,0,${.05 + hrand(i, side + 3) * .08})`; g.fillRect(X + hrand(i, 7 + side) * BW / 2, BH * .6 + hrand(i, 8) * BH * .38, 6 + hrand(i, 9) * 18, 2); }
  if (water) { g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 20; i++) g.fillRect(X + hrand(i, 5) * BW / 2, BH * .6 + hrand(i, 6) * BH * .38, 30, 2); }
  // terrain dressing
  g.save(); g.beginPath(); g.rect(X, 0, BW / 2, BH); g.clip();
  if (ter === 'forest' || ter === 'bocage' || ter === 'hill' || ter === 'trench') {
    for (let i = 0; i < 7; i++) { const tx = X + i * 75 + hrand(i, side) * 30, ty = BH * .56;
      g.fillStyle = C.trunk; g.fillRect(tx - 3, ty - 40, 6, 40); g.fillStyle = C.tree; g.beginPath(); g.arc(tx, ty - 60, 34, 0, 7); g.fill(); g.fillStyle = C.tree2; g.beginPath(); g.arc(tx - 10, ty - 70, 20, 0, 7); g.fill();
      if (winter) { g.fillStyle = 'rgba(240,244,246,.8)'; g.beginPath(); g.arc(tx - 6, ty - 84, 16, Math.PI, 0); g.fill(); } }
    if (ter === 'bocage') { g.fillStyle = C.hedge; g.fillRect(X, BH * .53, BW / 2, 22); for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(X + i * 17, BH * .53, 12, 0, 7); g.fill(); } }
  }
  if (['city', 'hq', 'fact', 'ruins', 'block'].includes(ter)) for (let i = 0; i < 4; i++) {
    const bx = X + 15 + i * 115, bw = 90, bh = 110 + hrand(i, side) * 60, by = BH * .56 - bh;
    g.fillStyle = shade(C.wall, -.05 * i); g.fillRect(bx, by, bw, bh); g.fillStyle = C.roof; g.beginPath(); g.moveTo(bx - 6, by); g.lineTo(bx + bw / 2, by - 30); g.lineTo(bx + bw + 6, by); g.fill();
    g.fillStyle = '#2a2e36'; for (let wy = by + 16; wy < by + bh - 20; wy += 26) for (let wx = bx + 12; wx < bx + bw - 12; wx += 24) g.fillRect(wx, wy, 12, 16);
    if (ter === 'ruins') { g.fillStyle = shade(C.road2, -.1); g.beginPath(); g.moveTo(bx, by + 30); g.lineTo(bx + bw * .7, by - 10); g.lineTo(bx + bw, by + 40); g.lineTo(bx + bw, by - 40); g.lineTo(bx, by - 40); g.fill(); }
  }
  if (ter === 'bunker') { g.fillStyle = '#8e8c84'; g.beginPath(); g.moveTo(X + 120, BH * .58); g.lineTo(X + 150, BH * .3); g.lineTo(X + 360, BH * .3); g.lineTo(X + 390, BH * .58); g.fill(); g.fillStyle = '#1c1c1a'; g.fillRect(X + 190, BH * .38, 130, 22); }
  if (ter === 'obst' || ter === 'beach') { g.strokeStyle = '#3a3530'; g.lineWidth = 5; for (let i = 0; i < 5; i++) { const hx = X + 40 + i * 95, hy = BH * .5; g.beginPath(); g.moveTo(hx - 18, hy - 18); g.lineTo(hx + 18, hy + 18); g.moveTo(hx + 18, hy - 18); g.lineTo(hx - 18, hy + 18); g.stroke(); } }
  g.restore();
}
function slotPos(i, n, side, air) {
  const row = i >= 3 ? 1 : 0, col = row ? i - 3 : i, sc = row ? 1.45 : 1.8;
  const baseX = side ? BW / 2 + 70 : 40, x = baseX + col * 118 + (row ? 50 : 0), y = air ? 70 + row * 30 + (i % 2) * 18 : (row ? 128 : 172) + (i % 2) * 6;
  return {x, y, s:sc};
}
function battleScene(att, def, res, preAtt, preDef) {
  if (FAST || !SET.battle) return Promise.resolve();
  return new Promise(done => {
    const wrap = $('#battlewrap'); wrap.hidden = false; bcv.width = BW * BQ; bcv.height = BH * BQ; BAT.parts = [];
    const counter = res.counter > 0 || res.cKilled; let dur = counter ? 4600 : 3000, skip = false;
    const t0 = BAT.t0 = performance.now();
    const fin = () => { wrap.hidden = true; wrap.onclick = null; musicDuck(false); done(); };
    musicDuck(true);
    wrap.onclick = () => { skip = true; };
    const mk = (u, side, hp0, hp1) => {
      const n0 = Math.max(1, Math.ceil(hp0 / 20)), n1 = Math.max(0, Math.ceil(Math.max(0, hp1) / 20));
      return {u, side, nat:G.teams[u.team].nat, hp0, hp1:Math.max(0, hp1), n0, n1, ter:terr(u.x, u.y), cls:fxClass(u.d), air:!!u.d.air,
        figs:Array.from({length:n0}, (_, i) => ({i, alive:true, dieT:0, recoil:0, rnd:Math.random()}))};
    };
    const A = mk(att, 0, preAtt, att.hp), D = mk(def, 1, preDef, def.hp); A.foe = D; D.foe = A;
    // which figures fall, and how: each man and each vehicle dies its own way, so no two in a group go down alike.
    // They fall when a round actually reaches them (fireVolley strikes them); the deadline only catches any the volley missed.
    const plan = (S, at, by) => { const lost = S.n0 - S.n1, order = S.figs.slice().sort((a, b) => a.rnd - b.rnd); let prev;
      for (let i = 0; i < lost; i++) { const f = order[i]; f.doomed = true; f.deadline = at + i * 160;
        if (S.u.d.foot) f.death = EXPLOSIVE.has(by) && Math.random() < .65 ? 'blast' : ['back', 'back', 'drop', 'spin', 'kneel'][Math.random() * 5 | 0];
        else { let v = deathKind(S.u.d) || 'boom'; if (v === prev) v = deathKind(S.u.d) || 'boom'; f.death = prev = v; } } };
    const hitA = IMPACT_MS[A.cls] || 600, hitD = IMPACT_MS[D.cls] || 600, cAt = Math.max(2300, 450 + hitA + 1000);
    plan(D, 450 + hitA + 500, A.cls); if (counter) plan(A, cAt + hitD + 500, D.cls);
    dur = counter ? cAt + hitD + 1700 : 450 + hitA + 1700;
    if (D.n1 < D.n0 && !counter) dur += 700; if (counter && A.n1 < A.n0) dur += 900;     // time for the falls to finish and the wrecks to burn
    const bg = mkCanvas(BW * BQ, BH * BQ), bgg = bg.getContext('2d'); bgg.scale(BQ, BQ); drawBackdrop(bgg, 0, A.ter, G.theme, G.weather, 1); drawBackdrop(bgg, BW / 2, D.ter, G.theme, G.weather, 2);
    const fired = {a:false, c:false};
    let last = performance.now();
    const step = () => {
      const now = performance.now(), k = now - t0, dt = Math.min(.05, (now - last) / 1000); last = now;
      if (skip || k > dur) return fin();
      if (!fired.a && k > 450) { fired.a = true; fireVolley(A, D, 0); sayIn(A, 'atk'); }
      if (counter && !fired.c && k > cAt) { fired.c = true; fireVolley(D, A, 0); if (Math.random() < .6) sayIn(D, 'atk'); }
      const g = bctx; g.setTransform(BQ, 0, 0, BQ, 0, 0);
      const sh = BAT.shake * (Math.random() - .5); BAT.shake *= .9; g.setTransform(BQ, 0, 0, BQ, sh * BQ, sh * .6 * BQ);
      g.drawImage(bg, 0, 0, BW, BH); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';   // the 4× models are drawn slightly smaller than painted: filtered, they stay crisp
      for (const S of [A, D]) drawSide(g, S, k, now);
      updateBattleParts(g, dt);
      // panel labels
      g.setTransform(BQ, 0, 0, BQ, 0, 0);
      for (const S of [A, D]) {
        const X = S.side ? BW / 2 + 12 : 12, hpNow = S.figs.filter(f => f.alive).length;
        g.fillStyle = 'rgba(10,10,8,.72)'; g.fillRect(X, 10, 300, 58);
        g.drawImage(flagCanvas(S.nat, 30, 20), X + 10, 18, 30, 20);
        g.fillStyle = '#f4e8c8'; g.textAlign = 'left'; let fs = 17; g.font = `bold ${fs}px "Courier Prime",monospace`;
        while (g.measureText(S.u.d.n).width > 172 && fs > 11) { fs--; g.font = `bold ${fs}px "Courier Prime",monospace`; }
        g.fillText(S.u.d.n, X + 50, 32);
        g.fillStyle = '#b9b090'; g.font = '13px "Courier Prime",monospace'; g.fillText(S.u.name || '', X + 50, 50);
        const shown = S.figs.some(f => f.dieAt != null && k > f.dieAt) ? S.hp1 : S.hp0;
        g.fillStyle = '#e8c040'; g.font = 'bold 20px "Courier Prime",monospace'; g.textAlign = 'right'; g.fillText('HP ' + Math.ceil(shown / 10), X + 290, 32);
        const r = rankOf(S.u); if (r) { g.fillStyle = '#e8c040'; g.font = '13px "Courier Prime",monospace'; g.fillText(RANKS[r].n.toUpperCase(), X + 290, 52); }
      }
      g.fillStyle = '#111'; g.fillRect(BW / 2 - 3, 0, 6, BH);
      const dmgLbl = (S, at, val) => { if (k > at && k < at + 1100 && val > 0) { const a = 1 - (k - at) / 1100; g.globalAlpha = a; g.font = 'bold 40px "Stardos Stencil",Impact,sans-serif'; g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText('-' + val + '%', (S.side ? BW * .75 : BW * .25) + 2, 128 - (1 - a) * 30 + 2); g.fillStyle = '#ffd34a'; g.fillText('-' + val + '%', S.side ? BW * .75 : BW * .25, 128 - (1 - a) * 30); g.globalAlpha = 1; } };
      const lblAt = (S, est) => { const d = S.figs.filter(f => f.dieAt != null).map(f => f.dieAt); return d.length ? Math.min(...d) : est; };   // the damage shows as the first round lands
      dmgLbl(D, lblAt(D, 450 + hitA), res.dmg); if (counter) dmgLbl(A, lblAt(A, cAt + hitD), res.counter);
      setTimeout(step, 16);                                   // timer-driven so it also completes in a background tab
    };
    step();
  });
}
function figPoint(S, f) { const p = slotPos(f.i, S.n0, S.side, S.air); return {x:p.x + 32 * p.s, y:p.y + 34 * p.s, s:p.s}; }
const EXPLOSIVE = new Set(['cannon', 'artillery', 'naval', 'mortar', 'salvo', 'bombs', 'dive', 'rockets', 'charge', 'rocketAT']);
const fall = k => k <= 0 ? 0 : k >= 1 ? 1 : k < .75 ? (k / .75) ** 2 : 1 - .1 * Math.sin((k - .75) / .25 * Math.PI);   // gravity, then a small bounce as the body lands
const LAND = {back:520, drop:820, spin:760, kneel:1350, blast:720};
/* where each man stands in a squad sprite (32-grid), and where the lone man stands in the one-man sprite */
const SQUAD = {inf:{pos:[[1, 9], [9, 6], [16, 10]], solo:[9, 10]}, two:{pos:[[2, 13], [13, 8]], solo:[13, 8]}};
const squadOf = S => (NATION[S.nat] && NATION[S.nat].zed) || ['cav', 'mortar'].includes(S.u.role) ? null : S.u.role === 'inf' ? SQUAD.inf : SQUAD.two;
function pose(death, e, away) {                         // one man's fall, e ms after he is hit
  let ang = 0, dx = 0, dy = 0, sx = 1, sy = 1;
  switch (death) {
    case 'drop': { const q1 = Math.min(1, e / 220), q2 = fall((e - 220) / 600); sy = 1 - .25 * q1 + .25 * q2; ang = -away * (.2 * q1 + 1.4 * q2); dx = -away * q2 * 4; break; }      // knees go, then forward onto his face
    case 'spin': { const q1 = Math.min(1, e / 260), q2 = fall((e - 260) / 500); sx = Math.cos(q1 * Math.PI); ang = away * q2 * 1.53; dx = away * q1 * 5; break; }                // spun round by the hit
    case 'kneel': { const q1 = Math.min(1, e / 200), q2 = fall((e - 800) / 550); sy = 1 - .3 * q1 + .3 * q2; ang = e < 800 ? -away * .1 * Math.sin(e / 90) * q1 : -away * q2 * 1.45; break; }   // sinks to his knees, sways, slumps
    case 'blast': { const q = Math.min(1, e / LAND.blast); dx = away * q * 60; dy = -Math.sin(q * Math.PI) * 58; ang = away * fall(q) * Math.PI * 2.5; break; }   // thrown by the explosion
    default: { const q = fall(e / LAND.back); ang = away * q * 1.53; dx = away * q * 8; }          // knocked backwards
  }
  return {ang, dx, dy, sx, sy};
}
function turretCut(img) {                               // a vehicle sprite's silhouette: the turret is the top 42% of it
  if (img._cut) return img._cut;
  let top = img.height, bot = 0;
  try { const w = img.width, h = img.height, d = img.getContext('2d').getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (y < top) top = y; bot = y; } } catch (e) {}
  if (top >= bot) { top = img.height * .25; bot = img.height * .85; }
  return img._cut = {top, cut:Math.round(top + (bot - top) * .42)};
}
/* a speech bubble over one of the side's men, in his own language, mumbled in his own voice */
function sayIn(S, kind, f) {
  if (!SET.fx || S.air && kind === 'hurt') return;
  f = f || S.figs.filter(x => x.alive)[Math.random() * S.figs.filter(x => x.alive).length | 0]; if (!f) return;
  const text = barkText(S.nat, kind, S.u.d.foot); if (!text) return;
  const p = slotPos(f.i, S.n0, S.side, S.air);
  BAT.parts = BAT.parts.filter(q => !(q.k === 'say' && q.side === S.side));
  bp({k:'say', x:p.x + 32 * p.s, y:p.y + 4, text, side:S.side, life:1.5});
  babble(S.nat + f.i, text, {gain:.5, max:1.3, quick:true, zed:S.nat === 'zed', pitch:S.u.d.foot ? 1.05 : .95});
}
/* graphic gore only: a man caught by the shell burst comes apart. Torso, legs and an arm in his own uniform, his helmet, a burst of blood */
function spawnGibs(nat, X, Y, size, away) {
  const N = NATION[nat] || {}, uni = N.uniform || '#5a5a40', dark = shade(uni, -.25), skin = N.skin || '#dba985', s = size / 64, base = {g:900, s, life:3.2};
  const piece = (w, h, col, end, up) => bp({k:'gib', ...base, x:X + rnd(-6, 6) * s, y:Y - up * s, vx:away * rnd(40, 240) + rnd(-80, 80), vy:-rnd(220, 460), floor:Y + rnd(-3, 9) * s, spin:rnd(-16, 16), w, h, col, end});
  piece(9, 12, uni, dark, 26);                      // torso
  piece(4, 13, dark, '#2a241c', 12); piece(4, 13, dark, '#2a241c', 12);   // legs and boots
  piece(3.4, 10, uni, skin, 24);                    // an arm
  bp({k:'helmet', x:X, y:Y - 40 * s, vx:away * rnd(40, 160), vy:-rnd(260, 400), g:800, floor:Y + 4 * s, spin:rnd(-18, 18), s, life:3});
  bpBloodDir(X, Y - 20 * s, 30, away); bpBlood(X, Y - 14 * s, 12); bpDust(X, Y, 6);
}
function dieFig(S, f, now, frame, img) {
  f.alive = false; f.deadT = now; f.deadFrame = frame;
  const left = S.figs.filter(x => x.alive);
  const safe = left.filter(x => !x.doomed);              // one who will live through it
  if (!S.cried && safe.length && Math.random() < .85) { S.cried = true; const w = safe[Math.random() * safe.length | 0]; setTimeout(() => sayIn(S, 'hurt', w), 300); }   // a survivor shouts as his mates go down
  if (!left.length && S.foe && !S.foe.crowed) { S.foe.crowed = true; setTimeout(() => sayIn(S.foe, 'kill'), 450); }                                       // the other side, as the last of them falls
  const c = figPoint(S, f), p = slotPos(f.i, S.n0, S.side, S.air), size = 64 * p.s, away = S.side ? 1 : -1;
  const bail = (n, burn) => { if (S.u.d.fixed || !goreLevel()) return; for (let i = 0; i < n; i++) bp({k:'bailout', x:c.x + rnd(-10, 10), y:c.y + 10, vx:away * rnd(40, 80), vy:0, nat:S.nat, life:1.4, burn:burn && Math.random() < .6 && goreLevel() > 1}); };
  if (S.u.d.foot) {
    f.landMs = LAND[f.death] || 520;
    const sq = squadOf(S);                              // the squad breaks into its men, and each falls his own way
    if (sq) f.men = sq.pos.map(([mx, my]) => { const d = f.death === 'blast' ? (goreLevel() > 1 && Math.random() < .35 ? 'gib' : Math.random() < .7 ? 'blast' : 'back') : ['back', 'back', 'drop', 'spin', 'kneel'][Math.random() * 5 | 0];   // graphic gore: a shell can take a man apart
      return {ox:mx - sq.solo[0], oy:my - sq.solo[1], solo:sq.solo, death:d, delay:Math.random() * 260}; });
    bpBloodDir(c.x, c.y - 16, f.death === 'blast' ? 34 : 18, away);
    if (f.death !== 'blast' && Math.random() < .5) bp({k:'helmet', x:c.x - away * 4, y:c.y - 40 * p.s, vx:away * rnd(30, 100), vy:-rnd(140, 240), g:800, floor:c.y + 6, spin:rnd(-14, 14), s:p.s, life:2.6});
    if (S.nat === 'zed') sfx('zdie');
    else if (goreLevel() && (S.screams = (S.screams || 0) + 1) <= 3 && Math.random() < .85) sfx(Math.random() < .75 ? 'scream' : 'cry', Math.random() * .15);
    for (const m of (f.men || [{delay:0, death:f.death}]).slice(0, 2)) sfx('bodyfall', (m.delay + (LAND[m.death] || 520)) / 1000);
  } else if (!S.air && !S.u.d.sea && f.death !== 'boom') {
    sfx(f.death);
    if (f.death === 'knockout') { bpExplode(c.x, c.y - 4, .8); bpSparks(c.x, c.y - 14, 20); bpSmoke(c.x, c.y - 20, 4, .6, 14); bail(2 + (Math.random() < .5), false); }
    else if (f.death === 'brewup') { bpExplode(c.x, c.y, 1.3); bpFire(c.x, c.y - 10, 30); bail(Math.random() < .6 ? 1 : 0, true); }
    else {                                              // cook-off: the turret goes up on a column of flame
      const cut = turretCut(img), sc = size / img.height;
      bpExplode(c.x, c.y - 10, 1.9); bpSparks(c.x, c.y - 20, 34); BAT.shake = 16;
      bp({k:'turret', img, sy:cut.top, sh:cut.cut - cut.top, iw:img.width, dw:size, dh:(cut.cut - cut.top) * sc, flip:!!S.side,
        x:p.x + size / 2, y:p.y + (cut.top + cut.cut) / 2 * sc, vx:away * rnd(20, 90), vy:-rnd(420, 560), g:900, floor:p.y + size * .86, spin:rnd(5, 9) * (Math.random() < .5 ? 1 : -1), rot:0, life:3});
      f.ring = {x:p.x + size / 2, y:p.y + cut.cut * sc};
    }
  } else { bpExplode(c.x, c.y, 1.6); bpFire(c.x, c.y - 10, 20); sfx('boom'); if (!S.u.d.air && !S.u.d.sea) bail(2, true); }
}
function drawSide(g, S, k, now) {
  for (const f of S.figs.slice().sort((a, b) => (a.i >= 3 ? 0 : 1) - (b.i >= 3 ? 0 : 1))) {
    const p = slotPos(f.i, S.n0, S.side, S.air), size = 64 * p.s, foot = S.u.d.foot, ground = !S.air && !S.u.d.sea;
    let frame = Math.floor(now / 120) % 8; if (!foot && ground) frame = Math.floor(now / 90) % 8;
    if (f.doomed && f.alive && f.dieAt == null && k > f.deadline) f.dieAt = k;     // a round the volley never landed on him: he goes down anyway
    const dead = f.dieAt != null && k > f.dieAt;
    if (!f.alive && f.deadFrame != null) frame = f.deadFrame;
    const img = getSprite(S.nat, S.u.role, frame, false, G.theme === 'winter' ? 'w' : '', 2 * BQ);
    if (dead && f.alive) dieFig(S, f, now, frame, img);
    const rec = f.recoil || 0; f.recoil = f.recoil > 0 ? Math.max(0, f.recoil - 1.2) : Math.min(0, f.recoil + 1.4);   // negative recoil: a lunge forward
    g.save();
    let x = p.x + (S.side ? rec : -rec), y = p.y + (S.air ? Math.sin(now / 260 + f.i) * 6 : 0);
    if (f.alive && f.hitT && now - f.hitT < 180) { const q = 1 - (now - f.hitT) / 180; x += (S.side ? 1 : -1) * 4 * q; y += 2 * q; }   // flinching under fire
    if (f.alive && foot) { x += Math.sin(now / 430 + f.rnd * 9) * 1.3 * p.s; y += Math.sin(now / 610 + f.rnd * 5) * .6 * p.s; }       // men shifting their weight, breathing
    else if (f.alive && ground && !S.u.d.fixed) {                                                                                     // an engine idling: the hull trembles, exhaust puffs from the back deck
      y += (Math.random() - .5) * .9 * p.s;
      if (Math.random() < .07 && !GUNS[S.u.d.shape]) bp({k:'smoke', x:x + (S.side ? size * .88 : size * .12), y:y + size * .5, vx:(S.side ? 1 : -1) * rnd(8, 20), vy:-rnd(8, 20), size:3 * p.s, grow:14, shade:.75, life:rnd(.8, 1.3)});
    }
    const e = dead ? now - f.deadT : 0, away = S.side ? 1 : -1;
    if (!S.air && !(dead && foot)) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + size / 2, y + size * .9, size * .38, size * .07, 0, 0, 7); g.fill(); }
    let hull = false;
    if (dead && foot && f.men) {                       // each man of the squad, drawn alone: standing a moment, then falling his own way
      const one = getSprite(S.nat, S.u.role, f.deadFrame, false, (G.theme === 'winter' ? 'w' : '') + '1', 2 * BQ), u = size / 32;
      for (const m of f.men) {
        const e2 = e - m.delay, P = e2 > 0 ? pose(m.death, e2, away) : {ang:0, dx:0, dy:0, sx:1, sy:1}, land = LAND[m.death] || 520;
        const px0 = (m.solo[0] + 4) * u, px = S.side ? size - px0 : px0, py = (m.solo[1] + 14) * u;      // his feet, in the one-man sprite
        const X = x + (S.side ? -m.ox : m.ox) * u + px, Y = y + m.oy * u + py;
        if (m.death === 'gib' && e2 > 0) { if (!m.gibbed) { m.gibbed = true; spawnGibs(S.nat, X, Y, size, away); } continue; }   // nothing left standing
        if (!m.landed && e2 > land) { m.landed = true; bpDust(X + P.dx, Y, 3); }
        if (P.dy > -4) { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(X + P.dx, Y + 1, size * .14, size * .035, 0, 0, 7); g.fill(); }
        if (goreLevel() && m.landed) { const pk = Math.min(1, (e2 - land) / 900); g.fillStyle = 'rgba(90,8,6,.75)'; g.beginPath(); g.ellipse(X + P.dx + away * size * .16, Y + 2, size * .03 + pk * size * .1, size * .012 + pk * size * .03, 0, 0, 7); g.fill(); }
        g.save(); g.globalAlpha = 1 - Math.min(.25, Math.max(0, e2) / 2400);
        g.translate(X + P.dx, Y + P.dy); g.rotate(P.ang); g.scale(P.sx, P.sy); g.translate(-px, -py);
        if (S.side) { g.translate(size, 0); g.scale(-1, 1); }
        g.drawImage(one, 0, 0, size, size); g.restore();
      }
      g.restore(); continue;
    }
    if (dead && foot) {
      let ang = 0, dx = 0, dy = 0, sx = 1, sy = 1;
      switch (f.death) {
        case 'drop': { const q1 = Math.min(1, e / 220), q2 = fall((e - 220) / 600); sy = 1 - .25 * q1 + .25 * q2; ang = -away * (.2 * q1 + 1.33 * q2); dx = -away * q2 * 6; break; }       // knees go, then forward onto his face
        case 'spin': { const q1 = Math.min(1, e / 260), q2 = fall((e - 260) / 500); sx = Math.cos(q1 * Math.PI); ang = away * q2 * 1.53; dx = away * q1 * 6; break; }               // spun round by the hit
        case 'kneel': { const q1 = Math.min(1, e / 200), q2 = fall((e - 800) / 550); sy = 1 - .3 * q1 + .3 * q2; ang = e < 800 ? -away * .1 * Math.sin(e / 90) * q1 : -away * q2 * 1.45; break; }   // sinks to his knees, sways, slumps
        case 'blast': { const q = Math.min(1, e / LAND.blast); dx = away * q * 70; dy = -Math.sin(q * Math.PI) * 64; ang = away * fall(q) * Math.PI * 2.5; break; }   // thrown by the explosion
        default: { const q = fall(e / LAND.back); ang = away * q * 1.53; dx = away * q * 9; }          // knocked backwards
      }
      if (!f.landed && e > f.landMs) { f.landed = true; bpDust(x + size / 2 + dx, y + size * .9, 4); }
      if (goreLevel() && f.landed) { const pk = Math.min(1, (e - f.landMs) / 900); g.save(); g.fillStyle = 'rgba(90,8,6,.75)'; g.beginPath(); g.ellipse(x + size / 2 + dx + away * size * .25, y + size * .92, size * .06 + pk * size * .2, size * .02 + pk * size * .055, 0, 0, 7); g.fill(); g.restore(); }
      g.globalAlpha = 1 - Math.min(.3, e / 2400);
      const piv = f.death === 'blast' && e < LAND.blast ? size * .55 : size * .9;
      g.translate(x + size / 2 + dx, y + piv + dy); g.rotate(ang); g.scale(sx, sy); g.translate(-size / 2, -piv); x = 0; y = 0;
    } else if (dead && ground && f.death !== 'boom') {
      const v = f.death;
      g.filter = v === 'knockout' ? 'brightness(.55) sepia(.3)' : 'brightness(.28) sepia(.5)';
      const cx = x + size / 2;
      if (v === 'knockout') { if (Math.random() < .2) bpSmoke(cx + rnd(-8, 8), y + size * .35, 1, .55, 10); }
      else if (v === 'brewup') { if (Math.random() < .55) bpFire(cx + rnd(-12, 12), y + size * .45, 2); if (Math.random() < .4) bpSmoke(cx + rnd(-10, 10), y + size * .3, 1, .95, 18); }
      else { hull = true; const r = f.ring;
        if (e < 2200) { for (let i = 0; i < 2; i++) bp({k:'fire', x:r.x + rnd(-6, 6), y:r.y, vx:rnd(-20, 20), vy:-rnd(160, 320), size:rnd(7, 13), life:rnd(.35, .6)}); if (Math.random() < .25) { bpSparks(r.x, r.y, 6); bpFlash(r.x + rnd(-10, 10), r.y - rnd(0, 20), 18); } }
        else { if (Math.random() < .45) bpFire(r.x, r.y, 2); if (Math.random() < .35) bpSmoke(r.x, r.y - 10, 1, .95, 18); } }
    } else if (dead) {
      const dk = Math.min(1, e / 500); g.filter = 'brightness(.3) sepia(.5)'; if (Math.random() < .25) bpSmoke(x + size / 2 + rnd(-10, 10), y + size * .4, 1, .8); if (Math.random() < .15) bpFire(x + size / 2, y + size * .5, 2);
      if (S.air) { y += dk * 120; g.globalAlpha = 1 - dk; }
    }
    if (S.side) { g.translate(x + size, y); g.scale(-1, 1); x = 0; y = 0; }
    if (hull) { const c = turretCut(img), sc = size / img.height; g.drawImage(img, 0, c.cut, img.width, img.height - c.cut, x, y + c.cut * sc, size, (img.height - c.cut) * sc); }   // the hull, its turret gone
    else g.drawImage(img, x, y, size, size);
    g.restore();
  }
}
/* ---------- volleys ---------- */
function muzzleOf(S, f) { const p = slotPos(f.i, S.n0, S.side, S.air), dir = S.side ? -1 : 1; return {x:p.x + (S.side ? 6 : 58) * p.s, y:p.y + (S.u.d.foot ? 30 : 22) * p.s, dir, s:p.s}; }
/* when the first rounds of each kind of volley reach the target (ms after the volley starts) */
const IMPACT_MS = {smallarms:500, maul:400, bile:900, rocketAT:600, atrifle:300, flamer:700, charge:800, cannon:450, artillery:1500, naval:1600, mortar:1250, salvo:1400, flak:600, strafe:700, dive:1400, bombs:1400, rockets:700};
/* Every sound here is triggered by the picture: the report at each muzzle flash, the whistle while the shell falls,
   the detonation as it lands, and the man or tank it was meant for goes down with it. */
function fireVolley(S, T, delay) {
  const shooters = S.figs.filter(f => f.alive), targets = T.figs, n = shooters.length || 1;
  const pick = () => targets[Math.floor(Math.random() * targets.length)];
  const aim = () => { const d = targets.find(f => f.doomed && f.alive && f.dieAt == null && !f.aimed); if (d) { d.aimed = true; return d; } return pick(); };   // shells go to the men they will kill
  const hitPt = f => figPoint(T, f);
  const later = (ms, fn) => setTimeout(fn, ms + delay);
  const strike = (tf, p = 1) => { if (tf && tf.doomed && tf.alive && tf.dieAt == null && Math.random() < p) tf.dieAt = performance.now() - BAT.t0; };
  const near = tf => targets.find(o => o !== tf && Math.abs(o.i - tf.i) === 1);
  const cls = S.cls, snd = S.u.d.snd, armour = !T.air && (T.u.d.mt === 'tread' || T.u.d.sea), vol = Math.min(1, 1.3 / Math.sqrt(n));
  let booms = 0; const boom = size => { const b = booms++; if (b < 6) boomAt(size, {gain:b < 2 ? 1 : .6}); };   // a whole battery landing: the first few loud, the rest under them
  let whistles = 0;
  if (['smallarms', 'flak', 'strafe', 'flamer'].includes(cls)) later(0, () => shot(snd));     // one long burst for the squad, starting with the first flash
  else if (cls === 'maul' || cls === 'bile') later(0, () => sfx(snd));
  shooters.forEach((f, idx) => {
    const m = muzzleOf(S, f), stg = idx * 70;
    switch (cls) {
      case 'smallarms': {
        const rate = snd === 'mg42' || S.u.role === 'nest' ? 26 : snd === 'ppsh' ? 20 : snd === 'garand' ? 8 : 12;
        for (let i = 0; i < rate; i++) later(stg + i * (900 / rate), () => { bpFlash(m.x, m.y, 10 * m.s); const tf = pick(), h = hitPt(tf); bpTracer(m.x, m.y, h.x + rnd(-20, 20), h.y + rnd(-14, 14));
          if (Math.random() < .35) bp({k:'brass', x:m.x - m.dir * 10 * m.s, y:m.y - 2, vx:-m.dir * rnd(30, 90), vy:-rnd(90, 170), g:900, floor:m.y + 28 * m.s, spin:rnd(-25, 25), s:m.s, life:.9});   // a spent case spinning out of the breech
          if (armour) { if (Math.random() < .55) { bpSparks(h.x + rnd(-18, 18), h.y + rnd(-14, 6), 4); if ((T.rico = (T.rico || 0) + 1) <= 6 && Math.random() < .6) sfxNow('rico'); strike(tf, .15); } }   // rounds whining off the armour
          else if (Math.random() < .5) { if (T.u.d.foot && Math.random() < .5) { bpBlood(h.x + rnd(-16, 16), h.y + rnd(-10, 10), 3); if (tf.alive) tf.hitT = performance.now(); strike(tf, .35); } else bpDust(h.x + rnd(-24, 24), h.y + 26, 1); } });
        break; }
      case 'maul': later(stg * 2, () => { f.recoil = -46; BAT.shake = 3; const tf = aim(); for (let i = 0; i < 3; i++) setTimeout(() => { const h = hitPt(tf); bpBlood(h.x + rnd(-14, 14), h.y + rnd(-14, 6), 10); if (i === 2) strike(tf); }, 160 + i * 120); }); break;
      case 'bile': later(stg * 2, () => { const tf = aim(), h = hitPt(tf); bpArc(m.x, m.y - 26, h.x, h.y, 700, 150, 'bile', () => { for (let i = 0; i < 18; i++) bp({k:'goo', x:h.x + rnd(-10, 10), y:h.y + rnd(-8, 4), vx:rnd(-120, 120), vy:-rnd(30, 160), g:500, size:rnd(2, 4), life:rnd(.5, .9)}); bpSmoke(h.x, h.y, 4, .1, 14); strike(tf); }); }); break;
      case 'rocketAT': later(stg, () => { shot(snd, {gain:vol}); bpSmoke(m.x - m.dir * 70, m.y, 6, .2, 18); bpFlash(m.x, m.y, 18); const tf = aim(), h = hitPt(tf);
        bpRocket(m.x, m.y, h.x, h.y, 420, () => { bpExplode(h.x, h.y, 1.1); boom(.8); if (armour) sfxNow('clang'); strike(tf); }); }); break;
      case 'atrifle': later(stg, () => { shot(snd, {gain:vol}); bpFlash(m.x, m.y, 26); BAT.shake = 4; const tf = aim(), h = hitPt(tf); bpTracer(m.x, m.y, h.x, h.y, 3);
        setTimeout(() => { bpSparks(h.x, h.y, 14); if (armour) sfxNow('clang'); strike(tf); }, 90); }); break;
      case 'flamer': for (let i = 0; i < 28; i++) later(stg + i * 30, () => { const h = hitPt(pick()); bp({k:'fire', x:m.x, y:m.y, vx:(h.x - m.x) * rnd(1.4, 1.9), vy:(h.y - m.y) * 1.8 - 30, size:rnd(8, 16), life:.55}); });
        later(stg + 600, () => { for (const tf of targets) { const h = hitPt(tf); bpFire(h.x, h.y, 10); setTimeout(() => strike(tf), rnd(0, 300)); } }); break;
      case 'charge': later(stg, () => { const tf = aim(), h = hitPt(tf); bpArc(m.x, m.y, h.x, h.y, 600, 120, 'satchel', () => { bpExplode(h.x, h.y, 1.3); boom(1.1); strike(tf); strike(near(tf), .5); }); }); break;
      case 'cannon': later(stg * 2, () => { const big = S.u.role === 'htank' || S.u.role === 'pak' ? 1.5 : 1.1; shot(snd, {gain:vol}); bpFlash(m.x, m.y, 34 * big); bpFlash(m.x, m.y - 8, 14); bpFlash(m.x, m.y + 8, 14);
        bpSmoke(m.x, m.y, 5, .4, 22); bpDust(m.x - m.dir * 40, m.y + 40, 4); f.recoil = 14; BAT.shake = 6 * big; const tf = aim(), h = hitPt(tf); bpTracer(m.x, m.y, h.x, h.y, 5, 120);
        setTimeout(() => { bpExplode(h.x, h.y, .9 * big); bpSparks(h.x, h.y, 16); boom(.6 * big); if (armour) sfxNow('clang'); strike(tf); }, 130); }); break;
      case 'artillery': case 'naval': later(stg * 3, () => { shot(snd, {gain:vol}); bpFlash(m.x, m.y - 14, 36); bpSmoke(m.x, m.y - 10, 8, .45, 26); f.recoil = 12; BAT.shake = 7;
        bp({k:'shellUp', x:m.x, y:m.y - 14, vx:m.dir * 260, vy:-700, life:.6});
        const tf = aim(), h = hitPt(tf), fall = (h.y + 20) / 900;                 // the shell comes down at 900 px/s from just above the frame
        if (whistles++ < 2) setTimeout(() => incomingTo(.55 + fall, {gain:vol}), 350);
        setTimeout(() => bp({k:'shellDown', x:h.x + rnd(-30, 30), y:-20, ty:h.y, vx:0, vy:900, life:1.2, done:() => { bpExplode(h.x + rnd(-20, 20), h.y + 10, cls === 'naval' ? 2 : 1.5); boom(cls === 'naval' ? 1.6 : 1.3); strike(tf); strike(near(tf), .4); }}), 900); }); break;
      case 'mortar': later(stg * 2, () => { shot(snd, {gain:vol}); bpFlash(m.x - m.dir * 20, m.y - 30, 14); const tf = aim(), h = hitPt(tf);
        if (whistles++ < 2) setTimeout(() => incomingTo(.6, {f0:1500, f1:700, gain:vol}), 300);
        bpArc(m.x - m.dir * 20, m.y - 30, h.x, h.y, 900, 260, 'mortar', () => { bpExplode(h.x, h.y, 1); boom(.9); strike(tf); }); }); break;
      case 'salvo': for (let i = 0; i < 6; i++) later(stg + i * 120, () => { if (idx < 2) launch({gain:vol * .9}); bpFlash(m.x, m.y - 10, 16); bpSmoke(m.x - m.dir * 30, m.y, 3, .25, 20); const tf = i < 2 ? aim() : pick(), h = hitPt(tf);
        bpRocket(m.x, m.y - 10, h.x + rnd(-30, 30), h.y, 1000, () => { bpExplode(h.x + rnd(-20, 20), h.y, 1.1); boom(1); strike(tf, i < 2 ? 1 : .3); }, 220); }); break;
      case 'flak': for (let i = 0; i < 10; i++) later(stg + i * 90, () => { bpFlash(m.x, m.y - 14, 12); const tf = pick(), h = hitPt(tf);
        if (T.air) { bpTracer(m.x, m.y - 14, h.x + rnd(-40, 40), h.y + rnd(-30, 30), 2); setTimeout(() => { bp({k:'puff', x:h.x + rnd(-40, 40), y:h.y + rnd(-30, 30), size:6, grow:26, life:1.1}); strike(tf, .25); }, 160); }
        else { bpTracer(m.x, m.y - 14, h.x + rnd(-20, 20), h.y, 2); bpDust(h.x + rnd(-20, 20), h.y + 24, 1); strike(tf, .15); } }); break;
      case 'strafe': later(stg, () => { for (let i = 0; i < 16; i++) setTimeout(() => { bpFlash(m.x, m.y, 10); const tx = BW / 2 + 40 + i * 26 + rnd(-6, 6); bpTracer(m.x, m.y, tx, BH * .7 + rnd(-10, 30), 2);
        setTimeout(() => { bpDust(tx, BH * .72 + rnd(0, 30), 1); const tf = targets.find(o => Math.abs(hitPt(o).x - tx) < 40); if (tf) strike(tf, .4); }, 100); }, i * 45); }); break;
      case 'dive': case 'bombs': later(stg * 2, () => { shot(snd, {gain:vol}); const tf = aim(), h = hitPt(tf), dy = Math.max(10, h.y - m.y), fall = (-120 + Math.sqrt(14400 + 1800 * dy)) / 900;
        if (whistles++ < 2) incomingTo(fall + .15, {f0:1700, f1:500, gain:vol});
        bp({k:'bomb', x:m.x, y:m.y + 20, vx:(h.x - m.x) * 1.2, vy:120, g:900, ty:h.y + 20, life:1.2, done:() => { bpExplode(h.x, h.y + 10, 2); boom(1.5); strike(tf); strike(near(tf), .5); }}); }); break;
      case 'rockets': for (let i = 0; i < 4; i++) later(stg + i * 100, () => { if (idx < 2) launch({gain:vol}); bpFlash(m.x, m.y + 10, 12); const tf = i ? pick() : aim(), h = hitPt(tf);
        bpRocket(m.x, m.y + 10, h.x + rnd(-20, 20), h.y, 380, () => { bpExplode(h.x, h.y, 1.2); boom(.9); strike(tf, i ? .3 : 1); }); }); break;
    }
  });
}
/* ---------- battle particles ---------- */
function bpFlash(x, y, s) { bp({k:'flash', x, y, size:s, life:.09}); }
function bpTracer(x1, y1, x2, y2, w = 2, life = 140) { bp({k:'tracer', x1, y1, x2, y2, w, life:life / 1000}); }
function bpSmoke(x, y, n, dark = .4, size = 16) { for (let i = 0; i < n; i++) bp({k:'smoke', x:x + rnd(-10, 10), y:y + rnd(-6, 6), vx:rnd(-20, 20), vy:-rnd(10, 40), size:size * rnd(.6, 1), grow:rnd(20, 40), shade:dark, life:rnd(1, 1.8)}); }
function bpBlood(x, y, n) { const gl = goreLevel(); if (!gl) return; for (let i = 0; i < n * gl; i++) bp({k:'blood', x:x + rnd(-8, 8), y:y + rnd(-8, 8), vx:rnd(-160, 160), vy:-rnd(40, 260), g:900, size:rnd(2, 4.5), life:rnd(.5, 1)}); }
function bpBloodDir(x, y, n, dir) { const gl = goreLevel(); if (!gl) return; for (let i = 0; i < n * gl; i++) bp({k:'blood', x:x + rnd(-6, 6), y:y + rnd(-8, 8), vx:dir * rnd(40, 260) + rnd(-40, 40), vy:-rnd(20, 220), g:900, size:rnd(2, 5), life:rnd(.5, 1.1)}); }   // spray thrown away from the shot
function bpDust(x, y, n) { for (let i = 0; i < n; i++) bp({k:'dust', x:x + rnd(-8, 8), y, vx:rnd(-30, 30), vy:-rnd(30, 90), g:200, size:rnd(4, 9), life:rnd(.4, .8)}); }
function bpSparks(x, y, n) { for (let i = 0; i < n; i++) bp({k:'spark', x, y, vx:rnd(-260, 260), vy:-rnd(60, 280), g:600, life:rnd(.25, .5)}); }
function bpFire(x, y, n) { for (let i = 0; i < n; i++) bp({k:'fire', x:x + rnd(-14, 14), y:y + rnd(-8, 8), vx:rnd(-16, 16), vy:-rnd(40, 110), size:rnd(6, 13), life:rnd(.35, .8)}); }
function bpExplode(x, y, s = 1) {
  bp({k:'flash', x, y, size:60 * s, life:.16}); bpFire(x, y, 16 * s); bpSmoke(x, y - 10, 7 * s, .7, 22 * s);
  for (let i = 0; i < 16 * s; i++) bp({k:'debris', x, y, vx:rnd(-240, 240), vy:-rnd(120, 420), g:900, size:rnd(2, 5), life:rnd(.6, 1.1)});
  bpSparks(x, y, 10 * s); bp({k:'ring', x, y:y + 30, size:10, grow:120 * s, life:.5}); BAT.shake = Math.max(BAT.shake, 9 * s);
}
function bpRocket(x1, y1, x2, y2, ms, done, arc = 0) { bp({k:'rocket', x1, y1, x2, y2, arc, life:ms / 1000, done}); }
function bpArc(x1, y1, x2, y2, ms, arc, style, done) { bp({k:'arcp', x1, y1, x2, y2, arc, style, life:ms / 1000, done}); }
function updateBattleParts(g, dt) {
  BAT.parts = BAT.parts.filter(p => p.t < p.life);
  for (const p of BAT.parts) {
    p.t += dt; const k = p.t / p.life;
    if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; }
    switch (p.k) {
      case 'flash': { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); gr.addColorStop(0, `rgba(255,255,220,${1 - k})`); gr.addColorStop(.5, `rgba(255,190,80,${(1 - k) * .8})`); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.size, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; break; }
      case 'tracer': { g.globalCompositeOperation = 'lighter'; const x = p.x1 + (p.x2 - p.x1) * k, y = p.y1 + (p.y2 - p.y1) * k, xb = p.x1 + (p.x2 - p.x1) * Math.max(0, k - .2), yb = p.y1 + (p.y2 - p.y1) * Math.max(0, k - .2);
        g.strokeStyle = 'rgba(255,230,150,.95)'; g.lineWidth = p.w; g.beginPath(); g.moveTo(xb, yb); g.lineTo(x, y); g.stroke(); g.globalCompositeOperation = 'source-over'; break; }
      case 'smoke': { const s = p.size + p.grow * k, c = Math.round(70 + (1 - p.shade) * 120); g.fillStyle = `rgba(${c},${c - 4},${c - 10},${(1 - k) * .6})`; g.beginPath(); g.arc(p.x, p.y, s, 0, 7); g.fill(); break; }
      case 'puff': { const s = p.size + p.grow * k; g.fillStyle = `rgba(28,26,24,${(1 - k) * .85})`; g.beginPath(); g.arc(p.x, p.y, s, 0, 7); g.fill(); break; }
      case 'dust': g.fillStyle = `rgba(150,130,90,${1 - k})`; g.beginPath(); g.arc(p.x, p.y, p.size * (1 + k), 0, 7); g.fill(); break;
      case 'spark': g.fillStyle = `rgba(255,${Math.round(230 - 120 * k)},120,${1 - k})`; g.fillRect(p.x, p.y, 3, 3); break;
      case 'debris': g.fillStyle = `rgba(50,40,32,${1 - k})`; g.fillRect(p.x, p.y, p.size, p.size); break;
      case 'goo': g.fillStyle = `rgba(160,210,60,${1 - k})`; g.fillRect(p.x, p.y, p.size, p.size); break;
      case 'blood': g.fillStyle = `rgba(${130 - 50 * k | 0},10,8,${1 - k * .3})`; g.fillRect(p.x, p.y, p.size, p.size); break;
      case 'bailout': { const img = getSprite(p.nat, 'inf', Math.floor(p.t * 10) % 8, false, (G.theme === 'winter' ? 'w' : '') + '1', 2 * BQ), s = 46; g.save(); g.globalAlpha = 1 - Math.max(0, k - .7) * 3; if (p.vx < 0) { g.translate(p.x + s, p.y - s); g.scale(-1, 1); g.drawImage(img, 0, 0, s, s); } else g.drawImage(img, p.x, p.y - s, s, s); g.restore(); if (p.burn && Math.random() < .6) bpFire(p.x + s / 2, p.y - s / 2, 1); break; }
      case 'fire': { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,${Math.round(200 - 140 * k)},60,${1 - k})`; g.beginPath(); g.arc(p.x, p.y, p.size * (1 - k * .5), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; break; }
      case 'ring': g.strokeStyle = `rgba(220,200,160,${(1 - k) * .7})`; g.lineWidth = 3; g.beginPath(); g.ellipse(p.x, p.y, p.size + p.grow * k, (p.size + p.grow * k) * .3, 0, 0, 7); g.stroke(); break;
      case 'rocket': case 'arcp': {
        const x = p.x1 + (p.x2 - p.x1) * k, y = p.y1 + (p.y2 - p.y1) * k - Math.sin(k * Math.PI) * (p.arc || 0);
        if (p.k === 'rocket') { bp({k:'smoke', x, y, vx:0, vy:-6, size:4, grow:14, shade:.15, life:.8}); g.fillStyle = '#ffe0a0'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
        else if (p.style === 'bile') { g.fillStyle = '#a8d040'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); bp({k:'goo', x, y, vx:0, vy:30, g:200, size:2, life:.4}); }
        else { g.fillStyle = p.style === 'satchel' ? '#6a5a3a' : '#2a2a26'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
        if (k > .96 && p.done) { const d = p.done; p.done = null; d(); }
        break; }
      case 'say': {                                     // a speech bubble, drifting up a little as it fades
        const a = Math.min(1, (1 - k) * 4, p.t * 10), y = p.y - p.t * 10; g.save(); g.globalAlpha = a; g.font = 'bold 17px "Courier Prime",monospace';
        const w = g.measureText(p.text).width + 16, h = 26, bx = Math.max(6, Math.min(BW - w - 6, p.x - w / 2)), by = Math.max(74, y - h);
        g.fillStyle = '#f4efe0'; g.strokeStyle = '#1a1814'; g.lineWidth = 2; g.beginPath(); g.roundRect(bx, by, w, h, 7); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(p.x - 6, by + h - 1); g.lineTo(p.x + (p.side ? 7 : -7), by + h + 10); g.lineTo(p.x + 6, by + h - 1); g.fill(); g.stroke(); g.fillRect(p.x - 5, by + h - 3, 10, 3);
        g.fillStyle = '#1a1814'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.text, bx + w / 2, by + h / 2 + 1); g.restore(); break; }
      case 'turret': case 'helmet': case 'brass': case 'gib': {   // a turret blown off its ring, a helmet knocked off, a spent case, a piece of a man: thrown, tumbling, bouncing to rest
        if (p.y > p.floor) { p.y = p.floor; p.vy *= -.28; p.vx *= .5; p.spin *= .4; if (p.k === 'turret' && !p.thud) { p.thud = 1; bpDust(p.x, p.y, 8); BAT.shake = Math.max(BAT.shake, 6); sfxNow('thud'); } if (p.k === 'gib' && !p.splat) { p.splat = 1; bpBlood(p.x, p.y, 4); } }
        p.rot = (p.rot || 0) + p.spin * dt; const a = Math.min(1, (1 - k) * 4);
        if (p.k === 'gib' && p.y < p.floor - 2 && Math.random() < .5) bp({k:'blood', x:p.x, y:p.y, vx:rnd(-20, 20), vy:rnd(-10, 30), g:600, size:rnd(1.5, 3), life:.5});   // a trail of blood behind it
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = a;
        if (p.k === 'brass') { g.fillStyle = '#d0a848'; g.fillRect(-2 * p.s, -.8 * p.s, 4 * p.s, 1.6 * p.s); g.restore(); break; }
        if (p.k === 'gib') { const w = p.w * p.s, h = p.h * p.s; g.fillStyle = p.col; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = p.end; g.fillRect(-w / 2, h / 2 - Math.min(h * .3, 4 * p.s), w, Math.min(h * .3, 4 * p.s)); g.fillStyle = '#7a0c08'; g.fillRect(-w / 2, -h / 2, w, Math.max(1.5, h * .14)); g.restore(); break; }
        if (p.k === 'turret') { if (Math.random() < .6 && k < .6) bp({k:'smoke', x:p.x, y:p.y, vx:0, vy:-10, size:5, grow:18, shade:.9, life:.9}); if (p.flip) g.scale(-1, 1); g.filter = 'brightness(.4) sepia(.4)'; g.drawImage(p.img, 0, p.sy, p.iw, p.sh, -p.dw / 2, -p.dh / 2, p.dw, p.dh); }
        else { g.fillStyle = '#4f5a3e'; g.beginPath(); g.ellipse(0, 0, 7 * p.s, 4.5 * p.s, 0, Math.PI, 0); g.fill(); g.fillRect(-8 * p.s, -.5, 16 * p.s, 2); }
        g.restore(); break; }
      case 'shellUp': g.fillStyle = '#2a2a26'; g.fillRect(p.x, p.y, 4, 6); break;
      case 'shellDown': { g.fillStyle = '#2a2a26'; g.fillRect(p.x - 2, p.y, 4, 8); g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(p.x, p.y - 30); g.lineTo(p.x, p.y); g.stroke();
        if (p.y >= p.ty && p.done) { const d = p.done; p.done = null; d(); p.t = p.life; } break; }
      case 'bomb': { g.fillStyle = '#1e1e1a'; g.beginPath(); g.ellipse(p.x, p.y, 5, 9, Math.atan2(p.vy, p.vx) - Math.PI / 2, 0, 7); g.fill();
        if (p.y >= p.ty && p.done) { const d = p.done; p.done = null; d(); p.t = p.life; } break; }
    }
  }
}
