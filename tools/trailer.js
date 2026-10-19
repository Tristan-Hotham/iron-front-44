/* ============================ TRAILER RECORDER ============================
   Dev tool, not part of the game build. Load it into the running game page:
     const s = document.createElement('script'); s.src = 'tools/trailer.js'; document.head.append(s);
   then call   recordTrailer()   (or previewTrailer(t) to grab one composited frame).
   It plays real AI-vs-AI battles in the game's own renderer and composites them,
   with captions, colour grading, grain and letterbox, onto a 1920x1080 film canvas,
   scored to Holst's "Mars" (US Air Force Band, public domain), and records an MP4. */
(() => {
const W = 1920, H = 1080, FPS = 30, BAR = 120;          // 2.2:1 letterbox
const film = document.createElement('canvas'); film.width = W; film.height = H;
const f = film.getContext('2d');
const grain = document.createElement('canvas'); grain.width = grain.height = 512;
{ const g = grain.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
const TR = {t0:0, layer:'black', caps:[], card:null, shotStart:0, zoom:{from:1, to:1.05}, running:false};
const now = () => (performance.now() - TR.t0) / 1000;
const wait = s => new Promise(r => keepTimer(() => setTimeout(r, s * 1000)));
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const fadeIO = (t, a, b, inn = .5, out = .5) => Math.min(ease((t - a) / inn), ease((b - t) / out));

/* ---------- the game, held still for the camera ---------- */
function fixCanvas() { dpr = 1; cv.width = W; cv.height = H; }
const realSay = say, realBanner = banner;
function quietGame() {
  for (const [k, v] of [['innerWidth', W], ['innerHeight', H]]) Object.defineProperty(window, k, {get:() => v, configurable:true});   // the camera frames for the film, not for the browser window
  say = () => Promise.resolve(); banner = () => Promise.resolve(); SET.tips = false; SET.music = false; SET.battle = true; SET.fx = true; SET.aiFast = false; SET.sound = true; }
TR.snaps = {};
function prestage(key, id, days, cfg) { FAST = true; TESTER[1] = 'aggressive'; autoplayMission(cfg || MISSIONS[id], days, true); TESTER[1] = null; FAST = false; TR.snaps[key] = serial(); G = null; }
async function stage(key, days, opt = {}) {
  EPOCH++; UI.busy = false; MUSIC.els.forEach(e => e && e.pause()); clearShot();
  if (!TR.snaps[key]) prestage(key, key, days, opt.cfg);
  revive(TR.snaps[key]);
  G.watch = true; G.teams[1].ai = G.teams[2].ai = true; G.over = null; UI.overShown = true;
  FX.parts = []; FX.flyers = [];
  enterGame(); fixCanvas();
  for (const el of document.querySelectorAll('#dialog, #result, #codebox')) el.hidden = true;
  cam.z = Math.max(opt.z || 1.6, 1.04 * Math.max(W / (G.W * ART), H / (G.H * ART)));   // never smaller than the frame
  // frame the front: halfway between the two armies, nudged towards whoever is attacking
  const c = t => { const us = G.units.filter(u => u.team === t && !u.d.air); return us.length ? [us.reduce((s, u) => s + u.x, 0) / us.length, us.reduce((s, u) => s + u.y, 0) / us.length] : [G.W / 2, G.H / 2]; };
  const [ax, ay] = c(1), [bx, by] = c(2), k = opt.lean ?? .5;
  centerOn(opt.at ? opt.at[0] : ax + (bx - ax) * k, opt.at ? opt.at[1] : ay + (by - ay) * k);
  SET.battle = opt.battles !== false;
  if (opt.idle) return;                                  // a scripted shot: nobody moves until the script says so
  const ep = EPOCH; (async () => { await wait(.4); if (ep === EPOCH) beginTurn(); })();
}
function stopGame() { EPOCH++; UI.busy = false; const V = window.__V; if (V) for (const [k, v] of V.timers) if (!v.keep) V.timers.delete(k); }   // the stopped game's timers go too

/* ---------- compositing ---------- */
function drawCover(img, z = 1, ox = 0, oy = 0) {
  const s = Math.max(W / img.width, H / img.height) * z, w = img.width * s, h = img.height * s;
  f.drawImage(img, (W - w) / 2 + ox, (H - h) / 2 + oy, w, h);
}
function grade(warm = .07) {
  f.save(); f.globalCompositeOperation = 'soft-light'; f.fillStyle = `rgba(255,190,120,${warm})`; f.fillRect(0, 0, W, H);
  f.globalCompositeOperation = 'multiply'; f.fillStyle = 'rgba(235,225,205,.18)'; f.fillRect(0, 0, W, H); f.restore();
  const v = f.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.62)'); f.fillStyle = v; f.fillRect(0, 0, W, H);
  f.save(); f.globalAlpha = .045; f.globalCompositeOperation = 'overlay'; const ox = Math.random() * 512, oy = Math.random() * 512;
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) f.drawImage(grain, x, y); f.restore();
  if (Math.random() < .04) { f.fillStyle = 'rgba(255,255,240,.05)'; f.fillRect(Math.random() * W, 0, 2, H); }   // a scratch on the print
  f.fillStyle = '#000'; f.fillRect(0, 0, W, BAR); f.fillRect(0, H - BAR, W, BAR);
}
function text(s, x, y, font, col, align = 'center', alpha = 1, track = 0, shadow = true) {
  f.save(); f.globalAlpha = alpha; f.font = font; f.textAlign = align; f.textBaseline = 'middle';
  if (track) f.letterSpacing = track + 'px';
  if (shadow) { f.fillStyle = 'rgba(0,0,0,.7)'; f.fillText(s, x + 3, y + 3); }
  f.fillStyle = col; f.fillText(s, x, y); f.restore();
}
function caption(c, t) {                                  // a place and a date, lower left, the way a newsreel captions it
  const a = fadeIO(t, c.a, c.b, .6, .6); if (a <= 0) return;
  const x = 150, y = H - BAR - 150, slide = (1 - ease((t - c.a) / .8)) * -40;
  const sh = f.createLinearGradient(0, 0, 1100, 0); sh.addColorStop(0, `rgba(0,0,0,${.55 * a})`); sh.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = sh; f.fillRect(0, y - 110, 1100, 230);
  f.save(); f.globalAlpha = a; f.fillStyle = '#b8302a'; f.fillRect(x + slide, y - 58, 90, 8); f.restore();
  text(c.place, x + slide, y, 'bold 76px "Stardos Stencil", Impact, sans-serif', '#f4ead0', 'left', a, 4);
  text(c.date, x + slide, y + 62, '30px "Courier Prime", monospace', '#e8c060', 'left', a, 6);
}
function card(c, t) {                                     // centred title cards; lines may type out
  const a = fadeIO(t, c.a, c.b, c.fin ?? .7, c.fout ?? .7); if (a <= 0) return;
  (c.lines || []).forEach((l, i) => {
    let s = l.s; if (l.type) { const n = Math.floor((t - c.a - (l.d || 0)) * 26); if (n <= 0) return; s = s.slice(0, n); }
    const la = l.d ? a * ease((t - c.a - l.d) / .5) : a;
    text(s, W / 2, H / 2 + (l.y || 0), l.font, l.col || '#f4ead0', 'center', la, l.track || 0);
  });
}
function portraits(t, a, b, ids) {                        // the generals, one after another
  const al = fadeIO(t, a, b, .5, .5); if (al <= 0) return;
  const n = ids.length, size = 150, gap = 22, x0 = W / 2 - (n * size + (n - 1) * gap) / 2, y = H / 2 - 40;
  ids.forEach((id, i) => { const k = ease((t - a - i * .12) / .4); if (k <= 0) return;
    f.save(); f.globalAlpha = al * k; f.drawImage(getPortrait(id), x0 + i * (size + gap), y + (1 - k) * 30, size, size);
    f.strokeStyle = '#d8b860'; f.lineWidth = 3; f.strokeRect(x0 + i * (size + gap), y + (1 - k) * 30, size, size); f.restore();
    text(CO[id].n.split(' ').slice(-1)[0].toUpperCase(), x0 + i * (size + gap) + size / 2, y + size + 34, '22px "Courier Prime", monospace', '#e8dcb8', 'center', al * k, 3); });
}
function compose() {
  const t = now();
  f.fillStyle = '#000'; f.fillRect(0, 0, W, H);
  if (TR.layer === 'game' && G && terrainCanvas) {
    try { draw(performance.now()); } catch (e) {}
    const k = ease((t - TR.shotStart) / (TR.shotLen || 9)), z = TR.zoom.from + (TR.zoom.to - TR.zoom.from) * k;
    const wrap = document.querySelector('#battlewrap');
    if (wrap && !wrap.hidden && bcv.width > 10) {   // the battle close-up, full width and centred, over the darkened battlefield
      drawCover(cv, z); f.fillStyle = 'rgba(0,0,0,.72)'; f.fillRect(0, 0, W, H);
      const s = W / bcv.width, h = bcv.height * s, y = (H - h) / 2;
      f.drawImage(bcv, 0, y, W, h); f.fillStyle = '#c8a050'; f.fillRect(0, y - 3, W, 3); f.fillRect(0, y + h, W, 3); }
    else drawCover(cv, z);
    if (TR.dim) { f.fillStyle = `rgba(0,0,0,${TR.dim})`; f.fillRect(0, 0, W, H); }
    if (TR.zed) { f.save(); f.globalCompositeOperation = 'multiply'; f.fillStyle = 'rgb(70,88,120)'; f.fillRect(0, 0, W, H); f.restore();   // moonlight
      const m = f.createRadialGradient(W * .5, H * .45, H * .1, W * .5, H * .5, W * .6); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,4,10,.7)'); f.fillStyle = m; f.fillRect(0, 0, W, H); }
  } else if (TR.layer === 'title') {
    const tc = document.querySelector('#titlecv'); const k = ease((t - TR.shotStart) / 8);
    if (tc && tc.width > 10) drawCover(tc, 1.05 + .08 * k, -40 * k, 0);
    f.fillStyle = 'rgba(0,0,0,.45)'; f.fillRect(0, 0, W, H);
    const band = f.createLinearGradient(0, H / 2 - 220, 0, H / 2 + 230); band.addColorStop(0, 'rgba(0,0,0,0)'); band.addColorStop(.25, 'rgba(0,0,0,.6)'); band.addColorStop(.75, 'rgba(0,0,0,.6)'); band.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = band; f.fillRect(0, H / 2 - 220, W, 450);
  }
  for (const c of TR.caps) caption(c, t);
  if (TR.card) card(TR.card, t);
  if (TR.extra) TR.extra(t);
  forecastCard(t); briefingCard(t);
  grade(TR.layer === 'zed' || TR.zed ? .02 : .07);
  if (TR.fadeBlack != null) { f.fillStyle = `rgba(0,0,0,${TR.fadeBlack})`; f.fillRect(0, 0, W, H); }
}

/* ---------- the score ---------- */
async function audioSetup(oc) {        // the whole recording decoded in memory, so each cue starts at an exact offset
  let ac, dest;
  if (oc) { ac = oc; dest = TR.bus; }                  // offline: the mix is rendered after the last frame
  else { auInit(); await AU.ctx.resume().catch(() => {}); ac = AU.ctx; dest = ac.createMediaStreamDestination();
    AU.master.disconnect(); AU.master.connect(dest); AU.out = dest; }   // silent: the sound goes only into the recording, never to the speakers
  const buf = await ac.decodeAudioData(await fetch('music/mars.mp3').then(r => r.arrayBuffer()));
  const track = (off) => { const g = ac.createGain(); g.gain.value = 0; g.connect(dest);
    return {g, start() { const s = ac.createBufferSource(); s.buffer = buf; s.connect(g); s.start(ac.currentTime, off); }}; };
  // the narrator's chain: thin out the lows, a little presence, the top rolled off like a period recording, held level by a compressor
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 120;
  const pres = ac.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2600; pres.gain.value = 3;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7200;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3.5;
  const vg = ac.createGain(); vg.gain.value = 2.8;      // the narrator sits on top of the war, not under it
  hp.connect(pres); pres.connect(lp); lp.connect(comp); comp.connect(vg); vg.connect(dest);
  const vo = {}; for (const id of ['v01', 'v02', 'v03', 'v04', 'v05', 'v06', 'v07', 'v08', 'v09', 'v10', 'v11'])
    try { vo[id] = await ac.decodeAudioData(await fetch('trailer/vo/' + id + '.wav').then(r => r.arrayBuffer())); } catch (e) {}
  return {ac, dest, a:track(40), b:track(445.6), voice:hp, vo};
}
function ramp(g, to, s, ac) {                           // tracks its own level: an offline context never reports automated values
  const t = ac.currentTime, from = g._v != null ? g._v : g.gain.value;
  g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(from, t); g.gain.linearRampToValueAtTime(to, t + s); g._v = to; }

/* ---------- the cut ---------- */
async function run(A) {
  const at = s => wait(Math.max(0, s - now()));
  const C = (lines, a, b, extra = {}) => { TR.card = Object.assign({lines, a, b}, extra); };
  // 0-7: cold open on black, the ostinato starting
  TR.layer = 'black'; A.a.start(); ramp(A.a.g, .9, 2.5, A.ac);
  C([{s:'1937 – 1945', font:'34px "Courier Prime", monospace', col:'#e8c060', y:-70, track:14},
     {s:'SHANGHAI.  GREECE.  STALINGRAD.  THE DESERT.  THE PACIFIC.', font:'30px "Courier Prime", monospace', y:10, track:4, type:true, d:.6},
     {s:'One war, fought on every front.', font:'italic 40px Georgia, serif', y:90, d:3.2}], .4, 6.6);
  await at(6.8);
  // 7-13: the title
  TR.layer = 'title'; TR.shotStart = now(); try { drawTitle(); } catch (e) {}
  C([{s:'BIT-ZKRIEG', font:'bold 150px "Stardos Stencil", Impact, sans-serif', y:-70, track:10},
     {s:'IRON FRONT  ’44', font:'bold 70px "Stardos Stencil", Impact, sans-serif', col:'#d8452e', y:50, track:16, d:.5},
     {s:'A tactics game of the Second World War', font:'30px "Courier Prime", monospace', col:'#e8dcb8', y:130, d:1.2, track:3}], 7, 13);
  // 13 onwards: the war, front by front
  const shot = async (id, days, a, b, place, date, opt = {}) => {
    TR.caps = [{a:a + .6, b:b - .3, place, date}];
    await stage(id, days, opt); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = b - a; TR.zoom = opt.zoom || {from:1.0, to:1.07};
    TR.card = null; await at(b); stopGame();
  };
  await at(12.9);
  await shot('omaha', 2, 13, 20, 'OMAHA BEACH', 'NORMANDY  ·  6 JUNE 1944', {z:1.5, lean:.35});
  await shot('philsea', 2, 20, 27, 'THE PHILIPPINE SEA', 'THE MARIANAS  ·  JUNE 1944', {z:1.5, lean:.6});
  await shot('stalingrad', 3, 27, 33.5, 'STALINGRAD', 'THE VOLGA  ·  OCTOBER 1942', {z:1.6});
  await shot('keren', 3, 33.5, 40, 'KEREN', 'ERITREA  ·  MARCH 1941', {z:1.6});
  await shot('prokhorovka', 2, 40, 46, 'PROKHOROVKA', 'THE BATTLE OF KURSK  ·  JULY 1943', {z:1.6});
  await shot('iwo', 3, 46, 52.5, 'IWO JIMA', 'MOUNT SURIBACHI  ·  FEBRUARY 1945', {z:1.6});
  // 52.5-60: the generals, over Bastogne in the snow
  TR.caps = []; await stage('bastogne', 2, {z:1.3, battles:false}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 14; TR.dim = .55;
  C([{s:'REAL GENERALS.  REAL ARMIES.  REAL MUSIC.', font:'bold 56px "Stardos Stencil", Impact, sans-serif', y:-170, track:6}], 52.8, 59.6);
  TR.extra = t => portraits(t, 53.6, 59.6, ['rommel', 'patton', 'zhukov', 'monty', 'yamashita', 'chiang', 'mitscher', 'bergonzoli', 'koenig']);
  await at(59.8); TR.extra = null;
  // 60-66: what is in the box
  C([{s:'82 BATTLES  ·  13 CAMPAIGNS', font:'bold 72px "Stardos Stencil", Impact, sans-serif', y:-60, track:6},
     {s:'Land, sea and air  ·  carrier battles  ·  a map builder  ·  online play', font:'34px "Courier Prime", monospace', col:'#e8c060', y:30, d:.6, track:2},
     {s:'Last Stand  ·  Italy at War  ·  Shanghai to Berlin', font:'34px "Courier Prime", monospace', col:'#e8dcb8', y:90, d:1.2, track:2}], 60, 65.8);
  await at(64.4); ramp(A.a.g, 0, 1.8, A.ac);
  // 66-76: and when the sun goes down
  await at(65.9); stopGame(); TR.dim = 0; TR.layer = 'black'; TR.card = null;
  C([{s:'And when night falls…', font:'italic 48px Georgia, serif', col:'#c8d8a8', type:true}], 66.3, 69.4, {fin:.3});
  sfx('chorus'); setTimeout(() => sfx('groan'), 1200);
  await at(69.4);
  TR.zed = true; await stage('zed', 7, {z:1.6, lean:.7}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 7; TR.zoom = {from:1.05, to:1.18};
  C([{s:'DEAD OF NIGHT', font:'bold 120px "Stardos Stencil", Impact, sans-serif', col:'#c8e070', y:0, track:12}], 72.3, 75.6, {fin:.2});
  await at(75.7); stopGame(); TR.zed = false; TR.layer = 'black'; TR.card = null;
  // 76-89: the end card, landing on Mars's last great chords
  A.b.start(); A.b.g.gain.value = 1;
  C([{s:'BIT-ZKRIEG', font:'bold 150px "Stardos Stencil", Impact, sans-serif', y:-110, track:10, d:1.3},
     {s:'IRON FRONT  ’44', font:'bold 70px "Stardos Stencil", Impact, sans-serif', col:'#d8452e', y:10, track:16, d:1.5},
     {s:'FREE TO PLAY IN YOUR BROWSER', font:'bold 40px "Courier Prime", monospace', col:'#f4ead0', y:110, d:2.6, track:6},
     {s:'tristanhotham.com/games', font:'36px "Courier Prime", monospace', col:'#e8c060', y:170, d:3.2, track:3},
     {s:'Music: Holst, "Mars, the Bringer of War", United States Air Force Band (public domain)', font:'20px "Courier Prime", monospace', col:'#9a9078', y:330, d:4, track:1}], 76, 89.5, {fin:.2, fout:1.2});
  await at(88.2); ramp(A.b.g, 0, 1.4, A.ac);
  await at(89.8);
}

/* ---------- the full cut: narrated, the stakes, the game and how it plays ---------- */
const plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d; };
function panel(x, y, w, h, a) {
  f.save(); f.globalAlpha = a; f.fillStyle = 'rgba(14,13,10,.86)'; f.fillRect(x, y, w, h);
  f.strokeStyle = '#c8a050'; f.lineWidth = 3; f.strokeRect(x + .5, y + .5, w - 1, h - 1); f.fillStyle = '#b8302a'; f.fillRect(x, y, 10, h); f.restore();
}
function wrapText(s, x, y, maxW, lineH, font, col, a, maxLines = 9) {
  f.save(); f.font = font; const words = String(s).split(' '); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (f.measureText(t).width > maxW && line) { text(line, x, y + n * lineH, font, col, 'left', a, 0, false); line = w; if (++n >= maxLines) { f.restore(); return y + n * lineH; } } else line = t; }
  if (line) text(line, x, y + n * lineH, font, col, 'left', a, 0, false); f.restore(); return y + (n + 1) * lineH;
}
const sentences = (s, n) => (String(s).match(/[^.!?]+[.!?]+/g) || [s]).slice(0, n).join(' ').trim();
function forecastCard(t) {                                 // the game's damage forecast, as the player sees it on hovering a target
  const c = TR.fc; if (!c) return; const a = Math.min(1, ease((t - c.a) / .35)); if (a <= 0) return;
  const x = c.left ? 120 : W - 820, y = 300, w = 700, h = 70 + c.rows.length * 46;
  panel(x, y, w, h, a);
  text('DAMAGE FORECAST', x + 34, y + 34, 'bold 24px "Courier Prime", monospace', '#e8c060', 'left', a, 5, false);
  c.rows.forEach((r, i) => wrapText(r, x + 34, y + 82 + i * 46, w - 60, 30, (i === 1 ? 'bold ' : '') + '26px "Courier Prime", monospace', i === 1 ? '#f4ead0' : '#d8ccb0', a, 1));
}
function briefingCard(t) {
  const c = TR.brief; if (!c) return; const a = fadeIO(t, c.a, c.b, .5, .5); if (a <= 0) return;
  const m = MISSIONS[c.id], hst = HISTORY[c.id] || {}, x = 260, y = c.after ? 250 : 190, w = W - 520, h = c.after ? 540 : H - 380;
  panel(x, y, w, h, a);
  if (c.after) {                                           // the aftermath: what really happened, and to the man in command
    text('WHAT REALLY HAPPENED', x + 60, y + 60, 'bold 26px "Courier Prime", monospace', '#e8c060', 'left', a, 8, false);
    text(m.name.toUpperCase(), x + 60, y + 130, 'bold 64px "Stardos Stencil", Impact, sans-serif', '#f4ead0', 'left', a, 4);
    const yy = wrapText(sentences(hst.real, 3), x + 60, y + 210, w - 120, 42, 'italic 30px Georgia, serif', '#e8dcb8', a, 6);
    const co = m.p1.co; f.save(); f.globalAlpha = a; f.drawImage(getPortrait(co), x + 60, yy + 10, 120, 120); f.strokeStyle = '#d8b860'; f.lineWidth = 3; f.strokeRect(x + 60, yy + 10, 120, 120); f.restore();
    text(CO[co].n.toUpperCase(), x + 210, yy + 34, 'bold 26px "Courier Prime", monospace', '#e8c060', 'left', a, 3, false);
    wrapText(CO_FATE[co] || '', x + 210, yy + 76, w - 290, 34, '24px "Courier Prime", monospace', '#d8ccb0', a, 3);
    return;
  }
  text('BRIEFING', x + 60, y + 60, 'bold 26px "Courier Prime", monospace', '#e8c060', 'left', a, 8, false);
  text(m.name.toUpperCase(), x + 60, y + 130, 'bold 64px "Stardos Stencil", Impact, sans-serif', '#f4ead0', 'left', a, 4);
  text(`${m.place}  ·  ${m.date}`, x + 60, y + 182, '26px "Courier Prime", monospace', '#e8c060', 'left', a, 2, false);
  const yy = wrapText(sentences(m.brief, 2), x + 60, y + 246, w - 420, 38, 'italic 28px Georgia, serif', '#e8dcb8', a, 5);
  (hst.forces || []).forEach((s, i) => wrapText((i ? '▶ ' : '▶ ') + s, x + 60, yy + 24 + i * 76, w - 420, 32, '23px "Courier Prime", monospace', i ? '#e0a090' : '#a8c8e8', a, 2));
  [m.p1.co, m.p2.co].forEach((co, i) => { const px = x + w - 320, py = y + 90 + i * 250; f.save(); f.globalAlpha = a; f.drawImage(getPortrait(co), px, py, 170, 170); f.strokeStyle = '#d8b860'; f.lineWidth = 3; f.strokeRect(px, py, 170, 170); f.drawImage(flagCanvas(G && G.teams[i + 1] ? G.teams[i + 1].nat : m['p' + (i + 1)].nat, 48, 32), px + 182, py + 6, 48, 32); f.restore();
    text(CO[co].n.split(' ').slice(-1)[0].toUpperCase(), px + 85, py + 200, 'bold 24px "Courier Prime", monospace', '#e8dcb8', 'center', a, 3); });
}
function veteransCard(t, a0, b0) {                         // the ranks a unit earns, and keeps from battle to battle
  const a = fadeIO(t, a0, b0, .5, .5); if (a <= 0) return;
  const ranks = ['GREEN', 'VETERAN', 'ELITE', 'LEGENDARY'], x0 = W / 2 - 600;
  text('YOUR VETERANS CARRY ON', W / 2, H / 2 - 190, 'bold 60px "Stardos Stencil", Impact, sans-serif', '#f4ead0', 'center', a, 6);
  ranks.forEach((r, i) => { const k = ease((t - a0 - .4 - i * .35) / .4) * a; if (k <= 0) return; const cx = x0 + 150 + i * 300, cy = H / 2;
    f.save(); f.globalAlpha = k; for (let c = 0; c < i; c++) { f.fillStyle = '#e8c040'; f.beginPath(); f.moveTo(cx - 50, cy - 40 + c * 34); f.lineTo(cx, cy - 70 + c * 34); f.lineTo(cx + 50, cy - 40 + c * 34); f.lineTo(cx + 50, cy - 22 + c * 34); f.lineTo(cx, cy - 52 + c * 34); f.lineTo(cx - 50, cy - 22 + c * 34); f.fill(); }
    if (!i) { f.strokeStyle = '#9a9078'; f.lineWidth = 4; f.strokeRect(cx - 40, cy - 50, 80, 60); } f.restore();
    text(r, cx, cy + 90, 'bold 34px "Courier Prime", monospace', i === 3 ? '#e8c060' : '#e8dcb8', 'center', k, 4); });
  text('and the ones you lose are gone for good', W / 2, H / 2 + 200, 'italic 36px Georgia, serif', '#d8a090', 'center', a * ease((t - a0 - 2) / .6));
}
/* a human turn, scripted: pick up a tank, show its reach, walk the path, read the odds, then attack */
async function playTurn(fcSecs = 3) {
  const team = G.turn; G.teams[team].ai = false; G.watch = false;
  for (const u of G.units) if (u.team === team) { u.done = false; u.moved = false; }
  UI.mode = 'idle'; UI.busy = false;
  let best = null;
  for (const u of G.units.filter(u => u.team === team && ['htank', 'tank', 'mtank', 'td'].includes(u.role))) {
    UI.sel = u; UI.reach = reach(u, u.x, u.y, undefined, UI.vis);
    for (const t of G.units.filter(t => t.team !== team && seen(t) && canHit(u, t) && !t.d.air && Math.abs(t.y - u.y) <= 4 && Math.abs(t.x - u.x) <= 8)) {   // both in frame together
      const fr = attackFrom(u, t); if (!fr || (fr[0] === u.x && fr[1] === u.y)) continue;
      const path = pathTo(UI.reach, fr[0], fr[1]); if (!path || path.length < 3) continue;
      const score = calcDamage(u, t, u.hp, 5, fr[0], fr[1]) + path.length * 2;
      if (!best || score > best.score) best = {u, t, fr, path, score};
    }
  }
  UI.sel = null; UI.reach = null; if (!best) return false;
  const {u, t, fr, path} = best;
  cam.z = 1.55; centerOn((u.x + t.x) / 2, (u.y + t.y) / 2);
  const tsx = (t.x * ART + ART / 2 - cam.x) * cam.z;      // the card goes on the side away from the target
  await wait(.5); selectTile(u.x, u.y); await wait(.9);
  for (let i = 1; i < path.length; i++) { UI.cursor = {x:path[i][0], y:path[i][1]}; UI.path = path.slice(0, i + 1); await wait(.3); }
  UI.cursor = {x:t.x, y:t.y};
  const rows = [...plain(forecastHTML(u, t, fr[0], fr[1], false)).querySelectorAll('.fc-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4);
  TR.fc = {rows, a:now(), left:tsx > W / 2}; await wait(fcSecs);
  TR.fc = null; UI.cursor = {x:fr[0], y:fr[1]}; selectTile(fr[0], fr[1]);
  for (let i = 0; i < 40 && UI.mode !== 'menu'; i++) await wait(.1);
  try { closeMenu(); } catch (e) {}
  UI.cursor = {x:t.x, y:t.y}; await fireAt(t); return true;
}
async function runFull(A) {
  const at = s => wait(Math.max(0, s - now()));
  const C = (lines, a, b, extra = {}) => { TR.card = Object.assign({lines, a, b}, extra); };
  const shot = async (id, days, a, b, place, date, opt = {}) => {
    TR.caps = place ? [{a:a + .5, b:b - .3, place, date}] : [];
    await stage(id, days, opt); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = b - a; TR.zoom = opt.zoom || {from:1.0, to:1.07};
    TR.card = null; await at(b); stopGame();
  };
  // 0-7.6: from black, smoke over Shanghai
  A.a.start(); ramp(A.a.g, .85, 3, A.ac);
  TR.dim = .45; TR.caps = [{a:1.2, b:7.2, place:'SHANGHAI', date:'AUGUST 1937'}];
  await stage('sihang', 2, {z:1.4, battles:false}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 8; TR.zoom = {from:1.02, to:1.12}; TR.fadeBlack = 1;
  const fadeIn = keepTimer(() => setInterval(() => { TR.fadeBlack = Math.max(0, TR.fadeBlack - .04); if (!TR.fadeBlack) clearInterval(fadeIn); }, 33));
  vo('v01', A, .8);
  await at(7.6); stopGame(); TR.dim = 0; TR.caps = [];
  // 7.6-13.4: the title
  TR.layer = 'title'; TR.shotStart = now(); try { drawTitle(); } catch (e) {}
  C([{s:'BIT-ZKRIEG', font:'bold 150px "Stardos Stencil", Impact, sans-serif', y:-70, track:10},
     {s:'IRON FRONT  ’44', font:'bold 70px "Stardos Stencil", Impact, sans-serif', col:'#d8452e', y:50, track:16, d:.5},
     {s:'A tactics game of the Second World War', font:'30px "Courier Prime", monospace', col:'#e8dcb8', y:130, d:1.2, track:3}], 7.6, 13.4);
  vo('v02', A, 8.6);
  await at(13.4);
  // 13.4-34: the war, front by front, as the narrator names them
  vo('v03', A, 13.9);
  await shot('omaha', 2, 13.4, 19.6, 'OMAHA BEACH', 'NORMANDY  ·  6 JUNE 1944', {z:1.5, lean:.35});
  await shot('stalingrad', 3, 19.6, 24.4, 'STALINGRAD', 'THE VOLGA  ·  OCTOBER 1942', {z:1.6});
  await shot('keren', 3, 24.4, 28.6, 'KEREN', 'ERITREA  ·  MARCH 1941', {z:1.6});
  await shot('philsea', 2, 28.6, 34, 'THE PHILIPPINE SEA', 'THE MARIANAS  ·  JUNE 1944', {z:1.5, lean:.6});
  // 34-48: how it plays: your turn, your call, then the fight
  TR.caps = []; await stage('prokhorovka', 2, {z:1.55, idle:true}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 14; TR.zoom = {from:1, to:1};
  vo('v04', A, 34.6);
  const played = playTurn(3.4); vo('v05', A, 43.6);
  await Promise.race([played, at(49)]);
  // 49-53.5: and at sea: a torpedo run against a carrier
  await stage('philsea0', 0, {z:1.5, idle:true}); TR.layer = 'game';
  { const tb = G.units.find(u => u.team === 2 && u.role === 'tb'), cv = G.units.find(u => u.team === 1 && u.role === 'cv');
    if (tb && cv) { cv.hp = 20; battleScene(tb, cv, {dmg:80, counter:0, cKilled:false}, 100, 100); } }
  await at(54.6); stopGame(); $('#battlewrap').hidden = true;
  // 54.6-61: the generals
  await stage('bastogne', 2, {z:1.3, battles:false}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 20; TR.dim = .6;
  C([{s:'REAL ARMIES.  REAL GENERALS.', font:'bold 56px "Stardos Stencil", Impact, sans-serif', y:-200, track:6}], 54.8, 61);
  TR.extra = t => portraits(t, 55.2, 61, ['rommel', 'patton', 'zhukov', 'monty', 'yamamoto', 'chiang', 'mitscher', 'bergonzoli', 'koenig']);
  vo('v06', A, 55);
  await at(61); TR.extra = null; TR.card = null;
  // 61-70: the briefing, then what really happened
  await stage('omaha', 2, {z:1.3, battles:false}); TR.layer = 'game'; TR.dim = .55;
  TR.brief = {id:'omaha', a:61.1, b:65.6}; vo('v07', A, 61.5);
  await at(65.5); TR.brief = {id:'omaha', a:65.6, b:70.4, after:true};
  await at(70.4); TR.brief = null; stopGame();
  // 70.4-76.5: veterans
  await stage('stalingrad', 3, {z:1.4, battles:false}); TR.layer = 'game'; TR.dim = .62;
  TR.extra = t => veteransCard(t, 70.6, 76.4); vo('v08', A, 71);
  await at(76.5); TR.extra = null; stopGame();
  // 76.5-90.5: everything else in the box
  TR.dim = 0; vo('v09', A, 77);
  await shot('stand', 4, 76.5, 80.8, 'LAST STAND', 'HOLD YOUR HQ AGAINST GROWING WAVES', {z:1.4});
  await shot('isle', 3, 80.8, 84.6, 'MAP BUILDER  ·  SKIRMISH', 'PLAY A FRIEND ONLINE OR BY TURN CODES', {z:1.4});
  TR.caps = []; await stage('alamein', 3, {z:1.6}); TR.layer = 'game'; TR.dim = .5; TR.shotStart = now(); TR.shotLen = 6;
  C([{s:'82 BATTLES  ·  13 CAMPAIGNS', font:'bold 72px "Stardos Stencil", Impact, sans-serif', y:-60, track:6},
     {s:'Land, sea and air  ·  23 armies  ·  106 generals and admirals', font:'34px "Courier Prime", monospace', col:'#e8c060', y:30, d:.6, track:2},
     {s:'Shanghai to Berlin  ·  Italy at War  ·  the Carrier War', font:'34px "Courier Prime", monospace', col:'#e8dcb8', y:90, d:1.2, track:2}], 84.8, 90.4);
  await at(89); ramp(A.a.g, 0, 1.8, A.ac);
  // 90.5-99: and when night falls
  await at(90.5); stopGame(); TR.dim = 0; TR.layer = 'black'; TR.card = null;
  sfx('chorus'); keepTimer(() => setTimeout(() => sfx('groan'), 1200)); vo('v10', A, 91.2, {duck:false});
  await at(93.6);
  TR.zed = true; await stage('zed', 7, {z:1.6, lean:.7}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 7; TR.zoom = {from:1.05, to:1.18};
  C([{s:'DEAD OF NIGHT', font:'bold 120px "Stardos Stencil", Impact, sans-serif', col:'#c8e070', y:0, track:12}], 95.5, 99.2, {fin:.2});
  await at(99.4); stopGame(); TR.zed = false; TR.layer = 'black'; TR.card = null;
  // 99.4-113: the end card, on Mars's last chords
  A.b.start(); ramp(A.b.g, 1, .02, A.ac);
  C([{s:'BIT-ZKRIEG', font:'bold 150px "Stardos Stencil", Impact, sans-serif', y:-110, track:10, d:1.3},
     {s:'IRON FRONT  ’44', font:'bold 70px "Stardos Stencil", Impact, sans-serif', col:'#d8452e', y:10, track:16, d:1.5},
     {s:'FREE TO PLAY IN YOUR BROWSER', font:'bold 40px "Courier Prime", monospace', col:'#f4ead0', y:110, d:2.6, track:6},
     {s:'tristanhotham.com/games', font:'36px "Courier Prime", monospace', col:'#e8c060', y:170, d:3.2, track:3},
     {s:'Music: Holst, "Mars, the Bringer of War", United States Air Force Band (public domain)', font:'20px "Courier Prime", monospace', col:'#9a9078', y:310, d:4, track:1},
     {s:'Narration: Piper text-to-speech, Northern English Male voice (OpenSLR 83, CC BY-SA 4.0)', font:'20px "Courier Prime", monospace', col:'#9a9078', y:340, d:4, track:1}], 99.4, 113, {fin:.2, fout:1.2});
  vo('v11', A, 101.4, {duck:false});
  await at(111.8); ramp(A.b.g, 0, 1.4, A.ac);
  await at(113.3);
}
/* the narrator: a newsreel voice, filtered like a 1940s recording, the music dipping under him */
function vo(id, A, t, o = {}) {
  const buf = A.vo[id]; if (!buf) return;
  keepTimer(() => setTimeout(() => {
    const ac = A.ac, s = ac.createBufferSource(); s.buffer = buf; s.connect(A.voice); s.start(ac.currentTime);
    TR.vtt.push({a:now(), b:now() + buf.duration, id});
    // under the narrator the music drops well back and the battle sounds by half; both come back up when he stops
    ramp(AU.sfx, .45, .3, ac);
    if (o.duck !== false) ramp(A.a.g, .15, .35, ac);
    keepTimer(() => setTimeout(() => { if (A.a.g._v === .15) ramp(A.a.g, .85, 1, ac); if (AU.sfx._v === .45) ramp(AU.sfx, .9, .8, ac); }, buf.duration * 1000 + 200));
  }, Math.max(0, (t - now()) * 1000)));
}

/* ---------- offline render: a virtual clock, so every frame is drawn on time however long it takes ----------
   Timers, animation frames and performance.now all run on the clock; the frame loop advances it 1/30 s at a
   time, draws, and posts the frame. The sound is mixed in an OfflineAudioContext that reads the same clock. */
/* the trailer's own timers survive a change of shot; the game's from the last shot do not */
function keepTimer(make) { const V = window.__V; if (!V) return make(); V.mark = true; try { return make(); } finally { V.mark = false; } }
function clearShot() {
  const V = window.__V; if (V) for (const [k, v] of V.timers) if (!v.keep) V.timers.delete(k);
  const w = document.querySelector('#battlewrap'); if (w) { w.hidden = true; w.onclick = null; } BAT.parts = []; FX.parts = [];
  try { musicDuck(false); } catch (e) {}
}
const realYield = () => new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
function virtualClock() {
  const V = window.__V = {t:performance.now(), timers:new Map(), id:1, rafs:new Map(), mark:false};
  window.setTimeout = (fn, ms, ...a) => { const id = V.id++; if (typeof fn === 'function') V.timers.set(id, {at:V.t + Math.max(0, +ms || 0), fn, a, keep:V.mark}); return id; };
  window.setInterval = (fn, ms, ...a) => { const id = V.id++; V.timers.set(id, {at:V.t + Math.max(4, +ms || 4), fn, a, iv:Math.max(4, +ms || 4), keep:V.mark}); return id; };
  window.clearTimeout = window.clearInterval = id => { V.timers.delete(id); };
  window.requestAnimationFrame = fn => { const id = V.id++; V.rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = id => { V.rafs.delete(id); };
  performance.now = () => V.t;
  return V;
}
async function advance(V, to) {                            // run every timer due before `to`, in order, letting promises settle between them
  for (let guard = 0; guard < 20000; guard++) {
    let id = null, tm = null; for (const [k, v] of V.timers) if (v.at <= to && (!tm || v.at < tm.at)) { id = k; tm = v; }
    if (!tm) break;
    V.t = Math.max(V.t, tm.at); if (tm.iv) tm.at += tm.iv; else V.timers.delete(id);
    try { tm.fn(...tm.a); } catch (e) { console.error('timer', e); }
    await realYield();
  }
  V.t = to;
  const cbs = [...V.rafs.values()]; V.rafs.clear();
  for (const fn of cbs) { try { fn(V.t); } catch (e) { console.error('raf', e); } }
  await realYield();
}
function offlineAudio(seconds) {                           // the game's sound chain, rebuilt on an offline context that follows the virtual clock
  const sr = 48000, oc = new OfflineAudioContext(2, Math.ceil(sr * seconds), sr);
  Object.defineProperty(oc, 'currentTime', {get:() => Math.max(0, (performance.now() - TR.audio0) / 1000)});
  Object.defineProperty(oc, 'state', {get:() => 'running'}); oc.resume = () => Promise.resolve();
  // the final bus: everything through one limiter, so a salvo landing under the narrator never clips
  const lim = oc.createDynamicsCompressor(); lim.threshold.value = -6; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .2;
  TR.bus = oc.createGain(); TR.bus.gain.value = .75; TR.bus.connect(lim); lim.connect(oc.destination);
  AU.ctx = oc; AU.master = oc.createGain(); AU.master.gain.value = SET.vol;
  AU.lp = oc.createBiquadFilter(); AU.lp.type = 'lowpass'; AU.lp.frequency.value = 22000; AU.master.connect(AU.lp); AU.lp.connect(TR.bus);
  const comp = oc.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.connect(AU.master);
  AU.sfx = oc.createGain(); AU.sfx.gain.value = .9; AU.sfx.connect(comp);
  const len = sr * 2.2, ir = oc.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 800 ? i / 800 : 1); }
  AU.verb = oc.createConvolver(); AU.verb.buffer = ir; const vg = oc.createGain(); vg.gain.value = .32; AU.verb.connect(vg); vg.connect(comp);
  AU.out = TR.bus;
  return oc;
}
function wavBlob(buf) {                                    // 16-bit stereo PCM
  const n = buf.length, ch = [buf.getChannelData(0), buf.getChannelData(1)], out = new DataView(new ArrayBuffer(44 + n * 4));
  const s = (o, t) => { for (let i = 0; i < t.length; i++) out.setUint8(o + i, t.charCodeAt(i)); };
  s(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); s(8, 'WAVE'); s(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, buf.sampleRate, true); out.setUint32(28, buf.sampleRate * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); s(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) out.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  return new Blob([out], {type:'audio/wav'});
}
window.renderTrailer = async (maxSeconds = 120) => {
  quietGame(); fixCanvas(); auInit(); AU.master.disconnect();   // the live context only decodes the samples: nothing reaches the speakers
  part = function (o) { if (FAST || !SET.fx && o.kind !== 'text') return; o.t0 = performance.now(); o.life = o.life || 800; FX.parts.push(o); if (FX.parts.length > 900) FX.parts.splice(0, FX.parts.length - 800); };   // burning wrecks smoke without end: cap it so frames draw fast
  for (let i = 0; i < 400 && Object.keys(AU.samples).length < SFX_LIB.length; i++) await new Promise(r => setTimeout(r, 100));   // the recorded sounds, decoded first
  for (const [k, d] of [['sihang', 2], ['omaha', 2], ['philsea', 2], ['stalingrad', 3], ['keren', 3], ['prokhorovka', 2], ['bastogne', 2], ['alamein', 3]]) prestage(k, k, d);
  { const rows = genMap('normandy', 34, 22, 4242), zc = wavesCfg({rows, theme:'normandy', nat:'us', co:'patton', enemy:'zed', eco:'horde', diff:'hard', funds:6000, name:'trailer'}); zc.waves.zed = true; zc.waves.night = 'endless'; zc.waves.next = 2; prestage('zed', null, 7, zc); }
  { const rows = genMap('winter', 34, 22, 1944), sc = wavesCfg({rows, theme:'winter', nat:'su', co:'zhukov', enemy:'ger', eco:'normal', diff:'normal', funds:6000, name:'stand'}); if (!CO[sc.teams[2].co]) sc.teams[2].co = 'guderian'; prestage('stand', null, 4, sc); }
  { const rows = genMap('desert', 34, 22, 4171); prestage('isle', null, 3, {map:rows, theme:'desert', objective:{win:'hq'}, weather:'clear', clock:{start:'1942-07-01T09:00', step:60},
      teams:{1:{nat:'uk', co:'monty', funds:6000, ai:true}, 2:{nat:'dak', co:'rommel', funds:6000, ai:true}}, units:{1:skirmishUnits(rows, 1), 2:skirmishUnits(rows, 2)}}); }
  prestage('philsea0', 'philsea', 0);
  const V = virtualClock(); TR.t0 = TR.audio0 = V.t; TR.vtt = [];
  const oc = offlineAudio(maxSeconds), A = await audioSetup(oc);
  let done = false, fail = null; runFull(A).then(() => done = true, e => { fail = String(e && e.stack || e); done = true; });
  let n = 0; const t0 = V.t;
  for (; !done && n < maxSeconds * FPS; n++) {
    await advance(V, t0 + (n + 1) * 1000 / FPS);
    compose();
    const blob = await new Promise(r => film.toBlob(r, 'image/jpeg', .9));
    await fetch('/frame/' + n, {method:'POST', body:blob});
    window.RENDER = {frame:n, seconds:+(n / FPS).toFixed(1), timers:V.timers.size, parts:FX.parts.length};
  }
  const buf = await oc.startRendering();
  await fetch('/save/trailer/trailer-audio.wav', {method:'POST', body:wavBlob(buf)});
  window.RENDER_DONE = {frames:n, seconds:+(n / FPS).toFixed(2), fail, vtt:TR.vtt};
  return window.RENDER_DONE;
};

/* ---------- recording ---------- */
window.previewTrailer = async (t, setup) => { if (setup) await setup(); TR.t0 = performance.now() - t * 1000; compose(); return film.toDataURL('image/jpeg', .85); };
window.recordTrailer = async () => {
  quietGame(); fixCanvas();
  for (const [k, d] of [['sihang', 2], ['omaha', 2], ['philsea', 2], ['stalingrad', 3], ['keren', 3], ['prokhorovka', 2], ['bastogne', 2], ['alamein', 3]]) prestage(k, k, d);
  { const rows = genMap('normandy', 34, 22, 4242), zc = wavesCfg({rows, theme:'normandy', nat:'us', co:'patton', enemy:'zed', eco:'horde', diff:'hard', funds:6000, name:'trailer'}); zc.waves.zed = true; zc.waves.night = 'endless'; zc.waves.next = 2; prestage('zed', null, 7, zc); }
  { const rows = genMap('winter', 34, 22, 1944), sc = wavesCfg({rows, theme:'winter', nat:'su', co:'zhukov', enemy:'ger', eco:'normal', diff:'normal', funds:6000, name:'stand'}); if (!CO[sc.teams[2].co]) sc.teams[2].co = 'guderian'; prestage('stand', null, 4, sc); }
  prestage('philsea0', 'philsea', 0);                    // the opening position: every Jill still in the air
  { const rows = genMap('desert', 34, 22, 4171); prestage('isle', null, 3, {map:rows, theme:'desert', objective:{win:'hq'}, weather:'clear', clock:{start:'1942-07-01T09:00', step:60},
      teams:{1:{nat:'uk', co:'monty', funds:6000, ai:true}, 2:{nat:'dak', co:'rommel', funds:6000, ai:true}}, units:{1:skirmishUnits(rows, 1), 2:skirmishUnits(rows, 2)}}); }
  const A = await audioSetup(); TR.vtt = [];
  const stream = film.captureStream(FPS); stream.addTrack(A.dest.stream.getAudioTracks()[0]);
  const type = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus'].find(t => MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(stream, {mimeType:type, videoBitsPerSecond:3.2e6, audioBitsPerSecond:160e3}), chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  TR.t0 = performance.now(); TR.running = true;
  const loop = () => { if (!TR.running) return; compose(); setTimeout(loop, 1000 / FPS - 4); };
  loop(); rec.start(1000);
  try { await runFull(A); } catch (e) { console.error('trailer', e); window.TRAILER_FAIL = String(e && e.stack || e); }
  TR.running = false; window.TR_REC = {rec, chunks};
  await new Promise(r => { rec.onstop = r; try { rec.requestData(); rec.stop(); } catch (e) { r(); } setTimeout(r, 8000); });   // never hang if the recorder stalls
  const blob = new Blob(chunks, {type}), ext = type.startsWith('video/mp4') ? 'mp4' : 'webm';
  if (blob.size < 1e6) { window.TRAILER_ERR = 'recording came back empty (is the browser pane hidden?); the old trailer is untouched'; window.TRAILER_VTT = TR.vtt; return; }
  await fetch('/save/trailer/trailer.' + ext, {method:'POST', body:blob});
  // the poster frame and the share card come from the end card
  say = realSay; banner = realBanner;
  window.TRAILER_DONE = {type, mb:+(blob.size / 1e6).toFixed(1), seconds:+now().toFixed(1), vtt:TR.vtt};
  return window.TRAILER_DONE;
};
window.TR = TR; window.trailerFilm = film; window.trailerCompose = compose; window.TRtest = playTurn;
})();
