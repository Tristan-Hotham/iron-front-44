/* ============================== THE DESERT FOX ==============================
   Rommel's war in Africa, from the German side: the first dash across Cyrenaica,
   Tobruk, the tank battles of Crusader, the Cauldron at Gazala, the last offensive
   at Alam Halfa, the retreat from El Alamein and the last battles in Tunisia.
   Every battle asks something different: break through, take the posts, kill the
   tanks, race for the wire, hold the pocket, get away, spring the ambush. */

/* the generals */
LIKENESS.rommelafrika = LIKENESS.rommel;
Object.assign(CO, {
  rommelafrika:{n:'Erwin Rommel', nat:'dak', rank:'Generaloberst', nick:'Der Wüstenfuchs',
    bio:'Sent to Libya in February 1941 with orders to defend Tripoli, he attacked at once, and in two years became the most famous general of the war, admired even by the men he fought. He led from the front, often from a light aircraft or an open command car, and seemed to be everywhere; his supply officers despaired of him.',
    d2d:{txt:'Armour and recon +1 move.', mv:{armour:1}},
    cop:{n:'Dust and Bluff', star:3, txt:'All ground units +1 move; armour +20% firepower.', mv:{ground:1}, atk:{armour:20}, fx:'dust'},
    scop:{n:'Der Wüstenfuchs', star:6, txt:'Armour +30% firepower and +2 move, and every tank may act twice.', mv:{armour:2}, atk:{armour:30}, again:'armour', fx:'dust'},
    look:{cap:'peaked', goggles:true, face:'#dca883', hair:'#5a4632', jaw:1, collar:'#b3262b', tunic:'#a8986a', medal:'pourlemerite'},
    say:{start:'In the desert, the side that moves first wins.', win:'The enemy is beaten. Push on before they regroup.', lose:'Without fuel we are finished. Fall back.', power:'Vorwärts! Do not stop until you reach the coast!'}},
  cruwell:{n:'Ludwig Crüwell', nat:'dak', rank:'Generalleutnant', nick:'Deutsches Afrikakorps',
    bio:'Commanded the Afrikakorps in Operation Crusader. On Totensonntag, the Sunday of the Dead, 23 November 1941, he massed both panzer divisions and drove them straight through the South African 5th Brigade at Sidi Rezegh. He was shot down and captured over Gazala in May 1942.',
    d2d:{txt:'Armour +10% firepower.', atk:{armour:10}},
    cop:{n:'Massed Panzers', star:3, txt:'Armour +25% firepower.', atk:{armour:25}},
    scop:{n:'Totensonntag', star:6, txt:'Armour and infantry +35% firepower and +1 move.', atk:{armour:35, foot:20}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#a8986a', collar:'#c03030'},
    say:{start:'Both divisions together, in one blow. No penny packets.', win:'The South Africans are finished.', lose:'Rally on the escarpment.', power:'Panzer, marsch!'}},
  thoma:{n:'Wilhelm Ritter von Thoma', nat:'dak', rank:'General der Panzertruppe', nick:'Afrikakorps, El Alamein',
    bio:'A tank veteran of Spain, where he commanded the German tanks of the Condor Legion, he led the Afrikakorps at El Alamein. On 4 November 1942, refusing what he called the madness of Hitler\'s stand-fast order, he put on his medals, drove to the front in a tank and was captured standing beside its burning hulk. He dined that night with Montgomery.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Rearguard', star:3, txt:'All units +25% defence.', def:{all:25}},
    scop:{n:'Break Contact', star:6, txt:'All ground units +2 move and +20% defence.', mv:{ground:2}, def:{all:20}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#c8c4bc', jaw:2, tunic:'#a8986a', collar:'#c03030', medals:true, glasses:true},
    say:{start:'Victory or death, says the Führer. I prefer the third choice.', win:'We are clear of them.', lose:'This is madness.', power:'Everything west. Now.'}},
  ziegler:{n:'Heinz Ziegler', nat:'dak', rank:'Generalleutnant', nick:'Operation Frühlingswind',
    bio:'Von Arnim\'s deputy in Tunisia, he directed the attack of the 10th and 21st Panzer Divisions at Sidi Bou Zid on 14 February 1943: two pincers round the American positions on the hills, and the new Tigers of the 501st Heavy Tank Battalion in the centre.',
    d2d:{txt:'Heavy tanks +15% firepower.', atk:{armour:15}},
    cop:{n:'Spring Wind', star:3, txt:'Armour +2 move.', mv:{armour:2}},
    scop:{n:'Pincers', star:6, txt:'All units +30% firepower and +1 move.', atk:{all:30}, mv:{ground:1}},
    look:{cap:'peaked', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#a8986a', collar:'#c03030'},
    say:{start:'The Americans are green. Show them.', win:'Their armour is gone.', lose:'They learn quickly.', power:'Close the ring!'}},
  neame:{n:'Philip Neame VC', nat:'uk42', rank:'Lieutenant General', nick:'Cyrenaica Command',
    bio:'A sapper who had won the Victoria Cross in 1914 and an Olympic gold medal for shooting in 1924. Left to hold Cyrenaica in 1941 with a half-trained armoured division whose cruisers were worn out, he was captured with O\'Connor when their car drove into a German patrol on 7 April.',
    d2d:{txt:'Infantry +10% defence.', def:{foot:10}},
    cop:{n:'Fall Back on Agedabia', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Stand at Mersa Brega', star:6, txt:'All units +30% defence; all units recover 2 HP.', def:{all:30}, heal:2},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#9a9080', jaw:1, tunic:'#b8a070', moustache:true, medals:true},
    say:{start:'The Germans won\'t be ready to attack before May.', win:'They\'ve been held.', lose:'Back to Benghazi. Back to Tobruk.', power:'Hold the gap!'}},
  cunningham:{n:'Alan Cunningham', nat:'uk42', rank:'Lieutenant General', nick:'Eighth Army',
    bio:'Fresh from conquering Italian Somaliland and Ethiopia, he commanded the new Eighth Army in Operation Crusader. When Rommel\'s panzers burst into his rear areas on 24 November he wanted to call the offensive off; Auchinleck flew up, overruled him and replaced him.',
    d2d:{txt:'Artillery +10% firepower.', atk:{indirect:10}},
    cop:{n:'Close the Columns', star:3, txt:'All units +20% defence.', def:{all:20}},
    scop:{n:'Jock Columns', star:6, txt:'All ground units +2 move and +20% firepower.', mv:{ground:2}, atk:{all:20}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#8a8278', jaw:1, tunic:'#b8a070'},
    say:{start:'Relieve Tobruk, then on to Benghazi.', win:'The panzers have gone back.', lose:'The whole rear is in chaos.', power:'Columns out!'}},
  gott:{n:'William Gott', nat:'uk42', rank:'Major General', nick:'Strafer',
    bio:'"Strafer" Gott, the most trusted soldier of the desert army, commanded the 7th Armoured Division in Operation Crusader. Chosen to command the Eighth Army in August 1942, he was killed two days later when his transport aircraft was shot down. Montgomery got the job instead.',
    d2d:{txt:'Armour +10% defence.', def:{armour:10}},
    cop:{n:'Support Group', star:3, txt:'Artillery and anti-tank +25% firepower.', atk:{indirect:25, foot:15}},
    scop:{n:'The Desert Rats', star:6, txt:'All units +30% firepower and +20% defence.', atk:{all:30}, def:{all:20}},
    look:{cap:'beret', face:'#e8c4a4', hair:'#7a6a5a', jaw:1, tunic:'#b8a070'},
    say:{start:'Hold Sidi Rezegh. The Tobruk garrison is breaking out to meet us.', win:'They\'ve had enough.', lose:'Get the brigade out.', power:'Every gun on them!'}},
  ritchie:{n:'Neil Ritchie', nat:'uk42', rank:'Lieutenant General', nick:'Eighth Army, Gazala',
    bio:'Auchinleck\'s staff officer, promoted over the heads of the corps commanders to lead the Eighth Army after Cunningham. At Gazala he had the advantage in tanks and ammunition, and spent it in piecemeal attacks on the Cauldron. Dismissed after the fall of Tobruk, he came back to command a corps in north-west Europe.',
    d2d:{txt:'Heavy tanks +10% firepower.', atk:{armour:10}},
    cop:{n:'Operation Aberdeen', star:3, txt:'Armour +20% firepower.', atk:{armour:20}},
    scop:{n:'Into the Cauldron', star:6, txt:'All units +25% firepower; artillery +1 range.', atk:{all:25}, rng:{indirect:1}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#6a5a4a', jaw:2, tunic:'#b8a070'},
    say:{start:'He\'s in a trap of his own making. Close it.', win:'The Cauldron is ours.', lose:'Back to the frontier.', power:'Attack, attack!'}},
  auchinleck:{n:'Claude Auchinleck', nat:'uk42', rank:'General', nick:'The Auk',
    bio:'Commander-in-Chief Middle East. After the fall of Tobruk he sacked Ritchie and took command of the Eighth Army himself, pulled it back to the El Alamein line and stopped Rommel there in July 1942. Churchill, wanting an offensive he would not yet give, replaced him in August.',
    d2d:{txt:'All units +10% defence.', def:{all:10}},
    cop:{n:'Fluid Defence', star:3, txt:'All ground units +1 move and +15% defence.', mv:{ground:1}, def:{all:15}},
    scop:{n:'Box and Column', star:6, txt:'All units +30% firepower and +20% defence.', atk:{all:30}, def:{all:20}},
    look:{cap:'brit', crown:'#8a7a54', band:'#b02020', face:'#e8c4a4', hair:'#a89878', jaw:2, tunic:'#b8a070', medals:true},
    say:{start:'Matruh is not worth an army. Fight, and fall back.', win:'He has been checked.', lose:'Back to El Alamein.', power:'Every column out!'}},
  ward:{n:'Orlando Ward', nat:'us', rank:'Major General', nick:'1st Armored Division',
    bio:'Commanded "Old Ironsides", the 1st Armored Division, in Tunisia. At Sidi Bou Zid his Combat Command A was split across two hills by orders from corps, and the panzers cut it to pieces. Relieved after Kasserine, he later commanded the 20th Armored Division in Germany.',
    d2d:{txt:'Artillery +10% firepower.', atk:{indirect:10}},
    cop:{n:'Counter-attack', star:3, txt:'Armour +20% firepower.', atk:{armour:20}},
    scop:{n:'Old Ironsides', star:6, txt:'All units +25% firepower and defence.', atk:{all:25}, def:{all:25}},
    look:{cap:'helmet', stars:2, face:'#e8c4a4', hair:'#6a5a4a', jaw:1, tunic:'#7a6f4c', glasses:true},
    say:{start:'Hold Lessouda and Ksaira. Corps\' orders.', win:'They\'ve pulled back!', lose:'Get them off the hills.', power:'Send in Hightower\'s battalion!'}},
});
for (const id of ['rommelafrika', 'cruwell', 'thoma', 'ziegler', 'neame', 'cunningham', 'gott', 'ritchie', 'auchinleck', 'ward']) (CO_BY_NAT[CO[id].nat] = CO_BY_NAT[CO[id].nat] || []).push(id);
Object.assign(CO_PERSONA, {rommelafrika:'aggressive', cruwell:'aggressive', thoma:'cautious', ziegler:'aggressive', neame:'cautious', cunningham:'cautious', gott:'methodical', ritchie:'methodical', auchinleck:'opportunist', ward:'reckless'});

/* the Afrikakorps of 1941, before the long-barrelled guns came */
const DAK41 = {tank:{n:'Panzer III Ausf. G', w:'5 cm KwK 38 L/42', shape:'pz3', pow:.92}, mtank:{n:'Panzer IV Ausf. E', w:'7.5 cm KwK 37 L/24', shape:'pz4d', pow:.95}, recon:{n:'Sd.Kfz. 231 (8-Rad)', shape:'puma'}};
const UK41 = {tank:{n:'Cruiser Mk VI Crusader', w:'QF 2-pounder'}, mtank:{n:'M3 Stuart (Honey)', w:'37 mm M6', shape:'stuart', pow:.8, mv:7, cost:7000}};

const FOX_MISSIONS = {
  sonnenblume:{name:'Mersa Brega', place:'The gap between the salt marsh and the dunes, Cyrenaica', date:'31 March 1941, 09:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:0, u:Object.assign({}, DAK41, {inf:{n:'MG-Bataillon 8', w:'Kar98k & MG 34', snd:'mg34'}})},
    p2:{nat:'uk42', co:'neame', funds:0, u:{tank:{n:'Captured M13/40 (6th Royal Tank Regiment)', w:'47/32 gun', shape:'m1340', pow:.75, mv:5}, mtank:{n:'Cruiser Mk IV (A13), worn out', shape:'a13', pow:.75}, inf:{n:'2nd Armoured Division Support Group'}}},
    objective:{win:'hq', limit:10}, goal:'Break through the Mersa Brega gap and take Agedabia by {limit}.',
    brief:'Rommel was sent to Africa to defend Tripoli. He has been here six weeks, his panzer division is still landing, and Berlin has told him not to attack before May. He is attacking anyway. The British in front of you are thin: a new armoured division whose cruisers have worn out their tracks, and one regiment driving captured Italian M13s. Behind them lies the whole of Cyrenaica. Get through the gap between the salt marsh and the dunes, and do not stop.',
    clock:{start:'1941-03-31T09:00', step:120},
    build:() => { const b = MB(34, 20, '.', 10101);
      b.rect(0, 0, 33, 1, '~').rect(0, 2, 33, 2, 's');
      b.blobs('v', 5, 11, 3, 15, 9, 1, 2).blobs('d', 9, 14, 11, 33, 19, 1, 2).blobs('d', 4, 0, 13, 9, 19, 1, 2);
      wadi(b, [[20, 19], [23, 12], [27, 8]]); b.scatter('^', .08, 16, 4, 33, 18, ['.']);
      b.road([[0, 5], [10, 5], [16, 5], [24, 6], [33, 6]]);
      b.rect(14, 8, 16, 12, 'm', ['.', 'd']).rect(16, 9, 17, 11, 'w', ['.']);
      b.put([[1, 5, 'Q'], [3, 9, 'C'], [17, 6, 'k'], [24, 10, 'k'], [30, 6, 'q'], [28, 13, 'c'], [21, 4, 'c']]);
      return b.rows(); },
    units:{1:'tank*5 1,6-6,12; mtank*2 2,8-5,11; recon*3 3,4-8,14; inf*4 2,4-7,9; art*2 0,7-2,11; at*2 4,7-7,12; aa 1,9',
      2:'inf*4 16,4-20,10; nest*2 16,6-18,9; tank*3 20,7-26,13; mtank*2 22,4-27,9; art*2 25,5-29,11; recon*2 19,12-24,16; at 18,8'},
    events:[{day:2, team:1, say:'Rommel\'s dummy tanks, Volkswagens dressed in plywood, raise dust on the desert flank. The British think a whole division is coming.', hurt:1},
      {day:3, team:1, say:'The rest of 5th Panzer Regiment comes up the Via Balbia.', spawn:'tank*2 0,4-3,8; mtank 0,9-2,11'},
      {day:4, team:2, say:'Neame orders the armoured division back towards Agedabia. Its cruisers break down in the sand.', hurt:1, hurtTeam:2},
      {day:5, team:2, say:'The 9th Australian Division sends a battalion forward to cover the retreat.', spawn:'inf*3 27,4-32,9; at 28,7'}]},
  medauar:{name:'Ras el Medauar', place:'The south-west perimeter of Tobruk', date:'30 April 1941, 20:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:0, u:Object.assign({}, DAK41, {eng:{n:'Pioniere (Panzer-Pionier-Bataillon 200)', w:'Bangalore torpedoes, flamethrowers & demolition charges'}})},
    p2:{nat:'uk42', co:'morshead', funds:0, u:{inf:{n:'2/24th Australian Infantry', w:'SMLE, Bren & bayonets'}, nest:{n:'Perimeter Post (the Red Line)', w:'Vickers, Brens & a Boys rifle, in a concrete post'}, htank:{n:'Matilda II (D Sqn, 7th RTR)'}}},
    objective:{win:'kill', role:'nest', n:6, limit:6}, goal:'Storm the perimeter: take six of the concrete posts of the Red Line by {limit}.',
    whyText:{kill:'the perimeter is broken'},
    brief:'Tobruk will not fall. Rommel has thrown the 5th Light Division at it twice and been beaten back twice by the 9th Australian Division. Tonight it is a deliberate assault on Ras el Medauar, the hill at the south-west corner, with the newly arrived 15th Panzer Division. The Australians hold the Red Line: concrete posts sunk into the rock, linked by wire and an anti-tank ditch, with a second line behind. Their commander has told them there will be no Dunkirk here. Take the posts, one by one.',
    clock:{start:'1941-04-30T20:00', step:120},
    build:() => { const b = MB(32, 22, '.', 10202);
      b.rect(26, 0, 31, 1, '~').blobs('d', 5, 0, 0, 10, 21, 1, 2).scatter('^', .07, 0, 0, 31, 21, ['.']);
      b.blobs('^', 3, 12, 8, 16, 13, 1, 2);                                     // Ras el Medauar
      b.path([[13, 0], [11, 7], [11, 14], [14, 21]], (x, y) => b.set(x, y, 'z'));    // the anti-tank ditch
      b.path([[14, 0], [12, 7], [12, 14], [15, 21]], (x, y) => b.set(x, y, 'w'));    // the wire
      b.path([[20, 0], [19, 8], [20, 21]], (x, y) => b.set(x, y, 'w'));              // the Blue Line
      b.road([[0, 10], [10, 10], [20, 9], [30, 3]]).road([[22, 21], [24, 12], [30, 3]]);
      b.scatter('m', .4, 15, 3, 18, 18, ['.']);
      b.put([[1, 10, 'Q'], [4, 4, 'C'], [4, 16, 'C'], [30, 2, 'q'], [26, 6, 'k'], [25, 15, 'k'], [22, 10, 'k']]);
      return b.rows(); },
    units:{1:'inf*7 2,3-9,18; eng*3 6,7-9,13; tank*4 1,6-6,15; mtank*2 2,8-5,12; art*3 0,5-3,16; mortar*2 4,8-7,12; aa 2,11',
      2:'nest*8 13,2-15,19; inf*5 15,4-19,17; at*2 16,8-18,13; art*3 22,4-26,16; mortar*2 18,6-21,14; htank*2 24,9-27,13'},
    events:[{day:1, team:1, say:'20:00. Stukas and the divisional artillery shell the posts round Ras el Medauar.', hurt:1},
      {day:2, team:2, say:'The Australians counter-attack at night with the bayonet to retake the lost posts.', spawn:'inf*3 17,7-20,14'},
      {day:3, team:2, say:'Matildas of the 7th Royal Tank Regiment come out of the inner line.', spawn:'htank*2 20,8-23,13'},
      {day:4, team:1, say:'A sandstorm. Under cover of it the pioneers lift a lane through the minefield.', clear:[[15, 9], [16, 9], [17, 9], [15, 10], [16, 10], [17, 10], [18, 10]]},
      {day:5, team:2, say:'Morshead throws in his last reserve: the 2/12th Battalion and the carriers.', spawn:'inf*2 21,9-24,13; recon 22,11'}]},
  totensonntag:{name:'Totensonntag', place:'Sidi Rezegh, south-east of Tobruk', date:'23 November 1941, 07:00', theme:'desert', weather:'overcast',
    p1:{nat:'dak', co:'cruwell', funds:0, u:DAK41},
    p2:{nat:'uk42', co:'gott', funds:0, u:Object.assign({}, UK41, {inf:{n:'5th South African Brigade', w:'SMLE & Bren'}, at:{n:'2-pounder Anti-tank Crew (South African)', w:'QF 2-pounder', snd:'gun37'}})},
    objective:{win:'kill', role:'tank', n:7, limit:6}, goal:'Smash the British armour round Sidi Rezegh: knock out seven Crusaders by {limit}.',
    brief:'Operation Crusader has been raging for five days. Three British armoured brigades have come at you piecemeal, and you have hurt them all. Now, on the Sunday of the Dead, Crüwell has both panzer divisions together and the Ariete coming up from the south. Between them and Sidi Rezegh airfield, south of the escarpment, sits the 5th South African Brigade with its guns and the battered remains of the 7th Armoured Division. Crüwell means to drive straight through them, with the infantry riding in their lorries behind the tanks.',
    clock:{start:'1941-11-23T07:00', step:120},
    build:() => { const b = MB(38, 22, '.', 10303);
      b.path([[0, 5], [10, 6], [20, 5], [30, 6], [37, 5]], (x, y) => { b.set(x, y, 'E'); }, .25);   // the Sidi Rezegh escarpment
      b.blobs('d', 6, 0, 10, 37, 21, 1, 2).scatter('^', .06, 0, 7, 37, 21, ['.']);
      wadi(b, [[8, 21], [12, 14], [16, 8]]); wadi(b, [[30, 21], [27, 13], [24, 8]]);
      b.road([[0, 3], [37, 3]]).road([[18, 3], [19, 21]]);
      b.put([[2, 14, 'Q'], [4, 8, 'C'], [6, 19, 'C'], [20, 8, 'a'], [24, 14, 'k'], [30, 9, 'k'], [35, 16, 'q'], [14, 1, 'c']]);
      return b.rows(); },
    units:{1:'tank*7 1,9-6,18; mtank*3 2,11-5,16; inf*5 3,8-8,19; apc*2 2,12-5,15; art*3 0,10-2,17; at*2 6,10-8,16; aa 1,13',
      2:'inf*6 20,10-28,18; at*3 19,11-24,17; art*3 25,9-30,17; tank*4 22,7-30,12; mtank*3 26,13-33,19; recon*2 31,7-35,12'},
    events:[{day:2, team:1, say:'The Ariete comes up from Bir el Gubi on the southern flank.', spawn:'tank*3 10,19-16,21'},
      {day:2, team:2, say:'The 22nd Armoured Brigade arrives with what is left of its Crusaders.', spawn:'tank*3 33,2-37,8'},
      {day:3, team:1, say:'Stukas over the South African laager.', hurt:1},
      {day:4, team:2, say:'The New Zealand Division pushes in from the east along the escarpment.', spawn:'inf*3 33,4-37,9; htank 34,6'}]},
  dashwire:{name:'The Dash to the Wire', place:'The Eighth Army\'s rear areas, towards the Egyptian frontier', date:'24 November 1941, 10:30', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:0, u:DAK41},
    p2:{nat:'uk42', co:'cunningham', funds:0, u:Object.assign({}, UK41, {inf:{n:'4th Indian Division', w:'SMLE & Bren'}})},
    objective:{win:'convoy', role:'tank', need:5, exit:[37, 0, 39, 19], limit:7}, goal:'Race through the British rear and get five Panzer IIIs to the frontier wire (the east edge) by {limit}.',
    whyText:{convoy:'the panzers are at the wire', sunk:'too many panzers lost on the way'},
    brief:'Totensonntag broke the South Africans, and Rommel thinks the Eighth Army is beaten. He takes the Afrikakorps and drives east, straight through the British rear areas, for the Egyptian frontier: if he can get round behind them, they will panic and run. It is a gamble. Supply dumps, workshops and headquarters scatter before you; so do some of the generals. Get to the wire.',
    clock:{start:'1941-11-24T10:30', step:120},
    build:() => { const b = MB(40, 20, '.', 10404);
      b.blobs('d', 9, 0, 0, 36, 19, 1, 2).scatter('^', .07, 0, 0, 39, 19, ['.']);
      wadi(b, [[6, 0], [10, 9], [8, 19]]); wadi(b, [[22, 0], [25, 10], [22, 19]]);
      b.path([[37, 0], [37, 19]], (x, y) => b.set(x, y, 'w'));                     // the frontier wire
      for (const y of [4, 10, 15]) b.set(37, y, '.');                               // gaps in the wire
      b.road([[0, 10], [14, 9], [28, 11], [39, 10]]).road([[16, 0], [18, 19]]);
      b.put([[1, 10, 'Q'], [12, 4, 'f'], [17, 15, 'f'], [26, 5, 'f'], [30, 15, 'f'], [33, 9, 'k'], [38, 2, 'q'], [9, 15, 'c']]);
      return b.rows(); },
    units:{1:'tank*10 0,4-5,16; mtank*2 1,7-3,12; recon*3 2,3-5,17; apc 1,9; aa 0,11',
      2:'art*2 9,5-14,15; at*2 15,4-20,16; inf*4 18,3-24,17; tank*2 24,6-29,14; mtank*2 27,3-31,9; recon*2 29,12-34,17; nest*2 34,4-36,15'},
    events:[{day:2, team:1, say:'Rommel\'s own command car breaks down beyond the wire. He spends the night in the middle of an Indian division, which does not notice him.', hurt:0},
      {day:2, team:2, say:'Auchinleck flies up and overrules Cunningham: the offensive goes on. The Indian brigades stand their ground.', spawn:'inf*3 28,2-34,8; at 30,12'},
      {day:3, team:2, say:'The RAF finds the panzer columns strung out across the desert.', hurt:1, hurtTeam:1},
      {day:4, team:2, say:'Stuarts of the 4th Armoured Brigade chase the panzers from behind.', spawn:'mtank*3 0,2-4,8'}]},
  cauldron:{name:'The Cauldron', place:'Inside the British minefields, Gazala', date:'5 June 1942, 03:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:3000},
    p2:{nat:'uk42', co:'ritchie', funds:0, u:{htank:{n:'Valentine / Matilda (32nd Army Tank Brigade)', shape:'valentine', w:'QF 2-pounder'}, inf:{n:'10th Indian Brigade', w:'SMLE & Bren'}}},
    objective:{win:'survive', days:7, hold:4}, goal:'Hold the Cauldron until {survive}. Lose two of your five positions and the Cauldron falls.', persona:{2:'brawler'},
    whyText:{survive:'the Cauldron held, and Rommel breaks out'},
    brief:'Rommel swung round the south of the Gazala line, and it went wrong: the Free French held at Bir Hakeim, the new Grants hit hard, and the Afrikakorps is now trapped in a pocket behind the British minefields, short of water and fuel, its supply columns cut. Its own men call the place the Cauldron. Rommel has done the unthinkable: he has turned his back on the British and is clearing a lane through the minefields behind him. Now the Eighth Army is coming into the Cauldron to finish him: Operation Aberdeen. Hold, and the lane will open.',
    clock:{start:'1942-06-05T03:00', step:120},
    build:() => { const b = MB(36, 22, '.', 10505);
      b.blobs('d', 6, 0, 0, 35, 21, 1, 2).scatter('^', .05, 0, 0, 35, 21, ['.']);
      for (let y = 0; y < 22; y++) for (const x of [6, 7]) if (y < 8 || y > 13) b.set(x, y, 'm');    // the British minefield behind you, with one lane half-cleared
      for (let x = 6; x <= 28; x++) b.set(x, 1, 'm');
      b.rect(14, 4, 18, 6, '^', ['.', 'd']).rect(14, 15, 18, 17, '^', ['.', 'd']);   // Sidra and Aslagh ridges
      wadi(b, [[35, 6], [26, 9], [20, 11]]);
      b.road([[0, 11], [12, 11], [24, 10], [35, 11]]);
      b.put([[10, 11, 'Q'], [16, 5, 'C'], [16, 16, 'C'], [12, 9, 'F'], [18, 11, 'C'], [33, 4, 'k'], [33, 17, 'k'], [31, 11, 'q']]);
      return b.rows(); },
    units:{1:'tank*5 9,6-15,16; mtank*2 10,8-13,14; aa*3 13,4-18,17; at*3 14,6-17,15; inf*4 9,4-17,17; art*2 8,9-10,13; pak 15,5; pak 15,16',
      2:'htank*6 24,3-30,9; mtank*6 24,12-30,18; inf*9 22,5-28,17; art*5 29,3-34,18; at*2 21,9-24,13'},
    events:[{day:1, team:2, say:'03:00. Three hundred guns open fire on the Aslagh ridge. The Indian brigade goes in behind the barrage.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'The 32nd Army Tank Brigade attacks the Sidra ridge, in the open, straight at the 88s.', spawn:'htank*3 22,1-26,5'},
      {day:3, team:1, say:'The Trieste Division\'s sappers finish the lane through the minefield. Water, fuel and shells come through.', clear:[[6, 7], [7, 7], [6, 14], [7, 14]], heal:2, funds:6000},
      {day:4, team:1, say:'The 15th Panzer swings round the north of the Cauldron into the British rear.', spawn:'tank*3 20,2-24,5'},
      {day:5, team:2, say:'Ritchie sends in the last of the Grants.', spawn:'mtank*3 30,8-34,14'}]},
  matruh:{name:'Mersa Matruh', place:'The fortress of Mersa Matruh and the escarpment south of it', date:'27 June 1942, 06:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:0, u:{inf:{n:'90. leichte Afrika-Division', w:'Kar98k & MG 34'}}},
    p2:{nat:'uk42', co:'auchinleck', funds:0, u:{inf:{n:'2nd New Zealand Division', w:'SMLE, Bren & bayonets', pow:1.05}}},
    objective:{win:'hq', limit:11}, goal:'Take the fortress of Mersa Matruh by {limit}.',
    brief:'Tobruk has fallen and Rommel is a field marshal. He has sixty tanks left, and he is chasing an army that has three times that many, into Egypt. At Mersa Matruh the British have a fortress, a corps inside it and another corps on the escarpment to the south. They also have a commander who has just sacked his army commander and taken over himself, and who has decided Matruh is not worth an army. If you drive hard enough, the British will believe you are much stronger than you are.',
    clock:{start:'1942-06-27T06:00', step:120},
    build:() => { const b = MB(34, 20, '.', 10606);
      b.rect(0, 0, 33, 1, '~').rect(0, 2, 33, 2, 's');
      b.path([[0, 9], [12, 10], [22, 9], [33, 10]], (x, y) => b.set(x, y, 'E'), .2);    // the escarpment
      b.blobs('d', 6, 0, 11, 33, 19, 1, 2).scatter('^', .06, 0, 3, 33, 19, ['.']);
      b.rect(23, 3, 31, 7, 'm', ['.']).rect(25, 4, 30, 6, '.', ['m']);
      b.rect(23, 3, 23, 7, 'w').road([[0, 4], [33, 4]]).road([[16, 4], [17, 19]]);
      b.put([[1, 5, 'Q'], [5, 13, 'C'], [28, 5, 'q'], [26, 4, 'B'], [29, 6, 'B'], [30, 3, 'k'], [20, 15, 'k'], [12, 6, 'c']]);
      return b.rows(); },
    units:{1:'tank*6 1,3-6,8; mtank*2 2,5-4,7; recon*3 3,11-7,16; inf*6 1,3-7,8; art*2 0,5-2,8; aa*2 3,5-5,8; at 4,12',
      2:'inf*5 24,3-31,7; nest*3 23,3-26,7; art*3 27,3-32,7; at*2 22,4-24,6; inf*2 17,12-23,18; mtank*2 19,11-25,17; art 24,14'},
    events:[{day:2, team:2, say:'The New Zealanders on the escarpment at Minqar Qaim break out at night with the bayonet, straight through the 21st Panzer\'s laager.', spawn:'inf*2 6,12-11,17'},
      {day:3, team:1, say:'Rommel\'s bluff works: the British corps in the south pulls back, leaving the fortress on its own.', hurt:1},
      {day:4, team:1, say:'The 90th Light reaches the coast road east of Matruh. The fortress is cut off.', spawn:'inf*2 32,3-33,6'},
      {day:5, team:2, say:'The garrison tries to break out eastward in the dark.', spawn:'inf*2 30,5-32,7'}]},
  alamhalfa:{name:'Alam Halfa', place:'The British minefields and the Alam Halfa ridge', date:'30 August 1942, 22:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'rommelafrika', funds:0},
    p2:{nat:'uk42', co:'monty', funds:0, u:{mtank:{n:'M3 Grant (22nd Armoured Brigade), hull-down', w:'75 mm & 37 mm'}, pak:{n:'6-pounder Gun Pit (Alam Halfa)', w:'QF 6-pounder'}}},
    objective:{win:'hq', limit:15}, goal:'Get through the minefields by night and take the Alam Halfa ridge by {limit}.',
    brief:'This is Rommel\'s last chance to reach the Nile. He has been promised fuel that has not come, his men have dysentery, and he is ill himself. Tonight the panzers go round the south end of the line, through minefields the British say are thin, then north to the Alam Halfa ridge behind the Eighth Army. But the new British commander, Montgomery, knows the plan; the ridge is dug in with tanks and anti-tank guns; and the RAF will be overhead at dawn, and all the next day, and the day after.',
    clock:{start:'1942-08-30T22:00', step:120},
    build:() => { const b = MB(34, 22, '.', 10707);
      b.blobs('d', 6, 0, 0, 33, 21, 1, 2).scatter('^', .05, 0, 0, 33, 21, ['.']);
      b.rect(9, 0, 13, 21, 'm', ['.', 'd', '^']); for (const y of [5, 12, 17]) b.rect(9, y, 13, y, '.');
      b.rect(24, 6, 31, 11, '^', ['.', 'd']).rect(26, 7, 30, 10, 'z', ['^']);       // the ridge, dug in
      b.rect(0, 20, 33, 21, 'E');
      b.road([[0, 12], [20, 12], [27, 9]]);
      b.put([[1, 12, 'Q'], [4, 6, 'C'], [4, 17, 'C'], [28, 8, 'q'], [25, 7, 'k'], [30, 11, 'k'], [20, 3, 'k'], [20, 17, 'c']]);
      return b.rows(); },
    units:{1:'tank*8 0,3-6,18; mtank*3 1,8-4,14; inf*4 2,4-7,18; eng*3 6,6-8,16; art*2 0,9-2,14; aa*2 3,10-5,13; recon*2 4,2-7,6',
      2:'mtank*3 23,5-30,12; pak*2 24,6-30,11; at*2 22,8-25,12; inf*4 18,2-24,18; art*3 28,2-33,19; tank*2 16,14-22,19; nest*2 14,4-15,17'},
    events:[{day:2, team:2, say:'Dawn. The Desert Air Force arrives, and does not leave: Bostons and Baltimores in parade-ground formation, every hour.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'The bombers come again. General Nehring of the Afrikakorps is wounded, and von Bismarck of the 21st Panzer is killed by a mine.'},
      {day:3, team:1, say:'A tanker is sunk off Tobruk. The panzers have fuel for one more day.', hurt:0},
      {day:4, team:2, say:'Montgomery sends the New Zealanders south to close the gaps in the minefields behind you.', spawn:'inf*3 8,0-14,4; at 10,3'}]},
  retreat42:{name:'The Retreat from El Alamein', place:'Tel el Aqqaqir to the coast road', date:'3 November 1942, 06:00', theme:'desert', weather:'clear',
    p1:{nat:'dak', co:'thoma', funds:0, u:{apc:{n:'Sd.Kfz. 251 with Panzergrenadiers', w:'MG 34 and the men inside'}}},
    p2:{nat:'uk42', co:'monty', funds:0, u:{mtank:{n:'Sherman II (Eighth Army)', w:'75 mm M3', shape:'sherman', pow:1.05}, tank:{n:'Crusader III', w:'QF 6-pounder', pow:.95}}},
    objective:{win:'convoy', role:'apc', need:6, exit:[0, 0, 1, 19], limit:4}, goal:'Get six half-tracks of panzergrenadiers out to the west edge by {limit}. The 88s and the panzers cover them.',
    whyText:{convoy:'the panzergrenadiers got away', sunk:'too many half-tracks were caught'},
    brief:'After eleven days, Operation Supercharge has broken the line at Tel el Aqqaqir. The Afrikakorps has 35 tanks left. Rommel has ordered the retreat, and then a signal arrives from Hitler: stand fast, "victory or death". Von Thoma calls the order madness. Get the infantry out to the west in their half-tracks while the last panzers and 88s hold the British armour off them. Whatever the Führer says.',
    clock:{start:'1942-11-03T06:00', step:120},
    build:() => { const b = MB(34, 20, '.', 10808);
      b.blobs('d', 8, 0, 0, 33, 19, 1, 2).scatter('^', .06, 0, 0, 33, 19, ['.']);
      wadi(b, [[33, 4], [22, 6], [12, 3], [0, 5]]); wadi(b, [[33, 15], [20, 13], [8, 16], [0, 14]]);
      b.rect(25, 7, 27, 12, '^', ['.', 'd']);                                         // Tel el Aqqaqir
      b.road([[0, 10], [33, 10]]);
      b.put([[14, 4, 'c'], [12, 15, 'c'], [6, 9, 'c'], [33, 2, 'q'], [32, 17, 'k']]);
      return b.rows(); },
    units:{1:'apc*10 16,3-24,16; tank*3 22,6-27,13; mtank 24,9; aa*3 21,7-25,13; at*2 22,5-26,15; art 19,9',
      2:'mtank*3 30,3-33,9; tank*3 30,11-33,17; inf*4 31,6-33,13; art*3 32,4-33,16; recon*3 28,0-33,3'},
    events:[{day:2, team:1, say:'A signal from Hitler: "Victory or death." Rommel stands for a day, and loses most of what he has left.', hurt:1, hurtTeam:1},
      {day:2, team:2, say:'The armoured cars of the 2nd Armoured Division swing round the southern flank.', spawn:'recon*2 22,17-30,19'},
      {day:3, team:1, say:'Von Thoma is captured beside his burning tank at Tel el Mampsra. Rommel orders the retreat anyway.', heal:1},
      {day:4, team:2, say:'The New Zealanders race along the desert flank to cut the coast road at Fuka.', spawn:'inf*3 8,15-14,19; mtank 10,17'},
      {day:5, team:2, say:'Rain. The pursuit bogs down in the mud.', hurt:1, hurtTeam:2}]},
  sidibouzid:{name:'Sidi Bou Zid', place:'Djebel Lessouda and the plain of Sidi Bou Zid, Tunisia', date:'14 February 1943, 06:30', theme:'tunisia', weather:'clear',
    p1:{nat:'dak', co:'ziegler', funds:0, u:{htank:{n:'Tiger I (s.Pz.Abt. 501)'}, tank:{n:'Panzer III Ausf. N'}}},
    p2:{nat:'us', co:'ward', funds:0, u:{tank:{n:'M4A1 Sherman (2/1st Armored Regiment)', w:'75 mm M3', shape:'sherman'}, mtank:{n:'M3 Lee (1st Armored Division)', w:'75 mm & 37 mm', shape:'grant'}, inf:{n:'168th Infantry (34th Division)', w:'M1 Garand & BAR'}}},
    objective:{win:'kill', role:'tank', n:11, limit:6}, goal:'Spring Frühlingswind: knock out eleven American Shermans by {limit}.',
    brief:'The Americans have come to Africa, and Rommel and von Arnim mean to teach them a lesson before they learn too much. The US 1st Armored Division is spread across central Tunisia; at Sidi Bou Zid its Combat Command A sits on two hills, Djebel Lessouda and Djebel Ksaira, too far apart to help each other. The 10th Panzer comes through the Faïd pass from the east, the 21st round from the south, with Tigers in the centre. When the Americans counter-attack, and they will, let them come.',
    clock:{start:'1943-02-14T06:30', step:120},
    build:() => { const b = MB(36, 22, '.', 10909);
      b.blobs('^', 5, 0, 0, 35, 21, 1, 2).blobs('T', 3, 10, 6, 26, 16, 1, 1, ['.']);
      b.rect(10, 2, 13, 6, '^').rect(11, 3, 12, 5, 'M');                               // Djebel Lessouda
      b.rect(18, 14, 21, 18, '^').rect(19, 15, 20, 17, 'M');                           // Djebel Ksaira
      b.scatter(',', .3, 4, 7, 26, 13, ['.']);
      b.road([[35, 8], [24, 10], [16, 10], [0, 11]]).road([[16, 10], [17, 21]]);
      b.put([[34, 9, 'Q'], [33, 3, 'C'], [33, 17, 'C'], [15, 10, 'k'], [2, 11, 'q'], [5, 4, 'k'], [6, 18, 'k']]);
      return b.rows(); },
    units:{1:'htank*2 30,7-34,11; tank*5 28,4-34,14; mtank*3 29,6-33,12; inf*3 31,3-34,15; art*2 33,6-35,12; aa*2 30,9-33,13; tank*3 22,19-30,21',
      2:'tank*6 8,6-16,14; mtank*3 6,8-12,13; inf*4 10,2-13,6; inf*3 18,14-21,18; art*3 3,6-8,15; at*2 14,8-17,12'},
    events:[{day:2, team:2, say:'Colonel Hightower\'s Shermans counter-attack across the open plain towards Sidi Bou Zid, straight into the 88s.', spawn:'tank*5 0,5-4,16'},
      {day:3, team:1, say:'The infantry on Djebel Lessouda are cut off. Some of them walk out at night through the German lines.', hurt:1},
      {day:3, team:2, say:'Combat Command C comes up from Sbeitla for another counter-attack.', spawn:'tank*4 0,8-3,14; mtank*2 0,3-3,7'},
      {day:4, team:1, say:'Stukas over the plain.', hurt:1}]},
  medenine:{name:'Medenine', place:'Operation Capri: the hills in front of Medenine', date:'6 March 1943, 06:00', theme:'tunisia', weather:'overcast',
    p1:{nat:'dak', co:'rommelafrika', funds:0},
    p2:{nat:'uk42', co:'monty', funds:0, u:{pak:{n:'Anti-tank Screen (17-pounders & 6-pounders)', w:'QF 17-pounder', shape:'casemate', pow:1.15}, inf:{n:'51st Highland & 2nd New Zealand Divisions'}, mtank:{n:'Sherman II', w:'75 mm M3', shape:'sherman'}}},
    objective:{win:'hq', limit:17}, goal:'Rommel\'s last attack in Africa: break the British line in front of Medenine by {limit}.',
    brief:'Rommel has one more blow in him. Three panzer divisions, 160 tanks, are to come out of the Matmata hills and smash the Eighth Army before it is ready to attack the Mareth Line. He does not know that Montgomery has read the plan in the Enigma decrypts, and has spent a week digging in five hundred anti-tank guns, waiting for him. It is three days before Rommel leaves Africa for good. Find a way through.',
    clock:{start:'1943-03-06T06:00', step:120},
    build:() => { const b = MB(36, 22, '.', 11010);
      b.blobs('M', 5, 0, 0, 8, 21, 1, 2).blobs('^', 8, 4, 0, 35, 21, 1, 2, ['.']).scatter(',', .2, 9, 0, 35, 21, ['.']);
      wadi(b, [[8, 0], [14, 8], [12, 21]]); wadi(b, [[20, 0], [22, 10], [26, 21]]);
      b.road([[0, 11], [14, 11], [28, 10], [35, 11]]).road([[28, 10], [30, 0]]);
      b.put([[1, 11, 'Q'], [4, 4, 'C'], [4, 18, 'C'], [32, 11, 'q'], [24, 4, 'k'], [24, 17, 'k'], [29, 8, 'k'], [16, 2, 'c']]);
      return b.rows(); },
    units:{1:'tank*8 1,4-6,17; mtank*4 2,8-5,14; inf*4 3,4-8,18; art*3 0,7-2,15; eng*2 5,9-7,13; aa*2 2,10-4,13; rkt 1,12',
      2:'pak*4 21,3-28,18; at*2 20,6-24,15; inf*4 22,2-30,19; art*3 29,3-35,19; mtank*3 29,7-33,14; nest*2 19,5-20,16'},
    events:[{day:1, team:1, say:'06:00. Fog in the valleys. The panzers come down out of the hills.', hurt:0},
      {day:2, team:2, say:'The fog lifts. Five hundred anti-tank guns open fire at once.', hurt:1, hurtTeam:1},
      {day:3, team:2, say:'The Highland Division\'s guns fire 30,000 shells into the wadis.', hurt:1, hurtTeam:1},
      {day:4, team:1, say:'Rommel calls the attack off by the evening of the first day. You have a little longer.', heal:1}]},
};
for (const [id, m] of Object.entries(FOX_MISSIONS)) { m.id = id; m.fog = !!m.fog; MISSIONS[id] = m; }

Object.assign(HISTORY, {
  sonnenblume:{forces:['The 5th Light Division with about 150 tanks, half of them light Panzer Is and IIs, and the Ariete Armoured Division', 'The 2nd Armoured Division, worn out and short of everything, and the 9th Australian Division'],
    win:'The gap is forced. Cyrenaica is open.', lose:'The British hold the gap, and Berlin asks what Rommel thought he was doing.',
    real:'Rommel attacked at Mersa Brega on 31 March 1941, against orders, and the British, thinking themselves far stronger than they were, fell back. In twelve days the Afrikakorps crossed Cyrenaica and reached the Egyptian frontier. O\'Connor and Neame drove into a German patrol on 7 April and were captured, and the 2nd Armoured Division was destroyed, more by breakdowns than by fighting. Only Tobruk held out.'},
  medauar:{forces:['The 15th Panzer Division and the 5th Light Division, with pioneers and Stukas', 'The 9th Australian Division and the tanks of the 1st and 7th Royal Tank Regiments'],
    win:'The perimeter is broken. Tobruk is finished.', lose:'The Red Line holds. Tobruk is still there.',
    real:'On 30 April 1941 the Germans took Ras el Medauar and a salient two miles deep, but the posts on either side held out for days and the Australians counter-attacked night after night. The attack stopped on 4 May. The siege of Tobruk lasted 241 days, and its garrison took to calling themselves the Rats of Tobruk, after a German broadcast called them rats in a trap.'},
  totensonntag:{forces:['The 15th and 21st Panzer Divisions and the Ariete, about 160 tanks', 'The 5th South African Brigade and the remnants of the 7th Armoured Division'],
    win:'The British armour is broken at Sidi Rezegh.', lose:'The panzers lose too many tanks to the South African guns.',
    real:'On 23 November 1941 Crüwell drove the massed panzers straight through the 5th South African Brigade, which was destroyed: 3,400 South Africans were killed, wounded or captured. But the attack cost the Afrikakorps 72 of its 162 tanks, losses it could not replace. The Germans remembered the day as Totensonntag, the Sunday of the Dead.'},
  dashwire:{forces:['The Afrikakorps\' panzer divisions, about 100 tanks', 'The Eighth Army\'s rear echelons, the 4th Indian Division, and what was left of the British armour'],
    win:'The panzers are at the wire, and the British rear is in chaos.', lose:'The dash breaks up in the desert.',
    real:'Rommel\'s "dash to the wire" on 24 November 1941 caused panic in the British rear areas, and Cunningham asked to call off the offensive. Auchinleck refused and replaced him with Ritchie. The panzers, short of fuel and scattered, achieved little, and missed two huge British supply dumps by a few miles. Meanwhile the New Zealanders linked up with the Tobruk garrison, and in December Rommel had to retreat all the way back to Mersa Brega, where he had started.'},
  cauldron:{forces:['The Afrikakorps and the Italian XX Corps, trapped behind the British minefields', 'The Eighth Army: the 5th and 10th Indian Divisions, the 22nd Armoured and 32nd Army Tank Brigades'],
    win:'The Cauldron holds, and the British armour is spent on it.', lose:'The Cauldron is broken, and the Afrikakorps with it.',
    real:'Operation Aberdeen, on 5 June 1942, was a disaster for the British: their attacks went in separately, the Matildas and Valentines ran onto the 88s, and an Indian brigade and four artillery regiments were cut off and destroyed. Rommel broke out of the Cauldron, took Bir Hakeim when the Free French broke out on 11 June, destroyed the British armour at Knightsbridge on 12-13 June, and took Tobruk on 21 June.'},
  matruh:{forces:['The Afrikakorps and the 90th Light Division, with about 60 tanks', 'X Corps in the fortress, XIII Corps and the 2nd New Zealand Division on the escarpment'],
    win:'Mersa Matruh falls. The road to Egypt is open.', lose:'The fortress holds, and Rommel\'s bluff is called.',
    real:'Both British corps withdrew from Mersa Matruh between 27 and 29 June 1942, each thinking the other was in trouble. The New Zealanders broke out through the 21st Panzer at night with the bayonet, and X Corps escaped in the dark in small columns, but the Germans took 6,000 prisoners and huge stores. Rommel drove on to El Alamein, sixty miles from Alexandria, where Auchinleck stopped him in July.'},
  alamhalfa:{forces:['The Afrikakorps, the Italian XX Corps and the 90th Light: about 200 German and 240 Italian tanks', 'The Eighth Army: the 7th and 10th Armoured Divisions and the New Zealanders, dug in on the ridge, and the Desert Air Force'],
    win:'The ridge falls. Rommel is behind the Eighth Army, and Cairo is in reach.', lose:'The attack dies on the ridge and in the minefields.',
    real:'The minefields were thicker than Rommel had been told, and the advance was slow. On 31 August the panzers turned north early and ran into the 22nd Armoured Brigade\'s Grants, dug in hull-down on the ridge, while the RAF bombed them day and night. Short of fuel, Rommel called the attack off on 2 September. Montgomery did not counter-attack properly; he was preparing his own battle, El Alamein, seven weeks later.'},
  retreat42:{forces:['The remnants of the Afrikakorps: about 35 tanks, the 88s and the panzergrenadiers in their half-tracks', 'The Eighth Army: X Corps\' armoured divisions and the New Zealanders'],
    win:'The infantry got away. The Afrikakorps lives to fight in Tunisia.', lose:'The panzergrenadiers are caught in the open.',
    real:'Hitler\'s "victory or death" order cost Rommel a day, and most of his remaining tanks. On 4 November he disobeyed it and retreated. Most of the Italian infantry, without transport, was left behind and captured. But rain on 6 and 7 November bogged down the British pursuit, and the Germans got away along the coast road: 1,500 miles back to Tunisia, the longest retreat of the desert war.'},
  sidibouzid:{forces:['The 10th and 21st Panzer Divisions, with Tigers of the 501st Heavy Tank Battalion', 'Combat Command A and later Combat Command C of the US 1st Armored Division, and the 168th Infantry'],
    win:'The American armour is smashed on the plain.', lose:'The Americans hold, and the panzers pull back through the pass.',
    real:'On 14 February 1943 the panzers surrounded the two hills, and on the 15th the 2nd Battalion of the 1st Armored Regiment counter-attacked across the open plain and was destroyed: 46 tanks lost. In two days the Americans lost about 100 tanks and 1,600 men, and the hill garrisons were captured. The Germans pushed on to the Kasserine Pass, where the Americans learned, very fast.'},
  medenine:{forces:['The 10th, 15th and 21st Panzer Divisions, about 160 tanks', 'The 7th Armoured, 51st Highland and 2nd New Zealand Divisions, with about 500 anti-tank guns'],
    win:'The British line is broken. Mareth is safe for now.', lose:'The panzers die in front of the guns.',
    real:'Montgomery knew the plan from Ultra, and the panzers attacked straight into a prepared anti-tank screen. Rommel lost 52 tanks; the British lost no tanks at all. He called the attack off the same evening. On 9 March, ill and in despair, Rommel left Africa and never came back. The Axis armies in Tunisia surrendered two months later.'},
});
Object.assign(CO_FATE, {
  rommelafrika:'Left Africa on 9 March 1943 and commanded on the Atlantic Wall in 1944. Implicated in the 20 July plot, he was forced to take poison on 14 October 1944.',
  cruwell:'Shot down over the Gazala line on 29 May 1942 and captured. Held in Britain and the United States until 1947. Died in 1958.',
  thoma:'Captured at Tel el Mampsra on 4 November 1942. At Trent Park, the British listening camp, he was overheard talking about the V-2 rockets. Released in 1947, he died in 1948.',
  ziegler:'Commanded the Afrikakorps briefly in 1943 and an army corps in Italy. Died in 1972.',
  neame:'Captured on 7 April 1941; he escaped from an Italian prison camp in 1943. Lieutenant-Governor of Guernsey after the war. Died in 1978.',
  cunningham:'Never held a field command again. High Commissioner for Palestine from 1945 to 1948. Died in 1983.',
  gott:'Killed on 7 August 1942 when the transport aircraft taking him to Cairo was shot down, two days after being chosen to command the Eighth Army.',
  ritchie:'Commanded XII Corps from Normandy to the Elbe. Died in Canada in 1983.',
  auchinleck:'Commander-in-Chief India for the rest of the war, and oversaw the division of the Indian Army in 1947. Died in Marrakesh in 1981, aged 96.',
  ward:'Commanded the 20th Armored Division in 1945, and later headed the US Army\'s official history of the war. Died in 1972.',
});
Object.assign(MISSION_LONLAT, {sonnenblume:[19.6, 30.42], medauar:[23.8, 31.95], totensonntag:[23.95, 31.95], dashwire:[25.1, 31.6], cauldron:[23.2, 32.0], matruh:[27.24, 31.35], alamhalfa:[29.0, 30.6], retreat42:[28.8, 30.85], sidibouzid:[9.5, 35.0], medenine:[10.42, 33.35]});
EUROPE.cities.push(['Agedabia', 20.22, 30.76], ['Mersa Matruh', 27.24, 31.35]);
CAMPAIGNS.push({id:'foxdesert', name:'The Desert Fox', sub:'Rommel and the Afrikakorps · 1941–1943', side:'axis', missions:['sonnenblume', 'medauar', 'totensonntag', 'dashwire', 'cauldron', 'matruh', 'alamhalfa', 'retreat42', 'sidibouzid', 'medenine']});
