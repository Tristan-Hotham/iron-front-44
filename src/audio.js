/* ============================== SOUND =====================================
   Weapon sounds are modelled on each real weapon's signature: the MG 42's
   1,200 rounds-a-minute rip, the Garand's eight shots and clip "ping", the
   Bren's measured bursts, the Nebelwerfer's moan, the Stuka's Jericho
   trumpet, Katyusha salvos. Recorded samples in sfx/ replace any recipe
   with the same name when present. Music is real recordings only (music/). */
const AU = {ctx:null, master:null, sfx:null, verb:null, noise:null, samples:{}, tried:false};
function auInit() {
  if (AU.ctx) { if (AU.ctx.state !== 'running' && !document.hidden && AU.ctx.resume) AU.ctx.resume().catch(() => {}); return; }   // iOS leaves it 'interrupted', not 'suspended'
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const ctx = AU.ctx = new C();
  AU.master = ctx.createGain(); AU.master.gain.value = SET.vol;
  AU.lp = ctx.createBiquadFilter(); AU.lp.type = 'lowpass'; AU.lp.frequency.value = 22000; AU.master.connect(AU.lp); AU.lp.connect(ctx.destination);   // shell shock closes this
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
/* a hidden tab goes quiet: sound and music pause, and pick up again when the player comes back */
document.addEventListener('visibilitychange', () => {
  try {
    const live = AU.ctx && !(typeof OfflineAudioContext !== 'undefined' && AU.ctx instanceof OfflineAudioContext);
    const el = typeof MUSIC !== 'undefined' && MUSIC.els[MUSIC.cur];
    if (document.hidden) { if (live) AU.ctx.suspend().catch(() => {}); if (el && !el.paused) { el.pause(); MUSIC.hiddenPause = true; } }
    else { if (live) AU.ctx.resume().catch(() => {}); if (el && MUSIC.hiddenPause && SET.music) el.play().catch(() => {}); MUSIC.hiddenPause = false; }
  } catch (e) {}
});
function loadSamples() {
  if (AU.tried || location.protocol === 'file:') return; AU.tried = true;
  // a phone choked decoding 84 recordings at the first tap: now they come two at a time, the common ones first,
  // and a sound asked for before its turn jumps the queue (the modelled recipe stands in until it arrives)
  const first = ['garand-1', 'enfield-shot', 'mauser-shot', 'mg-fast', 'hmg-burst', 'tank-fire', 'cannon-shot', 'explosion-1', 'explosion-2', 'artillery-shot', 'tracks', 'boots-gravel'];
  AU.queue = [...new Set(first.concat(SFX_LIB, SFX_FILES.map(n => n.replace(/\.\w+$/, ''))))]; AU.loading = 0; AU.failed = new Set();
  for (let i = 0; i < 2; i++) sampleNext();
}
function sampleNext() {
  const k = AU.queue.shift(); if (!k) return;
  if (AU.samples[k] || AU.failed.has(k)) return sampleNext();
  AU.loading++; const file = SFX_FILES.find(f => f.startsWith(k + '.')) || k + '.mp3';
  fetch('sfx/' + file).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && AU.ctx.decodeAudioData(b)).then(buf => { if (buf) { AU.samples[k] = buf; AU.takes[k] = splitTakes(buf); } else AU.failed.add(k); })
    .catch(() => AU.failed.add(k)).finally(() => { AU.loading--; setTimeout(sampleNext, 30); });
}
function sampleWant(k) { if (AU.queue && !AU.samples[k] && AU.queue.includes(k)) { AU.queue.splice(AU.queue.indexOf(k), 1); AU.queue.unshift(k); } }
const SFX_FILES = ['sexton-fire.mp3', 'sexton-move.mp3', 'merlin.mp3', 'spitfire.mp3'];
/* the recorded library (Freesound, CC0 / CC BY: see CREDITS.md). Each file is split into takes on silence when it loads,
   so a file of six screams gives six screams; every play picks a fresh take and nudges its pitch, so no two volleys sound alike */
const SFX_LIB = ['garand-1', 'garand-2', 'garand-ping', 'enfield-shot', 'mosin-bolt', 'thompson-shot', 'ppsh-short', 'ppsh-burst', 'hmg-burst', 'mg-fast', 'mg-heavy-burst', 'cal50', 'cal50-avenger',
  'tank-move', 'tracks', 'tank-engine', 'tank-fire', 'tank-shots', 'cannon-shot', 'cannon-2', 'artillery-shot', 'field-gun', 'incoming-1', 'incoming-4', 'incoming-artillery',
  'explosion-1', 'explosion-2', 'explosion-muffled', 'explosion-distant', 'explosion-debris', 'ricochet-1', 'ricochet-2', 'ricochet-3', 'ricochet-metal', 'bullet-impact',
  'death-1', 'death-2', 'death-3', 'death-4', 'death-5', 'screams', 'pain-grunts', 'pain-mix', 'pain-grunt', 'boots-gravel', 'boots-run', 'truck-hum', 'jeep', 'flamethrower',
  'amb-war-loop', 'amb-battlefield', 'amb-distant-explosions', 'amb-gunfire', 'amb-ww2-gunfire', 'amb-bombing', 'amb-desert-wind', 'ship-horn', 'flak-shot',
  'splash-big', 'water-explosion', 'underwater-explosion', 'water-column',
  'stuka-dive', 'mustang-pass', 'radial-flyby', 'biplane-flyby', 'b25-flyover', 'bombers-overhead', 'plane-spin-dive',
  'ship-engine-room', 'ship-wake', 'boat-diesel', 'boat-passing', 'naval-5in', 'artillery-real', 'torpedo-run', 'depth-charge', 'sonar-ping', 'mauser-shot'];
AU.takes = {}; AU.last = {};
function splitTakes(buf, gapMs = 120, floorDb = -32) {         // [{t, len, pk}]: sounds separated by 120 ms of near-silence, each with its reverb tail
  const d = buf.getChannelData(0), sr = buf.sampleRate, win = Math.round(sr * .01), env = [];
  let peak = 0; for (let i = 0; i < d.length; i += 4) peak = Math.max(peak, Math.abs(d[i]));
  for (let i = 0; i < d.length; i += win) { let s = 0; for (let j = i; j < Math.min(d.length, i + win); j += 2) s += d[j] * d[j]; env.push(Math.sqrt(s / win * 2)); }
  const thr = peak * Math.pow(10, floorDb / 20), gap = gapMs / 10, raw = [];
  let st = -1, quiet = 0;
  env.forEach((v, i) => { if (v > thr) { if (st < 0) st = i; quiet = 0; } else if (st >= 0 && ++quiet > gap) { raw.push([st, i - quiet]); st = -1; } });
  if (st >= 0) raw.push([st, env.length - 1]);
  const out = raw.filter(([a, b]) => b - a >= 3).map(([a, b], i, arr) => {
    const next = arr[i + 1] ? arr[i + 1][0] : env.length, end = Math.min(next - 1, b + 40);
    let pk = 0; for (let j = a * win; j < Math.min(d.length, (b + 1) * win); j += 2) pk = Math.max(pk, Math.abs(d[j]));
    return {t:Math.max(0, a / 100 - .01), len:(end - a + 1) / 100, pk:pk || 1};
  });
  return out.length ? out : [{t:0, len:buf.duration, pk:peak || 1}];
}
const have = (...names) => names.every(n => AU.samples[n] || (sampleWant(n), false));
const pickOf = list => { const ok = list.filter(n => AU.samples[n] || (sampleWant(n), false)); return ok[Math.floor(Math.random() * ok.length)]; };
/* play one take of a recorded sound. opts: take (index), len (cap, s), off (s into a long recording; 'rand' for a random slice),
   gain, rate (default: a small random nudge), lp (low-pass: distance), wet (reverb), dest, norm (false keeps the recorded level) */
