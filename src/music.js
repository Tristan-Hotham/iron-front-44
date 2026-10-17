/* ============================== MUSIC & SOUNDSCAPE ========================
   Music: real recordings only, in playlists per army and per moment. Each
   side keeps its place in its own piece, so turns hand over with a crossfade
   instead of restarting the music. The Jukebox lets the player hear and
   exclude any track.
   Soundscape: a continuous ambient bed that follows the camera and the
   mission clock: surf, wind, rain, birdsong by day, crickets on summer
   nights, fires crackling, and the distant war. */
const MUSIC = {els:[], cur:0, mood:null, list:[], idx:{}, pos:{}, playing:null, tracks:[
  {file:'nimrod.m4a', title:'Enigma Variations: Nimrod', by:'Elgar · Hallé Orchestra, John Barbirolli', lic:'Public domain', mood:['title', 'brief', 'uk']},
  {file:'enigma-finale.m4a', title:'Enigma Variations: Finale "E.D.U."', by:'Elgar · Hallé Orchestra, John Barbirolli', lic:'Public domain', mood:['uk', 'victory']},
  {file:'pomp-circumstance.m4a', title:'Pomp and Circumstance March No. 1', by:'Elgar · "The President\'s Own" US Marine Band', lic:'Public domain', mood:['uk', 'victory']},
  {file:'duet-musette.m4a', title:'Duet Musette', by:'Kevin MacLeod (incompetech.com)', lic:'CC BY 3.0', mood:['brief', 'campaign', 'fr']},
  {file:'gymnopedie.m4a', title:'Gymnopédie No. 1', by:'Satie · Teknopazzo', lic:'CC0', mood:['campaign', 'title', 'night']},
  {file:'gymnopedie-3.m4a', title:'Gymnopédie No. 3', by:'Satie · Teknopazzo', lic:'CC0', mood:['campaign', 'title', 'night']},
  {file:'clair-de-lune.m4a', title:'Suite bergamasque: Clair de lune', by:'Debussy', lic:'Public domain', mood:['brief', 'night', 'fr', 'title']},
  {file:'marseillaise.m4a', title:'La Marseillaise', by:'Rouget de Lisle · Georges Thill, Musique de la Garde Républicaine', lic:'Public domain', mood:['fr', 'victory']},
  {file:'mars.m4a', title:'The Planets: Mars, the Bringer of War', by:'Holst · United States Air Force Band', lic:'Public domain', mood:['us', 'uk', 'su', 'ger', 'fr']},
  {file:'first-suite-march.m4a', title:'First Suite in E-flat: March', by:'Holst · "The President\'s Own" US Marine Band', lic:'Public domain', mood:['uk', 'us']},
  {file:'first-suite-chaconne.m4a', title:'First Suite in E-flat: Chaconne', by:'Holst · "The President\'s Own" US Marine Band', lic:'Public domain', mood:['uk', 'us', 'brief']},
  {file:'semper-fidelis.m4a', title:'Semper Fidelis', by:'Sousa · US Marine Band', lic:'Public domain', mood:['us']},
  {file:'stars-and-stripes.m4a', title:'The Stars and Stripes Forever', by:'Sousa · US Marine Band', lic:'Public domain', mood:['us', 'victory']},
  {file:'liberty-bell.m4a', title:'The Liberty Bell', by:'Sousa · US Marine Band', lic:'Public domain', mood:['us']},
  {file:'valkyries.m4a', title:'Die Walküre: Ride of the Valkyries', by:'Wagner', lic:'Public domain', mood:['ger']},
  {file:'radetzky.m4a', title:'Radetzky March', by:'Johann Strauss I · US Marine Band', lic:'Public domain', mood:['ger']},
  {file:'siegfried-funeral.m4a', title:'Götterdämmerung: Siegfried\'s Funeral March (excerpt)', by:'Wagner · United States Marine Corps Band', lic:'Public domain', mood:['ger', 'defeat']},
  {file:'prince-igor-march.m4a', title:'Prince Igor: March', by:'Borodin · Staatskapelle Berlin, Leo Blech', lic:'Public domain', mood:['su']},
  {file:'bydlo.m4a', title:'Pictures at an Exhibition: Bydło', by:'Mussorgsky', lic:'Public domain', mood:['su', 'night']},
  {file:'great-gate-kiev.m4a', title:'Pictures at an Exhibition: The Great Gate of Kiev', by:'Mussorgsky · Bernd Krueger', lic:'CC BY-SA 2.0 DE', mood:['su', 'victory']},
  {file:'polonaise-militaire.m4a', title:'Polonaise in A major, Op. 40 No. 1 "Military"', by:'Chopin · Josef Hofmann (Brunswick, 1923)', lic:'Public domain', mood:['pl', 'victory']},
  {file:'polonaise-heroic.m4a', title:'Polonaise in A-flat major, Op. 53 "Heroic"', by:'Chopin · Eugen d\'Albert (1905)', lic:'Public domain', mood:['pl', 'brief']},
  {file:'mazurek-dabrowskiego.m4a', title:'Mazurek Dąbrowskiego', by:'Polish anthem · Orkiestra Polskiego Radia (1939)', lic:'Public domain', mood:['pl']},
  {file:'gunkan-march.m4a', title:'Gunkan kōshinkyoku (Warship March)', by:'Setoguchi Tōkichi · Imperial Japanese Navy Band (1941)', lic:'Public domain', mood:['jp']},
  {file:'battotai.m4a', title:'Battōtai (The Drawn-Sword Corps)', by:'Charles Leroux · Imperial Japanese Army Band (1938)', lic:'Public domain', mood:['jp']},
  {file:'yuki-no-shingun.m4a', title:'Yuki no Shingun (March in the Snow)', by:'Nagai Kenshi · Toyama Army School Band (1937)', lic:'Public domain', mood:['jp']},
  {file:'umi-yukaba.m4a', title:'Umi Yukaba', by:'Nobutoki Kiyoshi (1937)', lic:'Public domain', mood:['jp', 'defeat']},
  {file:'march-of-the-volunteers.m4a', title:'March of the Volunteers', by:'Nie Er · Pathé Records chorus, Shanghai (1935)', lic:'Public domain', mood:['cn']},
  {file:'roc-flag-anthem.m4a', title:'National Flag Anthem of the Republic of China', by:'Huang Tzu · instrumental', lic:'Public domain', mood:['cn', 'victory']},
  {file:'erquan-yingyue.m4a', title:'Erquan Yingyue (The Moon Over Second Spring)', by:'Abing · erhu, recorded by David290 (Wikimedia Commons)', lic:'CC BY-SA 4.0', mood:['cn', 'night']},
  {file:'marcia-reale.m4a', title:'Marcia Reale d\'Ordinanza', by:'Giuseppe Gabetti · royal anthem of the Kingdom of Italy, early recording', lic:'Public domain', mood:['it']},
  // the second batch: period recordings where they exist, and quiet pieces for briefings and night turns
  {file:'koniggratzer-1939.m4a', title:'Königgrätzer Marsch', by:'Piefke · German military band (1939)', lic:'Public domain', mood:['ger', 'victory']},
  {file:'alte-kameraden.m4a', title:'Alte Kameraden', by:'Carl Teike · Santurwar (Wikimedia Commons)', lic:'CC BY-SA 4.0', mood:['ger']},
  {file:'erika.m4a', title:'Erika', by:'Herms Niel · German Army choir (1930s)', lic:'Public domain', mood:['ger']},
  {file:'anchors-aweigh-1929.m4a', title:'Anchors Aweigh', by:'Charles A. Zimmermann · 1929 recording', lic:'Public domain', mood:['us']},
  {file:'over-there-1917.m4a', title:'Over There', by:'George M. Cohan · 1917 recording', lic:'Public domain', mood:['us', 'victory']},
  {file:'washington-post.m4a', title:'The Washington Post', by:'Sousa · US Air Force Band of the Rockies', lic:'Public domain', mood:['us']},
  {file:'taps.m4a', title:'Taps', by:'US Air Force Heritage of America Band', lic:'Public domain', mood:['defeat', 'us']},
  {file:'colonel-bogey.m4a', title:'Colonel Bogey March', by:'Kenneth Alford', lic:'Public domain', mood:['uk']},
  {file:'tipperary-1914.m4a', title:'It\'s a Long Way to Tipperary', by:'Billy Murray and the American Quartet (1914)', lic:'Public domain', mood:['uk', 'campaign']},
  {file:'heart-of-oak.m4a', title:'Heart of Oak', by:'William Boyce · Cecilian Male Quartet (1915)', lic:'Public domain', mood:['uk']},
  {file:'british-grenadiers.m4a', title:'The British Grenadiers', by:'Traditional · US Army Strings', lic:'Public domain', mood:['uk']},
  {file:'last-post.m4a', title:'The Last Post', by:'Bugle call', lic:'Public domain', mood:['defeat', 'uk']},
  {file:'sacred-war.m4a', title:'The Sacred War', by:'Alexandrov · Red Army Ensemble (1941)', lic:'Public domain', mood:['su']},
  {file:'soviet-anthem-1944.m4a', title:'Anthem of the Soviet Union', by:'Alexandrov · 1944 recording', lic:'Public domain', mood:['su', 'victory']},
  {file:'zhit-stalo-luchshe.m4a', title:'Zhit stalo luchshe (Life Has Become Better)', by:'Red Army Ensemble, conducted by Alexander Alexandrov', lic:'Public domain', mood:['su']},
  {file:'swan-lake-scene.m4a', title:'Swan Lake: Scène', by:'Tchaikovsky · 1933 recording', lic:'Public domain', mood:['su', 'night', 'brief']},
  {file:'chant-du-depart.m4a', title:'Le Chant du Départ', by:'Méhul · Georges Thill, Musique de la Garde Républicaine', lic:'Public domain', mood:['fr', 'victory']},
  {file:'sambre-et-meuse.m4a', title:'Le Régiment de Sambre et Meuse', by:'Planquette · 1905 recording', lic:'Public domain', mood:['fr']},
  {file:'warszawianka-1909.m4a', title:'Warszawianka', by:'Jan Stern (1909)', lic:'Public domain', mood:['pl']},
  {file:'rota.m4a', title:'Rota', by:'Nowowiejski · male voices (1924)', lic:'Public domain', mood:['pl']},
  {file:'chopin-funeral-march.m4a', title:'Piano Sonata No. 2: Funeral March', by:'Chopin · Jmfayard (Wikimedia Commons)', lic:'CC BY-SA 3.0', mood:['defeat', 'pl']},
  {file:'chopin-mazurka-50-2.m4a', title:'Mazurka in A-flat major, Op. 50 No. 2', by:'Chopin · Christoph Zbinden', lic:'CC BY 4.0', mood:['pl', 'brief']},
  {file:'kimigayo-1930.m4a', title:'Kimigayo', by:'Toyama Army School Military Band (1930)', lic:'Public domain', mood:['jp']},
  {file:'yu-da-bajiao.m4a', title:'Yu Da Bajiao (Rain on the Banana Leaves)', by:'Cantonese folk tune · Zhang Peijian, erhu; recorded by David290', lic:'CC BY-SA 4.0', mood:['cn', 'brief']},
  {file:'william-tell-1914.m4a', title:'William Tell Overture: Finale', by:'Rossini · Sodero\'s Band (1914)', lic:'Public domain', mood:['it', 'victory', 'title']},
  {file:'aida-trumpets.m4a', title:'Aida: Triumphal March', by:'Verdi · "The President\'s Own" US Marine Band', lic:'Public domain', mood:['it', 'victory']},
  {file:'chopin-nocturne-9-2.m4a', title:'Nocturne in E-flat major, Op. 9 No. 2', by:'Chopin · Peter Johnston', lic:'CC0', mood:['night', 'brief']},
  {file:'gnossienne-3.m4a', title:'Gnossienne No. 3', by:'Satie · La Pianista', lic:'Public domain', mood:['night', 'campaign']},
  {file:'gnossienne-2.m4a', title:'Gnossienne No. 2', by:'Satie · La Pianista', lic:'Public domain', mood:['night', 'title']},
]};
const SFX_CREDITS = [
  ['Sexton artillery firing / moving', 'LouiseBrown1981, Wikimedia Commons', 'CC BY-SA 3.0'],
  ['Spitfire fly past at RAF Halton', 'LouiseBrown1981, Wikimedia Commons', 'CC BY-SA 3.0'],
  ['Rolls-Royce Merlin 66', 'Peter Ellis, Wikimedia Commons', 'CC BY-SA 3.0'],
];
/* the soundtrack is mono Opus in MP4 (.m4a), small enough to ship with the game; a browser too old to play it gets silence, not errors */
const OPUS_OK = (() => { try { return new Audio().canPlayType('audio/mp4; codecs="opus"') !== ''; } catch (e) { return false; } })();
const musicOff = t => (SET.muted || []).includes(t.file) || !OPUS_OK;
function musicEl(i) {
  if (!MUSIC.els[i]) { const el = new Audio(); el.preload = 'auto'; el.addEventListener('ended', () => { if (MUSIC.els[MUSIC.cur] === el) { MUSIC.pos[MUSIC.mood] = 0; playNext(); } }); MUSIC.els[i] = el; }
  return MUSIC.els[i];
}
function fadeTo(el, vol, ms, then) {
  const v0 = el.volume, t0 = performance.now();
  const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); el.volume = clamp(v0 + (vol - v0) * k, 0, 1); if (k < 1) setTimeout(step, 40); else if (then) then(); };
  step();
}
const musicVol = () => .45 * SET.vol * (SET.musicVol ?? 1);
/* switch to a mood (army, title, night...), resuming that mood's piece where it left off */
const MOOD_ALIAS = {ger40:'ger', uk40:'uk', su41:'su', usp:'us', fr40:'fr', be:'fr'};   // armies without their own recordings borrow a fitting mood
function musicMood(mood, force) {
  mood = MOOD_ALIAS[mood] || mood;
  if (MUSIC.mood === mood && !force) return;
  const old = MUSIC.els[MUSIC.cur];
  if (old && MUSIC.mood && MUSIC.playing) { MUSIC.pos[MUSIC.mood] = {file:MUSIC.playing.file, t:old.currentTime}; }
  MUSIC.mood = mood;
  const list = MUSIC.tracks.filter(t => t.mood.includes(mood) && !musicOff(t));
  MUSIC.list = list.length ? list : MUSIC.tracks.filter(t => !musicOff(t));
  if (MUSIC.idx[mood] == null) MUSIC.idx[mood] = Math.random() * MUSIC.list.length | 0;
  const saved = MUSIC.pos[mood];
  if (saved && saved.file && MUSIC.list.some(t => t.file === saved.file)) playTrack(MUSIC.list.find(t => t.file === saved.file), saved.t);
  else playNext();
}
function playNext() {
  if (!MUSIC.list.length) return;
  const i = MUSIC.idx[MUSIC.mood] = ((MUSIC.idx[MUSIC.mood] ?? -1) + 1) % MUSIC.list.length;
  playTrack(MUSIC.list[i], 0);
}
function playTrack(t, at = 0) {
  MUSIC.playing = t;
  if (!SET.music) { MUSIC.els.forEach(e => e && e.pause()); return; }
  const old = MUSIC.els[MUSIC.cur]; MUSIC.cur = 1 - MUSIC.cur;
  const el = musicEl(MUSIC.cur);
  if (old && !old.paused) fadeTo(old, 0, 1200, () => old.pause());
  el.src = 'music/' + t.file; el.volume = 0;
  const go = () => { try { if (at) el.currentTime = at; } catch (e) {} el.play().then(() => fadeTo(el, musicVol(), 1400)).catch(() => {}); };
  if (at) el.addEventListener('loadedmetadata', go, {once:true}); else go();
  const np = document.getElementById('nowplaying'); if (np) { np.textContent = `♪ ${t.title} — ${t.by}`; np.classList.add('show'); setTimeout(() => np.classList.remove('show'), 5000); }
  if (document.body.dataset.screen === 'jukebox') renderJukebox();
}
function musicToggle() { const el = MUSIC.els[MUSIC.cur]; if (!SET.music) MUSIC.els.forEach(e => e && e.pause()); else if (MUSIC.playing && el && el.src) { el.volume = musicVol(); el.play().catch(() => {}); } else if (MUSIC.mood) musicMood(MUSIC.mood, true); }

