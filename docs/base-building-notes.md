# Base Building mode: prototype notes

Released in version 16 together with the playtest fixes. Design: `docs/base-building-mode.md`. These are the prototype's notes and test results as built on the branch `claude/base-building-mode`.

## How to play it

Title screen, **Base Building** (beside Skirmish). Pick a map, set each seat (You, Computer, Computer (Hard), or Empty from seat 3 on), army, general and team, then funds, fog and an optional turn limit. In the game: click your HQ, or press **B** or **Build**, to construct; click a production building to buy a unit; lorries run themselves. Quitting autosaves; the Base Building screen then offers **Resume saved game**.

## What is playable

- The whole loop on all three maps (Beauce Wheatlands 2p, Kuban Steppe 4p, Great Hungarian Plain 8p): HQ, Fuel Dump, Supply Depot, Barracks, Vehicle Works, Engineer Yard, Airfield, MG nest and anti-tank gun, with build times, the build zone, fuel, one-step tech gating, one unit per building per turn and a unit cap.
- Harvest economy: wheat fields that are cut to stubble and regrow, self-driving lorries, income shown in the turn banner and the HUD, lorry bounty and building salvage.
- 2 to 8 players, any mix of hot-seat people and Normal or Hard computer generals, free-for-all or teams A to D (allies share vision, never fire on each other and win together), fog on or off, turn limit with score.
- Elimination when an HQ falls; result card ranking every side.
- Save and resume in its own slot (`if44bb1`); campaign save (`if44auto2`) and progress (`if44prog2`) untouched.
- Phone layout (390 x 844, touch): setup, build menu, placement, production, moving and ending turns all by tap, no horizontal scroll.
- Engineers can repair an adjacent damaged building (Repair building in their order menu).

## Stubbed or left out

- Generals' powers are switched off in this mode (their always-on effects still apply).
- No selling, no walls or gates, no naval yard, no capturing buildings, no rebuilding a lost HQ.
- Lorries cannot be given orders by hand; they always drive themselves.
- No online or turn-code play for this mode; no map editor for base maps; only the three built-in maps.
- The AI does not use engineers to repair, does not build APCs, and plays the same opening every game (with small random tie-breaks).
- No medals or Service Record entries from this mode.

## Known issues

- Lorry moves at the start of a turn are applied instantly (dust and a float text), not animated along the path.
- When several seats share one army, sprites are identical; only the coloured ring, frame and pennant tell them apart.
- The map can be scrolled well off its left and top edges (inherited camera behaviour), which on the phone shows a dark margin at the start of a game.
- On a 4 or 8-seat map with only two players the bases are far apart and AI games tend to run to the turn limit (see results).
- Results swing by roughly plus or minus 20 points between runs of 20 games, as Iron Front's own notes warn; treat single-run seat rates with care.

## Test results

All runs are headless AI-against-AI games with the same army (US) and generals on every seat, so position is the only difference. The tests used the default seat bonus. A turn limit stops each game: the side with the highest score wins if no HQ has fallen by then. Across all of them there were no console errors, no script errors, no stalled turns (an AI turn that took over 4 s, or a whole round with nothing changing) and no AI turns cut off by the planning budget. The slowest single AI turn spent 2.2 s planning, on the 8-player map.

| Map | Players | Games | Wins by seat (start position) | Won by destroying HQs | Median day |
|---|---|---|---|---|---|
| Beauce Wheatlands | 2 | 24 | 11 / 13 | 21 of 24 | 58 |
| Kuban Steppe | 4 | 24 | 7 / 6 / 7 / 4 | 21 of 24 | 81 |
| Great Hungarian Plain | 8 | 20 | 4 / 2 / 4 / 0 / 6 / 2 / 1 / 1 | 12 of 20 | 94 |
| Kuban Steppe | 2 | 6 | 2 / 4 | 5 of 6 | 76 |
| Great Hungarian Plain | 2 | 6 | 3 / 3 | 1 of 6 | 81 (limit) |
| Great Hungarian Plain | 4 | 8 | 5 / 0 / 2 / 1 | 4 of 8 | 101 (limit) |
| Kuban Steppe, teams (1 and 3 against 2 and 4) | 4 | 8 | team A 4, team B 4 | 7 of 8 | 66 |
| Beauce, Hard against Normal (both seat orders) | 2 | 20 | Hard won 17 | 19 of 20 | 54 |

