/* ============================== DATA ======================================
   Terrain, nations, units (historical designations per nation), generals.
   Everything that is a number in the rules lives here. */
'use strict';
const ART = 64, SC = ART / 32;          // art resolution per tile; recipes are authored on a 32 grid and painted at 2x detail

/* terrain: def = defence stars, mv = move cost by movement type (0 = impassable) */
const MT = ['foot', 'boot', 'tread', 'tire', 'air', 'ship', 'lander', 'amphib'];
const TER = {
  plain:  {n:'Plain',      def:1, mv:{foot:1, boot:1, tread:1, tire:2, air:1}},
  road:   {n:'Road',       def:0, mv:{foot:1, boot:1, tread:1, tire:1, air:1}},
  forest: {n:'Woods',      def:2, mv:{foot:1, boot:1, tread:2, tire:3, air:1}},
  bocage: {n:'Bocage',     def:3, mv:{foot:2, boot:1, tread:3, tire:4, air:1}},
  hill:   {n:'Hill',       def:2, mv:{foot:2, boot:1, tread:2, tire:3, air:1}},
  river:  {n:'River',      def:0, mv:{foot:2, boot:1, air:1}},
  bridge: {n:'Bridge',     def:0, mv:{foot:1, boot:1, tread:1, tire:1, air:1}},
  sea:    {n:'Sea',        def:0, mv:{air:1, ship:1, lander:1}},
  beach:  {n:'Beach',      def:0, mv:{foot:1, boot:1, tread:1, tire:2, air:1, lander:1}},
  bunker: {n:'Bunker',     def:4, mv:{foot:1, boot:1, tread:1, tire:1, air:1}},
  ruins:  {n:'Ruins',      def:2, mv:{foot:1, boot:1, tread:2, tire:2, air:1}},
  city:   {n:'Town',       def:3, mv:{foot:1, boot:1, tread:1, tire:1, air:1}, prop:true, income:1000},
  hq:     {n:'HQ',         def:4, mv:{foot:1, boot:1, tread:1, tire:1, air:1}, prop:true, income:1000},
  fact:   {n:'Depot',      def:3, mv:{foot:1, boot:1, tread:1, tire:1, air:1}, prop:true, income:1000, makes:'ground'},
  air:    {n:'Airfield',   def:3, mv:{foot:1, boot:1, tread:1, tire:1, air:1}, prop:true, income:1000, makes:'air'},
  port:   {n:'Port',       def:3, mv:{foot:1, boot:1, tread:1, tire:1, air:1, ship:1, lander:1}, prop:true, income:1000, makes:'sea'},
  obst:   {n:'Beach obstacles', def:0, mv:{foot:2, boot:2, air:1}, clear:'beach', info:'Hedgehogs, Belgian gates and mined stakes. Boats and vehicles cannot pass; engineers can clear them.'},
  shingle:{n:'Shingle bank', def:1, mv:{foot:1, boot:1, tread:2, air:1}, info:'A bank of round stones. Wheeled vehicles cannot cross.'},
  wire:   {n:'Barbed wire', def:0, mv:{foot:3, boot:3, tread:1, tire:3, air:1}, clear:'plain', info:'Slows infantry badly. Tanks crush it; engineers blow gaps with Bangalore torpedoes.'},
  mines:  {n:'Minefield',  def:1, mv:{foot:1, boot:1, tread:1, tire:2, air:1}, clear:'plain', mines:true, info:'Ground units that stop here lose 2-3 HP. Engineers can clear it.'},
  cliff:  {n:'Cliffs',     def:3, mv:{foot:3, boot:3, air:1}, info:'Only infantry can climb, slowly. Rangers did it with rocket-fired grapnels.'},
  trench: {n:'Trenches',   def:3, mv:{foot:1, boot:1, tread:2, tire:3, air:1}, info:'Zig-zag fire trenches linking the strongpoints.'},
  marsh:  {n:'Flooded marsh', def:0, mv:{foot:2, boot:2, air:1}, info:'Fields flooded by the Germans, or Pripyat bog. Only infantry wade through.'},
  block:  {n:'City blocks', def:2, mv:{foot:1, boot:1, tread:2, tire:2, air:1}, info:'Apartment blocks and shops. Good cover; armour has to grind through the streets.'},
  field:  {n:'Wheat field', def:1, mv:{foot:1, boot:1, tread:1, tire:2, air:1}, info:'Open farmland. No cover worth the name.'},
  shallows:{n:'Shallows', def:0, mv:{foot:2, boot:2, tread:2, air:1}, mm:'#5a8aa8', info:'Neck-deep water over the sandbars. The landing craft ground here and the men wade in under fire, heavily laden, at a walk. No cover at all.'},
};
for (const t of Object.values(TER)) {                 // DD tanks swim: tracked on land, slow in water
  const m = t.mv; if (m.tread) m.amphib = m.tread;
}
TER.sea.mv.amphib = 2; TER.river.mv.amphib = 2; TER.beach.mv.amphib = 1; TER.obst.mv.amphib = 0; TER.shallows.mv.amphib = 1;
/* map characters. Properties: lowercase/uppercase/alternate letter = neutral / side 1 / side 2 */
const MAPCH = {
  '.':['plain'], '=':['road'], 'T':['forest'], 'h':['bocage'], '^':['hill'], 'r':['river'], 'b':['bridge'],
  '~':['sea'], 's':['beach'], 'B':['bunker'], 'x':['ruins'],
  'O':['obst'], 'n':['shingle'], 'S':['shallows'], 'w':['wire'], 'm':['mines'], 'u':['cliff'], 'z':['trench'], 'v':['marsh'], ',':['field'], 'U':['block'],
  'c':['city',0], 'C':['city',1], 'k':['city',2],
  'f':['fact',0], 'F':['fact',1], 'g':['fact',2],
  'a':['air',0],  'A':['air',1],  'e':['air',2],
  'p':['port',0], 'P':['port',1], 'o':['port',2],
  'Q':['hq',1],   'q':['hq',2],
};

