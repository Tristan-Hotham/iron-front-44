/* ============================== BARBAROSSA ==============================
   Operation Barbarossa from the German side, 22 June to December 1941: the
   greatest invasion in history, from the walls of the Brest fortress to the
   gates of Moscow, and then the frost, and the Siberians. */

/* the Ostheer of 1941: Czech tanks, short guns, horses, and nothing for the winter */
const GER41 = {tank:{n:'Panzer 38(t)', w:'3.7 cm KwK 38(t)', shape:'pz2', pow:.8, cost:5500}, mtank:{n:'Panzer III Ausf. G', w:'5 cm KwK 38 L/42', shape:'pz3'}, htank:{n:'Panzer IV Ausf. E', w:'7.5 cm KwK 37 L/24', shape:'pz4d'},
  aa:{n:'8.8 cm Flak 36', w:'88 mm: the only gun that stops a KV', snd:'gun88', shape:'flak88', mt:'tire', mv:4, cost:10000, dmg:{inf:60, at:60, recon:110, apc:110, tank:100, mtank:85, htank:70, art:80, rkt:90, aa:70, ftr:70, bmr:80, cav:65, mortar:60, eng:60, nest:40, pak:40}},
  rkt:{n:'Nebelwerfer 41', w:'15 cm rockets x6', snd:'nebel', shape:'nebel', mv:4, cost:12000}};
const SU41B = {tank:{n:'BT-7', w:'45 mm 20-K', snd:'gun50', shape:'t26', pow:.8, mv:8, cost:5000}, mtank:{n:'T-34 Model 1941', w:'76 mm F-34'}, htank:{n:'KV-1', w:'76 mm L-11'}};

