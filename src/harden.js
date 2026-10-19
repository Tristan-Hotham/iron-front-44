/* ============================== HARDER BATTLES ==============================
   The 50-tester panel won about twenty battles almost every time (95-100%). Each gets a tighter clock
   (set from the day the testers usually won on), a stronger enemy, or a stiffer convoy or escort target,
   so a win still has to be earned. Arras and Montcornet stay one-sided on purpose (historical routs, and
   labelled so), and Basic Training stays gentle. */
const HARDEN = {
  cobra:        {limit:13, inc2:.7},          // Operation Cobra: the breakout has to come before Panzer Lehr's reserves arrive
  falaise:      {limit:10},                   // close the pocket before the Germans get out
  paris:        {limit:14},
  remagen:      {limit:10},                   // the bridge was only standing for ten days
  prokhorovka:  {limit:14},                   // the SS panzer corps had days, not weeks, before Kursk was called off
  bagration:    {limit:16},
  berlin:       {limit:13},
  kharkov:      {limit:21},
  westerplatte: {limit:15},                   // the Germans planned to take it in hours; it held a week
  bzura:        {limit:15},
  eben:         {limit:5},                    // the gliders had to silence the guns before the Belgians recovered
  bismarck:     {limit:5},
  sixkills:     {limit:6},
  u505:         {limit:4},
  singapore:    {limit:16},
  hg76:         {need:7},                     // HG 76 lost two merchantmen of thirty-two
  ons5:         {need:8},
  samar:        {protectN:4},                 // Taffy 3 lost Gambier Bay (and St. Lo to a kamikaze): keep four of six carriers afloat
};
/* aircraft fuel (2026-10-18): at Okinawa the American aircraft flew from Task Force 58's carriers standing offshore, off the map: no fuel limit */
MISSIONS.okinawa.airFree = [1];
/* in the carrier-against-carrier battles a turn is a whole strike-and-recovery cycle, and the AI could not chase a moving carrier home without losing the battle: no fuel limit for either side */
for (const id of ['coralsea', 'eastsolomons', 'santacruz', 'midway', 'philsea', 'engano']) if (MISSIONS[id]) MISSIONS[id].airFree = [1, 2];
/* after the 2026-10-18 rule changes (fog-aware AI, fuel) a few battles ran out of time: the testers' wins came a day or two after the deadline */
const EASE = {alamein:{limit:23}, arnhem:{limit:22}};
for (const [id, h] of Object.entries(EASE)) if (MISSIONS[id]) MISSIONS[id].objective = Object.assign({}, MISSIONS[id].objective, h);
for (const [id, h] of Object.entries(HARDEN)) {
  const m = MISSIONS[id]; if (!m) continue;
  m.objective = Object.assign({}, m.objective);
  if (h.limit) m.objective.limit = h.limit;
  if (h.need) m.objective.need = h.need;
  if (h.protectN) m.objective.protectN = h.protectN;
  if (h.inc2) m.income = Object.assign({}, m.income, {2:h.inc2});
}
