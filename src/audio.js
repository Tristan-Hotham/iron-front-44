/* ============================== SOUND =====================================
   Weapon sounds are modelled on each real weapon's signature: the MG 42's
   1,200 rounds-a-minute rip, the Garand's eight shots and clip "ping", the
   Bren's measured bursts, the Nebelwerfer's moan, the Stuka's Jericho
   trumpet, Katyusha salvos. Recorded samples in sfx/ replace any recipe
   with the same name when present. Music is real recordings only (music/). */
const AU = {ctx:null, master:null, sfx:null, verb:null, noise:null, samples:{}, tried:false};
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const ctx = AU.ctx = new C();
  AU.master = ctx.createGain(); AU.master.gain.value = SET.vol; AU.master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.connect(AU.master);
  AU.sfx = ctx.createGain(); AU.sfx.gain.value = .9; AU.sfx.connect(comp);
  // open-field reverb: a decaying noise impulse
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 800 ? i / 800 : 1); }
  AU.verb = ctx.createConvolver(); AU.verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = .32; AU.verb.connect(vg); vg.connect(comp);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  AU.noise = nb;
  loadSamples(); ambStart();
}
function loadSamples() {
  if (AU.tried || location.protocol === 'file:') return; AU.tried = true;
  for (const n of SFX_FILES) fetch('sfx/' + n).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && AU.ctx.decodeAudioData(b)).then(buf => { if (buf) AU.samples[n.replace(/\.\w+$/, '')] = buf; }).catch(() => {});
}
const SFX_FILES = ['sexton-fire.mp3', 'sexton-move.mp3', 'merlin.mp3', 'spitfire.mp3'];
/* recorded samples standing in for a recipe: [file, start s, length s] */
const SAMPLE_USE = {
  howitzer:['sexton-fire', .2, 4.2],                    // Sexton self-propelled 25-pounder, a real WWII gun
  move_tread:['sexton-move', 1.5, 2.6],                 // its tracks and engine
  move_air:['spitfire', 9, 3.2],                        // Spitfire fly-past
  strafeUK:['merlin', 0, 2.2], strafeUS:['merlin', 0, 2.2], bombs:['merlin', 2, 2.2], rp3:['merlin', 4, 2.2],   // Rolls-Royce / Packard Merlin
};
const SAMPLE_LAYER = new Set(['strafeUK', 'strafeUS', 'bombs', 'rp3', 'howitzer']);    // sample plays under the modelled guns

