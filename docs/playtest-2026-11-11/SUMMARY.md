# Playtest, 11 November 2026

Build tested: `main` at b51758b (GAME_VERSION 15), served from a local static server and driven by Playwright with Chromium at 1280×800 (mouse) and 390×844 (touch, iPhone-sized). Player turns were played through the real interface: tap or click the unit, tap the destination, pick the order from the action menu, confirm on the forecast, End turn. The adviser's planner chose the moves.

## What was played

| Battle | Type | Size | Result | Notes |
| --- | --- | --- | --- | --- |
| Basic Training | land, tutorial | desktop | won, turn 7 (rank A) | all four lessons fired; core-force promotions worked |
| Mokra (Fall Weiss 1) | land | phone | blocked on turn 1 | see finding 1 |
| River Plate (War at Sea 1) | naval | desktop | lost, turn 15 | losing path and defeat screen checked |
| Taranto (Carrier War 1) | air | desktop | won, turn 6 | long turns with set-piece battle scenes on |
| Berlin (Eastern Front, last) | land, late | desktop | two turns, via Unlock all | 65 units, 40×26 map |

Also checked: save and resume (reload, then Continue) on River Plate and Taranto; quit to title then Continue on Berlin; resizing to 820×600 and back mid-battle; Settings (music and sound off, saved, back on); Unlock all missions; the built-in `#validate` (all clear) and `#autoplay`, in which the AI played all 149 battles against itself with no crash, no console error and no unfinished game.

## Findings, most severe first

### 1. Phone: a field note covers the order menu (high)
On a phone the field note sits at the top of the screen (z-index 26), on top of the action menu (Fire, Capture, Wait) and the attack forecast (z-index 20), which are also placed near the top. The notes fire when you first pick up artillery, a transport or engineers, so a new player moves a unit and then cannot see or tap the orders. The test driver could not tap Fire or Wait at all: the menu was covered.
Repro: phone, clear progress, Fall Weiss, Mokra, tap the artillery, tap a square. Screenshot: `phone-tip-hides-orders.jpg`.

### 2. Touch players are told to right-click, hover and press keys (medium)
The first field note says "Click one of your units… Right-click steps back. Hover over terrain… E ends your turn." on a phone, because it appears before the first touch is seen. The Basic Training briefing also says "Press H at any time for your adviser". Neither can be done on a phone. Screenshot: `phone-orders-tip-mouse-words.jpg`.

### 3. HUD pieces overlap (medium)
- The minimap (top 104 px) covers the bottom of the enemy general's card, hiding his power stars, at 1280×800 (`training-start-desktop.jpg`).
- At 820×600 the minimap and the zoom and map buttons overlap (`minimap-over-view-buttons.jpg`).
- On a phone the Menu button wraps onto its own row, so the bottom bar is ragged and End turn is no bigger than the other buttons (`phone-hud.jpg`).

### 4. Defeat plays another country's lament (low, but jarring)
Losing River Plate as the Royal Navy played "Umi Yukaba", the Imperial Japanese Navy's funeral song (`riverplate-defeat.jpg`). The defeat music is picked at random from every army's lament instead of the player's own (The Last Post for Britain, Taps for the US).

### 5. Small, faint text in the HUD (low)
The date and turn line under the clock is 12 px typewriter in a muted colour, and the unearned stars of the power meter are almost black on black, so you cannot see how far the meter has to go. On a phone the objective drops to 9.5 px.

### 6. Reduced motion only partly honoured (low)
With `prefers-reduced-motion`, the banner and the power button stop animating, but the camera still shakes on explosions and the title painting still drifts and zooms.

### 7. Waiting on long turns (observation)
With battle scenes on, a Taranto turn took 50 to 75 seconds and a Berlin turn (65 units) about 105 seconds, most of it the enemy's moves. There is a Fast button during the enemy turn and a Fast enemy turns setting, but nothing tells a new player. The map runs at about 40 frames a second in headless Chromium (software rendering), with no long stalls.

### 8. Console noise (low)
Chrome warns "Multiple readback operations using getImageData…" many times while sprites are drawn. It is harmless (each sprite is read once and cached) and was left alone.

### 9. Balance note (no change made)
The AI playing the British lost River Plate without a hit in fifteen turns. The measured difficulty table already rates it Hard (38 to 44% AI win rate), which is fair for three light cruisers against the Graf Spee, but it is a steep first battle for The War at Sea.

### 10. Campaign map labels (low)
On the Eastern Front map the Berlin battle markers sit on top of the "Berlin" label (`campaign-map.jpg`).

## Not reproduced
No crashes, soft locks, AI stalls, save faults or broken events. Saves resumed on the same turn with the same units and funds. Quitting mid-turn put the unconfirmed move back, as designed.

## Found while fixing

### 11. Orders accepted during the turn's opening (medium)
While the day banner, the generals' opening words and a turn's events were still playing, the map took orders. Ending the turn in that window let the old turn finish later, during the enemy's turn, and autosave the game in the middle of it (found by the smoke test: a reload resumed on the enemy's half of the previous day). Orders now wait until the turn has opened.

### 12. One right-click stepped back twice (low)
Both the pointer-up handler and the context-menu handler stepped back, so a right-click in the order menu went straight past the move choice.

## Status after this round

| Finding | Status |
| --- | --- |
| 1. Field note covers the orders on phones | Fixed: orders and forecast sit above notes; on phones notes dock above the bottom bar |
| 2. Mouse and keyboard words for touch players | Fixed for the first field note and the Basic Training briefing |
| 3. HUD overlaps | Fixed: measured minimap and view-button layout; phone bottom bar on a grid with a full-width End turn and 44 px buttons |
| 4. Another country's lament on defeat | Fixed, and laments kept out of battle music |
| 5. Small, faint HUD text | Improved: larger, brighter date line and visible empty stars |
| 6. Reduced motion | Fixed for camera shake, battle-scene shake, the title camera and the new camera glide |
| 7. Long enemy turns | A one-time field note now points to the Fast button and setting; turn length itself unchanged |
| 8. getImageData warnings | Left: harmless, and changing the canvases risks slower drawing |
| 9. River Plate difficulty | Left: rated Hard by the testers already |
| 10. Campaign map labels | Left; the Levant coastline was redrawn for the new campaign |
| 11. Orders during the turn's opening | Fixed |
| 12. Double step-back on right-click | Fixed |