function samp(name, t, o = {}) {
  const buf = AU.samples[name]; if (!buf || !AU.ctx || (AU.until && t > AU.until)) return 0;   // shot({max}): no report after the picture's last muzzle flash
  const c = AU.ctx, tk = AU.takes[name] || [{t:0, len:buf.duration, pk:1}];
  let k; if (o.take != null) k = tk[Math.min(tk.length - 1, o.take)];
  else { let i = Math.floor(Math.random() * tk.length); if (tk.length > 2 && i === AU.last[name]) i = (i + 1) % tk.length; AU.last[name] = i; k = tk[i]; }
  let start = k.t, len = k.len;
  if (o.off != null) { start = o.off === 'rand' ? Math.random() * Math.max(0, buf.duration - (o.len || 2)) : o.off; len = o.len || 2; }
  else if (o.len) len = Math.min(len, o.len);
  const rate = o.rate ?? (.94 + Math.random() * .12), dur = len / rate;
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; s.playbackRate.value = rate;
  const lvl = (o.gain ?? 1) * (o.norm === false ? 1 : Math.min(4, .7 / k.pk)), fo = Math.min(o.fade ?? .12, dur * .4);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + (o.fadeIn ?? .004)); g.gain.setValueAtTime(lvl, t + dur - fo); g.gain.linearRampToValueAtTime(0, t + dur);
  let node = s; if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; s.connect(f); node = f; }
  node.connect(g); g.connect(o.dest || out(1, o.wet ?? .15)); s.start(t, start, len + .05); s.stop(t + dur + .1);
  return dur;
}
/* recorded samples standing in for a recipe: [file, start s, length s] */
const SAMPLE_USE = {
  move_air:['spitfire', 9, 3.2],                        // fallback only: each aircraft's own engine comes from airPass
};   // tracked moves pick from the tank recordings in UI_SND.move_tread; aircraft engines (once a Merlin under every attack) now come from airPass
const SAMPLE_LAYER = new Set();           // the howitzer chooses between the Sexton and the library itself (SW.howitzer)    // sample plays under the modelled guns

