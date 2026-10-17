/* ============================== ART =======================================
   "128-bit" pass. Recipes are authored on a 32-unit grid (as in Neon
   Protocol) but painted at 64 px per tile: circles, slopes and lines are
   rasterised at full resolution, then a finishing shader adds soft bevel
   lighting, panel lines, rivets, mud weathering and a fine outline. Unit
   families (tank, wheeled, half-track, truck, towed gun, plane, ship, boat,
   infantry, emplacement) are parametric so each nation's real vehicle gets
   its own silhouette. */
const SET = {flags:'hist', sound:true, music:true, anim:true, aiFast:false, battle:true, vol:.8, fx:true, tips:true, difficulty:'normal', gore:'standard'};
try { Object.assign(SET, JSON.parse(localStorage.getItem('if44set') || '{}')); } catch (e) {}
const saveSet = () => { try { localStorage.setItem('if44set', JSON.stringify(SET)); } catch (e) {} };

function hrand(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function hexRGB(h) { const n = parseInt(h.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(hex, k) { const [r, g, b] = hexRGB(hex), t = k > 0 ? 255 : 0, a = Math.abs(k);
  const f = v => Math.round(v + (t - v) * a).toString(16).padStart(2, '0'); return '#' + f(r) + f(g) + f(b); }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
/* smooth value noise for textures */
function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hrand(xi, yi, s), b = hrand(xi + 1, yi, s), c = hrand(xi, yi + 1, s), d = hrand(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* ---------- painter: 32-grid coordinates, rasterised at S x ---------- */
function painter(g, S = SC) {
  const P = {
    g, S,
    R(x, y, w, h, c) { if (w <= 0 || h <= 0) return; const x0 = Math.round(x * S), y0 = Math.round(y * S); g.fillStyle = c; g.fillRect(x0, y0, Math.max(1, Math.round((x + w) * S) - x0), Math.max(1, Math.round((y + h) * S) - y0)); },
    px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x * S), Math.round(y * S), S, S); },
    fR(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); },    // fine-resolution rect
    circ(cx, cy, r, c) { P.ell(cx, cy, r, r, c); },
    ell(cx, cy, rx, ry, c) {
      g.fillStyle = c; const fx = (cx + .5) * S, fy = (cy + .5) * S, Rx = (rx + .45) * S, Ry = (ry + .45) * S;
      for (let y = Math.floor(fy - Ry); y <= Math.ceil(fy + Ry); y++) { const t = (y + .5 - fy) / Ry; if (Math.abs(t) > 1) continue;
        const half = Rx * Math.sqrt(1 - t * t), a = Math.round(fx - half), b = Math.round(fx + half); if (b > a) g.fillRect(a, y, b - a, 1); }
    },
    poly(pts, c) {
      g.fillStyle = c; const q = pts.map(([x, y]) => [x * S, y * S]); let y0 = Infinity, y1 = -Infinity;
      for (const [, y] of q) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        const yc = y + .5, xs = [];
        for (let i = 0; i < q.length; i++) { const [ax, ay] = q[i], [bx, by] = q[(i + 1) % q.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
      }
    },
    line(x0, y0, x1, y1, c, w = 1) {
      g.fillStyle = c; const ax = (x0 + .5) * S, ay = (y0 + .5) * S, bx = (x1 + .5) * S, by = (y1 + .5) * S, bw = Math.max(1, Math.round(w * S));
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
      for (let i = 0; i <= n; i++) { const t = i / n; g.fillRect(Math.round(ax + (bx - ax) * t - bw / 2), Math.round(ay + (by - ay) * t - bw / 2), bw, bw); }
    },
  };
  return P;
}
/* finishing shader at full resolution */
function finish(c, {camo = null, base = null, outline = '#13110d', light = 1, vehicle = false, weather = false, snow = 0} = {}) {
  const g = c.getContext('2d'), W = c.width, H = c.height, img = g.getImageData(0, 0, W, H), d = img.data, S = W / 32;
  const A = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? 0 : d[(y * W + x) * 4 + 3];
  const lum = i => d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
  const [br, bg, bb] = base ? hexRGB(base) : [-1, -1, -1];
  const isBase = i => d[i] === br && d[i + 1] === bg && d[i + 2] === bb;
  let top = H, bot = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { top = Math.min(top, y); bot = Math.max(bot, y); }
  const span = Math.max(1, bot - top);
  // vehicle detail on the base paint: panel seams and rivets, then camouflage
  if (vehicle && base) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (!d[i + 3] || !isBase(i)) continue;
    const inner = A(x - 2, y) && A(x + 2, y) && A(x, y - 2) && A(x, y + 2);
    if (inner && x % 13 === 6) { d[i] *= .82; d[i + 1] *= .82; d[i + 2] *= .82; continue; }
    if (inner && x % 13 === 3 && y % 6 === 2) { d[i] *= .7; d[i + 1] *= .7; d[i + 2] *= .7; const j = i - W * 4; if (j > 0) { d[j] = Math.min(255, d[j] + 50); d[j + 1] = Math.min(255, d[j + 1] + 50); d[j + 2] = Math.min(255, d[j + 2] + 45); } }
  }
  if (camo && base) {                                 // Hinterhalt three-tone camouflage, painted in soft-edged blotches
    const c1 = hexRGB(camo[0]), c2 = hexRGB(camo[1]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4;
      if (d[i + 3] && Math.abs(d[i] - br) < 30 && Math.abs(d[i + 1] - bg) < 30 && Math.abs(d[i + 2] - bb) < 30) {
        const n = vnoise(x / (5 * S), y / (3 * S), 9) + vnoise(x / (2.5 * S), y / (2.5 * S), 4) * .5;
        const pick = n > 1.02 ? c1 : n < .48 ? c2 : null; if (pick) { const k = (d[i] / br + d[i + 1] / bg + d[i + 2] / bb) / 3; d[i] = pick[0] * k; d[i + 1] = pick[1] * k; d[i + 2] = pick[2] * k; } } }
  }
  if (snow) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (!d[i + 3]) continue;
    if (snow > 1 && base && Math.abs(d[i] - br) < 40 && Math.abs(d[i + 1] - bg) < 40 && Math.abs(d[i + 2] - bb) < 40 && (y - top) / span < .72) {   // hasty whitewash, brushed on in streaks
      const n = vnoise(x / (1.5 * S), y / (6 * S), 21); if (n > .42) { const a = Math.min(.85, (n - .42) * 2.4); d[i] += (226 - d[i]) * a; d[i + 1] += (228 - d[i + 1]) * a; d[i + 2] += (224 - d[i + 2]) * a; } }
    if ((vehicle || weather) && (!A(x, y - 1) || !A(x, y - 2))) { d[i] = 238; d[i + 1] = 242; d[i + 2] = 246; }   // snow settled on top edges
  }
  if (weather) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (!d[i + 3]) continue;   // mud on the running gear, dust on the hull
    const low = (y - top) / span; const mud = Math.max(0, low - .55) * 1.4 * vnoise(x / 3, y / 3, 3);
    if (mud > 0) { d[i] += (106 - d[i]) * mud * .6; d[i + 1] += (88 - d[i + 1]) * mud * .6; d[i + 2] += (62 - d[i + 2]) * mud * .6; }
    if (hrand(x, y, 77) < .006) { d[i] = Math.min(255, d[i] + 40); d[i + 1] = Math.min(255, d[i + 1] + 38); d[i + 2] = Math.min(255, d[i + 2] + 30); }   // chipped paint
  }
  // soft bevel: light from the upper left, shade to the lower right, plus ledges between colours
  const src = new Uint8ClampedArray(d);
  const SA = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? 0 : src[(y * W + x) * 4 + 3];
  const SL = (x, y) => { const i = (y * W + x) * 4; return src[i] * .3 + src[i + 1] * .59 + src[i + 2] * .11; };
  const bev = [.26, .15, .06], sh = [-.3, -.17, -.07], q = Math.max(1, Math.round(S / 2)), fine = S >= 4;   // q: one map pixel, in this canvas's pixels (2 for the battle models)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (!src[i + 3]) continue;
    let k = (.1 - .24 * (y - top) / span) * light;
    for (let s = 1; s <= 3; s++) if (!SA(x - s * q, y - s * q) || !SA(x, y - s * q)) { k += bev[s - 1] * light; break; }
    for (let s = 1; s <= 3; s++) if (!SA(x + s * q, y + s * q) || !SA(x, y + s * q)) { k += sh[s - 1] * light; break; }
    if (y > 0 && SA(x, y - 1)) { const dl = SL(x, y - 1) - SL(x, y); if (dl > 28) k -= .14; else if (dl < -28) k += .12; }
    if (fine) {                                        // the battle models: a glint on edges that catch the light, and the grain of worn paint and cloth
      if (!SA(x - 1, y - 1) && SA(x + 1, y + 1) && k > .15) k += .12;
      k += (hrand(x, y, 5) - .5) * .07 + (vnoise(x / 3, y / 9, 13) - .5) * .06;
    }
    if (k > 0) for (let j = 0; j < 3; j++) d[i + j] = d[i + j] + (255 - d[i + j]) * Math.min(.6, k);
    else for (let j = 0; j < 3; j++) d[i + j] = d[i + j] * (1 + Math.max(-.6, k));
  }
  if (outline) { const o = hexRGB(outline), done = new Uint8Array(W * H);
    const near = (x, y, r) => { for (let s = 1; s <= r; s++) if (SA(x - s, y) || SA(x + s, y) || SA(x, y - s) || SA(x, y + s)) return true; return false; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (src[i + 3]) continue;
      if (near(x, y, q)) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255; done[y * W + x] = 1; } }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (src[i + 3] || done[y * W + x]) continue;   // soft second ring
      if (near(x, y, 2 * q) || SA(x - q, y - q) || SA(x + q, y + q)) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 70; } }
  }
  g.putImageData(img, 0, 0);
  return c;
}

/* ---------- national markings ---------- */
function starPts(x, y, r) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; p.push([x + .5 + Math.cos(a) * rr, y + .5 + Math.sin(a) * rr]); } return p; }
function mark(P, kind, x, y, s = 1) {
  if (kind === 'balken') {                            // Balkenkreuz: black cross, white edging
    P.R(x - 1.5, y - 3.5, 4, 8, '#f2f2ea'); P.R(x - 3.5, y - 1.5, 8, 4, '#f2f2ea');
    P.R(x - .5, y - 2.5, 2, 6, '#111'); P.R(x - 2.5, y - .5, 6, 2, '#111');
  } else if (kind === 'usstar' || kind === 'roundel') { P.poly(starPts(x, y, 3.8 * s), '#f4f4ee'); }
  else if (kind === 'redstar') { P.poly(starPts(x, y, 3.6 * s), '#d42a1e'); P.poly(starPts(x, y, 1.4 * s), '#f0d040'); }
  else if (kind === 'lorraine') {                     // Free French: Cross of Lorraine on a white disc
    P.circ(x, y, 3.6, '#f0f0ea'); P.R(x, y - 3, 1, 6, '#1c3a8a'); P.R(x - 1.5, y - 1.5, 4, 1, '#1c3a8a'); P.R(x - 2, y + .5, 5, 1, '#1c3a8a');
  } else if (MARK_EXTRA[kind]) MARK_EXTRA[kind](P, x, y, s);
}

/* ---------- tracked running gear ---------- */
function running(P, x0, x1, top, style, f, C) {
  const bot = 27, dark = '#2b2a24', link = '#5a584e', wheel = C.wheel || '#55574c', hub = '#9b9d90';
  P.poly([[x0 + 2, top], [x1 - 2, top], [x1, top + 2], [x1, bot - 2], [x1 - 2, bot], [x0 + 2, bot], [x0, bot - 2], [x0, top + 2]], dark);
  for (let x = x0 + 1 + (f % 3) * .7; x < x1 - 1; x += 2) { P.R(x, top, 1, .5, link); P.R(x, bot - .5, 1, .5, link); }    // track links
  const mid = (top + bot) / 2;
  const roadWheel = (cx, cy, r, col) => { P.circ(cx, cy, r, col); P.circ(cx, cy, r * .55, shade(col, .12)); P.circ(cx, cy, r * .2, hub); const a = (f % 4) * Math.PI / 4; P.line(cx, cy, cx + Math.cos(a) * r * .5, cy + Math.sin(a) * r * .5, shade(col, -.25), .5); };
  if (style === 'christie') { const n = 5, step = (x1 - x0 - 4) / (n - 1); for (let i = 0; i < n; i++) roadWheel(x0 + 2 + i * step, mid, 2.6, wheel); }
  else if (style === 'interleave') { const n = 8, step = (x1 - x0 - 4) / (n - 1); for (let i = 0; i < n; i++) roadWheel(x0 + 2 + i * step, mid + (i % 2 ? .4 : 0), 2.3, i % 2 ? shade(wheel, -.15) : wheel); }
  else if (style === 'vvss') { for (let i = 0; i < 3; i++) { const bx = x0 + 3 + i * (x1 - x0 - 8) / 2; P.R(bx, mid - 2, 6, 2, '#3e3f36'); roadWheel(bx + 1, mid + 1, 1.8, wheel); roadWheel(bx + 5, mid + 1, 1.8, wheel); P.circ(bx + 3, mid - 3, .7, hub); } }
  else if (style === 'small8') { const n = 8, step = (x1 - x0 - 4) / (n - 1); for (let i = 0; i < n; i++) roadWheel(x0 + 2 + i * step, mid + .5, 1.6, wheel); for (let i = 0; i < 4; i++) P.circ(x0 + 4 + i * (x1 - x0 - 8) / 3, top + 1, .6, hub); }
  else if (style === 'torsion') { const n = 6, step = (x1 - x0 - 4) / (n - 1); for (let i = 0; i < n; i++) roadWheel(x0 + 2 + i * step, mid, 2.2, wheel); }
  else if (style === 'churchill') { for (let x = x0 + 2; x < x1 - 2; x += 2) roadWheel(x, bot - 2.5, 1, wheel); }
  else if (style === 'carrier') { roadWheel(x0 + 3, mid, 2, wheel); roadWheel(x1 - 3, mid, 2, wheel); roadWheel((x0 + x1) / 2, mid, 2, wheel); }
  P.circ(x0 + 2, top + 2.5, 1.5, '#3d3e36'); P.circ(x1 - 2, top + 2.5, 1.5, '#3d3e36');   // idler and sprocket
  for (let i = 0; i < 3; i++) { const sa = (f % 4) * .8 + i * 2.1; P.px(x1 - 2 + Math.cos(sa) * 1.2 - .5, top + 2.5 + Math.sin(sa) * 1.2 - .5, '#6a6b60'); }
}

