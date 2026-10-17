# What Iron Front '44 learnt, for Neon Protocol

Neon Protocol and Iron Front '44 share the same bones: an Advance Wars-style turn-based tactics game in one HTML file, AI on both sides, missions, waves and a map builder. This note covers how Iron Front was tested and balanced, and the bugs that process found. The game was tuned over roughly 2,500 AI-vs-AI games.

## 1. The test harness

### Hash routes on the built page
- **`#validate`** loads every mission, checks maps, units, objectives and events, renders every sprite and portrait, and prints `validate: all clear` or a list of problems. Run it after every build. Also read the console: one stray quote kills the whole script.
- **`#autoplay`** has the AI play every mission against itself, with no animation (a `FAST` flag skips every wait).
- **`#testers?name=X&p=a,b,c&ids=m1,m2`** is the persona run (section 2). It writes a table to `reports/X.txt`.

### How results reach the disk
The dev server (`serve.ps1`) has two POST endpoints:
- `/report/<name>` saves a text report.
- `/shot/<name>` saves a canvas `toDataURL` as a PNG.

So a test run in the browser leaves files you can diff, and a screenshot you can open, without anyone copying text out of the page.

### Keep long runs alive
Background tabs throttle `setTimeout` to about 1 per second, so a run hangs when the tab loses focus. Yield with a `MessageChannel` instead (the game's `yieldNow()`) and keep the tester tab in front. Wait for the report file from a shell loop rather than polling the page.

### Speed
After caching threat maps per turn and distance fields per goal set, 472 full games take under 10 minutes. Fast enough to re-run the whole suite after every AI change, and it should be: one fix moved a single mission from 100% to 25%.

## 2. Persona testers

Each mission is played once by each persona on the player's side, while the enemy plays its own general's temperament. A persona is a set of multipliers on the AI's move-scoring terms:

| Persona | What it does | What it finds |
|---|---|---|
| Methodical | The default AI, balanced | The baseline |
| Aggressive | Advance ×1.45, fear ×0.35 | Missions that punish pushing |
| Cautious | Cover ×1.7, fear ×1.9 | Missions that stall or time out |
| Opportunist | Capture ×1.7 | Economy and capture balance |
| Reckless | Random noise on every move, ignores danger | Map holes, crashes, odd states |
| Rusher | Ignores everything but the objective | **Exploits**: a fast win flags a cheese route |
| Turtle | Barely advances | **Too easy**: if it still wins early, so will anyone |
| Sniper | Hangs back, trades fire | Whether attrition alone wins |

### The report
One row per mission:

```
mission       metho aggre cauti oppor reckl rushe turtl snipe  rate  verdict
singapore     W13   W13   W12   W12   L21   W14   W17   W13    88%   easy
```

Under each row it writes automatic flags:
- `N units never moved`
- `over on day 2`
- `CRASH: message`
- `rusher won on turn 3 of 12`
- `turtle won on turn 6`

### Lessons on the flags
- **Only flag a rusher win when the objective can actually be rushed.** Early wins on kill, sink or convoy missions are just combat ending, not an exploit. Iron Front's first reports were full of false alarms.
- **Gate the turtle flag on "won in under 60% of the time limit".** Otherwise it fires constantly, because even a turtle advances once time runs short.
- **Generate the in-game difficulty labels from the report.** A script (`tools/difficulty.ps1`) turns win rates into a table, so the briefing's "Hard" label is measured, not guessed.
- **Results swing by about ±25% between runs.** Eight games is a small sample, so only act on a mission that is weak in two runs in a row.

## 3. Symmetry tests (do these before balancing anything)

- **`symTest()`** plays mirrored maps with identical armies.
- **`mirrorDiff()`** compares the AI's choices from each side.

**Finding:** side 2 (the higher-coordinate side) won mirrored maps far too often. Every tie-break favoured it:
- factories built in array order
- captures that tied on score
- units processed in index order

**Fix:** break every tie symmetrically. Use distance toward the enemy's centre of mass, plus a tiny random epsilon. Until this is fixed, every balance number is wrong.

## 4. AI bugs the testers found

Each is a general pattern worth searching Neon for.

1. **Build scoring blown up by expensive targets.** The build score was damage × target cost. Destroyers offshore (cost 22,000) made artillery score 421 while the "already own too many" penalty was 8, so the AI built 19 guns and never took the objective.
   - **Fix:** put every term on the same scale as the bonuses, cap target value, and weight unreachable targets (ships, for a land depot) at about 0.3.
   - **Check:** log the build list per turn for one mission. Monocultures stand out.
2. **The HQ jam.**
   - **What happened:** 50 units crowded the single road into an enemy HQ, and a unit that couldn't capture (a bomber, as it turned out) parked on the HQ tile. The infantry could never step on, and every game timed out.
   - **Root cause:** there was already a "keep off enemy property" penalty, but aircraft were exempt, and the unit had nowhere to go anyway.
   - **Fix:** apply the penalty to every unit that can't capture, aircraft included, and add a smaller penalty for standing next to the enemy HQ.
   - **Diagnosis:** print an ASCII map at the end of a lost game with `C` for capturers, `1` for other own units, `X` for enemies and `H` for the HQ. The jam was obvious at a glance.
3. **Walking into fire.**
   - **Fix:** a threat map per target class (what can hit infantry is not what can hit tanks), plus a fear term.
   - **Side effect:** fear made the AI stall. It needed fear that decays over the days, and urgency as the time limit nears.
4. **Hold-out missions won by camping.** Defenders sat on the HQ and let everything else fall.
   - **Fix:** a "hold half your starting ground" rule, with its own loss reason (`overrun`).
5. **Squatting on your own factory** blocks production. Penalise it when there's money to spend.
6. **Stranded infantry on islands.** Detect units with no land path to a goal, then build and route transports.
7. **The AI never closed out a won game.** Units circled at the limit of their reach. HQ-blocker kill bonuses and urgency fixed it.

## 5. Engine bugs the process found

- **Called with the wrong argument types.** A visibility helper was called as `seen(x, y)` when it takes `seen(unit)`. It threw a console error, and with fog on every voice bark was silently hidden. Grep for every call site whenever a helper's signature changes.
- **Map generators overwriting key tiles.** Random towns could land on the HQ. Re-check required tiles after generating.
- **Missing per-army definitions.** One army had no gun nest, so its scripted reinforcements spawned nothing. `#validate` now resolves every unit that every mission references.
- **A world-map seam:** two land polygons that didn't quite meet left a hairline of sea. Close shared edges exactly, and draw land twice: outlined, then filled without outlines.

## 6. Mode-specific checks

- **Wave survival:**
  - Cap live enemy units (24 + the wave number), or late waves freeze the game.
  - Show a scout report of the next wave.
  - Grant supplies each wave.
  - Keep a best score per map and army, and only overwrite it when beaten.
  - `waveReport()` has the AI defend on two maps for each army. It should hold 3 to 7 waves on Normal.
- **Map builder:**
  - A one-click balance check that plays nine AI-vs-AI games.
  - A problems check: no HQ, unreachable objectives, units in water.
  - Share codes that are deflated and base64-encoded, and treated as untrusted on import.
- **Watch mode:** AI vs AI with the camera following. Great for spotting dumb moves by eye. Don't record progress or medals from watched games.

## 7. Tooling gotchas (Windows and PowerShell)

- `R` is a PowerShell alias (`Invoke-History`), so don't name a helper `R`.
- `''` inside double-quoted PowerShell strings, and `` `$ `` inside here-strings, silently mangle JavaScript. Use the Edit tool for code changes, not string replaces in shell.
- `WriteAllLines` writes CRLF, which breaks later multi-line matches. Write UTF-8 without a BOM using `\n`.
- After rebuilding, reload the page with a cache-busting query (`?v=N`) or you'll test the old build.

## 8. The loop that worked

1. Run the full persona suite and read the table.
2. Pick the worst row that is weak in two runs.
3. Replay it once with tracing: builds per turn, end-state ASCII map, units left, owners of the key tiles.
4. Find the root cause in the AI or the engine. Change the mission only when the behaviour is fine and it's genuinely a tuning problem (a time limit, say).
5. Re-run just that mission and its neighbours, using `&ids=`.
6. Re-run the full suite, check nothing else moved more than the noise, then regenerate the difficulty table, validate and publish.
