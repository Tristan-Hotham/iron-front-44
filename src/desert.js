/* =============================== THE DESERT WAR ===============================
   North Africa, 1941-1943: Beda Fomm, Tobruk, Halfaya, Bir Hakeim, Gazala,
   El Alamein, Kasserine and Tunis. New terrain (dunes, wadis, escarpments),
   the Afrikakorps, the Italian army, the Eighth Army in khaki drill, the Free
   French of Bir Hakeim, their generals, vehicles and aircraft. */

/* ---------- terrain ---------- */
Object.assign(TER, {
  dune:   {n:'Dunes', def:1, mv:{foot:2, boot:2, tread:2, tire:3, air:1, amphib:2}, mm:'#dcc088', info:'Soft sand ridges. Wheels bog down and tanks labour, but a tank hull-down behind a crest shows only its turret.'},
  wadi:   {n:'Wadi', def:2, mv:{foot:1, boot:1, tread:2, tire:2, air:1, amphib:2}, mm:'#a88a5a', info:'A dry watercourse, a few feet deep: the only cover on a flat desert. Whole battalions lay up in them by day.'},
  escarp: {n:'Escarpment', def:3, mv:{foot:2, boot:3, air:1}, mm:'#8a6a42', info:'The limestone steps of the coast, sixty metres high. Vehicles only get up at the passes: Halfaya, Sollum, Sidi Rezegh.'},
});
Object.assign(MAPCH, {d:['dune'], W:['wadi'], E:['escarp']});
HIDES.add('wadi');

/* ---------- palettes and looks ---------- */
Object.assign(PAL, {
  desert: {grass:'#d4b882', grass2:'#c6a872', field:'#c8ac76', field2:'#bca06a', hedge:'#8a7a4a', tree:'#7a7442', tree2:'#8e8a52', trunk:'#5a4a30', water:'#4a86a0', water2:'#6aa6c0', sea:'#2a7898', sea2:'#4a98b8', sand:'#e8d4a0', road:'#6e6a60', road2:'#545048', roof:'#d8d0c0', wall:'#ece4d2', hill:'#c2a066', rock:'#a08a64', wheat:'#d0b47a', snow:0, arid:1},
  tunisia:{grass:'#b8b07a', grass2:'#a8a06c', field:'#c8b878', field2:'#b0a468', hedge:'#5a6a3a', tree:'#5a6a38', tree2:'#6e7e46', trunk:'#5a4a30', water:'#4a7a90', water2:'#6a9ab0', sea:'#2a6a8a', sea2:'#4a8aaa', sand:'#dccc98', road:'#8a7e66', road2:'#6a604e', roof:'#c8a080', wall:'#e6dcc6', hill:'#a8986a', rock:'#9a8c70', wheat:'#ccb86e', snow:0, arid:1},
});
Object.assign(THEMES, {
  desert: {n:'Libyan desert', base:'.', w:{'d':3, 'W':1, '^':1, ',':1}},
  tunisia:{n:'Tunisian hills', base:'.', w:{'^':3, ',':2, 'W':1, 'T':1}},
});

Object.assign(TILE_EXTRA, {
  dune({P, F, R, X, Y, C}) {
    F(0, 0, 32, 32, shade(C.grass, .06));
    for (let i = 0; i < 3; i++) {                     // crescent barchans, lit from the west
      const cx = 4 + i * 10 + R(i) * 6, cy = 6 + ((i * 11 + R(i + 3) * 12) % 22), w = 7 + R(i + 6) * 5;
      P.ell(X + cx + 1.5, Y + cy + 2.5, w, 2.4, shade(C.grass, -.14));
      P.ell(X + cx, Y + cy, w, 3, shade(C.grass, .14)); P.ell(X + cx - 1, Y + cy - .8, w * .7, 1.4, shade(C.grass, .24));
    }
    for (let r = 2; r < 32; r += 4) P.line(X, Y + r + R(r) * 2, X + 32, Y + r + 1 + R(r + 9) * 2, shade(C.grass, -.05), .3);   // wind ripples
  },
  wadi({P, F, R, X, Y, C, N}) {
    const bed = shade(C.grass, -.18), bank = shade(C.grass, -.08), W = d => N(...d) === 'wadi';
    const arms = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(W); if (!arms.length) arms.push([1, 0], [-1, 0]);
    F(9, 9, 14, 14, bank);                              // the channel runs from the centre towards each neighbouring stretch of wadi
    for (const [dx, dy] of arms) { if (dx) F(dx > 0 ? 16 : 0, 9, 16, 14, bank); else F(9, dy > 0 ? 16 : 0, 14, 16, bank); }
    F(12, 12, 8, 8, bed);
    for (const [dx, dy] of arms) { if (dx) F(dx > 0 ? 16 : 0, 12, 16, 8, bed); else F(12, dy > 0 ? 16 : 0, 8, 16, bed); }
    for (const [dx, dy] of arms) { if (dx) F(dx > 0 ? 16 : 0, 9, 16, 1, shade(C.grass, -.3)); else F(9, dy > 0 ? 16 : 0, 1, 16, shade(C.grass, -.3)); }   // the shadowed bank
    for (let i = 0; i < 10; i++) { const [dx, dy] = arms[i % arms.length], t = R(i) * 14; P.ell(X + 16 + dx * t + (R(i + 20) - .5) * 5, Y + 16 + dy * t + (R(i + 30) - .5) * 5, .8 + R(i + 40) * .6, .5, C.rock); }   // pebbles
    for (let i = 0; i < 3; i++) { const a = R(i + 60) * 28, b = R(i + 70) * 28; P.circ(X + a + 2, Y + b + 2, 1.6, C.tree); P.circ(X + a + 1.4, Y + b + 1.4, .9, C.tree2); }   // camel-thorn
  },
  escarp({P, F, R, X, Y, C, N}) {
    F(0, 0, 32, 32, C.hill);
    for (let r = 0; r < 5; r++) { const y0 = 3 + r * 6; F(0, y0, 32, 2.4, shade(C.hill, -.1 - r * .03)); F(0, y0 - .6, 32, .6, shade(C.hill, .18)); }   // strata of limestone
    for (let i = 0; i < 9; i++) P.ell(X + R(i) * 30, Y + 4 + R(i + 9) * 26, 1.6 + R(i + 18), .9, shade(C.rock, R(i + 27) < .5 ? -.15 : .1));   // fallen blocks
    if (N(0, 1) !== 'escarp') F(0, 28, 32, 4, 'rgba(60,40,20,.25)');
  },
});
/* flowers do not grow on the serir: the stony plain gets pebbles instead */
const _drawTileArid = drawTile;
drawTile = function (g, x, y) {
  const r = _drawTileArid(g, x, y), C = PAL[G.theme];
  if (C && C.arid && terr(x, y) === 'plain') { const P = painter(g); for (let i = 0; i < 6; i++) P.ell(x * 32 + hrand(x, y, i + 700) * 30, y * 32 + hrand(x, y, i + 720) * 30, .7 + hrand(x, y, i + 740) * .7, .45, shade(C.rock, hrand(x, y, i + 760) < .5 ? -.1 : .12)); }
  return r;
};

/* ---------- markings and flags ---------- */
MARK_EXTRA.ukflash = (P, x, y, s = 1) => { P.R(x - 3 * s, y - 2 * s, 6 * s, 4 * s, '#f0f0ea'); P.R(x - 1 * s, y - 2 * s, 2 * s, 4 * s, '#c8202a'); };   // the white-red-white recognition flash of 1941-42
MARK_EXTRA.ittac = (P, x, y, s = 1) => { P.R(x - 2.6 * s, y - 1.8 * s, 5.2 * s, 3.6 * s, '#c8202a'); P.R(x - 2.6 * s, y - .3 * s, 5.2 * s, .6 * s, '#f0f0ea'); P.R(x - .3 * s, y - 1.8 * s, .6 * s, 3.6 * s, '#f0f0ea'); };   // an Italian company rectangle: red for the 1st company
MARK_EXTRA.savoia = (P, x, y, s = 1) => { P.R(x - 2.4 * s, y - 3 * s, 4.8 * s, 6 * s, '#1c3a8a'); P.R(x - 1.9 * s, y - 2.5 * s, 3.8 * s, 5 * s, '#c8202a'); P.R(x - .5 * s, y - 2.2 * s, s, 4.4 * s, '#f0f0ea'); P.R(x - 1.6 * s, y - .5 * s, 3.2 * s, s, '#f0f0ea'); };
FLAG_EXTRA.it = (g, x, y, w, h) => {                   // the flag of the Kingdom of Italy, with the arms of Savoy
  ['#1e8a3a', '#f4f4ee', '#d42a2a'].forEach((k, i) => { g.fillStyle = k; g.fillRect(x + i * w / 3, y, w / 3 + .5, h); });
  const cx = x + w / 2, cy = y + h / 2, sw = w * .14, sh = h * .34;
  g.fillStyle = '#1c3a8a'; g.fillRect(cx - sw / 2 - 1, cy - sh / 2 - 1, sw + 2, sh + 2); g.fillStyle = '#d42a2a'; g.fillRect(cx - sw / 2, cy - sh / 2, sw, sh);
  g.fillStyle = '#f4f4ee'; g.fillRect(cx - sw * .12, cy - sh / 2, sw * .24, sh); g.fillRect(cx - sw / 2, cy - sh * .1, sw, sh * .2);
};

