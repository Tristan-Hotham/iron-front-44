/* ============================== NORWAY AND CRETE ==============================
   The battles of the fjords and the islands, 1940-41: an old fortress that sank a
   cruiser, a destroyer raid up a snowbound fjord, the Foreign Legion at Narvik, and
   the New Zealanders and Australians against the paratroopers on Crete. */

/* Norway */
FLAG_EXTRA.no = (g, x, y, w, h) => { g.fillStyle = '#ba1f2e'; g.fillRect(x, y, w, h); g.fillStyle = '#f4f4ee'; g.fillRect(x + w * .27, y, w * .18, h); g.fillRect(x, y + h * .36, w, h * .28); g.fillStyle = '#1a2e6a'; g.fillRect(x + w * .315, y, w * .09, h); g.fillRect(x, y + h * .43, w, h * .14); };
MARK_EXTRA.noroundel = (P, x, y, s = 1) => { P.circ(x, y, 2.6 * s, '#ba1f2e'); P.circ(x, y, 1.8 * s, '#f4f4ee'); P.circ(x, y, 1 * s, '#1a2e6a'); };
Object.assign(HELMET_COL, {no:'#5e6650', anz:'#7a6e4a'});
Object.assign(NAT_BASE, {anz:'uk'});
Object.assign(INF_WEAPONS, {no:{inf:['rifle', 'rifle', 'bren'], at:['rifle', 'satchel'], eng:['rifle', 'satchel'], mortar:['shell', 'rifle']}, anz:{inf:['rifle', 'rifle', 'bren'], at:['ptrd', 'rifle'], eng:['rifle', 'bangalore'], mortar:['shell', 'rifle']}});
NATION.no = {n:'Norway', adj:'Norwegian', short:'Hæren & Kystartilleriet', side:'allies',
  col:{m:'#5e6650', d:'#3c4234', ui:'#ba1f2e', team:'#ba1f2e', hi:'#c8ccb8'},
  uniform:'#5e6650', helmet:'adrian', star:'noroundel', skin:'#e8c4a4',
  u:{
    inf:  {n:'Infantry (Krag-Jørgensen)', w:'Krag-Jørgensen & Madsen LMG', snd:'bren', cost:900},
    at:   {n:'Infantry with Charges', w:'grenades & dynamite', snd:'satchel', pow:.8, cost:2000},
    eng:  {n:'Pioneers', w:'charges', snd:'bangalore'},
    mortar:{n:'81 mm Mortar', w:'81 mm mortar', snd:'mortar'},
    art:  {n:'Kongsberg 7.5 cm Mountain Gun', w:'75 mm', snd:'howitzer', shape:'m2a1', pow:.9},
    nest: {n:'Colt MG Post', w:'Colt M/29', snd:'bren', shape:'nest'},
    pak:  {n:'Coastal Battery', w:'Krupp 28 cm guns of 1892, named Moses and Aron', snd:'bigguns', shape:'casemate', rng:[1,4], pow:1.1, dmg:{bb:70, dd:85, lc:110, merch:110, esc:90, inf:60, at:60, eng:60}},
    rkt:  {n:'Kaholmen Torpedo Battery', w:'three 45 cm torpedoes, launched from inside the rock', snd:'torpedo', shape:'casemate', mt:'none', mv:0, fixed:true, rng:[1,3], cost:9000, dmg:{bb:95, dd:100, lc:90, merch:110, esc:100}},
  }};
MOOD_ALIAS.no = 'campaign';
BARKS.no = {sel:['Ja!', 'Javel!', 'Klar!'], veh:['Fremad!'], atk:['Skyt!', 'Fyr!', 'For Norge!'], kill:['Truffet!', 'Han er nede!'], hurt:['Sanitet!', 'Dekning!'], cap:['Vår!'], new:['Klar!'], idle:['Kaldt…', 'Kaffe?', 'Hvor er engelskmennene?']};

