/* ============================== THE MAPLE LEAF AND THE WHITE EAGLE ==============================
   Canada and Poland's armies in the West, 1942-44: the disaster at Dieppe, the
   streets of Ortona, the monastery of Monte Cassino, Juno Beach, the Mace at
   Falaise, the flooded Scheldt, and Breda, freed without a shot at the city. */

/* Canada: the Red Ensign, battledress, and the maple leaf */
FLAG_EXTRA.ca = (g, x, y, w, h) => { g.fillStyle = '#c8202a'; g.fillRect(x, y, w, h); const cw = w * .45, ch = h * .5; g.fillStyle = '#1a2e6a'; g.fillRect(x, y, cw, ch); g.fillStyle = '#f4f4ee'; g.fillRect(x, y + ch * .4, cw, ch * .2); g.fillRect(x + cw * .42, y, cw * .16, ch); g.fillStyle = '#c8202a'; g.fillRect(x, y + ch * .45, cw, ch * .1); g.fillRect(x + cw * .46, y, cw * .08, ch); g.fillStyle = '#e8d8a0'; g.fillRect(x + w * .68, y + h * .3, w * .14, h * .4); };
MARK_EXTRA.maple = (P, x, y, s = 1) => { P.R(x - 3 * s, y - 2.2 * s, 6 * s, 4.4 * s, '#c8202a'); P.poly([[x, y - 1.8 * s], [x + .6 * s, y - .6 * s], [x + 1.6 * s, y - 1 * s], [x + 1.2 * s, y + .4 * s], [x + .4 * s, y + .6 * s], [x, y + 1.6 * s], [x - .4 * s, y + .6 * s], [x - 1.2 * s, y + .4 * s], [x - 1.6 * s, y - 1 * s], [x - .6 * s, y - .6 * s]], '#f4f4ee'); };
Object.assign(HELMET_COL, {ca:'#6a6448', plw:'#6a6448'});
Object.assign(NAT_BASE, {ca:'uk', plw:'pl'});
Object.assign(INF_WEAPONS, {ca:INF_WEAPONS.uk || {inf:['rifle', 'rifle', 'bren']}, plw:INF_WEAPONS.uk || {inf:['rifle', 'rifle', 'bren']}});
NATION.ca = {n:'Canada', adj:'Canadian', short:'First Canadian Army', side:'allies',
  col:{m:'#6a6448', d:'#454030', ui:'#c8202a', team:'#c8202a', hi:'#d0c8a8'},
  uniform:'#7a6a48', helmet:'brodie', star:'maple',
  u:Object.assign({}, NATION.uk.u, {
    inf:  {n:'Rifle Section', w:'Lee-Enfield No. 4 & Bren', snd:'bren'},
    tank: {n:'Sherman V (Canadian Armoured Corps)', w:'75 mm M3', snd:'gun75', shape:'sherman', pow:1},
    mtank:{n:'Sherman Firefly', w:'17-pounder', snd:'gun17pdr', shape:'firefly'},
    htank:{n:'Churchill Mk III (Calgary Regiment)', w:'6-pounder', snd:'gun50', shape:'churchill', pow:.95},
    eng:  {n:'Royal Canadian Engineers', w:'charges, Bangalore torpedoes & bridging', snd:'bangalore'},
    apc:  {n:'Kangaroo (converted Priest)', w:'carries infantry under armour', snd:'naval', shape:'carrier', mv:6},
    lc:   {n:'Buffalo (LVT-4)', w:'carries troops across the flooded polders', snd:'naval', shape:'lvt', mt:'amphib', mv:5, sea:false},
  })};
NATION.plw = {n:'Poland', adj:'Polish', short:'Polskie Siły Zbrojne na Zachodzie', side:'allies',
  col:{m:'#6a6448', d:'#454030', ui:'#d42a3a', team:'#d42a3a', hi:'#d0c8a8'},
  uniform:'#7a6a48', helmet:'brodie', star:'plcheck',
  u:Object.assign({}, NATION.uk.u, {
    inf:  {n:'Strzelcy (Polish Rifles)', w:'Lee-Enfield No. 4 & Bren', snd:'bren'},
    tank: {n:'Sherman V (1st Armoured Division)', w:'75 mm M3', snd:'gun75', shape:'sherman', pow:1},
    mtank:{n:'Sherman Firefly (1st Armoured Division)', w:'17-pounder', snd:'gun17pdr', shape:'firefly'},
    recon:{n:'Cromwell (10th Mounted Rifles)', w:'75 mm', snd:'gun75', shape:'cromwell', mt:'tread', mv:7, cost:6000},
    eng:  {n:'Saperzy', w:'charges & mine detectors', snd:'bangalore'},
  })};
MOOD_ALIAS.ca = 'uk'; MOOD_ALIAS.plw = 'pl';
TER.marsh.mv.amphib = 2;                                     /* Buffaloes and swimming tanks wallow across flooded polders */
BARKS.ca = {sel:['Yes, sir!', 'On it!', 'Right away!'], veh:['Moving!'], move:['Let\'s go, boys!', 'Follow me!'], atk:['Give \'em hell!', 'Fire!', 'Get in there!'],
  kill:['Got him!', 'Scratch one!'], hurt:['Medic!', 'I\'m hit!', 'Get down!'], cap:['It\'s ours!'], new:['Ready!'], idle:['Anyone got a smoke?', 'Miss the snow at home.', 'When\'s the mail coming?', 'Zombies? Nah.']};
