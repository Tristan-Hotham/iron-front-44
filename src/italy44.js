/* ============================== THE ITALIAN CAMPAIGN ==============================
   The Allies' long, hard road up Italy, 1943-45: the beachhead at Salerno, the
   rubble of Cassino, the Anzio flyover, the race for Rome, the Gothic Line, and the
   Brazilians in the snow on Monte Castello. */

/* the Brazilian Expeditionary Force: American kit, Brazilian soldiers, and a smoking snake */
FLAG_EXTRA.br = (g, x, y, w, h) => { g.fillStyle = '#1a8a3a'; g.fillRect(x, y, w, h); g.fillStyle = '#f0d020'; g.beginPath(); g.moveTo(x + w * .08, y + h / 2); g.lineTo(x + w / 2, y + h * .1); g.lineTo(x + w * .92, y + h / 2); g.lineTo(x + w / 2, y + h * .9); g.closePath(); g.fill(); g.fillStyle = '#1a3a8a'; g.beginPath(); g.arc(x + w / 2, y + h / 2, h * .22, 0, 7); g.fill(); g.fillStyle = '#f4f4ee'; g.fillRect(x + w / 2 - h * .22, y + h / 2 - h * .03, h * .44, h * .06); };
MARK_EXTRA.brstar = (P, x, y, s = 1) => { P.circ(x, y, 2.6 * s, '#1a3a8a'); P.poly(starPts(x, y, 2 * s), '#f0d020'); P.circ(x, y, .6 * s, '#1a8a3a'); };
Object.assign(HELMET_COL, {br:'#5a6440'});
Object.assign(NAT_BASE, {br:'us'});
Object.assign(INF_WEAPONS, {br:INF_WEAPONS.us || {inf:['garand', 'garand', 'bar']}});
NATION.br = {n:'Brazil', adj:'Brazilian', short:'Força Expedicionária Brasileira', side:'allies',
  col:{m:'#5d6b3a', d:'#3c4626', ui:'#1a8a3a', team:'#1a8a3a', hi:'#c8d6a0'},
  uniform:'#7a6f4c', helmet:'m1', star:'brstar', skin:'#b88a62',
  u:Object.assign({}, NATION.us.u, {
    inf:  {n:'Pracinhas (1st Expeditionary Infantry Division)', w:'M1 Garand & BAR', snd:'garand'},
    eng:  {n:'9th Engineer Battalion', w:'charges & mine detectors', snd:'bangalore'},
    art:  {n:'M2A1 105 mm Howitzer (FEB)', shape:'m2a1'},
    ftr:  {n:'P-47D Thunderbolt (1st Fighter Group, "Senta a Pua!")', w:'8x .50 cal & bombs', shape:'p47', snd:'strafeUS'},
  })};
MOOD_ALIAS.br = 'us';
BARKS.br = {sel:['Sim, senhor!', 'Pronto!', 'Às ordens!'], veh:['Vamos!'], move:['Avante!', 'Vamos, pessoal!'], atk:['Fogo!', 'A cobra vai fumar!', 'Avante, Brasil!'],
  kill:['Acertei!', 'Caiu!'], hurt:['Padioleiro!', 'Abaixa!', 'Fui atingido!'], cap:['É nosso!'], new:['Pronto!'], idle:['Que frio!', 'Saudade de casa…', 'Cadê o café?', 'Neve. Neve de novo.']};