/* ---------- the armies ---------- */
HELMET.it = [[2, 0, 4], [1, 1, 6], [1, 2, 6], [0, 3, 8], [0, 3.6, 1]];
Object.assign(HELMET_COL, {dak:'#b4a272', it:'#7e7e56', uk42:'#a89868', ffl:'#7a7458'});
Object.assign(NAT_BASE, {dak:'ger', uk42:'uk', ffl:'fr'});
Object.assign(INF_WEAPONS, {
  dak: {inf:['rifle', 'rifle', 'mg42'], at:['shell', 'ptrd'], eng:['satchel', 'flamer'], mortar:['shell', 'rifle']},
  it:  {inf:['rifle', 'rifle', 'bren'], at:['shell', 'ptrd'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle'], cav:['rifle', 'rifle']},
  uk42:{inf:['rifle', 'rifle', 'bren'], at:['shell', 'ptrd'], eng:['rifle', 'bangalore'], mortar:['shell', 'rifle']},
  ffl: {inf:['rifle', 'rifle', 'bren'], at:['shell', 'ptrd'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle']},
});
SOLDIER_EXTRA.it = (P, x, y, uni, hel, kneel) => { P.px(x + 3.2, y + 6.4, '#f0f0e8'); P.px(x + 6.2, y + 6.4, '#f0f0e8'); P.R(x + 2, y + 10, 5, .8, '#5a4a30'); if (!kneel) { P.R(x + 3, y + 14, 2, 2, shade(uni, -.25)); P.R(x + 5, y + 14, 2, 2, shade(uni, -.25)); } };   // the stellette on the collar, cloth puttees

NATION.dak = {n:'Germany', adj:'German', short:'Deutsches Afrikakorps', side:'axis',
  col:{m:'#c2a466', d:'#8a7040', ui:'#b8b8a8', team:'#7d8794', hi:'#e8dcb0'},   // RAL 8020 Gelbbraun, sprayed over the grey at Tripoli
  uniform:'#a8986a', helmet:'stahl', star:'balken',
  u:{
    inf:  {n:'Schützen (Afrika)', w:'Kar98k & MG 34', snd:'mg34'},
    at:   {n:'Panzerjäger Team', w:'Panzerbüchse 39 & Teller mines', snd:'ptrd', pow:.9, cost:2500},
    recon:{n:'Sd.Kfz. 222', w:'2 cm KwK 30', snd:'flak20', shape:'sdkfz222', cost:3500, pow:.85},
    apc:  {n:'Sd.Kfz. 251/1', w:'MG 34', snd:'mg34', shape:'ht251'},
    tank: {n:'Panzer III Ausf. J', w:'5 cm KwK 39 L/42', snd:'gun50', shape:'pz3l', cost:6500},
    mtank:{n:'Panzer IV Ausf. F2', w:'7.5 cm KwK 40 L/43', snd:'gun75', shape:'pz4f2', pow:1.08, cost:11000},
    htank:{n:'Tiger I (s.Pz.Abt. 501)', w:'8.8 cm KwK 36', snd:'gun88', shape:'tiger', pow:1.15, arm:.75, cost:17000},
    art:  {n:'10.5 cm leFH 18', w:'105 mm howitzer', snd:'howitzer', shape:'lefh'},
    rkt:  {n:'Nebelwerfer 41', w:'15 cm rockets x6', snd:'nebel', shape:'nebel', mv:4, cost:12000},
    aa:   {n:'8.8 cm Flak 18', w:'88 mm: against aircraft, and against tanks', snd:'gun88', shape:'flak88', mt:'tire', mv:4, cost:10000, dmg:{inf:60, at:60, recon:110, apc:110, tank:100, mtank:85, htank:70, art:80, rkt:90, aa:70, ftr:70, bmr:80, cav:65, mortar:60, eng:60, nest:40, pak:40}},
    ftr:  {n:'Bf 109 F-4/trop', w:'MG 151/15 & MG 17', snd:'strafeGer', shape:'bf109f'},
    bmr:  {n:'Ju 87 B Stuka (trop)', w:'SC 250 bomb', snd:'stuka', shape:'ju87t'},
    eng:  {n:'Pioniere', w:'Teller mines, demolition charges & flamethrowers', snd:'flamer'},
    mortar:{n:'8 cm Granatwerfer 34', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'MG 34 Sangar', w:'MG 34 behind a stone sangar', snd:'mg34', shape:'nest'},
    pak:  {n:'8.8 cm Flak in a Gun Pit', w:'88 mm, dug in to the barrel', snd:'gun88', shape:'flak88', rng:[1,3], dmg:{inf:45, at:45, recon:125, apc:125, tank:115, mtank:105, htank:95, art:100, rkt:110, aa:100, cav:50, mortar:45, eng:45}},
  }};
NATION.it = {n:'Italy', adj:'Italian', short:'Regio Esercito', side:'axis',
  col:{m:'#c0a870', d:'#8a7448', ui:'#2e8a4a', team:'#2e8a4a', hi:'#e0d4a8'},   // kaki sahariano
  uniform:'#9a9064', helmet:'it', star:'ittac', skin:'#d8a880',
  u:{
    inf:  {n:'Fanteria', w:'Carcano M91 & Breda 30', snd:'bren', cost:900, pow:.9},
    at:   {n:'Cannone 47/32 Crew', w:'47 mm anti-tank gun', snd:'gun50', pow:.9},
    recon:{n:'Autoblinda AB 41', w:'20 mm Breda', snd:'flak20', shape:'ab41', cost:3500, pow:.85},
    apc:  {n:'SPA-Viberti AS.42', w:'transport', snd:'naval', shape:'zis5', mt:'tire', mv:7, cost:3500},
    tank: {n:'Carro Armato M13/40', w:'47/32 gun', snd:'gun50', shape:'m1340', pow:.8, arm:1.1, mv:5, cost:5000},
    mtank:{n:'Semovente da 75/18', w:'75 mm howitzer', snd:'gun75', shape:'semovente', pow:.95, cost:7000},
    art:  {n:'Cannone da 75/27', w:'75 mm field gun', snd:'howitzer', shape:'m2a1', pow:.9},
    rkt:  {n:'Obice da 149/13', w:'149 mm howitzer', snd:'howitzer', shape:'m30', rng:[3,5], mt:'tire', mv:4, cost:11000},
    aa:   {n:'Breda 20/65', w:'20 mm', snd:'flak20', shape:'k61', mt:'tire'},
    ftr:  {n:'Macchi C.202 Folgore', w:'2x 12.7 mm Breda-SAFAT', snd:'strafeGer', shape:'mc202'},
    bmr:  {n:'Savoia-Marchetti SM.79', w:'bombs', snd:'bombs', shape:'sm79'},
    eng:  {n:'Guastatori', w:'demolition charges & flamethrowers', snd:'flamer'},
    mortar:{n:'Mortaio da 81/14', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'Breda M37 Nest', w:'8 mm Breda M37', snd:'bren', shape:'nest'},
    pak:  {n:'Caposaldo with 47/32', w:'47 mm gun in a stone strongpoint', snd:'gun50', shape:'casemate', pow:.85},
  }};
NATION.uk42 = {n:'Britain', adj:'British', short:'Eighth Army', side:'allies',
  col:{m:'#c8b48a', d:'#8a7650', ui:'#c9473f', team:'#c9473f', hi:'#e8dcc0'},   // Light Stone
  uniform:'#b8a070', helmet:'brodie', star:'ukflash',
  u:{
    inf:  {n:'Rifle Section', w:'Lee-Enfield No. 1 & Bren', snd:'bren'},
    at:   {n:'Boys Anti-tank Rifle Team', w:'.55 in Boys rifle', snd:'ptrd', pow:.85, cost:2500},
    recon:{n:'Marmon-Herrington Mk II', w:'Boys rifle & Bren', snd:'bren', shape:'marmon', cost:3000, pow:.7},
    apc:  {n:'Universal Carrier', w:'Bren', snd:'bren', shape:'carrier', mv:7, cost:4000},
    tank: {n:'Crusader II', w:'QF 2-pounder', snd:'gun37', shape:'crusader', mv:7, pow:.8, cost:5500},
    mtank:{n:'M3 Grant', w:'75 mm M2 in the hull & 37 mm', snd:'gun75', shape:'grant', cost:9000},
    htank:{n:'Matilda II', w:'QF 2-pounder', snd:'gun37', shape:'matilda', mv:3, pow:.75, arm:.62, cost:10000},
    art:  {n:'QF 25-pounder', w:'87.6 mm gun-howitzer', snd:'howitzer', shape:'pdr25', pow:1.1},
    rkt:  {n:'BL 5.5-inch Medium Gun', w:'5.5 in gun', snd:'howitzer', shape:'pdr25', rng:[3,5], mt:'tire', mv:4, cost:12000},
    aa:   {n:'Bofors 40 mm', w:'40 mm', snd:'bofors', shape:'k61', mt:'tire'},
    ftr:  {n:'Hurricane Mk IIc (trop)', w:'4x 20 mm Hispano', snd:'strafeUK', shape:'hurricanet'},
    bmr:  {n:'Kittyhawk Mk I (112 Squadron)', w:'.50 cal & a 500 lb bomb', snd:'bombs', shape:'kittyhawk'},
    eng:  {n:'Royal Engineers', w:'mine detectors, Bangalore torpedoes & Sten', snd:'bangalore'},
    mortar:{n:'ML 3-inch Mortar', w:'3 in mortar', snd:'mortar'},
    nest: {n:'Vickers MG Sangar', w:'.303 Vickers', snd:'bren', shape:'nest'},
    pak:  {n:'6-pounder in a Gun Pit', w:'QF 6-pounder, dug in', snd:'gun50', shape:'casemate'},
  }};
NATION.ffl = {n:'Free France', adj:'Free French', short:'1re Brigade Française Libre', side:'allies',
  col:{m:'#c0aa80', d:'#867050', ui:'#1c3a8a', team:'#3a5ac0', hi:'#e0d8c0'},
  uniform:'#b0a070', helmet:'brodie', star:'lorraine',
  u:{
    inf:  {n:'Légionnaires (13e DBLE)', w:'Lebel rifles & Bren', snd:'bren'},
    at:   {n:'Boys Anti-tank Rifle Team', w:'.55 in Boys rifle', snd:'ptrd', pow:.85, cost:2500},
    recon:{n:'Bren Carrier', w:'Bren', snd:'bren', shape:'carrier', mt:'tread', mv:7, cost:3500},
    art:  {n:'Canon de 75 mle 1897', w:'75 mm field gun, over open sights at tanks', snd:'howitzer', shape:'m2a1', pow:1.1, powArm:1.3},
    aa:   {n:'Bofors 40 mm', w:'40 mm', snd:'bofors', shape:'k61', mt:'tire'},
    ftr:  {n:'Hurricane (Desert Air Force)', w:'4x 20 mm Hispano', snd:'strafeUK', shape:'hurricanet'},
    eng:  {n:'Sapeurs', w:'mines & demolition charges', snd:'bangalore'},
    mortar:{n:'Mortier Brandt 81 mm', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'Hotchkiss MG Nest', w:'8 mm Hotchkiss', snd:'bar', shape:'nest'},
    pak:  {n:'75 in a Gun Pit', w:'75 mm mle 1897, dug in', snd:'gun75', shape:'casemate'},
  }};
/* a gun can carry its own damage table (the 88 was a flak gun that killed tanks) */
const _baseDmgDesert = baseDmg;
baseDmg = function (a, d) { if (a && a.dmg && a.dmg[d.role] != null) return a.dmg[d.role]; return _baseDmgDesert(a, d); };
MOOD_ALIAS.dak = 'ger'; MOOD_ALIAS.uk42 = 'uk'; MOOD_ALIAS.ffl = 'fr';

/* ---------- vehicles and aircraft ---------- */
Object.assign(TANKS, {
  pz3l:     {x0:3, L:25, hullH:6, glacis:2, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:12, th:1}, wheels:'torsion'},
  pz4f2:    {x0:3, L:26, hullH:6, glacis:2, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:13, th:1, brake:1}, wheels:'small8'},
  m1340:    {x0:4, L:23, hullH:6, glacis:4, tur:{x:10, w:7, h:4, sh:'box'}, gun:{len:6, th:.8}, wheels:'small8', rivets:1},
  semovente:{x0:4, L:22, hullH:7, glacis:5, tur:{x:12, w:10, h:4, sh:'box'}, gun:{len:5, th:1.3}, wheels:'small8', rivets:1},
  crusader: {x0:2, L:27, hullH:6, glacis:3, tur:{x:11, w:10, h:5, sh:'box'}, gun:{len:7, th:.8}, wheels:'christie'},
  grant:    {x0:2, L:26, hullH:9, glacis:4, tur:{x:12, w:7, h:4, sh:'cast', cupola:1}, gun:{len:6, th:.7}, wheels:'vvss', tall:1, hullgun:1, rivets:1},
  valentine:{x0:3, L:24, hullH:7, glacis:2, tur:{x:10, w:8, h:4, sh:'box'}, gun:{len:6, th:.8}, wheels:'small8'},
});
Object.assign(WHEELED, {
  marmon: {x0:4, L:24, h:6, n:2, r:3, slopeF:4, slopeR:3, tur:{x:10, w:7, h:3, gun:5, open:1}},
  ab41:   {x0:3, L:26, h:6, n:2, r:3, slopeF:5, slopeR:4, tur:{x:11, w:8, h:4, gun:6}},
});
Object.assign(PLANES, {
  bf109f:    {len:24, nose:'pointed', top:'#c8a868', bot:'#a8bcd0', mottle:'#9a8050', spinner:'#2a2a2a', canopy:'frame', wing:'#b89858', mark:'balken'},
  ju87t:     {len:24, nose:'inline', top:'#c0a066', bot:'#a8bcd0', mottle:'#8a7040', spinner:'#2a2a2a', canopy:'long', gull:1, spats:1, bomb:1, wing:'#b09058', mark:'balken'},
  mc202:     {len:24, nose:'pointed', top:'#c8b070', bot:'#b8bcb8', mottle:'#6a6a3a', spinner:'#2a2a2a', canopy:'frame', wing:'#b8a060', mark:'savoia'},
  sm79:      {len:27, nose:'radial', top:'#c0a868', bot:'#b8bcb8', mottle:'#6a7040', spinner:'#3a3a34', canopy:'long', wing:'#b0985a', mark:'savoia', twin:1, bomb:1},
  hurricanet:{len:24, nose:'pointed', top:'#c8a870', bot:'#9ab0c8', mottle:'#8a6a48', spinner:'#202020', canopy:'frame', wing:'#b89860', mark:'raf'},
  kittyhawk: {len:24, nose:'chin', top:'#c0a06a', bot:'#9ab0c8', mottle:'#8a6a48', spinner:'#2a2a24', canopy:'frame', wing:'#b0905a', mark:'raf', shark:1, bomb:1},
  boston:    {len:27, nose:'inline', top:'#c0a06a', bot:'#9ab0c8', mottle:'#8a6a48', spinner:'#2a2a24', canopy:'long', wing:'#b0905a', mark:'raf', twin:1, bomb:1},
  p40us:     {len:24, nose:'chin', top:'#6a6a46', bot:'#a8b0b8', spinner:'#2a2a24', canopy:'frame', wing:'#5e5e40', mark:'usstarbar', bomb:1},
});

/* ---------- generals ---------- */
CAP_EXTRA.slouch = (P, L) => {                          // the Australian slouch hat, brim turned up on the left, Rising Sun badge
  const c = '#8a7450', d = shade(c, -.2);
  P.ell(24, 13.5, 16, 3.2, d); P.poly([[15, 13], [17, 4.5], [24, 6], [31, 4.5], [33, 13]], c); P.R(15.5, 10.4, 17.5, 2.6, '#6a5a3a');
  P.poly([[8, 13.5], [11, 3], [16.5, 5.5], [16, 13]], shade(c, .06)); P.circ(12.4, 8.4, 1.8, '#d8b040'); for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; P.line(12.4, 8.4, 12.4 + Math.cos(a) * 2.8, 8.4 + Math.sin(a) * 2.8, '#d8b040', .3); }
};
CAP_EXTRA.itbeard = (P, L) => {                         // the bustina, and Bergonzoli's famous forked beard
  const b = L.beard || '#3a2a20';
  P.poly([[15, 13], [19, 6], [31, 6], [34, 13]], '#7e7e56'); P.R(15, 12, 19, 2, shade('#7e7e56', -.15)); P.poly(starPts(30, 10, 1.2), '#e8e8e0');
  P.poly([[15, 22], [33, 22], [34, 30], [29, 37], [26, 45], [24, 39], [22, 45], [19, 37], [14, 30]], b);   // the barba elettrica
  P.poly([[18, 26], [24, 25], [30, 26], [28, 28], [20, 28]], shade(b, -.1)); P.R(20.5, 28, 7, 1.2, '#5a2a24');
  for (let i = 0; i < 9; i++) P.line(17 + i * 1.6, 30, 17.6 + i * 1.6, 38 + (i % 3), shade(b, .15), .25);
};
Object.assign(CO, {
  oconnor:{n:'Richard O\'Connor', nat:'uk42', rank:'Lieutenant General', nick:'The little terrier',
    bio:'Commanded the Western Desert Force in Operation Compass. With 36,000 men he destroyed an Italian army of ten divisions in two months and took 130,000 prisoners. Captured by a German patrol in April 1941, he escaped from an Italian prison camp in 1943 and commanded a corps in Normandy.',
    d2d:{txt:'Armour and recon +1 move.', mv:{armour:1}},
    cop:{n:'Across the Jebel', star:3, txt:'All ground units +2 move.', mv:{ground:2}, fx:'dust'},
    scop:{n:'Fox Killed in the Open', star:6, txt:'All units +30% firepower; enemy -1 move.', atk:{all:30}, enemyMv:-1},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#d8d4cc', jaw:1, tunic:'#b8a070', medals:true},
    say:{start:'Get across the desert and cut the road before they do.', win:'Fox killed in the open.', lose:'They got through. Damn.', power:'Keep going! Don\'t stop for anything!'}},
  morshead:{n:'Leslie Morshead', nat:'uk42', rank:'Major General', nick:'Ming the Merciless',
    bio:'A schoolteacher before the First World War and a Gallipoli veteran, he commanded the Australian 9th Division in the siege of Tobruk. "There will be no Dunkirk here," he told his men. "If we have to get out, we shall fight our way out."',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'No Dunkirk Here', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Rats of Tobruk', star:6, txt:'Infantry +40% defence and +30% firepower; all units recover 2 HP.', def:{foot:40}, atk:{foot:30}, heal:2},
    look:{cap:'slouch', face:'#e0b898', hair:'#5a4a3a', jaw:1, tunic:'#b8a070', moustache:true},
    say:{start:'Let the tanks through. Kill the infantry behind them.', win:'Tobruk holds.', lose:'Fight your way out, then.', power:'Hold on! Make them pay for every yard!'}},
  koenig:{n:'Marie-Pierre Kœnig', nat:'ffl', rank:'Général de brigade', nick:'The defender of Bir Hakeim',
    bio:'A legionnaire officer who rallied to de Gaulle in 1940. His 1st Free French Brigade held Bir Hakeim for fifteen days against the Afrikakorps and the Italian army, then broke out through the minefields at night. He commanded the Free French Forces of the Interior in 1944.',
    d2d:{txt:'Infantry and guns +15% defence.', def:{foot:15, indirect:15}},
    cop:{n:'Les 75', star:3, txt:'Artillery +40% firepower.', atk:{indirect:40}},
    scop:{n:'La Sortie', star:6, txt:'All units +2 move and +25% defence.', mv:{ground:2}, def:{all:25}},
    look:{cap:'kepi', face:'#e4bc9c', hair:'#3a3028', jaw:1, tunic:'#b0a070'},
    say:{start:'We will hold, and France will know it.', win:'Bir Hakeim held.', lose:'Every man for the gap in the minefield.', power:'Feu! Feu à volonté!'}},
  bergonzoli:{n:'Annibale Bergonzoli', nat:'it', rank:'Tenente Generale', nick:'Barba Elettrica',
    bio:'"Electric Whiskers", for his forked red beard. A hero of Spain, he commanded the XXIII Corps in Cyrenaica and led the 10th Army\'s last breakout attempt at Beda Fomm. Captured there, he spent the rest of the war in prison camps in India and the United States.',
    d2d:{txt:'Tanks +10% firepower.', atk:{armour:10}},
    cop:{n:'Avanti!', star:3, txt:'Armour +2 move.', mv:{armour:2}},
    scop:{n:'La Rottura', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'itbeard', face:'#e0b090', hair:'#8a4a2a', beard:'#8a4a2a', jaw:0, tunic:'#9a9064'},
    say:{start:'We break through, or we do not go home.', win:'The road to Tripoli is open!', lose:'There is nothing more to be done.', power:'Avanti! Avanti, Savoia!'}},
  fredendall:{n:'Lloyd Fredendall', nat:'us', rank:'Major General', nick:'II Corps',
    bio:'Commanded the US II Corps in Tunisia from a headquarters dug into a ravine seventy miles behind the front. After the defeat at Kasserine, Eisenhower replaced him with George Patton. He spent the rest of the war training troops in the United States.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Hold the Pass', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Massed Guns', star:6, txt:'Artillery +50% firepower and +1 range.', atk:{indirect:50}, rng:{indirect:1}},
    look:{cap:'helmet', stars:2, face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#7a6f4c'},
    say:{start:'Hold the pass. Nothing gets through.', win:'They\'re pulling back!', lose:'Pull back to Thala.', power:'Every gun on that road!'}},
  klopper:{n:'Hendrik Klopper', nat:'uk42', rank:'Major General', nick:'2nd South African Division',
    bio:'Promoted to command the 2nd South African Division a month before Gazala, he was left holding Tobruk with old defences, lifted minefields and no plan. He surrendered 33,000 men on 21 June 1942. Captured, he escaped from an Italian camp in 1943; a court of inquiry later cleared him.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Close the Gap', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Last Ditch', star:7, txt:'All units +35% defence; all units recover 2 HP.', def:{all:35}, heal:2},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c0a0', hair:'#7a6a5a', jaw:1, tunic:'#b8a070'},
    say:{start:'Hold the perimeter. The Eighth Army will come back.', win:'They\'ve broken off.', lose:'We cannot hold. Hoist the white flag.', power:'Every man to the wire!'}},
  arnim:{n:'Hans-Jürgen von Arnim', nat:'dak', rank:'Generaloberst', nick:'Army Group Africa',
    bio:'Commanded the 5th Panzer Army in Tunisia, then Army Group Africa after Rommel left. He and Rommel distrusted each other and their quarrel helped wreck the Kasserine offensive. He surrendered on 12 May 1943 with a quarter of a million Axis soldiers.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Ochsenkopf', star:3, txt:'Armour +20% firepower.', atk:{armour:20}},
    scop:{n:'Bridgehead Tunis', star:6, txt:'All units +30% defence and +20% firepower.', def:{all:30}, atk:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#c8c4bc', jaw:2, tunic:'#a8986a', collar:'#c03030'},
    say:{start:'We hold Tunisia, or Africa is lost.', win:'The line holds.', lose:'Africa is lost.', power:'Counter-attack!'}},
  bach:{n:'Wilhelm Bach', nat:'dak', rank:'Hauptmann', nick:'The pastor of Hellfire Pass',
    bio:'A Lutheran pastor from Mannheim, already fifty, he commanded the 1st Battalion, Schützen-Regiment 104 at Halfaya Pass, cigar in his mouth and walking stick in hand. In Operation Battleaxe his dug-in 88s destroyed a squadron of Matildas. He died a prisoner of war in Canada in 1942.',
    d2d:{txt:'Guns and anti-tank +15% firepower.', atk:{indirect:15}},
    cop:{n:'Hellfire', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Achtung, Panzer!', star:6, txt:'All units +40% firepower.', atk:{all:40}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:2, tunic:'#a8986a', collar:'#30a050', glasses:true, cane:true},
    say:{start:'Let them come up the pass. The guns are ready.', win:'Gott sei Dank.', lose:'Fall back to Sollum.', power:'Feuer! Alle Rohre!'}},
  beresford:{n:'Noel Beresford-Peirse', nat:'uk42', rank:'Lieutenant General', nick:'Western Desert Force',
    bio:'Commanded the Western Desert Force in Operation Battleaxe, which he directed from 60 miles behind the front. After its failure he was moved to Sudan and later commanded in India.',
    d2d:{txt:'Heavy tanks +15% defence.', def:{armour:15}},
    cop:{n:'Battleaxe', star:3, txt:'Armour +20% firepower.', atk:{armour:20}},
    scop:{n:'Matilda Charge', star:6, txt:'Armour +35% firepower and +1 move.', atk:{armour:35}, mv:{armour:1}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#a89878', jaw:1, tunic:'#b8a070', moustache:true},
    say:{start:'Relieve Tobruk. The Matildas lead.', win:'The pass is ours.', lose:'Call it off.', power:'Matildas, advance!'}},
});
for (const k of Object.keys(CO_BY_NAT)) delete CO_BY_NAT[k];
for (const [id, c] of Object.entries(CO)) (CO_BY_NAT[c.nat] = CO_BY_NAT[c.nat] || []).push(id);
CO_BY_NAT.dak.unshift('rommel'); CO_BY_NAT.uk42.push('monty', 'horrocks');
Object.assign(CO_PERSONA, {oconnor:'aggressive', morshead:'cautious', koenig:'cautious', bergonzoli:'aggressive', fredendall:'cautious', klopper:'cautious', arnim:'methodical', bach:'cautious', beresford:'methodical'});
Object.assign(BARKS, {
  it:{sel:['Signorsì!', 'Agli ordini!', 'Avanti!'], veh:['Avanti!', 'In marcia!'], atk:['Fuoco!', 'Tirate!', 'Avanti, Savoia!'], kill:['Colpito!', 'Distrutto!'], hurt:['Barelliere!', 'Al riparo!', 'Ritirata!']},
});

/* ---------- the battles ---------- */
/* a dry watercourse winding across the map (only over open ground) */
const wadi = (b, pts, wig = .3) => b.path(pts, (x, y) => { if ('.d,'.includes(b.get(x, y))) b.set(x, y, 'W'); }, wig);
const DESERT_MISSIONS = {
  bedafomm:{name:'Beda Fomm', place:'The Via Balbia south of Benghazi', date:'5 February 1941, 12:00', theme:'desert', weather:'overcast',
    p1:{nat:'uk42', co:'oconnor', funds:0, u:{recon:{n:'Rolls-Royce Armoured Car (11th Hussars)', shape:'daimler'}, tank:{n:'Cruiser Mk IV (A13)', shape:'a13', w:'QF 2-pounder'}, at:{n:'2-pounder Portee Crew', w:'QF 2-pounder on a lorry', snd:'gun37'}}},
    p2:{nat:'it', co:'bergonzoli', funds:0},
    objective:{win:'kill', role:'tank', n:8, escape:[4, 20, 8, 21], flee:'always', limit:12}, goal:'Stop the 10th Army\'s column: destroy 8 M13/40 tanks before any of them gets down the road to Agedabia, by {limit}.',
    brief:'The Italian 10th Army is abandoning Cyrenaica, streaming south down the coast road towards Tripolitania with its tanks, guns and 20,000 men. O\'Connor has sent a flying column, Combeforce, 150 miles straight across the desert to get in front of it. You have reached the road at Sidi Saleh half an hour ahead of them: armoured cars, a battalion of the Rifle Brigade, a battery of 25-pounders and a few anti-tank guns. Block the road. The 4th Armoured Brigade is coming up behind the column.',
    clock:{start:'1941-02-05T12:00', step:120},
    build:() => { const b = MB(38, 22, '.', 8101);
      b.rect(0, 0, 2, 21, '~').rect(3, 0, 3, 21, 's');
      b.blobs('d', 9, 4, 0, 11, 21, 1, 2).blobs(',', 5, 12, 0, 37, 21, 1, 2);
      wadi(b, [[37, 13], [29, 16], [21, 18], [15, 21]]); wadi(b, [[20, 0], [16, 5], [8, 8]]);
      b.road([[37, 0], [31, 5], [24, 9], [17, 13], [11, 17], [6, 21]]);
      b.rect(22, 11, 25, 13, '^');                                          // the Pimple
      b.put([[26, 7, 'c'], [9, 17, 'C'], [14, 20, 'Q'], [36, 2, 'q'], [30, 14, 'c'], [6, 10, 'c'], [19, 3, 'c']]);
      return b.rows(); },
    units:{1:'recon*2 7,13-12,15; inf*4 7,15-13,19; at*4 8,15-13,18; nest*2 9,16-12,17; art*3 11,18-15,20; mortar 10,19',
      2:'tank*6 27,2-36,8; tank*4 22,6-30,11; inf*4 24,2-33,9; art*2 30,1-35,4; recon*2 20,8-26,11; apc*2 28,3-34,7 +inf; aa 33,1'},
    events:[{day:2, team:1, say:'The 4th Armoured Brigade arrives on the column\'s flank at Beda Fomm.', spawn:'tank*5 32,14-37,20; recon 34,12'},
      {day:3, team:2, say:'Bergonzoli throws the column\'s infantry and guns at the roadblock to clear a way for the tanks.', spawn:'inf*3 30,0-37,3; art 35,1'},
      {day:4, team:1, say:'Hurricanes of 3 RAAF Squadron strafe the column.', hurt:1}]},
  tobruk41:{name:'Tobruk: the Easter Battle', place:'Post R33 and the El Adem road', date:'14 April 1941, 05:20', theme:'desert', weather:'clear',
    p1:{nat:'uk42', co:'morshead', funds:2000, u:{inf:{n:'Australian Rifle Section (2/17th Bn)', w:'SMLE & Bren'}, htank:{n:'Matilda II (D Sqn, 7th RTR)'}}},
    p2:{nat:'dak', co:'rommel', funds:0, u:{tank:{n:'Panzer III Ausf. G', w:'5 cm KwK 38 L/42', shape:'pz3'}, mtank:{n:'Panzer IV Ausf. D', w:'7.5 cm KwK 37 L/24', shape:'pz4d', pow:.95}}},
    objective:{win:'survive', days:7}, goal:'Hold the Tobruk perimeter until {survive}. Keep at least half your posts.',
    brief:'Rommel has chased the British out of Cyrenaica in two weeks, but Tobruk, with its harbour, is still holding out behind him: the Australian 9th Division in the old Italian perimeter, thirty miles of wire, an anti-tank ditch and concrete posts. In the night German infantry cut a gap in the wire near Post R33. At dawn the 5th Panzer Regiment will drive through it. General Morshead\'s orders: let the tanks pass, kill the infantry behind them, and leave the panzers to the 25-pounders of the Royal Horse Artillery.',
    clock:{start:'1941-04-14T05:20', step:120},
    build:() => { const b = MB(36, 22, '.', 8202);
      b.rect(0, 0, 35, 2, '~').rect(0, 3, 35, 3, 's');
      b.blobs('d', 4, 0, 16, 35, 21, 1, 2).blobs(',', 4, 0, 5, 35, 12, 1, 2);
      wadi(b, [[0, 11], [8, 12], [14, 10]]); wadi(b, [[35, 12], [27, 11], [23, 13]]); wadi(b, [[6, 21], [9, 18]]);
      b.rect(26, 18, 35, 19, 'E', ['.', 'd', ',', 'W']);                    // the escarpment south-east of the perimeter
      b.road([[18, 21], [18, 4]]).road([[0, 9], [35, 9]]);
      b.rect(0, 15, 35, 15, 'w').rect(0, 16, 35, 16, 'z');                  // the wire and the anti-tank ditch of the Red Line
      b.rect(17, 15, 19, 16, '.');                                          // the gap cut in the night at R33
      b.scatter('m', .35, 0, 17, 35, 17, ['.', 'd', ',', 'W']);
      b.put([[3, 14, 'B'], [8, 14, 'B'], [13, 14, 'B'], [22, 14, 'B'], [27, 14, 'B'], [32, 14, 'B'], [10, 10, 'B'], [25, 10, 'B']]);
      b.town(18, 5, 5, 'C', 2, '.');
      b.put([[18, 4, 'Q'], [12, 3, 'P'], [5, 7, 'C'], [31, 7, 'C'], [18, 12, 'C'], [18, 21, 'q'], [4, 20, 'c'], [32, 21, 'c']]);
      return b.rows(); },
    units:{1:'inf*6 3,14-32,14; inf*2 10,10-25,10; at*2 14,12-22,13; nest*2 8,14-27,14; art*4 12,7-24,8; aa*2 14,6-22,9; htank*2 16,6-20,7; tank 22,6; mortar*2 8,11-28,11',
      2:'tank*6 14,18-22,21; mtank*2 15,19-21,21; inf*4 12,17-24,18; eng*2 16,17-20,17; recon*2 8,19-28,20; art*2 16,20-20,21; bmr 6,20-30,21'},
    events:[{day:2, team:2, say:'Stukas dive on the gun positions at Pilastrino.', spawn:'bmr 0,20-35,21'},
      {day:3, team:2, say:'The second wave of the 5th Panzer Regiment comes through the gap.', spawn:'tank*4 15,20-21,21; inf*2 14,20-22,21'},
      {day:3, team:1, say:'Cruisers of the 1st Royal Tank Regiment come up from the harbour.', spawn:'tank*2 14,4-22,5'},
      {day:6, team:2, say:'The Ariete Division probes the western sector.', spawn:'tank*3 0,17-4,21; inf*2 0,18-3,21'}]},
  birhakeim:{name:'Bir Hakeim', place:'The box at Bir Hakeim, southern end of the Gazala line', date:'2 June 1942, 06:00', theme:'desert', weather:'clear',
    p1:{nat:'ffl', co:'koenig', funds:2000},
    p2:{nat:'dak', co:'rommel', funds:0},
    objective:{win:'survive', days:9}, goal:'Hold the Bir Hakeim box until {survive}, and keep at least half your positions.',
    brief:'The southern anchor of the Gazala line is a desert well and an old Ottoman fort, ringed by minefields: the 1st Free French Brigade, 3,700 legionnaires, colonial infantry and marines, with 75 mm field guns that will fire over open sights at tanks. On 27 May the Ariete Division charged the minefields and lost 32 tanks. Now Rommel has come himself, with the 90th Light Division, the Trieste and the 15th Panzer, and the Luftwaffe overhead. Water and ammunition are running short. Hold, and buy the Eighth Army the time it needs.',
    clock:{start:'1942-06-02T06:00', step:180},
    build:() => { const b = MB(34, 22, '.', 8303);
      b.blobs('d', 8, 0, 0, 33, 21, 1, 2);
      wadi(b, [[0, 6], [6, 4], [10, 0]]); wadi(b, [[33, 15], [27, 18], [24, 21]]);
      for (let y = 0; y < 22; y++) for (let x = 0; x < 34; x++) { const r = Math.hypot((x - 17) * .85, y - 11); if (r > 6.2 && r < 8.4 && b.R() < .85) b.set(x, y, 'm'); }   // the mine belt, in a ring
      for (let y = 0; y < 22; y++) for (let x = 0; x < 34; x++) { const r = Math.hypot((x - 17) * .85, y - 11); if (r > 2 && r < 5 && b.R() < .18) b.set(x, y, 'z'); }
      b.put([[17, 11, 'Q'], [14, 8, 'B'], [20, 8, 'B'], [13, 13, 'B'], [21, 13, 'B'], [17, 6, 'B'], [17, 16, 'B'], [15, 11, 'C'], [19, 11, 'C'], [17, 13, 'C']]);
      b.put([[2, 2, 'g'], [31, 2, 'k'], [31, 19, 'k'], [3, 19, 'k'], [30, 11, 'q']]);
      return b.rows(); },
    units:{1:'inf*6 12,7-22,15; art*4 13,9-21,13; at*2 14,10-20,12; nest*3 13,7-21,15; pak*2 14,8-20,14; mortar*2 15,9-19,13; aa 17,12; recon 16,10',
      2:'inf*4 26,3-32,8; inf*4 26,14-32,19; tank*4 27,8-32,13; mtank*2 29,9-32,12; art*3 31,4-33,17; eng*2 25,9-27,13; bmr*2 30,0-33,2; recon*2 1,4-4,17'},
    events:[{day:2, team:2, say:'Stukas: the Luftwaffe flies 1,400 sorties against the box.', spawn:'bmr*2 0,0-33,1'},
      {day:3, team:1, say:'Kittyhawks and Hurricanes of the Desert Air Force fight over the box.', spawn:'ftr*2 15,10-19,12'},
      {day:4, team:2, say:'Rommel brings up the 15th Panzer Division from the north.', spawn:'tank*3 12,0-22,2; mtank 16,0'},
      {day:5, team:1, say:'A supply convoy of the 7th Motor Brigade gets through with water and shells.', hurt:0},
      {day:6, team:2, say:'Kampfgruppe Baade attacks from the north under a smoke screen.', spawn:'inf*3 10,0-24,2; eng 17,1'}]},
  alamein:{name:'El Alamein: Operation Lightfoot', place:'The Devil\'s Gardens, Miteiriya Ridge to Kidney Ridge', date:'23 October 1942, 21:40', theme:'desert', weather:'clear', fog:true,
    p1:{nat:'uk42', co:'monty', funds:4000, u:{mtank:{n:'M4A1 Sherman', w:'75 mm M3', shape:'sherman'}, htank:{n:'Valentine Mk III', w:'QF 2-pounder', shape:'valentine', mv:4, arm:.72, pow:.8}, tank:{n:'Crusader III', w:'QF 6-pounder', snd:'gun50', pow:.95}, at:{n:'6-pounder Anti-tank Crew', w:'QF 6-pounder', snd:'gun50', pow:1}}},
    p2:{nat:'dak', co:'rommel', funds:0},
    objective:{win:'hq', limit:17}, goal:'Clear lanes through the Devil\'s Gardens, break the Axis line and take Tel el Aqqaqir by {limit}.',
    brief:'At 21:40, 882 guns open the heaviest barrage since 1918. Behind it the infantry of the 51st Highland, 2nd New Zealand and 9th Australian Divisions walk forward into the "Devil\'s Gardens": half a million mines in belts five miles deep. Royal Engineers with the new Polish mine detectors must clear and tape lanes for the armour following behind. Beyond the minefields the Panzerarmee waits with dug-in 88s. Stumme commands tonight; Rommel is on sick leave in Austria, and he will be back.',
    clock:{start:'1942-10-23T21:40', step:120},
    build:() => { const b = MB(40, 24, '.', 8404);
      b.rect(0, 0, 39, 1, '~').rect(0, 2, 39, 2, 's');
      b.road([[0, 4], [39, 4]]);                                             // the coast road and the railway
      b.rect(0, 22, 39, 23, 'v');                                           // the edge of the Qattara Depression
      b.blobs('d', 6, 0, 5, 39, 21, 1, 2);
      wadi(b, [[39, 7], [33, 10], [29, 9]]); wadi(b, [[8, 21], [5, 16], [7, 12]]);
      b.rect(10, 9, 13, 12, '^').rect(18, 15, 22, 16, '^');                 // Kidney Ridge and Miteiriya Ridge
      for (const x0 of [24, 15]) for (let y = 3; y < 22; y++) for (let x = x0; x < x0 + 3; x++) if (b.R() < .82 && !['=', 's'].includes(b.get(x, y))) b.set(x, y, b.R() < .2 ? 'w' : 'm');   // the February and January belts
      b.put([[20, 7, 'B'], [20, 12, 'B'], [20, 18, 'B'], [11, 6, 'B'], [11, 14, 'B'], [11, 19, 'B']]);
      b.put([[3, 12, 'q'], [37, 12, 'Q'], [36, 4, 'C'], [38, 19, 'F'], [37, 7, 'A'], [6, 4, 'k'], [5, 18, 'k'], [17, 4, 'c'], [29, 18, 'c'], [2, 6, 'g']]);
      return b.rows(); },
    units:{1:'eng*6 27,4-31,20; inf*8 27,5-32,20; at*2 30,8-32,16; art*6 34,5-37,19; mtank*4 33,8-36,16; tank*3 33,5-36,19; htank*2 32,14-35,18; bmr*2 37,6-38,8; ftr 38,9',
      2:'pak*4 19,6-21,18; nest*4 12,5-22,20; inf*6 12,6-22,18; at*2 9,8-13,16; tank*4 4,8-9,16; mtank*2 5,10-8,14; art*3 2,6-6,18; mortar*2 13,9-17,15'},
    events:[{day:1, team:1, say:'The barrage: 882 guns fire on the Axis positions for twenty minutes.', hurt:2},
      {day:3, team:2, say:'The 15th Panzer and Littorio Divisions counter-attack at Kidney Ridge.', spawn:'tank*3 0,9-3,15; mtank 1,12'},
      {day:4, team:2, say:'Rommel is back from Austria and takes command.', hurt:0},
      {day:5, team:1, say:'The Desert Air Force bombs the panzer reserve: "Boston" raids every hour.', spawn:'bmr*2 36,5-38,8'},
      {day:7, team:2, say:'The 21st Panzer Division comes north from the southern sector.', spawn:'tank*2 0,17-3,21; mtank*2 0,14-3,18'}]},
  kasserine:{name:'Kasserine Pass', place:'Kasserine Pass and the road to Thala', date:'20 February 1943, 07:00', theme:'tunisia', weather:'rain',
    p1:{nat:'us', co:'fredendall', funds:3000, u:{tank:{n:'M3 Stuart', w:'37 mm M6', shape:'stuart', pow:.75, cost:5000}, mtank:{n:'M3 Lee', w:'75 mm M2 & 37 mm M5', shape:'grant', cost:9000}, htank:{n:'M4A1 Sherman', w:'75 mm M3', shape:'sherman', pow:.95, arm:.95, mv:5, cost:11000}, recon:{n:'M3A1 Scout Car', w:'.50 cal', shape:'m3ht', snd:'m2hb'}, ftr:{n:'P-40F Warhawk', shape:'p40us'}, bmr:{n:'P-40F Warhawk (bombs)', shape:'p40us'}}},
    p2:{nat:'dak', co:'rommel', funds:0, u:{rkt:{n:'Nebelwerfer 41'}}},
    objective:{win:'survive', days:8}, goal:'Hold the road to Thala until {survive}. Keep at least half your positions.',
    brief:'The US II Corps is spread thin along the Tunisian mountains. Its commander has dug himself a bunker seventy miles behind the front. Rommel has seen the chance: his battle group has torn through at Sidi Bou Zid and now hits Kasserine Pass, held by engineers, a few infantry and tank destroyers. Your troops are brave but new to this, and the Germans are veterans. If the pass falls, Rommel can reach the Allied supply dumps at Tébessa. Hold the road until help arrives.',
    clock:{start:'1943-02-20T07:00', step:180},
    build:() => { const b = MB(30, 26, '.', 8505);
      b.rect(0, 0, 9, 25, '^').rect(20, 0, 29, 25, '^');                     // Djebel Chambi and Djebel Semmama
      b.rect(0, 5, 6, 21, 'E').rect(23, 5, 29, 21, 'E');                    // the rock walls of the pass: no vehicle climbs them
      b.rect(7, 9, 8, 16, 'E').rect(21, 9, 22, 16, 'E');                    // the narrows
      b.scatter('T', .35, 0, 0, 29, 25, ['^']).blobs(',', 6, 9, 0, 20, 25, 1, 2, ['.']);
      b.river([[14, 25], [13, 17], [16, 9], [14, 0]], .2);                   // the Hatab river
      b.road([[15, 25], [15, 0]]).road([[15, 4], [29, 4]]);
      b.put([[15, 2, 'Q'], [12, 3, 'C'], [18, 5, 'C'], [11, 20, 'c'], [19, 22, 'c'], [15, 25, 'q'], [26, 3, 'F'], [24, 1, 'A']]);
      b.put([[13, 12, 'B'], [17, 12, 'B']]);
      return b.rows(); },
    units:{1:'inf*4 11,9-19,14; eng*2 13,11-17,13; at*2 12,10-18,14; htank 14,6; mtank*2 13,5-17,7; tank*2 12,4-18,6; art*3 13,1-17,3; recon 15,8',
      2:'tank*6 11,20-19,24; mtank*3 12,22-18,25; inf*6 10,18-20,23; eng*2 13,19-17,21; recon*2 12,23-18,25; art*2 14,24-16,25; rkt 15,23; bmr*2 10,24-20,25'},
    events:[{day:2, team:2, say:'The 10th Panzer Division joins the attack. The pass is breaking.', spawn:'tank*3 12,24-18,25; mtank 15,25'},
      {day:3, team:1, say:'Combat Command B of the 1st Armored Division comes up from the Sbiba gap.', spawn:'htank*2 22,3-27,5; tank*2 24,4-28,5'},
      {day:5, team:1, say:'The guns of the US 9th Division arrive after an 800-mile drive in four days.', spawn:'art*4 10,0-20,2'},
      {day:6, team:2, say:'Stukas and Fw 190s strike the gun lines.', spawn:'bmr*2 10,24-20,25'}]},
  tunis:{name:'The Fall of Tunis', place:'The Medjerda valley to Tunis', date:'6 May 1943, 03:00', theme:'tunisia', weather:'clear',
    p1:{nat:'uk42', co:'horrocks', funds:6000, u:{htank:{n:'Churchill Mk III', w:'QF 6-pounder', shape:'churchill', mv:3, arm:.68, pow:.9, cost:12000}, mtank:{n:'M4A2 Sherman', w:'75 mm M3', shape:'sherman'}, tank:{n:'Crusader III', w:'QF 6-pounder', snd:'gun50', pow:.95}, at:{n:'6-pounder Anti-tank Crew', w:'QF 6-pounder', snd:'gun50', pow:1}, bmr:{n:'Boston III', w:'2,000 lb of bombs', shape:'boston'}}},
    p2:{nat:'dak', co:'arnim', funds:0},
    objective:{win:'hq', limit:14}, goal:'Break through at Medjez el Bab and take Tunis by {limit}.',
    brief:'The Axis armies in Africa are trapped in a shrinking bridgehead around Tunis and Bizerte, with the sea at their backs and the Royal Navy waiting. Operation Vulcan has worn them down; now Operation Strike will finish it. Horrocks has 600 guns and the Desert Air Force overhead. The 4th Indian and 4th British Divisions will punch the hole at dawn; the 6th and 7th Armoured Divisions will drive through it, straight down the valley, for Tunis.',
    clock:{start:'1943-05-06T03:00', step:120},
    build:() => { const b = MB(40, 22, '.', 8606);
      b.blobs('^', 9, 0, 0, 39, 21, 1, 2).blobs(',', 10, 0, 0, 39, 21, 1, 2).blobs('T', 6, 0, 0, 39, 21, 1, 1, ['.', ',']);
      b.river([[39, 18], [28, 15], [18, 16], [8, 13], [0, 12]], .2);         // the Medjerda
      b.road([[39, 11], [26, 10], [14, 9], [0, 8]]).road([[28, 0], [28, 21]]);
      b.town(5, 8, 7, 'k', 3, '.');
      b.put([[3, 8, 'q'], [37, 11, 'Q'], [36, 4, 'F'], [38, 19, 'A'], [30, 11, 'C'], [20, 9, 'c'], [12, 5, 'c'], [14, 17, 'c'], [2, 2, 'g'], [2, 18, 'e']]);
      b.put([[24, 7, 'B'], [24, 13, 'B'], [16, 6, 'B'], [16, 12, 'B']]);
      return b.rows(); },
    units:{1:'inf*6 30,7-34,15; htank*3 32,8-35,14; mtank*4 33,9-37,13; tank*3 34,6-37,16; art*5 35,4-38,18; at*2 31,9-33,13; eng*2 31,10-33,12; bmr*3 37,2-39,5; ftr 38,6',
      2:'nest*3 23,6-25,14; pak*2 15,6-17,12; inf*6 14,4-26,16; at*2 18,7-22,13; tank*3 8,6-12,12; mtank 9,9; htank 6,10; art*2 4,5-8,14; aa 6,8'},
    events:[{day:1, team:1, say:'Six hundred guns fire on a front of 3,000 yards.', hurt:2},
      {day:2, team:1, say:'The "Tedder carpet": the Desert Air Force flies 2,000 sorties.', spawn:'bmr*2 37,1-39,4'},
      {day:4, team:2, say:'The last Tigers of s.Pz.Abt. 504 counter-attack.', spawn:'htank 0,7-2,10'}]},
  halfaya:{name:'Halfaya Pass: "Hellfire Pass"', place:'Halfaya Pass on the Egyptian frontier', date:'15 June 1941, 05:15', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'bach', funds:1000}, income:{1:.75},
    p2:{nat:'uk42', co:'beresford', funds:0, u:{inf:{n:'Rifle Section (11th Indian Bde)', w:'SMLE & Bren'}}},
    objective:{win:'survive', days:10, hold:4}, goal:'Hold Halfaya Pass against Operation Battleaxe until {survive}. Lose two of your five positions and the battle is lost.',
    brief:'Churchill has sent 238 tanks to Egypt in the "Tiger" convoy and wants Tobruk relieved. Operation Battleaxe opens at Halfaya Pass, the gap in the coastal escarpment that the British call "Hellfire Pass". Holding it: the 1st Battalion of Schützen-Regiment 104 under Hauptmann Wilhelm Bach, a fifty-year-old Lutheran pastor, with four 8.8 cm flak guns dug in so deep only their barrels show. The Matildas of the 4th Royal Tank Regiment are coming up the coast and along the top of the escarpment.',
    clock:{start:'1941-06-15T05:15', step:120},
    build:() => { const b = MB(34, 24, '.', 8707);
      b.rect(0, 0, 33, 1, '~').rect(0, 2, 33, 2, 's');
      b.rect(0, 10, 33, 12, 'E');                                           // the escarpment
      b.rect(15, 10, 17, 12, '.');                                          // Halfaya Pass
      b.road([[33, 5], [16, 6], [16, 13], [0, 16]]).road([[0, 5], [16, 6]]);
      b.blobs('d', 6, 0, 3, 33, 9, 1, 2, ['.']).blobs('d', 6, 0, 13, 33, 23, 1, 2, ['.']);
      wadi(b, [[33, 18], [25, 20], [20, 23]]); wadi(b, [[0, 21], [6, 19], [10, 23]]);
      b.put([[12, 9, 'B'], [20, 9, 'B'], [14, 14, 'B'], [19, 14, 'B'], [16, 8, 'C'], [16, 15, 'B'], [13, 18, 'C']]);
      b.put([[6, 16, 'Q'], [3, 4, 'C'], [2, 20, 'F'], [28, 4, 'c'], [30, 19, 'c'], [33, 14, 'q'], [33, 7, 'k']]);
      return b.rows(); },
    units:{1:'pak*4 12,8-20,15; inf*4 12,7-20,15; nest*2 13,9-19,9; at*2 14,13-18,14; art*2 4,15-8,17; mortar 10,15; recon 6,4',
      2:'htank*7 26,4-33,8; inf*7 25,4-32,9; art*3 31,3-33,6; htank*4 28,16-33,21; tank*3 27,17-32,22; inf*3 26,18-31,21; mortar 30,7; recon 30,14'},
    events:[{day:2, team:2, say:'The 7th Armoured Brigade\'s Crusaders swing round through the desert at Hafid Ridge.', spawn:'tank*4 30,20-33,23'},
      {day:3, team:2, say:'The 4th RTR\'s Matildas come again, with the Camerons behind them.', spawn:'htank*3 29,4-33,7; inf*3 30,5-33,8'},
      {day:5, team:1, say:'The 15th Panzer Division counter-attacks at Fort Capuzzo.', spawn:'tank*2 0,17-3,21; mtank 1,19'},
      {day:6, team:1, say:'Rommel sends the 5th Light Division round the open desert flank.', spawn:'tank*2 0,21-3,23'}]},
  tobruk42:{name:'The Fall of Tobruk', place:'The south-eastern perimeter, El Duda to the harbour', date:'20 June 1942, 05:20', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommel', funds:3000},
    p2:{nat:'uk42', co:'klopper', funds:0, u:{inf:{n:'South African Rifle Section', w:'SMLE & Bren'}, htank:{n:'Matilda II (4th RTR)'}, mtank:{n:'Valentine Mk II', shape:'valentine'}}},
    objective:{win:'hq', limit:11}, goal:'Break into the perimeter, cross the anti-tank ditch and take the harbour by {limit}.',
    brief:'A year ago Tobruk held for eight months. This time the Eighth Army has been beaten at Gazala and is falling back to Egypt; Tobruk has been left to the 2nd South African Division with old defences, half-lifted minefields and no plan for a siege. Rommel has planned this attack since 1941. At 05:20 the Stukas will hit the south-east corner of the perimeter. Then your pioneers bridge the anti-tank ditch and the panzers go through, straight for the harbour.',
    clock:{start:'1942-06-20T05:20', step:120},
    build:() => { const b = MB(36, 22, '.', 8808);
      b.rect(0, 0, 35, 2, '~').rect(0, 3, 35, 3, 's');
      b.blobs('d', 4, 0, 16, 35, 21, 1, 2);
      wadi(b, [[0, 11], [8, 12], [14, 10]]); wadi(b, [[35, 19], [28, 18], [24, 21]]);
      b.rect(0, 15, 35, 15, 'w').rect(0, 16, 35, 16, 'z');
      b.scatter('.', .4, 0, 15, 35, 15, ['w']);                             // the wire has rusted and gaps have been cut for patrols
      b.scatter('m', .15, 0, 17, 35, 17, ['.', 'd', 'W']);
      b.road([[30, 21], [18, 9], [18, 4]]).road([[0, 9], [35, 9]]);
      b.put([[3, 14, 'B'], [9, 14, 'B'], [15, 14, 'B'], [21, 14, 'B'], [27, 14, 'B'], [33, 14, 'B']]);
      b.town(18, 5, 5, 'k', 2, '.');
      b.put([[18, 4, 'q'], [12, 3, 'o'], [5, 7, 'k'], [31, 7, 'k'], [18, 12, 'k'], [30, 21, 'Q'], [33, 19, 'F'], [26, 21, 'A'], [4, 20, 'c']]);
      return b.rows(); },
    units:{1:'eng*3 24,18-32,20; inf*5 23,17-33,20; tank*5 25,19-33,21; mtank*3 27,19-32,21; art*3 30,20-35,21; at*2 25,18-31,19; bmr*3 28,19-34,21; recon*2 22,19-34,20',
      2:'inf*6 3,14-33,14; nest*3 15,14-33,14; at*2 20,12-30,13; htank*2 16,8-20,10; mtank*2 22,9-26,11; art*3 12,6-24,8; inf*3 14,5-22,8; aa 18,7'},
    events:[{day:1, team:1, say:'05:20: Stukas and bombers of Fliegerkorps X hit the perimeter in waves.', hurt:1},
      {day:2, team:1, say:'The Ariete and Trieste Divisions push in from the south.', spawn:'tank*3 18,20-24,21; inf*2 16,19-22,21'},
      {day:4, team:2, say:'The 4th RTR\'s Matildas and the Coldstream Guards counter-attack.', spawn:'htank 26,9; inf*2 28,8-31,10'}]},
};
for (const [id, m] of Object.entries(DESERT_MISSIONS)) {
  m.id = id; m.fog = !!m.fog;
  MISSIONS[id] = m;
}

/* ---------- history ---------- */
Object.assign(HISTORY, {
  bedafomm:{forces:['Combeforce: the 11th Hussars, 2nd Rifle Brigade, C Battery 4th RHA and anti-tank guns, about 2,000 men; then the 4th Armoured Brigade', 'The Italian 10th Army in retreat: about 20,000 men and over 100 M13/40 tanks'],
    win:'The road is shut. The 10th Army has nowhere left to go.', lose:'The column breaks through to Agedabia, and the 10th Army lives to fight in Tripolitania.',
    real:'Combeforce reached the coast road at Sidi Saleh half an hour before the Italian column. For two days the M13s attacked again and again, while the 4th Armoured Brigade struck the column\'s flank at a low hill the troops called "the Pimple". On the morning of 7 February the last attack died in front of the Rifle Brigade\'s anti-tank guns, and about 25,000 Italians surrendered with over 100 tanks and 216 guns. O\'Connor signalled to Wavell: "Fox killed in the open." In two months Operation Compass had taken 130,000 prisoners. Weeks later most of O\'Connor\'s force was sent to Greece, and Rommel landed at Tripoli.'},
  tobruk41:{forces:['Australian 9th Division with British artillery and tanks: about 25,000 men in the perimeter', '5th Light Division: the 5th Panzer Regiment and the 8th Machine Gun Battalion, with Italian support'],
    win:'The panzers are beaten off. Tobruk holds, a thorn in Rommel\'s side.', lose:'Tobruk falls, and the road to Egypt is open.',
    real:'In the night German infantry cut the wire near Post R33. Corporal John Edmondson of the 2/17th Battalion was mortally wounded clearing them with the bayonet and won the first Australian Victoria Cross of the war. At dawn 38 tanks drove through the gap; the Australians let them pass and pinned down the infantry behind, while the 25-pounders of the 1st Royal Horse Artillery fired over open sights. The 5th Panzer Regiment lost 17 tanks and pulled back. Tobruk held for 241 days, the first time the Blitzkrieg had been stopped. Goebbels called the garrison "rats"; they took the name with pride.'},
  birhakeim:{forces:['1st Free French Brigade: about 3,700 men of the Foreign Legion, colonial and marine infantry, with fifty-four 75 mm guns', 'The Ariete and Trieste Divisions, the 90th Light Division and part of the 15th Panzer Division, with heavy Luftwaffe support'],
    win:'Bir Hakeim holds. Rommel\'s timetable is in ruins.', lose:'The box falls early, and the Afrikakorps sweeps round the Gazala line.',
    real:'From 27 May to 11 June the Free French held Bir Hakeim against attack after attack and some 1,400 Luftwaffe sorties. On the night of 10 June, under orders, about 2,700 of them broke out through a gap in their own minefield, with Koenig riding in a car driven by the British volunteer Susan Travers, the only woman ever to serve in the Foreign Legion. The fifteen days helped the Eighth Army escape to El Alamein. Hitler had ordered that captured Free Frenchmen be treated as partisans; Rommel ignored it.'},
  alamein:{forces:['Eighth Army: about 195,000 men, 1,000 tanks and 900 guns, with complete air superiority', 'Panzerarmee Afrika: about 116,000 German and Italian soldiers and 500 tanks, short of fuel'],
    win:'The line is broken. The Axis army is in full retreat across Africa.', lose:'The break-in stalls in the minefields, and the battle becomes another slaughter.',
    real:'The barrage at 21:40 on 23 October was the heaviest since 1918. The infantry got through the first belts, but the armour jammed in the minefield lanes. Montgomery switched to what he called "crumbling" the Axis infantry, and Rommel, back from sick leave, burned his last fuel on counter-attacks at Kidney Ridge. On 2 November Operation Supercharge broke through at Tel el Aqqaqir, and on 4 November Rommel retreated against Hitler\'s orders. Days later, Allied armies landed in Morocco and Algeria. Churchill called it "the end of the beginning".'},
  kasserine:{forces:['US II Corps: inexperienced American infantry, engineers, tank destroyers and the 1st Armored Division', 'Rommel\'s battle group: the Afrikakorps assault group and the 10th and 21st Panzer Divisions'],
    win:'The pass holds. Rommel turns back.', lose:'The pass falls, and the road to the Tébessa supply dumps is open.',
    real:'On 19 and 20 February Rommel\'s veterans drove the Americans out of Kasserine Pass, and II Corps lost about 6,500 men and nearly 200 tanks in the campaign. But at Thala the British 26th Armoured Brigade and the guns of the US 9th Division, which had driven 800 miles in four days, stopped the advance, and on 22 February Rommel withdrew. Fredendall was relieved and George Patton took over II Corps. The US Army learned fast: three months later it was in Bizerte.'},
  tunis:{forces:['IX Corps: the 4th Indian, 4th British, 6th and 7th Armoured Divisions, with 600 guns', 'The remains of Army Group Africa: the 5th Panzer Army, short of fuel, shells and everything else'],
    win:'Tunis falls. The war in Africa is over.', lose:'The breakthrough fails, and the Axis bridgehead holds for a few more weeks.',
    real:'On 6 May, behind 600 guns and a carpet of bombs, the 4th Indian and 4th British Divisions broke the line in the Medjerda valley, and the armour drove through. The Derbyshire Yeomanry and the 11th Hussars entered Tunis on the afternoon of 7 May, the same day the Americans took Bizerte. On 13 May about 250,000 German and Italian soldiers surrendered, more than at Stalingrad. Von Arnim was captured; Marshal Messe surrendered the Italian First Army. "We are masters of the North African shores," Alexander signalled to Churchill.'},
  halfaya:{forces:['I./Schützen-Regiment 104, Italian gunners and four 8.8 cm flak guns', 'Western Desert Force: the 4th Indian Division, 7th Armoured Division and the Matildas of the 4th Royal Tank Regiment'],
    win:'The pass holds. Battleaxe is broken on the 88s.', lose:'The Matildas take the pass and roll on towards Tobruk.',
    real:'At dawn on 15 June the Matildas of C Squadron, 4th Royal Tank Regiment, drove up to the pass. "They are tearing my tanks to bits," their commander radioed: Bach\'s dug-in 88s knocked out 11 of the 12. Along the front Battleaxe lost 91 tanks in three days, and Rommel\'s counter-attack nearly cut off the British. Churchill replaced Wavell with Auchinleck. Wilhelm Bach was captured at Halfaya in January 1942 and died a prisoner of war in Canada that December.'},
  tobruk42:{forces:['Panzerarmee Afrika: the Afrikakorps, the 90th Light Division and the Italian XX Corps', 'Tobruk garrison: 2nd South African Division and British units, about 33,000 men'],
    win:'Tobruk falls in a day. Rommel will be a field marshal by tomorrow.', lose:'The perimeter holds, and Rommel must leave a fortress behind him again.',
    real:'At 05:20 on 20 June the Stukas hit the south-east corner of the perimeter; by 08:00 pioneers had bridged the anti-tank ditch and the panzers were through. By evening they were in the harbour. On the morning of 21 June General Klopper surrendered 33,000 men and enormous stores of fuel and food. Hitler made Rommel a field marshal. Churchill heard the news in the White House from Roosevelt: "Defeat is one thing; disgrace is another." Rommel drove on into Egypt, to El Alamein.'},
});
Object.assign(CO_FATE, {
  oconnor:'Captured in April 1941, escaped from an Italian camp in 1943, and commanded VIII Corps in Normandy. Died in 1981.',
  morshead:'Commanded the 9th Division at El Alamein and Australian forces in Borneo in 1945. Died in 1959.',
  koenig:'Commanded the French Forces of the Interior, became Military Governor in Germany and a Marshal of France after his death in 1970.',
  bergonzoli:'Captured at Beda Fomm. Repatriated in 1946, he died in 1973.',
  fredendall:'Relieved after Kasserine and sent home to train troops. Retired in 1946 and died in 1963.',
  klopper:'Escaped from captivity in Italy in 1943, cleared by a court of inquiry, and rose to be South Africa\'s chief of general staff. Died in 1978.',
  arnim:'Surrendered in Tunisia on 12 May 1943 and spent the rest of the war in a camp for generals in Britain and the United States. Died in 1962.',
  bach:'Captured at Halfaya in January 1942, he died of cancer in a Canadian prisoner-of-war camp in December 1942.',
  beresford:'Commanded in Sudan and India, and died in 1953.',
});
Object.assign(MISSION_LONLAT, {bedafomm:[20.2, 31.8], tobruk41:[23.95, 32.05], birhakeim:[23.48, 31.59], alamein:[28.9, 30.83], kasserine:[8.8, 35.2], tunis:[10.18, 36.8], halfaya:[25.15, 31.55], tobruk42:[24.0, 32.1]});
EUROPE.cities.push(['Tobruk', 23.96, 32.08], ['Benghazi', 20.07, 32.12], ['Alexandria', 29.92, 31.2], ['Tunis', 10.18, 36.8], ['Tripoli', 13.19, 32.89]);

Object.assign(UNIT_INFO, {
  'dak:aa':'The 8.8 cm Flak 18 was an anti-aircraft gun. In the desert Rommel used it against tanks: it could kill a Matilda at over a mile, far beyond the reach of any British tank gun of 1941.',
  'dak:tank':'The Panzer III Ausf. J with the long 5 cm gun was the "Mark III Special" to the British, the best tank in the desert in the spring of 1942.',
  'dak:mtank':'The Panzer IV F2 with the long 7.5 cm gun, the "Mark IV Special", outranged every British tank. In mid-1942 the Afrikakorps had only a few dozen.',
  'it:tank':'The M13/40 was a riveted 14-tonne tank with a good 47 mm gun, cramped, unreliable and easily penetrated. Italian crews called it "the self-propelled coffin", and fought in it anyway.',
  'it:inf':'The Italian infantry of 1940 was short of everything: lorries, radios, anti-tank guns. Divisions like the Folgore paratroopers at El Alamein and the Bersaglieri, with their black capercaillie feathers, fought superbly; Rommel himself praised them.',
  'uk42:htank':'The Matilda II was the "Queen of the Desert" in 1940: nothing the Italians had could penetrate its 78 mm of armour. The 88 ended its reign in 1941.',
  'uk42:mtank':'The M3 Grant carried a 75 mm gun low in a sponson, which could at last fire high-explosive shells at German anti-tank guns. It arrived just in time for Gazala.',
  'uk42:tank':'The Crusader was fast and good-looking, but unreliable, thinly armoured and armed only with a 2-pounder until 1942.',
  'ffl:art':'At Bir Hakeim the Free French used their 75 mm field guns of 1897, the famous "Soixante-Quinze", as anti-tank guns, firing over open sights at the Ariete\'s M13s.',
});
Object.assign(SPECS, {
  pz3l:['5', '21.5', '50', '40', 'about 1,550 (Ausf. J)'], pz4f2:['5', '23.6', '50', '40', '175'], m1340:['4', '14', '30', '30', 'about 780'], semovente:['3', '13.1', '50', '38', 'about 260'],
  crusader:['4', '19', '40', '43', 'about 5,300'], grant:['6', '27', '51', '42', 'about 6,250 (M3 Lee and Grant)'], valentine:['3', '16', '65', '24', 'about 8,300'],
  marmon:['4', '6', '12', '80', 'about 5,750'], ab41:['4', '7.5', '15', '78', 'about 670'],
  bf109f:['1', '2.9', '—', '635', 'about 3,850'], ju87t:['2', '4.3', 'pilot armour', '390', '—'], mc202:['1', '2.9', '—', '600', 'about 1,100'], sm79:['5', '7.7', '—', '430', 'about 1,240'],
  hurricanet:['1', '3.5', '—', '529', '—'], kittyhawk:['1', '3.6', 'pilot armour', '560', '—'], p40us:['1', '3.9', 'pilot armour', '580', '—'],
});

/* ---------- the campaigns ---------- */
CAMPAIGNS.push({id:'desert', name:'The Desert War', sub:'Beda Fomm to Tunis · 1941–1943', side:'allies', missions:['bedafomm', 'tobruk41', 'birhakeim', 'alamein', 'kasserine', 'tunis']});
{ const ax = CAMPAIGNS.find(c => c.id === 'axis'); if (ax) { ax.missions.unshift('halfaya', 'tobruk42'); ax.sub = 'Five German operations, from Hellfire Pass to the Ardennes'; } }
{ const order = ['training', 'china', 'weiss', 'gelb', 'sea', 'atlantic', 'desert', 'rising', 'pacific', 'east', 'west', 'axis'];
  CAMPAIGNS.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)); }