/* unit roles: the Advance Wars chassis every nation fills with its own vehicles */
const ROLE = {
  inf:   {mt:'foot',  mv:3, cost:1000,  rng:[1,1], cap:true, foot:true},
  at:    {mt:'boot',  mv:2, cost:3000,  rng:[1,1], cap:true, foot:true},
  recon: {mt:'tire',  mv:8, cost:4000,  rng:[1,1], armour:true},
  apc:   {mt:'tread', mv:6, cost:5000,  rng:[0,0], armour:true, carry:2, carries:'foot'},
  tank:  {mt:'tread', mv:6, cost:7000,  rng:[1,1], armour:true},
  mtank: {mt:'tread', mv:5, cost:12000, rng:[1,1], armour:true},
  htank: {mt:'tread', mv:4, cost:16000, rng:[1,1], armour:true},
  art:   {mt:'tire',  mv:5, cost:6000,  rng:[2,3], indirect:true},
  rkt:   {mt:'tire',  mv:5, cost:14000, rng:[3,5], indirect:true},
  aa:    {mt:'tread', mv:6, cost:8000,  rng:[1,1], armour:true},
  ftr:   {mt:'air',   mv:9, cost:18000, rng:[1,1], air:true},
  bmr:   {mt:'air',   mv:7, cost:20000, rng:[1,1], air:true},
  lc:    {mt:'lander',mv:8, cost:10000, rng:[0,0], sea:true, carry:2, carries:'ground'},
  dd:    {mt:'ship',  mv:6, cost:22000, rng:[2,6], sea:true, indirect:true},
  eng:   {mt:'foot',  mv:3, cost:2500,  rng:[1,1], cap:true, foot:true, clears:true},
  mortar:{mt:'boot',  mv:2, cost:4000,  rng:[2,3], foot:true, indirect:true},
  ddtank:{mt:'amphib',mv:5, cost:8000,  rng:[1,1], armour:true},
  nest:  {mt:'none',  mv:0, cost:4000,  rng:[1,2], fixed:true, arm:.7},
  pak:   {mt:'none',  mv:0, cost:9000,  rng:[1,3], fixed:true, arm:.6},
};
const ROLE_ORDER = ['inf','eng','at','mortar','recon','apc','tank','ddtank','mtank','htank','art','rkt','aa','ftr','bmr','lc','dd','nest','pak'];
const MAKES = {ground:['inf','eng','at','mortar','recon','apc','tank','ddtank','mtank','htank','art','rkt','aa'], air:['ftr','bmr'], sea:['lc','dd']};

/* base damage (% of a full-strength defender) by attacker role -> defender role */
const DMG = {
  inf:   {inf:55, at:45, recon:12, apc:14, tank:5,  mtank:1,  htank:1,  art:35, rkt:45, aa:5},     // gun crews in the open are easy meat for riflemen who get close
  at:    {inf:65, at:55, recon:85, apc:75, tank:55, mtank:45, htank:35, art:70, rkt:85, aa:65},
  recon: {inf:70, at:65, recon:35, apc:45, tank:6,  mtank:1,  htank:1,  art:45, rkt:55, aa:4},
  apc:   {inf:20, at:18},
  tank:  {inf:75, at:70, recon:85, apc:75, tank:55, mtank:45, htank:25, art:70, rkt:85, aa:65, lc:10, dd:5},
  mtank: {inf:90, at:85, recon:105,apc:105,tank:85, mtank:55, htank:45, art:105,rkt:105,aa:105, lc:15, dd:10},
  htank: {inf:105,at:95, recon:125,apc:115,tank:105,mtank:85, htank:55, art:115,rkt:125,aa:115, lc:25, dd:15},
  art:   {inf:90, at:85, recon:80, apc:70, tank:70, mtank:45, htank:40, art:75, rkt:80, aa:75, lc:40, dd:40},
  rkt:   {inf:95, at:90, recon:90, apc:80, tank:80, mtank:55, htank:45, art:80, rkt:85, aa:85, lc:55, dd:55},
  aa:    {inf:105,at:105,recon:60, apc:50, tank:25, mtank:10, htank:5,  art:50, rkt:55, aa:45, ftr:65, bmr:75},
  ftr:   {inf:25, at:25, recon:20, apc:20, art:25, rkt:25, ftr:55, bmr:100},
  bmr:   {inf:110,at:110,recon:105,apc:105,tank:95, mtank:75, htank:60, art:105,rkt:105,aa:35, lc:85, dd:55},
  dd:    {inf:75, at:70, recon:70, apc:70, tank:60, mtank:50, htank:45, art:65, rkt:70, aa:65, lc:95, dd:55},
  eng:   {inf:50, at:45, recon:12, apc:14, tank:8, mtank:4, htank:3, art:40, rkt:48, aa:8, nest:48, pak:42},   // flamethrowers and pole charges
  mortar:{inf:75, at:70, recon:35, apc:30, tank:12, mtank:6, htank:5, art:55, rkt:60, aa:30, nest:30, pak:25},
  nest:  {inf:100, at:90, recon:35, apc:35, tank:4, mtank:1, htank:1, art:45, rkt:55, aa:12, lc:30},
  pak:   {inf:40, at:38, recon:125, apc:125, tank:115, mtank:100, htank:85, art:105, rkt:115, aa:115, lc:95, dd:25},
};
DMG.ddtank = Object.assign({}, DMG.tank);
for (const row of Object.values(DMG)) {               // fill columns for the newer defenders from their nearest relative
  if (row.inf != null && row.eng == null) row.eng = row.inf;
  if (row.inf != null && row.mortar == null) row.mortar = row.inf;
  if (row.tank != null && row.ddtank == null) row.ddtank = row.tank;
  if (row.art != null && row.nest == null) row.nest = Math.round(row.art * .6);
  if (row.art != null && row.pak == null) row.pak = Math.round(row.art * .55);
}

/* nations. pow = firepower multiplier, powArm = extra vs armour, arm = damage taken multiplier.
   snd = weapon sound, shape = sprite recipe (see art.js) */