/* the generals */
Object.assign(CO, {
  clark:{n:'Mark Clark', nat:'us', rank:'Lieutenant General', nick:'Fifth Army',
    bio:'Tall, ambitious and vain, he commanded the US Fifth Army from Salerno to Rome. Ordered to cut off the retreating German armies at Valmontone in May 1944, he turned his army towards Rome instead, and entered it on 4 June, two days before D-Day stole his headlines.',
    d2d:{txt:'All units +10% firepower.', atk:{all:10}},
    cop:{n:'Naval Gunfire', star:3, txt:'All units +20% defence; the cruisers shell two positions for 2 HP.', def:{all:20}, strike:{n:2, r:1, hp:2, kind:'naval'}},
    scop:{n:'Rome', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'helmet', stars:3, face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#7a6f4c'},
    say:{start:'We hold the beachhead. Nobody goes back to the boats.', win:'Rome is ours!', lose:'Prepare to re-embark.', power:'Get me the Navy!'}},
  truscott:{n:'Lucian Truscott', nat:'us', rank:'Major General', nick:'VI Corps, Anzio',
    bio:'A tough cavalryman with a gravelly voice who drove his men hard and was loved for it. He took over the Anzio beachhead in February 1944, held it against the German counter-offensive, and led the breakout in May.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'The Final Beachhead Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Every Gun', star:6, txt:'Artillery +45% firepower and +1 range.', atk:{indirect:45}, rng:{indirect:1}},
    look:{cap:'helmet', stars:2, face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#7a6f4c'},
    say:{start:'Hold the Flyover. Not one more yard.', win:'They\'re finished.', lose:'Back to the final line.', power:'Fire everything!'}},
  leese:{n:'Oliver Leese', nat:'uk', rank:'Lieutenant General', nick:'Eighth Army, Italy',
    bio:'An Old Etonian Guardsman who took over the Eighth Army from Montgomery. In September 1944 he switched it secretly to the Adriatic coast and attacked the Gothic Line, and very nearly broke through into the Po valley before the rains came.',
    d2d:{txt:'Armour +10% firepower.', atk:{armour:10}},
    cop:{n:'Operation Olive', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'Into the Po Valley', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#7a7050'},
    say:{start:'Through the Gothic Line, and into the plain.', win:'Coriano is taken.', lose:'Rain. Damn this rain.', power:'Tanks forward!'}},
  mascarenhas:{n:'João Baptista Mascarenhas de Morais', nat:'br', rank:'General de Divisão', nick:'FEB',
    bio:'Commanded the 25,000 men of the Brazilian Expeditionary Force, the only Latin American army to fight in Europe. Brazilians had joked that a snake would smoke a pipe before Brazil sent troops to war; the FEB took the smoking snake as its badge.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'A Cobra Fumou', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Monte Castello', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'helmet', stars:2, face:'#d8b088', hair:'#c8c4bc', jaw:1, tunic:'#7a6f4c', moustache:true},
    say:{start:'The snake is smoking.', win:'Monte Castello is Brazilian!', lose:'Not this time. Next time.', power:'Avante, Brasil!'}},
  vietinghoff:{n:'Heinrich von Vietinghoff', nat:'ger', rank:'Generaloberst', nick:'10. Armee',
    bio:'Commanded the 10th Army against the Salerno landings, and very nearly drove the Americans into the sea. He later held the Gustav and Gothic Lines, and in May 1945 surrendered the German armies in Italy.',
    d2d:{txt:'All units +10% firepower.', atk:{all:10}},
    cop:{n:'Counter-attack', star:3, txt:'Armour +25% firepower.', atk:{armour:25}},
    scop:{n:'Into the Sea', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:2, tunic:'#5a5e4c', collar:'#c03030'},
    say:{start:'Down the corridor, to the beach.', win:'They are re-embarking!', lose:'The naval guns... we cannot face the naval guns.', power:'Angriff!'}},
  mackensen:{n:'Eberhard von Mackensen', nat:'ger', rank:'Generaloberst', nick:'14. Armee',
    bio:'Son of the famous field marshal, he commanded the 14th Army round the Anzio beachhead. Hitler ordered him to lance the abscess; his Operation Fischfang in February 1944 came within a few hundred yards of breaking through to the sea.',
    d2d:{txt:'Heavy tanks +10% firepower.', atk:{armour:10}},
    cop:{n:'Fischfang', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'Lance the Abscess', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:1, tunic:'#5a5e4c', collar:'#c03030'},
    say:{start:'Down the Via Anziate to the sea.', win:'The beachhead is split.', lose:'The guns. The guns never stop.', power:'Panzer, marsch!'}},
  heidrich:{n:'Richard Heidrich', nat:'ger', rank:'Generalleutnant', nick:'1. Fallschirmjäger-Division',
    bio:'Commanded the 1st Parachute Division in the ruins of Cassino town and the monastery. The Allied bombing turned the town into rubble, which his paratroopers turned into a fortress. They became known as the Green Devils of Cassino.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'The Rubble', star:3, txt:'All units +30% defence.', def:{all:30}},
    scop:{n:'Green Devils', star:6, txt:'All units +35% defence and +20% firepower.', def:{all:35}, atk:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:2, tunic:'#5a6a6a', collar:'#e8d040'},
    say:{start:'They have made us a fortress of rubble. Thank them.', win:'The Kiwis are going back.', lose:'Fall back to the monastery.', power:'Fallschirmjäger!'}},
  herr:{n:'Traugott Herr', nat:'ger', rank:'General der Panzertruppe', nick:'LXXVI Panzer Corps',
    bio:'A one-eyed panzer general who held the Adriatic end of the Gothic Line against the Eighth Army in September 1944, on the ridges round Coriano, until the autumn rains came to his rescue.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Ridge Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'The Rains', star:6, txt:'All units +30% defence; enemy -1 move.', def:{all:30}, enemyMv:-1},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#5a5e4c', collar:'#c03030', patch:true},
    say:{start:'Hold Coriano. The rains will come.', win:'They are stuck in the mud.', lose:'Fall back behind the Marano.', power:'Gegenstoß!'}},
  gablenz:{n:'Eccard von Gablenz', nat:'ger', rank:'Generalleutnant', nick:'232. Infanterie-Division',
    bio:'Commanded the 232nd Infantry Division, holding the snowy ridges of Monte Castello and Monte Belvedere in the northern Apennines in the winter of 1944-45. The Brazilians attacked Monte Castello four times before they took it.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Winter Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'The Ridge', star:6, txt:'All units +30% defence and +15% firepower.', def:{all:30}, atk:{all:15}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#5a5e4c', collar:'#e8e8e0'},
    say:{start:'They have tried three times. Let them try again.', win:'They are going back down.', lose:'The ridge is lost.', power:'Feuer!'}},
});
for (const id of ['clark', 'truscott', 'leese', 'mascarenhas', 'vietinghoff', 'mackensen', 'heidrich', 'herr', 'gablenz']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {clark:'methodical', truscott:'cautious', leese:'methodical', mascarenhas:'aggressive', vietinghoff:'aggressive', mackensen:'aggressive', heidrich:'cautious', herr:'cautious', gablenz:'cautious'});

