/* ============================== EFFECTS ===================================
   A particle system in world space (explosions, fire, smoke, debris, dust,
   tracers, shells, rockets, splashes), weather and atmosphere in screen
   space, and the general power cinematics. Everything here is cosmetic. */
const FX = {parts:[], shake:0, lights:[], flyers:[]};
const T2W = (tx, ty) => [tx * ART + ART / 2, ty * ART + ART / 2];
const rnd = (a, b) => a + Math.random() * (b - a);

function part(o) { if (FAST || !SET.fx && o.kind !== 'text') return; o.t0 = performance.now(); o.life = o.life || 800; FX.parts.push(o); if (FX.parts.length > 2500) FX.parts.splice(0, 300); }
function shakeCam(a) { if (!FAST) FX.shake = Math.max(FX.shake, a); }
function lightAt(wx, wy, r, col = '255,200,120', life = 260) { if (!FAST) FX.lights.push({wx, wy, r, col, t0:performance.now(), life}); }

function fxSmoke(wx, wy, n = 6, dark = .5, size = 10, rise = 30) {
  for (let i = 0; i < n; i++) part({kind:'smoke', x:wx + rnd(-8, 8), y:wy + rnd(-6, 6), vx:rnd(-6, 6), vy:-rnd(rise * .5, rise), size:rnd(size * .6, size), grow:rnd(14, 26), life:rnd(1400, 2600), shade:dark});
}
function fxFire(wx, wy, n = 8, size = 8) { for (let i = 0; i < n; i++) part({kind:'fire', x:wx + rnd(-6, 6), y:wy + rnd(-4, 4), vx:rnd(-10, 10), vy:-rnd(20, 60), size:rnd(size * .5, size), life:rnd(300, 700)}); }
function fxDebris(wx, wy, n = 10, col = '#3a3028') { for (let i = 0; i < n; i++) part({kind:'debris', x:wx, y:wy, vx:rnd(-90, 90), vy:-rnd(60, 180), g:420, size:rnd(1.5, 3.5), col, life:rnd(600, 1100)}); }
function fxSparks(wx, wy, n = 10) { for (let i = 0; i < n; i++) part({kind:'spark', x:wx, y:wy, vx:rnd(-160, 160), vy:-rnd(30, 180), g:300, life:rnd(250, 500)}); }
function fxDust(wx, wy, n = 4, col = '160,140,100') { for (let i = 0; i < n; i++) part({kind:'dust', x:wx + rnd(-10, 10), y:wy + rnd(-4, 6), vx:rnd(-12, 12), vy:-rnd(4, 14), size:rnd(5, 9), grow:10, life:rnd(600, 1000), col}); }
function fxSplash(wx, wy, big = 1) { for (let i = 0; i < 14 * big; i++) part({kind:'water', x:wx + rnd(-6, 6), y:wy, vx:rnd(-40, 40) * big, vy:-rnd(80, 220) * big, g:420, size:rnd(1.5, 3), life:rnd(500, 900)}); part({kind:'ring', x:wx, y:wy, size:4, grow:50 * big, life:700, col:'230,240,245'}); }
/* ---------- casualties (Settings → Gore: off / standard / graphic) ---------- */
const goreLevel = () => ({off:0, standard:1, graphic:2})[SET.gore || 'standard'] ?? 1;
function fxBlood(wx, wy, n = 8) {
  const g = goreLevel(); if (!g) return;
  for (let i = 0; i < n * g; i++) part({kind:'blood', x:wx + rnd(-4, 4), y:wy + rnd(-6, 2), vx:rnd(-70, 70), vy:-rnd(20, 120), g:480, size:rnd(1.5, 3.2), life:rnd(500, 900)});
}
/* the fallen stay where they fell: a figure on its back in its own uniform, and a stain in the earth */
function stampFallen(tx, ty, nat, n = 2, quiet) {
  const g = goreLevel(); if (!terrainCanvas || !g || ['sea', 'river'].includes(terr(tx, ty))) return;
  const tg = terrainCanvas.getContext('2d');
  for (let i = 0; i < n; i++) {
    const px = tx * ART + 12 + Math.random() * 40, py = ty * ART + 18 + Math.random() * 36, ang = (Math.random() - .5) * 1.4 + (Math.random() < .5 ? Math.PI / 2 : -Math.PI / 2);
    tg.save(); tg.globalAlpha = .55 + .2 * g; tg.fillStyle = '#4a0c08'; tg.beginPath(); tg.ellipse(px + 2, py + 4, 7 + Math.random() * 5 * g, 3 + Math.random() * 2 * g, Math.random(), 0, 7); tg.fill(); tg.restore();
    const c = mkCanvas(ART, ART), P = painter(c.getContext('2d')); soldier(P, 11, 7, nat, Math.random() < .5 ? 'rifle' : null, 0);
    tg.save(); tg.translate(px, py); tg.rotate(ang); tg.globalAlpha = .9; tg.filter = 'brightness(.8) saturate(.7)'; tg.drawImage(c, -ART / 2, -ART / 2); tg.restore();
    if (Math.random() < .6) { tg.fillStyle = '#5a6152'; tg.beginPath(); tg.ellipse(px + rnd(-14, 14), py + rnd(-10, 10), 3, 2, 0, 0, 7); tg.fill(); }   // a dropped helmet
  }
  if (!quiet) { G.fallen = G.fallen || []; G.fallen.push({x:tx, y:ty, nat, n}); if (G.fallen.length > 150) G.fallen.shift(); }
}
function fxText(tx, ty, text, col = '#ffde6a', life = 1300) { const [x, y] = T2W(tx, ty); part({kind:'text', x, y:y - 20, vx:0, vy:-26, text, col, life}); }
/* barks: what the men shout, in their own language */
const BARKS = {
  ger:{sel:['Jawohl!', 'Zu Befehl!', 'Los, los!', 'Weiter!'], veh:['Panzer marsch!', 'Motor läuft!', 'Jawohl!'], atk:['Feuer frei!', 'Feuer!', 'Ziel erkannt!'], kill:['Volltreffer!', 'Erledigt!', 'Abschuss!'], hurt:['Sanitäter!', 'Deckung!', 'Rückzug!']},
  us: {sel:['Yes sir!', 'On our way!', 'Move out!', 'Roger!'], veh:['Rolling!', 'Buttoning up!', 'Roger that!'], atk:['Fire!', 'Give \'em hell!', 'On the way!'], kill:['Got him!', 'Scratch one!', 'He\'s done!'], hurt:['Medic!', 'We\'re hit!', 'Get down!']},
  uk: {sel:['Sir!', 'Right-o!', 'Moving up!', 'Very good, sir!'], veh:['Driver, advance!', 'Tally-ho!', 'Off we go!'], atk:['Fire!', 'Let \'em have it!', 'Engage!'], kill:['Brewed up!', 'Good shooting!', 'He\'s burning!'], hurt:['Stretcher-bearer!', 'Bale out!', 'Take cover!']},
  su: {sel:['Есть!', 'Вперёд!', 'Так точно!'], veh:['Вперёд!', 'Полный ход!', 'Есть!'], atk:['Огонь!', 'За Родину!', 'Ура!'], kill:['Готов!', 'Горит!', 'Попал!'], hurt:['Санитар!', 'Ложись!', 'Горим!']},
  fr: {sel:['Oui, mon général!', 'En avant!', 'À vos ordres!'], veh:['En avant!', 'Roulez!'], atk:['Feu!', 'Tirez!', 'Pour la France!'], kill:['Touché!', 'Détruit!', 'Bien joué!'], hurt:['Infirmier!', 'À couvert!', 'Repli!']},
};
function barkText(nat, kind, foot) {
  const B = BARKS[nat] || BARKS[natBase(nat)] || BARKS.us, list = (kind === 'sel' || kind === 'move' || kind === 'atk' && !B.atk) && !foot && B.veh ? B.veh : B[kind] || B.sel;
  return list ? list[Math.floor(Math.random() * list.length)] : null;
}
function fxBark(u, kind, o = {}) {
  if (FAST || !SET.fx || !u || !G.teams[u.team]) return;
  const nat = G.teams[u.team].nat, B = BARKS[nat] || BARKS[natBase(nat)] || BARKS.us, list = (kind === 'sel' || kind === 'move') && !u.d.foot && B.veh ? B.veh : B[kind] || B.sel; if (!list) return;
  if (!seen(u)) return;
  FX.parts = FX.parts.filter(p => !(p.kind === 'bark' && p.uid === u.id));
  const [x, y] = T2W(u.x, u.y), text = list[Math.floor(Math.random() * list.length)]; part({kind:'bark', uid:u.id, x, y:y - 40, vx:0, vy:-4, text, life:1500, flip:u.team === 2});
  if (Math.random() < .75) babble(nat + (u.id % 6), text, {gain:o.quiet ? .25 : .5, max:1.3, quick:true, zed:nat === 'zed', pitch:u.d.foot ? 1.05 : .95});   // the man himself, mumbling it
}
function fxMuzzle(wx, wy, dir = 1, size = 1) {
  part({kind:'flash', x:wx, y:wy, size:9 * size, life:110, dir}); lightAt(wx, wy, 60 * size, '255,220,150', 160);
  fxSmoke(wx + dir * 6, wy, 2, .35, 6 * size, 10);
}
function fxExplosion(tx, ty, size = 1, opts = {}) {
  if (FAST) return;
  const [wx, wy] = typeof opts.wx === 'number' ? [opts.wx, opts.wy] : T2W(tx, ty);
  const water = inside(tx, ty) && ['sea', 'river'].includes(terr(tx, ty));
  part({kind:'flash', x:wx, y:wy, size:22 * size, life:180}); lightAt(wx, wy, 140 * size, '255,190,110', 420);
  if (water) { fxSplash(wx, wy, size); fxSmoke(wx, wy, 3, .2, 10 * size, 20); }
  else {
    fxFire(wx, wy, 10 * size, 10 * size); fxSmoke(wx, wy - 6, 6 * size, .65, 14 * size, 34); fxDebris(wx, wy, 12 * size); fxSparks(wx, wy, 6 * size);
    part({kind:'ring', x:wx, y:wy + 4, size:6, grow:70 * size, life:500, col:'200,180,140'});
    if (opts.crater !== false && inside(tx, ty) && !['road', 'bridge', 'city', 'hq', 'fact', 'air', 'port', 'block'].includes(terr(tx, ty))) stampCrater(wx + rnd(-10, 10), wy + rnd(-6, 10), Math.min(1.4, .6 + size * .4));
  }
  shakeCam(5 * size);
}
/* a projectile from one tile to another; resolves on impact */
function fxProjectile(from, to, kind = 'shell', dur = 350) {
  if (FAST || !SET.fx) return Promise.resolve();
  const [ax, ay] = T2W(from.x, from.y), [bx, by] = T2W(to.x, to.y);
  return new Promise(res => {
    const p = {kind:'proj', style:kind, ax, ay:ay - 10, bx, by:by - 6, life:dur, arc:kind === 'arc' || kind === 'rocketArc' ? Math.max(60, Math.hypot(bx - ax, by - ay) * .45) : 0, done:res};
    part(p); setTimeout(() => { if (p.done) { p.done = null; res(); } }, dur + 60);   // never stall if the page is not drawing
  });
}
function fxTracers(from, to, n = 6, col = '255,230,140', spread = 10, dur = 600) {
  if (FAST || !SET.fx) return;
  const [ax, ay] = T2W(from.x, from.y), [bx, by] = T2W(to.x, to.y);
  for (let i = 0; i < n; i++) setTimeout(() => {
    part({kind:'tracer', ax:ax + rnd(-4, 4), ay:ay - 10 + rnd(-3, 3), bx:bx + rnd(-spread, spread), by:by - 6 + rnd(-spread, spread) * .6, life:160, col});
    if (i % 2 === 0) fxDust(bx + rnd(-spread, spread), by + rnd(-4, 8), 1);
  }, i * dur / n);
}