/* ---------- building blocks ---------- */
function out(dry = 1, wet = 1) {
  const g = AU.ctx.createGain(); g.gain.value = dry; g.connect(AU.sfx);
  if (wet) { const w = AU.ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(AU.verb); }
  return g;
}
function noiseHit(t, {dur = .08, hp = 0, lp = 20000, bp = 0, q = 1, gain = 1, attack = .002, dest}) {
  const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; s.playbackRate.value = .8 + Math.random() * .4;
  let node = s;
  const f = (type, freq) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = freq; b.Q.value = q; node.connect(b); node = b; };
  if (hp) f('highpass', hp); if (lp < 20000) f('lowpass', lp); if (bp) f('bandpass', bp);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  node.connect(g); g.connect(dest || out()); s.start(t, Math.random()); s.stop(t + dur + .05);
}
function thump(t, {f0 = 120, f1 = 40, dur = .3, gain = 1, type = 'sine', dest}) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(dest || out(1, .6)); o.start(t); o.stop(t + dur + .05);
}
function tone(t, {f = 440, f1 = null, dur = .3, gain = .3, type = 'sine', vib = 0, vibF = 6, attack = .01, dest}) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (f1) o.frequency.linearRampToValueAtTime(f1, t + dur);
  if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = vibF; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.setValueAtTime(gain, t + dur * .8); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(dest || out(1, .5)); o.start(t); o.stop(t + dur + .05);
}
/* a single small-arms report: supersonic crack, muzzle blast, a little body */
function report(t, k = 1, pitch = 1) {
  noiseHit(t, {dur:.04 * k, hp:2200 * pitch, gain:.55 * k});
  noiseHit(t, {dur:.12 * k, lp:1400 * pitch, gain:.7 * k});
  thump(t, {f0:160 * pitch, f1:60, dur:.08 * k, gain:.35 * k});
}
function cannon(t, size = 1, crack = 1) {           // tank gun: sharp crack, heavy blast, long rumble
  noiseHit(t, {dur:.05, hp:1800, gain:.7 * crack});
  noiseHit(t, {dur:.5 * size, lp:900 / Math.sqrt(size), gain:1.1});
  noiseHit(t + .02, {dur:1.4 * size, lp:260, gain:.6, attack:.02});
  thump(t, {f0:110 / Math.sqrt(size), f1:28, dur:.6 * size, gain:1});
}
function explosion(t, size = 1) {
  noiseHit(t, {dur:.9 * size, lp:700, gain:1.1 * Math.min(1.4, size), attack:.005});
  noiseHit(t + .03, {dur:1.6 * size, lp:180, gain:.8, attack:.03});
  thump(t, {f0:80, f1:22, dur:.9 * size, gain:1});
  for (let i = 0; i < 4 * size; i++) noiseHit(t + .1 + Math.random() * .5 * size, {dur:.06, hp:1500, gain:.12});   // debris
}
function whistle(t, dur = 1, f0 = 2000, f1 = 700) { tone(t, {f:f0, f1, dur, gain:.09, type:'sine', attack:.2}); }
function whoosh(t, dur = .6, f0 = 600, f1 = 2400, gain = .5) {
  const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise;
  const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 2; b.frequency.setValueAtTime(f0, t); b.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .05); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(b); b.connect(g); g.connect(out(1, .7)); s.start(t, Math.random()); s.stop(t + dur + .05);
}
function engine(t, dur, {f = 40, type = 'sawtooth', gain = .15, lp = 300, clank = 0, ramp = 1}) {
  const c = AU.ctx, o = c.createOscillator(), o2 = c.createOscillator(), b = c.createBiquadFilter(), g = c.createGain();
  o.type = o2.type = type; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * ramp, t + dur); o2.frequency.value = f * 1.5 + 3;
  b.type = 'lowpass'; b.frequency.value = lp; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .15); g.gain.setValueAtTime(gain, t + dur - .2); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(b); o2.connect(b); b.connect(g); g.connect(out(1, .2)); o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
  if (clank) for (let x = t + .1; x < t + dur - .1; x += .11 + Math.random() * .03) noiseHit(x, {dur:.03, bp:2400, q:3, gain:.12 * clank});
}