/* the ANZACs: New Zealanders and Australians in the Middle East, Crete and New Guinea */
NATION.anz = {n:'Australia & New Zealand', adj:'ANZAC', short:'2nd AIF & 2nd NZEF', side:'allies',
  col:{m:'#8a7a52', d:'#5a4e34', ui:'#c9473f', team:'#c9473f', hi:'#d8ccaa'},
  uniform:'#8a7a52', helmet:'brodie', star:'ukcockade',
  u:Object.assign({}, NATION.uk40.u, {
    inf:  {n:'Infantry (2nd NZ Division)', w:'SMLE, Bren & bayonets', snd:'bren'},
    at:   {n:'Boys Anti-tank Rifle Team', w:'.55 in Boys rifle', snd:'ptrd', pow:.85, cost:2500},
    cav:  {n:'28th (Maori) Battalion', w:'SMLE, Bren & the haka', snd:'charge', cost:1800, horse:false, pow:1.1},
    recon:{n:'Bren Carrier', w:'Bren', snd:'bren', shape:'carrier', mt:'tread', mv:7, cost:3500},
    tank: {n:'Light Tank Mk VIB', w:'.50 Vickers', snd:'bren', shape:'pz2', pow:.6, cost:4500},
    mtank:{n:'Matilda II', w:'QF 2-pounder', snd:'gun37', shape:'matilda', mv:3, pow:.8, arm:.62, cost:10000},
    art:  {n:'QF 25-pounder', w:'87.6 mm gun-howitzer', snd:'howitzer', shape:'pdr25'},
    mortar:{n:'ML 3-inch Mortar', w:'3 in mortar', snd:'mortar'},
    eng:  {n:'Sappers (NZ Engineers)', w:'charges & rifles', snd:'bangalore'},
    nest: {n:'Vickers MG Post', w:'.303 Vickers', snd:'bren', shape:'nest'},
    aa:   {n:'Bofors 40 mm', w:'40 mm', snd:'bofors', shape:'k61', mt:'tire'},
  })};
INF_WEAPONS.anz.cav = ['rifle', 'bren'];
MOOD_ALIAS.anz = 'uk';
BARKS.anz = {sel:['Yes, sir!', 'Righto!', 'On it!', 'Too right!'], veh:['Let\'s go!'], move:['Come on, boys!', 'Follow me!'], atk:['Give it to \'em!', 'Fix bayonets!', 'Ka mate!', 'Fire!'],
  kill:['Got him!', 'He\'s down!', 'Beauty!'], hurt:['Stretcher bearer!', 'I\'m hit!', 'Get down!'], cap:['Ours now!'], new:['Ready!'], idle:['Strewth, it\'s hot.', 'Anyone seen the brew?', 'When\'s the boat home?', 'Bloody Jerries.']};

/* the paratroopers and mountain troops */
const FJ41 = {inf:{n:'Fallschirmjäger', w:'MP 40, Kar98k & MG 34', snd:'mg34', pow:1.1}, art:{n:'7.5 cm Leichtgeschütz 40 (dropped by parachute)', w:'75 mm recoilless gun', shape:'lefh', pow:.85}, eng:{n:'Fallschirm-Pioniere'}};

