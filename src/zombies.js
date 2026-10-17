/* ---------- Dead of Night: the zombie survival mode ----------
   Autumn 1944. Something has come up out of the bunkers and the burial pits, and it does not
   care whose uniform it once wore. The dead come in waves from every edge of the map, and every
   soldier they pull down gets up again on their side. Built on the Last Stand wave engine. */

NATION.zed = {n:'The Dead', adj:'Undead', short:'The Horde', side:'none', zed:true,
  col:{m:'#5a6450', d:'#3a4034', ui:'#8ab05a', team:'#7a9a4a', hi:'#a8b890'},
  uniform:'#5a5a4a', helmet:'stahl', star:'zed', skin:'#9aa888',
  u:{
    inf:   {n:'Walkers', w:'teeth and nails', snd:'claw', pow:.75, powArm:2.2, cost:600},
    cav:   {n:'Runners', w:'teeth and nails', snd:'claw', pow:.7, powArm:2, arm:1.1, cost:1300, horse:false},
    mortar:{n:'Spitter', w:'arcs of caustic bile', snd:'acid', pow:.85, cost:2800},
    at:    {n:'Brute', w:'fists like sledgehammers', snd:'smash', pow:1.15, powArm:1.5, arm:.6, mv:3, cost:4500},
    htank: {n:'Abomination', w:'a lash of fused limbs', snd:'smash', foot:true, mt:'boot', mv:3, pow:1.05, arm:.5, cost:15000},
  }};
HELMET_COL.zed = '#4a4e42';
INF_WEAPONS.zed = {inf:[null, null, null], at:[null, null], mortar:[null, null]};

/* the general of the dead: there isn't one, only the hunger */
CO.horde = {n:'The Horde', nat:'zed', rank:'—', nick:'Nobody knows where it started',
  bio:'In the autumn of 1944 the dead began to walk. Nobody knows where it started: a bunker, a field hospital, a burial pit. Field grey, olive drab and khaki shamble side by side now, and every soldier they pull down gets up again to join them.',
  d2d:{txt:'Infantry +10% firepower. Enemy infantry they kill rise again as Walkers.', atk:{foot:10}},
  cop:{n:'The Hunger', star:3, txt:'All units +1 move, +20% firepower.', mv:{ground:1}, atk:{all:20}},
  scop:{n:'Night of the Dead', star:6, txt:'All units recover 3 HP and gain +30% firepower; Walkers claw up out of the earth.', heal:3, atk:{all:30}, spawn:{where:'front', roles:['inf', 'inf', 'inf']}},
  look:{cap:'zed', face:'#8a9a78', hair:'#2a2a22', jaw:2, tunic:'#5a5a4a', collar:'#4a1a14'},
  say:{start:'Hhhhrrrrr…', win:'…', lose:'Ggghhk…', power:'RRRAAAAGH!'}};
CO_BY_NAT.zed = ['horde'];
BARKS.zed = {sel:['Hhhrrr…', 'Uuurgh…', 'Hnnnh…'], veh:['Hhhrrr…'], atk:['RRAAAGH!', 'Hnnngh!', 'GRAAH!'], kill:['*crunch*', 'Mmmhhh…'], hurt:['Gggrk…', 'Hhkk…']};
PERSONAS.horde = {n:'Horde', adv:2.2, cover:0, fear:0, atk:1.6, cap:.8, noise:250, txt:'The dead do not take cover and do not retreat.'};

