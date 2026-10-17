/* ============================== BATTLE CUT-IN =============================
   Advance Wars style: attacker on the left, defender on the right, one
   figure per two HP. Every weapon class has its own choreography: rifle and
   MG tracers, bazooka backblast and rocket, tank-gun flash and recoil,
   artillery arcing out and falling in, rocket salvos, flak bursts, strafing
   runs, dive bombing, flamethrowers, satchel charges, naval gunfire.
   Hit figures fall (infantry) or brew up (vehicles). */
const BW = 960, BH = 360;
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
    const wrap = $('#battlewrap'); wrap.hidden = false; bcv.width = BW; bcv.height = BH; BAT.parts = [];
    const counter = res.counter > 0 || res.cKilled, dur = counter ? 4600 : 3000; let skip = false;
    const t0 = performance.now();
    const fin = () => { wrap.hidden = true; wrap.onclick = null; done(); };
    wrap.onclick = () => { skip = true; };
    const mk = (u, side, hp0, hp1) => {
      const n0 = Math.max(1, Math.ceil(hp0 / 20)), n1 = Math.max(0, Math.ceil(Math.max(0, hp1) / 20));
      return {u, side, nat:G.teams[u.team].nat, hp0, hp1:Math.max(0, hp1), n0, n1, ter:terr(u.x, u.y), cls:fxClass(u.d), air:!!u.d.air,
        figs:Array.from({length:n0}, (_, i) => ({i, alive:true, dieT:0, recoil:0, rnd:Math.random()}))};
    };
    const A = mk(att, 0, preAtt, att.hp), D = mk(def, 1, preDef, def.hp);
    // which figures fall, and when
    const plan = (S, at) => { const lost = S.n0 - S.n1; const order = S.figs.slice().sort((a, b) => a.rnd - b.rnd); for (let i = 0; i < lost; i++) order[i].dieAt = at + i * 140; };
    plan(D, 1500); if (counter) plan(A, 3200);
    const bg = mkCanvas(BW, BH), bgg = bg.getContext('2d'); drawBackdrop(bgg, 0, A.ter, G.theme, G.weather, 1); drawBackdrop(bgg, BW / 2, D.ter, G.theme, G.weather, 2);
    const fired = {a:false, c:false};
    let last = performance.now();
    const step = () => {
      const now = performance.now(), k = now - t0, dt = Math.min(.05, (now - last) / 1000); last = now;
      if (skip || k > dur) return fin();
      if (!fired.a && k > 450) { fired.a = true; fireVolley(A, D, 0); }
      if (counter && !fired.c && k > 2300) { fired.c = true; fireVolley(D, A, 0); }
      const g = bctx; g.setTransform(1, 0, 0, 1, 0, 0);
      const sh = BAT.shake * (Math.random() - .5); BAT.shake *= .9; g.setTransform(1, 0, 0, 1, sh, sh * .6);
      g.drawImage(bg, 0, 0); g.imageSmoothingEnabled = false;
      for (const S of [A, D]) drawSide(g, S, k, now);
      updateBattleParts(g, dt);
      // panel labels
      g.setTransform(1, 0, 0, 1, 0, 0);
      for (const S of [A, D]) {
        const X = S.side ? BW / 2 + 12 : 12, hpNow = S.figs.filter(f => f.alive).length;
        g.fillStyle = 'rgba(10,10,8,.72)'; g.fillRect(X, 10, 300, 58);
        g.drawImage(flagCanvas(S.nat, 30, 20), X + 10, 18, 30, 20);
        g.fillStyle = '#f4e8c8'; g.textAlign = 'left'; let fs = 17; g.font = `bold ${fs}px "Courier Prime",monospace`;
        while (g.measureText(S.u.d.n).width > 172 && fs > 11) { fs--; g.font = `bold ${fs}px "Courier Prime",monospace`; }
        g.fillText(S.u.d.n, X + 50, 32);
        g.fillStyle = '#b9b090'; g.font = '13px "Courier Prime",monospace'; g.fillText(S.u.name || '', X + 50, 50);
        const shown = S.figs.some(f => f.dieAt && k > f.dieAt) ? S.hp1 : S.hp0;
        g.fillStyle = '#e8c040'; g.font = 'bold 20px "Courier Prime",monospace'; g.textAlign = 'right'; g.fillText('HP ' + Math.ceil(shown / 10), X + 290, 32);
        const r = rankOf(S.u); if (r) { g.fillStyle = '#e8c040'; g.font = '13px "Courier Prime",monospace'; g.fillText(RANKS[r].n.toUpperCase(), X + 290, 52); }
      }
      g.fillStyle = '#111'; g.fillRect(BW / 2 - 3, 0, 6, BH);
      const dmgLbl = (S, at, val) => { if (k > at && k < at + 1100 && val > 0) { const a = 1 - (k - at) / 1100; g.globalAlpha = a; g.font = 'bold 40px "Stardos Stencil",Impact,sans-serif'; g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText('-' + val + '%', (S.side ? BW * .75 : BW * .25) + 2, 128 - (1 - a) * 30 + 2); g.fillStyle = '#ffd34a'; g.fillText('-' + val + '%', S.side ? BW * .75 : BW * .25, 128 - (1 - a) * 30); g.globalAlpha = 1; } };
      dmgLbl(D, 1450, res.dmg); if (counter) dmgLbl(A, 3150, res.counter);
      setTimeout(step, 16);                                   // timer-driven so it also completes in a background tab
    };
    step();
  });
}
function figPoint(S, f) { const p = slotPos(f.i, S.n0, S.side, S.air); return {x:p.x + 32 * p.s, y:p.y + 34 * p.s, s:p.s}; }
function drawSide(g, S, k, now) {
  for (const f of S.figs.slice().sort((a, b) => (a.i >= 3 ? 0 : 1) - (b.i >= 3 ? 0 : 1))) {
    const p = slotPos(f.i, S.n0, S.side, S.air), size = 64 * p.s;
    let frame = Math.floor(now / 120) % 8; if (!S.u.d.foot && !S.air && !S.u.d.sea) frame = Math.floor(now / 90) % 8;
    const dead = f.dieAt && k > f.dieAt;
    if (dead && f.alive) { f.alive = false; f.deadT = now; const c = figPoint(S, f);
      if (S.u.d.foot) { bpBlood(c.x, c.y - 10, 26); f.pool = 1; if (goreLevel() && (S.screams = (S.screams || 0) + 1) <= 2) sfx(S.nat === 'zed' ? 'zdie' : Math.random() < .6 ? 'scream' : 'cry'); }
      else { bpExplode(c.x, c.y, 1.6); bpFire(c.x, c.y - 10, 20); if (!S.u.d.air && !S.u.d.sea && !S.u.d.fixed && goreLevel()) for (let i = 0; i < 2; i++) bp({k:'bailout', x:c.x + rnd(-10, 10), y:c.y + 10, vx:(S.side ? 1 : -1) * rnd(40, 80), vy:0, nat:S.nat, life:1.4, burn:Math.random() < .5 && goreLevel() > 1}); } }
    let img = getSprite(S.nat, S.u.role, frame, false, G.theme === 'winter' ? 'w' : '');
    const rec = f.recoil || 0; f.recoil = f.recoil > 0 ? Math.max(0, f.recoil - 1.2) : Math.min(0, f.recoil + 1.4);   // negative recoil: a lunge forward
    g.save();
    let x = p.x + (S.side ? rec : -rec), y = p.y + (S.air ? Math.sin(now / 260 + f.i) * 6 : 0);
    if (!S.air) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + size / 2, y + size * .9, size * .38, size * .07, 0, 0, 7); g.fill(); }
    if (dead) {
      const dk = Math.min(1, (now - f.deadT) / 500);
      if (S.u.d.foot && goreLevel()) { g.save(); g.fillStyle = 'rgba(90,8,6,.75)'; g.beginPath(); g.ellipse(x + size / 2, y + size * .92, size * .1 + dk * size * .22, size * .03 + dk * size * .06, 0, 0, 7); g.fill(); g.restore(); }
      if (S.u.d.foot) { g.globalAlpha = 1 - dk * .3; g.translate(x + size / 2, y + size * .9); g.rotate((S.side ? 1 : -1) * dk * Math.PI / 2.2); g.translate(-size / 2, -size * .9); x = 0; y = 0; }
      else { g.filter = 'brightness(.3) sepia(.5)'; if (Math.random() < .25) bpSmoke(x + size / 2 + rnd(-10, 10), y + size * .4, 1, .8); if (Math.random() < .15) bpFire(x + size / 2, y + size * .5, 2); }
      if (S.air) { y += dk * 120; g.globalAlpha = 1 - dk; }
    }
    if (S.side) { g.translate(x + size, y); g.scale(-1, 1); g.drawImage(img, 0, 0, size, size); } else g.drawImage(img, x, y, size, size);
    g.restore();
  }
}
/* ---------- volleys ---------- */
function muzzleOf(S, f) { const p = slotPos(f.i, S.n0, S.side, S.air), dir = S.side ? -1 : 1; return {x:p.x + (S.side ? 6 : 58) * p.s, y:p.y + (S.u.d.foot ? 30 : 22) * p.s, dir, s:p.s}; }
function fireVolley(S, T, delay) {
  const shooters = S.figs.filter(f => f.alive), targets = T.figs;
  const pick = () => targets[Math.floor(Math.random() * targets.length)];
  const hitPt = f => figPoint(T, f);
  const later = (ms, fn) => setTimeout(fn, ms + delay);
  const cls = S.cls;
  sfx(S.u.d.snd);
  shooters.forEach((f, idx) => {
    const m = muzzleOf(S, f), stg = idx * 70;
    switch (cls) {
      case 'smallarms': {
        const rate = S.u.d.snd === 'mg42' || S.u.role === 'nest' ? 26 : S.u.d.snd === 'ppsh' ? 20 : S.u.d.snd === 'garand' ? 8 : 12;
        for (let i = 0; i < rate; i++) later(stg + i * (900 / rate), () => { bpFlash(m.x, m.y, 10 * m.s); const tf = pick(), h = hitPt(tf); bpTracer(m.x, m.y, h.x + rnd(-20, 20), h.y + rnd(-14, 14)); if (Math.random() < .5) { if (T.u.d.foot && Math.random() < .5) bpBlood(h.x + rnd(-16, 16), h.y + rnd(-10, 10), 3); else bpDust(h.x + rnd(-24, 24), h.y + 26, 1); } });
        break; }
      case 'maul': later(stg * 2, () => { f.recoil = -46; BAT.shake = 3; for (let i = 0; i < 3; i++) setTimeout(() => { const h = hitPt(pick()); bpBlood(h.x + rnd(-14, 14), h.y + rnd(-14, 6), 10); }, 160 + i * 120); }); break;
      case 'bile': later(stg * 2, () => { const h = hitPt(pick()); bpArc(m.x, m.y - 26, h.x, h.y, 700, 150, 'bile', () => { for (let i = 0; i < 18; i++) bp({k:'goo', x:h.x + rnd(-10, 10), y:h.y + rnd(-8, 4), vx:rnd(-120, 120), vy:-rnd(30, 160), g:500, size:rnd(2, 4), life:rnd(.5, .9)}); bpSmoke(h.x, h.y, 4, .1, 14); }); }); break;
      case 'rocketAT': later(stg, () => { bpSmoke(m.x - m.dir * 70, m.y, 6, .2, 18); bpFlash(m.x, m.y, 18); const h = hitPt(pick()); bpRocket(m.x, m.y, h.x, h.y, 420, () => bpExplode(h.x, h.y, 1.1)); }); break;
      case 'atrifle': later(stg, () => { bpFlash(m.x, m.y, 26); BAT.shake = 4; const h = hitPt(pick()); bpTracer(m.x, m.y, h.x, h.y, 3); setTimeout(() => bpSparks(h.x, h.y, 14), 90); }); break;
      case 'flamer': for (let i = 0; i < 28; i++) later(stg + i * 30, () => { const h = hitPt(pick()); bp({k:'fire', x:m.x, y:m.y, vx:(h.x - m.x) * rnd(1.4, 1.9), vy:(h.y - m.y) * 1.8 - 30, size:rnd(8, 16), life:.55}); });
        later(stg + 600, () => { for (const tf of targets) { const h = hitPt(tf); bpFire(h.x, h.y, 10); } }); break;
      case 'charge': later(stg, () => { const h = hitPt(pick()); bpArc(m.x, m.y, h.x, h.y, 600, 120, 'satchel', () => bpExplode(h.x, h.y, 1.3)); }); break;
      case 'cannon': later(stg * 2, () => { const big = S.u.role === 'htank' || S.u.role === 'pak' ? 1.5 : 1.1; bpFlash(m.x, m.y, 34 * big); bpFlash(m.x, m.y - 8, 14); bpFlash(m.x, m.y + 8, 14);
        bpSmoke(m.x, m.y, 5, .4, 22); bpDust(m.x - m.dir * 40, m.y + 40, 4); f.recoil = 14; BAT.shake = 6 * big; const h = hitPt(pick()); bpTracer(m.x, m.y, h.x, h.y, 5, 120); setTimeout(() => { bpExplode(h.x, h.y, .9 * big); bpSparks(h.x, h.y, 16); }, 130); }); break;
      case 'artillery': case 'naval': later(stg * 3, () => { bpFlash(m.x, m.y - 14, 36); bpSmoke(m.x, m.y - 10, 8, .45, 26); f.recoil = 12; BAT.shake = 7;
        bp({k:'shellUp', x:m.x, y:m.y - 14, vx:m.dir * 260, vy:-700, life:.6});
        setTimeout(() => { const h = hitPt(pick()); bp({k:'shellDown', x:h.x + rnd(-30, 30), y:-20, ty:h.y, vy:900, life:1.2, done:() => bpExplode(h.x + rnd(-20, 20), h.y + 10, cls === 'naval' ? 2 : 1.5)}); }, 900); }); break;
      case 'mortar': later(stg * 2, () => { bpFlash(m.x - m.dir * 20, m.y - 30, 14); const h = hitPt(pick()); bpArc(m.x - m.dir * 20, m.y - 30, h.x, h.y, 900, 260, 'mortar', () => bpExplode(h.x, h.y, 1)); }); break;
      case 'salvo': for (let i = 0; i < 6; i++) later(stg + i * 120, () => { bpFlash(m.x, m.y - 10, 16); bpSmoke(m.x - m.dir * 30, m.y, 3, .25, 20); const h = hitPt(pick());
        bpRocket(m.x, m.y - 10, h.x + rnd(-30, 30), h.y, 1000, () => bpExplode(h.x + rnd(-20, 20), h.y, 1.1), 220); }); break;
      case 'flak': for (let i = 0; i < 10; i++) later(stg + i * 90, () => { bpFlash(m.x, m.y - 14, 12); const h = hitPt(pick());
        if (T.air) { bpTracer(m.x, m.y - 14, h.x + rnd(-40, 40), h.y + rnd(-30, 30), 2); setTimeout(() => bp({k:'puff', x:h.x + rnd(-40, 40), y:h.y + rnd(-30, 30), size:6, grow:26, life:1.1}), 160); }
        else { bpTracer(m.x, m.y - 14, h.x + rnd(-20, 20), h.y, 2); bpDust(h.x + rnd(-20, 20), h.y + 24, 1); } }); break;
      case 'strafe': later(stg, () => { for (let i = 0; i < 16; i++) setTimeout(() => { bpFlash(m.x, m.y, 10); const tx = BW / 2 + 40 + i * 26 + rnd(-6, 6); bpTracer(m.x, m.y, tx, BH * .7 + rnd(-10, 30), 2); setTimeout(() => bpDust(tx, BH * .72 + rnd(0, 30), 1), 100); }, i * 45); }); break;
      case 'dive': case 'bombs': later(stg * 2, () => { const h = hitPt(pick()); bp({k:'bomb', x:m.x, y:m.y + 20, vx:(h.x - m.x) * 1.2, vy:120, g:900, ty:h.y + 20, life:1.2, done:() => bpExplode(h.x, h.y + 10, 2)}); }); break;
      case 'rockets': for (let i = 0; i < 4; i++) later(stg + i * 100, () => { bpFlash(m.x, m.y + 10, 12); const h = hitPt(pick()); bpRocket(m.x, m.y + 10, h.x + rnd(-20, 20), h.y, 380, () => bpExplode(h.x, h.y, 1.2)); }); break;
    }
  });
}
/* ---------- battle particles ---------- */
function bpFlash(x, y, s) { bp({k:'flash', x, y, size:s, life:.09}); }
function bpTracer(x1, y1, x2, y2, w = 2, life = 140) { bp({k:'tracer', x1, y1, x2, y2, w, life:life / 1000}); }
function bpSmoke(x, y, n, dark = .4, size = 16) { for (let i = 0; i < n; i++) bp({k:'smoke', x:x + rnd(-10, 10), y:y + rnd(-6, 6), vx:rnd(-20, 20), vy:-rnd(10, 40), size:size * rnd(.6, 1), grow:rnd(20, 40), shade:dark, life:rnd(1, 1.8)}); }
function bpBlood(x, y, n) { const gl = goreLevel(); if (!gl) return; for (let i = 0; i < n * gl; i++) bp({k:'blood', x:x + rnd(-8, 8), y:y + rnd(-8, 8), vx:rnd(-160, 160), vy:-rnd(40, 260), g:900, size:rnd(2, 4.5), life:rnd(.5, 1)}); }
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
      case 'bailout': { const img = getSprite(p.nat, 'inf', Math.floor(p.t * 10) % 8, false, (G.theme === 'winter' ? 'w' : '') + '1'), s = 46; g.save(); g.globalAlpha = 1 - Math.max(0, k - .7) * 3; if (p.vx < 0) { g.translate(p.x + s, p.y - s); g.scale(-1, 1); g.drawImage(img, 0, 0, s, s); } else g.drawImage(img, p.x, p.y - s, s, s); g.restore(); if (p.burn && Math.random() < .6) bpFire(p.x + s / 2, p.y - s / 2, 1); break; }
      case 'fire': { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,${Math.round(200 - 140 * k)},60,${1 - k})`; g.beginPath(); g.arc(p.x, p.y, p.size * (1 - k * .5), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; break; }
      case 'ring': g.strokeStyle = `rgba(220,200,160,${(1 - k) * .7})`; g.lineWidth = 3; g.beginPath(); g.ellipse(p.x, p.y, p.size + p.grow * k, (p.size + p.grow * k) * .3, 0, 0, 7); g.stroke(); break;
      case 'rocket': case 'arcp': {
        const x = p.x1 + (p.x2 - p.x1) * k, y = p.y1 + (p.y2 - p.y1) * k - Math.sin(k * Math.PI) * (p.arc || 0);
        if (p.k === 'rocket') { bp({k:'smoke', x, y, vx:0, vy:-6, size:4, grow:14, shade:.15, life:.8}); g.fillStyle = '#ffe0a0'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
        else if (p.style === 'bile') { g.fillStyle = '#a8d040'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); bp({k:'goo', x, y, vx:0, vy:30, g:200, size:2, life:.4}); }
        else { g.fillStyle = p.style === 'satchel' ? '#6a5a3a' : '#2a2a26'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
        if (k > .96 && p.done) { const d = p.done; p.done = null; d(); }
        break; }
      case 'shellUp': g.fillStyle = '#2a2a26'; g.fillRect(p.x, p.y, 4, 6); break;
      case 'shellDown': { g.fillStyle = '#2a2a26'; g.fillRect(p.x - 2, p.y, 4, 8); g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(p.x, p.y - 30); g.lineTo(p.x, p.y); g.stroke();
        if (p.y >= p.ty && p.done) { const d = p.done; p.done = null; d(); p.t = p.life; } break; }
      case 'bomb': { g.fillStyle = '#1e1e1a'; g.beginPath(); g.ellipse(p.x, p.y, 5, 9, Math.atan2(p.vy, p.vx) - Math.PI / 2, 0, 7); g.fill();
        if (p.y >= p.ty && p.done) { const d = p.done; p.done = null; d(); p.t = p.life; } break; }
    }
  }
}
