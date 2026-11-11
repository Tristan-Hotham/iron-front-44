# Changelog

## Version 16 (November 2026)

### New
- **Base Building**, a turn-based, Command & Conquer-style mode beside Skirmish on the title screen, for two to eight players: people taking turns on one device and Normal or Hard computer generals, free-for-all or in teams, with fog of war and an optional turn limit. Build a base inside the zone round your HQ (Fuel Dump, Supply Depot, Barracks, Vehicle Works, Engineer Yard, Airfield, MG nests and anti-tank guns), send lorries to cut the wheat, and destroy every enemy HQ. Three maps: Beauce Wheatlands (2 players), Kuban Steppe (4) and the Great Hungarian Plain (8). It saves in its own slot, so campaign saves and progress are untouched. Design in `docs/base-building-mode.md`, prototype notes and test results in `docs/base-building-notes.md`; generals' powers, walls, selling and online play are not in this mode yet.
- **Operation Exporter**, a campaign of three battles in Syria and Lebanon, June and July 1941: the crossing of the Litani, Mezzeh and Damascus, and Damour. Four new commanders: John Lavarack, Wilfrid Lloyd, Arthur "Tubby" Allen and Henri Dentz. Sources are in `docs/levant-1941-sources.md`.
- `tools/smoke.js`, a Playwright smoke test that plays the built game on desktop and phone; `tools/basebuild-tests/`, Playwright scripts for Base Building (AI games, a scripted opening, save and resume, hot-seat, phone); and `tools/build.js`, a Node twin of `build.ps1`.

### Fixed
- On phones, a field note could cover the order menu after moving a unit, so you could not fire or wait. Orders and the attack forecast now sit above field notes, and on phones the notes sit above the bottom bar.
- Orders were accepted while a turn's banner and opening speeches were still playing. Ending the turn early let the old turn finish during the enemy's turn and save the game in the middle of it.
- One right-click stepped back twice (from the order menu straight past the move).
- The first field note, and the Basic Training briefing, told phone players to right-click, hover and press keys.
- The minimap covered the enemy general's power stars, and on short windows it overlapped the zoom buttons.
- A defeat played a random army's lament (Umi Yukaba after the River Plate). It now plays your own (The Last Post, Taps); armies without one get Chopin's funeral march. Laments no longer turn up in an army's battle music.

### Changed
- Phones: End turn has a full-width row and every HUD button is at least 44 pixels high.
- The view glides to the action instead of jumping; small maps open in the middle of the screen, and larger ones open full of map rather than half empty.
- Damage numbers are larger and red, and a hit that costs no strength says "no loss" instead of "-0".
- Clearer HUD text: the date and turn line is larger and brighter, and unearned power stars show as outlines.
- Reduced motion is honoured: no camera shake (on the map or in battle scenes), a still title camera and no camera glide.
- A one-time field note says that long enemy turns can be sped up.
- Battle count: 152 battles in twenty-four campaigns, plus Basic Training.

No unit data, historical facts or balance numbers of existing battles were changed.
