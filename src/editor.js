/* ============================== MAP BUILDER ===============================
   A sandbox editor: paint terrain, properties and units with the game's own
   tile renderer, mirror for fair maps, undo/redo, save to the browser, share
   as a code, then play it as a battle or as a Last Stand. */
const ED = {map:null, tool:'paint', brush:'.', size:1, side:1, role:null, zoom:.5, ox:0, oy:0, undo:[], redo:[], mirror:false, drag:null, hover:null, rect:null, dirty:false};
const ED_KEY = 'if44maps';
const ED_TERRAIN = ['.', ',', '=', 'T', 'h', '^', 'l', 'L', 'J', 'y', 'v', 'r', 'b', '~', 's', 'R', 'n', 'u', 'x', 'U', 'B', 'z', 'w', 'm', 'O'];
const ED_PROPS = [['c', 'k', 'C', 'Town'], ['f', 'g', 'F', 'Depot'], ['a', 'e', 'A', 'Airfield'], ['p', 'o', 'P', 'Port'], [null, 'q', 'Q', 'HQ']];
const edEl = id => document.getElementById(id);

function edBlank(W = 30, H = 20, theme = 'normandy') {
  return {name:'New map', W, H, theme, rows:Array.from({length:H}, () => Array(W).fill('.')), units:[],
    p1:{nat:'us', co:'patton'}, p2:{nat:'ger', co:'rommel'}, obj:'hq', days:10};
}
function edRows(m) { return m.rows.map(r => r.join('')); }
/* a scratch game holding the map, so the editor can use the game's tile renderer */
function edGame() {
  const m = ED.map;
  newGame({map:edRows(m), theme:m.theme, teams:{1:{nat:m.p1.nat, co:m.p1.co}, 2:{nat:m.p2.nat, co:m.p2.co}}, units:{1:'', 2:''}});
  buildTerrain();
}
/* an undo step keeps the size and theme too, so undoing a resize cannot leave rows of one size in a map of another */
const edState = () => JSON.stringify({rows:ED.map.rows, units:ED.map.units, W:ED.map.W, H:ED.map.H, theme:ED.map.theme});
function edSnapshot() { ED.undo.push(edState()); if (ED.undo.length > 60) ED.undo.shift(); ED.redo = []; ED.dirty = true; }
function edRestore(s) { const o = JSON.parse(s), m = ED.map, resized = o.W && (o.W !== m.W || o.H !== m.H);
  m.rows = o.rows; m.units = o.units; if (o.W) { m.W = o.W; m.H = o.H; } if (o.theme) m.theme = o.theme; edGame(); if (resized) edFit(); edRender(); }
function edUndo() { if (!ED.undo.length) return; ED.redo.push(edState()); edRestore(ED.undo.pop()); }
function edRedo() { if (!ED.redo.length) return; ED.undo.push(edState()); edRestore(ED.redo.pop()); }

/* ---------- editing ---------- */
const MIRROR_CH = {C:'k', k:'C', F:'g', g:'F', A:'e', e:'A', P:'o', o:'P', Q:'q', q:'Q'};
function edSetTile(x, y, ch, redraw = true) {
  const m = ED.map; if (x < 0 || y < 0 || x >= m.W || y >= m.H || !MAPCH[ch]) return;
  const one = (a, b, c) => {
    if (c === 'Q' || c === 'q') for (let yy = 0; yy < m.H; yy++) for (let xx = 0; xx < m.W; xx++) if (m.rows[yy][xx] === c && (xx !== a || yy !== b)) { m.rows[yy][xx] = '.'; edSyncTile(xx, yy, redraw); }   // one HQ per side
    m.rows[b][a] = c; edSyncTile(a, b, redraw);
  };
  one(x, y, ch);
  if (ED.mirror) one(m.W - 1 - x, m.H - 1 - y, MIRROR_CH[ch] || ch);
}
function edSyncTile(x, y, redraw) {
  const ch = ED.map.rows[y][x], d = MAPCH[ch], k = K(x, y);
  G.ter[y * G.W + x] = d[0];
  if (TER[d[0]].prop) G.props[k] = {x, y, owner:d[1] || 0, cap:20}; else delete G.props[k];
  if (redraw) { const g = terrainCanvas.getContext('2d'); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inside(x + dx, y + dy)) drawTile(g, x + dx, y + dy); }
}
function edBrushTiles(x, y) { const r = ED.size - 1, out = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dy) <= r) out.push([x + dx, y + dy]); return out; }
function edFill(x, y, ch) {
  const m = ED.map, from = m.rows[y][x]; if (from === ch) return;
  const q = [[x, y]], seen = new Set();
  while (q.length) { const [a, b] = q.pop(), k = b * m.W + a; if (seen.has(k) || a < 0 || b < 0 || a >= m.W || b >= m.H || m.rows[b][a] !== from) continue; seen.add(k); m.rows[b][a] = ch; if (ED.mirror) m.rows[m.H - 1 - b][m.W - 1 - a] = MIRROR_CH[ch] || ch; q.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]); }
  edGame();
}
function edPlaceUnit(x, y) {
  const m = ED.map; if (x < 0 || y < 0 || x >= m.W || y >= m.H) return;
  const place = (a, b, team) => {
    m.units = m.units.filter(u => u.x !== a || u.y !== b);
    if (ED.role) { const nat = team === 1 ? m.p1.nat : m.p2.nat, d = udef(nat, ED.role); if (d && (d.fixed ? !['sea', 'river'].includes(terr(a, b)) : moveCost(d, a, b))) m.units.push(Object.assign({team, role:ED.role, x:a, y:b}, ED.arrive > 1 ? {day:ED.arrive} : {})); }
  };
  place(x, y, ED.side);
  if (ED.mirror) place(m.W - 1 - x, m.H - 1 - y, 3 - ED.side);
}
function edApply(x, y, first) {
  if (ED.tool === 'units' || ED.tool === 'erase') { if (first) edSnapshot(); if (ED.tool === 'erase') { const r = ED.role; ED.role = null; edPlaceUnit(x, y); ED.role = r; } else edPlaceUnit(x, y); return; }
  if (ED.tool === 'fill') { if (first) { edSnapshot(); edFill(x, y, ED.brush); } return; }
  if (ED.tool === 'pick') { const ch = ED.map.rows[y] && ED.map.rows[y][x]; if (ch) { ED.brush = ch; ED.tool = 'paint'; edPalette(); } return; }
  if (first) edSnapshot();
  for (const [a, b] of edBrushTiles(x, y)) edSetTile(a, b, ED.brush);
}
function edRect([x0, y0], [x1, y1]) {
  edSnapshot();
  for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) edSetTile(x, y, ED.brush, false);
  edGame();
}
function edResize(W, H) {
  edSnapshot(); const m = ED.map;
  m.rows = Array.from({length:H}, (_, y) => Array.from({length:W}, (_, x) => (m.rows[y] && m.rows[y][x]) || '.'));
  m.units = m.units.filter(u => u.x < W && u.y < H); m.W = W; m.H = H; edGame(); edFit();
}
function edGenerate(theme) { edSnapshot(); const m = ED.map; m.theme = theme; m.rows = genMap(theme, m.W, m.H, Date.now() % 1e9).map(r => r.split('')); m.units = []; edGame(); }
function edMirrorAll() {                       // make the whole map point-symmetric from the left half
  edSnapshot(); const m = ED.map;
  for (let y = 0; y < m.H; y++) for (let x = 0; x < m.W; x++) if (x < m.W / 2) m.rows[m.H - 1 - y][m.W - 1 - x] = MIRROR_CH[m.rows[y][x]] || m.rows[y][x];
  m.units = m.units.filter(u => u.x < m.W / 2).flatMap(u => [u, {team:3 - u.team, role:u.role, x:m.W - 1 - u.x, y:m.H - 1 - u.y}]);
  edGame();
}

