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
const wait = s => new Promise(r => setTimeout(r, s * 1000));
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const fadeIO = (t, a, b, inn = .5, out = .5) => Math.min(ease((t - a) / inn), ease((b - t) / out));

/* ---------- the game, held still for the camera ---------- */
function fixCanvas() { dpr = 1; cv.width = W; cv.height = H; }
const realSay = say, realBanner = banner;
function quietGame() { say = () => Promise.resolve(); banner = () => Promise.resolve(); SET.tips = false; SET.music = false; SET.battle = true; SET.fx = true; SET.aiFast = false; SET.sound = true; }
TR.snaps = {};
function prestage(key, id, days, cfg) { FAST = true; TESTER[1] = 'aggressive'; autoplayMission(cfg || MISSIONS[id], days, true); TESTER[1] = null; FAST = false; TR.snaps[key] = serial(); G = null; }
async function stage(key, days, opt = {}) {
  EPOCH++; UI.busy = false; MUSIC.els.forEach(e => e && e.pause());
  if (!TR.snaps[key]) prestage(key, key, days, opt.cfg);
  revive(TR.snaps[key]);
  G.watch = true; G.teams[1].ai = G.teams[2].ai = true; G.over = null; UI.overShown = true;
  FX.parts = []; FX.flyers = [];
  enterGame(); fixCanvas();
  for (const el of document.querySelectorAll('#dialog, #result, #codebox')) el.hidden = true;
  cam.z = opt.z || 1.6;
  // frame the front: halfway between the two armies, nudged towards whoever is attacking
  const c = t => { const us = G.units.filter(u => u.team === t && !u.d.air); return us.length ? [us.reduce((s, u) => s + u.x, 0) / us.length, us.reduce((s, u) => s + u.y, 0) / us.length] : [G.W / 2, G.H / 2]; };
  const [ax, ay] = c(1), [bx, by] = c(2), k = opt.lean ?? .5;
  centerOn(opt.at ? opt.at[0] : ax + (bx - ax) * k, opt.at ? opt.at[1] : ay + (by - ay) * k);
  SET.battle = opt.battles !== false;
  const ep = EPOCH; (async () => { await wait(.4); if (ep === EPOCH) beginTurn(); })();
}
function stopGame() { EPOCH++; UI.busy = false; }

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
  grade(TR.layer === 'zed' || TR.zed ? .02 : .07);
  if (TR.fadeBlack != null) { f.fillStyle = `rgba(0,0,0,${TR.fadeBlack})`; f.fillRect(0, 0, W, H); }
}

/* ---------- the score ---------- */
async function audioSetup() {          // the whole recording decoded in memory, so each cue starts at an exact offset
  auInit(); await AU.ctx.resume().catch(() => {}); const ac = AU.ctx, dest = ac.createMediaStreamDestination();
  AU.master.connect(dest);
  const buf = await ac.decodeAudioData(await fetch('music/mars.mp3').then(r => r.arrayBuffer()));
  const track = (off) => { const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination); g.connect(dest);
    return {g, start() { const s = ac.createBufferSource(); s.buffer = buf; s.connect(g); s.start(0, off); }}; };
  return {ac, dest, a:track(40), b:track(445.6)};
}
function ramp(g, to, s, ac) { g.gain.cancelScheduledValues(ac.currentTime); g.gain.setValueAtTime(g.gain.value, ac.currentTime); g.gain.linearRampToValueAtTime(to, ac.currentTime + s); }

