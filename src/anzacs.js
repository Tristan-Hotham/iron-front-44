/* ============================== THE DIGGERS ==============================
   Australia's war, 1941-45: the first Australian victory of the war at Bardia, the
   militia on the Kokoda Track, the first Japanese defeat on land at Milne Bay, the
   bunkers of Buna, the razorback of Shaggy Ridge, and the last landing, at Balikpapan. */

FLAG_EXTRA.anz = (g, x, y, w, h) => { g.fillStyle = '#1a2a6a'; g.fillRect(x, y, w, h); const cw = w * .45, ch = h * .5; g.fillStyle = '#f4f4ee'; g.fillRect(x, y + ch * .4, cw, ch * .2); g.fillRect(x + cw * .42, y, cw * .16, ch); g.fillStyle = '#c8202a'; g.fillRect(x, y + ch * .45, cw, ch * .1); g.fillRect(x + cw * .46, y, cw * .08, ch); g.fillStyle = '#f4f4ee'; for (const [a, b, r] of [[.22, .78, .07], [.74, .3, .04], [.66, .6, .04], [.84, .48, .04], [.75, .8, .04]]) { g.beginPath(); g.arc(x + w * a, y + h * b, h * r, 0, 7); g.fill(); } };

const AIF = {inf:{n:'Australian Infantry (2nd AIF)', w:'SMLE, Bren & Owen gun'}, at:{n:'Boys Anti-tank Rifle Team'}, tank:{n:'M3 Stuart (2/6th Armoured Regiment)', w:'37 mm M6', snd:'gun37', shape:'stuart', pow:.85, mv:6}};
const JP_PACIFIC = {inf:{n:'South Seas Detachment (Nankai Shitai)', w:'Arisaka & Type 96 LMG'}, nest:{n:'Coconut-log Bunker', w:'Type 92 HMG under three feet of logs and earth', pow:1.05}};