/* remix a campaign battle: its terrain, armies and starting forces */
function edFromMission(ms) {
  newGame(missionCfg(ms));
  const units = G.units.filter(u => !u.d.fixed || true).map(u => ({team:u.team, role:u.role, x:u.x, y:u.y}));
  ED.map = Object.assign(edBlank(), {name:ms.name + ' (remix)', W:G.W, H:G.H, theme:ms.theme, rows:missionMap(ms).map(r => r.split('')), units,
    p1:{nat:ms.p1.nat, co:ms.p1.co}, p2:{nat:ms.p2.nat, co:ms.p2.co}, obj:ms.objective.win === 'survive' ? 'survive' : ms.objective.win === 'hq' ? 'hq' : 'rout', days:ms.objective.days || 10});
  ED.dirty = false; ED.loaded = null; edGame(); edFit(); edPalette();
}
/* ---------- drawing ---------- */
const edCv = () => edEl('edcv');
function edFit() { const c = edCv(), m = ED.map; ED.zoom = Math.min(c.width / (m.W * ART), c.height / (m.H * ART)) * .95; ED.ox = (c.width - m.W * ART * ED.zoom) / 2; ED.oy = (c.height - m.H * ART * ED.zoom) / 2; }
function edToTile(cx, cy) { const c = edCv(), r = c.getBoundingClientRect(), px = (cx - r.left) * c.width / r.width, py = (cy - r.top) * c.height / r.height; return [Math.floor((px - ED.ox) / (ART * ED.zoom)), Math.floor((py - ED.oy) / (ART * ED.zoom))]; }
function edRender() {
  const c = edCv(); if (!c || !G || !terrainCanvas) return; const g = c.getContext('2d'), m = ED.map, z = ED.zoom;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#16170f'; g.fillRect(0, 0, c.width, c.height);
  g.setTransform(z, 0, 0, z, ED.ox, ED.oy); g.imageSmoothingEnabled = z < 1;
  g.drawImage(terrainCanvas, 0, 0);
  for (const p of Object.values(G.props)) g.drawImage(getPropSprite(terr(p.x, p.y), p.owner, m.theme, 0), p.x * ART, p.y * ART - 8 * SC);
  g.imageSmoothingEnabled = false;
  for (const u of m.units) { const nat = u.team === 1 ? m.p1.nat : m.p2.nat, img = getSprite(nat, u.role, 0);
    g.save(); if (u.day > 1) g.globalAlpha = .55; if (u.team === 2) { g.translate((u.x + 1) * ART, u.y * ART); g.scale(-1, 1); g.drawImage(img, 0, 0); } else g.drawImage(img, u.x * ART, u.y * ART); g.restore();
    g.fillStyle = NATION[nat].col.team; g.fillRect(u.x * ART + 2, u.y * ART + ART - 9, 8, 8);
    if (u.day > 1) { g.fillStyle = '#111c'; g.fillRect(u.x * ART + ART - 26, u.y * ART + 2, 24, 16); g.fillStyle = '#f0d060'; g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText('T' + u.day, u.x * ART + ART - 14, u.y * ART + 14); } }   // reinforcements, with their arrival turn
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1 / z;
  if (z > .35) { g.beginPath(); for (let x = 0; x <= m.W; x++) { g.moveTo(x * ART, 0); g.lineTo(x * ART, m.H * ART); } for (let y = 0; y <= m.H; y++) { g.moveTo(0, y * ART); g.lineTo(m.W * ART, y * ART); } g.stroke(); }
  if (ED.mirror) { g.strokeStyle = 'rgba(240,200,80,.5)'; g.lineWidth = 3 / z; g.setLineDash([12 / z, 8 / z]); g.beginPath(); g.moveTo(m.W * ART / 2, 0); g.lineTo(m.W * ART / 2, m.H * ART); g.stroke(); g.setLineDash([]); }
  const h = ED.hover;
  if (h) { g.strokeStyle = '#f0d060'; g.lineWidth = 3 / z;
    if (ED.rect) { const [a, b] = ED.rect, x0 = Math.min(a[0], h[0]), y0 = Math.min(a[1], h[1]); g.strokeRect(x0 * ART, y0 * ART, (Math.abs(a[0] - h[0]) + 1) * ART, (Math.abs(a[1] - h[1]) + 1) * ART); }
    else for (const [x, y] of (ED.tool === 'paint' ? edBrushTiles(h[0], h[1]) : [h])) g.strokeRect(x * ART, y * ART, ART, ART); }
  const info = edEl('edinfo');
  if (info && h && h[0] >= 0 && h[1] >= 0 && h[0] < m.W && h[1] < m.H) { const t = terr(h[0], h[1]), u = m.units.find(o => o.x === h[0] && o.y === h[1]); info.textContent = `${h[0]},${h[1]} · ${TER[t].n}${u ? ' · ' + udef(u.team === 1 ? m.p1.nat : m.p2.nat, u.role).n + ' (side ' + u.team + ')' : ''}`; }
}