/* what each unit's weapon looks like on the map */
function fxClass(d) {
  if (NATION[d.nat] && NATION[d.nat].zed) return d.role === 'mortar' ? 'bile' : 'maul';
  if (d.role === 'eng') return d.snd === 'flamer' ? 'flamer' : 'charge';
  if (d.role === 'at') return d.snd === 'ptrd' ? 'atrifle' : 'rocketAT';
  if (d.role === 'cav') return 'smallarms';
  if (d.role === 'sub' || d.role === 'esc' || d.role === 'bb') return 'naval';
  if (d.role === 'cv' || d.role === 'tb') return 'bombs';
  if (d.role === 'mortar') return 'mortar';
  if (['inf', 'apc', 'nest'].includes(d.role) || (d.role === 'recon' && natBase(d.nat) === 'su')) return 'smallarms';
  if (d.role === 'art') return 'artillery';
  if (d.role === 'rkt') return 'salvo';
  if (d.role === 'aa') return 'flak';
  if (d.role === 'ftr') return 'strafe';
  if (d.role === 'bmr') return ['ju87', 'val', 'sbd'].includes(d.shape) ? 'dive' : (d.shape === 'typhoon' || d.shape === 'il2') ? 'rockets' : 'bombs';
  if (d.role === 'dd') return 'naval';
  return 'cannon';
}
/* the attack on the map, with its sound tied to the picture: the report with the muzzle flash, the whistle in flight, the bang on impact.
   o.quiet: the battle scene has already played the sound of this attack */
