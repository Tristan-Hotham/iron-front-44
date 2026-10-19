/* ============================== BURMA ==============================
   The Forgotten Army: from the disaster at the Sittang bridge in 1942 to the tank
   dash on Meiktila in 1945. The British Indian Army, Gurkhas and Chindits against
   the Japanese 15th Army, in jungle, in the hills of Assam and on the Irrawaddy. */

/* the British Indian Army: Indian, Gurkha and British battalions in jungle green */
Object.assign(HELMET_COL, {ind:'#4a5636'});
Object.assign(NAT_BASE, {ind:'uk'});
Object.assign(INF_WEAPONS, {ind:{inf:['rifle', 'rifle', 'bren'], at:['piat', 'rifle'], eng:['rifle', 'bangalore'], mortar:['shell', 'rifle']}});
NATION.ind = {n:'British India', adj:'Indian', short:'Fourteenth Army', side:'allies',
  col:{m:'#4e5c38', d:'#2e3a22', ui:'#c9473f', team:'#c9473f', hi:'#b8c8a0'},   // jungle green
  uniform:'#4e5a3a', helmet:'brodie', star:'ukcockade', skin:'#b07a52',
  u:Object.assign({}, NATION.uk.u, {
    inf:  {n:'Indian Rifle Section', w:'SMLE No. 1 & Bren', snd:'bren'},
    at:   {n:'PIAT Team', w:'PIAT', snd:'rocketAT', pow:.9, cost:2500},
    recon:{n:'Humber Armoured Car', w:'15 mm Besa', snd:'bren', shape:'daimler', cost:3500},
    apc:  {n:'Universal Carrier', w:'Bren', snd:'bren', shape:'carrier', mv:7, cost:4000},
    tank: {n:'M3 Stuart (7th Hussars)', w:'37 mm M6', snd:'gun37', shape:'stuart', pow:.8, mv:7, cost:6000},
    mtank:{n:'M3 Lee (3rd Carabiniers)', w:'75 mm M2 in the hull & 37 mm', snd:'gun75', shape:'grant', cost:9000},
    htank:{n:'Sherman V (255th Indian Tank Brigade)', w:'75 mm M3', snd:'gun75', shape:'sherman', pow:1.05, cost:12000},
    art:  {n:'3.7-inch Mountain Howitzer', w:'94 mm howitzer, carried by mules', snd:'howitzer', shape:'m2a1', pow:.95},
    rkt:  {n:'5.5-inch Medium Gun', w:'5.5 in gun', snd:'howitzer', shape:'pdr25', rng:[3,5], mt:'tire', mv:4, cost:12000},
    aa:   {n:'Bofors 40 mm', w:'40 mm', snd:'bofors', shape:'k61', mt:'tire'},
    ftr:  {n:'Hurricane IIc (fighter-bomber)', w:'4x 20 mm Hispano & bombs', snd:'strafeUK', shape:'hurricane'},
    bmr:  {n:'Vultee Vengeance', w:'dive bombs', snd:'divebomb', shape:'sbd'},
    eng:  {n:'Bengal Sappers & Miners', w:'charges, Bangalore torpedoes & bridging', snd:'bangalore'},
    mortar:{n:'ML 3-inch Mortar', w:'3 in mortar', snd:'mortar'},
    nest: {n:'Vickers MG Bunker', w:'.303 Vickers in a log bunker', snd:'bren', shape:'nest'},
    pak:  {n:'6-pounder in a Bunker', w:'QF 6-pounder', snd:'gun50', shape:'casemate'},
    lc:   {n:'DUKW', w:'carries two loads across the river', snd:'naval', shape:'lcvp', mt:'amphib', mv:5, cost:6000, sea:false},   /* sea:false: it stays after unloading, to ferry the next load */
  })};
MOOD_ALIAS.ind = 'uk';
BARKS.ind = {sel:['Ji, sahib!', 'Hukam!', 'Yes, sahib!', 'Tayyar!'], veh:['Chalo!', 'Ready, sahib!'], move:['Chalo! Chalo!', 'Aage badho!', 'Follow me!'],
  atk:['Ayo Gorkhali!', 'Jo Bole So Nihal!', 'Fire!', 'Charge!', 'Maro!'], kill:['Got him!', 'Khatam!', 'Gira diya!'], hurt:['Medic!', 'Stretcher!', 'Take cover!', 'Bachao!'],
  cap:['Ours, sahib!', 'Position taken!'], new:['Reporting, sahib!', 'Ready!'], idle:['Chai, anyone?', 'This rain never stops.', 'Leeches again…', 'Letters from home?', 'How far to Mandalay?']};