/* ---------- palette and panels ---------- */
function edSwatch(ch) { const d = MAPCH[ch], t = TER[d[0]], C = PAL[ED.map.theme] || PAL.normandy;
  const col = {plain:C.grass, road:C.road, forest:C.tree, bocage:C.hedge, hill:C.hill, river:C.water, bridge:'#7a6a52', sea:C.sea, beach:C.sand, bunker:'#8e8c84', ruins:'#7e7464', city:C.wall, hq:'#f0d060', fact:'#a08860', air:'#9a9a8e', port:'#7a766c', obst:'#5a5246', shingle:'#9a948a', wire:'#6a6a5a', mines:'#8a5a3a', cliff:'#7a7262', trench:'#6a5a3a', marsh:'#5a7a6a', field:C.wheat, block:'#8a8478'}[d[0]] || t.mm || '#555';
  return col; }
function edPalette() {
  const m = ED.map, el = edEl('edpal'); el.innerHTML = '';
  const tabs = [['paint', 'Terrain'], ['units', 'Units'], ['tools', 'Map']];
  const tabBar = document.createElement('div'); tabBar.className = 'edtabs';
  const panel = ED.tool === 'units' || ED.tool === 'erase' ? 'units' : ED.panel || 'paint';
  for (const [k, n] of tabs) { const b = document.createElement('button'); b.textContent = n; b.className = panel === k ? 'on' : ''; b.onclick = () => { ED.panel = k; if (k === 'units') ED.tool = 'units'; else if (ED.tool === 'units' || ED.tool === 'erase') ED.tool = 'paint'; edPalette(); }; tabBar.append(b); }
  el.append(tabBar);
  const sec = (title) => { const h = document.createElement('h4'); h.textContent = title; el.append(h); const d = document.createElement('div'); d.className = 'edgrid'; el.append(d); return d; };
  if (panel === 'paint') {
    const tools = sec('Tool');
    for (const [k, n] of [['paint', 'Brush'], ['rect', 'Rectangle'], ['fill', 'Fill'], ['pick', 'Eyedropper']]) { const b = document.createElement('button'); b.textContent = n; b.className = 'edtool' + (ED.tool === k ? ' on' : ''); b.onclick = () => { ED.tool = k; edPalette(); }; tools.append(b); }
    for (const s of [1, 2, 3]) { const b = document.createElement('button'); b.textContent = `Size ${s}`; b.className = 'edtool' + (ED.size === s ? ' on' : ''); b.onclick = () => { ED.size = s; edPalette(); }; tools.append(b); }
    const ter = sec('Terrain');
    for (const ch of ED_TERRAIN) { const b = document.createElement('button'), d = MAPCH[ch]; b.className = 'edsw' + (ED.brush === ch ? ' on' : ''); b.title = TER[d[0]].n + (TER[d[0]].info ? ': ' + TER[d[0]].info : '');
      b.innerHTML = `<i style="background:${edSwatch(ch)}"></i><span>${TER[d[0]].n}</span>`; b.onclick = () => { ED.brush = ch; if (!['paint', 'rect', 'fill'].includes(ED.tool)) ED.tool = 'paint'; edPalette(); }; ter.append(b); }
    const pr = sec('Properties: neutral · side 1 · side 2');
    for (const [n0, n2, n1, name] of ED_PROPS) for (const [ch, who] of [[n0, 'neutral'], [n1, 'side 1'], [n2, 'side 2']]) { if (!ch) continue;
      const b = document.createElement('button'); b.className = 'edsw' + (ED.brush === ch ? ' on' : ''); const col = who === 'side 1' ? NATION[m.p1.nat].col.team : who === 'side 2' ? NATION[m.p2.nat].col.team : '#c8c4b0';
      b.innerHTML = `<i style="background:${edSwatch(ch)};box-shadow:inset 0 -5px 0 ${col}"></i><span>${name} (${who})</span>`; b.onclick = () => { ED.brush = ch; if (!['paint', 'rect', 'fill'].includes(ED.tool)) ED.tool = 'paint'; edPalette(); }; pr.append(b); }
  } else if (panel === 'units') {
    const sides = sec('Side');
    for (const s of [1, 2]) { const b = document.createElement('button'); b.className = 'edtool' + (ED.side === s ? ' on' : ''); b.append(flagCanvas(s === 1 ? m.p1.nat : m.p2.nat, 24, 16), document.createTextNode(` Side ${s}`)); b.onclick = () => { ED.side = s; edPalette(); }; sides.append(b); }
    const arr = document.createElement('label'); arr.className = 'edarr'; arr.innerHTML = `Arrives on turn <input type="number" min="1" max="40" value="${ED.arrive || 1}"> <small>(1 = on the map at the start)</small>`; arr.querySelector('input').onchange = e => { ED.arrive = clamp(+e.target.value || 1, 1, 40); }; sides.append(arr);
    const er = document.createElement('button'); er.className = 'edtool' + (ED.tool === 'erase' ? ' on' : ''); er.textContent = 'Remove units'; er.onclick = () => { ED.tool = 'erase'; edPalette(); }; sides.append(er);
    const nat = ED.side === 1 ? m.p1.nat : m.p2.nat, us = sec(`${NATION[nat].n}: click the map to place`);
    for (const r of ROLE_ORDER) { const d = udef(nat, r); if (!d) continue; const b = document.createElement('button'); b.className = 'edunit' + (ED.role === r && ED.tool === 'units' ? ' on' : ''); b.title = `${d.n}: ${d.w}`;
      b.append(spriteCanvas(nat, r, .6)); const s = document.createElement('span'); s.textContent = d.n; b.append(s); b.onclick = () => { ED.role = r; ED.tool = 'units'; edPalette(); }; us.append(b); }
    const cnt = document.createElement('p'); cnt.className = 'dim'; cnt.textContent = `Side 1: ${m.units.filter(u => u.team === 1).length} units · side 2: ${m.units.filter(u => u.team === 2).length} units`; el.append(cnt);
  } else {
    const box = document.createElement('div'); box.className = 'edform';
    const opt = (list, val) => list.map(([v, n]) => `<option value="${v}"${v === val ? ' selected' : ''}>${n}</option>`).join('');
    const nats = Object.entries(NATION).map(([k, n]) => [k, `${n.n} (${n.short})`]);
    box.innerHTML = `<label>Name <input id="edname" value="${m.name.replace(/"/g, '&quot;')}"></label>
      <label>Width <input id="edw" type="number" min="12" max="64" value="${m.W}"></label><label>Height <input id="edh" type="number" min="10" max="48" value="${m.H}"></label>
      <label>Look <select id="edtheme">${opt(Object.keys(PAL).map(k => [k, k[0].toUpperCase() + k.slice(1)]), m.theme)}</select></label>
      <label>Side 1 army <select id="edn1">${opt(nats, m.p1.nat)}</select></label><label>Side 1 general <select id="edc1">${opt((CO_BY_NAT[m.p1.nat] || Object.keys(CO)).map(c => [c, CO[c].n]), m.p1.co)}</select></label>
      <label>Side 2 army <select id="edn2">${opt(nats, m.p2.nat)}</select></label><label>Side 2 general <select id="edc2">${opt((CO_BY_NAT[m.p2.nat] || Object.keys(CO)).map(c => [c, CO[c].n]), m.p2.co)}</select></label>
      <label>Objective <select id="edobj">${opt([['hq', 'Capture the enemy HQ'], ['rout', 'Destroy the enemy'], ['survive', 'Side 1 holds out']], m.obj)}</select></label>
      <label>Turns to hold <input id="eddays" type="number" min="3" max="40" value="${m.days || 10}"></label>
      <label>Turn limit for the HQ attack (0 = none) <input id="edlimit" type="number" min="0" max="60" value="${m.limit || 0}"></label>
      <label>Weather <select id="edwx">${opt([['', 'As the season'], ['clear', 'Clear'], ['overcast', 'Overcast'], ['rain', 'Rain'], ['snow', 'Snow'], ['fog', 'Fog'], ['smoke', 'Battle smoke']], m.weather || '')}</select></label>
      <label>H-Hour <select id="edhour">${opt([['5', '05:00 dawn'], ['8', '08:00'], ['12', '12:00'], ['17', '17:00'], ['21', '21:00 dusk'], ['0', '00:00 night']], String(m.hour ?? 8))}</select></label>
      <label>Starting funds <select id="edfunds">${opt([['0', '0'], ['3000', '3,000'], ['5000', '5,000'], ['10000', '10,000'], ['20000', '20,000']], String(m.funds ?? 5000))}</select></label>
      <label class="ck"><input type="checkbox" id="edfog"${m.fog ? ' checked' : ''}> Fog of war</label>
      <label class="ck"><input type="checkbox" id="edmir"${ED.mirror ? ' checked' : ''}> Mirror while painting (fair two-player maps)</label>
      <label>Start from a campaign battle <select id="edfrom"><option value="">Choose a battle…</option>${Object.values(MISSIONS).map(x => `<option value="${x.id}">${x.name} (${x.date.split(',')[0]})</option>`).join('')}</select></label>
      <div class="edrow"><button id="edgen">Random terrain</button><button id="edmall">Mirror left half</button><button id="edclear">Clear units</button></div>`;
    el.append(box);
    const on = (id, ev, f) => edEl(id).addEventListener(ev, f);
    on('edname', 'input', e => { m.name = e.target.value.slice(0, 40); ED.dirty = true; });
    on('edw', 'change', e => edResize(clamp(+e.target.value || 30, 12, 64), m.H)); on('edh', 'change', e => edResize(m.W, clamp(+e.target.value || 20, 10, 48)));
    on('edtheme', 'change', e => { m.theme = e.target.value; edGame(); });
    on('edn1', 'change', e => { m.p1.nat = e.target.value; m.p1.co = (CO_BY_NAT[m.p1.nat] || [m.p1.co])[0]; m.units = m.units.filter(u => u.team !== 1 || udef(m.p1.nat, u.role)); edGame(); edPalette(); });
    on('edn2', 'change', e => { m.p2.nat = e.target.value; m.p2.co = (CO_BY_NAT[m.p2.nat] || [m.p2.co])[0]; m.units = m.units.filter(u => u.team !== 2 || udef(m.p2.nat, u.role)); edGame(); edPalette(); });
    on('edc1', 'change', e => { m.p1.co = e.target.value; }); on('edc2', 'change', e => { m.p2.co = e.target.value; });
    on('edobj', 'change', e => { m.obj = e.target.value; }); on('edlimit', 'change', e => { m.limit = clamp(+e.target.value || 0, 0, 60); }); on('edwx', 'change', e => { m.weather = e.target.value; }); on('edhour', 'change', e => { m.hour = +e.target.value; }); on('edfunds', 'change', e => { m.funds = +e.target.value; }); on('edfog', 'change', e => { m.fog = e.target.checked; }); on('eddays', 'change', e => { m.days = clamp(+e.target.value || 10, 3, 40); });
    on('edmir', 'change', e => { ED.mirror = e.target.checked; });
    on('edfrom', 'change', e => { const ms = MISSIONS[e.target.value]; if (!ms) return; if (ED.dirty && !confirm('Replace the map you are building with this battle? Unsaved changes will be lost (Undo can bring them back).')) { e.target.value = ''; return; } edSnapshot(); edFromMission(ms); });
    on('edgen', 'click', () => edGenerate(m.theme in THEMES ? m.theme : 'normandy')); on('edmall', 'click', edMirrorAll); on('edclear', 'click', () => { edSnapshot(); m.units = []; });
  }
}

