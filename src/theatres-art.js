/* ============================== THEATRE ART ===============================
   Sprites for the new theatres: 1939-42 tanks, carrier and Pacific aircraft,
   capital ships, carriers, U-boats, escorts and merchantmen, cavalry, flags,
   national markings, admirals' caps and the jungle, paddy and reef tiles. */

/* ---------- palettes ---------- */
Object.assign(PAL, {
  tropic:  {grass:'#5a9a3a', grass2:'#4a8a30', field:'#7aaa4a', field2:'#8ab858', hedge:'#2a5a24', tree:'#1f5a26', tree2:'#2f7a32', trunk:'#5a4026', water:'#3a7a86', water2:'#5a9aa6', sea:'#1f6f8f', sea2:'#3a8eae', sand:'#e8d8a4', road:'#a8704a', road2:'#8a5a3a', roof:'#8a3a2a', wall:'#e2d8c0', hill:'#5a8e3a', rock:'#8a8478', wheat:'#9ab85a', snow:0},
  pacific: {grass:'#80a84a', grass2:'#6e9640', field:'#9ab85a', field2:'#a8bc66', hedge:'#3a6a2a', tree:'#2a6a2a', tree2:'#3a8a3a', trunk:'#6a5030', water:'#2a8ab0', water2:'#5aaed0', sea:'#1a70a8', sea2:'#3a90c8', sand:'#eee2b8', road:'#c8bc98', road2:'#a89c78', roof:'#6a6a5a', wall:'#d8d0b8', hill:'#7a9a48', rock:'#9a9488', wheat:'#b8b860', snow:0},
  atlantic:{grass:'#6a8a5a', grass2:'#5a7a4e', field:'#8a9a64', field2:'#7a8a5a', hedge:'#3a5a34', tree:'#2a4a30', tree2:'#3a5e40', trunk:'#3a2a1a', water:'#3a5a6a', water2:'#5a7a8a', sea:'#2a4658', sea2:'#46667a', sand:'#c8bc98', road:'#8a8678', road2:'#6a665a', roof:'#4a4e58', wall:'#c8c0a8', hill:'#7a8a5a', rock:'#8a8a86', wheat:'#a8a064', snow:0},
  china:   {grass:'#9a9a5a', grass2:'#8a8a4e', field:'#b8a660', field2:'#a8985a', hedge:'#5a6a34', tree:'#3a5a2e', tree2:'#4e7238', trunk:'#4a3420', water:'#6a7a6a', water2:'#8a9a88', sea:'#4a6a78', sea2:'#6a8a96', sand:'#d0c090', road:'#a89068', road2:'#8a7450', roof:'#4a4a50', wall:'#c8b890', hill:'#b0985a', rock:'#9a8e78', wheat:'#c8b064', snow:0},
  poland:  {grass:'#8aa04a', grass2:'#7a9040', field:'#c4b05a', field2:'#b8a454', hedge:'#3a5a28', tree:'#2e5a28', tree2:'#3f7630', trunk:'#4a3420', water:'#3d6f9a', water2:'#5a8cb8', sea:'#2f5f86', sea2:'#4878a2', sand:'#d8c690', road:'#b09a70', road2:'#8c7a56', roof:'#7a4a3a', wall:'#d8ccb0', hill:'#94a250', rock:'#9a9688', wheat:'#dabc5a', snow:0},
  volcanic:{grass:'#7a7a52', grass2:'#6a6a46', field:'#8a8456', field2:'#7a7650', hedge:'#4a5a34', tree:'#3a5a30', tree2:'#4a6a3a', trunk:'#4a3a2a', water:'#2a6a90', water2:'#4a8ab0', sea:'#1e5e88', sea2:'#3a7ea8', sand:'#4a4642', road:'#6a645a', road2:'#4a4640', roof:'#5a5a52', wall:'#8a8478', hill:'#6a6250', rock:'#4a4640', wheat:'#8a8456', snow:0},
});
Object.assign(THEMES, {
  tropic:{n:'Malayan jungle', base:'L', w:{'J':5, '.':2, 'y':2}},
  china: {n:'Chinese loess', base:'.', w:{'l':4, 'y':2, 'T':1, ',':2}},
  poland:{n:'Polish plain', base:',', w:{'.':5, 'T':2, 'v':1}},
  islands:{n:'Pacific islands (naval)', base:'~', w:{}},
});
PAL.islands = PAL.pacific;