/* ---------- unit sprite recipes ---------- */
const TANKS = {
  pz4:      {x0:3, L:26, hullH:6, glacis:2, tur:{x:10, w:9, h:5, sh:'box', cupola:1}, gun:{len:13, th:1, brake:1}, wheels:'small8', skirt:1, zim:1},
  panther:  {x0:2, L:27, hullH:6, glacis:7, tur:{x:10, w:10, h:5, sh:'round', cupola:1}, gun:{len:15, th:1, brake:1}, wheels:'interleave', zim:1},
  tiger:    {x0:2, L:27, hullH:8, glacis:2, tur:{x:9, w:12, h:6, sh:'round', cupola:1}, gun:{len:13, th:2, brake:1}, wheels:'interleave', zim:1},
  sherman:  {x0:3, L:26, hullH:8, glacis:5, tur:{x:11, w:9, h:6, sh:'cast', cupola:1}, gun:{len:8, th:1}, wheels:'vvss', tall:1, links:1},
  shermandd:{x0:3, L:26, hullH:8, glacis:5, tur:{x:11, w:9, h:6, sh:'cast', cupola:1}, gun:{len:8, th:1}, wheels:'vvss', tall:1, screen:1},
  firefly:  {x0:3, L:26, hullH:8, glacis:5, tur:{x:10, w:10, h:6, sh:'cast', cupola:1}, gun:{len:17, th:1, brake:0, thin:1}, wheels:'vvss', tall:1, links:1},
  m36:      {x0:3, L:26, hullH:7, glacis:6, tur:{x:10, w:11, h:5, sh:'open'}, gun:{len:14, th:2, brake:1}, wheels:'vvss'},
  pershing: {x0:2, L:27, hullH:6, glacis:4, tur:{x:10, w:12, h:5, sh:'round', cupola:1}, gun:{len:14, th:2, brake:1}, wheels:'torsion'},
  cromwell: {x0:3, L:25, hullH:7, glacis:1, tur:{x:11, w:10, h:6, sh:'box', cupola:1}, gun:{len:8, th:1}, wheels:'christie'},
  churchill:{x0:1, L:29, hullH:6, glacis:1, trackH:4, tur:{x:12, w:8, h:6, sh:'cast', cupola:1}, gun:{len:7, th:1}, wheels:'churchill'},
  t34:      {x0:3, L:26, hullH:6, glacis:6, tur:{x:12, w:8, h:5, sh:'hex'}, gun:{len:10, th:1}, wheels:'christie', desant:1},
  t3485:    {x0:3, L:26, hullH:6, glacis:6, tur:{x:10, w:11, h:6, sh:'cast', cupola:1}, gun:{len:13, th:1}, wheels:'christie', desant:1},
  is2:      {x0:2, L:27, hullH:7, glacis:5, tur:{x:10, w:11, h:6, sh:'round', cupola:1}, gun:{len:15, th:2, brake:1}, wheels:'torsion'},
  wirbel:   {x0:3, L:26, hullH:6, glacis:2, tur:{x:10, w:10, h:5, sh:'flak'}, gun:{flak:4}, wheels:'small8'},
  crusaderaa:{x0:2, L:27, hullH:5, glacis:3, tur:{x:10, w:10, h:4, sh:'open'}, gun:{flak:1, bofors:1}, wheels:'christie'},
  calliope: {x0:3, L:26, hullH:8, glacis:5, tur:{x:11, w:9, h:6, sh:'cast'}, gun:{len:8, th:1}, wheels:'vvss', tall:1, rack:1},
  carrier:  {x0:5, L:22, hullH:4, glacis:3, tur:null, wheels:'carrier', open:1, bren:1},
};
function drawTank(P, s, C, f) {
  const x0 = s.x0, x1 = x0 + s.L, trackTop = 21 - (s.trackH || 0) + (s.tall ? 0 : 1), m = C.m, d = C.d;
  running(P, x0, x1, trackTop, s.wheels, f, C);
  const ht = trackTop - s.hullH;
  P.poly([[x0, trackTop + 1], [x0, ht + 1], [x0 + 1, ht], [x1 - s.glacis, ht], [x1, trackTop - 1], [x1, trackTop + 1]], m);
  P.R(x0 + 1, trackTop - 1, x1 - x0 - 2, 2, d);
  P.R(x1 - s.glacis + .5, ht + 1, 1, 1, shade(m, .15)); P.circ(x1 - 2.5, trackTop - 2, .6, '#e8d890');   // driver's hatch edge, headlight
  if (s.skirt) { P.R(x0 + 2, trackTop - 1, x1 - x0 - 5, 4, shade(m, -.06)); for (let x = x0 + 6; x < x1 - 3; x += 5) P.R(x, trackTop - 1, .5, 4, d); }
  if (s.trackH) { P.R(x0, trackTop + 1, x1 - x0, 2, m); for (let x = x0 + 3; x < x1 - 2; x += 6) P.R(x, trackTop + 1, 2, 1, d); }
  if (s.screen) { P.R(x0 + 1, ht - 1.5, x1 - x0 - 3, 2.5, '#9a9070'); for (let x = x0 + 2; x < x1 - 2; x += 3) P.R(x, ht - 1.5, .5, 2.5, '#6a6450'); P.circ(x0 - .5, trackTop, 1.2, '#5a5a50'); }   // folded flotation screen, propellers
  if (s.open) { P.R(x0 + 3, ht, x1 - x0 - 6 - s.glacis, 1, '#1c1b16'); if (s.bren) { P.R(x1 - 6, ht - 2, 6, 1, '#202020'); P.R(x1 - 9, ht - 3, 2, 1, '#202020'); } return {tx:(x0 + x1) / 2, ty:ht, mx:(x0 + x1) / 2 - 2, my:ht + 3}; }
  P.R(x0 + 2, ht + 1, 5, .5, d); P.R(x0 + 2, ht + 2, 5, .5, d);                                  // engine deck grille
  if (s.zim) for (let x = x0 + 8; x < x1 - s.glacis - 1; x += 1.2) P.R(x, ht + 1.6, .4, s.hullH - 3.2, shade(m, -.13));   // Zimmerit anti-magnetic paste, raked in ridges
  if (s.links) { for (let i = 0; i < 3; i++) P.R(x1 - s.glacis + .8 + i * 1.4, ht + 1.2 + i * 1.5, 1.6, 1, '#3a3a32'); P.R(x0 + 1, ht - 1.6, 4, 1.6, '#6a6448'); P.R(x0 + 5.2, ht - 1.2, 1.6, 1.2, '#4a5232'); }   // spare track on the glacis, bedrolls and a jerrycan on the back deck
  if (s.hullgun) { P.R(x1 - 4, ht + 2.6, 6, 1.8, shade(m, -.15)); P.R(x1 + 1.5, ht + 2.4, 1, 2.2, '#1a1a16'); }   // the Char B1's hull 75 mm
  if (s.rivets) for (let x = x0 + 2; x < x1 - 2; x += 1.6) P.circ(x, ht + 1.2, .25, shade(m, -.25));
  if (s.desant) { P.R(x0 + 1, trackTop - 3.2, 7, 1.2, '#7a5a34'); P.circ(x0 + 3, ht + 2.5, 1.2, '#4a4e40'); P.R(x0 + 4, ht - 3.5, 2.2, 3.5, '#6e6a4a'); P.circ(x0 + 5.1, ht - 4.4, 1, '#dba985'); P.R(x0 + 4, ht - 5.5, 2.2, 1, '#56603c'); }   // unditching log, fuel drum, a tank rider
  P.R(x0 + 1, ht - 1, 1, 1, '#4a4a40'); P.line(x0 + 1.5, ht - 1, x0 - .5, ht - 9, '#2a2a26', .3);  // radio antenna
  const t = s.tur; if (!t) return {};
  const tx = x0 + t.x - 3, ty = ht - t.h;
  if (t.sh === 'box') { P.R(tx, ty, t.w, t.h, m); P.R(tx + t.w, ty + 1, 1, t.h - 1, m); P.R(tx - 1, ty + t.h - 1, t.w + 2, 1, d); }
  else if (t.sh === 'round' || t.sh === 'cast') { P.poly([[tx, ty + t.h], [tx, ty + 2], [tx + 2, ty], [tx + t.w - 2, ty], [tx + t.w + 1, ty + 2], [tx + t.w + 1, ty + t.h]], m); if (t.sh === 'cast') P.R(tx + t.w - 1, ty + 2, 2, t.h - 2, shade(m, -.08)); }
  else if (t.sh === 'hex') { P.poly([[tx - 1, ty + t.h], [tx, ty + 1], [tx + 1, ty], [tx + t.w, ty], [tx + t.w + 2, ty + t.h]], m); }
  else if (t.sh === 'open') { P.poly([[tx, ty + t.h], [tx + 1, ty + 1], [tx + t.w, ty + 1], [tx + t.w + 1, ty + t.h]], m); P.R(tx + 2, ty + 1, t.w - 3, 1, '#1c1b16'); }
  else if (t.sh === 'flak') { P.poly([[tx, ty + t.h], [tx + 1, ty + 1], [tx + t.w, ty + 1], [tx + t.w + 1, ty + t.h]], m); for (let i = 0; i < t.w; i += 2) P.px(tx + 1 + i, ty + 2, d); }
  if (t.cupola) { P.R(tx + 2, ty - 1, 3, 1, shade(m, -.1)); P.R(tx + 2, ty - 2, 3, 1, m); P.circ(tx + 3.5, ty - 2.6, .9, '#d9a77f'); P.R(tx + 2.6, ty - 3.4, 2, .7, '#2a2a26'); }   // commander's head
  P.R(tx + 1, ty + t.h - 2, 2, 1, shade(m, -.12));                                                  // smoke dischargers / stowage
  const g = s.gun, gy = ty + 2;
  if (g.flak) {
    const col = '#2a2a26';
    if (g.bofors) { P.line(tx + t.w / 2, ty, tx + t.w / 2 + 9, ty - 9, col, 1); P.R(tx + t.w / 2 + 8, ty - 10, 2, 2, '#3a3a34'); P.R(tx + t.w / 2 - 1, ty - 2, 4, 3, shade(m, -.1)); }
    else for (let i = 0; i < g.flak; i++) P.line(tx + 3 + i * 1.5, ty, tx + 9 + i * 1.5, ty - 8 + (i % 2), col, .8);
  } else {
    const th = g.th, gl = g.len, gx = tx + t.w + 1;
    P.R(gx - 1, gy - (th > 1 ? 1 : 0), 2, th + 2, shade(m, -.12));
    P.R(gx + 1, gy, gl, th, g.thin ? '#4b4c42' : shade(m, -.05)); P.R(gx + 1, gy, gl, th * .35, shade(m, .18));
    if (g.thin) P.R(gx + gl - 6, gy, 3, th, '#3e3f36');
    if (g.brake) { P.R(gx + gl, gy - 1, 2, th + 2, '#2f302a'); P.R(gx + gl + .5, gy - .5, 1, th + 1, '#1a1a16'); }
    else P.R(gx + gl - .5, gy, .5, th, shade(m, -.3));
  }
  if (s.rack) { P.R(tx - 3, ty - 6, t.w + 6, 5, '#4a4c40'); for (let x = tx - 3; x < tx + t.w + 3; x += 1.5) for (let y = ty - 6; y < ty - 1; y += 1.5) P.circ(x + .5, y + .5, .4, '#1e1e1a'); P.R(tx + 2, ty - 2, 1, 2, '#33342c'); }
  if (s.ring) { P.line(tx - 1, ty - 1, tx + t.w + 1, ty - 1, '#2a2a26', .3); P.R(tx - 1, ty - 1, .4, 2, '#2a2a26'); P.R(tx + t.w + .6, ty - 1, .4, 2, '#2a2a26'); }   // Chi-Ha's handrail aerial
  return {tx, ty, tw:t.w, ht};
}

const WHEELED = {
  puma:   {x0:2, L:28, h:6, n:4, r:2.4, slopeF:5, slopeR:4, tur:{x:13, w:8, h:4, gun:9, brake:1}},
  m8:     {x0:4, L:24, h:6, n:3, r:2.8, slopeF:4, slopeR:2, tur:{x:12, w:9, h:3, gun:6, open:1}},
  daimler:{x0:5, L:22, h:7, n:2, r:3.2, slopeF:4, slopeR:3, tur:{x:10, w:8, h:4, gun:7}},
  ba64:   {x0:7, L:19, h:7, n:2, r:3, slopeF:6, slopeR:5, tur:{x:8, w:6, h:3, gun:3, mg:1}},
};
function wheel(P, cx, cy, r, f) { P.circ(cx, cy, r, '#24231e'); P.circ(cx, cy, r * .78, '#33322b'); P.circ(cx, cy, r * .5, '#6a6b60'); P.circ(cx, cy, r * .18, '#9a9b90');
  for (let i = 0; i < 4; i++) { const a = (f % 4) * Math.PI / 8 + i * Math.PI / 2; P.px(cx + Math.cos(a) * r * .32 - .5, cy + Math.sin(a) * r * .32 - .5, '#4a4b42'); } }
