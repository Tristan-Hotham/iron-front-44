/* =============================== ITALY AT WAR ===============================
   The Regio Esercito's war, 1940-1944: the Julia in the Pindus, the stand at
   Keren, the Ariete at Bir el Gubi, the Folgore at El Alamein, the garrison
   of the Gorgopotamos viaduct, the Livorno at Gela, and after the armistice
   the Italians who went back into the line beside the Allies at Monte Lungo
   and Filottrano. New terrain (mountains, olive groves, ancient ruins),
   Mediterranean and desert towns, camels, the Greek army and the Greek
   resistance, and their generals. */

/* ---------- terrain ---------- */
Object.assign(TER, {
  mountain:{n:'Mountains', def:4, mv:{foot:2, boot:3, air:1}, mm:'#8a8678', info:'Bare rock and mule tracks. No vehicle can get up here; infantry climb slowly and are very hard to shift.'},
  olive:   {n:'Olive grove', def:1, mv:{foot:1, boot:1, tread:2, tire:2, air:1}, mm:'#8a9a6a', info:'Terraced olive trees and dry-stone walls. A little cover, and slow going for vehicles.'},
  antiq:   {n:'Ancient ruins', def:3, mv:{foot:1, boot:1, tread:2, tire:2, air:1}, mm:'#d8d0b8', info:'The columns of a Greek temple or a Roman town, two thousand years old. The stones still stop bullets.'},
});
Object.assign(MAPCH, {M:['mountain'], G:['olive'], I:['antiq']});
HIDES.add('olive');
for (const k of ['mountain', 'olive', 'antiq']) { const m = TER[k].mv; if (m.tread) m.amphib = m.tread; }

/* ---------- palettes ---------- */
Object.assign(PAL, {
  greece:  {grass:'#8a9a5a', grass2:'#7a8a4e', field:'#a8a066', field2:'#9a925c', hedge:'#4a5a32', tree:'#3e5a32', tree2:'#52703e', trunk:'#4a3a28', water:'#4a7a8a', water2:'#6a9aaa', sea:'#2a6a8a', sea2:'#4a8aaa', sand:'#d4c8a0', road:'#9a8e72', road2:'#7a7058', roof:'#a85a3a', wall:'#e2d8c2', hill:'#8a8a5a', rock:'#9a968a', wheat:'#b8a868', snow:0, med:1, snowcap:1},
  eritrea: {grass:'#c4a66e', grass2:'#b49660', field:'#b8a070', field2:'#a89062', hedge:'#6a6a3a', tree:'#6a7038', tree2:'#7e8646', trunk:'#5a4630', water:'#4a7a8a', water2:'#6a9aaa', sea:'#2a6a8a', sea2:'#4a8aaa', sand:'#dcc89a', road:'#8a7a5e', road2:'#6a5e48', roof:'#d8d0c0', wall:'#ece2cc', hill:'#a88a5a', rock:'#8a7a62', wheat:'#c0a86e', snow:0, arid:1},
  sicily:  {grass:'#b8aa6a', grass2:'#a89a5e', field:'#d0b468', field2:'#c4a85e', hedge:'#5a6a38', tree:'#4e6a38', tree2:'#627e44', trunk:'#5a4630', water:'#3a7a9a', water2:'#5a9aba', sea:'#1e6a96', sea2:'#3a8ab6', sand:'#e2d2a2', road:'#a49272', road2:'#84745a', roof:'#b0603e', wall:'#e8d8b8', hill:'#b09a62', rock:'#a89a80', wheat:'#d8bc62', snow:0, med:1},
  apennine:{grass:'#7a7a5a', grass2:'#6a6a4e', field:'#8a7a58', field2:'#7a6c4e', hedge:'#3e4a30', tree:'#3a4a32', tree2:'#4a5c3e', trunk:'#3a2e22', water:'#4a5e6a', water2:'#6a7e8a', sea:'#3a5a6a', sea2:'#5a7a8a', sand:'#b8ac90', road:'#7a6e5c', road2:'#5a5044', roof:'#8a5a42', wall:'#c8bca4', hill:'#7a765a', rock:'#8a867c', wheat:'#9a8a5e', snow:0, mud:1, med:1, snowcap:1},
});
Object.assign(THEMES, {
  greece:  {n:'Greek mountains', base:'.', w:{'M':3, 'T':2, '^':2, 'G':1, 'I':1}},
  eritrea: {n:'Eritrean highlands', base:'.', w:{'M':2, '^':3, 'W':1, 'L':1}},
  sicily:  {n:'Sicilian hills', base:',', w:{'.':2, 'G':3, '^':2, 'I':1}},
  apennine:{n:'Apennines in winter', base:'.', w:{'M':3, '^':2, 'T':2, 'G':1}},
});
THEMES.desert.w.I = 1; THEMES.tunisia.w.I = 1;          // Roman Africa: Leptis, Sabratha, Dougga

Object.assign(TILE_EXTRA, {
  mountain({P, F, R, X, Y, C, N}) {                   // two or three bare peaks, lit from the west, snow on top in the high country
    F(0, 0, 32, 32, shade(C.hill, -.08));
    const peaks = [[8 + R(1) * 4, 7 + R(2) * 4, 9 + R(3) * 3], [21 + R(4) * 4, 4 + R(5) * 4, 10 + R(6) * 3], [14 + R(7) * 6, 15 + R(8) * 3, 8 + R(9) * 3]];
    for (const [px, py, w] of peaks) {
      const cx = X + px, cy = Y + py, base = Y + Math.min(31, py + w * 1.3);
      P.poly([[cx - w, base], [cx, cy], [cx + w, base]], shade(C.rock, -.18));
      P.poly([[cx - w, base], [cx, cy], [cx + w * .1, base]], shade(C.rock, .12));        // the sunlit western face
      for (let i = 0; i < 3; i++) P.line(cx + (R(px + i) - .5) * w * .8, cy + w * .5 + i * 2, cx + (R(px + i + 9) - .2) * w * .6, base - 1, shade(C.rock, -.3), .3);   // gullies
      if (C.snowcap) P.poly([[cx - w * .32, cy + w * .4], [cx, cy], [cx + w * .3, cy + w * .42], [cx + w * .1, cy + w * .3], [cx - w * .1, cy + w * .45]], '#eef2f2');
    }
    for (let i = 0; i < 6; i++) P.ell(X + R(i + 40) * 30, Y + 26 + R(i + 50) * 5, 1.2, .7, shade(C.rock, -.25));    // scree at the foot
  },
  olive({P, F, R, X, Y, C}) {                          // terraces of olive trees: twisted grey trunks, silvery crowns
    F(0, 0, 32, 32, shade(C.grass, -.04));
    for (let r = 0; r < 3; r++) { const y0 = 4 + r * 10; P.line(X, Y + y0 + 7, X + 32, Y + y0 + 7.4, shade(C.rock, -.1), .6); P.line(X, Y + y0 + 6.4, X + 32, Y + y0 + 6.8, shade(C.rock, .15), .3); }   // dry-stone terrace walls
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) {
      const tx = 4 + i * 11 + R(r * 3 + i) * 3, ty = 3 + r * 10;
      P.ell(X + tx + 1, Y + ty + 5.6, 3.6, 1.1, 'rgba(0,0,0,.18)');
      P.line(X + tx, Y + ty + 5, X + tx + .6, Y + ty + 2, '#6a5a44', .7); P.line(X + tx + .6, Y + ty + 2.6, X + tx - .6, Y + ty + 1, '#6a5a44', .4);
      P.ell(X + tx, Y + ty + .6, 3.6, 2.4, '#7a8a62'); P.ell(X + tx - .8, Y + ty, 2.2, 1.5, '#9aaa80'); P.ell(X + tx + 1.4, Y + ty + 1, 1.6, 1.2, '#6a7a52');
    }
  },
  antiq({P, F, R, X, Y, C}) {                          // a Doric temple in Greece and Sicily; a Roman arch and colonnade in Africa
    F(0, 0, 32, 32, shade(C.grass, -.03));
    const st = '#ddd4bc', sd = shade(st, -.22), sl = shade(st, .1);
    if (C.arid) {
      F(3, 20, 26, 3, sd); F(4, 19, 24, 1.4, st);
      F(5, 7, 4, 12, st); F(23, 7, 4, 12, st); F(5, 5, 22, 3, st); P.ell(X + 16, Y + 12, 7, 6, shade(C.grass, -.03)); F(9, 12, 14, 7, shade(C.grass, -.03));   // the arch
      P.line(X + 9, Y + 12, X + 9, Y + 19, sd, .5); F(5, 5, 22, .8, sl); for (let i = 0; i < 5; i++) F(6 + i * 4.4, 8, .6, 2, sd);
      for (let i = 0; i < 3; i++) { const cx = 4 + i * 4; F(cx, 23, 2, 6 - i, st); F(cx - .4, 23 + (6 - i) - .1, 2.8, .8, sd); }
    } else {
      F(2, 22, 28, 2, sd); F(3, 20.6, 26, 1.6, st); F(4, 19.4, 24, 1.4, sl);              // the stepped stylobate
      for (let i = 0; i < 6; i++) { const cx = 5 + i * 4.3, h = R(i) < .35 ? 4 + R(i + 9) * 5 : 13; F(cx, 19.4 - h, 2.4, h, st); F(cx + 1.6, 19.4 - h, .8, h, sd); F(cx - .3, 19.4 - h - .7, 3, .8, sl);
        for (let k = 3; k < h; k += 3) F(cx, 19.4 - k, 2.4, .25, sd); }                     // fluted drums, some fallen
      F(4, 4.4, 14, 2.2, st); F(4, 6.2, 14, .6, sd); P.poly([[X + 4, Y + 4.4], [X + 11, Y + 1.2], [X + 18, Y + 4.4]], sl);   // what is left of the pediment
    }
    for (let i = 0; i < 4; i++) { const fx = 3 + R(i + 20) * 26, fy = 25 + R(i + 30) * 5; P.ell(X + fx, Y + fy, 2.2, 1.2, st); P.ell(X + fx - .6, Y + fy - .4, 1.3, .6, sl); }   // fallen drums in the grass
    for (let i = 0; i < 5; i++) P.circ(X + R(i + 60) * 31, Y + R(i + 70) * 31, .5, shade(C.tree, .1));   // weeds and capers in the cracks
  },
});