**Fairness fix:** the first Beauce run, with no seat bonus, went 17 to 7 for seat 1, the player who moves first. With the seat bonus (the second seat starts with 1,500 more), Beauce went 12 to 12 and then 11 to 13. The 8-player spread (expected 2.5 wins per seat) and the 4-player spread are within what 20 to 24 games can tell apart. Seat 4's zero on the 8-player map is worth re-checking with a larger run.

**Interface (Playwright with Chromium, desktop 1280 x 800):**
- A scripted human-versus-AI opening on Beauce, played with real clicks: depot on turn 1; grain delivered on day 3; a lorry bought on day 3; barracks; a rifle section on day 4; an attack through the forecast on day 10.
- Quitting autosaved to `if44bb1` only. Resume brought back an identical state (day, turn, funds, units and grain), and the next turn played.
- A hot-seat game with teams and fog: hand-over screens only before human turns, allies sharing vision, and no friendly fire.
- The first battle of the first campaign (Basic Training) and the first combat battle (Pointe du Hoc) each started and played a full turn. Campaign Continue and progress were kept, and Skirmish still launched.
- `#validate` reported all clear.

**Phone (390 x 844, touch):** setup, the build menu, placing a depot, barracks and a fuel dump, buying a unit, moving it and ending turns, all by taps, with no horizontal overflow. No console errors in any interface run.

## Files

- `src/basebuild.js`: the whole mode, in ten labelled sections (rules, maps, setup, turn flow, engine and AI hooks, the computer general, drawing, interface, setup screen, headless test runner). It wraps existing functions (the pattern `desert.js` and `italy.js` already use) and each wrapper steps aside unless `G.bb` exists.
- `src/net.js`: one line, `isLocalHotseat` (a `const`, so it could not be wrapped) now counts people in a base-building game.
- `build.ps1`: `basebuild.js` added to the module order before `test.js`. `tools/build.js`: a Node twin of `build.ps1` for Linux and macOS (it reproduced the committed `index.html` byte for byte before any change).
- `tools/basebuild-tests/`: the Playwright scripts (batch AI games, scripted opening, phone, hot-seat, campaign check, screenshots, `#validate`).
- `README.md`: the mode in the list, and the Node build line.

## Next steps

1. A human playtest of the opening and of the Hard AI, which AI-against-AI play cannot judge (Neon found base AIs snowball harder against people than against each other).
2. Animate lorry moves; add a lorry order (go to this field) for players who want control.
3. Generals' powers in this mode, made team-aware (heals and strikes currently assume two sides).
4. More maps, and base maps in the Map Builder with the symmetry check.
5. Measured difficulty labels for Normal and Hard from a larger sweep.

## Merging with the playtest-polish branch

- Rebase this branch onto playtest-polish rather than merging `index.html`: it is generated, so take theirs and rebuild with `node tools/build.js` (or `build.ps1`).
- The only hand-edited shared source lines are `src/net.js` (`isLocalHotseat`) and the module list in `build.ps1`; expect at most trivial conflicts there.
- `basebuild.js` relies on these names and argument orders staying the same: `startTurn, endTurn, checkEnd, effects, charge, attack, kill, aiEdge, canHit, targetsFrom, aiFoes, aiKnown, enemyHQ, aiGoals, aiBuild, aiNext, viewerTeam, handoff, computeVision, teamCol, autosave, clearAutosave, fxBark, battleScene, banner, fxWrecks, drawUnit, infoPanel, hud, selectTile, cancel, openActions, gameOver`, plus `menuAt`, `spawn`, `reach`, `distField`, `planUnit`'s use of `cache.odds`, and the HUD ids `#top`, `#co1`, `#co2`, `#goal`, `.acts`, `#endturn`, `#quit`. If polish renames any of them, or turns a function declaration into a `const`, the wrapper must follow.
- After merging, run `#validate` and the scripts in `tools/basebuild-tests/` (opening, phone, campaign, and a short `batch.js` per map).