function drawWheeled(P, s, C, f) {
  const x0 = s.x0, x1 = x0 + s.L, by = 24, ty = by - s.h, m = C.m, d = C.d;
  P.poly([[x0, by], [x0, ty + s.slopeR], [x0 + s.slopeR, ty], [x1 - s.slopeF, ty], [x1, ty + s.slopeF - 1], [x1, by]], m);
  P.R(x0 + 1, by - 2, s.L - 2, 2, d);
  const step = (s.L - 6) / Math.max(1, s.n - 1);
  for (let i = 0; i < s.n; i++) { P.ell(x0 + 3 + i * step, 22.5, s.r + .6, 1.6, d); wheel(P, x0 + 3 + i * step, 25.5, s.r, f); }
  const t = s.tur, tx = x0 + t.x - 2, tt = ty - t.h;
  P.poly([[tx, ty], [tx + 1, tt], [tx + t.w - 1, tt], [tx + t.w + 1, ty]], m);
  if (t.open) P.R(tx + 2, tt, t.w - 3, 1, '#1c1b16');
  P.R(tx + t.w, tt + 1, t.gun, 1, shade(m, -.1)); if (t.brake) P.R(tx + t.w + t.gun, tt, 2, 3, '#2f302a');
  P.R(x1 - s.slopeF + 1, ty + 1, 2, 1, '#9bb8c8');
  P.line(x0 + 1.5, ty, x0 - .5, ty - 8, '#2a2a26', .3);
  return {tx, ty:tt, mx:(x0 + x1) / 2 - 2, my:by - 4};
}
function drawHalftrack(P, kind, C, f) {
  const m = C.m;
  running(P, 3, 22, 21, kind === 'ht251' ? 'interleave' : 'vvss', f, C);
  if (kind === 'ht251') {
    P.poly([[2, 22], [2, 15], [4, 13], [20, 13], [27, 17], [30, 21], [30, 22]], m);
    P.R(4, 14, 15, 1, C.d); P.R(16, 11, 3, 2, '#3a3a34'); P.R(19, 12, 3, 1, '#202020');
    for (let i = 0; i < 3; i++) { P.circ(7 + i * 3.5, 12.5, .9, '#5d6152'); }                      // Panzergrenadier helmets
    wheel(P, 26, 25, 2.6, f);
    return {mx:10, my:18};
  }
  P.poly([[2, 22], [2, 14], [21, 14], [22, 16], [28, 16], [29, 18], [30, 22]], m);
  P.R(22, 13, 4, 3, shade(m, -.1)); P.R(23, 14, 2, 1, '#9bb8c8');
  P.R(29, 19, 2, 3, '#33342c');
  wheel(P, 26, 25, 2.6, f);
  if (kind === 'm16') { P.R(9, 10, 7, 4, '#4a4c40'); for (let i = 0; i < 4; i++) P.line(11 + i, 10, 17 + i, 4 + (i % 2), '#222', .6); }
  else { P.R(21, 10, 1, 4, '#3a3b34'); P.R(21, 10, 6, 1, '#222'); for (let i = 0; i < 3; i++) P.circ(6 + i * 4, 13, .9, '#535b33'); }
  return {mx:10, my:18};
}
function drawTruck(P, kind, C, f) {
  const m = C.m;
  P.R(3, 19, 17, 4, shade(m, -.05));
  P.R(21, 13, 6, 9, m); P.R(27, 16, 3, 6, m); P.R(22, 14, 4, 3, '#9bb8c8'); P.R(27.5, 17, 2, .5, shade(m, -.2));
  P.R(3, 22, 27, 1, '#2a2a24');
  wheel(P, 7, 25, 2.7, f); wheel(P, 13, 25, 2.7, f); wheel(P, 26, 25, 2.7, f);
  if (kind === 'katyusha') {
    for (let i = 0; i < 4; i++) P.line(3, 18 - i, 19, 10 - i, i % 2 ? '#3a3b32' : '#5a5c4c', .8);
    for (let i = 0; i < 4; i++) P.R(15 + i, 10 - i - 1, 2, 1, '#b8b090');
    P.R(9, 15, 2, 4, '#3a3b32');
  } else if (kind === 'k61') {
    P.R(9, 15, 7, 4, m); P.line(13, 15, 22, 5, '#26261f', 1); P.R(21, 4, 2, 2, '#26261f');
  } else { for (let x = 4; x < 20; x += 3) P.R(x, 17, 1, 2, shade(m, .1)); P.R(3, 17, 17, 1, shade(m, .1)); P.poly([[3, 17], [5, 12], [18, 12], [20, 17]], '#7a7258'); }   // canvas tilt
  return {mx:24, my:18};
}
const GUNS = {
  lefh: {bl:12, bt:2, ang:.32, shield:[15, 13, 5, 7], wheel:4, brake:0, trail:'split'},
  m2a1: {bl:13, bt:2, ang:.3, shield:[15, 13, 5, 6], wheel:3.6, tyre:1, trail:'split'},
  pdr25:{bl:11, bt:2, ang:.28, shield:[14, 12, 6, 8], wheel:4, brake:1, platform:1, trail:'box'},
  m30:  {bl:14, bt:2, ang:.33, shield:[15, 13, 5, 7], wheel:4, trail:'split'},
};
function drawTowed(P, s, C, f, nat) {
  const m = C.m;
  if (s.platform) P.ell(16, 27, 11, 1.5, '#4a4a40');
  if (s.trail === 'split') { P.line(15, 22, 2, 26, shade(m, -.1), 2); P.line(15, 23, 5, 27, shade(m, -.25), 1); }
  else P.poly([[15, 21], [3, 25], [3, 27], [15, 24]], shade(m, -.08));
  const px = 17, py = 18, ex = px + Math.cos(s.ang) * s.bl, ey = py - Math.sin(s.ang) * s.bl * 2.2;
  P.R(px - 4, py - 2, 8, 5, shade(m, -.06));
  P.line(px, py, ex, ey, shade(m, -.15), s.bt); P.line(px, py - .5, ex, ey - .5, shade(m, .1), .4);
  if (s.brake) P.R(ex - 1, ey - 1, 3, 3, '#2f302a');
  const [sx, sy, sw, sh] = s.shield; P.poly([[sx, sy + sh], [sx + 1, sy], [sx + sw, sy + 1], [sx + sw, sy + sh]], m);
  P.circ(16, 24, s.wheel, '#24231e'); P.circ(16, 24, s.wheel * .5, s.tyre ? '#55564c' : '#6a6b60'); P.px(16 + (f >> 1) % 2, 23, '#8a8b80');
  if (nat) soldier(P, 3, 12, nat, 'shell', f, true);                                                 // gun crew
  return {mx:17, my:15};
}
function drawRocketLauncher(P, kind, C, f) {
  const m = C.m;
  if (kind === 'nebel') {
    P.line(13, 23, 3, 27, shade(m, -.15), 2);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, cx = 17 + Math.cos(a) * 3, cy = 14 + Math.sin(a) * 3;
      P.line(cx - 3, cy + 3, cx + 5, cy - 3, i % 2 ? '#3c3d33' : shade(m, -.05), 2); P.circ(cx + 5, cy - 3, .8, '#141410'); }
    P.circ(17, 14, 1.5, '#222'); P.circ(15, 24, 3.4, '#24231e'); P.circ(15, 24, 1.6, '#6a6b60');
  } else {
    P.line(14, 23, 3, 27, shade(m, -.15), 2); P.R(13, 18, 4, 5, shade(m, -.1));
    P.poly([[9, 19], [21, 9], [27, 13], [15, 23]], '#4a4c3e');
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) P.circ(19 + i * .9 + j * 1.2, 10 + j * 1.4 + i * .3, .35, '#1c1c18');
    P.circ(15, 24, 3.4, '#24231e'); P.circ(15, 24, 1.6, '#6a6b60');
  }
  return {mx:15, my:16};
}
const PLANES = {
  bf109:   {len:24, nose:'pointed', top:'#6c7279', bot:'#aebcc8', mottle:'#4e555a', spinner:'#202020', spiral:1, cowl:'#d8b628', canopy:'frame', wing:'#5c6268', mark:'balken'},
  ju87:    {len:24, nose:'inline', top:'#4a5a3a', bot:'#9eb0bc', mottle:'#38452c', spinner:'#2a2a2a', canopy:'long', gull:1, spats:1, bomb:1, wing:'#40502f', mark:'balken'},
  p51:     {len:25, nose:'pointed', top:'#b9bec4', bot:'#aeb3b8', spinner:'#2650a0', canopy:'bubble', stripes:1, wing:'#a6abb1', mark:'usstarbar'},
  p47:     {len:24, nose:'radial', top:'#5d6b3a', bot:'#9aa2a8', spinner:'#d0d0c8', canopy:'bubble', stripes:1, wing:'#53602f', mark:'usstarbar', bomb:1},
  spitfire:{len:24, nose:'pointed', top:'#5b6448', bot:'#9aa0a4', mottle:'#7c8088', spinner:'#b8c8a8', canopy:'bubble', stripes:1, band:'#b8c8a8', wing:'#4f5740', mark:'raf', elliptic:1},
  typhoon: {len:25, nose:'chin', top:'#5b6448', bot:'#9aa0a4', mottle:'#7c8088', spinner:'#202020', canopy:'bubble', stripes:1, band:'#b8c8a8', wing:'#4f5740', mark:'raf', rockets:1},
  yak3:    {len:23, nose:'pointed', top:'#8c939a', bot:'#a8bccc', mottle:'#6e757c', spinner:'#d8d8d0', canopy:'bubble', wing:'#7d848b', mark:'redstarAir'},
  il2:     {len:25, nose:'inline', top:'#4c5a33', bot:'#90a8ba', mottle:'#2e3a22', spinner:'#d42a1e', canopy:'long', wing:'#3f4c2a', mark:'redstarAir', rockets:1, armour:1},
};
function drawPlane(P, s, C, f) {
  const nx = 4 + s.len, tx = 4, cy = 13;
  if (s.gull) { P.poly([[13, 15], [10, 20], [15, 21], [19, 17], [21, 16]], s.wing); P.poly([[13, 15], [18, 12], [22, 12], [21, 16]], shade(s.wing, .1)); }
  else if (s.elliptic) { P.ell(16, 17, 8, 2.2, s.wing); }
  else P.poly([[11, 16], [8, 19.5], [19, 19.5], [21, 16]], s.wing);
  if (s.stripes) for (let i = 0; i < 5; i++) P.R(10 + i * 2, 17, 2, 2.5, i % 2 ? '#1a1a1a' : '#f0f0ea');
  if (s.rockets) for (let i = 0; i < 3; i++) { P.R(10 + i * 3, 20, 4, .8, '#3a3a34'); P.R(13.2 + i * 3, 20, .8, .8, '#8a3020'); }
  const noseH = s.nose === 'radial' ? 6 : s.nose === 'chin' ? 5 : 4;
  P.poly([[tx, cy - 1], [tx + 4, cy - 2], [nx - 6, cy - 3], [nx - 1, cy - noseH / 2 - 1], [nx, cy], [nx - 1, cy + noseH / 2 + 1], [nx - 7, cy + 3], [tx + 4, cy + 1], [tx, cy + 1]], s.top);
  P.poly([[tx + 4, cy + 1], [nx - 7, cy + 2], [nx - 1, cy + noseH / 2 + 1], [nx - 7, cy + 3], [tx + 4, cy + 2]], s.bot);
  for (let x = tx + 7; x < nx - 8; x += 4) P.R(x, cy - 2, .4, 4, shade(s.top, -.15));               // panel lines
  if (s.nose === 'chin') P.R(nx - 8, cy + 3, 5, 2, shade(s.top, -.2));
  if (s.nose === 'radial') P.R(nx - 2, cy - 3, 2, 7, '#3a3b34');
  else for (let i = 0; i < 3; i++) P.R(nx - 9 + i * 1.5, cy - .5, 1, .6, '#2a2a26');                  // exhaust stubs
  if (s.cowl) P.R(nx - 5, cy + 1, 4, 2, s.cowl);
  if (s.band) P.R(tx + 5, cy - 2, 2, 4, s.band);
  if (s.armour) P.R(nx - 10, cy - 3, 8, 1, shade(s.top, .15));
  P.poly([[tx, cy - 1], [tx + 1, cy - 7], [tx + 4, cy - 7], [tx + 6, cy - 2]], s.top);
  P.poly([[tx + 1, cy], [tx - 1, cy + 2], [tx + 6, cy + 2], [tx + 7, cy]], s.wing);
  if (s.mark === 'balken') { P.R(tx + 2, cy - 6, 2, 3, '#111'); P.px(tx + 2, cy - 5, '#fff'); }
  const cx0 = nx - (s.canopy === 'long' ? 15 : 12);
  if (s.canopy === 'long') { P.R(cx0, cy - 5, 9, 2, '#9fc0d0'); for (let x = cx0 + 2; x < cx0 + 9; x += 3) P.R(x, cy - 5, .5, 2, '#3a3b34'); P.R(cx0 + 1, cy - 5, 3, .5, '#eaf6fa'); }
  else if (s.canopy === 'frame') { P.R(cx0, cy - 5, 5, 2, '#9fc0d0'); P.R(cx0 + 2, cy - 5, .5, 2, '#3a3b34'); P.R(cx0 + 4, cy - 5, .5, 2, '#3a3b34'); }
  else { P.ell(cx0 + 2, cy - 4, 2.5, 1.5, '#a8cadb'); P.ell(cx0 + 1.5, cy - 4.6, 1, .5, '#eef8fc'); P.circ(cx0 + 2.5, cy - 3.6, .7, '#5a4a3a'); }   // pilot
  if (s.mark === 'balken') mark(P, 'balken', tx + 10, cy, 1);
  else if (s.mark === 'usstarbar') { P.circ(tx + 10, cy, 2.5, '#203a78'); P.R(tx + 6, cy - 1, 9, 2, '#f0f0ea'); P.R(tx + 6, cy - 1.2, 9, .4, '#203a78'); P.R(tx + 6, cy + .8, 9, .4, '#203a78'); P.poly(starPts(tx + 9.5, cy - .5, 2), '#f0f0ea'); }
  else if (s.mark === 'raf') { P.circ(tx + 10, cy, 3, '#e0c030'); P.circ(tx + 10, cy, 2.4, '#203a78'); P.circ(tx + 10, cy, 1.5, '#f0f0ea'); P.circ(tx + 10, cy, .7, '#b02020'); }
  else if (s.mark === 'redstarAir') { P.circ(tx + 9.5, cy, 3, '#f0f0ea'); P.poly(starPts(tx + 9, cy - .5, 2.6), '#d42a1e'); }
  else if (MARK_EXTRA[s.mark]) MARK_EXTRA[s.mark](P, tx + 10, cy, .8);
  if (s.biplane) { P.R(tx + 9, cy - 9, 14, 2, s.wing); P.R(tx + 9, cy - 9, 14, .6, shade(s.wing, .15)); for (const xx of [11, 20]) P.line(tx + xx, cy - 7, tx + xx + 1, cy + 4, '#2a2a24', .4); P.line(tx + 11, cy - 7, tx + 21, cy + 4, '#2a2a24', .15); }
  if (s.shark) { P.poly([[nx - 6, cy + 1], [nx - 1, cy + 1], [nx - 2, cy + 3], [nx - 6, cy + 3]], '#b02020'); for (let i = 0; i < 4; i++) P.poly([[nx - 6 + i * 1.2, cy + 1], [nx - 5.4 + i * 1.2, cy + 2], [nx - 4.8 + i * 1.2, cy + 1]], '#f0f0ea'); P.circ(nx - 5, cy - 1, .7, '#f0f0ea'); P.circ(nx - 5, cy - 1, .35, '#111'); }
  if (s.cowlRing) P.R(nx - 3, cy - 3.5, 3, 7, s.cowlRing);
  if (s.mottle) for (let i = 0; i < 10; i++) P.circ(tx + 6 + hrand(i, 3) * 14, cy - 2 + hrand(i, 9) * 2, .5, s.mottle);
  P.R(nx, cy - 1, 2, 2, s.spinner); if (s.spiral) P.R(nx, cy - .2, 1, .5, '#f0f0ea');
  const bl = f % 2 ? [[nx + 1, cy - 6, .6, 5], [nx + 1, cy + 1, .6, 5]] : [[nx + 1, cy - 4, .6, 3], [nx + 1, cy + 2, .6, 3]];
  for (const b of bl) P.R(b[0], b[1], b[2], b[3], 'rgba(40,40,40,.55)');
  P.ell(nx + 1.3, cy, .5, 6, 'rgba(220,220,220,.12)');                                                   // prop disc blur
  if (s.spats) { P.R(nx - 8, cy + 3, 1, 4, '#2a2a24'); P.R(nx - 9, cy + 6, 3, 3, s.top); }
  if (s.bomb) { P.ell(nx - 10, cy + 5, 3, 1, '#2c2c26'); P.R(nx - 14, cy + 4, 1.5, 2, '#2c2c26'); }
  if (s.torpedo) { P.R(nx - 18, cy + 4, 12, 1.4, '#3a3c40'); P.R(nx - 7, cy + 4, 1, 1.4, '#6a6c70'); P.R(nx - 19, cy + 3.4, 1.5, 2.6, '#2a2c30'); }
  if (s.twin) { for (const ex of [-1, 4]) { P.R(nx - 12 + ex, cy + 1, 6, 3, s.top); P.R(nx - 6.5 + ex, cy + 1.2, 1, 2.6, '#2a2a26'); } }
  return {};
}
const SHIPS = {
  fletcher:{len:30, hull:'#6e7a86', deck:'#4a525a', funnels:2, guns:3, mast:1, camo:'#4f5a66'},
  tribal:  {len:30, hull:'#a8b2b8', deck:'#5a6268', funnels:2, guns:4, mast:1, camo:'#5a6e7a'},
  z36:     {len:30, hull:'#7d8288', deck:'#4a4c50', funnels:2, guns:3, mast:1, camo:'#5a5e64'},
  gnevny:  {len:30, hull:'#8a9096', deck:'#565a5e', funnels:2, guns:3, mast:1},
};
function drawShip(P, s, C, f) {
  const y = 20, x0 = 1, x1 = x0 + s.len;
  P.poly([[x0, y - 2], [x1 - 6, y - 3], [x1, y - 4], [x1 - 4, y + 3], [x0 + 3, y + 3]], s.hull);
  if (s.camo) { P.poly([[x0 + 6, y - 2], [x0 + 12, y - 2], [x0 + 9, y + 3], [x0 + 5, y + 3]], s.camo); P.poly([[x0 + 18, y - 3], [x0 + 22, y - 3], [x0 + 24, y + 3], [x0 + 17, y + 3]], s.camo); }
  P.R(x0 + 2, y - 3, s.len - 6, 1, s.deck);
  for (let x = x0 + 4; x < x1 - 5; x += 2.5) P.circ(x, y - 1, .3, '#2a2e34');                         // portholes
  P.R(x0 + 15, y - 8, 6, 5, shade(s.hull, .08)); P.R(x0 + 16, y - 7, 4, 1, '#2a2e34');
  for (let i = 0; i < s.funnels; i++) { P.R(x0 + 9 + i * 4, y - 9, 3, 6, shade(s.hull, -.12)); P.R(x0 + 9 + i * 4, y - 9, 3, 1, '#222'); P.circ(x0 + 10 + i * 4 - (f % 3), y - 11 - (f % 3), 1 + (f % 3) * .5, 'rgba(80,80,80,.35)'); }
  if (s.mast) { P.R(x0 + 18, y - 15, .6, 7, '#3a3e44'); P.R(x0 + 16, y - 13, 5, .5, '#3a3e44'); P.line(x0 + 18, y - 15, x0 + 2, y - 3, '#3a3e44', .2); P.line(x0 + 18, y - 15, x1 - 2, y - 4, '#3a3e44', .2); }
  const gx = [x1 - 7, x1 - 11, x0 + 4, x0 + 7];
  for (let i = 0; i < s.guns; i++) { P.R(gx[i] - 1, y - 5, 4, 2, shade(s.hull, -.05)); P.R(gx[i] + (i < 2 ? 3 : -3), y - 5, 3, .7, '#2a2e34'); }
  P.R(x1 - 4, y + 2, 4, 1, '#e8f0f4'); for (let i = 0; i < 6; i++) P.circ(x0 + i * 3 + (f % 3), y + 3, .5, 'rgba(232,240,244,.8)');
  return {mx:x0 + 6, my:y - 1};
}
const BOATS = {
  lcvp:{len:24, h:8, hull:'#6c7a86', ramp:1, mg:1},
  lca: {len:26, h:7, hull:'#6e7a70', ramp:1, armour:1},
  mfp: {len:28, h:8, hull:'#6a6e68', ramp:1, gun:1},
  bka: {len:24, h:6, hull:'#6a7276', turret:1},
};
function drawBoat(P, s, C, f) {
  const x0 = Math.round((32 - s.len) / 2), x1 = x0 + s.len, y = 25, top = y - s.h, hl = s.hull;
  P.poly([[x0, top + 2], [x1 - 1, top + 2], [x1, top + 3], [x1, y], [x0 + 3, y + 1], [x0, y - 2]], hl);
  P.R(x0 + 1, top + 4, s.len - 3, 1, shade(hl, -.2));
  if (!s.turret) { P.R(x0 + 4, top, s.len - 8, 3, shade(hl, -.35)); P.R(x0 + 4, top, s.len - 8, 1, shade(hl, .15));
    for (let i = 0; i < 5 && s.ramp; i++) { P.circ(x0 + 6 + i * 3, top + 1.2, .9, '#535b33'); P.R(x0 + 5.4 + i * 3, top + 1.6, 1.2, .5, '#2a2a26'); } }
  if (s.ramp) { P.R(x1 - 3, top - 1, 3, s.h + 2, shade(hl, -.12)); P.R(x1 - 3, top - 1, 3, 1, shade(hl, .2)); }
  if (s.mg) { P.R(x0 + 2, top - 3, 1, 4, '#2a2a26'); P.R(x0 + 2, top - 3, 4, .6, '#2a2a26'); P.R(x0 + 1, top - 1, 4, 3, shade(hl, -.05)); }
  if (s.armour) { P.R(x0 + 1, top - 2, 5, 4, shade(hl, -.08)); P.R(x0 + 2, top - 1, 3, 1, '#20242a'); }
  if (s.gun) { P.R(x0 + 2, top - 3, 4, 4, '#4a4c46'); P.R(x0 + 6, top - 2, 5, 1, '#2a2a26'); }
  if (s.turret) { P.poly([[x0 + 8, top + 2], [x0 + 9, top - 2], [x0 + 15, top - 2], [x0 + 16, top + 2]], '#4c5a33'); P.R(x0 + 16, top - 1, 8, 1, '#3a3b32'); mark(P, 'redstar', x0 + 12, top, .8); }
  P.R(x0 - 1, y + 1, 4, 1, 'rgba(232,240,244,.8)'); for (let i = 0; i < 5; i++) P.circ(x0 - 2 - i * 2 + (f % 2), y + (i % 2), .6, 'rgba(232,240,244,.7)');
  P.R(x1 - 1, y, 3, 1, 'rgba(232,240,244,.8)');
  return {};
}
/* fixed defences */
function drawNest(P, nat, f) {                         // MG 42 in a Tobruk pit: concrete ring, sandbags, gunner and barrel
  const uni = NATION[nat] ? NATION[nat].uniform : '#6b6f5e', hel = HELMET_COL[nat] || HELMET_COL[natBase(nat)] || '#5d6152';
  P.ell(16, 25, 14, 4.5, '#6e6c64'); P.ell(16, 24.2, 12.5, 3.6, '#8e8c84'); P.ell(16, 24.4, 8, 2.2, '#2a2a26');
  for (let i = 0; i < 9; i++) P.ell(3.5 + i * 3.1, 22.5 - Math.sin(i / 8 * Math.PI) * 3, 2, 1.3, i % 2 ? '#a0906a' : '#8c7c58');   // sandbag parapet
  // gunner behind the MG 42, head and shoulders above the parapet
  P.R(9, 15, 7, 6, uni); P.R(9, 17, 7, 1, '#3e3a2c');
  P.circ(12.5, 12.5, 2.2, '#dba985'); P.R(13.5, 12.4, .7, .7, '#2a2018');
  P.ell(12.2, 10.4, 3.6, 1.7, hel); P.R(8.6, 10.6, 3, 2.6, hel); P.R(10, 9.4, 3, .6, shade(hel, .25));   // Stahlhelm with its flared skirt
  P.R(14, 15.5, 3, 2.5, uni); P.circ(17, 17, .9, '#dba985');
  P.R(13, 16.4, 17, 1.5, '#232326'); P.R(17, 15.6, 6, .8, '#4a4a48'); for (let i = 0; i < 5; i++) P.circ(18 + i * 1.4, 17.1, .3, '#5a5a58');   // perforated barrel jacket
  P.R(29.5, 16, 1.6, 2.2, '#1a1a1a'); P.line(25, 18, 23.5, 22, '#232326', .5); P.line(25, 18, 26.5, 22, '#232326', .5);   // muzzle and bipod
  P.R(7, 17, 2, 4, '#c8a040'); for (let i = 0; i < 4; i++) P.R(7, 17.4 + i, 2, .3, '#8a6a20');                       // ammunition belt
  P.R(18, 19.5, 4, 2, '#5a5c48'); P.R(18.5, 19, 3, .6, '#6a6c58');                                                  // ammo box
  return {};
}
function drawCasemate(P, f) {                          // H677-type casemate with the 8.8 cm PaK 43/41
  P.poly([[1, 27], [4, 11], [26, 9], [31, 13], [31, 27]], '#8e8c84');
  P.poly([[4, 11], [26, 9], [28, 11], [6, 13]], '#a8a69e');
  P.R(20, 15, 9, 6, '#1a1a18'); P.R(19, 14, 11, 1, '#6e6c64');
  P.R(22, 17, 10, 1.6, '#3a3c34'); P.R(30.5, 16.5, 1.5, 2.6, '#2a2a26');
  for (let i = 0; i < 14; i++) P.circ(4 + hrand(i, 2) * 22, 13 + hrand(i, 5) * 12, .5, hrand(i, 7) < .5 ? '#7a786e' : '#a09e96');
  for (let x = 2; x < 20; x += 2) P.line(x, 11, x + 4, 25, 'rgba(74,90,52,.45)', .3);                   // camouflage netting
  P.R(1, 26, 30, 2, '#6a6862');
  return {};
}