Object.assign(CO, {
  eriksen:{n:'Birger Eriksen', nat:'no', rank:'Oberst', nick:'Oscarsborg Fortress',
    bio:'Commander of Oscarsborg, an old fortress on the Drøbak narrows of the Oslofjord. In the dark of 9 April 1940, with no orders and no idea whose warships they were, he decided to fire: "Either I will be decorated, or I will be court-martialled. Fire!" His 1890s guns and torpedoes sank the heavy cruiser Blücher.',
    d2d:{txt:'Coastal guns +20% firepower.', atk:{indirect:20}},
    cop:{n:'Fire!', star:3, txt:'All units +30% firepower.', atk:{all:30}},
    scop:{n:'Moses and Aron', star:6, txt:'All units +45% firepower.', atk:{all:45}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#a8a098', jaw:2, tunic:'#5e6650', moustache:true},
    say:{start:'Either I will be decorated, or court-martialled.', win:'She is sinking.', lose:'They are through the narrows.', power:'Fire!'}},
  warburton:{n:'Bernard Warburton-Lee', nat:'uk40', rank:'Captain', nick:'2nd Destroyer Flotilla',
    bio:'Sent with five destroyers up the Ofotfjord to Narvik in a snowstorm, on the information that there were six German destroyers there, he signalled: "Intend attacking at dawn." He was killed on the bridge of HMS Hardy, and awarded the first Victoria Cross of the war.',
    d2d:{txt:'Destroyers +10% firepower.', atk:{sea:10}},
    cop:{n:'Torpedoes', star:3, txt:'All units +25% firepower.', atk:{all:25}},
    scop:{n:'Intend Attacking at Dawn', star:6, txt:'All units +40% firepower and +1 move.', atk:{all:40}, mv:{sea:1}},
    look:{cap:'navy', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#1a1a2a'},
    say:{start:'Intend attacking at dawn.', win:'Keep on engaging the enemy.', lose:'Hardy is going aground.', power:'Torpedoes away!'}},
  bonte:{n:'Friedrich Bonte', nat:'ger40', rank:'Kommodore', nick:'Destroyers, Narvik',
    bio:'Commanded the ten German destroyers that carried Dietl\'s mountain troops to Narvik on 9 April 1940. They could not leave until they refuelled. He was killed when his flagship Wilhelm Heidkamp was torpedoed in the British raid at dawn the next day.',
    d2d:{txt:'Destroyers +10% defence.', def:{sea:10}},
    cop:{n:'Battle Stations', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'From the Side Fjords', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'navy', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#1a1a2a'},
    say:{start:'Refuel and get out to sea.', win:'They are retiring.', lose:'Heidkamp is hit!', power:'Feuer!'}},
  kummetz:{n:'Oskar Kummetz', nat:'ger40', rank:'Konteradmiral', nick:'Group 5, Oslo',
    bio:'Commanded the naval group sent to take Oslo on 9 April 1940, flying his flag in the brand-new heavy cruiser Blücher, with soldiers and government officials aboard to take over Norway. He swam ashore when she sank.',
    d2d:{txt:'Ships +10% firepower.', atk:{sea:10}},
    cop:{n:'Full Ahead', star:3, txt:'Ships +1 move.', mv:{sea:1}},
    scop:{n:'Weserübung', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'navy', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#1a1a2a'},
    say:{start:'They will not fire. Norway is neutral.', win:'Oslo by breakfast.', lose:'Abandon ship.', power:'Feuer frei!'}},
  bethouart:{n:'Antoine Béthouart', nat:'fr40', rank:'Général de brigade', nick:'Narvik Expeditionary Force',
    bio:'A mountain-troops general who commanded the French and Polish forces at Narvik. On 28 May 1940 his Foreign Legion, Chasseurs Alpins, Poles and the Norwegians took Narvik back: the first Allied victory on land of the war, a week before the evacuation.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'La Légion', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Narvik', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'kepi', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a5a48'},
    say:{start:'Narvik, and then we see.', win:'Narvik is free.', lose:'Back to the boats.', power:'En avant la Légion!'}},
  dietl:{n:'Eduard Dietl', nat:'ger40', rank:'Generalmajor', nick:'Gebirgsjäger, Narvik',
    bio:'Landed at Narvik with 2,000 Austrian mountain troops on 9 April 1940, and held on for two months against four times his number, reinforced by the sailors of the sunk destroyers, until the Allies left. Hitler made him a hero.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Edelweiss', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Into the Mountains', star:6, txt:'All units +30% defence and +20% firepower.', def:{all:30}, atk:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#6a6c5c', collar:'#30a050'},
    say:{start:'Hold the town. Then the mountains. Then Sweden if we must.', win:'They are leaving!', lose:'Into the mountains.', power:'Gebirgsjäger, vor!'}},
  freyberg:{n:'Bernard Freyberg VC', nat:'anz', rank:'Major General', nick:'Creforce',
    bio:'A giant of a man who had swum the Hellespont at Gallipoli and won the Victoria Cross in France. He commanded the defence of Crete in May 1941. Ultra told him exactly where the paratroopers would land; he feared a landing from the sea more, and it never came.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'Counter-attack', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Creforce', star:6, txt:'All units +30% firepower and defence.', atk:{all:30}, def:{all:30}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:2, tunic:'#8a7a52', medals:true},
    say:{start:'Kill them as they land.', win:'The airfield is ours again.', lose:'Back to the south coast.', power:'Up the Kiwis!'}},
  kippenberger:{n:'Howard Kippenberger', nat:'anz', rank:'Colonel', nick:'10th NZ Brigade',
    bio:'A lawyer from Canterbury who commanded the scratch 10th Brigade on Crete. At Galatas on 25 May 1941 he gathered every man he could find, gave them two Light Tanks, and sent them back into the village with the bayonet.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Fix Bayonets', star:3, txt:'Infantry +30% firepower.', atk:{foot:30}},
    scop:{n:'Galatas', star:6, txt:'All units +40% firepower.', atk:{all:40}},
    look:{cap:'brit', crown:'#8a7a54', band:'#8a7a54', face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#8a7a52'},
    say:{start:'Every man with a rifle. We go back in.', win:'Galatas is ours.', lose:'Fall back on the line.', power:'Charge!'}},
  ringel:{n:'Julius Ringel', nat:'ger40', rank:'Generalmajor', nick:'5. Gebirgs-Division',
    bio:'An Austrian mountain-troops general whose division was flown into Maleme airfield on Crete while it was still under fire, and fought its way across the island after the paratroopers had won their foothold.',
    d2d:{txt:'Infantry +15% firepower.', atk:{foot:15}},
    cop:{n:'Air Landing', star:3, txt:'All units +20% firepower.', atk:{all:20}},
    scop:{n:'Over the Mountains', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#6a6c5c', collar:'#30a050'},
    say:{start:'Push on to Sphakia. Cut them off from the sea.', win:'They are surrendering.', lose:'They got away by sea.', power:'Vorwärts!'}},
});
for (const id of ['eriksen', 'warburton', 'bonte', 'kummetz', 'bethouart', 'dietl', 'freyberg', 'kippenberger', 'ringel']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {eriksen:'cautious', warburton:'aggressive', bonte:'cautious', kummetz:'reckless', bethouart:'methodical', dietl:'cautious', freyberg:'cautious', kippenberger:'aggressive', ringel:'aggressive'});

const NORTH_MISSIONS = {
  oscarsborg:{name:'Oscarsborg', place:'The Drøbak narrows of the Oslofjord', date:'9 April 1940, 04:17', theme:'norway', weather:'overcast',
    p1:{nat:'no', co:'eriksen', funds:0, u:{pak:{pow:1.25, rng:[1,5]}, rkt:{rng:[1,4]}}}, persona:{2:'reckless'},
    p2:{nat:'ger40', co:'kummetz', funds:0, u:{bb:{n:'Heavy Cruiser Blücher', w:'eight 20.3 cm guns, and 1,000 soldiers below decks', shape:'bbger', mv:3, pow:.8, arm:.43}, dd:{n:'Heavy Cruiser Lützow & Torpedo Boats', shape:'z36'}, lc:{n:'R-boat with Troops'}}},
    objective:{win:'kill', role:'bb', n:1, limit:3}, goal:'The Blücher is in the narrows, five hundred yards away. Sink her by {limit}, before her guns find you.',
    whyText:{kill:'the Blücher is sinking, and the King and government escape from Oslo'},
    brief:'04:17, 9 April 1940. Ships with no lights are coming up the Oslofjord in the dark: a heavy cruiser, a pocket battleship and torpedo boats. Norway is neutral. Nobody has told you whose they are, or whether to fire. You are Colonel Eriksen, commanding the old fortress of Oscarsborg on the Drøbak narrows, with two 28 cm guns made by Krupp in 1892, named Moses and Aron, and a torpedo battery hidden in the rock of Kaholmen that has never fired in anger. If those ships reach Oslo, they will capture the King and the government by breakfast.',
    clock:{start:'1940-04-09T04:17', step:60},
    build:() => { const b = MB(30, 22, 'M', 50101);
      b.rect(10, 0, 19, 21, '~'); b.rect(13, 8, 16, 13, '~');                                     // the fjord, narrowing at Drøbak
      b.rect(10, 9, 12, 12, 'M').rect(17, 9, 19, 12, '^');
      b.blobs('T', 6, 0, 0, 29, 21, 1, 2, ['M']).blobs('^', 6, 0, 0, 29, 21, 1, 2, ['M']);
      b.rect(5, 9, 9, 12, '.').rect(20, 9, 24, 12, '.');
      b.put([[7, 11, 'Q'], [21, 10, 'C'], [6, 3, 'c'], [4, 18, 'C'], [24, 3, 'k'], [25, 19, 'k'], [15, 0, 'o']]);
      return b.rows(); },
    units:{1:'pak*3 11,8-12,13; rkt*2 17,9-17,12; nest*2 9,8-10,13; inf*3 5,8-9,13; art 20,11',
      2:'bb 14,11; dd*2 12,17-17,20; lc*2 11,19-18,21'},
    events:[{day:1, team:1, say:'"Either I will be decorated, or I will be court-martialled. Fire!"', hurt:0},
      {day:2, team:2, say:'Lützow and the torpedo boats pull back and land troops lower down the fjord.', spawn:'inf*3 20,15-24,19'}]},
  narvikfjord:{name:'Narvik Fjord', place:'Ofotfjord, in a snowstorm', date:'10 April 1940, 04:30', theme:'norway', weather:'snow',
    p1:{nat:'uk40', co:'warburton', funds:0, u:{dd:{n:'H-class Destroyer (Hardy, Hunter, Havock, Hotspur, Hostile)', shape:'tribal', indirect:false, rng:[1,4]}}},   /* a close-range fight in a narrow fjord: guns and torpedoes on the move */
    p2:{nat:'ger40', co:'bonte', funds:0, u:{merch:{n:'Ore Ship', shape:'freighter'}, dd:{n:'Zerstörer 1934A', shape:'z36', indirect:false, rng:[1,4]}}},
    objective:{win:'kill', role:'dd', n:4, limit:7}, goal:'Raid Narvik harbour: sink four German destroyers by {limit}.',
    brief:'Yesterday ten German destroyers carried Dietl\'s mountain troops to Narvik and took the town. They are still there, refuelling from a single tanker. Captain Warburton-Lee has been sent up the fjord with five older destroyers, in a snowstorm, on a report that there are six. A Norwegian pilot on shore told him there were more, and that the fjord is mined. He has signalled: "Intend attacking at dawn." Some of the German destroyers are in the side fjords, waiting.',
    clock:{start:'1940-04-10T04:30', step:60},
    build:() => { const b = MB(34, 20, 'M', 50202);
      b.rect(0, 6, 33, 13, '~'); b.rect(22, 0, 26, 6, '~'); b.rect(14, 13, 18, 19, '~');           // the Ofotfjord, Herjangsfjord and Ballangen
      b.blobs('T', 6, 0, 0, 33, 19, 1, 2, ['M']).blobs('^', 6, 0, 0, 33, 19, 1, 2, ['M']);
      b.rect(27, 10, 33, 13, '.').rect(28, 10, 33, 11, 'U', ['.']);
      b.put([[29, 12, 'o'], [31, 11, 'q'], [30, 13, 'k'], [2, 4, 'C'], [3, 15, 'P']]);
      return b.rows(); },
    units:{1:'dd*5 0,7-4,12',
      2:'dd*3 25,8-30,12; merch*3 26,9-31,12; dd 23,1-25,4'},
    events:[{day:2, team:2, say:'Two more destroyers come out of the Herjangsfjord behind the British.', spawn:'dd 22,0-26,3'},
      {day:3, team:2, say:'Georg Thiele and Bernd von Arnim come out of Ballangen. Hardy is hit on the bridge.', spawn:'dd 14,16-18,19', hurt:1, hurtTeam:1},
      {day:4, team:1, say:'Retiring down the fjord, the flotilla sinks the ammunition ship Rauenfels.', hurt:1}]},
  narvikland:{name:'Narvik', place:'The town and the hills above it', date:'28 May 1940, 00:00', theme:'norway', weather:'clear',
    p1:{nat:'fr40', co:'bethouart', funds:0, u:{inf:{n:'13e Demi-Brigade de la Légion Étrangère', w:'Lebel rifles, FM 24/29 & grenades', pow:1.05}, cav:{n:'Chasseurs Alpins (on skis)', w:'MAS 36 & FM 24/29', snd:'bren', horse:false, mv:5, shape:'ski'}}},
    p2:{nat:'ger40', co:'dietl', funds:0, u:{inf:{n:'Gebirgsjäger-Regiment 139', w:'Kar98k & MG 34'}, eng:{n:'Sailors from the sunk destroyers', w:'rifles from the town armoury', pow:.8}}},
    objective:{win:'hq', limit:18}, goal:'Land at Orneset in the midnight sun and take Narvik by {limit}.',
    brief:'In France the German armies are on the Channel and the war is being lost. In Norway, far to the north, the Allies are about to win something. At midnight, in broad daylight, the Foreign Legion crosses the Rombaksfjord in landing craft to Orneset, with Norwegian battalions coming down from the mountains, the Polish Podhale Brigade on the far side of the peninsula and the guns of the Royal Navy behind them. Dietl\'s mountain troops and the sailors of his sunk destroyers hold the town. Unknown to the soldiers, the order to evacuate Norway has already been given.',
    clock:{start:'1940-05-28T00:00', step:120},
    build:() => { const b = MB(32, 22, 'M', 50303);
      b.rect(0, 0, 31, 4, '~').rect(0, 18, 31, 21, '~');                                            // the Rombaksfjord and the Beisfjord
      b.blobs('^', 10, 0, 5, 31, 17, 1, 2, ['M']).blobs('T', 5, 0, 5, 31, 17, 1, 1, ['M', '^']);
      b.rect(0, 5, 2, 8, 's').rect(20, 9, 28, 15, 'U', ['^', 'M', 'T']);
      b.road([[3, 6], [12, 9], [24, 12], [31, 12]]).road([[24, 17], [24, 5]]);
      b.put([[1, 6, 'Q'], [6, 14, 'C'], [24, 12, 'q'], [22, 10, 'k'], [27, 14, 'k'], [24, 17, 'o'], [14, 7, 'k'], [29, 7, 'k']]);
      return b.rows(); },
    units:{1:'inf*6 0,5-4,9; cav*3 3,10-8,16; inf*4 10,15-16,17; mortar*2 1,7-4,9; art*2 4,12-7,15',
      2:'inf*5 18,8-29,16; nest*2 19,9-24,14; eng*3 25,9-29,15; mortar 21,10-26,13; art 28,11; inf 12,6-16,9'},
    events:[{day:1, team:1, say:'00:00. The guns of HMS Southampton and the destroyers shell the hills above Narvik.', hurt:1},
      {day:2, team:2, say:'Dietl\'s men counter-attack the Legion on the ridge above the landing.', spawn:'inf*2 9,5-14,8'},
      {day:3, team:1, say:'The Norwegian 6th Division comes down from the mountains.', spawn:'inf*3 12,5-18,8'},
      {day:4, team:2, say:'Stukas from Bardufoss attack the ships in the fjord.', hurt:1, hurtTeam:1}]},
  maleme:{name:'Maleme', place:'Hill 107 and Maleme airfield, Crete', date:'20 May 1941, 08:00', theme:'greece', weather:'clear',
    p1:{nat:'anz', co:'freyberg', funds:0, u:{inf:{n:'22nd NZ Battalion', w:'SMLE & Bren'}, art:{n:'Captured Italian 75 mm Guns (no sights)', shape:'m2a1', pow:.75}}},
    p2:{nat:'ger40', co:'student', funds:0, u:FJ41},
    objective:{win:'survive', days:4, hold:3, protect:'inf', protectN:4}, goal:'Hold Hill 107 and the airfield at Maleme until {survive}. Keep four infantry units and three of your five positions. The paratroopers will land anywhere.', persona:{2:'brawler'},
    brief:'Operation Mercury: the first great airborne invasion in history. At eight in the morning the sky over Maleme fills with gliders and Junkers 52s, and thousands of parachutes. Many of the paratroopers are shot as they land or in the air; some land among the olive groves and the reeds of the dry riverbed and gather. You hold Hill 107, which commands the airfield. If the Germans get the airfield, they can fly in a whole division. Do not let them.',
    clock:{start:'1941-05-20T08:00', step:120},
    build:() => { const b = MB(30, 22, '.', 50404);
      b.rect(0, 0, 29, 2, '~').rect(0, 3, 29, 3, 's');
      b.scatter('G', .35, 0, 4, 29, 21, ['.']).blobs('^', 4, 12, 8, 26, 21, 1, 2);
      b.rect(15, 6, 18, 9, '^');                                                                     // Hill 107
      b.river([[11, 3], [10, 10], [11, 21]], .1); b.rect(5, 4, 9, 6, '.');                           // the Tavronitis and the airfield
      b.road([[0, 5], [29, 5]]);
      b.put([[17, 7, 'Q'], [7, 5, 'A'], [21, 5, 'C'], [22, 12, 'C'], [27, 4, 'C'], [2, 18, 'k'], [6, 12, 'c']]);
      return b.rows(); },
    units:{1:'inf*6 13,4-22,12; nest*3 14,6-19,9; mortar*2 16,8-19,10; art*2 18,9-21,11; at 8,6; mtank 17,10; aa 6,4',
      2:'inf*4 2,5-9,9; inf*3 10,12-14,17; eng 6,10; art 4,14'},
    events:[{day:1, team:2, say:'08:15. The second wave of gliders lands in the Tavronitis riverbed.', spawn:'inf*4 9,4-12,10'},
      {day:2, team:2, say:'More paratroopers land west of the river and gather in the olive groves.', spawn:'inf*5 0,6-6,12; art 3,9; inf*3 18,12-24,18'},
      {day:2, team:1, say:'The two Matildas counter-attack down the hill. One has the wrong ammunition; the other\'s turret jams.', hurt:0},
      {day:3, team:2, say:'Junkers 52s crash-land on the beach and the airfield, under fire, with mountain troops aboard.', spawn:'inf*4 2,3-9,6'},
      {day:4, team:2, say:'The Stukas come back, again and again.', hurt:1, hurtTeam:1}]},
  galatas:{name:'Galatas', place:'The village of Galatas, west of Canea', date:'25 May 1941, 18:00', theme:'greece', weather:'clear',
    p1:{nat:'anz', co:'kippenberger', funds:0, u:{inf:{n:'23rd NZ Battalion & every man Kippenberger could find', w:'SMLE, Bren & bayonets'}, tank:{n:'Light Tank Mk VIB (3rd Hussars)'}}},
    p2:{nat:'ger40', co:'ringel', funds:0, u:{inf:{n:'Gebirgsjäger & Fallschirmjäger', w:'Kar98k, MP 40 & MG 34'}}},
    objective:{win:'hq', limit:10}, goal:'Counter-attack: retake Galatas by {limit}, with the bayonet and two light tanks.',
    brief:'Maleme is lost; the Germans are flying in a division a day and pushing east. This evening they broke into Galatas, the last village before Canea. Colonel Kippenberger has gathered everyone he can find: the 23rd Battalion, the remains of the 18th, cooks, drivers, Greek soldiers and two light tanks of the 3rd Hussars. In the dusk, with the Germans still settling into the houses, they are going back in with the bayonet, yelling as they come.',
    clock:{start:'1941-05-25T18:00', step:120},
    build:() => { const b = MB(28, 20, '.', 50505);
      b.scatter('G', .35, 0, 0, 27, 19, ['.']).blobs('^', 5, 0, 0, 27, 19, 1, 2, ['.', 'G']);
      b.rect(16, 7, 22, 12, 'U', ['.', 'G', '^']).scatter('x', .2, 16, 7, 22, 12, ['U']);
      b.road([[0, 10], [16, 10], [27, 9]]).road([[19, 0], [19, 19]]);
      b.put([[2, 10, 'Q'], [5, 4, 'C'], [5, 16, 'C'], [19, 10, 'q'], [17, 8, 'k'], [21, 12, 'k'], [25, 4, 'k'], [25, 16, 'k']]);
      return b.rows(); },
    units:{1:'inf*9 1,4-9,16; cav*2 3,8-7,12; tank*2 4,9-7,11; mortar*2 2,9-4,12; art 1,12',
      2:'inf*4 15,6-23,13; nest 17,8-21,11; mortar 21,6-25,12; art 25,9; inf*2 23,2-27,6'},
    events:[{day:1, team:1, say:'Dusk. The New Zealanders go in with the bayonet, shouting. The Maori battalion does the haka.', heal:1},
      {day:2, team:2, say:'German reinforcements push in from the south.', spawn:'inf*2 18,16-24,19'},
      {day:3, team:2, say:'Stukas over Galatas at first light.', hurt:1, hurtTeam:1}]},
  sphakia:{name:'The Road to Sphakia', place:'Over the White Mountains to the south coast of Crete', date:'27 May 1941, 06:00', theme:'greece', weather:'clear',
    p1:{nat:'anz', co:'freyberg', funds:0, u:{inf:{n:'Creforce (New Zealanders, Australians, British & Greeks)', w:'SMLE & Bren'}, cav:{n:'28th (Maori) Battalion & 2/7th Australians'}}},
    p2:{nat:'ger40', co:'ringel', funds:0, u:{inf:{n:'5. Gebirgs-Division', w:'Kar98k & MG 34'}}},
    objective:{win:'convoy', role:'inf', need:4, exit:[0, 19, 33, 21], limit:12}, goal:'Crete is lost. Get four infantry units over the mountains to the beach at Sphakia (the south edge) by {limit}, where the Navy will take them off.',
    whyText:{convoy:'the rearguard held and the Navy took them off', sunk:'too many were left behind on the island'},
    brief:'It is over. Freyberg has ordered the evacuation of Crete. Every unit that can still march is to cross the White Mountains on a single goat track to Sphakia on the south coast, where the destroyers will come in at night to take them off. The mountain troops are close behind. Behind you, at 42nd Street, Australians and the Maori battalion have just driven the Germans back with a bayonet charge, which buys a day. The rearguards will have to buy the rest.',
    clock:{start:'1941-05-27T06:00', step:120},
    build:() => { const b = MB(34, 22, 'M', 50606);
      b.rect(0, 0, 33, 3, '.').scatter('G', .4, 0, 0, 33, 3, ['.']);
      b.blobs('^', 12, 0, 4, 33, 18, 1, 2, ['M']);
      b.path([[16, 3], [14, 8], [18, 12], [16, 17], [17, 20]], (x, y) => { b.set(x, y, '='); b.set(x + 1, y, '='); b.set(x - 1, y, '^'); });   // the track over the mountains
      b.rect(0, 20, 33, 21, 's').rect(12, 19, 22, 19, '.');
      b.put([[17, 20, 'P'], [16, 13, 'c'], [6, 2, 'k'], [27, 2, 'k']]);
      return b.rows(); },
    units:{1:'inf*10 10,0-24,4; cav*2 13,2-20,4; mortar*2 14,1-19,3; at*2 12,2-22,4',
      2:'inf*4 2,0-9,3; inf*3 25,0-33,3; mortar 3,1-8,3; art 30,1; inf 4,8-10,12'},
    events:[{day:2, team:2, say:'Mountain troops climb the ridges to cut the track ahead of the column.', spawn:'inf*3 25,8-31,13'},
      {day:3, team:1, say:'Night. Destroyers of the Mediterranean Fleet come into Sphakia bay and take off the first thousands.', heal:1},
      {day:4, team:2, say:'Stukas over the track.', hurt:1, hurtTeam:1},
      {day:5, team:2, say:'The Germans reach the heights above Sphakia.', spawn:'inf*2 26,15-31,18'}]},
};
for (const [id, m] of Object.entries(NORTH_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  oscarsborg:{forces:['Oscarsborg fortress: two 28 cm guns of 1892, smaller batteries and the Kaholmen torpedo battery', 'Naval Group 5: the heavy cruiser Blücher, the pocket battleship Lützow, the cruiser Emden and torpedo boats'],
    win:'The Blücher goes down in the narrows. The King and the government escape.', lose:'The fleet passes the narrows and reaches Oslo.',
    real:'At 04:21 on 9 April 1940 Oscarsborg\'s two old guns hit the Blücher at point-blank range, and two torpedoes from Kaholmen finished her. She capsized and sank in the narrows, with about 800 men. The delay let King Haakon VII, the government and the gold reserves escape from Oslo, and Norway fought on for two months. The torpedoes, built in 1900, had never been fired in war before.'},
  narvikfjord:{forces:['Five H-class destroyers of the 2nd Destroyer Flotilla', 'Ten German destroyers at and around Narvik'],
    win:'The German destroyers are smashed in Narvik harbour.', lose:'The flotilla is caught in the fjord.',
    real:'In the First Battle of Narvik on 10 April 1940, Warburton-Lee\'s destroyers sank two German destroyers and six merchant ships in the harbour and damaged others, but the German ships in the side fjords caught them as they left: Hardy was beached and Hunter sunk, and Warburton-Lee was killed. Three days later the battleship Warspite came up the fjord and sank the rest. Dietl\'s sailors became infantry.'},
  narvikland:{forces:['The Foreign Legion, Chasseurs Alpins, the Polish Podhale Brigade and Norwegian battalions', 'Dietl\'s mountain troops and the sailors of the sunk destroyers'],
    win:'Narvik is retaken: the first Allied victory on land.', lose:'Dietl holds the town.',
    real:'On 28 May 1940 the Allies took Narvik back: the first Allied victory on land in the war. Dietl retreated towards the Swedish border, nearly beaten. But the order to evacuate had already been given, and on 8 June the Allies left. Norway surrendered on 10 June. Many of the Legionnaires and Poles went on to fight with the Free French and the Polish army in exile.'},
  maleme:{forces:['The 22nd New Zealand Battalion on Hill 107, with captured Italian guns and two Matildas', 'The Fallschirmjäger of the Assault Regiment, landing by parachute and glider'],
    win:'Hill 107 holds, and the airfield is denied to the Germans.', lose:'The Germans take the airfield and fly in a division.',
    real:'The paratroopers suffered terrible losses on 20 May, and the Germans nearly called the operation off. But in the confusion of the night, out of touch and thinking his battalion was overrun, the commander of the 22nd Battalion withdrew from Hill 107. The Germans took the airfield the next morning and began flying in mountain troops; the counter-attack on the night of 21-22 May came too late. Crete was lost.'},
  galatas:{forces:['The 23rd New Zealand Battalion, stragglers, Greeks and two light tanks', 'German mountain troops and paratroopers'],
    win:'Galatas is retaken with the bayonet.', lose:'The counter-attack fails in the streets.',
    real:'Kippenberger\'s counter-attack on the evening of 25 May 1941 retook Galatas in one of the fiercest actions of the campaign, the New Zealanders charging through the streets yelling. But it could not be held, and the line fell back that night. Two days later at 42nd Street, Australians and the Maori Battalion made another bayonet charge that drove the Germans back and covered the start of the retreat.'},
  sphakia:{forces:['Creforce: New Zealand, Australian, British and Greek troops', 'The 5th Mountain Division'],
    win:'The rearguards hold, and most of the army gets away by sea.', lose:'The column is cut off in the mountains.',
    real:'Between 28 May and 1 June 1941 the Royal Navy took about 16,000 men off Crete, under air attack that sank three cruisers and six destroyers. About 12,000 were left behind and captured, including many of the rearguards. Cretan civilians fought the invaders and sheltered soldiers who escaped, and paid for it with savage reprisals. The paratroopers had lost so heavily that Hitler never ordered another major airborne operation.'},
});
Object.assign(CO_FATE, {
  eriksen:'Taken prisoner after the surrender. After the war he was criticised, absurdly, for not having done more, and was only properly honoured long after his death in 1958.',
  warburton:'Killed on the bridge of HMS Hardy on 10 April 1940 and awarded the first Victoria Cross of the war.',
  bonte:'Killed when his flagship Wilhelm Heidkamp was torpedoed in Narvik harbour on 10 April 1940.',
  kummetz:'Commanded the German battle group at the Battle of the Barents Sea in 1942. Died in 1980.',
  bethouart:'Commanded the French I Corps in the liberation of Alsace in 1944-45. Died in 1982.',
  dietl:'Commanded the German army in Lapland. Killed in a plane crash in Austria in June 1944.',
  freyberg:'Commanded the New Zealand Division in Africa and Italy, and was Governor-General of New Zealand from 1946 to 1952. Died in 1963.',
  kippenberger:'Lost both feet to a mine at Cassino in 1944. Edited New Zealand\'s official war histories. Died in 1957.',
  ringel:'Commanded a mountain corps in Austria in 1945. Died in 1967.',
});
Object.assign(MISSION_LONLAT, {oscarsborg:[10.61, 59.67], narvikfjord:[17.2, 68.42], narvikland:[17.43, 68.44], maleme:[23.84, 35.53], galatas:[23.98, 35.49], sphakia:[24.13, 35.2]});
EUROPE.cities.push(['Oslo', 10.75, 59.91], ['Narvik', 17.43, 68.44]);
CAMPAIGNS.push({id:'north', name:'Norway and Crete', sub:'Fjords and islands · 1940–1941', side:'allies', missions:['oscarsborg', 'narvikfjord', 'narvikland', 'maleme', 'galatas', 'sphakia']});