/* ---------- saving, sharing and checking ---------- */
function edSaved() { try { return JSON.parse(localStorage.getItem(ED_KEY) || '{}'); } catch (e) { return {}; } }
function edSave() { const all = edSaved(), m = ED.map;
  if (all[m.name] && ED.loaded !== m.name && !confirm(`A saved map called "${m.name}" already exists. Replace it?`)) return;   // a remix or an import named like an old map must not wipe it silently
  all[m.name] = Object.assign({}, m, {rows:edRows(m), saved:Date.now()}); try { localStorage.setItem(ED_KEY, JSON.stringify(all)); ED.dirty = false; const p = loadProg(); stat(p).maps++; award(p, 'mapper'); saveProg(p); ED.loaded = m.name; edFillLoad(); edToast(`Saved "${m.name}"`); } catch (e) { edToast('Could not save: browser storage is full or blocked'); } }
function edLoad(name) { const s = edSaved()[name]; if (!s) return; if (ED.dirty && !confirm('Discard the unsaved changes to this map?')) return; try { ED.map = edSanitize({n:s.name, W:s.W, H:s.H, t:s.theme, r:s.rows, u:(s.units || []).map(u => [u.team, u.role, u.x, u.y, u.day || 1]), p1:s.p1, p2:s.p2, o:s.obj, d:s.days, l:s.limit, wx:s.weather, hr:s.hour, f:s.funds, fog:s.fog}); } catch (e) { edToast('That saved map is damaged: ' + e.message); return; } ED.undo = []; ED.redo = []; ED.dirty = false; ED.loaded = name; edGame(); edFit(); edPalette(); }
/* the saved-maps list, and renaming or deleting a saved map */
function edFillLoad() { const sel = edEl('edload'); if (!sel) return; sel.innerHTML = '<option value="">Load a saved map…</option>' + Object.keys(edSaved()).map(n => `<option>${n.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</option>`).join(''); }
function edWriteSaved(all) { try { localStorage.setItem(ED_KEY, JSON.stringify(all)); return true; } catch (e) { edToast('Could not save: browser storage is full or blocked'); return false; } }
function edManage() {
  const all = edSaved(), names = Object.keys(all); if (!names.length) return edToast('No saved maps yet.');
  const box = $('#codebox'), ta = box.querySelector('#codetext'); box.hidden = false; box.querySelector('h3').textContent = 'Saved maps';
  box.querySelector('p').textContent = 'Rename or delete the maps saved in this browser.';
  let list = box.querySelector('.edlist'); if (!list) { list = document.createElement('div'); list.className = 'edlist'; ta.after(list); }
  const closeBox = () => { box.hidden = true; ta.hidden = false; list.hidden = true; };
  ta.hidden = true; list.hidden = false; list.innerHTML = '';
  for (const n of names) {
    const row = document.createElement('div'), lab = document.createElement('span'), ren = document.createElement('button'), rm = document.createElement('button');
    row.className = 'edrow'; lab.textContent = n + (all[n].saved ? ' · ' + new Date(all[n].saved).toLocaleDateString() : '');
    ren.textContent = 'Rename'; ren.onclick = () => { const to = (prompt('New name for this map:', n) || '').replace(/[<>"'&`]/g, '').slice(0, 40).trim(); if (!to || to === n) return;
      const a = edSaved(); if (a[to] && !confirm(`A map called "${to}" already exists. Replace it?`)) return; a[to] = Object.assign(a[n], {name:to}); delete a[n];
      if (edWriteSaved(a)) { if (ED.loaded === n) { ED.loaded = to; ED.map.name = to; } edFillLoad(); edManage(); } };
    rm.textContent = 'Delete'; rm.onclick = () => { if (!confirm(`Delete "${n}" for good?`)) return; const a = edSaved(); delete a[n];
      if (edWriteSaved(a)) { if (ED.loaded === n) ED.loaded = null; edFillLoad(); if (Object.keys(a).length) edManage(); else closeBox(); } };
    row.append(lab, ren, rm); list.append(row);
  }
  box.querySelector('small').textContent = ''; box.querySelector('.cancel').textContent = 'Close'; box.querySelector('.ok').textContent = 'Done';
  box.querySelector('.cancel').onclick = box.querySelector('.ok').onclick = closeBox;
}
function edToast(t) { const el = edEl('edtoast'); el.textContent = t; el.hidden = false; clearTimeout(edToast.t); edToast.t = setTimeout(() => el.hidden = true, 2600); }
async function edExport() {
  const m = ED.map, json = JSON.stringify({n:m.name, W:m.W, H:m.H, t:m.theme, r:edRows(m), u:m.units.map(u => [u.team, u.role, u.x, u.y, u.day || 1]), p1:m.p1, p2:m.p2, o:m.obj, d:m.days, l:m.limit, wx:m.weather, hr:m.hour, f:m.funds, fog:m.fog});
  let code;
  try { const s = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw')); const b = new Uint8Array(await new Response(s).arrayBuffer()); code = 'BZM1' + btoa(String.fromCharCode(...b)); }
  catch (e) { code = 'BZM0' + btoa(unescape(encodeURIComponent(json))); }
  return code;
}
/* a shared map code comes from a stranger: check every field and keep only what makes sense */
function edSanitize(o) {
  if (!o || typeof o !== 'object') throw new Error('map code is damaged');
  const W = o.W | 0, H = o.H | 0, num = (v, lo, hi, d) => Number.isFinite(+v) ? clamp(Math.round(+v), lo, hi) : d;
  if (W < 12 || H < 10 || W > 64 || H > 48) throw new Error('map size out of range');
  if (!Array.isArray(o.r) || o.r.length !== H || !o.r.every(r => typeof r === 'string' && r.length === W && [...r].every(c => MAPCH[c]))) throw new Error('map code is damaged');
  const side = (s, d) => { const nat = s && NATION[s.nat] ? s.nat : d.nat, co = s && CO[s.co] && CO[s.co].nat === nat ? s.co : (CO_BY_NAT[nat] || [d.co])[0]; return {nat, co}; };
  const p1 = side(o.p1, {nat:'us', co:'patton'}), p2 = side(o.p2, {nat:'ger', co:'rommel'});
  const units = (Array.isArray(o.u) ? o.u : []).slice(0, 400).filter(u => Array.isArray(u) && (u[0] === 1 || u[0] === 2) && ROLE[u[1]] && Number.isInteger(u[2]) && Number.isInteger(u[3]) && u[2] >= 0 && u[3] >= 0 && u[2] < W && u[3] < H && udef((u[0] === 1 ? p1 : p2).nat, u[1]))
    .map(([team, role, x, y, day]) => Object.assign({team, role, x, y}, num(day, 1, 99, 1) > 1 ? {day:num(day, 1, 99, 1)} : {}));
  const name = String(o.n || 'Imported map').replace(/[<>"'&`]/g, '').slice(0, 40).trim() || 'Imported map';
  return Object.assign(edBlank(W, H, PAL[o.t] ? o.t : 'normandy'), {name, rows:o.r.map(r => r.split('')), units, p1, p2,
    obj:['hq', 'rout', 'survive'].includes(o.o) ? o.o : 'hq', days:num(o.d, 1, 60, 10), limit:num(o.l, 0, 99, 0), weather:['', 'clear', 'rain', 'snow', 'fog', 'smoke', 'overcast'].includes(o.wx) ? o.wx : '',
    hour:num(o.hr, 0, 23, 8), funds:num(o.f, 0, 200000, 5000), fog:!!o.fog});
}
async function edImport(code) {
  code = code.replace(/\s+/g, ''); let json;   // chat apps and email wrap long codes: strip the line breaks and spaces they add
  if (code.startsWith('BZM1')) { const bin = Uint8Array.from(atob(code.slice(4)), c => c.charCodeAt(0)); json = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text(); }
  else if (code.startsWith('BZM0')) json = decodeURIComponent(escape(atob(code.slice(4))));
  else throw new Error('not a map code');
  ED.map = edSanitize(JSON.parse(json));
  edGame(); edFit(); edPalette();
}
function edProblems() {
  const m = ED.map, rows = edRows(m), out = [];
  if (!rows.some(r => r.includes('Q'))) out.push('Side 1 has no HQ (Q).');
  if (m.obj === 'hq' && !rows.some(r => r.includes('q'))) out.push('Side 2 has no HQ, but the objective is to capture it.');
  if (!m.units.some(u => u.team === 1)) out.push('Side 1 has no units. (Use "Quick armies" to add a standard force.)');
  if (m.obj !== 'survive' && !m.units.some(u => u.team === 2) && m.obj === 'rout') out.push('Side 2 has no units to destroy.');
  return out;
}
function edCfg(ai1, ai2) {
  const m = ED.map, rows = edRows(m), sp = u => ({role:u.role, n:1, x:u.x, y:u.y, x2:null, y2:null, hp:100, cargo:[], hold:false}), spec = t => m.units.filter(u => u.team === t && !(u.day > 1)).map(sp);
  const events = [], waves = {}; for (const u of m.units) if (u.day > 1) (waves[u.day + ':' + u.team] = waves[u.day + ':' + u.team] || []).push(u);
  for (const [k, list] of Object.entries(waves)) { const [day, team] = k.split(':').map(Number); events.push({day, team, say:`Reinforcements arrive: ${list.length} unit${list.length > 1 ? 's' : ''}.`, spawn:list.map(sp)}); }
  const units = {1:spec(1), 2:spec(2)};
  if (!units[1].length && rows.some(r => r.includes('Q'))) units[1] = parseUnits(skirmishUnits(rows, 1));
  if (!units[2].length && rows.some(r => r.includes('q'))) units[2] = parseUnits(skirmishUnits(rows, 2));
  const objective = m.obj === 'survive' ? {win:'survive', days:m.days || 10} : m.obj === 'rout' ? {win:'rout'} : Object.assign({win:'hq'}, m.limit ? {limit:m.limit} : {});
  const funds = m.funds ?? 5000, hour = String(m.hour ?? 8).padStart(2, '0');
  return {map:rows, theme:m.theme, objective, events, fog:!!m.fog, weather:m.weather || {winter:'snow', autumn:'rain'}[m.theme] || 'clear', clock:{start:`1944-07-01T${hour}:00`, step:60},
    teams:{1:{nat:m.p1.nat, co:m.p1.co, funds, ai:ai1}, 2:{nat:m.p2.nat, co:m.p2.co, funds, ai:ai2}}, units, custom:m.name};
}

/* AI testers on a custom map: each temperament plays each side, and we report what happened */
async function edBalance() {
  const p = edProblems().filter(x => !x.includes('no units')); if (p.length) return edToast(p[0]);
  const saveMap = JSON.stringify(ED.map), P = ['aggressive', 'methodical', 'cautious'], res = [];
  edToast('Testers are playing your map…');
  for (const a of P) for (const b of P) {
    await yieldNow();
    TESTER[1] = a; TESTER[2] = b;
    try { const r = autoplayMission(edCfg(true, true), 30, false); res.push({a, b, w:r.winner, day:r.day, why:r.why}); } catch (e) { res.push({a, b, w:0, day:0, why:'crash: ' + e.message}); }
  }
  TESTER[1] = TESTER[2] = null; FAST = false;
  ED.map = JSON.parse(saveMap); edGame();
  const w1 = res.filter(r => r.w === 1).length, w2 = res.filter(r => r.w === 2).length, none = res.length - w1 - w2, avg = Math.round(res.reduce((s, r) => s + r.day, 0) / res.length);
  const verdict = none > res.length / 2 ? 'Games tend to stall: add a closer objective or more capturable towns.' : Math.abs(w1 - w2) <= 2 ? 'Well balanced.' : w1 > w2 ? 'Side 1 is favoured.' : 'Side 2 is favoured.';
  const box = $('#codebox'); box.hidden = false; box.querySelector('#codetext').hidden = false; const ls = box.querySelector('.edlist'); if (ls) ls.hidden = true; box.querySelector('h3').textContent = 'Balance check';
  box.querySelector('p').textContent = `${res.length} computer games, every pairing of aggressive, methodical and cautious generals. Side 1 won ${w1}, side 2 won ${w2}, ${none} unfinished. Average length ${avg} turns. ${verdict}`;
  const ta = box.querySelector('#codetext'); ta.readOnly = true;
  ta.value = res.map(r => `Side 1 ${r.a.padEnd(11)} v side 2 ${r.b.padEnd(11)} → ${r.w ? 'side ' + r.w + ' wins' : 'no result'} (${r.why}) on turn ${r.day}`).join('\n');
  box.querySelector('small').textContent = ''; box.querySelector('.cancel').textContent = 'Close'; box.querySelector('.ok').textContent = 'OK';
  box.querySelector('.cancel').onclick = box.querySelector('.ok').onclick = () => { box.hidden = true; };
}
/* ---------- the screen ---------- */
function openEditor(map) {
  if (map) ED.map = map; else if (!ED.map) ED.map = edBlank();
  show('editor'); musicMood('campaign');
  const c = edCv(), box = c.parentElement.getBoundingClientRect(); c.width = Math.max(320, box.width * dpr); c.height = Math.max(240, box.height * dpr);
  edGame(); edFit(); edPalette(); edLoop();
  edFillLoad();
}
function edLoop() { if (document.body.dataset.screen !== 'editor') return; edRender(); requestAnimationFrame(edLoop); }
function edLeave(to = 'title') { G = null; terrainCanvas = null; show(to); if (to === 'title') musicMood('title'); }
function edBoot() {
  const c = edCv();
  c.addEventListener('contextmenu', e => e.preventDefault());
  // touch: two fingers pinch to zoom and drag to pan (one finger paints)
  const pts = new Map(); let pin = null;
  const pinchState = () => { const [a, b] = [...pts.values()], r = c.getBoundingClientRect(), k = c.width / r.width; return {d:Math.hypot(a.x - b.x, a.y - b.y) || 1, mx:((a.x + b.x) / 2 - r.left) * k, my:((a.y + b.y) / 2 - r.top) * k}; };
  c.addEventListener('pointerdown', e => { pts.set(e.pointerId, {x:e.clientX, y:e.clientY}); if (pts.size === 2) { if (ED.drag && ED.drag.paint && ED.undo.length) edUndo(); ED.drag = null; ED.rect = null; pin = Object.assign(pinchState(), {z:ED.zoom, ox:ED.ox, oy:ED.oy}); } }, true);
  c.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, {x:e.clientX, y:e.clientY}); if (!pin || pts.size !== 2) return; e.stopImmediatePropagation();
    const now = pinchState(), z = clamp(pin.z * now.d / pin.d, .12, 2); ED.zoom = z; ED.ox = now.mx - (pin.mx - pin.ox) * z / pin.z; ED.oy = now.my - (pin.my - pin.oy) * z / pin.z; }, true);
  const lift = e => { pts.delete(e.pointerId); if (pts.size < 2) { if (pin) { ED.drag = null; } pin = null; } };
  c.addEventListener('pointerup', lift, true); c.addEventListener('pointercancel', lift, true);
  c.addEventListener('pointerdown', e => {
    if (pin) return;
    c.setPointerCapture(e.pointerId); const t = edToTile(e.clientX, e.clientY);
    if (e.button === 1 || e.button === 2 && e.shiftKey || e.altKey) { ED.drag = {pan:true, x:e.clientX, y:e.clientY, ox:ED.ox, oy:ED.oy}; return; }
    if (e.button === 2) { const ch = ED.map.rows[t[1]] && ED.map.rows[t[1]][t[0]]; if (ch) { ED.brush = ch; ED.tool = 'paint'; ED.panel = 'paint'; edPalette(); } return; }   // right-click picks up the terrain
    if (ED.tool === 'rect') { ED.rect = [t]; ED.drag = {rect:true}; return; }
    ED.drag = {paint:true, last:t.join()}; edApply(t[0], t[1], true);
  });
  c.addEventListener('pointermove', e => {
    const t = edToTile(e.clientX, e.clientY); ED.hover = t;
    if (!ED.drag) return;
    if (ED.drag.pan) { const r = c.width / c.getBoundingClientRect().width; ED.ox = ED.drag.ox + (e.clientX - ED.drag.x) * r; ED.oy = ED.drag.oy + (e.clientY - ED.drag.y) * r; return; }
    if (ED.drag.paint && t.join() !== ED.drag.last && ['paint', 'units', 'erase'].includes(ED.tool)) {   // fill in every tile between samples, so fast strokes leave no gaps
      const [lx, ly] = ED.drag.last.split(',').map(Number), n = Math.max(Math.abs(t[0] - lx), Math.abs(t[1] - ly));
      for (let i = 1; i <= n; i++) { const x = Math.round(lx + (t[0] - lx) * i / n), y = Math.round(ly + (t[1] - ly) * i / n); if (ED.tool === 'units' && i < n) continue; edApply(x, y, false); }
      ED.drag.last = t.join(); }
  });
  c.addEventListener('pointerup', e => { if (ED.drag && ED.drag.rect && ED.rect) edRect(ED.rect[0], edToTile(e.clientX, e.clientY)); ED.drag = null; ED.rect = null; });
  c.addEventListener('pointerleave', () => { ED.hover = null; });
  c.addEventListener('wheel', e => { e.preventDefault(); const r = c.getBoundingClientRect(), px = (e.clientX - r.left) * c.width / r.width, py = (e.clientY - r.top) * c.height / r.height, k = e.deltaY < 0 ? 1.15 : 1 / 1.15, z = clamp(ED.zoom * k, .12, 2);
    ED.ox = px - (px - ED.ox) * z / ED.zoom; ED.oy = py - (py - ED.oy) * z / ED.zoom; ED.zoom = z; }, {passive:false});
  addEventListener('keydown', e => { if (document.body.dataset.screen !== 'editor' || e.target.tagName === 'INPUT') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); edUndo(); } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Z')) { e.preventDefault(); edRedo(); }
    else if (e.key === 'f') edFit(); else if (e.key === 'm') { ED.mirror = !ED.mirror; edPalette(); } });
  addEventListener('resize', () => { if (document.body.dataset.screen === 'editor') { const box = c.parentElement.getBoundingClientRect(); c.width = box.width * dpr; c.height = box.height * dpr; edFit(); } });
  const on = (id, f) => edEl(id).addEventListener('click', () => { sfx('click'); f(); });
  on('ednew', () => { if (ED.dirty && !confirm('Discard the changes to this map?')) return; ED.map = edBlank(ED.map.W, ED.map.H, ED.map.theme); ED.undo = []; ED.dirty = false; ED.loaded = null; edGame(); edPalette(); });
  on('edundo', edUndo); on('edredo', edRedo); on('edsave', edSave); on('edfit', edFit);
  on('edexport', async () => { const code = await edExport(); showMapCode(code); });
  on('edimport', () => showMapCode('', true)); on('edmanage', edManage);
  on('edquick', () => { edSnapshot(); const rows = edRows(ED.map); for (const t of [1, 2]) { if (!rows.some(r => r.includes(t === 1 ? 'Q' : 'q'))) continue; ED.map.units = ED.map.units.filter(u => u.team !== t);
    G.units = []; for (const s of placeSpecs(t, parseUnits(skirmishUnits(rows, t)), 99 + t)) ED.map.units.push({team:t, role:s.role, x:s.x, y:s.y}); } edPalette(); });
  on('edplay', () => { const p = edProblems().filter(x => !x.includes('Side 1 has no units')); if (p.length) return edToast(p[0]); const cfg = edCfg(false, true); cfg.edtest = true; UI.fromEditor = true; G = null; startGame(cfg); });
  on('edwatch', () => { const p = edProblems().filter(x => !x.includes('no units')); if (p.length) return edToast(p[0]); const cfg = edCfg(true, true); cfg.edtest = true; cfg.watch = true; UI.fromEditor = true; G = null; startGame(cfg); });
  on('edbal', edBalance);
  on('edhot', () => { const p = edProblems().filter(x => !x.includes('no units')); if (p.length) return edToast(p[0]); const cfg = edCfg(false, false); cfg.edtest = true; UI.fromEditor = true; G = null; startGame(cfg); });
  on('edwaves', () => { const rows = edRows(ED.map); UI.fromEditor = true; openLastStand({rows, theme:ED.map.theme, name:ED.map.name}); });
  on('edback', () => { if (ED.dirty && !confirm('Leave without saving?')) return; edLeave(); });
  edEl('edload').addEventListener('change', e => { if (e.target.value) edLoad(e.target.value); e.target.value = ''; });
}
function showMapCode(code, importing) {
  const box = $('#codebox'); box.hidden = false; box.querySelector('#codetext').hidden = false; const ls = box.querySelector('.edlist'); if (ls) ls.hidden = true;
  box.querySelector('h3').textContent = importing ? 'Import a map' : 'Map code';
  box.querySelector('p').textContent = importing ? 'Paste a map code someone has shared with you.' : 'Copy this code and send it to a friend. They can paste it into Import in their Map Builder.';
  const ta = box.querySelector('#codetext'); ta.value = code; ta.readOnly = !importing; setTimeout(() => { ta.focus(); ta.select(); }, 50);
  box.querySelector('small').textContent = importing ? '' : `${code.length} characters`;
  box.querySelector('.cancel').textContent = 'Close'; box.querySelector('.ok').textContent = importing ? 'Import' : 'Copy';
  box.querySelector('.cancel').onclick = () => { box.hidden = true; };
  box.querySelector('.ok').onclick = async () => {
    if (!importing) { try { await navigator.clipboard.writeText(code); box.querySelector('small').textContent = 'Copied.'; } catch (e) { ta.select(); } return; }
    if (ED.dirty && !confirm('Discard the unsaved changes to this map?')) return;
    try { await edImport(ta.value); ED.dirty = false; ED.loaded = null; box.hidden = true; edToast('Map imported'); } catch (e) { box.querySelector('small').textContent = 'That code did not work: ' + e.message; }
  };
}