/* ---------- terrain tiles ---------- */
const TILE_EXTRA = {
  jungle({P, F, R, X, Y, C, tree}) {
    F(0, 0, 32, 32, shade(C.tree, -.12));
    for (let i = 0; i < 8; i++) tree(2 + (i % 4) * 8 + R(i) * 4, 3 + Math.floor(i / 4) * 15 + R(i + 9) * 6, 4 + R(i + 5) * 2.5);
    for (let i = 0; i < 6; i++) P.line(X + R(i + 40) * 30, Y + R(i + 50) * 10, X + R(i + 40) * 30 + (R(i) - .5) * 4, Y + 20 + R(i + 60) * 12, shade(C.tree2, .1), .4);   // lianas
    for (let i = 0; i < 5; i++) P.ell(X + R(i + 70) * 30, Y + R(i + 80) * 30, 2.5, 1, shade(C.tree2, .2));
  },
  palm({P, F, R, X, Y, C, tufts}) {
    tufts();
    for (let i = 0; i < 3; i++) { const bx = 5 + i * 10 + R(i) * 4, by = 26 - (i % 2) * 8, lean = (R(i + 3) - .5) * 4;
      P.ell(X + bx + 4, Y + by + 1, 5, 1.2, 'rgba(0,0,0,.22)');
      P.line(X + bx, Y + by, X + bx + lean, Y + by - 14, C.trunk, 1);
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .55; P.line(X + bx + lean, Y + by - 14, X + bx + lean + Math.cos(a) * 7, Y + by - 14 + Math.sin(a) * 4 + 3, k % 2 ? C.tree : C.tree2, .9); }
      P.circ(X + bx + lean, Y + by - 13, .9, '#6a5a2a'); }
  },
  paddy({P, F, R, X, Y, C}) {
    F(0, 0, 32, 32, '#7a8a5a');
    for (const [a, b] of [[1, 1], [17, 1], [1, 17], [17, 17]]) { F(a, b, 14, 14, shade(C.water, .2)); for (let i = 0; i < 12; i++) P.line(X + a + 1 + R(i + a) * 12, Y + b + 13, X + a + 1 + R(i + a) * 12, Y + b + 9 + R(i + b) * 2, '#6aa04a', .4); }
  },
  reef({P, F, R, X, Y, C}) {
    F(0, 0, 32, 32, shade(C.sea2, .25));
    for (let i = 0; i < 14; i++) P.ell(X + R(i) * 30, Y + R(i + 20) * 30, 1.5 + R(i + 40) * 2, 1 + R(i + 60), ['#e8dcc0', '#d8c8a8', '#b8d8d0', '#c8a890'][i % 4]);
    for (let i = 0; i < 5; i++) F(R(i + 90) * 26, R(i + 95) * 30, 5, .5, 'rgba(240,248,250,.8)');
  },
  loess({P, F, R, X, Y, C}) {
    F(0, 0, 32, 32, C.hill);
    for (let r = 3; r < 32; r += 5) { F(0, r, 32, 1.2, shade(C.hill, -.14)); F(0, r - 1, 32, .5, shade(C.hill, .12)); }   // terraces
    for (let i = 0; i < 4; i++) P.line(X + R(i) * 30, Y + R(i + 4) * 30, X + R(i) * 30 + 3, Y + R(i + 4) * 30 + 6, shade(C.hill, -.25), .5);   // gullies
  },
};

/* ---------- markings and flags ---------- */
const MARK_EXTRA = {
  plcheck(P, x, y, s = 1) { const q = 1.8 * s; P.R(x - q, y - q, q, q, '#e83040'); P.R(x, y - q, q, q, '#f0f0ea'); P.R(x - q, y, q, q, '#f0f0ea'); P.R(x, y, q, q, '#e83040'); },
  cockade(P, x, y, s = 1) { P.circ(x, y, 3.4 * s, '#c8202a'); P.circ(x, y, 2.3 * s, '#f0f0ea'); P.circ(x, y, 1.2 * s, '#1c3a8a'); },
  ukcockade(P, x, y, s = 1) { P.circ(x, y, 3.4 * s, '#1c3a8a'); P.circ(x, y, 2.3 * s, '#f0f0ea'); P.circ(x, y, 1.2 * s, '#c8202a'); },
  becockade(P, x, y, s = 1) { P.circ(x, y, 3.4 * s, '#c8202a'); P.circ(x, y, 2.3 * s, '#e8c020'); P.circ(x, y, 1.2 * s, '#1a1a1a'); },
  hinomaru(P, x, y, s = 1) { P.circ(x, y, 3.2 * s, '#f0f0ea'); P.circ(x, y, 2.5 * s, '#c8202a'); },
  rocsun(P, x, y, s = 1) { P.circ(x, y, 3.2 * s, '#1c3a9a'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; P.line(x, y, x + Math.cos(a) * 2.6 * s, y + Math.sin(a) * 2.6 * s, '#f0f0ea', .35); } P.circ(x, y, 1.2 * s, '#f0f0ea'); },
};
const FLAG_EXTRA = {
  pl(g, x, y, w, h) { g.fillStyle = '#f4f4ee'; g.fillRect(x, y, w, h / 2); g.fillStyle = '#d42a3a'; g.fillRect(x, y + h / 2, w, h / 2); },
  fr40(g, x, y, w, h) { const c = ['#1c3a8a', '#f4f4ee', '#c8202a']; c.forEach((k, i) => { g.fillStyle = k; g.fillRect(x + i * w / 3, y, w / 3 + .5, h); }); },
  be(g, x, y, w, h) { const c = ['#1a1a1a', '#f0c820', '#d42a2a']; c.forEach((k, i) => { g.fillStyle = k; g.fillRect(x + i * w / 3, y, w / 3 + .5, h); }); },
  jp(g, x, y, w, h, mode) {
    g.fillStyle = '#f4f2ea'; g.fillRect(x, y, w, h);
    if (mode === 'hist') {                            // the Rising Sun flag of the Army and Navy
      const cx = x + w * .44, cy = y + h / 2, R = Math.max(w, h) * 1.2;
      g.fillStyle = '#c8202a';
      for (let i = 0; i < 16; i++) { const a0 = i / 16 * 6.283 - .1, a1 = a0 + .2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); g.fill(); }
      g.beginPath(); g.arc(cx, cy, h * .3, 0, 7); g.fill();
    } else { g.fillStyle = '#c8202a'; g.beginPath(); g.arc(x + w / 2, y + h / 2, h * .3, 0, 7); g.fill(); }
  },
  cn(g, x, y, w, h) {                                 // Blue Sky, White Sun, and a Wholly Red Earth
    g.fillStyle = '#d42a2a'; g.fillRect(x, y, w, h); g.fillStyle = '#1c3a9a'; g.fillRect(x, y, w / 2, h / 2);
    const cx = x + w / 4, cy = y + h / 4, r = h * .13; g.fillStyle = '#f4f4ee';
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.beginPath(); g.moveTo(cx + Math.cos(a - .2) * r, cy + Math.sin(a - .2) * r); g.lineTo(cx + Math.cos(a) * r * 1.9, cy + Math.sin(a) * r * 1.9); g.lineTo(cx + Math.cos(a + .2) * r, cy + Math.sin(a + .2) * r); g.fill(); }
    g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  },
};