async function fxAttackMap(u, t, killed, o = {}) {
  if (FAST || !SET.fx) return;
  const k = fxClass(u.d), [ax, ay] = T2W(u.x, u.y), dir = t.x >= u.x ? 1 : -1, big = u.role === 'htank' || u.role === 'pak' ? 1.4 : u.role === 'tank' || u.role === 'mtank' ? 1.1 : .8;
  const S = !o.quiet, snd = u.d.snd, armour = t.d.mt === 'tread' || t.d.sea;
  const fire = () => { if (S) shot(snd); }, bang = (s, n = 0) => { if (S && n < 4) boomAt(s, {gain:n ? .6 : 1}); }, whistleFor = (ms, at = 100) => { if (S) setTimeout(() => incomingTo((ms - at) / 1000), at); }, clang = () => { if (S && armour) sfxNow('clang'); };
  switch (k) {
    case 'smallarms': fire(); fxMuzzle(ax + dir * 14, ay - 8, dir, .5); fxTracers(u, t, u.role === 'nest' || snd === 'mg42' ? 12 : 7); if (S) impactSound(u.d, t.d, .15); await sleep(500); break;
    case 'flamer': fire(); for (let i = 0; i < 16; i++) setTimeout(() => { const [bx, by] = T2W(t.x, t.y); part({kind:'fire', x:ax + dir * 10, y:ay - 6, vx:(bx - ax) * rnd(1.6, 2.2), vy:(by - ay) * 2 - 20, size:rnd(5, 9), life:450}); }, i * 30); await sleep(500); fxFire(...T2W(t.x, t.y), 14, 10); break;
    case 'charge': await fxProjectile(u, t, 'arc', 450); fxExplosion(t.x, t.y, .8); bang(.8); break;
    case 'rocketAT': fire(); fxSmoke(ax - dir * 14, ay - 8, 4, .25, 10, 8); await fxProjectile(u, t, 'rocket', 300); fxExplosion(t.x, t.y, .7); bang(.7); clang(); break;
    case 'atrifle': fire(); fxMuzzle(ax + dir * 16, ay - 8, dir, .8); await fxProjectile(u, t, 'tracer', 120); fxSparks(...T2W(t.x, t.y), 10); clang(); break;
    case 'cannon': fire(); fxMuzzle(ax + dir * 20, ay - 10, dir, big); fxDust(ax, ay + 10, 4); shakeCam(2 * big); await fxProjectile(u, t, 'tracer', 140); fxExplosion(t.x, t.y, big * .8, {crater:false}); bang(.6 * big); clang(); break;
    case 'artillery': fire(); fxMuzzle(ax + dir * 16, ay - 14, dir, 1.3); fxSmoke(ax, ay - 10, 6, .4, 14, 24); shakeCam(3); whistleFor(650); await fxProjectile(u, t, 'arc', 650); fxExplosion(t.x, t.y, 1.2); bang(1.2); break;
    case 'mortar': fire(); fxMuzzle(ax + dir * 6, ay - 14, dir, .6); whistleFor(700, 200); await fxProjectile(u, t, 'arc', 700); fxExplosion(t.x, t.y, .7); bang(.8); break;
    case 'salvo': for (let i = 0; i < 6; i++) setTimeout(() => { if (S && i < 4) launch({gain:.8}); fxSmoke(ax, ay - 8, 2, .4, 10, 18); fxProjectile(u, {x:t.x + rnd(-.6, .6), y:t.y + rnd(-.6, .6)}, 'rocketArc', 700).then(() => { fxExplosion(t.x, t.y, .7, {wx:T2W(t.x, t.y)[0] + rnd(-20, 20), wy:T2W(t.x, t.y)[1] + rnd(-14, 14)}); bang(.8, i); }); }, i * 110); await sleep(1300); break;
    case 'flak': fire(); for (let i = 0; i < 6; i++) setTimeout(() => { fxMuzzle(ax + dir * 10, ay - 12, dir, .5); const [bx, by] = T2W(t.x, t.y); part({kind:'puff', x:bx + rnd(-16, 16), y:by - 20 + rnd(-12, 12), size:6, grow:14, life:900}); }, i * 90); fxTracers(u, t, 8, '255,200,120', 14); await sleep(650); break;
    case 'strafe': fire(); fxTracers(u, t, 14, '255,230,140', 22, 500); if (S) impactSound(u.d, t.d, .3); await sleep(550); break;
    case 'dive': case 'bombs': fire(); whistleFor(420, 0); await fxProjectile({x:u.x, y:u.y - .4}, t, 'bomb', 420); fxExplosion(t.x, t.y, 1.5); bang(1.5); break;
    case 'rockets': for (let i = 0; i < 4; i++) setTimeout(() => { if (S) launch({gain:.8}); fxProjectile(u, {x:t.x + rnd(-.4, .4), y:t.y + rnd(-.4, .4)}, 'rocket', 260).then(() => { fxExplosion(t.x, t.y, .7, {wx:T2W(t.x, t.y)[0] + rnd(-16, 16), wy:T2W(t.x, t.y)[1] + rnd(-10, 10)}); bang(.8, i); }); }, i * 90); await sleep(700); break;
    case 'maul': { if (S) sfx(snd); const [bx, by] = T2W(t.x, t.y); for (let i = 0; i < 3; i++) setTimeout(() => { fxBlood(bx + rnd(-8, 8), by + rnd(-6, 6), 5); shakeCam(1.5); }, i * 140); await sleep(520); break; }
    case 'bile': { if (S) sfx(snd); await fxProjectile(u, t, 'arc', 650); const [bx, by] = T2W(t.x, t.y); fxDust(bx, by, 14, '130,180,60'); fxSmoke(bx, by - 6, 4, .2, 8, 14); break; }
    case 'naval': fire(); fxMuzzle(ax + dir * 20, ay - 12, dir, 1.6); fxSmoke(ax, ay - 12, 8, .5, 16, 26); shakeCam(4); whistleFor(750); await fxProjectile(u, t, 'arc', 750); fxExplosion(t.x, t.y, 1.5); bang(1.5); break;
  }
  if (t.d.foot) { const [bx, by] = T2W(t.x, t.y); fxBlood(bx, by, killed ? 14 : 7); if (S && (goreLevel() || t.d.nat === 'zed')) sfx(t.d.nat === 'zed' ? (killed ? 'zdie' : 'zhurt') : killed ? 'scream' : 'cry', .1); }
  if (killed) { await sleep(120);
    const [wx, wy] = T2W(t.x, t.y);
    if (t.dk === 'cookoff') {                           // the ammunition goes up: the turret lifts off, then the rounds cook off for seconds
      fxExplosion(t.x, t.y, 1.8, {crater:true}); part({kind:'chunk', x:wx, y:wy - 10, vx:rnd(-50, 50), vy:-rnd(220, 300), g:520, floor:wy + rnd(8, 22), spin:rnd(-9, 9), w:14, h:9, life:2600});
      for (let i = 0; i < 7; i++) setTimeout(() => { fxSparks(wx + rnd(-8, 8), wy - 6, 8); fxFire(wx, wy - 8, 6, 9); if (Math.random() < .4) fxExplosion(t.x, t.y, .45, {crater:false, wx:wx + rnd(-10, 10), wy:wy + rnd(-8, 4)}); }, 350 + i * 330);
      for (let i = 0; i < 10; i++) setTimeout(() => part({kind:'fire', x:wx + rnd(-3, 3), y:wy - 12, vx:rnd(-6, 6), vy:-rnd(90, 160), size:rnd(6, 10), life:600}), 200 + i * 90);   // a jet of flame from the open turret ring
    } else if (t.dk === 'brewup') {                      // burns where it stands, black smoke climbing
      fxExplosion(t.x, t.y, 1.2, {crater:false});
      for (let i = 0; i < 10; i++) setTimeout(() => { fxFire(wx + rnd(-6, 6), wy - 6, 5, 9); fxSmoke(wx, wy - 14, 2, .9, 11, 44); }, 150 + i * 200);
    } else if (t.dk === 'knockout') {                    // the shot goes in, a flash and a puff from the hatches, the crew are out
      fxExplosion(t.x, t.y, .7, {crater:false}); fxSparks(wx, wy - 4, 14);
      for (let i = 0; i < 6; i++) setTimeout(() => fxSmoke(wx + rnd(-4, 4), wy - 12, 1, .6, 7, 30), 300 + i * 260);
    } else fxExplosion(t.x, t.y, t.d.foot ? .5 : 1.4, {crater:!t.d.foot});
    if (t.d.foot) stampFallen(t.x, t.y, t.d.nat, 2 + (Math.random() * 2 | 0)); else if (!t.d.air && !t.d.sea) stampFallen(t.x, t.y, t.d.nat, Math.random() < .5 ? 1 : 0); }
}

