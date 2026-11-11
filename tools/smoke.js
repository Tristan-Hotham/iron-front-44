/* Smoke test: plays the built index.html in Chromium through the real interface and fails on any console error.
     node tools/smoke.js             desktop (1280x800, mouse) and phone (390x844, touch)
     node tools/smoke.js --desktop   desktop only
   Needs Playwright with Chromium (npm i -g playwright && npx playwright install chromium); set PLAYWRIGHT to its path if require() cannot find it.
   It serves the repo folder itself, so build first (node tools/build.js or .\build.ps1).
   Checks: #validate is clear; Basic Training starts from the new-recruit prompt; a unit is picked up, moved, stepped back (undo) and moved
   again; the order menu is on top even with a field note open; both sides take a turn; save and resume; a small battle won and one
   lost; a save written by the live build (v15, tools/fixtures) still loads; phone buttons are 44 px and the HUD pieces do not overlap;
   reduced motion stops the camera shake. */
const http = require('http'), fs = require('fs'), path = require('path');
let pw; try { pw = require(process.env.PLAYWRIGHT || 'playwright'); } catch (e) { pw = require('/opt/npm-tools/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..'), TYPES = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.jpg':'image/jpeg', '.png':'image/png'};
const results = []; let failed = 0;
const ok = (name, cond, info = '') => { results.push(`${cond ? 'ok  ' : 'FAIL'} ${name}${info ? '  (' + info + ')' : ''}`); if (!cond) failed++; console.log(results[results.length - 1]); };
const IGNORE = /willReadFrequently|fonts\.(googleapis|gstatic)\.com|net::ERR_|Failed to load resource|play\(\) request|NotAllowedError|AbortError/;

function serve() {
  return new Promise(res => { const s = http.createServer((q, r) => {
    const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'Content-Type':TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1', () => res(s)); });
}
async function page(browser, phone, storage, reduced) {
  const ctx = await browser.newContext(phone ? {viewport:{width:390, height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true, reducedMotion:reduced ? 'reduce' : 'no-preference'} : {viewport:{width:1280, height:800}, reducedMotion:reduced ? 'reduce' : 'no-preference'});
  await ctx.addInitScript(s => { if (!sessionStorage.getItem('smoke')) { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem('smoke', '1'); } }, storage || {});
  const p = await ctx.newPage(); p.errors = []; p.phone = phone;
  p.on('pageerror', e => p.errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) p.errors.push('console: ' + m.text()); });
  p.on('dialog', d => d.accept());
  return p;
}
const tileXY = (p, x, y) => p.evaluate(([x, y]) => [(x * ART + ART / 2 - cam.x) * cam.z, (y * ART + ART / 2 - cam.y) * cam.z], [x, y]);
async function tapTile(p, x, y, button) { await p.evaluate(([x, y]) => { if (typeof GLIDE !== 'undefined') GLIDE = null; const [sx, sy] = [(x * ART + ART / 2 - cam.x) * cam.z, (y * ART + ART / 2 - cam.y) * cam.z]; if (sx < 60 || sy < 140 || sx > innerWidth - 60 || sy > innerHeight - 200) centerOn(x, y); }, [x, y]);
  const [sx, sy] = await tileXY(p, x, y); if (p.phone && !button) await p.touchscreen.tap(sx, sy); else await p.mouse.click(sx, sy, button ? {button} : undefined); await p.waitForTimeout(120); }
async function press(p, sel) { const l = p.locator(sel).first(); if (p.phone) await l.tap(); else await l.click(); await p.waitForTimeout(100); }
/* clear speech, field notes and banners until the human may act, or the battle ends */
async function settle(p, ms = 240000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const s = await p.evaluate(() => ({dlg:!$('#dialog').hidden, tip:!$('#tip').hidden, res:!$('#result').hidden, busy:UI.busy, ai:!!(G && isAI(G.turn)), over:!!(G && G.over), scr:document.body.dataset.screen,
      bat:!$('#battlewrap').hidden, pc:!$('#powercut').hidden, ban:+getComputedStyle($('#banner')).opacity}));
    if (s.res || s.scr !== 'game') return s;
    if (s.dlg) { await p.locator('#dialog').click({force:true}).catch(() => {}); continue; }
    if (s.tip) { await p.locator('#tip button').click({force:true}).catch(() => {}); continue; }
    if (!s.busy && !s.ai && !s.over && !s.bat && !s.pc && s.ban < .05) return s;
    await p.waitForTimeout(150);
  }
  return {timeout:true};
}
async function endTurn(p) { await press(p, '#endturn'); if (await p.locator('#menu').isVisible()) { const b = p.locator('#menu button', {hasText:'End turn anyway'}); if (await b.count()) await (p.phone ? b.tap() : b.click()); } }
const tiny = (units, win = 'rout') => ({map:['.........', '.........', '.........', '.........', '.........'], theme:'normandy', objective:{win},
  teams:{1:{nat:'uk', co:'monty', ai:false}, 2:{nat:'ger', co:'rommel', ai:true}}, units, clock:{start:'1944-07-01T09:00', step:60}});

async function run(browser, base, phone) {
  const tag = phone ? 'phone' : 'desktop';
  // 1. a new player: the recruit prompt leads to Basic Training
  let p = await page(browser, phone);
  await p.goto(base + 'index.html'); await p.waitForFunction(() => typeof G !== 'undefined' && !$('#codebox').hidden, null, {timeout:20000}).catch(() => {});
  ok(`${tag}: new-recruit prompt offers Basic Training`, await p.locator('#codebox .ok').isVisible());
  await press(p, '#codebox .ok'); ok(`${tag}: briefing opens`, await p.evaluate(() => document.body.dataset.screen === 'brief'));
  await press(p, '#brief .go'); let s = await settle(p);
  ok(`${tag}: battle starts on the player's turn`, !s.timeout && s.scr === 'game' && await p.evaluate(() => G.turn === 1 && G.day === 1));
  // pick up a unit, move it, step back twice (undo), then move it for real
  const u = await p.evaluate(() => { const pl = aiNext(1, {}); const [x, y] = pl.path[pl.path.length - 1]; return {x:pl.u.x, y:pl.u.y, id:pl.u.id, dx:x, dy:y}; });
  await tapTile(p, u.x, u.y); ok(`${tag}: tapping a unit shows its moves`, await p.evaluate(() => UI.mode === 'move' && UI.reach && UI.reach.size > 1));
  await tapTile(p, u.dx, u.dy); await p.waitForFunction(() => UI.mode === 'menu', null, {timeout:8000}).catch(() => {});
  await p.evaluate(() => tip('smoketest', 'A field note opened over the order menu by the smoke test.'));   // the phone layout bug: a note hid the orders
  const top = await p.evaluate(() => { const b = $('#menu button:not([disabled])'); if (!b) return 'no menu'; const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const inView = r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, hit = document.elementFromPoint(x, y); return inView && hit && b.contains(hit) ? 'top' : 'covered by ' + (hit && (hit.id || hit.className || hit.tagName)); });
  ok(`${tag}: order menu is on screen and on top of a field note`, top === 'top', top);
  await p.locator('#tip button').click({force:true}).catch(() => {});
  if (phone) { await p.evaluate(() => cancel()); } else await tapTile(p, u.dx, u.dy, 'right');   // a finger steps back by tapping elsewhere; the test calls the same cancel()
  ok(`${tag}: stepping back returns to the move choice`, await p.evaluate(() => UI.mode === 'move'));
  await p.evaluate(() => cancel());
  ok(`${tag}: undo puts the unit back where it started`, await p.evaluate(u => { const o = G.units.find(v => v.id === u.id); return UI.mode === 'idle' && o.x === u.x && o.y === u.y && !o.done; }, u));
  await tapTile(p, u.x, u.y); await tapTile(p, u.dx, u.dy); await p.waitForFunction(() => UI.mode === 'menu', null, {timeout:8000}).catch(() => {});
  const wait = p.locator('#menu button', {hasText:/^Wait$/}); if (await wait.count()) await (phone ? wait.tap() : wait.click());
  ok(`${tag}: the order is carried out`, await p.evaluate(u => G.units.find(v => v.id === u.id).done, u));
  // both sides take a turn
  await endTurn(p); s = await settle(p);
  ok(`${tag}: the enemy takes its turn and hands back`, !s.timeout && await p.evaluate(() => G.day === 2 && G.turn === 1));
  // save and resume
  const before = await p.evaluate(() => JSON.stringify([G.day, G.turn, G.units.length, G.teams[1].funds, G.units.map(u => u.x + ',' + u.y).sort()]));
  await p.reload(); await p.waitForFunction(() => typeof G !== 'undefined'); await p.waitForTimeout(400);
  ok(`${tag}: Continue is offered after a reload`, await p.locator('#continue').isVisible());
  await press(p, '#continue'); await p.waitForTimeout(600);
  const after = await p.evaluate(() => JSON.stringify([G.day, G.turn, G.units.length, G.teams[1].funds, G.units.map(u => u.x + ',' + u.y).sort()]));
  ok(`${tag}: the battle resumes exactly`, before === after, before === after ? '' : before + ' / ' + after);
  // win a small battle: a Cromwell finishes off a shattered squad
  await p.evaluate(c => startGame(c), tiny({1:'tank 2,2', 2:'inf 4,2 1'})); s = await settle(p);
  await tapTile(p, 2, 2); await tapTile(p, 4, 2); if (phone) await tapTile(p, 4, 2);   // a finger's first tap on an enemy shows the odds, the second attacks
  await p.waitForSelector('#fcGo', {timeout:8000}).catch(() => {});
  if (await p.locator('#fcGo').isVisible()) await press(p, '#fcGo');
  s = await settle(p);
  ok(`${tag}: a small battle can be won`, await p.evaluate(() => !$('#result').hidden && $('#result h2').textContent === 'VICTORY'));
  // lose one: a lone, broken squad faces a Panzer IV
  await press(p, '#resultok');
  await p.evaluate(c => startGame(c), tiny({1:'inf 2,2 1', 2:'tank 4,2'})); s = await settle(p);
  await endTurn(p); s = await settle(p);
  ok(`${tag}: a small battle can be lost`, await p.evaluate(() => !$('#result').hidden && $('#result h2').textContent === 'DEFEAT'));
  ok(`${tag}: defeat plays the player's own lament`, await p.evaluate(() => MUSIC.mood === 'defeat:uk'));
  if (phone) {   // the bottom bar: every button a 44 px target, nothing off screen; the minimap clear of the generals' cards
    await press(p, '#resultok'); await p.evaluate(c => startGame(c), tiny({1:'tank 2,2', 2:'inf 7,2'})); await settle(p);
    const lay = await p.evaluate(() => { const bad = []; for (const b of document.querySelectorAll('#bottom .acts button:not([hidden]), #viewbtns button')) { const r = b.getBoundingClientRect(); if (r.height < 43.5 || r.right > innerWidth + .5 || r.left < -.5) bad.push(b.id + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      const over = (a, b) => { a = a.getBoundingClientRect(); b = b.getBoundingClientRect(); return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; };
      if (over($('#minimap'), $('#co2'))) bad.push('minimap over the enemy card'); if (over($('#minimap'), $('#viewbtns'))) bad.push('minimap over the view buttons'); return bad; });
    ok('phone: HUD buttons are 44 px tap targets and nothing overlaps', !lay.length, lay.join('; '));
  }
  ok(`${tag}: no console errors in play`, !p.errors.length, p.errors.slice(0, 4).join(' | '));
  await p.context().close();
}

(async () => {
  const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}/`, browser = await pw.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  try {
    // 0. the built-in checks
    let p = await page(browser, false);
    await p.goto(base + 'index.html#validate', {waitUntil:'commit'}); await p.waitForFunction(() => window.TEST, null, {timeout:120000});
    ok('#validate is clear', await p.evaluate(() => window.TEST.bad === 0), await p.evaluate(() => window.TEST.bad + ' problem(s)'));
    // the Operation Exporter battles: each briefing opens and each plays to a finish, computer against computer
    const lev = await p.evaluate(() => ['litani', 'damascus', 'damour'].map(id => { openBrief(MISSIONS[id]); const brief = document.querySelector('#brief h2').textContent; const r = autoplayMission(MISSIONS[id]); return id + ':' + (brief ? 'brief' : 'nobrief') + ':' + r.why; }));
    ok('Operation Exporter battles brief and play out', lev.every(s => s.includes(':brief:') && !s.endsWith('unfinished')), lev.join(' '));
    await p.context().close();
    await run(browser, base, false);
    if (!process.argv.includes('--desktop')) await run(browser, base, true);
    // a save written by the live build (v15): progress, core force, settings and a battle in progress all carry over
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'live-v15-storage.json'), 'utf8'));
    p = await page(browser, false, fx);
    await p.goto(base + 'index.html'); await p.waitForFunction(() => typeof G !== 'undefined'); await p.waitForTimeout(800);
    await p.locator('#codebox .cancel').click().catch(() => {});
    ok('live save: settings kept', await p.evaluate(() => SET.flags === 'balken' && SET.aiFast === true));
    ok('live save: progress kept', await p.evaluate(() => { const g = loadProg(); return g.done.training && g.rank.training === 'A' && (g.core.uk || []).length === 1; }));
    await p.locator('#continue').click(); await p.waitForTimeout(800);
    ok('live save: the battle in progress resumes', await p.evaluate(() => G && G.mission && G.mission.id === 'taranto' && G.day === 2 && G.turn === 1 && G.units.every(u => u.d)));
    await p.evaluate(() => { const u = G.units.find(o => o.team === 1 && !o.done); selectTile(u.x, u.y); }); await p.waitForTimeout(200);
    ok('live save: units can be ordered after resuming', await p.evaluate(() => UI.mode === 'move'));
    ok('live save: no console errors', !p.errors.length, p.errors.slice(0, 3).join(' | '));
    await p.context().close();
    // reduced motion
    p = await page(browser, false, {if44seen:'99'}, true);
    await p.goto(base + 'index.html'); await p.waitForFunction(() => typeof G !== 'undefined');
    ok('reduced motion: no camera shake', await p.evaluate(() => { FX.shake = 0; shakeCam(9); return FX.shake === 0; }));
    await p.context().close();
  } catch (e) { ok('smoke run finished', false, e.message.split('\n')[0]); }
  await browser.close(); srv.close();
  console.log(failed ? `\n${failed} check(s) failed` : '\nsmoke: all clear'); process.exit(failed ? 1 : 0);
})();
