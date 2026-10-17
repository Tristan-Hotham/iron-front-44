/* ============================== CONTROLLERS ===============================
   Standard-mapping gamepads (Xbox, PlayStation, most others):
   d-pad / left stick  cursor (menus too)     right stick  pan the map
   A / Cross           select, confirm         B / Circle   cancel, back
   X / Square          general's menu          Y / Triangle intel on the unit under the cursor
   LB / RB             previous / next ready unit
   LT / RT             zoom out / in           Start        end turn      Back/Select  minimap
   In hotseat, each player may use their own pad: pad 1 commands side 1, pad 2 side 2
   (any pad works when only one is connected). */
const PAD = {prev:{}, held:{}, repeatAt:{}, active:false, lastUse:0};
const BTN = {A:0, B:1, X:2, Y:3, LB:4, RB:5, LT:6, RT:7, BACK:8, START:9, UP:12, DOWN:13, LEFT:14, RIGHT:15};
function padPoll() {
  requestAnimationFrame(padPoll);
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (!pads.length) return;
  const now = performance.now();
  pads.forEach((p, idx) => {
    const key = p.index, prev = PAD.prev[key] || [], press = [], down = [];
    p.buttons.forEach((b, i) => { const on = b.pressed || b.value > .5; down[i] = on; if (on && !prev[i]) press.push(i); });
    // stick as d-pad with key repeat
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    const dir = Math.abs(ax) > .5 || Math.abs(ay) > .5 ? (Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? BTN.RIGHT : BTN.LEFT) : (ay > 0 ? BTN.DOWN : BTN.UP)) : -1;
    for (const d of [BTN.UP, BTN.DOWN, BTN.LEFT, BTN.RIGHT]) {
      const on = down[d] || dir === d, id = key + ':' + d;
      if (on && !PAD.held[id]) { press.push(d); PAD.held[id] = true; PAD.repeatAt[id] = now + 320; }
      else if (on && now > PAD.repeatAt[id]) { press.push(d); PAD.repeatAt[id] = now + 90; }
      else if (!on) PAD.held[id] = false;
    }
    PAD.prev[key] = down;
    // right stick pans
    const rx = p.axes[2] || 0, ry = p.axes[3] || 0;
    if (G && document.body.dataset.screen === 'game' && (Math.abs(rx) > .2 || Math.abs(ry) > .2)) { cam.x += rx * 14 / cam.z; cam.y += ry * 14 / cam.z; clampCam(); }
    if (down[BTN.LT] || down[BTN.RT]) { if (G && now - (PAD.zoomT || 0) > 60) { PAD.zoomT = now; zoomAt(innerWidth / 2, innerHeight / 2, cam.z * (down[BTN.RT] ? 1.03 : 1 / 1.03)); } }
    if (press.length) { PAD.active = true; PAD.lastUse = now; document.body.classList.add('pad'); auInit(); for (const b of press) padButton(b, idx, pads.length); }
  });
}
function padTeamOk(idx, count) {
  if (!G || count < 2) return true;
  const humans = [1, 2].filter(t => !G.teams[t].ai);
  return humans.length < 2 || G.turn === idx + 1;                  // hotseat: each pad commands its own side
}
function padButton(b, idx, count) {
  const screen = document.body.dataset.screen;
  // overlays first: dialogs, cut-ins, battles, tips, results
  for (const sel of ['#dialog', '#powercut', '#battlewrap', '#coinfo', '#handoff']) { const el = $(sel); if (el && !el.hidden) { if (b === BTN.A || b === BTN.B) el.click(); return; } }
  if (!$('#tip').hidden && (b === BTN.A || b === BTN.B)) { $('#tip').hidden = true; return; }
  if (!$('#result').hidden) { if (b === BTN.A) $('#resultok').click(); return; }
  // menus: d-pad walks the buttons, A presses, B backs out
  const menu = !$('#menu').hidden ? $('#menu') : screen !== 'game' ? document.querySelector('.screen:not([hidden])') : null;
  if (menu) {
    const items = [...menu.querySelectorAll('button:not([disabled]), select, input')].filter(e => e.offsetParent);
    let i = items.indexOf(document.activeElement);
    if ([BTN.UP, BTN.DOWN, BTN.LEFT, BTN.RIGHT].includes(b)) {
      const el = document.activeElement;
      if (el && el.tagName === 'SELECT' && (b === BTN.LEFT || b === BTN.RIGHT)) { el.selectedIndex = clamp(el.selectedIndex + (b === BTN.RIGHT ? 1 : -1), 0, el.options.length - 1); el.dispatchEvent(new Event('change')); return; }
      if (el && el.type === 'range' && (b === BTN.LEFT || b === BTN.RIGHT)) { el.value = clamp(+el.value + (b === BTN.RIGHT ? .05 : -.05), 0, 1); return; }
      i = (i + ([BTN.DOWN, BTN.RIGHT].includes(b) ? 1 : -1) + items.length) % items.length; items[i]?.focus(); items[i]?.scrollIntoView({block:'nearest'}); sfx('click'); return;
    }
    if (b === BTN.A) { const el = document.activeElement; if (el && el.type === 'checkbox') el.checked = !el.checked; else if (el && items.includes(el)) el.click(); else items[0]?.focus(); return; }
    if (b === BTN.B) { if (!$('#menu').hidden) cancel(); else { const back = menu.querySelector('.back'); if (back) back.click(); } return; }
    if (screen !== 'game') return;
  }
  if (screen !== 'game' || !G || !padTeamOk(idx, count)) return;
  const mv = {[BTN.UP]:[0, -1], [BTN.DOWN]:[0, 1], [BTN.LEFT]:[-1, 0], [BTN.RIGHT]:[1, 0]}[b];
  if (mv) {
    if (['target', 'unload', 'clear'].includes(UI.mode)) { const i = UI.targets.findIndex(([x, y]) => x === UI.cursor.x && y === UI.cursor.y); const [x, y] = UI.targets[(i + (mv[0] + mv[1] > 0 ? 1 : UI.targets.length - 1)) % UI.targets.length]; UI.cursor = {x, y}; forecast(); return; }
    UI.cursor = {x:clamp(UI.cursor.x + mv[0], 0, G.W - 1), y:clamp(UI.cursor.y + mv[1], 0, G.H - 1)}; focus(UI.cursor.x, UI.cursor.y); hoverUpdate(); return;
  }
  switch (b) {
    case BTN.A: tileAction(UI.cursor.x, UI.cursor.y); break;
    case BTN.B: cancel(); break;
    case BTN.X: if (UI.mode === 'idle' && !UI.busy) openGameMenu(); break;
    case BTN.Y: { const u = unitAt(UI.cursor.x, UI.cursor.y); if (u && seen(u)) showThreat(u); else toggleDanger(); break; }   // on empty ground: the whole danger zone
    case BTN.LB: case BTN.RB: cycleUnit(b === BTN.RB ? 1 : -1); break;
    case BTN.START: endTurnClick(); break;
    case BTN.BACK: $('#minimap').classList.toggle('off'); break;
  }
}
/* jump the cursor to the next unit that still has orders to give */
function cycleUnit(dir) {
  if (!G || UI.mode !== 'idle') return;
  const ready = G.units.filter(u => u.team === G.turn && !u.done && !u.d.fixed).sort((a, b) => a.y - b.y || a.x - b.x);
  if (!ready.length) { fxText(UI.cursor.x, UI.cursor.y, 'All units have moved', '#f4e8c8'); return; }
  const i = ready.findIndex(u => u.x === UI.cursor.x && u.y === UI.cursor.y);
  const u = ready[(i + dir + ready.length) % ready.length];
  UI.cursor = {x:u.x, y:u.y}; centerOn(u.x, u.y); hoverUpdate(); sfx('click');
}
addEventListener('gamepadconnected', e => { const n = $('#nowplaying'); if (n) { n.textContent = '🎮 ' + (e.gamepad.id.split('(')[0].trim() || 'Controller') + ' connected'; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 3500); } });
addEventListener('mousemove', () => { if (PAD.active && performance.now() - PAD.lastUse > 400) { PAD.active = false; document.body.classList.remove('pad'); } });