/* smoke drifting over a burning sector (G.smoke): grey banks rolling inland on the wind */
setInterval(() => {
  if (FAST || !SET.fx || typeof G === 'undefined' || !G || !G.smoke || document.body.dataset.screen !== 'game') return;
  for (const s of G.smoke) if (G.day <= s.until) for (let i = 0; i < 3; i++) {
    const x = s.x0 + Math.random() * (s.x1 - s.x0 + 1), y = s.y0 + Math.random() * (s.y1 - s.y0 + 1);
    part({kind:'smoke', x:x * ART, y:y * ART, vx:rnd(4, 14), vy:-rnd(4, 12), size:rnd(16, 26), grow:rnd(24, 40), life:rnd(2600, 4200), shade:.25});
  }
}, 300);

/* ---------- drawing (world space) ---------- */
/* burning wrecks: drawn UNDER the units, squashed flat and scorched, and almost invisible when a live unit stands on the tile */
function fxWrecks(ctx) {
  for (const w of G.wrecks || []) {
    const img = getSprite(w.nat, w.role, 0, true, G.theme === 'winter' ? 'w' : ''), [wx, wy] = T2W(w.x, w.y), occupied = !!unitAt(w.x, w.y);
    ctx.save(); ctx.globalAlpha = occupied ? .18 : w.sea ? .3 : .75; ctx.filter = 'brightness(.35) sepia(.4)';
    ctx.translate(w.x * ART + (w.flip ? ART : 0), w.y * ART + ART * .3); ctx.scale(w.flip ? -1 : 1, .7);
    ctx.drawImage(img, 0, 0); ctx.restore();
    if (SET.fx && !occupied && Math.random() < .1 && G.day - w.day < 3) fxSmoke(wx + rnd(-6, 6), wy - 6, 1, .8, 8, 26);
    if (SET.fx && !occupied && Math.random() < .05 && G.day === w.day) fxFire(wx, wy + 6, 1, 6);
  }
}
function fxDraw(ctx, now) {

  const dt = 1 / 60;
  FX.parts = FX.parts.filter(p => now - p.t0 < p.life);
  for (const p of FX.parts) {
    const k = (now - p.t0) / p.life;
    if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; }
    switch (p.kind) {
      case 'smoke': { const s = p.size + p.grow * k, a = (1 - k) * .55, c = Math.round(60 + (1 - p.shade) * 120);
        ctx.fillStyle = `rgba(${c},${c - 4},${c - 10},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); break; }
      case 'dust': { const s = p.size + p.grow * k; ctx.fillStyle = `rgba(${p.col},${(1 - k) * .4})`; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); break; }
      case 'puff': { const s = p.size + p.grow * k; ctx.fillStyle = `rgba(30,28,26,${(1 - k) * .75})`; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); break; }
      case 'fire': { ctx.globalCompositeOperation = 'lighter'; const s = p.size * (1 - k * .6);
        ctx.fillStyle = `rgba(255,${Math.round(200 - 140 * k)},${Math.round(80 - 60 * k)},${1 - k})`; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; break; }
      case 'flash': { ctx.globalCompositeOperation = 'lighter'; const s = p.size * (1 + k);
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s); gr.addColorStop(0, `rgba(255,255,230,${1 - k})`); gr.addColorStop(.4, `rgba(255,200,90,${(1 - k) * .8})`); gr.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; break; }
      case 'spark': ctx.fillStyle = `rgba(255,${Math.round(230 - 100 * k)},120,${1 - k})`; ctx.fillRect(p.x, p.y, 2, 2); break;
      case 'blood': ctx.fillStyle = `rgba(${120 - 40 * k | 0},10,8,${1 - k * .4})`; ctx.fillRect(p.x, p.y, p.size, p.size); if (k > .9 && Math.random() < .3 && terrainCanvas) { const tg = terrainCanvas.getContext('2d'); tg.fillStyle = 'rgba(70,10,6,.5)'; tg.fillRect(p.x, p.y, p.size + 1, p.size); } break;
      case 'debris': ctx.fillStyle = p.col; ctx.globalAlpha = 1 - k; ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1; break;
      case 'chunk': {                                   // a turret thrown clear by an ammunition fire, trailing smoke, tumbling, coming to rest
        if (p.y > p.floor) { p.y = p.floor; p.vy *= -.25; p.vx *= .5; p.spin *= .4; }
        p.rot = (p.rot || 0) + p.spin * dt; if (Math.random() < .5 && k < .7) part({kind:'smoke', x:p.x, y:p.y, vx:0, vy:-8, size:3, grow:12, life:900, shade:.85});
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, (1 - k) * 4); ctx.fillStyle = '#2a2622'; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.fillRect(p.w / 2 - 1, -1.5, p.w * .9, 3); ctx.restore(); break; }
      case 'water': ctx.fillStyle = `rgba(230,240,248,${1 - k})`; ctx.fillRect(p.x, p.y, p.size, p.size); break;
      case 'ring': ctx.strokeStyle = `rgba(${p.col},${(1 - k) * .6})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size + p.grow * k, (p.size + p.grow * k) * .45, 0, 0, 7); ctx.stroke(); break;
      case 'tracer': { ctx.globalCompositeOperation = 'lighter'; const x = p.ax + (p.bx - p.ax) * k, y = p.ay + (p.by - p.ay) * k, x2 = p.ax + (p.bx - p.ax) * Math.max(0, k - .25), y2 = p.ay + (p.by - p.ay) * Math.max(0, k - .25);
        ctx.strokeStyle = `rgba(${p.col},.95)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; break; }
      case 'proj': {
        const x = p.ax + (p.bx - p.ax) * k, y = p.ay + (p.by - p.ay) * k - (p.arc ? Math.sin(k * Math.PI) * p.arc : 0);
        if (p.style === 'rocket' || p.style === 'rocketArc') { fxTrail(x, y); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
        else if (p.style === 'bomb') { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(x, y, 3, 5, 0, 0, 7); ctx.fill(); }
        else if (p.style === 'arc') { ctx.fillStyle = '#2a2a26'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); if (Math.random() < .3) part({kind:'smoke', x, y, vx:0, vy:0, size:2, grow:4, life:300, shade:.3}); }
        else { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,230,160,.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - (p.bx - p.ax) * .08, y - (p.by - p.ay) * .08); ctx.lineTo(x, y); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
        if (k > .97 && p.done) { const d = p.done; p.done = null; d(); }
        break; }
      case 'bark': { ctx.globalAlpha = Math.min(1, (1 - k) * 4); ctx.font = 'bold 15px "Courier Prime",monospace'; const w = ctx.measureText(p.text).width + 14, h = 22, bx = p.x - w / 2, by = p.y - h;
        ctx.fillStyle = '#f4efe0'; ctx.strokeStyle = '#1a1814'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by, w, h, 6); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x - 5, by + h - 1); ctx.lineTo(p.x + (p.flip ? 6 : -6), by + h + 8); ctx.lineTo(p.x + 5, by + h - 1); ctx.fill(); ctx.stroke(); ctx.fillRect(p.x - 4, by + h - 3, 8, 3);
        ctx.fillStyle = '#1a1814'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x, by + h / 2 + 1); ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1; break; }
      case 'text': { ctx.globalAlpha = 1 - k * k; ctx.font = 'bold 20px "Courier Prime",monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.col; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1; break; }
      case 'chute': { const y = p.y0 + (p.y1 - p.y0) * k, sw = Math.sin(now / 300 + p.x) * 4;
        ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.arc(p.x + sw, y - 18, 11, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x + sw - 11, y - 18); ctx.lineTo(p.x, y); ctx.lineTo(p.x + sw + 11, y - 18); ctx.stroke();
        ctx.fillStyle = p.crate ? '#7a6a40' : '#4a4a30'; ctx.fillRect(p.x - 3, y - 2, 6, p.crate ? 6 : 8); break; }
      case 'cross': { ctx.globalAlpha = 1 - k; ctx.fillStyle = '#7ae07a'; const s = 5; ctx.fillRect(p.x - s / 2, p.y - s * 1.5 - k * 20, s, s * 3); ctx.fillRect(p.x - s * 1.5, p.y - s / 2 - k * 20, s * 3, s); ctx.globalAlpha = 1; break; }
      case 'speed': { ctx.strokeStyle = `rgba(255,240,200,${(1 - k) * .6})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x - 30 * k, p.y); ctx.lineTo(p.x - 30 * k - 24, p.y); ctx.stroke(); break; }
    }
  }
  // flyers: bomber streams and transport aircraft crossing the map during powers
  FX.flyers = FX.flyers.filter(f => now - f.t0 < f.life);
  for (const f of FX.flyers) {
    const k = (now - f.t0) / f.life, x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; drawBomberShape(ctx, x + 40, y + 70, f.s, true);
    drawBomberShape(ctx, x, y, f.s, false, f.col);
  }
  // explosion light
  FX.lights = FX.lights.filter(l => now - l.t0 < l.life);
  ctx.globalCompositeOperation = 'lighter';
  for (const l of FX.lights) { const k = 1 - (now - l.t0) / l.life, gr = ctx.createRadialGradient(l.wx, l.wy, 0, l.wx, l.wy, l.r); gr.addColorStop(0, `rgba(${l.col},${.35 * k})`); gr.addColorStop(1, `rgba(${l.col},0)`); ctx.fillStyle = gr; ctx.fillRect(l.wx - l.r, l.wy - l.r, l.r * 2, l.r * 2); }
  ctx.globalCompositeOperation = 'source-over';
}
function fxTrail(x, y) { part({kind:'smoke', x, y, vx:rnd(-4, 4), vy:-4, size:3, grow:9, life:700, shade:.15}); }
function drawBomberShape(ctx, x, y, s, shadow, col = '#4a4e44') {        // four-engine bomber silhouette seen from above
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (!shadow) ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 4.5, 0, 0, 7); ctx.fill();                       // fuselage
  ctx.beginPath(); ctx.moveTo(-4, -44); ctx.lineTo(6, -44); ctx.lineTo(10, 44); ctx.lineTo(-2, 44); ctx.closePath(); ctx.fill();   // wings
  ctx.beginPath(); ctx.moveTo(-30, -12); ctx.lineTo(-24, -12); ctx.lineTo(-22, 12); ctx.lineTo(-30, 12); ctx.closePath(); ctx.fill();   // tailplane
  if (!shadow) { ctx.fillStyle = 'rgba(200,210,220,.25)'; for (const e of [-30, -14, 14, 30]) { ctx.beginPath(); ctx.arc(10, e, 4, 0, 7); ctx.fill(); } }
  ctx.restore();
}

