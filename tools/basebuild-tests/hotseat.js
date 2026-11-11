/* hot-seat: two people and a computer on one device with fog on; the hand-over screen hides the map between human turns */
const {open, clickTile, waitHumanTurn} = require('./pw.js');
const SHOTS = process.env.SHOTS || require('path').join(__dirname, '..', '..', 'shots');
const log = (...a) => console.log(...a);
(async () => {
  const {browser, page, errors} = await open();
  await page.click('#bbase'); await page.waitForTimeout(300);
  await page.selectOption('#bbmapsel', 'kuban'); await page.waitForTimeout(200);
  const seats = await page.$$('#bbsetup .seat');
  const set = async (i, who, nat, tm) => { await (await seats[i].$('.who')).selectOption(who); await (await seats[i].$('.nat')).selectOption(nat); if (tm != null) await (await seats[i].$('.tm')).selectOption(tm); };
  await set(0, 'human', 'su', 'A'); await set(1, 'normal', 'ger', 'B'); await set(2, 'human', 'uk', 'A'); await set(3, 'hard', 'ger', 'B');
  await page.selectOption('#bbfog', 'on');
  await page.screenshot({path:SHOTS + '/setup-teams-desktop.png'});
  await page.click('#bbgo'); await page.waitForTimeout(1500);
  const sawHandoff = [];
  for (let k = 0; k < 40; k++) { if (await page.isVisible('#dialog')) await page.click('#dialog').catch(() => {}); if (await page.isVisible('#handoff')) { sawHandoff.push(await page.evaluate(() => [G.turn, $('#handoff h2').textContent])); if (sawHandoff.length === 1) await page.screenshot({path:SHOTS + '/handoff-desktop.png'}); await page.click('#handoff'); break; } await page.waitForTimeout(250); }
  await waitHumanTurn(page, 1);
  const v1 = await page.evaluate(() => ({viewer:viewerTeam(), fogged:!!UI.vis, seesEnemyHQ:seen(bbHQ(2)), seesAllyHQ:seen(bbHQ(3)), hotseat:isLocalHotseat()}));
  log('seat 1 view', JSON.stringify(v1));
  await page.click('#endturn'); await page.waitForTimeout(200); { const b = await page.$('#menu:not([hidden]) button:has-text("End turn anyway")'); if (b) await b.click(); }
  for (let k = 0; k < 200; k++) { if (await page.isVisible('#handoff')) { sawHandoff.push(await page.evaluate(() => [G.turn, $('#handoff h2').textContent])); await page.click('#handoff'); break; } await page.waitForTimeout(250); }
  await waitHumanTurn(page, 3);
  const v3 = await page.evaluate(() => ({viewer:viewerTeam(), turn:G.turn, allies:bbAllied(1, 3), foe:bbFoe(1, 2), canShootAlly:G.units.filter(u => u.team === 3).some(u => G.units.some(o => o.team === 1 && canHit(u, o)))}));
  log('seat 3 view', JSON.stringify(v3), 'hand-overs', JSON.stringify(sawHandoff));
  await page.screenshot({path:SHOTS + '/hotseat-desktop.png'});
  log('console errors', errors.length, errors.slice(0, 6));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