BARKS.plw = BARKS.pl || BARKS.ca;

Object.assign(CO, {
  roberts:{n:'John Hamilton Roberts', nat:'ca', rank:'Major General', nick:'2nd Canadian Division',
    bio:'Commanded the landing at Dieppe on 19 August 1942. He sent his reserves into the beaches on the strength of garbled radio messages that suggested success. He was made the scapegoat for a plan made by others, and never commanded in battle again.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Send in the Reserves', star:3, txt:'Infantry +20% firepower.', atk:{foot:20}},
    scop:{n:'Operation Jubilee', star:6, txt:'All units +25% firepower and defence.', atk:{all:25}, def:{all:25}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:2, tunic:'#7a6a48'},
    say:{start:'Over the shingle and into the town.', win:'The batteries are silenced.', lose:'Vanquish. Get them off the beaches.', power:'Everyone ashore!'}},
  vokes:{n:'Chris Vokes', nat:'ca', rank:'Major General', nick:'1st Canadian Division',
    bio:'A blunt, profane soldier who commanded the 1st Canadian Division at Ortona in December 1943. Its men invented "mouse-holing": blowing holes through the walls from house to house rather than going out into the streets.',
    d2d:{txt:'Engineers +20% firepower.', atk:{foot:10}},
    cop:{n:'Mouse-holing', star:3, txt:'Infantry +2 move and +15% firepower.', mv:{foot:2}, atk:{foot:15}},
    scop:{n:'Little Stalingrad', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#7a6a48', moustache:true},
    say:{start:'House by house. Through the walls if we have to.', win:'Ortona is ours.', lose:'Pull back to the square.', power:'Blow the wall!'}},
  keller:{n:'Rod Keller', nat:'ca', rank:'Major General', nick:'3rd Canadian Division',
    bio:'Commanded the 3rd Canadian Division on D-Day. His division landed on Juno beach, through rough seas and heavy fire, and pushed further inland on 6 June than any other Allied division.',
    d2d:{txt:'All units +10% firepower.', atk:{all:10}},
    cop:{n:'The Beaches', star:3, txt:'Infantry +20% firepower and +1 move.', atk:{foot:20}, mv:{foot:1}},
    scop:{n:'Juno', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#7a6a48'},
    say:{start:'Off the beach and inland. Carpiquet by tonight.', win:'Further than anyone!', lose:'Dig in on the beach.', power:'Inland! Inland!'}},
  simonds:{n:'Guy Simonds', nat:'ca', rank:'Lieutenant General', nick:'II Canadian Corps',
    bio:'The most able Canadian commander of the war, inventive and cold. He commanded the First Canadian Army in the Battle of the Scheldt, the hard, wet fight in flooded polders to open the port of Antwerp in October 1944, and had the dykes of Walcheren bombed to flood the island.',
    d2d:{txt:'Amphibious vehicles +1 move.', mv:{ground:1}},
    cop:{n:'Buffaloes', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'Flood the Island', star:6, txt:'All units +30% firepower; enemy -1 move.', atk:{all:30}, enemyMv:-1},
    look:{cap:'beret', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#7a6a48', moustache:true},
    say:{start:'Open the Scheldt. Antwerp is useless until we do.', win:'The estuary is clear.', lose:'The polders are drowning us.', power:'Buffaloes forward!'}},
  anders:{n:'Władysław Anders', nat:'plw', rank:'Lieutenant General', nick:'II Polish Corps',
    bio:'A cavalry general wounded and captured by the Soviets in 1939, he spent twenty months in the Lubyanka prison. Released after Germany invaded the USSR, he led tens of thousands of Polish prisoners out of the Soviet Union, through Persia, to form the II Polish Corps. In May 1944 it took Monte Cassino.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'For Our Freedom and Yours', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'The Red Poppies', star:6, txt:'All units +40% firepower.', atk:{all:40}},
    look:{cap:'rogatywka', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#7a6a48'},
    say:{start:'The monastery. Whatever it costs.', win:'The flag is on Monte Cassino.', lose:'Again. We go again.', power:'Naprzód!'}},
  maczek:{n:'Stanisław Maczek', nat:'plw', rank:'Major General', nick:'1st Armoured Division',
    bio:'Led a motorised brigade against the Germans in Poland in 1939 and again in France in 1940, and escaped both times. With the 1st Polish Armoured Division he closed the Falaise Gap in August 1944, and in October liberated Breda without firing his artillery on the city. Its citizens made him an honorary citizen.',
    d2d:{txt:'Armour +1 move.', mv:{armour:1}},
    cop:{n:'Black Devils', star:3, txt:'Armour +25% firepower.', atk:{armour:25}},
    scop:{n:'Maczuga', star:6, txt:'All units +35% defence and +20% firepower.', def:{all:35}, atk:{all:20}},
    look:{cap:'beret', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#7a6a48', moustache:true},
    say:{start:'Through the city, but not one shell on the houses.', win:'Breda is free.', lose:'Pull back to the canal.', power:'Czarne Diabły, naprzód!'}},
  koszutski:{n:'Stanisław Koszutski', nat:'plw', rank:'Lieutenant Colonel', nick:'Hill 262, "Maczuga"',
    bio:'Commanded the 2nd Armoured Regiment, part of the Polish battle group cut off on Hill 262, the ridge the Poles called Maczuga, the Mace, astride the last escape road out of the Falaise pocket in August 1944. "The Poles have the Germans in a bottle," wrote a British officer, "and are holding the cork."',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'The Cork', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Maczuga', star:6, txt:'All units +40% defence and +15% firepower.', def:{all:40}, atk:{all:15}},
    look:{cap:'beret', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#7a6a48'},
    say:{start:'We hold the hill. The Canadians are coming.', win:'The Canadians are here!', lose:'Fight to the last.', power:'Hold the cork!'}},
  haase:{n:'Conrad Haase', nat:'ger', rank:'Generalleutnant', nick:'302. Infanterie-Division',
    bio:'Commanded the 302nd Infantry Division, which held the coast at Dieppe. His men had been warned: the tides and moon were right for a raid. The defences on the headlands either side of the beach were never touched by the bombardment.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Alarm', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'The Headlands', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'They are coming exactly where we expected.', win:'They are re-embarking.', lose:'The batteries are lost.', power:'Feuer frei!'}},
  richter:{n:'Wilhelm Richter', nat:'ger', rank:'Generalleutnant', nick:'716. Infanterie-Division',
    bio:'Commanded the 716th Static Division, older men and conscripted Osttruppen in concrete strongpoints along Juno, Gold and Sword. By the evening of D-Day his division had ceased to exist.',
    d2d:{txt:'Fixed defences +15% firepower.', atk:{indirect:15}},
    cop:{n:'Widerstandsnest', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Counter-attack', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'Hold the strongpoints until the panzers come.', win:'They are pinned on the beach.', lose:'The division is gone.', power:'Feuer!'}},
  meindl:{n:'Eugen Meindl', nat:'ger', rank:'General der Fallschirmtruppe', nick:'II. Fallschirmkorps',
    bio:'Led the remains of the II Parachute Corps out of the Falaise pocket on 20 August 1944, attacking the Polish positions on Hill 262 from inside the pocket while the 2nd SS Panzer Corps attacked them from outside.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Breakout', star:3, txt:'All ground units +1 move and +15% firepower.', mv:{ground:1}, atk:{all:15}},
    scop:{n:'The Corridor', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:2, tunic:'#5a6a6a', collar:'#e8d040'},
    say:{start:'Through the Poles, or we all die in this pocket.', win:'The corridor is open!', lose:'There is no way out.', power:'Durchbruch!'}},
  daser:{n:'Wilhelm Daser', nat:'ger', rank:'Generalleutnant', nick:'70. Infanterie-Division',
    bio:'Commanded the 70th Infantry Division on Walcheren, the "White Bread Division", made up of men with stomach ailments who needed a special diet. They fought hard in the flooded island\'s ruins until November 1944.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'The Dykes', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Festung Walcheren', star:6, txt:'All units +30% defence and +15% firepower.', def:{all:30}, atk:{all:15}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0', glasses:true},
    say:{start:'Hold the causeway.', win:'They cannot cross the causeway.', lose:'The island is lost.', power:'Feuer!'}},
  chill:{n:'Kurt Chill', nat:'ger', rank:'Generalleutnant', nick:'Kampfgruppe Chill',
    bio:'Gathered stragglers into a battle group that stopped the Allied pursuit on the Albert Canal in September 1944, and fought the retreating actions in southern Holland that autumn.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Stragglers', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Last Ditch', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'Hold Breda as long as you can.', win:'They will not take the city.', lose:'Back over the Mark.', power:'Feuer!'}},
});
for (const id of ['roberts', 'vokes', 'keller', 'simonds', 'anders', 'maczek', 'koszutski', 'haase', 'richter', 'meindl', 'daser', 'chill']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {roberts:'reckless', vokes:'methodical', keller:'aggressive', simonds:'methodical', anders:'aggressive', maczek:'opportunist', koszutski:'cautious', haase:'cautious', richter:'cautious', meindl:'aggressive', daser:'cautious', chill:'cautious'});

const MAPLE_MISSIONS = {
  dieppe:{name:'Dieppe', place:'The shingle beach of Dieppe', date:'19 August 1942, 05:20', theme:'normandy', weather:'clear',
    p1:{nat:'ca', co:'roberts', funds:0, u:{inf:{n:'Royal Hamilton Light Infantry & Essex Scottish', w:'Lee-Enfield & Bren'}, lc:{n:'LCT (Tank Landing Craft)', shape:'lca'}}},
    p2:{nat:'ger', co:'haase', funds:0, u:{inf:{n:'302. Infanterie-Division', w:'Kar98k & MG 34'}, nest:{n:'MG Position in the Casino', w:'MG 34'}, pak:{n:'Battery on the Headland', w:'guns in caves in the cliffs', shape:'casemate'}}},
    objective:{win:'kill', role:'nest', n:7, limit:6}, goal:'Operation Jubilee: knock out seven of the strongpoints on the seafront by {limit}. The headland guns are in caves in the cliffs.',
    brief:'A raid in force on a French port: to see if one could be taken, to test the Germans, and to show the Russians that the Western Allies were fighting. Five thousand Canadians of the 2nd Division and the new Churchill tanks of the Calgary Regiment are going ashore on the shingle at Dieppe, in daylight, without a heavy bombardment, under cliffs whose guns nobody has knocked out. The shingle is made of round stones the size of fists. Nobody has checked whether tanks can climb it.',
    clock:{start:'1942-08-19T05:20', step:60},
    build:() => { const b = MB(32, 22, '.', 70101);
      b.rect(0, 16, 31, 21, '~').rect(6, 14, 25, 15, 'n').rect(0, 14, 5, 15, 'u').rect(26, 14, 31, 15, 'u');   // the shingle and the cliffs
      b.rect(0, 8, 5, 13, '^').rect(26, 8, 31, 13, '^').rect(7, 6, 24, 12, 'U');                     // headlands and the town
      b.rect(8, 13, 23, 13, 'w').scatter('B', .1, 8, 9, 23, 12, ['U']);
      b.road([[6, 13], [25, 13]]).road([[15, 13], [15, 0]]);
      b.put([[15, 2, 'q'], [10, 8, 'k'], [20, 8, 'k'], [2, 9, 'k'], [29, 9, 'k'], [15, 18, 'P']]);
      return b.rows(); },
    units:{1:'lc*5 7,17-24,19 +htank+inf; inf*5 6,16-25,18; eng*2 12,16-18,18; dd*2 2,19-29,21',
      2:'nest*7 7,12-24,13; pak*2 2,10-29,11; inf*5 8,7-23,11; mortar*2 12,4-18,6; art*2 10,1-20,3; at*2 9,10-22,12'},
    events:[{day:1, team:2, say:'The landing craft come in to the beach in broad daylight. The guns on the headlands are untouched.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'Roberts, getting garbled messages that the Essex Scottish are in the town, sends in his reserve, the Fusiliers Mont-Royal.', spawn:'lc*2 10,17-20,19 +inf+inf'},
      {day:3, team:1, say:'Spitfires and Hurribombers over the town in the biggest air battle since 1940.', hurt:1},
      {day:4, team:2, say:'German reinforcements come into the town from Arques.', spawn:'inf*3 10,0-20,3'}]},
  ortona:{name:'Ortona', place:'The streets of Ortona, on the Adriatic', date:'21 December 1943, 08:00', theme:'sicily', weather:'rain',
    p1:{nat:'ca', co:'vokes', funds:0, u:{inf:{n:'Loyal Edmonton Regiment & Seaforth Highlanders of Canada', w:'Lee-Enfield, Bren & Thompson'}, eng:{n:'Mouse-holing Section', w:'beehive charges to blow holes through the walls', pow:1.2}, tank:{n:'Sherman (Three Rivers Regiment)'}}},
    p2:{nat:'ger', co:'heidrich', funds:0, u:{inf:{n:'Fallschirmjäger-Regiment 3', w:'MG 42, MP 40 & panzerfausts', pow:1.1}, nest:{n:'MG 42 in a Booby-trapped House'}}},
    objective:{win:'hq', limit:14}, goal:'Take Ortona, house by house, and the castle at the end of the town by {limit}.',
    brief:'Ortona is a small port on the Adriatic, its narrow streets and stone houses packed onto a headland. The German paratroopers have blown the side streets into rubble, so there is only one way through: the main street, swept by machine guns. The Canadians have found another way: they blow holes through the walls with charges and go from house to house inside, never stepping into the street. It is going to take every day until Christmas, and beyond.',
    clock:{start:'1943-12-21T08:00', step:120},
    build:() => { const b = MB(30, 20, '.', 70202);
      b.rect(0, 0, 29, 1, '~').rect(26, 0, 29, 19, '~').rect(25, 2, 25, 19, 's');
      b.rect(8, 3, 24, 17, 'U').scatter('x', .25, 8, 3, 24, 17, ['U']).scatter('G', .3, 0, 2, 7, 19, ['.']);
      b.road([[0, 10], [24, 10]]).road([[16, 3], [16, 17]]);
      b.put([[1, 10, 'Q'], [4, 4, 'C'], [4, 16, 'C'], [23, 4, 'q'], [12, 7, 'k'], [17, 13, 'k'], [20, 6, 'k'], [22, 15, 'k'], [24, 10, 'o']]);
      return b.rows(); },
    units:{1:'inf*8 1,3-7,17; eng*3 4,8-7,12; tank*3 2,9-6,12; at*2 3,6-7,15; mortar*2 1,7-3,13; art*2 0,4-1,16',
      2:'inf*6 9,4-23,16; nest*4 10,5-22,15; at*2 12,8-20,12; mortar*2 18,4-22,10; art 22,13'},
    events:[{day:2, team:2, say:'The paratroopers blow whole houses down onto the Canadians inside them.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'Christmas Day. In the church of Santa Maria di Costantinopoli, the Seaforths eat Christmas dinner a company at a time, then go back into the fight.', heal:2},
      {day:4, team:2, say:'Fresh paratroopers infiltrate back into the ruins.', spawn:'inf*2 14,4-20,9'},
      {day:5, team:1, say:'The anti-tank guns are man-handled forward and fire point-blank into the houses.', hurt:1}]},
  cassinopl:{name:'Monte Cassino', place:'The monastery hill and Point 593', date:'17 May 1944, 06:00', theme:'apennine', weather:'clear',
    p1:{nat:'plw', co:'anders', funds:0, u:{inf:{n:'3rd Carpathian Rifle Division', w:'Lee-Enfield, Bren & grenades'}}},
    p2:{nat:'ger', co:'heidrich', funds:0, u:{inf:{n:'1. Fallschirmjäger-Division', w:'MG 42, MP 40 & mortars', pow:1.1}}},
    objective:{win:'hq', limit:17}, goal:'Take the monastery of Monte Cassino by {limit}. Three armies have failed here before you.',
    brief:'Three times since January the Allies have attacked Monte Cassino and three times they have failed. Now it is the turn of the II Polish Corps: men who were deported to Siberia by the Soviets in 1940, freed in 1941, and marched out through Persia to fight. They have to take the ridges behind the monastery, Point 593, Phantom Ridge, Snakeshead, where the British and Americans and Indians and New Zealanders bled before them, with the paratroopers watching every path. The corps has a bear on its strength.',
    clock:{start:'1944-05-17T06:00', step:120},
    build:() => { const b = MB(30, 22, 'M', 70303);
      b.blobs('^', 12, 0, 0, 29, 21, 1, 2, ['M']).blobs('.', 4, 0, 10, 10, 21, 1, 2, ['M', '^']).scatter('x', .15, 0, 0, 29, 21, ['^']);
      b.rect(22, 7, 26, 11, 'x').rect(23, 8, 25, 10, 'B');                                        // the ruined monastery
      b.road([[0, 18], [8, 15], [14, 12], [20, 10], [24, 9]]);
      b.put([[1, 18, 'Q'], [4, 14, 'C'], [6, 20, 'C'], [24, 9, 'q'], [14, 5, 'k'], [18, 14, 'k'], [20, 3, 'k'], [27, 16, 'k']]);
      return b.rows(); },
    units:{1:'inf*10 0,12-9,21; mortar*3 2,15-6,19; art*3 0,16-2,21; eng*2 6,14-9,17; at 5,16; tank*2 7,17-9,19',
      2:'inf*7 12,2-26,15; nest*4 14,4-24,12; mortar*3 18,6-26,13; art*2 25,2-29,8; at 21,8'},
    events:[{day:1, team:2, say:'The paratroopers on Point 593 cut down the first wave on the bare rock.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'Private Wojtek, a Syrian brown bear enlisted in the 22nd Artillery Supply Company, carries crates of shells up to the guns.', heal:1, funds:3000},
      {day:3, team:1, say:'British XIII Corps breaks through in the Liri valley below. The paratroopers are ordered to pull back.', hurt:1},
      {day:4, team:2, say:'The last paratroopers hold the monastery ruins.', spawn:'inf*2 22,7-26,11'}]},
  juno:{name:'Juno Beach', place:'Courseulles and Bernières-sur-Mer', date:'6 June 1944, 07:45', theme:'normandy', weather:'overcast',
    p1:{nat:'ca', co:'keller', funds:0, u:{inf:{n:'Regina Rifles & Queen\'s Own Rifles of Canada', w:'Lee-Enfield No. 4 & Bren'}, ddtank:{n:'Sherman DD (1st Hussars)'}}},
    p2:{nat:'ger', co:'richter', funds:0, u:{inf:{n:'716. Infanterie-Division (Osttruppen)', w:'Kar98k & MG 42', pow:.9}}},
    objective:{win:'hq', limit:14}, goal:'Get off Juno beach and drive inland to the Caen-Bayeux road by {limit}.',
    brief:'The Canadians land on Juno, between the British on Gold and Sword. The sea is rough; the landing is late, the tide is high, and the boats run in among the beach obstacles with their mines. In front of the Regina Rifles at Courseulles and the Queen\'s Own at Bernières are concrete strongpoints that the bombardment missed. Behind them the country opens out towards Carpiquet airfield and the Caen-Bayeux road, the objective for tonight. The Canadians have three years of waiting, and Dieppe, to make up for.',
    clock:{start:'1944-06-06T07:45', step:120},
    build:() => { const b = MB(32, 22, '.', 70404);
      b.rect(0, 18, 31, 21, '~').rect(0, 16, 31, 17, 's').scatter('O', .35, 0, 16, 31, 17, ['s']);
      b.rect(4, 13, 10, 15, 'U').rect(18, 13, 24, 15, 'U').scatter('B', .25, 4, 13, 24, 15, ['U']);    // Courseulles and Bernières
      b.scatter(',', .3, 0, 0, 31, 12, ['.']).blobs('h', 6, 0, 0, 31, 11, 1, 2, ['.', ',']);
      b.river([[12, 0], [13, 8], [14, 16]], .15);
      b.road([[0, 3], [31, 3]]).road([[7, 13], [9, 3]]).road([[21, 13], [20, 3]]);
      b.put([[15, 1, 'q'], [7, 13, 'k'], [21, 13, 'k'], [8, 6, 'k'], [24, 6, 'k'], [3, 2, 'k'], [28, 1, 'k'], [15, 17, 'P']]);
      return b.rows(); },
    units:{1:'lc*6 2,18-29,20 +inf+inf; ddtank*4 4,18-26,20; dd*2 6,21-25,21; inf*4 3,16-28,17; eng*2 8,16-22,17',
      2:'nest*6 4,13-24,15; pak*2 6,13-22,15; inf*6 2,5-29,12; mortar*2 10,8-20,11; art*2 6,1-26,3; at*2 8,9-24,12'},
    events:[{day:1, team:2, say:'The strongpoints at Courseulles and Bernières are untouched. The Queen\'s Own lose half a company in the first minutes.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'The reserve brigade lands: the Chaudières, the North Shores and the Highland Light Infantry of Canada.', spawn:'inf*4 6,16-26,17; tank*2 10,16-20,17'},
      {day:3, team:2, say:'The 12th SS Hitlerjugend Division arrives in front of Carpiquet.', spawn:'tank*3 4,0-12,2; inf*3 20,0-28,2'},
      {day:4, team:1, say:'Typhoons with rockets over the inland villages.', hurt:1}]},
  maczuga:{name:'The Mace', place:'Hill 262, Mont Ormel, closing the Falaise Gap', date:'19 August 1944, 18:00', theme:'normandy', weather:'clear',
    p1:{nat:'plw', co:'koszutski', funds:0, u:{inf:{n:'8th & 9th Rifle Battalions'}}},
    p2:{nat:'ger', co:'meindl', funds:0, u:{inf:{n:'Remnants of the 7th Army (and SS Panzergrenadiers)', w:'everything they could carry'}, mtank:{n:'Panther (2. SS-Panzer-Division Das Reich)'}}},
    objective:{win:'survive', days:4, hold:3, protect:'tank', protectN:3}, goal:'Hold Hill 262, the cork in the bottle, until {survive}. Keep three of your Shermans and three of your four positions. The Canadians are coming.',
    persona:{2:'brawler'},
    brief:'The Falaise pocket is almost closed. Inside it, the remains of two German armies, a hundred thousand men, are trying to get out through a gap a few miles wide. Across the last road out sits a battle group of the 1st Polish Armoured Division, 1,500 men and 80 tanks, on a wooded ridge they have named Maczuga, the Mace, for its shape on the map. They are surrounded. The Germans are attacking from inside the pocket, desperate to get out, and the SS panzers from outside, to get them out. The Canadians are coming to relieve you. They are late.',
    clock:{start:'1944-08-19T18:00', step:120},
    build:() => { const b = MB(30, 22, '.', 70505);
      b.scatter(',', .3, 0, 0, 29, 21, ['.']).blobs('h', 8, 0, 0, 29, 21, 1, 2, ['.', ',']).blobs('T', 4, 0, 0, 29, 21, 1, 1, ['.', ',']);
      b.rect(12, 7, 18, 14, '^').rect(13, 8, 17, 13, 'T', ['^']);                                    // the Mace
      b.river([[0, 18], [12, 17], [29, 19]], .15);                                                   // the Dives
      b.road([[0, 11], [29, 10]]).road([[15, 0], [15, 21]]);
      b.put([[15, 11, 'Q'], [13, 8, 'C'], [17, 13, 'C'], [17, 8, 'C'], [3, 4, 'k'], [3, 17, 'k'], [26, 4, 'k'], [26, 17, 'k']]);
      return b.rows(); },
    units:{1:'tank*6 12,7-18,14; mtank*2 13,9-17,12; inf*5 12,7-18,14; at*2 13,8-17,13; mortar*2 14,9-16,12; art 15,10',
      2:'inf*8 0,4-8,18; mtank*2 0,8-4,13; tank*3 1,5-6,16; art*2 0,1-3,20; inf*3 24,2-29,18; mtank*2 25,8-29,13'},
    events:[{day:1, team:2, say:'The first columns from the pocket hit the hill, and run straight into the Shermans.', spawn:'inf*4 0,8-5,14'},
      {day:2, team:2, say:'Das Reich attacks from outside the pocket to open the corridor.', spawn:'mtank*2 24,5-29,10; inf*3 23,12-29,18'},
      {day:2, team:1, say:'Ammunition is running out. The wounded lie in the open; there is no way to get them out.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'Meindl\'s paratroopers attack from the pocket at dawn.', spawn:'inf*4 0,4-6,10'},
      {day:4, team:1, say:'The Canadian Grenadier Guards break through to the Poles.', spawn:'tank*3 26,9-29,13'}]},
  scheldt:{name:'The Scheldt', place:'The Walcheren causeway and the flooded polders', date:'31 October 1944, 08:00', theme:'holland', weather:'rain',
    p1:{nat:'ca', co:'simonds', funds:0, u:{inf:{n:'Black Watch & Calgary Highlanders', w:'Lee-Enfield & Bren'}}},
    p2:{nat:'ger', co:'daser', funds:0, u:{inf:{n:'70. Infanterie-Division', w:'Kar98k & MG 42'}}},
    objective:{win:'hq', limit:22}, goal:'Cross the flooded polders and the causeway, and take Middelburg by {limit}. Antwerp cannot be used until the Scheldt is clear.',
    brief:'Antwerp, the great port the Allies need to feed their armies, has been in British hands for two months and is useless: the Germans still hold the banks of the Scheldt estuary. The First Canadian Army has spent October fighting through flooded fields, along dykes swept by machine guns, in endless rain. Now only Walcheren island is left, linked to the mainland by a causeway forty yards wide and a mile long, with no cover at all. The RAF has bombed the sea dykes and flooded the island. The Buffaloes can swim.',
    clock:{start:'1944-10-31T08:00', step:120},
    build:() => { const b = MB(34, 20, 'v', 70606);
      b.rect(0, 0, 33, 1, '~').rect(0, 18, 33, 19, '~');
      b.rect(0, 2, 9, 17, '.').scatter(',', .3, 0, 2, 9, 17, ['.']);
      b.rect(10, 9, 15, 10, '='); b.rect(10, 2, 15, 8, '~').rect(10, 11, 15, 17, '~');                 // the causeway across the Sloe
      b.path([[16, 9], [22, 5], [30, 8]], (x, y) => b.set(x, y, '=')).path([[22, 5], [24, 14]], (x, y) => b.set(x, y, '='));   // the dykes
      b.rect(26, 7, 31, 12, 'U').scatter('T', .1, 16, 2, 33, 17, ['v']);
      b.put([[1, 9, 'Q'], [4, 4, 'C'], [4, 15, 'C'], [28, 9, 'q'], [18, 9, 'k'], [22, 5, 'k'], [24, 14, 'k'], [31, 4, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 0,3-9,16; lc*4 6,3-9,16; tank*2 2,8-5,11; art*3 0,4-2,15; mortar*2 3,6-6,13; eng*2 7,8-9,11',
      2:'inf*4 16,3-31,16; nest*3 16,8-24,12; art 28,4-32,15; mortar*2 23,6-27,13; pak 17,9; inf*2 26,8-31,11'},
    events:[{day:2, team:1, say:'Commandos land at Westkapelle and Flushing from the sea, behind the Germans.', spawn:'inf*3 30,2-33,5'},
      {day:3, team:2, say:'Rain, and more rain. The polders are a lake.', hurt:1, hurtTeam:1},
      {day:4, team:1, say:'The Scottish Lowlanders of the 52nd Division wade across the Sloe channel at low tide, south of the causeway.', spawn:'inf*3 12,15-15,17'},
      {day:5, team:1, say:'Typhoons dive on the German guns.', hurt:1}]},
  breda:{name:'Breda', place:'The city of Breda and the Mark canal', date:'28 October 1944, 08:00', theme:'holland', weather:'overcast',
    p1:{nat:'plw', co:'maczek', funds:0, u:{inf:{n:'10th Dragoons & Podhale Rifles'}}},
    p2:{nat:'ger', co:'chill', funds:0},
    objective:{win:'hq', limit:9}, goal:'Liberate Breda by {limit}. Maczek has forbidden artillery fire on the city: you have no guns.',
    brief:'The 1st Polish Armoured Division has fought its way across Belgium and into Holland. Ahead is Breda, a lovely old city full of civilians, held by the Germans behind canals and anti-tank ditches. General Maczek has given an order that his gunners do not like: not a single shell is to be fired into the city. The Poles will take Breda by going round it, through the woods and over the canals, and in at the back. There will be no artillery on your side.',
    clock:{start:'1944-10-28T08:00', step:120},
    build:() => { const b = MB(32, 22, '.', 70707);
      b.scatter(',', .3, 0, 0, 31, 21, ['.']).blobs('T', 8, 0, 0, 31, 21, 1, 2, ['.', ',']);
      b.rect(20, 7, 28, 15, 'U').river([[17, 0], [18, 11], [17, 21]], .1);                           // the city and the Mark
      b.path([[19, 6], [29, 6], [29, 16], [19, 16]], (x, y) => { if (b.get(x, y) !== 'r') b.set(x, y, 'z'); });   // the anti-tank ditch
      b.road([[0, 11], [17, 11], [24, 11], [31, 11]]).road([[24, 0], [24, 21]]);
      b.put([[1, 11, 'Q'], [5, 4, 'C'], [5, 18, 'C'], [24, 11, 'q'], [22, 8, 'k'], [26, 14, 'k'], [27, 8, 'k'], [12, 3, 'k'], [12, 19, 'k']]);
      return b.rows(); },
    units:{1:'tank*5 1,6-6,16; mtank*2 2,9-5,13; recon*3 3,4-7,18; inf*6 1,4-8,18; eng*2 6,9-8,13; at*2 4,7-7,15',
      2:'inf*6 18,5-28,17; nest*3 19,7-27,15; at*2 18,9-22,13; tank*2 22,9-26,13; mortar*2 25,8-28,14; inf*2 10,2-14,6'},
    events:[{day:2, team:1, say:'The Polish engineers bridge the Mark canal north of the city by night.', spawn:'eng 15,2-17,4', heal:1},
      {day:3, team:2, say:'The Germans blow the bridges over the canals.', hurt:0},
      {day:4, team:1, say:'Tanks come into the city from the east. The people of Breda come out into the streets with orange flags.', heal:1}]},
};
for (const [id, m] of Object.entries(MAPLE_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  dieppe:{forces:['About 5,000 Canadians of the 2nd Division, 1,000 British commandos and 50 US Rangers, with the Churchills of the Calgary Regiment', 'The German 302nd Infantry Division in prepared defences'],
    win:'The seafront strongpoints are silenced and the raid comes home with its lessons.', lose:'The force is pinned on the shingle.',
    real:'Dieppe was a disaster. Of the 4,963 Canadians who sailed, 907 were killed and 1,946 captured; only about 2,200 came back. Most of the Churchills could not climb the shingle or the sea wall. The lessons were learned at terrible cost: never attack a defended port head-on, bring overwhelming fire support, and build special tanks for the beaches. They were used two years later in Normandy.'},
  ortona:{forces:['The 2nd Canadian Infantry Brigade: the Loyal Edmontons and the Seaforth Highlanders of Canada, with Shermans', 'The German 1st Parachute Division'],
    win:'Ortona falls before the New Year.', lose:'The paratroopers hold the town.',
    real:'The battle for Ortona lasted from 20 to 28 December 1943, when the paratroopers withdrew. The Canadians lost about 1,400 men there and on the approaches. War correspondents called it "Little Stalingrad". Mouse-holing, invented in Ortona, became standard practice for street fighting in the Allied armies.'},
  cassinopl:{forces:['The II Polish Corps: the 3rd Carpathian and 5th Kresowa Divisions', 'The German 1st Parachute Division'],
    win:'The Polish flag flies over Monte Cassino.', lose:'The paratroopers still hold the ruins.',
    real:'The Poles attacked on 12 May and again on 17 May 1944, and lost heavily on the bare ridges. But the British broke into the Liri valley below, and the paratroopers withdrew. On the morning of 18 May a Polish patrol raised its regimental pennant over the ruins of the monastery. The Polish cemetery below Monte Cassino holds more than a thousand graves. Wojtek the bear lived out his days in Edinburgh Zoo.'},
  juno:{forces:['The 3rd Canadian Infantry Division and the 2nd Canadian Armoured Brigade', 'The German 716th Static Division, with the 12th SS Panzer Division coming up'],
    win:'The Canadians are off the beach and on the Caen-Bayeux road.', lose:'The landing is held in the towns behind the beach.',
    real:'Juno was the second bloodiest of the D-Day beaches after Omaha: the Canadians lost 340 killed and 574 wounded. But by evening they had pushed further inland than any other Allied division, and a troop of the 1st Hussars reached the Caen-Bayeux railway, the only Allied unit to reach its D-Day objective. The next day the 12th SS Hitlerjugend counter-attacked them and murdered Canadian prisoners at the Abbaye d\'Ardenne.'},
  maczuga:{forces:['About 1,500 men and 80 tanks of the 1st Polish Armoured Division', 'The remnants of the German 7th Army inside the pocket, and the II SS Panzer Corps outside'],
    win:'The Mace holds. The cork stays in the bottle.', lose:'The hill falls and the Germans pour out of the pocket.',
    real:'The Poles held Hill 262 from 19 to 21 August 1944, surrounded, short of ammunition and with their wounded lying in the open, against attacks from both sides. They lost 325 killed. The Canadian Grenadier Guards reached them on 21 August. The Falaise pocket was closed; about 50,000 Germans were captured and 10,000 killed. A memorial stands on the hill today.'},
  scheldt:{forces:['The First Canadian Army, with British commandos and the 52nd Lowland Division', 'The German 70th Infantry Division on Walcheren'],
    win:'Walcheren falls. The Scheldt is open, and Antwerp can feed the armies.', lose:'The causeway holds.',
    real:'The Battle of the Scheldt cost the Canadians about 6,400 casualties. The causeway attack failed, and the 52nd Division waded across the Sloe channel to the south instead, while commandos landed from the sea. Walcheren fell on 8 November 1944. The first convoy reached Antwerp on 28 November, and the port fed the Allied armies until the end of the war.'},
  breda:{forces:['The 1st Polish Armoured Division', 'German battle groups under General Chill'],
    win:'Breda is liberated, and its buildings are still standing.', lose:'The Germans hold the city.',
    real:'The Poles liberated Breda on 29 October 1944, outflanking it rather than shelling it, and the city came through almost undamaged. Its people never forgot: Maczek was made an honorary citizen, and when the post-war Communist government of Poland stripped him of his citizenship, he lived in exile in Edinburgh, working as a barman. He is buried in the Polish war cemetery at Breda, among his soldiers.'},
});
Object.assign(CO_FATE, {
  roberts:'Never again commanded in battle; he spent the rest of the war commanding reinforcement units in England. Died in 1962.',
  vokes:'Commanded the 4th Canadian Armoured Division in North-West Europe. Died in 1985.',
  keller:'Badly wounded when American bombers hit his headquarters by mistake in August 1944. Died in 1954.',
  simonds:'Chief of the General Staff of the Canadian Army from 1951 to 1955. Died in 1974.',
  anders:'Stayed in exile in London after the war, stripped of his Polish citizenship by the Communist government. Died in 1970 and was buried, at his wish, among his soldiers at Monte Cassino.',
  maczek:'Stripped of his citizenship by Communist Poland, he lived in Edinburgh, working as a barman, and died aged 102 in 1994. He is buried among his soldiers at Breda.',
  koszutski:'Survived the war.',
  haase:'Commanded the 15th Army in 1943. Died in 1944.',
  richter:'His division was destroyed in Normandy. Died in 1971.',
  meindl:'Commanded the II Parachute Corps to the end of the war. Died in 1951.',
  daser:'Surrendered at Middelburg on 6 November 1944, and asked for a British officer of equal rank to receive it.',
  chill:'Commanded battle groups in Holland and Germany to the end of the war. Died in 1976.',
});
Object.assign(MISSION_LONLAT, {dieppe:[1.08, 49.93], ortona:[14.4, 42.35], cassinopl:[13.81, 41.49], juno:[-0.42, 49.33], maczuga:[0.2, 48.82], scheldt:[3.6, 51.5], breda:[4.78, 51.59]});
CAMPAIGNS.push({id:'maple', name:'The Maple Leaf and the White Eagle', sub:'Canada and Poland in the West · 1942–1944', side:'allies', missions:['dieppe', 'ortona', 'cassinopl', 'juno', 'maczuga', 'scheldt', 'breda']});