/* shallows: green-grey water over sandbars, the sand showing through, surf breaking on the bars */
TILE_EXTRA.shallows = ({P, F, R, X, Y, C}) => {
  F(0, 0, 32, 32, C.sea || '#3a5a6a'); F(0, 0, 32, 32, 'rgba(210,190,140,.28)');
  for (let i = 0; i < 4; i++) { const y = 3 + i * 8 + R(i) * 3; P.ell(X + 4 + R(i + 9) * 24, Y + y, 9 + R(i + 5) * 6, 1.6, 'rgba(220,200,150,.35)'); }   // sandbars under the water
  for (let i = 0; i < 5; i++) { const y = 2 + i * 6.4 + R(i + 20) * 2; P.line(X + R(i + 30) * 8, Y + y, X + 14 + R(i + 40) * 16, Y + y + .4, 'rgba(255,255,255,.45)', .5); }   // surf
};

/* ---------- camels on the open desert ---------- */
function camel(P, x, y, s = 1, f = 0, col = '#b48a58') {          // a dromedary, standing, facing right
  const d = shade(col, -.2), l = shade(col, .12);
  P.ell(x + .5, y + 6 * s, 4 * s, .8 * s, 'rgba(0,0,0,.2)');
  for (const lx of [-2.6, -1.4, 1.6, 2.8]) P.line(x + lx * s, y + 2 * s, x + (lx + (f ? .3 : -.2)) * s, y + 5.6 * s, d, .45 * s);
  P.ell(x, y + 1.4 * s, 3.4 * s, 1.6 * s, col); P.ell(x - .3 * s, y - .2 * s, 1.8 * s, 1.5 * s, col); P.ell(x - .6 * s, y - .6 * s, 1 * s, .7 * s, l);   // body and hump
  P.line(x + 2.8 * s, y + 1 * s, x + 4.2 * s, y - 1.8 * s, col, .8 * s); P.ell(x + 4.8 * s, y - 2 * s, 1.1 * s, .55 * s, col); P.px(x + 5.2 * s, y - 2.3 * s, '#2a2018');   // neck and head
  P.line(x - 3.2 * s, y + 1 * s, x - 3.8 * s, y + 3 * s, d, .25 * s);
}
const _drawTileItaly = drawTile;
drawTile = function (g, x, y) {
  const r = _drawTileItaly(g, x, y), C = PAL[G.theme], t = terr(x, y);
  if (C && C.arid && (t === 'plain' || t === 'dune')) {
    const h = hrand(x, y, 911);
    if (h < .05) { const P = painter(g); camel(P, x * 32 + 8 + hrand(x, y, 912) * 14, y * 32 + 10 + hrand(x, y, 913) * 12, .9, hrand(x, y, 914) < .5); }
    else if (h < .065) { const P = painter(g), bx = x * 32 + 4, by = y * 32 + 14;                       // a caravan, and the man leading it
      for (let i = 0; i < 3; i++) camel(P, bx + i * 8, by + (i % 2), .75, i % 2, i === 1 ? '#a87e4e' : '#b48a58');
      P.R(bx + 25, by - 1, 1.4, 4.4, '#e8e2d0'); P.circ(bx + 25.7, by - 1.6, .8, '#e8e2d0'); P.line(bx + 25, by + 1, bx + 22, by - .6, '#5a4a30', .2); }
  }
  return r;
};

/* ---------- towns: whitewashed and domed in the desert, stone and terracotta round the Mediterranean ---------- */
const _getPropItaly = getPropSprite;
getPropSprite = function (type, owner, theme, wave = 0) {
  const C = PAL[theme] || {};
  if (type !== 'city' || (!C.arid && !C.med)) return _getPropItaly(type, owner, theme, wave);
  const nat = owner ? G.teams[owner].nat : null, key = 'town' + (C.arid ? 'A' : 'M') + (nat || '-') + theme + SET.flags + wave;
  let c = propCache.get(key); if (c) return c;
  c = mkCanvas(ART, ART + 8 * SC); const g = c.getContext('2d'), P = painter(g), Y = 8;
  const F = (a, b, w, h, col) => P.R(a, Y + b, w, h, col);
  const box = (a, b, w, h, wall) => { P.R(a + 1.4, Y + b + 1.4, w, h, 'rgba(0,0,0,.25)'); F(a, b, w, h, wall); F(a, b, w, .8, shade(wall, .1)); F(a + w - 1.2, b, 1.2, h, shade(wall, -.12)); };
  const win = (a, b) => { F(a, b, 1.6, 2.2, '#2a2e36'); F(a, b, 1.6, .4, shade(C.wall || '#e0d8c0', -.3)); };
  if (C.arid) {                                       // flat roofs, a dome, a minaret, a palm in the courtyard
    box(2, 14, 12, 14, '#ece6d6'); box(13, 9, 11, 19, '#e4dccb'); box(22, 17, 8, 11, '#efe8da');
    F(2, 14, 12, .6, '#c8bca4'); F(13, 9, 11, .6, '#c8bca4'); for (let i = 0; i < 4; i++) F(13.5 + i * 2.8, 8, 1, 1, '#e4dccb');   // parapets
    P.ell(18.5, Y + 9, 4.2, 3.6, '#f2ece0'); P.ell(17.4, Y + 8, 1.6, 1.4, '#ffffff'); F(18.2, 4.4, .6, 1.6, '#c8a040');                  // the dome
    F(26, 3, 3, 14, '#efe8da'); F(25.6, 3, 3.8, 1, '#c8bca4'); P.poly([[25.8, Y + 3], [27.5, Y], [29.2, Y + 3]], '#c8a040');           // minaret
    win(4, 18); win(8, 18); win(15, 14); win(20, 18); win(24, 21); F(6, 23, 2.4, 5, '#5a3a24'); F(16, 23, 3, 5, '#2a4a6a');
    P.line(10.5, Y + 28, 10, Y + 18, '#6a5236', .6); for (let i = 0; i < 6; i++) { const a = -2.6 + i * .5; P.line(10, Y + 18, 10 + Math.cos(a) * 5, Y + 18 + Math.sin(a) * 2.4 + 1.6, i % 2 ? '#4a6a2e' : '#5e7e38', .5); }   // date palm
  } else {                                            // ochre and white walls, terracotta roofs, a bell tower
    const roof = C.roof || '#a85a3a', wall = C.wall || '#e2d8c2';
    box(2, 15, 12, 13, wall); box(14, 12, 10, 16, shade(wall, -.06)); box(23, 18, 7, 10, shade(wall, .03));
    for (const [a, b, w] of [[1.6, 13.4, 12.8], [13.6, 10.4, 10.8], [22.6, 16.4, 7.8]]) { P.poly([[a, Y + b + 1.6], [a + 1.2, Y + b], [a + w - 1.2, Y + b], [a + w, Y + b + 1.6]], roof); for (let i = 0; i < w - 1; i += 1.4) F(a + .6 + i, b + .4, .3, 1.2, shade(roof, -.18)); }   // pantile roofs
    F(7, 2, 4, 13, shade(wall, -.1)); P.poly([[6.6, Y + 2.2], [9, Y - 2], [11.4, Y + 2.2]], roof); F(8.2, 4, 1.6, 2.4, '#2a2e36'); P.circ(9, Y + 5.6, .5, '#c8a040');   // campanile and its bell
    win(4, 19); win(16, 15); win(20, 15); win(16, 21); win(25, 21); F(10, 23, 2.4, 5, '#5a3a24'); F(19, 23, 2.4, 5, '#4a3a2a');
    F(2, 27, 28, .8, shade(wall, -.25));
    if (C.snowcap && theme === 'apennine') { F(1.6, 13.2, 12.8, .7, '#f2f4f4'); F(13.6, 10.2, 10.8, .7, '#f2f4f4'); }
  }
  const flag = (fx, fy, fw, fh) => { g.save(); g.scale(SC, SC); drawFlag(g, nat, fx, fy, fw, fh); if (wave) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(fx + fw * (.3 + wave * .2), fy, fw * .15, fh); } g.restore(); };
  F(C.arid ? 2 : 27, -6, .7, 14, '#3a3a36'); flag((C.arid ? 2 : 27) + .7, Y - 6, 9, 6);
  finish(c, {outline:'#1a1814', light:.5});
  propCache.set(key, c);
  return c;
};

/* ---------- flags and markings ---------- */
FLAG_EXTRA.gr = (g, x, y, w, h) => {                  // the Greek flag: nine stripes and the cross
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#f4f4ee' : '#1a5eae'; g.fillRect(x, y + i * h / 9, w, h / 9 + .5); }
  const cw = h * 5 / 9; g.fillStyle = '#1a5eae'; g.fillRect(x, y, cw, cw); g.fillStyle = '#f4f4ee'; g.fillRect(x + cw * .4, y, cw * .2, cw); g.fillRect(x, y + cw * .4, cw, cw * .2);
};
FLAG_EXTRA.gres = FLAG_EXTRA.gr;
MARK_EXTRA.grroundel = (P, x, y, s = 1) => { P.circ(x, y, 2.6 * s, '#1a5eae'); P.circ(x, y, 1.7 * s, '#f4f4ee'); P.circ(x, y, .9 * s, '#1a5eae'); };

