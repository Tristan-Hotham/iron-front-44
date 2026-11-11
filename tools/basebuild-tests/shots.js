/* screenshots of the middle and the end of a game at desktop and phone size, from AI games played forward headless */
const {open} = require('./pw.js');
const SHOTS = process.env.SHOTS || require('path').join(__dirname, '..', '..', 'shots');
async function stage(page, map, n, day, focusSeat, zoom, nats) {
  return page.evaluate(([map, n, day, focusSeat, zoom, nats]) => {
    const players = Array.from({length:n}, (_, i) => ({nat:nats[i % nats.length], ai:'normal'}));
    for (let tries = 0; tries < 6; tries++) { const r = bbSimGame({map, players, funds:8000}, day, {keep:true}); if (!G.over) break; }
    FAST = false; EPOCH++; UI.busy = false; UI.overShown = false; G.watch = true;
    enterGame(); cam.z = zoom; const h = bbHQ(focusSeat) || bbHQ(G.bb.seats.find(t => !G.bb.out[t])); const a = G.bb.ai[h.team], th = a && bbHQ(a.target);
    centerOn(th ? Math.round((h.x * 2 + th.x) / 3) : h.x, th ? Math.round((h.y * 2 + th.y) / 3) : h.y); UI.cursor = {x:h.x, y:h.y}; hud(); infoPanel();
    return {day:G.day, out:G.bb.out};
  }, [map, n, day, focusSeat, zoom, nats]);
}
(async () => {
  for (const [w, h, tag, mob] of [[1280, 800, 'desktop', false], [390, 844, 'phone', true]]) {
    const {browser, page, errors} = await open({ctx:{viewport:{width:w, height:h}, isMobile:mob, hasTouch:mob, deviceScaleFactor:mob ? 2 : 1}});
    console.log(tag, 'mid', JSON.stringify(await stage(page, 'kuban', 4, 26, 1, mob ? .5 : .7, ['us', 'ger', 'uk', 'su'])));
    await page.waitForTimeout(1500); await page.screenshot({path:`${SHOTS}/mid-${tag}.png`});
    console.log(tag, 'late', JSON.stringify(await stage(page, 'alfold', 8, 40, 1, mob ? .42 : .55, ['us', 'ger', 'uk', 'su', 'fr', 'ger', 'us', 'su'])));
    await page.waitForTimeout(1500); await page.screenshot({path:`${SHOTS}/late-${tag}.png`});
    // the result card at the end of a game
    await page.evaluate(() => { FAST = true; for (let i = 0; i < 6; i++) { bbSimGame({map:'beauce', players:[{nat:'uk', ai:'normal'}, {nat:'ger', ai:'normal'}], funds:8000}, 90, {keep:true}); if (G.over) break; }
      FAST = false; EPOCH++; UI.overShown = false; G.watch = true; enterGame(); const w = bbHQ(G.over.winner); if (w) centerOn(w.x, w.y); hud(); gameOver(); });
    await page.waitForTimeout(5000); await page.screenshot({path:`${SHOTS}/result-${tag}.png`});
    console.log(tag, 'console errors', errors.length, errors.slice(0, 5));
    await browser.close();
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
