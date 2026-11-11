// shared Playwright helper: open the built game, collect console errors
/* Run from this folder with the game served at BB_URL (default http://127.0.0.1:8791/index.html), for example
   `python3 -m http.server 8791` in the repository root, then `node opening.js`, `node phone.js`, `node batch.js beauce 2 24 80` ... */
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright')); }
const URL = process.env.BB_URL || 'http://127.0.0.1:8791/index.html';
const SET = {flags:'hist', sound:false, music:false, anim:true, aiFast:true, battle:false, vol:.8, fx:true, tips:false, difficulty:'normal', gore:'standard'};
async function open(opts = {}) {
  const browser = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const ctx = await browser.newContext(Object.assign({viewport:{width:1280, height:800}}, opts.ctx || {}));
  const page = await ctx.newPage(); const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('dialog', d => d.accept());
  await page.addInitScript(([set, keep]) => { if (!sessionStorage.getItem('inited')) { sessionStorage.setItem('inited', '1'); if (!keep) localStorage.clear(); localStorage.setItem('if44seen', '99'); localStorage.setItem('if44set', JSON.stringify(set)); } }, [Object.assign({}, SET, opts.set || {}), !!opts.keepStorage]);
  await page.goto(URL + (opts.hash || ''), {waitUntil:'load'});
  await page.waitForTimeout(800);
  return {browser, ctx, page, errors};
}
/* click a map tile the way a player does: bring it on screen, then a real pointer click on the canvas */
async function clickTile(page, x, y, touch) {
  const [sx, sy] = await page.evaluate(([x, y]) => { centerOn(x, y); return [(x * ART + ART / 2 - cam.x) * cam.z, (y * ART + ART / 2 - cam.y) * cam.z]; }, [x, y]);
  if (touch) await page.touchscreen.tap(sx, sy); else await page.mouse.click(sx, sy);
  await page.waitForTimeout(150);
}
/* dismiss a general's speech or a hand-over screen if one is up */
async function clearOverlays(page) {
  for (let i = 0; i < 6; i++) {
    const up = await page.evaluate(() => ({d:!$('#dialog').hidden, h:!$('#handoff').hidden, t:!$('#tip').hidden}));
    if (up.d) { await page.click('#dialog'); await page.waitForTimeout(80); await page.click('#dialog').catch(() => {}); }
    else if (up.h) await page.click('#handoff');
    else if (up.t) await page.click('#tip button').catch(() => {});
    else return;
    await page.waitForTimeout(150);
  }
}
/* wait until it is a human's turn with nothing animating */
async function waitHumanTurn(page, team, ms = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await clearOverlays(page);
    const ok = await page.evaluate(t => G && !G.over && G.turn === t && !UI.busy && !isAI(G.turn) && $('#handoff').hidden && $('#dialog').hidden, team);
    if (ok) return true;
    if (await page.evaluate(() => !G || !!G.over)) return false;
    await page.waitForTimeout(250);
  }
  throw new Error('timed out waiting for turn of ' + team);
}
module.exports = {open, clickTile, clearOverlays, waitHumanTurn};
