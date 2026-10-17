/* =============================== THE CARRIER WAR ===============================
   The war of the flat-tops, 1940-1945: the Swordfish at Taranto, the first
   carrier battles of the Coral Sea, the Eastern Solomons and Santa Cruz, the
   Fleet Air Arm against Tirpitz, the Marianas Turkey Shoot, the decoy carriers
   off Cape Engaño and the last sortie of Yamato. Midway stays in The War at Sea.
   New: the Regia Marina, a Norwegian fjord, Hellcats, Helldivers, Corsairs,
   Barracudas, Devastators, Judys and Jills, and the admirals who fought it. */

/* ---------- a fjord in the far north ---------- */
Object.assign(PAL, {norway:Object.assign({}, PAL.winter, {sea:'#2a4658', sea2:'#46667a', water:'#3a5a6a', water2:'#5a7a8a', hill:'#c8d2da', rock:'#7a7a78', snowcap:1})});
THEMES.norway = {n:'Norwegian fjords', base:'.', w:{'M':4, 'T':2, '^':2}};

/* ---------- ships and aircraft ---------- */
Object.assign(EXTRA_SHAPES, {
  bbit:(P, C, f) => capital(P, f, {hull:'#a0a6aa', deck:'#a8946a', tower:1, funnels:2, aft2:1}),   // Littorio and the rebuilt Cavours: light grey, teak decks
});
Object.assign(PLANES, {
  tbd:      {len:26, nose:'radial', top:'#8a96a0', bot:'#d8dcd8', spinner:'#3a3a34', canopy:'long', wing:'#c8a040', mark:'usstarbar', torpedo:1},   // 1942: grey, with the yellow upper wings of the pre-war fleet on some
  hellcat:  {len:24, nose:'radial', top:'#2a3a5a', bot:'#d8dcd8', spinner:'#2a3a5a', canopy:'frame', wing:'#24344e', mark:'usstarbar', cowlRing:'#24344e'},
  helldiver:{len:26, nose:'radial', top:'#2a3a5a', bot:'#d8dcd8', spinner:'#3a3a34', canopy:'long', wing:'#24344e', mark:'usstarbar', bomb:1},
  corsair:  {len:25, nose:'radial', top:'#3a4a5a', bot:'#c8ccd0', spinner:'#2a2a2a', canopy:'frame', wing:'#34445a', mark:'raf', gull:1},
  barracuda:{len:25, nose:'inline', top:'#5b6448', bot:'#c8ccc0', mottle:'#4a5a6a', spinner:'#202020', canopy:'long', wing:'#4f5740', mark:'raf', bomb:1},
  judy:     {len:24, nose:'inline', top:'#3a4a32', bot:'#b8b8a8', spinner:'#3a3a34', canopy:'long', wing:'#34422c', mark:'hinomaru', bomb:1},
  jill:     {len:26, nose:'radial', top:'#3a4a32', bot:'#b8b8a8', spinner:'#3a3a34', canopy:'long', wing:'#34422c', mark:'hinomaru', torpedo:1, cowlRing:'#1a1a1a'},
});
Object.assign(SPECS, {
  bbit:['1,830', '45,000 (Littorio)', '350 belt', '30 knots', '3 (Littorio class)'],
  tbd:['3', '4.6', '—', '332', '130'], hellcat:['1', '5.7', 'pilot armour', '610', '12,275'], helldiver:['2', '7.4', 'pilot armour', '475', 'about 7,100'],
  corsair:['1', '5.6', 'pilot armour', '671', '12,571'], barracuda:['3', '6.4', '—', '367', 'about 2,600'], judy:['2', '4.4', '—', '550', '2,038'], jill:['3', '5.2', '—', '481', '1,268'],
});

/* ---------- the Regia Marina ---------- */
NATION.itrm = {n:'Italy', adj:'Italian', short:'Regia Marina', side:'axis',
  col:{m:'#9aa0a6', d:'#6a7076', ui:'#2e8a4a', team:'#2e8a4a', hi:'#d0d4d8'},   // Italian fleet grey
  uniform:'#1e2438', helmet:'it', star:'ittac', skin:'#d8a880',
  u:{
    inf:  {n:'Fanteria di Marina "San Marco"', w:'Carcano M91 & Breda 30', snd:'bren', cost:1000},
    bb:   {n:'Corazzata (Battleship)', w:'381 mm (Littorio) and 320 mm (Cavour) guns', snd:'bigguns', shape:'bbit'},
    dd:   {n:'Incrociatore Pesante (Heavy Cruiser)', w:'203 mm guns', snd:'naval', shape:'tribal'},
    aa:   {n:'Batteria Contraerea', w:'76 mm, 40 mm and 20 mm guns', snd:'flak20', shape:'k61', mt:'tire'},
    nest: {n:'Breda M37 Nest', w:'8 mm Breda M37', snd:'bren', shape:'nest'},
  }};
Object.assign(NAT_BASE, {itrm:'it'});
Object.assign(HELMET_COL, {itrm:'#5a5e60'});
INF_WEAPONS.itrm = {inf:['rifle', 'rifle', 'bren']};
MOOD_ALIAS.itrm = 'it';
BARKS.itrm = BARKS.it;

