/* ============================== OPERATION EXPORTER ==============================
   Syria and Lebanon, June and July 1941: the Allied invasion of the Vichy French
   Levant. Australians, Indians, British commandos and Free French against the
   Armée du Levant, an army of Frenchmen fighting Frenchmen and their allies.
   Three battles: the crossing of the Litani, Mezzeh and Damascus, and Damour.
   Sources are listed in docs/levant-1941-sources.md. */

const AIF41 = {inf:{n:'Australian Infantry (2nd AIF)', w:'SMLE, Bren & grenades'}, eng:{n:'2/6th Field Company', w:'SMLE, canvas boats & bridging'}, cav:{n:'No. 11 (Scottish) Commando', w:'Thompson, Bren & grenades'}};
const LEVANT41 = {inf:{n:'Légion & Tirailleurs (Armée du Levant)', w:'MAS 36 & FM 24/29'}, tank:{n:'Renault R35 (Armée du Levant)', w:'37 mm SA 18'}, dd:{n:'Destroyer (Guépard or Valmy)'}, nest:{n:'Stone Sangar & MG Post', w:'Hotchkiss machine gun'}};

Object.assign(CO, {
  lavarack:{n:'John Lavarack', nat:'anz', rank:'Major General', nick:'7th Australian Division',
    bio:'Commanded the 7th Australian Division when it crossed into Lebanon in the first hour of 8 June 1941. On 18 June he handed the division to Arthur Allen and took over I Australian Corps for the rest of the campaign.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Canvas Boats', star:3, txt:'Infantry +1 move and +15% firepower.', mv:{foot:1}, atk:{foot:15}},
    scop:{n:'The Litani', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#8a7a52'},
    say:{start:'Across the Litani, and on up the coast road.', win:'We are over the river.', lose:'Hold the south bank.', power:'Get the boats across!'}},
  lloyd:{n:'Wilfrid Lloyd', nat:'ind', rank:'Brigadier', nick:'5th Indian Infantry Brigade',
    bio:'Commanded the 5th Indian Infantry Brigade, and for a time all of Gentforce, the Indian and Free French force advancing on Damascus, after the Free French general Legentilhomme was wounded on 12 June 1941.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Night March', star:3, txt:'Infantry +2 move.', mv:{foot:2}},
    scop:{n:'Mezzeh', star:6, txt:'Infantry +35% firepower and defence.', atk:{foot:35}, def:{foot:35}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#8a7a52', moustache:true},
    say:{start:'March tonight, and be in Mezzeh by dawn.', win:'Damascus is open.', lose:'Mezzeh is cut off.', power:'Forward, at the double!'}},
  allen:{n:'Arthur Allen', nat:'anz', rank:'Major General', nick:'"Tubby", 7th Australian Division',
    bio:'Known to everyone as "Tubby" for his stocky build. He took over the 7th Australian Division from Lavarack on 18 June 1941 and led it in the last battle of the campaign, at Damour.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Round the Flank', star:3, txt:'All ground units +1 move and +15% firepower.', mv:{ground:1}, atk:{all:15}},
    scop:{n:'The Beirut Road', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'slouch', face:'#e8c0a0', hair:'#6a5a4a', jaw:2, tunic:'#8a7a52'},
    say:{start:'Over the wadi, round the town, and cut the road to Beirut.', win:'Damour is ours.', lose:'Back to the south bank of the wadi.', power:'Up the hills, lads!'}},
  dentz:{n:'Henri Dentz', nat:'fr40', rank:'Général d\'armée', nick:'Armée du Levant',
    bio:'Vichy France\'s High Commissioner in the Levant and commander in chief of the Armée du Levant: about 35,000 men, some 8,000 of them French and most of the rest Syrian and Lebanese troops, with the Foreign Legion, North African and Senegalese regiments, about 90 tanks and, in time, nearly 300 aircraft.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Hold the Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Counter-attack', star:6, txt:'All units +25% firepower and defence.', atk:{all:25}, def:{all:25}},
    look:{cap:'kepi', face:'#e6bc9a', hair:'#9a9a9a', jaw:1, tunic:'#8a7a52'},
    say:{start:'The Levant will be defended against all comers.', win:'They are thrown back.', lose:'We must ask for terms.', power:'Contre-attaque!'}},
});
for (const id of ['lavarack', 'lloyd', 'allen', 'dentz']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {lavarack:'methodical', lloyd:'aggressive', allen:'methodical', dentz:'cautious'});

