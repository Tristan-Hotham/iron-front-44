/* AI-versus-AI batch: node batch.js map players games limit [diffs comma list] [nat] */
const {open} = require('./pw.js');
(async () => {
  const [map, n, games, limit] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5]];
  const diffs = (process.argv[6] || 'normal').split(','), nat = process.argv[7] || 'us', teams = (process.argv[8] || '').split(',');
  const {browser, page, errors} = await open();
  const rows = []; if (process.env.BONUS) await page.evaluate(b => { window.BONUS = +b; }, process.env.BONUS);
  for (let g = 0; g < games; g++) {
    const r = await page.evaluate(([map, n, limit, diffs, nat, teams]) => {
      const players = Array.from({length:n}, (_, i) => ({nat, ai:diffs[i % diffs.length], team:teams[i] || ''}));
      const x = bbSimGame({map, players, funds:8000, limit, seatBonus:window.BONUS}, limit + 5);
      return {winner:x.winner, winners:x.winners, why:x.why, day:x.day, out:x.out, stalls:x.stalls, cut:x.cut, maxAiMs:x.maxAiMs, maxTurnMs:x.maxTurnMs, ms:x.ms, errors:x.errors};
    }, [map, n, limit, diffs, nat, teams]);
    rows.push(r);
    console.log(`game ${g + 1}: winner ${r.winners.join('+') || '-'} by ${r.why} on day ${r.day}  out ${JSON.stringify(r.out)}  stalls ${r.stalls} cut ${r.cut} maxAI ${r.maxAiMs}ms maxTurn ${r.maxTurnMs}ms  ${r.ms}ms  errors ${r.errors.length}`);
  }
  const wins = {}; for (const r of rows) for (const w of r.winners) wins[w] = (wins[w] || 0) + 1 / r.winners.length;
  const hq = rows.filter(r => r.why === 'hq').length, days = rows.map(r => r.day).sort((a, b) => a - b);
  console.log(`SUMMARY ${map} ${n}p ${games} games limit ${limit} diffs ${diffs}: wins by seat ${JSON.stringify(wins)} · decided by HQ ${hq}/${games} · median day ${days[days.length >> 1]} · max day ${days[days.length - 1]} · stalls ${rows.reduce((s, r) => s + r.stalls, 0)} · AI cut-offs ${rows.reduce((s, r) => s + r.cut, 0)} · max AI ms ${Math.max(...rows.map(r => r.maxAiMs))} · errors ${rows.reduce((s, r) => s + r.errors.length, 0)} · console ${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 5));
  await browser.close();
})();
