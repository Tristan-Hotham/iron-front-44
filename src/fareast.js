/* ============================== ZHUKOV IN THE FAR EAST ==============================
   The Soviet Union's two wars with Japan: Khalkhin Gol in 1939, where Zhukov first
   showed what tanks could do, and the August Storm of 1945, when the Red Army tore
   through Manchuria in ten days and landed on the Kuril Islands after Japan had
   already surrendered. */

const SU39K = {tank:{n:'BT-7', w:'45 mm 20-K', snd:'gun50', shape:'t26', pow:.85, mv:8, cost:5000}, mtank:{n:'BT-5 (11th Tank Brigade)', w:'45 mm', snd:'gun50', shape:'t26', pow:.8, mv:8, cost:4500}, recon:{n:'BA-10 Armoured Car', w:'45 mm', shape:'ba64'}, inf:{n:'Rifle Squad (1939)', w:'Mosin-Nagant & DP-27'}, ftr:{n:'Polikarpov I-16', shape:'yak3'}};
const JP39 = {inf:{n:'23rd Division', w:'Arisaka Type 38 & Type 11 LMG'}, tank:{n:'Type 89 Chi-Ro', w:'57 mm short gun', shape:'hago', pow:.7}, at:{n:'Type 94 37 mm Gun Crew', w:'37 mm anti-tank gun', snd:'gun37'}};
const JP45 = {inf:{n:'Kwantung Army Infantry', w:'Arisaka & lunge mines', pow:.95}, at:{n:'Lunge-mine Squad', w:'a mine on a pole, thrust against the tank', pow:1.2, powArm:1.6}};