/* ---------- building blocks ---------- */
function out(dry = 1, wet = 1) {
  const g = AU.ctx.createGain(); g.gain.value = dry * (AU.scale || 1); g.connect(AU.sfx);
  if (wet) { const w = AU.ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(AU.verb); }
  return g;
}
function noiseHit(t, {dur = .08, hp = 0, lp = 20000, bp = 0, q = 1, gain = 1, attack = .002, dest}) {
  const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; s.playbackRate.value = .8 + Math.random() * .4;
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
  if (AU.until && t > AU.until) return;
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
  if (AU.quiet) return;                               // shot(): the animation plays the detonation when the shell lands
  noiseHit(t, {dur:.9 * size, lp:700, gain:1.1 * Math.min(1.4, size), attack:.005});
  noiseHit(t + .03, {dur:1.6 * size, lp:180, gain:.8, attack:.03});
  thump(t, {f0:80, f1:22, dur:.9 * size, gain:1});
  for (let i = 0; i < 4 * size; i++) noiseHit(t + .1 + Math.random() * .5 * size, {dur:.06, hp:1500, gain:.12});   // debris
}
function whistle(t, dur = 1, f0 = 2000, f1 = 700) { if (AU.quiet) return; tone(t, {f:f0, f1, dur, gain:.09, type:'sine', attack:.2}); }
function whoosh(t, dur = .6, f0 = 600, f1 = 2400, gain = .5) {
  const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true;
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
  howitzer(t) { cannon(t, 1.3, .8); whistle(t + .7, 1.1, 1900, 650); explosion(t + 1.8, 1); },
  nebel(t) {                                                     // the "Screaming Mimi": six rockets rippled off
    for (let i = 0; i < 6; i++) { const x = t + i * .28;
      tone(x, {f:230, f1:420, dur:1.1, gain:.13, type:'sawtooth', vib:30, vibF:23}); noiseHit(x, {dur:1, bp:900, q:1.5, gain:.35, attack:.25}); }
    for (let i = 0; i < 6; i++) explosion(t + 2.2 + i * .2, .8); },
  katyusha(t) { for (let i = 0; i < 16; i++) whoosh(t + i * .12, .7, 300, 2600, .3); for (let i = 0; i < 10; i++) explosion(t + 1.7 + i * .12 + Math.random() * .1, .7); },
  calliope(t) { for (let i = 0; i < 18; i++) whoosh(t + i * .09, .6, 400, 2200, .25); for (let i = 0; i < 9; i++) explosion(t + 1.5 + i * .13, .6); },
  mattress(t) { for (let i = 0; i < 16; i++) whoosh(t + i * .1, .6, 350, 2000, .25); for (let i = 0; i < 8; i++) explosion(t + 1.6 + i * .15, .7); },
  flak20(t) { for (let i = 0; i < 14; i++) { thump(t + i / 7.5, {f0:200, f1:70, dur:.12, gain:.5}); noiseHit(t + i / 7.5, {dur:.08, lp:2000, gain:.5}); } },
  bofors(t) { for (let i = 0; i < 6; i++) { cannon(t + i * .5, .35, .6); } },
  strafeGer(t) { engine(t, 1.6, {f:95, gain:.12, lp:900, ramp:1.25}); for (let i = 0; i < 14; i++) report(t + .05 + i / 18, .8, 1.1); for (let i = 0; i < 4; i++) cannon(t + .1 + i * .16, .3, .8); },
  strafeUS(t) { engine(t, 1.6, {f:90, gain:.12, lp:900, ramp:1.25}); for (let i = 0; i < 24; i++) report(t + .05 + i / 26, .9, .8); },
  strafeUK(t) { engine(t, 1.6, {f:100, gain:.12, lp:1000, ramp:1.3}); for (let i = 0; i < 6; i++) cannon(t + .05 + i * .12, .3, .9); for (let i = 0; i < 14; i++) report(t + .05 + i / 20, .6, 1.2); },
  strafeSU(t) { engine(t, 1.6, {f:98, gain:.12, lp:900, ramp:1.3}); for (let i = 0; i < 5; i++) cannon(t + .05 + i * .14, .3, .8); for (let i = 0; i < 10; i++) report(t + .05 + i / 16, .8, 1); },
  stuka(t) { engine(t, 2.2, {f:85, gain:.1, lp:800, ramp:1.5});
    tone(t + .2, {f:420, f1:980, dur:2, gain:.16, type:'sawtooth', vib:18, vibF:9}); tone(t + .2, {f:630, f1:1460, dur:2, gain:.07, type:'square', vib:25, vibF:9});   // Jericho trumpet
    whistle(t + 1.6, .7, 1500, 600); explosion(t + 2.3, 1.4); },
  bombs(t) { engine(t, 1.8, {f:70, gain:.13, lp:700, ramp:1.3}); whistle(t + .6, 1, 1700, 500); explosion(t + 1.6, 1.3); explosion(t + 1.8, 1); },
  rp3(t) { engine(t, 1.4, {f:95, gain:.1, lp:900, ramp:1.3}); for (let i = 0; i < 4; i++) whoosh(t + .5 + i * .12, .5, 500, 2500, .4); for (let i = 0; i < 4; i++) explosion(t + 1 + i * .14, .7); },
  molotov(t) {                                                   // a bottle smashing on steel, then the petrol going up with a whoomp, and crackling
    for (let i = 0; i < 6; i++) noiseHit(t + i * .018 + Math.random() * .01, {dur:.05 + Math.random() * .06, hp:3500 + Math.random() * 3000, gain:.35});
    tone(t + .01, {f:3200, f1:2400, dur:.12, gain:.05, type:'triangle'});
    whoosh(t + .06, .7, 180, 900, .7); thump(t + .08, {f0:90, f1:40, dur:.35, gain:.55});
    for (let i = 0; i < 10; i++) noiseHit(t + .3 + i * .09 + Math.random() * .05, {dur:.03, hp:1800, gain:.12}); },
  flamer(t) { const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise; const b = c.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = 700;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .1); g.gain.setValueAtTime(.9, t + .9); g.gain.linearRampToValueAtTime(0, t + 1.3);
    s.connect(b); b.connect(g); g.connect(out(1, .3)); s.start(t); s.stop(t + 1.4); for (let i = 0; i < 10; i++) noiseHit(t + .1 + i * .1, {dur:.05, hp:2500, gain:.15}); },   // the roar and crackle of a Flammenwerfer
  bangalore(t) { for (let i = 0; i < 3; i++) report(t + i * .4, .8, .9); explosion(t + 1.4, 1.2); },
  mortar(t) { thump(t, {f0:180, f1:90, dur:.15, gain:.7}); noiseHit(t, {dur:.08, bp:700, gain:.5}); whistle(t + .9, .7, 1400, 700); explosion(t + 1.6, .8); },
  carpet(t) { engine(t, 3.5, {f:55, gain:.2, lp:500, ramp:1.05}); engine(t, 3.5, {f:62, gain:.12, lp:500, ramp:1.04}); for (let i = 0; i < 18; i++) explosion(t + .9 + i * .08, .9); },
  barrage(t) { for (let i = 0; i < 6; i++) whistle(t + i * .12, .8, 2000 - i * 80, 600); for (let i = 0; i < 14; i++) explosion(t + .9 + i * .11, 1); },
  naval(t) { cannon(t, 1.8, .9); cannon(t + .35, 1.8, .9); whistle(t + 1, 1, 1500, 600); explosion(t + 2, 1.2); explosion(t + 2.3, 1); },
};
/* ---------- the recorded versions: real rifles, MGs, tank guns and artillery, built from the library ----------
   Each returns false when its recordings are missing (offline, file://), and the modelled recipe above plays instead. */