/* the generals */
Object.assign(CO, {
  smyth:{n:'John Smyth VC', nat:'ind', rank:'Major General', nick:'17th Indian Division',
    bio:'A Victoria Cross winner of 1915, he commanded the 17th Indian Division in the retreat from Moulmein in 1942, ill with an anal fissure and dosed with arsenic and strychnine. At the Sittang he ordered the only bridge blown with two of his brigades still on the far side. He was sacked and never commanded again.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Rearguard', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Over the Sittang', star:6, txt:'All ground units +2 move.', mv:{ground:2}},
    look:{cap:'brit', crown:'#6a6a4a', band:'#b02020', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#6a6a4a', medals:true},
    say:{start:'Get the division over the bridge before they cut it.', win:'Most of them are across.', lose:'Blow it. God help them.', power:'Keep moving! The bridge!'}},
  messervy:{n:'Frank Messervy', nat:'ind', rank:'Major General', nick:'7th Indian Division',
    bio:'A cavalryman who had been captured by the Germans in the desert and escaped by pretending to be a private. When the Japanese overran his headquarters in the Arakan in February 1944 he walked into the Admin Box in his pyjamas and ordered everyone to stand and fight.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Stand Fast', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'The Admin Box', star:6, txt:'All units +35% defence; all units recover 2 HP.', def:{all:35}, heal:2},
    look:{cap:'brit', crown:'#6a6a4a', band:'#b02020', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#4e5a3a'},
    say:{start:'Nobody leaves the box. Everyone fights, cooks and clerks too.', win:'They\'ve broken off.', lose:'They\'re into the box!', power:'Every man to the perimeter!'}},
  wingate:{n:'Orde Wingate', nat:'ind', rank:'Major General', nick:'The Chindits',
    bio:'An eccentric genius who ate raw onions and received visitors naked, he created the Chindits to fight deep behind Japanese lines, supplied from the air. In March 1944 his Special Force flew into Burma in gliders and Dakotas. He was killed when his B-25 crashed in the hills on 24 March.',
    d2d:{txt:'Infantry +1 move in jungle and +10% firepower.', atk:{foot:10}, mv:{foot:1}},
    cop:{n:'Long Range Penetration', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'The Stronghold', star:6, txt:'All units +30% firepower; all units recover 2 HP.', atk:{all:30}, heal:2},
    look:{cap:'brit', crown:'#c8b890', band:'#c8b890', face:'#e8c4a4', hair:'#5a4a3a', jaw:1, tunic:'#4e5a3a', beard:'#5a4a3a'},
    say:{start:'We are going into Burma by the back door.', win:'The railway is cut.', lose:'Disperse into the jungle.', power:'Strike, and vanish!'}},
  richards:{n:'Hugh Richards', nat:'ind', rank:'Colonel', nick:'The Kohima Garrison',
    bio:'Sent to command the scratch garrison of Kohima, about 2,500 men including convalescents and a battalion of the Assam Regiment, he found himself on 4 April 1944 surrounded by a Japanese division of 15,000. With the 4th Royal West Kents, he held for sixteen days.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'The Tennis Court', star:3, txt:'Infantry +25% firepower and defence.', atk:{foot:25}, def:{foot:25}},
    scop:{n:'They Shall Not Pass', star:6, txt:'All units +40% defence; all units recover 2 HP.', def:{all:40}, heal:2},
    look:{cap:'brit', crown:'#6a6a4a', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#4e5a3a', moustache:true},
    say:{start:'Hold Garrison Hill. Relief is coming.', win:'The Second Division is through!', lose:'They\'re on the tennis court.', power:'Grenades! Over the net!'}},
  scoones:{n:'Geoffry Scoones', nat:'ind', rank:'Lieutenant General', nick:'IV Corps',
    bio:'Commanded IV Corps on the Imphal plain in 1944. Slim pulled his divisions back into the plain and let the Japanese come on to the end of their supply lines, then broke them, ridge by ridge, through the monsoon.',
    d2d:{txt:'Armour +10% firepower.', atk:{armour:10}},
    cop:{n:'Box and Ridge', star:3, txt:'Artillery +25% firepower.', atk:{indirect:25}},
    scop:{n:'Break the Ring', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'brit', crown:'#6a6a4a', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#4e5a3a'},
    say:{start:'Clear the ridge above the plain.', win:'Nunshigum is ours.', lose:'Back down to the plain.', power:'Tanks up the ridge!'}},
  slim:{n:'William Slim', nat:'ind', rank:'Lieutenant General', nick:'Uncle Bill',
    bio:'A grocer\'s son who joined the army as a private, he led the Burma Corps on its thousand-mile retreat in 1942, then built the Fourteenth Army, half a million men of every faith of the Empire, and led it to the greatest defeat a Japanese army ever suffered. Many think him the finest British general of the war.',
    d2d:{txt:'All units +10% firepower and defence.', atk:{all:10}, def:{all:10}},
    cop:{n:'Air Supply', star:3, txt:'All units recover 2 HP and +15% firepower.', heal:2, atk:{all:15}},
    scop:{n:'Defeat into Victory', star:6, txt:'All units +35% firepower and +1 move.', atk:{all:35}, mv:{ground:1}},
    look:{cap:'slouch', face:'#e8c0a0', hair:'#7a6a5a', jaw:2, tunic:'#4e5a3a'},
    say:{start:'Over the Irrawaddy, and the Japanese will never know where we are coming from.', win:'Across. Now for Meiktila.', lose:'Pull the bridgehead back.', power:'Fourteenth Army, advance!'}},
  cowan:{n:'David Cowan', nat:'ind', rank:'Major General', nick:'Punch',
    bio:'"Punch" Cowan took over the 17th Indian Division after the Sittang, and commanded it, the Black Cats, for the rest of the war. In March 1945 he led it on the dash to Meiktila, a hundred miles behind the Japanese front, and held it against everything they could throw at him. His son was killed in the fighting there.',
    d2d:{txt:'Armour +1 move.', mv:{armour:1}},
    cop:{n:'The Black Cats', star:3, txt:'Armour and infantry +20% firepower.', atk:{armour:20, foot:20}},
    scop:{n:'Meiktila', star:6, txt:'All units +35% firepower and +2 move.', atk:{all:35}, mv:{ground:2}},
    look:{cap:'brit', crown:'#6a6a4a', band:'#b02020', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#4e5a3a'},
    say:{start:'Straight for the town. Don\'t stop for anything.', win:'Meiktila is ours.', lose:'Form a box and hold.', power:'Shermans, go!'}},
  iida:{n:'Shōjirō Iida', nat:'jp', rank:'Lieutenant General', nick:'15th Army, 1942',
    bio:'Commanded the 15th Army in the conquest of Burma in 1942, outflanking the British again and again through jungle they thought impassable.',
    d2d:{txt:'Infantry +1 move.', mv:{foot:1}},
    cop:{n:'Infiltration', star:3, txt:'Infantry +2 move and +15% firepower.', mv:{foot:2}, atk:{foot:15}},
    scop:{n:'Roadblock', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#2a2420', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'Through the jungle, round behind them, to the bridge.', win:'The bridge is down and they are on the wrong side.', lose:'They got across.', power:'Banzai!'}},
  hanaya:{n:'Tadashi Hanaya', nat:'jp', rank:'Lieutenant General', nick:'55th Division',
    bio:'Commanded the 55th Division in the Arakan, notorious even in the Japanese army for beating his own officers. His Operation Ha-Go in February 1944 was meant to draw British reserves away from Imphal.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Ha-Go', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'Night Assault', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#2a2420', jaw:2, tunic:'#8a7a4a', moustache:true},
    say:{start:'Surround them, and they will run as they did in 1942.', win:'The box is broken.', lose:'They did not run.', power:'Totsugeki!'}},
  sato:{n:'Kōtoku Satō', nat:'jp', rank:'Lieutenant General', nick:'31st Division',
    bio:'Led the 31st Division over the mountains to Kohima in April 1944, and nearly took it. Starving and promised supplies that never came, he disobeyed Mutaguchi and retreated at the end of May, the first Japanese divisional commander ever to do so.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Kohima', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Bonfire', star:6, txt:'All units +35% firepower and +1 move.', atk:{all:35}, mv:{foot:1}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#2a2420', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Take the ridge, then Dimapur.', win:'Kohima is ours.', lose:'We have no food and no shells.', power:'Banzai!'}},
  yanagida:{n:'Genzō Yanagida', nat:'jp', rank:'Lieutenant General', nick:'33rd Division',
    bio:'Commanded the 33rd Division against Imphal from the south. He warned that the offensive could not succeed and was relieved for it, which did not save his division.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Hold the Ridge', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Chi-Ha', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'Hold the ridge above the plain.', win:'Their tanks cannot climb it.', lose:'The ridge is lost.', power:'Fire!'}},
  kimura:{n:'Heitarō Kimura', nat:'jp', rank:'General', nick:'Burma Area Army',
    bio:'Commanded the Burma Area Army in 1945. He planned to let the Fourteenth Army cross the Irrawaddy and destroy it with its back to the river, and never understood where Slim\'s real blow was coming from.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Irrawaddy Shore', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Counter-attack', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'Let them cross. Then drive them into the river.', win:'The river is red with them.', lose:'They are across.', power:'Drive them into the river!'}},
  kasuya:{n:'Tomekichi Kasuya', nat:'jp', rank:'Major General', nick:'Meiktila Garrison',
    bio:'Commanded the scratch garrison of Meiktila, the main supply base of the Japanese armies in Burma: line-of-communication troops, airfield staff and hospital patients, about 3,500 men, who fought almost to the last man.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'Suicide Squads', star:3, txt:'Infantry +40% firepower against tanks.', atk:{foot:40}},
    scop:{n:'To the Last', star:6, txt:'All units +40% defence.', def:{all:40}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Every man fights. Every man.', win:'The tanks are burning.', lose:'Meiktila is lost.', power:'Nikuhaku!'}},
});
for (const id of ['smyth', 'messervy', 'wingate', 'richards', 'scoones', 'slim', 'cowan', 'iida', 'hanaya', 'sato', 'yanagida', 'kimura', 'kasuya']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {smyth:'cautious', messervy:'cautious', wingate:'aggressive', richards:'cautious', scoones:'methodical', slim:'methodical', cowan:'aggressive', iida:'aggressive', hanaya:'aggressive', sato:'aggressive', yanagida:'cautious', kimura:'methodical', kasuya:'cautious'});

const JP_BURMA = {inf:{n:'Infantry (15th Army)', w:'Arisaka Type 38 & Type 96 LMG'}};
const BURMA_MISSIONS = {
  sittang:{name:'The Sittang Bridge', place:'The railway bridge over the Sittang, Burma', date:'22 February 1942, 05:00', theme:'tropic', weather:'clear',
    p1:{nat:'ind', co:'smyth', funds:0, u:{inf:{n:'1/4th Gurkha Rifles & 2nd Duke of Wellington\'s', w:'SMLE & Lewis guns'}, at:{n:'Boys Anti-tank Rifle Team', w:'.55 in Boys rifle', snd:'ptrd', pow:.8}}},
    p2:{nat:'jp', co:'iida', funds:0, u:JP_BURMA},
    objective:{win:'convoy', role:'inf', need:5, exit:[0, 0, 2, 19], limit:10}, goal:'Get five infantry sections over the Sittang and out to the west edge by {limit}. The bridge will be blown on the morning of the fourth day.',
    whyText:{convoy:'most of the division got across', sunk:'the division is trapped on the far bank'},
    brief:'The 17th Indian Division has been retreating from Moulmein for a week, in the heat, with the Japanese always round its flank. Everything now depends on one railway bridge over the Sittang, a mile-wide tidal river. The Japanese are racing through the jungle to get there first. The division is strung out along a single dusty track, nose to tail, under attack from the air, some of it by the RAF. Get as many men across as you can. At dawn on the fourth day the sappers will blow the bridge, whoever is still on the far side.',
    clock:{start:'1942-02-22T05:00', step:120},
    build:() => { const b = MB(34, 20, '.', 20101);
      b.blobs('J', 12, 12, 0, 33, 19, 1, 2).blobs('J', 5, 0, 0, 8, 19, 1, 2).scatter('y', .2, 2, 3, 8, 16, ['.']);
      b.rect(10, 0, 11, 19, 'r'); b.set(10, 9, 'b').set(11, 9, 'b');                        // the Sittang, a mile wide
      b.rect(12, 6, 14, 8, '^', ['.', 'J']).rect(12, 11, 14, 13, '^', ['.', 'J']);          // Pagoda Hill and Buddha Hill
      b.road([[33, 9], [20, 9], [12, 9], [0, 9]]);
      b.put([[1, 9, 'Q'], [5, 4, 'c'], [5, 15, 'c'], [13, 9, 'C'], [24, 4, 'k'], [24, 15, 'k']]);
      return b.rows(); },
    units:{1:'inf*11 12,5-20,13; at 18,8; mortar*2 20,7-24,11; art*2 22,7-27,11; apc*2 26,8-30,10; nest 12,8',
      2:'inf*4 14,1-22,5; inf*3 14,14-22,18; mortar*2 18,2-24,4; art 24,1; nest 20,16'},
    events:[{day:2, team:2, say:'The Japanese 215th Regiment attacks the bridgehead from the jungle to the north.', spawn:'inf*3 12,0-16,4'},
      {day:2, team:2, say:'Blenheims of the RAF bomb and strafe the division\'s column, thinking it is Japanese.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'More Japanese come out of the jungle to the south.', spawn:'inf*3 12,15-18,19'},
      {day:4, team:1, say:'05:30. The bridge is blown. Men on the far bank strip off and swim for it, or build rafts of bamboo.', terr:[[10, 9, 'river'], [11, 9, 'river']]}]},
  adminbox:{name:'The Admin Box', place:'Sinzweya, the Arakan', date:'7 February 1944, 06:00', theme:'tropic', weather:'clear',
    p1:{nat:'ind', co:'messervy', funds:2000, u:{inf:{n:'2nd West Yorkshires & 4/8th Gurkhas', w:'SMLE, Bren & Thompson'}, mtank:{n:'M3 Lee (25th Dragoons)'}, eng:{n:'Muleteers, Clerks & Cooks', w:'rifles they had not fired in years', pow:.8}}},
    p2:{nat:'jp', co:'hanaya', funds:0, u:JP_BURMA},
    objective:{win:'survive', days:8, hold:3, protect:'inf', protectN:4}, goal:'Hold the Admin Box until {survive}. If you are down to three infantry units, or lose three of your five positions, the box is broken.', persona:{2:'brawler'},
    brief:'The Japanese have done it again: they have come round through the jungle, overrun the 7th Indian Division\'s headquarters and cut it off. In 1942 that meant retreat. This time Slim has told everyone to stand and fight, and the Dakotas will drop food and ammunition from the sky. At Sinzweya, in a clearing a mile across, is the division\'s administrative area: ammunition dumps, mule lines, a hospital, a few Lee tanks and anyone who can hold a rifle. That is the Admin Box. Hold it.',
    clock:{start:'1944-02-07T06:00', step:120},
    build:() => { const b = MB(32, 22, 'J', 20202);
      b.rect(10, 6, 22, 16, '.').blobs('.', 6, 9, 5, 23, 17, 1, 2, ['J']).blobs('^', 6, 0, 0, 31, 21, 1, 2, ['J']);
      b.rect(15, 8, 17, 10, '^').rect(12, 13, 14, 14, '^');                                     // Ammunition Hill, the hospital knoll
      b.road([[16, 0], [16, 11], [31, 12]]).road([[16, 11], [0, 14]]);
      b.put([[16, 11, 'Q'], [12, 8, 'C'], [20, 8, 'C'], [13, 15, 'C'], [20, 14, 'F'], [2, 3, 'k'], [29, 3, 'k'], [28, 19, 'q']]);
      return b.rows(); },
    units:{1:'inf*5 11,7-21,15; mtank*3 14,10-19,13; art*2 15,9-17,12; at*2 12,10-20,14; mortar*2 13,8-18,14; eng*2 18,12-21,15; nest*2 11,8-21,9',
      2:'inf*12 0,0-31,6; inf*7 0,15-10,21; inf*4 23,15-31,21; mortar*2 2,1-8,4; art*2 26,0-31,4; eng*2 4,6-8,10'},
    events:[{day:2, team:2, say:'Night. Japanese infantry break into the Main Dressing Station and kill the wounded and the doctors.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'Dakotas fly in low and drop ammunition, food and rum by parachute.', heal:2, funds:4000},
      {day:4, team:2, say:'Hanaya throws in his reserve battalion from the west.', spawn:'inf*5 0,8-4,14; mortar 1,11'},
      {day:3, team:2, say:'Japanese infiltrators slip into the box at night, among the mule lines.', spawn:'inf*4 10,5-22,7'},
      {day:5, team:1, say:'The Lees go out and shoot up the Japanese on the ridges at point-blank range.', hurt:1},
      {day:5, team:1, say:'Another supply drop.', heal:1, funds:3000},
      {day:6, team:2, say:'The Japanese, starving and out of ammunition, make one last attack on Ammunition Hill.', spawn:'inf*4 13,0-19,4'},
      {day:7, team:1, say:'The 5th Indian Division breaks through the Ngakyedauk Pass.', spawn:'inf*3 29,10-31,14; mtank 30,12'}]},
  whitecity:{name:'White City', place:'Broadway and the railway at Mawlu, behind the Japanese lines', date:'6 March 1944, 06:00', theme:'tropic', weather:'clear',
    p1:{nat:'ind', co:'wingate', funds:0, u:{inf:{n:'Chindit Column (77th Brigade)', w:'SMLE, Bren, Sten & kukris', pow:1.05}, eng:{n:'Gurkha Demolition Party', w:'plastic explosive for the railway'}, ftr:{n:'P-51A Mustang (1st Air Commando)', w:'.50 cal & bombs', shape:'p51', snd:'strafeUS'}, art:{n:'25-pounder (flown in by Dakota)', shape:'pdr25'}}},
    p2:{nat:'jp', co:'iida', funds:0, u:{inf:{n:'Railway Guard & 24th Independent Mixed Brigade'}}},
    objective:{win:'hq', limit:18}, goal:'Cut the railway: take the Japanese depot at Mawlu by {limit}. Reinforcements arrive by glider and Dakota.',
    brief:'Operation Thursday. On the night of 5 March gliders carried the 77th Brigade two hundred miles behind the Japanese lines to a jungle clearing called Broadway. Some crashed in the dark, killing their passengers; the rest landed, and the American engineers have already scraped out an airstrip. Now the Chindits march for the railway that feeds the Japanese armies in the north, to block it at Mawlu. The first columns are small; more come in every night by Dakota.',
    clock:{start:'1944-03-06T06:00', step:120},
    build:() => { const b = MB(34, 22, 'J', 20303);
      b.blobs('.', 5, 0, 7, 8, 15, 1, 2).rect(1, 9, 6, 13, '.');                                 // the Broadway clearing
      b.blobs('^', 8, 8, 0, 33, 21, 1, 2, ['J']).scatter('y', .3, 22, 4, 30, 18, ['J']);
      b.path([[24, 0], [24, 21]], (x, y) => b.set(x, y, '='));                                    // the railway
      b.road([[3, 11], [12, 11], [24, 11]]);
      b.put([[3, 11, 'Q'], [5, 10, 'A'], [24, 11, 'q'], [23, 9, 'k'], [25, 14, 'k'], [24, 3, 'k'], [24, 19, 'c'], [14, 5, 'c'], [14, 17, 'c']]);
      return b.rows(); },
    units:{1:'inf*4 1,8-6,14; eng 3,10; mortar 2,11; ftr 5,11',
      2:'inf*4 21,7-27,15; nest*2 22,9-26,13; art 27,10; inf*2 22,1-26,5; inf*2 22,17-26,21'},
    events:[{day:2, team:1, say:'Night. More gliders land at Broadway with a bulldozer and the rest of the brigade.', spawn:'inf*3 1,9-5,13; art 3,12'},
      {day:3, team:2, say:'The Japanese realise what is happening and send troops down the railway.', spawn:'inf*3 22,0-26,3'},
      {day:3, team:1, say:'Dakotas land at Broadway every night now, sixty of them: mules, guns and men.', spawn:'inf*2 2,9-5,13; mortar 3,12'},
      {day:4, team:1, say:'Mustangs and Mitchells of the 1st Air Commando bomb the railway stations.', hurt:1},
      {day:5, team:2, say:'Japanese reinforcements attack from Indaw.', spawn:'inf*3 28,8-33,14; mortar 30,11'},
      {day:6, team:1, say:'News comes that Wingate has been killed: his B-25 crashed in the hills on its way back to India.', hurt:0}]},
  kohima:{name:'Kohima', place:'Garrison Hill and the District Commissioner\'s tennis court', date:'5 April 1944, 06:00', theme:'tropic', weather:'rain',
    p1:{nat:'ind', co:'richards', funds:0, u:{inf:{n:'4th Royal West Kents & Assam Regiment', w:'SMLE, Bren & grenades', pow:1.05}, art:{n:'3.7-inch Howitzer (at Jotsoma)'}}},
    p2:{nat:'jp', co:'sato', funds:0, u:{inf:{n:'58th Infantry Regiment (31st Division)'}}},
    objective:{win:'survive', days:9, hold:3, protect:'inf', protectN:5}, goal:'Hold the Kohima ridge until {survive}. Keep at least five infantry units and three of your five positions. The relief is coming down the road from Dimapur.',
    brief:'Mutaguchi\'s great offensive, U-Go, has crossed the mountains into India. At Kohima, on the only road to the railhead at Dimapur, the Japanese 31st Division, 15,000 men, has surrounded a ridge held by 2,500: the 4th Royal West Kents, the Assam Regiment, convalescents and administrative troops. Water is a trickle from one spring under fire. The front line runs across the District Commissioner\'s tennis court; the two sides are throwing grenades at each other over the net. The 2nd British Division is fighting its way up the road to you.',
    clock:{start:'1944-04-05T06:00', step:120},
    build:() => { const b = MB(30, 22, 'J', 20404);
      b.blobs('^', 10, 0, 0, 29, 21, 1, 2, ['J']).blobs('M', 4, 0, 0, 29, 21, 1, 1, ['J']);
      b.rect(10, 6, 20, 16, '^').rect(12, 8, 18, 14, '.');                                         // the Kohima ridge
      b.scatter('z', .3, 11, 7, 19, 15, ['.', '^']);
      b.road([[0, 18], [8, 15], [14, 11], [22, 7], [29, 2]]);
      b.put([[15, 11, 'Q'], [13, 8, 'C'], [17, 9, 'C'], [12, 14, 'C'], [18, 14, 'C'], [26, 3, 'k'], [27, 18, 'k'], [3, 3, 'k'], [2, 19, 'c']]);
      return b.rows(); },
    units:{1:'inf*7 11,7-19,15; mortar*2 13,10-17,13; nest*3 12,8-18,14; at 15,12; art 14,11',
      2:'inf*13 20,0-29,21; inf*5 0,0-9,8; mortar*3 22,2-28,8; art*2 25,10-29,16; eng*2 20,9-23,13'},
    events:[{day:2, team:2, say:'The Japanese take the Field Supply Depot. The spring is under their guns.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'The guns at Jotsoma, two miles away, fire over the heads of the garrison onto the Japanese.', hurt:1},
      {day:4, team:2, say:'More of the 31st Division comes up from the Naga villages.', spawn:'inf*4 0,8-6,14'},
      {day:4, team:1, say:'Supply drops: some of it lands on the Japanese.', heal:1},
      {day:5, team:2, say:'Night. The tennis court: grenades thrown over the net in the dark.', hurt:1, hurtTeam:1},
      {day:7, team:1, say:'The 1/1st Punjabis of the 161st Indian Brigade fight through from Jotsoma.', spawn:'inf*3 0,16-4,21'},
      {day:8, team:1, say:'The 2nd British Division\'s tanks and the Royal Berkshires reach Garrison Hill.', spawn:'mtank*2 3,15-7,18; inf*2 5,14-8,17'}]},
  nunshigum:{name:'Nunshigum', place:'The ridge above the Imphal plain', date:'13 April 1944, 07:00', theme:'tropic', weather:'overcast',
    p1:{nat:'ind', co:'scoones', funds:0, u:{inf:{n:'1/17th Dogras', w:'SMLE & Bren'}, mtank:{n:'M3 Lee (B Sqn, 3rd Carabiniers)'}}},
    p2:{nat:'jp', co:'yanagida', funds:0, u:{inf:{n:'51st Infantry Regiment (15th Division)'}, art:{n:'Type 41 Mountain Gun', w:'75 mm'}}},
    objective:{win:'kill', role:'art', n:5, limit:8}, goal:'Take the ridge: knock out five of the Japanese guns on Nunshigum by {limit}.',
    whyText:{kill:'the ridge is clear and the plain is safe'},
    brief:'From Nunshigum, a ridge a thousand feet above the Imphal plain, the Japanese can see, and shell, the main airfield that keeps IV Corps alive. The Dogras have been thrown off it once. Now they go back up with the Lee tanks of the 3rd Carabiniers, which will climb slopes nobody thought a tank could climb, with their commanders standing in the turrets to guide them. Every officer in B Squadron will be killed or wounded before the day is out.',
    clock:{start:'1944-04-13T07:00', step:120},
    build:() => { const b = MB(32, 22, '.', 20505);
      b.scatter(',', .3, 0, 12, 31, 21, ['.']).scatter('y', .25, 0, 14, 31, 21, ['.']);
      b.blobs('^', 9, 6, 0, 31, 12, 1, 2).blobs('J', 6, 6, 0, 31, 11, 1, 1, ['.', '^']);
      b.rect(14, 2, 24, 6, '^'); b.path([[10, 11], [14, 7], [19, 4], [24, 3]], (x, y) => b.set(x, y, '^'));   // the knife-edge track up the ridge
      b.road([[0, 16], [31, 16]]).road([[10, 16], [10, 11]]);
      b.put([[3, 16, 'Q'], [6, 18, 'A'], [12, 19, 'C'], [22, 18, 'C'], [19, 3, 'k'], [24, 5, 'k'], [28, 2, 'q']]);
      return b.rows(); },
    units:{1:'mtank*5 7,13-14,17; inf*5 6,12-14,17; art*3 2,14-6,18; mortar*2 8,14-12,16; ftr 6,18',
      2:'art*6 14,1-26,7; inf*7 12,3-28,10; nest*3 14,4-24,8; at*2 15,6-22,9; mortar*2 22,1-27,5'},
    events:[{day:2, team:2, say:'The Japanese on the summit dig deeper. Their gunners will fight to the last round.', spawn:'inf*2 20,1-26,4'},
      {day:3, team:1, say:'Hurricanes and Vengeance dive-bombers attack the summit.', hurt:1},
      {day:4, team:2, say:'A battalion of the 60th Regiment comes over the hills from the north.', spawn:'inf*3 26,0-31,6; mortar 28,3'},
      {day:5, team:1, say:'Squadron Sergeant Major Craddock takes command of B Squadron. Every officer is down.', heal:1}]},
  irrawaddy:{name:'The Irrawaddy', place:'The crossing at Nyaungu', date:'14 February 1945, 04:00', theme:'tropic', weather:'clear',
    p1:{nat:'ind', co:'slim', funds:0, u:{inf:{n:'2nd South Lancashires & 4/15th Punjab', w:'SMLE, Bren & Sten'}, htank:{n:'Sherman V (2nd Indian Tank Brigade)'}}},
    p2:{nat:'jp', co:'kimura', funds:0, u:JP_BURMA},
    objective:{win:'hq', limit:19}, goal:'Cross the Irrawaddy and take the Japanese headquarters on the far bank by {limit}. Tanks can only cross in the DUKWs.',
    brief:'The Irrawaddy here is a mile wide, the longest opposed river crossing of the war. Kimura expects Slim to cross far to the north, at Mandalay, and has his best divisions there. At Nyaungu, opposite the old temples of Pagan, the 7th Indian Division is crossing in rotten boats with failing outboard motors and a handful of amphibious DUKWs. If the bridgehead holds, the 17th Division and its tanks will pour through it for Meiktila, and the Japanese armies in Burma will be cut off.',
    clock:{start:'1945-02-14T04:00', step:120},
    build:() => { const b = MB(34, 20, '.', 20606);
      b.rect(12, 0, 14, 19, 'r'); b.rect(13, 8, 13, 10, 's');                                 // the Irrawaddy, with a sandbank
      b.blobs('^', 6, 17, 0, 33, 19, 1, 2).scatter('x', .12, 18, 1, 32, 18, ['.']).scatter('I', .06, 18, 1, 32, 18, ['.']);   // Pagan's temples
      b.blobs('J', 4, 0, 0, 10, 19, 1, 1).scatter(',', .25, 0, 0, 10, 19, ['.']);
      b.road([[0, 10], [11, 10]]).road([[16, 10], [33, 9]]);
      b.put([[2, 10, 'Q'], [5, 4, 'C'], [5, 16, 'C'], [11, 10, 'P'], [17, 4, 'k'], [17, 15, 'k'], [24, 10, 'k'], [31, 9, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 2,2-10,18; lc*4 9,4-11,16; htank*3 3,8-8,12; art*3 0,4-3,16; mortar*2 6,6-9,14; eng 7,10',
      2:'inf*5 16,1-22,18; nest*3 16,3-17,16; art*2 25,4-30,15; mortar*2 20,6-24,13; inf*2 27,7-32,12'},
    events:[{day:1, team:2, say:'04:00. The first boats of the South Lancashires lose their way in the dark and run onto a sandbank under the Japanese guns.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'At Pagan, soldiers of the Indian National Army come down to the river and surrender.', hurt:1},
      {day:3, team:2, say:'Japanese reinforcements counter-attack the bridgehead.', spawn:'inf*3 28,2-33,8'},
      {day:4, team:1, say:'More DUKWs and a Bailey raft come up from the rear.', spawn:'lc*2 9,8-11,12'},
      {day:5, team:1, say:'Thunderbolts strafe the Japanese positions on the far bank.', hurt:1}]},
  meiktila:{name:'Meiktila', place:'The town between the lakes, central Burma', date:'1 March 1945, 06:00', theme:'tropic', weather:'clear',
    p1:{nat:'ind', co:'cowan', funds:0, u:{inf:{n:'48th & 63rd Indian Brigades (the Black Cats)', w:'SMLE, Bren & Sten'}, htank:{n:'Sherman V (Probyn\'s Horse)'}, apc:{n:'Lorried Infantry', w:'trucks'}}},
    p2:{nat:'jp', co:'kasuya', funds:0, u:{inf:{n:'Meiktila Garrison', w:'Arisaka, grenades & lunge mines'}, at:{n:'Suicide Squad', w:'aerial bombs and lunge mines', pow:1.3, powArm:1.6}, pak:{n:'Bunkered 75 mm Gun', w:'75 mm Type 90', shape:'casemate'}}},
    objective:{win:'hq', limit:13}, goal:'The tank dash: take Meiktila by {limit}, before the Japanese can rush their divisions back to save it.',
    brief:'Kimura has been fooled. While he fights the Fourteenth Army at Mandalay, the 17th Indian Division and the 255th Tank Brigade have come out of the Nyaungu bridgehead and driven eighty miles in four days, straight for Meiktila: the supply base, airfields and hospitals of the whole Japanese army in Burma. The garrison is a scratch force of base troops, but they will fight to the last, in bunkers between the lakes, with aerial bombs buried in the road and men waiting in foxholes to throw themselves under the tanks.',
    clock:{start:'1945-03-01T06:00', step:120},
    build:() => { const b = MB(34, 20, '.', 20707);
      b.scatter(',', .3, 0, 0, 33, 19, ['.']).scatter('T', .08, 0, 0, 33, 19, ['.']);
      b.blobs('r', 3, 18, 0, 26, 6, 1, 2).blobs('r', 3, 18, 13, 26, 19, 1, 2);                     // the North and South lakes
      b.rect(22, 7, 30, 12, 'U', ['.', ',', 'T']).scatter('B', .1, 22, 7, 30, 12, ['U']);
      b.road([[0, 10], [21, 10], [33, 10]]).road([[26, 0], [26, 19]]);
      b.put([[1, 10, 'Q'], [5, 4, 'A'], [12, 15, 'C'], [27, 10, 'q'], [24, 8, 'k'], [29, 12, 'k'], [31, 3, 'k'], [31, 17, 'k']]);
      return b.rows(); },
    units:{1:'htank*5 1,6-6,14; apc*2 2,8-5,12; inf*6 1,5-8,15; art*3 0,7-3,13; recon*2 4,3-8,17; ftr 5,5',
      2:'inf*7 21,6-31,13; at*3 18,7-22,13; nest*3 21,8-24,12; pak*2 25,8-29,12; art*2 30,6-33,14; mortar*2 27,6-31,13'},
    events:[{day:2, team:1, say:'The 99th Brigade is flown into the captured airstrip at Thabutkon.', spawn:'inf*3 3,2-7,6'},
      {day:3, team:2, say:'Japanese soldiers wait in foxholes with aerial bombs between their knees, to blow themselves up under the tanks.', spawn:'at*3 18,8-22,12'},
      {day:4, team:2, say:'The first Japanese reinforcements arrive from the north.', spawn:'inf*3 24,0-30,3'},
      {day:5, team:1, say:'Probyn\'s Horse and the Royal Deccan Horse swing round the lakes into the town from the east.', spawn:'htank*2 31,8-33,12'}]},
};
for (const [id, m] of Object.entries(BURMA_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  sittang:{forces:['The 17th Indian Division: Indian, Gurkha and British battalions, exhausted after a week of retreat', 'The Japanese 33rd and 55th Divisions'],
    win:'Most of the division gets across before the bridge goes.', lose:'Two brigades are trapped on the far bank.',
    real:'On the morning of 23 February 1942, with the Japanese closing on the bridge and most of the division still east of the river, Smyth ordered it blown. Thousands of men swam the Sittang or crossed on bamboo rafts, leaving their weapons behind; many drowned. The division came out with fewer than 3,500 men and 1,400 rifles. Rangoon fell two weeks later, and the British retreated a thousand miles to India.'},
  adminbox:{forces:['The 7th Indian Division\'s administrative troops, two infantry battalions, the 25th Dragoons\' Lees and the guns', 'The Japanese 55th Division\'s Sakurai Force'],
    win:'The Admin Box holds. The Japanese can be beaten.', lose:'The box is overrun.',
    real:'The Admin Box held for three weeks, supplied entirely from the air: 714 tons were dropped in the first fortnight. On the night of 7 February the Japanese massacred the patients and doctors of the Main Dressing Station. But the box did not break, the Japanese ran out of food and ammunition, and on 24 February the siege was lifted. It was the first time British and Indian troops had beaten a major Japanese attack, and the Fourteenth Army never forgot it.'},
  whitecity:{forces:['The 77th Indian Infantry Brigade (Chindits) under Brigadier Michael Calvert, with the American 1st Air Commando', 'Japanese railway garrisons and the 24th Independent Mixed Brigade'],
    win:'The railway is cut at Mawlu. White City is built across it.', lose:'The Chindits are driven back into the jungle.',
    real:'Calvert\'s Chindits blocked the railway at Mawlu on 16 March 1944 and built a fortified stronghold across it, called White City for the parachutes hanging in the trees. They held it against attack after attack until May, supplied by air and supported by the 1st Air Commando. Wingate was killed on 24 March. The Chindits fought on until August, many of them dying of disease and exhaustion.'},
  kohima:{forces:['About 2,500 men: the 4th Royal West Kents, the Assam Regiment, the Assam Rifles and administrative troops', 'The Japanese 31st Division, about 15,000 men'],
    win:'Kohima holds. The road to India is shut.', lose:'The ridge falls, and the Japanese are on the road to Dimapur.',
    real:'The siege of Kohima lasted from 4 to 18 April 1944, when the 2nd British Division broke through. The fighting went on until the end of May, and the tennis court was retaken by tanks pushed up the hill by bulldozers. Satō, starving, retreated on his own authority; Mutaguchi\'s offensive collapsed, costing the Japanese about 55,000 dead. The memorial at Kohima reads: "When you go home, tell them of us and say: for your tomorrow, we gave our today."'},
  nunshigum:{forces:['B Squadron, 3rd Carabiniers, and the 1/17th Dogras', 'The Japanese 51st Infantry Regiment and its mountain guns'],
    win:'Nunshigum is taken and the airfield is safe.', lose:'The ridge holds out.',
    real:'On 13 April 1944 the Lees of the 3rd Carabiniers clawed their way up the knife-edge of Nunshigum with the Dogras. Every officer of B Squadron was killed or wounded, most of them shot standing in their turrets, and Squadron Sergeant Major Craddock took command and finished the job. The Japanese on the summit fought to the last; about 250 were killed. The 3rd Carabiniers still remember 13 April as Nunshigum Day.'},
  irrawaddy:{forces:['The 7th Indian Division with the 2nd Indian Tank Brigade', 'The Japanese 15th Army\'s detachments and Indian National Army units'],
    win:'The bridgehead is across. The road to Meiktila is open.', lose:'The crossing is thrown back into the river.',
    real:'The crossing at Nyaungu on 14 February 1945 nearly failed: the South Lancashires\' boats broke down and drifted under fire. But the Punjabis got across at Pagan, where the INA soldiers surrendered, and the bridgehead grew. Kimura, believing the main crossing was at Mandalay, did not react in time. The 17th Division and its tanks crossed and drove for Meiktila.'},
  meiktila:{forces:['The 17th Indian Division and the 255th Indian Tank Brigade', 'About 3,500 base and line-of-communication troops under Major General Kasuya'],
    win:'Meiktila falls. The Japanese armies in Burma are cut off from their base.', lose:'The attack stalls in the bunkers between the lakes.',
    real:'Meiktila fell on 3 March 1945 after three days of savage fighting; almost the whole garrison died. Kimura then threw two divisions at the town for a month, and Cowan held it. Meiktila broke the Japanese armies in Burma: Mandalay fell on 20 March, and Rangoon in May. Slim called his memoir of the campaign "Defeat into Victory".'},
});
Object.assign(CO_FATE, {
  smyth:'Sacked after the Sittang and never commanded again. A Conservative MP after the war, he wrote the history of the Victoria Cross. Died in 1983.',
  messervy:'Commanded IV Corps in the reconquest of Burma, and was the first commander-in-chief of the Pakistan Army. Died in 1974.',
  wingate:'Killed on 24 March 1944 when his B-25 crashed in the hills of Manipur. He is buried at Arlington with the American aircrew who died with him.',
  richards:'Held Kohima until relieved on 18 April 1944. Died in 1975.',
  scoones:'Commanded IV Corps until December 1944, then Central Command in India. Died in 1975.',
  slim:'Commanded Allied Land Forces South-East Asia, then became Chief of the Imperial General Staff and Governor-General of Australia. Died in 1970.',
  cowan:'Took the 17th Indian Division to Rangoon and commanded the British occupation force in Japan. Died in 1983.',
  iida:'Captured by the Soviets in Manchuria in 1945 and held until 1950. Died in 1980.',
  hanaya:'Commanded the 55th Division to the end of the war in Burma. Died in 1957.',
  sato:'Relieved after his retreat from Kohima; the army tried to have him declared insane rather than court-martial him. Died in 1959.',
  yanagida:'Relieved during the Imphal offensive. Captured by the Soviets in Manchuria, he died in a prison camp in 1952.',
  kimura:'Tried in Tokyo for war crimes, including the treatment of prisoners on the Burma Railway, and hanged in December 1948.',
  kasuya:'Survived the fall of Meiktila, escaping with a handful of men.',
});
Object.assign(MISSION_LONLAT, {sittang:[96.95, 17.45], adminbox:[92.4, 20.95], whitecity:[96.25, 24.45], kohima:[94.1, 25.67], nunshigum:[94.0, 24.9], irrawaddy:[94.95, 21.2], meiktila:[95.87, 20.88]});
EUROPE.cities.push(['Rangoon', 96.16, 16.8], ['Mandalay', 96.08, 21.97], ['Imphal', 93.94, 24.8]);
CAMPAIGNS.push({id:'burma', name:'The Forgotten Army', sub:'Burma, from the Sittang to Meiktila · 1942–1945', side:'allies', missions:['sittang', 'adminbox', 'whitecity', 'kohima', 'nunshigum', 'irrawaddy', 'meiktila']});