/* ---------- infantry ---------- */
const HELMET = {
  stahl: [[2, 0, 4], [1, 1, 6], [0, 2, 7], [-1, 3, 4], [-1, 4, 2]],
  m1:    [[2, 0, 4], [1, 1, 6], [1, 2, 6], [0, 3, 8]],
  brodie:[[2, 0, 4], [1, 1, 6], [-1, 2, 10]],
  ssh40: [[2, 0, 4], [1, 1, 6], [1, 2, 6], [1, 3, 6]],
};
const HELMET_COL = {ger:'#5d6152', us:'#535b33', uk:'#5f6040', su:'#56603c', fr:'#535b33'};
/* what the troops are wearing: set by getSprite from the sprite variant ('w' = winter) */
const DRESS = {winter:false};
const WINTER_DRESS = {ger:{uni:'#d6dad4', hel:'#c4c8c0'}, su:{uni:'#d8dcd6', hel:'#b8bcb2'}, us:{uni:'#5a5442', coat:1}, fr:{uni:'#5a5442', coat:1}, uk:{uni:'#6a5a3e', coat:1}};
function soldier(P, x, y, nat, weapon, f, kneel) {
  const B = natBase(nat), N = NATION[nat], wd = DRESS.winter && WINTER_DRESS[B], uni = wd ? wd.uni : N.uniform, uniD = shade(uni, -.18), skin = N.skin || '#dba985', hel = wd && wd.hel || HELMET_COL[nat] || HELMET_COL[B];
  const step = f % 2;
  y += kneel ? 3 : 0;
  if (B === 'us' || B === 'fr') { P.R(x + 1, y + 6, 2, 5, '#8a7a50'); P.R(x + .5, y + 10.5, 2, 1.5, '#4a4a36'); }   // pack and entrenching tool
  if (B === 'uk') { P.R(x + .5, y + 6, 2.5, 3, '#a0905c'); P.R(x + 1, y + 9, 1.5, 1.6, '#3e4232'); }                  // small pack, water bottle
  if (B === 'su') { P.R(x + 1, y + 7, 1.5, 3, '#6a5030'); P.R(x + .8, y + 10, 2, 1.2, '#4a4a40'); }                     // spade and veshmeshok
  if (B === 'ger') { P.R(x + 1, y + 9, 2, 3, '#4e4a38'); P.circ(x + 1.5, y + 12, .6, '#3a3a30'); P.R(x + .4, y + 7, 1.6, 2, '#3e4636'); }   // gas-mask canister, mess tin
  if (weapon === 'flamer') { P.R(x - .5, y + 6, 1.5, 5, '#3a3c34'); P.R(x + 1, y + 6, 1.5, 5, '#3a3c34'); }   // fuel tanks
  P.R(x + 2, y + 6, 5, 6, uni); P.R(x + 2, y + 10, 5, 1, B === 'su' ? '#5a4030' : '#3e3424');
  P.R(x + 5.5, y + 6.5, 1, 1.5, shade(uni, -.1)); P.R(x + 3, y + 6.5, 1, 1.5, shade(uni, -.1));        // breast pockets
  if (B === 'su') { P.line(x + 2, y + 6, x + 6, y + 9, '#6e6248', .8); }
  if (B === 'ger') { P.line(x + 3, y + 6, x + 4, y + 10, '#3a3a30', .4); P.line(x + 6, y + 6, x + 5, y + 10, '#3a3a30', .4); }
  if (B === 'us' || B === 'fr') { P.R(x + 4, y + 10, 3, 1, '#9a8a5a'); P.circ(x + 3.3, y + 7.6, .7, '#4a5232'); }   // cartridge belt, grenade on the suspenders
  if (B === 'ger') { P.line(x + 6.6, y + 11, x + 7.6, y + 7.4, '#7a6040', .5); P.R(x + 7.1, y + 6.8, 1.1, 1.1, '#4a4c40'); P.R(x + 3.3, y + 9.6, 1.6, 1, '#2a241c'); }   // stick grenade in the belt, ammunition pouches
  if (B === 'uk') { P.line(x + 2.5, y + 6, x + 6.5, y + 10, '#a0905c', .5); P.R(x + 5.6, y + 9.4, 1.4, 1.2, '#a0905c'); }   // webbing, basic pouch
  if (B === 'su') P.R(x + 5.4, y + 9.5, 1.4, 1, '#4a3a22');
  if (wd && wd.coat) { P.R(x + 2, y + 10, 5, 3.5, uni); P.R(x + 2, y + 12.8, 5, .6, uniD); P.R(x + 3, y + 5.6, 4, .9, '#7a2a24'); }   // greatcoat skirts and a scarf
  P.R(x + 3, y + 3, 4, 3, skin); P.px(x + 7, y + 4, skin); P.R(x + 5, y + 4, .6, .6, '#2a2018'); P.R(x + 3, y + 5, 3, 1, shade(skin, -.12)); P.R(x + 6.5, y + 5.2, .8, .4, '#8a5a48');
  for (const [dx, dy, w] of HELMET[N.helmet]) P.R(x + dx, y + dy, w, 1, hel);
  P.R(x + 3, y + .5, 2, .6, shade(hel, .3));
  if (B === 'us') P.R(x + 1, y + 1.5, 6, .4, 'rgba(40,46,20,.6)');                                  // helmet net
  if (B === 'su') P.circ(x + 5, y + 1.5, .6, '#c03028');
  if (SOLDIER_EXTRA[B]) SOLDIER_EXTRA[B](P, x, y, uni, hel, kneel, step);
  if (kneel) {
    P.R(x + 2, y + 12, 6, 2, uniD); P.R(x + 7, y + 12, 2, 4, uniD); P.R(x + 6, y + 16, 4, 1, '#1e1a16');
    P.R(x + 1, y + 13, 2, 3, uniD); P.R(x, y + 16, 4, 1, '#1e1a16');
  } else {
    const fx = x + 5 + step, bx = x + 3 - step;
    P.R(bx, y + 12, 2, 5, uniD); P.R(fx, y + 12, 2, 5, shade(uni, -.1));
    const boot = B === 'us' || B === 'fr' ? '#6a4a30' : '#1e1a16';
    if (B === 'ger' || B === 'su') { P.R(bx, y + 14, 2, 3, boot); P.R(fx, y + 14, 2, 3, boot); }
    if (B === 'us' || B === 'fr') { P.R(bx, y + 15, 2, 2, '#c8b890'); P.R(fx, y + 15, 2, 2, '#c8b890'); }
    if (B === 'uk') { P.R(bx, y + 16, 2, 1, '#b0a070'); P.R(fx, y + 16, 2, 1, '#b0a070'); }
    P.R(bx - 1, y + 17, 3, 1, boot); P.R(fx, y + 17, 3, 1, boot);
  }
  const wy = y + 8, W = '#4a3420', M = '#232326';
  const arm = () => { P.R(x + 5, y + 7, 2, 3, uniD); P.circ(x + 7.3, y + 9.2, .7, skin); };
  switch (weapon) {
    case 'mg42': P.R(x + 2, wy, 13, 1.6, M); P.R(x + 6, wy - 1, 5, 1, '#4a4a48'); for (let i = 0; i < 5; i++) P.circ(x + 7 + i * 1.3, wy + .6, .25, '#5a5a58'); P.R(x + 1, wy + 1, 3, 2, W); P.line(x + 13, wy + 1, x + 14, wy + 3.5, M, .4); P.R(x + 4, wy + 1.6, 1, 2, '#c8a040'); arm(); break;
    case 'rifle': P.R(x + 1, wy + 1, 6, 1, W); P.R(x + 6, wy, 7, 1, W); P.R(x + 11, wy, 3, .7, M); P.R(x + 8, wy - .4, 1, .4, M); arm(); break;
    case 'garand': P.R(x + 1, wy + 1, 6, 1, '#6a4428'); P.R(x + 6, wy, 6, 1, '#6a4428'); P.R(x + 10, wy, 4, .7, M); P.R(x + 7, wy - 1, 1, 1, M); arm(); break;
    case 'bar': P.R(x + 1, wy + 1, 5, 1, W); P.R(x + 5, wy, 9, 1, M); P.R(x + 7, wy + 1, 2, 2, M); arm(); break;
    case 'bren': P.R(x + 1, wy + 1, 4, 1, W); P.R(x + 4, wy, 10, 1, M); P.poly([[x + 7, wy], [x + 7, wy - 3], [x + 8.5, wy - 3.5], [x + 8, wy]], M); P.px(x + 13, wy - 1, M); arm(); break;
    case 'ppsh': P.R(x + 1, wy + 1, 5, 1, W); P.R(x + 5, wy, 6, 1, W); P.R(x + 9, wy, 3, .8, M); P.circ(x + 7, wy + 2, 1.4, M); P.R(x + 9, wy - .3, 3, .3, '#5a5a58'); arm(); break;
    case 'schreck': P.R(x - 3, y + 6, 17, 2, '#56604a'); P.R(x + 8, y + 3, 4, 5, '#626c56'); P.px(x + 9, y + 4, '#9ab0b8'); P.circ(x - 3, y + 7, 1, '#3a4030'); arm(); break;
    case 'bazooka': P.R(x - 4, y + 6, 18, 2, '#4a5238'); P.R(x + 13, y + 5, 1, 4, '#2a2a20'); P.R(x + 3, y + 8, 1, 2, '#3a3a30'); arm(); break;
    case 'piat': P.R(x - 2, y + 6, 13, 3, '#4a4a3a'); P.R(x + 10, y + 5, 3, 1, '#2a2a22'); P.R(x + 1, y + 9, 2, 2, '#3a3a30'); arm(); break;
    case 'ptrd': P.R(x - 3, wy, 19, 1, M); P.R(x + 15, wy - 1, 1, 3, M); P.R(x - 3, wy + 1, 4, 1, W); P.R(x + 9, wy + 1, 1, 3, M); arm(); break;
    case 'shell': P.R(x + 6, wy - 1, 5, 3, '#8a7444'); P.px(x + 11, wy, '#5a4a2a'); arm(); break;
    case 'bangalore': P.R(x + 1, wy - 1, 18, 1.2, '#5a5c48'); P.R(x + 18, wy - 1.4, 1.4, 2, '#3a3a30'); arm(); break;   // Bangalore torpedo
    case 'flamer': P.R(x + 4, wy, 9, 1.2, '#3a3c34'); P.circ(x + 13.5, wy + .5, .8, '#e8a040'); arm(); break;
    case 'satchel': P.R(x + 6, wy, 4, 3, '#6a5a3a'); P.R(x + 7, wy - 1, 2, 1, '#4a3a2a'); P.R(x + 1, wy + 1, 5, 1, W); arm(); break;
    case 'carbine': P.R(x + 2, wy + 1, 5, 1, '#6a4428'); P.R(x + 6, wy, 5, .8, M); arm(); break;
    default: if (WEAPON_EXTRA[weapon]) WEAPON_EXTRA[weapon](P, x, y, wy, arm, W, M);
  }
}
const INF_WEAPONS = {
  ger:{inf:['rifle', 'rifle', 'mg42'], at:['shell', 'schreck'], eng:['satchel', 'flamer'], mortar:['shell', 'rifle']},
  us: {inf:['garand', 'garand', 'bar'], at:['shell', 'bazooka'], eng:['carbine', 'bangalore'], mortar:['shell', 'carbine']},
  fr: {inf:['garand', 'garand', 'bar'], at:['shell', 'bazooka'], eng:['carbine', 'bangalore'], mortar:['shell', 'carbine']},
  uk: {inf:['rifle', 'rifle', 'bren'], at:['shell', 'piat'], eng:['rifle', 'bangalore'], mortar:['shell', 'rifle']},
  su: {inf:['ppsh', 'rifle', 'ppsh'], at:['shell', 'ptrd'], eng:['ppsh', 'satchel'], mortar:['shell', 'rifle']},
};
function drawMortar(P, nat, f) {
  P.ell(13, 27, 5, 1.2, '#3a3a34');                                                       // baseplate
  P.line(12, 26, 20, 13, '#2c2e28', 1.6); P.line(12, 25.6, 20, 12.6, '#5a5c50', .4);    // tube
  P.line(16, 26, 17, 20, '#2c2e28', .5); P.line(19, 26, 17.5, 20, '#2c2e28', .5);       // bipod
  soldier(P, 1, 9, nat, 'shell', f, true); soldier(P, 21, 10, nat, null, f, true);
}
/* n = figures still standing (the squad thins out as it takes losses) */
function drawInfantry(P, nat, role, f, n = 3) {
  const w = (INF_WEAPONS[nat] || INF_WEAPONS[natBase(nat)] || INF_WEAPONS.us)[role] || ['rifle', 'rifle', 'rifle'];
  if (NATION[nat] && NATION[nat].zed) return drawZed(P, role, f, n);
  if (role === 'mortar') return drawMortar(P, nat, f);
  if (role === 'cav') return drawCav(P, nat, f, n, w);
  if (role === 'inf') { if (n >= 2) soldier(P, 1, 9, nat, w[0], f); if (n >= 3) soldier(P, 9, 6, nat, w[1], f + 1); soldier(P, n >= 2 ? 16 : 9, 10, nat, w[2], f); }
  else { if (n >= 2) soldier(P, 2, 10, nat, w[0], f, true); soldier(P, 13, 8, nat, w[1], f); }
}
/* the sprite variant for a unit: winter dress on snowy maps, and its squad strength */
function spriteVar(u, theme) {
  let v = theme === 'winter' ? 'w' : '';
  if (u && u.d.foot && u.role !== 'mortar') v += u.hp > (u.role === 'inf' ? 66 : 50) ? '' : u.role === 'inf' && u.hp > 33 ? '2' : '1';
  return v;
}

/* ---------- sprite cache ---------- */
const spriteCache = new Map();
function unitColours(nat) { const c = NATION[nat].col; return {m:c.m, d:c.d, hi:c.hi, wheel:'#55574c'}; }
/* hi: detail multiplier. The map draws at 1; the battle scenes draw the same models at 2, painted from the same
   recipes on a finer grid, so edges, rivets, faces and kit come out sharper instead of blown-up pixels */
function getSprite(nat, role, f = 0, grey = false, v = '', hi = 1) {
  const key = nat + role + f + (grey ? 'g' : '') + v + (hi > 1 ? '@' + hi : '');
  let c = spriteCache.get(key); if (c) return c;
  c = mkCanvas(ART * hi, ART * hi); const P = painter(c.getContext('2d'), SC * hi), C = unitColours(nat), d = udef(nat, role);
  if (!d) { spriteCache.set(key, c); return c; }
  const sh = d.shape, winter = v.includes('w'), figs = +(v.match(/\d/) || [3])[0], B = natBase(nat);
  DRESS.winter = winter;
  let anchor = {};
  if (d.foot) drawInfantry(P, nat, role, f, figs);
  else if (sh === 'nest') drawNest(P, nat, f);
  else if (sh === 'casemate') drawCasemate(P, f);
  else if (EXTRA_SHAPES[sh]) anchor = EXTRA_SHAPES[sh](P, C, f, nat) || {};
  else if (TANKS[sh]) anchor = drawTank(P, TANKS[sh], C, f);
  else if (WHEELED[sh]) anchor = drawWheeled(P, WHEELED[sh], C, f);
  else if (['ht251', 'm3ht', 'm16'].includes(sh)) anchor = drawHalftrack(P, sh, C, f);
  else if (['zis5', 'katyusha', 'k61'].includes(sh)) anchor = drawTruck(P, sh, C, f);
  else if (GUNS[sh]) anchor = drawTowed(P, GUNS[sh], C, f, nat);
  else if (sh === 'nebel' || sh === 'mattress') anchor = drawRocketLauncher(P, sh, C, f);
  else if (PLANES[sh]) anchor = drawPlane(P, PLANES[sh], C, f);
  else if (SHIPS[sh]) anchor = drawShip(P, SHIPS[sh], C, f);
  else if (BOATS[sh]) anchor = drawBoat(P, BOATS[sh], C, f);
  const vehicle = !d.foot && !d.air && !d.sea && !d.fixed, towed = !!GUNS[sh] || sh === 'nebel' || sh === 'mattress';
  if (vehicle && !towed) {
    const mk = NATION[nat].star, mx = anchor.mx != null ? anchor.mx : (anchor.tx != null ? anchor.tx + 3 : 12), my = anchor.my != null ? anchor.my : (anchor.ty != null ? anchor.ty + 3 : 16);
    if (mk === 'balken') mark(P, 'balken', TANKS[sh] ? 9 : mx, TANKS[sh] ? (anchor.ht || 14) + 3 : my, 1);
    else mark(P, mk, mx, my, 1);
    if (B === 'su' && TANKS[sh] && anchor.tx != null) P.R(anchor.tx + 2, anchor.ty + 1, 3, .6, '#e8e8e0');
    if (B === 'ger' && TANKS[sh] && anchor.tx != null) { P.R(anchor.tx + 4, anchor.ty + 2, .6, 1.4, '#e8e8e0'); P.R(anchor.tx + 5, anchor.ty + 2, .6, 1.4, '#e8e8e0'); P.R(anchor.tx + 6, anchor.ty + 2, .6, 1.4, '#e8e8e0'); }   // turret number
  }
  const camo = nat === 'ger' && vehicle ? ['#5d6b3a', '#7a4a32'] : null;
  finish(c, {camo, base:C.m, vehicle, weather:vehicle || d.fixed, snow:winter ? (vehicle && (B === 'ger' || B === 'su' || B === 'us') ? 2 : 1) : 0});
  DRESS.winter = false;
  if (grey) { const g = c.getContext('2d'), im = g.getImageData(0, 0, c.width, c.height), px = im.data;
    for (let i = 0; i < px.length; i += 4) { const v = (px[i] * .3 + px[i + 1] * .55 + px[i + 2] * .15) * .72; px[i] = px[i + 1] = px[i + 2] = v; } g.putImageData(im, 0, 0); }
  spriteCache.set(key, c);
  return c;
}