/* ---------- a living battlefield (world space) ---------- */
const LIFE = {fires:[], surf:[], birds:[], mapKey:null};
function lifeSetup() {
  LIFE.mapKey = G; LIFE.fires = []; LIFE.surf = []; LIFE.birds = [];
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) {
    const t = terr(x, y);
    if ((t === 'ruins' && hrand(x, y, 71) < .22) || (t === 'block' && G.theme === 'city' && hrand(x, y, 72) < .08)) LIFE.fires.push({x, y, big:hrand(x, y, 73) < .3});
    if ((t === 'beach' || t === 'obst' || t === 'cliff') && inside(x, y + 1) && terr(x, y + 1) === 'sea') LIFE.surf.push({x, y});
  }
}
function fxLife(ctx, t) {
  if (!SET.fx || FAST) return;
  if (LIFE.mapKey !== G) lifeSetup();
  const night = isNight(), dt = 1 / 60;
  // burning buildings: a fire glow and a smoke column that leans with the wind
  for (const f of LIFE.fires) {
    const [wx, wy] = T2W(f.x, f.y);
    if (Math.random() < (f.big ? .2 : .08)) part({kind:'smoke', x:wx + rnd(-10, 10), y:wy - 8, vx:8 + rnd(0, 8), vy:-rnd(18, 34), size:rnd(6, 10), grow:rnd(22, 40), life:rnd(2200, 3600), shade:.85});
    if (Math.random() < (f.big ? .3 : .12)) fxFire(wx + rnd(-8, 8), wy - 4, 1, f.big ? 8 : 5);
    if (night && Math.random() < .03) lightAt(wx, wy, 90, '255,150,70', 500);
  }
  // surf rolling onto the sand
  ctx.strokeStyle = 'rgba(240,248,250,.6)'; ctx.lineWidth = 2;
  for (const s of LIFE.surf) { const k = ((t / 2600 + hrand(s.x, 0, 5)) % 1), X = s.x * ART, Y = (s.y + 1) * ART + 10 - k * 14;
    ctx.globalAlpha = Math.sin(k * Math.PI) * .7; ctx.beginPath(); ctx.moveTo(X, Y); for (let i = 1; i <= 8; i++) ctx.lineTo(X + i * ART / 8, Y + Math.sin(i * 1.7 + s.x) * 2); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // birds by day, out of the snow and rain
  if (!night && !['snow', 'rain', 'smoke'].includes(G.weather) && G.theme !== 'winter') {
    if (LIFE.birds.length < 2 && Math.random() < .002) { const y = rnd(0, G.H * ART), dir = Math.random() < .5 ? 1 : -1; LIFE.birds.push({x:dir > 0 ? -60 : G.W * ART + 60, y, dir, n:4 + (Math.random() * 6 | 0), t0:t}); }
    ctx.strokeStyle = 'rgba(30,30,28,.7)'; ctx.lineWidth = 1.5;
    LIFE.birds = LIFE.birds.filter(b => b.x > -80 && b.x < G.W * ART + 80);
    for (const b of LIFE.birds) { b.x += b.dir * 1.6; b.y += Math.sin(t / 900 + b.n) * .3;
      for (let i = 0; i < b.n; i++) { const bx = b.x - b.dir * (i * 9 + (i % 2) * 4), by = b.y + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 7, flap = Math.sin(t / 90 + i) * 3;
        ctx.beginPath(); ctx.moveTo(bx - 5, by - flap); ctx.quadraticCurveTo(bx - 2, by - 1, bx, by); ctx.quadraticCurveTo(bx + 2, by - 1, bx + 5, by - flap); ctx.stroke(); } }
  }
  // night: tracer fire along the front, and searchlights on the big Eastern Front assaults
  if (night && G.units.length) {
    if (Math.random() < .04) { const a = G.units[Math.random() * G.units.length | 0], foes = G.units.filter(u => u.team !== a.team);
      if (foes.length) { const b = foes.reduce((m, u) => dist(u, a) < dist(m, a) ? u : m, foes[0]); if (dist(a, b) < 8) fxTracers(a, b, 6, Math.random() < .5 ? '255,120,90' : '140,255,140', 16, 700); } }
    if (G.mission && ['seelow', 'berlin', 'vistula'].includes(G.mission.id)) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) { const bx = (i + .5) * G.W * ART / 6, by = G.H * ART + 40, a = -Math.PI / 2 + Math.sin(t / 3000 + i * 1.3) * .5, L = G.H * ART * .9;
        const g = ctx.createLinearGradient(bx, by, bx + Math.cos(a) * L, by + Math.sin(a) * L); g.addColorStop(0, 'rgba(255,255,230,.22)'); g.addColorStop(1, 'rgba(255,255,230,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx - 6, by); ctx.lineTo(bx + Math.cos(a - .05) * L, by + Math.sin(a - .05) * L); ctx.lineTo(bx + Math.cos(a + .05) * L, by + Math.sin(a + .05) * L); ctx.lineTo(bx + 6, by); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  // units: damaged vehicles smoke or burn, armour puffs exhaust
  for (const u of G.units) {
    if (u.d.foot || u.d.fixed || (UI.vis && !seen(u))) continue;
    const [wx, wy] = T2W(u.rx ?? u.x, u.ry ?? u.y), back = u.team === 2 ? 18 : -18;
    if (u.hp <= 40 && Math.random() < (u.hp <= 20 ? .25 : .1)) part({kind:'smoke', x:wx + rnd(-6, 6), y:wy - 6, vx:rnd(-4, 4), vy:-rnd(14, 26), size:4, grow:16, life:1600, shade:.9});
    if (u.hp <= 20 && Math.random() < .2) fxFire(wx + rnd(-6, 6), wy, 1, 5);
    if ((u.d.armour || u.d.mt === 'tread') && Math.random() < (u.moving ? .35 : .015)) part({kind:'smoke', x:wx + back, y:wy - 4, vx:back * .6, vy:-rnd(6, 12), size:2.5, grow:8, life:900, shade:.6});
  }
}

/* ---------- atmosphere (screen space) ---------- */
const WEATHER_GRADE = {
  overcast:'rgba(150,160,170,.10)', smoke:'rgba(120,100,70,.13)', night:'rgba(20,30,70,.38)', fog:'rgba(220,226,230,.22)', rain:'rgba(70,80,90,.16)', snow:'rgba(220,230,240,.06)', clear:null,
};
const RAIN = Array.from({length:160}, (_, i) => ({x:hrand(i, 11), y:hrand(i, 12), s:.5 + hrand(i, 13) * .5}));
function fxAtmosphere(ctx, t) {
  if (!G) return;
  const w = G.weather || 'clear', W = innerWidth, H = innerHeight;
  if (!(W > 0 && H > 0)) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (SET.fx && w !== 'night' && w !== 'fog') {                      // cloud shadows drifting over the battlefield
    for (let i = 0; i < 5; i++) { const cx = ((hrand(i, 1) * W * 1.6 + t * .012 * (1 + i * .2) - cam.x * cam.z * .5) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, cy = hrand(i, 2) * H;
      const r = 160 + hrand(i, 3) * 200, gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(0,0,0,.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
  }
  if (WEATHER_GRADE[w]) { ctx.fillStyle = WEATHER_GRADE[w]; ctx.fillRect(0, 0, W, H); }
  if (G.clock && G.clock.step < 1440) {                 // the light follows the mission clock
    const h = hourAt(), dark = h < 4 || h >= 22.5 ? 1 : h < 6 ? (6 - h) / 2 : h >= 20.5 ? (h - 20.5) / 2 : 0;
    const warm = h >= 5 && h < 8 ? 1 - Math.abs(h - 6) / 2 : h >= 18.5 && h < 21.5 ? 1 - Math.abs(h - 20) / 1.5 : 0;
    if (warm > 0) { ctx.fillStyle = `rgba(255,140,60,${(.16 * warm).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    if (dark > 0) { ctx.fillStyle = `rgba(8,14,44,${(.5 * dark).toFixed(3)})`; ctx.fillRect(0, 0, W, H);
      if (dark > .6 && SET.fx) { ctx.fillStyle = 'rgba(255,255,240,.5)'; for (const s of RAIN.slice(0, 40)) ctx.fillRect(s.x * W, s.y * H * .4, 1.2, 1.2); } }   // stars
  }
  if (w === 'fog' && SET.fx) for (let i = 0; i < 6; i++) { const y = ((hrand(i, 4) * H + t * .006 * (i % 2 ? 1 : -1)) % H + H) % H, gr = ctx.createLinearGradient(0, y - 60, 0, y + 60);
    gr.addColorStop(0, 'rgba(230,234,238,0)'); gr.addColorStop(.5, 'rgba(230,234,238,.22)'); gr.addColorStop(1, 'rgba(230,234,238,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - 60, W, 120); }
  if (w === 'rain' && SET.fx) { ctx.strokeStyle = 'rgba(200,215,230,.35)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const r of RAIN) { const x = (r.x * W + t * .25 * r.s) % W, y = (r.y * H + t * .9 * r.s) % H; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14); } ctx.stroke(); }
  if (w === 'snow' || G.theme === 'winter') { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (const f of RAIN.slice(0, 110)) { const x = ((f.x * W + Math.sin(t / 900 + f.y * 9) * 20) % W + W) % W, y = (f.y * H + t * .03 * f.s) % H; ctx.fillRect(x, y, 2 * f.s + .5, 2 * f.s + .5); } }
  if (w === 'smoke' && SET.fx) for (let i = 0; i < 3; i++) { const x = ((hrand(i, 21) * W + t * .01) % (W + 200)) - 100, gr = ctx.createLinearGradient(x, 0, x + 80, H);
    gr.addColorStop(0, 'rgba(60,54,48,.0)'); gr.addColorStop(.5, 'rgba(60,54,48,.10)'); gr.addColorStop(1, 'rgba(60,54,48,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 60, 0, 200, H); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .75);   // vignette
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.38)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/* ---------- general powers: cut-in and battlefield effects ---------- */
function powerCutIn(team, lv, p) {
  if (FAST) return Promise.resolve();
  return new Promise(res => {
    const co = G.teams[team].co, el = $('#powercut'), nat = G.teams[team].nat;
    el.querySelector('.pt').replaceChildren(portraitCanvas(co, 4));
    el.querySelector('.lv').textContent = lv === 2 ? 'SUPER POWER' : 'POWER';
    el.querySelector('.nm').textContent = p.n;
    el.querySelector('.q').textContent = '"' + (CO[co].say.power || '') + '"';
    el.querySelector('.ds').textContent = p.txt;
    el.style.setProperty('--tc', NATION[nat].col.team);
    el.hidden = false; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
    sfx('power');
    const close = () => { el.hidden = true; el.removeEventListener('click', close); res(); };
    el.addEventListener('click', close); setTimeout(close, lv === 2 ? 2600 : 2000);
  });
}
async function powerEffects(plan) {
  if (FAST) return;
  const p = plan.p, team = plan.team, mine = G.units.filter(u => u.team === team);
  if (p.fx === 'dust' || p.mv) for (const u of mine) { const [x, y] = T2W(u.x, u.y); fxDust(x, y + 10, 3); for (let i = 0; i < 3; i++) part({kind:'speed', x:x + rnd(-10, 10), y:y + rnd(-14, 10), life:500}); }
  if (plan.heals.length) for (const u of plan.heals) { const [x, y] = T2W(u.x, u.y); part({kind:'cross', x, y, life:900}); part({kind:'chute', x:x + 6, y0:y - 140, y1:y + 6, life:900, crate:true}); }
  for (const s of plan.strikes) {
    centerOn(s.x, s.y); const [cx, cy] = T2W(s.x, s.y), R = (s.r + .6) * ART;
    if (s.kind === 'carpet') {                                // a stream of heavy bombers, then the bomb carpet
      for (let i = 0; i < 6; i++) FX.flyers.push({t0:performance.now() + i * 90, life:2200, x0:cx - innerWidth / cam.z, y0:cy - 260 + i * 46, x1:cx + innerWidth / cam.z, y1:cy - 330 + i * 46, s:1.1, col:G.teams[team].nat === 'us' ? '#8a9098' : '#3a3e3a'});
      sfx('carpet'); await sleep(900);
      for (let i = 0; i < 22; i++) { setTimeout(() => fxExplosion(s.x, s.y, 1.1, {wx:cx + rnd(-R, R), wy:cy + rnd(-R, R) * .7}), i * 70); }
      await sleep(1700);
    } else if (s.kind === 'barrage' || s.kind === 'naval') {
      sfx(s.kind === 'naval' ? 'naval' : 'barrage');
      await sleep(900);
      for (let i = 0; i < 16; i++) setTimeout(() => fxExplosion(s.x, s.y, s.kind === 'naval' ? 1.5 : 1, {wx:cx + rnd(-R, R), wy:cy + rnd(-R, R) * .7}), i * 110);
      await sleep(1900);
    } else {                                                  // Nebelwerfer, Katyusha and rocket salvos arc in from the friendly side
      sfx(s.kind === 'katyusha' ? 'katyusha' : s.kind === 'nebel' ? 'nebel' : 'rp3');
      const from = mine.length ? mine[0] : {x:s.x - 8, y:s.y};
      for (let i = 0; i < 14; i++) setTimeout(() => fxProjectile({x:from.x + rnd(-1, 1), y:from.y + rnd(-1, 1)}, {x:s.x + rnd(-s.r, s.r), y:s.y + rnd(-s.r, s.r)}, 'rocketArc', 900).then(() => fxExplosion(s.x, s.y, .9, {wx:cx + rnd(-R, R), wy:cy + rnd(-R, R) * .7})), i * 90);
      await sleep(2300);
    }
  }
  for (const h of plan.hurts) fxText(h.u.x, h.u.y, '-' + Math.ceil(h.dmg / 10), '#ff8a6a');
  if (plan.spawns.length) {
    const kind = p.spawn && p.spawn.kind;
    const first = plan.spawns[0]; centerOn(first.x, first.y);
    if (kind === 'para') {
      const [cx, cy] = T2W(first.x, first.y);
      for (let i = 0; i < 3; i++) FX.flyers.push({t0:performance.now() + i * 160, life:2000, x0:cx - innerWidth / cam.z, y0:cy - 200 + i * 60, x1:cx + innerWidth / cam.z, y1:cy - 240 + i * 60, s:.8, col:'#5d6b3a'});
      sfx('move_air'); await sleep(700);
      for (const u of plan.spawns) { const [x, y] = T2W(u.x, u.y); u.flash = false; for (let i = 0; i < 3; i++) part({kind:'chute', x:x + rnd(-12, 12), y0:y - 220, y1:y + 8, life:1300}); }
      await sleep(1300);
    } else { for (const u of plan.spawns) { const [x, y] = T2W(u.x, u.y); fxDust(x, y + 10, 8); fxSmoke(x, y, 3, .3, 10, 16); } sfx('build'); await sleep(600); }
  }
}