/* ---------- Last Stand setup ---------- */
const LS_PRESETS = [['daily', 'Daily challenge: today\'s map and enemy'], ['gen:normandy', 'Random: Normandy bocage'], ['gen:winter', 'Random: Ardennes winter'], ['gen:steppe', 'Random: Russian steppe'], ['gen:city', 'Random: ruined city'], ['gen:tropic', 'Random: Malayan jungle'], ['gen:china', 'Random: Chinese loess'], ['gen:desert', 'Random: Libyan desert'],
  ['m:bastogne', 'Bastogne'], ['m:pegasus', 'Pegasus Bridge'], ['m:stalingrad', 'Stalingrad'], ['m:henderson', 'Henderson Field'], ['m:sihang', 'Sihang Warehouse'], ['m:wake', 'Wake Island'], ['m:westerplatte', 'Westerplatte']];
function openLastStand(custom) {
  const f = $('#laststand'), sel = f.querySelector('#lsmap'), saved = Object.keys(edSaved());
  UI.lsCustom = custom || null;
  sel.innerHTML = (custom ? `<option value="custom">${custom.name.replace(/</g, '&lt;')} (from the Map Builder)</option>` : '') + LS_PRESETS.map(([v, n]) => `<option value="${v}">${n}</option>`).join('') + saved.map(n => `<option value="s:${n.replace(/"/g, '&quot;')}">Your map: ${n.replace(/</g, '&lt;')}</option>`).join('');
  const natSel = (id, val) => { const s = f.querySelector(id); s.innerHTML = Object.entries(NATION).map(([k, n]) => `<option value="${k}">${n.n} (${n.short})</option>`).join(''); s.value = val; };
  natSel('#lsnat', 'us'); natSel('#lsenemy', 'ger');
  const coSel = () => { f.querySelector('#lsco').innerHTML = (CO_BY_NAT[f.querySelector('#lsnat').value] || []).map(c => `<option value="${c}">${CO[c].n}</option>`).join(''); };
  coSel(); f.querySelector('#lsnat').onchange = () => { coSel(); lsBest(); }; sel.onchange = lsBest;
  UI.lsForce = forceBind(f.querySelector('.forcebox'), f.querySelector('#lsnat'), 'ls');
  lsBest(); show('laststand');
}
function lsBest() { const f = $('#laststand'), key = f.querySelector('#lsmap').value + ':' + f.querySelector('#lsnat').value, b = waveBest(lsKeyName(f.querySelector('#lsmap').value) + ':' + f.querySelector('#lsnat').value); f.querySelector('#lsbest').textContent = (f.querySelector('#lsmap').value === 'daily' ? (d => `Today: ${THEMES[d.theme] ? THEMES[d.theme].n : d.theme} against ${NATION[d.enemy].n} (${NATION[d.enemy].short}). `)(lsDaily()) : '') + (b ? `Your best here: ${b} wave${b === 1 ? '' : 's'}` : 'No record yet on this map.'); }
const lsKeyName = v => v === 'custom' ? 'custom:' + (UI.lsCustom && UI.lsCustom.name) : v === 'daily' ? 'daily:' + lsDaily().date : v;
/* the daily challenge: everyone gets the same map, terrain and enemy on the same day */
function lsDaily() { const d = new Date(), date = d.toISOString().slice(0, 10), seed = +date.replace(/-/g, '') % 1e9;
  const themes = ['normandy', 'winter', 'steppe', 'city', 'tropic', 'china', 'poland', 'autumn', 'holland'], foes = ['ger', 'ger40', 'jp', 'su', 'us', 'uk'];
  return {date, seed, theme:themes[seed % themes.length], enemy:foes[Math.floor(seed / 7) % foes.length]}; }
