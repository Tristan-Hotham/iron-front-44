# Base Building mode: design note

A turn-based, Command & Conquer-style mode for Iron Front '44, built on the game's own engine, art, units and rules, and on what Neon Protocol's base-building playtests taught. Up to eight players, any mix of people (hot-seat on one device) and computer generals, free-for-all or in teams.

## 1. The shape of a game

Every player starts with a **Headquarters**, a few infantry and some funds on a symmetric map. Wheat fields lie around each start, between neighbours and in the centre. You build a base inside the zone around your HQ, send lorries out to bring in the harvest, turn grain into an army, and **win by destroying every enemy Headquarters**. A player whose HQ falls is out: their remaining units surrender and their buildings are abandoned. An optional turn limit ends the game on score instead.

One turn is one day (so there is no night). Players move in seat order; the day advances when play returns to the first player still in the game.

## 2. Structures

Structures are fixed, unarmed units with their own sprites. That one decision (taken from Neon, where structures share the unit shape) means the existing combat, targeting, fog, forecast and AI code can hit, see and value them without new rules. Defences are the game's existing fixed units (machine-gun nests and dug-in anti-tank guns), which fire and counter-fire as they always have.

| Structure | Cost | Turns | Fuel | Needs | Does |
|---|---|---|---|---|---|
| Headquarters | start | | +6 | | Build zone, one construction crew, repairs units beside it |
| Fuel Dump | 1,500 | 1 | +8 | | Fuel for everything else |
| Supply Depot | 3,500 | 2 | -2 | | Comes with one lorry (half loaded); lorries unload here; builds lorries; may stand up to 10 tiles from the HQ |
| Barracks | 2,500 | 1 | -2 | | Infantry, engineers, anti-tank teams, mortars |
| Vehicle Works | 6,000 | 2 | -4 | Supply Depot | Armoured cars, half-tracks, medium tanks, artillery, anti-aircraft |
| Engineer Yard | 5,000 | 2 | -3 | Barracks | A second construction crew; unlocks heavy armour, rockets, anti-tank guns and the Airfield; repairs units beside it |
| Airfield | 8,000 | 3 | -5 | Vehicle Works, Engineer Yard | Fighters and fighter-bombers |
| MG Nest | 1,500 | 1 | -1 | Barracks | The army's machine-gun nest |
| Anti-tank Gun | 4,000 | 1 | -2 | Engineer Yard | The army's dug-in anti-tank gun |

**Build zone:** within 6 tiles (a square) of your HQ (5 on the eight-player map), on open ground, road, hills or ruins, never on a wheat field. Neon learnt that a zone that grows with every building lets a base creep across the map, so here it does not grow. The one exception is the Supply Depot, which may go 4 tiles further out as a forward depot beside the shared fields, where it is exposed. **Construction:** one structure at a time per crew (HQ, plus one with an Engineer Yard); paid up front, finished at the start of your turn when its count reaches zero. A site under construction can be shot at.