/* ---------- admirals ---------- */
Object.assign(CAP_EXTRA, {
  longbill(P, L) {                                      // Mitscher's long-billed lobsterman's cap
    const c = '#c8b890', d = shade(c, -.18);
    P.ell(24, 9.5, 13, 5, c); P.R(11.5, 9.5, 25, 4.6, c); P.ell(20, 8, 5, 1.8, shade(c, .12)); P.R(12, 13, 24, 1.2, d);
    P.poly([[11, 14], [37, 14], [42, 19.5], [15, 18.6]], d); P.R(15, 18, 26, .6, shade(d, -.2));
    P.circ(24, 11.4, 1.4, '#d8b040'); P.R(23.6, 10.4, .8, 2.2, '#3a3020');
    faceExtras(P, L);
  },
});
Object.assign(CO, {
  lyster:{n:'Lumley Lyster', nat:'uk40', rank:'Rear Admiral', nick:'Rear Admiral, Aircraft Carriers',
    bio:'As captain of HMS Glorious in 1938 he had worked out a plan for a night torpedo attack on the Italian fleet in its base. In 1940, commanding the Mediterranean Fleet\'s carriers, he carried it out from HMS Illustrious.',
    d2d:{txt:'Aircraft +15% firepower.', atk:{air:15}},
    cop:{n:'Flarelight', star:3, txt:'Aircraft +25% firepower and +1 move.', atk:{air:25}, mv:{air:1}},
    scop:{n:'Operation Judgement', star:6, txt:'Torpedo bombers and aircraft +40% and may act twice.', atk:{air:40}, again:'air'},
    look:{cap:'navy', crown:'#f0f0ea', badge:'anchor', face:'#e8c0a0', hair:'#8a7a66', jaw:1, tunic:'#1a2034', navy:true},
    say:{start:'Flares first, then the torpedoes. Low and slow.', win:'Half the Italian battle fleet is sitting on the bottom.', lose:'The flak was too thick. Recover what aircraft we can.', power:'Second wave, go!'}},
  campioni:{n:'Inigo Campioni', nat:'itrm', rank:'Ammiraglio di Squadra', nick:'Commander, the Battle Fleet',
    bio:'Commanded the Italian battle fleet in 1940, at Calabria in July and Cape Spartivento in November. His battleships were in harbour at Taranto, behind nets, guns and barrage balloons, when the Swordfish came.',
    d2d:{txt:'Ships and AA guns +15% defence.', def:{naval:15, all:5}},
    cop:{n:'Fuoco di Sbarramento', star:3, txt:'Barrage fire: all units +25% defence.', def:{all:25}},
    scop:{n:'Allarme Aereo', star:6, txt:'All units +35% defence and +20% firepower.', def:{all:35}, atk:{all:20}},
    look:{cap:'navy', crown:'#f0f0ea', badge:'anchor', face:'#e0b490', hair:'#8a8278', jaw:1, tunic:'#1e2438', navy:true},
    say:{start:'The nets are down and the guns are manned.', win:'They have gone. The fleet is intact.', lose:'Littorio is down by the bow. Cavour is sinking.', power:'Tutte le batterie, fuoco!'}},
  fjfletcher:{n:'Frank Jack Fletcher', nat:'usp', rank:'Rear Admiral', nick:'Task Force 17',
    bio:'Commanded the American carriers in the first carrier battles of the war: the Coral Sea, Midway, where his flagship Yorktown was lost, and the Eastern Solomons. Careful with his carriers, and criticised for it, he lost only one in each battle while the Japanese lost five.',
    d2d:{txt:'Ships +10% defence; aircraft +10% firepower.', def:{naval:10}, atk:{air:10}},
    cop:{n:'Search Pattern', star:3, txt:'Aircraft +2 move.', mv:{air:2}},
    scop:{n:'Scratch One Flat-top', star:6, txt:'Dive bombers and torpedo bombers +40%; ships +20% defence.', atk:{air:40}, def:{naval:20}},
    look:{cap:'navy', crown:'#e8e4d0', badge:'usanchor', face:'#ecc3a2', hair:'#9a9080', jaw:1, tunic:'#6a6650', navy:true},
    say:{start:'Find their carriers before they find ours.', win:'Scratch one flat-top!', lose:'Lexington is burning. Pull the force back.', power:'Launch the strike!'}},
  takagi:{n:'Takeo Takagi', nat:'jp', rank:'Vice Admiral', nick:'MO Striking Force',
    bio:'Won the Battle of the Java Sea in February 1942. In May he commanded the striking force, with the veteran carriers Shōkaku and Zuikaku, that was to cover the invasion of Port Moresby.',
    d2d:{txt:'Aircraft +15% firepower.', atk:{air:15}},
    cop:{n:'Dusk Strike', star:3, txt:'Aircraft +20% firepower and +1 move.', atk:{air:20}, mv:{air:1}},
    scop:{n:'Operation MO', star:6, txt:'Air and naval units +35% firepower.', atk:{air:35, naval:35}},
    look:{cap:'navy', crown:'#f0f0ea', badge:'cherry', face:'#d8ae80', hair:'#3a3a3a', jaw:1, tunic:'#1e2230', navy:true},
    say:{start:'Find the American carriers. Port Moresby depends on it.', win:'Both American carriers are hit.', lose:'Shōkaku is burning. The invasion is postponed.', power:'All squadrons, attack!'}},
  kinkaid:{n:'Thomas C. Kinkaid', nat:'usp', rank:'Rear Admiral', nick:'Task Force 61',
    bio:'A battleship and cruiser man given command of Enterprise and Hornet off the Santa Cruz Islands in October 1942. Later he commanded the Seventh Fleet, MacArthur\'s navy, at Leyte Gulf.',
    d2d:{txt:'Ships +15% defence.', def:{naval:15}},
    cop:{n:'Combat Air Patrol', star:3, txt:'Fighters and ships +25% defence.', def:{all:25}},
    scop:{n:'Strike Repeat Strike', star:6, txt:'Aircraft +35% firepower; ships heal 2 HP.', atk:{air:35}, heal:2},
    look:{cap:'navy', crown:'#e8e4d0', badge:'usanchor', face:'#ecc3a2', hair:'#8a7a66', jaw:1, tunic:'#6a6650', navy:true},
    say:{start:'Attack. Repeat. Attack.', win:'Their carriers are hit. They are turning north.', lose:'Hornet has to be abandoned.', power:'South Dakota, every gun you have!'}},
  moore:{n:'Henry Moore', nat:'uk', rank:'Vice Admiral', nick:'Second in Command, Home Fleet',
    bio:'Led the carriers of the Home Fleet against Tirpitz in Operation Tungsten. The Barracuda crews rehearsed for weeks on a dummy range built in Loch Eriboll to look like Kaafjord.',
    d2d:{txt:'Aircraft +10% firepower and +1 move.', atk:{air:10}, mv:{air:1}},
    cop:{n:'Flak Suppression', star:3, txt:'Fighters strafe the guns: aircraft +25% firepower.', atk:{air:25}},
    scop:{n:'Tungsten', star:6, txt:'Dive bombers +45% and may act twice.', atk:{air:45}, again:'air'},
    look:{cap:'navy', crown:'#f0f0ea', badge:'anchor', face:'#e8c0a0', hair:'#9a8a78', jaw:1, tunic:'#1a2034', navy:true},
    say:{start:'Over the mountains and down onto her before the smoke is lit.', win:'Tirpitz is burning from end to end.', lose:'She is still afloat, and the smoke is up.', power:'Corsairs, go for the flak!'}},
  meyer:{n:'Hans Meyer', nat:'ger', rank:'Kapitän zur See', nick:'Tirpitz',
    bio:'Captain of the battleship Tirpitz, the "Lonely Queen of the North", from 1943. She lay behind nets in Kaafjord in the far north of Norway, a threat to every Arctic convoy, and the British attacked her again and again.',
    d2d:{txt:'Ships +15% defence.', def:{naval:15}},
    cop:{n:'Nebel', star:3, txt:'The smoke generators are lit: all units +30% defence.', def:{all:30}},
    scop:{n:'Flakfeuer', star:6, txt:'All units +30% defence and +25% firepower.', def:{all:30}, atk:{all:25}},
    look:{cap:'navy', crown:'#f0f0ea', badge:'eagle', face:'#e6ba98', hair:'#7a6a58', jaw:1, tunic:'#1e2438', navy:true},
    say:{start:'Anchors aweigh at 05:30. Trials in Altafjord.', win:'They are gone. Damage control, report!', lose:'She is hit amidships.', power:'Fliegeralarm! All Flak, fire!'}},
  mitscher:{n:'Marc Mitscher', nat:'usp', rank:'Vice Admiral', nick:'Task Force 58',
    bio:'One of the US Navy\'s first aviators. He captained Hornet when she launched Doolittle\'s raid on Tokyo. From 1944 he commanded the Fast Carrier Task Force, fifteen carriers strong, in his long-billed lobsterman\'s cap.',
    d2d:{txt:'Aircraft +15% firepower; fighters +10% defence.', atk:{air:15}, def:{air:10}},
    cop:{n:'Hey, Rube!', star:3, txt:'All fighters scramble: aircraft +2 move and +20% firepower.', mv:{air:2}, atk:{air:20}},
    scop:{n:'Turn On the Lights', star:6, txt:'All units heal 3 HP; aircraft +35% firepower.', heal:3, atk:{air:35}, fx:'heal'},
    look:{cap:'longbill', face:'#e8c0a0', hair:'#c8c0b0', jaw:0, tunic:'#6a6650', navy:true},
    say:{start:'Launch everything. Get them all.', win:'It was like an old-time turkey shoot.', lose:'Recover the aircraft. Get them home.', power:'Turn on the lights!'}},
  ozawa:{n:'Jisaburō Ozawa', nat:'jp', rank:'Vice Admiral', nick:'Mobile Fleet',
    bio:'A torpedo and air-power specialist, six foot seven, and one of the ablest admirals in the Imperial Navy. He commanded the Mobile Fleet in the Philippine Sea in June 1944, and in October led its last carriers north as a decoy to draw Halsey away from Leyte.',
    d2d:{txt:'Aircraft +1 move.', mv:{air:1}},
    cop:{n:'Outrange', star:3, txt:'Aircraft +25% firepower and +1 move.', atk:{air:25}, mv:{air:1}},
    scop:{n:'A-Go', star:6, txt:'Air and naval units +30% firepower and defence.', atk:{air:30, naval:30}, def:{air:30, naval:30}},
    look:{cap:'navy', crown:'#f0f0ea', badge:'cherry', face:'#d8ae80', hair:'#3a3a3a', jaw:2, tunic:'#1e2230', navy:true},
    say:{start:'We strike from beyond their reach.', win:'The American carriers are burning.', lose:'Taihō is lost. Withdraw.', power:'All carriers, launch!'}},
  ito:{n:'Seiichi Itō', nat:'jp', rank:'Vice Admiral', nick:'Second Fleet',
    bio:'Commanded the Second Fleet in Operation Ten-Go: Yamato, the cruiser Yahagi and eight destroyers, sent to beach themselves on Okinawa and fight as gun batteries until destroyed. He thought the mission futile and said so, then went.',
    d2d:{txt:'Ships +15% defence.', def:{naval:15}},
    cop:{n:'Full Speed', star:3, txt:'Ships +1 move and +20% defence.', mv:{naval:1}, def:{naval:20}},
    scop:{n:'Ten-Go', star:6, txt:'Ships heal 3 HP and fire +35%.', heal:3, atk:{naval:35}, fx:'heal'},
    look:{cap:'navy', crown:'#f0f0ea', badge:'cherry', face:'#d8ae80', hair:'#4a4a4a', jaw:0, tunic:'#1e2230', navy:true},
    say:{start:'Course for Okinawa. Twenty-two knots.', win:'Yamato is off the beaches.', lose:'Cancel the operation. Pick up the survivors.', power:'Every anti-aircraft gun, open fire!'}},
});
for (const id of ['lyster', 'campioni', 'fjfletcher', 'takagi', 'kinkaid', 'moore', 'meyer', 'mitscher', 'ozawa', 'ito']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {lyster:'aggressive', campioni:'cautious', fjfletcher:'methodical', takagi:'aggressive', kinkaid:'methodical', moore:'aggressive', meyer:'cautious', mitscher:'methodical', ozawa:'aggressive', ito:'cautious'});
Object.assign(LIKENESS, {
  mitscher:{w:.86, h:1.02, chin:'pointed', nose:5.4, hook:.3, eye:.84, age:.85, browA:.1, mouthW:4.8, lips:.45, ear:1.15},
  ozawa:{w:.9, h:1.16, chin:'square', jaw:.95, nose:5.4, noseW:1.25, brow:1.4, browA:-.2, age:.6, eye:.8},
  halsey:{w:1.1, h:1, chin:'square', jaw:1, heavy:1, brow:1.6, browA:-.35, nose:4.8, noseW:1.2, mouthW:6.4, age:.7},
  fjfletcher:{w:1, h:1.04, chin:'round', nose:5, age:.6, browA:-.1},
  kinkaid:{w:1.04, h:1, chin:'round', nose:4.6, age:.55, mouthW:5.8},
  lyster:{w:.9, h:1.06, chin:'pointed', nose:5.4, age:.6},
  campioni:{w:.96, h:1.02, nose:5, age:.6, browA:-.15},
  moore:{w:.92, h:1.04, nose:5.2, age:.6},
  takagi:{w:1, h:1, chin:'round', nose:4.4, age:.6, eye:.8},
  ito:{w:.9, h:1.04, chin:'pointed', nose:4.4, age:.6, eye:.82},
  meyer:{w:.98, h:1.02, chin:'square', nose:4.8, age:.45},
});