const NATION = {
  ger: {n:'Germany', adj:'German', short:'Wehrmacht', side:'axis',
    col:{m:'#c9b26b', d:'#8a7440', ui:'#b8b8a8', team:'#7d8794', hi:'#e8e2c8'},   // Dunkelgelb 1944 armour, field-grey uniforms
    uniform:'#6b6f5e', helmet:'stahl', star:'balken', anthem:'ger',
    u:{
      inf:  {n:'Grenadiere', w:'Kar98k & MG 42', snd:'mg42'},
      at:   {n:'Panzerschreck Team', w:'RPzB 54 88 mm', snd:'rocketAT'},
      recon:{n:'Sd.Kfz. 234/2 Puma', w:'5 cm KwK 39/1', snd:'gun50', shape:'puma'},
      apc:  {n:'Sd.Kfz. 251 Hanomag', w:'MG 34', snd:'mg34', shape:'ht251'},
      tank: {n:'Panzer IV Ausf. H', w:'7.5 cm KwK 40 L/48', snd:'gun75', shape:'pz4'},
      mtank:{n:'Panther Ausf. G', w:'7.5 cm KwK 42 L/70', snd:'gun75hv', shape:'panther', pow:1.12, cost:13000},
      htank:{n:'Tiger I', w:'8.8 cm KwK 36', snd:'gun88', shape:'tiger', pow:1.15, arm:.75, cost:17000},
      art:  {n:'10.5 cm leFH 18', w:'105 mm howitzer', snd:'howitzer', shape:'lefh'},
      rkt:  {n:'Nebelwerfer 41', w:'15 cm rockets x6', snd:'nebel', shape:'nebel', mv:4, cost:12000},
      aa:   {n:'Flakpanzer IV Wirbelwind', w:'2 cm Flakvierling', snd:'flak20', shape:'wirbel'},
      ftr:  {n:'Bf 109 G-6', w:'MG 131 & MK 108', snd:'strafeGer', shape:'bf109'},
      bmr:  {n:'Ju 87 D Stuka', w:'SC 500 bomb', snd:'stuka', shape:'ju87'},
      lc:   {n:'Marinefährprahm', w:'transport', snd:'naval', shape:'mfp'},
      dd:   {n:'Zerstörer 1936A', w:'15 cm SK C/36', snd:'naval', shape:'z36'},
      eng:  {n:'Pioniere', w:'Flammenwerfer 41 & demolition charges', snd:'flamer'},
      mortar:{n:'8 cm Granatwerfer 34', w:'81 mm mortar', snd:'mortar'},
      nest: {n:'MG 42 Nest', w:'MG 42 in a Tobruk pit', snd:'mg42', shape:'nest'},
      pak:  {n:'8.8 cm PaK 43/41 Casemate', w:'88 mm anti-tank gun', snd:'gun88', shape:'casemate'},
    }},
  us: {n:'United States', adj:'American', short:'US Army', side:'allies',
    col:{m:'#5d6b3a', d:'#3c4626', ui:'#4f7bd1', team:'#4f7bd1', hi:'#c8d6a0'},   // olive drab
    uniform:'#7a6f4c', helmet:'m1', star:'usstar', anthem:'us',
    u:{
      inf:  {n:'Rifle Squad', w:'M1 Garand & BAR', snd:'garand'},
      at:   {n:'Bazooka Team', w:'M1A1 Bazooka', snd:'rocketAT'},
      recon:{n:'M8 Greyhound', w:'37 mm M6', snd:'gun37', shape:'m8'},
      apc:  {n:'M3 Half-track', w:'.50 cal M2', snd:'m2hb', shape:'m3ht'},
      tank: {n:'M4A1 Sherman', w:'75 mm M3', snd:'gun75', shape:'sherman', cost:6500, pow:.95},
      mtank:{n:'M36 Jackson', w:'90 mm M3', snd:'gun90', shape:'m36', pow:1.1, arm:1.05, mv:6, cost:11000},
      htank:{n:'M26 Pershing', w:'90 mm M3', snd:'gun90', shape:'pershing', pow:1.08, arm:.85, mv:5, cost:15000},
      art:  {n:'M2A1 105 mm Howitzer', w:'105 mm howitzer', snd:'howitzer', shape:'m2a1'},
      rkt:  {n:'T34 Calliope', w:'4.5 in rockets x60', snd:'calliope', shape:'calliope', mt:'tread', mv:6, cost:15000},
      aa:   {n:'M16 MGMC', w:'quad .50 cal', snd:'quad50', shape:'m16'},
      ftr:  {n:'P-51D Mustang', w:'6x .50 cal', snd:'strafeUS', shape:'p51'},
      bmr:  {n:'P-47D Thunderbolt', w:'8x .50 cal & 500 lb bombs', snd:'bombs', shape:'p47'},
      lc:   {n:'LCVP Higgins Boat', w:'transport', snd:'naval', shape:'lcvp'},
      dd:   {n:'Fletcher-class Destroyer', w:'5 in/38 guns', snd:'naval', shape:'fletcher'},
      eng:  {n:'Combat Engineers', w:'Bangalore torpedoes & M1 carbine', snd:'bangalore'},
      mortar:{n:'M1 81 mm Mortar', w:'81 mm mortar', snd:'mortar'},
      ddtank:{n:'M4A1 Sherman DD', w:'75 mm M3 · Duplex Drive', snd:'gun75', shape:'shermandd', pow:.95},
    }},
  uk: {n:'Britain', adj:'British', short:'British Army', side:'allies',
    col:{m:'#5a5e3e', d:'#393b27', ui:'#c9473f', team:'#c9473f', hi:'#c6c69a'},   // SCC 15 olive drab
    uniform:'#7d6a45', helmet:'brodie', star:'roundel', anthem:'uk',
    u:{
      inf:  {n:'Rifle Section', w:'Lee-Enfield No. 4 & Bren', snd:'bren'},
      at:   {n:'PIAT Team', w:'PIAT', snd:'piat'},
      recon:{n:'Daimler Armoured Car', w:'QF 2-pounder', snd:'gun37', shape:'daimler'},
      apc:  {n:'Universal Carrier', w:'Bren', snd:'bren', shape:'carrier', mv:7, cost:4000},
      tank: {n:'Cromwell Mk IV', w:'QF 75 mm', snd:'gun75', shape:'cromwell', mv:7, pow:.92},
      mtank:{n:'Sherman Firefly', w:'QF 17-pounder', snd:'gun17pdr', shape:'firefly', powArm:1.25},
      htank:{n:'Churchill Mk VII', w:'QF 75 mm', snd:'gun75', shape:'churchill', mv:3, arm:.72, pow:.95, cost:15000},
      art:  {n:'QF 25-pounder', w:'87.6 mm gun-howitzer', snd:'howitzer', shape:'pdr25', pow:1.1},
      rkt:  {n:'Land Mattress', w:'3 in rockets x32', snd:'mattress', shape:'mattress', mv:4, cost:12000},
      aa:   {n:'Crusader III AA Mk I', w:'40 mm Bofors', snd:'bofors', shape:'crusaderaa'},
      ftr:  {n:'Spitfire Mk IX', w:'20 mm Hispano & .303', snd:'strafeUK', shape:'spitfire'},
      bmr:  {n:'Hawker Typhoon IB', w:'RP-3 rockets', snd:'rp3', shape:'typhoon'},
      lc:   {n:'Landing Craft Assault', w:'transport', snd:'naval', shape:'lca'},
      dd:   {n:'Tribal-class Destroyer', w:'4.7 in QF guns', snd:'naval', shape:'tribal'},
      eng:  {n:'Royal Engineers', w:'Bangalore torpedoes & Sten', snd:'bangalore'},
      mortar:{n:'ML 3-inch Mortar', w:'3 in mortar', snd:'mortar'},
      ddtank:{n:'Sherman DD', w:'75 mm M3 · Duplex Drive', snd:'gun75', shape:'shermandd', pow:.95},
    }},
  su: {n:'Soviet Union', adj:'Soviet', short:'Red Army', side:'allies',
    col:{m:'#4c5a33', d:'#313b20', ui:'#d63a2e', team:'#d63a2e', hi:'#b9c28a'},   // 4BO protective green
    uniform:'#8b7f55', helmet:'ssh40', star:'redstar', anthem:'su',
    u:{
      inf:  {n:'Strelki', w:'PPSh-41 & Mosin-Nagant', snd:'ppsh', cost:900},
      at:   {n:'PTRD Team', w:'PTRD-41 14.5 mm', snd:'ptrd', pow:.9, cost:2500},
      recon:{n:'BA-64', w:'DT machine gun', snd:'dt', shape:'ba64', cost:3000, pow:.8},
      apc:  {n:'ZiS-5 Truck', w:'transport', snd:'naval', shape:'zis5', mt:'tire', mv:7, cost:3500},
      tank: {n:'T-34/76', w:'76 mm F-34', snd:'gun76', shape:'t34', cost:6000},
      mtank:{n:'T-34-85', w:'85 mm ZiS-S-53', snd:'gun85', shape:'t3485', mv:6, cost:10500},
      htank:{n:'IS-2', w:'122 mm D-25T', snd:'gun122', shape:'is2', pow:1.22, arm:.85, cost:16000},
      art:  {n:'M-30 122 mm Howitzer', w:'122 mm howitzer', snd:'howitzer', shape:'m30', pow:1.05},
      rkt:  {n:'BM-13 Katyusha', w:'M-13 rockets x16', snd:'katyusha', shape:'katyusha', mv:6, cost:12000, pow:1.05},
      aa:   {n:'61-K 37 mm AA Gun', w:'37 mm autocannon', snd:'bofors', shape:'k61', mt:'tire', cost:7000},
      ftr:  {n:'Yak-3', w:'20 mm ShVAK & UBS', snd:'strafeSU', shape:'yak3'},
      bmr:  {n:'Il-2 Shturmovik', w:'23 mm VYa & RS-82', snd:'rp3', shape:'il2', arm:.8},
      lc:   {n:'Armoured Boat Pr. 1125', w:'transport', snd:'naval', shape:'bka'},
      dd:   {n:'Gnevny-class Destroyer', w:'130 mm B-13', snd:'naval', shape:'gnevny'},
      eng:  {n:'Assault Sappers', w:'PPSh-41 & satchel charges', snd:'ppsh'},
      mortar:{n:'82-PM-41 Mortar', w:'82 mm mortar', snd:'mortar'},
    }},
};
/* resolved unit definition for nation + role; a mission may rename or re-tune a unit (G.uover) */
function udef(nat, role) {
  const r = ROLE[role], N = NATION[nat]; if (!N) return null;
  let v = N.u[role];
  const o = typeof G !== 'undefined' && G && G.uover && G.uover[nat] && G.uover[nat][role];
  if (o) v = Object.assign({}, v || {}, o);
  if (!r || !v) return null;                           // not every army fields every role (DD tanks, fixed defences)
  const d = Object.assign({role, nat, pow:1, arm:1, powArm:1, shape:role}, r, v, {cost:v.cost || r.cost, mv:v.mv || r.mv, mt:v.mt || r.mt});
  if (role === 'apc' && d.snd === 'naval') d.snd = (N.u.inf && N.u.inf.snd) || 'bren';   // an unarmed lorry fights with the rifles of the men in it
  if (d.snd === 'stuka' && !/^ju87/.test(d.shape)) d.snd = ['val', 'sbd', 'helldiver', 'judy', 'barracuda'].includes(d.shape) ? 'divebomb' : 'bombs';   // the siren was the Ju 87's alone; level bombers just bomb
  return d;
}
/* the army whose art, flags and voices a nation borrows (1940 Wehrmacht looks like the 1944 one, and so on) */
const NAT_BASE = {ger40:'ger', uk40:'uk', su41:'su', usp:'us', fr40:'fr40', be:'be'};
const natBase = nat => NAT_BASE[nat] || nat;