function rifles(t, n, span, rate = 1, pool = ['enfield-shot', 'mauser-shot']) { for (let i = 0; i < n; i++) samp(pickOf(pool), t + Math.random() * span, {len:.9, gain:.55, rate:rate * (.9 + Math.random() * .2)}); }
function blast(t, size = 1) {                        // a shell landing: recorded detonation, scaled by calibre
  if (AU.quiet) return;
  const big = size >= 1.1;
  samp(pickOf(big ? ['explosion-1', 'explosion-debris'] : ['explosion-2', 'explosion-debris']), t, {gain:.75 * Math.min(1.3, size), rate:(big ? .85 : 1.05) + Math.random() * .15, len:big ? 4 : 2.2});
}
function gunRec(t, kind, rate = 1) {
  const pool = {small:['artillery-shot', 'field-gun'], mid:['tank-fire', 'tank-shots', 'cannon-2'], big:['cannon-shot', 'cannon-2', 'tank-shots']}[kind];
  samp(pickOf(pool), t, {gain:1, rate:rate * (.94 + Math.random() * .1), len:kind === 'small' ? 1.4 : 2.6});
}
const SW = {
  garand(t) { if (!have('garand-1')) return false; let x = t; for (let i = 0; i < 8; i++) { samp(pickOf(['garand-1', 'garand-2']), x, {len:.8, gain:.75}); x += .22 + Math.random() * .16; } samp('garand-ping', x + .05, {gain:.45, rate:1}); },
  bar(t) { if (!have('thompson-shot')) return false; rifles(t, 2, .5, 1, ['garand-1', 'garand-2']); for (let i = 0; i < 9; i++) samp('thompson-shot', t + .55 + i * .11, {gain:.8, rate:.78 + Math.random() * .05, fade:.03}); },
  bren(t) { if (!have('mg-heavy-burst')) return false; rifles(t, 3, .9); for (let b = 0; b < 3; b++) samp('mg-heavy-burst', t + .3 + b * .62, {len:.5, gain:.75, rate:.9 + Math.random() * .08}); },
  mg34(t) { if (!have('hmg-burst')) return false; rifles(t, 3, .9, .95, ['mauser-shot']); samp('hmg-burst', t + .2, {len:1.4, gain:.8, rate:1.05}); },
  mg42(t) { if (!have('mg-fast')) return false; rifles(t, 2, .6, .95, ['mauser-shot']); samp('mg-fast', t + .1, {gain:.9, rate:1.08}); },
  dt(t) { if (!have('hmg-burst')) return false; rifles(t, 3, .9, .9, ['mauser-shot']); samp('hmg-burst', t + .25, {len:1.1, gain:.75, rate:.9}); },   // the Mauser recording stands in for the Mosin
  ppsh(t) { if (!have('ppsh-burst')) return false; samp('ppsh-burst', t, {gain:.85}); rifles(t + .2, 2, .6, .9, ['mauser-shot']); },
  m2hb(t) { if (!have('cal50')) return false; samp('cal50', t, {gain:.9}); },
  quad50(t) { if (!have('cal50-avenger')) return false; samp('cal50-avenger', t, {gain:.9, len:2.2}); },
  ptrd(t) { if (!have('enfield-shot')) return false; for (const x of AU.quiet ? [t] : [t, t + 1.4]) { samp('enfield-shot', x, {gain:1.1, rate:.62}); if (!AU.quiet) samp('bullet-impact', x + .12, {gain:.4, rate:.8}); } },
  flak20(t) { if (!have('flak-shot')) return false; for (let i = 0; i < 12; i++) samp('flak-shot', t + i * .135, {gain:.8, rate:.9 + Math.random() * .2, fade:.04}); },
  bofors(t) { if (!have('artillery-shot')) return false; for (let i = 0; i < 6; i++) samp('artillery-shot', t + i * .5, {gain:.8, rate:1.25 + Math.random() * .1}); },
  gun37(t) { if (!have('artillery-shot')) return false; gunRec(t, 'small', 1.3); if (!AU.quiet) gunRec(t + .9, 'small', 1.3); blast(t + .3, .5); blast(t + 1.2, .5); },
  gun50(t) { if (!have('artillery-shot')) return false; gunRec(t, 'small', 1.12); blast(t + .28, .6); },
  gun75(t) { if (!have('tank-fire')) return false; gunRec(t, 'mid', 1.05); blast(t + .3, .8); },
  gun75hv(t) { if (!have('tank-fire')) return false; gunRec(t, 'mid', 1.12); blast(t + .2, .85); },
  gun76(t) { if (!have('tank-fire')) return false; gunRec(t, 'mid', 1.02); blast(t + .28, .8); },
  gun85(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', 1.05); blast(t + .24, 1); },
  gun88(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', 1.08); blast(t + .18, 1.1); },
  gun90(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', 1.02); blast(t + .2, 1.05); },
  gun17pdr(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', 1.12); blast(t + .16, 1.05); },
  gun122(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', .86); blast(t + .26, 1.3); },
  howitzer(t) { if (!have('field-gun', 'incoming-1')) return false;
    if (have('sexton-fire') && Math.random() < .5) samp('sexton-fire', t, {off:.2, len:3, gain:.65, norm:false, fade:.6}); else { samp('field-gun', t, {gain:.9, rate:.85}); gunRec(t + .02, 'big', .78); }
    if (!AU.quiet) samp(pickOf(['incoming-1', 'incoming-4']), t + .9, {gain:.5, rate:.95}); blast(t + 2.4, 1.3); },
  mortar(t) { if (!have('incoming-4')) return false; thump(t, {f0:180, f1:90, dur:.15, gain:.7}); noiseHit(t, {dur:.08, bp:700, gain:.5}); if (!AU.quiet) samp(pickOf(['incoming-1', 'incoming-4']), t + .5, {gain:.4, rate:1.15}); blast(t + 1.9, .9); },
  naval(t) { if (!have('cannon-shot')) return false; gunRec(t, 'big', .7); if (!AU.quiet) { gunRec(t + .35, 'big', .72); samp('incoming-4', t + 1, {gain:.5, rate:.8}); } blast(t + 2.2, 1.4); blast(t + 2.5, 1.2); },
  barrage(t) { if (!have('incoming-artillery')) return false; samp('incoming-artillery', t, {gain:.9, len:4.6}); for (let i = 0; i < 6; i++) blast(t + 1 + i * .32 + Math.random() * .15, 1.2); },
  bombs(t) { if (!have('explosion-1')) return false; engine(t, 1.8, {f:70, gain:.13, lp:700, ramp:1.3}); whistle(t + .6, 1, 1700, 500); blast(t + 1.6, 1.4); blast(t + 1.85, 1.2); },
  carpet(t) { if (!have('explosion-1')) return false; engine(t, 3.5, {f:55, gain:.2, lp:500, ramp:1.05}); engine(t, 3.5, {f:62, gain:.12, lp:500, ramp:1.04}); for (let i = 0; i < 12; i++) blast(t + .9 + i * .14 + Math.random() * .08, 1.2); },
  flamer(t) { if (!have('flamethrower')) return false; samp('flamethrower', t, {take:1, len:1.4, gain:.9}); },
  bangalore(t) { if (!have('explosion-debris')) return false; rifles(t, 3, 1); blast(t + 1.4, 1.3); },
  rocketAT(t) { if (!have('explosion-2')) return false; noiseHit(t, {dur:.15, lp:1200, gain:.6}); whoosh(t, .45, 400, 1800, .5); blast(t + .45, .8); },
  strafeGer(t) { if (!have('mg-fast')) return false; engine(t, 1.6, {f:95, gain:.12, lp:900, ramp:1.25}); samp('mg-fast', t + .05, {gain:.8, rate:1.1, len:1.2}); },
  strafeUS(t) { if (!have('cal50')) return false; WEAPON.strafeUS(t); samp('cal50', t + .05, {gain:.8, len:1.3}); },
  strafeUK(t) { if (!have('hmg-burst')) return false; WEAPON.strafeUK(t); samp('hmg-burst', t + .1, {gain:.6, rate:1.15, len:1}); },
  strafeSU(t) { if (!have('hmg-burst')) return false; WEAPON.strafeSU(t); samp('hmg-burst', t + .1, {gain:.6, rate:.95, len:1}); },
};
for (const k of ['nebel', 'katyusha', 'calliope', 'mattress', 'rp3']) {           // rockets and dive-bombers keep their modelled launch; the detonations are recorded
  const n = {nebel:6, katyusha:8, calliope:7, mattress:7, rp3:4, stuka:1}[k], at = {nebel:2.2, katyusha:1.7, calliope:1.5, mattress:1.6, rp3:1, stuka:2.3}[k];
  SW[k] = t => { if (!have('explosion-2')) return false; launchOnly(k, t); for (let i = 0; i < n; i++) blast(t + at + i * .18 + Math.random() * .1, k === 'stuka' ? 1.5 : 1); };
}
/* ---------- aircraft, ships and the sea: recorded engines (Freesound CC0, Wikimedia Commons; see CREDITS.md) ---------- */
/* what each aircraft sounds like: the engine it really had */
const ENGINE_INLINE = new Set(['spitfire', 'hurricane', 'hurricanet', 'bf109', 'bf109e', 'bf109f', 'p51', 'p40', 'p40us', 'kittyhawk', 'mc202', 'yak3', 'typhoon', 'il2', 'ju87', 'ju87t', 'barracuda', 'battle', 'judy', 'd520']);
const ENGINE_BOMBER = new Set(['sm79', 'sb2', 'leo451', 'boston', 'b25', 'he111', 'ju88', 'g3m', 'b17', 'lancaster']);
function engineKind(d) { const s = d && d.shape; return s === 'swordfish' ? 'biplane' : ENGINE_INLINE.has(s) ? 'inline' : ENGINE_BOMBER.has(s) ? 'bomber' : 'radial'; }
const AIR_REC = {inline:['mustang-pass', [6, 12], [45, 52]], radial:['radial-flyby', [2.5, 8.5]], biplane:['biplane-flyby', [1.5, 6.5]], bomber:['b25-flyover', [3, 28]]};   // [file, the stretches where she passes overhead]
function airEngine(kind, t, len = 2.8, gain = .5) {
  const a = AIR_REC[kind] || AIR_REC.radial; if (!have(a[0])) return false;
  const r = a[1 + Math.floor(Math.random() * (a.length - 1))];
  const lift = {radial:1.7, biplane:1.6, bomber:1.9}[kind] || 1;      // level-matched: the Mustang recording is the loudest of the four
  samp(a[0], t, {off:r[0] + Math.random() * Math.max(0, r[1] - r[0] - len), len, gain:gain * lift, fadeIn:.45, fade:.8}); return true;
}
/* an aircraft passing: when it moves, and as it comes in to attack */
function airPass(d, gain = .5, delay = 0) { if (!SET.sound) return; auInit(); if (!AU.ctx) return; if (!airEngine(engineKind(d), AU.ctx.currentTime + .02 + delay, 2.8, gain)) sfx('move_air', delay); }
/* a ship under way: big ships the throb of the engine room under the rush of the wake; boats and submarines a diesel */
function shipMove(d) {
  if (!SET.sound) return; auInit(); if (!AU.ctx) return; const t = AU.ctx.currentTime + .02;
  const big = ['bb', 'cv', 'dd', 'esc', 'merch'].includes(d.role);
  if (big && have('ship-wake')) { samp('ship-engine-room', t, {off:'rand', len:2.8, gain:.32, lp:700, fadeIn:.5, fade:.9}); samp('ship-wake', t, {off:'rand', len:2.8, gain:.5, fadeIn:.6, fade:.9}); if (have('ship-horn') && Math.random() < .15) samp('ship-horn', t + .3, {off:10.1, len:3, gain:.25, lp:1400, fade:1}); }
  else if (!big && have('boat-diesel')) { samp('boat-diesel', t, {off:'rand', len:2.4, gain:.62, lp:d.role === 'sub' ? 500 : 3000, fadeIn:.3, fade:.7}); if (d.role !== 'sub') samp('boat-passing', t, {off:'rand', len:2.4, gain:.3, fadeIn:.4, fade:.7}); }
  else sfx('move_ship');
}
Object.assign(SW, {
  stuka(t) { if (!have('stuka-dive')) return false;           // only the Ju 87 carried the "Jericho trumpet": sirens on the undercarriage legs, wailing louder as she dived
    samp('stuka-dive', t, {off:2 + Math.random() * 12, len:2.4, gain:.6, fadeIn:.5, fade:.3}); whistle(t + 1.8, .6, 1500, 600); blast(t + 2.4, 1.5); },
  divebomb(t) { if (!have('plane-spin-dive')) return false;   // Vals, Dauntlesses, Helldivers, Judys: no siren, the scream of engine and airframe in the dive
    samp('plane-spin-dive', t, {off:15 + Math.random() * 25, len:2.4, gain:.55, fadeIn:.4, fade:.3}); whistle(t + 1.8, .6, 1500, 600); blast(t + 2.4, 1.4); },
  bombs(t) { if (!have('explosion-1')) return false; whistle(t + .6, 1, 1700, 500); blast(t + 1.6, 1.4); blast(t + 1.85, 1.2); },   // the engines come from airPass
  naval(t) { if (!have('naval-5in')) return false;            // destroyer and escort guns: a real 5-inch naval gun
    samp('naval-5in', t, {off:Math.random() * 12, len:1.6, gain:.7}); if (!AU.quiet) { samp('naval-5in', t + .45, {off:Math.random() * 12, len:1.4, gain:.45}); samp('incoming-4', t + 1, {gain:.45, rate:.85}); } blast(t + 2.2, 1.3); },
  bigguns(t) { if (!have('artillery-real')) return false;     // a battleship's main battery: the turrets one after another, a sound you feel
    for (let i = 0; i < 3; i++) { samp('artillery-real', t + i * .22, {rate:.6 + Math.random() * .06, gain:.6, len:3}); if (have('cannon-shot')) samp('cannon-shot', t + i * .22, {rate:.52, gain:.35, len:3}); }
    if (!AU.quiet) samp('incoming-4', t + 1.2, {gain:.5, rate:.7}); blast(t + 2.6, 1.6); blast(t + 2.8, 1.5); },
  torpedo(t) { if (!have('torpedo-run')) return false;         // a submarine: the hiss of compressed air, then the run
    noiseHit(t, {dur:.35, bp:400, gain:.5}); samp('torpedo-run', t + .3, {gain:.55, rate:.9});
    if (!AU.quiet) { samp('underwater-explosion', t + 2.4, {gain:.8, len:4}); samp('water-column', t + 2.5, {gain:.55, len:2.8}); } },
  torpedoRun(t) { if (!have('torpedo-run')) return false;     // a torpedo bomber: the engines come from airPass; the drop, the splash, the run
    samp('splash-big', t + .9, {gain:.35, len:1.5}); samp('torpedo-run', t + 1.1, {gain:.45});
    if (!AU.quiet) { samp('underwater-explosion', t + 2.6, {gain:.8, len:4}); samp('water-column', t + 2.7, {gain:.55, len:2.8}); } },
  depth(t) { if (!have('depth-charge')) return false;         // ASDIC pinging, then the pattern going off deep
    samp('sonar-ping', t, {gain:.3, len:2}); if (!AU.quiet) samp('depth-charge', t + 1.4, {gain:.9, len:3.5}); },
  strafeGer(t) { if (!have('mg-fast')) return false; samp('mg-fast', t + .05, {gain:.8, rate:1.1, len:1.2}); },
  strafeUS(t) { if (!have('cal50')) return false; samp('cal50', t + .05, {gain:.8, len:1.3}); },
  strafeUK(t) { if (!have('hmg-burst')) return false; samp('hmg-burst', t + .1, {gain:.6, rate:1.15, len:1}); if (have('flak-shot')) for (let i = 0; i < 6; i++) samp('flak-shot', t + .05 + i * .12, {gain:.4, rate:1.3, fade:.03}); },
  strafeSU(t) { if (!have('hmg-burst')) return false; samp('hmg-burst', t + .1, {gain:.6, rate:.95, len:1}); if (have('flak-shot')) for (let i = 0; i < 5; i++) samp('flak-shot', t + .05 + i * .14, {gain:.4, rate:1.2, fade:.03}); },
});
WEAPON.divebomb = t => { engine(t, 2.2, {f:85, gain:.1, lp:800, ramp:1.6}); whistle(t + 1.6, .7, 1500, 600); explosion(t + 2.3, 1.4); };   // modelled fallback, no siren
function launchOnly(k, t) {                           // the modelled launch with its synthetic detonations muted
  const real = explosion; explosion = () => {}; try { WEAPON[k](t); } finally { explosion = real; }
}
/* what the target sounds like when it is hit: rounds whining off armour, the clang of a shot that fails to penetrate */
function impactSound(ad, dd, delay = 0) {
  if (!SET.sound || !AU.ctx || !dd || !have('ricochet-1')) return;
  const cls = fxClass(ad), armour = dd.mt === 'tread' || dd.sea, t = AU.ctx.currentTime + .02 + delay;
  if (!armour) return;
  if (['smallarms', 'flak', 'strafe', 'atrifle'].includes(cls)) { const n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) samp(pickOf(['ricochet-1', 'ricochet-2', 'ricochet-metal', 'ricochet-3']), t + i * (.12 + Math.random() * .25), {gain:.42, rate:.9 + Math.random() * .25, len:1.2}); }
  else if (cls === 'cannon' || cls === 'rocketAT') samp(pickOf(['ricochet-metal', 'bullet-impact']), t, {gain:.55, rate:.62 + Math.random() * .1, len:1.2});
}
/* ---------- babble: every character who speaks mumbles in his own voice ----------
   Not words, but the shape of speech: the vowels of the line pick the formants, consonants add clicks and hiss,
   the pitch falls through a sentence and lifts at a question. Each voice is drawn from the speaker's name, so
   Rommel always sounds like Rommel. */
const VOWEL_F = {a:[730, 1090], e:[530, 1840], i:[300, 2200], o:[570, 840], u:[440, 1020], y:[300, 2000]};
const VOWEL_MAP = {'а':'a', 'я':'a', 'е':'e', 'э':'e', 'ё':'o', 'и':'i', 'ы':'y', 'о':'o', 'у':'u', 'ю':'u', 'ä':'e', 'ö':'o', 'ü':'u', 'é':'e', 'è':'e', 'ê':'e', 'à':'a', 'â':'a', 'ô':'o', 'û':'u', 'î':'i'};
function voiceOf(id, zed) {
  if (zed) return {f0:58, rate:4.5, form:.78, gruff:1, breath:.9};
  let h = 2166136261; for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const r = n => ((h >>> n) & 255) / 255;
  return {f0:84 + r(0) * 60, rate:8 + r(8) * 5, form:.9 + r(16) * .2, gruff:r(24) * .9, breath:.12 + r(4) * .3};
}
function babble(id, text, o = {}) {
  if (!SET.sound) return null; auInit(); if (!AU.ctx) return null;
  const v = voiceOf(id, o.zed), c = AU.ctx, t0 = c.currentTime + .04, maxDur = o.max || 3.4;
  // syllables: a consonant run and a vowel group; spaces and punctuation become pauses
  const units = []; let cons = '';
  for (const raw of text.toLowerCase()) {
    const ch = VOWEL_MAP[raw] || raw;
    if (VOWEL_F[ch]) { const last = units[units.length - 1]; if (last && last.v && !cons) continue; units.push({v:ch, c:cons}); cons = ''; }
    else if (/[a-zа-яß]/i.test(ch)) cons += ch;
    else if (/[.!?…]/.test(ch)) units.push({pause:.24, end:ch}); else if (/[,;:—–-]/.test(ch)) units.push({pause:.14}); else if (ch === ' ') units.push({pause:.035});
  }
  const ask = /\?\s*$/.test(text), shout = /!/.test(text), step = 1 / v.rate;
  const bus = c.createGain(); bus.gain.value = (o.gain || .7) * (shout ? 1.25 : 1); bus.connect(out(1, .12));
  const osc = c.createOscillator(); osc.type = 'sawtooth';
  const env = c.createGain(); env.gain.value = 0;
  const f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(), lp = c.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.Q.value = 6; f2.Q.value = 9; lp.type = 'lowpass'; lp.frequency.value = 3200;
  const f2g = c.createGain(); f2g.gain.value = .55;
  osc.connect(env); env.connect(f1); env.connect(f2); f2.connect(f2g); f1.connect(lp); f2g.connect(lp); lp.connect(bus);
  let sub; if (v.gruff > .45) { sub = c.createOscillator(); sub.type = 'square'; const sg = c.createGain(); sg.gain.value = .06 * v.gruff; sub.connect(sg); sg.connect(env); }   // a rasp under the voice
  const syls = units.filter(u => u.v).length || 1;
  let t = t0, n = 0, base = v.f0 * (shout ? 1.14 : 1) * (o.pitch || 1);
  for (const u of units) {
    if (t - t0 > maxDur) break;
    if (u.pause) { t += u.pause * (o.quick ? .5 : 1); continue; }
    const k = n++ / syls, dur = step * (.7 + Math.random() * .5) * (u.c.length > 2 ? 1.2 : 1);
    let f = base * (1 - .16 * k) * (1 + (Math.random() - .5) * .14); if (ask && k > .75) f *= 1 + (k - .75) * 1.6;
    const [a, b] = VOWEL_F[u.v], nasal = /[mn]$/.test(u.c);
    osc.frequency.setTargetAtTime(f, t, .02); if (sub) sub.frequency.setTargetAtTime(f / 2, t, .02);
    f1.frequency.setTargetAtTime(a * v.form * (nasal ? .7 : 1), t, .025); f2.frequency.setTargetAtTime(b * v.form, t, .025);
    if (/[ptkbdgcq]/.test(u.c)) noiseHit(t, {dur:.014, bp:2600 + Math.random() * 1400, q:2, gain:.012, dest:bus});   // plosive
    if (/(s|z|f|sh|ch|x|ß|v|th)/.test(u.c)) noiseHit(t, {dur:.045, hp:4200, gain:.008, dest:bus});                   // fricative
    const on = t + (u.c ? .02 : 0);
    env.gain.setValueAtTime(0, on); env.gain.linearRampToValueAtTime(1, on + .018); env.gain.setValueAtTime(1, on + dur * .65); env.gain.linearRampToValueAtTime(0, on + dur);
    if (v.breath > .2) noiseHit(on, {dur:dur * .8, bp:a * 1.5, q:1.5, gain:.008 * v.breath, attack:.02, dest:bus});
    t = on + dur + .01;
  }
  osc.start(t0); osc.stop(t + .1); if (sub) { sub.start(t0); sub.stop(t + .1); }
  const dur = t - t0;
  return {dur, stop() { try { bus.gain.setTargetAtTime(0, c.currentTime, .03); osc.stop(c.currentTime + .1); if (sub) sub.stop(c.currentTime + .1); } catch (e) {} }};
}
/* shell shock: a near miss on the beach. The world goes muffled and far away under a high ringing, the picture
   drains of colour and shakes, a heartbeat; then the noise of the battle comes flooding back */
function shellShock(secs = 3.6) {
  if (FAST) return;
  document.body.classList.add('shock'); shakeCam(16); setTimeout(() => shakeCam(10), 600); setTimeout(() => document.body.classList.remove('shock'), secs * 1000);
  if (!SET.sound) return; auInit(); if (!AU.ctx) return;
  const c = AU.ctx, now = c.currentTime;
  sfx('boom'); sfx('mg42', .25); sfx('scream', .6);
  AU.lp.frequency.cancelScheduledValues(now); AU.lp.frequency.setValueAtTime(22000, now); AU.lp.frequency.setTargetAtTime(280, now + .08, .06); AU.lp.frequency.setTargetAtTime(22000, now + secs - .8, .7);
  const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 3150; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.045 * SET.vol, now + .15); g.gain.setTargetAtTime(0, now + secs - 1.2, .8);   // the ringing, outside the muffling
  o.connect(g); g.connect(AU.out || AU.master); o.start(now); o.stop(now + secs + 2);
  for (let i = 0; i < 4; i++) { thump(now + .5 + i * .85, {f0:60, f1:38, dur:.18, gain:.9}); thump(now + .72 + i * .85, {f0:55, f1:35, dur:.14, gain:.6}); }   // a heartbeat
  if (typeof musicDuck === 'function') { musicDuck(true); setTimeout(() => musicDuck(false), secs * 1000); }
}
/* right now, from an animation callback: a ricochet, the clang of a shot on armour, a turret landing */
function sfxNow(kind) {
  if (!SET.sound || !AU.ctx) return; const t = AU.ctx.currentTime + .01;
  if (kind === 'rico') samp(pickOf(['ricochet-1', 'ricochet-2', 'ricochet-metal', 'ricochet-3']), t, {gain:.34, rate:.85 + Math.random() * .35, len:1.1});
  else if (kind === 'clang') samp(pickOf(['ricochet-metal', 'bullet-impact']), t, {gain:.5, rate:.6 + Math.random() * .12, len:1.2});
  else if (kind === 'splash') samp('splash-big', t, {gain:.42, rate:.8 + Math.random() * .3, len:2.2});                   // a torpedo or a bomb going into the sea
  else if (kind === 'torpedo') { samp('underwater-explosion', t, {gain:.85, rate:.88 + Math.random() * .12, len:4}); samp('water-column', t + .12, {gain:.55, rate:.9, len:2.8}); }   // the warhead under the hull, then the water coming down
  else if (kind === 'depthcharge') samp('depth-charge', t, {gain:.9, len:3.5});                                    // the pattern going off under her
  else if (kind === 'torprun') samp('torpedo-run', t, {gain:.45});
  else if (kind === 'sinking') { tone(t, {f:64, f1:33, dur:3.4, gain:.05, type:'sawtooth', attack:.7}); tone(t + .9, {f:47, f1:29, dur:2.6, gain:.04, type:'sawtooth', attack:.5}); samp('underwater-explosion', t + .35, {gain:.42, rate:.55, len:3.6}); }   // the hull groaning as she goes, a boiler bursting under water
  else if (kind === 'thud') { thump(t, {f0:70, f1:30, dur:.5, gain:.9}); noiseHit(t, {dur:.3, lp:600, gain:.6}); noiseHit(t, {dur:.15, bp:1800, q:3, gain:.2}); }
}
/* how a vehicle dies, chosen per vehicle so that a troop of three never goes up the same way */
function deathKind(d) {
  if (!d || d.foot || d.air || d.sea) return null;
  const r = Math.random();
  return d.mt === 'tread' && !d.fixed ? (r < .4 ? 'knockout' : r < .72 ? 'brewup' : 'cookoff') : (r < .55 ? 'knockout' : 'brewup');
}
function killSound(d, delay = 0, kind) { if (!d || d.foot) return; sfx(kind || deathKind(d) || 'boom', delay); }
/* a voice from the library: wounded men, the dying. Falls back to the modelled voice. */
function cryOut(t, kind) {
  const pool = kind === 'die' ? ['death-1', 'death-2', 'death-3', 'death-4', 'death-5', 'screams', 'screams', 'pain-mix'] : ['pain-grunts', 'pain-mix', 'pain-grunt', 'death-4'];
  const n = pickOf(pool); if (!n) return false;
  samp(n, t, {gain:kind === 'die' ? .85 : .72, rate:.9 + Math.random() * .2, len:kind === 'die' ? 2.4 : 1.4, wet:.3}); return true;
}
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
  scream(t) { if (cryOut(t, 'die')) return; const v = Math.random(); voice(t,v < .5 ? {f0:380 + Math.random() * 120, f1:180, dur:.9 + Math.random() * .5, vowel:[850, 1250]} : {f0:300, f1:150, dur:.6, vowel:[650, 1100], vib:14}); },
  cry(t) { if (cryOut(t, 'hurt')) return; voice(t,{f0:260 + Math.random() * 60, f1:140, dur:.45, vowel:[550, 950], gain:.16, vib:5}); voice(t + .5, {f0:240, f1:130, dur:.5, vowel:[500, 900], gain:.12, vib:4}); },
  shout(t) { for (let i = 0; i < 2; i++) voice(t + i * .22, {f0:210 + Math.random() * 50, f1:190, dur:.18, vowel:i ? [700, 1150] : [500, 1500], gain:.14, vib:2, breath:.5}); },
  click(t) { noiseHit(t, {dur:.025, hp:3000, gain:.25}); thump(t, {f0:900, f1:500, dur:.03, gain:.12}); },
  select(t) { noiseHit(t, {dur:.03, hp:2500, gain:.3}); noiseHit(t + .06, {dur:.03, hp:2000, gain:.25}); },   // bolt working
  cancel(t) { noiseHit(t, {dur:.06, bp:600, gain:.3}); },
  capture(t) { for (let i = 0; i < 3; i++) noiseHit(t + i * .12, {dur:.05, bp:1500, q:3, gain:.3}); thump(t + .4, {f0:200, f1:80, dur:.2, gain:.4}); },
  build(t) { for (let i = 0; i < 4; i++) noiseHit(t + i * .09, {dur:.04, bp:2500, q:4, gain:.25}); thump(t, {f0:120, f1:60, dur:.3, gain:.4}); },
  power(t) { explosion(t, .6); for (let i = 0; i < 5; i++) noiseHit(t + .05 + i * .07, {dur:.05, hp:1500, gain:.3}); },
  turn(t) { noiseHit(t, {dur:.4, bp:300, q:1, gain:.2, attack:.1}); },
  move_tread(t) { if (have('tank-move')) { samp(pickOf(['tank-move', 'tracks', 'tank-engine']), t, {off:'rand', len:2.4, gain:.5, fade:.5, fadeIn:.25}); return; } engine(t, .9, {f:34, gain:.2, lp:260, clank:1}); },
  move_tire(t) { if (have('truck-hum')) { const j = Math.random() < .5 && have('jeep'); samp(j ? 'jeep' : 'truck-hum', t, {off:j ? Math.random() * 26 : 'rand', len:2, gain:.4, fade:.5, fadeIn:.25}); return; } engine(t, .9, {f:48, gain:.13, lp:500}); },
  move_foot(t) {                                    // a squad on the move: boots on gravel, out of step, and the rattle of kit
    if (have('boots-gravel')) { for (let m = 0; m < 3; m++) for (let i = 0; i < 4; i++) samp('boots-gravel', t + m * .17 + i * (.32 + Math.random() * .05), {gain:.38, rate:.85 + Math.random() * .3, len:.35, fade:.05});
      for (let i = 0; i < 5; i++) noiseHit(t + Math.random() * 1.3, {dur:.04, bp:3200, q:4, gain:.05}); return; }
    for (let i = 0; i < 6; i++) noiseHit(t + i * .14, {dur:.05, bp:500, q:1, gain:.25}); },
  move_air(t) { engine(t, 1, {f:92, gain:.1, lp:1000, ramp:1.15}); },
  move_ship(t) { engine(t, 1, {f:30, gain:.12, lp:200}); noiseHit(t, {dur:1, bp:700, q:.5, gain:.12, attack:.3}); if (have('ship-horn') && Math.random() < .3) samp('ship-horn', t + .3, {off:10.1, len:3, gain:.3, lp:1400, fade:1}); },
  hit(t) { if (have('explosion-2')) return blast(t, .6); explosion(t, .5); },
  boom(t) { if (have('explosion-1')) return blast(t, 1.3); explosion(t, 1.2); },
  /* three ways a tank dies: knocked out (the shot goes in, the crew bale out), brewed up (fire takes hold), cooked off (the ammunition goes up and the turret with it) */
  knockout(t) { samp(pickOf(['ricochet-metal', 'bullet-impact']), t, {gain:.6, rate:.6}); if (have('explosion-2')) blast(t + .08, .7); else explosion(t, .6); },
  brewup(t) { if (have('explosion-debris')) { blast(t, 1.1); samp('flamethrower', t + .5, {take:0, len:2.2, gain:.45, rate:.7, fade:1}); } else explosion(t, 1.1);
    for (let i = 0; i < 8; i++) noiseHit(t + .6 + Math.random() * 2, {dur:.02, hp:1800, gain:.12}); },
  cookoff(t) { if (have('explosion-1')) { blast(t, 1.3); samp('explosion-debris', t + .25, {gain:.55, rate:.8}); } else explosion(t, 1.6);
    for (let i = 0; i < 14; i++) { const x = t + .5 + Math.random() * 2.4; report(x, .6 + Math.random() * .6, .7 + Math.random() * .6); if (Math.random() < .3) thump(x, {f0:140, f1:50, dur:.2, gain:.5}); } },   // rounds cooking off inside the hull
  bodyfall(t) { thump(t, {f0:110, f1:60, dur:.12, gain:.35}); noiseHit(t, {dur:.12, lp:900, gain:.3}); noiseHit(t + .05, {dur:.05, bp:2600, q:3, gain:.08}); },
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
  if (WEAPON[name] && typeof AMB !== 'undefined') AMB.heat = Math.min(1, AMB.heat + .12);    // the soundscape follows the fighting
  try { if (SW[name] && SW[name](t) !== false) return; } catch (e) {}
  const f = WEAPON[name] || UI_SND[name]; if (f) try { f(t); } catch (e) {}
}
/* ---------- sound that follows the picture ----------
   The animations call these at the moment things happen on screen: shot() at each muzzle flash (only the firing:
   detonations and incoming whistles are muted), incomingTo() for the whistle of a falling shell timed to its
   landing, boomAt() when the shell lands, launch() for each rocket leaving its rail. */
function shot(name, o = {}) {
  if (!SET.sound) return; auInit(); if (!AU.ctx) return;
  AU.quiet = true; AU.scale = o.gain || 1; AU.until = o.max ? AU.ctx.currentTime + .02 + (o.delay || 0) + o.max : 0;
  try { sfx(name, o.delay || 0); } finally { AU.quiet = false; AU.scale = 1; AU.until = 0; }
}
function boomAt(size = 1, o = {}) {
  if (!SET.sound || !AU.ctx) return; const t = AU.ctx.currentTime + .005;
  AU.scale = o.gain || 1;
  try { if (o.water && have('water-column')) { samp(pickOf(['water-column', 'water-explosion']), t, {gain:.7 * Math.min(1.3, size), rate:.85 + Math.random() * .2, len:3}); thump(t, {f0:60, f1:28, dur:.5, gain:.5}); }
    else if (o.water) { noiseHit(t, {dur:.9, bp:900, q:.6, gain:.6}); thump(t, {f0:70, f1:30, dur:.5, gain:.6}); } else if (have('explosion-2')) blast(t, size); else explosion(t, size); } finally { AU.scale = 1; }
}
function incomingTo(secs, o = {}) {                     // the shell's whistle, falling in pitch, ending as it lands
  if (!SET.sound || !AU.ctx || secs < .25) return; const t = AU.ctx.currentTime + .01;
  tone(t, {f:o.f0 || 1900, f1:o.f1 || 620, dur:secs, gain:(o.gain || 1) * .08, type:'sine', attack:Math.min(.3, secs * .4)});
}
function launch(o = {}) {                               // one rocket leaving its rail
  if (!SET.sound || !AU.ctx) return; const t = AU.ctx.currentTime + .005; AU.scale = o.gain || 1;
  try { noiseHit(t, {dur:.12, lp:1400, gain:.5}); whoosh(t, .55, 300, 2400, .32); } finally { AU.scale = 1; }
}
function moveSound(u) {
  if (NATION[u.d.nat] && NATION[u.d.nat].zed) return sfx(u.role === 'cav' ? 'claw' : 'shamble');
  const mt = u.d.mt;
  if (mt === 'air') return airPass(u.d, .5);
  if (mt === 'ship' || mt === 'lander' || u.d.sea) return shipMove(u.d);
  sfx(mt === 'tread' || mt === 'amphib' ? 'move_tread' : mt === 'tire' ? 'move_tire' : 'move_foot');
}