/* ---------- soundscape ---------- */
const AMB = {on:false, nodes:{}, next:{}, timer:null, loops:{}, heat:0};
function ambLoop(name, level, now) {                    // a recorded bed, looping, faded to the level the scene calls for
  let L = AMB.loops[name];
  if (!L) { if (!level || !AU.samples[name]) return; const c = AU.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = AU.samples[name]; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(AMB.bed); s.start(now, Math.random() * s.buffer.duration); L = AMB.loops[name] = {s, g, pk:(AU.takes[name] || [{pk:1}])[0].pk}; }
  L.g.gain.setTargetAtTime(level * Math.min(3, .5 / L.pk), now, 2);
}
function ambStart() {
  if (AMB.on || !AU.ctx) return; AMB.on = true;
  const c = AU.ctx, bed = c.createGain(); bed.gain.value = 0; bed.connect(AU.master); AMB.bed = bed;
  const loop = (filt, freq, q) => { const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; const f = c.createBiquadFilter(); f.type = filt; f.frequency.value = freq; f.Q.value = q || .7; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(bed); s.start(); return {g, f}; };
  AMB.nodes.wind = loop('bandpass', 420, .5);
  AMB.nodes.surf = loop('lowpass', 520);
  AMB.nodes.rain = loop('highpass', 2400);
  AMB.nodes.rumble = loop('lowpass', 90);
  // slow swells for wind and surf
  for (const [k, hz, depth] of [['wind', .07, .5], ['surf', .11, .8]]) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = hz; lg.gain.value = depth; l.connect(lg); lg.connect(AMB.nodes[k].g.gain); l.start(); AMB.nodes[k].lfo = lg; }
  AMB.timer = setInterval(ambTick, 250);
}
function ambState() {
  if (!G || document.body.dataset.screen !== 'game') return null;
  const cx = Math.floor((cam.x + innerWidth / cam.z / 2) / ART), cy = Math.floor((cam.y + innerHeight / cam.z / 2) / ART), r = Math.ceil(innerWidth / cam.z / ART / 2);
  const n = {sea:0, wood:0, open:0, urban:0, all:0};
  for (let y = cy - r; y <= cy + r; y += 2) for (let x = cx - r; x <= cx + r; x += 2) { if (!inside(x, y)) continue; const t = terr(x, y); n.all++;
    if (t === 'sea' || t === 'beach' || t === 'obst' || t === 'shingle') n.sea++; else if (t === 'forest' || t === 'bocage') n.wood++; else if (['ruins', 'block', 'city', 'hq', 'fact'].includes(t)) n.urban++; else n.open++; }
  for (const k of ['sea', 'wood', 'open', 'urban']) n[k] = n.all ? n[k] / n.all : 0;
  const h = hourAt(), night = isNight(), winter = G.theme === 'winter', w = G.weather;
  return {n, night, dawn:h >= 4.5 && h < 8, winter, rain:w === 'rain', snow:w === 'snow' || winter, battle:G.units.length > 0, wrecks:(G.wrecks || []).filter(x => G.day - x.day < 2).length};
}
function ambTick() {
  const s = ambState(), c = AU.ctx; if (!c) return;
  const now = c.currentTime, set = (k, v) => AMB.nodes[k].g.gain.setTargetAtTime(v, now, 1.2);
  const on = SET.sound && (SET.amb ?? .8) > 0 && s;
  AMB.bed.gain.setTargetAtTime(on ? .55 * (SET.amb ?? .8) : 0, now, .8);
  if (!on) return;
  set('wind', .05 + (s.snow ? .16 : 0) + s.n.open * .05 + (s.night ? .03 : 0));
  set('surf', s.n.sea * .5);
  set('rain', s.rain ? .22 : 0);
  set('rumble', .05 + (s.battle ? .05 : 0));
  AMB.nodes.surf.f.frequency.setTargetAtTime(400 + Math.sin(now * .3) * 150, now, 1);
  const due = k => { if (!AMB.next[k] || now > AMB.next[k]) return true; return false; };
  // birdsong in daylight, fields and woods, not in snow or rain
  if (!s.night && !s.snow && !s.rain && s.n.wood + s.n.open > .3 && due('bird')) { AMB.next.bird = now + 1.5 + Math.random() * (s.dawn ? 2 : 6); birdCall(now + Math.random() * .3); }
  // crickets on warm nights
  if (s.night && !s.snow && due('cricket')) { AMB.next.cricket = now + .35 + Math.random() * .3; for (let i = 0; i < 3; i++) tone(now + i * .045, {f:4300 + Math.random() * 200, dur:.03, gain:.012, type:'sine', dest:AMB.bed}); }
  // fire crackle in ruins or around fresh wrecks
  if ((s.n.urban > .3 || s.wrecks) && due('fire')) { AMB.next.fire = now + .08 + Math.random() * .25; noiseHit(now, {dur:.015 + Math.random() * .02, hp:1800, gain:.05 + Math.random() * .05, dest:AMB.bed}); }
  // recorded beds: the low roar of a battlefield, desert wind on the arid maps
  const arid = ['desert', 'tunisia'].includes(G.theme);
  ambLoop('amb-battlefield', s.battle ? .1 + .25 * AMB.heat : 0, now);
  ambLoop('amb-desert-wind', arid && !s.rain ? .5 : 0, now);
  AMB.heat = Math.max(0, AMB.heat - .004);
  // the distant war, recorded: rifle and MG fire across the valley, a barrage on the next ridge, bombers working over a town; busier as the fighting heats up
  if (s.battle && due('far') && have('amb-ww2-gunfire')) { AMB.next.far = now + (2.5 + Math.random() * 8) * (1 - .55 * AMB.heat) * (s.night ? 1.6 : 1);
    const r = Math.random(), far = 600 + Math.random() * 900, o = {dest:AMB.bed, lp:far, wet:0, rate:.85 + Math.random() * .2};
    if (r < .3) samp('amb-ww2-gunfire', now, {...o, gain:.55, len:5, lp:far * 2});
    else if (r < .5) samp('amb-gunfire', now, {...o, gain:.35, len:3});
    else if (r < .7) samp(pickOf(['amb-distant-explosions', 'explosion-distant', 'explosion-muffled']), now, {...o, gain:.6, len:5, lp:400 + Math.random() * 300});
    else if (r < .82) samp('amb-war-loop', now, {...o, gain:.4, len:4});
    else if (r < .92) samp('amb-bombing', now, {...o, gain:.55, off:'rand', len:7, fade:2, fadeIn:1.5, lp:300});
    else samp(pickOf(['screams', 'pain-grunts']), now, {...o, gain:.18, lp:900, len:2});   // somewhere out there, a man calling for help
    return; }
  // the distant war, modelled (when the recordings are not available): guns rumbling beyond the horizon, now and then a far-off MG burst
  if (s.battle && due('far')) { AMB.next.far = now + 3 + Math.random() * 9;
    const kind = Math.random();
    if (kind < .65) { for (let i = 0; i < 1 + (Math.random() * 3 | 0); i++) { const t = now + i * (.3 + Math.random() * .8); noiseHit(t, {dur:1.8, lp:140, gain:.18, attack:.05, dest:AMB.bed}); thump(t, {f0:60, f1:25, dur:1.2, gain:.12, dest:AMB.bed}); } }
    else { const rate = Math.random() < .5 ? 20 : 9; for (let i = 0; i < 8 + (Math.random() * 10 | 0); i++) noiseHit(now + i / rate, {dur:.05, bp:700, q:1.5, gain:.03, dest:AMB.bed}); } }
}
function birdCall(t) {                                  // a blackbird-ish phrase of rising and falling whistles
  const base = 1800 + Math.random() * 1600, n = 2 + (Math.random() * 4 | 0);
  for (let i = 0; i < n; i++) { const f = base * (1 + (Math.random() - .5) * .4); tone(t + i * .11, {f, f1:f * (Math.random() < .5 ? 1.25 : .8), dur:.08 + Math.random() * .06, gain:.018, type:'sine', dest:AMB.bed}); }
}

