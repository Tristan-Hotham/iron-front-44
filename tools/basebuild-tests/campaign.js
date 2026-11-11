/* the campaign's first battle still starts and plays a turn; Skirmish still launches; existing saves are untouched by this mode */
const {open, clearOverlays, waitHumanTurn} = require('./pw.js');
const log = (...a) => console.log(...a);
(async () => {
  const {browser, page, errors} = await open();
  await page.evaluate(() => { localStorage.setItem('if44prog2', JSON.stringify({done:{training:true}, core:{}, all:false})); });
  const first = process.env.MISSION || await page.evaluate(() => CAMPAIGNS[0].missions[0]);
  await page.click('#bcampaign'); await page.waitForTimeout(300);
  await page.evaluate(id => openBrief(MISSIONS[id]), first); await page.waitForTimeout(500);
  await page.click('#brief .go'); await page.waitForTimeout(800);
  await waitHumanTurn(page, 1);
  const s1 = await page.evaluate(() => ({mission:G.mission.id, day:G.day, turn:G.turn, bb:!!G.bb, units:G.units.length, bar:$('#bbbar').hidden, build:$('#bbbuild').hidden, co2:$('#co2').hidden}));
  log('campaign started', JSON.stringify(s1));
  await page.click('#endturn'); await page.waitForTimeout(200); { const b = await page.$('#menu:not([hidden]) button:has-text("End turn anyway")'); if (b) await b.click(); }
  await waitHumanTurn(page, 1, 180000);
  const s2 = await page.evaluate(() => ({day:G.day, turn:G.turn, over:!!G.over, auto:!!localStorage.getItem('if44auto2'), bbsave:!!localStorage.getItem('if44bb1')}));
  log('after one full turn', JSON.stringify(s2));
  // quit: the campaign autosave is kept and Continue is offered; the base-building save slot is not touched
  await page.click('#quit'); await page.waitForTimeout(400);
  log('continue offered', await page.isVisible('#continue'), 'progress kept', await page.evaluate(() => JSON.parse(localStorage.getItem('if44prog2')).done.training));
  // skirmish still launches
  await page.click('#bskirmish'); await page.waitForTimeout(200); await page.click('#sgo'); await page.waitForTimeout(800); await clearOverlays(page);
  log('skirmish started', await page.evaluate(() => !!G && !G.bb && G.teams[1] && G.teams[2] && G.objective.win));
  log('console errors', errors.length, errors.slice(0, 6));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