/* ---------- flags ---------- */
function drawFlag(g, nat, x, y, w, h, mode = SET.flags) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); nat = nat && natBase(nat);
  if (FLAG_EXTRA[nat]) FLAG_EXTRA[nat](g, x, y, w, h, mode);
  else if (!nat) { g.fillStyle = '#d8d6cc'; g.fillRect(x, y, w, h); g.restore(); return; }
  if (nat === 'ger') {
    if (mode === 'hist') {                            // Reichskriegsflagge 1938-45
      g.fillStyle = '#c8202a'; g.fillRect(x, y, w, h);
      const cx = x + w * .42, cy = y + h / 2, t = Math.max(.5, h * .12);
      g.fillStyle = '#fff'; g.fillRect(x, cy - t * 1.5, w, t * 3); g.fillRect(cx - t * 1.5, y, t * 3, h);
      g.fillStyle = '#111'; g.fillRect(x, cy - t * .7, w, t * 1.4); g.fillRect(cx - t * .7, y, t * 1.4, h);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, h * .3, 0, 7); g.fill();
      g.strokeStyle = '#111'; g.lineWidth = Math.max(.5, h * .07); g.beginPath(); g.arc(cx, cy, h * .3, 0, 7); g.stroke();
      const s = h * .16; g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); g.lineWidth = Math.max(.5, h * .065); g.lineCap = 'square'; g.beginPath();
      for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.moveTo(0, 0); g.lineTo(0, -s); g.lineTo(s * .9, -s); }
      g.stroke(); g.restore();
      if (w > 14) { g.fillStyle = '#111'; const ix = x + w * .1, iy = y + h * .08, ic = h * .22; g.fillRect(ix + ic * .35, iy, ic * .3, ic); g.fillRect(ix, iy + ic * .35, ic, ic * .3); }
    } else {
      g.fillStyle = '#6b6f5e'; g.fillRect(x, y, w, h);
      const cx = x + w / 2, cy = y + h / 2, a = h * .38, t = h * .16;
      g.fillStyle = '#fff'; g.fillRect(cx - t * 1.6, cy - a, t * 3.2, a * 2); g.fillRect(cx - a, cy - t * 1.6, a * 2, t * 3.2);
      g.fillStyle = '#111'; g.fillRect(cx - t / 2, cy - a, t, a * 2); g.fillRect(cx - a, cy - t / 2, a * 2, t);
    }
  } else if (nat === 'us') {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#fff' : '#b22234'; g.fillRect(x, y + i * h / 13, w, h / 13 + .5); }
    g.fillStyle = '#3c3b6e'; g.fillRect(x, y, w * .4, h * 7 / 13);
    if (w > 14) { g.fillStyle = '#fff'; const d = Math.max(.6, w * .02); for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) g.fillRect(x + w * .025 + c * w * .046, y + h * .04 + r * h * .085, d, d); }
  } else if (nat === 'uk') {
    g.fillStyle = '#012169'; g.fillRect(x, y, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = h * .2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke();
    g.strokeStyle = '#c8102e'; g.lineWidth = h * .07; g.stroke();
    g.fillStyle = '#fff'; g.fillRect(x + w / 2 - h * .17, y, h * .34, h); g.fillRect(x, y + h / 2 - h * .17, w, h * .34);
    g.fillStyle = '#c8102e'; g.fillRect(x + w / 2 - h * .1, y, h * .2, h); g.fillRect(x, y + h / 2 - h * .1, w, h * .2);
  } else if (nat === 'fr') {                            // Free French: tricolour with the red Cross of Lorraine
    g.fillStyle = '#1c3a8a'; g.fillRect(x, y, w / 3, h); g.fillStyle = '#f4f4ee'; g.fillRect(x + w / 3, y, w / 3, h); g.fillStyle = '#c8202a'; g.fillRect(x + w * 2 / 3, y, w / 3, h);
    const cx = x + w / 2, t = Math.max(.6, w * .035); g.fillStyle = '#c8202a';
    g.fillRect(cx - t / 2, y + h * .18, t, h * .64); g.fillRect(cx - w * .08, y + h * .32, w * .16, t); g.fillRect(cx - w * .11, y + h * .48, w * .22, t);
  } else if (nat === 'su') {
    g.fillStyle = '#cc1f1f'; g.fillRect(x, y, w, h);
    g.fillStyle = '#f2c23a'; const s = h * .28, cx = x + w * .22, cy = y + h * .3;
    g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .2 : s * .5; g.lineTo(cx + Math.cos(a) * r, cy - s * .9 + Math.sin(a) * r); } g.fill();
    g.strokeStyle = '#f2c23a'; g.lineWidth = Math.max(.5, h * .07); g.beginPath(); g.arc(cx, cy + s * .2, s * .45, -2.4, 1.2); g.stroke();
    g.beginPath(); g.moveTo(cx - s * .45, cy + s * .7); g.lineTo(cx + s * .35, cy - s * .2); g.stroke();
  }
  // cloth shading: soft folds
  const gr = g.createLinearGradient(x, y, x + w, y); gr.addColorStop(0, 'rgba(0,0,0,.12)'); gr.addColorStop(.3, 'rgba(255,255,255,.08)'); gr.addColorStop(.6, 'rgba(0,0,0,.08)'); gr.addColorStop(1, 'rgba(255,255,255,.05)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
}