/* ---------- uniforms, kit and personal weapons ---------- */
const SOLDIER_EXTRA = {
  jp(P, x, y, uni, hel, kneel) { P.R(x + 1, y + 3, 1.6, 3, shade(uni, .06)); P.R(x + 1.2, y + 2, 1.2, 1, shade(uni, .06)); P.circ(x + 4.6, y + .9, .5, '#e0c040'); P.R(x + 1, y + .1, 6, .4, '#4a6a2a'); if (!kneel) P.R(x + 3, y + 13, 4, 1, '#9a8a5a'); },   // neck flap, star, foliage net
  cn(P, x, y, uni) { P.circ(x + 4.6, y + 1.6, .5, '#3a5ac0'); P.R(x + 6.4, y + 8.6, .6, 3, '#7a6040'); P.R(x + 6.2, y + 8, 1, .8, '#4a4a40'); P.R(x + 2, y + 9.4, 5, .8, '#8a7a50'); },   // sun badge, stick grenade, cloth bandolier
  pl(P, x, y, uni) { P.circ(x + 4.6, y + 1.6, .4, '#e8e8e0'); P.R(x + 2, y + 10, 5, 1, '#5a4430'); P.R(x + 1, y + 7, 1.6, 3, '#6a5a3a'); },
  fr40(P, x, y, uni, hel, kneel) { P.R(x + 2, y + 10, 5, 3, uni); P.R(x + 2, y + 12.6, 5, .5, shade(uni, -.2)); P.R(x + 1, y + 6.5, 1.5, 4, '#6a5a3a'); if (!kneel) P.R(x + 3, y + 14, 4, 1.4, '#6a6248'); },   // greatcoat skirts buttoned back, musette, puttees
  be(P, x, y, uni, hel, kneel) { P.R(x + 2, y + 10, 5, 3, uni); P.R(x + 1, y + 6.5, 1.5, 4, '#6a5a3a'); },
};
const WEAPON_EXTRA = {
  lance(P, x, y, wy, arm) { P.line(x - 3, y + 15, x + 15, y - 6, '#6a5030', .5); P.R(x + 13.5, y - 6, 2.4, 1, '#e8e8e0'); P.R(x + 13.5, y - 5, 2.4, 1, '#d42a3a'); arm(); },   // pennant in the regiment's colours
  sabre(P, x, y, wy, arm) { P.line(x + 7, y + 9, x + 11, y + 3, '#d0d0d0', .5); P.line(x + 11, y + 3, x + 13, y + 1.5, '#d0d0d0', .4); P.R(x + 6.5, y + 8.6, 1.4, .6, '#c8a040'); arm(); },
  katana(P, x, y, wy, arm) { P.line(x + 7, y + 9, x + 14, y + 1, '#e0e0e0', .45); P.R(x + 6.2, y + 9, 1.6, 1.6, '#3a2a20'); P.R(x + 6.6, y + 8.6, 1.4, .5, '#c8a040'); arm(); },   // officer's shin-guntō
  dadao(P, x, y, wy, arm) { P.poly([[x + 7, y + 8], [x + 12, y + 2.5], [x + 14, y + 3.5], [x + 9, y + 9]], '#c8c8c8'); P.R(x + 6, y + 8.5, 1.5, 1.5, '#5a3a20'); P.R(x + 5.4, y + 10, .8, 2, '#c8202a'); arm(); },   // broadsword with its red tassel
};
/* mounted troops: horse and rider */
function drawCav(P, nat, f, n = 3, w = ['sabre', 'rifle']) {
  const horse = (cx, cy, coat, ph) => {
    const k = (f + ph) % 4, sw = [0, 1, 0, -1][k];
    P.ell(cx + 1, cy + 9.5, 7, 1.4, 'rgba(0,0,0,.2)');
    for (const [lx, d] of [[cx - 4, sw], [cx - 2, -sw], [cx + 4, -sw], [cx + 6, sw]]) { P.line(lx, cy + 2, lx + d, cy + 8, shade(coat, -.15), .9); P.R(lx + d - .5, cy + 8, 1.4, .8, '#2a2420'); }
    P.ell(cx + 1, cy, 6.5, 3.4, coat); P.ell(cx - .5, cy - 1, 4, 1.6, shade(coat, .12));
    P.poly([[cx + 5, cy - 1], [cx + 8, cy - 7], [cx + 10, cy - 7], [cx + 8.5, cy - 1]], coat); P.poly([[cx + 8, cy - 8], [cx + 12, cy - 6], [cx + 11.5, cy - 4.5], [cx + 8.5, cy - 5]], coat);   // neck and head
    P.R(cx + 7.6, cy - 8, 1.6, 4, '#2a2420'); P.px(cx + 10.5, cy - 6.8, '#111');
    P.line(cx - 5.5, cy - 1, cx - 7.5, cy + 4, '#2a2420', .9);                           // tail
    P.R(cx - 2, cy - 3, 5, 1.6, '#4a3020');                                              // saddle
  };
  const riders = n >= 2 ? [[5, 19, '#6a4a2a', 0, w[0]], [17, 16, '#3a2a1e', 2, w[1] || w[0]]] : [[11, 18, '#6a4a2a', 0, w[0]]];
  for (const [cx, cy, coat, ph, wp] of riders) { horse(cx, cy, coat, ph); soldier(P, cx - 4, cy - 15, nat, wp, f, true); }
}