Object.assign(CO, {
  zhukov39:{n:'Georgy Zhukov', nat:'su41', rank:'Komkor', nick:'1st Army Group, Mongolia',
    bio:'An unknown corps commander sent to Mongolia in June 1939 to deal with the Japanese on the Khalkhin Gol river. He did it with tanks, aircraft and a double envelopment that destroyed a Japanese division in ten days. It made his name; two years later he was saving Moscow.',
    d2d:{txt:'Armour +15% firepower.', atk:{armour:15}},
    cop:{n:'Tanks Without Infantry', star:3, txt:'Armour +2 move.', mv:{armour:2}},
    scop:{n:'Double Envelopment', star:6, txt:'All units +35% firepower and +1 move.', atk:{all:35}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#4a3a2a', jaw:2, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Throw the tanks in now. There is no time to wait for the infantry.', win:'The ring is closed.', lose:'Then we do it again tomorrow.', power:'Vperyod!'}},
  vasilevsky:{n:'Aleksandr Vasilevsky', nat:'su', rank:'Marshal of the Soviet Union', nick:'Far East Command',
    bio:'The Red Army\'s chief of staff through the great battles of 1942-44, who planned Stalingrad and Bagration. In 1945 he was sent to the Far East to plan and command the invasion of Manchuria: 1.5 million men moved 6,000 miles across Siberia in secret.',
    d2d:{txt:'All units +10% firepower and +1 move.', atk:{all:10}, mv:{ground:1}},
    cop:{n:'Deep Operation', star:3, txt:'Armour +2 move and +15% firepower.', mv:{armour:2}, atk:{armour:15}},
    scop:{n:'August Storm', star:6, txt:'All units +35% firepower and +2 move.', atk:{all:35}, mv:{ground:2}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8b7f55', collar:'#c8a040', medals:true},
    say:{start:'Through the mountains they think we cannot cross.', win:'Manchuria is ours.', lose:'Fuel. Bring up the fuel.', power:'Forward to the plain!'}},
  kravchenko:{n:'Andrei Kravchenko', nat:'su', rank:'Colonel General', nick:'6th Guards Tank Army',
    bio:'Led the 6th Guards Tank Army across the Greater Khingan mountains, which the Japanese believed no army could cross, and out onto the Manchurian plain, 500 miles in ten days, with fuel flown in by air when the lorries could not keep up.',
    d2d:{txt:'Armour +1 move.', mv:{armour:1}},
    cop:{n:'Over the Khingan', star:3, txt:'All ground units +2 move.', mv:{ground:2}},
    scop:{n:'The Plain', star:6, txt:'Armour +35% firepower and +2 move.', atk:{armour:35}, mv:{armour:2}},
    look:{cap:'tankhelm', face:'#e8c4a4', hair:'#5a4a3a', jaw:1, tunic:'#5a5040'},
    say:{start:'Over the pass and down to the plain. Do not stop.', win:'We are through the mountains!', lose:'The tanks are out of fuel.', power:'Tanks, forward!'}},
  beloborodov:{n:'Afanasy Beloborodov', nat:'su', rank:'Colonel General', nick:'1st Red Banner Army',
    bio:'A Siberian peasant\'s son who had fought before Moscow in 1941, he led the 1st Red Banner Army through the taiga and the fortified zones of eastern Manchuria to Mudanjiang in August 1945, against Japanese soldiers who threw themselves under his tanks with mines.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Through the Taiga', star:3, txt:'All units +1 move.', mv:{ground:1}},
    scop:{n:'Mudanjiang', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#5a4a3a', jaw:2, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Through the fortified zone to Mudanjiang.', win:'Mudanjiang is taken.', lose:'They are fighting to the last man.', power:'Urra!'}},
  gnechko:{n:'Alexei Gnechko', nat:'su', rank:'Major General', nick:'Kamchatka Defensive Region',
    bio:'Commanded the landing on Shumshu, the northernmost of the Kuril Islands, on 18 August 1945: three days after Japan had announced its surrender. The Japanese garrison fought anyway, and the battle cost the Soviets more than the whole Manchurian campaign\'s first day.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Naval Guns', star:3, txt:'All units +20% firepower; the coast guns shell two positions for 2 HP.', atk:{all:20}, strike:{n:2, r:1, hp:2, kind:'naval'}},
    scop:{n:'The Kurils', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8b7f55', collar:'#c03030'},
    say:{start:'Ashore in the fog, before they know.', win:'Shumshu has surrendered.', lose:'Hold the beach.', power:'Za Rodinu!'}},
  komatsubara:{n:'Michitarō Komatsubara', nat:'jp', rank:'Lieutenant General', nick:'23rd Division',
    bio:'A Russian-speaking intelligence officer who commanded the new 23rd Division on the Mongolian border in 1939. His division was destroyed in Zhukov\'s August offensive. He died the next year, it is said of shame.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Night Assault', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Spirit', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a', moustache:true},
    say:{start:'Across the river and drive them back.', win:'The Russians are broken.', lose:'My division is gone.', power:'Banzai!'}},
  shimizu:{n:'Noritsune Shimizu', nat:'jp', rank:'Lieutenant General', nick:'5th Army, Mudanjiang',
    bio:'Commanded the Japanese 5th Army in eastern Manchuria in August 1945: hollowed-out divisions of reservists and boys, whose best units had long since been sent to the Pacific. At Mudanjiang they fought with suicide squads and lunge mines.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'Suicide Squads', star:3, txt:'Infantry +40% firepower against tanks.', atk:{foot:40}},
    scop:{n:'Mudanjiang', star:6, txt:'All units +35% defence.', def:{all:35}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Hold Mudanjiang. Every man.', win:'The tanks are burning.', lose:'Mudanjiang is lost.', power:'Nikuhaku!'}},
  yamada:{n:'Otozō Yamada', nat:'jp', rank:'General', nick:'Kwantung Army',
    bio:'Commanded the Kwantung Army, once the elite of the Japanese army, by 1945 a shell. He planned to fall back into the mountains of southern Manchuria; the Soviets came too fast. He surrendered on 19 August and spent eleven years in Soviet prisons.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Fall Back', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'The Redoubt', star:6, txt:'All units +30% defence.', def:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#a8a098', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'They cannot cross the Khingan with tanks.', win:'They are stuck in the mountains.', lose:'They are on the plain.', power:'Hold!'}},
  tsutsumi:{n:'Fusaki Tsutsumi', nat:'jp', rank:'Lieutenant General', nick:'91st Division, Shumshu',
    bio:'Commanded the garrison of Shumshu and Paramushir in the northern Kurils. On 18 August 1945, three days after the Emperor announced the surrender, Soviet troops landed on Shumshu in the fog, and his men, with tanks, fought them for three days.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'Tank Regiment', star:3, txt:'Armour +30% firepower.', atk:{armour:30}},
    scop:{n:'Shumshu', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#8a7a4a'},
    say:{start:'The war is over. Why are they landing?', win:'They are back on the beach.', lose:'Lay down arms.', power:'Tanks, attack!'}},
});
for (const id of ['zhukov39', 'vasilevsky', 'kravchenko', 'beloborodov', 'gnechko', 'komatsubara', 'shimizu', 'yamada', 'tsutsumi']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {zhukov39:'aggressive', vasilevsky:'methodical', kravchenko:'aggressive', beloborodov:'aggressive', gnechko:'aggressive', komatsubara:'aggressive', shimizu:'cautious', yamada:'cautious', tsutsumi:'cautious'});
if (LIKENESS.zhukov) LIKENESS.zhukov39 = LIKENESS.zhukov;

const FAREAST_MISSIONS = {
  baintsagan:{name:'Bain-Tsagan', place:'Bain-Tsagan mountain, west of the Khalkhin Gol', date:'3 July 1939, 07:00', theme:'steppe', weather:'clear',
    p1:{nat:'su41', co:'zhukov39', funds:0, u:SU39K},
    p2:{nat:'jp', co:'komatsubara', funds:0, u:JP39},
    objective:{win:'hq', limit:4}, goal:'The Japanese have crossed the river. Throw them back off Bain-Tsagan mountain and take their bridge by {limit}.',
    brief:'An undeclared war on the border of Mongolia and Japanese-run Manchuria. In the night the Japanese 23rd Division crossed the Khalkhin Gol on a pontoon bridge and took Bain-Tsagan, a flat-topped hill on the Mongolian side. If they hold it, the Soviet positions east of the river are cut off. Zhukov has no infantry nearby, only the 11th Tank Brigade and armoured cars. He throws them straight in, tanks without infantry, against every rule in the book.',
    clock:{start:'1939-07-03T07:00', step:120},
    build:() => { const b = MB(34, 20, '.', 91101);
      b.scatter(',', .15, 0, 0, 33, 19, ['.']).blobs('^', 3, 10, 0, 33, 19, 1, 1);
      b.rect(14, 6, 21, 13, '^').rect(16, 8, 19, 11, '.');                                             // Bain-Tsagan
      b.river([[26, 0], [27, 10], [26, 19]], .1); b.set(26, 9, 'b').set(27, 9, 'b');                 // the Khalkhin Gol and the pontoon bridge
      b.road([[0, 9], [26, 9], [33, 9]]);
      b.put([[1, 9, 'Q'], [4, 3, 'C'], [4, 16, 'C'], [17, 9, 'k'], [24, 9, 'q'], [31, 4, 'k'], [31, 15, 'k']]);
      return b.rows(); },
    units:{1:'tank*6 0,3-6,15; mtank*3 2,5-5,13; recon*4 1,2-5,17; art*2 0,7-2,11; ftr 1,12',
      2:'inf*8 13,5-23,14; at*3 14,7-21,12; art*2 21,7-25,12; nest*2 15,8-20,11; tank*2 22,5-25,14'},
    events:[{day:1, team:1, say:'The 11th Tank Brigade goes straight into the attack off the march, without infantry.', hurt:0},
      {day:2, team:2, say:'Japanese soldiers climb onto the BTs with petrol bottles. The petrol engines burn.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'The Mongolian armoured division and the 24th Motor Rifle Regiment arrive.', spawn:'recon*2 0,14-4,18; inf*3 0,6-3,12'},
      {day:3, team:1, say:'I-16s and SB bombers over the Japanese bridgehead.', hurt:1}]},
  khalkhingol:{name:'Khalkhin Gol', place:'The Nomonhan steppe, east of the river', date:'20 August 1939, 05:45', theme:'steppe', weather:'clear',
    p1:{nat:'su41', co:'zhukov39', funds:0, u:SU39K},
    p2:{nat:'jp', co:'komatsubara', funds:0, u:JP39},
    objective:{win:'convoy', role:'tank', need:7, exit:[32, 0, 33, 19], limit:4}, goal:'Double envelopment: send seven BT-7s round both flanks of the Japanese to the east edge by {limit}, closing the ring.',
    whyText:{convoy:'the pincers have met. The 23rd Division is surrounded', sunk:'too many tanks were lost on the flanks; the ring is not closed'},
    brief:'For a month Zhukov has been building up in secret: tanks, guns, ammunition and fuel, brought 400 miles from the railway by lorry, while his radio broadcast fake messages about building winter defences. The Japanese think he is digging in. At 05:45 on a Sunday, when many Japanese officers are on leave, 150 bombers and 250 guns open fire, and the tank brigades go round both ends of the Japanese line. When the pincers meet behind them, the 23rd Division will be in a trap.',
    clock:{start:'1939-08-20T05:45', step:120},
    build:() => { const b = MB(34, 20, '.', 91202);
      b.scatter(',', .15, 0, 0, 33, 19, ['.']).blobs('^', 6, 10, 3, 24, 16, 1, 2).blobs('d', 4, 0, 0, 33, 19, 1, 2, ['.']);
      b.river([[2, 0], [3, 10], [2, 19]], .1);
      b.road([[0, 10], [33, 10]]).road([[8, 0], [8, 19]]);
      b.put([[1, 10, 'Q'], [17, 9, 'k'], [14, 5, 'k'], [20, 14, 'k'], [30, 10, 'c'], [31, 3, 'c'], [31, 16, 'c']]);
      return b.rows(); },
    units:{1:'tank*8 3,0-8,4; tank*4 3,15-8,19; mtank*3 4,8-7,12; inf*5 3,6-8,14; art*3 0,7-2,13; recon*2 4,1-7,3; ftr 1,14',
      2:'inf*8 10,4-24,16; at*3 12,6-22,14; art*3 18,7-24,13; nest*3 11,6-20,14; tank 22,9'},
    events:[{day:1, team:1, say:'05:45. 150 bombers and 250 guns open fire at once.', hurt:1},
      {day:2, team:2, say:'The Japanese counter-attack the southern pincer.', spawn:'inf*3 14,15-20,19'},
      {day:3, team:1, say:'Fresh tank brigades come round the northern flank.', spawn:'tank*3 9,0-13,2'}]},
  khingan:{name:'Over the Khingan', place:'The passes of the Greater Khingan range', date:'10 August 1945, 06:00', theme:'steppe', weather:'rain',
    p1:{nat:'su', co:'kravchenko', funds:0},
    p2:{nat:'jp', co:'yamada', funds:0, u:JP45},
    objective:{win:'convoy', role:'mtank', need:4, exit:[32, 0, 33, 19], limit:10}, goal:'Get four T-34-85s over the mountains and out onto the Manchurian plain (the east edge) by {limit}.',
    whyText:{convoy:'the tanks are on the Manchurian plain', sunk:'too many tanks broke down or burned in the passes'},
    brief:'The Japanese believe that no army can cross the Greater Khingan mountains, so they have hardly defended them. The 6th Guards Tank Army is going to cross them anyway: a thousand tanks on goat tracks and through passes 5,000 feet up, in rain that turns the tracks to mud, with fuel lorries that cannot keep up. On the far side lies the Manchurian plain, and the heart of the Japanese empire on the mainland.',
    clock:{start:'1945-08-10T06:00', step:120},
    build:() => { const b = MB(34, 20, 'M', 91303);
      b.blobs('^', 12, 0, 0, 33, 19, 1, 2, ['M']).rect(0, 0, 5, 19, '.').rect(28, 0, 33, 19, '.').scatter(',', .3, 28, 0, 33, 19, ['.']);
      b.path([[3, 10], [10, 8], [16, 11], [22, 9], [30, 10]], (x, y) => { b.set(x, y, '='); if (b.get(x, y + 1) === 'M') b.set(x, y + 1, '^'); });   // the pass
      b.path([[3, 4], [12, 3], [20, 5], [30, 4]], (x, y) => { if (b.get(x, y) === 'M') b.set(x, y, '^'); });
      b.put([[1, 10, 'Q'], [16, 12, 'k'], [24, 4, 'k'], [31, 10, 'c'], [30, 3, 'c'], [30, 16, 'c']]);
      return b.rows(); },
    units:{1:'mtank*8 0,6-4,14; tank*3 0,3-4,16; recon*2 1,1-4,18; inf*3 0,8-3,12; art 1,10',
      2:'inf*3 12,5-24,14; at 13,7-23,12; nest 15,12-22,13; art 24,8'},
    events:[{day:2, team:2, say:'Rain. The tracks up the passes turn to mud.', hurt:1, hurtTeam:1},
      {day:3, team:1, say:'Fuel runs out. Transport planes drop it on the far side of the pass.', heal:1},
      {day:4, team:2, say:'Japanese suicide squads wait in the passes with lunge mines.', spawn:'at*2 18,8-26,11'}]},
  mudanjiang:{name:'Mudanjiang', place:'The city of Mudanjiang, eastern Manchuria', date:'15 August 1945, 06:00', theme:'china', weather:'clear',
    p1:{nat:'su', co:'beloborodov', funds:0},
    p2:{nat:'jp', co:'shimizu', funds:0, u:Object.assign({}, JP45, {inf:{n:'124th & 126th Divisions', w:'Arisaka & grenades'}})},
    objective:{win:'hq', limit:8}, goal:'Take Mudanjiang by {limit}. The Japanese have suicide squads waiting in every ditch.',
    brief:'The 1st Red Banner Army has come through the taiga and the fortified zones of the border, and now stands in front of Mudanjiang, the main city of eastern Manchuria. The Japanese 5th Army is making its stand on the hills in front of the city. Its divisions are old reservists and boys, but they have been told to die rather than surrender, and they have dug foxholes all along the roads where men wait with mines to throw themselves under the tanks. Today, in Tokyo, the Emperor will tell his people the war is over. Nobody here has heard it yet.',
    clock:{start:'1945-08-15T06:00', step:120},
    build:() => { const b = MB(32, 22, '.', 91404);
      b.blobs('^', 8, 8, 0, 31, 21, 1, 2).blobs('T', 6, 0, 0, 31, 21, 1, 1, ['.', '^']).scatter(',', .2, 0, 0, 31, 21, ['.']);
      b.river([[20, 0], [21, 10], [20, 21]], .1); b.rect(23, 7, 30, 15, 'U');
      b.road([[0, 11], [31, 11]]).road([[26, 0], [26, 21]]);
      b.put([[1, 11, 'Q'], [5, 4, 'C'], [5, 18, 'C'], [27, 11, 'q'], [14, 6, 'k'], [14, 16, 'k'], [24, 8, 'k'], [29, 14, 'k']]);
      return b.rows(); },
    units:{1:'mtank*5 1,5-6,16; tank*3 2,7-5,14; inf*7 0,3-8,19; art*3 0,6-2,15; rkt 1,11; eng*2 6,9-8,13',
      2:'inf*7 10,3-29,18; at*4 9,6-19,16; nest*3 11,8-19,14; art*2 25,5-30,16; mortar*2 22,8-28,14'},
    events:[{day:1, team:2, say:'Suicide squads rise out of the ditches with mines on poles.', hurt:1, hurtTeam:1},
      {day:2, team:1, say:'Katyushas fire on the hills in front of the city.', hurt:1},
      {day:3, team:2, say:'Word of the Emperor\'s broadcast reaches some units. Others refuse to believe it, and fight on.', hurt:1, hurtTeam:2}]},
  shumshu:{name:'Shumshu', place:'The northernmost of the Kuril Islands', date:'18 August 1945, 04:22', theme:'norway', weather:'overcast',
    p1:{nat:'su', co:'gnechko', funds:0, u:{inf:{n:'101st Rifle Division & Naval Infantry', w:'PPSh & Mosin-Nagant'}, lc:{n:'Landing Barge'}}},
    p2:{nat:'jp', co:'tsutsumi', funds:0, u:{inf:{n:'91st Division', w:'Arisaka & Type 96'}, tank:{n:'Type 97 Chi-Ha (11th Tank Regiment)', shape:'chiha'}}},
    objective:{win:'hq', limit:10}, goal:'Land in the fog on Shumshu and take the island\'s headquarters by {limit}, three days after Japan surrendered.',
    brief:'Japan surrendered on 15 August. Stalin wants the Kuril Islands anyway, and quickly, before the Americans can get there. In the fog before dawn on 18 August, Soviet troops land on Shumshu, the northernmost island, from barges that ground far out in the surf. The men wade ashore with their radios soaked. The Japanese garrison has been told the war is over. Then they see who is landing, and their tank regiment attacks.',
    clock:{start:'1945-08-18T04:22', step:120},
    build:() => { const b = MB(30, 20, '.', 91505);
      b.rect(0, 0, 29, 3, '~').rect(0, 4, 29, 4, 's').blobs('^', 8, 0, 6, 29, 19, 1, 2).scatter(',', .2, 0, 5, 29, 19, ['.']);
      b.rect(10, 9, 14, 12, '^').rect(18, 9, 22, 12, '^');                                             // heights 165 and 171
      b.road([[3, 5], [15, 10], [26, 15]]);
      b.put([[14, 4, 'P'], [16, 11, 'q'], [12, 10, 'k'], [20, 10, 'k'], [6, 15, 'k'], [27, 8, 'k']]);
      return b.rows(); },
    units:{1:'inf*7 3,4-25,5; at*2 8,4-18,5; lc*4 2,0-26,3 +inf+inf; dd*2 4,0-24,0',
      2:'inf*4 4,7-26,17; nest 8,6-22,9; tank 18,13-26,18; art 22,12-27,16; at 10,8-20,12'},
    events:[{day:1, team:2, say:'The Japanese coastal guns open fire on the barges in the fog.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'The 11th Tank Regiment counter-attacks the beachhead.', spawn:'tank*2 22,15-28,19'},
      {day:3, team:1, say:'The second wave lands with anti-tank rifles and guns.', spawn:'inf*3 6,4-20,5; at*2 10,4-18,5'}]},
};
for (const [id, m] of Object.entries(FAREAST_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  baintsagan:{forces:['The Soviet 11th Tank Brigade, armoured car brigades and the Mongolian 6th Cavalry Division', 'Most of the Japanese 23rd Division and the 7th Division\'s 26th Regiment'],
    win:'The Japanese are thrown back across the river.', lose:'The Japanese hold Bain-Tsagan.',
    real:'On 3-5 July 1939 Zhukov\'s tanks and armoured cars, attacking without infantry, lost heavily to Japanese anti-tank guns and petrol bombs, but drove the Japanese off Bain-Tsagan and back across the Khalkhin Gol. The Japanese blew their own pontoon bridge. The fighting went on along the river through July.'},
  khalkhingol:{forces:['Zhukov\'s 1st Army Group: about 57,000 men, 500 tanks and 500 aircraft, with Mongolian cavalry', 'The Japanese 23rd Division and supporting units, about 30,000 men'],
    win:'The pincers meet. The 23rd Division is surrounded and destroyed.', lose:'The Japanese escape the trap.',
    real:'Zhukov\'s offensive began on 20 August 1939 and the pincers met on 25 August. By 31 August the 23rd Division had been destroyed: the Japanese lost about 18,000 men. A ceasefire was signed on 16 September, the day before the Soviets invaded Poland. Japan never again risked war with the Soviet Union, and turned south against the Americans and British instead. Zhukov became a Hero of the Soviet Union.'},
  khingan:{forces:['The 6th Guards Tank Army, about 1,000 tanks', 'Small Japanese and Manchukuo garrisons in the passes'],
    win:'The tanks are over the mountains and out on the Manchurian plain.', lose:'The tanks are stuck in the passes.',
    real:'The 6th Guards Tank Army crossed the Greater Khingan between 9 and 12 August 1945, against weak resistance but terrible terrain, and reached the Manchurian plain far sooner than the Japanese believed possible; its fuel was flown in by air. In ten days the Soviets overran Manchuria, and took about 600,000 Japanese prisoners, many of whom died in Soviet labour camps.'},
  mudanjiang:{forces:['The 1st Red Banner Army of the 1st Far Eastern Front', 'The Japanese 5th Army\'s 124th, 126th and 135th Divisions'],
    win:'Mudanjiang falls.', lose:'The Japanese hold the hills in front of the city.',
    real:'The battle for Mudanjiang, from 12 to 16 August 1945, was the heaviest of the Manchurian campaign. Japanese suicide squads with lunge mines and explosives destroyed many Soviet tanks. The city fell on 16 August, the day after the Emperor\'s surrender broadcast. The Kwantung Army formally surrendered on 19 August.'},
  shumshu:{forces:['The Soviet 101st Rifle Division and naval infantry, about 8,800 men', 'The Japanese 91st Division\'s garrison of Shumshu, about 8,500 men with the 11th Tank Regiment'],
    win:'Shumshu is taken, and the Kurils with it.', lose:'The landing is held on the beach.',
    real:'The landing on Shumshu, from 18 to 23 August 1945, cost the Soviets about 1,500 killed and wounded, more than the Japanese, in a war that was officially already over. The Japanese tanks were destroyed by anti-tank rifles and guns brought ashore. The garrison surrendered on 23 August on orders from Tokyo. The Soviets took all the Kuril Islands, and Japan and Russia still dispute the southern ones.'},
});
Object.assign(CO_FATE, {
  zhukov39:'Went on to save Leningrad and Moscow, to command at Stalingrad and Kursk, and to take Berlin. Died in 1974.',
  vasilevsky:'Chief of the General Staff and Minister of Defence after the war. Died in 1977.',
  kravchenko:'Twice Hero of the Soviet Union. Died in 1963.',
  beloborodov:'Commanded armies after the war and wrote his memoirs. Died in 1990.',
  gnechko:'Hero of the Soviet Union for the Kurils. Died in 1980.',
  komatsubara:'Retired after Khalkhin Gol and died in 1940.',
  shimizu:'Captured by the Soviets in Manchuria.',
  yamada:'Held in Soviet prisons until 1956. Died in 1965.',
  tsutsumi:'Surrendered the northern Kurils on 23 August 1945 and was taken to the Soviet Union.',
});
Object.assign(MISSION_LONLAT, {baintsagan:[118.1, 47.75], khalkhingol:[118.3, 47.7], khingan:[121.5, 47.0], mudanjiang:[129.6, 44.58], shumshu:[156.4, 50.75]});
EUROPE.cities.push(['Harbin', 126.63, 45.75], ['Vladivostok', 131.9, 43.12]);
CAMPAIGNS.push({id:'fareast', name:'Zhukov in the Far East', sub:'Khalkhin Gol and the August Storm · 1939 and 1945', side:'allies', missions:['baintsagan', 'khalkhingol', 'khingan', 'mudanjiang', 'shumshu']});

/* the order the campaigns are listed in */
{ const order = ['training', 'china', 'weiss', 'gelb', 'winterwar', 'north', 'sea', 'atlantic', 'carrier', 'desert', 'foxdesert', 'diggers', 'italy', 'barbarossa', 'rising', 'philippines', 'burma', 'pacific', 'east', 'italy44', 'maple', 'west', 'axis', 'fareast'];
  CAMPAIGNS.sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99)); }