/* ---------- the cut ---------- */
async function run(A) {
  const at = s => wait(Math.max(0, s - now()));
  const C = (lines, a, b, extra = {}) => { TR.card = Object.assign({lines, a, b}, extra); };
  // 0-7: cold open on black, the ostinato starting
  TR.layer = 'black'; A.a.start(); ramp(A.a.g, .9, 2.5, A.ac);
  C([{s:'1937 – 1945', font:'34px "Courier Prime", monospace', col:'#e8c060', y:-70, track:14},
     {s:'SHANGHAI.  THE MEUSE.  STALINGRAD.  THE DESERT.  THE PACIFIC.', font:'30px "Courier Prime", monospace', y:10, track:4, type:true, d:.6},
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
  await shot('omaha', 2, 13, 22.5, 'OMAHA BEACH', 'NORMANDY  ·  6 JUNE 1944', {z:1.5, lean:.35});
  await shot('stalingrad', 3, 22.5, 31, 'STALINGRAD', 'THE VOLGA  ·  OCTOBER 1942', {z:1.6});
  await shot('alamein', 3, 31, 39.5, 'EL ALAMEIN', 'THE WESTERN DESERT  ·  OCTOBER 1942', {z:1.7});
  await shot('prokhorovka', 2, 39.5, 46, 'PROKHOROVKA', 'THE BATTLE OF KURSK  ·  JULY 1943', {z:1.6});
  await shot('iwo', 3, 46, 52.5, 'IWO JIMA', 'MOUNT SURIBACHI  ·  FEBRUARY 1945', {z:1.6});
  // 52.5-60: the generals, over Bastogne in the snow
  TR.caps = []; await stage('bastogne', 2, {z:1.3, battles:false}); TR.layer = 'game'; TR.shotStart = now(); TR.shotLen = 14; TR.dim = .55;
  C([{s:'REAL GENERALS.  REAL ARMIES.  REAL MUSIC.', font:'bold 56px "Stardos Stencil", Impact, sans-serif', y:-170, track:6}], 52.8, 59.6);
  TR.extra = t => portraits(t, 53.6, 59.6, ['rommel', 'patton', 'zhukov', 'monty', 'yamashita', 'chiang', 'koenig', 'guderian', 'morshead']);
  await at(59.8); TR.extra = null;
  // 60-66: what is in the box
  C([{s:'66 BATTLES  ·  12 CAMPAIGNS', font:'bold 72px "Stardos Stencil", Impact, sans-serif', y:-60, track:6},
     {s:'Land, sea and air  ·  a map builder  ·  play a friend online', font:'34px "Courier Prime", monospace', col:'#e8c060', y:30, d:.6, track:2},
     {s:'Last Stand  ·  the Desert War  ·  Shanghai to Berlin', font:'34px "Courier Prime", monospace', col:'#e8dcb8', y:90, d:1.2, track:2}], 60, 65.8);
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

/* ---------- recording ---------- */
window.previewTrailer = async (t, setup) => { if (setup) await setup(); TR.t0 = performance.now() - t * 1000; compose(); return film.toDataURL('image/jpeg', .85); };
window.recordTrailer = async () => {
  quietGame(); fixCanvas();
  for (const [k, d] of [['omaha', 2], ['stalingrad', 3], ['alamein', 3], ['prokhorovka', 2], ['iwo', 3], ['bastogne', 2]]) prestage(k, k, d);
  { const rows = genMap('normandy', 34, 22, 4242), zc = wavesCfg({rows, theme:'normandy', nat:'us', co:'patton', enemy:'zed', eco:'horde', diff:'hard', funds:6000, name:'trailer'}); zc.waves.zed = true; zc.waves.night = 'endless'; zc.waves.next = 2; prestage('zed', null, 7, zc); }
  const A = await audioSetup();
  const stream = film.captureStream(FPS); stream.addTrack(A.dest.stream.getAudioTracks()[0]);
  const type = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus'].find(t => MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(stream, {mimeType:type, videoBitsPerSecond:3.2e6, audioBitsPerSecond:160e3}), chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  TR.t0 = performance.now(); TR.running = true;
  const loop = () => { if (!TR.running) return; compose(); setTimeout(loop, 1000 / FPS - 4); };
  loop(); rec.start(1000);
  try { await run(A); } catch (e) { console.error('trailer', e); window.TRAILER_ERR = String(e && e.stack || e); }
  TR.running = false; rec.stop(); await new Promise(r => rec.onstop = r);
  const blob = new Blob(chunks, {type}), ext = type.startsWith('video/mp4') ? 'mp4' : 'webm';
  await fetch('/save/trailer/trailer.' + ext, {method:'POST', body:blob});
  // the poster frame and the share card come from the end card
  say = realSay; banner = realBanner;
  window.TRAILER_DONE = {type, mb:+(blob.size / 1e6).toFixed(1), seconds:+now().toFixed(1)};
  return window.TRAILER_DONE;
};
window.TR = TR; window.trailerFilm = film; window.trailerCompose = compose;
})();