/* ---------- 1939-42 armour and Pacific vehicles ---------- */
Object.assign(TANKS, {
  pz2:     {x0:5, L:22, hullH:5, glacis:3, tur:{x:9, w:7, h:4, sh:'box'}, gun:{len:6, th:.7}, wheels:'christie'},
  pz3:     {x0:3, L:25, hullH:6, glacis:2, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:9, th:1}, wheels:'torsion'},
  pz4d:    {x0:3, L:26, hullH:6, glacis:2, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:4, th:1.6}, wheels:'small8'},
  tp7:     {x0:4, L:23, hullH:6, glacis:3, tur:{x:9, w:8, h:4, sh:'box'}, gun:{len:7, th:.8}, wheels:'small8'},
  t26:     {x0:4, L:23, hullH:6, glacis:3, tur:{x:9, w:9, h:4, sh:'round'}, gun:{len:8, th:.9}, wheels:'small8'},
  tks:     {x0:7, L:18, hullH:5, glacis:3, tur:null, wheels:'carrier', open:1, bren:1},
  h39:     {x0:5, L:21, hullH:6, glacis:4, tur:{x:8, w:8, h:5, sh:'cast', cupola:1}, gun:{len:6, th:.8}, wheels:'small8'},
  somua:   {x0:2, L:27, hullH:7, glacis:5, tur:{x:10, w:9, h:5, sh:'cast', cupola:1}, gun:{len:8, th:1}, wheels:'small8', skirt:1},
  charb1:  {x0:1, L:29, hullH:9, glacis:2, trackH:4, tur:{x:13, w:7, h:5, sh:'cast', cupola:1}, gun:{len:6, th:.9}, wheels:'churchill', hullgun:1},
  matilda: {x0:2, L:27, hullH:7, glacis:2, trackH:3, tur:{x:11, w:9, h:5, sh:'cast'}, gun:{len:6, th:.8}, wheels:'churchill', skirt:1},
  matilda1:{x0:4, L:22, hullH:6, glacis:3, tur:{x:8, w:7, h:4, sh:'cast'}, gun:{len:4, th:.5}, wheels:'small8'},
  a13:     {x0:2, L:27, hullH:6, glacis:3, tur:{x:11, w:10, h:5, sh:'box'}, gun:{len:7, th:.8}, wheels:'christie'},
  hago:    {x0:5, L:21, hullH:6, glacis:4, tur:{x:7, w:7, h:5, sh:'cast'}, gun:{len:6, th:.8}, wheels:'small8', rivets:1},
  chiha:   {x0:3, L:25, hullH:6, glacis:4, tur:{x:10, w:8, h:5, sh:'cast', cupola:1}, gun:{len:4, th:1.3}, wheels:'small8', rivets:1, ring:1},
  chihakai:{x0:3, L:25, hullH:6, glacis:4, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:9, th:1}, wheels:'small8', rivets:1, ring:1},
  kv1:     {x0:2, L:27, hullH:7, glacis:3, tur:{x:10, w:11, h:6, sh:'box'}, gun:{len:10, th:1.2}, wheels:'torsion'},
  t60:     {x0:5, L:21, hullH:5, glacis:4, tur:{x:8, w:7, h:4, sh:'hex'}, gun:{len:7, th:.6}, wheels:'small8'},
  stuart:  {x0:4, L:23, hullH:7, glacis:3, tur:{x:9, w:8, h:5, sh:'box'}, gun:{len:6, th:.8}, wheels:'vvss', tall:1},
  lvt:     {x0:2, L:28, hullH:9, glacis:6, tur:null, wheels:'small8', open:1, bren:1},
});
Object.assign(WHEELED, {
  sdkfz222:{x0:5, L:22, h:6, n:2, r:3, slopeF:5, slopeR:4, tur:{x:9, w:7, h:3, gun:5, open:1}},
  panhard: {x0:3, L:26, h:6, n:4, r:2.4, slopeF:5, slopeR:4, tur:{x:12, w:8, h:4, gun:7}},
});
Object.assign(SHIPS, {
  fubuki:{len:30, hull:'#7a7e84', deck:'#6a5a44', funnels:2, guns:3, mast:1},
});
Object.assign(PLANES, {
  bf109e:   {len:23, nose:'pointed', top:'#4a5a42', bot:'#9ab0c8', mottle:'#3a4836', spinner:'#4a5a42', canopy:'frame', wing:'#40503a', mark:'balken'},
  p11:      {len:21, nose:'radial', top:'#6a6a46', bot:'#a8b0b8', spinner:'#3a3a34', canopy:'open', gull:1, spats:1, wing:'#5e5e40', mark:'plcheck'},
  karas:    {len:24, nose:'radial', top:'#6a6a46', bot:'#a8b0b8', spinner:'#3a3a34', canopy:'long', wing:'#5e5e40', mark:'plcheck', bomb:1, spats:1},
  d520:     {len:24, nose:'pointed', top:'#5e6a48', bot:'#a8b8c8', mottle:'#6a5a40', spinner:'#3a3a34', canopy:'frame', wing:'#525e3e', mark:'cockade'},
  leo451:   {len:26, nose:'inline', top:'#5e6a48', bot:'#a8b8c8', mottle:'#6a5a40', spinner:'#3a3a34', canopy:'long', wing:'#525e3e', mark:'cockade', twin:1, bomb:1},
  hurricane:{len:24, nose:'pointed', top:'#5b6448', bot:'#d0d0c8', mottle:'#7a6a48', spinner:'#202020', canopy:'frame', wing:'#4f5740', mark:'raf'},
  battle:   {len:26, nose:'inline', top:'#5b6448', bot:'#1e1e1e', mottle:'#7a6a48', spinner:'#202020', canopy:'long', wing:'#4f5740', mark:'raf', bomb:1},
  swordfish:{len:23, nose:'radial', top:'#7a8a7a', bot:'#c8ccc0', spinner:'#3a3a34', canopy:'open', wing:'#6a7a6a', mark:'raf', biplane:1, torpedo:1, spats:1},
  zero:     {len:23, nose:'radial', top:'#d8d4c0', bot:'#d0ccb8', spinner:'#b8b0a0', canopy:'frame', wing:'#c8c4b0', mark:'hinomaru', cowlRing:'#1a1a1a'},
  val:      {len:24, nose:'radial', top:'#d0ccb8', bot:'#c8c4b0', spinner:'#3a3a34', canopy:'long', wing:'#c0bca8', mark:'hinomaru', spats:1, bomb:1, cowlRing:'#1a1a1a'},
  kate:     {len:26, nose:'radial', top:'#8a9478', bot:'#b8bca8', spinner:'#3a3a34', canopy:'long', wing:'#7a8468', mark:'hinomaru', torpedo:1, cowlRing:'#1a1a1a'},
  p40:      {len:24, nose:'chin', top:'#6a6a42', bot:'#b8bcb0', mottle:'#7a6a48', spinner:'#2a2a24', canopy:'frame', wing:'#5a5a3a', mark:'rocsun', shark:1},
  sb2:      {len:26, nose:'inline', top:'#4c5a33', bot:'#90a8ba', spinner:'#3a3a34', canopy:'long', wing:'#3f4c2a', mark:'rocsun', twin:1, bomb:1},
  wildcat:  {len:22, nose:'radial', top:'#6a7a8a', bot:'#d8dcd8', spinner:'#3a3a34', canopy:'frame', wing:'#5a6a7a', mark:'usstarbar', cowlRing:'#5a6a7a'},
  sbd:      {len:25, nose:'radial', top:'#6a7a8a', bot:'#d8dcd8', spinner:'#3a3a34', canopy:'long', wing:'#5a6a7a', mark:'usstarbar', bomb:1},
  avenger:  {len:26, nose:'radial', top:'#3a4a6a', bot:'#d8dcd8', spinner:'#3a3a34', canopy:'long', wing:'#34445e', mark:'usstarbar', torpedo:1},
});

