const {open} = require('./pw.js');
(async () => {
  const {browser, page, errors} = await open({hash:'#validate'});
  await page.waitForFunction(() => window.TEST && window.TEST.bad != null, null, {timeout:300000});
  const out = await page.evaluate(() => ({bad:window.TEST.bad, tail:document.querySelector('#testout').textContent.trim().split('\n').slice(-3)}));
  console.log(JSON.stringify(out)); console.log('console errors', errors.length, errors.slice(0, 5)); await browser.close();
})();