/* ---------- the battles ---------- */
const NIL = {1:.001, 2:.001};                            // no money from props: no building in these battles
const CARRIER_MISSIONS = {
  taranto:{name:'Taranto', place:'The Mar Grande, Taranto', date:'11 November 1940, 22:30', theme:'sicily', weather:'night', nightAir:true, income:NIL,
    p1:{nat:'uk40', co:'lyster', funds:0, u:{cv:{n:'HMS Illustrious', w:'Swordfish of 815 and 819 Squadrons', shape:'cvuk'}, tb:{n:'Fairey Swordfish (torpedo)', w:'18 in Mk XII torpedo, Duplex magnetic pistol'},
      bmr:{n:'Fairey Swordfish (bombs & flares)', w:'250 lb SAP bombs & parachute flares', snd:'bombs', shape:'swordfish', pow:.65, arm:1.1, mv:8}, dd:{n:'Cruiser Escort', w:'6 in guns'}}},
    p2:{nat:'itrm', co:'campioni', funds:0, u:{bb:{arm:1}, aa:{pow:.6}}},
    names:{1:{cv:['HMS Illustrious'], dd:['HMS Gloucester', 'HMS Berwick']}, 2:{bb:['Littorio', 'Vittorio Veneto', 'Conte di Cavour', 'Giulio Cesare', 'Caio Duilio', 'Andrea Doria'], dd:['Trento', 'Bolzano', 'Trieste', 'Zara']}},
    objective:{win:'kill', role:'bb', n:3, limit:8}, goal:'Put three of the six battleships out of action by {limit}.',
    brief:'The Italian battle fleet lies in its base at Taranto, in the heel of Italy: six battleships in the Mar Grande, cruisers in the inner harbour, behind anti-torpedo nets, barrage balloons and more than twenty anti-aircraft batteries. The Royal Navy has one new carrier in the Mediterranean, HMS Illustrious, and twenty-one Swordfish, canvas biplanes that fly at ninety knots. The crews have trained for months to attack by night. Two aircraft will drop flares along the shore to silhouette the battleships; the rest will come in at thirty feet, under the balloon cables.',
    clock:{start:'1940-11-11T22:30', step:20},
    build:() => { const b = MB(36, 22, '~', 9901);
      b.rect(10, 0, 35, 3, 'G').rect(30, 0, 35, 21, 'G').blobs('.', 8, 10, 0, 35, 21, 1, 2, ['G']).blobs(',', 4, 30, 6, 35, 21, 1, 2, ['G']);
      b.rect(24, 1, 33, 2, '~').set(23, 2, '~');                                       // the Mar Piccolo and the canal under the swing bridge
      b.rect(26, 15, 29, 17, 'G').rect(17, 15, 25, 15, 'n').rect(12, 8, 14, 10, '.').rect(15, 11, 15, 13, 'n');   // Capo San Vito, the Diga di San Vito, San Pietro and the Diga della Tarantola
      b.road([[10, 1], [22, 3], [34, 4]]).road([[31, 4], [31, 21]]);
      b.put([[21, 3, 'q'], [19, 2, 'k'], [24, 3, 'k'], [27, 3, 'o'], [33, 6, 'e'], [12, 1, 'k'], [33, 14, 'k']]);
      return b.rows(); },
    units:{1:'cv 3,19; dd*2 1,16-6,21; tb*5 7,12-12,17; bmr*2 8,15-12,18',
      2:'bb*6 24,5-28,12 !; dd*4 25,1-32,2 !; aa 16,3 !; aa 22,4 !; aa 29,4 !; aa 30,7 !; aa 30,11 !; aa 13,9 !; aa 27,14 !'},
    events:[{day:2, team:2, say:'Taranto\'s guns fire blind into the dark. They will fire more than 13,000 rounds tonight.'},
      {day:4, team:1, say:'The second wave, eight Swordfish under Lieutenant-Commander Hale, arrives from the west.', spawn:'tb*3 0,5-3,11; bmr 0,12-2,14'}]},
  coralsea:{name:'The Coral Sea', place:'The Coral Sea, off the Louisiade Archipelago', date:'7 May 1942, 08:00', theme:'pacific', weather:'clear', income:NIL,
    p1:{nat:'usp', co:'fjfletcher', funds:0, u:{tb:{n:'Douglas TBD Devastator', w:'Mk 13 torpedo', shape:'tbd', pow:.85, arm:1.15}}},
    p2:{nat:'jp', co:'takagi', funds:0},
    names:{1:{cv:['USS Lexington', 'USS Yorktown'], dd:['USS Minneapolis', 'USS Astoria', 'USS Phelps', 'USS Morris']}, 2:{cv:['Shōhō', 'Shōkaku', 'Zuikaku'], dd:['Kinugasa', 'Sazanami', 'Myōkō', 'Haguro', 'Ushio'], merch:['Azumasan Maru', 'Akibasan Maru', 'Mogamigawa Maru', 'Chōwa Maru']}},
    objective:{win:'kill', role:'cv', n:2, limit:13, protect:'cv', protectN:1}, goal:'Sink two of the three Japanese carriers by {limit}, and keep at least one of your own afloat.',
    brief:'The Japanese are sending an invasion convoy round the tip of New Guinea to take Port Moresby, the last Allied base between them and Australia. The light carrier Shōhō covers the convoy; somewhere to the east are Shōkaku and Zuikaku, veterans of Pearl Harbor. Admiral Fletcher has Lexington and Yorktown. It will be the first battle in history between aircraft carriers, fought by fleets that never see each other. Both sides\' scouts are searching an empty ocean, and both make mistakes.',
    clock:{start:'1942-05-07T08:00', step:60},
    build:() => { const b = MB(44, 28, '~', 9902);
      b.blobs('J', 6, 1, 19, 18, 26, 1, 2).blobs('J', 3, 0, 23, 6, 27, 1, 2).blobs('L', 4, 0, 19, 18, 27, 1, 1, ['J']).rect(0, 26, 8, 27, 'J');   // the Louisiades and the tip of New Guinea
      b.blobs('R', 5, 0, 17, 20, 27, 1, 1, ['~']);
      b.put([[3, 26, 'c'], [12, 22, 'c']]);
      return b.rows(); },
    units:{1:'cv 29,19; cv 32,22; dd*4 26,17-36,25; ftr*3 27,18-34,24; bmr*4 26,19-35,24; tb*2 28,21-33,24',
      2:'cv 9,6; cv 37,4; cv 40,7; dd 7,4-12,9; dd 8,5-12,9; dd*3 35,2-42,10; merch*4 2,1-9,5; ftr*3 36,3-42,9; bmr*3 36,4-42,10; tb*2 35,5-41,9'},
    events:[{day:3, team:2, say:'Japanese scouts report a carrier to the south. It is the oiler Neosho and the destroyer Sims, and the whole first strike goes after them.'},
      {day:5, team:2, say:'Hara launches a strike of picked crews, hoping to find the Americans before dark.', spawn:'tb*2 40,0-43,3; bmr 38,0-41,2'},
      {day:6, team:1, say:'Land-based B-17s and Crace\'s cruisers draw the convoy\'s fire off New Guinea.', spawn:'bmr 0,12-2,16'}]},
  eastsolomons:{name:'The Eastern Solomons', place:'North-east of Guadalcanal', date:'24 August 1942, 12:00', theme:'pacific', weather:'clear', income:NIL,
    p1:{nat:'usp', co:'fjfletcher', funds:0, u:{bmr:{n:'Douglas SBD Dauntless', w:'1,000 lb bomb'}}},
    p2:{nat:'jp', co:'nagumo', funds:0, u:{merch:{n:'Transport (Tanaka\'s convoy)', w:'1,500 troops of the Ichiki and Yokosuka 5th SNLF', mv:3}}},
    names:{1:{cv:['USS Saratoga', 'USS Enterprise'], bb:['USS North Carolina'], dd:['USS Portland', 'USS Atlanta', 'USS Balch']}, 2:{cv:['Ryūjō', 'Shōkaku', 'Zuikaku'], merch:['Kinryū Maru', 'Boston Maru', 'Daifuku Maru', 'Patrol Boat No. 2'], dd:['Jintsū', 'Mutsuki', 'Yayoi', 'Tone', 'Amatsukaze', 'Akigumo']}},
    objective:{win:'kill', role:'merch', limit:13, escape:[21, 19, 28, 21], flee:'always'}, goal:'Stop the reinforcement convoy: sink all four of its transports by {limit}, before any of them reaches Taivu Point.',
    brief:'Two weeks after the Marines landed on Guadalcanal, Admiral Tanaka is bringing a convoy of troops to throw them off the island, and the Combined Fleet has come south to cover it. The small carrier Ryūjō is out ahead, as bait. Behind her are Shōkaku and Zuikaku, hoping to catch Fletcher\'s carriers while their aircraft are away. On Henderson Field the Marines have a handful of Dauntlesses and Wildcats. The transports will try to slip in under cover of darkness.',
    clock:{start:'1942-08-24T12:00', step:120},
    build:() => { const b = MB(40, 28, '~', 9903);
      b.rect(0, 23, 39, 27, 'J').rect(0, 22, 39, 22, 's').blobs('L', 6, 0, 22, 39, 24, 1, 2, ['J']).blobs('^', 4, 0, 25, 39, 27, 1, 2, ['J']);   // the north coast of Guadalcanal
      b.rect(35, 11, 39, 19, 'J').rect(34, 12, 34, 18, 's');                          // Malaita
      b.rect(15, 18, 17, 19, 'J').set(16, 17, 's');                                   // Savo Island
      b.put([[14, 23, 'A'], [12, 23, 'C'], [25, 23, 'c'], [37, 15, 'c']]);
      return b.rows(); },
    units:{1:'cv 33,11; cv 36,14; bb 31,12; dd*3 30,9-37,16; ftr*3 31,10-37,15; bmr*3 31,10-37,15; tb*2 32,11-36,14; bmr*2 12,23-16,24; ftr 15,24',
      2:'cv 17,5; cv 9,0; cv 12,1; merch*4 8,4-14,8; dd*3 7,3-15,9; dd*2 15,3-19,7; ftr*3 8,1-14,3; bmr*2 9,0-14,3; tb*2 8,2-13,4'},
    events:[{day:2, team:1, say:'Saratoga\'s strike finds Ryūjō. Shōkaku\'s scouts find Enterprise.'},
      {day:4, team:2, say:'Shōkaku and Zuikaku launch their second strike, but it never finds the American carriers.', spawn:'bmr*2 20,0-28,2'},
      {day:10, team:1, say:'Dawn. B-17s of the 11th Bombardment Group take off from Espíritu Santo.', spawn:'bmr 39,0-39,4'}]},
  santacruz:{name:'Santa Cruz', place:'North of the Santa Cruz Islands', date:'26 October 1942, 07:00', theme:'pacific', weather:'clear', income:NIL,
    p1:{nat:'jp', co:'nagumo', funds:0, u:{cv:{pow:.85}, bb:{n:'Kongō-class Battleship (Vanguard Force)'}}},
    p2:{nat:'usp', co:'kinkaid', funds:0, u:{cv:{arm:.55}, bb:{n:'USS South Dakota', w:'16 in guns, 16 Bofors quads and 57 Oerlikons', dmg:{tb:55, bmr:50, ftr:35}}}},
    names:{1:{cv:['Shōkaku', 'Zuikaku', 'Zuihō'], bb:['Hiei', 'Kirishima'], dd:['Tone', 'Chikuma', 'Kumano', 'Akigumo', 'Makigumo']}, 2:{cv:['USS Enterprise', 'USS Hornet'], bb:['USS South Dakota'], dd:['USS Portland', 'USS San Juan', 'USS Northampton', 'USS Porter']}},
    objective:{win:'kill', role:'cv', limit:13, protect:'cv', protectN:2}, goal:'Sink both American carriers, Enterprise and Hornet, by {limit}. Keep at least two of your three carriers afloat.',
    brief:'The army is about to make another great attack on Henderson Field, and the Combined Fleet has come down to finish the American navy in the South Pacific. Nagumo has Shōkaku, Zuikaku and the light carrier Zuihō, with Kakuta\'s Junyō to the west. Admiral Halsey has given Kinkaid one order: "Attack, repeat, attack." The Americans have only two carriers left in the Pacific, Enterprise and Hornet, and the new battleship South Dakota, bristling with anti-aircraft guns. Your pilots are the best in the world. There are not many of them left.',
    clock:{start:'1942-10-26T07:00', step:60},
    build:() => { const b = MB(44, 28, '~', 9904);
      b.blobs('J', 3, 36, 21, 42, 26, 1, 2).blobs('L', 2, 36, 21, 42, 26, 1, 1, ['J']).blobs('R', 3, 34, 19, 43, 27, 1, 1, ['~']);   // Ndeni and the Santa Cruz reefs
      b.put([[39, 24, 'c']]);
      return b.rows(); },
    units:{1:'cv 10,5 !; cv 13,7 !; cv 9,9 !; bb*2 16,8-20,12; dd*5 7,3-19,13; ftr*3 8,4-14,10; bmr*2 9,5-15,10; tb*2 8,6-14,11',
      2:'cv 31,17; cv 35,20; bb 33,18; dd*4 29,15-38,23; ftr*4 30,16-37,22; bmr*2 30,17-36,21; tb*3 31,18-36,22'},
    events:[{day:2, team:2, say:'Two Enterprise scouts find Zuihō and put a 500 lb bomb through her flight deck.'},
      {day:3, team:1, say:'Kakuta\'s Junyō, far to the west, launches her strike.', spawn:'bmr*2 0,7-2,13; tb 0,9-2,11'},
      {day:6, team:1, say:'Junyō launches again with every aircraft that can still fly.', spawn:'bmr 0,8-2,12; tb 0,9-2,11'}]},
  tungsten:{name:'Operation Tungsten', place:'Kaafjord, northern Norway', date:'3 April 1944, 05:00', theme:'norway', weather:'clear', income:NIL,
    p1:{nat:'uk', co:'moore', funds:0, u:{cv:{n:'Fleet Carrier', w:'Barracudas, Corsairs, Hellcats & Wildcats', shape:'cvuk'}, bmr:{n:'Fairey Barracuda Mk II', w:'1,600 lb armour-piercing & 500 lb bombs', snd:'stuka', shape:'barracuda'},
      ftr:{n:'Vought Corsair Mk II (1834 Squadron)', w:'6x .50 cal', snd:'strafeUS', shape:'corsair'}}},
    p2:{nat:'ger', co:'meyer', funds:0, u:{bb:{n:'Tirpitz', w:'38 cm SK C/34 & 15 cm guns', pow:1.1, arm:.3}, aa:{n:'Flak Battery', w:'10.5 cm & 2 cm Flak', shape:'k61', mt:'tire', pow:1}}},
    names:{1:{cv:['HMS Victorious', 'HMS Furious'], dd:['HMS Milne', 'HMS Ursa']}, 2:{bb:['Tirpitz'], dd:['Z 29', 'Z 30'], merch:['Kärnten', 'C. A. Larsen']}},
    objective:{win:'kill', role:'bb', limit:7}, goal:'Put Tirpitz out of action: sink her where she lies by {limit}.',
    brief:'Tirpitz, Bismarck\'s sister, has lain in Kaafjord for a year, behind nets and flak, tying down half the Home Fleet: while she can sail, every Arctic convoy is in danger. British midget submarines crippled her last September, and the repairs are almost finished. Two carriers and four escort carriers have crept to within 120 miles of Norway. At 04:15 the first strike took off: 21 Barracudas, with Corsairs and Hellcats to shoot up the flak. They will come in over the mountains, just as Tirpitz weighs anchor for her trials.',
    clock:{start:'1944-04-03T05:00', step:30},
    build:() => { const b = MB(36, 22, 'M', 9905);
      b.blobs('T', 10, 0, 0, 35, 21, 1, 2, ['M']).blobs('^', 12, 0, 0, 35, 21, 1, 2, ['M']);
      b.rect(22, 5, 34, 12, '^').rect(0, 11, 16, 17, '^');                             // the shores of Kaafjord and the Altafjord
      b.rect(0, 12, 14, 16, '~').rect(14, 10, 24, 13, '~').rect(24, 8, 31, 10, '~');  // Altafjord narrowing into Kaafjord
      b.scatter('T', .3, 22, 5, 34, 12, ['^']);
      b.put([[6, 18, 'c'], [33, 11, 'k'], [27, 6, 'k']]);
      return b.rows(); },
    units:{1:'cv 1,13 !; cv 2,15 !; dd*2 0,12-4,16 !; bmr*5 0,1-6,7; ftr*4 2,2-8,8',
      2:'bb 29,9 !; merch*2 25,8-27,10 !; dd*2 17,11-22,12; aa 28,7 !; aa 31,7 !; aa 26,11 !; aa 30,11 !; aa 24,7 !; aa 33,9 !'},
    events:[{day:2, team:2, say:'The smoke generators round Kaafjord start up, a minute too late.', smoke:[24, 7, 33, 11, 2]},
      {day:4, team:1, say:'The second strike: nineteen more Barracudas from Victorious and Furious, an hour behind the first.', spawn:'bmr*4 0,1-5,7; ftr*2 0,3-4,9'}]},
  philsea:{name:'The Philippine Sea', place:'West of the Marianas', date:'19 June 1944, 10:00', theme:'pacific', weather:'clear', income:NIL,
    p1:{nat:'usp', co:'mitscher', funds:0, u:{cv:{n:'Essex-class Carrier', w:'Hellcats, Helldivers & Avengers', arm:.75}, ftr:{n:'Grumman F6F-3 Hellcat', w:'6x .50 cal', shape:'hellcat', pow:1.1, arm:.9}, bmr:{n:'Curtiss SB2C Helldiver', w:'1,000 lb bomb', shape:'helldiver', snd:'stuka'},
      bb:{n:'Fast Battleship (Lee\'s Battle Line)', w:'16 in guns & radar-directed 5 in AA', dmg:{tb:40, bmr:35, ftr:25}}}},
    p2:{nat:'jp', co:'ozawa', funds:0, u:{ftr:{n:'Mitsubishi A6M5 Zero', w:'2x 20 mm & 2x 13.2 mm', arm:1.2}, bmr:{n:'Yokosuka D4Y Suisei "Judy"', w:'500 kg bomb', shape:'judy', snd:'stuka', arm:1.25, pow:.55}, tb:{n:'Nakajima B6N Tenzan "Jill"', w:'Type 91 aerial torpedo', shape:'jill', arm:1.25, pow:.6}}},
    names:{1:{cv:['USS Lexington', 'USS Essex', 'USS Bunker Hill', 'USS Enterprise'], bb:['USS South Dakota', 'USS Indiana'], sub:['USS Albacore', 'USS Cavalla'], dd:['USS Stockham', 'USS Yarnall', 'USS Hudson', 'USS Bradford']}, 2:{cv:['Taihō', 'Shōkaku', 'Zuikaku']}},
    objective:{win:'survive', days:8, hold:1, protect:'cv', protectN:3}, goal:'Beat off the raids from Ozawa\'s carriers until {survive}, and keep at least three of your four carriers afloat.',
    brief:'The Americans have landed on Saipan, and the Imperial Navy has come out to fight for the Marianas with nine carriers and 450 aircraft. Ozawa\'s aircraft outrange yours: he means to strike from beyond your reach, land on Guam to refuel and rearm, and strike again. Spruance has ordered Mitscher to stay close to the beachhead and let them come. Your Hellcats have radar to guide them, and your pilots have had two years of training. Ozawa\'s have had six months. Two American submarines are already stalking his carriers.',
    clock:{start:'1944-06-19T10:00', step:60},
    build:() => { const b = MB(44, 26, '~', 9906);
      b.rect(38, 1, 43, 7, '.').blobs('J', 3, 38, 1, 43, 7, 1, 1, ['.']).blobs('L', 3, 38, 1, 43, 7, 1, 1, ['.']).rect(37, 2, 37, 6, 's');   // Saipan and the beachhead
      b.rect(40, 10, 43, 12, '.').rect(37, 18, 42, 24, 'J').rect(36, 19, 36, 23, 's').blobs('^', 2, 38, 19, 42, 24, 1, 1, ['J']);   // Tinian, Guam
      b.put([[41, 4, 'Q'], [39, 3, 'C'], [41, 6, 'A'], [41, 11, 'c'], [38, 21, 'e'], [40, 19, 'k']]);
      return b.rows(); },
    units:{1:'cv 27,9 !; cv 30,12 !; cv 27,15 !; cv 31,17 !; bb*2 22,10-24,15; dd*4 21,7-33,18; ftr*5 22,7-34,18; bmr*2 27,10-31,16; sub*2 5,5-9,19',
      2:'cv*3 1,6-3,18 !; dd*2 0,5-4,19; ftr*3 8,8-12,16; bmr*3 8,9-12,15; tb*2 9,10-12,14'},
    events:[{day:2, team:2, say:'Raid II: 128 aircraft from Ozawa\'s big carriers.', spawn:'bmr*3 0,7-3,17; tb*2 0,9-3,15; ftr*2 0,10-3,14'},
      {day:3, team:1, say:'USS Albacore fires six torpedoes at Taihō. A pilot taking off sees one and dives his aircraft into it; another hits.'},
      {day:4, team:2, say:'Raid III, 47 aircraft, is sent to the wrong position. Raid IV heads for Guam to refuel.', spawn:'bmr*2 0,8-3,16; ftr 0,11-3,13'},
      {day:5, team:2, say:'Raid IV arrives over Guam and tries to land at Orote Field.', spawn:'bmr*2 33,17-35,24; tb 33,19-35,23; ftr 34,20-35,22'},
      {day:6, team:1, say:'Hellcats from Essex and Cowpens catch the raiders in the landing circuit over Orote.', spawn:'ftr*2 34,13-36,16'}]},
  engano:{name:'Cape Engaño', place:'East of Cape Engaño, Luzon', date:'25 October 1944, 08:00', theme:'pacific', weather:'clear', income:NIL,
    p1:{nat:'usp', co:'halsey', funds:0, u:{cv:{n:'Essex-class Carrier', w:'Hellcats, Helldivers & Avengers'}, ftr:{n:'Grumman F6F-5 Hellcat', w:'6x .50 cal & rockets', shape:'hellcat', pow:1.1, arm:.9}, bmr:{n:'Curtiss SB2C Helldiver', w:'1,000 lb bomb', shape:'helldiver', snd:'stuka'}}},
    p2:{nat:'jp', co:'ozawa', funds:0, u:{cv:{n:'Decoy Carrier (Northern Force)', w:'a few Zeros: 108 aircraft in four carriers', pow:.35}, bb:{n:'Ise-class Hybrid Battleship-Carrier', w:'14 in guns & 12 cm AA rocket launchers', dmg:{tb:40, bmr:35, ftr:25}},
      ftr:{n:'Mitsubishi A6M5 Zero', w:'2x 20 mm & 2x 13.2 mm', arm:1.2}}},
    names:{1:{cv:['USS Essex', 'USS Intrepid', 'USS Franklin', 'USS Lexington', 'USS Langley'], dd:['USS Santa Fe', 'USS Mobile', 'USS Wichita']}, 2:{cv:['Zuikaku', 'Zuihō', 'Chitose', 'Chiyoda'], bb:['Ise', 'Hyūga'], dd:['Ōyodo', 'Tama', 'Isuzu', 'Hatsuzuki']}},
    objective:{win:'kill', role:'cv', limit:8, escape:[0, 0, 43, 0]}, goal:'Sink all four of Ozawa\'s carriers by {limit}, before the damaged ones get away to the north.',
    brief:'Leyte Gulf. For two days the Japanese have come at the landings from the west and south. Last night Halsey\'s scouts at last found the missing piece, a force of carriers to the north, and he has taken the whole of the Third Fleet after them. What he does not know is that they are bait. Ozawa\'s four carriers have barely a hundred aircraft between them; their job is to be found, and sunk, while Kurita\'s battleships slip through the strait Halsey has left unguarded. Zuikaku, the last of the six carriers that struck Pearl Harbor, is among them.',
    clock:{start:'1944-10-25T08:00', step:60},
    build:() => { const b = MB(44, 26, '~', 9907);
      b.rect(0, 17, 3, 25, 'J').rect(4, 18, 4, 25, 's').blobs('^', 2, 0, 18, 3, 25, 1, 1, ['J']);   // the north-east tip of Luzon
      b.put([[1, 19, 'c'], [2, 23, 'c']]);
      return b.rows(); },
    units:{1:'cv*5 28,15-38,23; dd*3 26,13-40,24; ftr*2 28,14-38,22; bmr*3 27,15-39,23; tb*3 28,16-38,23',
      2:'cv*4 10,2-20,6; bb*2 12,4-20,8; dd*4 8,1-22,9; ftr*2 12,3-17,7'},
    events:[{day:3, team:1, say:'Kinkaid signals from Leyte: Kurita\'s battleships are attacking the escort carriers off Samar.'},
      {day:4, team:1, say:'A signal from Nimitz: "Where is, repeat, where is, Task Force Thirty Four? The world wonders." Halsey turns his battleships south. The carriers stay.'},
      {day:5, team:1, say:'Mitscher\'s third strike, the largest of the day, finds Zuikaku and Zuihō.', spawn:'bmr*2 40,20-43,25; tb*2 40,18-43,24'}]},
  tengo:{name:'Ten-Go', place:'The East China Sea, south-west of Kyushu', date:'7 April 1945, 12:30', theme:'pacific', weather:'overcast', income:NIL, hard:true,
    p1:{nat:'jp', co:'ito', funds:0, u:{bb:{n:'Yamato', w:'46 cm Type 94 guns & 150 25 mm AA guns', pow:1.2, arm:.35, mv:4, dmg:{tb:60, bmr:55, ftr:40}}, dd:{n:'Destroyer (2nd Destroyer Squadron)', w:'12.7 cm guns & Type 93 torpedoes'}}},
    p2:{nat:'usp', co:'mitscher', funds:0, u:{cv:{n:'Essex-class Carrier', w:'Hellcats, Helldivers & Avengers'}, ftr:{n:'Grumman F6F-5 Hellcat', w:'6x .50 cal & rockets', shape:'hellcat', pow:1.1, arm:.9}, bmr:{n:'Curtiss SB2C Helldiver', w:'1,000 lb bomb', shape:'helldiver', snd:'stuka'},
      bb:{n:'Old Battleship (Task Force 54)', w:'14 in and 16 in guns', pow:.95}}},
    names:{1:{bb:['Yamato'], dd:['Yahagi', 'Yukikaze', 'Isokaze', 'Hamakaze', 'Kasumi', 'Asashimo']}, 2:{cv:['USS Essex', 'USS Bunker Hill'], bb:['USS West Virginia', 'USS Maryland'], dd:['USS Tuscaloosa', 'USS Birmingham', 'USS Laws']}},
    objective:{win:'survive', days:6, hold:1, protect:'bb', protectN:1}, goal:'Keep Yamato afloat until nightfall, {survive}. After dark the carrier aircraft cannot find her, and the way to Okinawa is open.',
    brief:'Okinawa has been invaded. The navy has almost no fuel and no carriers left with aircraft, but it has Yamato, the largest battleship ever built. Operation Ten-Go sends her south with the cruiser Yahagi and eight destroyers, to beach herself among the American transports and fire her 18-inch guns until she is destroyed. There will be no air cover. Admiral Itō has protested; Tokyo has told him the Emperor expects it. The Americans have read the signals, and Mitscher\'s carriers are waiting. Every hour she lives brings her closer to the beaches, and after dark the aircraft cannot find her.',
    clock:{start:'1945-04-07T12:30', step:60},
    build:() => { const b = MB(40, 26, '~', 9908);
      b.rect(0, 0, 8, 2, 'J').rect(0, 3, 4, 3, 'J').blobs('^', 2, 0, 0, 8, 2, 1, 1, ['J']).rect(0, 3, 8, 3, 's', ['~']);   // the southern tip of Kyushu
      b.rect(30, 18, 39, 25, '.').blobs('J', 4, 31, 18, 39, 25, 1, 2, ['.']).blobs('^', 3, 32, 18, 39, 25, 1, 1, ['.', 'J']).rect(29, 18, 29, 25, 's');   // Okinawa and the Hagushi beaches
      b.put([[1, 1, 'Q'], [5, 1, 'C'], [32, 20, 'e'], [34, 23, 'k'], [36, 19, 'k']]);
      return b.rows(); },
    units:{1:'bb 13,9; dd*6 10,7-17,13',
      2:'cv 36,2 !; cv 38,5 !; dd 34,1-39,7 !; ftr*2 30,3-36,9; bmr*2 32,2-38,9; tb 31,4-37,11; bb*2 25,20-28,24 !; dd*2 24,19-28,25 !'},
    events:[{day:2, team:2, say:'The main body of the first wave, nearly 280 aircraft in all, comes down through the low cloud.', spawn:'bmr 38,6-39,12; tb*2 38,8-39,14'},
      {day:3, team:1, say:'Far to the south, the first of the Kikusui kamikaze attacks strikes the fleet off Okinawa.'},
      {day:4, team:2, say:'The second wave. The torpedo bombers are told to aim for one side, to capsize her.', spawn:'tb*2 38,8-39,16; bmr 38,10-39,14'},
      {day:7, team:2, say:'Search planes keep contact and call in the stragglers.'}]},
};
for (const [id, m] of Object.entries(CARRIER_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

/* ---------- history ---------- */
Object.assign(HISTORY, {
  taranto:{forces:['HMS Illustrious with 21 Fairey Swordfish of 815 and 819 Squadrons, in two waves', 'Six battleships, seven heavy cruisers and two light cruisers, behind nets, balloons and 21 anti-aircraft batteries'],
    win:'Three battleships are torpedoed in their own harbour. The balance of sea power in the Mediterranean shifts in a night.', lose:'The Swordfish are shot down or miss in the dark, and the Italian fleet is still a threat.',
    real:'In two waves, an hour apart, the Swordfish came in under the balloon cables and torpedoed Littorio three times and Conte di Cavour and Caio Duilio once each; bombs hit a cruiser and the seaplane base. Two Swordfish were shot down: one crew was killed, the other taken prisoner. Cavour settled on the bottom and never sailed again; Littorio and Duilio were out of action for months, and the next day the rest of the fleet moved north to Naples. For the first time, a battle fleet had been crippled by aircraft alone. The Japanese navy studied the attack closely as it planned Pearl Harbor.'},
  coralsea:{forces:['Task Force 17: Lexington and Yorktown with about 140 aircraft, cruisers and destroyers', 'The light carrier Shōhō covering the Port Moresby invasion force, and Shōkaku and Zuikaku with about 120 aircraft'],
    win:'Two Japanese carriers are sunk and the invasion of Port Moresby is called off.', lose:'The American carriers are sunk and Port Moresby falls.',
    real:'On 7 May the American strike found Shōhō and sank her in minutes ("Scratch one flat-top!"), while the Japanese sank the oiler Neosho and the destroyer Sims, mistaken for a carrier. On 8 May the two carrier forces struck each other at the same time. Shōkaku was hit by three bombs and put out of action; Lexington was hit by two torpedoes and two bombs, and that afternoon petrol vapour exploded inside her and she had to be abandoned and scuttled. Yorktown was damaged. It was a tactical draw, but the invasion convoy turned back, the first Japanese advance of the war to be stopped. Shōkaku was under repair and Zuikaku had lost too many aircraft to sail for Midway a month later; Yorktown, patched up in three days, was there.'},
  eastsolomons:{forces:['Saratoga and Enterprise, the battleship North Carolina, and the Marine aircraft on Henderson Field', 'Shōkaku, Zuikaku and the light carrier Ryūjō, covering Tanaka\'s convoy of 1,500 troops'],
    win:'The convoy is shot to pieces and never reaches Guadalcanal.', lose:'The transports reach Taivu Point and land their troops.',
    real:'On 24 August Saratoga\'s aircraft sank Ryūjō, and Japanese dive bombers hit Enterprise with three bombs, killing 74 men; skilful damage control kept her going. Next morning Marine Dauntlesses from Henderson Field found Tanaka\'s convoy, set the flagship Jintsū on fire and sank the transport Kinryū Maru, and B-17s sank the destroyer Mutsuki. The convoy turned back. From then on the Japanese ran their troops to Guadalcanal by night in fast destroyers, which the Americans called the Tokyo Express.'},
  santacruz:{forces:['Shōkaku, Zuikaku, Zuihō and Junyō with about 200 aircraft, and the battleships of the Vanguard Force', 'Enterprise and Hornet with about 130 aircraft, and the battleship South Dakota'],
    win:'Both American carriers are sunk. For a time the US Navy has no carrier in the South Pacific.', lose:'The Japanese carriers are hit and the pilots do not come back.',
    real:'Both sides\' strike forces passed each other in the air. American bombs wrecked the flight decks of Zuihō and Shōkaku, which was out of action for nine months. Japanese aircraft hit Hornet with bombs, torpedoes and two crashing aircraft; she was abandoned, and Japanese destroyers sank the burning hulk that night. Enterprise was hit by two bombs, and South Dakota\'s guns shot down many of the attackers. It was a Japanese victory: for some weeks Enterprise, patched up, was the only American carrier in the Pacific, and a sign on her flight deck read "Enterprise vs Japan". But Japan lost about 150 veteran aircrew, more than at Midway, and its carriers could not fight again for the rest of the Guadalcanal campaign.'},
  tungsten:{forces:['Victorious and Furious and four escort carriers: 42 Barracudas in two strikes, with about 80 fighters', 'The battleship Tirpitz, flak batteries round Kaafjord, smoke generators and her escorts'],
    win:'Tirpitz goes down in Kaafjord, and the Home Fleet is free.', lose:'The bombs bounce off Tirpitz\'s armour deck, and she is soon at sea again.',
    real:'The first strike achieved complete surprise just as Tirpitz was weighing anchor; the second followed an hour later. In all she was hit by 14 bombs. 122 of her crew were killed and more than 300 wounded, and she was out of action for three months, for the loss of four British aircraft. But many bombs were dropped too low to pierce her main armour deck, and she did not sink. Further carrier strikes that summer failed in the smoke. On 12 November 1944 RAF Lancasters with 12,000 lb Tallboy bombs capsized her off Tromsø, killing about 950 men.'},
  philsea:{forces:['Task Force 58: 15 carriers with about 900 aircraft, seven fast battleships, and submarines', 'The Mobile Fleet: nine carriers with about 450 aircraft, and land-based aircraft on Guam'],
    win:'The raids are shot down before they reach the carriers.', lose:'The Japanese get through to the carriers and the Saipan landings are in danger.',
    real:'On 19 June Ozawa launched four great raids. Radar picked them up far out, and the Hellcats destroyed them: more than 300 Japanese aircraft were lost that day, against about 30 American. A pilot called it "an old-time turkey shoot". The same day the submarines Albacore and Cavalla sank Taihō and Shōkaku. On the 20th Mitscher launched a strike at extreme range late in the afternoon that sank the carrier Hiyō; the aircraft came back in the dark, short of fuel, and Mitscher ordered the fleet to turn on its lights to guide them in. About 80 aircraft were lost ditching or crashing on deck, but most of the crews were picked up. Japan\'s carrier air arm was finished.'},
  engano:{forces:['Task Force 38: ten fleet and light carriers with hundreds of aircraft, and six fast battleships', 'The Northern Force: Zuikaku, Zuihō, Chitose and Chiyoda with 108 aircraft, the hybrid battleships Ise and Hyūga, and light cruisers and destroyers'],
    win:'All four carriers are sunk. The last of the Kidō Butai is gone.', lose:'The carriers get away, and the decoy has cost Japan nothing.',
    real:'From 08:00 Mitscher\'s aircraft struck Ozawa\'s force in waves all day. Chitose, Zuikaku and Zuihō were sunk by aircraft; Chiyoda was left crippled and finished off by American cruisers. Zuikaku, the last of the carriers of Pearl Harbor, went down at 14:14. Ise and Hyūga, with their new rocket anti-aircraft batteries, escaped. But the decoy had worked: while Halsey ran north, Kurita\'s battleships came through the San Bernardino Strait and fell on the escort carriers off Samar. Halsey turned his battleships south at 11:15, too late to catch Kurita.'},
  tengo:{forces:['The battleship Yamato, the light cruiser Yahagi and eight destroyers, without air cover', 'Task Force 58: about 380 carrier aircraft in waves, and the old battleships of Task Force 54 off Okinawa'],
    win:'Yamato lives through the day and steams on through the night towards the beaches of Okinawa.', lose:'Yamato is sunk before dark, far short of Okinawa.',
    real:'American submarines saw the force sail, and Mitscher launched his aircraft before Spruance\'s battleships could get at her. From 12:32 wave after wave attacked through the low cloud. Yamato was hit by about ten torpedoes and seven bombs, most on her port side; at 14:23 she capsized and her magazines exploded, a cloud seen from Kyushu. About 3,000 of her crew died, with Admiral Itō, who had ordered the operation cancelled and the survivors picked up. Yahagi and four destroyers were sunk too. The Americans lost ten aircraft and twelve men.'},
});
Object.assign(CO_FATE, {
  lyster:'Became Fifth Sea Lord, responsible for naval aviation, and later commanded the carriers of the Home Fleet. Died in 1957.',
  campioni:'Governor of the Dodecanese at the armistice of 1943. Captured by the Germans after the fall of Rhodes, he was handed over to Mussolini\'s Social Republic, refused to recognise it, and was shot in Parma on 24 May 1944.',
  fjfletcher:'Commanded the North Pacific Force from 1943 until the end of the war, and retired as a full admiral. Died in 1973.',
  takagi:'Commanded the submarines of the Sixth Fleet from Saipan, where he was killed during the American invasion in July 1944.',
  kinkaid:'Commanded the Seventh Fleet, whose battleships sank two Japanese battleships at Surigao Strait in October 1944. Died in 1972.',
  moore:'Commanded the Home Fleet in the last year of the war. Died in 1978.',
  meyer:'Was wounded on Tirpitz\'s bridge in the first strike. His ship was finally sunk by RAF Lancasters off Tromsø on 12 November 1944.',
  mitscher:'Led the fast carriers to the end of the war, through Iwo Jima and Okinawa, where kamikazes hit two of his flagships. Died in February 1947, worn out, aged 60.',
  ozawa:'Was made the last Commander-in-Chief of the Combined Fleet in May 1945, and refused promotion to full admiral. Died in 1966.',
  ito:'Went down with Yamato on 7 April 1945, having ordered the operation cancelled and the survivors rescued.',
});
Object.assign(MISSION_LONLAT, {taranto:[17.22, 40.47], coralsea:[155.5, -15.5], eastsolomons:[161.5, -8.0], santacruz:[166.3, -8.6], tungsten:[22.95, 69.95], philsea:[143.0, 14.0], engano:[126.0, 19.5], tengo:[128.07, 30.37]});
Object.assign(UNIT_INFO, {
  'itrm:bb':'The new battleship Littorio had 381 mm guns and the latest Pugliese underwater protection, but at Taranto the anti-torpedo nets reached only part of the way to the bottom, and the British torpedoes ran beneath them.',
  'itrm:aa':'Taranto\'s anti-aircraft batteries fired more than 13,000 rounds on the night of 11 November 1940 and shot down two Swordfish. The guns were aimed high, at the height bombers usually flew; the Swordfish came in at thirty feet.',
});

/* ---------- the campaign ---------- */
CAMPAIGNS.push({id:'carrier', name:'The Carrier War', sub:'Taranto to Ten-Go · 1940–1945', side:'allies', missions:['taranto', 'coralsea', 'eastsolomons', 'santacruz', 'tungsten', 'philsea', 'engano', 'tengo']});
{ const order = ['training', 'china', 'weiss', 'gelb', 'sea', 'atlantic', 'carrier', 'desert', 'italy', 'rising', 'pacific', 'east', 'west', 'axis'];
  CAMPAIGNS.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)); }
