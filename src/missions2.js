/* ============================== NEW CAMPAIGNS =============================
   Fall Weiss and Fall Gelb (Germany 1939-40), the Eastern Front 1941-42, the
   war at sea, the Battle of the Atlantic, the Pacific (both sides) and China.
   Same map toolkit and unit-spec strings as maps.js. Side 1 is the player. */
const walls = (b, x0, y0, x1, y1, ch, gates) => { for (let x = x0; x <= x1; x++) { b.set(x, y0, ch); b.set(x, y1, ch); } for (let y = y0; y <= y1; y++) { b.set(x0, y, ch); b.set(x1, y, ch); } for (const [x, y] of gates || []) b.set(x, y, '='); };
const NEW_MISSIONS = {
  /* ---------------- Basic training ---------------- */
  training:{name:'Basic Training', place:'Salisbury Plain, Wiltshire', date:'May 1944', theme:'spring', weather:'clear',
    p1:{nat:'uk', co:'monty', funds:3000}, p2:{nat:'ger', co:'rommel', funds:0}, income:{2:0},
    objective:{win:'hq', limit:14}, goal:'Learn the drill, then capture the "enemy" HQ in the village by {limit}.',
    brief:'Every unit that went ashore in June trained for months on the ranges of southern England. Today\'s exercise: a company of the 50th Division against a few "German" positions played by the Home Guard. Click a unit to see where it can move (blue) and what it can hit (red). Click a square, then choose an order. Infantry capture towns and the HQ by standing on them. Your general\'s star meter fills as you fight; when it is full, use his power. Press H at any time for your adviser\'s suggestion.',
    clock:{start:'1944-05-10T08:00', step:60},
    build:() => { const b = MB(22, 14, '.', 1944);
      b.blobs(',', 6, 0, 0, 21, 13, 1, 2).blobs('T', 5, 6, 0, 21, 13, 1, 1).blobs('h', 4, 8, 0, 21, 13, 1, 1);
      b.road([[0, 7], [21, 7]]).road([[11, 0], [11, 13]]);
      b.town(18, 7, 3, 'k', 1, '.');
      b.put([[18, 7, 'q'], [1, 7, 'Q'], [2, 4, 'F'], [8, 3, 'c'], [8, 11, 'c'], [14, 4, 'c'], [14, 11, 'c'], [13, 6, 'B']]);
      return b.rows(); },
    units:{1:'inf*3 2,5-4,9; tank*2 3,6-4,8; art 1,8; recon 4,7; at 3,9', 2:'inf*2 15,5-17,9; nest 13,6; at 16,8; tank 17,6 6'},
    events:[{day:1, team:1, say:'Lesson one: move. Your recon car is fast but thin-skinned: use it to grab the towns at the crossroads. Infantry capture by standing on a town at the end of a move.'},
      {day:2, team:1, say:'Lesson two: fire. Artillery hits from two or three squares away but cannot move and fire in the same turn. Tanks are deadly against infantry but beware the anti-tank gun.'},
      {day:3, team:1, say:'Lesson three: cover. Woods, hedgerows and towns protect your men; the bunker on the road is worth taking out with artillery before you walk past it.'},
      {day:4, team:1, say:'Lesson four: the HQ. Put your infantry on the enemy HQ and keep them there until the capture count reaches zero. When the star meter is full, click your portrait or the power button.'}]},

  /* ---------------- Eastern Front 1941-42 ---------------- */
  moscow:{name:'The Gates of Moscow', place:'Tula to Venev, south of Moscow', date:'6 December 1941', theme:'winter', weather:'snow',
    p1:{nat:'su41', co:'zhukov', funds:3000}, p2:{nat:'ger40', co:'guderian', funds:0}, income:{2:.3},
    objective:{win:'hq', limit:18}, goal:'Drive the 2nd Panzer Army back from Tula and retake Venev by {limit}.',
    brief:'Guderian\'s panzers have looped round Tula and are reaching for Moscow from the south. Now the temperature has fallen to -35°C. German engines will not start, their rifles freeze, and they have no winter clothing. Zhukov has hoarded fresh Siberian divisions and General Belov\'s Cossack cavalry for this moment. At dawn the Red Army attacks for the first time in the war along the whole front.',
    clock:{start:'1941-12-06T06:00', step:720},
    build:() => { const b = MB(40, 26, '.', 4101);
      b.blobs('T', 30, 0, 0, 39, 25, 1, 2).blobs('^', 5, 10, 0, 39, 25, 1, 2, ['.']);
      b.river([[20, 0], [18, 12], [21, 25]], .25);
      b.road([[0, 13], [39, 13]]).road([[5, 0], [5, 25]]).road([[5, 13], [34, 4]]).road([[34, 0], [34, 25]]);
      b.town(5, 13, 5, 'C', 2, '.').town(34, 12, 3, 'k', 2, '.');
      b.put([[34, 12, 'q'], [2, 13, 'Q'], [3, 3, 'A'], [3, 22, 'F'], [37, 3, 'g'], [27, 20, 'c'], [26, 6, 'c'], [14, 20, 'c'], [13, 6, 'c']]);
      return b.rows(); },
    units:{1:'inf*6 3,8-9,18; cav*3 2,2-6,6; cav*2 2,20-6,24; mtank*3 6,10-9,16; htank 7,13; tank*2 6,6-9,9; art*2 1,10-3,16; rkt 2,12; at 8,12',
      2:'mtank*3 13,9-18,16; htank*2 22,11-26,14; tank*2 15,5-19,8; inf*6 12,4-20,22; at*2 14,10-17,15; art*2 28,9-32,16; inf*2 32,10-36,14; aa 30,13'},
    events:[{day:2, team:1, say:'-38°C. German tanks will not start and machine guns freeze solid. Frostbite casualties outnumber battle casualties.', hurt:1},
      {day:4, team:1, say:'Siberian divisions arrive from the Far East, in white snow suits, on skis.', spawn:'inf*3 0,10-2,16; htank 1,13'},
      {day:6, team:2, say:'Guderian pulls his frozen spearheads back without Hitler\'s permission.', spawn:'inf*2 36,8-39,16'}]},
  stalingrad:{name:'Stalingrad', place:'The factory district, Stalingrad', date:'14 October 1942', theme:'city', weather:'smoke',
    p1:{nat:'su41', co:'chuikov', funds:2000, u:{art:{n:'Heavy Artillery (east bank)', w:'122 and 152 mm guns', rng:[2,7], mt:'tire', mv:3}}}, p2:{nat:'ger40', co:'paulus', funds:4000}, income:{2:.5},
    objective:{win:'survive', days:12}, goal:'Hold a foothold on the west bank of the Volga until {survive}.',
    brief:'The Sixth Army\'s biggest assault yet falls on the Tractor Factory, the Barrikady gun works and the Red October steel plant. Chuikov\'s 62nd Army holds a strip of ruins a few hundred metres deep along the Volga. Every man and shell must cross the river at night under fire. Hug the enemy, so close that his Stukas cannot bomb you. Soviet guns on the east bank fire over the river.',
    clock:{start:'1942-10-14T05:00', step:240},
    build:() => { const b = MB(40, 26, 'x', 4202);
      b.blobs('U', 40, 4, 0, 32, 25, 1, 2).blobs('.', 6, 0, 0, 8, 25, 1, 2);
      b.rect(33, 0, 33, 25, 's').rect(34, 0, 37, 25, '~').rect(38, 0, 39, 25, '.');
      b.blobs('^', 2, 17, 12, 20, 15, 1, 2);
      b.road([[0, 13], [32, 13]]).road([[0, 4], [32, 4]]).road([[0, 21], [32, 21]]).road([[20, 0], [20, 25]]);
      b.put([[32, 13, 'Q'], [27, 15, 'B'], [24, 23, 'B'], [26, 3, 'F'], [27, 9, 'F'], [27, 18, 'F'], [33, 6, 'P'], [33, 20, 'P'], [20, 12, 'c'], [12, 6, 'k'], [12, 19, 'k'], [2, 13, 'q'], [1, 2, 'e'], [3, 23, 'g']]);
      return b.rows(); },
    units:{1:'inf*8 22,2-32,24; eng*2 24,8-30,18; at*2 22,10-28,16; mortar*2 28,6-32,20; nest 27,15; nest 24,4; nest 25,22; mtank*2 29,8-31,18; art*3 38,4-39,22; rkt 38,12',
      2:'inf*8 8,2-17,24; eng*3 10,6-16,20; tank*3 6,6-12,20; mtank*2 8,10-12,16; htank 9,13; art*3 2,6-5,20; mortar*2 12,4-16,22; bmr*2 1,2-3,4; at 12,13'},
    events:[{day:3, team:1, say:'Night crossing: Rodimtsev\'s 13th Guards Rifle Division crosses the Volga under fire.', spawn:'lc*3 35,4-36,22 +inf+inf'},
      {day:6, team:2, say:'Five fresh pioneer battalions are flown in for the assault on the factories.', spawn:'inf*4 0,6-3,20; eng*2 0,10-2,16'},
      {day:8, team:1, say:'The 39th Guards Rifle Division lands at the Red October plant.', spawn:'lc*2 35,8-36,18 +inf+at'},
      {day:9, team:2, say:'Paulus throws in his last reserves for a final assault on the riverbank.', spawn:'inf*4 0,6-3,20; tank*2 0,10-2,16; eng*2 0,8-2,18'}]},
  uranus:{name:'Operation Uranus', place:'The Don bend, Kletskaya to Kalach', date:'19 November 1942, 07:30', theme:'winter', weather:'fog',
    p1:{nat:'su41', co:'vatutin', funds:4000}, p2:{nat:'ger40', co:'paulus', funds:0,
      u:{inf:{n:'Romanian Infantry (3rd Army)', w:'ZB vz. 24 & ZB-30', snd:'bren', pow:.9}, at:{n:'Romanian 37 mm Bofors Team', w:'37 mm', snd:'gun37', pow:.8}, tank:{n:'R-2 (Panzer 35(t))', w:'37 mm', snd:'gun37', shape:'pz2', pow:.75}}},
    income:{2:.3}, objective:{win:'hq', limit:14}, goal:'Break the Romanian Third Army and seize the Don bridge at Kalach by {limit}.',
    brief:'While the Sixth Army bleeds in Stalingrad, its flanks are held by Romanians with few anti-tank guns. Codeword Uranus: at 07:30, in freezing fog, 3,500 guns open fire. Then two tank corps go through the gap and race 100 kilometres south-east for the bridge over the Don at Kalach. Take it and the Sixth Army is surrounded.',
    clock:{start:'1942-11-19T07:30', step:360},
    build:() => { const b = MB(44, 26, ',', 4303);
      b.blobs('.', 30, 0, 0, 43, 25, 1, 2).blobs('T', 8, 0, 0, 43, 25, 1, 1).blobs('^', 6, 14, 0, 36, 25, 1, 2, [',', '.']);
      b.river([[8, 0], [9, 12], [8, 25]], .2).river([[39, 0], [38, 13], [39, 25]], .15);
      b.road([[0, 8], [43, 14]]).road([[0, 18], [43, 14]]).road([[20, 0], [20, 25]]);
      b.rect(12, 2, 12, 23, 'z', [',', '.']).scatter('m', .3, 13, 2, 13, 23, [',', '.']);
      b.town(41, 14, 3, 'k', 1, '.');
      b.put([[41, 14, 'q'], [2, 12, 'Q'], [3, 3, 'F'], [3, 22, 'F'], [42, 3, 'g'], [26, 6, 'c'], [28, 20, 'c'], [17, 12, 'c'], [33, 10, 'c']]);
      return b.rows(); },
    units:{1:'inf*6 2,4-8,22; tank*4 1,6-7,10; mtank*4 1,14-7,20; htank*2 3,11-6,14; cav*2 1,2-4,5; art*3 0,8-2,18; rkt*2 0,11-2,15; at 6,12',
      2:'inf*8 11,2-15,24; at*2 12,6-14,18; tank*2 16,8-18,16; nest*3 12,4-12,22; art*2 18,10-21,16; mtank*2 24,10-28,16; htank 26,13; inf*2 38,12-42,16; aa 40,13'},
    events:[{day:3, team:2, say:'The 48th Panzer Corps counter-attacks. Half of 22nd Panzer\'s tanks will not start: mice have eaten the wiring in their straw-covered winter quarters.', spawn:'mtank*2 30,4-34,8'},
      {day:5, team:1, say:'Yeremenko\'s Stalingrad Front attacks from the south to meet you.', spawn:'mtank*3 30,23-36,25; inf*2 30,22-36,25'}]},

  /* ---------------- Fall Weiss: Poland 1939 ---------------- */
  mokra:{name:'Mokra', place:'Mokra, near Kłobuck', date:'1 September 1939, 07:00', theme:'poland', weather:'clear',
    p1:{nat:'ger40', co:'reinhardt', funds:2000}, p2:{nat:'pl', co:'filipowicz', funds:0}, income:{2:.3},
    objective:{win:'hq', limit:14}, goal:'Break the Wołyńska Cavalry Brigade\'s line on the railway embankment and take Mokra by {limit}.',
    brief:'The first day of the war. The 4th Panzer Division, with nearly 300 tanks, drives for Warsaw. In its path is one Polish cavalry brigade, dug in along a railway embankment with anti-tank rifles and 37 mm Bofors guns, with the armoured train Śmiały behind it. The uhlans fight dismounted, as infantry. This will not be the walkover your intelligence officers promised.',
    clock:{start:'1939-09-01T07:00', step:60},
    build:() => { const b = MB(36, 22, ',', 5101);
      b.blobs('.', 20, 0, 0, 35, 21, 1, 2).blobs('T', 10, 24, 0, 35, 21, 1, 2).blobs('T', 4, 0, 0, 18, 21, 1, 1);
      b.rect(21, 0, 21, 21, '^').road([[22, 0], [22, 21]]).road([[0, 11], [35, 11]]);
      b.town(27, 11, 4, 'k', 2, '.').town(8, 6, 3, 'c', 1, '.');
      b.put([[27, 11, 'q'], [1, 11, 'Q'], [2, 3, 'A'], [2, 19, 'F'], [34, 2, 'g'], [14, 17, 'c'], [16, 4, 'c'], [31, 18, 'c']]);
      return b.rows(); },
    units:{1:'tank*5 3,4-8,18; mtank*2 4,9-7,13; htank 5,11; recon*2 6,5-9,17; inf*5 2,3-8,19; apc 4,10 +inf+inf; art*2 1,7-2,15; bmr 1,2; at 7,11',
      2:'cav*4 21,2-23,20; at*3 21,4-22,18; inf*2 22,6-24,16; pak 21,10; pak 21,14; tank 25,9-27,13; recon*2 24,3-26,19; art*2 26,8-30,14'},
    events:[{day:4, team:1, say:'Stukas of StG 77 arrive over the embankment.', spawn:'bmr*2 0,3-2,6'}]},
  westerplatte:{name:'Westerplatte', place:'Westerplatte, Free City of Danzig', date:'1 September 1939, 04:45', theme:'poland', weather:'clear',
    p1:{nat:'ger40', co:'kleikamp', funds:3000, u:{bb:{n:'Schleswig-Holstein (pre-dreadnought)', w:'28 cm SK L/40', pow:.8, arm:.9, mv:2}}}, p2:{nat:'pl', co:'sucharski', funds:0},
    objective:{win:'hq', limit:20}, goal:'Take the Polish Military Transit Depot on Westerplatte by {limit}.',
    names:{1:{bb:['Schleswig-Holstein']}},
    brief:'At 04:45 the old battleship Schleswig-Holstein, on a "courtesy visit" to Danzig, opens fire on the Polish depot across the harbour canal: the first shots of the Second World War. Inside are 182 soldiers with one field gun, a few mortars and machine guns in concrete guardhouses hidden in the woods. Their orders are to hold for twelve hours. A company of naval infantry and the SS Heimwehr Danzig will storm the wall.',
    clock:{start:'1939-09-01T04:45', step:720},
    build:() => { const b = MB(32, 22, 'T', 5202);
      b.rect(0, 0, 31, 3, '~').rect(0, 0, 4, 21, '~').rect(5, 4, 31, 4, 's').rect(5, 4, 5, 21, 's');
      b.blobs('.', 12, 6, 5, 25, 20, 1, 2).rect(23, 5, 23, 21, 'w', ['T', '.']).rect(24, 5, 31, 21, '.');
      b.put([[10, 8, 'B'], [17, 7, 'B'], [12, 17, 'B'], [19, 15, 'B'], [21, 10, 'B'], [14, 12, 'q'], [29, 12, 'Q'], [30, 4, 'P'], [28, 19, 'F'], [8, 14, 'c'], [18, 19, 'c']]);
      b.road([[24, 12], [31, 12]]);
      return b.rows(); },
    units:{1:'bb 2,12; inf*5 25,6-30,20; eng*2 25,9-28,15; at 27,12; art*2 29,8-31,16; mortar*2 26,6-29,18; bmr*2 30,1-31,2',
      2:'nest 10,8; nest 17,7; nest 12,17; nest 19,15; nest 21,10; inf*4 9,6-20,19; mortar 13,11; pak 20,12; at 15,14'},
    events:[{day:3, team:1, say:'Danzig police and the SS Heimwehr reinforce the assault.', spawn:'inf*3 27,6-31,18'},
      {day:7, team:1, say:'Sixty Stukas bomb the peninsula. Guardhouse No. 5 is destroyed.', spawn:'bmr*2 29,0-31,2'}]},
  bzura:{name:'Battle of the Bzura', place:'The Bzura river, west of Warsaw', date:'9 September 1939', theme:'poland', weather:'clear',
    p1:{nat:'ger40', co:'manstein', funds:4000}, p2:{nat:'pl', co:'kutrzeba', funds:2000}, income:{2:.6},
    objective:{win:'hq', limit:18}, goal:'Absorb the Polish counter-stroke across the Bzura, then encircle Army Poznań and take Kutno by {limit}.',
    brief:'Army Poznań, bypassed in the race for Warsaw, has turned and struck south across the Bzura into the flank of the 8th Army. Your 30th Infantry Division is reeling. Manstein, chief of staff of Army Group South, sees the opportunity: hold the blow, then swing panzer divisions round from Warsaw and close the ring.',
    clock:{start:'1939-09-09T06:00', step:720},
    build:() => { const b = MB(44, 26, ',', 5303);
      b.blobs('.', 30, 0, 0, 43, 25, 1, 2).blobs('T', 14, 0, 0, 43, 25, 1, 2).blobs('T', 6, 38, 0, 43, 12, 1, 2).blobs('v', 6, 0, 9, 43, 13, 1, 1);
      b.river([[0, 11], [15, 12], [30, 10], [43, 12]], .2);
      b.road([[20, 0], [20, 25]]).road([[0, 6], [43, 6]]).road([[0, 19], [43, 19]]).road([[8, 0], [8, 25]]).road([[34, 0], [34, 25]]);
      b.town(20, 3, 4, 'k', 2, '.');
      b.put([[20, 3, 'q'], [20, 23, 'Q'], [3, 24, 'A'], [38, 23, 'F'], [6, 22, 'F'], [40, 2, 'g'], [4, 3, 'k'], [34, 8, 'k'], [14, 16, 'c'], [28, 16, 'c'], [12, 4, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 4,13-40,18; at*3 8,14-34,17; tank*3 16,20-24,24; mtank*2 18,21-22,24; htank 20,22; art*3 10,20-30,24; bmr*2 2,23-4,25; ftr 3,22; recon*2 6,15-38,16',
      2:'inf*10 2,4-42,10; cav*4 6,2-36,8; at*3 10,5-30,9; tank*2 18,3-22,6; recon*2 14,4-26,8; art*3 8,1-32,4; mortar*2 12,6-28,8; ftr 22,1'},
    events:[{day:4, team:1, say:'Panzer divisions swing back from Warsaw to close the ring, and the Luftwaffe is free of other tasks.', spawn:'tank*3 0,4-2,10; mtank*2 41,4-43,10; bmr*2 0,23-2,25'},
      {day:7, team:2, say:'Remnants break out through the Kampinos Forest towards Warsaw.', spawn:'cav*2 40,4-43,8'}]},
  warsaw39:{name:'Siege of Warsaw', place:'Ochota and Wola, Warsaw', date:'8 September 1939', theme:'city', weather:'smoke',
    p1:{nat:'ger40', co:'reinhardt', funds:4000}, p2:{nat:'pl', co:'jrommel', funds:1000}, income:{2:.5},
    objective:{win:'hq', limit:18}, goal:'Fight into Warsaw and take the city centre by {limit}.',
    brief:'The 4th Panzer Division reaches the south-western suburbs of Warsaw expecting to drive straight in. Instead the city has decided to fight. Trams are overturned as barricades, 37 mm guns wait at the street corners, and the mayor, Stefan Starzyński, broadcasts every night. Tanks in narrow streets are vulnerable. Bring up the siege guns.',
    clock:{start:'1939-09-08T06:00', step:1440},
    build:() => { const b = MB(40, 26, 'U', 5404);
      b.rect(0, 0, 7, 25, '.').blobs(',', 8, 0, 0, 7, 25, 1, 2).blobs('T', 4, 10, 0, 32, 25, 1, 1, ['U']);
      b.rect(34, 0, 35, 25, 'r').rect(36, 0, 39, 25, 'U');
      b.road([[0, 12], [39, 12]]).road([[0, 5], [33, 5]]).road([[0, 20], [33, 20]]).road([[16, 0], [16, 25]]).road([[26, 0], [26, 25]]);
      b.scatter('w', .08, 10, 0, 30, 25, ['U']);
      b.put([[28, 12, 'q'], [1, 12, 'Q'], [2, 2, 'A'], [2, 23, 'F'], [37, 3, 'g'], [20, 8, 'k'], [20, 17, 'k'], [12, 12, 'k'], [30, 4, 'k'], [30, 21, 'k'], [24, 23, 'f'], [23, 2, 'f']]);
      return b.rows(); },
    units:{1:'tank*4 1,6-5,18; mtank*3 2,8-5,16; htank 3,12; inf*6 1,3-7,22; eng*2 4,10-6,14; art*3 0,4-2,20; rkt 0,12; bmr*2 1,1-3,3; at 6,12',
      2:'inf*8 9,2-30,24; at*3 10,8-14,16; pak 11,12; pak 15,6; tank 18,11-20,13; art*2 27,6-31,18; mortar*2 16,4-22,20; aa 25,12; nest 10,4; nest 10,20; eng 14,12'},
    events:[{day:6, team:1, say:'Heavy siege guns and Stukas begin the bombardment of the city.', spawn:'bmr*2 0,1-2,3; rkt 0,8'},
      {day:10, team:1, say:'The waterworks are hit. Warsaw has no water and the fires cannot be fought.', hurt:1}]},

  /* ---------------- Fall Gelb: France 1940 ---------------- */
  eben:{name:'Fort Eben-Emael', place:'The Albert Canal, Belgium', date:'10 May 1940, 04:25', theme:'spring', weather:'clear',
    p1:{nat:'ger40', co:'student', funds:0}, p2:{nat:'be', co:'jottrand', funds:0},
    objective:{win:'kill', role:'pak', limit:8}, goal:'Destroy every gun turret and casemate on the fort with hollow charges by {limit}.',
    brief:'Eben-Emael is the strongest fort in the world: 1,200 men, 120 mm and 75 mm guns in steel turrets, covering the Albert Canal bridges into Belgium. Nobody has thought to defend its roof. At 04:25 nine gliders of Sturmgruppe Granit land on top of it with 78 pioneers and a secret weapon: the hollow charge, which blows a jet of molten metal through steel. You have until the garrison recovers and the neighbouring forts start shelling their own roof.',
    clock:{start:'1940-05-10T04:25', step:120},
    build:() => { const b = MB(30, 20, '.', 6101);
      b.blobs('T', 8, 0, 0, 29, 19, 1, 2).blobs(',', 6, 0, 0, 7, 19, 1, 2);
      b.rect(8, 3, 22, 16, '^'); walls(b, 8, 3, 22, 16, 'w');
      b.rect(23, 0, 24, 19, 'r').rect(25, 0, 29, 19, '.');
      b.road([[0, 10], [7, 10]]).road([[25, 10], [29, 10]]);
      b.put([[11, 6, 'B'], [19, 6, 'B'], [11, 14, 'B'], [19, 14, 'B'], [15, 10, 'q'], [2, 10, 'Q'], [27, 5, 'k'], [27, 15, 'k'], [4, 3, 'c'], [4, 17, 'c'], [28, 10, 'g']]);
      return b.rows(); },
    units:{1:'eng*5 10,7-20,13; inf*2 13,8-17,12; bmr 1,1',
      2:'pak 12,5; pak 18,5; pak 12,15; pak 18,15; nest 9,10; nest 21,10; nest 15,16; inf*3 14,9-16,11; inf*2 26,4-28,16; art 27,10'},
    events:[{day:4, team:2, say:'Belgian grenadiers counter-attack across the canal.', spawn:'inf*2 25,6-26,14'},
      {day:5, team:1, say:'Pionier-Bataillon 51 fights its way through to relieve Sturmgruppe Granit.', spawn:'inf*3 0,6-3,14; eng 1,10; at 2,9'}]},
  sedan:{name:'Sedan: the Meuse', place:'Sedan and the Marfée heights', date:'13 May 1940, 15:00', theme:'spring', weather:'clear',
    p1:{nat:'ger40', co:'guderian', funds:6000}, p2:{nat:'fr40', co:'huntziger', funds:0}, income:{2:.3},
    objective:{win:'hq', limit:18}, goal:'Cross the Meuse under the Stukas, storm the bunkers on the Marfée heights and take Bulson by {limit}.',
    brief:'Three panzer corps have come through the Ardennes, which the French thought impassable, in three days. At Sedan the Meuse is held by the 55th Division, middle-aged reservists in half-finished bunkers. Since 08:00 the Luftwaffe has bombed them non-stop. At 15:00 the infantry and assault pioneers cross in rubber boats. The bridges are down: your engineers must build a pontoon bridge before the tanks can follow.',
    clock:{start:'1940-05-13T15:00', step:120},
    build:() => { const b = MB(40, 26, '.', 6202);
      b.blobs('T', 14, 0, 12, 39, 25, 1, 2).blobs(',', 8, 0, 9, 39, 20, 1, 2).blobs('^', 6, 4, 12, 36, 16, 1, 2, ['.', ',', 'T']);
      b.river([[0, 8], [13, 9], [22, 7], [39, 8]], .15);
      b.road([[20, 0], [20, 25]]).road([[8, 0], [8, 25]]).road([[32, 0], [32, 25]]).road([[0, 20], [39, 20]]);
      b.rect(0, 5, 39, 11, 'r', ['b']);                      // the bridges have been blown
      b.town(20, 3, 6, 'C', 3, '.');
      b.put([[5, 10, 'B'], [11, 10, 'B'], [16, 10, 'B'], [24, 10, 'B'], [29, 10, 'B'], [35, 10, 'B'], [20, 11, 'B']]);
      b.scatter('w', .25, 2, 9, 37, 9, ['.', ',']);
      b.put([[20, 22, 'q'], [20, 1, 'Q'], [3, 2, 'A'], [36, 1, 'F'], [2, 24, 'g'], [37, 24, 'g'], [8, 17, 'c'], [32, 17, 'c'], [14, 24, 'c'], [27, 24, 'c']]);
      return b.rows(); },
    units:{1:'inf*8 2,4-37,6; eng*3 10,5-30,6; at*2 14,5-26,6; tank*3 16,1-24,3; mtank*3 6,1-12,3; htank*2 28,1-32,3; art*3 2,1-38,2; bmr*3 3,0-8,1; ftr 36,0',
      2:'nest 5,10; nest 11,10; nest 16,10; nest 24,10; nest 29,10; nest 35,10; pak 20,11; inf*6 3,11-37,14; at*2 10,13-30,15; art*3 4,18-36,22; mortar*2 12,12-28,14; aa 20,19; tank*2 18,23-22,25'},
    events:[{day:2, team:1, say:'Panic at Bulson: a rumour of German tanks sends the French gunners fleeing their guns.', hurt:1},
      {day:3, team:1, say:'More Stuka waves: StG 77 and StG 2 hammer the bunkers.', spawn:'bmr*2 0,0-4,1'},
      {day:5, team:2, say:'FCM 36 tanks of the 7e BCC counter-attack towards the bridgehead.', spawn:'tank*3 14,23-26,25'}]},
  montcornet:{name:'Montcornet', place:'Montcornet, Aisne', date:'17 May 1940, 04:45', theme:'spring', weather:'clear',
    p1:{nat:'ger40', co:'guderian', funds:2000}, p2:{nat:'fr40', co:'degaulle', funds:0},
    objective:{win:'survive', days:10}, goal:'Hold Guderian\'s supply road at Montcornet against de Gaulle\'s tanks until {survive}.',
    brief:'Your panzers have raced so far ahead that their flank is open. Colonel Charles de Gaulle, the French army\'s loudest prophet of tank warfare, has been given a half-formed armoured division four days ago. With no radios, no infantry worth the name and no air cover, he attacks anyway: Char B1s, the heaviest tanks in the West, coming for Montcornet. Your rear echelons must hold until help arrives.',
    clock:{start:'1940-05-17T04:45', step:90},
    build:() => { const b = MB(36, 22, ',', 6303);
      b.blobs('.', 20, 0, 0, 35, 21, 1, 2).blobs('T', 8, 0, 0, 35, 21, 1, 2);
      b.river([[0, 8], [35, 9]], .15);
      b.road([[0, 18], [24, 11], [35, 11]]).road([[24, 0], [24, 21]]);
      b.town(24, 11, 5, 'C', 2, '.');
      b.put([[24, 11, 'Q'], [2, 19, 'q'], [34, 2, 'A'], [34, 20, 'F'], [1, 2, 'g'], [12, 15, 'k'], [16, 5, 'c'], [30, 17, 'c']]);
      return b.rows(); },
    units:{1:'mtank*2 20,8-26,14; tank*3 18,6-28,16; inf*4 21,9-27,13; at*2 18,12-22,16; pak 20,14; art 28,10; aa 26,11; bmr*2 33,1-35,3; recon 22,17',
      2:'htank*4 2,13-8,19; mtank*3 4,12-9,18; tank*4 3,10-10,20; inf*2 2,16-5,20; art 1,18; recon 6,14'},
    events:[{day:3, team:1, say:'Stukas answer the call for help.', spawn:'bmr*2 33,0-35,2'},
      {day:5, team:2, say:'The rest of the 4e DCR arrives: more Char B1s.', spawn:'htank*2 0,15-2,20; tank*2 0,12-2,18'}]},
  arras:{name:'The Arras Counter-attack', place:'South of Arras', date:'21 May 1940, 14:30', theme:'spring', weather:'clear',
    p1:{nat:'ger40', co:'rommel', funds:1000}, p2:{nat:'uk40', co:'gort', funds:0},
    objective:{win:'survive', days:8}, goal:'Stop Frankforce\'s Matildas and hold the line from Wailly to Agny until {survive}.',
    brief:'The only Allied armoured counter-attack of the campaign. Two British tank battalions with 74 tanks, among them 16 Matilda IIs, strike the flank of Rommel\'s 7th Panzer Division and the SS Totenkopf south of Arras. Your 37 mm anti-tank guns bounce off the Matildas\' armour. Rommel is at the front himself, putting 88 mm flak guns and field howitzers into the line to fire over open sights.',
    clock:{start:'1940-05-21T14:30', step:60},
    build:() => { const b = MB(36, 22, ',', 6404);
      b.blobs('.', 20, 0, 0, 35, 21, 1, 2).blobs('T', 8, 0, 4, 35, 21, 1, 2);
      b.road([[0, 14], [35, 14]]).road([[10, 0], [10, 21]]).road([[25, 0], [25, 21]]);
      b.town(18, 2, 6, 'k', 3, '.');
      b.put([[18, 2, 'q'], [18, 20, 'Q'], [2, 20, 'F'], [34, 20, 'A'], [3, 1, 'g'], [33, 1, 'g'], [10, 10, 'c'], [25, 10, 'c'], [18, 14, 'c']]);
      return b.rows(); },
    units:{1:'inf*5 4,12-32,16; at*3 8,13-28,15; pak 10,12; pak 22,13; art*2 16,17-20,19; tank*3 14,18-22,20; mtank*2 4,18-8,20; htank 30,18; bmr*2 34,19-35,21',
      2:'mtank*5 6,3-30,6; tank*4 8,2-28,5; inf*4 10,4-26,7; at*2 12,5-24,6; recon*2 4,6-32,7; art*2 16,0-20,1; apc 18,4 +inf'},
    events:[{day:3, team:2, say:'The 6th Durham Light Infantry pushes in behind the tanks.', spawn:'inf*2 16,0-20,2'},
      {day:5, team:1, say:'Stukas break up the British attack.', spawn:'bmr*2 33,19-35,21'}]},
  dunkirk:{name:'Dunkirk', place:'The Dunkirk perimeter', date:'29 May 1940', theme:'holland', weather:'smoke',
    p1:{nat:'ger40', co:'rundstedt', funds:3000}, p2:{nat:'uk40', co:'gort', funds:0},
    objective:{win:'hq', limit:20}, goal:'Break the canal line and take the harbour mole before the evacuation ends, by {limit}.',
    brief:'The halt order of 24 May has cost you three days. In that time the BEF and the French First Army have built a perimeter behind the canals and flooded the polders. Now the Royal Navy and hundreds of little ships are lifting the trapped armies off the beaches and the East Mole. Every turn more men get away. Break through to the harbour before the last ship sails.',
    clock:{start:'1940-05-29T06:00', step:720},
    build:() => { const b = MB(40, 24, '.', 6505);
      b.blobs('h', 10, 0, 8, 39, 23, 1, 2).blobs('v', 10, 0, 9, 39, 16, 1, 2);
      b.rect(0, 0, 39, 3, '~').rect(0, 4, 39, 5, 's');
      b.river([[0, 14], [39, 13]], .1);
      b.road([[20, 6], [20, 23]]).road([[0, 9], [39, 9]]).road([[6, 6], [6, 23]]).road([[33, 6], [33, 23]]);
      b.rect(0, 12, 39, 15, 'r', ['b']); for (let y = 12; y <= 15; y++) if (b.get(20, y) === 'r') b.set(20, y, 'b');   // one bridge the rearguard has not managed to blow
      b.town(20, 7, 6, 'k', 3, '.');
      b.put([[20, 6, 'q'], [20, 22, 'Q'], [19, 4, 'o'], [2, 22, 'F'], [37, 22, 'F'], [3, 20, 'A'], [8, 8, 'k'], [32, 8, 'k'], [12, 17, 'c'], [28, 17, 'c']]);
      return b.rows(); },
    units:{1:'inf*8 2,16-37,20; eng*3 8,16-30,18; at*2 12,17-28,19; tank*3 4,19-12,22; mtank*2 26,19-34,22; art*3 6,21-34,23; bmr*3 2,22-6,23; ftr 37,23',
      2:'inf*6 2,10-37,13; at*2 10,11-30,12; nest 8,12; nest 20,12; nest 32,12; art*3 10,7-30,9; mortar*2 14,10-26,11; aa*2 18,7-22,8; dd 20,1; lc*3 6,2-34,3'},
    events:[{day:2, team:2, say:'The Little Ships arrive: yachts, ferries and fishing boats from every port in southern England.', spawn:'lc*3 4,1-36,3'},
      {day:4, team:2, say:'Hurricanes and Spitfires of 11 Group cover the beaches.', spawn:'ftr*2 18,0-22,2'}]},

  /* ---------------- The War at Sea ---------------- */
  riverplate:{name:'The River Plate', place:'Off the estuary of the River Plate', date:'13 December 1939, 06:14', theme:'atlantic', weather:'clear',
    p1:{nat:'uk40', co:'harwood', funds:0, u:{bb:{n:'HMS Exeter (York-class Heavy Cruiser)', w:'8 in Mk VIII', pow:.55, arm:1.15, mv:5, shape:'tribal'}, dd:{n:'Leander-class Light Cruiser', w:'6 in Mk XXIII', pow:.85}}},
    p2:{nat:'ger40', co:'langsdorff', funds:0, u:{bb:{n:'Panzerschiff Admiral Graf Spee', w:'28 cm SK C/28 & 15 cm', pow:1.05, arm:.6, mv:5}}},
    names:{1:{bb:['HMS Exeter'], dd:['HMS Ajax', 'HMNZS Achilles']}, 2:{bb:['Admiral Graf Spee']}},
    objective:{win:'kill', role:'bb', limit:12, escape:[1, 4, 6, 7]}, goal:'Sink the Admiral Graf Spee, or stop her reaching neutral Montevideo, by {limit}.',
    brief:'For three months the "pocket battleship" Admiral Graf Spee has sunk merchant ships across the South Atlantic. Commodore Harwood guessed she would come for the rich River Plate traffic, and he was right. His three cruisers are out-gunned: her 11-inch guns outrange them all. Harwood\'s answer is to split up, so she must divide her fire, and close in fast. If she is badly hurt she will run for Montevideo.',
    clock:{start:'1939-12-13T06:14', step:30},
    build:() => { const b = MB(34, 22, '~', 7101);
      b.rect(0, 0, 14, 2, '.').rect(0, 0, 3, 6, '.').rect(4, 3, 9, 3, 's').rect(0, 7, 1, 7, 's');
      b.put([[3, 4, 'p'], [6, 1, 'c'], [11, 1, 'c'], [1, 2, 'c']]);
      return b.rows(); },
    units:{1:'bb 26,14; dd 27,6; dd 29,8', 2:'bb 14,12'}},
  bismarck:{name:'Sink the Bismarck', place:'The North Atlantic, 550 miles west of Brest', date:'26 May 1941, 19:00', theme:'atlantic', weather:'rain',
    p1:{nat:'uk40', co:'tovey', funds:0}, p2:{nat:'ger40', co:'lutjens', funds:0, u:{bb:{pow:1.15, arm:.55, mv:3}}},
    names:{1:{bb:['HMS King George V', 'HMS Rodney'], cv:['HMS Ark Royal'], dd:['HMS Cossack', 'HMS Sikh', 'HMS Maori', 'HMS Zulu', 'ORP Piorun']}},
    objective:{win:'kill', role:'bb', limit:12, escape:[39, 0, 41, 25], flee:'always'}, goal:'Slow her down and sink the Bismarck before she reaches Luftwaffe cover off France, by {limit}.',
    brief:'Three days ago Bismarck sank HMS Hood with all but three of her 1,418 men. Then she gave the Home Fleet the slip. Now a Catalina has found her again, heading for Saint-Nazaire, and King George V and Rodney are too far behind and too short of fuel. Only Ark Royal\'s Swordfish, slow canvas biplanes, can slow her down. They have one chance before dark. Captain Vian\'s destroyers will shadow her through the night.',
    clock:{start:'1941-05-26T19:00', step:120},
    build:() => MB(42, 26, '~', 7202).rows(),
    units:{1:'cv 6,20; tb*3 7,16-10,19; bb 30,2; bb 33,4; dd*5 2,6-6,14', 2:'bb 18,11'}},
  midway:{name:'Midway', place:'North-east of Midway Atoll', date:'4 June 1942, 07:00', theme:'pacific', weather:'clear',
    p1:{nat:'usp', co:'spruance', funds:0}, p2:{nat:'jp', co:'nagumo', funds:0},
    names:{1:{cv:['USS Enterprise', 'USS Hornet', 'USS Yorktown']}, 2:{cv:['Akagi', 'Kaga', 'Sōryū', 'Hiryū'], bb:['Haruna', 'Kirishima']}},
    objective:{win:'kill', role:'cv', limit:12}, goal:'Find and sink the four carriers of the Kidō Butai by {limit}.',
    brief:'American codebreakers have read the Japanese plan. Nagumo\'s four carriers, the veterans of Pearl Harbor, are striking Midway this morning. They do not know that three American carriers are waiting to the north-east. Spruance launches everything early. Whoever finds the other\'s carriers first, with their decks full of fuelled and armed aircraft, will win the Pacific war.',
    clock:{start:'1942-06-04T07:00', step:60},
    build:() => { const b = MB(44, 28, '~', 7303);
      b.rect(36, 20, 40, 24, 'R').rect(37, 21, 39, 23, 's').put([[38, 22, 'A']]);
      return b.rows(); },
    units:{1:'cv 34,6; cv 36,9; cv 30,14; bmr*4 31,7-37,12; tb*2 33,10-35,13; ftr*3 32,5-36,8; dd*3 33,4-38,11; bmr 38,22',
      2:'cv*4 8,8-14,16; bb*2 12,6-16,18; dd*4 6,6-16,18; ftr*4 9,9-13,15; tb*2 6,10-8,14; bmr*2 6,12-8,16'}},
  ironbottom:{name:'Ironbottom Sound', place:'Between Guadalcanal and Savo Island', date:'14 November 1942, 23:00', theme:'pacific', weather:'clear',
    p1:{nat:'usp', co:'halsey', funds:0}, p2:{nat:'jp', co:'kondo', funds:0},
    names:{1:{bb:['USS Washington', 'USS South Dakota'], dd:['USS Walke', 'USS Benham', 'USS Preston', 'USS Gwin']}, 2:{bb:['Kirishima'], dd:['Atago', 'Takao', 'Nagara', 'Ayanami', 'Uranami', 'Shikinami', 'Hatsuyuki'], merch:['Kinugawa Maru', 'Yamatsuki Maru']}},
    objective:{win:'kill', role:'bb', limit:10}, goal:'In the dark, find and sink the battleship Kirishima before she can shell Henderson Field, by {limit}.',
    brief:'The sound off Guadalcanal is called Ironbottom Sound for all the ships already on its bed. Two nights ago American cruisers were cut to pieces here. Tonight Halsey sends in his last card: the new battleships Washington and South Dakota. Kondō is bringing Kirishima to shell Henderson Field, with a convoy of troop transports behind. The Japanese are masters of night fighting and their torpedoes outrange anything you have. But Washington has radar.',
    clock:{start:'1942-11-14T23:00', step:30},
    build:() => { const b = MB(36, 24, '~', 7404);
      b.rect(0, 19, 35, 23, 'J').rect(0, 18, 35, 18, 's').blobs('L', 6, 0, 19, 35, 23, 1, 2).put([[16, 20, 'A'], [20, 21, 'C']]);
      b.rect(2, 2, 5, 5, '^').rect(2, 6, 5, 6, 's');
      b.rect(22, 0, 35, 2, 'J').rect(22, 3, 35, 3, 's');
      return b.rows(); },
    units:{1:'bb 30,10; bb 31,13; dd*4 26,8-29,15', 2:'bb 4,10; dd*5 3,7-9,16 8; merch*2 1,12-2,16'}},
  samar:{name:'Off Samar', place:'East of Samar, Leyte Gulf', date:'25 October 1944, 06:45', theme:'pacific', weather:'rain',
    p1:{nat:'usp', co:'sprague', funds:0, u:{cv:{n:'Casablanca-class Escort Carrier', w:'Wildcats & Avengers', pow:.55, arm:1.25, mv:4, shape:'cve'}}}, p2:{nat:'jp', co:'kurita', funds:0, u:{bb:{n:'Centre Force Battleship', w:'18.1 in (Yamato), 16 in and 14 in guns', pow:1.1}}},
    names:{1:{cv:['USS Gambier Bay', 'USS St. Lo', 'USS Fanshaw Bay', 'USS Kalinin Bay', 'USS White Plains', 'USS Kitkun Bay'], dd:['USS Johnston', 'USS Hoel', 'USS Heermann'], esc:['USS Samuel B. Roberts', 'USS Dennis', 'USS Raymond', 'USS John C. Butler']},
      2:{bb:['Yamato', 'Nagato', 'Kongō', 'Haruna'], dd:['Chōkai', 'Chikuma', 'Haguro', 'Kumano', 'Suzuya', 'Tone', 'Yukikaze', 'Isokaze']}},
    objective:{win:'survive', days:8, protect:'cv', protectN:2}, goal:'Keep at least two escort carriers afloat until Kurita breaks off, {survive}.',
    brief:'Halsey has taken the fleet carriers north after a decoy. Nobody is guarding the San Bernardino Strait, and at dawn the lookouts of Taffy 3 see pagoda masts on the horizon: Kurita\'s battleships, Yamato among them. Six slow escort carriers and seven small escorts are all that stand between them and the Leyte beachhead. Make smoke, run for the rain squalls, launch every aircraft, and send the destroyers in.',
    clock:{start:'1944-10-25T06:45', step:20},
    build:() => { const b = MB(40, 26, '~', 7505);
      b.rect(0, 0, 2, 25, 'J').rect(3, 0, 3, 25, 's').blobs('L', 4, 0, 0, 2, 25, 1, 2).put([[1, 24, 'Q'], [1, 3, 'c']]);
      return b.rows(); },
    units:{1:'cv*6 14,19-26,24; dd*3 12,14-26,16; esc*4 10,16-28,22; ftr*2 16,20-22,22; tb*3 14,21-24,23', 2:'bb*4 10,1-30,3; dd*6 6,1-34,4'},
    events:[{day:3, team:2, say:'Kurita\'s heavy cruisers race ahead to cut off the carriers.', spawn:'dd*3 30,1-38,4'}]},

  /* ---------------- The Battle of the Atlantic ---------------- */
  hg76:{name:'Convoy HG 76', place:'North of the Azores', date:'17 December 1941, 09:00', theme:'atlantic', weather:'overcast',
    p1:{nat:'uk40', co:'walker', funds:0, u:{cv:{n:'HMS Audacity (Escort Carrier)', w:'Grumman Martlets', pow:.5, arm:1.3, shape:'cve'}, ftr:{n:'Grumman Martlet', w:'4x .50 cal', shape:'wildcat'}}},
    p2:{nat:'ger40', co:'donitz', funds:0, u:{bmr:{n:'Focke-Wulf Fw 200 Condor', w:'250 kg bombs', shape:'leo451', mv:9}}},
    names:{1:{cv:['HMS Audacity'], dd:['HMS Stanley', 'HMS Blankney', 'HMS Exmoor'], esc:['HMS Stork', 'HMS Deptford', 'HMS Rhododendron', 'HMS Convolvulus', 'HMS Pentstemon', 'HMS Samphire', 'HMS Vetch', 'HMS Marigold']}},
    objective:{win:'convoy', role:'merch', need:6, exit:[0, 0, 39, 1], limit:20}, goal:'Bring at least six of the nine merchant ships through to the north edge of the map.',
    brief:'Thirty-two ships out of Gibraltar for Britain, and the Germans know they are coming. Captain Walker has the 36th Escort Group and something new: HMS Audacity, a captured German banana boat with a flight deck welded on, carrying six Martlet fighters to shoot down the Condors that shadow convoys for the U-boats. Submerged U-boats are invisible until an escort\'s asdic finds them within two squares, or an aircraft or ship is alongside. A U-boat that fires gives itself away.',
    clock:{start:'1941-12-17T09:00', step:120},
    build:() => MB(40, 30, '~', 7601).rows(),
    units:{1:'merch*9 14,24-26,28; esc*6 10,19-30,28; dd*2 18,18-22,19; cv 20,28; ftr*2 19,26-21,27', 2:'sub*5 6,4-34,16; bmr 2,2'},
    events:[{day:3, team:2, say:'U-574 and U-567 join the pack.', spawn:'sub*2 4,6-36,14'},
      {day:5, team:2, say:'Another Condor shadows the convoy, homing in the U-boats.', spawn:'bmr 38,2'}]},
  ons5:{name:'Convoy ONS 5', place:'South of Greenland', date:'5 May 1943, 18:00', theme:'atlantic', weather:'fog',
    p1:{nat:'uk40', co:'gretton', funds:0}, p2:{nat:'ger40', co:'donitz', funds:0},
    objective:{win:'convoy', role:'merch', need:6, exit:[0, 0, 41, 1], limit:20}, goal:'Fight the convoy through the biggest wolf pack of the war: bring at least six of ten ships through.',
    brief:'Forty-three ships westbound in ballast, battered by a week of gales, straggling. Around them Dönitz has gathered more than forty U-boats, the largest concentration of the war. Commander Gretton\'s Escort Group B7 has radar the U-boats cannot detect. On the last night fog comes down, and the hunters become the hunted.',
    clock:{start:'1943-05-05T18:00', step:120},
    build:() => MB(42, 30, '~', 7602).rows(),
    units:{1:'merch*10 14,23-28,28; esc*8 10,19-32,29; dd*2 19,18-23,19', 2:'sub*6 4,2-38,12'},
    events:[{day:2, team:2, say:'More boats of Gruppe Fink close in. Fifteen are in contact.', spawn:'sub*3 2,8-40,14'},
      {day:4, team:1, say:'The 1st Escort Group arrives from St. John\'s.', spawn:'esc*2 18,29-24,29'}]},
  sixkills:{name:'Six in One Patrol', place:'The Western Approaches', date:'9 February 1944, 06:00', theme:'atlantic', weather:'overcast',
    p1:{nat:'uk40', co:'walker', funds:0, u:{esc:{n:'Black Swan-class Sloop', w:'hedgehog & depth charges', shape:'sloop', pow:1.1}, cv:{n:'HMS Activity (Escort Carrier)', w:'Swordfish', pow:.5, arm:1.3, shape:'cve'}}},
    p2:{nat:'ger', co:'donitz', funds:0},
    names:{1:{esc:['HMS Starling', 'HMS Wild Goose', 'HMS Woodpecker', 'HMS Kite', 'HMS Magpie', 'HMS Wren'], cv:['HMS Activity']}, 2:{sub:['U-762', 'U-734', 'U-238', 'U-424', 'U-264', 'U-386', 'U-406', 'U-592']}},
    objective:{win:'kill', role:'sub', limit:20}, goal:'Hunt down every U-boat in the area by {limit}.',
    brief:'Captain Walker\'s 2nd Support Group does not escort convoys; it hunts. His method is the "creeping attack": one sloop holds the U-boat on asdic and talks a second over it, dropping depth charges in silence so the U-boat never hears the attack coming. On this patrol the group will sink six U-boats, and the sloops return to Liverpool to cheering crowds, with Walker\'s signal hoisted: "Splice the mainbrace".',
    clock:{start:'1944-02-09T06:00', step:180},
    build:() => MB(40, 28, '~', 7603).rows(),
    units:{1:'esc*6 16,20-26,26; cv 21,27; tb*2 20,24-22,26', 2:'sub*6 4,2-36,14'},
    events:[{day:6, team:2, say:'Two more boats close in on convoys SL 147 and MKS 38.', spawn:'sub*2 2,4-38,10'}]},
  u505:{name:'The Capture of U-505', place:'Off Cape Blanco, French West Africa', date:'4 June 1944, 11:00', theme:'pacific', weather:'clear',
    p1:{nat:'us', co:'gallery', funds:0}, p2:{nat:'ger', co:'donitz', funds:0},
    names:{1:{cv:['USS Guadalcanal'], esc:['USS Pillsbury', 'USS Chatelain', 'USS Jenks', 'USS Pope', 'USS Flaherty']}, 2:{sub:['U-505', 'U-515', 'U-68']}},
    objective:{win:'kill', role:'sub', limit:14}, goal:'Find and destroy the U-boats operating off West Africa by {limit}.',
    brief:'Task Group 22.3: the escort carrier Guadalcanal and five destroyer escorts. Captain Gallery has drilled boarding parties for weeks, with a crazy plan: when a U-boat is forced to the surface, his men will jump aboard before she can be scuttled, and capture her codebooks and Enigma machine. First he has to find one.',
    clock:{start:'1944-06-04T11:00', step:120},
    build:() => { const b = MB(40, 28, '~', 7604); b.rect(37, 0, 39, 27, '.').rect(36, 0, 36, 27, 's').put([[38, 14, 'c']]); return b.rows(); },
    units:{1:'cv 20,24; esc*5 14,18-26,22; tb*2 18,22-22,24; ftr 20,21', 2:'sub*3 6,2-34,10'}},

  /* ---------------- The Pacific War ---------------- */
  wake:{name:'Wake Island', place:'Wake Atoll, Central Pacific', date:'11 December 1941, 05:00', theme:'pacific', weather:'clear',
    p1:{nat:'usp', co:'devereux', funds:0}, p2:{nat:'jp', co:'yamamoto', funds:0, u:{bb:{n:'Light Cruiser Yūbari', w:'14 cm guns', pow:.5, arm:1.2, mv:5}}},
    names:{2:{bb:['Yūbari'], dd:['Hayate', 'Kisaragi', 'Oite', 'Yayoi', 'Mutsuki', 'Mochizuki'], merch:['Kongō Maru', 'Konryū Maru']}},
    objective:{win:'survive', days:10}, goal:'Beat off the invasion force until {survive}.',
    brief:'Four days after Pearl Harbor, Rear Admiral Kajioka\'s invasion force arrives off Wake: a cruiser, six destroyers and transports with the Special Naval Landing Force. Japanese bombers have already destroyed most of the Marines\' Wildcats on the ground. Major Devereux orders his gunners to hold their fire until the ships close to point-blank range for the landing. Then the 5-inch guns open up.',
    clock:{start:'1941-12-11T05:00', step:60},
    build:() => { const b = MB(34, 24, '~', 8101);
      b.rect(6, 7, 28, 18, 'R').rect(8, 9, 26, 16, '.').rect(12, 9, 21, 13, '~').rect(8, 16, 26, 16, 's');
      b.scatter('L', .25, 8, 9, 26, 15, ['.']);
      b.put([[17, 15, 'A'], [14, 15, 'Q'], [24, 10, 'C'], [9, 10, 'C']]);
      return b.rows(); },
    units:{1:'pak 10,16; pak 25,16; pak 24,9; nest*3 9,9-26,16; inf*4 12,14-22,16; aa*2 16,14-20,15; ftr*2 17,14-19,15; art 14,15',
      2:'bb 16,2; dd*6 4,2-30,5; merch*2 12,3-20,4; lc*4 6,4-28,6 +inf+inf'},
    events:[{day:3, team:2, say:'Bombers from Kwajalein attack the island again.', spawn:'bmr*2 2,0-6,1'},
      {day:4, team:2, say:'The destroyers close in to cover a landing.', spawn:'dd*2 4,0-30,2'},
      {day:6, team:2, say:'Kajioka orders the landing force to press on.', spawn:'lc*3 8,3-24,5 +inf+eng'}]},
  henderson:{name:'Edson\'s Ridge', place:'South of Henderson Field, Guadalcanal', date:'12 September 1942, 21:00', theme:'tropic', weather:'clear',
    p1:{nat:'usp', co:'vandegrift', funds:1000}, p2:{nat:'jp', co:'kawaguchi', funds:0},
    objective:{win:'survive', days:10}, goal:'Hold the ridge and Henderson Field until {survive}.',
    brief:'Henderson Field is the reason for the whole Guadalcanal campaign: whoever holds it holds the air over the Solomons. General Kawaguchi has marched 6,000 men through the jungle to attack it from the south, where nobody expects him. Between them and the airfield is a grassy ridge held by Colonel Merritt Edson\'s Raiders and paratroopers. The attack will come at night.',
    clock:{start:'1942-09-12T21:00', step:120},
    build:() => { const b = MB(36, 26, 'J', 8202);
      b.rect(0, 0, 35, 1, '~').rect(0, 2, 35, 2, 's').rect(6, 3, 30, 7, '.').scatter('L', .2, 6, 3, 30, 7, ['.']);
      b.rect(15, 8, 20, 18, '^', ['J']);
      b.river([[10, 2], [9, 14], [11, 25]], .2);
      b.road([[18, 3], [18, 19]]).road([[6, 5], [30, 5]]);
      b.put([[18, 4, 'A'], [22, 3, 'Q'], [28, 4, 'C'], [8, 4, 'C'], [18, 24, 'q'], [6, 22, 'k'], [30, 22, 'k']]);
      return b.rows(); },
    units:{1:'inf*4 15,8-20,14; eng 17,9; mortar*2 16,6-20,7; art*2 14,4-22,6; at 18,12; nest*2 16,10-19,12; ftr*2 17,4-19,5; bmr 18,3; inf*2 6,5-30,6; tank 20,6',
      2:'inf*10 6,18-30,24; eng*2 12,20-24,22; mortar*3 10,21-26,23; art*2 16,23-20,25; inf*3 2,6-4,12; inf*3 32,6-34,12'},
    events:[{day:2, team:2, say:'Kawaguchi\'s battalions come out of the jungle onto the ridge.', spawn:'inf*4 12,16-24,19'},
      {day:5, team:1, say:'The 2nd Battalion, 5th Marines reinforce the ridge.', spawn:'inf*2 16,6-20,7'},
      {day:4, team:2, say:'A second battalion attacks the eastern flank along the Tenaru.', spawn:'inf*4 30,8-35,14; mortar 32,12'},
      {day:6, team:2, say:'A last charge at dawn.', spawn:'inf*3 14,18-22,20'}]},
  tarawa:{name:'Tarawa', place:'Betio Island, Tarawa Atoll', date:'20 November 1943, 09:00', theme:'pacific', weather:'clear',
    p1:{nat:'usp', co:'hsmith', funds:3000, u:{bb:{n:'USS Maryland (Colorado class)', w:'16 in/45 guns'}}}, p2:{nat:'jp', co:'shibasaki', funds:0},
    names:{1:{bb:['USS Maryland']}},
    objective:{win:'hq', limit:20}, goal:'Cross the reef, get a foothold on Red Beach and take Shibasaki\'s blockhouse by {limit}.',
    brief:'Betio is two miles long and nowhere higher than ten feet: 4,800 defenders in coconut-log pillboxes, behind a seawall, with 8-inch guns bought from the British. The tide is wrong. The Higgins boats will run aground on the reef, and the Marines will have to wade 500 yards to the beach under fire. Only the first waves have amtracs that can crawl over the coral.',
    clock:{start:'1943-11-20T09:00', step:240},
    build:() => { const b = MB(40, 24, '~', 8303);
      b.rect(2, 6, 38, 8, 'R').rect(2, 16, 38, 17, 'R').rect(4, 9, 36, 15, 'L').scatter('.', .4, 4, 9, 36, 15, ['L']);
      b.rect(4, 9, 36, 9, 's').rect(4, 15, 36, 15, 's').rect(10, 12, 30, 12, '=');
      b.put([[20, 6, 'b'], [20, 7, 'b'], [20, 8, 'b']]);
      b.scatter('B', .08, 5, 10, 35, 14, ['L', '.']).scatter('w', .3, 5, 10, 35, 10, ['L', '.']);
      b.put([[27, 13, 'q'], [18, 12, 'e'], [8, 12, 'k'], [33, 12, 'k'], [13, 14, 'k'], [24, 10, 'k']]);
      return b.rows(); },
    units:{1:'apc*5 8,1-32,3 +inf+inf; lc*5 6,3-34,5 +inf+inf; lc*2 14,4-26,5 +mtank+mtank; bb 4,1; dd*2 30,1-34,2; bmr*2 36,0-38,1; ftr 2,0',
      2:'nest*6 6,10-34,10; pak 5,12; pak 35,12; inf*5 8,11-32,14; at*2 14,11-26,13; tank*2 16,13-24,14; mortar*2 12,12-28,13; art 22,13; aa 18,13'},
    events:[{day:2, team:1, say:'The 1st Battalion, 8th Marines wades in from the reef.', spawn:'lc*3 10,4-30,5 +inf+inf'},
      {day:4, team:1, say:'Shermans and pack howitzers come ashore over the long pier.', spawn:'lc*2 18,4-22,5 +mtank+art'},
      {day:5, team:2, say:'Night counter-attack on the eastern end of the island.', spawn:'inf*3 30,11-35,14'}]},
  iwo:{name:'Iwo Jima', place:'Mount Suribachi and the landing beaches', date:'19 February 1945, 09:00', theme:'volcanic', weather:'clear',
    p1:{nat:'usp', co:'hsmith', funds:3000}, p2:{nat:'jp', co:'kuribayashi', funds:0},
    objective:{win:'hq', limit:18}, goal:'Land on the black sand, cut across the neck and raise the flag on Mount Suribachi by {limit}.',
    brief:'Eight square miles of volcanic ash, needed as an emergency field for B-29s. General Kuribayashi has dug 11 miles of tunnels and forbidden wasteful banzai charges: his men will stay underground and kill ten Americans each. The beaches are soft black ash that bogs down vehicles, under the guns of Mount Suribachi. Seventy-four days of bombing have hardly touched the defences.',
    clock:{start:'1945-02-19T09:00', step:360},
    build:() => { const b = MB(40, 26, '.', 8404);
      b.rect(0, 0, 39, 1, '~').rect(0, 20, 39, 25, '~').rect(0, 18, 39, 19, 's').rect(0, 0, 0, 25, '~');
      b.rect(2, 9, 8, 17, '^').scatter('B', .15, 1, 8, 9, 17, ['^']).scatter('x', .15, 10, 2, 38, 16, ['.']);
      b.rect(10, 17, 38, 17, 'n').road([[10, 12], [38, 12]]);
      b.scatter('B', .06, 10, 2, 38, 16, ['.', 'x']);
      b.put([[5, 12, 'q'], [20, 12, 'e'], [30, 8, 'k'], [34, 14, 'k'], [14, 6, 'k'], [26, 4, 'g']]);
      return b.rows(); },
    units:{1:'apc*6 10,21-36,22 +inf+inf; lc*4 12,23-34,24 +mtank+inf; lc*2 18,23-26,24 +htank+eng; bb 6,24; bb 38,23; dd*2 20,25-30,25; bmr*2 38,20-39,21; ftr 1,22',
      2:'nest*6 10,14-36,16; pak*2 3,16-8,17; art*2 3,10-8,15; mortar*3 12,6-30,10; inf*6 10,4-36,15; at*2 14,8-28,12; tank*2 22,6-26,8; inf*3 3,9-8,16; aa 20,11'},
    events:[{day:2, team:1, say:'The 28th Marines cut across the neck below Suribachi.', spawn:'apc*2 8,21-14,22 +inf+inf'},
      {day:4, team:2, say:'Kuribayashi\'s hidden guns in the north open fire on the beaches.', spawn:'art*2 30,2-36,6'}]},
  okinawa:{name:'Okinawa: the Shuri Line', place:'Sugar Loaf Hill and Shuri Castle', date:'12 May 1945', theme:'tropic', weather:'rain',
    p1:{nat:'usp', co:'buckner', funds:4000}, p2:{nat:'jp', co:'ushijima', funds:0},
    objective:{win:'hq', limit:18}, goal:'Take Sugar Loaf Hill and break through to Shuri Castle by {limit}.',
    brief:'The last great battle of the Pacific war. Ushijima let the Americans land unopposed and dug in on the ridges around the old royal castle of Shuri. Sugar Loaf, a hill 300 yards long, will change hands eleven times in a week. The rain has turned the island to mud, and offshore the kamikazes are attacking the fleet.',
    clock:{start:'1945-05-12T06:00', step:720},
    build:() => { const b = MB(40, 26, '.', 8505);
      b.rect(0, 0, 1, 25, '~').rect(2, 0, 2, 25, 's');
      b.blobs('^', 18, 8, 0, 39, 25, 1, 2).blobs('x', 10, 8, 0, 39, 25, 1, 1).blobs('y', 6, 3, 0, 20, 25, 1, 2).blobs('L', 8, 3, 0, 39, 25, 1, 2);
      b.town(28, 12, 4, 'k', 3, 'x');
      b.road([[3, 12], [32, 12]]).road([[8, 0], [8, 25]]);
      b.put([[32, 12, 'q'], [5, 12, 'Q'], [4, 3, 'F'], [4, 22, 'F'], [6, 7, 'A'], [16, 8, 'B'], [17, 9, 'B'], [24, 6, 'B'], [24, 18, 'B'], [20, 13, 'B']]);
      return b.rows(); },
    units:{1:'inf*8 4,3-10,22; eng*2 6,8-9,16; mtank*3 5,6-9,18; htank*2 6,10-8,14; art*3 3,4-5,20; rkt 4,12; bb 0,8; dd 0,16; bmr*2 5,1-7,2; ftr 6,24',
      2:'inf*10 14,2-36,24; nest*4 15,7-25,19; pak*2 18,8-22,16; art*3 30,6-36,18; mortar*3 18,4-28,20; at*2 16,10-24,14; tank 28,11'},
    events:[{day:3, team:2, say:'Kikusui: waves of kamikazes attack the fleet offshore.', spawn:'bmr*3 38,0-39,4'},
      {day:6, team:2, say:'Ushijima counter-attacks from Shuri.', spawn:'inf*3 30,4-36,20'}]},

  /* ---------------- The Rising Sun: Japan 1941-42 ---------------- */
  pearl:{name:'Pearl Harbor', place:'Battleship Row, Oahu', date:'7 December 1941, 07:55', theme:'pacific', weather:'clear',
    p1:{nat:'jp', co:'nagumo', funds:0}, p2:{nat:'usp', co:'kimmel', funds:0, u:{bb:{n:'Standard-type Battleship', w:'14 in and 16 in guns', pow:.9}}},
    names:{2:{bb:['USS Arizona', 'USS Oklahoma', 'USS West Virginia', 'USS California', 'USS Nevada', 'USS Tennessee', 'USS Maryland', 'USS Pennsylvania']}},
    objective:{win:'kill', role:'bb', n:5, limit:6}, goal:'Torpedo and bomb the battleships moored along Battleship Row: put five out of action by {limit}.',
    brief:'Six carriers have crossed the North Pacific in radio silence. The first wave, 183 aircraft under Commander Fuchida, comes in over Oahu on a quiet Sunday morning. Eight battleships of the Pacific Fleet are moored in pairs beside Ford Island. The torpedoes have been fitted with wooden fins to run in the shallow harbour. "Tora! Tora! Tora!" Surprise has been achieved. But the American carriers are not in port.',
    clock:{start:'1941-12-07T07:55', step:30},
    build:() => { const b = MB(40, 26, '.', 9101);
      b.blobs('^', 6, 0, 0, 39, 6, 1, 2).blobs('L', 10, 0, 0, 39, 21, 1, 2);
      b.rect(8, 8, 32, 18, '~').rect(16, 11, 23, 15, '.').rect(18, 19, 21, 25, '~').rect(0, 22, 39, 25, '~').rect(0, 21, 17, 21, 's').rect(22, 21, 39, 21, 's');
      b.put([[20, 13, 'e'], [28, 20, 'e'], [12, 3, 'e'], [33, 14, 'o'], [5, 12, 'k'], [35, 4, 'k'], [6, 19, 'k']]);
      return b.rows(); },
    units:{1:'tb*6 10,0-30,2; bmr*6 6,1-34,3; ftr*5 8,0-32,2',
      2:'bb*8 24,9-26,16 !; dd*3 10,9-14,17; aa*4 8,6-34,20; ftr*2 12,4-13,5'},
    events:[{day:3, team:2, say:'Lieutenants Welch and Taylor get two P-40s off the ground at Haleiwa.', spawn:'ftr 2,2'},
      {day:4, team:1, say:'The second wave: 167 aircraft under Lieutenant Commander Shimazaki.', spawn:'bmr*3 8,0-30,2; ftr*2 10,0-28,1'}]},
  kotabharu:{name:'Kota Bharu', place:'Sabak and Badang beaches, Kelantan', date:'8 December 1941, 00:30', theme:'tropic', weather:'rain',
    p1:{nat:'jp', co:'yamashita', funds:0, u:{bb:{n:'Light Cruiser Sendai', w:'14 cm guns', pow:.6, arm:1.2, mv:5}}}, p2:{nat:'uk40', co:'percival', funds:0, u:{bmr:{n:'Lockheed Hudson (RAAF)', w:'250 lb bombs', shape:'leo451'}, inf:{n:'3/17th Dogra Regiment', w:'SMLE & Bren', snd:'bren'}}},
    names:{1:{merch:['Awazisan Maru', 'Ayatosan Maru', 'Sakura Maru']}},
    objective:{win:'hq', limit:16}, goal:'Land on the beaches under fire and take Kota Bharu airfield by {limit}.',
    brief:'An hour before the bombs fall on Pearl Harbor, the Takumi Detachment lands at Kota Bharu in northern Malaya: the first shots of the Pacific war. The sea is rough, the beaches are wired and mined, and the Dogras are waiting in pillboxes. RAAF Hudsons from the airfield will attack the transports. Take the airfield, and the RAF in northern Malaya is finished.',
    clock:{start:'1941-12-08T00:30', step:120},
    build:() => { const b = MB(36, 24, 'L', 9202);
      b.rect(0, 0, 35, 5, '~').rect(0, 6, 35, 6, 's').scatter('w', .2, 0, 7, 35, 7, ['L']).scatter('m', .1, 0, 8, 35, 8, ['L']);
      for (const x of [4, 10, 16, 22, 28, 33]) b.set(x, 8, 'B');
      b.blobs('y', 8, 0, 9, 35, 23, 1, 2).blobs('J', 6, 0, 12, 35, 23, 1, 2);
      b.river([[12, 6], [13, 15], [11, 23]], .2);
      b.road([[18, 9], [18, 23]]).road([[0, 16], [35, 16]]);
      b.town(28, 16, 4, 'k', 2, '.');
      b.put([[18, 18, 'q'], [5, 20, 'k'], [30, 22, 'k'], [24, 11, 'c'], [8, 13, 'c']]);
      return b.rows(); },
    units:{1:'merch*3 10,1-26,2; lc*8 4,4-32,5 +inf+inf; lc*2 14,4-20,5 +eng+inf; dd*3 2,2-34,3; bb 18,1; bmr*2 16,0-20,0',
      2:'nest*4 4,8-33,8; inf*4 6,9-30,14; at 18,12; art*2 16,19-22,21; mortar 10,10-26,12; bmr*2 17,19-20,21; aa 19,18; recon 24,15'},
    events:[{day:3, team:1, say:'The second wave lands.', spawn:'lc*3 6,4-30,5 +inf+inf'}]},
  forcez:{name:'Force Z', place:'Off Kuantan, South China Sea', date:'10 December 1941, 11:00', theme:'tropic', weather:'clear',
    p1:{nat:'jp', co:'yamamoto', funds:0, u:{tb:{n:'Mitsubishi G4M "Betty"', w:'Type 91 aerial torpedo', shape:'kate', mv:9}, bmr:{n:'Mitsubishi G3M "Nell"', w:'250 kg bombs', shape:'sb2'}}},
    p2:{nat:'uk40', co:'phillips', funds:0},
    names:{2:{bb:['HMS Prince of Wales', 'HMS Repulse'], dd:['HMS Electra', 'HMS Express', 'HMS Tenedos', 'HMAS Vampire']}},
    objective:{win:'kill', role:'bb', limit:8}, goal:'Find Force Z and sink HMS Prince of Wales and HMS Repulse by {limit}.',
    brief:'Churchill sent the new battleship Prince of Wales and the old battlecruiser Repulse to Singapore to deter Japan. Admiral Phillips has taken them north to attack the landings, without fighter cover. Land-based bombers of the 22nd Air Flotilla have found them off Kuantan. No battleship at sea and under way has ever been sunk by aircraft.',
    clock:{start:'1941-12-10T11:00', step:30},
    build:() => { const b = MB(40, 24, '~', 9303); b.rect(0, 0, 2, 23, 'J').rect(3, 0, 3, 23, 's').put([[1, 12, 'c']]); return b.rows(); },
    units:{1:'tb*6 30,0-38,4; bmr*4 34,2-39,6', 2:'bb 14,12; bb 16,14; dd*4 10,9-20,17'},
    events:[{day:6, team:2, say:'Brewster Buffaloes of No. 453 Squadron RAAF arrive, an hour too late.', spawn:'ftr*2 4,10-6,14'}]},
  slimriver:{name:'Slim River', place:'The trunk road, Trolak to Slim River bridge', date:'7 January 1942, 03:30', theme:'tropic', weather:'rain',
    p1:{nat:'jp', co:'yamashita', funds:0}, p2:{nat:'uk40', co:'percival', funds:0, u:{inf:{n:'2nd Argyll & Sutherland Highlanders', w:'SMLE & Bren', snd:'bren'}, at:{n:'QF 2-pounder Anti-tank Gun', w:'40 mm', snd:'gun37', pow:.9}}},
    objective:{win:'hq', limit:16}, goal:'Drive the tanks down the trunk road through the 11th Indian Division and seize the Slim River bridge by {limit}.',
    brief:'Major Shimada has a company of tanks and an idea: instead of the usual outflanking march through the jungle, go straight down the road, at night, in the rain. The British are exhausted, and their anti-tank guns are parked by the roadside. A handful of tanks could smash a whole division and take the bridge 19 miles behind the front.',
    clock:{start:'1942-01-07T03:30', step:60},
    build:() => { const b = MB(44, 20, 'L', 9404);
      b.blobs('J', 20, 0, 0, 43, 19, 1, 2).rect(0, 9, 43, 11, 'L');
      b.road([[0, 10], [43, 10]]).river([[38, 0], [38, 19]], 0);
      b.put([[41, 10, 'q'], [1, 10, 'Q'], [1, 2, 'F'], [10, 8, 'k'], [18, 12, 'k'], [26, 8, 'k'], [33, 12, 'k'], [42, 4, 'g'], [12, 10, 'w'], [20, 10, 'w'], [28, 10, 'w'], [21, 10, 'm']]);
      return b.rows(); },
    units:{1:'tank*6 1,8-8,12; mtank*3 2,9-6,11; inf*6 2,3-8,17; eng*2 4,9-6,11; art 0,10; recon*2 3,5-7,15',
      2:'inf*6 10,3-36,17; at*2 12,9-30,11; nest*2 14,10-32,10; art*2 36,6-40,14; mortar*2 18,8-30,12; inf*2 39,8-42,12'},
    events:[{day:4, team:2, say:'The Argylls try to block the road in front of the bridge.', spawn:'inf*2 36,6-37,14'}]},
  singapore:{name:'The Fall of Singapore', place:'Johor Strait to Bukit Timah', date:'8 February 1942, 20:30', theme:'tropic', weather:'smoke',
    p1:{nat:'jp', co:'yamashita', funds:3000}, p2:{nat:'uk40', co:'percival', funds:3000, u:{inf:{n:'Commonwealth Infantry', w:'SMLE & Bren', snd:'bren'}}}, income:{2:.6},
    objective:{win:'hq', limit:20}, goal:'Cross the Johor Strait by night, take Bukit Timah and force Percival to surrender at Fort Canning by {limit}.',
    brief:'Yamashita has 30,000 men, short of food and shells, against 85,000 on the island. Singapore\'s famous 15-inch guns face out to sea, and the north coast, facing you, has hardly been fortified. Tonight the 5th and 18th Divisions cross the strait in collapsible boats against the Australians in the mangroves. Japanese engineers have repaired the blown causeway for the tanks. Make for Bukit Timah and the reservoirs that supply the city\'s water.',
    clock:{start:'1942-02-08T20:30', step:720},
    build:() => { const b = MB(44, 28, 'L', 9505);
      b.blobs('J', 14, 0, 0, 43, 4, 1, 2).rect(0, 5, 43, 6, '~').rect(0, 27, 43, 27, '~').rect(0, 7, 43, 7, 'v');
      b.blobs('J', 14, 0, 8, 43, 22, 1, 2).blobs('U', 20, 10, 22, 38, 26, 1, 2).blobs('^', 3, 20, 14, 24, 18, 1, 1);
      b.road([[28, 0], [28, 26]]).road([[6, 10], [40, 10]]).road([[22, 8], [22, 26]]).road([[10, 18], [38, 18]]);
      b.put([[28, 5, 'b'], [28, 6, 'b'], [27, 15, '~'], [28, 15, '~'], [27, 16, '~']]);   // the causeway, blown on 1 February and repaired by Japanese engineers within days
      b.put([[24, 25, 'q'], [22, 1, 'Q'], [6, 2, 'F'], [38, 2, 'F'], [10, 12, 'e'], [30, 24, 'e'], [34, 8, 'o'], [22, 16, 'k'], [14, 20, 'k'], [34, 20, 'k'], [38, 14, 'k'], [8, 17, 'k'], [18, 24, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 2,1-26,4; eng*3 8,3-20,4; lc*4 4,5-20,6 +inf+inf; tank*3 26,1-32,3; mtank*2 30,2-34,4; art*4 4,0-36,1; bmr*2 10,0-14,0; ftr 16,0',
      2:'inf*8 2,8-40,20; at*2 10,9-36,14; nest*4 4,8-24,8; art*3 14,18-34,23; pak 12,26; pak 36,26; aa*2 26,22-32,24; recon*2 20,12-28,16; tank 24,20; mortar*2 10,12-30,16'},
    events:[{day:2, team:1, say:'The Imperial Guards land at Kranji. Tanks are ferried across the strait.', spawn:'tank*2 26,8-30,10'},
      {day:4, team:1, say:'The reservoirs are in Japanese hands. Singapore has a day\'s water left.', hurt:1},
      {day:5, team:1, say:'Yamashita\'s own ammunition is almost gone. He bluffs.', funds:3000}]},

  /* ---------------- The War of Resistance: China 1937-45 ---------------- */
  sihang:{name:'Sihang Warehouse', place:'Zhabei, Shanghai, on Suzhou Creek', date:'27 October 1937', theme:'city', weather:'smoke',
    p1:{nat:'cn', co:'xie', funds:0}, p2:{nat:'jp', co:'matsui', funds:2000}, income:{2:.5},
    objective:{win:'survive', days:8}, goal:'Hold the Sihang Warehouse until {survive}. The world is watching from across the creek.',
    brief:'Shanghai has fallen after three months of the bloodiest fighting since Verdun. To cover the retreat, Lieutenant Colonel Xie Jinyuan and 423 men of the 524th Regiment hold a concrete warehouse on Suzhou Creek. The newspapers call them the "Eight Hundred Heroes". Across the creek, in the International Settlement, thousands of foreigners watch from the rooftops. The Japanese cannot use their heaviest guns for fear of hitting the Settlement.',
    clock:{start:'1937-10-27T06:00', step:720},
    build:() => { const b = MB(32, 22, 'x', 10101);
      b.blobs('U', 16, 0, 0, 31, 15, 1, 2).rect(0, 18, 31, 19, 'r').rect(0, 20, 31, 21, 'U').rect(13, 13, 19, 16, 'U');
      b.road([[16, 0], [16, 12]]).road([[0, 10], [31, 10]]).road([[24, 12], [24, 21]]);
      b.put([[16, 15, 'Q'], [14, 14, 'B'], [18, 14, 'B'], [14, 16, 'B'], [18, 16, 'B'], [16, 2, 'q'], [4, 4, 'g'], [28, 4, 'g'], [2, 12, 'k'], [30, 12, 'k']]);
      return b.rows(); },
    units:{1:'pak 15,14; pak 17,16; inf*5 13,13-19,16; at 16,13; mortar 16,15; nest*2 14,13-18,13',
      2:'inf*8 2,2-30,10; eng*2 10,6-22,8; tank*2 12,3-20,5; art*2 6,1-26,2; mortar*2 8,4-24,6; bmr 16,0'},
    events:[{day:2, team:1, say:'Girl Guide Yang Huimin swims Suzhou Creek with a national flag. It is raised over the warehouse at dawn.', heal:2},
      {day:4, team:2, say:'Japanese engineers try to mine the warehouse walls.', spawn:'eng*2 10,10-22,12'}]},
  taierzhuang:{name:'Taierzhuang', place:'Taierzhuang, on the Grand Canal', date:'3 April 1938', theme:'china', weather:'clear',
    p1:{nat:'cn', co:'li', funds:2000}, p2:{nat:'jp', co:'isogai', funds:0, u:{tank:{n:'Type 89 I-Go', w:'57 mm', shape:'chiha', pow:.8}}},
    objective:{win:'hq', limit:20}, goal:'Close the trap: cut off the 10th Division in Taierzhuang and retake the walled town by {limit}.',
    brief:'Isogai\'s 10th Division has pushed into the walled town of Taierzhuang, on the Grand Canal, and fought house to house for a week. Li Zongren has let them come. Now Tang Enbo\'s corps is swinging round behind the Japanese, and night raiders with broadswords and grenades are slipping into the town. Close the ring and retake it.',
    clock:{start:'1938-04-03T05:00', step:720},
    build:() => { const b = MB(40, 26, ',', 10202);
      b.blobs('.', 20, 0, 0, 39, 25, 1, 2).blobs('l', 6, 0, 0, 39, 8, 1, 2).blobs('T', 6, 0, 0, 39, 25, 1, 1);
      b.river([[0, 19], [39, 20]], .1);
      b.rect(16, 9, 24, 15, 'U'); walls(b, 16, 9, 24, 15, 'B', [[20, 9], [20, 15], [16, 12], [24, 12]]);
      b.road([[20, 0], [20, 8]]).road([[20, 16], [20, 25]]).road([[0, 12], [15, 12]]).road([[25, 12], [39, 12]]);
      b.put([[20, 12, 'q'], [2, 24, 'Q'], [3, 21, 'F'], [36, 22, 'F'], [2, 2, 'k'], [37, 3, 'g'], [10, 5, 'c'], [30, 5, 'c'], [8, 17, 'c'], [32, 17, 'c'], [20, 23, 'c']]);
      return b.rows(); },
    units:{1:'inf 2,24 !; inf 20,23; inf*8 3,10-14,24; eng*3 14,16-26,18; at*2 12,14-28,17; mortar*2 10,16-30,18; art*2 18,21-22,23; inf*5 30,2-38,14; cav*2 34,4-38,10',
      2:'inf*6 16,9-24,15; tank*2 18,4-22,8; art*2 20,2-22,4; mortar 19,11; at 21,13; mtank 20,6; inf*3 26,4-34,8; bmr 20,0'},
    events:[{day:3, team:2, say:'Isogai\'s relief column tries to break through to the town.', spawn:'inf*3 18,0-24,2; tank 20,1'},
      {day:5, team:1, say:'Tang Enbo\'s 20th Corps closes on the Japanese rear.', spawn:'inf*4 28,1-38,6'}]},
  changsha:{name:'First Battle of Changsha', place:'The Xinqiang and Miluo rivers, Hunan', date:'23 September 1939', theme:'china', weather:'rain',
    p1:{nat:'cn', co:'xue', funds:2000}, p2:{nat:'jp', co:'okamura', funds:5000}, income:{2:1},
    objective:{win:'survive', days:12}, goal:'Fall back across the rivers, wear the 11th Army down, and hold Changsha until {survive}.',
    brief:'Okamura\'s 11th Army attacks south towards Changsha, capital of Hunan, with gas and tanks. Xue Yue does not try to hold the river lines. His men destroy the roads and fall back, drawing the Japanese deeper, while his flank armies wait in the hills. When the enemy is strung out and short of supplies, the furnace closes.',
    clock:{start:'1939-09-23T06:00', step:720},
    build:() => { const b = MB(40, 26, 'y', 10303);
      b.blobs('.', 20, 0, 0, 39, 25, 1, 2).blobs('^', 10, 0, 0, 39, 25, 1, 2).blobs('T', 8, 0, 0, 39, 25, 1, 1).blobs('l', 6, 0, 0, 39, 25, 1, 2);
      b.river([[0, 6], [39, 7]], .2).river([[0, 13], [39, 14]], .2);
      b.road([[20, 0], [20, 25]]).road([[6, 0], [6, 25]]).road([[34, 0], [34, 25]]);
      b.rect(0, 4, 39, 9, 'r', ['b']).rect(0, 11, 39, 16, 'r', ['b']);
      b.town(20, 23, 5, 'C', 2, '.');
      b.put([[20, 23, 'Q'], [20, 1, 'q'], [2, 24, 'F'], [37, 24, 'F'], [2, 1, 'g'], [37, 1, 'g'], [10, 10, 'c'], [30, 10, 'c'], [12, 18, 'c'], [28, 18, 'c']]);
      return b.rows(); },
    units:{1:'inf*10 2,8-38,20; at*2 10,14-30,16; mortar*2 12,15-28,17; art*2 18,19-22,21; nest*3 10,15-30,15; cav*2 2,16-38,18; eng 20,15',
      2:'inf*10 2,1-38,5; tank*3 16,0-24,3; mtank 20,2; art*3 8,0-32,1; mortar*2 12,2-28,4; bmr*2 18,0-22,0'},
    events:[{day:3, team:2, say:'A Japanese column lands from Dongting Lake on the western flank.', spawn:'inf*3 0,14-2,20'},
      {day:6, team:1, say:'The Heaven Furnace: Xue Yue\'s flank armies strike.', spawn:'inf*4 0,4-3,10; inf*4 36,4-39,10'}]},
  kunlun:{name:'Kunlun Pass', place:'Kunlun Pass, Guangxi', date:'18 December 1939', theme:'china', weather:'fog',
    p1:{nat:'cn', co:'du', funds:3000}, p2:{nat:'jp', co:'imamura', funds:0},
    objective:{win:'hq', limit:16}, goal:'Storm Kunlun Pass with the 5th Corps\' tanks and infantry by {limit}.',
    brief:'The Japanese have landed in southern China and taken Nanning, cutting the road from French Indochina. Holding the pass north of the city is the 21st Brigade, called the "Steel Army" for its record in the Russo-Japanese War. Against it Chiang sends his best: Du Yuming\'s 5th Corps, China\'s only mechanised corps, with Soviet T-26s and Vickers tanks, and German-trained infantry.',
    clock:{start:'1939-12-18T06:00', step:720},
    build:() => { const b = MB(40, 24, '^', 10404);
      b.blobs('T', 20, 0, 0, 39, 23, 1, 2).blobs('.', 10, 0, 0, 39, 23, 1, 2);
      b.road([[20, 23], [18, 14], [20, 6], [22, 0]]).rect(16, 4, 24, 8, '.', ['^', 'T']);
      b.put([[17, 5, 'B'], [23, 5, 'B'], [18, 8, 'B'], [22, 8, 'B'], [14, 10, 'B'], [26, 10, 'B']]);
      b.put([[20, 6, 'q'], [20, 22, 'Q'], [4, 22, 'F'], [36, 22, 'F'], [20, 1, 'g'], [8, 12, 'c'], [32, 12, 'c'], [12, 18, 'c'], [28, 18, 'c']]);
      return b.rows(); },
    units:{1:'inf*8 6,16-34,22; tank*3 18,19-22,22; mtank*3 16,20-24,23; art*3 14,22-26,23; mortar*2 12,18-28,20; at*2 16,17-24,19; eng*2 18,18-22,19',
      2:'inf*5 14,4-26,10; nest*3 17,5-23,8; art*2 18,2-22,3; mortar*2 15,6-25,9; at 20,9'},
    events:[{day:4, team:2, say:'A relief column comes up the road from Nanning.', spawn:'inf*3 18,0-22,1; art 20,0'},
      {day:6, team:1, say:'Major General Nakamura Masao, the brigade commander, is killed.', hurt:1}]},
  yenangyaung:{name:'Yenangyaung', place:'The oilfields and the Pin Chaung ford, Burma', date:'19 April 1942', theme:'china', weather:'clear',
    p1:{nat:'cn', co:'sun', funds:1000}, p2:{nat:'jp', co:'sakurai', funds:0},
    objective:{win:'hq', limit:16}, goal:'Break the Japanese roadblock at the Pin Chaung ford and open the way for the trapped Burma Division by {limit}.',
    brief:'The British retreat from Rangoon has ended in a trap. 7,000 men of the 1st Burma Division are surrounded among the burning oilfields of Yenangyaung, out of water in 45°C heat, with a Japanese roadblock on the only ford over the Pin Chaung. General Slim asks for Chinese help. Sun Li-jen sends his 113th Regiment, 1,121 men.',
    clock:{start:'1942-04-19T06:00', step:180},
    build:() => { const b = MB(38, 22, '.', 10505);
      b.blobs('l', 8, 0, 0, 37, 21, 1, 2).blobs(',', 8, 0, 0, 37, 21, 1, 2).blobs('x', 6, 0, 12, 37, 21, 1, 2);
      b.river([[0, 10], [37, 10]], .15).road([[19, 0], [19, 21]]);
      b.put([[19, 11, 'q'], [1, 1, 'Q'], [19, 1, 'c'], [3, 1, 'F'], [35, 2, 'F'], [10, 15, 'f'], [28, 15, 'f'], [14, 19, 'f'], [24, 19, 'f'], [6, 6, 'c'], [32, 6, 'c']]);
      return b.rows(); },
    units:{1:'inf 1,1 !; inf*6 8,2-30,8; at*2 14,6-24,8; mortar*2 12,5-26,7; art 19,3; eng 19,7',
      2:'inf*4 12,11-26,16; nest 19,11; at 19,12; mortar 20,13; art 16,18-22,20; inf*2 4,13-34,18'},
    events:[{day:3, team:1, say:'The Burma Division and the Stuarts of the 7th Hussars attack the roadblock from the south.', hurt:1},
      {day:5, team:2, say:'More of the 33rd Division arrives from the west.', spawn:'inf*2 2,14-6,18'}]},
  xuefeng:{name:'West Hunan', place:'The Xuefeng Mountains, Zhijiang', date:'1 May 1945', theme:'china', weather:'clear',
    p1:{nat:'cn', co:'chiang', funds:3000, u:{inf:{n:'New 6th Army (US-equipped)', w:'M1 Garand, Thompson & BAR', snd:'garand', cost:1100}, at:{n:'Bazooka Team', w:'M1A1 Bazooka', snd:'rocketAT'}, ftr:{n:'P-51 Mustang (Chinese-American Composite Wing)', w:'6x .50 cal', shape:'p51'}}},
    p2:{nat:'jp', co:'okamura', funds:1000},
    objective:{win:'hq', limit:18}, goal:'Stop the 20th Army\'s drive on Zhijiang airfield, then counter-attack and take its headquarters by {limit}.',
    brief:'The last Japanese offensive in China aims at the American airfield at Zhijiang, in the Xuefeng Mountains. But this is not the Chinese army of 1937. Divisions trained and equipped by the Americans in India hold the passes, and Chinese and American pilots of the Composite Wing rule the sky. Hold the passes, then strike back.',
    clock:{start:'1945-05-01T06:00', step:720},
    build:() => { const b = MB(40, 26, '^', 10606);
      b.blobs('T', 16, 0, 0, 39, 25, 1, 2).blobs('.', 14, 0, 0, 39, 25, 1, 2).blobs('y', 6, 0, 14, 39, 25, 1, 2);
      b.road([[20, 25], [16, 14], [20, 3]]).road([[0, 12], [39, 12]]);
      b.put([[20, 3, 'q'], [20, 22, 'A'], [22, 24, 'Q'], [4, 24, 'F'], [36, 24, 'F'], [3, 2, 'g'], [36, 2, 'g'], [10, 8, 'c'], [30, 8, 'c'], [10, 17, 'k'], [30, 17, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 4,14-36,22; at*2 14,16-26,18; mortar*2 10,16-30,20; art*3 16,21-24,23; ftr*2 19,22-21,23; bmr 20,23; eng 20,18',
      2:'inf*10 4,4-36,12; art*2 18,2-22,3; mortar*3 10,6-30,9; at*2 14,8-26,10; tank*2 18,6-22,8; inf*3 2,14-6,18'},
    events:[{day:4, team:1, say:'The New 6th Army is flown in by American transports.', spawn:'inf*3 19,21-23,24'}]},
};
for (const [id, m] of Object.entries(NEW_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }
CAMPAIGNS.find(c => c.id === 'east').missions.unshift('moscow', 'stalingrad', 'uranus');
CAMPAIGNS.find(c => c.id === 'east').sub = 'Moscow to the Reichstag · December 1941 – April 1945';
CAMPAIGNS.push(
  {id:'training', name:'Basic Training', sub:'Learn the drill on Salisbury Plain · May 1944', side:'allies', missions:['training']},
  {id:'china', name:'The War of Resistance', sub:'China against Japan · 1937–1945', side:'allies', missions:['sihang', 'taierzhuang', 'changsha', 'kunlun', 'yenangyaung', 'xuefeng']},
  {id:'weiss', name:'Fall Weiss', sub:'The invasion of Poland · September 1939', side:'axis', missions:['mokra', 'westerplatte', 'bzura', 'warsaw39']},
  {id:'gelb', name:'Fall Gelb', sub:'The Battle of France · May 1940', side:'axis', missions:['eben', 'sedan', 'montcornet', 'arras', 'dunkirk']},
  {id:'sea', name:'The War at Sea', sub:'The River Plate to Leyte Gulf · 1939–1944', side:'allies', missions:['riverplate', 'bismarck', 'midway', 'ironbottom', 'samar']},
  {id:'atlantic', name:'The Battle of the Atlantic', sub:'Hunting the U-boats · 1941–1944', side:'allies', missions:['hg76', 'ons5', 'sixkills', 'u505']},
  {id:'rising', name:'The Rising Sun', sub:'Pearl Harbor to Singapore · December 1941 – February 1942', side:'axis', missions:['pearl', 'kotabharu', 'forcez', 'slimriver', 'singapore']},
  {id:'pacific', name:'The Pacific War', sub:'Wake Island to Okinawa · 1941–1945', side:'allies', missions:['wake', 'henderson', 'tarawa', 'iwo', 'okinawa']});
{ const order = ['training', 'china', 'weiss', 'gelb', 'sea', 'atlantic', 'rising', 'pacific', 'east', 'west', 'axis'];   // roughly the order the war happened
  CAMPAIGNS.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)); }
