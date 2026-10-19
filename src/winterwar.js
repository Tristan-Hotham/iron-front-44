/* ============================== THE WINTER WAR ==============================
   Finland against the Soviet Union, November 1939 to March 1940: a nation of four
   million against an empire of 170, in forty degrees of frost. Ski troops, the
   motti, Molotov cocktails, the Mannerheim Line, and a peace at eleven o'clock. */

/* the Finnish army: grey wool, white snow smocks, skis */
FLAG_EXTRA.fi = (g, x, y, w, h) => { g.fillStyle = '#f4f4ee'; g.fillRect(x, y, w, h); g.fillStyle = '#1a3e8a'; g.fillRect(x + w * .28, y, w * .16, h); g.fillRect(x, y + h * .38, w, h * .24); };
MARK_EXTRA.ficross = (P, x, y, s = 1) => { P.R(x - 3 * s, y - 2.2 * s, 6 * s, 4.4 * s, '#f4f4ee'); P.R(x - 1.4 * s, y - 2.2 * s, 1.2 * s, 4.4 * s, '#1a3e8a'); P.R(x - 3 * s, y - .5 * s, 6 * s, 1 * s, '#1a3e8a'); };
Object.assign(HELMET_COL, {fi:'#d8dcd6', su39:'#5a6040'});
Object.assign(NAT_BASE, {su39:'su'});
Object.assign(INF_WEAPONS, {fi:{inf:['rifle', 'rifle', 'ppsh'], at:['satchel', 'rifle'], eng:['rifle', 'rifle'], mortar:['shell', 'rifle'], cav:['ppsh', 'ppsh']}, su39:INF_WEAPONS.su41 || INF_WEAPONS.su});
NATION.fi = {n:'Finland', adj:'Finnish', short:'Suomen Armeija', side:'allies',
  col:{m:'#8a8e80', d:'#5a5e52', ui:'#2a5ab8', team:'#2a5ab8', hi:'#e8ece8'},
  uniform:'#d4d8d2', helmet:'stahl', star:'ficross', skin:'#e8c4a4',
  u:{
    inf:  {n:'Ski Infantry', w:'Mosin m/28-30 & Suomi KP/-31', snd:'ppsh', mv:4, cost:1000},
    at:   {n:'Molotov Cocktail Team', w:'Molotov cocktails & satchel charges', snd:'molotov', pow:.85, powArm:1.6, cost:2000},
    eng:  {n:'Pioneers', w:'mines, charges & axes', snd:'bangalore'},
    mortar:{n:'Tampella 81 mm Mortar', w:'81 mm mortar', snd:'mortar'},
    cav:  {n:'Ski Patrol (Sissi)', w:'Suomi submachine guns, on skis', snd:'ppsh', mv:6, cost:2200, horse:false},
    tank: {n:'Vickers 6-ton', w:'37 mm Puteaux', snd:'gun37', shape:'t26', pow:.7, cost:5000},
    art:  {n:'76 K/02 Field Gun', w:'76 mm, five shells a day', snd:'howitzer', shape:'m2a1', pow:.9},
    rkt:  {n:'152 H/38 Howitzer', w:'152 mm', snd:'howitzer', shape:'m30', rng:[3,5], mt:'tire', mv:3, cost:11000},
    aa:   {n:'Bofors 40 mm', w:'40 mm', snd:'bofors', shape:'k61', mt:'tire'},
    ftr:  {n:'Fokker D.XXI', w:'4x 7.7 mm', snd:'strafeUK', shape:'p11'},
    bmr:  {n:'Bristol Blenheim', w:'bombs', snd:'bombs', shape:'boston'},
    nest: {n:'Maxim m/32-33 Bunker', w:'Maxim in a log-and-earth bunker', snd:'dt', shape:'nest'},
    pak:  {n:'Concrete Bunker (Mannerheim Line)', w:'37 mm Bofors & Maxims', snd:'gun37', shape:'casemate', pow:1.05},
  }};
NATION.su39 = {n:'Soviet Union', adj:'Soviet', short:'Red Army 1939', side:'allies',
  col:{m:'#5a6440', d:'#384028', ui:'#d63a2e', team:'#d63a2e', hi:'#c0c890'},
  uniform:'#8b7f55', helmet:'ssh40', star:'redstar',
  u:deriv(NATION.su41.u, {
    inf:  {n:'Rifle Squad (1939)', w:'Mosin-Nagant & DP-27', snd:'dt', cost:900, pow:.9},
    tank: {n:'T-26 Model 1939', w:'45 mm 20-K', snd:'gun50', shape:'t26', pow:.8, cost:5000},
    mtank:{n:'T-28 Medium Tank', w:'76 mm KT-28 and three MGs', snd:'gun76', shape:'charb1', pow:.95, cost:9000, mv:4},
    htank:{n:'KV-1 (prototype)', w:'76 mm L-11', snd:'gun76', shape:'kv1', arm:.6, mv:3, cost:14000},
    recon:{n:'BA-10 Armoured Car', w:'45 mm', snd:'gun50', shape:'ba64', cost:4000},
    ftr:  {n:'Polikarpov I-16', w:'4x ShKAS', snd:'strafeSU', shape:'yak3'},
    bmr:  {n:'Tupolev SB', w:'bombs', snd:'bombs', shape:'boston'},
    art:  {n:'122 mm M1910/30', w:'122 mm howitzer', snd:'howitzer', shape:'m30'},
    rkt:  {n:'203 mm B-4 Howitzer', w:'203 mm: the "Stalin sledgehammer"', snd:'howitzer', shape:'m30', rng:[3,6], mv:3, cost:15000, pow:1.15},
  })};
