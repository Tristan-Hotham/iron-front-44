/* scripted human-versus-AI opening on Beauce: depot, lorry, harvest, barracks, a unit, an attack; then save and resume */
const {open, clickTile, clearOverlays, waitHumanTurn} = require('./pw.js');
const SHOTS = process.env.SHOTS || require('path').join(__dirname, '..', '..', 'shots');
const log = (...a) => console.log(...a);
async function endTurn(page) {
  await page.click('#endturn'); await page.waitForTimeout(200);
  const b = await page.$('#menu:not([hidden]) button:has-text("End turn anyway")'); if (b) await b.click();
}
async function build(page, name, pickFn) {
  await page.click('#bbbuild'); await page.waitForTimeout(200);
  const btn = await page.$(`#menu button:has-text("${name}")`); if (!btn || await btn.isDisabled()) { await page.keyboard.press('Escape'); await page.evaluate(() => { closeMenu(); UI.mode = 'idle'; }); return false; }
  await btn.click(); await page.waitForTimeout(150);
  const at = await page.evaluate(pickFn); if (!at) return false;
  await clickTile(page, at[0], at[1]); return true;
}
(async () => {
  const {browser, page, errors} = await open();
  const done = {};
  await page.screenshot({path:SHOTS + '/title-desktop.png'});
  await page.click('#bbase'); await page.waitForTimeout(400);
  await page.screenshot({path:SHOTS + '/setup-desktop.png'});
  await page.selectOption('#bbmapsel', 'beauce'); await page.waitForTimeout(100);
  const seats = await page.$$('#bbsetup .seat');
  await (await seats[0].$('.who')).selectOption('human'); await (await seats[1].$('.who')).selectOption('normal');
  await (await seats[0].$('.nat')).selectOption('uk'); await (await seats[1].$('.nat')).selectOption('ger');
  await page.click('#bbgo');
  await waitHumanTurn(page, 1);
  const nearFields = () => { const t = UI.bbTiles.map(([x, y]) => [x, y, DIRS.filter(([a, b]) => inside(x + a, y + b) && terr(x + a, y + b) === 'field').length]).sort((p, q) => q[2] - p[2]); return t[0]; };
  const nearHQ = () => { const h = bbHQ(G.turn); const t = UI.bbTiles.map(([x, y]) => [x, y, Math.abs(Math.hypot(x - h.x, y - h.y) - 2.5) + (DIRS.some(([a, b]) => inside(x + a, y + b) && terr(x + a, y + b) === 'field') ? 3 : 0)]).sort((p, q) => p[2] - q[2]); return t[0]; };
  done.depot = await build(page, 'Supply Depot', nearFields);
  log('turn 1: depot ordered', done.depot, await page.evaluate(() => JSON.stringify(G.units.filter(u => u.team === 1 && u.left > 0).map(u => [u.role, u.x, u.y, u.left]))));
  await page.screenshot({path:SHOTS + '/early-desktop.png'});
  let attackedOn = 0;
  for (let turn = 0; turn < 40 && !attackedOn; turn++) {
    await endTurn(page);
    if (!(await waitHumanTurn(page, 1))) { log('game over early'); break; }
    const st = await page.evaluate(() => ({day:G.day, funds:G.teams[1].funds, inc:G.bb.inc[1], harv:G.units.filter(u => u.team === 1 && u.role === 'harv').length,
      depot:(G.units.find(u => u.team === 1 && u.role === 'bbdepot' && !u.left) || null) && [G.units.find(u => u.team === 1 && u.role === 'bbdepot' && !u.left).x, G.units.find(u => u.team === 1 && u.role === 'bbdepot' && !u.left).y],
      barr:(G.units.find(u => u.team === 1 && u.role === 'bbbarr' && !u.left) || null) && [G.units.find(u => u.team === 1 && u.role === 'bbbarr' && !u.left).x, G.units.find(u => u.team === 1 && u.role === 'bbbarr' && !u.left).y],
      hasBarr:G.units.some(u => u.team === 1 && u.role === 'bbbarr'), free:bbCrews(1).free, lorry:udef(G.teams[1].nat, 'harv').n, inf:udef(G.teams[1].nat, 'inf').n}));
    log(`day ${st.day} funds ${st.funds} income ${JSON.stringify(st.inc)} lorries ${st.harv}`);
    if (st.inc && st.inc.grain > 0) done.harvest = done.harvest || st.day;
    if (!st.hasBarr && st.free > 0 && st.funds >= 2500) { done.barracks = await build(page, 'Barracks', nearHQ); log('  barracks ordered', done.barracks); }
    if (st.depot && st.harv < 2 && st.funds >= 2000) { await clickTile(page, st.depot[0], st.depot[1]); const b = await page.$(`#menu button:has-text("${st.lorry}")`);
      if (b && !(await b.isDisabled())) { await b.click(); done.lorry = st.day; log('  lorry bought'); } else await page.evaluate(() => { closeMenu(); UI.mode = 'idle'; }); }
    if (st.barr && (await page.evaluate(() => G.teams[1].funds)) >= 1000) { await clickTile(page, st.barr[0], st.barr[1]); const b = await page.$(`#menu button:has-text("${st.inf}")`);
      if (b && !(await b.isDisabled())) { await b.click(); done.unit = done.unit || st.day; log('  rifle section bought'); } else await page.evaluate(() => { closeMenu(); UI.mode = 'idle'; }); }
    if (turn === 6) await page.screenshot({path:SHOTS + '/opening-desktop.png'});
    // the army: up to four units each turn march on the enemy; anything in reach gets fired on through the forecast
    if (done.unit) {
      const movers = await page.evaluate(() => G.units.filter(u => u.team === 1 && !u.done && !u.d.fixed && u.role !== 'harv').slice(0, 4).map(u => u.id));
      for (const id of movers) {
        const plan = await page.evaluate(id => { const u = G.units.find(o => o.id === id); if (!u || u.done) return null; const r = reach(u, u.x, u.y);
          const foe = G.units.filter(o => o.team !== 1 && seen(o) && canHit(u, o)).find(o => { UI.reach = r; return !!attackFrom(u, o); });
          if (foe) return {u:[u.x, u.y], foe:[foe.x, foe.y]};
          const h = bbHQ(2) || {x:25, y:14}; let best = null, bd = 1e9; for (const n of r.values()) { if (!canStop(u, n.x, n.y) || unitAt(n.x, n.y)) continue; const d = Math.abs(n.x - h.x) + Math.abs(n.y - h.y); if (d < bd) { bd = d; best = [n.x, n.y]; } }
          return {u:[u.x, u.y], to:best}; }, id);
        if (!plan) continue;
        await clickTile(page, plan.u[0], plan.u[1]);
        if (plan.foe) { await clickTile(page, plan.foe[0], plan.foe[1]); await page.waitForTimeout(900);
          const go = await page.$('#fcGo'); if (go && await go.isVisible()) { const before = await page.evaluate(() => G.stats[1].dmg); await go.click(); await page.waitForTimeout(1500);
            const after = await page.evaluate(() => G.stats[1].dmg); if (after > before) { attackedOn = st.day; done.attack = st.day; log('  ATTACK made, damage', after - before); await page.screenshot({path:SHOTS + '/attack-desktop.png'}); } }
          else await page.evaluate(() => cancel()); }
        else if (plan.to) { await clickTile(page, plan.to[0], plan.to[1]); await page.waitForTimeout(700); const w = await page.$('#menu:not([hidden]) button:has-text("Wait")'); if (w) await w.click(); else await page.evaluate(() => { cancel(); cancel(); }); }
        await page.waitForTimeout(200);
      }
    }
  }
  log('opening checks', JSON.stringify(done));
  // save and resume: quit to the title mid-game, then resume from the Base Building screen
  const before = await page.evaluate(() => JSON.stringify({day:G.day, turn:G.turn, funds:Object.values(G.teams).map(T => T.funds), units:G.units.length, grain:Object.values(G.bb.grain).reduce((a, b) => a + b, 0), map:G.bb.map}));
  await page.click('#quit'); await page.waitForTimeout(500);
  const saved = await page.evaluate(() => ({bb:!!localStorage.getItem('if44bb1'), camp:!!localStorage.getItem('if44auto2')}));
  await page.click('#bbase'); await page.waitForTimeout(300);
  const canResume = await page.isVisible('#bbresume');
  await page.click('#bbresume'); await page.waitForTimeout(800);
  const after = await page.evaluate(() => JSON.stringify({day:G.day, turn:G.turn, funds:Object.values(G.teams).map(T => T.funds), units:G.units.length, grain:Object.values(G.bb.grain).reduce((a, b) => a + b, 0), map:G.bb.map}));
  log('save slots', JSON.stringify(saved), 'resume offered', canResume, 'state equal', before === after); log(' before', before); log(' after ', after);
  await endTurn(page); const back = await waitHumanTurn(page, 1); log('turn after resume ok', back, await page.evaluate(() => G.day));
  await page.screenshot({path:SHOTS + '/resumed-desktop.png'});
  log('console errors', errors.length, errors.slice(0, 8));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