const LEVANT_MISSIONS = {
  litani:{name:'The Litani River', place:'The mouth of the Litani, southern Lebanon', date:'9 June 1941, 05:00', theme:'greece', weather:'clear',
    p1:{nat:'anz', co:'lavarack', funds:3000, u:Object.assign({}, AIF41, {inf:{n:'21st Brigade (2/14th, 2/16th, 2/27th Bns)', w:'SMLE, Bren & grenades'}})},
    p2:{nat:'fr40', co:'dentz', funds:0, u:LEVANT41},
    objective:{win:'hq', limit:14}, goal:'Cross the Litani and take the Vichy French ridge north of the river by {limit}.',
    brief:'The invasion of the Vichy French Levant began in the first hour of 8 June. The 21st Australian Brigade is advancing up the coast road from Tyre towards Sidon and Beirut, and the Litani River is the first barrier. No. 11 (Scottish) Commando was meant to land in the night and seize the bridge, but heavy surf delayed them, and the French have blown it. The Australians have one canvas boat that carries eight men. Your engineers can throw a bridge across (3,000) to bring the carriers over; until then, it is infantry only, under fire from the ridge.',
    clock:{start:'1941-06-09T05:00', step:120},
    build:() => { const b = MB(30, 18, '.', 41061);
      b.rect(0, 0, 2, 17, '~').rect(3, 0, 3, 17, 's');
      b.scatter(',', .2, 4, 0, 29, 17, ['.']).blobs('G', 7, 4, 0, 29, 17, 1, 2, ['.', ',']);
      b.rect(7, 2, 22, 5, '^').blobs('^', 3, 18, 0, 29, 7, 1, 2, ['.', ',', 'G']);         // the ridge north of the river
      b.river([[29, 8], [20, 9], [12, 8], [4, 9]], .2); b.set(3, 9, 'r');
      b.road([[5, 0], [5, 17]]); for (let y = 6; y <= 12; y++) if (b.get(5, y) === 'b') b.set(5, y, 'r');   // the bridge is down
      b.put([[6, 16, 'Q'], [5, 17, 'C'], [12, 14, 'C'], [19, 15, 'c'], [12, 5, 'q'], [8, 4, 'k'], [17, 3, 'k'], [24, 2, 'c'], [6, 6, 'B'], [11, 6, 'B'], [16, 6, 'B']]);
      return b.rows(); },
    units:{1:'inf*6 4,11-15,14; eng*2 5,11-9,12; mortar*2 6,12-11,14; art*3 4,14-10,16; apc*2 8,13-12,15; at 13,12',
      2:'inf*3 5,3-19,6; nest*2 6,6-16,7; at 8,4-15,6; art 10,1-16,2; mortar 13,4; recon 19,3-25,6'},
    events:[{day:1, team:1, say:'The commandos land north of the river mouth, in daylight, at three places. The French, busy with the Australians, hardly fire on the beach.', spawn:'cav*4 4,4-8,7'},
      {day:2, team:2, say:'Vichy armoured cars counter-attack the commandos on the coast.', spawn:'recon 6,0-10,1'},
      {day:3, team:2, say:'The destroyers Guépard and Valmy come inshore and shell the Australians.', spawn:'dd*2 0,10-1,15'},
      {day:8, team:1, say:'As night falls, a company of the 2/27th Battalion is ferried across the river.', spawn:'inf*2 4,10-9,11'}]},
  damascus:{name:'Mezzeh and Damascus', place:'Mezzeh, on the Beirut road west of Damascus', date:'18 June 1941, 20:30', theme:'tunisia', weather:'clear',
    p1:{nat:'ind', co:'lloyd', funds:0, u:{inf:{n:'5th Indian Brigade (3/1st Punjab, 4/6th Rajputana Rifles)', w:'SMLE, Bren & bayonets'}, at:{n:'Boys Anti-tank Rifle Team', w:'.55 Boys anti-tank rifle'}, apc:{n:'Universal Carrier'}}},
    p2:{nat:'fr40', co:'dentz', funds:0, u:LEVANT41},
    objective:{win:'hq', limit:16}, goal:'March by night to Mezzeh, cut the Beirut road, and take Damascus by {limit}.',
    brief:'Gentforce, Indian and Free French troops, has fought its way up from the frontier and taken Kissoué and the hills behind it, south of Damascus. Now Brigadier Lloyd\'s 5th Indian Brigade is to march through the night round the west of the city to Mezzeh, the village where the road from Beirut comes in, and cut the garrison off. Mezzeh is three miles from the city; between them are orchards, the forts and Damascus itself. The Indians will have to hold Mezzeh alone until the rest of the force comes up.',
    clock:{start:'1941-06-18T20:30', step:240},
    build:() => { const b = MB(32, 18, '.', 41062);
      b.scatter(',', .12, 0, 0, 31, 17, ['.']).rect(0, 0, 31, 3, '^').blobs('M', 3, 6, 0, 26, 2, 1, 1);   // Jebel Qasioun and the hills north of the road
      b.blobs('G', 9, 18, 4, 31, 17, 1, 2, ['.', ',']);                                         // the orchards round the city
      b.road([[0, 7], [18, 7], [29, 9]]).road([[4, 17], [6, 10], [18, 7]]);
      b.town(29, 9, 4, 'k', 2, '.');
      b.put([[3, 15, 'Q'], [5, 13, 'C'], [18, 7, 'c'], [17, 8, 'c'], [29, 9, 'q'], [24, 4, 'B'], [27, 5, 'B'], [25, 13, 'B'], [22, 11, 'c'], [10, 4, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 2,9-10,16; mortar*2 3,13-7,16; art*3 1,14-5,17; at*3 5,12-9,14; apc*2 6,14-9,16',
      2:'inf*3 19,6-27,11; nest*2 23,4-27,13; art 27,7-30,11; at 20,8; cav 12,3-16,5; tank 24,8-27,11; inf 17,7-18,8'},
    events:[{day:3, team:1, say:'04:15 on 19 June. The Indians reach Mezzeh, and take it in hand-to-hand fighting.'},
      {day:6, team:2, say:'French troops close round Mezzeh. Cut off, the Indians are running short of ammunition and food.', spawn:'cav 11,4-15,6; inf 12,8-16,10'},
      {day:11, team:1, say:'20 June. A relief column comes up: Free French troops, the British 16th Brigade and the Australian 2/3rd Battalion.', spawn:'inf*4 0,6-3,9; mortar 1,9-3,10; art 0,10-2,11'},
      {day:15, team:2, say:'21 June. The Free French take Qadim. Vichy troops begin to fall back along the Beirut road.', hurt:1, hurtTeam:2}]},
  damour:{name:'Damour', place:'The Damour River, south of Beirut', date:'5 July 1941, 22:00', theme:'greece', weather:'clear',
    p1:{nat:'anz', co:'allen', funds:0, u:Object.assign({}, AIF41, {inf:{n:'7th Australian Division', w:'SMLE, Bren & grenades'}, recon:{n:'6th Division Cavalry', w:'Bren & Vickers guns'}, eng:{n:'2/2nd Pioneer Battalion', w:'SMLE & demolitions'}})},
    p2:{nat:'fr40', co:'dentz', funds:0, u:LEVANT41},
    objective:{win:'hq', limit:14}, goal:'Cross the Wadi Damour, take El Atiqa and El Boum, and capture Damour by {limit}.',
    brief:'The last natural barrier before Beirut. The Damour River runs in a deep wadi three kilometres south of the town, and the French hold the ridges beyond it. The Australians already hold the heights on the south bank. Tonight the 21st Brigade crosses the wadi in two places, the 2/16th Battalion towards El Atiqa and the 2/27th towards El Boum. Then the 7th Division means to go round Damour through the hills to the east, and cut the road to Beirut behind it.',
    clock:{start:'1941-07-05T22:00', step:360},
    build:() => { const b = MB(30, 20, '.', 41071);
      b.rect(0, 0, 2, 19, '~').rect(3, 0, 3, 19, 's');
      b.blobs('^', 9, 8, 0, 29, 19, 1, 2).blobs('M', 4, 20, 0, 29, 19, 1, 2).blobs('G', 6, 4, 0, 29, 19, 1, 1, ['.']).scatter(',', .12, 4, 0, 18, 19, ['.']);
      b.river([[29, 12], [20, 13], [12, 12], [4, 13]], .15); b.set(3, 13, 'r');
      b.road([[5, 0], [5, 19]]).road([[5, 6], [12, 9], [18, 9], [21, 4]]);
      b.put([[7, 18, 'Q'], [6, 6, 'q'], [7, 5, 'k'], [5, 3, 'k'], [12, 9, 'k'], [18, 9, 'k'], [21, 4, 'c'], [12, 17, 'C'], [22, 16, 'C'], [8, 10, 'B'], [14, 10, 'B'], [5, 9, 'B']]);
      return b.rows(); },
    units:{1:'inf*6 6,14-20,17; eng*2 5,14-9,15; art*4 6,16-14,19; mortar*2 9,15-16,17; recon*2 4,15-6,18; at 10,15',
      2:'inf*5 5,4-20,11; nest*2 6,9-15,11; art*2 6,1-12,4; mortar 9,7-17,10; at 6,7-12,9; cav 19,5; tank 6,2-9,5'},
    events:[{day:2, team:1, say:'6 July. The 2/16th Battalion goes for El Atiqa and the 2/27th for El Boum.'},
      {day:6, team:1, say:'7 July. The 2/3rd and 2/5th Battalions and two companies of the 2/14th come through El Boum to swing round Damour to the east.', spawn:'inf*4 22,14-27,17; mortar 24,17'},
      {day:10, team:1, say:'8 July. General Dentz asks for an armistice. His troops in Damour begin to slip away.', hurt:1}]},
};
for (const [id, m] of Object.entries(LEVANT_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  litani:{forces:['The 21st Australian Brigade (2/14th, 2/16th and 2/27th Battalions), No. 11 (Scottish) Commando and the 2/6th Field Company', 'Vichy French troops of the Armée du Levant on the ridge north of the river, with armoured cars, and the destroyers Guépard and Valmy offshore'],
    win:'The Litani is crossed, and the coast road to Sidon is open.', lose:'The Australians are held on the south bank.',
    real:'The commandos landed in daylight at three places, after surf had wrecked the plan for a night landing, and the French blew the bridge. The 2/16th Battalion crossed under fire in a single canvas boat that carried eight men at a time and, with the commandos, cleared the French ridge by evening. The commandos lost heavily: their leader, Lieutenant Colonel Pedder, was killed and Geoffrey Keyes took over. The 2/6th Field Company built a bridge in the night, and the 2/27th crossed it at 5 am on 10 June. Sidon fell on 13 June.'},
  damascus:{forces:['The 5th Indian Infantry Brigade (3/1st Punjab, 4/6th Rajputana Rifles), then Free French troops, the British 16th Brigade and the Australian 2/3rd Battalion', 'Vichy French troops of the Armée du Levant holding the approaches, the forts and the city'],
    win:'Damascus falls, and the Vichy garrison retreats along the Beirut road.', lose:'Mezzeh is lost and the advance on Damascus stalls.',
    real:'The Indian battalions set off at 20:30 on 18 June and took Mezzeh after hand-to-hand fighting early on 19 June. Cut off, and out of ammunition and food, they were overrun on 20 June after a French white flag was taken for a surrender. A relief column retook Mezzeh that evening and found it "empty save for the dead". The Free French took Qadim on the morning of 21 June, and at about 11:00 the Vichy garrison of Damascus surrendered.'},
  damour:{forces:['The 7th Australian Division: the 21st Brigade, the 2/3rd and 2/5th Battalions, the 2/2nd Pioneer Battalion and the 6th Division Cavalry', 'Vichy French troops holding the last defences before Beirut'],
    win:'Damour falls and the road to Beirut is open. The campaign is over.', lose:'The wadi holds.',
    real:'On 6 July the 2/16th Battalion took El Atiqa and the 2/27th took El Boum. On 7 July the 2/3rd and 2/5th Battalions went through El Boum and round Damour to the east, and on 8 July the Australians cut the road to Beirut north of the town. Dentz asked for an armistice that day. At 4 am on 9 July a cavalry patrol drove through Damour: its defenders had slipped away. A ceasefire took effect at one minute past midnight on 12 July, and the Armistice of Saint Jean d\'Acre was signed on 14 July 1941. The campaign cost the Australians 1,552 casualties, 416 of them killed.'},
});
Object.assign(CO_FATE, {
  lavarack:'Commanded I Australian Corps in Syria. Became the first Australian-born Governor of Queensland in 1946. Died at Buderim in 1957.',
  lloyd:'Commanded the 14th Indian Division in the First Arakan offensive in Burma and was removed after its defeat. Killed on 22 January 1944, struck by a vehicle while watching a training exercise in the desert.',
  allen:'Led the 7th Division on the Kokoda Track in 1942 until he was relieved on 29 October. After the war he was a partner in a Sydney accountancy firm. Died in 1959.',
  dentz:'Sentenced to death as a collaborator in 1945; de Gaulle commuted the sentence to life imprisonment. Died in Fresnes Prison on 13 December 1945.',
});
Object.assign(MISSION_LONLAT, {litani:[35.25, 33.34], damascus:[36.29, 33.51], damour:[35.45, 33.73]});
EUROPE.cities.push(['Beirut', 35.5, 33.89], ['Damascus', 36.29, 33.51]);
CAMPAIGNS.push({id:'levant', name:'Operation Exporter', sub:'Syria and Lebanon, the Litani to Damour · June–July 1941', side:'allies', missions:['litani', 'damascus', 'damour']});
{ const order = ['training', 'china', 'weiss', 'gelb', 'winterwar', 'north', 'levant', 'sea', 'atlantic', 'carrier', 'desert', 'foxdesert', 'diggers', 'italy', 'barbarossa', 'rising', 'philippines', 'burma', 'pacific', 'east', 'italy44', 'maple', 'west', 'axis', 'fareast'];   // in the order the war happened
  CAMPAIGNS.sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99)); }
