/* phone layout, 390 x 844 with touch: a two-player game against the computer, played by taps */
const {open, clickTile, clearOverlays, waitHumanTurn} = require('./pw.js');
const SHOTS = process.env.SHOTS || require('path').join(__dirname, '..', '..', 'shots');
const log = (...a) => console.log(...a);
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
(async () => {
  const {browser, page, errors} = await open({ctx:{viewport:{width:390, height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2}});
  await page.screenshot({path:SHOTS + '/title-phone.png'});
  await page.tap('#bbase'); await page.waitForTimeout(400);
  log('setup overflow px', await overflow(page));
  await page.screenshot({path:SHOTS + '/setup-phone.png', fullPage:true});
  await page.tap('#bbgo'); await page.waitForTimeout(600);
  await waitHumanTurn(page, 1);
  log('game overflow px', await overflow(page));
  await page.screenshot({path:SHOTS + '/early-phone.png'});
  const tapEnd = async () => { await page.tap('#endturn'); await page.waitForTimeout(250); const b = await page.$('#menu:not([hidden]) button:has-text("End turn anyway")'); if (b) await b.tap(); };
  const build = async (name, pick) => {
    await page.tap('#bbbuild'); await page.waitForTimeout(250);
    const b = await page.$(`#menu button:has-text("${name}")`); if (!b || await b.isDisabled()) { await page.evaluate(() => { closeMenu(); UI.mode = 'idle'; }); return false; }
    await page.screenshot({path:SHOTS + `/buildmenu-phone.png`});
    await b.tap(); await page.waitForTimeout(250);
    const at = await page.evaluate(pick); await clickTile(page, at[0], at[1], true); return true; };
  const nearFields = () => UI.bbTiles.map(([x, y]) => [x, y, DIRS.filter(([a, b]) => inside(x + a, y + b) && terr(x + a, y + b) === 'field').length]).sort((p, q) => q[2] - p[2])[0];
  const nearHQ = () => { const h = bbHQ(G.turn); return UI.bbTiles.map(([x, y]) => [x, y, Math.abs(Math.hypot(x - h.x, y - h.y) - 2.5)]).sort((p, q) => p[2] - q[2])[0]; };
  log('depot placed by touch', await build('Supply Depot', nearFields), await page.evaluate(() => G.units.some(u => u.team === 1 && u.role === 'bbdepot')));
  for (let t = 0; t < 6; t++) {
    await tapEnd(); await waitHumanTurn(page, 1);
    const st = await page.evaluate(() => ({day:G.day, funds:G.teams[1].funds, barr:G.units.some(u => u.team === 1 && u.role === 'bbbarr'), free:bbCrews(1).free}));
    if (!st.barr && st.free > 0 && st.funds >= 2500) log('barracks by touch', await build('Barracks', nearHQ));
    else if (st.free > 0 && st.funds >= 1500 && st.barr) log('fuel dump by touch', await build('Fuel Dump', nearHQ));
    log(JSON.stringify(st));
  }
  // a unit by touch: tap the barracks, then the first unit in its list
  const b = await page.evaluate(() => { const s = G.units.find(u => u.team === 1 && u.role === 'bbbarr' && !u.left); return s && [s.x, s.y]; });
  if (b) { await clickTile(page, b[0], b[1], true); await page.waitForTimeout(300); await page.screenshot({path:SHOTS + '/produce-phone.png'}); const first = await page.$('#menu button:not([disabled])'); if (first) await first.tap(); }
  log('units bought by touch', await page.evaluate(() => JSON.stringify(G.bb.made[1] || {})));
  // a move by touch: tap one of our units, tap a blue square, choose Wait
  const mv = await page.evaluate(() => { const u = G.units.find(o => o.team === 1 && !o.done && !o.d.fixed && o.role !== 'harv'); if (!u) return null; const r = reach(u, u.x, u.y); const n = [...r.values()].filter(n => !unitAt(n.x, n.y) && canStop(u, n.x, n.y)).sort((a, b) => b.c - a.c)[0]; return {u:[u.x, u.y], to:[n.x, n.y], id:u.id}; });
  if (mv) { await clickTile(page, mv.u[0], mv.u[1], true); await clickTile(page, mv.to[0], mv.to[1], true); await page.waitForTimeout(800); await page.screenshot({path:SHOTS + '/move-phone.png'});
    const w = await page.$('#menu:not([hidden]) button:has-text("Wait")'); if (w) await w.tap(); await page.waitForTimeout(300);
    log('moved by touch', await page.evaluate(id => { const u = G.units.find(o => o.id === id); return u && [u.x, u.y, u.done]; }, mv.id), 'to', mv.to); }
  log('game overflow px', await overflow(page));
  await page.screenshot({path:SHOTS + '/mid-phone.png'});
  log('console errors', errors.length, errors.slice(0, 6));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