/* ---------- terrain ---------- */
const PAL = {
  normandy:{grass:'#6f9a3e', grass2:'#5f8a34', field:'#9cae58', field2:'#b8a35a', hedge:'#2f5a24', tree:'#2e5d26', tree2:'#3f7a30', trunk:'#4a3420', water:'#3d6f9a', water2:'#5a8cb8', sea:'#2f5f86', sea2:'#4878a2', sand:'#d8c690', road:'#a89a78', road2:'#8c7e5e', roof:'#4a4e58', wall:'#cfc4a8', hill:'#86a24c', rock:'#9a9688', wheat:'#c8b45a', snow:0},
  holland: {grass:'#7aa646', grass2:'#689438', field:'#a8bc60', field2:'#9cb058', hedge:'#356428', tree:'#2f5e28', tree2:'#43803a', trunk:'#4a3420', water:'#3a6c98', water2:'#5a8cb8', sea:'#2f5f86', sea2:'#4878a2', sand:'#d6c690', road:'#9a8e72', road2:'#80745a', roof:'#8a3a2a', wall:'#a8583c', hill:'#8aa850', rock:'#9a9688', wheat:'#c0b45a', snow:0},
  winter:  {grass:'#e6ecf0', grass2:'#d2dce4', field:'#eef2f4', field2:'#dfe6ea', hedge:'#5a6a5a', tree:'#2a4a36', tree2:'#38604a', trunk:'#3a2a1a', water:'#4a6a84', water2:'#7a9ab4', sea:'#3a5a76', sea2:'#5a7a96', sand:'#d8d4c4', road:'#b8b4a8', road2:'#8c8a80', roof:'#e8eef2', wall:'#b8aa90', hill:'#d0dae2', rock:'#8a8a86', wheat:'#e2e6e2', snow:1},
  spring:  {grass:'#7eaa4a', grass2:'#6a9a3c', field:'#a4ba5c', field2:'#c0b066', hedge:'#30602a', tree:'#305f28', tree2:'#4c8a38', trunk:'#4a3420', water:'#3a6890', water2:'#5a88b0', sea:'#2f5f86', sea2:'#4878a2', sand:'#d6c690', road:'#9c9078', road2:'#7e745e', roof:'#5a4a48', wall:'#c8b89a', hill:'#8aa84e', rock:'#9a9688', wheat:'#b8b060', snow:0},
  city:    {grass:'#7c8a5a', grass2:'#6c7a4c', field:'#8a8a62', field2:'#7a7a58', hedge:'#3c5030', tree:'#3a5530', tree2:'#4a6a3c', trunk:'#3a2a1a', water:'#4a5a6a', water2:'#6a7a8a', sea:'#3a4a5a', sea2:'#5a6a7a', sand:'#b8ae90', road:'#7a766c', road2:'#5e5a52', roof:'#5a5450', wall:'#9a8a78', hill:'#7c8a58', rock:'#8a867c', wheat:'#9a9466', snow:0},
  paris:   {grass:'#7a9a4a', grass2:'#6a8a3e', field:'#9cae58', field2:'#a8a060', hedge:'#3a6a2a', tree:'#3a6a2c', tree2:'#4c8a38', trunk:'#4a3420', water:'#4a6a7a', water2:'#6a8a9a', sea:'#3a5a6a', sea2:'#5a7a8a', sand:'#cfc4a0', road:'#8e8a80', road2:'#6e6a62', roof:'#4a5260', wall:'#e2d8bc', hill:'#86a24c', rock:'#9a9688', wheat:'#c0b060', snow:0},
  autumn:  {grass:'#7a7a3e', grass2:'#6a6a34', field:'#8a7a48', field2:'#9a7a40', hedge:'#4a4a24', tree:'#1f3a26', tree2:'#2e4e32', trunk:'#3a2a1a', water:'#3a5a6a', water2:'#5a7a8a', sea:'#2f4f66', sea2:'#4a6a82', sand:'#b8a880', road:'#7a6a50', road2:'#5a4a36', roof:'#5a4038', wall:'#a89878', hill:'#7a7442', rock:'#8a8478', wheat:'#9a8a50', snow:0, mud:1},
  steppe:  {grass:'#9aa24e', grass2:'#8a9244', field:'#b8a85a', field2:'#c8b464', hedge:'#4a6a2a', tree:'#3a5a2a', tree2:'#4e7638', trunk:'#4a3420', water:'#4a7090', water2:'#6a90b0', sea:'#2f5f86', sea2:'#4878a2', sand:'#d8c690', road:'#a8946a', road2:'#8a7650', roof:'#7a6a50', wall:'#d8c8a0', hill:'#a0a258', rock:'#9a9688', wheat:'#d8bc5a', snow:0},
};
const isRoadLike = t => t === 'road' || t === 'bridge' || (TER[t] && TER[t].prop);
const isWater = t => t === 'river' || t === 'sea' || t === 'bridge';
function drawTile(g, x, y) {
  const t = terr(x, y), C = PAL[G.theme] || PAL.normandy, X = x * 32, Y = y * 32, P = painter(g), R = i => hrand(x, y, i), S = SC;
  const F = (a, b, w, h, c) => P.R(X + a, Y + b, w, h, c);
  const FF = (a, b, w, h, c) => P.fR((X + a) * S, (Y + b) * S, w, h, c);          // fine strokes in 32-units origin, fine size
  const N = (dx, dy) => inside(x + dx, y + dy) ? terr(x + dx, y + dy) : t;
  const nearCoast = ['sea', 'beach', 'shingle'].some(k => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => N(a, b) === k)) || ['beach', 'shingle'].includes(t);
  const baseCol = (t === 'obst' && nearCoast) || t === 'shingle' ? C.sand : C.grass;
  F(0, 0, 32, 32, baseCol);
  for (let i = 0; i < 46; i++) FF(R(i) * 31, R(i + 30) * 31, 1 + (R(i + 60) * 2 | 0), 2 + (R(i + 61) * 3 | 0), R(i + 90) < .5 ? (baseCol === C.grass ? C.grass2 : shade(C.sand, -.08)) : shade(baseCol, .1));   // grass blades / grain
  if (C.snow) for (let i = 0; i < 10; i++) F(R(i + 200) * 30, R(i + 230) * 30, 2, .5, '#c4d0d8');
  const tufts = () => { for (let i = 0; i < 5; i++) { const a = R(i + 300) * 28, b = R(i + 330) * 28; for (let k = 0; k < 4; k++) P.line(X + a + k * .6, Y + b + 2, X + a + k * .6 + (k - 1.5) * .5, Y + b, k % 2 ? C.grass2 : shade(C.grass2, -.15), .3); } };   // in this tile (they once all landed in the top-left corner)
  const tree = (cx, cy, r) => {
    P.ell(cx + X + 1.5, cy + Y + r * .7, r * .9, r * .45, 'rgba(0,0,0,.22)');                         // cast shadow
    if (C.snow) { P.poly([[X + cx, Y + cy - r * 2], [X + cx - r, Y + cy + r * .6], [X + cx + r, Y + cy + r * .6]], C.tree); P.poly([[X + cx, Y + cy - r * 2], [X + cx - r * .45, Y + cy - r * .7], [X + cx + r * .45, Y + cy - r * .7]], '#f0f4f6'); P.poly([[X + cx - r * .6, Y + cy], [X + cx, Y + cy - r * .7], [X + cx + r * .6, Y + cy]], 'rgba(240,244,246,.75)'); P.R(X + cx - .5, Y + cy + r * .6, 1.5, 2, C.trunk); return; }
    if (G.theme === 'autumn' || G.theme === 'city' && R(cx) < .3) { P.poly([[X + cx, Y + cy - r * 2.1], [X + cx - r * .9, Y + cy + r * .6], [X + cx + r * .9, Y + cy + r * .6]], C.tree); P.poly([[X + cx, Y + cy - r * 2.1], [X + cx - r * .5, Y + cy - r * .6], [X + cx + r * .2, Y + cy - r * .5]], C.tree2); P.R(X + cx - .4, Y + cy + r * .6, 1, 2, C.trunk); return; }   // firs
    P.R(X + cx, Y + cy + r - 1, 1.5, 3, C.trunk); P.circ(X + cx, Y + cy, r, C.tree); P.circ(X + cx - r * .3, Y + cy - r * .3, r * .62, C.tree2);
    for (let i = 0; i < 6; i++) P.circ(X + cx + (R(i + cx) - .5) * r * 1.4, Y + cy + (R(i + cy + 9) - .5) * r * 1.4, r * .22, i % 2 ? shade(C.tree2, .22) : shade(C.tree, -.15));   // leaf clumps
  };
  if (TILE_EXTRA[t]) TILE_EXTRA[t]({P, F, FF, R, X, Y, C, N, tree, tufts, x, y});
  switch (t) {
    case 'plain': tufts(); if (!C.snow && R(7) < .3) for (let i = 0; i < 4; i++) P.circ(X + R(i + 400) * 30, Y + R(i + 430) * 30, .4, ['#e8e0a0', '#f0f0f0', '#d07070', '#c8a0e0'][i]); break;
    case 'field': {
      F(0, 0, 32, 32, C.wheat); for (let r = 1; r < 32; r += 2.5) F(0, r + ((x * 7 + y * 3) % 3) * .3, 32, .6, shade(C.wheat, -.1));   // rows run on across tiles
      for (let i = 0; i < 46; i++) FF(R(i + 500) * 31, R(i + 520) * 31, 1, 3, shade(C.wheat, R(i + 540) < .5 ? .15 : -.1));
      if (R(560) < .2) P.circ(X + 6 + R(561) * 20, Y + 6 + R(562) * 20, .6, '#c03028'); break; }                                   // a poppy
    case 'forest': { const n = 5; for (let i = 0; i < n; i++) tree(4 + (i % 3) * 11 + R(i) * 5, 5 + Math.floor(i / 3) * 14 + (i % 2) * 6 + R(i + 9) * 4, 4.5 + R(i + 5) * 2); break; }
    case 'bocage': {
      const fc = R(1) < .5 ? C.field : C.field2;
      F(3, 3, 26, 26, fc);
      for (let r = 6; r < 28; r += 3) F(4, r, 24, .5, shade(fc, -.08));
      if (R(2) < .3 && !C.snow) for (let i = 0; i < 3; i++) { P.ell(X + 8 + i * 6, Y + 14 + (i % 2) * 6, 2, 1.2, '#f0ece0'); P.circ(X + 6.6 + i * 6, Y + 13.4 + (i % 2) * 6, .8, '#3a3028'); }   // Normandy cows
      const hedge = (a, b, w, h) => { F(a, b, w, h, C.hedge); for (let i = 0; i < Math.max(w, h); i += 2) P.circ(X + a + (w > h ? i : w / 2), Y + b + (w > h ? h / 2 : i), 1.8, R(i + 40) < .5 ? C.hedge : shade(C.hedge, .18)); };
      hedge(0, 0, 32, 3); hedge(0, 29, 32, 3); hedge(0, 0, 3, 32); hedge(29, 0, 3, 32);
      if (R(3) < .6) tree(R(4) < .5 ? 3 : 28, R(5) < .5 ? 3 : 27, 4);
      if (C.snow) for (let i = 0; i < 8; i++) F(R(i + 500) * 30, R(i + 520) < .5 ? 0 : 30, 3, 1, '#f4f8fa');
      break; }
    case 'hill': {                                     // continuous high ground: slopes shade only where the hill ends
      const isH = (dx, dy) => ['hill', 'bunker', 'trench', 'cliff'].includes(N(dx, dy)) || !inside(x + dx, y + dy);
      const lone = !isH(1, 0) && !isH(-1, 0) && !isH(0, 1) && !isH(0, -1);
      if (lone) { P.ell(X + 16, Y + 19, 14, 10, shade(C.hill, -.15)); P.ell(X + 15, Y + 17, 12, 9, C.hill); P.ell(X + 12, Y + 13, 7, 5, shade(C.hill, .12)); }
      else {
        const hc = shade(C.grass, C.snow ? -.03 : .04);                     // slope grass, close to the plain so ridges blend in
        F(0, 0, 32, 32, hc);
        for (let i = 0; i < 9; i++) P.ell(X + R(i + 610) * 32, Y + R(i + 611) * 32, 3 + R(i + 612) * 4, 1.5 + R(i + 613) * 2, shade(hc, R(i + 614) < .5 ? .05 : -.06));
        if (!isH(0, -1)) { for (let r = 0; r < 4; r++) F(0, r, 32, 1, shade(hc, .16 - r * .04)); }                 // crest catches the light
        if (!isH(0, 1)) { for (let r = 0; r < 6; r++) F(0, 26 + r, 32, 1, shade(hc, -.04 - r * .04)); }           // foot of the slope in shadow
        if (!isH(-1, 0)) for (let r = 0; r < 3; r++) F(r, 0, 1, 32, shade(hc, .1 - r * .03));
        if (!isH(1, 0)) for (let r = 0; r < 4; r++) F(31 - r, 0, 1, 32, shade(hc, -.16 + r * .04));
        for (let i = 0; i < 3; i++) P.line(X + R(i + 630) * 28, Y + 8 + i * 8, X + R(i + 630) * 28 + 8, Y + 9 + i * 8, shade(C.hill, -.1), .4);   // contour lines
      }
      for (let i = 0; i < 4; i++) P.ell(X + 4 + R(i + 610) * 24, Y + 6 + R(i + 620) * 20, 1.4, .8, C.rock);
      tufts(); break; }
    case 'marsh': {
      for (let i = 0; i < 6; i++) P.ell(X + 4 + R(i + 640) * 24, Y + 4 + R(i + 650) * 24, 3 + R(i + 660) * 3, 1.5 + R(i + 670) * 2, C.snow ? '#b8c8d4' : shade(C.water, .15));
      for (let i = 0; i < 18; i++) { const a = R(i + 680) * 30, b = R(i + 690) * 30; P.line(X + a, Y + b + 3, X + a + (R(i) - .5), Y + b, i % 3 ? '#4a6a2a' : '#8a7a40', .3); }   // reeds and bulrushes
      break; }
    case 'river': case 'sea': case 'bridge': {
      const sea = t === 'sea', wc = sea ? C.sea : C.water, wc2 = sea ? C.sea2 : C.water2;
      if (sea) { F(0, 0, 32, 32, wc); const deep = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => isWater(N(a, b)));
        if (deep) F(0, 0, 32, 32, 'rgba(10,30,60,.18)'); }
      else {
        F(8, 8, 16, 16, wc);
        if (isWater(N(-1, 0)) || !inside(x - 1, y)) F(0, 8, 8, 16, wc); if (isWater(N(1, 0)) || !inside(x + 1, y)) F(24, 8, 8, 16, wc);
        if (isWater(N(0, -1)) || !inside(x, y - 1)) F(8, 0, 16, 8, wc); if (isWater(N(0, 1)) || !inside(x, y + 1)) F(8, 24, 16, 8, wc);
        F(9, 9, 14, .6, shade(wc, -.2));
        for (const [dx, dy, a, b, w, h] of [[-1, 0, 7, 8, 1, 16], [1, 0, 24, 8, 1, 16], [0, -1, 8, 7, 16, 1], [0, 1, 8, 24, 16, 1]]) if (!isWater(N(dx, dy)) && inside(x + dx, y + dy)) F(a, b, w, h, '#5a4a32');   // muddy banks
      }
      for (let i = 0; i < 9; i++) { const a = R(i + 60) * 26, b = R(i + 80) * 28; F(a, b, 3 + R(i) * 3, .5, wc2); F(a + 1, b + .5, 2, .5, shade(wc2, .2)); }
      if (sea) for (const [dx, dy, a, b, w, h] of [[-1, 0, 0, 0, 2, 32], [1, 0, 30, 0, 2, 32], [0, -1, 0, 0, 32, 2], [0, 1, 0, 30, 32, 2]]) if (inside(x + dx, y + dy) && !isWater(N(dx, dy))) { F(a, b, w, h, '#e4eef2'); F(a + (w > h ? 0 : (a ? -1.5 : 2)), b + (h > w ? 0 : (b ? -1.5 : 2)), w > h ? w : 1, h > w ? h : 1, 'rgba(228,238,242,.5)'); }
      if (t === 'bridge') {
        const horiz = isRoadLike(N(-1, 0)) || isRoadLike(N(1, 0)) || !isWater(N(-1, 0)) && !isWater(N(1, 0)) && isWater(N(0, -1));
        const deck = G.theme === 'city' || G.theme === 'paris' ? '#9a948a' : '#7a6a52', plank = shade(deck, -.2);
        if (horiz) { F(0, 10, 32, 13, 'rgba(0,0,0,.25)'); F(0, 9, 32, 13, deck); for (let i = 0; i < 32; i += 2) F(i, 9, .4, 13, plank); F(0, 8, 32, 2, '#3a3a36'); F(0, 21, 32, 2, '#3a3a36'); for (let i = 2; i < 32; i += 4) { F(i, 5.5, 1, 3, '#3a3a36'); F(i, 23, 1, 3, '#3a3a36'); } F(0, 5.5, 32, .6, '#4a4a46'); }
        else { F(10, 0, 13, 32, 'rgba(0,0,0,.25)'); F(9, 0, 13, 32, deck); for (let i = 0; i < 32; i += 2) F(9, i, 13, .4, plank); F(8, 0, 2, 32, '#3a3a36'); F(21, 0, 2, 32, '#3a3a36'); }
      }
      break; }
    case 'beach': case 'shingle': case 'obst': {
      if (t !== 'obst' || nearCoast) {
        F(0, 0, 32, 32, C.sand); for (let i = 0; i < 26; i++) P.ell(X + R(i + 70) * 31, Y + R(i + 90) * 31, 1.2, .3, shade(C.sand, -.08));
        if (inside(x, y + 1) && N(0, 1) === 'sea') { F(0, 26, 32, 6, '#c8b884'); F(0, 29, 32, 3, '#b8a874'); for (let i = 0; i < 32; i += 2) P.circ(X + i, Y + 30 + (i % 3), .5, '#eef4f6'); }
        { let wet = 0; for (let k = 1; k <= 3; k++) if (inside(x, y + k) && terr(x, y + k) === 'sea') { wet = (4 - k) / 3; break; }   // wet sand darkens smoothly towards the tide line
          if (wet) for (let r = 0; r < 32; r += 2) F(0, r, 32, 2, `rgba(110,92,58,${(.06 + .1 * wet * (r / 32 + (3 - wet * 3) / 3)).toFixed(3)})`); }
      }
      if (t === 'shingle') for (let i = 0; i < 70; i++) P.ell(X + R(i + 900) * 31, Y + R(i + 950) * 31, .9 + R(i) * .6, .6 + R(i + 1) * .4, ['#9a948a', '#7a766e', '#b8b2a4', '#8a7e6a'][i % 4]);
      if (t === 'obst') {
        if (nearCoast) {                                // Czech hedgehogs, log ramps with Teller mines, Belgian gates
          for (let i = 0; i < 3; i++) { const a = 3 + i * 9 + R(i + 120) * 4, b = 4 + R(i + 140) * 18;
            P.ell(X + a + 3, Y + b + 6, 3.5, 1, 'rgba(0,0,0,.25)');
            P.line(X + a, Y + b, X + a + 6, Y + b + 6, '#3a3530', .7); P.line(X + a + 6, Y + b, X + a, Y + b + 6, '#3a3530', .7); P.line(X + a + 3, Y + b - 1, X + a + 3, Y + b + 7, '#4a4540', .7); }
          P.line(X + 4, Y + 28, X + 12, Y + 22, '#6a5038', .8); P.circ(X + 12, Y + 22, 1.1, '#3a3c30');
          if (R(5) < .5) { F(18, 22, 10, .6, '#3a3530'); for (let k = 0; k < 4; k++) P.line(X + 18 + k * 3, Y + 22, X + 19 + k * 3, Y + 28, '#3a3530', .4); }
        } else {                                        // West Wall dragon's teeth
          for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const a = 2 + k * 7.5 + (r % 2) * 3.5, b = 6 + r * 8;
            P.ell(X + a + 3, Y + b + 6, 3, .8, 'rgba(0,0,0,.25)'); P.poly([[X + a, Y + b + 6], [X + a + 3, Y + b], [X + a + 6, Y + b + 6]], '#a8a49a'); P.poly([[X + a + 3, Y + b], [X + a + 6, Y + b + 6], [X + a + 3.5, Y + b + 6]], '#7e7a72'); if (C.snow) P.poly([[X + a + 2, Y + b + 2], [X + a + 3, Y + b], [X + a + 4, Y + b + 2]], '#f4f8fa'); }
        }
      }
      break; }
    case 'wire': {
      tufts();
      for (let row = 0; row < 2; row++) { const yy = 9 + row * 12 + R(row + 980) * 3;          // concertina coils, slack and uneven
        for (let k = 0; k < 9; k++) { const cx = X + 1.5 + k * 3.6 + R(k + row * 9 + 990) * 1.2, cy = Y + yy + Math.sin(k * 1.3 + row) * 1.2, rr = 1.8 + R(k + 1000) * .9;
          P.ell(cx, cy, rr, rr * .9, '#4a4a46'); P.ell(cx, cy, rr - .5, rr * .9 - .5, baseCol); }
        for (let k = 0; k < 4; k++) P.line(X + 2 + k * 9, Y + yy - 3.5, X + 2.5 + k * 9 + R(k) - .5, Y + yy + 3, '#5a4a32', .5); }
      break; }
    case 'mines': {
      tufts();
      for (let i = 0; i < 5; i++) P.ell(X + 4 + R(i + 960) * 24, Y + 6 + R(i + 970) * 22, 1.6, .8, C.snow ? '#c8d0d4' : '#6a5a3a');   // disturbed earth
      F(22, 6, .8, 9, '#4a3a2a'); P.poly([[X + 19, Y + 4], [X + 23, Y + 10], [X + 27, Y + 4]], '#f0ece0'); P.poly([[X + 20.4, Y + 4.8], [X + 23, Y + 8.6], [X + 25.6, Y + 4.8]], '#c03028');
      P.circ(X + 23, Y + 5.6, .6, '#111'); P.R(X + 22, Y + 6.2, 2, .4, '#111');                                // "Achtung Minen" skull sign
      break; }
    case 'cliff': {
      F(0, 0, 32, 32, '#8a8270'); for (let i = 0; i < 9; i++) F(i * 3.6 + R(i) * 2, 0, 1 + R(i + 1), 32, shade('#8a8270', R(i + 2) < .5 ? -.18 : .12));
      for (let i = 0; i < 8; i++) P.line(X + R(i + 30) * 30, Y + R(i + 40) * 30, X + R(i + 30) * 30 + 3, Y + R(i + 40) * 30 + 6, '#4a443a', .5);
      if (!['cliff', 'sea', 'beach'].includes(N(0, -1))) { F(0, 0, 32, 4, C.grass); for (let i = 0; i < 16; i++) FF(i * 4, 7, 2, 3, C.grass2); }
      if (N(0, 1) === 'beach' || N(0, 1) === 'sea') F(0, 28, 32, 4, '#6a6254');
      break; }
    case 'trench': {
      tufts();
      const pts = [[0, 16], [6, 12], [12, 20], [18, 12], [24, 20], [32, 16]];
      for (let i = 0; i + 1 < pts.length; i++) { P.line(X + pts[i][0], Y + pts[i][1], X + pts[i + 1][0], Y + pts[i + 1][1], '#6a5a3a', 2.4); }
      for (let i = 0; i + 1 < pts.length; i++) { P.line(X + pts[i][0], Y + pts[i][1], X + pts[i + 1][0], Y + pts[i + 1][1], '#2a2218', 1.2); }
      for (let i = 0; i < 10; i++) P.ell(X + 2 + i * 3, Y + 9 + (i % 2) * 14, 1.2, .7, '#a0906a');      // sandbags
      break; }
    case 'bunker': {
      tufts(); P.ell(X + 16, Y + 27, 14, 3, 'rgba(0,0,0,.25)'); P.poly([[X + 3, Y + 26], [X + 6, Y + 10], [X + 26, Y + 10], [X + 29, Y + 26]], '#8e8c84');
      F(6, 10, 20, 2, '#a8a69e'); F(9, 15, 14, 3, '#1c1c1a'); F(8, 14, 16, .8, '#6e6c64'); F(4, 26, 24, 2, '#6a6862');
      for (let i = 0; i < 12; i++) P.circ(X + 7 + R(i + 600) * 18, Y + 19 + R(i + 620) * 6, .4, '#7a786e');
      for (let x2 = 5; x2 < 27; x2 += 4) P.line(X + x2, Y + 11, X + x2 + 2, Y + 25, 'rgba(74,90,52,.35)', .3);
      if (C.snow) F(6, 9, 20, 2, '#f0f4f6');
      break; }
    case 'ruins': {
      F(1, 1, 30, 30, shade(C.road2, -.05));
      for (let i = 0; i < 14; i++) { const a = R(i + 700) * 26, b = R(i + 720) * 26; P.ell(X + a + 3, Y + b + 3, 2 + R(i + 740) * 2, 1.4 + R(i + 741), ['#8a7e6c', '#6e665a', '#a29680', '#5a5248'][i % 4]); }
      P.ell(X + 9, Y + 24, 6, 1.5, 'rgba(0,0,0,.3)');
      F(4, 6, 3, 14, C.wall); F(4, 6, 8, 3, C.wall); F(5, 10, 1.5, 2, '#2a2420'); F(22, 12, 3, 12, shade(C.wall, -.1)); F(22, 12, 6, 2, shade(C.wall, -.1)); F(23, 16, 1.5, 2, '#2a2420');
      P.line(X + 12, Y + 18, X + 18, Y + 26, '#3a2a1a', .6); P.line(X + 14, Y + 16, X + 19, Y + 22, '#3a2a1a', .6);   // charred beams
      F(10, 22, 6, 2, '#2a2420');
      if (C.snow) for (let i = 0; i < 8; i++) F(R(i + 760) * 28, R(i + 780) * 28, 3, 1, '#f0f4f6');
      break; }
    case 'block': {
      F(0, 0, 32, 32, C.road2);
      const paris = G.theme === 'paris', berlin = G.theme === 'city';
      for (let k = 0; k < 2; k++) { const bx = 2 + k * 15, bw = 13, bh = 13 + R(k) * 6, by = 30 - bh;
        const wall = paris ? shade(C.wall, k ? -.04 : .02) : shade(C.wall, k ? -.1 : 0);
        P.R(X + bx + 1.5, Y + by + 1.5, bw, bh, 'rgba(0,0,0,.25)');
        F(bx, by, bw, bh, wall);
        if (paris) { P.poly([[X + bx - .5, Y + by + 3], [X + bx + 1.5, Y + by - 1], [X + bx + bw - 1.5, Y + by - 1], [X + bx + bw + .5, Y + by + 3]], C.roof); for (let i = 0; i < 3; i++) F(bx + 2 + i * 4, by - .5, 1.5, 1.5, '#e8e0cc'); }
        else F(bx, by - 1, bw, 1.5, C.roof);
        for (let yy = by + 4; yy < 28; yy += 3.5) for (let xx = bx + 1.5; xx < bx + bw - 1; xx += 3) { F(xx, yy, 1.6, 2, berlin && R(xx * 9 + yy) < .3 ? '#1a1410' : '#2a3038'); if (paris) F(xx - .2, yy + 2, 2, .4, '#3a3a3a'); }
        if (berlin && R(k + 5) < .5) { P.poly([[X + bx + bw - 6, Y + by - 1], [X + bx + bw, Y + by - 1], [X + bx + bw, Y + by + 5]], C.road2); }   // shell-torn rooflines
      }
      break; }
  }
  if (t === 'road' || TER[t].prop) {
    const conn = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => inside(x + dx, y + dy) && isRoadLike(N(dx, dy)) && !(TER[t].prop && TER[N(dx, dy)].prop));
    if (t === 'road') {
      const rc = C.road, rw = 12, o = (32 - rw) / 2;
      const seg = (a, b, w, h) => { F(a, b, w, h, rc); };
      F(o - .8, o - .8, rw + 1.6, rw + 1.6, shade(rc, -.2));
      if (conn[0]) F(0, o - .8, o, rw + 1.6, shade(rc, -.2)); if (conn[1]) F(o + rw, o - .8, o, rw + 1.6, shade(rc, -.2)); if (conn[2]) F(o - .8, 0, rw + 1.6, o, shade(rc, -.2)); if (conn[3]) F(o - .8, o + rw, rw + 1.6, o, shade(rc, -.2));
      seg(o, o, rw, rw);
      if (conn[0]) seg(0, o, o, rw); if (conn[1]) seg(o + rw, o, o, rw); if (conn[2]) seg(o, 0, rw, o); if (conn[3]) seg(o, o + rw, rw, o);
      if (!conn.some(Boolean)) seg(0, o, 32, rw);
      for (let i = 0; i < 14; i++) P.circ(X + o + R(i + 800) * rw, Y + o + R(i + 820) * rw, .3, C.road2);
      if (conn[0] || conn[1]) { F(conn[0] ? 0 : o, o + 3, (conn[0] ? o : 0) + rw + (conn[1] ? o : 0), .7, C.road2); F(conn[0] ? 0 : o, o + rw - 4, (conn[0] ? o : 0) + rw + (conn[1] ? o : 0), .7, C.road2); }
      if (conn[2] || conn[3]) { F(o + 3, conn[2] ? 0 : o, .7, (conn[2] ? o : 0) + rw + (conn[3] ? o : 0), C.road2); F(o + rw - 4, conn[2] ? 0 : o, .7, (conn[2] ? o : 0) + rw + (conn[3] ? o : 0), C.road2); }
      if (C.mud) for (let i = 0; i < 4; i++) P.ell(X + o + R(i + 840) * rw, Y + o + R(i + 850) * rw, 1.5, .6, '#4a3a26');
    }
  }
}
/* painterly texture over the whole terrain, so no two tiles look stamped */
function textureTerrain(c) {
  const g = c.getContext('2d'), W = c.width, H = c.height, img = g.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const n = (vnoise(x / 23, y / 23, 1) - .5) * .12 + (vnoise(x / 6, y / 6, 2) - .5) * .06, i = (y * W + x) * 4;
    d[i] *= 1 + n; d[i + 1] *= 1 + n; d[i + 2] *= 1 + n * .8;
  }
  g.putImageData(img, 0, 0);
}
/* properties are drawn live so their flags follow the owner */
const propCache = new Map();
function getPropSprite(type, owner, theme, wave = 0) {
  const nat = owner ? G.teams[owner].nat : null, key = type + (nat || '-') + theme + SET.flags + wave;
  let c = propCache.get(key); if (c) return c;
  c = mkCanvas(ART, ART + 8 * SC); const g = c.getContext('2d'), P = painter(g), C = PAL[theme] || PAL.normandy, Y = 8;
  const F = (a, b, w, h, col) => P.R(a, Y + b, w, h, col);
  const flag = (fx, fy, fw, fh) => { g.save(); g.scale(SC, SC); drawFlag(g, nat, fx, fy, fw, fh);
    if (wave) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(fx + fw * (.3 + wave * .2), fy, fw * .15, fh); } g.restore(); };
  const house = (a, b, w, h, roof, wall) => {
    P.R(a + 1.5, Y + b + h * .45 + 1.5, w, h * .55, 'rgba(0,0,0,.25)');
    F(a, b + h * .45, w, h * .55, wall); P.poly([[a - 1, Y + b + h * .45 + 1], [a + w / 2, Y + b], [a + w + 1, Y + b + h * .45 + 1]], roof);
    for (let i = 1; i < 5; i++) P.line(a + w / 2 - i * w / 10, Y + b + h * .45 * i / 5, a + w / 2 + i * w / 10, Y + b + h * .45 * i / 5, shade(roof, -.15), .2);   // slate courses
    for (let i = 0; i < w - 3; i += 4) { F(a + 2 + i, b + h * .6, 2, 2.4, '#2a2e36'); F(a + 2 + i, b + h * .6, 2, .5, '#8aa0b0'); F(a + 1.6 + i, b + h * .6 + 2.4, 2.8, .4, shade(wall, -.25)); }
    F(a + w / 2 - 1, b + h - 3, 2, 3, '#3a2a1a');
    for (let i = 0; i < 6; i++) P.circ(a + hrand(a, i) * w, Y + b + h * .5 + hrand(b, i) * h * .45, .3, shade(wall, -.12));   // stonework
    if (C.snow) P.poly([[a, Y + b + h * .45 - 1], [a + w / 2, Y + b + 1], [a + w, Y + b + h * .45 - 1]], '#f2f6f8');
  };
  const flagPole = (fx, fy, fw = 9, fh = 6) => { F(fx, fy, .7, 14, '#3a3a36'); P.circ(fx + .3, Y + fy - .4, .5, '#c8a040'); flag(fx + .7, Y + fy, fw, fh); };
  switch (type) {
    case 'city':
      if (theme === 'city' || theme === 'paris') { F(3, 6, 12, 22, C.wall); F(16, 2, 13, 26, shade(C.wall, -.1)); for (let yy = 8; yy < 26; yy += 4) { F(5, yy, 2, 2.4, '#2a2e36'); F(10, yy, 2, 2.4, '#2a2e36'); F(19, yy - 3, 2, 2.4, '#2a2e36'); F(24, yy - 3, 2, 2.4, '#2a2e36'); } F(3, 5, 12, 1.5, C.roof); F(16, 1, 13, 1.5, C.roof); }
      else { house(2, 10, 13, 18, C.roof, C.wall); house(15, 4, 14, 24, shade(C.roof, -.1), shade(C.wall, -.06)); F(23, -4, 3, 10, '#8a8274'); P.poly([[22, Y - 4], [24.5, Y - 10], [27, Y - 4]], C.roof); P.R(24, Y - 2, 1, 1.5, '#2a2e36'); }
      flagPole(2, -6); break;
    case 'hq':
      P.R(3.5, Y + 13.5, 28, 16, 'rgba(0,0,0,.25)');
      F(2, 12, 28, 16, C.wall); P.poly([[1, Y + 13], [5, Y + 6], [27, Y + 6], [31, Y + 13]], C.roof);
      F(13, 2, 6, 10, shade(C.wall, .05)); P.poly([[12, Y + 3], [16, Y - 4], [20, Y + 3]], C.roof);
      for (let i = 0; i < 6; i++) { F(4 + i * 4.3, 16, 2, 4, '#2a2e36'); F(4 + i * 4.3, 16, 2, .6, '#8aa0b0'); F(4 + i * 4.3, 22, 2, 3, '#2a2e36'); }
      F(14, 22, 4, 6, '#3a2a1a'); F(1, 27, 30, 1, '#6a665c'); for (let i = 0; i < 7; i++) F(3 + i * 4, 27.6, 2, 1, '#8a8678');
      F(9, 26, 2, 2, '#3a5a2a'); F(21, 26, 2, 2, '#3a5a2a');                                                  // topiary
      if (C.snow) P.poly([[2, Y + 12], [5, Y + 7], [27, Y + 7], [30, Y + 12]], '#f2f6f8');
      F(15, -12, .8, 16, '#3a3a36'); flag(15.8, Y - 12, 13, 8); break;
    case 'fact':
      P.R(3.5, Y + 13.5, 28, 16, 'rgba(0,0,0,.25)');
      F(2, 12, 28, 16, shade(C.wall, -.15));
      for (let i = 0; i < 4; i++) { P.poly([[2 + i * 7, Y + 12], [2 + i * 7, Y + 6], [9 + i * 7, Y + 12]], C.roof); F(2 + i * 7, 6, .6, 6, '#8aa0b0'); }
      F(10, 18, 10, 10, '#2a2a26'); for (let yy = 19; yy < 28; yy += 1.5) F(10, yy, 10, .5, '#3a3a34');
      for (let i = 0; i < 3; i++) { P.circ(25 + (i % 2) * 3, Y + 24 - (i >> 1) * 3, 1.5, '#5a5a3a'); P.circ(25 + (i % 2) * 3, Y + 23.6 - (i >> 1) * 3, .6, '#7a7a5a'); }
      F(3, 22, 5, 5, '#8a7650'); F(3, 22, 5, .6, '#a89060'); P.line(3, Y + 22, 8, Y + 27, '#6a5638', .3); P.line(8, Y + 22, 3, Y + 27, '#6a5638', .3);
      flagPole(26, -4); break;
    case 'air':
      F(0, 18, 32, 8, '#8a8a7e'); for (let i = 2; i < 32; i += 6) F(i, 21.5, 3, .8, '#e8e8e0');
      P.ell(12.5, Y + 14, 10, 6, 'rgba(0,0,0,.25)'); P.ell(12, Y + 13, 10, 6, '#7a7e74'); F(2, 13, 20, 5, '#7a7e74'); F(8, 13, 8, 5, '#1e1e1c');
      for (let i = 0; i < 5; i++) P.line(4 + i * 4, Y + 8 + Math.abs(2 - i), 4 + i * 4, Y + 13, '#6a6e64', .3);
      F(26, 2, .6, 12, '#3a3a36'); P.poly([[26.6, Y + 2], [31, Y + 3 + wave], [26.6, Y + 5]], '#e07030'); P.R(28, Y + 2.5 + wave * .5, .8, 2, '#f0f0ea');
      if (C.snow) F(4, 7, 16, 2, '#f2f6f8');
      flagPole(22, 4, 7, 5); break;
    case 'port':
      F(0, 20, 32, 12, C.sea); F(0, 14, 32, 6, '#7a766c'); F(0, 14, 32, 1, '#9a968c');
      F(20, 0, 2, 14, '#c8a040'); F(14, 0, 14, 2, '#c8a040'); F(16, 2, .5, 7, '#2a2a26'); F(15, 9, 3, 2, '#5a5a50');
      F(3, 9, 6, 5, '#8a5a3a'); F(9, 10, 5, 4, '#4a6a8a');
      flagPole(1, -2, 7, 5); break;
  }
  finish(c, {outline:'#1a1814', light:.5});
  propCache.set(key, c);
  return c;
}
let terrainCanvas = null;
function buildTerrain() {
  terrainCanvas = mkCanvas(G.W * ART, G.H * ART);
  const g = terrainCanvas.getContext('2d');
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) drawTile(g, x, y);
  g.globalAlpha = .14; g.fillStyle = '#000';                                                 // ambient occlusion under woods and hills
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (['forest', 'hill', 'cliff', 'block'].includes(terr(x, y)) && inside(x, y + 1) && !['forest', 'hill', 'cliff', 'block'].includes(terr(x, y + 1))) g.fillRect(x * ART, (y + 1) * ART, ART, 6);
  g.globalAlpha = 1;
  textureTerrain(terrainCanvas);
  for (const c of G.craters || []) stampCrater(c.x, c.y, c.s, c.r, true);
  for (const f of G.fallen || []) stampFallen(f.x, f.y, f.nat, f.n, true);
}
/* a shell crater stamped permanently into the terrain */
function stampCrater(px, py, s = 1, r = Math.random(), quiet) {
  if (!terrainCanvas) return;
  const g = terrainCanvas.getContext('2d'), rad = (7 + r * 6) * s;
  g.save(); g.globalAlpha = .55; g.fillStyle = '#3a2e22'; g.beginPath(); g.ellipse(px, py, rad * 1.25, rad * .8, 0, 0, 7); g.fill();
  g.globalAlpha = .7; g.fillStyle = '#211a14'; g.beginPath(); g.ellipse(px, py, rad * .65, rad * .4, 0, 0, 7); g.fill();
  g.globalAlpha = .4; g.fillStyle = '#8a7a5a'; g.beginPath(); g.ellipse(px - rad * .3, py - rad * .45, rad * .6, rad * .2, 0, 0, 7); g.fill();
  g.restore();
  if (!quiet && G) { G.craters = G.craters || []; G.craters.push({x:px, y:py, s, r}); if (G.craters.length > 220) G.craters.shift(); }
}