**Fuel** is the constraint. When use exceeds supply, construction takes a turn longer and production buildings only work on even days. HQ, Fuel Dumps and Supply Depots always work, so low fuel is never a death spiral (Neon's v0.6.3 lesson).

**Tech gating** is one step: the Engineer Yard. Everything else needs at most one other building.

Production buildings make one unit a turn, placed on a free tile beside them; it can move next turn. Units use their army's existing names, weapons and stats. A unit cap (40, 30 or 20 per player on the 2, 4 and 8-player maps) keeps eight-player turns quick.

## 3. Economy: the harvest

- **Wheat fields** (the existing wheat-field tile) hold grain, shown as the field turning to stubble as it is cut. Each holds up to 3,000 and regrows 100 a day, so cut fields come back slowly.
- **Lorries** (a period lorry for each army: Opel Blitz, GMC CCKW, Bedford, ZiS-5) are the harvesters: 2,000 cost, unarmed, 2,000 capacity, cut 1,000 a turn. A field cut below 300 is stubble and not worth stopping on.
- Lorries **run themselves** at the start of your turn (Neon's v0.6.1 lesson): unload if full and beside a depot, cut if on grain, otherwise drive to the field that pays best for the trip (what it can load, against the drive out and back to a depot) or home to a depot. A first version sent them to the nearest field, and they shuttled on stubble while the rich centre stood uncut.
- **Income is shown every turn:** the turn banner and the funds box give the HQ's 1,000 plus grain delivered that turn, and the field and lorry panels show what each holds.
- **The harvest war:** destroying an enemy lorry pays its load plus a 1,000 bounty (Neon's v0.6.1 rule), and destroying a building pays a quarter of its value in salvage. The AI's armoured cars hunt lorries.

## 4. Players, factions and setup

The setup screen picks the map (which fixes the number of seats), and for each seat: commander (You, Computer Normal, Computer Hard, or Empty on maps that allow fewer), army, general and team (free-for-all or teams A to D). Also starting funds, fog of war on or off, and an optional turn limit. Armies are the game's existing nations that field a complete set of land and air roles (the 1944 armies and any other complete one); each player gets a distinct colour, shown as a ring under every unit and a frame round every structure, since two players may pick the same army. Generals keep their always-on effects; their powers are switched off in this mode for the prototype. **Turn order compensation:** later seats start with a little more money, up to 1,500 for the last seat; in mirrored AI tests on the two-player map the first seat otherwise won 71% of games.

**Hot-seat:** with more than one person, a hand-over screen hides the map between human turns, and with fog on each person sees only their own side.

## 5. Maps

Three maps built from existing terrain tiles, each made exactly symmetric by construction (every tile is copied from its image under the map's symmetry group, and a test checks it):

| Map | Players | Size | Symmetry | Layout |
|---|---|---|---|---|
| Beauce Wheatlands | 2 | 30×20 | half-turn | Home fields behind each base, two flank fields, a rich centre across a stream with three bridges |
| Kuban Steppe | 4 | 34×34 | quarter-turn | Bases in the corners, fields between neighbours, a crossroads farm in the middle |
| Great Hungarian Plain | 8 | 48×48 | all eight turns and mirror images of a square | Two bases per side, a shared field between each pair, a ring road and a large central harvest |

The names are real grain-growing regions; the maps are fictional skirmish grounds, not reconstructions of any battle.

## 6. The computer general

It reuses the existing move planner (objective-aware scoring, threat maps, cover, focus fire) and adds a base and economy layer:

- **Opening:** depot, barracks, fuel, vehicle works, then defences toward its nearest enemy, a second crew, more fuel. Hard adds the airfield and a quicker build.
- **Economy:** up to three lorries per depot, another depot when the fields near the last one run low, and a second Vehicle Works when money piles up. It saves only for the economy's own buildings; defences and extras come from money the army does not need.
- **Buying:** it keeps a target mix (riflemen, anti-tank teams, tanks, guns, anti-aircraft when the enemy flies) and buys what is furthest below its share, saving for a tank rather than filling the gap with riflemen. The first versions bought 70 riflemen, then 35 armoured cars: Iron Front's monoculture lesson, met again.
- **Army:** gathers at a rally point in front of its base, then attacks one chosen enemy (the nearest HQ) once it has enough strength, and keeps that target until it falls. Units out in front wait for the rest (Neon's escort rule). When an enemy wave breaks on its line and it is clearly stronger, it counter-attacks at once. Anything that comes within 7 tiles of its base is fought first.
- **Two levels:** Normal and Hard. Hard builds faster, attacks sooner and fights with a small edge (+5%).
- **Never stalls:** each AI turn has a planning budget; when it runs out, the remaining units hold and the turn ends. Any error ends that unit's or that player's turn rather than freezing the game.

## 7. Saving, testing and what is out of scope

- **Save and resume:** autosaved at the start of every human turn and on quitting, in its own slot (`if44bb1`), separate from the campaign save. The setup screen offers "Resume".
- **Tests:** AI-against-AI games on every map at 2, 4 and 8 players with no console errors, no stalled turns and a winner; win rates by start position over at least 20 games per map; a scripted human opening; save and resume mid-game; and a check that the campaign's first battle still starts and plays a turn.
- **Not in this prototype:** generals' powers, selling and repairing buildings by hand, walls, naval yards, online and turn-code play for this mode, and a map editor for base maps.