Object.assign(CO, {
  mackay:{n:'Iven Mackay', nat:'anz', rank:'Major General', nick:'6th Australian Division',
    bio:'A physics lecturer and headmaster who had fought at Gallipoli, he commanded the 6th Australian Division in its first battle, against the Italian fortress of Bardia in January 1941: the first battle of the war fought by an Australian army, and its first victory.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'The Wire', star:3, txt:'Infantry +20% firepower; engineers +1 move.', atk:{foot:20}},
    scop:{n:'Bardia', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'slouch', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#8a7a52', glasses:true},
    say:{start:'Through the wire at dawn, with the Matildas.', win:'Bardia has fallen.', lose:'Dig in on the perimeter.', power:'Up and at \'em!'}},
  honner:{n:'Ralph Honner', nat:'anz', rank:'Lieutenant Colonel', nick:'39th Battalion',
    bio:'A schoolteacher and veteran of Greece and Crete, sent to command the 39th Battalion, a militia unit of teenagers who were never meant to fight overseas, holding the Kokoda Track against the Japanese at Isurava. He later wrote of their courage: "These were the men I wanted."',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'Isurava', star:3, txt:'Infantry +25% defence and firepower.', def:{foot:25}, atk:{foot:25}},
    scop:{n:'The Ragged Bloody Heroes', star:6, txt:'All units +40% defence; all units recover 2 HP.', def:{all:40}, heal:2},
    look:{cap:'slouch', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a6040'},
    say:{start:'We hold Isurava until the AIF gets here.', win:'They\'ve broken off.', lose:'Back along the track. Carry the wounded.', power:'Hold on, boys!'}},
  clowes:{n:'Cyril Clowes', nat:'anz', rank:'Major General', nick:'Milne Force',
    bio:'A quiet gunner who commanded Milne Force, Australian militia and AIF battalions with RAAF Kittyhawk squadrons, at the eastern tip of New Guinea. When Japanese marines landed at Milne Bay in August 1942 he held the airstrips and drove them out: the first time a Japanese landing had been defeated on land.',
    d2d:{txt:'Aircraft +15% firepower.', atk:{air:15}},
    cop:{n:'The Kittyhawks', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'No. 3 Strip', star:6, txt:'All units +35% defence and +20% firepower.', def:{all:35}, atk:{all:20}},
    look:{cap:'slouch', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#5a6040'},
    say:{start:'Hold the strips. The Kittyhawks will do the rest.', win:'They\'re going back to their boats.', lose:'Fall back on Gili Gili.', power:'Kittyhawks, at \'em!'}},
  vasey:{n:'George Vasey', nat:'anz', rank:'Major General', nick:'Bloody George',
    bio:'Commanded the 7th Australian Division on the Kokoda Track and at Buna and Gona, and later in the Ramu valley and on Shaggy Ridge. Loved by his men, sharp with his superiors. He was killed in a plane crash off Cairns in March 1945.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Bunker Busting', star:3, txt:'Infantry and tanks +25% firepower.', atk:{foot:25, armour:25}},
    scop:{n:'Bloody George', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'slouch', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#5a6040'},
    say:{start:'Every bunker, one at a time.', win:'The bunkers are cleared.', lose:'Pull back to the start line.', power:'Get the Stuarts up!'}},
  milford:{n:'Edward Milford', nat:'anz', rank:'Major General', nick:'7th Australian Division, 1945',
    bio:'Commanded the 7th Australian Division at Balikpapan in Borneo in July 1945, the last large amphibious landing of the war.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Naval Gunfire', star:3, txt:'All units +20% firepower; the cruisers shell two positions for 2 HP.', atk:{all:20}, strike:{n:2, r:1, hp:2, kind:'naval'}},
    scop:{n:'Oboe Two', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'slouch', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#5a6040'},
    say:{start:'Over the beach and up the ridges.', win:'Balikpapan is ours.', lose:'Hold the beachhead.', power:'Frogs forward!'}},
  horii:{n:'Tomitarō Horii', nat:'jp', rank:'Major General', nick:'South Seas Detachment',
    bio:'Led the South Seas Detachment over the Owen Stanley Range on the Kokoda Track towards Port Moresby in 1942. His men got within sight of the lights of Port Moresby before they were ordered back. He drowned crossing the flooded Kumusi river during the retreat in November 1942.',
    d2d:{txt:'Infantry +1 move.', mv:{foot:1}},
    cop:{n:'Infiltration', star:3, txt:'Infantry +2 move and +15% firepower.', mv:{foot:2}, atk:{foot:15}},
    scop:{n:'Port Moresby', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'Over the mountains to Port Moresby.', win:'The track is open!', lose:'Back to the coast.', power:'Totsugeki!'}},
  hayashi:{n:'Shōjirō Hayashi', nat:'jp', rank:'Commander', nick:'Kure 5th Special Naval Landing Force',
    bio:'Led the Japanese marines who landed at Milne Bay at night on 25 August 1942 with two light tanks, expecting to find a few hundred defenders. There were nearly nine thousand. He was killed in the fighting.',
    d2d:{txt:'Infantry +15% firepower at night.', atk:{foot:15}},
    cop:{n:'Night Attack', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'The Airstrip', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'navy', face:'#e2c08e', hair:'#2a2420', jaw:1, tunic:'#2a3a2a'},
    say:{start:'Take the airfields before dawn.', win:'The strip is ours.', lose:'Back to the landing craft.', power:'Banzai!'}},
  yasuda:{n:'Yoshitatsu Yasuda', nat:'jp', rank:'Captain', nick:'Buna Garrison',
    bio:'Commanded the naval troops in the Buna garrison, dug into bunkers of coconut logs in the swamps. They held out for weeks against Australians and Americans, starving, until almost every man was dead.',
    d2d:{txt:'All units +20% defence.', def:{all:20}},
    cop:{n:'The Bunkers', star:3, txt:'All units +30% defence.', def:{all:30}},
    scop:{n:'To the Last', star:6, txt:'All units +40% defence.', def:{all:40}},
    look:{cap:'navy', face:'#e2c08e', hair:'#2a2420', jaw:1, tunic:'#2a3a2a'},
    say:{start:'Hold every bunker.', win:'They cannot reach us.', lose:'It is finished.', power:'Fire!'}},
  nakai:{n:'Masutarō Nakai', nat:'jp', rank:'Major General', nick:'Nakai Detachment',
    bio:'Commanded the Japanese holding the Finisterre Range above the Ramu valley, including Shaggy Ridge, a razorback ridge so narrow that only a few men at a time could attack along it.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'The Pimple', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Finisterre', star:6, txt:'All units +30% defence and +15% firepower.', def:{all:30}, atk:{all:15}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a'},
    say:{start:'One man can hold that ridge.', win:'They cannot climb it.', lose:'The ridge is lost.', power:'Fire!'}},
  kamada:{n:'Michiaki Kamada', nat:'jp', rank:'Vice Admiral', nick:'Balikpapan',
    bio:'Commanded the Japanese naval forces holding the oil port of Balikpapan in Borneo in 1945.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'The Ridges', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Last Stand', star:6, txt:'All units +30% defence and firepower.', def:{all:30}, atk:{all:30}},
    look:{cap:'navy', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#2a3a2a'},
    say:{start:'Hold the ridges above the refineries.', win:'They are stuck on the beach.', lose:'Into the hills.', power:'Fire!'}},
});
for (const id of ['mackay', 'honner', 'clowes', 'vasey', 'milford', 'horii', 'hayashi', 'yasuda', 'nakai', 'kamada']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {mackay:'methodical', honner:'cautious', clowes:'cautious', vasey:'aggressive', milford:'methodical', horii:'aggressive', hayashi:'aggressive', yasuda:'cautious', nakai:'cautious', kamada:'cautious'});

const DIGGER_MISSIONS = {
  bardia:{name:'Bardia', place:'The Italian fortress of Bardia, Libya', date:'3 January 1941, 05:30', theme:'desert', weather:'clear',
    p1:{nat:'anz', co:'mackay', funds:0, u:{inf:{n:'16th Australian Brigade', w:'SMLE, Bren & bayonets'}, mtank:{n:'Matilda II (7th Royal Tank Regiment)'}, eng:{n:'2/1st Field Company (with Bangalore torpedoes)'}}},
    p2:{nat:'it', co:'bergonzoli', funds:0, u:{inf:{n:'Camicie Nere & Infantry (XXIII Corps)'}, nest:{n:'Concrete Post of the Perimeter', w:'Breda & a 47 mm gun'}}},
    objective:{win:'hq', limit:14}, goal:'Break through the perimeter wire and take Bardia by {limit}.',
    brief:'The first battle of the war for the Second Australian Imperial Force. The Italian fortress of Bardia has eighteen miles of wire, an anti-tank ditch and a ring of concrete posts, and 45,000 men under General Bergonzoli, "Electric Whiskers". At dawn the sappers will blow gaps in the wire with Bangalore torpedoes, the infantry will go through singing, and behind them will come the Matildas of the 7th Royal Tank Regiment, which no Italian gun can stop. The Australians have one more thing: they want to show the old soldiers of 1915 what they can do.',
    clock:{start:'1941-01-03T05:30', step:120},
    build:() => { const b = MB(34, 22, '.', 80101);
      b.rect(30, 0, 33, 21, '~').rect(29, 0, 29, 21, 's');
      b.blobs('d', 4, 0, 0, 28, 21, 1, 2).scatter('^', .05, 0, 0, 28, 21, ['.']);
      b.path([[9, 0], [9, 21]], (x, y) => b.set(x, y, 'w')).path([[10, 0], [10, 21]], (x, y) => b.set(x, y, 'z'));   // the wire and the anti-tank ditch
      for (const y of [2, 6, 10, 14, 18]) b.set(11, y, 'B');
      wadi(b, [[28, 5], [20, 8], [14, 6]]); wadi(b, [[28, 16], [20, 14], [14, 17]]);
      b.road([[0, 11], [26, 10], [28, 10]]).road([[22, 0], [23, 21]]);
      b.put([[1, 11, 'Q'], [4, 4, 'C'], [4, 18, 'C'], [26, 10, 'q'], [17, 5, 'k'], [17, 16, 'k'], [23, 3, 'k'], [24, 18, 'k'], [27, 7, 'o']]);
      return b.rows(); },
    units:{1:'inf*9 0,3-8,19; mtank*4 2,8-6,14; eng*3 6,8-8,14; art*3 0,5-2,17; mortar*2 4,6-7,16; recon*2 3,3-6,18',
      2:'nest*6 11,1-12,20; inf*7 12,2-25,19; art*4 18,4-26,17; at*3 13,6-20,15; tank*2 20,9-24,13; inf*2 24,8-27,12'},
    events:[{day:1, team:1, say:'05:30. The sappers fire the Bangalore torpedoes under the wire, and the infantry go through singing "The Wizard of Oz".', clear:[[9, 10], [9, 11], [9, 12]], hurt:0},
      {day:2, team:1, say:'HMS Terror and the gunboats shell the harbour.', hurt:1},
      {day:3, team:2, say:'The Italian gunners fight to the last round round the harbour.', spawn:'art*2 24,6-27,14'},
      {day:4, team:1, say:'The 17th Brigade comes through the gap.', spawn:'inf*3 6,9-8,13'}]},
  isurava:{name:'Isurava', place:'The Kokoda Track, Owen Stanley Range', date:'26 August 1942, 07:00', theme:'tropic', weather:'rain',
    p1:{nat:'anz', co:'honner', funds:0, u:{inf:{n:'39th Militia Battalion & 2/14th Battalion', w:'SMLE, Bren & grenades'}}},
    p2:{nat:'jp', co:'horii', funds:0, u:JP_PACIFIC},
    objective:{win:'survive', days:7, hold:2, protect:'inf', protectN:6}, goal:'Hold Isurava until {survive}, while the wounded are carried back along the track. Keep six infantry units and two of your three positions.',
    persona:{2:'brawler'},
    brief:'The Japanese landed on the north coast of Papua in July and marched up the Kokoda Track, over the Owen Stanley Range, towards Port Moresby. In their way at Isurava, in the mud and rain, stand the 39th Battalion, militia boys of eighteen and nineteen who were never meant to fight, with no artillery, thinned by sickness, their uniforms rotting. The first battalion of the AIF, the 2/14th, is arriving to join them. Across the creek, Horii has five battalions and mountain guns. Hold, and give the wounded time to be carried back by the Papuan bearers, the "Fuzzy Wuzzy Angels".',
    clock:{start:'1942-08-26T07:00', step:120},
    build:() => { const b = MB(30, 22, 'J', 80202);
      b.blobs('^', 10, 0, 0, 29, 21, 1, 2, ['J']).blobs('M', 4, 0, 0, 29, 21, 1, 1, ['J', '^']);
      b.river([[16, 0], [15, 10], [17, 21]], .2);
      b.path([[0, 12], [8, 11], [16, 10], [29, 9]], (x, y) => b.set(x, y, '='));                   // the track
      b.rect(8, 9, 12, 13, '.');
      b.put([[3, 12, 'Q'], [10, 10, 'C'], [11, 13, 'C'], [24, 4, 'k'], [26, 15, 'k'], [27, 9, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 6,7-14,15; mortar 9,11; nest*2 11,9-13,13; at 10,12',
      2:'inf*15 17,2-28,19; mortar*3 22,6-26,12; art*3 25,7-29,12; nest 18,9'},
    events:[{day:1, team:2, say:'The Japanese attack across the creek, again and again, uphill, in the rain.', spawn:'inf*3 17,10-21,14'},
      {day:2, team:1, say:'The 2/14th Battalion comes up the track to relieve the militia. The 39th refuses to leave.', spawn:'inf*3 0,10-4,14'},
      {day:3, team:2, say:'Japanese mountain guns fire down onto the perimeter from the ridge opposite.', hurt:1, hurtTeam:1},
      {day:5, team:2, say:'Horii throws in fresh battalions from the Kokoda plateau, straight up the slope.', spawn:'inf*5 15,6-19,15'},
      {day:6, team:2, say:'Japanese mountain guns again, all morning.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'A battalion works round the flank through the jungle.', spawn:'inf*3 8,0-14,4'},
      {day:4, team:1, say:'Private Bruce Kingsbury charges a Japanese position firing a Bren from the hip. He is killed, and wins the Victoria Cross.', hurt:1}]},
  milnebay:{name:'Milne Bay', place:'The airstrips at Milne Bay', date:'25 August 1942, 23:00', theme:'tropic', weather:'rain',
    p1:{nat:'anz', co:'clowes', funds:2000, u:{inf:{n:'61st Militia & 2/10th Battalion', w:'SMLE, Bren & Owen gun'}, ftr:{n:'P-40 Kittyhawk (75 & 76 Squadrons RAAF)', w:'6x .50 cal', shape:'kittyhawk', snd:'strafeUS'}}},
    p2:{nat:'jp', co:'hayashi', funds:0, u:{inf:{n:'Kure 5th Special Naval Landing Force', w:'Arisaka & Type 96'}, tank:{n:'Type 95 Ha-Go (with headlights)'}}},
    objective:{win:'survive', days:8, hold:3, protect:'inf', protectN:5}, goal:'Hold the airstrips at Milne Bay until {survive}. Keep five infantry units and three of your four positions.',
    persona:{2:'brawler'},
    brief:'In the rain and the dark, Japanese marines have landed on the north shore of Milne Bay with two light tanks, expecting a few hundred defenders and an airfield to take. Instead they have run into nearly nine thousand Australians and the Kittyhawks of 75 and 76 Squadrons RAAF, which take off from the strips through the mud and strafe the landing barges. The Japanese tanks come at night, with their headlights on.',
    clock:{start:'1942-08-25T23:00', step:120},
    build:() => { const b = MB(34, 20, 'L', 80303);
      b.rect(0, 0, 33, 3, '~').rect(0, 4, 33, 4, 's').blobs('J', 8, 0, 5, 33, 19, 1, 2, ['L']).blobs('v', 5, 0, 5, 33, 19, 1, 1, ['L']);
      b.rect(4, 10, 10, 12, '.').rect(20, 14, 26, 16, '.');
      b.road([[0, 8], [33, 7]]).road([[12, 8], [12, 19]]);
      b.put([[3, 14, 'Q'], [6, 11, 'A'], [22, 15, 'A'], [12, 8, 'C'], [27, 6, 'k'], [31, 6, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 2,8-16,17; ftr*2 6,11-8,11; art*2 3,13-6,16; mortar*2 8,12-12,15; at 10,9; nest*2 11,7-14,9',
      2:'inf*9 22,5-33,9; tank*2 26,7-30,8; mortar*2 28,5-31,7; inf*3 18,5-23,7'},
    events:[{day:1, team:2, say:'The Japanese tanks come down the track in the dark, headlights blazing.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'The Kittyhawks take off through the mud and strafe the landing barges on the beach.', hurt:1},
      {day:2, team:2, say:'Japanese reinforcements land at night.', spawn:'inf*4 24,5-33,8'},
      {day:3, team:2, say:'The marines charge No. 3 Strip across the open runway.', spawn:'inf*3 16,5-20,8'},
      {day:5, team:1, say:'The 18th Brigade counter-attacks along the north shore.', spawn:'inf*3 14,6-18,10'}]},
  buna:{name:'Buna', place:'Cape Endaiadere and the Buna bunkers', date:'18 December 1942, 07:00', theme:'tropic', weather:'clear',
    p1:{nat:'anz', co:'vasey', funds:0, u:AIF},
    p2:{nat:'jp', co:'yasuda', funds:0, u:JP_PACIFIC},
    objective:{win:'kill', role:'nest', n:6, limit:17}, goal:'Clear the coconut-log bunkers: knock out six of them by {limit}. The Stuarts can blast them at close range.',
    brief:'The Japanese pushed back from Kokoda have dug in on the coast at Buna and Gona: bunkers of coconut logs and sand, covered with earth, almost invisible in the kunai grass and the swamp, each holding a machine gun. The Americans have been stuck in front of them for a month. Now the 18th Brigade, veterans of Tobruk and Milne Bay, has come in with the Stuarts of the 2/6th Armoured Regiment, to do it the hard way: tanks and infantry together, bunker by bunker.',
    clock:{start:'1942-12-18T07:00', step:120},
    build:() => { const b = MB(32, 20, 'L', 80404);
      b.rect(0, 0, 31, 2, '~').rect(0, 3, 31, 3, 's').scatter(',', .4, 0, 4, 31, 19, ['L']).blobs('v', 6, 0, 4, 31, 19, 1, 2, ['L', ',']).blobs('J', 4, 0, 4, 31, 19, 1, 1, ['L', ',']);
      b.road([[0, 6], [31, 6]]).road([[8, 6], [8, 19]]);
      b.put([[2, 15, 'Q'], [5, 10, 'C'], [14, 8, 'k'], [22, 6, 'k'], [27, 12, 'k'], [29, 5, 'q']]);
      return b.rows(); },
    units:{1:'inf*8 0,8-9,18; tank*4 2,7-7,12; mortar*2 3,12-6,16; art*2 0,13-3,18; eng 6,9',
      2:'nest*9 11,4-28,16; inf*6 12,4-29,17; mortar*2 24,6-28,12; at 20,8'},
    events:[{day:2, team:2, say:'Japanese snipers in the palm tops pick off the tank commanders standing in their turrets.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'More Stuarts come up the coast by barge.', spawn:'tank*2 0,4-3,7'},
      {day:4, team:2, say:'The garrison is starving, but every bunker fights to the last man.', hurt:0}]},
  shaggyridge:{name:'Shaggy Ridge', place:'The Pimple, Finisterre Range', date:'27 December 1943, 08:00', theme:'tropic', weather:'clear',
    p1:{nat:'anz', co:'vasey', funds:0, u:{inf:{n:'2/16th Battalion', w:'Owen gun, Bren & grenades'}}},
    p2:{nat:'jp', co:'nakai', funds:0, u:JP_PACIFIC},
    objective:{win:'kill', role:'nest', n:2, limit:14}, goal:'Climb the razorback and knock out the two bunkers on the Pimple by {limit}.', whyText:{kill:'the Pimple is taken'},
    brief:'Shaggy Ridge runs along the top of the Finisterre Range like a knife blade, 5,000 feet up, in places only a few yards wide, with sheer drops either side. At its southern end is a rock pinnacle the Australians call the Pimple, honeycombed with Japanese bunkers. Only a few men at a time can attack along the ridge; the rest have to climb the cliffs on either side. Kittyhawks will bomb the Pimple, and 25-pounders have been dragged up the mountains.',
    clock:{start:'1943-12-27T08:00', step:120},
    build:() => { const b = MB(26, 16, 'J', 80505);
      b.blobs('M', 5, 0, 0, 25, 15, 1, 1, ['J']).blobs('^', 8, 0, 0, 25, 15, 1, 2, ['J', 'M']);
      b.path([[1, 13], [7, 11], [12, 9], [17, 7], [22, 5]], (x, y) => { b.set(x, y, '='); if (b.get(x, y - 1) === 'M') b.set(x, y - 1, '^'); if (b.get(x, y + 1) === 'M') b.set(x, y + 1, '^'); });   /* the razorback: one track along the crest */
      b.rect(0, 11, 5, 15, 'J').set(12, 8, 'u').set(12, 10, 'u');
      b.put([[1, 14, 'Q'], [4, 12, 'C'], [9, 10, 'k'], [13, 9, 'k'], [17, 7, 'q'], [21, 11, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 0,10-6,15; mortar*4 0,12-5,15; ftr 2,14; eng*2 3,11-6,14',
      2:'nest*2 12,8-15,10; inf*2 10,6-18,11; mortar*2 16,4-20,8; art 19,6'},
    events:[{day:2, team:1, say:'Kittyhawks dive-bomb the Pimple.', hurt:1},
      {day:3, team:2, say:'Japanese reinforcements come up from the Kankiryo Saddle.', spawn:'inf*2 19,2-24,6'},
      {day:4, team:1, say:'The 2/9th Battalion climbs the cliffs on the flank.', spawn:'inf*3 14,12-18,15'}]},
  balikpapan:{name:'Balikpapan', place:'The oil port of Balikpapan, Borneo', date:'1 July 1945, 09:00', theme:'tropic', weather:'clear',
    p1:{nat:'anz', co:'milford', funds:0, u:{inf:{n:'7th Australian Division', w:'Owen gun, Bren & SMLE'}, htank:{n:'Matilda Frog (flamethrower)', w:'flamethrower', snd:'flamer', shape:'matilda', pow:1.2}, lc:{n:'LVT (Amtrac)', shape:'lvt', mt:'amphib', mv:5}}},
    p2:{nat:'jp', co:'kamada', funds:0, u:JP_PACIFIC},
    objective:{win:'hq', limit:9}, goal:'Land at Balikpapan and take the ridges and the refinery town by {limit}.',
    brief:'The last great amphibious landing of the war, and the largest ever made by Australians. The 7th Division is landing at Balikpapan in Borneo, with its oil refineries, after twenty days of bombing and naval bombardment. Ashore, the Japanese hold the ridges above the beaches and the town in tunnels and bunkers. The Australians have brought a new weapon for the bunkers: the Matilda Frog, a tank with a flamethrower. Everyone knows the war is nearly over. Nobody wants to be the last to die.',
    clock:{start:'1945-07-01T09:00', step:120},
    build:() => { const b = MB(32, 22, '.', 80606);
      b.rect(0, 18, 31, 21, '~').rect(0, 16, 31, 17, 's');
      b.blobs('^', 8, 0, 0, 31, 14, 1, 2).blobs('J', 6, 0, 0, 31, 14, 1, 1, ['.', '^']).rect(20, 8, 28, 14, 'U');
      b.road([[0, 14], [31, 14]]).road([[24, 14], [24, 0]]);
      b.put([[15, 17, 'P'], [24, 11, 'q'], [21, 9, 'k'], [27, 13, 'k'], [6, 6, 'k'], [14, 4, 'k'], [28, 3, 'k']]);
      return b.rows(); },
    units:{1:'lc*5 4,18-26,20 +inf+inf; inf*4 6,16-24,17; htank*2 10,16-16,17; dd*2 8,21-22,21',
      2:'nest*5 5,10-28,15; inf*7 4,3-29,14; art*2 10,1-20,4; mortar*2 18,8-26,13; at 22,12'},
    events:[{day:1, team:1, say:'The cruisers and destroyers fire on the ridges as the amtracs go in.', hurt:1},
      {day:2, team:1, say:'The second brigade lands.', spawn:'inf*4 8,16-20,17; mortar*2 12,16-16,17'},
      {day:3, team:2, say:'Japanese counter-attack from the tunnels at night.', spawn:'inf*3 10,8-16,12'}]},
};
for (const [id, m] of Object.entries(DIGGER_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  bardia:{forces:['The 6th Australian Division with the Matildas of the 7th Royal Tank Regiment', 'About 45,000 Italian soldiers of the XXIII Corps under Bergonzoli'],
    win:'Bardia falls, and 40,000 prisoners march into the cages.', lose:'The perimeter holds.',
    real:'Bardia fell on 5 January 1941. The Australians took about 40,000 prisoners, 400 guns and 130 tanks, losing 130 killed. Bergonzoli escaped on foot to Tobruk, which fell two weeks later, and was captured at Beda Fomm. It was the first battle fought by an Australian army in the war, and its first victory.'},
  isurava:{forces:['The 39th Militia Battalion and the 2/14th and 2/16th Battalions of the AIF', 'Five battalions of Horii\'s South Seas Detachment with mountain guns'],
    win:'Isurava holds long enough. The track stays shut.', lose:'The Australians are overrun on the track.',
    real:'From 26 to 31 August 1942 the Australians held Isurava against odds of about five to one, then fell back step by step along the Kokoda Track, fighting rearguards all the way to Imita Ridge, 30 miles from Port Moresby. The Japanese, starving and overstretched, were ordered back in September. The 39th Battalion came out of the mountains with 32 men fit to parade. The Papuan carriers who brought down the wounded became known as the Fuzzy Wuzzy Angels.'},
  milnebay:{forces:['Milne Force: Australian militia and AIF brigades, about 8,800 men, and 75 and 76 Squadrons RAAF', 'About 2,000 Japanese naval landing troops with two light tanks'],
    win:'The landing is defeated. The Japanese go back to their boats.', lose:'The airstrips fall.',
    real:'The Japanese reached No. 3 Strip on the night of 31 August 1942 and were cut down crossing it. The Australians counter-attacked along the north shore, and on 4-5 September the survivors were evacuated by sea. It was the first time a Japanese landing had been defeated on land. Slim, in Burma, wrote that the news gave his soldiers hope: "the Japanese could be beaten."'},
  buna:{forces:['The 18th Australian Brigade with the Stuarts of the 2/6th Armoured Regiment, alongside the US 32nd Division', 'The Japanese naval and army garrison of Buna, in coconut-log bunkers'],
    win:'The bunkers are cleared, and Buna falls.', lose:'The attack dies in front of the bunkers.',
    real:'From 18 December 1942 the Australian infantry and Stuarts attacked the bunkers at Cape Endaiadere together, the tanks firing into the slits at point-blank range, and cleared them one by one. Buna fell on 2 January 1943 and Sanananda on 22 January. The Papuan campaign cost the Allies more dead than Guadalcanal, many of them from disease.'},
  shaggyridge:{forces:['The 2/16th, 2/9th and 2/10th Battalions of the 7th Australian Division', 'The Nakai Detachment, dug in along the ridge'],
    win:'The Pimple and the Kankiryo Saddle are taken.', lose:'The ridge holds.',
    real:'The 2/16th Battalion took the Pimple on 27 December 1943, and in January 1944 the 18th Brigade took the rest of the ridge and the Kankiryo Saddle, opening the way to the north coast. The fighting on the razorback was among the hardest the Australians fought in New Guinea.'},
  balikpapan:{forces:['The 7th Australian Division with Matilda Frog flamethrower tanks', 'Japanese naval and army troops dug into the ridges and the town'],
    win:'Balikpapan falls. The last great landing succeeds.', lose:'The landing is held on the ridges.',
    real:'The 7th Division landed at Balikpapan on 1 July 1945 after the heaviest preliminary bombardment of any Australian landing, and took the town and ridges in three weeks of fighting, losing 229 killed. It was the last major Allied amphibious operation of the war. Six weeks later Japan surrendered.'},
});
Object.assign(CO_FATE, {
  mackay:'Commanded the Australian forces in New Guinea in 1943 and was High Commissioner to India after the war. Died in 1966.',
  honner:'Badly wounded later in the war. Became Australian ambassador to Ireland. Died in 1994.',
  clowes:'Commanded Victoria Lines of Communication Area for the rest of the war. Died in 1968.',
  vasey:'Killed on 5 March 1945 when the plane taking him to take command in New Guinea crashed off Cairns.',
  milford:'Commanded the 7th Division to the end of the war. Died in 1972.',
  horii:'Drowned in November 1942 crossing the flooded Kumusi river during the retreat from Kokoda.',
  hayashi:'Killed at Milne Bay.',
  yasuda:'Killed at Buna in January 1943.',
  nakai:'Commanded the 20th Division in its retreat along the New Guinea coast.',
  kamada:'Convicted of war crimes after the war.',
});
Object.assign(MISSION_LONLAT, {bardia:[25.1, 31.76], isurava:[147.7, -8.98], milnebay:[150.47, -10.38], buna:[148.47, -8.66], shaggyridge:[145.95, -5.88], balikpapan:[116.83, -1.27]});
EUROPE.cities.push(['Port Moresby', 147.18, -9.44], ['Darwin', 130.84, -12.46]);
CAMPAIGNS.push({id:'diggers', name:'The Diggers', sub:'Australia\'s war, from Bardia to Borneo · 1941–1945', side:'allies', missions:['bardia', 'isurava', 'milnebay', 'buna', 'shaggyridge', 'balikpapan']});