/* a custom force or a big war chest is a different challenge: it keeps its own records */
const lsCustomTag = f => (f.querySelector('.forcemode').value === 'custom' || +f.querySelector('[id$=funds]').value > 6000) ? ':custom' : '';
function launchLastStand() {
  const f = $('#laststand'), v = f.querySelector('#lsmap').value, nat = f.querySelector('#lsnat').value, enemy = f.querySelector('#lsenemy').value;
  let rows, theme;
  let enemyNat = enemy;
  if (v === 'daily') { const d = lsDaily(); theme = d.theme; rows = genMap(theme, 34, 22, d.seed); enemyNat = d.enemy; }
  else if (v === 'custom') { rows = UI.lsCustom.rows; theme = UI.lsCustom.theme; }
  else if (v.startsWith('gen:')) { theme = v.slice(4); rows = genMap(theme, 34, 22, Date.now() % 1e9); }
  else if (v.startsWith('m:')) { const m = MISSIONS[v.slice(2)]; rows = missionMap(m); theme = m.theme; }
  else { const s = edSaved()[v.slice(2)]; rows = s.rows; theme = s.theme; }
  const eco = (CO_BY_NAT[enemyNat] || ['rommel'])[0];
  const cfg = wavesCfg({rows, theme, nat, co:f.querySelector('#lsco').value, enemy:enemyNat, eco, diff:f.querySelector('#lsdiff').value, funds:Math.max(0, Math.min(200000, +f.querySelector('#lsfunds').value || 0)), every:+f.querySelector('#lsevery').value, name:lsKeyName(v) + lsCustomTag(f), force:UI.lsForce && UI.lsForce()});
  G = null; startGame(cfg);
}
