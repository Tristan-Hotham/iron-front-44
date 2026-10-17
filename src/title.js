/* =============================== TITLE SCREEN ===============================
   A living dusk landing: the painted shore stays put while everything on it
   moves. Clouds drift, flags stream in the wind, the sea rolls, landing craft
   bob in on the swell, a destroyer fires, aircraft cross with flak bursting
   round them, guns flicker along the ridge and smoke climbs from the burning
   positions. The camera breathes. It only animates while the title is shown. */
const TITLE = {raf:0, layer:null, W:0, H:0, t0:0, parts:[], planes:[], flags:{}, last:0, next:{}};
function titleLayer(W, H) {                             // the still painting: sky, far ridge, sand and the sea's base colour
  const c = mkCanvas(W, H), g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, H * .6); sky.addColorStop(0, '#232b3c'); sky.addColorStop(.55, '#b07650'); sky.addColorStop(1, '#e8c48a');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sun = g.createRadialGradient(W * .7, H * .5, 0, W * .7, H * .5, W * .3); sun.addColorStop(0, 'rgba(255,214,150,.55)'); sun.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, H);   // the low sun behind the smoke
  g.fillStyle = '#3e4a40'; g.beginPath(); g.moveTo(0, H * .53); for (let x = 0; x <= W; x += W / 30) g.lineTo(x, H * .46 - Math.sin(x * .008) * H * .05 - hrand(x | 0, 1) * H * .035); g.lineTo(W, H * .6); g.lineTo(0, H * .6); g.fill();
  g.fillStyle = '#56624e'; g.beginPath(); g.moveTo(0, H * .56); for (let x = 0; x <= W; x += W / 40) g.lineTo(x, H * .52 - Math.sin(x * .013 + 2) * H * .025 - hrand(x | 0, 7) * H * .02); g.lineTo(W, H * .6); g.lineTo(0, H * .6); g.fill();
  const sand = g.createLinearGradient(0, H * .55, 0, H * .76); sand.addColorStop(0, '#cdb882'); sand.addColorStop(.75, '#d8c48e'); sand.addColorStop(1, '#a89468'); g.fillStyle = sand; g.fillRect(0, H * .55, W, H * .21);   // the beach the tanks are crossing
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(90,70,40,${.08 + hrand(i, 11) * .1})`; g.fillRect(hrand(i, 12) * W, H * (.57 + hrand(i, 13) * .17), 3 + hrand(i, 14) * 10, 2); }   // tracks and shell scrapes
  const sea = g.createLinearGradient(0, H * .76, 0, H); sea.addColorStop(0, '#3a6a8a'); sea.addColorStop(1, '#1e3e5a'); g.fillStyle = sea; g.fillRect(0, H * .76, W, H * .24);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, H * .758, W, H * .007);                                                       // surf on the shoreline
  return c;
}
function titleFlag(nat, w, h) {                         // each flag painted once, then streamed in slices
  const k = nat + w; if (TITLE.flags[k]) return TITLE.flags[k];
  const c = mkCanvas(Math.ceil(w), Math.ceil(h)); drawFlag(c.getContext('2d'), nat, 0, 0, w, h); return TITLE.flags[k] = c;
}
function titleFrame(now) {
  const c = $('#titlecv'); if (!c || document.body.dataset.screen !== 'title') { TITLE.raf = 0; return; }
  TITLE.raf = requestAnimationFrame(titleFrame);
  if (now - TITLE.last < 33) return;                     // 30 frames a second is plenty for a painting
  const dt = Math.min(.1, (now - (TITLE.last || now)) / 1000); TITLE.last = now;
  const W = TITLE.W, H = TITLE.H, g = c.getContext('2d'), t = (now - TITLE.t0) / 1000, S = Math.max(1, W / 700);
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
  const zoom = 1.03 + Math.sin(t / 11) * .012, ox = Math.sin(t / 13) * W * .008, oy = Math.cos(t / 17) * H * .006;   // the camera breathes
  g.setTransform(zoom, 0, 0, zoom, -W * (zoom - 1) / 2 + ox, -H * (zoom - 1) / 2 + oy);
  g.drawImage(TITLE.layer, 0, 0);
  // clouds drifting over the sun
  for (let i = 0; i < 7; i++) { const x = ((hrand(i, 3) * W + t * W * (.006 + hrand(i, 9) * .006)) % (W * 1.3)) - W * .15;
    g.fillStyle = `rgba(255,${200 + i * 5},170,${.12 + hrand(i, 5) * .1})`; g.beginPath(); g.ellipse(x, H * (.08 + hrand(i, 4) * .26), W * (.08 + hrand(i, 6) * .07), H * .028, 0, 0, 7); g.fill(); }
  // the sea: swell lines rolling in
  for (let i = 0; i < 60; i++) { const y = H * .78 + hrand(i, 3) * H * .21, sp = 12 + (y / H) * 30, x = ((hrand(i, 2) * W - t * sp) % W + W) % W;
    g.fillStyle = `rgba(255,255,255,${.12 + hrand(i, 8) * .2})`; g.fillRect(x, y + Math.sin(t * 1.5 + i) * 2, 10 + hrand(i, 5) * 22, 2); }
  // gunfire flickering along the ridge, and shells landing on the German positions
  if (t > (TITLE.next.gun || 0)) { TITLE.next.gun = t + .15 + Math.random() * .9; const x = W * (.52 + Math.random() * .45), y = H * (.44 + Math.random() * .1); TITLE.parts.push({k:'flash', x, y, r:W * (.012 + Math.random() * .02), life:.25, t:0});
    if (Math.random() < .35) for (let i = 0; i < 4; i++) TITLE.parts.push({k:'smoke', x:x + (Math.random() - .5) * 20, y, vx:6 + Math.random() * 6, vy:-10 - Math.random() * 10, r:W * .006, grow:W * .02, life:4 + Math.random() * 3, t:0, shade:.35}); }
  for (const [px, py] of [[.66, .4], [.79, .43], [.9, .41]]) if (Math.random() < .5) TITLE.parts.push({k:'smoke', x:W * px + (Math.random() - .5) * 8, y:H * py, vx:5 + Math.random() * 6, vy:-14 - Math.random() * 8, r:W * .005, grow:W * .03, life:6 + Math.random() * 3, t:0, shade:.25});   // burning positions
  // the destroyer firing in support
  if (t > (TITLE.next.dd || 2)) { TITLE.next.dd = t + 3 + Math.random() * 4; TITLE.parts.push({k:'flash', x:W * .08, y:H * .9, r:W * .03, life:.3, t:0}); for (let i = 0; i < 6; i++) TITLE.parts.push({k:'smoke', x:W * .08, y:H * .9, vx:8 + Math.random() * 10, vy:-6 - Math.random() * 6, r:W * .006, grow:W * .025, life:3, t:0, shade:.6}); }
  // tracer from the German nest towards the beach
  if (t > (TITLE.next.mg || 1)) { TITLE.next.mg = t + 1.5 + Math.random() * 2.5; for (let i = 0; i < 6; i++) TITLE.parts.push({k:'tracer', x:W * .74, y:H * .55, tx:W * (.22 + Math.random() * .2), ty:H * (.64 + Math.random() * .08), life:.4, t:-i * .08}); }
  // aircraft crossing, with flak bursting round them
  if (t > (TITLE.next.plane || .5)) { TITLE.next.plane = t + 6 + Math.random() * 6; const [nat, role] = [['uk', 'ftr'], ['us', 'bmr'], ['us', 'ftr']][Math.random() * 3 | 0]; TITLE.planes.push({nat, role, x:-W * .1, y:H * (.06 + Math.random() * .18), v:W * (.05 + Math.random() * .03), t:0}); }
  TITLE.planes = TITLE.planes.filter(p => p.x < W * 1.1);
  for (const p of TITLE.planes) { p.x += p.v * dt; p.t += dt; const img = getSprite(p.nat, p.role, Math.floor(t * 12) % 8); g.drawImage(img, p.x, p.y + Math.sin(p.t * 2) * 3, 56 * S, 56 * S);
    if (p.x > W * .45 && Math.random() < .08) TITLE.parts.push({k:'puff', x:p.x + (Math.random() - .3) * 80 * S, y:p.y + (Math.random() - .3) * 40 * S, r:2 * S, grow:12 * S, life:1.6, t:0}); }
  // the troops and the boats
  const put = (nat, role, x, y, flip, f = 1, bob = 0) => { const img = getSprite(nat, role, f); const s = 64 * S; g.save(); if (flip) { g.translate(x + s, y + bob); g.scale(-1, 1); g.drawImage(img, 0, 0, s, s); } else g.drawImage(img, x, y + bob, s, s); g.restore(); };
  const fr = Math.floor(t * 8) % 8, step = Math.floor(t * 3) % 2 * 2, sw = k => Math.sin(t * 1.2 + k) * 3 * S;
  const foot = y => y - 64 * S * .86;                                                                                      // place a sprite by where its feet or tracks touch the ground
  put('us', 'dd', W * .0, foot(H * .97), false, 0, sw(1)); put('us', 'lc', W * .1 + Math.sin(t / 5) * 6, foot(H * .86), false, 0, sw(2)); put('uk', 'lc', W * .24 + Math.sin(t / 6) * 6, foot(H * .93), false, 0, sw(3)); swimDD(g, W * .38, H * .84, S, t);
  put('us', 'tank', W * .12, foot(H * .71), false, fr); put('us', 'inf', W * .27, foot(H * .7), false, step); put('uk', 'tank', W * .4, foot(H * .68), false, fr); put('us', 'eng', W * .2, foot(H * .74), false, step); put('uk', 'inf', W * .33, foot(H * .74), false, step);
  put('ger', 'pak', W * .62, foot(H * .6), true); put('ger', 'nest', W * .73, foot(H * .62), true, step); put('ger', 'htank', W * .84, foot(H * .61), true, fr);
  // flags streaming in the wind
  for (const [nat, x] of [['us', .03], ['uk', .09], ['fr', .15], ['su', .21], ['pl', .27], ['cn', .33], ['it', .39], ['ger', .86], ['jp', .92]]) {
    const fw = W * .05, fh = W * .033, fx = W * x + 3, fy = H * .06, img = titleFlag(nat, fw, fh), n = 12;
    g.fillStyle = '#2a2a24'; g.fillRect(W * x, H * .06, 3, H * .2);
    for (let i = 0; i < n; i++) { const sx = fw * i / n, off = Math.sin(t * 4 - i * .7 + x * 20) * fh * .08 * (i / n); g.drawImage(img, sx, 0, fw / n + .5, fh, fx + sx, fy + off, fw / n + .5, fh); }
  }
  // particles
  TITLE.parts = TITLE.parts.filter(p => p.t < p.life); if (TITLE.parts.length > 400) TITLE.parts.splice(0, 100);
  for (const p of TITLE.parts) { p.t += dt; const k = p.t / p.life; if (p.t < 0) continue;
    if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; }
    if (p.k === 'flash') { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1 + k)); gr.addColorStop(0, `rgba(255,236,190,${1 - k})`); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * (1 + k), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    else if (p.k === 'smoke') { const c0 = Math.round(50 + (1 - p.shade) * 90); g.fillStyle = `rgba(${c0},${c0 - 4},${c0 - 8},${(1 - k) * .5})`; g.beginPath(); g.arc(p.x, p.y, p.r + p.grow * k, 0, 7); g.fill(); }
    else if (p.k === 'puff') { g.fillStyle = `rgba(30,28,26,${(1 - k) * .8})`; g.beginPath(); g.arc(p.x, p.y, p.r + p.grow * k, 0, 7); g.fill(); }
    else if (p.k === 'tracer') { const x = p.x + (p.tx - p.x) * k, y = p.y + (p.ty - p.y) * k, xb = p.x + (p.tx - p.x) * Math.max(0, k - .15), yb = p.y + (p.ty - p.y) * Math.max(0, k - .15); g.strokeStyle = 'rgba(255,220,140,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(xb, yb); g.lineTo(x, y); g.stroke(); }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
/* a Duplex Drive Sherman swimming in: the hull under water, only the turret showing above the raised canvas screen, a bow wave and a wake */
function swimDD(g, x, wl, S, t) {
  const s = 64 * S, bob = Math.sin(t * 1.3) * 2 * S, img = getSprite('us', 'ddtank', 0), top = wl - s * .62 + bob;
  for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(255,255,255,${.35 - i * .07})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x + s * .05 - i * 14 * S, wl + 2 + i * 3 * S); g.lineTo(x - (i + 1) * 22 * S, wl + 4 + i * 4 * S); g.stroke(); }   // the wake
  g.save(); g.beginPath(); g.rect(x - 4, top - 4, s + 8, wl - top + 4 + bob); g.clip(); g.drawImage(img, x, top, s, s); g.restore();   // the tank, below the waterline only the turret shows
  const sx = x + s * .1, sw = s * .82, sh = s * .24, sy = wl - sh + bob;                         // the canvas flotation screen, raised on its struts
  g.fillStyle = '#c4b68c'; g.fillRect(sx, sy, sw, sh); g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 1; i < 6; i++) g.fillRect(sx + sw * i / 6, sy, 2, sh);
  g.fillStyle = '#e2d6b0'; g.fillRect(sx, sy, sw, 3 * S); g.strokeStyle = '#4a4232'; g.lineWidth = 1.5; g.strokeRect(sx, sy, sw, sh);
  g.strokeStyle = '#3a3628'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(sx + sw * (.15 + i * .23), sy + 2); g.lineTo(sx + sw * (.2 + i * .23), sy + sh * .9); g.stroke(); }   // struts
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(sx + sw + 3 * S, wl + bob, 7 * S, 2.6 * S, 0, 0, 7); g.fill();   // the bow wave
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(sx - 4, wl + bob - 1, sw + 8, 2.5 * S);
}
drawTitle = function () {
  const c = $('#titlecv'), W = c.width = clamp(Math.round(innerWidth * dpr), 480, 1600), H = c.height = Math.round(W * .42);
  TITLE.W = W; TITLE.H = H; TITLE.layer = titleLayer(W, H); TITLE.parts = []; TITLE.planes = []; TITLE.next = {}; TITLE.flags = {}; TITLE.t0 = performance.now(); TITLE.last = 0;
  if (!TITLE.raf) TITLE.raf = requestAnimationFrame(titleFrame);
  $('#continue').hidden = !(() => { try { return !!localStorage.getItem('if44auto2'); } catch (e) { return false; } })();
  titleMusicLabel();
};
/* the music on the title screen: what is playing, the next piece, music on and off */
function titleMusicLabel() { const el = $('#tmnow'); if (el) el.textContent = MUSIC.playing && SET.music ? `${MUSIC.playing.title} — ${MUSIC.playing.by.split(' · ')[0]}` : SET.music ? 'Music' : 'Music off'; const b = $('#tmmute'); if (b) b.classList.toggle('off', !SET.music); }