/* ---------- weapon recipes ---------- */
const WEAPON = {
  mg42(t) { for (let i = 0; i < 26; i++) report(t + i / 20, .7, 1.2); },          // ~1,200 rpm
  mg34(t) { for (let i = 0; i < 16; i++) report(t + i / 15, .7, 1.1); },
  garand(t) { let x = t; for (let i = 0; i < 8; i++) { report(x, 1, .95); x += .22 + Math.random() * .12; }
    tone(x, {f:2650, dur:.45, gain:.07, type:'triangle'}); tone(x, {f:3240, dur:.35, gain:.05, type:'triangle'}); },   // the clip ping
  bar(t) { for (let i = 0; i < 8; i++) report(t + i / 9, .9, .95); },
  bren(t) { for (let b = 0; b < 3; b++) for (let i = 0; i < 4; i++) report(t + b * .55 + i / 8.5, .9, .95); },
  ppsh(t) { for (let i = 0; i < 22; i++) report(t + i / 16, .55, 1.35); },
  dt(t) { for (let i = 0; i < 12; i++) report(t + i / 10, .7, 1.1); },
  m2hb(t) { for (let i = 0; i < 10; i++) report(t + i / 9, 1.3, .75); },
  quad50(t) { for (let i = 0; i < 30; i++) report(t + i / 30, 1, .8); },
  rocketAT(t) { noiseHit(t, {dur:.15, lp:1200, gain:.6}); whoosh(t, .45, 400, 1800, .5); explosion(t + .45, .6); },
  piat(t) { thump(t, {f0:90, f1:50, dur:.15, gain:.8}); noiseHit(t, {dur:.06, bp:900, gain:.5}); whoosh(t + .05, .5, 300, 900, .3); explosion(t + .55, .6); },
  ptrd(t) { report(t, 2, .7); noiseHit(t, {dur:.08, hp:3000, gain:.8}); report(t + 1.4, 2, .7); },
  gun37(t) { cannon(t, .45, 1.1); cannon(t + .9, .45, 1.1); },
  gun50(t) { cannon(t, .55, 1.1); },
  gun75(t) { cannon(t, .9); explosion(t + .3, .5); },
  gun75hv(t) { cannon(t, .9, 1.6); explosion(t + .18, .55); },
  gun76(t) { cannon(t, .9, 1.1); explosion(t + .28, .5); },
  gun85(t) { cannon(t, 1, 1.3); explosion(t + .22, .6); },
  gun88(t) { cannon(t, 1.2, 1.7); explosion(t + .16, .7); },
  gun90(t) { cannon(t, 1.1, 1.5); explosion(t + .2, .65); },
  gun17pdr(t) { cannon(t, 1.1, 2); explosion(t + .15, .65); },
  gun122(t) { cannon(t, 1.5, 1.4); explosion(t + .25, .9); },
  howitzer(t) { if (!AU.samples['sexton-fire']) cannon(t, 1.3, .8); whistle(t + .7, 1.1, 1900, 650); explosion(t + 1.8, 1); },
  nebel(t) {                                                     // the "Screaming Mimi": six rockets rippled off
    for (let i = 0; i < 6; i++) { const x = t + i * .28;
      tone(x, {f:230, f1:420, dur:1.1, gain:.13, type:'sawtooth', vib:30, vibF:23}); noiseHit(x, {dur:1, bp:900, q:1.5, gain:.35, attack:.25}); }
    for (let i = 0; i < 6; i++) explosion(t + 2.2 + i * .2, .8); },
  katyusha(t) { for (let i = 0; i < 16; i++) whoosh(t + i * .12, .7, 300, 2600, .3); for (let i = 0; i < 10; i++) explosion(t + 1.7 + i * .12 + Math.random() * .1, .7); },
  calliope(t) { for (let i = 0; i < 18; i++) whoosh(t + i * .09, .6, 400, 2200, .25); for (let i = 0; i < 9; i++) explosion(t + 1.5 + i * .13, .6); },
  mattress(t) { for (let i = 0; i < 16; i++) whoosh(t + i * .1, .6, 350, 2000, .25); for (let i = 0; i < 8; i++) explosion(t + 1.6 + i * .15, .7); },
  flak20(t) { for (let i = 0; i < 14; i++) { thump(t + i / 7.5, {f0:200, f1:70, dur:.12, gain:.5}); noiseHit(t + i / 7.5, {dur:.08, lp:2000, gain:.5}); } },
  bofors(t) { for (let i = 0; i < 6; i++) { cannon(t + i * .5, .35, .6); } },
  strafeGer(t) { engine(t, 1.6, {f:95, gain:.12, lp:900, ramp:1.25}); for (let i = 0; i < 14; i++) report(t + .4 + i / 18, .8, 1.1); for (let i = 0; i < 4; i++) cannon(t + .5 + i * .16, .3, .8); },
  strafeUS(t) { engine(t, 1.6, {f:90, gain:.12, lp:900, ramp:1.25}); for (let i = 0; i < 24; i++) report(t + .4 + i / 26, .9, .8); },
  strafeUK(t) { engine(t, 1.6, {f:100, gain:.12, lp:1000, ramp:1.3}); for (let i = 0; i < 6; i++) cannon(t + .4 + i * .12, .3, .9); for (let i = 0; i < 14; i++) report(t + .4 + i / 20, .6, 1.2); },
  strafeSU(t) { engine(t, 1.6, {f:98, gain:.12, lp:900, ramp:1.3}); for (let i = 0; i < 5; i++) cannon(t + .4 + i * .14, .3, .8); for (let i = 0; i < 10; i++) report(t + .4 + i / 16, .8, 1); },
  stuka(t) { engine(t, 2.2, {f:85, gain:.1, lp:800, ramp:1.5});
    tone(t + .2, {f:420, f1:980, dur:2, gain:.16, type:'sawtooth', vib:18, vibF:9}); tone(t + .2, {f:630, f1:1460, dur:2, gain:.07, type:'square', vib:25, vibF:9});   // Jericho trumpet
    whistle(t + 1.6, .7, 1500, 600); explosion(t + 2.3, 1.4); },
  bombs(t) { engine(t, 1.8, {f:70, gain:.13, lp:700, ramp:1.3}); whistle(t + .6, 1, 1700, 500); explosion(t + 1.6, 1.3); explosion(t + 1.8, 1); },
  rp3(t) { engine(t, 1.4, {f:95, gain:.1, lp:900, ramp:1.3}); for (let i = 0; i < 4; i++) whoosh(t + .5 + i * .12, .5, 500, 2500, .4); for (let i = 0; i < 4; i++) explosion(t + 1 + i * .14, .7); },
  flamer(t) { const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; const b = c.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = 700;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .1); g.gain.setValueAtTime(.9, t + .9); g.gain.linearRampToValueAtTime(0, t + 1.3);
    s.connect(b); b.connect(g); g.connect(out(1, .3)); s.start(t); s.stop(t + 1.4); for (let i = 0; i < 10; i++) noiseHit(t + .1 + i * .1, {dur:.05, hp:2500, gain:.15}); },   // the roar and crackle of a Flammenwerfer
  bangalore(t) { for (let i = 0; i < 3; i++) report(t + i * .4, .8, .9); explosion(t + 1.4, 1.2); },
  mortar(t) { thump(t, {f0:180, f1:90, dur:.15, gain:.7}); noiseHit(t, {dur:.08, bp:700, gain:.5}); whistle(t + .9, .7, 1400, 700); explosion(t + 1.6, .8); },
  carpet(t) { engine(t, 3.5, {f:55, gain:.2, lp:500, ramp:1.05}); engine(t, 3.5, {f:62, gain:.12, lp:500, ramp:1.04}); for (let i = 0; i < 18; i++) explosion(t + .9 + i * .08, .9); },
  barrage(t) { for (let i = 0; i < 6; i++) whistle(t + i * .12, .8, 2000 - i * 80, 600); for (let i = 0; i < 14; i++) explosion(t + .9 + i * .11, 1); },
  naval(t) { cannon(t, 1.8, .9); cannon(t + .35, 1.8, .9); whistle(t + 1, 1, 1500, 600); explosion(t + 2, 1.2); explosion(t + 2.3, 1); },
};
/* ---------- human voices: a cry of pain, a shout ---------- */
/* a crude vocal tract: a glottal sawtooth through two vowel formants, with a breathy noise layer */
function voice(t, {f0 = 300, f1 = 200, dur = .7, vowel = [800, 1200], gain = .22, vib = 9, breath = .3}) {
  const c = AU.ctx, o = c.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(f0 * .9, t); o.frequency.linearRampToValueAtTime(f0 * 1.08, t + .06); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6 + Math.random() * 3; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .04); g.gain.setValueAtTime(gain, t + dur * .6); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  const dest = out(1, .45);
  for (const [i, fq] of vowel.entries()) { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fq; b.Q.value = 7; const bg = c.createGain(); bg.gain.value = i ? .55 : 1; o.connect(b); b.connect(bg); bg.connect(g); }
  g.connect(dest); o.start(t); o.stop(t + dur + .05);
  noiseHit(t, {dur, bp:vowel[0] * 1.4, q:2, gain:gain * breath, attack:.05, dest});
}
const UI_SND = {
  scream(t) { const v = Math.random(); voice(t, v < .5 ? {f0:380 + Math.random() * 120, f1:180, dur:.9 + Math.random() * .5, vowel:[850, 1250]} : {f0:300, f1:150, dur:.6, vowel:[650, 1100], vib:14}); },
  cry(t) { voice(t, {f0:260 + Math.random() * 60, f1:140, dur:.45, vowel:[550, 950], gain:.16, vib:5}); voice(t + .5, {f0:240, f1:130, dur:.5, vowel:[500, 900], gain:.12, vib:4}); },
  shout(t) { for (let i = 0; i < 2; i++) voice(t + i * .22, {f0:210 + Math.random() * 50, f1:190, dur:.18, vowel:i ? [700, 1150] : [500, 1500], gain:.14, vib:2, breath:.5}); },
  click(t) { noiseHit(t, {dur:.025, hp:3000, gain:.25}); thump(t, {f0:900, f1:500, dur:.03, gain:.12}); },
  select(t) { noiseHit(t, {dur:.03, hp:2500, gain:.3}); noiseHit(t + .06, {dur:.03, hp:2000, gain:.25}); },   // bolt working
  cancel(t) { noiseHit(t, {dur:.06, bp:600, gain:.3}); },
  capture(t) { for (let i = 0; i < 3; i++) noiseHit(t + i * .12, {dur:.05, bp:1500, q:3, gain:.3}); thump(t + .4, {f0:200, f1:80, dur:.2, gain:.4}); },
  build(t) { for (let i = 0; i < 4; i++) noiseHit(t + i * .09, {dur:.04, bp:2500, q:4, gain:.25}); thump(t, {f0:120, f1:60, dur:.3, gain:.4}); },
  power(t) { explosion(t, .6); for (let i = 0; i < 5; i++) noiseHit(t + .2 + i * .1, {dur:.05, hp:1500, gain:.3}); },
  turn(t) { noiseHit(t, {dur:.4, bp:300, q:1, gain:.2, attack:.1}); },
  move_tread(t) { engine(t, .9, {f:34, gain:.2, lp:260, clank:1}); },
  move_tire(t) { engine(t, .9, {f:48, gain:.13, lp:500}); },
  move_foot(t) { for (let i = 0; i < 6; i++) noiseHit(t + i * .14, {dur:.05, bp:500, q:1, gain:.25}); },
  move_air(t) { engine(t, 1, {f:92, gain:.1, lp:1000, ramp:1.15}); },
  move_ship(t) { engine(t, 1, {f:30, gain:.12, lp:200}); noiseHit(t, {dur:1, bp:700, q:.5, gain:.12, attack:.3}); },
  hit(t) { explosion(t, .5); },
  boom(t) { explosion(t, 1.2); },
  victory(t) {}, defeat(t) {},
};
function sfx(name, delay = 0) {
  if (!SET.sound) return; auInit(); if (!AU.ctx) return;
  const t = AU.ctx.currentTime + .02 + delay;
  const use = SAMPLE_USE[name], buf = use && AU.samples[use[0]];
  if (buf) {
    const s = AU.ctx.createBufferSource(), g = AU.ctx.createGain(); s.buffer = buf; g.gain.setValueAtTime(SAMPLE_LAYER.has(name) ? .6 : 1, t); g.gain.setValueAtTime(g.gain.value, t + use[2] - .3); g.gain.linearRampToValueAtTime(0, t + use[2]);
    s.connect(g); g.connect(out(1, .15)); s.start(t, use[1], use[2]);
    if (!SAMPLE_LAYER.has(name)) return;
  }
  const f = WEAPON[name] || UI_SND[name]; if (f) try { f(t); } catch (e) {}
}
function moveSound(u) { if (NATION[u.d.nat] && NATION[u.d.nat].zed) return sfx(u.role === 'cav' ? 'claw' : 'shamble'); const mt = u.d.mt; sfx(mt === 'tread' ? 'move_tread' : mt === 'tire' ? 'move_tire' : mt === 'air' ? 'move_air' : (mt === 'ship' || mt === 'lander') ? 'move_ship' : 'move_foot'); }