/* ---------- warships, U-boats and merchantmen ---------- */
const wake = (P, x0, x1, y, f) => { P.R(x1 - 3, y + 2, 4, 1, '#e8f0f4'); for (let i = 0; i < 6; i++) P.circ(x0 + i * 3 + (f % 3), y + 3, .5, 'rgba(232,240,244,.8)'); };
function hullShape(P, x0, x1, y, h, col, sheer = 1) { P.poly([[x0, y - h + 1], [x0 + 3, y - h], [x1 - 6, y - h - .3], [x1, y - h - sheer], [x1 - 3, y + 2], [x0 + 3, y + 2]], col); P.R(x0 + 2, y - h, x1 - x0 - 6, .8, shade(col, -.25)); }
function turret(P, x, y, dir, len, col, big = 1) { P.poly([[x - 2 * big, y + 1], [x - 1.5 * big, y - 1.4 * big], [x + 1.5 * big, y - 1.4 * big], [x + 2 * big, y + 1]], col); P.R(dir > 0 ? x + 1.5 * big : x - 1.5 * big - len, y - .7 * big, len, .5, '#2a2e34'); P.R(dir > 0 ? x + 1.5 * big : x - 1.5 * big - len, y - .1 * big, len, .5, '#2a2e34'); }
function capital(P, f, o) {
  const y = 21, x0 = 0, x1 = 32, hull = o.hull;
  hullShape(P, x0, x1, y, 3, hull, 1.5);
  if (o.dazzle) { P.poly([[x1 - 7, y - 3], [x1 - 4, y - 3], [x1 - 6, y + 2], [x1 - 9, y + 2]], '#1a1a1a'); P.poly([[x1 - 4, y - 3], [x1 - 2, y - 3.5], [x1 - 3, y + 1], [x1 - 6, y + 2]], '#f0f0ea'); P.poly([[x0 + 3, y - 3], [x0 + 6, y - 3], [x0 + 8, y + 2], [x0 + 5, y + 2]], '#1a1a1a'); }
  P.R(x0 + 2, y - 3.5, x1 - 6, .8, o.deck);
  // superstructure: pagoda, tower or box
  if (o.pagoda) { for (let i = 0; i < 6; i++) P.R(15 - i * .3, y - 5 - i * 2.2, 6 - i * .5, 2, shade(hull, i % 2 ? .06 : -.04)); P.R(16, y - 19, 2, 2, '#3a3e44'); }
  else if (o.tower) { P.R(13, y - 8, 7, 5, shade(hull, .05)); P.R(14, y - 12, 4, 4, shade(hull, .1)); P.R(15, y - 15, 2, 3, '#3a3e44'); P.R(13, y - 7, 7, .6, '#2a2e34'); }
  else { P.R(13, y - 7, 8, 4, shade(hull, .06)); P.R(14, y - 10, 5, 3, shade(hull, .1)); P.R(15, y - 12, 2, 2, '#3a3e44'); }
  for (let i = 0; i < (o.funnels || 1); i++) { const fx = 9 + i * 3.5; P.R(fx, y - 9, 2.6, 6, shade(hull, -.14)); P.R(fx, y - 9, 2.6, .8, '#222'); P.circ(fx + 1 - (f % 3) * .6, y - 11 - (f % 3), 1.2 + (f % 3) * .5, 'rgba(70,70,70,.35)'); }
  // main armament: two turrets forward, one or two aft
  turret(P, 24, y - 4, 1, 6, shade(hull, -.04), 1.2); turret(P, 21, y - 5.5, 1, 6, shade(hull, -.04), 1.2);
  turret(P, 6, y - 4, -1, 5, shade(hull, -.04), 1.2); if (o.aft2) turret(P, 9.5, y - 5.5, -1, 5, shade(hull, -.04), 1.2);
  P.R(18, y - 17, .5, 6, '#3a3e44');
  wake(P, x0, x1, y, f);
  return {mx:4, my:y - 1};
}
function carrier(P, f, o) {
  const y = 21, x0 = 0, x1 = 32;
  hullShape(P, x0, x1, y, 2, o.hull, .5);
  P.R(x0, y - 4, 32, 2.4, o.deck); P.R(x0, y - 4, 32, .4, shade(o.deck, .2));
  for (let x = 2; x < 31; x += 3) P.R(x, y - 3, 1.4, .3, shade(o.deck, -.15));   // deck planking stripes
  P.R(x0 + 2, y - 3.2, 28, .25, '#e8e4d0');
  const ix = o.islandLeft ? 6 : 19;
  P.R(ix, y - 9, 5, 5, shade(o.hull, .06)); P.R(ix + 1, y - 12, 3, 3, shade(o.hull, .1)); P.R(ix + 4, y - 10, 2, 5, shade(o.hull, -.14)); P.R(ix + 2, y - 15, .5, 4, '#3a3e44');
  if (o.hinomaru) P.circ(28, y - 3, 1.1, '#c8202a');
  if (o.num) { P.R(4, y - 3.6, 1, 1.6, '#f0f0ea'); P.R(5.5, y - 3.6, 1, 1.6, '#f0f0ea'); }
  for (let i = 0; i < (o.planes || 2); i++) { const px = 3 + i * 3.4; P.R(px, y - 4.6, 2.6, .6, o.plane); P.R(px + .9, y - 5.2, .8, 1.6, o.plane); }   // aircraft ranged aft
  wake(P, x0, x1, y, f);
  return {mx:24, my:y - 1};
}
function escort(P, f, o) {
  const y = 21, x0 = 4, x1 = 30;
  hullShape(P, x0, x1, y, 3, o.hull, 2.5);
  if (o.camo) { P.poly([[x0 + 8, y - 3], [x0 + 12, y - 3], [x0 + 10, y + 2], [x0 + 6, y + 2]], o.camo); P.poly([[x1 - 9, y - 3], [x1 - 6, y - 3], [x1 - 5, y + 2], [x1 - 10, y + 2]], o.camo); }
  P.R(x1 - 9, y - 6, 4, 3, shade(o.hull, .08)); P.R(x1 - 8.5, y - 7, 3, 1, '#2a2e34');   // bridge
  P.R(x0 + 10, y - 8, 2.6, 5, shade(o.hull, -.12)); P.R(x0 + 10, y - 8, 2.6, .7, '#222');
  P.circ(x0 + 11 - (f % 3) * .5, y - 10 - (f % 3), 1 + (f % 3) * .4, 'rgba(80,80,80,.3)');
  P.R(x1 - 7.5, y - 13, .5, 7, '#3a3e44'); P.R(x1 - 9, y - 11, 4, .4, '#3a3e44');
  P.R(x1 - 4, y - 5, 2, 1.4, '#4a4e54'); P.R(x1 - 2, y - 4.8, 2.4, .5, '#2a2e34');      // 4-inch gun on the fo'c'sle
  for (let i = 0; i < 3; i++) P.circ(x0 + 2 + i * 1.6, y - 3.4, .7, '#2a2a2a');         // depth charges on the stern rails
  if (o.hedgehog) P.R(x1 - 6, y - 4.6, 1.6, 1, '#3a3a34');
  wake(P, x0, x1, y, f);
  return {mx:x0 + 5, my:y - 1};
}
function uboat(P, f, o) {
  const y = 22, hull = o.hull;
  P.poly([[2, y - 1], [6, y - 2], [26, y - 2], [31, y - .5], [28, y + 1.4], [4, y + 1.4]], hull);
  P.R(5, y - 2.6, 21, .8, shade(hull, .1));
  P.poly([[13, y - 2], [13.5, y - 7], [19, y - 7], [20, y - 2]], shade(hull, .05)); P.R(13.5, y - 7.4, 5.5, .6, shade(hull, .18));   // conning tower
  if (o.wintergarten) P.R(11, y - 4, 2, 2, shade(hull, -.1));
  P.R(16, y - 11, .5, 4, '#2a2e34'); P.R(17.4, y - 10, .4, 3, '#2a2e34');                 // periscopes
  P.R(22, y - 3.6, 1.6, 1.2, '#3a3e44'); P.R(23.6, y - 3.4, 2.8, .4, '#2a2e34');          // deck gun
  if (o.badge) P.circ(14.8, y - 5, .7, o.badge);
  if (o.mark) MARK_EXTRA[o.mark] && MARK_EXTRA[o.mark](P, 17, y - 5, .45);
  P.R(2, y, 29, 1, 'rgba(232,240,244,.55)');
  return {};
}
function merchant(P, f, o) {
  const y = 21, x0 = 1, x1 = 31;
  hullShape(P, x0, x1, y, 4, o.hull, 1.5);
  P.R(x0 + 2, y - 4.2, x1 - x0 - 6, .8, '#b84a2a');                                    // boot topping
  for (const hx of [6, 10, 22, 25]) P.R(hx, y - 5, 2.4, 1, '#4a4038');                  // cargo hatches
  P.R(14, y - 9, 6, 4, o.house); P.R(14.5, y - 8, 5, .6, '#2a2e34');
  P.R(16, y - 12, 2.2, 3, o.funnel); P.R(16, y - 12, 2.2, .6, '#1a1a1a'); P.circ(17 - (f % 3) * .5, y - 14 - (f % 3), 1 + (f % 3) * .5, 'rgba(60,60,60,.35)');
  for (const mx of [8, 24]) { P.R(mx, y - 15, .5, 11, '#4a3a2a'); P.line(mx, y - 13, mx - 3, y - 6, '#4a3a2a', .3); P.line(mx, y - 13, mx + 3, y - 6, '#4a3a2a', .3); }   // masts and derricks
  if (o.deckload) { P.R(5, y - 6.5, 5, 1.4, '#6a6448'); P.R(21, y - 6.5, 6, 1.4, '#5a6044'); }   // crated cargo, a lorry on deck
  wake(P, x0, x1, y, f);
  return {mx:x0 + 4, my:y - 1};
}
function flak88(P, C, f, nat) {
  P.poly([[2, 26], [16, 23], [30, 26], [16, 28]], '#4a4c44'); P.line(16, 23, 16, 28.5, '#3a3c34', 1.4);   // cruciform platform
  P.R(12, 19, 8, 5, shade(C.m, -.05)); P.R(13, 17, 6, 3, C.m);
  P.line(16, 18, 31, 14.5, shade(C.m, -.15), 1.6); P.line(16, 17.6, 31, 14, shade(C.m, .12), .4); P.R(29.5, 13.6, 2, 2, '#2a2a26');
  P.poly([[17, 13], [19, 13], [19.5, 19], [17.5, 19]], shade(C.m, .04));                 // shield
  for (let i = 0; i < 3; i++) P.R(19 + i * 2.6, 15.6 - i * .6, .5, 1.6, '#f0f0ea');      // kill rings on the barrel
  soldier(P, 3, 11, nat, 'shell', f, true);
  return {};
}
const EXTRA_SHAPES = {
  sub7:   (P, C, f) => uboat(P, f, {hull:'#6a7074', wintergarten:1, badge:'#c8a040'}),
  subus:  (P, C, f) => uboat(P, f, {hull:'#3a3e44'}),
  subuk:  (P, C, f) => uboat(P, f, {hull:'#4a5058'}),
  subjp:  (P, C, f) => uboat(P, f, {hull:'#2e3236', mark:'hinomaru'}),
  corvette:(P, C, f) => escort(P, f, {hull:'#e0e6e8', camo:'#7aa8b8'}),       // Western Approaches scheme: white with pale blue and green
  sloop:  (P, C, f) => escort(P, f, {hull:'#d8dee2', camo:'#5a8aa0', hedgehog:1}),
  trawler:(P, C, f) => escort(P, f, {hull:'#7a7e80'}),
  de:     (P, C, f) => escort(P, f, {hull:'#7a8694', camo:'#4a5664', hedgehog:1}),
  bbger:  (P, C, f) => capital(P, f, {hull:'#8a9096', deck:'#a8946a', tower:1, aft2:1, dazzle:1}),
  bbus:   (P, C, f) => capital(P, f, {hull:'#6e7a86', deck:'#5a6670', tower:1, funnels:2, aft2:0}),
  bbuk:   (P, C, f) => capital(P, f, {hull:'#9aa4aa', deck:'#a8946a', funnels:2, aft2:0}),
  bbjp:   (P, C, f) => capital(P, f, {hull:'#7a7e84', deck:'#7a6a50', pagoda:1, funnels:2, aft2:1}),
  cvus:   (P, C, f) => carrier(P, f, {hull:'#6e7a86', deck:'#6a6a5a', plane:'#4a5a6a', planes:3, num:1}),
  cvjp:   (P, C, f) => carrier(P, f, {hull:'#7a7e84', deck:'#a88a5a', plane:'#d0ccb8', planes:3, hinomaru:1, islandLeft:1}),
  cvuk:   (P, C, f) => carrier(P, f, {hull:'#9aa4aa', deck:'#6a6a62', plane:'#7a8a7a', planes:2}),
  cve:    (P, C, f) => carrier(P, f, {hull:'#7a8694', deck:'#6a6a5a', plane:'#3a4a6a', planes:2}),
  freighter:(P, C, f) => merchant(P, f, {hull:'#5a5e60', house:'#d8d0b8', funnel:'#2a2a2a', deckload:1}),
  liberty:(P, C, f) => merchant(P, f, {hull:'#7a8288', house:'#8a929a', funnel:'#6a727a', deckload:1}),
  flak88: (P, C, f, nat) => flak88(P, C, f, nat),
};