const GER43 = {tank:{n:'Panzer IV Ausf. H'}, mtank:{n:'StuG III Ausf. G', w:'7.5 cm StuK 40 L/48', shape:'pz4'}, htank:{n:'Tiger I (s.Pz.Abt. 508)'}};
const ITALY44_MISSIONS = {
  salerno:{name:'Salerno', place:'The beachhead between the Sele and the Calore', date:'13 September 1943, 08:00', theme:'sicily', weather:'clear',
    p1:{nat:'us', co:'clark', funds:2000, u:{inf:{n:'36th & 45th Infantry Divisions'}, dd:{n:'Destroyer (Naval Gunfire Support)'}}},
    p2:{nat:'ger', co:'vietinghoff', funds:0, u:Object.assign({}, GER43, {inf:{n:'16. Panzer-Division & 29. Panzergrenadier'}})},
    objective:{win:'survive', days:6, hold:3, protect:'inf', protectN:5}, goal:'Hold the Salerno beachhead until {survive}. Keep five infantry units and three of your five positions. The Navy is just offshore.',
    brief:'Italy has surrendered, and the Allies expected to walk ashore at Salerno. Instead the Germans were waiting. Four days later the beachhead is thin, split down the middle by the Sele river, and this morning the panzers are coming down the corridor between the Sele and the Calore towards the beach, through the Tobacco Factory, with nothing much in their way except gunners firing over open sights. General Clark has drawn up plans to re-embark. If the beachhead holds, the destroyers and cruisers offshore will make the Germans pay for every yard.',
    clock:{start:'1943-09-13T08:00', step:120},
    build:() => { const b = MB(34, 22, '.', 60101);
      b.rect(0, 0, 3, 21, '~').rect(4, 0, 4, 21, 's');
      b.scatter(',', .35, 5, 0, 33, 21, ['.']).scatter('G', .15, 5, 0, 33, 21, ['.']).blobs('^', 5, 24, 0, 33, 21, 1, 2);
      b.river([[33, 8], [20, 10], [12, 9], [4, 11]], .1); b.river([[33, 15], [22, 14], [16, 12]], .1);   // the Sele and the Calore
      b.road([[4, 4], [20, 5], [33, 4]]).road([[10, 0], [11, 21]]).road([[11, 12], [30, 12]]);
      b.put([[7, 6, 'Q'], [8, 14, 'C'], [6, 19, 'C'], [14, 3, 'C'], [17, 11, 'C'], [28, 4, 'k'], [29, 12, 'k'], [27, 19, 'k'], [32, 10, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 5,2-17,19; art*3 6,5-9,15; at*2 12,9-17,13; tank*2 8,8-12,12; mortar*2 9,4-14,17; dd*2 1,4-2,16',
      2:'mtank*3 24,9-30,14; tank*3 25,3-31,8; inf*6 22,2-30,19; art*2 30,6-33,15; rkt 31,10; eng 24,12'},
    events:[{day:1, team:2, say:'The panzers come down the corridor between the rivers. The gunners of the 158th and 189th Field Artillery fire over open sights.', spawn:'tank*2 22,9-26,13'},
      {day:2, team:1, say:'Night. Paratroopers of the 82nd Airborne drop into the beachhead.', spawn:'inf*3 6,8-10,13'},
      {day:3, team:1, say:'The cruisers and destroyers close in and fire on the German columns.', hurt:1},
      {day:3, team:2, say:'The Hermann Göring Division joins the attack from the north.', spawn:'inf*3 18,0-24,3; mtank 22,1'},
      {day:4, team:1, say:'The battleships Warspite and Valiant arrive and fire their 15-inch guns ten miles inland.', hurt:1},
      {day:5, team:1, say:'The British 7th Armoured Division lands.', spawn:'tank*3 5,16-8,20'}]},
  cassino:{name:'Cassino', place:'The ruined town below Monte Cassino', date:'15 March 1944, 12:00', theme:'apennine', weather:'rain',
    p1:{nat:'anz', co:'freyberg', funds:0, u:{inf:{n:'25th & 26th NZ Battalions', w:'SMLE, Bren & Tommy guns'}, mtank:{n:'Sherman (19th NZ Armoured Regiment)', shape:'sherman', w:'75 mm', pow:1, arm:1, mv:5}, tank:{n:'Stuart (recce)', shape:'stuart', w:'37 mm'}}},
    p2:{nat:'ger', co:'heidrich', funds:0, u:{inf:{n:'Fallschirmjäger-Regiment 3', w:'MP 40, FG 42 & MG 42', pow:1.1}, nest:{n:'MG 42 in a Cellar'}, pak:{n:'StuG in the Ruins of the Hotel Continental', w:'7.5 cm', shape:'casemate'}}},
    objective:{win:'hq', limit:8}, goal:'Take Cassino town and the railway station by {limit}. The bombing has turned the streets into rubble.',
    brief:'Monte Cassino has stopped the Allies for two months. The monastery on the mountain was bombed flat in February; now it is the town\'s turn. This morning 500 bombers dropped 1,000 tons of bombs on it, then 900 guns fired 200,000 shells. Nothing could live through that. Then the New Zealanders went in, and found the paratroopers alive in the cellars, and the streets so cratered and choked with rubble that the tanks cannot get through. And it has started to rain.',
    clock:{start:'1944-03-15T12:00', step:120},
    build:() => { const b = MB(32, 22, '.', 60202);
      b.rect(16, 0, 31, 21, 'M').blobs('^', 6, 14, 0, 31, 21, 1, 2, ['M']);
      b.rect(10, 6, 20, 16, 'x').scatter('U', .2, 10, 6, 20, 16, ['x']);                            // the rubble of the town
      b.rect(19, 2, 21, 4, '^').rect(26, 1, 29, 4, 'x');                                             // Castle Hill, the monastery
      b.river([[6, 0], [7, 10], [6, 21]], .1).road([[0, 11], [10, 11], [20, 12]]).road([[13, 21], [13, 6]]);
      b.put([[1, 11, 'Q'], [3, 4, 'C'], [3, 18, 'C'], [15, 12, 'q'], [12, 8, 'k'], [18, 14, 'k'], [20, 3, 'k'], [12, 18, 'k'], [27, 2, 'k']]);
      return b.rows(); },
    units:{1:'inf*9 0,3-9,19; mtank*4 1,8-5,14; tank*2 2,6-4,16; art*3 0,4-2,18; eng*2 7,9-9,13; mortar*2 4,9-6,13',
      2:'inf*7 10,6-20,16; nest*4 11,7-19,15; pak*2 13,10-17,14; mortar*2 18,6-21,12; art*2 22,4-26,10; inf*2 19,2-21,4'},
    events:[{day:1, team:1, say:'08:30-12:00. 1,000 tons of bombs and 200,000 shells on a town of two square miles.', hurt:2},
      {day:2, team:1, say:'Rain. The bomb craters fill with water. The Shermans cannot get through the rubble.', hurt:0},
      {day:3, team:1, say:'The Gurkhas of the 4th Indian Division take Hangman\'s Hill, high above the town.', spawn:'inf*2 21,6-24,9'},
      {day:4, team:2, say:'Fresh paratroopers infiltrate back into the town by night through the sewers.', spawn:'inf*3 14,9-18,14'},
      {day:6, team:1, say:'The New Zealanders take the railway station.', heal:1}]},
  anzio:{name:'The Flyover', place:'The Via Anziate and the Flyover, Anzio beachhead', date:'16 February 1944, 06:30', theme:'normandy', weather:'overcast',
    p1:{nat:'us', co:'truscott', funds:2000, u:{inf:{n:'45th Infantry Division & 1st Loyals', w:'M1 Garand & BAR'}}},
    p2:{nat:'ger', co:'mackensen', funds:0, u:Object.assign({}, GER43, {mtank:{n:'Panther Ausf. A'}, htank:{n:'Tiger I & Ferdinand'}, eng:{n:'Goliath Demolition Teams', w:'remote-controlled demolition vehicles', pow:1.2}})},
    objective:{win:'survive', days:6, hold:3}, goal:'Hold the beachhead at the Flyover until {survive}. Keep three of your four positions.',
    brief:'The landing at Anzio was meant to outflank Cassino and open the road to Rome. Instead, the commander dug in on the beach, and the Germans ringed him with guns. Now Hitler has ordered the "abscess" lanced. Operation Fischfang: six divisions, Tigers, Panthers, Ferdinands and remote-controlled Goliath demolition tanks, straight down the road from Aprilia to the sea. Across the road stands the Flyover, the last bridge before the beach. Behind it there is nowhere to go.',
    clock:{start:'1944-02-16T06:30', step:120},
    build:() => { const b = MB(32, 22, '.', 60303);
      b.rect(0, 0, 31, 2, '~').rect(0, 3, 31, 3, 's');
      b.scatter(',', .3, 0, 4, 31, 21, ['.']).blobs('v', 4, 0, 6, 12, 21, 1, 1, ['.', ',']);
      b.path([[24, 6], [23, 12], [24, 19]], (x, y) => b.set(x, y, 'W'));                            // the wadis, the "caves"
      b.road([[16, 3], [16, 21]]).road([[0, 11], [31, 11]]); b.set(16, 11, 'b');                    // the Via Anziate and the Flyover
      b.put([[16, 5, 'Q'], [10, 8, 'C'], [22, 8, 'C'], [16, 11, 'C'], [16, 20, 'q'], [8, 17, 'k'], [25, 17, 'k']]);
      return b.rows(); },
    units:{1:'inf*7 9,6-23,13; art*4 12,4-20,7; at*2 14,9-18,12; tank*3 11,7-21,10; mortar*2 13,7-19,9; nest*2 15,10-17,12',
      2:'mtank*3 13,16-19,20; htank*2 15,17-18,20; inf*7 9,14-24,20; art*2 4,18-28,21; eng*2 14,15-18,17; tank*2 20,15-25,19'},
    events:[{day:1, team:2, say:'Fischfang. The Goliaths crawl forward first, and most of them break down.', hurt:0},
      {day:2, team:1, say:'Every Allied gun in the beachhead, and the cruisers offshore, fire on the Via Anziate.', hurt:1},
      {day:3, team:2, say:'The 29th Panzergrenadier Division attacks down the road to the Flyover.', spawn:'mtank*2 14,18-18,21; inf*3 12,17-20,21'},
      {day:4, team:1, say:'Truscott takes command of the beachhead. Seven hundred aircraft attack the German assembly areas.', hurt:1},
      {day:5, team:1, say:'The 1st Armored Division counter-attacks from the flank.', spawn:'tank*3 26,6-30,10'}]},
  rome:{name:'The Race for Rome', place:'The Alban Hills and the road to Rome', date:'1 June 1944, 06:00', theme:'sicily', weather:'clear',
    p1:{nat:'us', co:'clark', funds:0, u:{inf:{n:'36th & 88th Infantry Divisions'}}},
    p2:{nat:'ger', co:'mackensen', funds:0, u:Object.assign({}, GER43, {inf:{n:'Rearguards (Hermann Göring & 3. Panzergrenadier)'}})},
    objective:{win:'hq', limit:11}, goal:'Break through the Alban Hills and take Rome by {limit}. The cameras are waiting.',
    brief:'The Gustav Line has broken at last, and the Germans are retreating north. General Alexander ordered Clark to drive across their line of retreat at Valmontone and trap them. Clark has turned his army north-west instead, for Rome: he means the Americans, and Mark Clark, to be first into the Eternal City. At night the 36th Division has found a gap in the Alban Hills at Monte Artemisio. The German rearguards will fight for every hill town on the way.',
    clock:{start:'1944-06-01T06:00', step:120},
    build:() => { const b = MB(34, 20, '.', 60404);
      b.blobs('^', 8, 8, 0, 24, 19, 1, 2).blobs('T', 4, 8, 0, 24, 19, 1, 1, ['^', '.']).scatter('G', .2, 0, 0, 33, 19, ['.']);
      b.rect(28, 5, 33, 14, 'U').scatter('I', .1, 28, 5, 33, 14, ['U']);                          // Rome
      b.road([[0, 10], [14, 9], [28, 9], [33, 9]]).road([[6, 19], [20, 14], [28, 12]]);
      b.put([[0, 10, 'Q'], [4, 3, 'C'], [5, 16, 'C'], [12, 6, 'k'], [17, 12, 'k'], [22, 5, 'k'], [31, 9, 'q'], [29, 6, 'k'], [30, 13, 'k']]);
      return b.rows(); },
    units:{1:'inf*10 0,3-7,17; tank*4 1,7-5,13; art*3 0,5-2,15; recon*2 3,4-6,16; at*2 5,8-7,12; mortar 3,10; nest*2 1,9-2,11',
      2:'inf*6 10,2-24,17; at*2 13,6-20,13; nest*3 11,4-22,15; art*2 24,4-27,15; tank*2 24,8-28,12; inf*2 28,6-32,13'},
    events:[{day:2, team:1, say:'The 36th Division slips through the gap at Monte Artemisio in the dark.', spawn:'inf*3 10,0-15,2'},
      {day:3, team:2, say:'The Hermann Göring Division fights a rearguard at Valmontone.', spawn:'inf*2 18,16-23,19'},
      {day:4, team:1, say:'The Germans declare Rome an open city and pull back through it.', hurt:1}]},
  coriano:{name:'Coriano Ridge', place:'The Gothic Line on the Adriatic', date:'12 September 1944, 23:00', theme:'apennine', weather:'clear',
    p1:{nat:'uk', co:'leese', funds:0, u:{inf:{n:'1st Armoured & 5th Canadian Armoured Divisions\' Infantry'}, tank:{n:'Sherman (Eighth Army)', shape:'sherman', w:'75 mm'}, mtank:{n:'Churchill (21st Tank Brigade)', shape:'churchill', w:'75 mm'}}},
    p2:{nat:'ger', co:'herr', funds:0, u:Object.assign({}, GER43, {mtank:{n:'Panther (26. Panzer-Division)', shape:'panther'}})},
    objective:{win:'hq', limit:16}, goal:'Storm Coriano Ridge and take the village by {limit}, before the autumn rains come.',
    brief:'Operation Olive: the Eighth Army has crossed to the Adriatic in secret and broken into the Gothic Line, and the Po valley, open tank country all the way to the Alps, lies beyond the last ridges. The last and worst of them is Coriano. The 1st Armoured Division has already lost 150 tanks trying to get round it. Tonight it is to be taken head-on, with a barrage from 700 guns and the infantry going in first. The weather forecast says rain.',
    clock:{start:'1944-09-12T23:00', step:120},
    build:() => { const b = MB(34, 22, '.', 60505);
      b.scatter(',', .3, 0, 0, 33, 21, ['.']).scatter('G', .15, 0, 0, 33, 21, ['.']).blobs('^', 6, 14, 0, 33, 21, 1, 2);
      b.rect(18, 4, 22, 17, '^').scatter('z', .3, 17, 4, 22, 17, ['^', '.']);                     // Coriano ridge
      b.river([[10, 0], [11, 21]], .15);                                                              // the Marano
      b.road([[0, 11], [20, 10], [33, 10]]).road([[20, 0], [20, 21]]);
      b.put([[1, 11, 'Q'], [4, 4, 'C'], [4, 18, 'C'], [20, 10, 'q'], [19, 6, 'k'], [21, 15, 'k'], [27, 4, 'k'], [28, 17, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 0,2-9,19; tank*4 1,6-6,15; mtank*2 2,9-5,13; art*4 0,4-2,17; eng*2 6,9-9,13; mortar*2 5,7-8,15; nest*2 0,10-2,12',
      2:'inf*4 16,3-24,18; mtank 22,7-26,13; nest*2 17,5-21,16; pak 18,8-21,13; art 26,4-31,17; at 15,6-19,15'},
    events:[{day:1, team:1, say:'23:00. Seven hundred guns open fire on the ridge.', hurt:1},
      {day:3, team:2, say:'The 29th Panzergrenadier Division counter-attacks along the ridge.', spawn:'inf*3 24,2-28,8; tank 26,5'},
      {day:4, team:2, say:'It starts to rain. The tanks bog down in the mud.', hurt:1, hurtTeam:1},
      {day:5, team:1, say:'The Canadians take San Fortunato on the flank.', heal:1}]},
  montecastello:{name:'Monte Castello', place:'The snowy ridges of the northern Apennines', date:'21 February 1945, 06:00', theme:'apennine', weather:'snow',
    p1:{nat:'br', co:'mascarenhas', funds:0},
    p2:{nat:'ger', co:'gablenz', funds:0, u:{inf:{n:'232. Infanterie-Division', w:'Kar98k & MG 42'}}},
    objective:{win:'hq', limit:10}, goal:'Take the summit of Monte Castello by {limit}. The Brazilians have been beaten back from it four times.',
    brief:'The Brazilian Expeditionary Force came from the tropics to fight in the snow of the Apennines. Four times since November it has attacked Monte Castello and been thrown back. Today it goes again, with the US 10th Mountain Division climbing the ridges of Belvedere on the left, and the Thunderbolts of the Brazilian air force overhead, whose pilots\' war cry is "Senta a Pua!" The Brazilians say: the snake is going to smoke.',
    clock:{start:'1945-02-21T06:00', step:120},
    build:() => { const b = MB(30, 22, '.', 60606);
      b.blobs('^', 9, 0, 0, 29, 21, 1, 2).blobs('M', 5, 14, 0, 29, 21, 1, 1, ['^', '.']).blobs('T', 6, 0, 0, 29, 21, 1, 1, ['.', '^']);
      b.rect(19, 8, 23, 13, '^').rect(20, 9, 22, 12, '.').scatter('z', .4, 18, 7, 24, 14, ['^', '.']);   // the summit
      b.road([[0, 16], [12, 14], [21, 11]]).road([[5, 0], [8, 16]]);
      b.put([[1, 16, 'Q'], [4, 5, 'C'], [6, 20, 'C'], [21, 10, 'q'], [16, 6, 'k'], [17, 15, 'k'], [26, 4, 'k'], [27, 18, 'k']]);
      return b.rows(); },
    units:{1:'inf*9 0,10-9,21; eng*2 4,13-7,16; art*3 0,14-2,20; mortar*2 3,15-6,19; tank*2 5,15-8,18; ftr 2,18',
      2:'inf*7 15,5-25,16; nest*4 18,7-24,14; mortar*2 22,6-26,13; art*2 25,8-29,15; at 17,12'},
    events:[{day:1, team:1, say:'The 10th Mountain Division takes the ridge of Monte Belvedere on the left.', hurt:1},
      {day:2, team:1, say:'P-47s of the 1st Brazilian Fighter Group bomb the summit. "Senta a Pua!"', hurt:1},
      {day:3, team:2, say:'The Germans counter-attack from Monte della Torraccia.', spawn:'inf*3 24,2-29,7'},
      {day:4, team:1, say:'The Sampaio Regiment goes up the last slope.', spawn:'inf*2 12,16-16,20'}]},
};
for (const [id, m] of Object.entries(ITALY44_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  salerno:{forces:['The US VI Corps (36th and 45th Divisions), the 82nd Airborne and British X Corps, with naval gunfire', 'The 16th Panzer, 29th Panzergrenadier, Hermann Göring and 26th Panzer Divisions'],
    win:'The beachhead holds. The road to Naples is open.', lose:'The Allies are driven back to the boats.',
    real:'On 13-14 September 1943 the German counter-attack down the Sele-Calore corridor came within a mile of the beach. American gunners fired over open sights, and Clark drew up plans to re-embark. But the 82nd Airborne dropped into the beachhead, the warships fired 11,000 tons of shells, and the line held. On 16 September the British Eighth Army arrived from the south; the Allies took Naples on 1 October.'},
  cassino:{forces:['The New Zealand Corps: the 2nd New Zealand and 4th Indian Divisions', 'The German 1st Parachute Division'],
    win:'Cassino town falls. The Gustav Line is broken at last.', lose:'The paratroopers hold the rubble.',
    real:'The third battle of Cassino, from 15 to 23 March 1944, failed. The bombing created exactly the rubble the paratroopers needed, the tanks could not get through it, and the rain flooded the craters. The New Zealanders took the railway station and the Gurkhas held Hangman\'s Hill for nine days, but the town and the monastery held. Cassino fell only in May, when the Polish Corps took the monastery.'},
  anzio:{forces:['The US VI Corps: the 45th and 1st Armored Divisions and British infantry', 'The German 14th Army: six divisions with Tigers, Panthers, Ferdinands and Goliaths'],
    win:'The Flyover holds. The beachhead survives.', lose:'The beachhead is split in two.',
    real:'Operation Fischfang, from 16 to 20 February 1944, drove a wedge two miles deep towards the sea, but the Allied artillery, naval gunfire and air power stopped it at the final beachhead line by the Flyover. The Goliaths mostly broke down. The beachhead held until the breakout in May, at a cost of about 43,000 Allied casualties.'},
  rome:{forces:['The US Fifth Army\'s II and VI Corps', 'German rearguards of the 14th Army'],
    win:'Rome is taken. The first Axis capital falls.', lose:'The rearguards hold the Alban Hills.',
    real:'The 36th Division found the gap at Monte Artemisio on 30 May 1944 and the German line broke. Clark entered Rome on 4 June, the first Axis capital to fall, and was furious when D-Day took the headlines two days later. By going for Rome instead of Valmontone he let the German 10th Army escape to fight again on the Gothic Line, and historians have argued about it ever since.'},
  coriano:{forces:['The British 1st Armoured Division and the 5th Canadian Armoured Division, with Indian and Greek infantry nearby', 'The German 26th Panzer and 29th Panzergrenadier Divisions'],
    win:'Coriano Ridge falls, and the Po valley is in sight.', lose:'The ridge holds and the rains come.',
    real:'Coriano Ridge was taken on the night of 12-13 September 1944 after a huge bombardment. But the German line re-formed behind it, and from the end of September the rains turned the Romagna into a sea of mud and swollen rivers. The breakthrough into the Po valley had to wait until April 1945.'},
  montecastello:{forces:['The 1st Brazilian Expeditionary Infantry Division, with the US 10th Mountain Division on its flank', 'The German 232nd Infantry Division'],
    win:'Monte Castello is Brazilian.', lose:'The Brazilians are thrown back a fifth time.',
    real:'On 21 February 1945, at the fifth attempt, the Brazilians took Monte Castello in a day of hard fighting, while the 10th Mountain Division took the ridges alongside. The FEB went on to take Montese in April and accepted the surrender of the German 148th Division at Fornovo, 15,000 men, at the end of the war. 457 Brazilians died in Italy; they are remembered every year in Pistoia and in Brazil.'},
});
Object.assign(CO_FATE, {
  clark:'Commanded the 15th Army Group to the end of the war in Italy and the UN forces at the end of the Korean War. Died in 1984.',
  truscott:'Commanded the Fifth Army in 1945 and the US Third Army in Germany after Patton. Died in 1965.',
  leese:'Commanded Allied Land Forces in South-East Asia, and was sacked after trying to sack Slim. Became a famous cactus grower. Died in 1978.',
  mascarenhas:'Became a marshal of Brazil. Died in 1968.',
  vietinghoff:'Surrendered the German armies in Italy on 2 May 1945. Died in 1952.',
  mackensen:'Sentenced to death for the Ardeatine Caves massacre of 335 Italian civilians; commuted, he was released in 1952. Died in 1969.',
  heidrich:'Commanded the I Parachute Corps in 1945. Died in 1947.',
  herr:'Commanded the 10th Army in 1945. Died in 1976.',
  gablenz:'Surrendered in Italy in 1945.',
});
Object.assign(MISSION_LONLAT, {salerno:[14.97, 40.52], cassino:[13.83, 41.49], anzio:[12.63, 41.5], rome:[12.7, 41.75], coriano:[12.6, 43.97], montecastello:[10.95, 44.2]});
CAMPAIGNS.push({id:'italy44', name:'The Italian Campaign', sub:'Salerno to the Apennines · 1943–1945', side:'allies', missions:['salerno', 'cassino', 'anzio', 'rome', 'coriano', 'montecastello']});