/* Free French: the 2e Division Blindée fought in American equipment under the Cross of Lorraine */
NATION.fr = {n:'Free France', adj:'Free French', short:'2e Division Blindée', side:'allies',
  col:{m:'#5f6b3c', d:'#3d4627', ui:'#2f55b0', team:'#2f55b0', hi:'#c8d6a0'}, uniform:'#77704e', helmet:'m1', star:'lorraine', anthem:'fr',
  u:Object.assign({}, NATION.us.u, {
    inf:{n:'Régiment de Marche du Tchad', w:'M1 Garand & BAR', snd:'garand'},
    tank:{n:'M4A2 Sherman', w:'75 mm M3', snd:'gun75', shape:'sherman', cost:6500, pow:.95},
    mtank:{n:'M10 Wolverine', w:'3 in M7', snd:'gun90', shape:'m36', pow:1.05, arm:1.05, mv:6, cost:10000},
    htank:{n:'M4A3 Sherman (76)', w:'76 mm M1', snd:'gun76', shape:'sherman', pow:1.05, arm:.95, cost:11000},
    ddtank:undefined, dd:{n:'Le Fantasque-class', w:'138 mm guns', snd:'naval', shape:'tribal'}})};

/* Generals. d2d = always-on, cop = Power, scop = Super Power.
   Effect keys: atk/def (percent per role group), mv (+move), rng (+indirect range), heal (HP), hurt (HP to every enemy),
   strike {hp, r, n, kind} (aimed bombardment of the n densest enemy clusters within radius r),
   spawn {roles, where:'hq'|'front', kind} (reinforcements / airborne drop), again (group may act twice),
   enemyMv (enemy movement), cost (multiplier), income (multiplier), climb (infantry scale cliffs) */
