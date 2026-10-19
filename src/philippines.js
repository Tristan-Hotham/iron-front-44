/* ============================== RETURN TO THE PHILIPPINES ==============================
   The Philippines, 1942 and 1944-45: the doomed defence of Bataan and Corregidor
   by Americans and Filipinos, and the return: Leyte, Breakneck Ridge, and the battle
   for Manila. "I shall return." */

const USAFFE = {inf:{n:'Philippine Scouts (57th Infantry)', w:'M1903 Springfield & BAR'}, tank:{n:'M3 Stuart (192nd Tank Battalion)'}, art:{n:'75 mm SPM Half-track', w:'75 mm M1897', shape:'m3ht'}, mortar:{n:'3-inch Stokes Mortar (duds half the time)', pow:.85}, recon:{n:'M3 Scout Car (26th Cavalry)', shape:'m8'}, cav:null};
const USA44 = {inf:{n:'Infantry (Sixth Army)', w:'M1 Garand & BAR', snd:'garand'}, mortar:{n:'M1 81 mm Mortar'}};

Object.assign(CO, {
  wainwright:{n:'Jonathan Wainwright', nat:'usp', rank:'Lieutenant General', nick:'Skinny',
    bio:'A lanky old cavalryman who commanded the I Philippine Corps on Bataan, then all the forces in the Philippines after MacArthur was ordered out to Australia. He surrendered Corregidor on 6 May 1942 to save his men from a massacre, and spent the rest of the war in Japanese prison camps, the highest-ranking American prisoner.',
    d2d:{txt:'Infantry +15% defence.', def:{foot:15}},
    cop:{n:'The Abucay Line', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Battling Bastards', star:6, txt:'All units +35% defence and +15% firepower.', def:{all:35}, atk:{all:15}},
    look:{cap:'helmet', stars:3, face:'#e8c4a4', hair:'#a8a098', jaw:1, tunic:'#8a7a52'},
    say:{start:'We hold until the convoy comes.', win:'They\'ve been stopped.', lose:'There is no convoy coming.', power:'Hold the line!'}},
  macarthur:{n:'Douglas MacArthur', nat:'usp', rank:'General', nick:'I Shall Return',
    bio:'Field Marshal of the Philippine Army and commander of US forces in the Far East in 1941. Ordered out of Corregidor in March 1942, he promised, "I shall return," and on 20 October 1944 he waded ashore at Leyte, in front of the cameras, to say: "People of the Philippines, I have returned."',
    d2d:{txt:'All units +10% firepower.', atk:{all:10}},
    cop:{n:'I Have Returned', star:3, txt:'All units +25% firepower.', atk:{all:25}},
    scop:{n:'Island Hopping', star:6, txt:'All units +30% firepower and +1 move; the fleet shells two positions for 3 HP.', atk:{all:30}, mv:{ground:1}, strike:{n:2, r:1, hp:3, kind:'naval'}},
    look:{cap:'navy', face:'#e8c4a4', hair:'#4a4a4a', jaw:1, tunic:'#b8a878', glasses:true},
    say:{start:'People of the Philippines, I have returned.', win:'Rally to me!', lose:'We will be back.', power:'I have returned!'}},
  krueger:{n:'Walter Krueger', nat:'usp', rank:'Lieutenant General', nick:'Sixth Army',
    bio:'Born in Prussia, he enlisted as a private in 1898 and rose to command the Sixth Army in New Guinea and the Philippines. Methodical and stubborn, he would not be hurried, which drove MacArthur to fury on Leyte and Luzon.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Methodical Advance', star:3, txt:'All units +20% firepower and defence.', atk:{all:20}, def:{all:20}},
    scop:{n:'Leyte Valley', star:6, txt:'All units +30% firepower; artillery +1 range.', atk:{all:30}, rng:{indirect:1}},
    look:{cap:'helmet', stars:3, face:'#e8c4a4', hair:'#a8a098', jaw:2, tunic:'#5a6040'},
    say:{start:'Take the ridge, one hill at a time.', win:'Breakneck is ours.', lose:'Pull back to the start line.', power:'Fire for effect!'}},
  griswold:{n:'Oscar Griswold', nat:'usp', rank:'Major General', nick:'XIV Corps',
    bio:'Commanded the XIV Corps in the battle for Manila in February 1945, a month of street fighting in a city of a million people, against Japanese marines who had been ordered to fight to the death and who massacred civilians as they did.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Street Fighting', star:3, txt:'Infantry +25% firepower.', atk:{foot:25}},
    scop:{n:'Intramuros', star:6, txt:'All units +35% firepower.', atk:{all:35}},
    look:{cap:'helmet', stars:2, face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#5a6040'},
    say:{start:'Through the city to the Walled City.', win:'Manila is free.', lose:'Hold the bridgehead over the Pasig.', power:'Get the tanks up!'}},
  homma:{n:'Masaharu Homma', nat:'jp', rank:'Lieutenant General', nick:'14th Army',
    bio:'A cultivated, Anglophile general who had served with the British in France in 1918. He commanded the invasion of the Philippines, and was humiliated when Bataan held out for three months. He was executed in 1946 for the Bataan Death March.',
    d2d:{txt:'Artillery +15% firepower.', atk:{indirect:15}},
    cop:{n:'Bombardment', star:3, txt:'Artillery +30% firepower.', atk:{indirect:30}},
    scop:{n:'Final Offensive', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Bataan in a week.', win:'Bataan has fallen.', lose:'They are still there. Send more men.', power:'Totsugeki!'}},
  nara:{n:'Akira Nara', nat:'jp', rank:'Lieutenant General', nick:'65th Brigade',
    bio:'Commanded the 65th Brigade, older reservists meant for garrison duty, which was sent against the Abucay line on Bataan in January 1942 and badly mauled by the Philippine Scouts.',
    d2d:{txt:'Infantry +10% firepower.', atk:{foot:10}},
    cop:{n:'Night Attack', star:3, txt:'Infantry +20% firepower and +1 move.', atk:{foot:20}, mv:{foot:1}},
    scop:{n:'Abucay', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Through the line at Abucay.', win:'The line is broken.', lose:'My brigade is finished.', power:'Banzai!'}},
  kataoka:{n:'Tadasu Kataoka', nat:'jp', rank:'Lieutenant General', nick:'1st Division',
    bio:'His 1st Division, one of the best in the Japanese army, landed at Ormoc on Leyte in November 1944 and dug into the ridges of what the Americans called Breakneck Ridge, holding them through a typhoon for weeks.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'Spider Holes', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Breakneck', star:6, txt:'All units +30% defence and +20% firepower.', def:{all:30}, atk:{all:20}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#8a7a4a'},
    say:{start:'Hold the ridges. Leyte will be decided here.', win:'They cannot climb in this rain.', lose:'Back to Ormoc.', power:'Fire!'}},
  makino:{n:'Shirō Makino', nat:'jp', rank:'Lieutenant General', nick:'16th Division',
    bio:'Commanded the 16th Division defending the east coast of Leyte, where the Americans landed in October 1944. The same division had taken Manila in 1942. He killed himself as Leyte fell.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Beach Defence', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Counter-attack', star:6, txt:'All units +30% firepower.', atk:{all:30}},
    look:{cap:'jpcap', face:'#e2c08e', hair:'#5a5450', jaw:1, tunic:'#8a7a4a', glasses:true},
    say:{start:'Throw them back into the sea.', win:'They are pinned on the beach.', lose:'Into the mountains.', power:'Banzai!'}},
  iwabuchi:{n:'Sanji Iwabuchi', nat:'jp', rank:'Rear Admiral', nick:'Manila Naval Defence Force',
    bio:'Disobeyed Yamashita\'s order to abandon Manila and held it with 16,000 sailors and marines, fighting street by street to the Walled City. His men massacred perhaps 100,000 Filipino civilians. He killed himself as the battle ended.',
    d2d:{txt:'All units +15% defence.', def:{all:15}},
    cop:{n:'Fortress Manila', star:3, txt:'All units +30% defence.', def:{all:30}},
    scop:{n:'To the Last', star:6, txt:'All units +40% defence.', def:{all:40}},
    look:{cap:'navy', face:'#e2c08e', hair:'#3a3430', jaw:1, tunic:'#2a3a2a'},
    say:{start:'Manila will be defended to the last man.', win:'They cannot cross the Pasig.', lose:'It is over.', power:'Fire!'}},
});
for (const id of ['wainwright', 'macarthur', 'krueger', 'griswold', 'homma', 'nara', 'kataoka', 'makino', 'iwabuchi']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {wainwright:'cautious', macarthur:'aggressive', krueger:'methodical', griswold:'methodical', homma:'aggressive', nara:'aggressive', kataoka:'cautious', makino:'cautious', iwabuchi:'cautious'});
delete USAFFE.cav;

const PH_MISSIONS = {
  bataan:{name:'The Abucay Line', place:'Bataan peninsula, Luzon', date:'12 January 1942, 06:00', theme:'tropic', weather:'clear',
    p1:{nat:'usp', co:'wainwright', funds:0, u:USAFFE},
    p2:{nat:'jp', co:'nara', funds:0, u:{inf:{n:'65th Brigade', w:'Arisaka & Type 96'}}},
    objective:{win:'survive', days:6, hold:3, protect:'inf', protectN:4}, goal:'Hold the Abucay line on Bataan until {survive}. Keep four infantry units and three of your four positions. Help is not coming, but nobody has told you.',
    persona:{2:'brawler'},
    brief:'The Japanese landed on Luzon in December 1941 and the American and Filipino army has retreated into the Bataan peninsula, a jungle of mountains, to hold the entrance to Manila Bay. Its men are on half rations, then quarter rations; they eat the cavalry horses, monkeys and lizards. They believe a convoy is coming from America. It is not. At Abucay, the Philippine Scouts, the best soldiers in the islands, hold the line with old Springfields, against attack after attack.',
    clock:{start:'1942-01-12T06:00', step:120},
    build:() => { const b = MB(32, 22, 'J', 90101);
      b.rect(0, 0, 3, 21, '~').rect(4, 0, 4, 21, 's').scatter('y', .35, 5, 0, 16, 21, ['J']).blobs('^', 6, 18, 0, 31, 21, 1, 2, ['J']).blobs('M', 3, 24, 0, 31, 21, 1, 1, ['J', '^']);
      b.path([[5, 9], [31, 10]], (x, y) => { if (b.get(x, y) !== 's') b.set(x, y, 'z'); });            // the line
      b.road([[5, 2], [6, 21]]).road([[6, 15], [20, 18]]);
      b.put([[6, 18, 'Q'], [8, 11, 'C'], [15, 12, 'C'], [22, 12, 'C'], [7, 2, 'k'], [16, 3, 'k'], [24, 4, 'k'], [12, 1, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 5,10-26,14; tank*2 8,13-12,16; art*2 6,15-10,18; mortar*2 10,11-16,14; nest*2 8,10-20,11',
      2:'inf*13 5,0-28,8; art*3 6,0-20,2; mortar*2 10,3-18,6; tank*3 6,2-10,5'},
    events:[{day:2, team:2, say:'The 65th Brigade attacks the Scouts\' line through the cane fields, over and over.', spawn:'inf*4 6,3-16,7'},
      {day:3, team:1, say:'Quarter rations. The 26th Cavalry\'s horses go to the cooks.', hurt:1, hurtTeam:1},
      {day:4, team:2, say:'Japanese infiltrate through the jungle on the slopes of Mount Natib, where nobody thought anyone could move.', spawn:'inf*3 24,8-30,14'},
      {day:5, team:1, say:'The Scouts counter-attack and retake the line.', heal:1}]},
  thepoints:{name:'The Battle of the Points', place:'Longoskawayan and Quinauan Points, Bataan', date:'29 January 1942, 07:00', theme:'tropic', weather:'clear',
    p1:{nat:'usp', co:'wainwright', funds:0, u:Object.assign({}, USAFFE, {eng:{n:'Naval Battalion (sailors and airmen with no planes)', w:'rifles they had never fired, uniforms dyed yellow with coffee', pow:.8}, at:{n:'2.95-inch Mountain Gun', w:'pack howitzer', snd:'howitzer', pow:1}})},
    p2:{nat:'jp', co:'homma', funds:0, u:{inf:{n:'2nd Battalion, 20th Infantry', w:'Arisaka & grenades'}}},
    objective:{win:'kill', role:'inf', n:11, limit:7}, goal:'Wipe out the Japanese landings on the points by {limit}: destroy eleven of their infantry units. They are trapped between the jungle and the cliffs.',
    whyText:{kill:'the landings on the points are wiped out'},
    brief:'The Japanese tried to outflank Bataan from the sea, landing battalions at night on the rocky points of the west coast behind the American line. They got lost in the dark and the jungle, and came ashore on cliffs and coves nobody was guarding: except sailors from the Cavite navy yard and airmen with no planes, armed with rifles and dressed in uniforms they had dyed yellow with coffee. The Japanese thought they were a new kind of suicide troops. The Scouts are on the way.',
    clock:{start:'1942-01-29T07:00', step:120},
    build:() => { const b = MB(30, 20, 'J', 90202);
      b.rect(0, 0, 4, 19, '~').rect(5, 0, 5, 19, 'u').rect(0, 6, 9, 8, 'J').rect(0, 13, 9, 15, 'J').rect(5, 6, 5, 8, 's').rect(5, 13, 5, 15, 's');   // the cliffs and the two points
      b.blobs('^', 6, 8, 0, 29, 19, 1, 2, ['J']);
      b.road([[29, 10], [12, 10], [12, 2], [12, 18]]);
      b.put([[28, 10, 'Q'], [16, 5, 'C'], [16, 15, 'C'], [22, 10, 'C'], [7, 7, 'k'], [7, 14, 'k']]);
      return b.rows(); },
    units:{1:'eng*4 10,3-16,17; inf*3 18,6-24,14; at*2 14,8-18,12; mortar*2 16,9-20,11; nest 12,9',
      2:'inf*8 5,5-10,9; inf*6 5,12-10,16; mortar*2 6,6-9,15; nest*2 7,7-8,14'},
    events:[{day:2, team:1, say:'The 57th Philippine Scouts arrive and go into the jungle with the bayonet.', spawn:'inf*3 20,8-24,12'},
      {day:3, team:2, say:'More Japanese land at night to rescue the first battalion, and get lost in their turn.', spawn:'inf*3 5,0-9,3'},
      {day:4, team:1, say:'The destroyer-sized minesweeper Quail and the guns of Corregidor shell the points.', hurt:1},
      {day:5, team:1, say:'Three Stuarts squeeze through the jungle trails.', spawn:'tank*3 20,9-24,11'}]},
  corregidor:{name:'Corregidor', place:'The Rock, in the mouth of Manila Bay', date:'5 May 1942, 23:00', theme:'tropic', weather:'clear',
    p1:{nat:'usp', co:'wainwright', funds:0, u:{inf:{n:'4th Marines & the Rock\'s defenders', w:'M1903 Springfield & BAR', snd:'garand'}, pak:{n:'Battery Way (12-inch mortars)', w:'12 in mortar'}}},
    p2:{nat:'jp', co:'homma', funds:0, u:{inf:{n:'61st Infantry Regiment', w:'Arisaka & knee mortars'}, lc:{n:'Daihatsu Landing Barge'}}},
    objective:{win:'survive', days:4, hold:2, protect:'inf', protectN:6}, goal:'Hold Corregidor until {survive}. Keep six infantry units and two of your three positions. Bataan has fallen; nobody is coming.',
    persona:{2:'reckless'},
    brief:'Bataan fell on 9 April. Only the fortress island of Corregidor, the Rock, still holds the mouth of Manila Bay: 13,000 men, half of them sick, in the tunnels of Malinta Hill, under a bombardment that has gone on for a month and has smashed every gun above ground. Tonight, at the full moon, Japanese barges are coming across the strait from Bataan towards the tail of the island. The 4th Marines and every man who can hold a rifle are waiting on the beaches.',
    clock:{start:'1942-05-05T23:00', step:120},
    build:() => { const b = MB(30, 20, '~', 90303);
      b.rect(4, 6, 26, 13, '.').blobs('^', 6, 4, 6, 26, 13, 1, 2, ['.']).rect(4, 6, 26, 6, 's').rect(4, 13, 26, 13, 's');
      b.rect(14, 8, 16, 11, 'B');                                                                      // Malinta tunnel
      b.road([[5, 10], [26, 9]]).rect(0, 0, 4, 4, 'J').rect(0, 0, 2, 2, '^');                     /* the tip of Bataan, across the strait */
      b.put([[15, 9, 'Q'], [8, 9, 'C'], [22, 10, 'C'], [1, 1, 'q']]);
      return b.rows(); },
    units:{1:'inf*7 6,7-25,12; nest*3 18,7-25,12; pak*2 8,8-10,11; mortar*2 12,8-17,11; at 20,9',
      2:'lc*6 26,2-29,5 +inf+inf; lc*4 26,14-29,17 +inf+inf; art*2 0,1-3,4'},
    events:[{day:1, team:2, say:'Japanese guns on Bataan pound the beaches. Then the barges come in on the strong current, off course.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'Three Japanese tanks land at North Point.', spawn:'tank*3 22,6-25,8'},
      {day:2, team:1, say:'The reserve battalion of the 4th Marines counter-attacks in the dark.', spawn:'inf*2 13,8-17,11'},
      {day:3, team:2, say:'The second wave lands.', spawn:'inf*4 20,6-26,8'}]},
  leyte:{name:'Leyte', place:'Red Beach, Palo', date:'20 October 1944, 10:00', theme:'pacific', weather:'clear',
    p1:{nat:'usp', co:'macarthur', funds:0, u:Object.assign({}, USA44, {inf:{n:'24th Infantry Division', w:'M1 Garand & BAR', snd:'garand'}})},
    p2:{nat:'jp', co:'makino', funds:0, u:{inf:{n:'16th Division', w:'Arisaka & Type 96'}}},
    objective:{win:'hq', limit:11}, goal:'Land at Red Beach and take Palo and the hill behind it by {limit}.',
    brief:'Thirty-one months after he left Corregidor, MacArthur is coming back. The largest fleet ever assembled has carried the Sixth Army to the east coast of Leyte, in the middle of the Philippines. At Red Beach near Palo, the 24th Division lands into fire from Hill 522 and the coconut groves, and has to get off the beach. In the afternoon, MacArthur will wade ashore in front of the cameras. Out at sea, the Japanese fleet is gathering for the greatest naval battle in history.',
    clock:{start:'1944-10-20T10:00', step:120},
    build:() => { const b = MB(32, 22, 'L', 90404);
      b.rect(0, 18, 31, 21, '~').rect(0, 16, 31, 17, 's').scatter('y', .4, 0, 4, 31, 15, ['L']).blobs('^', 6, 14, 0, 31, 12, 1, 2);
      b.rect(20, 2, 24, 6, '^');                                                                         // Hill 522
      b.river([[0, 10], [14, 12], [31, 9]], .15);
      b.road([[0, 14], [31, 14]]).road([[18, 14], [21, 4]]);
      b.put([[15, 17, 'P'], [21, 4, 'q'], [17, 11, 'k'], [8, 8, 'k'], [27, 9, 'k'], [5, 3, 'k']]);
      return b.rows(); },
    units:{1:'lc*6 3,18-28,20 +inf+inf; tank*3 6,16-24,17; dd*2 8,21-24,21; inf*3 8,16-20,17',
      2:'nest*4 6,13-26,15; inf*7 4,4-28,13; art*2 18,1-26,5; mortar*2 12,8-22,12; at 16,12'},
    events:[{day:1, team:1, say:'The battleships and cruisers of the Seventh Fleet fire on the hills behind the beach.', hurt:1},
      {day:2, team:1, say:'MacArthur wades ashore. "People of the Philippines, I have returned!" Filipino guerrillas come out of the hills.', spawn:'inf*3 0,4-4,9', heal:1},
      {day:3, team:2, say:'Night counter-attacks from the hills.', spawn:'inf*3 16,1-24,4'},
      {day:4, team:1, say:'More divisions come ashore.', spawn:'inf*3 8,16-22,17; art*2 12,16-18,17'}]},
  breakneck:{name:'Breakneck Ridge', place:'The ridges above Carigara Bay, Leyte', date:'5 November 1944, 07:00', theme:'tropic', weather:'rain',
    p1:{nat:'usp', co:'krueger', funds:0, u:Object.assign({}, USA44, {inf:{n:'21st Infantry Regiment (24th Division)', w:'M1 Garand & BAR', snd:'garand'}})},
    p2:{nat:'jp', co:'kataoka', funds:0, u:{inf:{n:'1st Division', w:'Arisaka, Type 99 LMG & knee mortars', pow:1.05}, nest:{n:'Spider Hole', w:'a rifleman in a covered pit'}}},
    objective:{win:'hq', limit:18}, goal:'Clear Breakneck Ridge and open the road to Ormoc by {limit}, in a typhoon.',
    brief:'The road south from Carigara Bay to Ormoc, the Japanese supply port on Leyte, climbs through a tangle of ridges the Americans have named Breakneck. The Japanese 1st Division, fresh from Manchuria, landed at Ormoc a few days ago and has dug in on every ridge, in spider holes that are invisible until they open fire. On 8 November a typhoon will hit the island.',
    clock:{start:'1944-11-05T07:00', step:120},
    build:() => { const b = MB(30, 22, 'J', 90505);
      b.rect(0, 0, 29, 2, '~').blobs('^', 12, 0, 3, 29, 21, 1, 2, ['J']).blobs('M', 4, 6, 4, 29, 21, 1, 1, ['^', 'J']);
      b.road([[3, 3], [10, 8], [14, 14], [20, 21]]);
      b.put([[2, 3, 'Q'], [6, 4, 'C'], [10, 8, 'k'], [14, 14, 'k'], [24, 6, 'k'], [19, 20, 'q'], [26, 16, 'k']]);
      return b.rows(); },
    units:{1:'inf*8 0,3-8,8; tank*2 2,4-6,6; art*3 0,4-3,8; mortar*2 3,5-7,8; eng 5,6',
      2:'inf*7 8,6-24,19; nest*5 9,7-20,17; mortar*2 14,10-22,16; art*2 20,16-26,20'},
    events:[{day:2, team:2, say:'Spider holes open up behind the Americans after they pass.', spawn:'inf*2 6,5-10,9'},
      {day:4, team:2, say:'The typhoon hits. Trees come down across the road. Nothing moves.', hurt:1, hurtTeam:1},
      {day:5, team:1, say:'The 32nd Division comes up to relieve the 24th.', spawn:'inf*3 0,3-5,7'}]},
  manila:{name:'Manila', place:'The Pasig river and the Walled City', date:'15 February 1945, 07:00', theme:'city', weather:'clear',
    p1:{nat:'usp', co:'griswold', funds:0, u:Object.assign({}, USA44, {inf:{n:'37th Infantry Division & 1st Cavalry Division', w:'M1 Garand & BAR', snd:'garand'}, tank:{n:'M4 Sherman'}})},
    p2:{nat:'jp', co:'iwabuchi', funds:0, u:{inf:{n:'Manila Naval Defence Force', w:'machine guns stripped from ships, and mines'}}},
    objective:{win:'hq', limit:14}, goal:'Fight across the Pasig and through the city to the Walled City of Intramuros by {limit}.',
    brief:'The 1st Cavalry Division raced into Manila and freed nearly 4,000 internees from Santo Tomas University. But General Yamashita\'s order to leave the city was ignored by Admiral Iwabuchi, whose 16,000 sailors and marines have turned the government buildings of Manila into fortresses and are killing the city\'s civilians as they fight. The bridges over the Pasig are blown. Beyond them is the old Spanish Walled City, Intramuros, with walls forty feet thick.',
    clock:{start:'1945-02-15T07:00', step:120},
    build:() => { const b = MB(34, 22, 'U', 90606);
      b.rect(30, 0, 33, 21, '~').scatter('x', .2, 0, 0, 29, 21, ['U']).scatter('.', .1, 0, 0, 29, 21, ['U']);
      b.river([[0, 8], [14, 9], [29, 8]], .1);                                                         // the Pasig
      b.rect(19, 11, 26, 17, 'B', ['U', 'x', '.']).rect(20, 12, 25, 16, 'x', ['B']);                   // Intramuros
      b.road([[0, 4], [29, 4]]).road([[10, 0], [10, 21]]).road([[0, 18], [29, 18]]);
      b.put([[2, 3, 'Q'], [6, 2, 'C'], [14, 3, 'C'], [22, 14, 'q'], [8, 12, 'k'], [15, 15, 'k'], [26, 6, 'k'], [4, 19, 'k'], [27, 19, 'k']]);
      return b.rows(); },
    units:{1:'inf*9 0,0-16,7; tank*3 2,1-10,5; art*3 0,1-3,6; mortar*2 5,2-12,6; eng*2 8,4-14,7; at 6,5',
      2:'inf*8 4,10-28,20; nest*5 6,10-26,19; at*2 12,10-22,14; mortar*2 18,15-26,19; art 27,15'},
    events:[{day:2, team:1, say:'The 37th Division crosses the Pasig in assault boats under fire.', spawn:'inf*3 6,10-12,12'},
      {day:3, team:1, say:'The guns fire point-blank at the walls of Intramuros.', hurt:1},
      {day:4, team:2, say:'Japanese marines fight from room to room in the Manila Hotel and the Post Office.', spawn:'inf*3 14,12-20,16'},
      {day:5, team:1, say:'Filipino guerrillas guide the troops through the burning streets.', spawn:'inf*2 0,12-4,16'}]},
};
for (const [id, m] of Object.entries(PH_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  bataan:{forces:['The Philippine Scouts, the US 31st Infantry and Philippine Army divisions, on half rations', 'The Japanese 65th Brigade and units of the 16th Division'],
    win:'The Abucay line holds.', lose:'The line is broken and the army falls back down the peninsula.',
    real:'The Abucay line held for two weeks before the Japanese got through the jungle on Mount Natib and the defenders fell back to the next line. Bataan held out until 9 April 1942, starving and riddled with malaria. Then 76,000 Americans and Filipinos surrendered, the largest surrender in American history, and were marched 65 miles in the sun to the camps: the Bataan Death March. Thousands died on the way.'},
  thepoints:{forces:['A naval battalion of sailors and airmen, the 57th Philippine Scouts and Stuarts of the 192nd Tank Battalion', 'Battalions of the Japanese 20th Infantry Regiment'],
    win:'The landings on the points are wiped out.', lose:'The Japanese hold the points behind the line.',
    real:'In the Battle of the Points, from 23 January to 13 February 1942, the Japanese landings on Bataan\'s west coast were destroyed almost to the last man: about 2,000 Japanese died. The sailors and airmen held long enough for the Scouts to come up. It was one of the few complete Allied victories of the first months of the Pacific war.'},
  corregidor:{forces:['About 13,000 men on Corregidor, including the 4th Marine Regiment, half of them sick', 'Two battalions of the 61st Infantry Regiment, with tanks and the guns on Bataan'],
    win:'The Rock holds through the night.', lose:'The Japanese reach Malinta Hill.',
    real:'The Japanese landed on the night of 5 May 1942; the current swept many barges off course and the defenders shot them up on the beaches. But tanks got ashore, and with the Japanese approaching the Malinta Tunnel, full of wounded, Wainwright surrendered on 6 May to prevent a massacre. MacArthur, in Australia, never forgave him. He was awarded the Medal of Honor after the war.'},
  leyte:{forces:['The US Sixth Army: four divisions landing on the first day', 'The Japanese 16th Division'],
    win:'Red Beach is taken and the hills behind Palo are cleared.', lose:'The landing is pinned to the beach.',
    real:'The landing on 20 October 1944 succeeded easily in most places; Red Beach was the hardest. MacArthur waded ashore that afternoon. Four days later the Japanese navy came out to destroy the invasion fleet, and lost the Battle of Leyte Gulf. The fighting ashore lasted until the end of the year.'},
  breakneck:{forces:['The US 24th and 32nd Infantry Divisions', 'The Japanese 1st Division'],
    win:'Breakneck Ridge is cleared, and the road to Ormoc opens.', lose:'The ridges hold through the typhoon.',
    real:'Breakneck Ridge took the Americans from 5 November to 14 December 1944, through a typhoon and constant rain, ridge by ridge. The road to Ormoc was finally opened when the 77th Division landed behind the Japanese at Ormoc itself in December.'},
  manila:{forces:['The US 37th Infantry, 1st Cavalry and 11th Airborne Divisions, with Filipino guerrillas', 'About 16,000 Japanese sailors and marines under Admiral Iwabuchi'],
    win:'Intramuros falls. Manila is free.', lose:'The Walled City holds.',
    real:'The battle for Manila lasted from 3 February to 3 March 1945. About 1,000 Americans and 16,000 Japanese died, and about 100,000 Filipino civilians, many murdered by the Japanese, many killed by American shelling. Manila was the most devastated Allied city of the war after Warsaw. Intramuros was taken on 23 February, and Iwabuchi killed himself.'},
});
Object.assign(CO_FATE, {
  wainwright:'Freed from a camp in Manchuria in August 1945, emaciated, he stood behind MacArthur at the Japanese surrender on USS Missouri and was awarded the Medal of Honor. Died in 1953.',
  macarthur:'Accepted the Japanese surrender, governed occupied Japan, and commanded in Korea until Truman sacked him in 1951. Died in 1964.',
  krueger:'Led the Sixth Army to the end of the war and in the occupation of Japan. Died in 1967.',
  griswold:'Commanded the XIV Corps on Luzon to the end of the war. Died in 1959.',
  homma:'Tried in Manila for the Bataan Death March and executed by firing squad in April 1946.',
  nara:'Commanded the 65th Brigade on Bataan.',
  kataoka:'Survived the war.',
  makino:'Killed himself on Leyte in August 1945.',
  iwabuchi:'Killed himself on 26 February 1945 as the battle for Manila ended.',
});
Object.assign(MISSION_LONLAT, {bataan:[120.48, 14.72], thepoints:[120.39, 14.55], corregidor:[120.57, 14.38], leyte:[125.0, 11.18], breakneck:[124.7, 11.25], manila:[120.98, 14.59]});
CAMPAIGNS.push({id:'philippines', name:'Return to the Philippines', sub:'Bataan to Manila · 1942–1945', side:'allies', missions:['bataan', 'thepoints', 'corregidor', 'leyte', 'breakneck', 'manila']});