MOOD_ALIAS.fi = 'campaign'; MOOD_ALIAS.su39 = 'su';
BARKS.fi = {sel:['Selvä!', 'Kyllä, herra!', 'Valmiina!'], veh:['Eteenpäin!', 'Selvä!'], move:['Eteenpäin!', 'Hiihtäen!', 'Perässä!'],
  atk:['Tulta!', 'Hakkaa päälle!', 'Molotoville cocktail!', 'Ampukaa!'], kill:['Osui!', 'Yksi vähemmän!', 'Nyt meni!'], hurt:['Lääkintämies!', 'Suojaan!', 'Osuma!'],
  cap:['Meidän!', 'Otettu!'], new:['Ilmoittaudun!', 'Valmiina!'], idle:['Kylmä…', 'Missä kenttäkeittiö on?', 'Neljäkymmentä astetta pakkasta.', 'Saunaan, kun tämä loppuu.', 'Sisu.']};
BARKS.su39 = BARKS.su41 || BARKS.su;

/* the generals */
Object.assign(CO, {
  mannerheim:{n:'Carl Gustaf Mannerheim', nat:'fi', rank:'Field Marshal', nick:'Commander-in-Chief',
    bio:'A former general of the Tsar who had led the Whites to victory in the Finnish civil war of 1918. Aged 72 in 1939, he took command of an army with little artillery, almost no tanks and shells for a few weeks, and held off the Red Army for 105 days.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'The Line Holds', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Sisu', star:6, txt:'All units +35% defence and +20% firepower; all units recover 2 HP.', def:{all:35}, atk:{all:20}, heal:2},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#d8d4cc', jaw:1, tunic:'#7a7c6a', collar:'#c8a040', moustache:true},
    say:{start:'We fight for our homes, our faith and our country.', win:'The line holds.', lose:'Fall back to the next line.', power:'Not one step more!'}},
  talvela:{n:'Paavo Talvela', nat:'fi', rank:'Colonel', nick:'Group Talvela',
    bio:'Given a scratch force north of Lake Ladoga in December 1939, he attacked a Soviet division three times his size across the frozen Tolvajärvi lakes and won the first Finnish victory of the war, at a moment when the country badly needed one.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Over the Ice', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'Tolvajärvi', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#7a7c6a'},
    say:{start:'Attack. Now, before they know how few we are.', win:'The first victory!', lose:'Back across the ice.', power:'Hakkaa päälle!'}},
  siilasvuo:{n:'Hjalmar Siilasvuo', nat:'fi', rank:'Colonel', nick:'9th Division',
    bio:'Commanded at Suomussalmi, where his ski troops cut the Soviet divisions on the forest roads into isolated pockets, which the Finns called motti, a word for a stack of logs left in the forest to be chopped up later. Two Soviet divisions were destroyed.',
    d2d:{txt:'Infantry +1 move.', mv:{foot:1}},
    cop:{n:'Motti', star:3, txt:'Infantry +2 move and +15% firepower.', mv:{foot:2}, atk:{foot:15}},
    scop:{n:'Cut the Road', star:6, txt:'All units +35% firepower; enemy -1 move.', atk:{all:35}, enemyMv:-1},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#7a7c6a'},
    say:{start:'Cut the road in ten places. Then chop the pieces up.', win:'The road is a graveyard.', lose:'They broke out.', power:'Motti!'}},
  teittinen:{n:'Antero Teittinen', nat:'fi', rank:'Major', nick:'Kollaa',
    bio:'Commanded the 34th Infantry Regiment on the Kollaa river north of Lake Ladoga, which held for the whole war against odds of ten to one. Asked whether Kollaa would hold, his corps commander answered: "Kollaa holds, unless the orders are to run." It became a national saying.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'Kollaa Holds', star:3, txt:'All units +30% defence.', def:{all:30}},
    scop:{n:'White Death', star:6, txt:'Infantry +45% firepower.', atk:{foot:45}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#5a4a3a', jaw:1, tunic:'#7a7c6a'},
    say:{start:'Kollaa holds.', win:'Kollaa holds.', lose:'Unless the orders are to run.', power:'Tulta!'}},
  oesterman:{n:'Hugo Österman', nat:'fi', rank:'Lieutenant General', nick:'Army of the Isthmus',
    bio:'Commanded the Army of the Karelian Isthmus, behind the Mannerheim Line. When Timoshenko\'s great offensive broke through at Summa in February 1940, it was his job to get the army back to the next line before it was destroyed.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Withdraw', star:3, txt:'All ground units +2 move.', mv:{ground:2}},
    scop:{n:'The Intermediate Line', star:6, txt:'All units +30% defence and +1 move.', def:{all:30}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:2, tunic:'#7a7c6a', glasses:true},
    say:{start:'Get the regiments back to the intermediate line.', win:'They are back. We hold there.', lose:'They are cut off.', power:'Back! Fall back in order!'}},
  meretskov:{n:'Kirill Meretskov', nat:'su39', rank:'Army Commander 2nd Rank', nick:'7th Army',
    bio:'Commanded the 7th Army on the Karelian Isthmus in December 1939, expecting to be in Helsinki within two weeks. His frontal attacks on the Mannerheim Line failed with terrible losses. Arrested and tortured by the NKVD in 1941, he was released to command fronts for the rest of the war.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Barrage', star:3, txt:'Artillery +30% firepower.', atk:{indirect:30}},
    scop:{n:'Mass Assault', star:6, txt:'All units +25% firepower and +1 move.', atk:{all:25}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#5a4a3a', jaw:2, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Helsinki in twelve days.', win:'The line is broken.', lose:'They are everywhere in the forest.', power:'Vperyod!'}},
  vinogradov:{n:'Alexei Vinogradov', nat:'su39', rank:'Kombrig', nick:'44th Rifle Division',
    bio:'Commanded the 44th Rifle Division, a motorised Ukrainian division sent to relieve the 163rd at Suomussalmi along the Raate road, through forest and snow it had never been trained for. Strung out for twenty miles, it was cut into mottis and destroyed. He escaped, and was shot by firing squad in front of his men.',
    d2d:{txt:'Tanks +10% defence.', def:{armour:10}},
    cop:{n:'Close Up', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Break Out', star:6, txt:'All units +2 move.', mv:{ground:2}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Keep the column moving.', win:'We are through to Suomussalmi.', lose:'Everyone for himself!', power:'Break out!'}},
  timoshenko:{n:'Semyon Timoshenko', nat:'su39', rank:'Army Commander 1st Rank', nick:'North-Western Front',
    bio:'Sent to take over the Finnish war in January 1940, he did it the brutal way: weeks of preparation, then the heaviest bombardment since 1918 and wave after wave of infantry and tanks against the Summa sector until the Mannerheim Line broke.',
    d2d:{txt:'Artillery +20% firepower.', atk:{indirect:20}},
    cop:{n:'Grinding Barrage', star:3, txt:'Artillery +35% firepower and +1 range.', atk:{indirect:35}, rng:{indirect:1}},
    scop:{n:'Summa', star:6, txt:'All units +30% firepower; the guns shell two Finnish positions for 3 HP.', atk:{all:30}, strike:{n:2, r:1, hp:3, kind:'barrage'}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#2a2420', jaw:2, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'We will grind the line to dust.', win:'The Mannerheim Line is broken.', lose:'Again. Bring up more guns.', power:'All guns, fire!'}},
  belyaev:{n:'Ivan Belyaev', nat:'su39', rank:'Kombrig', nick:'139th Rifle Division',
    bio:'Commanded the 139th Rifle Division, which marched into Finland north of Lake Ladoga expecting to meet no resistance, and ran into Talvela\'s battalions at Tolvajärvi.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Forward', star:3, txt:'Infantry +1 move.', mv:{foot:1}},
    scop:{n:'Across the Lake', star:6, txt:'All units +25% firepower.', atk:{all:25}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'The Finns will welcome us as liberators.', win:'They are running.', lose:'We are surrounded.', power:'Za Rodinu!'}},
});
for (const id of ['mannerheim', 'talvela', 'siilasvuo', 'teittinen', 'oesterman', 'meretskov', 'vinogradov', 'timoshenko', 'belyaev']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {mannerheim:'cautious', talvela:'aggressive', siilasvuo:'opportunist', teittinen:'cautious', oesterman:'methodical', meretskov:'reckless', vinogradov:'cautious', timoshenko:'methodical', belyaev:'reckless'});

const WINTER_MISSIONS = {
  summa:{name:'Summa', place:'The Mannerheim Line on the Karelian Isthmus', date:'17 December 1939, 09:00', theme:'winter', weather:'snow',
    p1:{nat:'fi', co:'mannerheim', funds:0, u:{inf:{n:'Infantry (5th Division)', mv:3}}},
    p2:{nat:'su39', co:'meretskov', funds:0},
    objective:{win:'survive', days:12, hold:3, protect:'inf', protectN:2}, goal:'Hold the Mannerheim Line at Summa until {survive}, three days of assaults. If you are down to your last infantry unit, or lose two of your four positions, the line is broken.', persona:{2:'brawler'},
    brief:'Stalin expected a war of two weeks. On 30 November 1939 the Red Army invaded with half a million men and two thousand tanks. On the Karelian Isthmus it has reached the Mannerheim Line, a chain of bunkers, trenches and granite anti-tank rocks across the forests between the Gulf of Finland and Lake Ladoga. At Summa the Soviets attack head-on: T-28s and even two prototype heavy tanks, the KV and the SMK, against Finns who have almost no anti-tank guns. They have petrol bottles, which they call Molotov cocktails, after the Soviet foreign minister.',
    clock:{start:'1939-12-17T09:00', step:360},
    build:() => { const b = MB(32, 22, '.', 30101);
      b.blobs('T', 14, 0, 0, 31, 21, 1, 2).blobs('v', 3, 18, 0, 28, 21, 1, 2, ['.']);
      b.path([[11, 0], [11, 21]], (x, y) => b.set(x, y, 'O'));                               // the granite anti-tank rocks
      b.path([[12, 0], [12, 21]], (x, y) => b.set(x, y, 'w'));
      for (const y of [3, 8, 13, 18]) b.set(9, y, 'B');
      b.rect(8, 9, 10, 12, 'z', ['.', 'T']).rect(5, 2, 7, 4, '^', ['.', 'T']);
      b.road([[0, 10], [31, 11]]);
      b.put([[2, 11, 'Q'], [6, 4, 'C'], [5, 17, 'C'], [9, 11, 'C'], [28, 4, 'k'], [29, 17, 'k'], [30, 11, 'q']]);
      return b.rows(); },
    units:{1:'inf*6 4,2-10,19; at*3 7,5-10,16; pak*3 8,2-10,19; nest*3 8,4-10,18; mortar*2 3,7-6,14; art*2 1,8-3,13',
      2:'inf*12 13,1-25,20; mtank*3 14,7-20,14; tank*5 14,2-22,19; art*5 25,3-30,18; rkt 28,10; htank 18,10'},
    events:[{day:1, team:2, say:'The Soviet guns open up. They have more shells in an hour than the Finns have for a week.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'The second wave: infantry in brown greatcoats, in the open, singing.', spawn:'inf*5 17,1-24,20'},
      {day:3, team:1, say:'The anti-tank teams let the tanks through the line, then burn them from behind with Molotov cocktails.', hurt:1},
      {day:4, team:2, say:'More T-26s, and the SMK heavy tank, the "Stalin\'s fortress".', spawn:'tank*4 16,5-22,16; htank 20,9; inf*3 18,2-24,19'},
      {day:5, team:1, say:'Night. Thirty degrees of frost. The Soviet wounded freeze where they fall.', hurt:1},
      {day:6, team:1, say:'Reserves come up through the forest: a battalion of the 5th Division and a few Bofors guns.', spawn:'inf*3 1,8-4,13; at*2 2,9-4,12'},
      {day:7, team:2, say:'18 December. A new division is fed into the attack, behind a creeping barrage.', spawn:'inf*4 16,1-25,20; tank*2 17,5-23,16'},
      {day:9, team:2, say:'The SMK, Stalin\'s three-turreted fortress, rolls forward again, with T-28s around it.', spawn:'htank 19,10; mtank*2 16,6-21,15'},
      {day:10, team:1, say:'The Molotov teams go out at night into the snow, to the tanks stranded between the lines.', hurt:1},
      {day:11, team:2, say:'19 December. The last great push of the December offensive.', spawn:'inf*4 16,2-24,19; tank 18,8-22,13'}]},
  tolvajarvi:{name:'Tolvajärvi', place:'The frozen lakes north of Lake Ladoga', date:'12 December 1939, 08:00', theme:'winter', weather:'snow',
    p1:{nat:'fi', co:'talvela', funds:0, u:{inf:{n:'Infantry Regiment 16 (on skis)'}}},
    p2:{nat:'su39', co:'belyaev', funds:0, u:{inf:{n:'139th Rifle Division'}}},
    objective:{win:'hq', limit:12}, goal:'Attack across the ice and take the Soviet headquarters at the Tolvajärvi hotel by {limit}.',
    brief:'North of Lake Ladoga the 139th Rifle Division has marched into Finland expecting no resistance, and only a few Finnish battalions stand between it and the railway. Colonel Talvela has decided that the best defence is to attack, now, with everything he has, across the frozen lakes and the narrow ridges between them, before the Soviets realise how few Finns there are. His men have not had a victory yet. Neither has Finland.',
    clock:{start:'1939-12-12T08:00', step:120},
    build:() => { const b = MB(34, 20, 'T', 30202);
      b.rect(8, 0, 15, 19, '.').rect(19, 0, 25, 19, '.').scatter('T', .18, 8, 0, 25, 19, ['.']);   /* islands and reed beds on the ice */                                     // the two frozen lakes
      b.rect(16, 4, 18, 15, 'T').rect(16, 8, 18, 11, '^');                                      // the ridge between them
      b.blobs('.', 4, 0, 0, 7, 19, 1, 2, ['T']).blobs('.', 4, 26, 0, 33, 19, 1, 2, ['T']);
      b.road([[0, 10], [8, 10], [16, 9], [26, 10], [33, 10]]);
      b.put([[1, 10, 'Q'], [4, 4, 'C'], [4, 16, 'C'], [17, 9, 'k'], [28, 5, 'k'], [28, 15, 'k'], [31, 10, 'q']]);
      return b.rows(); },
    units:{1:'inf*10 1,2-7,18; cav*4 3,1-7,6; mortar*2 2,8-5,12; art*3 0,8-2,12; at*2 4,9-7,12',
      2:'inf*5 16,3-25,17; tank 26,6-30,14; art 29,4-33,16; mortar 26,8-29,12; nest 17,7-18,12; recon 27,10'},
    events:[
      {day:3, team:1, say:'Talvela leads the counter-attack himself. The ski troops come round the lakes through the forest.', spawn:'cav*2 17,0-22,2'},
      {day:4, team:1, say:'Night. The Soviet field kitchens are full of food. The Finns eat it.', heal:2},
      {day:5, team:2, say:'Soviet reinforcements arrive from Aittojoki.', spawn:'inf*3 29,6-33,14; tank 30,10'}]},
  suomussalmi:{name:'Suomussalmi', place:'The village of Suomussalmi and the forest roads round it', date:'27 December 1939, 06:00', theme:'winter', weather:'snow',
    p1:{nat:'fi', co:'siilasvuo', funds:0},
    p2:{nat:'su39', co:'meretskov', funds:0, u:{inf:{n:'163rd Rifle Division'}}},
    objective:{win:'hq', limit:12}, goal:'Cut the forest roads and take back Suomussalmi by {limit}. Forty degrees of frost are on your side.',
    brief:'The Soviet 163rd Division has driven across the narrow waist of Finland to cut the country in two, and taken the village of Suomussalmi. The Finns burned it before they left, so the Soviets are living in the open, in forty degrees of frost, in summer uniforms some of them, with no skis. Colonel Siilasvuo\'s men live in tents with stoves and move through the forest on skis like ghosts. Cut the roads behind the Soviets, chop their column into pieces, and take the village back.',
    clock:{start:'1939-12-27T06:00', step:120},
    build:() => { const b = MB(34, 22, 'T', 30303);
      b.rect(18, 4, 24, 17, '.').blobs('.', 3, 18, 4, 24, 17, 1, 2);                         // the frozen lake Kiantajärvi
      b.blobs('.', 5, 0, 0, 33, 21, 1, 1, ['T']);
      b.road([[33, 3], [26, 6], [24, 11], [20, 11], [0, 11]]).road([[24, 11], [30, 21]]);
      b.scatter('x', .5, 22, 9, 26, 13, ['.']);                                                 // the burned village
      b.put([[1, 11, 'Q'], [5, 4, 'C'], [5, 18, 'C'], [24, 11, 'q'], [23, 9, 'k'], [26, 13, 'k'], [31, 4, 'k'], [29, 19, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 1,2-9,19; cav*3 6,1-10,20; mortar*2 2,9-5,13; art 0,10; at*2 6,8-9,14',
      2:'inf*6 20,6-28,16; tank*2 24,8-27,13; art*2 26,4-30,16; mortar*2 22,8-25,14; nest*2 21,10-23,12; recon 28,6'},
    events:[{day:2, team:1, say:'Night. Forty-two degrees of frost. The Soviets have no shelter.', hurt:1},
      {day:3, team:1, say:'Ski troops cut the road to the north-east, behind the 163rd. Its supply is gone.', spawn:'cav*2 29,0-33,3'},
      {day:4, team:1, say:'Another night in the open for the Soviet division.', hurt:1},
      {day:5, team:2, say:'The 163rd tries to break out across the frozen lake.', spawn:'inf*3 18,15-23,18'},
      {day:6, team:1, say:'Night again, minus forty. Soviet soldiers are found frozen at their posts.', hurt:1},
      {day:8, team:1, say:'The cold does the Finns\' work for them.', hurt:1}]},
  raate:{name:'The Raate Road', place:'The forest road from Suomussalmi to the Soviet border', date:'1 January 1940, 07:00', theme:'winter', weather:'snow',
    p1:{nat:'fi', co:'siilasvuo', funds:0, u:{inf:{n:'Ski Battalion (9th Division)'}}},
    p2:{nat:'su39', co:'vinogradov', funds:0, u:{inf:{n:'44th Rifle Division', mv:2}, tank:{n:'T-26 (jammed on the road)', mv:3}, art:{mv:2}}},   /* a column nose to tail on one forest road, unable to turn */
    objective:{win:'kill', role:'tank', n:5, limit:5}, goal:'Motti: destroy five of the 44th Division\'s T-26s on the Raate road by {limit}.',
    whyText:{kill:'the 44th Division is destroyed', escape:'the tanks got away to the border'},
    brief:'The 44th Rifle Division, a motorised Ukrainian division of tanks, lorries, guns and horses, was sent to rescue the 163rd at Suomussalmi. It is now strung out along twenty miles of the narrow Raate road, nose to tail, in the forest, unable to turn round, its men burning anything they can find to stay alive. The Finns cut the road behind it. Now cut it into pieces, the motti, and destroy it piece by piece. Its tanks will try to get back to the border.',
    clock:{start:'1940-01-01T07:00', step:120},
    build:() => { const b = MB(34, 22, 'T', 30404);
      b.road([[0, 11], [8, 10], [16, 11], [24, 10], [33, 11]]);
      b.blobs('.', 6, 0, 0, 33, 21, 1, 1, ['T']).blobs('v', 3, 4, 0, 30, 21, 1, 1, ['T']);
      b.put([[1, 11, 'Q'], [5, 3, 'C'], [5, 19, 'C'], [14, 3, 'c'], [20, 19, 'c']]);
      return b.rows(); },
    units:{1:'inf*7 2,1-28,4; inf*4 2,17-28,21; cav*3 6,13-20,16; at*6 8,6-26,8; inf*2 28,8-30,14; mortar*2 3,8-6,13; art 1,10',
      2:'tank*6 8,9-26,12; inf*5 6,9-26,12; art*2 12,9-24,12; recon 14,9-24,12; mtank 20,10'},
    events:[{day:2, team:1, say:'The road is cut again at Kuomasjärvi. The column is in four pieces now.', spawn:'inf*2 18,13-22,16'},
      {day:3, team:1, say:'Night: minus forty. The Soviets burn their lorries to keep warm.', hurt:1},
      {day:4, team:2, say:'A Soviet ski battalion tries to open the road from the border.', spawn:'inf*3 30,6-33,15'},
      {day:5, team:1, say:'Another night in the forest for the 44th Division.', hurt:1},
      {day:7, team:1, say:'The 44th Division\'s horses have frozen to death in their harness.', hurt:1}]},
  kollaa:{name:'Kollaa', place:'The Kollaa river, north of Lake Ladoga', date:'17 February 1940, 07:00', theme:'winter', weather:'snow',
    p1:{nat:'fi', co:'teittinen', funds:0, u:{inf:{n:'Infantry Regiment 34', mv:3}, eng:{n:'Simo Häyhä', w:'Mosin-Nagant m/28, iron sights, no scope', snd:'enfield', pow:1.5, powArm:.2, cost:2500}}},
    p2:{nat:'su39', co:'meretskov', funds:0},
    objective:{win:'survive', days:8, hold:3, protect:'inf', protectN:4}, goal:'Kollaa holds: hold the river line until {survive}. If you are down to three infantry units, or lose three of your five positions, the line breaks.', persona:{2:'brawler'},
    brief:'On the Kollaa river a single Finnish regiment has held off a Soviet army for two months, at odds of ten to one. Ask anyone whether Kollaa will hold, and they say: "Kollaa holds, unless the orders are to run." Among the men here is a farmer from Rautjärvi, small, quiet, a hunter, who goes out alone in a white smock with a rifle with no telescope, so the sun will not flash on the lens. The Soviets call him Belaya Smert, the White Death.',
    clock:{start:'1940-02-17T07:00', step:120},
    build:() => { const b = MB(32, 22, 'T', 30505);
      b.river([[16, 0], [15, 7], [17, 14], [16, 21]], .1);
      b.blobs('.', 6, 0, 0, 31, 21, 1, 2, ['T']).blobs('^', 4, 4, 2, 14, 19, 1, 1, ['T', '.']);
      b.scatter('z', .3, 10, 2, 14, 19, ['.', 'T']);
      b.road([[0, 11], [31, 10]]).road([[2, 3], [6, 11], [3, 19]]);
      b.put([[2, 11, 'Q'], [12, 4, 'C'], [11, 16, 'C'], [7, 8, 'C'], [6, 14, 'C'], [26, 4, 'k'], [27, 17, 'k'], [30, 10, 'q']]);
      return b.rows(); },
    units:{1:'inf*6 8,2-14,19; eng 12,10; at*2 10,6-14,15; nest*3 12,3-14,18; mortar*2 6,8-9,13; art*2 2,7-4,14',
      2:'inf*12 18,1-28,20; tank*5 19,6-25,15; art*5 26,3-31,18; rkt 29,10; mortar*2 20,8-24,13; htank 22,10'},
    events:[{day:2, team:2, say:'The guns of the Soviet 8th Army fire 15,000 shells at a front of two miles.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'Fresh Soviet regiments, brought up from the Ukraine.', spawn:'inf*5 18,1-26,20'},
      {day:4, team:1, say:'The White Death is out on the river ice again.', hurt:1},
      {day:5, team:2, say:'Another assault, behind tanks.', spawn:'tank*3 18,5-24,16; inf*3 19,2-25,19'},
      {day:6, team:1, say:'A few Swedish volunteers and a battery of old guns come up.', spawn:'inf*2 2,9-5,13; art 1,12'}]},
  intermediate:{name:'Back to the Intermediate Line', place:'Summa, after the breakthrough', date:'13 February 1940, 06:00', theme:'winter', weather:'clear',
    p1:{nat:'fi', co:'oesterman', funds:0, u:{inf:{n:'3rd Division (rearguard)'}, cav:{n:'Ski Rearguard'}}},
    p2:{nat:'su39', co:'timoshenko', funds:0, u:{mtank:{n:'T-28 (20th Heavy Tank Brigade)'}}},
    objective:{win:'convoy', role:'inf', need:7, exit:[0, 0, 1, 21], limit:5}, goal:'The line is broken at Summa. Get seven infantry units back to the intermediate line (the west edge) by {limit}.',
    whyText:{convoy:'the division got back to the intermediate line', sunk:'the division was cut off and destroyed'},
    brief:'Timoshenko has done what Meretskov could not: after ten days of the heaviest bombardment since 1918, his tanks and infantry have broken the Mannerheim Line at Summa. The Finns have no reserves left; the men in the line have not slept for a week. The only hope is to get the army back, in order, to the half-built intermediate line before the Soviet tanks get round behind it. The ski rearguards and the last anti-tank guns will have to buy the time.',
    clock:{start:'1940-02-13T06:00', step:120},
    build:() => { const b = MB(34, 22, '.', 30606);
      b.blobs('T', 14, 0, 0, 33, 21, 1, 2).blobs('v', 2, 6, 0, 20, 21, 1, 1, ['.']);
      b.path([[26, 0], [26, 21]], (x, y) => b.set(x, y, 'x'));                                   // the smashed line
      b.road([[33, 11], [20, 10], [10, 11], [0, 10]]).road([[16, 0], [14, 21]]);
      b.put([[1, 10, 'Q'], [10, 4, 'c'], [10, 17, 'c'], [18, 10, 'c'], [31, 3, 'k'], [31, 18, 'k'], [32, 11, 'q']]);
      return b.rows(); },
    units:{1:'inf*12 14,2-22,19; cav*3 20,5-24,15; at*3 19,7-23,14; mortar 17,10; art*2 13,8-16,13',
      2:'mtank*2 28,4-33,16; tank*2 29,2-33,19; inf*6 28,1-33,20; art*4 31,5-33,16; recon*2 30,9-33,13'},
    events:[{day:1, team:2, say:'The Soviet guns fire again: 300,000 shells in one day.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'Soviet tanks get round the flank through the forest to the north.', spawn:'tank*3 18,0-24,3'},
      {day:3, team:1, say:'The last reserve, a battalion of the 23rd Division, holds the road open.', spawn:'inf*2 8,8-12,13; at 10,11'},
      {day:4, team:2, say:'More tanks come through the gap at Lähde.', spawn:'mtank*2 24,18-30,21'}]},
  viipuri:{name:'The Bay of Viipuri', place:'The shore of the frozen bay west of Viipuri', date:'11 March 1940, 06:00', theme:'winter', weather:'clear',
    p1:{nat:'fi', co:'mannerheim', funds:0, u:{inf:{n:'Coastal Brigade & Reservists', mv:3}}},
    p2:{nat:'su39', co:'timoshenko', funds:0, u:{inf:{n:'70th Rifle Division (across the ice)'}}},
    objective:{win:'survive', days:4, hold:3, protect:'inf', protectN:5}, goal:'Hold the shore until the ceasefire at 11:00 on 13 March. Keep at least five infantry units and three of your four positions.', persona:{2:'brawler'},
    whyText:{survive:'the guns fall silent at eleven o\'clock'},
    brief:'Finland has lost the war, and is negotiating in Moscow. The Soviets are trying to take as much as they can before the ceasefire: whole divisions are marching across the frozen bay of Viipuri, with tanks and guns on the ice, to get behind the city. Every Finnish man who can hold a rifle is on the shore. Peace has been signed. The guns will fall silent at eleven o\'clock on 13 March. Hold until then.',
    clock:{start:'1940-03-11T06:00', step:240},
    build:() => { const b = MB(32, 20, '.', 30707);
      b.rect(14, 0, 31, 19, '.').scatter('^', .05, 14, 0, 31, 19);                               // the frozen bay
      b.blobs('T', 8, 0, 0, 13, 19, 1, 2).rect(11, 0, 13, 19, 's');
      b.scatter('z', .3, 9, 2, 12, 17, ['.', 'T', 's']);
      b.road([[0, 10], [12, 10]]).road([[4, 0], [4, 19]]);
      b.put([[2, 10, 'Q'], [9, 4, 'C'], [9, 15, 'C'], [6, 10, 'C'], [28, 3, 'k'], [29, 16, 'k'], [30, 10, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 7,1-12,18; at*2 9,6-12,13; nest*3 10,3-12,16; mortar*2 5,6-8,13; art*2 1,7-3,13',
      2:'inf*14 15,1-26,18; tank*6 16,5-24,14; mtank*3 18,8-23,12; rkt 28,9; art*4 27,3-31,16; recon*2 22,1-26,4'},
    events:[{day:1, team:2, say:'The Soviet divisions come across the ice in long dark lines.', spawn:'inf*4 20,0-28,19'},
      {day:2, team:1, say:'Finnish guns break the ice under a Soviet column.', hurt:1},
      {day:2, team:2, say:'Soviet tanks reach the islands in the bay.', spawn:'tank*3 15,4-20,15'},
      {day:3, team:2, say:'One last assault before the ceasefire.', spawn:'inf*4 15,1-22,18'}]},
};
for (const [id, m] of Object.entries(WINTER_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  summa:{forces:['The Finnish 5th Division in the bunkers and trenches of the Mannerheim Line', 'The Soviet 7th Army: rifle divisions, T-26s, T-28s and prototype heavy tanks'],
    win:'The line holds. The Red Army is stopped on the Isthmus.', lose:'The line is broken at Summa.',
    real:'The December assaults on the Mannerheim Line failed with huge losses; on 17-19 December the Finns knocked out dozens of tanks at Summa, many with Molotov cocktails and satchel charges. Both the KV and SMK prototypes were tested there; the SMK hit a mine and was abandoned between the lines. The Red Army stopped its attacks on the Isthmus until February.'},
  tolvajarvi:{forces:['Group Talvela: about 4,000 men in a few battalions', 'The Soviet 139th Rifle Division, about 20,000 men'],
    win:'The first Finnish victory. The 139th Division is thrown back.', lose:'The Soviets hold the lakes.',
    real:'On 12 December 1939 Talvela attacked across the frozen lakes and the ridge between them, and after a day of confused, savage fighting, much of it with knives and grenades, took the Tolvajärvi hotel, the Soviet headquarters. The 139th Division retreated, losing about 4,000 men, and the Finns captured guns, tanks and the food in its field kitchens. It was Finland\'s first victory of the war, and it was celebrated across the country.'},
  suomussalmi:{forces:['The Finnish 9th Division under Siilasvuo, about 11,000 men', 'The Soviet 163rd Rifle Division'],
    win:'Suomussalmi is retaken and the 163rd Division is destroyed.', lose:'The Soviets hold the village.',
    real:'The Finns cut the 163rd Division\'s roads and destroyed it in pieces between 27 and 30 December 1939. The survivors fled across the frozen lakes, leaving their guns and vehicles behind. The Finns took Suomussalmi back, and turned at once against the 44th Division coming up the Raate road.'},
  raate:{forces:['The Finnish 9th Division\'s ski battalions', 'The Soviet 44th Rifle Division, about 17,000 men with tanks and guns'],
    win:'The 44th Division is destroyed on the Raate road.', lose:'The 44th Division breaks out to the border.',
    real:'Between 1 and 8 January 1940 the Finns cut the Raate road into mottis and destroyed the 44th Division. They captured 43 tanks, 70 guns and 1,200 horses; thousands of Soviet soldiers died, many of them frozen. The Finns lost about 400 dead. Vinogradov escaped and was shot by an NKVD firing squad in front of his men for losing the division.'},
  kollaa:{forces:['The Finnish 12th Division, above all the 34th Infantry Regiment', 'Several divisions of the Soviet 8th Army'],
    win:'Kollaa holds.', lose:'The Kollaa line is broken.',
    real:'Kollaa held until the end of the war. Simo Häyhä, a farmer and hunter from Rautjärvi, is credited with more than 500 kills there in less than a hundred days, most with an iron-sighted rifle. On 6 March 1940 an explosive bullet hit him in the jaw; he woke up a week later, on the day peace was declared. He lived to 96.'},
  intermediate:{forces:['The Finnish II Corps on the Isthmus, exhausted after a week of bombardment', 'Timoshenko\'s 7th Army, with heavy tank brigades'],
    win:'The army got back to the intermediate line, and held there.', lose:'The rearguards were cut off and the army broke.',
    real:'After the breakthrough at Summa on 11-13 February 1940, the Finns fell back in good order to the intermediate line, then to the rear line before Viipuri. The army bent but did not break. Finland had nothing left in reserve, and Mannerheim advised the government to make peace.'},
  viipuri:{forces:['Finnish coastal troops, reservists and the remnants of the Isthmus army', 'Soviet divisions crossing the frozen Bay of Viipuri'],
    win:'The shore holds until the ceasefire.', lose:'The Soviets are across the bay.',
    real:'The Moscow Peace Treaty was signed on 12 March 1940, and the fighting stopped at 11:00 the next day, still raging on the shores of the bay. Finland gave up a tenth of its territory, including Viipuri, its second city, and 400,000 people left their homes. But it kept its independence. About 25,000 Finns died; Soviet dead were at least 125,000. Hitler watched, and concluded the Red Army was weak.'},
});
Object.assign(CO_FATE, {
  mannerheim:'Led Finland through the Continuation War of 1941-44 and became President in 1944, taking the country out of the war. Died in Switzerland in 1951.',
  talvela:'Commanded corps in the Continuation War and was Finland\'s liaison to the German high command. Died in 1973.',
  siilasvuo:'Commanded the III Corps in the Continuation War and in the Lapland War against the Germans in 1944. Died in 1947.',
  teittinen:'Held Kollaa to the end of the Winter War.',
  oesterman:'Relieved of command of the Isthmus army on 19 February 1940. Died in 1975.',
  meretskov:'Arrested and tortured by the NKVD in 1941, then released to command fronts against Finland and Japan. Marshal of the Soviet Union. Died in 1968.',
  vinogradov:'Shot by firing squad in front of his men in January 1940 for losing his division.',
  timoshenko:'People\'s Commissar for Defence in 1941, and a front commander through the war. Died in 1970.',
  belyaev:'Removed from command after Tolvajärvi.',
});
Object.assign(MISSION_LONLAT, {summa:[28.9, 60.65], tolvajarvi:[31.65, 62.3], suomussalmi:[28.85, 64.88], raate:[29.6, 64.95], kollaa:[32.2, 62.15], intermediate:[28.6, 60.75], viipuri:[28.45, 60.6]});
EUROPE.cities.push(['Helsinki', 24.94, 60.17], ['Viipuri', 28.75, 60.71], ['Leningrad', 30.3, 59.94]);
CAMPAIGNS.push({id:'winterwar', name:'The Winter War', sub:'Finland against the Red Army · 1939–1940', side:'allies', missions:['summa', 'tolvajarvi', 'suomussalmi', 'raate', 'kollaa', 'intermediate', 'viipuri']});