/* ---------- jukebox ---------- */
const JUKE_GROUPS = [['us', 'United States'], ['uk', 'Britain'], ['fr', 'Free France'], ['su', 'Soviet Union'], ['ger', 'Germany'], ['title', 'Menus and briefings'], ['night', 'Night'], ['victory', 'Victory']];
function renderJukebox() {
  const el = $('#jukelist'); if (!el) return; el.innerHTML = '';
  for (const t of MUSIC.tracks) {
    const row = document.createElement('div'); row.className = 'jtrack' + (MUSIC.playing === t ? ' now' : '');
    const groups = JUKE_GROUPS.filter(([k]) => t.mood.includes(k)).map(([, n]) => n).join(', ');
    row.innerHTML = `<button class="play" title="Play">${MUSIC.playing === t ? '■' : '▶'}</button><span><b>${t.title}</b><small>${t.by} · ${t.lic}</small><small class="grp">${groups}</small></span><label class="ck"><input type="checkbox" ${musicOff(t) ? '' : 'checked'}> In rotation</label>`;
    row.querySelector('.play').onclick = () => { auInit(); if (MUSIC.playing === t) { MUSIC.els.forEach(e => e && e.pause()); MUSIC.playing = null; renderJukebox(); } else { SET.music = true; playTrack(t, 0); } };
    row.querySelector('input').onchange = e => { const m = new Set(SET.muted || []); if (e.target.checked) m.delete(t.file); else m.add(t.file); SET.muted = [...m]; saveSet(); };
    el.append(row);
  }
}