/* the yellow-and-black quarantine flag ("L": this ship has infectious disease aboard) */
FLAG_EXTRA.zed = (g, x, y, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#1a1a18' : '#e8c820'; g.fillRect(x + i * w / 2, y + j * h / 2, w / 2 + .5, h / 2 + .5); } };
MARK_EXTRA.zed = (P, x, y, s = 1) => { const q = 1.8 * s; P.R(x - q, y - q, q, q, '#e8c820'); P.R(x, y - q, q, q, '#1a1a18'); P.R(x - q, y, q, q, '#1a1a18'); P.R(x, y, q, q, '#e8c820'); };

/* the portrait: what is left of a face under a dented helmet */
CAP_EXTRA.zed = (P, L) => {
  P.ell(20.5, 21.3, 2.4, 1.6, '#141410'); P.ell(27.5, 21.3, 2.4, 1.6, '#141410');                       // sunken sockets
  P.circ(21, 21.3, 1, '#d8e860'); P.circ(28, 21.3, 1, '#d8e860'); P.circ(21, 21.3, .45, '#fffbe0'); P.circ(28, 21.3, .45, '#fffbe0');
  P.R(19, 27, 10, 3.2, '#2a0a08'); for (let i = 0; i < 6; i++) P.R(19.4 + i * 1.6, 27, 1, 1.2, '#d8d0b8'); for (let i = 0; i < 5; i++) P.R(20.2 + i * 1.6, 29, 1, 1, '#c8c0a0');   // the jaw hangs open
  P.poly([[29, 23], [33, 24], [32, 28], [29, 27]], '#6a1a14'); P.line(29.5, 24, 32, 26.5, '#d8d0b8', .4);   // torn cheek, bone showing
  P.line(16, 15, 22, 18, '#3a2a20', .5); for (let i = 0; i < 4; i++) P.line(17 + i * 1.5, 15.2 + i * .5, 17.6 + i * 1.5, 16.6 + i * .5, '#3a2a20', .3);   // stitched scalp
  const hc = '#4a4e42'; P.ell(25, 12, 12, 6, hc); P.R(13, 13, 24, 3, shade(hc, -.12)); P.ell(21, 9, 4, 2, shade(hc, .15));   // a dented Stahlhelm, askew
  P.circ(30, 11, 1, '#141410'); P.line(30, 11, 33, 9, '#2a2a22', .3);                                    // bullet hole
  for (let i = 0; i < 7; i++) P.circ(14 + hrand(i, 3) * 20, 30 + hrand(i, 5) * 16, .6 + hrand(i, 7), '#5a0e0a');   // old blood on the collar
};

/* ---------- the sprites ---------- */
const ZED_UNI = ['#6b6f5e', '#7a6f4c', '#7d6a45', '#8b7f55', '#5f6a44'];   // field grey, olive drab, khaki, gymnastyorka, Marine green
function zedFig(P, x, y, f, s, kind) {
  const step = f % 2, skin = s < .5 ? '#9aa888' : '#a8a890', skinD = shade(skin, -.28), uni = ZED_UNI[Math.floor(s * 5) % 5], uniD = shade(uni, -.22);
  const blood = '#5a0e0a', blood2 = '#8a1812', eye = '#e0f070', boot = '#1e1a16';
  if (kind === 'runner') {
    const a = step ? 1 : -1;
    P.line(x + 4.5, y + 12, x + 4.5 - 3 * a, y + 16.6, uniD, 1.7); P.line(x + 5.5, y + 12, x + 5.5 + 3 * a, y + 16.2, shade(uni, -.1), 1.7);
    P.R(x + 3 - 3 * a, y + 16.6, 3, 1, boot); P.R(x + 5 + 3 * a, y + 16.2, 3, 1, s > .6 ? skinD : boot);
    P.poly([[x + 3, y + 12.6], [x + 5, y + 7.2], [x + 8.4, y + 5.4], [x + 10.4, y + 6.8], [x + 7.4, y + 12.6]], uni);
    P.R(x + 3.4, y + 11.2, 4.4, .9, '#3e3424'); P.R(x + 5.4, y + 8, 1.4, 2.6, blood); P.px(x + 6, y + 10.8, blood2);
    P.line(x + 6, y + 8, x + 2 - a, y + 10.6, uniD, 1.2); P.circ(x + 1.8 - a, y + 10.8, .8, skin);           // the trailing arm
    P.line(x + 8.4, y + 7.4, x + 13.4, y + 6.6 + a * .6, uniD, 1.3); P.R(x + 13.2, y + 6 + a * .6, 1.8, 1.3, skin); P.px(x + 15, y + 6 + a * .6, skinD);
    P.R(x + 8.6, y + 2.8, 3.8, 3.2, skin); P.R(x + 8.6, y + 5, 3.8, 1, skinD); P.R(x + 8.4, y + 2.4, 2.8, .8, '#2a2a22');
    P.R(x + 10.4, y + 3.4, 1.2, .9, '#1a1a12'); P.px(x + 11, y + 3.6, eye); P.R(x + 11, y + 5, 1.6, 1.4, '#2a0a08'); P.R(x + 11.1, y + 5, 1.4, .35, '#e0dcc8');
    return;
  }
  const bob = f % 4 === 1 || f % 4 === 2 ? .5 : 0; y += bob;
  if (kind === 'spitter') {
    P.R(x + 2.5, y + 13, 2, 4, uniD); P.R(x + 5.5 + step * .5, y + 13, 2, 4, uniD); P.R(x + 1.8, y + 16.6, 3, 1, boot); P.R(x + 5.4 + step * .5, y + 16.6, 3, 1, boot);
    P.ell(x + 5, y + 9.6, 4.2, 3.8, uni); P.ell(x + 5.6, y + 10.4, 2.8, 2.4, '#8a9a50'); P.ell(x + 5, y + 9.8, 1.4, 1, '#a8b860');   // the tunic split over a swollen belly
    P.line(x + 4, y + 9, x + 6.6, y + 12, '#6a3a6a', .3); P.line(x + 6.8, y + 8.6, x + 5.4, y + 11.6, '#6a3a6a', .3);
    P.R(x + 1, y + 8, 1.6, 4, uniD); P.circ(x + 1.6, y + 12.2, .8, skin);
    P.R(x + 5.6, y + 2.6, 3.8, 3.2, skin); P.R(x + 5.6, y + 2.2, 3.4, .8, '#2a2a22'); P.R(x + 7.4, y + 3.2, 1.2, .9, '#1a1a12'); P.px(x + 8, y + 3.4, eye);
    P.R(x + 8.2, y + 4.8, 1.8, 1.6, '#1a2a08'); P.R(x + 8.8, y + 6.3, .6, 2.4, '#a8d040'); P.circ(x + 9.1, y + 8.9, .5, '#c8f050');   // dribbling bile
    P.R(x + 8.6, y + 6.4, 4, 1.2, uniD); P.R(x + 12.4, y + 6.4, 1.4, 1.2, skin);
    return;
  }
  // a walker: hunched forward, one leg dragging, arms reaching
  P.R(x + 2.5, y + 12, 2, 5, uniD); P.R(x + 5.5 + step * .5, y + 12, 2, 4.6, shade(uni, -.12));
  P.R(x + 1.5, y + 16.6, 3.2, 1, boot); if (s > .7) { P.R(x + 5.5 + step * .5, y + 14.6, 2, 2, skin); P.R(x + 5.5 + step * .5, y + 16.4, 2.6, .8, skinD); } else P.R(x + 5.5 + step * .5, y + 16.4, 3, 1, boot);
  P.poly([[x + 2, y + 12.6], [x + 2.6, y + 7], [x + 4, y + 5.6], [x + 8, y + 6], [x + 8.4, y + 12.6]], uni);
  for (let i = 0; i < 4; i++) P.px(x + 2.4 + i * 1.6, y + 12.6 + (i % 2) * .7, uniD);                         // a ragged hem
  P.R(x + 2, y + 11, 6.4, .9, '#3e3424');
  if (s > .3) { P.R(x + 5, y + 7.6, 2, 2.4, skinD); P.R(x + 5, y + 8, 2, .35, '#d8d0b8'); P.R(x + 5, y + 8.9, 2, .35, '#d8d0b8'); }   // ribs through the torn tunic
  P.R(x + 3, y + 8.5, 1.6, 2.5, blood); P.px(x + 3.6, y + 11, blood2); P.R(x + 6.6, y + 6.2, 1, 1.4, blood);
  P.R(x + 5, y + 2.6, 4, 3.4, skin); P.R(x + 5, y + 5, 4, 1, skinD); P.px(x + 9, y + 3.8, skin);
  P.R(x + 7, y + 3.4, 1.4, 1, '#1a1a12'); P.px(x + 7.6, y + 3.6, eye);
  P.R(x + 7.4, y + 5.2, 1.8, 1.3, '#2a0a08'); P.R(x + 7.5, y + 5.2, 1.6, .35, '#e0dcc8');
  P.R(x + 5, y + 2.2, 3, .8, s > .6 ? '#3a3428' : '#2a2a22'); P.px(x + 6.5, y + 2.6, blood2);
  if (s < .45) { P.poly([[x + 4.2, y + 3], [x + 5, y + 1.2], [x + 8, y + .8], [x + 9, y + 2.4], [x + 8.4, y + 2.8]], '#4a4e42'); P.px(x + 6, y + 1.6, '#1a1a14'); }   // a battered helmet, holed
  P.R(x + 7, y + 6.6, 5.5, 1.3, uniD); P.R(x + 12.4, y + 6.4, 1.8, 1.4, skin); P.px(x + 14.1, y + 6.2, skinD);
  P.R(x + 6, y + 8.4, 4.6, 1.2, uni); P.R(x + 10.5, y + 8.6, 1.6, 1.2, skin); P.px(x + 13, y + 7.9, blood);
}
function zedBrute(P, x, y, f) {
  const step = f % 2, sk = '#a8ae98', skD = shade(sk, -.18), eye = '#e0f070', uni = '#6b6f5e';
  P.R(x + 5, y + 19, 4, 8, shade(uni, -.25)); P.R(x + 11 + step, y + 19, 4, 8, shade(uni, -.25));
  P.R(x + 4, y + 26.5, 5.5, 1.5, '#1e1a16'); P.R(x + 11 + step, y + 26.5, 5.5, 1.5, '#1e1a16');
  const skL = shade(sk, .12), skDD = shade(sk, -.32);
  P.ell(x + 1.8, y + 13, 2.4, 5, skD); P.ell(x + 2, y + 20.4, 2.3, 2, skD); P.R(x + .6, y + 19.6, 3, .6, '#7a1410');   // the far arm, hanging, knuckles bloody
  P.poly([[x + 3.4, y + 20], [x + 2.6, y + 12], [x + 4.4, y + 8], [x + 9, y + 6.4], [x + 15, y + 7], [x + 18.6, y + 10], [x + 17.4, y + 20]], sk);   // a hunched slab of a torso
  P.poly([[x + 3.4, y + 20], [x + 2.6, y + 12], [x + 4.4, y + 8], [x + 6.4, y + 9], [x + 5.6, y + 20]], skD);           // shadow side
  P.ell(x + 8, y + 12, 3.2, 2, skL); P.ell(x + 13.6, y + 12, 3, 2, skL); P.line(x + 10.8, y + 10.6, x + 10.8, y + 18.6, skDD, .35);   // chest and belly
  for (let i = 0; i < 3; i++) P.R(x + 8.6, y + 15 + i * 1.5, 4.4, .35, skD);
  P.R(x + 3.4, y + 18.6, 14, 1.6, '#3e3424'); P.R(x + 9.6, y + 18.6, 2, 1.6, '#8a7a50');
  P.line(x + 6, y + 9.4, x + 15, y + 17.4, '#3a2a20', .45); for (let i = 0; i < 7; i++) P.line(x + 6.4 + i * 1.3, y + 9.6 + i * 1.15, x + 7.6 + i * 1.3, y + 9.1 + i * 1.15, '#3a2a20', .3);   // a surgeon's stitches
  P.circ(x + 15, y + 13, .8, '#3a0806'); P.circ(x + 7.4, y + 16.4, .7, '#3a0806'); P.R(x + 14.8, y + 13.6, .4, 2.2, '#6a120e');   // bullet holes he never noticed
  P.poly([[x + 2.6, y + 12], [x + 4.4, y + 8], [x + 9, y + 6.4], [x + 8.2, y + 8.6], [x + 4.6, y + 13]], uni); P.px(x + 6, y + 9.6, shade(uni, -.2));   // what's left of the tunic
  P.R(x + 9.4, y + 5.4, 4, 2, skD);                                                                                // a neck like a stump
  P.R(x + 10, y + 1.6, 5, 4.4, sk); P.R(x + 10, y + 2.4, 5, .8, skDD); P.R(x + 10.6, y + 5, 4.2, 1.8, skD);       // a small head sunk between the shoulders
  P.px(x + 11.2, y + 3.4, eye); P.px(x + 13.6, y + 3.4, eye); P.R(x + 11, y + 6, 3.4, .5, '#e0dcc8'); P.px(x + 10.4, y + 1.6, '#6a120e');
  P.ell(x + 18, y + 10, 3, 2.6, sk); P.ell(x + 18, y + 9.4, 2, 1.4, skL);                                       // the near shoulder
  P.line(x + 18.6, y + 11, x + 22, y + 15 - step, sk, 3.4); P.line(x + 22, y + 15 - step, x + 26, y + 11.6 - step * 1.4, sk, 3);   // upper arm and forearm, raised to smash
  P.line(x + 19, y + 12, x + 21.6, y + 15.4 - step, skD, 1);
  P.ell(x + 26.6, y + 10.6 - step * 1.4, 2.8, 2.4, shade(sk, -.05)); for (let i = 0; i < 3; i++) P.R(x + 25 + i * 1.2, y + 8.6 - step * 1.4, .9, 1, '#7a1410');   // the fist, bloody to the knuckles
}
function zedAbom(P, f) {
  const pulse = Math.sin(f * .8) * .6, eye = '#e0f070', fl = '#8e907a', flD = '#64664f', flL = '#a6a890';
  P.ell(16, 29, 13, 1.6, 'rgba(70,10,8,.6)');                                                                     // the slick it leaves
  for (const [ax, ay, bx, by] of [[5, 22, 0, 27], [27, 22, 31, 27], [9, 25, 6, 29], [23, 25, 26, 29]]) { P.line(ax, ay, bx, by, flD, 1.6); P.ell(bx, by, 1.4, .8, fl); }   // the limbs it walks on
  P.ell(16, 21, 13.5, 7, flD); P.ell(15.5, 16, 11 + pulse, 8, fl); P.ell(17, 10, 7, 5.6 + pulse * .5, fl);       // a mound of bodies
  P.ell(13, 12, 5, 3, flL); P.ell(10, 18, 4, 2.4, flL);
  for (const [cx, cy, rx, ry, c] of [[7, 21, 3.6, 2.4, '#6b6f5e'], [22, 20, 4.4, 2.6, '#7a6f4c'], [16, 24, 4, 1.8, '#8b7f55'], [23, 12, 2.6, 2.2, '#6b6f5e']]) { P.ell(cx, cy, rx, ry, c); P.ell(cx, cy + ry * .5, rx * .8, ry * .4, shade(c, -.2)); }   // the uniforms it swallowed
  P.line(6, 15.6, 26, 17.4, '#4a4a46', .35); for (let i = 0; i < 8; i++) P.line(7 + i * 2.5, 15.2 + i * .22, 7.8 + i * 2.5, 16.8 + i * .22, '#4a4a46', .3);   // barbed wire it dragged out of the line
  for (const [hx, hy, big] of [[14, 4.6, 1], [5, 11, 0], [24, 8, 0], [19, 14, 0]]) {                             // four heads, one still in its helmet
    const w = big ? 5 : 3.6, h = big ? 4.4 : 3.2;
    P.R(hx, hy, w, h, flL); P.R(hx, hy + h - 1, w, 1, shade(flL, -.2));
    P.R(hx + w * .25, hy + h * .3, w * .2, h * .25, '#141410'); P.R(hx + w * .6, hy + h * .3, w * .2, h * .25, '#141410');
    P.px(hx + w * .3, hy + h * .35, eye); P.px(hx + w * .65, hy + h * .35, eye);
    P.R(hx + w * .3, hy + h * .7, w * .45, h * .25, '#2a0a08'); P.R(hx + w * .32, hy + h * .7, w * .4, .3, '#d8d0b8');
  }
  P.poly([[13.4, 5.2], [14.4, 3.2], [18.6, 3], [19.8, 5]], '#4a4e42'); P.px(17, 3.8, '#141410');
  for (const [ax, ay, bx, by] of [[27, 12, 31, 7 - pulse], [4, 14, 0, 9 + pulse], [20, 6, 23, 1 + pulse * .5]]) { P.line(ax, ay, bx, by, fl, 1.4); P.circ(bx, by, 1, flL); }   // arms reaching out of it
  for (let i = 0; i < 9; i++) P.ell(5 + hrand(i, 2) * 22, 9 + hrand(i, 4) * 15, .5 + hrand(i, 6) * .6, .35 + hrand(i, 8) * .4, i % 3 ? '#4a0c08' : '#6a120e');   // old wounds, dark
}
function drawZed(P, role, f, n) {
  if (role === 'inf') { if (n >= 2) zedFig(P, 1, 9, f, .12, 'walker'); if (n >= 3) zedFig(P, 9, 6, f + 1, .58, 'walker'); zedFig(P, n >= 2 ? 16 : 9, 10, f + 2, .86, 'walker'); }
  else if (role === 'cav') { if (n >= 2) zedFig(P, 0, 9, f, .3, 'runner'); zedFig(P, 12, 8, f + 1, .74, 'runner'); }
  else if (role === 'mortar') { zedFig(P, 2, 9, f, .4, 'walker'); zedFig(P, 14, 8, f, .66, 'spitter'); }
  else if (role === 'at') zedBrute(P, 3, 3, f);
  else zedAbom(P, f);
}

/* ---------- the sounds of the dead (synthesised: no recording of these exists) ---------- */
function groan(t, p = 1, dur = 1.1, g = 1) {
  tone(t, {f:110 * p, f1:72 * p, dur, gain:.08 * g, type:'sawtooth', vib:9 * p, vibF:5.5, attack:.15});
  tone(t, {f:166 * p, f1:104 * p, dur:dur * .9, gain:.04 * g, type:'square', vib:6, vibF:4, attack:.2});
  noiseHit(t, {dur, bp:520 * p, q:2, gain:.16 * g, attack:.2});
}
Object.assign(WEAPON, {
  groan(t) { groan(t, .85 + Math.random() * .35); },
  chorus(t) { for (let i = 0; i < 6; i++) groan(t + Math.random() * 2.4, .55 + Math.random() * .6, 1 + Math.random() * 1.2, .35 + Math.random() * .3); },   // the horde, out in the dark
  shamble(t) { for (let i = 0; i < 4; i++) { const x = t + i * (.42 + Math.random() * .12); noiseHit(x, {dur:.28, bp:700 + Math.random() * 300, q:1.2, gain:.22, attack:.06}); thump(x + .2, {f0:70, f1:40, dur:.1, gain:.18}); }   // dragging feet
    if (Math.random() < .5) groan(t + .3, .7 + Math.random() * .4, 1, .6); },
  zdie(t) { tone(t, {f:150, f1:40, dur:1, gain:.09, type:'sawtooth', vib:26, vibF:14, attack:.02}); noiseHit(t, {dur:.7, bp:320, q:2.5, gain:.3, attack:.03}); thump(t + .75, {f0:90, f1:35, dur:.3, gain:.7}); noiseHit(t + .75, {dur:.25, lp:500, gain:.4}); },   // a wet gurgle, then the body hits the ground
  zhurt(t) { tone(t, {f:190, f1:120, dur:.4, gain:.08, type:'sawtooth', vib:14, vibF:11}); noiseHit(t, {dur:.25, bp:950, q:2, gain:.25}); },
  zrise(t) { tone(t, {f:60, f1:130, dur:1.6, gain:.08, type:'sawtooth', vib:10, vibF:6, attack:.4}); noiseHit(t, {dur:1.2, bp:250, q:1.5, gain:.3, attack:.3}); noiseHit(t + .1, {dur:.6, lp:400, gain:.25}); },   // something gets up out of the mud
  claw(t) { groan(t, .9 + Math.random() * .3, .8); for (let i = 0; i < 5; i++) noiseHit(t + .35 + i * .11, {dur:.07, bp:2600, q:2, gain:.35}); thump(t + .4, {f0:120, f1:50, dur:.12, gain:.4}); },
  smash(t) { groan(t, .6, 1.3); for (let i = 0; i < 3; i++) { thump(t + .5 + i * .3, {f0:90, f1:30, dur:.25, gain:1}); noiseHit(t + .5 + i * .3, {dur:.2, lp:600, gain:.6}); } },
  acid(t) { noiseHit(t, {dur:.5, bp:350, q:3, gain:.4, attack:.1}); tone(t, {f:90, f1:60, dur:.5, gain:.07, type:'sawtooth'}); whoosh(t + .4, .6, 300, 900, .2); noiseHit(t + 1, {dur:1.2, hp:3000, gain:.22, attack:.05}); },
});

/* ---------- the rules ---------- */
const isZed = team => !!(G && G.teams[team] && NATION[G.teams[team].nat] && NATION[G.teams[team].nat].zed);
/* the dead pull a man down, and he gets up again on their side */
function zedRise(u, by) {
  if (!by || !u.d.foot || u.d.fixed || !isZed(by) || isZed(u.team) || unitAt(u.x, u.y)) return;
  if (['sea', 'river', 'reef'].includes(terr(u.x, u.y))) return;
  const z = spawn(by, {role:'inf', x:u.x, y:u.y, hp:40}); if (!z) return;
  z.moved = z.done = true; G.risen = (G.risen || 0) + 1;
  if (!FAST) { fxText(u.x, u.y, 'IT RISES', '#c8e070', 1800); sfx('zrise', .3); }
}
const ZED_POOL = [['inf', 1, 10], ['cav', 2, 3], ['mortar', 3, 2], ['at', 4, 2]];
/* the dead come from the far edge first, then from the flanks, then from everywhere */
function zedEdges(n) {
  const far = waveEdge(), all = [[0, 0, 1, G.H - 1], [G.W - 2, 0, G.W - 1, G.H - 1], [0, 0, G.W - 1, 1], [0, G.H - 2, G.W - 1, G.H - 1]];
  const others = all.filter(e => e[0] !== far[0] || e[2] !== far[2]);
  if (n < 3) return [far];
  if (n < 6) return [far, others[(G.waves.seed + n) % others.length]];
  return [far, ...others];
}
const ZED_DIR = r => r[2] - r[0] > 5 ? (r[1] === 0 ? 'north' : 'south') : (r[0] === 0 ? 'west' : 'east');
function zedSpec(roster, n) {
  const edges = zedEdges(n), parts = [];
  let i = 0;
  for (const [r, k] of Object.entries(roster)) for (let j = 0; j < k; j++, i++) parts.push([r, edges[i % edges.length]]);
  const grouped = {};
  for (const [r, e] of parts) { const key = r + '|' + e.join(','); grouped[key] = (grouped[key] || 0) + 1; }
  const spec = Object.entries(grouped).map(([key, k]) => { const [r, e] = key.split('|'), [x0, y0, x1, y1] = e.split(','); return `${r}*${k} ${x0},${y0}-${x1},${y1}`; }).join('; ');
  return {spec, from:[...new Set(edges.map(ZED_DIR))]};
}
const ZED_SHORT = {inf:'Walkers', cav:'Runners', mortar:'Spitters', at:'Brutes', htank:'Abomination'};

/* ---------- the setup screen ---------- */
const ZED_MAPS = [['gen:normandy', 'Normandy, a village in the bocage'], ['gen:autumn', 'The Hürtgen, rain in the pines'], ['gen:winter', 'The Ardennes, snow and fog'], ['gen:city', 'A ruined city'], ['gen:holland', 'The Dutch polders'], ['gen:steppe', 'A collective farm on the steppe'], ['gen:poland', 'A Polish forest'], ['gen:desert', 'A desert outpost in Libya'],
  ['m:pegasus', 'Pegasus Bridge'], ['m:bastogne', 'Bastogne'], ['m:westerplatte', 'Westerplatte'], ['m:stalingrad', 'Stalingrad'], ['m:henderson', 'Henderson Field'], ['m:sihang', 'Sihang Warehouse']];
function openZombies() {
  const f = $('#zombies'), sel = f.querySelector('#zmap'), saved = Object.keys(edSaved());
  sel.innerHTML = ZED_MAPS.map(([v, n]) => `<option value="${v}">${n}</option>`).join('') + saved.map(n => `<option value="s:${n.replace(/"/g, '&quot;')}">Your map: ${n.replace(/</g, '&lt;')}</option>`).join('');
  const nats = Object.entries(NATION).filter(([k, n]) => !n.zed && !['be', 'pl'].includes(k));
  const ns = f.querySelector('#znat'); ns.innerHTML = nats.map(([k, n]) => `<option value="${k}">${n.n} (${n.short})</option>`).join(''); ns.value = 'us';
  const coSel = () => { f.querySelector('#zco').innerHTML = (CO_BY_NAT[ns.value] || []).map(c => `<option value="${c}">${CO[c].n}</option>`).join(''); };
  coSel(); ns.onchange = () => { coSel(); zedBestText(); }; sel.onchange = zedBestText;
  const b = f.querySelector('#zbest'); b.innerHTML = '';
  for (const [r, txt] of [['inf', 'Slow, and there are always more. Anyone they kill gets up again.'], ['cav', 'The fresh ones still run. They close the gap in a single turn.'], ['mortar', 'Swollen with bile it spits over your walls, two or three tiles.'], ['at', 'Tears the hatches off tanks. Small arms barely slow it.'], ['htank', 'Every fifth wave. Bring anti-tank guns and armour.']]) {
    const d = udef('zed', r), card = document.createElement('div'), c = mkCanvas(64, 64);
    c.getContext('2d').drawImage(getSprite('zed', r, 0, false, ''), 0, 0); card.className = 'zcard';
    card.appendChild(c); const p = document.createElement('p'); p.innerHTML = `<b>${d.n}</b>${txt}`; card.appendChild(p); b.appendChild(card);
  }
  UI.zForce = forceBind(f.querySelector('.forcebox'), ns, 'zed');
  zedBestText(); show('zombies');
}
function zedBestText() { const f = $('#zombies'), n = waveBest('zed:' + f.querySelector('#zmap').value + ':' + f.querySelector('#znat').value); f.querySelector('#zrec').textContent = n ? `Your best here: ${n} wave${n === 1 ? '' : 's'} survived.` : 'Nobody has lasted the night here yet.'; }
function launchZombies() {
  const f = $('#zombies'), v = f.querySelector('#zmap').value, nat = f.querySelector('#znat').value, night = f.querySelector('#znight').value;
  let rows, theme;
  if (v.startsWith('gen:')) { theme = v.slice(4); rows = genMap(theme, 34, 22, Date.now() % 1e9); }
  else if (v.startsWith('m:')) { const m = MISSIONS[v.slice(2)]; rows = missionMap(m); theme = m.theme; }
  else { const s = edSaved()[v.slice(2)]; if (!s) return; rows = s.rows; theme = s.theme; }
  const cfg = wavesCfg({rows, theme, nat, co:f.querySelector('#zco').value, enemy:'zed', eco:'horde', diff:f.querySelector('#zdiff').value, funds:Math.max(0, Math.min(200000, +f.querySelector('#zfunds').value || 0)), every:+f.querySelector('#zevery').value, name:'zed:' + v + lsCustomTag(f), force:UI.zForce && UI.zForce()});
  cfg.waves.zed = true; cfg.waves.night = night; cfg.waves.next = 1;                     // the first wave comes on the first night turn
  cfg.clock = {start:cfg.clock.start.slice(0, 11) + (night === 'endless' ? '23:00' : '18:00'), step:120};
  cfg.weather = theme === 'winter' ? 'snow' : night === 'endless' ? 'fog' : cfg.weather;
  G = null; startGame(cfg);
}