/* ---------- the armies ---------- */
HELMET.gres = [[1.6, .8, 5], [1, 1.8, 6.4], [.4, 2.8, 1.6]];          // a soft cap with a short peak
Object.assign(HELMET_COL, {itgv:'#6c7056', itcb:'#6c7056', gr:'#6e6a4e', gres:'#3e3628'});
Object.assign(NAT_BASE, {itgv:'it', itcb:'it', gres:'gr'});
Object.assign(INF_WEAPONS, {
  itgv:{inf:['rifle', 'rifle', 'bren'], at:['shell', 'ptrd'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle'], cav:['rifle', 'rifle']},
  itcb:{inf:['rifle', 'rifle', 'bren'], at:['shell', 'ptrd'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle']},
  gr:  {inf:['rifle', 'rifle', 'bren'], at:['shell', 'rifle'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle'], cav:['rifle', 'rifle']},
  gres:{inf:['rifle', 'rifle', 'bren'], at:['rifle', 'rifle'], eng:['satchel', 'rifle'], mortar:['shell', 'rifle'], cav:['rifle', 'rifle']},
});
SOLDIER_EXTRA.itgv = SOLDIER_EXTRA.itcb = SOLDIER_EXTRA.it;
SOLDIER_EXTRA.gres = (P, x, y, uni) => { P.line(x + 2.4, y + 6.2, x + 6.4, y + 10.6, '#6a5232', .6); P.R(x + 3.4, y + 4.4, 2.8, 1.3, '#3a2a1e'); };   // bandolier, and a beard

NATION.itgv = {n:'Italy', adj:'Italian', short:'Regio Esercito', side:'axis',
  col:{m:'#8a8a62', d:'#5e5e42', ui:'#2e8a4a', team:'#2e8a4a', hi:'#c8c8a4'},   // grigio-verde
  uniform:'#7a7e60', helmet:'it', star:'ittac', skin:'#d8a880',
  u:{
    inf:  {n:'Fanteria', w:'Carcano M91 & Breda 30', snd:'bren', cost:900, pow:.9},
    at:   {n:'Cannone 47/32 Crew', w:'47 mm anti-tank gun', snd:'gun50', pow:.9},
    cav:  {n:'Cavalleria', w:'Moschetto 91 & sabre', snd:'charge', cost:1700},
    recon:{n:'Autoblinda AB 41', w:'20 mm Breda', snd:'flak20', shape:'ab41', cost:3500, pow:.85},
    apc:  {n:'Fiat-SPA TL37 Tractor', w:'transport', snd:'naval', shape:'carrier', mv:6, cost:3000},
    tank: {n:'Carro Armato M13/40', w:'47/32 gun', snd:'gun50', shape:'m1340', pow:.8, arm:1.1, mv:5, cost:5000},
    mtank:{n:'Semovente da 75/18', w:'75 mm howitzer', snd:'gun75', shape:'semovente', pow:.95, cost:7000},
    art:  {n:'Obice da 75/13', w:'75 mm mountain howitzer, carried by mules', snd:'howitzer', shape:'m2a1', pow:.85},
    rkt:  {n:'Obice da 149/13', w:'149 mm howitzer', snd:'howitzer', shape:'m30', rng:[3,5], mt:'tire', mv:4, cost:11000},
    aa:   {n:'Breda 20/65', w:'20 mm', snd:'flak20', shape:'k61', mt:'tire'},
    ftr:  {n:'Fiat G.50 Freccia', w:'2x 12.7 mm Breda-SAFAT', snd:'strafeGer', shape:'mc202'},
    bmr:  {n:'Savoia-Marchetti SM.79', w:'bombs', snd:'bombs', shape:'sm79'},
    eng:  {n:'Guastatori', w:'demolition charges & flamethrowers', snd:'flamer'},
    mortar:{n:'Mortaio da 81/14', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'Breda M37 Nest', w:'8 mm Breda M37', snd:'bren', shape:'nest'},
    pak:  {n:'Caposaldo with 47/32', w:'47 mm gun in a stone strongpoint', snd:'gun50', shape:'casemate', pow:.85},
  }};
NATION.itcb = {n:'Italy', adj:'Italian', short:'Esercito Cobelligerante', side:'allies',
  col:{m:'#8a8a62', d:'#5e5e42', ui:'#2e8a4a', team:'#2e8a4a', hi:'#c8c8a4'},
  uniform:'#7a7e60', helmet:'it', star:'ittac', skin:'#d8a880',
  u:{
    inf:  {n:'Bersaglieri', w:'Carcano M91 & Breda 30', snd:'bren', cost:1000},
    at:   {n:'Cannone 47/32 Crew', w:'47 mm anti-tank gun', snd:'gun50', pow:.9},
    recon:{n:'Autoblinda AB 41', w:'20 mm Breda', snd:'flak20', shape:'ab41', cost:3500, pow:.85},
    apc:  {n:'Universal Carrier (British-supplied)', w:'Bren', snd:'bren', shape:'carrier', mv:7, cost:3500},
    art:  {n:'Obice da 100/17', w:'100 mm howitzer', snd:'howitzer', shape:'m30'},
    rkt:  {n:'Cannone da 149/35', w:'149 mm gun', snd:'howitzer', shape:'lefh', rng:[3,5], mt:'tire', mv:4, cost:11000},
    aa:   {n:'Breda 20/65', w:'20 mm', snd:'flak20', shape:'k61', mt:'tire'},
    ftr:  {n:'Macchi C.205 (Aeronautica Cobelligerante)', w:'2x 20 mm MG 151 & 2x 12.7 mm', snd:'strafeGer', shape:'mc202'},
    eng:  {n:'Genio Guastatori', w:'mines & demolition charges', snd:'bangalore'},
    mortar:{n:'Mortaio da 81/14', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'Breda M37 Nest', w:'8 mm Breda M37', snd:'bren', shape:'nest'},
  }};
NATION.gr = {n:'Greece', adj:'Greek', short:'Hellenic Army', side:'allies',
  col:{m:'#8a7e5a', d:'#5e563c', ui:'#2a6ac0', team:'#2a6ac0', hi:'#d8d0b0'},
  uniform:'#8a7a52', helmet:'adrian', star:'grroundel', skin:'#d8aa82',
  u:{
    inf:  {n:'Pezikó (Infantry)', w:'Mannlicher-Schönauer & Hotchkiss', snd:'bren', cost:900},
    at:   {n:'Böhler 47 mm Crew', w:'47 mm anti-tank gun', snd:'gun50', pow:.85},
    cav:  {n:'Ippikó (Cavalry)', w:'carbine & sabre', snd:'charge', cost:1700},
    art:  {n:'Schneider 75 mm Mountain Gun', w:'75 mm, carried by mules', snd:'howitzer', shape:'m2a1', pow:.9},
    rkt:  {n:'Schneider 105 mm Gun', w:'105 mm', snd:'howitzer', shape:'m30', rng:[3,5], mt:'tire', mv:3, cost:10000},
    ftr:  {n:'PZL P.24', w:'2x 20 mm & 2x 7.7 mm', snd:'strafeUK', shape:'p11'},
    eng:  {n:'Skapanís (Sappers)', w:'charges & wire-cutters', snd:'bangalore'},
    mortar:{n:'Brandt 81 mm Mortar', w:'81 mm mortar', snd:'mortar'},
    nest: {n:'Hotchkiss MG Nest', w:'8 mm Hotchkiss', snd:'bar', shape:'nest'},
    pak:  {n:'Fort on the Metaxas Pattern', w:'MGs and a 37 mm gun in concrete', snd:'gun37', shape:'casemate'},
  }};
NATION.gres = {n:'Greece', adj:'Greek', short:'Greek Resistance', side:'allies',
  col:{m:'#7a6a4a', d:'#54482e', ui:'#c03a2a', team:'#c03a2a', hi:'#d0c4a4'},
  uniform:'#6a5a44', helmet:'gres', star:'grroundel', skin:'#d0a07a',
  u:{
    inf:  {n:'Andartes (ELAS & EDES)', w:'old Mannlichers, Carcanos & a captured Breda', snd:'bren', cost:800, pow:.85},
    cav:  {n:'Mounted Andartes', w:'carbines & grenades', snd:'charge', cost:1500},
    eng:  {n:'SOE Sappers & Andartes', w:'plastic explosive, 900 lb of it', snd:'bangalore', pow:1.1},
    mortar:{n:'Mortar (SOE drop)', w:'3-inch mortar', snd:'mortar'},
    at:   {n:'Andartes with a Breda', w:'a captured 20 mm Breda', snd:'flak20', pow:.8},
    nest: {n:'Andartes MG Post', w:'captured Breda 30', snd:'bren', shape:'nest'},
  }};
Object.assign(TANKS, {
  r35: {x0:5, L:20, hullH:7, glacis:4, tur:{x:10, w:7, h:5, sh:'cast'}, gun:{len:4, th:.8}, wheels:'small8'},
});
MOOD_ALIAS.itgv = 'it'; MOOD_ALIAS.itcb = 'it';

/* ---------- generals ---------- */
const beard = (P, col, full = 1) => { P.poly([[15, 22], [33, 22], [33, 29], [29, 35 + full * 2], [24, 38 + full * 3], [19, 35 + full * 2], [15, 29]], col); P.poly([[19, 26], [24, 25], [29, 26], [27.5, 28], [20.5, 28]], shade(col, -.12)); P.R(21, 28, 6, 1, '#5a2a24'); for (let i = 0; i < 8; i++) P.line(17 + i * 2, 30, 17.5 + i * 2, 35 + (i % 3), shade(col, .15), .25); };
Object.assign(CAP_EXTRA, {
  alpino(P, L) {                                       // the Alpini hat with its black eagle feather
    const c = '#6c7056', d = shade(c, -.2);
    P.ell(24, 13.5, 15, 3, d); P.poly([[14, 13], [17, 5], [31, 5], [34, 13]], c); P.R(14.5, 10.6, 19, 2.4, '#3a3a2a');
    P.poly([[31, 11], [40, -2], [41.6, -1.4], [33, 12]], '#141414'); P.line(33, 10.4, 40.6, -1.6, '#3a3a3a', .3);   // the penna nera
    P.poly([[21, 9], [24, 6.6], [27, 9], [24, 10.4]], '#b8b8a8'); faceExtras(P, L);
  },
  itpeak(P, L) { capPeak(P, '#7a7e60', '#5a5e44'); P.poly([[20, 9.4], [24, 6.8], [28, 9.4], [24, 11]], '#d8b040'); P.R(15, 14.6, 18, .5, '#c8c8c0'); for (let i = 0; i < 4; i++) P.line(16 + i * 4, 13, 18 + i * 4, 14.2, '#c8c8c0', .3); faceExtras(P, L); },   // the greca on a general's cap
  grpeak(P, L) { capPeak(P, '#8a7a52', '#5a4e34'); P.circ(24, 12.8, 1.7, '#d8b040'); P.circ(24, 12.8, .9, '#1a5eae'); P.circ(24, 12.8, .4, '#f4f4ee'); faceExtras(P, L); },
  andartis(P, L) {                                     // a partisan colonel: a black beret, a great beard and bandoliers
    beard(P, L.beard || '#2a2420', 1.4);
    P.ell(22, 11, 13, 5, '#1a1a1c'); P.ell(16, 12, 7, 4, '#1a1a1c'); P.R(14, 14, 20, 2, '#2a2a2c'); P.circ(28, 11, 1.2, '#d8b040');
    P.line(6, 36, 40, 48, '#6a5232', 1.6); P.line(42, 36, 8, 48, '#6a5232', 1.6); for (let i = 0; i < 8; i++) P.R(9 + i * 4, 38 + i * 1.2, 1.4, 1.6, '#c8a040');
    if (L.moustache) P.R(19.5, 25.6, 9, 1.8, shade(L.beard || '#2a2420', -.05));
  },
});
Object.assign(CO, {
  girotti:{n:'Mario Girotti', nat:'itgv', rank:'Generale di Divisione', nick:'The Julia Division',
    bio:'Commanded the 3rd Alpine Division "Julia" in the invasion of Greece. Sent up into the Pindus with mules instead of lorries and summer kit in the autumn rains, his Alpini got further than anyone in the Italian army, and paid for it.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Penne Nere', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Di Qui Non Si Passa', star:6, txt:'All units +35% defence; all units recover 2 HP.', def:{all:35}, heal:2},
    look:{cap:'alpino', face:'#e0b490', hair:'#4a3a2a', jaw:1, tunic:'#7a7e60', moustache:true},
    say:{start:'Over the mountains to Metsovo. The Alpini do not need roads.', win:'Metsovo! The pass is ours.', lose:'Back to the Aoos. Bring the wounded.', power:'Avanti, Alpini! Avanti!'}},
  lorenzini:{n:'Orlando Lorenzini', nat:'it', rank:'Generale di Brigata', nick:'The Lion of Keren',
    bio:'An officer of the colonial army who had spent his career with Eritrean troops. At Keren he commanded the colonial brigades on the mountains above the Dongolaas gorge, leading counter-attack after counter-attack against the Indian divisions.',
    d2d:{txt:'Infantry and cavalry +15% firepower.', atk:{foot:15}},
    cop:{n:'Contrattacco', star:3, txt:'Infantry +2 move and +20% firepower.', mv:{foot:2}, atk:{foot:20}},
    scop:{n:'The Lion of Keren', star:6, txt:'All units +40% firepower.', atk:{all:40}},
    look:{cap:'itpeak', face:'#d8a882', hair:'#3a3028', jaw:1, tunic:'#b0a070', moustache:true},
    say:{start:'Keren is a fortress built by God. We will hold it.', win:'They are falling back from the gorge!', lose:'The gorge is open. Fall back on Asmara.', power:'Ascari! Contrattacco!'}},
  balotta:{n:'Mario Balotta', nat:'it', rank:'Generale di Divisione', nick:'Ariete',
    bio:'Commanded the 132nd Armoured Division "Ariete" in Operation Crusader. At Bir el Gubi his M13s, 47 mm guns and Bersaglieri dug in on a low ridge and waited for the British cavalry charge.',
    d2d:{txt:'Anti-tank guns and armour +15% defence.', def:{armour:15, foot:10}},
    cop:{n:'Tenere!', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Ferrea Mole, Ferreo Cuore', star:6, txt:'Armour and guns +35% firepower.', atk:{armour:35, indirect:35, foot:15}},
    look:{cap:'itpeak', face:'#e0b490', hair:'#6a5a4a', jaw:2, tunic:'#b0a070'},
    say:{start:'Let them come. The guns are laid.', win:'They charged like the Light Brigade, and they fared the same.', lose:'Pull back on El Adem.', power:'Fuoco! Fuoco a volontà!'}},
  frattini:{n:'Enrico Frattini', nat:'it', rank:'Generale di Divisione', nick:'The Folgore',
    bio:'Commanded the 185th Paratroopers Division "Folgore", trained to drop on Malta and sent to El Alamein to fight as infantry in the southern sector, with no transport and few anti-tank guns.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'Bottiglie Incendiarie', star:3, txt:'Infantry +40% firepower against tanks.', atk:{foot:40}},
    scop:{n:'Folgore!', star:6, txt:'All units +40% defence and +20% firepower.', def:{all:40}, atk:{all:20}},
    look:{cap:'itpeak', face:'#e0b490', hair:'#5a4a3a', jaw:1, tunic:'#b0a070'},
    say:{start:'We hold. Not one step back.', win:'They have broken off. The Folgore holds.', lose:'Fortune failed us, not courage.', power:'Folgore!'}},
  geloso:{n:'Carlo Geloso', nat:'itgv', rank:'Generale d\'Armata', nick:'11th Army, Greece',
    bio:'Commanded the Italian 11th Army, which occupied most of Greece after 1941 and was responsible for guarding the railways and bridges the British-led resistance set out to destroy.',
    d2d:{txt:'Guns and fortifications +15% defence.', def:{indirect:15, foot:10}},
    cop:{n:'Allarme', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Rinforzi da Lamia', star:6, txt:'All units +30% defence; all units recover 2 HP.', def:{all:30}, heal:2},
    look:{cap:'itpeak', face:'#e0b490', hair:'#8a8278', jaw:2, tunic:'#7a7e60', glasses:true},
    say:{start:'Guard the viaduct. Everything to Africa goes over it.', win:'The bridge stands.', lose:'The viaduct is down.', power:'Allarme! Tutti ai posti!'}},
  chirieleison:{n:'Domenico Chirieleison', nat:'itgv', rank:'Generale di Divisione', nick:'The Livorno Division',
    bio:'Commanded the 4th Infantry Division "Livorno", the best Italian division in Sicily, trained for amphibious operations and held back to throw the invaders into the sea.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'All\'Attacco', star:3, txt:'All ground units +1 move and +15% firepower.', mv:{ground:1}, atk:{all:15}},
    scop:{n:'Into the Sea', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'itpeak', face:'#e0b490', hair:'#4a3a2a', jaw:1, tunic:'#7a7e60', moustache:true},
    say:{start:'Into Gela, and into the sea with them.', win:'Gela is ours again.', lose:'The ships... we cannot fight the ships.', power:'Livorno! All\'attacco!'}},
  dapino:{n:'Vincenzo Dapino', nat:'itcb', rank:'Generale di Brigata', nick:'I Raggruppamento Motorizzato',
    bio:'Commanded the 1st Motorized Group, the first Italian unit to fight alongside the Allies after the armistice of September 1943: Bersaglieri, infantry and gunners of the old army, who had to prove to their new allies that Italians would fight.',
    d2d:{txt:'Infantry +10% firepower and defence.', atk:{foot:10}, def:{foot:10}},
    cop:{n:'Bersaglieri, Avanti', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'Monte Lungo', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'itpeak', face:'#e0b490', hair:'#5a4a3a', jaw:1, tunic:'#7a7e60'},
    say:{start:'The whole army is watching. So are the Americans.', win:'The flag is on Monte Lungo.', lose:'Back to the start line. We go again.', power:'Savoia!'}},
  utili:{n:'Umberto Utili', nat:'itcb', rank:'Generale di Divisione', nick:'Corpo Italiano di Liberazione',
    bio:'Took over the Italian forces fighting with the Allies after Monte Lungo and built them into the Italian Liberation Corps, which fought up the Adriatic coast beside the Polish II Corps in the summer of 1944.',
    d2d:{txt:'All units +10% firepower.', atk:{all:10}},
    cop:{n:'Nembo', star:3, txt:'Infantry +30% firepower.', atk:{foot:30}},
    scop:{n:'Liberazione', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'itpeak', face:'#e0b490', hair:'#8a8278', jaw:1, tunic:'#7a7e60', glasses:true},
    say:{start:'Filottrano, then Ancona. With the Poles on our flank.', win:'Filottrano is free.', lose:'The Germans hold the ridge. Regroup.', power:'Avanti, Nembo!'}},
  davakis:{n:'Konstantinos Davakis', nat:'gr', rank:'Colonel', nick:'The Pindus Detachment',
    bio:'Commanded the small Pindus Detachment, about 2,000 men, which met the Julia Division in the mountains on 28 October 1940. Badly wounded on 2 November, he had already slowed the Alpini long enough for Greek reserves to come up.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Aera!', star:3, txt:'Infantry +25% firepower and +1 move.', atk:{foot:25}, mv:{foot:1}},
    scop:{n:'The Ring Closes', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'grpeak', face:'#d8aa82', hair:'#2a2420', jaw:1, tunic:'#8a7a52', moustache:true},
    say:{start:'Ochi. They will not pass the Pindus.', win:'The Julia is in retreat!', lose:'Fall back on Metsovo.', power:'Aera! Aera!'}},
  platt:{n:'William Platt', nat:'uk42', rank:'Lieutenant General', nick:'Commander, Sudan',
    bio:'Commanded the British and Indian invasion of Eritrea from the Sudan. Keren, held by better troops on better ground, cost him two months and every shell he could bring up the road.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'The Gorge', star:3, txt:'Infantry +20% firepower.', atk:{foot:20}},
    scop:{n:'All Guns', star:6, txt:'Artillery +45% firepower and +1 range.', atk:{indirect:45}, rng:{indirect:1}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#b8a070', moustache:true},
    say:{start:'Keren must fall, whatever it costs.', win:'Keren has fallen.', lose:'Pull the brigades back off the ridges.', power:'Every gun on Sanchil!'}},
  scottcockburn:{n:'John Scott-Cockburn', nat:'uk42', rank:'Brigadier', nick:'22nd Armoured Brigade',
    bio:'Commanded the 22nd Armoured Brigade, yeomanry regiments newly arrived from England in new Crusader tanks, which had never been in action when it was sent against the Ariete at Bir el Gubi.',
    d2d:{txt:'Armour +1 move.', mv:{armour:1}},
    cop:{n:'Charge', star:3, txt:'Armour +25% firepower.', atk:{armour:25}},
    scop:{n:'The Yeomanry', star:6, txt:'Armour +35% firepower and +2 move.', atk:{armour:35}, mv:{armour:2}},
    look:{cap:'beret', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#b8a070'},
    say:{start:'Tally-ho. The Italians will run.', win:'Bir el Gubi is ours.', lose:'Rally on the brigade. Count the tanks.', power:'Charge!'}},
  zervas:{n:'Napoleon Zervas', nat:'gres', rank:'Colonel', nick:'EDES',
    bio:'A republican officer who founded EDES, one of the two great resistance armies in occupied Greece. In November 1942 he brought his andartes to the Gorgopotamos beside the communist ELAS of Aris Velouchiotis and the British sabotage team of Eddie Myers.',
    d2d:{txt:'Infantry and engineers +15% firepower.', atk:{foot:15}},
    cop:{n:'Night Attack', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'Blow the Bridge', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'andartis', face:'#d8a882', hair:'#2a2420', beard:'#2a2420', jaw:0, tunic:'#6a5a44', moustache:true},
    say:{start:'ELAS takes the south end, we take the north. Then the British blow it.', win:'The viaduct is in the gorge!', lose:'Into the mountains. Scatter!', power:'Lefteria!'}},
  darby:{n:'William O. Darby', nat:'us', rank:'Lieutenant Colonel', nick:'Darby\'s Rangers',
    bio:'Founded and led the US Army Rangers, trained by British commandos in Scotland. At Gela his two Ranger battalions took the town on 10 July and held it, Darby himself firing a captured Italian gun at the Livorno\'s attack.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Rangers Lead the Way', star:3, txt:'Infantry +20% defence and firepower.', def:{foot:20}, atk:{foot:20}},
    scop:{n:'Naval Gunfire', star:6, txt:'All units +25% defence; the cruisers Boise and Savannah shell two enemy concentrations for 3 HP.', def:{all:25}, strike:{n:2, r:1, hp:3, kind:'naval'}},
    look:{cap:'helmet', stars:0, face:'#e8c4a4', hair:'#5a4a3a', jaw:2, tunic:'#7a6f4c', ranger:true},
    say:{start:'Hold the town. The Navy will do the rest.', win:'Gela holds.', lose:'Back to the beach!', power:'Get me the Boise!'}},
  senger:{n:'Fridolin von Senger und Etterlin', nat:'ger', rank:'General der Panzertruppe', nick:'XIV Panzer Corps',
    bio:'A Rhodes Scholar and a lay Benedictine who commanded the XIV Panzer Corps on the Gustav Line. His divisions held the Mignano gap, Monte Lungo and San Pietro through the winter of 1943, then Cassino.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Reinhard Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Gegenstoß', star:6, txt:'All units +30% firepower and +20% defence.', atk:{all:30}, def:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:2, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'The Italians? Let them come up the hill.', win:'The hill holds.', lose:'Fall back on the Gustav Line.', power:'Gegenstoß!'}},
  hoppe:{n:'Harry Hoppe', nat:'ger', rank:'Generalleutnant', nick:'278. Infanterie-Division',
    bio:'Commanded the 278th Infantry Division in the fighting retreat up the Adriatic coast in the summer of 1944, holding hill towns like Filottrano to cover the road to Ancona.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Stützpunkt', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Hold Filottrano', star:6, txt:'All units +30% defence and +15% firepower.', def:{all:30}, atk:{all:15}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'Hold the town. Ancona needs time.', win:'They are pulling back.', lose:'Fall back to the Musone.', power:'Alle Mann nach vorn!'}},
});
for (const k of Object.keys(CO_BY_NAT)) delete CO_BY_NAT[k];
for (const [id, c] of Object.entries(CO)) (CO_BY_NAT[c.nat] = CO_BY_NAT[c.nat] || []).push(id);
CO_BY_NAT.uk42.push('monty', 'horrocks'); CO_BY_NAT.dak.unshift('rommel');
Object.assign(CO_PERSONA, {girotti:'aggressive', lorenzini:'aggressive', balotta:'cautious', frattini:'cautious', geloso:'cautious', chirieleison:'aggressive', dapino:'methodical', utili:'methodical',
  davakis:'aggressive', platt:'methodical', scottcockburn:'reckless', zervas:'aggressive', darby:'cautious', senger:'cautious', hoppe:'cautious'});
Object.assign(BARK_LINES, {
  gr:{sel:['Μάλιστα!', 'Εμπρός!', 'Ναι, κύριε!', 'Διαταγές σας!'], veh:['Εμπρός!', 'Μάλιστα!'],
    move:['Εμπρός!', 'Ακολουθήστε με!', 'Γρήγορα!', 'Σκορπιστείτε!'], atk:['Αέρα!', 'Πυρ!', 'Ζήτω η Ελλάς!', 'Αέρα! Αέρα!'],
    kill:['Τον πέτυχα!', 'Έπεσε!', 'Ένας λιγότερος!'], hurt:['Τραυματιοφορέα!', 'Καλυφθείτε!', 'Πίσω!', 'Χτυπήθηκα!'],
    cap:['Δικό μας!', 'Ελεύθερο!'], new:['Παρών!', 'Έτοιμοι!'],
    idle:['Έχεις τσιγάρο;', 'Κρύο στα βουνά…', 'Πότε θα γυρίσουμε σπίτι;', 'Λίγο ψωμί…', 'Χιονίζει πάλι.']},
});
BARK_LINES.gres = {...BARK_LINES.gr, atk:['Αέρα!', 'Πυρ!', 'Λευτεριά!'], cap:['Λευτεριά!', 'Δικό μας!'], idle:['Έχεις τσιγάρο;', 'Πού είναι οι Εγγλέζοι;', 'Κρύο απόψε…', 'Λευτεριά ή θάνατος.']};
for (const k of ['gr', 'gres']) BARKS[k] = {...BARK_LINES[k]};
BARKS.itgv = BARKS.it; BARKS.itcb = BARKS.it;

/* ---------- the battles ---------- */
/* carve a valley or a gorge through mountains: the track and the ground either side of it */
const carve = (b, pts, half = 1, to = '.') => b.path(pts, (x, y) => { for (let d = -half; d <= half; d++) for (const [a, c] of [[x, y + d], [x + d, y]]) if (b.get(a, c) === 'M') b.set(a, c, d ? '^' : to); });
const ITALY_MISSIONS = {
  pindus:{name:'The Pindus', place:'Vovousa and the road to Metsovo', date:'2 November 1940, 07:00', theme:'greece', weather:'rain',
    p1:{nat:'itgv', co:'girotti', funds:0, u:{inf:{n:'Alpini (8º Reggimento, Julia)', w:'Carcano M91 & Breda 30'}, art:{n:'Obice da 75/13 (3º Artiglieria Alpina)'}}},
    p2:{nat:'gr', co:'davakis', funds:0, u:{inf:{n:'Evzones & Infantry (Pindus Detachment)'}}},
    objective:{win:'hq', limit:18}, goal:'Push up the valley and take Metsovo, the pass at the top of the Pindus, by {limit}.',
    brief:'On 28 October Mussolini invaded Greece from Albania, expecting a parade. The Greek answer was one word: Ochi, No. The 3rd Alpine Division "Julia" has been sent up the Aoos valley into the Pindus, to seize Metsovo and cut Greece in two. The Alpini have mules, not lorries, and it has been raining for a week. Ahead are Colonel Davakis\'s Pindus Detachment and, somewhere behind them, the Greek reserves.',
    clock:{start:'1940-11-02T07:00', step:120},
    build:() => { const b = MB(36, 22, '.', 9101);
      b.blobs('M', 16, 4, 0, 35, 21, 1, 3).blobs('T', 12, 2, 0, 33, 21, 1, 2, ['.']).blobs('^', 9, 2, 0, 34, 21, 1, 2, ['.']);
      carve(b, [[0, 11], [8, 10], [14, 8], [20, 7], [26, 10], [34, 11]]); carve(b, [[13, 8], [12, 4]], 0); carve(b, [[14, 9], [15, 16]], 0);
      b.river([[9, 0], [11, 6], [13, 12], [12, 21]]);
      b.road([[0, 11], [8, 10], [14, 8], [20, 7], [26, 10], [33, 11]]);
      b.put([[1, 11, 'Q'], [3, 6, 'C'], [2, 16, 'C'], [12, 4, 'k'], [20, 6, 'k'], [15, 16, 'k'], [29, 8, 'k'], [28, 14, 'k'], [29, 11, 'q'], [26, 13, 'B'], [5, 19, 'I']]);
      return b.rows(); },
    units:{1:'inf*10 1,6-7,16; mortar*2 2,9-4,13; art*3 0,9-2,13; eng*2 3,10-6,12; cav*2 1,14-4,17; nest*2 1,10-2,12',
      2:'inf*3 21,4-29,18; nest 25,9-28,13; art 29,6-33,16; mortar 26,9-30,13; cav 23,15-28,19'},
    events:[{day:2, team:1, say:'The Bersaglieri and a battalion of the Alpini\'s reserve come up the valley.', spawn:'inf*3 0,9-3,13'},
      {day:3, team:2, say:'Greek mountain guns climb onto the ridges above the Julia\'s column.', spawn:'mortar 16,0-24,2; art 20,0-24,2'},
      {day:5, team:2, say:'The Greek 1st Division comes up behind the Alpini. Its guns fire down into the valley.', spawn:'mortar*2 12,19-20,21'},
      {day:6, team:2, say:'Sleet on the passes. The mules cannot get food or ammunition up the tracks.', hurt:1}]},
  keren:{name:'Keren', place:'The Dongolaas gorge, Eritrea', date:'15 March 1941, 07:00', theme:'eritrea', weather:'clear',
    p1:{nat:'it', co:'lorenzini', funds:2000, u:{inf:{n:'Granatieri di Savoia & Ascari', w:'Carcano & Fiat 14/35'}, cav:{n:'Gruppo Bande a Cavallo', w:'sabre, Carcano & hand grenades', snd:'charge', cost:1700}}},
    p2:{nat:'uk42', co:'platt', funds:0, u:{inf:{n:'Indian Rifle Section (4th & 5th Indian Div.)', w:'SMLE & Bren'}, htank:{n:'Matilda II (B Sqn, 4th RTR)'}}},
    objective:{win:'survive', days:9, hold:4}, goal:'Hold Keren and the mountains above the Dongolaas gorge until {survive}. Lose two of your five positions and Keren falls.',
    brief:'Keren stands on a plateau behind a wall of granite mountains, and the only road from the Sudan climbs to it through the Dongolaas gorge, which your engineers have blocked with a landslide of blasted rock. For six weeks the 4th and 5th Indian Divisions have thrown themselves at the peaks: Sanchil, Brig\'s Peak, Fort Dologorodoc. Your Savoia Grenadiers and Eritrean askari have thrown them off again and again. Now General Platt has brought up every gun he has for a final assault.',
    clock:{start:'1941-03-15T07:00', step:120},
    build:() => { const b = MB(36, 22, '.', 9202);
      b.blobs('M', 18, 13, 0, 25, 21, 1, 2).blobs('M', 6, 28, 0, 35, 4, 1, 2).blobs('^', 8, 8, 0, 30, 21, 1, 2, ['.']).blobs('W', 3, 0, 0, 10, 21, 1, 1, ['.']);
      carve(b, [[0, 11], [10, 11], [16, 12], [22, 11], [30, 11], [35, 10]], 0);
      carve(b, [[10, 4], [18, 5], [26, 7]], 0, '^'); carve(b, [[10, 18], [18, 17], [26, 15]], 0, '^');   // the mule tracks over Sanchil and Zeban
      b.road([[0, 11], [10, 11], [16, 12], [22, 11], [30, 11], [35, 10]]).road([[33, 10], [34, 21]]);
      b.rect(18, 13, 20, 15, '^').scatter('L', .25, 29, 6, 35, 18, ['.']);
      b.put([[30, 10, 'Q'], [27, 7, 'C'], [26, 14, 'C'], [31, 15, 'C'], [19, 14, 'B'], [15, 8, 'B'], [3, 6, 'k'], [4, 16, 'k'], [23, 4, 'C']]);
      return b.rows(); },
    units:{1:'inf*6 14,4-24,18; nest*3 15,6-22,16; pak 19,13; art*2 26,6-31,16; mortar 18,8-23,13; cav*2 27,14-31,19; at 22,10',
      2:'inf*10 6,3-13,19; art*5 2,5-6,17; mortar*3 7,7-11,15; htank*2 5,10-9,12; eng*3 8,9-12,13; recon 6,11'},
    events:[{day:2, team:2, say:'The Cameron Highlanders storm Brig\'s Peak.', spawn:'inf*4 6,2-10,6'},
      {day:3, team:1, say:'Lorenzini leads the Savoia Grenadiers back up the peak.', spawn:'inf*2 20,3-24,6'},
      {day:3, team:2, say:'The Highland Light Infantry and the Sikhs attack Sanchil.', hurt:1},
      {day:4, team:2, say:'At night the 5th Indian Division storms the slopes below Fort Dologorodoc.', spawn:'inf*4 16,15-20,18'},
      {day:5, team:2, say:'Blenheims and Wellesleys bomb the Italian positions all day.', hurt:1},
      {day:6, team:2, say:'The sappers clear the roadblock in the gorge. The Matildas come through.', spawn:'htank*3 19,10-23,12; inf*3 20,8-24,13'},
      {day:7, team:1, say:'Carnimeo sends up his last reserve: a battalion of Bersaglieri and the Savoia\'s cannon from Keren.', spawn:'inf*2 27,11-30,16; pak 28,13'}]},
  birelgubi:{name:'Bir el Gubi', place:'The Ariete\'s positions at Bir el Gubi, Libya', date:'19 November 1941, 12:00', theme:'desert', weather:'clear',
    p1:{nat:'it', co:'balotta', funds:0, u:{inf:{n:'Bersaglieri (8º Reggimento)'}, tank:{n:'Carro Armato M13/40 (132º Carristi)'}}},
    p2:{nat:'uk42', co:'scottcockburn', funds:0, u:{tank:{n:'Crusader I (22nd Armoured Brigade)', w:'QF 2-pounder'}}},
    objective:{win:'kill', role:'tank', n:12, limit:7}, goal:'Break the charge of the 22nd Armoured Brigade: knock out twelve Crusaders by {limit}.',
    brief:'Operation Crusader has begun: the Eighth Army is driving west to relieve Tobruk, and its armour is fanning out across the desert. On the southern flank stands the Ariete Armoured Division, dug in on a low rise around the well at Bir el Gubi. Bearing down on it is the 22nd Armoured Brigade, three yeomanry regiments fresh from England in brand-new Crusaders. They have never fought before. They are coming on fast, in line abreast, like cavalry.',
    clock:{start:'1941-11-19T12:00', step:120},
    build:() => { const b = MB(36, 20, '.', 9303);
      b.blobs('d', 6, 18, 0, 35, 19, 1, 2).rect(9, 3, 13, 16, '^', ['.']);
      wadi(b, [[35, 4], [26, 6], [20, 3]]); wadi(b, [[35, 16], [25, 14], [18, 17]]);
      b.scatter('z', .3, 10, 4, 13, 15, ['^']).scatter('m', .35, 15, 3, 16, 16, ['.']);
      b.road([[0, 10], [35, 10]]);
      b.put([[4, 10, 'Q'], [10, 10, 'C'], [6, 4, 'C'], [6, 16, 'C'], [33, 4, 'k'], [33, 16, 'k'], [27, 10, 'c']]);
      return b.rows(); },
    units:{1:'tank*6 6,4-12,16; at*4 11,6-14,14; art*3 4,7-8,13; inf*4 10,5-14,15; pak*2 12,8-13,12; nest*2 13,4-14,16; recon 7,17',
      2:'tank*10 26,3-34,17; recon*2 24,1-30,19; art*2 33,8-35,12'},
    events:[{day:2, team:2, say:'The second and third yeomanry regiments come up and charge in their turn.', spawn:'tank*4 28,2-35,18'},
      {day:3, team:1, say:'The Ariete\'s reserve tank battalion comes up on the flank.', spawn:'tank*2 2,8-5,12'}]},
  folgore:{name:'The Folgore at El Alamein', place:'Deir el Munassib, the southern sector', date:'23 October 1942, 21:40', theme:'desert', weather:'clear',
    p1:{nat:'it', co:'frattini', funds:0, u:{inf:{n:'Paracadutisti (185ª Folgore)', w:'Carcano, MAB 38 & Breda 30; incendiary bottles', pow:1.05, powArm:1.6}, eng:{n:'Guastatori Paracadutisti', w:'mines & satchel charges'}, at:{n:'47/32 Anti-tank Crew'}}},
    p2:{nat:'uk42', co:'horrocks', funds:0, u:{inf:{n:'Infantry Section (44th Division)'}}},
    objective:{win:'survive', days:6, hold:3}, goal:'Hold the southern sector until {survive}. Lose two of your four positions and the line is broken.',
    brief:'The Folgore was raised to drop on Malta. Instead it has been in the line at El Alamein since July, fighting as infantry, with no vehicles, half rations and few anti-tank guns, behind the minefields the Germans call the Devil\'s Gardens. Tonight the whole British front has erupted. In the south, General Horrocks\'s XIII Corps is coming at you with the 44th Division and the tanks of the 7th Armoured. Your men have rifles, a few 47 mm guns, and bottles of petrol.',
    clock:{start:'1942-10-23T21:40', step:120},
    build:() => { const b = MB(36, 22, '.', 9404);
      b.blobs('d', 5, 16, 0, 35, 19, 1, 2).blobs('^', 6, 4, 2, 14, 18, 1, 2).rect(28, 16, 33, 19, '^').rect(30, 17, 32, 18, 'M');
      b.scatter('m', .3, 16, 0, 19, 19, ['.', 'd']).scatter('z', .25, 6, 2, 15, 19, ['.']);
      for (const y of [4, 10, 15]) b.rect(16, y, 19, y, '.');                       // the lanes the sappers clear on the first night
      b.rect(0, 20, 35, 21, 'E');                                                     // the edge of the Qattara depression
      wadi(b, [[0, 4], [8, 6], [14, 3]]);
      b.put([[3, 9, 'Q'], [6, 4, 'C'], [6, 15, 'C'], [11, 10, 'C'], [33, 5, 'k'], [32, 13, 'k'], [24, 10, 'c']]);
      return b.rows(); },
    units:{1:'inf*8 7,2-15,19; at*4 9,4-14,17; eng*2 10,8-13,13; mortar*2 5,6-8,14; nest*3 12,3-15,18; art*2 3,6-5,14',
      2:'inf*10 20,1-27,20; tank*6 22,3-29,18; mtank*3 24,6-28,14; art*5 29,2-33,19; eng*4 20,4-23,17'},
    events:[{day:1, team:2, say:'21:40. 882 guns open fire along the whole front.', hurt:2},
      {day:2, team:2, say:'The 7th Armoured Division pushes its tanks through the gaps in the minefields.', spawn:'tank*4 28,6-34,15; mtank*2 30,9-32,12'},
      {day:3, team:2, say:'The Free French Foreign Legion attacks the Himeimat heights.', spawn:'inf*4 26,16-32,19'},
      {day:4, team:2, say:'The 44th Division goes in again, behind a creeping barrage.', hurt:1, spawn:'inf*3 24,4-30,12'},
      {day:4, team:1, say:'Water and ammunition come up by night, on foot.', heal:1}]},
  gorgopotamos:{name:'The Gorgopotamos Viaduct', place:'The Athens-Salonika railway, central Greece', date:'25 November 1942, 23:00', theme:'greece', weather:'night', fog:true,
    p1:{nat:'itgv', co:'geloso', funds:0, u:{inf:{n:'Presidio (Garrison Infantry)', w:'Carcano & Breda 30'}, pak:{n:'Breda Pillbox on the Viaduct', w:'8 mm Breda in concrete', snd:'bren', shape:'casemate', pow:.8}}},
    p2:{nat:'gres', co:'zervas', funds:0},
    objective:{win:'survive', days:5, hold:2}, goal:'Hold the garrison post and the station at the viaduct until {survive}. Lose either, and the bridge is lost.',
    brief:'Everything that goes to Rommel through Greece goes over the Gorgopotamos viaduct, a 200-metre steel bridge across a mountain gorge near Lamia. Its garrison is a company of Italian infantry in pillboxes at both ends. It is a cold, moonless night. Somewhere in the hills above the gorge, Greek guerrillas of both resistance armies, who do not trust each other, have come together with a party of British parachutists for the first time. Thermopylae is twelve kilometres away.',
    clock:{start:'1942-11-25T23:00', step:60},
    build:() => { const b = MB(34, 20, '.', 9505);
      b.blobs('M', 16, 0, 0, 33, 19, 1, 3).blobs('T', 14, 0, 0, 33, 19, 1, 2, ['.']);
      carve(b, [[0, 9], [33, 9]], 1); carve(b, [[17, 0], [16, 19]], 1);
      b.river([[17, 0], [16, 6], [17, 12], [16, 19]], .15);
      b.road([[0, 9], [33, 9]]).road([[20, 9], [22, 3], [25, 0]]);
      b.scatter('w', .3, 14, 7, 20, 11, ['.', '^', 'T']);
      b.put([[19, 8, 'Q'], [21, 6, 'C'], [15, 10, 'B'], [19, 10, 'B'], [6, 4, 'c'], [28, 15, 'c'], [31, 18, 'I']]);
      return b.rows(); },
    units:{1:'inf*4 14,7-21,11; nest*3 15,8-20,10; mortar 18,6; pak 16,8',
      2:'inf*7 6,3-12,16; inf*6 23,3-29,16; eng*3 9,11-12,14; mortar*2 9,4-12,6; cav*2 24,12-28,16'},
    events:[{day:2, team:2, say:'ELAS and EDES attack both ends of the viaduct at once.', hurt:1},
      {day:2, team:1, say:'A troop train from Lamia brings a platoon of reinforcements.', spawn:'inf 30,8-33,10'},
      {day:3, team:2, say:'More andartes come down from the mountains to cut the line.', spawn:'inf*4 0,6-3,12; eng 12,14'}]},
  gela43:{name:'Gela', place:'Gela and the Sicilian coast', date:'11 July 1943, 06:00', theme:'sicily', weather:'clear',
    p1:{nat:'itgv', co:'chirieleison', funds:0, u:{inf:{n:'Fanteria (Livorno Division)'}, tank:{n:'Renault R35 (Gruppo Mobile E)', w:'37 mm SA 18', shape:'r35', snd:'gun37', pow:.7, arm:1.1, mv:5, cost:4000}, art:{n:'Obice da 75/18'}}},
    p2:{nat:'us', co:'darby', funds:0, u:{inf:{n:'Rangers (1st & 4th Ranger Battalions)', w:'M1 Garands, BARs & bazookas'}, mortar:{n:'4.2-inch Chemical Mortar (83rd Chem. Bn)', w:'4.2 in mortar', snd:'mortar'}}},
    objective:{win:'hq', limit:9}, goal:'Retake Gela: capture the Rangers\' command post in the town by {limit}.',
    brief:'Yesterday the Americans landed on the beaches around Gela. The Rangers took the town before dawn, and when the Renault tanks of Mobile Group E drove into the streets, the Rangers knocked them out with bazookas and grenades thrown from the rooftops. This morning the Livorno Division attacks. It is the best Italian division on the island, and it is marching across open fields towards a town held by commandos, with the guns of the US Navy waiting offshore. On the hill by the town stand the ruins of the Greek temple of Gela, founded 2,600 years ago.',
    clock:{start:'1943-07-11T06:00', step:60},
    build:() => { const b = MB(34, 22, ',', 9606);
      b.rect(0, 19, 33, 21, '~').rect(0, 18, 33, 18, 's');
      b.blobs('G', 9, 0, 0, 33, 13, 1, 2, [',']).blobs('^', 6, 0, 0, 33, 8, 1, 2, [',', 'G']).blobs('.', 6, 0, 0, 33, 17, 1, 1, [',']);
      b.river([[24, 0], [23, 8], [22, 18]]);
      b.road([[0, 13], [33, 13]]).road([[17, 14], [19, 6], [20, 0]]).road([[5, 0], [8, 6], [14, 12]]);
      b.scatter('x', .45, 14, 14, 20, 17, [',', '.']);                                  // the shelled old town
      b.put([[17, 15, 'q'], [15, 15, 'k'], [19, 16, 'k'], [16, 17, 'k'], [12, 15, 'I'], [6, 2, 'Q'], [4, 6, 'C'], [10, 3, 'C'], [25, 4, 'a'], [29, 10, 'c']]);
      return b.rows(); },
    units:{1:'inf*8 2,3-12,10; tank*3 8,5-13,9; art*3 2,1-6,6; mortar*2 6,4-10,8; eng*2 8,8-11,10',
      2:'inf*6 13,13-21,17; mortar*2 16,15-19,17; at*2 14,12-20,13; dd 15,20'},
    events:[{day:2, team:1, say:'The Livorno\'s second column comes down the Niscemi road.', spawn:'inf*3 18,0-22,2'},
      {day:2, team:2, say:'The cruisers Boise and Savannah open fire on the columns in the plain.', hurt:1},
      {day:2, team:2, say:'The 4th Ranger Battalion and the engineers of the 39th come up from the beach.', spawn:'inf*2 14,16-20,17; eng 17,17'},
      {day:3, team:2, say:'Darby turns two captured Italian 77 mm guns on the attack.', spawn:'art 16,16'}]},
  montelungo:{name:'Monte Lungo', place:'The Mignano gap, Route 6', date:'8 December 1943, 06:20', theme:'apennine', weather:'fog',
    p1:{nat:'itcb', co:'dapino', funds:0, u:{inf:{n:'Bersaglieri & 67º Fanteria "Legnano"'}}},
    p2:{nat:'ger', co:'senger', funds:0, u:{inf:{n:'Panzergrenadiere (29. PzGren-Div.)', w:'Kar98k & MG 42'}}},
    objective:{win:'hq', limit:13}, goal:'Take the summit of Monte Lungo by {limit}.',
    brief:'Three months ago Italy surrendered. The army that was left in the south has asked to fight, and the Allies have given it one chance: the 1st Motorized Group, 5,000 men, attached to the US Fifth Army in front of the Gustav Line. Their objective is Monte Lungo, a long bare ridge that blocks the Mignano gap and Route 6 to Rome. German Panzergrenadiers are dug in on top. It is foggy. Every Italian and every American on the front is waiting to see what happens.',
    clock:{start:'1943-12-08T06:20', step:120},
    build:() => { const b = MB(34, 20, '.', 9707);
      b.blobs('M', 9, 8, 0, 33, 4, 1, 2).blobs('M', 7, 0, 16, 33, 19, 1, 2).blobs('T', 6, 0, 0, 33, 19, 1, 2, ['.']).blobs('G', 7, 0, 5, 18, 15, 1, 2, ['.']);
      b.rect(20, 7, 26, 12, '^').scatter('M', .4, 21, 7, 26, 12, ['^']);         // the ridge of Monte Lungo
      b.road([[0, 13], [12, 13], [19, 14], [27, 13], [33, 8]]);
      b.put([[24, 9, 'q'], [27, 3, 'k'], [30, 11, 'k'], [3, 12, 'C'], [1, 15, 'Q'], [8, 8, 'C'], [14, 17, 'c'], [22, 15, 'x'], [16, 6, 'x']]);
      return b.rows(); },
    units:{1:'inf*9 2,8-10,17; art*4 0,9-3,17; mortar*3 4,10-8,16; eng*2 6,12-9,14; at*2 5,9-8,11',
      2:'inf*4 19,6-27,13; nest*3 20,7-26,12; mortar 25,5-29,10; art*2 29,4-33,12'},
    events:[{day:2, team:1, say:'The guns of the US II Corps fire on the ridge.', hurt:1},
      {day:3, team:2, say:'A German counter-attack comes down from San Pietro.', spawn:'inf*2 26,2-30,5'},
      {day:4, team:1, say:'16 December: the second assault, with the US 142nd Infantry on the flank.', spawn:'inf*4 10,16-16,19'},
      {day:5, team:1, say:'American and Italian guns fire together on the summit.', hurt:1}]},
  filottrano:{name:'Filottrano', place:'The hill town of Filottrano, the Marche', date:'8 July 1944, 05:00', theme:'spring', weather:'clear',
    p1:{nat:'itcb', co:'utili', funds:0, u:{inf:{n:'Paracadutisti (184ª Nembo)', w:'Carcano, MAB 38 & Breda 30'}}},
    p2:{nat:'ger', co:'hoppe', funds:0, u:{inf:{n:'Grenadiere (278. Infanterie-Division)'}}},
    objective:{win:'hq', limit:13}, goal:'Take Filottrano by {limit}.',
    brief:'The Italian Liberation Corps is fighting up the Adriatic coast on the left of the Polish II Corps, which is driving on Ancona. The hill town of Filottrano commands the roads to the west of the port, and the German 278th Infantry Division has turned it into a fortress. The paratroopers of the Nembo, who chose the King and the Allies at the armistice, are to take it.',
    clock:{start:'1944-07-08T05:00', step:120},
    build:() => { const b = MB(34, 20, ',', 9808);
      b.blobs('G', 10, 0, 0, 33, 16, 1, 2, [',']).blobs('^', 7, 12, 2, 33, 15, 1, 2, [',', 'G']).blobs('T', 5, 0, 0, 33, 16, 1, 1, [',']);
      b.river([[0, 17], [33, 16]], .15);
      b.road([[0, 10], [14, 9], [25, 9], [33, 6]]).road([[25, 9], [26, 19]]).road([[5, 0], [10, 9]]);
      b.rect(23, 7, 28, 11, '^', [',', 'G', 'T', '.']).scatter('x', .5, 23, 7, 28, 11);   // the hill town, its walls and houses shot to pieces
      b.put([[26, 9, 'q'], [24, 8, 'k'], [27, 11, 'k'], [25, 10, 'k'], [31, 4, 'k'], [2, 10, 'Q'], [5, 5, 'C'], [4, 15, 'C'], [15, 13, 'c']]);
      return b.rows(); },
    units:{1:'inf*9 2,3-11,17; art*4 0,5-3,15; mortar*3 4,7-8,13; eng*2 6,8-9,12; at*2 7,5-10,15; recon 5,10',
      2:'inf*3 21,5-29,14; nest*2 22,7-27,12; mortar 26,4-30,8; art 29,6-33,13; pak 24,10'},
    events:[{day:2, team:1, say:'Polish II Corps artillery fires on the town.', hurt:1},
      {day:4, team:2, say:'German reinforcements arrive from Ancona.', spawn:'inf 30,2-33,6'},
      {day:3, team:1, say:'The Nembo\'s second battalion joins the attack.', spawn:'inf*3 8,2-12,5'},
      {day:4, team:1, say:'Polish Shermans of the 2nd Armoured Brigade shell the strongpoints from the ridge.', hurt:1},
      {day:5, team:1, say:'The Polish guns fire again, and the paratroopers go in with the bayonet.', hurt:1}]},
};
for (const [id, m] of Object.entries(ITALY_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

/* ---------- history ---------- */
Object.assign(HISTORY, {
  pindus:{forces:['3rd Alpine Division "Julia": about 10,000 Alpini with mules and mountain guns', 'The Pindus Detachment, about 2,000 men under Colonel Davakis, then the Greek 1st Division and the Cavalry Division'],
    win:'Metsovo falls, and the Greek front is cut in two.', lose:'The Julia is surrounded in the mountains and has to fight its way out.',
    real:'The Julia pushed 40 kilometres into the Pindus and took Vovousa on 2 November, where Colonel Davakis was badly wounded. But Greek reserves closed in behind it on the ridges, and in rain and snow, without supplies, the Alpini had to fight their way back to Albania, losing heavily. By mid-November the Greeks had driven the Italians out of Greece and were advancing into Albania. The war that was meant to last a fortnight stalemated in the Albanian mountains until Germany invaded Greece in April 1941. The Julia was destroyed on the Don in Russia in January 1943.'},
  keren:{forces:['About 25,000 Italian and Eritrean troops, including the Savoia Grenadiers and colonial brigades, under General Carnimeo', 'The 4th and 5th Indian Divisions with British artillery and Matildas, under General Platt'],
    win:'Keren holds. The road to Asmara is still shut.', lose:'The gorge is forced and Keren falls.',
    real:'The battle of Keren lasted 53 days, from February to March 1941, and it was the hardest fighting of the East African campaign. On 17 March General Lorenzini was killed by a shell. On the night of 15 March the 5th Indian Division took Fort Dologorodoc and held it against repeated counter-attacks; sappers cleared the roadblock in the gorge, and on 27 March the tanks drove through and Keren fell. Both sides lost heavily, and the Eritrean askari fought with a loyalty that impressed their enemies. Asmara fell on 1 April, and Italian East Africa was finished by November.'},
  birelgubi:{forces:['132nd Armoured Division "Ariete": M13/40 tanks, Bersaglieri, 47 mm and 75 mm guns', '22nd Armoured Brigade: three yeomanry regiments in Crusader tanks, newly arrived from England'],
    win:'The charge breaks on the Ariete\'s guns. The British flank is turned.', lose:'The Ariete is overrun, and the road to Tobruk is open from the south.',
    real:'On 19 November 1941 the 22nd Armoured Brigade charged the Ariete\'s positions in the open, without infantry or artillery support. The Italian 47 mm guns and M13s knocked out or disabled dozens of Crusaders; the Ariete also lost many tanks, but held Bir el Gubi, and the British brigade had to pull back. It was one of the best Italian performances of the desert war, and it threw out the plan for Crusader on its first day. Rommel won the tank battles that followed, but by December he had to retreat, and Tobruk was relieved.'},
  folgore:{forces:['185th Paratroopers Division "Folgore": about 5,000 men with rifles, a few 47 mm guns and no transport', 'XIII Corps: the 44th Division, the 7th Armoured Division and the 1st Free French Brigade'],
    win:'The southern sector holds. The British cannot break the Folgore.', lose:'The line breaks in the south and the armour pours through.',
    real:'From 23 October the Folgore held the southern sector against attack after attack, and the British could not break through; the main blow fell in the north, where Montgomery broke the line on 2 November. Ordered to retreat with no transport, the Folgore withdrew on foot across the desert until, surrounded and out of water and ammunition, its last few hundred men surrendered on 6 November. At El Alamein a memorial to them reads: "Mancò la fortuna, non il valore": fortune failed them, not courage.'},
  gorgopotamos:{forces:['A company of Italian infantry in pillboxes at both ends of the viaduct', 'About 150 andartes of ELAS and EDES, and twelve British SOE parachutists under Brigadier Eddie Myers'],
    win:'The garrison holds. The viaduct stands, and the trains keep running.', lose:'The viaduct goes down into the gorge.',
    real:'On the night of 25 November 1942 the andartes of Aris Velouchiotis and Napoleon Zervas attacked the garrison at both ends of the viaduct while the SOE sappers laid their charges. Two spans of the bridge fell into the gorge, and the railway to Piraeus was cut for weeks, during the critical months after El Alamein. It was one of the first great sabotage operations of occupied Europe, and the only time ELAS and EDES fought side by side; they would later fight each other. The occupiers answered the resistance with reprisals: in February 1943 Italian troops killed about 150 men of the village of Domenikon.'},
  gela43:{forces:['The 4th Infantry Division "Livorno", with Renault tanks of Mobile Group E', 'Darby\'s 1st and 4th Ranger Battalions, 4.2-inch mortars, and the guns of the US Navy offshore'],
    win:'Gela is retaken and the Rangers are driven back to the beach.', lose:'The attack dies in the fields in front of the town.',
    real:'On 10 July the Rangers took Gela and beat off the Renaults of Mobile Group E in the streets. On the morning of the 11th the Livorno attacked across the open plain and was caught by Ranger fire, the 4.2-inch mortars, Darby\'s captured guns and the naval gunfire of the cruisers Boise and Savannah. It lost heavily and fell back. The same day the Hermann Göring Division\'s Tigers came within sight of the beaches at Piano Lupo and were also turned back. Sicily fell in 38 days; two weeks after Gela, the Fascist Grand Council deposed Mussolini.'},
  montelungo:{forces:['1st Motorized Group: about 5,000 Italian soldiers, Bersaglieri, infantry and gunners', 'The 29th Panzergrenadier Division of the XIV Panzer Corps, dug in on the ridge'],
    win:'The tricolour flies on Monte Lungo.', lose:'The attack fails on the slopes in the fog.',
    real:'The first assault, on 8 December 1943, went up the hill in fog and was cut to pieces by German machine guns: the Italians lost about 300 men. On 16 December they went again, alongside the US 142nd Infantry, and took the summit. The Allies, who had doubted that Italians would fight for them, changed their minds: the 1st Motorized Group grew into the Italian Liberation Corps, and then into the Combat Groups that fought in the final offensive of 1945. There is an Italian war cemetery on the slope of Monte Lungo today.'},
  filottrano:{forces:['The Italian Liberation Corps: the Nembo paratroopers with artillery support', 'The German 278th Infantry Division'],
    win:'Filottrano falls, and the road to Ancona is open on the left.', lose:'The town holds, and the Poles\' flank is exposed.',
    real:'From 8 to 9 July 1944 the Nembo fought its way into Filottrano house by house and took it, at heavy cost. The battle covered the left flank of the Polish II Corps, which took Ancona on 18 July and gave the Allies a port close behind the front. It was the hardest action of the Italian Liberation Corps; the town remembers it every July.'},
});
Object.assign(CO_FATE, {
  girotti:'Led the Julia back out of the Pindus and fought on in Albania through the winter of 1940-41.',
  lorenzini:'Killed by a shell at Keren on 17 March 1941.',
  balotta:'The Ariete he led at Bir el Gubi fought on to El Alamein, where it was destroyed covering the retreat on 4 November 1942.',
  frattini:'Taken prisoner with the last of the Folgore in November 1942.',
  geloso:'Removed from command in Greece in 1943.',
  chirieleison:'The Livorno fought on to the Etna line and was evacuated to the mainland in August 1943.',
  dapino:'Replaced after the first assault on Monte Lungo; his group became the core of the Italian Liberation Corps.',
  utili:'Led the Italian Liberation Corps up the Adriatic coast in 1944.',
  davakis:'Taken prisoner after the German invasion. He died in January 1943 when the ship carrying him to Italy as a prisoner was torpedoed.',
  platt:'Became Commander-in-Chief, East Africa Command. Died in 1975.',
  scottcockburn:'His brigade fought on through Operation Crusader.',
  zervas:'Led EDES to the end of the occupation and served as a minister in post-war Greece.',
  darby:'Killed by a German shell in northern Italy on 30 April 1945, two days before the German surrender there; promoted brigadier general after his death.',
  senger:'Defended Cassino in 1944 and surrendered the German forces in Italy\'s centre in 1945. Wrote a memoir, Neither Fear nor Hope. Died in 1963.',
  hoppe:'His division fell back to the Gothic Line in the autumn of 1944.',
});
Object.assign(MISSION_LONLAT, {pindus:[21.05, 39.93], keren:[38.46, 15.78], birelgubi:[23.73, 31.65], folgore:[28.78, 30.68], gorgopotamos:[22.3, 38.83], gela43:[14.25, 37.07], montelungo:[13.95, 41.43], filottrano:[13.35, 43.43]});
EUROPE.cities.push(['Rome', 12.5, 41.9], ['Athens', 23.73, 37.98], ['Asmara', 38.93, 15.33], ['Naples', 14.25, 40.85]);
Object.assign(UNIT_INFO, {
  'itgv:inf':'The Italian infantryman of 1940 carried the Carcano rifle of 1891 and, in each squad, a Breda 30 light machine gun that jammed in dust and mud. The Alpini mountain troops, with the black eagle feather in their hats, were among the best soldiers in Europe.',
  'itgv:art':'The 75/13 mountain howitzer broke down into loads for mules. In the Pindus the mules could not get through the mud, and neither could the shells.',
  'itcb:inf':'After the armistice of 8 September 1943 the Italian soldiers in the south who chose to fight on with the Allies went back into the line in their old uniforms and with their old weapons. British and American equipment came later.',
  'gr:inf':'The Greek army of 1940 was small, poor and largely horse-drawn, but its infantry were hardy mountain men fighting for their homes. Their war cry was "Aera!" — "Wind!"',
  'gres:inf':'The andartes of occupied Greece were farmers, students and old soldiers, armed with whatever the Greek army had hidden in 1941 and what the British dropped to them.',
});
Object.assign(SPECS, {r35:['2', '10.6', '43', '20', 'about 1,500']});

/* ---------- the campaign ---------- */
CAMPAIGNS.push({id:'italy', name:'Italy at War', sub:'The Pindus to Filottrano · 1940–1944', side:'axis', missions:['pindus', 'keren', 'birelgubi', 'folgore', 'gorgopotamos', 'gela43', 'montelungo', 'filottrano']});
{ const order = ['training', 'china', 'weiss', 'gelb', 'sea', 'atlantic', 'desert', 'italy', 'rising', 'pacific', 'east', 'west', 'axis'];
  CAMPAIGNS.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)); }