/* ---------- general portraits (96x96, painted on a 48 grid) ---------- */
const portraitCache = new Map();
/* ---------- faces ----------
   Every general gets his own face: its proportions, chin, eyes, brows, nose, mouth, ears and age are drawn from
   his name, so no two are alike, and the famous ones are tuned towards the real man (LIKENESS). */
const LIKENESS = {
  rommel:{w:1.04, h:.98, chin:'round', cleft:1, nose:4.4, noseW:1.05, mouthW:5.2, lips:.9, age:.45, browA:-.15, eye:1},
  patton:{w:.94, h:1.06, chin:'square', jaw:.96, nose:4.9, mouthW:4.8, lips:.45, age:.7, browA:-.35, eye:.9, iris:'#5a7a9a'},
  monty:{w:.84, h:1.08, chin:'pointed', nose:5.8, hook:.7, noseW:.8, eye:.82, age:.65, browA:.15, brow:.8, iris:'#5a7a9a', mouthW:4.4, lips:.45, ear:1.15},
  ike:{w:1.02, h:1.02, chin:'round', mouthW:6.6, lips:.9, age:.5, browA:.1, eye:.95, iris:'#4a6a8a'},
  zhukov:{w:1.14, h:.96, chin:'square', jaw:1, heavy:1, nose:4.2, noseW:1.35, browA:-.45, brow:1.3, age:.4, eye:.85},
  konev:{w:1.06, h:1.02, chin:'round', heavy:1, nose:4.4, noseW:1.2, browA:-.2, age:.45},
  chuikov:{w:1.08, h:1, chin:'square', nose:4.6, noseW:1.3, brow:1.4, browA:-.3, age:.4, mouthW:6},
  degaulle:{w:.84, h:1.16, nose:6.6, noseW:1.15, hook:.45, chin:'pointed', eye:.84, age:.35, mouthW:4.4, lips:.5, ear:1.2},
  guderian:{w:.9, h:1.05, chin:'square', nose:5.1, browA:-.2, age:.55, eye:.9},
  manstein:{w:.9, h:1.08, nose:5.9, hook:.85, chin:'pointed', age:.6, browA:-.25, eye:.88},
  model:{w:1, h:1, chin:'round', nose:4.6, age:.5, browA:-.35, brow:1.1},
  bradley:{w:.98, h:1.06, chin:'square', mouthW:6, ear:1.3, age:.5, nose:5},
  chiang:{w:.88, h:1.1, chin:'pointed', nose:4.4, age:.6, eye:.8, cheek:1},
  yamamoto:{w:1.06, h:1, chin:'round', nose:4.2, noseW:1.15, age:.6, eye:.8, browA:-.2},
  kuribayashi:{w:1.02, h:1.02, chin:'round', nose:4.4, age:.5, eye:.8},
  zervas:{w:1.12, h:1.02, nose:5.2, noseW:1.3, heavy:1, age:.5, browA:-.2, brow:1.4},
  darby:{w:.96, h:1.04, chin:'square', jaw:.95, nose:4.6, age:.25, mouthW:5.6},
  senger:{w:.88, h:1.1, chin:'pointed', nose:5.6, hook:.4, age:.55, eye:.86},
  bergonzoli:{w:1, h:1, nose:4.8, age:.6},
};
let FACE_AT = {};                                       // where the last face put its nose and mouth, for the moustache
function faceFeat(id, L, nat) {
  let h = 2166136261; for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const r = n => { let v = Math.imul(h ^ (n * 2654435761), 1597334677) >>> 0; v ^= v >>> 15; return (v >>> 0) / 4294967296; };
  const east = nat === 'jp' || nat === 'cn';
  return Object.assign({
    w:.9 + r(1) * .2, h:.95 + r(2) * .13, jaw:.74 + r(3) * .24, chin:['round', 'square', 'pointed'][r(4) * 3 | 0], cleft:r(5) < .15,
    eye:.86 + r(6) * .24, gap:.94 + r(7) * .14, eyeY:(r(8) - .5) * .8, iris:east ? '#2a2018' : ['#3a3028', '#5a4030', '#4a6a8a', '#4a6a5a', '#2a2420', '#5a7a9a'][r(9) * 6 | 0],
    brow:.75 + r(10) * .55, browA:(r(11) - .5) * .7, nose:3.9 + r(12) * 1.9, noseW:.85 + r(13) * .4, hook:(r(14) - .45) * .9,
    mouthW:4.6 + r(15) * 1.8, lips:.5 + r(16) * .5, ear:.9 + r(17) * .3, age:.25 + r(18) * .5, heavy:r(19) < .18, cheek:r(20) < .3, stubble:r(21) < .12,
  }, LIKENESS[id] || {}, L.feat || {});
}
function drawFace(P, id, L, nat) {
  const F = faceFeat(id, L, nat), skin = L.face, skinD = shade(skin, -.18), skinDD = shade(skin, -.3), skinL = shade(skin, .12), line = shade(skin, -.24);
  const fw = 9 * F.w, fh = 11 * F.h, cy = 22, top = cy - fh, chinY = cy + fh * (F.chin === 'pointed' ? 1.04 : .96);
  P.R(19.5, 28, 9, 7, skinD); P.R(19.5, 28, 9, 1.2, skinDD);                                           // neck, in the shadow of the jaw
  P.ell(24 - fw - .4, 23, 1.7 * F.ear, 2.8 * F.ear, skinD); P.ell(24 + fw + .4, 23, 1.7 * F.ear, 2.8 * F.ear, skinD);   // ears
  P.ell(24 - fw - .3, 23, .8 * F.ear, 1.6 * F.ear, skinDD); P.ell(24 + fw + .3, 23, .8 * F.ear, 1.6 * F.ear, skinDD);
  P.ell(24, cy - 1, fw, fh * .9, skin);                                                                   // cranium and cheeks
  const jw = fw * F.jaw;                                                                                  // the jaw: square, round or pointed
  if (F.chin === 'square') P.poly([[24 - fw, cy], [24 - jw, chinY - 3], [24 - jw * .55, chinY], [24 + jw * .55, chinY], [24 + jw, chinY - 3], [24 + fw, cy]], skin);
  else if (F.chin === 'pointed') P.poly([[24 - fw, cy - 1], [24 - jw * .8, chinY - 4], [24 - 1.6, chinY], [24 + 1.6, chinY], [24 + jw * .8, chinY - 4], [24 + fw, cy - 1]], skin);
  else P.ell(24, cy + 2, fw * .96, fh - 2 + (chinY - cy - fh + 2) * .5, skin);
  if (F.heavy) { P.ell(24 - jw * .72, chinY - 2.4, 2.4, 1.8, skin); P.ell(24 + jw * .72, chinY - 2.4, 2.4, 1.8, shade(skin, -.04)); P.R(21.5, chinY - .1, 5, .5, shade(skin, -.1)); }   // jowls
  P.ell(24 + fw * .48, cy + 3, fw * .4, fh * .5, shade(skin, -.04));                                     // the shadow side of the face
  P.ell(22 - fw * .15, cy - 3, fw * .55, fh * .45, skinL);                                              // the lit forehead and cheek
  if (F.cheek) { P.line(24 - fw * .78, cy + 1.6, 24 - fw * .4, cy + 3.4, skinD, .3); P.line(24 + fw * .78, cy + 1.6, 24 + fw * .4, cy + 3.4, skinD, .3); }   // high cheekbones
  P.R(24 - jw * .45, chinY - .6, jw * .9, .6, skinD);                                                     // under the chin
  if (F.cleft) P.line(24, chinY - 2.2, 24, chinY - .6, skinDD, .25);
  if (F.stubble) P.ell(24, (cy + chinY) / 2 + 1.5, jw * .8, (chinY - cy) * .42, 'rgba(60,50,40,.12)');   // a day's growth of beard
  // hair at the temples (the cap covers the rest)
  if (L.bald) { P.ell(24, top + 2.5, fw * .95, 4.5, skin); P.ell(21, top + 1.5, 3, 1.5, shade(skin, .3)); }
  else { const hs = shade(L.hair, -.1); P.R(24 - fw - .2, 15, 2.6, 6.4, L.hair); P.R(24 + fw - 2.4, 15, 2.6, 6.4, L.hair); P.R(24 - fw, 15, 1, 6, hs); if (F.age > .6) { P.R(24 - fw - .2, 18.5, 2.4, 2.6, shade(L.hair, .35)); P.R(24 + fw - 2.2, 18.5, 2.4, 2.6, shade(L.hair, .35)); }   // grey at the temples
    if (L.curly) for (let i = 0; i < 8; i++) P.circ(16 + i * 2.3, 11 + (i % 2), 1.6, L.hair); }
  // eyes
  const ey = 21.3 + F.eyeY, gx = 3.6 * F.gap, ew = 2 * F.eye, eh = 1.05 * F.eye;
  for (const s of [-1, 1]) {
    const ex = 24 + s * gx;
    P.ell(ex, ey + .4, ew + .5, eh + .6, shade(skin, -.1));                                               // the socket
    P.ell(ex, ey, ew, eh, '#f2eee4'); P.circ(ex + .3 * (s > 0 ? 1 : 1), ey, .85 * F.eye, F.iris); P.circ(ex + .3, ey, .4 * F.eye, '#14100c'); P.circ(ex, ey - .3, .22, '#ffffff');
    P.line(ex - ew, ey - eh * .5, ex + ew, ey - eh * .6, shade(skin, -.45), .35);                         // upper lid
    if (F.age > .4) { P.line(ex - ew * .6, ey + eh + .6, ex + ew * .7, ey + eh + .4, line, .2); }          // the bags of a long war
    if (F.age > .55) P.line(ex + s * (ew + .3), ey - .2, ex + s * (ew + 1.4), ey + .6, line, .2);       // crow's feet
    const by = ey - 2 - F.eyeY * .2, bt = .55 + F.brow * .5, inner = ex - s * ew * .9, outer = ex + s * ew * 1.2;   // brows: thick or thin, stern or mild
    P.line(inner, by + F.browA * -.7 + (F.browA < 0 ? .5 : 0), outer, by + F.browA * .5, shade(L.hair, -.25), bt);
  }
  if (F.age > .45) for (let i = 0; i < 2; i++) P.line(24 - fw * .5, top + 6.4 + i * 1.3, 24 + fw * .5, top + 6.2 + i * 1.3, line, .18);   // a lined forehead (often under the cap)
  // nose
  const nl = F.nose, nw = 1.15 * F.noseW, nt = ey + .6 + nl, hk = F.hook;
  P.poly([[24 + .2, ey + .4], [24 + .9 + hk * .6, ey + nl * .55], [24 + 1.1 + hk, nt - .4], [24 + .3, nt + .2], [24 + .1, ey + 1]], shade(skin, -.1));   // the shadow side of the nose
  P.line(24 - .3, ey + .8, 24 + .5 + hk, nt - 1, skinL, .3);                                              // the lit bridge
  P.ell(24 + .3, nt, nw * 1.05, .85, shade(skin, -.06)); P.ell(24 - nw * .55, nt + .35, .42, .3, skinDD); P.ell(24 + nw * .7, nt + .35, .42, .3, skinDD);   // tip and nostrils
  // mouth
  const my = Math.min(chinY - 2.6, nt + 2.6), mw = F.mouthW; FACE_AT = {nt, my, mw};
  P.line(24 - fw * .55, nt - .6, 24 - mw * .55, my + .2, line, .22); P.line(24 + fw * .55, nt - .6, 24 + mw * .55, my + .2, line, .22);   // nasolabial folds
  if (L.smile) { P.ell(24, my + .5, mw * .48, 1.05, '#5a2a24'); P.R(24 - mw * .38, my - .05, mw * .76, .7, '#f0ece0'); P.ell(24, my + 1.3, mw * .3, .3, '#8a4a40'); P.line(24 - mw * .5, my - .1, 24 - mw * .58, my - .7, line, .22); P.line(24 + mw * .5, my - .1, 24 + mw * .58, my - .7, line, .22); }   // the famous grin
  else { P.R(24 - mw / 2, my, mw, .55 + F.lips * .3, '#6e3e32'); P.R(24 - mw * .38, my + .7 + F.lips * .3, mw * .76, .35 + F.lips * .5, shade(skin, -.05)); P.R(24 - mw * .3, my + 1.3 + F.lips * .7, mw * .6, .3, skinD);
    if (F.browA < -.2) { P.px(24 - mw / 2 - .4, my + .5, line); P.px(24 + mw / 2, my + .5, line); } }      // the stern turn-down of the mouth
}
function getPortrait(id) {
  let c = portraitCache.get(id + SET.flags); if (c) return c;
  const co = CO[id], L = co.look, nat = natBase(co.nat);
  c = mkCanvas(192, 192); const g = c.getContext('2d'), P = painter(g, 4); g.save(); g.scale(2, 2);   // twice the old resolution: the face on the same 48-grid at 4 px a unit; the backdrop in 96-space
  const bgc = {ger:['#4a4c44', '#2e302a'], us:['#3c4a66', '#252e42'], uk:['#5a3a36', '#3a2624'], su:['#6a2a24', '#401a16'], fr:['#2e3e6a', '#1c2642'], pl:['#6a2a30', '#401a1c'], fr40:['#2e3e6a', '#1c2642'], be:['#4a4a2a', '#2a2a18'], jp:['#6a5a3a', '#3a301e'], cn:['#2a3a6a', '#18223e'], zed:['#3a4a32', '#141a10'], it:['#2e4a32', '#1a2c1c'], gr:['#2a4a7a', '#162a4a']}[nat] || ['#4a4a4a', '#2a2a2a'];
  const grd = g.createLinearGradient(0, 0, 0, 96); grd.addColorStop(0, bgc[0]); grd.addColorStop(1, bgc[1]); g.fillStyle = grd; g.fillRect(0, 0, 96, 96);
  g.save(); g.globalAlpha = .18; drawFlag(g, nat, 0, 0, 96, 64); g.restore();                                // faded national flag behind
  const vg = g.createRadialGradient(48, 44, 10, 48, 48, 70); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, 96, 96); g.restore();
  const skin = L.face, skinD = shade(skin, -.18), skinL = shade(skin, .12), tunic = L.tunic;
  P.poly([[2, 48], [5, 38], [14, 34], [34, 34], [43, 38], [46, 48]], tunic);
  P.R(18, 34, 12, 6, shade(tunic, -.1));
  P.line(10, 40, 12, 47, shade(tunic, -.15), .4); P.line(38, 40, 36, 47, shade(tunic, -.15), .4);       // tunic folds
  if (L.sweater) { P.poly([[10, 48], [14, 36], [34, 36], [38, 48]], '#7d7a5e'); P.R(18, 35, 12, 3, '#8a876a'); for (let x = 12; x < 36; x += 1.5) P.R(x, 40, .4, 8, 'rgba(0,0,0,.08)'); }
  if (TUNIC_EXTRA[L.navy ? 'navy' : nat]) TUNIC_EXTRA[L.navy ? 'navy' : nat](P, L, tunic, nat);
  else if (nat === 'ger') { P.poly([[15, 34], [20, 40], [24, 36]], tunic); P.poly([[33, 34], [28, 40], [24, 36]], tunic); P.R(15, 35, 5, 3, L.collar); P.R(28, 35, 5, 3, L.collar);
    for (const xx of [16, 18, 29, 31]) { P.circ(xx, 36, .5, '#e0c050'); P.circ(xx + .5, 37, .4, '#e0c050'); }       // Alt-Larisch embroidery
    P.R(23, 38, 3, 1, '#c8c8c8'); P.R(23, 39, 3, 5, '#141414'); P.R(21, 40, 7, 3, '#141414'); P.R(22, 41, 5, 1, '#e0e0e0'); P.R(24, 39, 1, 5, '#e0e0e0'); P.px(24, 41, '#141414');
    if (L.medal === 'pourlemerite') { P.poly([[24.5, 32.5], [26, 34], [24.5, 35.5], [23, 34]], '#2a5ab0'); P.circ(24.5, 34, .5, '#d8b040'); }
    for (let i = 0; i < 4; i++) P.circ(8 + i * .1, 40 + i * 2, .6, '#c8c8c0'); }                                  // buttons
  else if (nat === 'su') { P.R(17, 34, 14, 3, shade(tunic, -.06)); P.R(16, 35, 4, 2, '#c03030'); P.R(28, 35, 4, 2, '#c03030'); P.circ(17.5, 36, .5, '#e0c050'); P.circ(30.5, 36, .5, '#e0c050'); }
  else { P.poly([[19, 34], [24, 41], [29, 34]], '#c8b890'); P.R(23, 36, 2, 6, '#7a6a48'); P.poly([[15, 34], [23, 42], [19, 34]], shade(tunic, .05)); P.poly([[33, 34], [25, 42], [29, 34]], shade(tunic, .05)); }
  if (L.stars) for (let i = 0; i < L.stars; i++) { P.poly(starPts(8 + i * 2.2, 39, 1), '#e8e8e0'); P.poly(starPts(38 - i * 2.2, 39, 1), '#e8e8e0'); }
  if (L.medals) { for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) P.R(8 + i * 2, 40 + r * 2, 1.8, 1.4, ['#c03030', '#3060c0', '#e0c050', '#30a050'][(i + r) % 4]); P.poly(starPts(35, 40, 1.8), '#e0c050'); P.poly(starPts(39, 41, 1.8), '#e0c050'); P.R(34.5, 37, 1, 1.5, '#c03030'); P.R(38.5, 38, 1, 1.5, '#c03030'); }
  if (L.eagle) { P.R(6, 37, 5, 6, '#1a1a1a'); P.circ(8.5, 39.5, 1.6, '#f0f0f0'); P.circ(9, 39.2, .5, '#e0c050'); P.R(6, 36, 5, 1, '#e0c050'); }
  if (L.ranger) { P.poly([[8, 37], [10.5, 39.5], [8, 42], [5.5, 39.5]], '#e07a20'); P.R(6.8, 39.2, 2.4, .5, '#203a78'); }
  if (nat === 'uk' || nat === 'us' || nat === 'fr') { P.R(10, 41, 5, 1.5, '#c03030'); P.R(10, 42.5, 5, 1, '#3060c0'); P.R(10, 43.5, 5, .8, '#e0c050'); }
  if (nat === 'fr') { P.R(36, 40, 1, 4, '#c8202a'); P.R(35, 41, 3, .6, '#c8202a'); P.R(34.6, 42.3, 3.8, .6, '#c8202a'); }
  drawFace(P, id, L, nat);
  if (L.glasses) { P.ell(20.5, 21.3, 2.6, 2, 'rgba(200,220,230,.3)'); P.ell(27.5, 21.3, 2.6, 2, 'rgba(200,220,230,.3)'); P.R(17.8, 19.3, 12.4, .5, '#3a3530'); P.R(23, 21, 1.5, .4, '#3a3530'); }
  if (L.monocle) { P.circ(27.5, 21.3, 2.6, 'rgba(220,235,245,.3)'); P.ell(27.5, 21.3, 2.6, 2.6, 'rgba(255,255,255,.1)'); P.line(30, 23, 31, 30, '#c8c8c8', .25); }
  if (L.cap === 'peaked' || L.cap === 'soviet') {
    const crown = L.cap === 'soviet' ? '#7a7048' : (id === 'guderian' ? '#5a5c52' : '#7c7f72'), band = L.cap === 'soviet' ? '#b02a24' : '#2e3a2c';
    P.ell(24, 9, 14, 5, crown); P.R(13, 9, 22, 4, crown); P.ell(20, 7.5, 6, 2, shade(crown, .12)); P.R(14, 12, 20, 3, band);
    P.poly([[13, 15], [35, 15], [32, 18], [16, 18]], '#141414'); P.R(17, 15.4, 12, .6, '#4a4a4a');
    if (L.cap === 'soviet') { mark(P, 'redstar', 24, 13, .8); P.R(17, 15, 14, .7, '#c8a040'); }
    else { P.poly([[19, 8], [24, 5.5], [29, 8], [24, 9]], '#c8c8c0'); P.circ(24, 13, 1.5, '#e8e0d0'); P.circ(24, 13, .7, '#b02a24'); P.R(15, 14, 18, .6, '#d8c060'); P.R(15, 14.8, 18, .3, '#d8c060'); }
    if (L.goggles) { P.R(16, 10, 16, 2, '#6a5030'); P.circ(20, 10, 2.5, '#5a4a3a'); P.circ(28, 10, 2.5, '#5a4a3a'); P.circ(20, 10, 1.6, '#9ab8c0'); P.circ(28, 10, 1.6, '#9ab8c0'); P.circ(19.3, 9.3, .5, '#e8f4f8'); P.circ(27.3, 9.3, .5, '#e8f4f8'); }
  } else if (L.cap === 'beret') {
    P.ell(22, 11, 13, 5, '#1a1a1c'); P.ell(16, 12, 7, 4, '#1a1a1c'); P.R(14, 14, 20, 2, '#2a2a2c'); P.ell(24, 9, 6, 1.5, '#2a2a2e');
    if (L.badges >= 1) { P.R(27, 10, 3, 4, '#c8c8c0'); P.px(28, 9, '#c8c8c0'); }
    if (L.badges >= 2) { P.R(31, 11, 3, 3, '#d8b040'); P.circ(32.5, 12.5, .6, '#c03030'); }
  } else if (L.cap === 'helmet') {
    const hc = '#5a6236'; P.ell(24, 12, 13, 8, hc); P.R(10, 14, 28, 3, shade(hc, -.1)); P.R(11, 16, 26, 1, '#2a2e1c'); P.ell(19, 8, 5, 2.5, shade(hc, .12));
    if (id === 'patton') { P.ell(18, 7.5, 3, 1, '#c8d0a0'); }
    for (let i = 0; i < L.stars; i++) P.poly(starPts(24 - (L.stars - 1) * 3 + i * 6, 11, 2.2), '#f0f0e8');
    if (L.ranger) P.poly([[24, 8], [26.5, 10.5], [24, 13], [21.5, 10.5]], '#e07a20');
  } else if (L.cap === 'garrison') {
    P.poly([[15, 13], [19, 7], [31, 7], [34, 13]], '#7a6a48'); P.R(15, 12, 20, 2, '#6a5a3a');
    for (let i = 0; i < 4; i++) P.poly(starPts(17.5 + i * 2.3, 10, 1), '#e8e8e0');
    P.R(17, 14, 15, 2, L.hair);
  } else if (L.cap === 'kepi') {                        // Leclerc's képi, gold oak leaves of a général
    P.poly([[15, 15], [17, 5], [31, 5], [33, 15]], '#8a7a54'); P.R(15, 12, 18, 3, '#2a2a3a'); P.R(15, 11.5, 18, .6, '#d8b040'); P.R(15, 14.4, 18, .6, '#d8b040');
    for (let i = 0; i < 6; i++) P.ell(17.5 + i * 2.6, 13.2, .9, .5, '#d8b040');
    P.poly([[14, 15], [34, 15], [31, 18], [17, 18]], '#141414');
  } else if (CAP_EXTRA[L.cap]) CAP_EXTRA[L.cap](P, L, id);
  if (!CAP_EXTRA[L.cap] && typeof faceExtras === 'function') faceExtras(P, L);     // moustaches under the built-in caps too
  if (L.cane) { P.line(40, 30, 44, 48, '#5a3a20', .8); P.ell(40, 30, 1.5, 1, '#5a3a20'); }
  finish(c, {outline:null, light:.25});
  portraitCache.set(id + SET.flags, c);
  return c;
}