/* ---------- generals' uniforms and caps ---------- */
const TUNIC_EXTRA = {
  navy(P, L, tunic, nat) {
    const jac = L.whites ? '#f0f0ea' : tunic;
    P.poly([[2, 48], [5, 38], [14, 34], [34, 34], [43, 38], [46, 48]], jac);
    if (L.whites) { P.R(17, 33, 14, 3, '#f4f4ee'); for (let i = 0; i < 4; i++) P.circ(24, 37 + i * 2.6, .6, '#d8b040'); P.R(15, 34, 4, 2, '#d8b040'); P.R(29, 34, 4, 2, '#d8b040'); return; }
    P.poly([[19, 34], [24, 42], [29, 34]], '#f4f4ee'); P.poly([[23, 36], [24.6, 36], [24.4, 42], [23.4, 42]], '#1a1a1a');   // shirt and black tie
    P.poly([[15, 34], [23, 43], [19, 34]], shade(jac, .1)); P.poly([[33, 34], [25, 43], [29, 34]], shade(jac, .1));            // lapels
    for (let r = 0; r < 2; r++) for (const xx of [18, 30]) P.circ(xx, 43 + r * 3, .6, '#d8b040');                              // double-breasted buttons
    for (let i = 0; i < 3; i++) P.R(3, 45 - i * 1.2, 8, .5, '#d8b040');                                                        // sleeve rings
    if (nat === 'ger40' || nat === 'ger') { P.R(30, 39, 4, 2, '#d8b040'); }
    if (L.duffel) { P.poly([[2, 48], [4, 38], [12, 35], [16, 48]], '#8a7a5a'); P.poly([[46, 48], [44, 38], [36, 35], [32, 48]], '#8a7a5a'); for (let i = 0; i < 3; i++) P.R(13, 40 + i * 2.6, 2.5, .8, '#d8c8a0'); }
  },
  jp(P, L, tunic) { P.R(17, 33, 14, 4, shade(tunic, -.05)); P.R(16, 34.4, 4, 2.4, L.collar || '#c03028'); P.R(28, 34.4, 4, 2.4, L.collar || '#c03028'); for (const xx of [17, 18.4, 29, 30.4]) P.circ(xx, 35.6, .45, '#e0c050'); for (let i = 0; i < 4; i++) P.circ(24, 39 + i * 2.4, .55, '#c8b060'); P.R(19, 40, 4, 2.5, shade(tunic, -.08)); P.R(25, 40, 4, 2.5, shade(tunic, -.08)); },
  cn(P, L, tunic) { P.R(17, 33, 14, 4, shade(tunic, -.06)); P.R(16, 34.4, 4, 2.4, '#3a5ac0'); P.R(28, 34.4, 4, 2.4, '#3a5ac0'); for (let i = 0; i < 4; i++) P.circ(24, 39 + i * 2.4, .55, '#c8b060'); P.R(17, 39, 5, 3, shade(tunic, -.08)); P.R(26, 39, 5, 3, shade(tunic, -.08)); P.circ(10, 40, 1.4, '#1c3a9a'); P.circ(10, 40, .6, '#f0f0ea'); },
  pl(P, L, tunic) { P.R(17, 33, 14, 4, shade(tunic, -.06)); for (const sx of [15.5, 27.5]) { P.R(sx, 34.4, 5, 2.4, '#3a3a2a'); for (let i = 0; i < 4; i++) P.line(sx + i * 1.2, 35, sx + .6 + i * 1.2, 36.4, '#d0d0c8', .3); } for (let i = 0; i < 4; i++) P.circ(24, 39 + i * 2.4, .55, '#c8c8c0'); P.R(37, 40, 3, 4, '#c8c8c0'); },
};
const capPeak = (P, crown, band, peak = '#141414') => { P.ell(24, 9, 14, 5, crown); P.R(13, 9, 22, 4, crown); P.ell(20, 7.5, 6, 2, shade(crown, .12)); P.R(14, 12, 20, 3, band); P.poly([[13, 15], [35, 15], [32, 18], [16, 18]], peak); P.R(17, 15.4, 12, .6, '#4a4a4a'); };
const faceExtras = (P, L) => {                       // the moustache sits between this face's nose and mouth (drawFace leaves them in FACE_AT)
  const f = typeof FACE_AT !== 'undefined' && FACE_AT.my ? FACE_AT : {nt:25.4, my:28, mw:6}, col = shade(L.hair === '#e8bc98' ? '#6a5a48' : L.hair, -.05);
  // a broad soldier's moustache, never a toothbrush
  if (L.moustache) { const w = Math.max(6.6, Math.min(9, f.mw + 2.4)), y = f.nt + 1, h = Math.max(1.1, f.my - y - .1); P.R(24 - w / 2, y, w, h, col); P.R(24 - w / 2 - .4, y + h - .5, .8, .6, col); P.R(24 + w / 2 - .4, y + h - .5, .8, .6, col); P.R(24 - w / 2 + .6, y, w - 1.2, .4, shade(col, .15)); }
  if (L.teeth) P.R(22.4, f.my + .2, 3.4, .7, '#f0ece0');
};
const CAP_EXTRA = {
  navy(P, L) {
    capPeak(P, L.crown || '#f0f0ea', '#1a1a1a');
    P.R(15, 14.6, 18, .5, '#d8b040'); for (let i = 0; i < 5; i++) P.ell(17 + i * 3.4, 16.3, 1, .5, '#d8b040');    // gold oak leaves on the peak
    const b = L.badge;
    if (b === 'anchor' || b === 'usanchor') { P.circ(24, 12.8, 2, '#d8b040'); P.R(23.6, 11, .8, 3.4, '#1a1a1a'); P.R(22.4, 13.6, 3.2, .5, '#1a1a1a'); if (b === 'usanchor') { P.poly(starPts(24, 9.6, .9), '#e8e0c0'); P.ell(24, 10.6, 2.6, .8, '#d8b040'); } else P.R(22.5, 10, 3, 1, '#c03028'); }
    else if (b === 'eagle') { P.poly([[19, 10], [24, 8.4], [29, 10], [24, 11]], '#d8b040'); P.circ(24, 13, 1.6, '#d8b040'); P.circ(24, 13, .7, '#1a1a1a'); }
    else if (b === 'cherry') { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - 1.57; P.circ(24 + Math.cos(a) * 1.2, 12.6 + Math.sin(a) * 1.2, .8, '#d8b040'); } P.ell(24, 14.4, 3.6, .7, '#d8b040'); }
    faceExtras(P, L);
  },
  jpcap(P, L) { capPeak(P, '#8a7a46', '#c03028', '#2a2018'); P.poly(starPts(24, 12.6, 1.4), '#e0c040'); P.R(15, 14.6, 18, .4, '#3a2a18'); faceExtras(P, L); },
  cnpeak(P, L) { capPeak(P, '#6c7268', '#3a4038'); P.circ(24, 12.8, 1.8, '#1c3a9a'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; P.line(24, 12.8, 24 + Math.cos(a) * 1.4, 12.8 + Math.sin(a) * 1.4, '#f0f0ea', .25); } P.circ(24, 12.8, .6, '#f0f0ea'); P.R(15, 14.6, 18, .4, '#d8b040'); faceExtras(P, L); },
  rogatywka(P, L) {                                  // the four-cornered Polish cap with the White Eagle
    P.poly([[12, 13], [16, 5], [24, 2], [32, 5], [36, 13]], '#6e6c48'); P.line(16, 5, 32, 5, shade('#6e6c48', -.15), .3); P.line(24, 2, 24, 9, shade('#6e6c48', -.15), .3);
    P.R(14, 11, 20, 4, '#3a3a2a'); P.poly([[13, 15], [35, 15], [32, 18], [16, 18]], '#141414');
    P.poly([[22, 10], [24, 8.4], [26, 10], [25.4, 12.6], [22.6, 12.6]], '#e0e0d8'); P.circ(24, 8.8, .6, '#e0c040');
    for (let i = 0; i < 6; i++) P.line(15 + i * 3, 14.2, 16 + i * 3, 13.2, '#d0d0c8', .3);   // general's zigzag braid
    faceExtras(P, L);
  },
  brit(P, L) { capPeak(P, L.crown || '#8a7a54', L.band || '#b02020'); P.ell(24, 12.6, 1.8, 1.4, '#d8b040'); P.R(23, 10.4, 2, 1.2, '#d8b040'); P.R(15, 14.6, 18, .5, '#d8b040'); for (let i = 0; i < 5; i++) P.ell(17 + i * 3.4, 16.3, 1, .5, '#d8b040'); faceExtras(P, L); },
};