Object.assign(CO, {
  schlieper:{n:'Fritz Schlieper', nat:'ger40', rank:'Generalmajor', nick:'45. Infanterie-Division',
    bio:'Commanded the 45th Infantry Division, Austrians from Linz, which was given the job of taking the fortress of Brest-Litovsk on the first morning of the invasion. It was expected to take hours. It took a week, and the division lost more men there than in the whole Polish and French campaigns.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Feuerschlag', star:3, txt:'Artillery +30% firepower.', atk:{indirect:30}},
    scop:{n:'Karl', star:6, txt:'All units +25% firepower; the 600 mm siege mortars shell two positions for 4 HP.', atk:{all:25}, strike:{n:2, r:1, hp:4, kind:'barrage'}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#6a6c5c', collar:'#e8e8e0'},
    say:{start:'Over the Bug at 03:15. The fortress by breakfast.', win:'The citadel has fallen.', lose:'They are still in the casemates.', power:'Karl, fire!'}},
  raus:{n:'Erhard Raus', nat:'ger40', rank:'Oberst', nick:'Kampfgruppe Raus',
    bio:'Commanded a battle group of the 6th Panzer Division in Lithuania. On 24 June 1941 a single Soviet KV-2 heavy tank sat across his only supply road at Raseiniai for a day and a night; his 37 mm and 50 mm guns could not hurt it, and it took an 88 and a team of pioneers to stop it.',
    d2d:{txt:'Anti-aircraft guns +15% firepower.', atk:{indirect:10, armour:10}},
    cop:{n:'Bring Up the 88', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'Pioniere vor!', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#2a2a2a', collar:'#e8e8e0'},
    say:{start:'What is that thing? Our shells bounce off it.', win:'The monster is dead.', lose:'It is still there.', power:'Get the 88 forward!'}},
  hoth:{n:'Hermann Hoth', nat:'ger40', rank:'Generaloberst', nick:'Panzergruppe 3',
    bio:'Commanded the 3rd Panzer Group, the northern pincer of Army Group Centre. At Minsk and then Smolensk his panzers met Guderian\'s far behind the Soviet front, trapping hundreds of thousands of men in the pockets.',
    d2d:{txt:'Armour +10% defence.', def:{armour:10}},
    cop:{n:'Close the Ring', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Kessel', star:6, txt:'All units +30% firepower and defence.', atk:{all:30}, def:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#c8c4bc', jaw:1, tunic:'#6a6c5c', collar:'#c03030'},
    say:{start:'Hold the ring. They will try to break out to the east.', win:'The pocket is closed.', lose:'They are getting out!', power:'Hold!'}},
  hausser:{n:'Paul Hausser', nat:'ger40', rank:'SS-Gruppenführer', nick:'Das Reich',
    bio:'A retired army general who built the Waffen-SS into a fighting force. At Borodino, on the old battlefield of 1812, his division fought the Siberians of the 32nd Rifle Division in October 1941; he lost an eye to a shell splinter there.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Vorwärts', star:3, txt:'All ground units +1 move.', mv:{ground:1}},
    scop:{n:'Borodino', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:2, tunic:'#5a5c4c', collar:'#1a1a1a', patch:true},
    say:{start:'Napoleon fought here. So shall we.', win:'The Moscow road is open.', lose:'These Siberians do not give ground.', power:'Angriff!'}},
  gavrilov:{n:'Pyotr Gavrilov', nat:'su41', rank:'Major', nick:'The East Fort',
    bio:'Commander of the 44th Rifle Regiment, he held the East Fort of the Brest fortress for nearly a month after the Germans had taken everything around it. Found wounded and half-starved on 23 July 1941, he survived the prison camps, and was then expelled from the Party for having been captured.',
    d2d:{txt:'Infantry +20% defence.', def:{foot:20}},
    cop:{n:'The Casemates', star:3, txt:'All units +30% defence.', def:{all:30}},
    scop:{n:'I Am Dying But I Do Not Surrender', star:6, txt:'All units +40% defence and +20% firepower.', def:{all:40}, atk:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#5a4a3a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'No one leaves the fortress.', win:'They are pulling back from the walls.', lose:'Farewell, Motherland.', power:'Za Rodinu!'}},
  solyankin:{n:'Yegor Solyankin', nat:'su41', rank:'Major General', nick:'2nd Tank Division',
    bio:'Commanded the 2nd Tank Division, which had some of the new KV heavy tanks, at Raseiniai in June 1941. His division counter-attacked the panzers, ran out of fuel and ammunition, and was destroyed. He was killed on 26 June.',
    d2d:{txt:'Heavy tanks +15% defence.', def:{armour:15}},
    cop:{n:'Counter-attack', star:3, txt:'Armour +20% firepower.', atk:{armour:20}},
    scop:{n:'The Monsters', star:6, txt:'Armour +35% firepower and +1 move.', atk:{armour:35}, mv:{armour:1}},
    look:{cap:'tankhelm', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a5040'},
    say:{start:'Ram them if the shells run out.', win:'They are running from the KVs.', lose:'No fuel. No shells.', power:'Vperyod!'}},
  kirponos:{n:'Mikhail Kirponos', nat:'su41', rank:'Colonel General', nick:'South-Western Front',
    bio:'Commanded the South-Western Front, defending Kiev. Stalin forbade him to retreat until it was too late, and when Guderian and Kleist met behind him at Lokhvitsa, four Soviet armies were trapped. He was killed trying to break out on 20 September 1941.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Hold Kiev', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Break Out', star:6, txt:'All ground units +2 move and +20% firepower.', mv:{ground:2}, atk:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Stalin says Kiev will be held.', win:'The ring is broken.', lose:'We are surrounded.', power:'Za Rodinu!'}},
  polosukhin:{n:'Viktor Polosukhin', nat:'su41', rank:'Colonel', nick:'32nd Rifle Division',
    bio:'Commanded the 32nd Rifle Division, brought from the Far East to Borodino in October 1941 to hold the Mozhaisk line. His Siberians fought the SS division Das Reich for five days on the old battlefield of 1812. He was killed in February 1942.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Mozhaisk Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Siberians', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#5a4a3a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Behind us is Moscow.', win:'Not one step back.', lose:'Fall back on Mozhaisk.', power:'Urra!'}},
  boldin:{n:'Ivan Boldin', nat:'su41', rank:'Lieutenant General', nick:'50th Army, Tula',
    bio:'Escaped from encirclement twice in 1941, walking out of the Minsk and Vyazma pockets with his men. In November he held Tula, the arms-making city south of Moscow, with the 50th Army, the city\'s workers\' regiment and its anti-aircraft guns firing over open sights at Guderian\'s panzers.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Workers\' Regiment', star:3, txt:'Infantry +25% defence.', def:{foot:25}},
    scop:{n:'Tula Holds', star:6, txt:'All units +35% defence; all units recover 2 HP.', def:{all:35}, heal:2},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Tula will not be given up.', win:'Guderian is stopped.', lose:'Tula is surrounded.', power:'Every gun on the tanks!'}},
});
for (const id of ['schlieper', 'raus', 'hoth', 'hausser', 'gavrilov', 'solyankin', 'kirponos', 'polosukhin', 'boldin']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {schlieper:'methodical', raus:'opportunist', hoth:'cautious', hausser:'aggressive', gavrilov:'cautious', solyankin:'reckless', kirponos:'cautious', polosukhin:'cautious', boldin:'cautious'});
if (!CAP_EXTRA.tankhelm) CAP_EXTRA.tankhelm = (P, L) => { const c = '#3a3a30'; P.ell(24, 11, 14, 8, c); P.R(10, 11, 28, 4, c); for (let i = 0; i < 3; i++) P.R(15 + i * 6, 4, 4, 9, shade(c, .1)); P.R(16, 14, 16, 2, shade(c, -.2)); };   // the padded Soviet tanker's helmet

const BARBAROSSA_MISSIONS = {
  brest:{name:'The Brest Fortress', place:'The citadel of Brest-Litovsk on the Bug', date:'22 June 1941, 03:15', theme:'poland', weather:'clear',
    p1:{nat:'ger40', co:'schlieper', funds:0, u:Object.assign({}, GER41, {rkt:{n:'Gerät 040 "Karl" (600 mm siege mortar)', w:'2-tonne concrete-piercing shells', snd:'howitzer', shape:'m30', rng:[3,6], mv:2, cost:20000, pow:1.4}, inf:{n:'45. Infanterie-Division', w:'Kar98k & MG 34'}})},
    p2:{nat:'su41', co:'gavrilov', funds:0, u:{inf:{n:'Fortress Garrison (6th & 42nd Rifle Divisions)', w:'Mosin-Nagant, DP-27 & grenades'}, nest:{n:'Casemate in the Ring Barracks', w:'Maxims in a wall two metres thick'}, tank:{n:'T-26 (22nd Tank Division)', shape:'t26', w:'45 mm', pow:.8}}},
    objective:{win:'hq', limit:15}, goal:'Take the citadel of the Brest fortress by {limit}.',
    brief:'At 03:15 on Sunday 22 June 1941, three million German soldiers invade the Soviet Union along a front of a thousand miles. The first objective, right on the border, is the old fortress of Brest-Litovsk: a citadel on an island where the Bug and the Mukhavets meet, ringed by two kilometres of barracks with walls two metres thick. Its garrison is asleep, and half of it is on leave. The 45th Infantry Division is to take it in a few hours. The barracks are full of men who will not surrender.',
    clock:{start:'1941-06-22T03:15', step:120},
    build:() => { const b = MB(34, 22, '.', 40101);
      b.blobs('T', 6, 0, 0, 33, 21, 1, 2).scatter(',', .2, 0, 0, 33, 21, ['.']);
      b.river([[6, 0], [7, 8], [6, 14], [7, 21]], .1);                                             // the Bug
      b.river([[7, 13], [16, 15], [26, 14], [33, 15]], .1);                                         // the Mukhavets
      b.rect(14, 6, 24, 12, 'U').rect(16, 7, 22, 11, '.').rect(17, 8, 21, 10, 'B', ['.']);          // the ring barracks round the citadel
      b.rect(26, 3, 29, 6, 'B').rect(27, 4, 28, 5, '.');                                             // the East Fort
      b.road([[0, 9], [14, 9], [24, 9], [33, 8]]).road([[19, 0], [19, 21]]);
      b.put([[1, 9, 'Q'], [3, 3, 'C'], [3, 17, 'C'], [19, 9, 'q'], [15, 7, 'k'], [23, 11, 'k'], [27, 4, 'k'], [30, 18, 'k'], [12, 19, 'c']]);
      return b.rows(); },
    units:{1:'inf*9 0,2-5,19; eng*3 2,7-5,12; art*3 0,5-2,15; rkt 1,10; mortar*2 3,6-5,13; htank*2 2,15-5,19; at 4,9',
      2:'inf*7 14,6-24,12; nest*5 14,6-24,12; mortar*2 17,7-21,11; at*2 15,8-23,10; inf*2 26,3-29,6; art 30,10'},
    events:[{day:1, team:1, say:'03:15. Every German gun on the border fires at once. The garrison wakes up under the shells.', hurt:1},
      {day:2, team:2, say:'Commissar Fomin and the regimental officers rally the men in the citadel. They counter-attack with the bayonet.', spawn:'inf*3 16,7-22,11'},
      {day:3, team:1, say:'The pioneers bring up flamethrowers and lower explosive charges into the casemates from above.', heal:1},
      {day:4, team:2, say:'Men cut off in the Kobrin fortification break back into the citadel.', spawn:'inf*2 22,15-26,19'},
      {day:5, team:1, say:'A Ju 88 drops a 1,800 kg bomb on the East Fort.', hurt:1}]},
  raseiniai:{name:'Raseiniai', place:'The Dubysa crossings, Lithuania', date:'24 June 1941, 06:00', theme:'normandy', weather:'clear',
    p1:{nat:'ger40', co:'raus', funds:0, u:Object.assign({}, GER41, {tank:{n:'Panzer 35(t)', w:'3.7 cm KwK 34(t)', shape:'pz2', pow:.75, cost:5000}})},
    p2:{nat:'su41', co:'solyankin', funds:0, u:Object.assign({}, SU41B, {htank:{n:'KV-2', w:'152 mm M-10 howitzer', snd:'howitzer', shape:'kv1', arm:.55, pow:1, mv:3}})},
    objective:{win:'kill', role:'htank', n:3, limit:9}, goal:'Stop the monsters: knock out three of the KV heavy tanks by {limit}. Your 37 mm guns will bounce off them; the 88s and pioneers will not.',
    whyText:{kill:'the KVs are burning'},
    brief:'The 6th Panzer Division has crossed the Dubysa river in Lithuania. It is equipped with light Czech tanks, the Panzer 35(t), which were good enough for France. This morning the Soviet 2nd Tank Division counter-attacks with something no German has ever seen: the KV, forty-five tonnes of armour, which shrugs off every gun in the division. One KV-2 has parked across the only road behind you and is shooting up the supply lorries. Find a way to kill them.',
    clock:{start:'1941-06-24T06:00', step:120},
    build:() => { const b = MB(34, 20, '.', 40202);
      b.blobs('T', 8, 0, 0, 33, 19, 1, 2).scatter(',', .3, 0, 0, 33, 19, ['.']).blobs('v', 2, 10, 0, 24, 19, 1, 1, ['.', ',']);
      b.river([[8, 0], [9, 10], [8, 19]], .15);                                                    // the Dubysa
      b.road([[0, 10], [33, 9]]).road([[0, 4], [8, 6], [20, 5], [33, 4]]);
      b.put([[2, 10, 'Q'], [4, 3, 'C'], [4, 16, 'C'], [14, 9, 'C'], [22, 4, 'k'], [24, 15, 'k'], [31, 9, 'q']]);
      return b.rows(); },
    units:{1:'tank*6 10,6-16,14; mtank*3 12,8-15,12; aa*3 3,8-6,12; inf*5 10,4-17,16; eng*2 11,9-14,11; art*3 1,6-4,14; at*2 13,5-16,15',
      2:'htank*2 22,6-28,13; tank*4 21,2-28,17; mtank 24,8-27,12; inf*4 20,3-27,17; art 29,5-33,14; htank 6,9'},
    events:[{day:2, team:2, say:'More KVs come out of the forest. Shells bounce off them in showers of sparks.', spawn:'htank 26,2-31,8'},
      {day:3, team:1, say:'A battery of 88s is dragged forward under cover of the panzers.', spawn:'aa 10,8-12,12'},
      {day:4, team:2, say:'The Soviet tanks run low on fuel and shells. Some crews ram the panzers.', hurt:1, hurtTeam:2},
      {day:5, team:1, say:'The 1st Panzer Division comes up on the flank.', spawn:'mtank*3 14,0-20,2'}]},
  smolensk:{name:'The Smolensk Pocket', place:'The Dnieper crossing at Yartsevo', date:'20 July 1941, 06:00', theme:'steppe', weather:'clear',
    p1:{nat:'ger40', co:'hoth', funds:2000, u:Object.assign({}, GER41, {inf:{n:'7. Panzer-Division Schützen'}})},
    p2:{nat:'su41', co:'rokossovsky', funds:0, u:SU41B},
    objective:{win:'survive', days:7, hold:3, protect:'mtank', protectN:1}, goal:'Keep at least one Panzer III and hold the ring round the Smolensk pocket at Yartsevo until {survive}. Keep three of your four positions.', persona:{2:'brawler'},
    brief:'Hoth\'s and Guderian\'s panzer groups have met east of Smolensk, and three Soviet armies are trapped in the pocket behind you. You hold the eastern side of the ring, at the Dnieper crossings round Yartsevo. The trapped armies are attacking from the west to break out. From the east, General Rokossovsky\'s scratch group is attacking to break in to them, with the first T-34s and Katyushas you have seen. You are stretched thin, and the infantry divisions are still three days\' march behind.',
    clock:{start:'1941-07-20T06:00', step:120},
    build:() => { const b = MB(34, 22, '.', 40303);
      b.scatter(',', .35, 0, 0, 33, 21, ['.']).blobs('T', 6, 0, 0, 33, 21, 1, 2);
      b.river([[0, 11], [10, 10], [22, 12], [33, 11]], .15);                                        // the Dnieper
      b.road([[16, 0], [16, 21]]).road([[0, 5], [33, 6]]);
      b.put([[16, 3, 'Q'], [12, 6, 'C'], [21, 6, 'C'], [16, 11, 'C'], [6, 16, 'k'], [27, 16, 'k'], [16, 19, 'q'], [3, 2, 'c'], [30, 2, 'c']]);
      return b.rows(); },
    units:{1:'mtank*4 11,3-21,8; tank*4 12,2-20,9; inf*5 11,4-21,11; at*2 13,7-19,10; aa*2 14,4-18,7; art*2 15,1-18,3',
      2:'inf*8 0,13-10,21; tank*4 2,15-9,20; inf*8 23,13-33,21; mtank*4 24,15-31,20; art*3 15,19-18,21; rkt 17,20'},
    events:[{day:1, team:2, say:'Katyushas: the first salvo of the rocket launchers the Germans will call Stalin\'s organs.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'Rokossovsky attacks from the east with the 38th Rifle Division and T-34s.', spawn:'mtank*2 28,12-33,16; inf*3 27,13-33,18'},
      {day:3, team:1, say:'Stukas over the Dnieper crossings.', hurt:1},
      {day:4, team:2, say:'The trapped 16th Army makes another attempt to break out.', spawn:'inf*4 0,12-8,16'},
      {day:5, team:1, say:'The first infantry division arrives, on foot, after a 40-mile march.', spawn:'inf*4 10,0-22,2; art 16,1'}]},
  kiev:{name:'The Kiev Pincers', place:'Romny to Lokhvitsa, behind the South-Western Front', date:'12 September 1941, 06:00', theme:'steppe', weather:'rain',
    p1:{nat:'ger40', co:'model', funds:0, u:Object.assign({}, GER41, {mtank:{n:'Panzer III (3. Panzer-Division)'}})},
    p2:{nat:'su41', co:'kirponos', funds:0, u:SU41B},
    objective:{win:'convoy', role:'mtank', need:3, exit:[0, 20, 33, 21], limit:10}, goal:'Drive south through the Soviet rear and get three Panzer IIIs to Lokhvitsa (the south edge) by {limit}, where Kleist\'s panzers are coming the other way.',
    whyText:{convoy:'the pincers met at Lokhvitsa. Four Soviet armies are trapped', sunk:'too many panzers were lost; the ring is still open'},
    brief:'Hitler has turned Guderian\'s panzers south from the Moscow road, against his generals\' advice, to destroy the Soviet armies defending Kiev. Stalin will not let them retreat. Model\'s 3rd Panzer Division leads the way south through the mud of the first autumn rains, past Romny, towards Lokhvitsa, where Kleist\'s 1st Panzer Group is coming north to meet it. When the two meet, the largest encirclement in history will close. Drive.',
    clock:{start:'1941-09-12T06:00', step:120},
    build:() => { const b = MB(34, 22, '.', 40404);
      b.scatter(',', .35, 0, 0, 33, 21, ['.']).blobs('T', 5, 0, 0, 33, 21, 1, 2).blobs('v', 4, 0, 4, 33, 18, 1, 1, ['.', ',']);
      b.river([[0, 8], [12, 9], [22, 7], [33, 8]], .15);                                             // the Sula
      b.road([[16, 0], [17, 10], [15, 21]]).road([[0, 14], [33, 14]]);
      b.put([[16, 1, 'Q'], [10, 3, 'C'], [17, 9, 'k'], [8, 14, 'k'], [25, 14, 'k'], [15, 20, 'c']]);
      return b.rows(); },
    units:{1:'mtank*7 11,0-21,4; tank*3 12,1-20,5; recon*2 10,0-22,2; inf*3 13,0-19,3; aa 16,2; art 15,0',
      2:'inf*7 8,7-26,16; tank*3 10,10-24,15; at*3 12,9-22,13; art*2 5,12-28,17; mtank*2 20,15-26,19; nest*2 14,8-19,10'},
    events:[{day:2, team:2, say:'The rain turns the roads to glue. Only the tracks get through.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'Soviet tanks from Kiev attack the flank of the corridor.', spawn:'tank*3 0,10-4,16'},
      {day:4, team:1, say:'The 4th Panzer Division comes up behind to widen the corridor.', spawn:'mtank*2 14,0-18,2; tank*2 12,0-20,2'},
      {day:5, team:2, say:'Kirponos asks Moscow for permission to break out. It is refused.', hurt:0}]},
  borodino:{name:'Borodino', place:'The old battlefield of 1812, on the road to Moscow', date:'14 October 1941, 07:00', theme:'autumn', weather:'rain',
    p1:{nat:'ger40', co:'hausser', funds:0, u:Object.assign({}, GER41, {inf:{n:'SS-Division Das Reich', w:'Kar98k & MG 34', pow:1.05}})},
    p2:{nat:'su41', co:'polosukhin', funds:0, u:Object.assign({}, SU41B, {inf:{n:'32nd Rifle Division (Siberians)', w:'Mosin-Nagant & PPD', pow:1.05}})},
    objective:{win:'hq', limit:12}, goal:'Break the Mozhaisk line at Borodino and take the Moscow road by {limit}.',
    brief:'Operation Typhoon has smashed the Soviet armies at Vyazma and Bryansk, and the road to Moscow is open. Almost. At Borodino, where Napoleon fought the Russians in 1812, the Mozhaisk defence line is held by a single fresh division, brought five thousand miles from the Far East: Siberians, in quilted jackets, with T-34s and Katyushas behind them. It has been raining for a week. The mud is up to the axles. Moscow is sixty miles away.',
    clock:{start:'1941-10-14T07:00', step:120},
    build:() => { const b = MB(34, 22, '.', 40505);
      b.blobs('T', 8, 0, 0, 33, 21, 1, 2).scatter(',', .25, 0, 0, 33, 21, ['.']).blobs('v', 4, 6, 0, 30, 21, 1, 1, ['.', ',']);
      b.rect(16, 6, 20, 9, '^', ['.', ',', 'T']).rect(16, 14, 19, 16, '^', ['.', ',']);           // the Raevsky redoubt and the Bagration flèches
      b.scatter('z', .35, 14, 4, 22, 18, ['.', ',', '^']);
      b.road([[0, 11], [33, 10]]);
      b.put([[1, 11, 'Q'], [4, 4, 'C'], [4, 18, 'C'], [18, 7, 'k'], [17, 15, 'k'], [24, 11, 'k'], [32, 10, 'q'], [28, 3, 'k']]);
      return b.rows(); },
    units:{1:'inf*10 1,3-7,19; mtank*4 2,8-5,14; tank*3 3,5-6,16; art*3 0,6-2,15; rkt 1,11; eng*2 5,9-7,13; at*2 6,4-8,17; aa 2,12',
      2:'inf*6 14,3-24,19; nest*2 15,5-20,17; at*2 16,8-20,13; mtank*2 24,6-29,15; art*2 28,4-33,17; rkt 30,10; mortar 21,7-24,14'},
    events:[{day:2, team:2, say:'Siberian ski troops raid the German rear in the night.', spawn:'inf*2 4,0-9,2'},
      {day:3, team:1, say:'Frost at night hardens the mud for a few hours in the morning.', heal:1},
      {day:3, team:2, say:'Four T-34s come up from Mozhaisk.', spawn:'mtank*2 29,8-33,13'},
      {day:5, team:1, say:'The 10th Panzer Division comes up to help.', spawn:'mtank*2 0,8-3,14'}]},
  tula:{name:'Tula', place:'The arms city south of Moscow', date:'30 October 1941, 06:00', theme:'autumn', weather:'overcast',
    p1:{nat:'ger40', co:'guderian', funds:0, u:Object.assign({}, GER41, {mtank:{n:'Panzer III (4. Panzer-Division)'}})},
    p2:{nat:'su41', co:'boldin', funds:0, u:Object.assign({}, SU41B, {inf:{n:'Tula Workers\' Regiment & NKVD', w:'rifles made in Tula'}, aa:{n:'85 mm AA Gun (732nd AA Regiment)', w:'85 mm, over open sights', snd:'gun76', shape:'k61', mt:'tire', pow:1.1}})},
    objective:{win:'hq', limit:12}, goal:'Take Tula, the last city before Moscow from the south, by {limit}.',
    brief:'Guderian\'s 2nd Panzer Army has driven 120 miles in four days up the road from Orel, and is at the southern edge of Tula, the old arms-making city that guards the road to Moscow from the south. It has fifty tanks left, almost no fuel, and its supply lorries are stuck in the mud a hundred miles back. Tula is held by the 50th Army\'s remnants, an NKVD regiment, the city\'s anti-aircraft guns and a workers\' regiment raised from its factories.',
    clock:{start:'1941-10-30T06:00', step:120},
    build:() => { const b = MB(32, 22, '.', 40606);
      b.blobs('T', 6, 0, 0, 31, 21, 1, 2).scatter(',', .25, 0, 0, 31, 21, ['.']);
      b.rect(18, 4, 28, 14, 'U').scatter('x', .15, 18, 4, 28, 14, ['U']).rect(17, 4, 17, 14, 'z', ['.', ',', 'T']);
      b.road([[0, 18], [10, 15], [22, 9], [31, 6]]).road([[22, 0], [23, 21]]);
      b.put([[1, 18, 'Q'], [5, 13, 'C'], [8, 20, 'C'], [23, 9, 'q'], [19, 6, 'k'], [26, 12, 'k'], [20, 13, 'k'], [29, 3, 'k']]);
      return b.rows(); },
    units:{1:'mtank*5 1,14-8,20; tank*3 3,12-9,19; inf*6 2,11-9,21; art*2 0,15-2,20; aa 3,17; eng*2 6,14-9,17; recon 8,12',
      2:'inf*7 17,4-28,14; aa*3 18,6-26,13; nest*3 17,5-19,13; at*2 18,8-21,12; art*2 25,2-30,8; mtank*2 24,15-29,19'},
    events:[{day:2, team:2, say:'The anti-aircraft gunners lower their barrels and fire at the panzers over open sights.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'Fuel arrives, by air.', heal:1},
      {day:4, team:2, say:'Siberian reinforcements arrive by rail from the north.', spawn:'inf*3 22,0-28,3; mtank 25,1'},
      {day:6, team:2, say:'Snow. The panzers\' oil freezes in the sumps; they have to light fires under them.', hurt:1, hurtTeam:1}]},
  moscowretreat:{name:'The Retreat from Moscow', place:'West of Klin, in the Moscow snow', date:'8 December 1941, 08:00', theme:'winter', weather:'snow',
    p1:{nat:'ger40', co:'heinrici', funds:0, u:Object.assign({}, GER41, {inf:{n:'Infantry in summer uniform', w:'Kar98k, frozen MG 34s'}})},
    p2:{nat:'su41', co:'zhukov', funds:0, u:Object.assign({}, SU41B, {inf:{n:'Siberian Ski Battalion', w:'PPSh & Mosin-Nagant, on skis', mv:4}, cav:{n:'Belov\'s Cavalry Corps', w:'shashka & PPSh'}})},
    objective:{win:'convoy', role:'inf', need:5, exit:[0, 0, 1, 21], limit:9}, goal:'The Soviets have counter-attacked. Get five infantry units back to the west edge by {limit}, in forty degrees of frost.',
    whyText:{convoy:'the division got back to a new line', sunk:'the division froze and was cut to pieces'},
    brief:'On 5 December 1941, in forty degrees of frost, with the spires of the Kremlin in sight through field glasses, the German offensive stopped. The next morning the Red Army counter-attacked along the whole front with divisions nobody knew it had: Siberians on skis, cavalry, T-34s that start in the cold. The Germans are still in summer uniforms. Their guns will not fire, their engines will not start, and men are losing fingers to frostbite. Get them back to a line they can hold.',
    clock:{start:'1941-12-08T08:00', step:120},
    build:() => { const b = MB(34, 22, '.', 40707);
      b.blobs('T', 12, 0, 0, 33, 21, 1, 2).blobs('v', 3, 4, 0, 30, 21, 1, 1, ['.']);
      b.road([[33, 10], [20, 11], [10, 9], [0, 10]]).road([[16, 0], [14, 21]]);
      b.put([[1, 10, 'Q'], [8, 4, 'c'], [8, 17, 'c'], [18, 10, 'c'], [27, 4, 'k'], [27, 17, 'k']]);
      return b.rows(); },
    units:{1:'inf*10 14,2-22,19; mtank*2 17,7-21,13; at*2 17,4-22,17; art*2 14,8-17,13; aa 15,10',
      2:'inf*6 29,1-33,20; cav*2 25,0-33,3; mtank*2 29,6-33,15; art*2 31,3-33,18'},
    events:[{day:1, team:2, say:'Minus forty. Rifles freeze. Engines will not start.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'Belov\'s cavalry rides round the flank through the forest.', spawn:'cav*3 10,19-18,21'},
      {day:3, team:2, say:'Siberian ski troops appear behind the column.', spawn:'inf*3 6,0-12,3'},
      {day:4, team:1, say:'A battalion holds a village to the last man so the rest can get through.', heal:1},
      {day:5, team:2, say:'Another night in the open at minus thirty-five.'}]},
};
for (const [id, m] of Object.entries(BARBAROSSA_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  brest:{forces:['The German 45th Infantry Division, with siege mortars and Nebelwerfers', 'About 9,000 Soviet soldiers and their families in the fortress'],
    win:'The citadel falls in a day.', lose:'The fortress holds, and the division bleeds in front of it.',
    real:'The citadel took a week, and the last defenders of the East Fort held out until late July; Major Gavrilov was found, wounded, on 23 July. Someone scratched on a barracks wall: "I am dying, but I do not surrender. Farewell, Motherland." The 45th Division lost 482 killed, more than in the whole French campaign. The fortress became a Soviet legend, though the defenders who survived the German camps were often treated as traitors for having been captured.'},
  raseiniai:{forces:['The 6th Panzer Division, with Czech Panzer 35(t)s and a few 88s', 'The Soviet 2nd Tank Division, with about 50 KV heavy tanks'],
    win:'The KVs are destroyed, and the panzer road is open.', lose:'The KVs hold the Dubysa crossings.',
    real:'On 23-26 June 1941 the KVs of the 2nd Tank Division shocked the Germans: shells bounced off them, and one KV sat across the road behind Kampfgruppe Raus for a day, until an 88 hit it six times and pioneers finished it off with charges. But the Soviet tanks ran out of fuel and ammunition, and the division was surrounded and destroyed. Its commander Solyankin was killed.'},
  smolensk:{forces:['The 7th Panzer Division and the rest of Panzergruppe 3', 'Three Soviet armies trapped in the pocket, and Rokossovsky\'s group attacking from the east'],
    win:'The ring holds. The Smolensk pocket is closed.', lose:'The ring is broken and the armies escape.',
    real:'The ring round Smolensk leaked for weeks: Rokossovsky\'s attacks at Yartsevo kept a corridor open, and tens of thousands of Soviet soldiers escaped through it. The pocket was not finally closed until early August, when the Germans took 300,000 prisoners. But the fighting cost Army Group Centre a month, and the Soviets used it to build new lines in front of Moscow.'},
  kiev:{forces:['Model\'s 3rd Panzer Division leading Guderian\'s Panzergruppe 2', 'The Soviet South-Western Front: the 5th, 21st, 26th and 37th Armies'],
    win:'The pincers meet at Lokhvitsa. The Kiev pocket is closed.', lose:'The pincers do not meet, and the Soviet armies escape east.',
    real:'Model\'s and Kleist\'s spearheads met at Lokhvitsa on 14 September 1941. Stalin refused to allow a retreat until it was far too late; Kirponos was killed trying to break out. The Germans claimed 665,000 prisoners, the largest encirclement in military history. But it cost a month that Army Group Centre would need before the winter.'},
  borodino:{forces:['The SS Division Das Reich and the 10th Panzer Division', 'The Soviet 32nd Rifle Division from the Far East, with tank brigades and Katyushas'],
    win:'The Mozhaisk line breaks. The road to Moscow is open.', lose:'The Siberians hold the line.',
    real:'The 32nd Rifle Division held at Borodino from 13 to 18 October 1941, five days in which Moscow was in a panic and the government was evacuated east. Das Reich lost heavily, and Hausser lost an eye. The Germans took Mozhaisk on the 18th, but the mud and the losses had slowed them down; by November they were exhausted.'},
  tula:{forces:['Guderian\'s 2nd Panzer Army, about 50 tanks and short of fuel', 'The 50th Army, the NKVD, the Tula Workers\' Regiment and the city\'s anti-aircraft guns'],
    win:'Tula falls, and the road to Moscow from the south is open.', lose:'Tula holds, and Guderian has to go round it.',
    real:'Guderian attacked Tula from 30 October and failed: the anti-aircraft guns knocked out the leading tanks, and the city held through November, almost surrounded. It never fell. The Soviets awarded it the title Hero City. When the counter-offensive came in December, Guderian\'s army was strung out round it in the snow.'},
  moscowretreat:{forces:['German infantry divisions in summer uniform, their guns and engines frozen', 'Zhukov\'s Western Front: Siberian divisions, ski battalions, cavalry corps and T-34s'],
    win:'The infantry get back to a line, and the front holds.', lose:'The division is cut off in the snow.',
    real:'The Soviet counter-offensive of December 1941 drove the Germans back up to 150 miles from Moscow. Hitler forbade withdrawals, sacked Brauchitsch, Guderian and others, and took over command himself; his "hedgehog" stand-fast order probably prevented a rout, at terrible cost. Barbarossa had failed. Germany was now committed to a long war in the east it could not win.'},
});
Object.assign(CO_FATE, {
  schlieper:'Commanded a division in Russia and a corps staff. Died in 1977.',
  raus:'Became one of the best defensive commanders of the German army, commanding the 4th Panzer Army and the 3rd Panzer Army. Wrote studies of the Russian front for the US Army after the war. Died in 1956.',
  hoth:'Commanded the 4th Panzer Army at Stalingrad and Kursk. Convicted at the High Command Trial in 1948, released in 1954. Died in 1971.',
  hausser:'Commanded an SS panzer corps at Kharkov and the 7th Army in Normandy, where he was badly wounded. Died in 1972.',
  gavrilov:'Captured on 23 July 1941 and liberated in 1945. Expelled from the Communist Party for being captured, he was rehabilitated and honoured as a Hero of the Soviet Union in 1957. Died in 1979.',
  solyankin:'Killed on 26 June 1941 near Raseiniai.',
  kirponos:'Killed on 20 September 1941 trying to break out of the Kiev pocket.',
  polosukhin:'Killed in action in February 1942.',
  boldin:'Commanded the 50th Army until 1945. Died in 1965.',
});
Object.assign(MISSION_LONLAT, {brest:[23.66, 52.08], raseiniai:[23.1, 55.38], smolensk:[32.85, 55.0], kiev:[33.5, 50.4], borodino:[35.83, 55.52], tula:[37.62, 54.2], moscowretreat:[36.7, 56.3]});
EUROPE.cities.push(['Smolensk', 32.05, 54.78]);
CAMPAIGNS.push({id:'barbarossa', name:'Barbarossa', sub:'The invasion of the Soviet Union, from the German side · 1941', side:'axis', missions:['brest', 'raseiniai', 'smolensk', 'kiev', 'borodino', 'tula', 'moscowretreat']});