const CO = {
  rommel: {n:'Erwin Rommel', nat:'ger', rank:'Generalfeldmarschall', nick:'The Desert Fox',
    bio:'Commander of Army Group B on the Atlantic Wall. A master of fast armoured manoeuvre, famous for leading from the front.',
    d2d:{txt:'Armour +10% firepower.', atk:{armour:10}},
    cop:{n:'Blitzkrieg', star:3, txt:'All ground units +1 move, armour +10%.', mv:{ground:1}, atk:{armour:10}, fx:'dust'},
    scop:{n:'Panzer Spearhead', star:6, txt:'Armour +30% firepower and +2 move, and every tank may act twice.', mv:{armour:2}, atk:{armour:30}, again:'armour', fx:'dust'},
    look:{cap:'peaked', goggles:true, face:'#e2b48f', hair:'#5a4632', jaw:1, collar:'#b3262b', tunic:'#6a6c5c', medal:'pourlemerite'},
    say:{start:'Sweat saves blood, blood saves lives, but brains saves both.', win:'The enemy is beaten. Push on before they regroup.', lose:'Without air cover we cannot hold. Fall back.', power:'Forward! Do not stop until you reach the coast!'}},
  guderian: {n:'Heinz Guderian', nat:'ger', rank:'Generaloberst', nick:'Schneller Heinz',
    bio:'Architect of the Panzer arm and author of "Achtung - Panzer!". In 1945 Chief of the General Staff, fighting on the Vistula.',
    d2d:{txt:'Armour +15% firepower, infantry -10%.', atk:{armour:15, foot:-10}},
    cop:{n:'Klotzen, nicht kleckern', star:3, txt:'Armour +20% firepower and +1 move.', atk:{armour:20}, mv:{armour:1}, fx:'dust'},
    scop:{n:'Achtung - Panzer!', star:6, txt:'Two Panther battalions arrive at the front. Armour +30%.', atk:{armour:30}, spawn:{roles:['mtank', 'mtank'], where:'front', kind:'reinforce'}},
    look:{cap:'peaked', face:'#e8bc98', hair:'#3f3226', jaw:0, collar:'#b3262b', tunic:'#3d3f3a'},
    say:{start:'Klotzen, nicht kleckern. Strike concentrated, not dispersed.', win:'Speed and shock. As I always said.', lose:'We are fighting with too little, too late.', power:'Panzer marsch!'}},
  manstein: {n:'Erich von Manstein', nat:'ger', rank:'Generalfeldmarschall', nick:'The Strategist',
    bio:'Planner of the 1940 Sichelschnitt and the "backhand blow" at Kharkov in 1943. Commanded Army Group South at Kursk.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Backhand Blow', star:3, txt:'All units heal 2 HP and gain +15% firepower.', heal:2, atk:{all:15}, fx:'heal'},
    scop:{n:'Sichelschnitt', star:7, txt:'Encirclement: enemy units -1 move. Yours +1 move, +25% firepower, +15% defence.', mv:{all:1}, atk:{all:25}, def:{all:15}, enemyMv:-1, fx:'dust'},
    look:{cap:'peaked', face:'#e5bc9a', hair:'#9b9b9b', jaw:0, collar:'#b3262b', tunic:'#6a6c5c', nose:true},
    say:{start:'Let them come forward. Then we cut behind them.', win:'A textbook envelopment.', lose:'Lost victories, every one of them.', power:'Now. Close the sickle.'}},
  model: {n:'Walter Model', nat:'ger', rank:'Generalfeldmarschall', nick:"Hitler's Fireman",
    bio:'Sent to every collapsing front. Took over Army Group Centre after Bagration, then Army Group B: Falaise, Arnhem, the Ardennes and the Ruhr.',
    d2d:{txt:'Units in towns, woods, bocage and bunkers +20% defence.', def:{cover:20}},
    cop:{n:'Fire Brigade', star:3, txt:'All units heal 3 HP.', heal:3, fx:'heal'},
    scop:{n:'Wacht am Rhein', star:6, txt:'Volksgrenadier reinforcements arrive. All units heal 2 HP, +20% firepower and defence.', heal:2, atk:{all:20}, def:{all:20}, spawn:{roles:['inf', 'inf', 'at'], where:'front', kind:'reinforce'}},
    look:{cap:'peaked', monocle:true, face:'#e0b392', hair:'#6b5a46', jaw:1, collar:'#b3262b', tunic:'#6a6c5c'},
    say:{start:'Not one step back. Hold, and we break them at the river.', win:'The line holds.', lose:'A field marshal does not go into captivity.', power:'Every man to the line!'}},
  kluge: {n:'Günther von Kluge', nat:'ger', rank:'Generalfeldmarschall', nick:'Clever Hans',
    bio:'Took over in the West in July 1944 after Rommel was wounded. Fought the Normandy breakout at Saint-Lô and Mortain.',
    d2d:{txt:'Artillery, rockets and mortars +15% firepower.', atk:{indirect:15}},
    cop:{n:'Operation Lüttich', star:3, txt:'Armour +1 move, all units +10% firepower.', mv:{armour:1}, atk:{all:10}, fx:'dust'},
    scop:{n:'Werfer Barrage', star:6, txt:'Nebelwerfer salvos: 3 HP to three enemy clusters. Indirect +30%.', strike:{hp:3, r:1, n:3, kind:'nebel'}, atk:{indirect:30}},
    look:{cap:'peaked', face:'#e2b896', hair:'#a8a8a8', jaw:1, collar:'#b3262b', tunic:'#6a6c5c'},
    say:{start:'Hold the line at Saint-Lô.', win:'We have bought time.', lose:'The front has broken.', power:'Werfer, Feuer!'}},
  heinrici: {n:'Gotthard Heinrici', nat:'ger', rank:'Generaloberst', nick:'Unser Giftzwerg',
    bio:'Defensive specialist. In April 1945 he held the Seelow Heights against Zhukov by pulling back before the barrage fell.',
    d2d:{txt:'All units +15% defence, -5% firepower.', def:{all:15}, atk:{all:-5}},
    cop:{n:'Pull Back', star:3, txt:'All units +30% defence.', def:{all:30}, fx:'heal'},
    scop:{n:'Seelow Heights', star:6, txt:'Enemy -1 move. Barrage: 2 HP to two clusters. +30% defence.', strike:{hp:2, r:2, n:2, kind:'barrage'}, def:{all:30}, enemyMv:-1},
    look:{cap:'peaked', face:'#e0b090', hair:'#8a8a8a', jaw:0, collar:'#b3262b', tunic:'#5a5c50'},
    say:{start:'Let the barrage fall on empty trenches.', win:'They broke on the heights.', lose:'Berlin cannot be held.', power:'Now! Back into the main line!'}},
  choltitz: {n:'Dietrich von Choltitz', nat:'ger', rank:'General der Infanterie', nick:'The Saviour of Paris',
    bio:'Military governor of Paris in August 1944. Ordered to leave the city a field of ruins, he did not, and surrendered to Leclerc.',
    d2d:{txt:'Units in towns +25% defence.', def:{urban:25}},
    cop:{n:'Fortress Paris', star:3, txt:'All units +25% defence, heal 1 HP.', def:{all:25}, heal:1, fx:'heal'},
    scop:{n:'Last Stand', star:5, txt:'All units +30% defence and +20% firepower.', def:{all:30}, atk:{all:20}},
    look:{cap:'peaked', face:'#e6ba98', hair:'#6a5a48', jaw:2, collar:'#b3262b', tunic:'#6a6c5c', glasses:false},
    say:{start:'Is Paris burning? Not while I command here.', win:'The city holds.', lose:'I surrender the garrison of Paris.', power:'Hold the bridges.'}},

  monty: {n:'Bernard Montgomery', nat:'uk', rank:'General', nick:'Monty',
    bio:'Victor of El Alamein. Commanded all Allied ground forces on D-Day; known for meticulous set-piece battles and massed artillery.',
    d2d:{txt:'Artillery, rockets and mortars +20% firepower.', atk:{indirect:20}},
    cop:{n:'Set-Piece Battle', star:3, txt:'Indirect units +1 range, +20% firepower.', rng:1, atk:{indirect:20}},
    scop:{n:'Operation Goodwood', star:7, txt:'Carpet bombing: 4 HP to the two densest enemy positions. Indirect +1 range, +30%.', strike:{hp:4, r:2, n:2, kind:'carpet'}, rng:1, atk:{indirect:30}},
    look:{cap:'beret', badges:2, face:'#e8c0a0', hair:'#9a8a70', jaw:0, nose:true, tunic:'#9b8559', sweater:true},
    say:{start:'We will hit the enemy for six, right out of Normandy.', win:'Precisely according to plan.', lose:'The plan will need some tidying up.', power:'Bomber Command is overhead. Watch this.'}},
  horrocks: {n:'Brian Horrocks', nat:'uk', rank:'Lieutenant-General', nick:'Jorrocks',
    bio:'Commander of XXX Corps. His tanks drove up a single road for Operation Market Garden in September 1944.',
    d2d:{txt:'Tracked units +1 move.', mv:{tread:1}},
    cop:{n:'Club Route', star:3, txt:'Armour +20% firepower; Typhoon cab-rank strike, 2 HP to one cluster.', atk:{armour:20}, strike:{hp:2, r:1, n:1, kind:'rockets'}},
    scop:{n:'Market Garden', star:6, txt:'Paratroops drop at the front. Ground +2 move, +20% firepower.', mv:{ground:2}, atk:{all:20}, spawn:{roles:['inf', 'inf', 'at'], where:'front', kind:'para'}},
    look:{cap:'beret', badges:1, face:'#e8c0a0', hair:'#d8d8d8', jaw:0, tunic:'#9b8559'},
    say:{start:'Over the bridges and on to Arnhem. Keep the vehicles moving.', win:'The Corps has done it.', lose:'A bridge too far.', power:'Garden! All vehicles, go!'}},

  patton: {n:'George S. Patton', nat:'us', rank:'Lieutenant General', nick:'Old Blood and Guts',
    bio:'Commanded US Third Army from August 1944. Raced across France and turned an army ninety degrees to relieve Bastogne.',
    d2d:{txt:'All units +10% firepower, ground +1 move. -10% defence.', atk:{all:10}, mv:{ground:1}, def:{all:-10}},
    cop:{n:'Third Army Dash', star:3, txt:'All ground units +2 move.', mv:{ground:2}, fx:'dust'},
    scop:{n:'Hell on Wheels', star:6, txt:'Ground +2 move, +40% firepower, and armour may act twice.', mv:{ground:2}, atk:{all:40}, again:'armour', fx:'dust'},
    look:{cap:'helmet', stars:3, face:'#ecc3a2', hair:'#bdbdbd', jaw:1, tunic:'#7a6f4c', pistols:true},
    say:{start:'A good plan violently executed now is better than a perfect plan next week.', win:'Keep moving. We have them on the run.', lose:'Hold what you have. We attack again at dawn.', power:'Grab \'em by the nose and kick \'em in the pants!'}},
  bradley: {n:'Omar Bradley', nat:'us', rank:'Lieutenant General', nick:"The GI's General",
    bio:'Commanded US First Army on D-Day, then 12th Army Group. Planned Operation Cobra, the breakout from Saint-Lô.',
    d2d:{txt:'Infantry +20% firepower. Infantry cost -10%.', atk:{foot:20}, cost:{foot:.9}},
    cop:{n:'Naval Gunfire', star:3, txt:'Destroyers close in: 2 HP to the densest enemy position. Air and ships +30%.', strike:{hp:2, r:2, n:1, kind:'naval'}, atk:{air:30, sea:30}},
    scop:{n:'Operation Cobra', star:6, txt:'Heavy bombers: 3 HP to three enemy positions. All units +20% firepower, +1 move.', strike:{hp:3, r:2, n:3, kind:'carpet'}, atk:{all:20}, mv:{all:1}},
    look:{cap:'helmet', stars:3, face:'#e9c0a0', hair:'#8a7b66', jaw:0, glasses:true, tunic:'#7a6f4c'},
    say:{start:'We will take the beach. Then we will take the bocage, one hedgerow at a time.', win:'The line is open.', lose:'Re-embark if we must. We will be back.', power:'Bombers are on the way. Pull the line back a mile.'}},
  ike: {n:'Dwight D. Eisenhower', nat:'us', rank:'General of the Army', nick:'Ike',
    bio:'Supreme Allied Commander. Gave the order for Operation Overlord on 5 June 1944: "OK, let\'s go."',
    d2d:{txt:'All units +5% firepower and defence. Income +10%.', atk:{all:5}, def:{all:5}, income:1.1},
    cop:{n:'Supreme Command', star:3, txt:'All units heal 2 HP and +1 move.', heal:2, mv:{all:1}, fx:'heal'},
    scop:{n:'Overlord', star:7, txt:'Airborne drop at the front. All heal 2 HP, +1 move, +25% firepower and defence.', heal:2, mv:{all:1}, atk:{all:25}, def:{all:25}, spawn:{roles:['inf', 'inf', 'at', 'inf'], where:'front', kind:'para'}},
    look:{cap:'garrison', stars:4, face:'#eec8a8', hair:'#d6c09a', jaw:0, smile:true, tunic:'#6f6040', ike:true},
    say:{start:'You are about to embark upon the Great Crusade.', win:'The free men of the world are marching together to victory.', lose:'The fault, if any, is mine alone.', power:'OK. Let\'s go.'}},
  mcauliffe: {n:'Anthony McAuliffe', nat:'us', rank:'Brigadier General', nick:'Nuts!',
    bio:'Commanded the 101st Airborne\'s artillery on D-Day. In Bastogne in December 1944 he answered a German demand to surrender with one word.',
    d2d:{txt:'Infantry +25% defence.', def:{foot:25}},
    cop:{n:'Nuts!', star:3, txt:'All units +30% defence, heal 1 HP.', def:{all:30}, heal:1, fx:'heal'},
    scop:{n:'Screaming Eagles', star:6, txt:'Supply drop: all heal 2 HP. Infantry +40% firepower and defence and may act twice.', atk:{foot:40}, def:{foot:40}, heal:2, again:'foot', fx:'heal'},
    look:{cap:'helmet', stars:1, face:'#ecc3a2', hair:'#6b5a46', jaw:0, tunic:'#7a6f4c', eagle:true},
    say:{start:'Nuts!', win:'The Battered Bastards of Bastogne held.', lose:'We are surrounded. That suits us fine.', power:'They\'ve got us surrounded, the poor bastards.'}},
  rudder: {n:'James Earl Rudder', nat:'us', rank:'Lieutenant Colonel', nick:'Rangers Lead the Way',
    bio:'Led the 2nd Ranger Battalion up the 100-foot cliffs of Pointe du Hoc on D-Day with rocket-fired grapnels and borrowed fire-brigade ladders.',
    d2d:{txt:'Infantry climb cliffs at normal speed and have +15% firepower.', atk:{foot:15}, climb:true},
    cop:{n:'Grapnels Away', star:2, txt:'Infantry +2 move.', mv:{foot:2}, fx:'dust'},
    scop:{n:'Rangers Lead the Way', star:5, txt:'Infantry +30% firepower and may act twice.', atk:{foot:30}, again:'foot'},
    look:{cap:'helmet', stars:0, face:'#e8bc98', hair:'#5a4632', jaw:1, tunic:'#7a6f4c', ranger:true},
    say:{start:'Rangers, lead the way.', win:'Praise the Lord. Mission accomplished.', lose:'Hold the point. Help is coming.', power:'Up the ropes! Go!'}},
  hodges: {n:'Courtney Hodges', nat:'us', rank:'Lieutenant General', nick:'The Quiet General',
    bio:'Commanded US First Army from August 1944 through the Hürtgen Forest, the Ardennes and the crossing at Remagen.',
    d2d:{txt:'All units +10% defence in woods.', def:{cover:10}},
    cop:{n:'Corps Artillery', star:3, txt:'Barrage: 2 HP to two enemy positions.', strike:{hp:2, r:1, n:2, kind:'barrage'}},
    scop:{n:'Seize the Bridge', star:6, txt:'All units +1 move, +25% firepower. Engineers and infantry may act twice.', mv:{all:1}, atk:{all:25}, again:'foot'},
    look:{cap:'helmet', stars:3, face:'#e8c0a0', hair:'#a89878', jaw:0, tunic:'#7a6f4c'},
    say:{start:'Take the ground methodically. No heroics.', win:'The bridge is ours. Exploit it.', lose:'The forest has beaten us for now.', power:'Bring up every gun we have.'}},
  leclerc: {n:'Philippe Leclerc', nat:'fr', rank:'Général de division', nick:'The Oath of Kufra',
    bio:'Swore at Kufra in 1941 not to lay down arms until the French flag flew over Strasbourg. His 2e DB liberated Paris on 25 August 1944.',
    d2d:{txt:'All units +10% firepower in towns. Armour +1 move.', atk:{urban:10}, mv:{armour:1}},
    cop:{n:'La Nueve', star:3, txt:'Infantry and half-tracks +2 move, +20% firepower.', mv:{foot:2, apc:2}, atk:{foot:20}, fx:'dust'},
    scop:{n:'Libération', star:6, txt:'The Paris Resistance rises: FFI fighters appear at the front. All units +25%.', atk:{all:25}, spawn:{roles:['inf', 'inf', 'inf', 'at'], where:'front', kind:'resist'}},
    look:{cap:'kepi', face:'#e2b48f', hair:'#5a4632', jaw:0, tunic:'#77704e', cane:true},
    say:{start:'We will not lay down our arms until our colours fly over Strasbourg.', win:'Paris is free!', lose:'France will wait one more day.', power:'Allez! Pour la France!'}},

  zhukov: {n:'Georgy Zhukov', nat:'su', rank:'Marshal of the Soviet Union', nick:'The Marshal of Victory',
    bio:'Defended Moscow, planned Stalingrad, and in April 1945 led the 1st Belorussian Front from the Oder to Berlin.',
    d2d:{txt:'Artillery, rockets and mortars +20% firepower.', atk:{indirect:20}},
    cop:{n:'Storm of Steel', star:3, txt:'Artillery barrage: 2 HP to three enemy positions.', strike:{hp:2, r:1, n:3, kind:'barrage'}},
    scop:{n:'Katyusha', star:7, txt:'Guards mortar salvos: 3 HP to two wide areas. Ground +1 move, +25% firepower.', strike:{hp:3, r:2, n:2, kind:'katyusha'}, mv:{ground:1}, atk:{all:25}},
    look:{cap:'soviet', face:'#e6b896', hair:'#4a3c30', jaw:2, tunic:'#8b7f55', medals:true},
    say:{start:'Artillery is the god of war.', win:'The banner flies over the Reichstag.', lose:'Regroup. The guns will open again at dawn.', power:'All guns: fire!'}},
  konev: {n:'Ivan Konev', nat:'su', rank:'Marshal of the Soviet Union', nick:'The Bald Marshal',
    bio:'Commanded the Steppe Front at Kursk and the 1st Ukrainian Front in the race to Berlin. Fast armoured exploitation was his speciality.',
    d2d:{txt:'Armour +10% firepower, tracked units +1 move.', atk:{armour:10}, mv:{tread:1}},
    cop:{n:'Breakthrough', star:3, txt:'Armour +25% firepower.', atk:{armour:25}, fx:'dust'},
    scop:{n:'Race to Berlin', star:6, txt:'Ground +2 move, armour +35% and may act twice.', mv:{ground:2}, atk:{armour:35}, again:'armour', fx:'dust'},
    look:{cap:'none', bald:true, face:'#e8bc98', hair:'#e8bc98', jaw:1, tunic:'#8b7f55', medals:true},
    say:{start:'Tanks forward. Do not stop to look back.', win:'We reached the river first.', lose:'Bring up the reserves.', power:'Tanks, forward! Ram them if you must!'}},
  chuikov: {n:'Vasily Chuikov', nat:'su', rank:'Colonel General', nick:'The Stone General',
    bio:'Defended Stalingrad with the 62nd Army, then took the surrender of Berlin with the 8th Guards Army.',
    d2d:{txt:'Infantry +20% firepower. Units in towns and ruins +20% defence.', atk:{foot:20}, def:{urban:20}},
    cop:{n:'Hug the Enemy', star:3, txt:'Infantry +30% firepower, +1 move.', atk:{foot:30}, mv:{foot:1}, fx:'dust'},
    scop:{n:'Not a Step Back', star:6, txt:'Storm groups reinforce the front. All heal 3 HP, infantry +40%.', heal:3, atk:{foot:40}, spawn:{roles:['inf', 'inf', 'eng'], where:'front', kind:'reinforce'}},
    look:{cap:'soviet', face:'#dcac86', hair:'#2a2420', jaw:2, curly:true, tunic:'#8b7f55', medals:true},
    say:{start:'Time is blood. Close with them, so close their guns cannot fire.', win:'Every house was a fortress. Now every house is ours.', lose:'There is no land beyond the Volga.', power:'Grenades and bayonets! Into the house!'}},
  rokossovsky: {n:'Konstantin Rokossovsky', nat:'su', rank:'Marshal of the Soviet Union', nick:'The Dagger',
    bio:'Commanded the 1st Belorussian Front in Operation Bagration, June 1944, the destruction of German Army Group Centre.',
    d2d:{txt:'All units +10% firepower in woods and marsh. Infantry +1 move.', atk:{cover:10}, mv:{foot:1}},
    cop:{n:'Two Main Blows', star:3, txt:'Barrage on two positions (2 HP). Armour +1 move.', strike:{hp:2, r:1, n:2, kind:'barrage'}, mv:{armour:1}},
    scop:{n:'Bagration', star:7, txt:'Encirclement: enemy -1 move. Ground +2 move, +25%, armour may act twice.', enemyMv:-1, mv:{ground:2}, atk:{all:25}, again:'armour', fx:'dust'},
    look:{cap:'soviet', face:'#e6bc9a', hair:'#4a3c30', jaw:1, tunic:'#8b7f55', medals:true},
    say:{start:'Through the marshes. They will not expect us there.', win:'Army Group Centre no longer exists.', lose:'The marsh has swallowed us.', power:'Both blows, together, now!'}},
};
const CO_BY_NAT = {};
for (const [id, c] of Object.entries(CO)) (CO_BY_NAT[c.nat] = CO_BY_NAT[c.nat] || []).push(id);

/* groups used by CO effects */
function inGroup(d, g, terrain) {
  switch (g) {
    case 'all': return true;
    case 'ground': return !d.air && !d.sea;
    case 'armour': return !!d.armour && d.role !== 'apc';
    case 'tread': return d.mt === 'tread';
    case 'foot': return !!d.foot;
    case 'indirect': return !!d.indirect;
    case 'air': return !!d.air;
    case 'sea': return !!d.sea;
    case 'apc': return d.role === 'apc';
    case 'cover': return ['city','hq','fact','air','port','forest','bunker','ruins','bocage','trench'].includes(terrain);
    case 'urban': return ['city','hq','fact','ruins','block'].includes(terrain);
  }
  return false;
}
