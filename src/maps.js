/* ============================== MAPS & CAMPAIGNS ==========================
   Maps are built with a small terrain toolkit (fields, woods, rivers that
   bridge themselves under roads, towns, strongpoints) so they can be large
   and detailed. Side 1 is always the player.
   Legend: . plain  , wheat  = road  T woods  h bocage  ^ hill  r river  b bridge  ~ sea  s beach
   O beach obstacles / dragon's teeth  n shingle  w wire  m mines  u cliffs  z trenches  v marsh
   U city blocks  B bunker  x ruins.  Properties (neutral/side 1/side 2): town c C k, depot f F g, airfield a A e, port p P o, HQ Q q */
function MB(W, H, base, seed) {
  const g = Array.from({length:H}, () => Array(W).fill(base));
  let s = (seed >>> 0) || 1; const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const PROPS = 'cCkfFgaAepPoQq';
  const b = {W, H, g, R,
    set(x, y, c) { if (ok(x, y)) g[y][x] = c; return b; },
    get(x, y) { return ok(x, y) ? g[y][x] : null; },
    rect(x0, y0, x1, y1, c, only) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ok(x, y) && (!only || only.includes(g[y][x]))) g[y][x] = c; return b; },
    blobs(c, n, x0, y0, x1, y1, r0 = 1, r1 = 2, only) {
      for (let i = 0; i < n; i++) {
        const cx = x0 + Math.floor(R() * (x1 - x0 + 1)), cy = y0 + Math.floor(R() * (y1 - y0 + 1)), r = r0 + Math.floor(R() * (r1 - r0 + 1));
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + R() * r && ok(cx + dx, cy + dy) && (!only || only.includes(g[cy + dy][cx + dx]))) g[cy + dy][cx + dx] = c;
      }
      return b;
    },
    scatter(c, p, x0, y0, x1, y1, only) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ok(x, y) && R() < p && (!only || only.includes(g[y][x]))) g[y][x] = c; return b; },
    /* 4-connected path through points; wig = sideways wander */
    path(pts, fn, wig = 0) {
      let [x, y] = pts[0]; fn(x, y);
      for (let i = 1; i < pts.length; i++) {
        const [tx, ty] = pts[i];
        while (x !== tx || y !== ty) {
          const dx = tx - x, dy = ty - y, horiz = Math.abs(dx) >= Math.abs(dy);
          if (wig && R() < wig) { if (horiz && dy === 0) y += R() < .5 ? -1 : 1; else if (!horiz && dx === 0) x += R() < .5 ? -1 : 1; else if (horiz) y += Math.sign(dy); else x += Math.sign(dx); }
          else if (horiz) x += Math.sign(dx); else y += Math.sign(dy);
          x = Math.max(0, Math.min(W - 1, x)); y = Math.max(0, Math.min(H - 1, y)); fn(x, y);
        }
      }
      return b;
    },
    road(pts) { return b.path(pts, (x, y) => { const c = g[y][x]; if (PROPS.includes(c) || c === 'B') return; g[y][x] = (c === 'r' || c === 'b') ? 'b' : c === '~' ? '~' : '='; }); },
    river(pts, wig = .25) { return b.path(pts, (x, y) => { const c = g[y][x]; g[y][x] = (c === '=' || c === 'b') ? 'b' : PROPS.includes(c) ? c : 'r'; }, wig); },
    town(cx, cy, n, ch = 'c', spread = 2, extra = '.') {
      let placed = 0;
      for (let tries = 0; placed < n && tries < 200; tries++) {
        const x = cx + Math.round((R() * 2 - 1) * spread), y = cy + Math.round((R() * 2 - 1) * spread);
        if (!ok(x, y) || '=~rbBQq'.includes(g[y][x]) || PROPS.includes(g[y][x])) continue;
        g[y][x] = ch; placed++;
      }
      if (extra) for (let dy = -spread; dy <= spread; dy++) for (let dx = -spread; dx <= spread; dx++) { const x = cx + dx, y = cy + dy; if (ok(x, y) && 'hT^,'.includes(g[y][x]) && R() < .55) g[y][x] = extra; }
      return b;
    },
    put(list) { for (const [x, y, c] of list) b.set(x, y, c); return b; },
    rows() { return g.map(r => r.join('')); },
  };
  return b;
}

/* ---------- the missions ---------- */
const MISSIONS = {
  pointe: {name:'Pointe du Hoc', place:'Pointe du Hoc, Normandy', date:'6 June 1944, 07:10', theme:'normandy', weather:'overcast',
    p1:{nat:'us', co:'rudder', funds:0}, p2:{nat:'ger', co:'rommel', funds:0}, income:{2:.4},
    objective:{win:'kill', role:'art'}, goal:'Climb the cliffs and destroy the four 155 mm guns that threaten Omaha and Utah beaches.',
    brief:'Three companies of the 2nd Ranger Battalion run in under fire to a 100-foot cliff. Rocket-fired grapnels, rope ladders and fire-brigade ladders borrowed from London are the only way up. The casemates on top are empty: the guns have been hidden in an orchard lane inland. Find them. HMS Talybont and USS Satterlee are standing close in to help. Lieutenant Colonel Rudder\'s Rangers climb cliffs at normal speed.',
    build:() => { const b = MB(30, 22, 'h', 101);
      b.blobs('.', 12, 0, 0, 29, 8, 1, 2).blobs(',', 6, 0, 0, 29, 6, 1, 2).blobs('T', 4, 0, 0, 29, 4, 1, 1);
      b.rect(0, 16, 29, 21, '~').rect(0, 13, 29, 14, 'u').rect(12, 15, 17, 15, 'u').rect(0, 15, 11, 15, 's').rect(18, 15, 29, 15, 's').rect(12, 16, 17, 16, 's');
      b.rect(4, 7, 25, 12, '.').scatter('x', .22, 6, 8, 23, 12, ['.']).scatter('m', .12, 5, 7, 24, 11, ['.']);
      b.rect(6, 10, 23, 10, 'z', ['.', 'x']).rect(5, 12, 24, 12, 'w', ['.', 'x']);
      b.put([[8, 9, 'B'], [20, 9, 'B'], [15, 12, 'B'], [5, 11, 'B'], [11, 11, 'B'], [17, 11, 'B']]);
      b.road([[0, 5], [29, 5]]).road([[14, 5], [14, 0]]);
      b.put([[5, 3, 'k'], [7, 3, 'c'], [22, 3, 'k'], [25, 1, 'k'], [24, 6, 'c']]);
      return b.rows(); },
    units:{1:'lc 3,17 +inf+inf; lc 7,17 +inf+inf; lc 11,18 +inf+eng; lc 15,17 +inf+inf; lc 19,18 +inf+mortar; lc 24,17 +inf+at; dd 9,17; dd 21,17',
      2:'nest 15,12; nest 20,9; inf*3 6,8-23,11; mortar 12,8 !; at 18,8; art 12,2 !; art 13,1 !; art 16,2 !; art 17,1 !; inf*2 3,4-8,6'},
    events:[{day:2, team:2, say:'The 914th Grenadier Regiment counter-attacks along the coast road.', spawn:'inf*3 0,4-3,7'},
      {day:2, team:1, say:'Shermans of the 743rd and the 5th Rangers fight through from Omaha to relieve the Point.', spawn:'tank*2 27,4-29,6; inf*3 26,3-29,7'}]},

  omaha: {name:'Omaha Beach', place:'Vierville to Colleville, Normandy', date:'6 June 1944, 06:30', theme:'normandy', weather:'overcast',
    p1:{nat:'us', co:'bradley', funds:4000}, income:{2:.25}, pin:true,
    p2:{nat:'ger', co:'rommel', funds:0, u:{nest:{n:'MG 42 Widerstandsnest', w:'MG 42s firing down the length of the beach in interlocking fields', pow:1.25, rng:[1, 6]},
      mortar:{n:'Granatwerfer (ranged on the beach)', w:'81 mm mortars, every yard of sand pre-registered', rng:[2, 8]}}},
    objective:{win:'hq'}, goal:'Get off the beach: wade in, cross the sand to the shingle, open the draws, then take the 916th Grenadier Regiment\'s command post at Trévières.',
    brief:'H-Hour, 06:30. The 1st and 29th Infantry Divisions go in against four miles of beach under 100-foot bluffs. The bombers have missed, most of the amphibious tanks have foundered, and the tide is covering the obstacle belt. Fourteen Widerstandsnester cover the beach, their MG 42s sited to fire along it and their 88s in casemates aimed at the sand, not the sea. The only ways off are five draws: D-1 Vierville, D-3 Les Moulins, E-1 Saint-Laurent, E-3 Colleville and F-1. Engineers can blow lanes through obstacles and wire. The beachhead supply dumps can land reinforcements once the beach is held. Bring the destroyers in close; they will be decisive.',
    build:() => { const b = MB(48, 30, 'h', 202);
      b.blobs('.', 34, 0, 0, 47, 13, 1, 2).blobs(',', 12, 0, 0, 47, 12, 1, 2).blobs('T', 7, 0, 0, 47, 10, 1, 2);
      b.rect(0, 27, 47, 29, '~').rect(0, 25, 47, 26, 'S').rect(0, 24, 47, 24, 'O');       // the boats ground on the sandbars: two rows of wading, then the obstacles
      for (const x of [3, 4, 10, 11, 16, 23, 29, 35, 41, 46]) b.rect(x, 24, x, 24, 's');
      b.rect(0, 21, 47, 23, 's').rect(2, 20, 45, 20, 'n').rect(0, 15, 47, 19, '^').rect(2, 16, 45, 16, 'z').rect(1, 19, 46, 19, 'w').scatter('m', .3, 1, 17, 46, 18, ['^']);
      b.rect(0, 15, 1, 22, 'u');
      for (const dx of [7, 17, 28, 38]) { b.rect(dx - 1, 15, dx + 1, 18, '.'); b.road([[dx, 13], [dx, 20]]); b.set(dx - 1, 19, 'w').set(dx + 1, 19, 'w');
        b.set(dx - 2, 17, 'B').set(dx + 2, 17, 'B'); }
      b.put([[12, 17, 'B'], [22, 17, 'B'], [33, 17, 'B'], [43, 17, 'B'], [9, 18, 'B'], [40, 18, 'B'], [30, 18, 'B'], [16, 15, 'c'], [18, 15, 'x']]);
      b.road([[0, 13], [47, 13]]).road([[7, 13], [7, 4], [22, 4]]).road([[28, 13], [28, 6], [22, 6], [22, 2]]).road([[38, 13], [38, 5], [45, 5]]).road([[17, 13], [17, 8], [28, 8]]);
      b.town(7, 10, 3, 'c', 2).town(27, 10, 3, 'c', 2).town(38, 10, 3, 'c', 2);
      b.put([[22, 2, 'q'], [10, 2, 'k'], [40, 3, 'k'], [3, 5, 'k'], [45, 8, 'k'], [30, 2, 'k'], [25, 12, 'f'], [33, 11, 'c'], [14, 22, 'F'], [33, 22, 'F']]);   // beachhead supply dumps
      return b.rows(); },
    units:{1:'lc 1,27 +inf+inf; lc 3,28 +inf+inf; lc 6,27 +inf+eng; lc 8,28 +inf+inf; lc 10,27 +inf+inf; lc 13,28 +eng+at; lc 16,27 +inf+inf; lc 19,28 +inf+eng; lc 21,27 +inf+inf; lc 23,28 +tank+inf; lc 26,27 +inf+inf; lc 29,28 +inf+eng; lc 31,27 +inf+inf; lc 32,28 +inf+at; lc 35,27 +inf+inf; lc 38,28 +tank+inf; lc 40,27 +inf+inf; lc 41,28 +inf+eng; lc 44,27 +inf+inf; ddtank*2 18,25-26,25 5; ddtank 12,22 7; ddtank 30,22 6; inf*6 2,21-45,22 7; eng*2 10,22-35,22 6; dd 8,28; dd 24,29; dd 38,28',
      2:'nest 5,17; nest 9,17; nest 15,17; nest 19,17; nest 26,17; nest 30,17; nest 36,17; nest 40,17; nest 12,17; nest 22,17; nest 33,17; nest 43,17; pak 9,18; pak 40,18; pak 30,18; mortar*4 3,14-44,14 !; art 12,8 !; art 25,7 !; art 34,8 !; inf*8 2,15-45,16; at*2 5,13-42,13; inf*4 5,9-40,11'},
    events:[
      {day:1, team:1, say:'06:31. The boats ground on the sandbars, a hundred yards out, and the ramps go down into neck-deep water. Most of the 741st Tank Battalion\'s DD tanks have foundered far out; two are swimming in, half swamped. The MG 42s open up down the length of the beach. Only at Les Moulins, where the naval shells have set the grass burning, does smoke hide the men.', shock:3.8, smoke:[13, 18, 21, 26, 2]},
      {day:1, team:1, say:'C Company, 2nd Rangers lands on the right flank at Charlie, and the 16th Infantry\'s support boats follow the assault wave in.', spawn:'lc*2 2,27-12,28 +inf+inf; lc*2 30,27-44,28 +inf+inf'},
      {day:2, team:1, say:'Destroyers close to 800 yards and pound the strongpoints over the heads of the infantry. Funds for naval fire support.', funds:4000},
      {day:2, team:1, say:'The second wave: LCTs with Shermans of the 741st and 743rd Tank Battalions.', spawn:'lc*4 4,27-44,28 +tank+inf'},
      {day:3, team:2, say:'Kampfgruppe Meyer, the 352nd\'s reserve, is ordered to the coast.', spawn:'inf*4 0,2-6,6; at 2,4; tank*2 40,2-46,5'},
      {day:3, team:1, say:'Engineers of the Special Engineer Task Force have blown lanes through the obstacles.', clear:[[13, 23], [13, 24], [20, 23], [20, 24], [26, 23], [26, 24], [32, 23], [32, 24], [38, 23], [38, 24]]},
      {day:3, team:1, say:'The 5th Ranger Battalion and the survivors of the 116th break over the bluff west of Les Moulins: "Rangers, lead the way!"', spawn:'inf*3 14,19-20,20'},
      {day:4, team:1, say:'The third wave lands: the 18th and 115th Infantry.', spawn:'lc*5 4,27-44,28 +inf+eng; lc*2 15,27-30,28 +tank+tank'}]},

  pegasus: {name:'Pegasus Bridge', place:'Bénouville, Caen Canal', date:'6 June 1944, 00:16', theme:'normandy', weather:'clear',
    p1:{nat:'uk', co:'monty', funds:0}, p2:{nat:'ger', co:'rommel', funds:2000}, income:{2:.7},
    objective:{win:'survive', days:8, hold:2}, goal:'Hold the Café Gondrée and both bridges until {survive}.',
    brief:'Major John Howard\'s glider-borne company of the Ox and Bucks has taken the Caen Canal and Orne bridges intact in ten minutes. The Café Gondrée is the first house in France to be liberated, and the 6th Airborne\'s paratroops are digging in around Ranville. Now 21st Panzer Division is coming. Hold until Lord Lovat\'s commandos fight their way up from Sword Beach, piper and all.',
    build:() => { const b = MB(36, 22, '.', 303);
      b.blobs('h', 20, 0, 0, 35, 21, 1, 2).blobs(',', 6, 0, 0, 35, 21, 1, 2).blobs('T', 10, 26, 12, 35, 21, 1, 3);
      b.river([[15, 0], [15, 21]], 0).river([[22, 0], [21, 8], [22, 14], [21, 21]], .2);
      b.road([[0, 10], [35, 10]]).road([[12, 0], [12, 21]]).road([[27, 10], [27, 0]]);
      b.town(11, 13, 3, 'c', 2).town(26, 8, 2, 'c', 1);
      b.put([[14, 9, 'Q'], [12, 6, 'c'], [26, 9, 'C'], [3, 20, 'g'], [32, 20, 'k'], [8, 19, 'k'], [30, 18, 'k']]);
      return b.rows(); },
    units:{1:'inf*3 13,8-16,11; at 14,11; inf*3 16,9-20,12; at 18,10; inf*3 23,7-28,11; art 25,9; mortar 13,7; at 24,10; mortar 25,11',
      2:'tank 3,19; tank 31,19; inf*4 2,15-10,20; inf*3 26,14-34,20; recon 12,20; at*2 6,16-30,18; art 33,21; mortar 9,18'},
    events:[{day:2, team:2, say:'The bridge guards of the 716th Division counter-attack out of Bénouville, with a Panzer IV from Ranville.', spawn:'inf*3 8,12-11,16; tank 9,14; inf*2 29,13-33,16'},
      {day:3, team:2, say:'21st Panzer commits its Panzer IVs from Caen.', spawn:'tank*2 0,17-6,21; inf 30,19-35,21'},
      {day:4, team:1, say:'Bagpipes from the north: Lord Lovat\'s 1st Special Service Brigade has arrived, with Piper Bill Millin playing.', spawn:'inf*4 0,8-3,12; tank 0,10; mtank 1,10'},
      {day:6, team:2, say:'The 125th Panzergrenadier Regiment counter-attacks towards the Orne bridge with Panzer IVs in support.', spawn:'mtank*2 28,15-33,19; inf*3 27,14-34,19'}]},

  carentan: {name:'Carentan', place:'Purple Heart Lane', date:'10–12 June 1944', theme:'normandy', weather:'overcast',
    p1:{nat:'us', co:'mcauliffe', funds:0}, p2:{nat:'ger', co:'rommel', funds:0}, income:{2:.4},
    objective:{win:'hq'}, goal:'Cross the causeway and its four bridges, and take Carentan to link Utah and Omaha beaches.',
    brief:'Carentan sits between the two American beaches. The only way in from the north is a raised causeway across flooded marsh, with four bridges over the Douve and its channels. Paratroopers of the 101st Airborne call it Purple Heart Lane. Fallschirmjäger Regiment 6 holds the hedgerows at the far end. Take the town before the German armour arrives.',
    build:() => { const b = MB(36, 24, 'h', 404);
      b.blobs('.', 14, 14, 0, 35, 23, 1, 2).rect(0, 0, 15, 23, 'v').blobs('h', 5, 0, 0, 14, 23, 1, 1, ['v']);
      b.river([[4, 0], [4, 23]], .1).river([[8, 0], [9, 23]], .1).river([[12, 0], [12, 23]], .1);
      b.road([[0, 6], [17, 6], [19, 9]]).road([[19, 9], [34, 9]]).road([[22, 14], [22, 23]]).road([[25, 9], [30, 4]]).road([[19, 9], [19, 0]]);
      b.rect(18, 8, 25, 14, '.').town(21, 11, 6, 'k', 3, '.');
      b.put([[22, 10, 'q'], [30, 4, 'g'], [15, 7, 'B'], [2, 5, 'C'], [28, 18, 'c'], [33, 14, 'c']]);
      return b.rows(); },
    units:{1:'inf*7 0,3-6,9; at*2 1,4-3,8; mortar*2 2,4-5,8; eng*2 1,6-4,8; art*2 0,4-2,7',
      2:'inf*3 14,5-17,9; nest 15,7; inf*4 19,9-25,14; at 20,12; mortar 23,13; art 27,11'},
    events:[{day:3, team:2, say:'Assault guns of the 17th SS Panzergrenadier Division counter-attack from the south-west.', spawn:'tank*2 30,18-35,23; inf 30,18-35,23'},
      {day:3, team:1, say:'Combat Command A of the 2nd Armored Division arrives at Bloody Gulch.', spawn:'tank*3 18,0-21,2; inf*2 17,0-22,3'}]},

  villers: {name:'Villers-Bocage', place:'Calvados, Normandy', date:'13 June 1944', theme:'normandy', weather:'clear',
    p1:{nat:'uk', co:'monty', funds:4000}, p2:{nat:'ger', co:'rommel', funds:1000}, income:{2:.4},
    objective:{win:'hq'}, goal:'Clear the town and take Point 213 from the Tigers.',
    brief:'The 7th Armoured Division, the Desert Rats, has found a gap and pushed into Villers-Bocage. Beyond the town, on Point 213, a company of Tigers of heavy Panzer battalion 101 waits in the orchards. A Cromwell cannot fight a Tiger head on. Use the Fireflies, the artillery, the hedgerows and the streets.',
    build:() => { const b = MB(36, 22, 'h', 505);
      b.blobs('.', 16, 0, 0, 35, 21, 1, 2).blobs('T', 6, 22, 0, 35, 21, 1, 2);
      b.rect(26, 4, 32, 9, '^', ['h', '.', 'T']);
      b.road([[0, 11], [35, 11]]).road([[22, 11], [29, 11], [29, 7]]).road([[18, 0], [18, 21]]);
      b.rect(14, 8, 22, 14, '.').town(18, 11, 8, 'c', 3, 'x');
      b.put([[29, 7, 'q'], [0, 11, 'F'], [35, 11, 'g'], [33, 3, 'k'], [33, 18, 'k'], [3, 16, 'C'], [5, 5, 'c']]);
      return b.rows(); },
    units:{1:'tank*4 1,10-6,12; mtank*3 2,9-5,13; recon 7,11; apc 6,11 +inf+inf; inf*3 1,8-5,14; art*2 0,9-2,13; at 4,9; mortar 3,8',
      2:'htank 28,6; htank 26,9; inf*3 15,8-21,14; at 19,10; mortar 24,10; art 31,4; tank 33,11'},
    events:[{day:3, team:2, say:'The Panzer Lehr Division arrives from the south.', spawn:'tank*2 33,15-35,20; inf*2 30,15-35,20'},
      {day:4, team:1, say:'Typhoons of 2nd Tactical Air Force are on call. Funds for air support.', funds:5000}]},

  caen: {name:'Caen', place:'Operation Charnwood', date:'8 July 1944', theme:'normandy', weather:'smoke',
    p1:{nat:'uk', co:'monty', funds:6000}, p2:{nat:'ger', co:'rommel', funds:2000}, income:{2:.5},
    objective:{win:'hq'}, goal:'Break the anti-tank belt, then fight through the ruins to the Abbaye aux Hommes.',
    brief:'Caen was a D-Day objective. It is now day 32. Four hundred and fifty Lancasters and Halifaxes have bombed the northern suburbs flat, and the rubble is perfect anti-tank country for the defenders. I Corps attacks with three divisions behind a barrage from 656 guns. The Canadians are going for Carpiquet airfield on the right.',
    build:() => { const b = MB(40, 26, 'h', 606);
      b.blobs('.', 20, 0, 0, 39, 25, 1, 2).blobs(',', 8, 0, 17, 39, 25, 1, 2);
      b.blobs('x', 34, 9, 1, 31, 14, 1, 2).rect(14, 3, 26, 11, 'x', ['h', '.', ',']);
      b.rect(2, 4, 7, 8, '.').put([[5, 6, 'e'], [3, 5, 'x'], [6, 7, 'x']]);
      b.rect(2, 16, 37, 16, 'w').scatter('m', .3, 2, 17, 37, 17).put([[8, 17, 'B'], [14, 17, 'B'], [20, 17, 'B'], [26, 17, 'B'], [32, 17, 'B']]);
      b.road([[20, 25], [20, 0]]).road([[0, 13], [39, 13]]).road([[10, 25], [10, 13], [14, 6], [20, 6]]).road([[30, 25], [30, 13], [26, 6], [20, 6]]).road([[5, 6], [14, 6]]);
      b.put([[20, 4, 'q'], [32, 2, 'g'], [14, 5, 'k'], [24, 8, 'k'], [26, 4, 'k'], [17, 11, 'k'], [23, 12, 'k'], [18, 25, 'A'], [22, 24, 'F'], [6, 22, 'C'], [34, 22, 'C'], [36, 9, 'c']]);
      return b.rows(); },
    units:{1:'tank*4 8,21-30,24; mtank*2 14,22-24,24; htank*2 10,22-28,24; inf*6 4,19-36,21; eng*2 10,20-28,21; art*3 6,23-34,25; rkt 26,24; mortar*2 12,20-26,21; recon 3,22; bmr 18,25',
      2:'nest 8,17; nest 14,17; nest 20,17; nest 26,17; nest 32,17; inf*6 8,4-32,14; mtank*2 15,8-25,12; tank*2 10,9-30,12; at*3 10,14-30,15; art*2 18,1-24,3; rkt 27,2; aa 21,6; inf*2 2,4-7,8; mortar*2 12,10-28,12'}},

  cobra: {name:'Operation Cobra', place:'Saint-Lô', date:'25 July 1944', theme:'normandy', weather:'clear',
    p1:{nat:'us', co:'bradley', funds:6000}, p2:{nat:'ger', co:'kluge', funds:3000}, income:{2:.5},
    objective:{win:'hq'}, goal:'Break the line on the Périers road, then take Marigny before the Germans recover.',
    brief:'Seven weeks in the hedgerows. Sergeant Culin\'s "Rhinoceros" cutters, welded from German beach obstacles, now let Shermans burst through the bocage. Bradley\'s plan: carpet-bomb a narrow strip held by the Panzer Lehr Division, then pour three divisions through. Field Marshal von Kluge has replaced the wounded Rommel.',
    build:() => { const b = MB(40, 26, 'h', 707);
      b.blobs('.', 18, 0, 0, 39, 25, 1, 1).blobs('T', 5, 0, 0, 39, 12, 1, 2);
      b.river([[32, 0], [33, 10], [31, 18], [32, 25]], .2);
      b.road([[0, 14], [39, 14]]).road([[16, 3], [16, 25]]).road([[6, 2], [16, 3], [30, 2]]).road([[24, 6], [33, 13]]).road([[8, 25], [8, 14]]);
      b.rect(32, 11, 37, 16, 'x', ['h', '.']).town(34, 13, 3, 'k', 2, 'x');
      b.put([[16, 3, 'q'], [6, 2, 'g'], [30, 2, 'g'], [24, 6, 'k'], [10, 8, 'k'], [12, 25, 'A'], [26, 25, 'A'], [18, 24, 'F'], [4, 22, 'C'], [28, 21, 'C']]);
      return b.rows(); },
    units:{1:'tank*4 10,18-26,20; mtank 18,19; inf*6 4,16-30,17; eng*2 8,17-24,18; at*2 6,18-28,19; art*3 8,21-28,23; bmr*2 12,25-26,25; ftr 24,24; recon 16,22; apc 16,21 +inf+inf',
      2:'inf*6 4,10-30,12; at*2 10,13-24,13; tank*2 6,6-28,9; mtank*2 14,7-24,9; art*2 12,4-22,5; aa 18,6; mortar*2 6,11-28,12; inf*3 33,11-37,16'}},

  falaise: {name:'The Falaise Pocket', place:'Trun and Chambois', date:'19 August 1944', theme:'normandy', weather:'smoke',
    p1:{nat:'us', co:'patton', funds:8000}, p2:{nat:'ger', co:'model', funds:0}, income:{2:.3},
    objective:{win:'hq'}, goal:'Close the gap: take Chambois before the German armies escape east.',
    brief:'Hitler\'s Mortain counter-attack has failed and two German armies are almost encircled. Canadians push from the north, Patton\'s Americans from the south, and the Polish 1st Armoured Division holds Hill 262, the "Maczuga", astride the escape route. Field Marshal Model has just taken command and is trying to hold the corridor open. Close it at Chambois.',
    build:() => { const b = MB(40, 26, 'h', 808);
      b.blobs('.', 18, 0, 0, 39, 25, 1, 2).blobs('T', 10, 4, 6, 26, 18, 1, 2);
      b.river([[30, 0], [30, 25]], .2).rect(33, 8, 37, 12, '^', ['h', '.', 'T']);
      b.road([[0, 2], [39, 2]]).road([[0, 23], [39, 23]]).road([[2, 12], [30, 12], [39, 12]]).road([[30, 8], [30, 16]]).road([[16, 2], [16, 23]]);
      b.put([[31, 16, 'q'], [30, 8, 'k'], [24, 10, 'k'], [12, 14, 'k'], [35, 10, 'C'], [8, 0, 'C'], [20, 0, 'C'], [8, 25, 'F'], [22, 25, 'F'], [26, 25, 'A'], [36, 20, 'c']]);
      return b.rows(); },
    units:{1:'tank*2 10,1-28,3; inf*3 8,0-30,3; at 14,3; art 22,0; tank*3 6,21-26,24; mtank 14,22; inf*4 4,21-28,24; art*2 10,24-20,25; rkt 18,24; ftr 26,25; bmr 24,24; recon 20,22; inf*2 34,9-36,11 7; at 35,10 7',
      2:'tank*3 6,9-24,15 6; mtank*2 10,9-24,15 7; htank 15,12 5; inf*8 4,7-26,17 6; at*2 8,9-24,15; art*2 8,9-24,15 8; apc*2 8,9-24,15; recon 18,8 8; aa 20,12 6; tank*2 38,9-39,15; inf*2 36,7-39,17'}},

  paris: {name:'The Liberation of Paris', place:'Paris', date:'24–25 August 1944', theme:'paris', weather:'clear',
    p1:{nat:'fr', co:'leclerc', funds:5000}, p2:{nat:'ger', co:'choltitz', funds:0}, income:{2:.3},
    objective:{win:'hq', limit:20}, goal:'Fight in from the Porte d\'Orléans, link up with the Resistance and take General von Choltitz\'s headquarters at the Hôtel Meurice by {limit}.',
    brief:'The Resistance has risen in Paris and holds the Hôtel de Ville. Eisenhower has let Leclerc\'s 2e Division Blindée go first. The first half-tracks into the city are named after Spanish Civil War battles: they belong to La Nueve, Spanish Republicans in French uniform. Von Choltitz holds strongpoints at the Luxembourg, the École Militaire and the Chamber of Deputies. He has been ordered to leave the city in ruins.',
    build:() => { const b = MB(40, 26, 'U', 909);
      b.river([[0, 9], [10, 11], [20, 13], [30, 11], [39, 9]], .1);
      for (const x of [4, 10, 16, 22, 28, 34]) b.road([[x, 0], [x, 25]]);
      for (const y of [4, 18, 23]) b.road([[0, y], [39, y]]);
      b.rect(0, 12, 3, 20, 'T').rect(20, 17, 23, 20, 'T').rect(30, 15, 33, 17, 'T');
      b.put([[18, 8, 'q'], [21, 17, 'B'], [11, 15, 'B'], [16, 12, 'B'], [28, 5, 'B'], [22, 10, 'C'], [7, 6, 'k'], [31, 7, 'k'], [25, 15, 'c'], [12, 20, 'c'], [36, 20, 'c'], [6, 22, 'c'], [20, 25, 'F'], [34, 2, 'g']]);
      return b.rows(); },
    units:{1:'tank*4 14,23-26,25; mtank*2 15,24-25,25; apc*2 18,24-22,25 +inf+inf; inf*3 12,22-28,24; recon*2 10,23-30,24; art*2 17,25-23,25; at 20,23; inf*5 5,3-35,21 5',
      2:'nest 21,17; nest 11,15; nest 16,12; nest 28,5; inf*6 6,2-34,20; at*3 8,8-30,16; tank*2 14,6-24,9; aa 18,6; mortar 20,6; art 26,3'}},

  arnhem: {hard:true, name:'A Bridge Too Far', place:'Operation Market Garden', date:'17 September 1944', theme:'holland', weather:'clear',
    p1:{nat:'uk', co:'horrocks', funds:7000}, p2:{nat:'ger', co:'model', funds:1000}, income:{2:.3},
    objective:{win:'hq', limit:20}, goal:'Drive XXX Corps up the single road, cross three rivers and relieve the paratroopers at Arnhem bridge by {limit}.',
    brief:'Airborne divisions have dropped along sixty miles of road to seize the bridges at Son, Grave, Nijmegen and Arnhem. XXX Corps must drive up one raised road, "Hell\'s Highway", with flooded polders either side. At Arnhem, Lieutenant-Colonel Frost\'s 2nd Parachute Battalion holds the north end of the bridge. By bad luck, Field Marshal Model\'s headquarters is in Oosterbeek and two panzer divisions are refitting nearby.',
    build:() => { const b = MB(30, 34, '.', 1010);
      b.blobs('h', 16, 0, 0, 29, 33, 1, 2).blobs('v', 14, 0, 5, 29, 24, 1, 2).blobs('T', 6, 0, 0, 10, 3, 1, 2);
      b.river([[0, 3], [29, 3]], .1).river([[0, 14], [29, 14]], .1).river([[0, 26], [29, 26]], .1).river([[0, 31], [29, 31]], .05);
      b.road([[15, 33], [15, 0]]).road([[0, 1], [29, 1]]).road([[6, 16], [24, 16]]).road([[8, 28], [22, 28]]);
      b.rect(12, 0, 19, 2, 'x', ['.', 'h', 'v', 'T']).town(15, 1, 4, 'k', 2, 'x').town(15, 16, 4, 'k', 2, '.').town(15, 28, 2, 'c', 1, '.').town(15, 33, 2, 'C', 1, '.');
      b.put([[17, 1, 'q'], [2, 1, 'g'], [26, 9, 'k'], [20, 33, 'A'], [11, 33, 'F'], [6, 21, 'c'], [24, 21, 'c']]);
      return b.rows(); },
    units:{1:'tank*6 12,30-18,33; mtank*2 12,32-18,33; recon*2 14,30-16,30; apc*2 13,32-17,33 +inf+inf; inf*3 12,32-18,33; art*2 10,32-20,33; eng*2 13,32-17,33; bmr 20,33; inf*3 13,27-17,29; inf*3 11,17-19,20; inf*2 14,2-16,2 5',
      2:'htank 12,1; tank*2 18,0-21,2; inf*4 10,0-21,2; inf*4 12,15-18,17; tank 17,15; at*2 12,17-18,18; inf*3 10,20-20,24; at*2 12,29-18,30; art*2 8,5-22,10; rkt 4,6; aa*2 13,10-17,22; mortar*2 12,18-18,24'},
    events:[{day:4, team:2, say:'Kampfgruppe Walther cuts Hell\'s Highway from the east.', spawn:'tank*2 25,20-29,24; inf*2 25,20-29,24'},
      {day:6, team:2, say:'Model releases the panzer reserve on "the island" between the rivers.', spawn:'mtank*2 0,5-4,8; inf*2 0,5-4,8'}]},

  hurtgen: {hard:true, name:'The Hürtgen Forest', place:'Vossenack and Schmidt', date:'2 November 1944', theme:'autumn', weather:'rain',
    p1:{nat:'us', co:'hodges', funds:5000}, p2:{nat:'ger', co:'model', funds:1000}, income:{2:.3},
    objective:{win:'hq', limit:23}, goal:'Fight through the forest, cross the Kall gorge and take Schmidt by {limit}.',
    brief:'A dark fir forest on steep ridges, laced with mines and the pillboxes and dragon\'s teeth of the West Wall. Tree bursts from German shells shower the foxholes with splinters. The 28th Division must take Vossenack, cross the Kall by a single cart track, and seize Schmidt. Tanks can barely move here.',
    build:() => { const b = MB(36, 24, 'T', 1111);
      b.blobs('.', 10, 0, 0, 35, 23, 1, 2).blobs('^', 10, 8, 0, 35, 23, 1, 2, ['T']);
      b.river([[20, 0], [20, 23]], .2).rect(19, 0, 19, 23, '^', ['T', '.']).rect(21, 0, 21, 23, '^', ['T', '.']);
      b.road([[0, 12], [13, 12], [13, 10]]).road([[13, 10], [20, 13], [26, 13], [30, 13]]).road([[30, 0], [30, 23]]);
      b.rect(15, 2, 15, 21, 'O', ['T', '.', '^']).set(15, 12, '=').set(15, 13, '.');
      b.scatter('m', .12, 8, 0, 35, 23, ['.', 'T']);
      b.town(12, 10, 2, 'c', 1, '.').town(24, 12, 2, 'c', 1, '.').town(30, 13, 4, 'k', 2, '.');
      b.put([[30, 13, 'q'], [17, 8, 'B'], [17, 15, 'B'], [25, 9, 'B'], [27, 16, 'B'], [33, 3, 'g'], [34, 20, 'g'], [1, 12, 'F'], [3, 4, 'C'], [3, 20, 'C']]);
      return b.rows(); },
    units:{1:'inf*6 0,6-8,18; eng*2 2,10-6,14; tank*3 2,10-6,14; at*2 1,8-6,16; art*3 0,3-2,20; mortar*2 3,6-7,18',
      2:'nest 17,8; nest 17,15; nest 25,9; nest 27,16; inf*5 12,3-34,20; mortar*2 22,4-32,20; art*2 31,6-34,18; at*2 22,10-28,16; tank 28,10-33,16'}},

  bastogne: {name:'Bastogne', place:'The Ardennes, Belgium', date:'20 December 1944', theme:'winter', weather:'snow',
    p1:{nat:'us', co:'mcauliffe', funds:0}, p2:{nat:'ger', co:'model', funds:3000}, income:{2:.8},
    objective:{win:'survive', days:8, hold:6}, goal:'Hold Bastogne and all five of its outposts until {survive}. Patton\'s Third Army is on its way.',
    brief:'The Germans attacked through the Ardennes in fog and snow. Seven roads meet at Bastogne, and the 101st Airborne got there first. Now the town is surrounded, short of ammunition and winter clothing, with no air support while the clouds stay low. The German commander has sent a demand to surrender. General McAuliffe\'s reply: "NUTS!"',
    build:() => { const b = MB(36, 26, '.', 1212);
      b.blobs('T', 22, 0, 0, 35, 25, 1, 2).blobs('^', 4, 0, 0, 35, 25, 1, 1, ['.']);
      for (const [x, y] of [[0, 4], [0, 20], [10, 0], [28, 0], [35, 8], [35, 22], [18, 25]]) b.road([[18, 13], [x, y]]);
      b.rect(15, 11, 21, 15, '.').put([[18, 13, 'Q'], [16, 12, 'C'], [20, 12, 'C'], [16, 14, 'C'], [20, 14, 'C'], [18, 11, 'C']]);
      b.put([[12, 2, 'k'], [16, 5, 'k'], [26, 15, 'k'], [8, 15, 'k'], [6, 6, 'k'], [4, 12, 'k'], [2, 2, 'g'], [33, 2, 'g'], [2, 24, 'g']]);
      return b.rows(); },
    units:{1:'inf*6 14,10-22,16; at*3 14,10-22,16; art*2 17,12-19,14; mtank*2 15,11-21,15; tank 19,14; eng 17,15; mortar*2 15,10-21,16',
      2:'tank*3 4,2-32,6; mtank*2 26,4-33,10; inf*8 2,2-34,24; at*2 4,8-30,20; art*2 2,10-33,14; rkt*2 4,3-32,22; recon 30,18'},
    events:[{day:2, team:2, say:'Panzer Lehr and the 26th Volksgrenadiers close in on the perimeter from the east.', spawn:'mtank*2 24,10-27,16; inf*3 23,9-27,17'},
      {day:3, team:2, say:'The Führer Begleit Brigade joins the assault.', spawn:'mtank*2 33,20-35,25; inf*2 30,20-35,25'},
      {day:4, team:1, say:'23 December. The skies clear. C-47s drop supplies and P-47s return to the sky.', funds:3000, heal:1, spawn:'bmr 18,13'},
      {day:5, team:2, say:'Christmas Day: the 15th Panzergrenadier Division attacks out of the dark from the north-west, its tanks whitewashed for the snow.', spawn:'mtank*2 8,4-12,8; tank 10,6; inf*3 7,5-13,10'},
      {day:7, team:1, say:'26 December: Patton\'s 4th Armored Division breaks through from the south!', spawn:'tank*3 16,23-20,25; mtank 18,24; inf*2 15,22-21,25; recon 18,25'}]},

  remagen: {name:'The Bridge at Remagen', place:'Ludendorff Bridge, Rhine', date:'7 March 1945', theme:'spring', weather:'overcast',
    p1:{nat:'us', co:'hodges', funds:5000}, p2:{nat:'ger', co:'model', funds:0}, income:{2:.25},
    objective:{win:'hq', limit:14}, goal:'Cross the last intact bridge over the Rhine and take Erpel by {limit}.',
    brief:'Every bridge over the Rhine has been blown except one. Lead elements of the 9th Armored Division, with new M26 Pershings, reach Remagen and find the Ludendorff railway bridge still standing. German engineers have wired it for demolition, but the charge only partly fires. Sergeant Alexander Drabik is about to become the first enemy soldier across the Rhine since Napoleon.',
    build:() => { const b = MB(34, 22, '.', 1313);
      b.blobs('T', 10, 0, 0, 33, 21, 1, 2).blobs('^', 8, 22, 0, 33, 10, 1, 2);
      b.river([[20, 0], [20, 21]], 0).river([[21, 0], [21, 21]], 0);
      b.road([[0, 11], [33, 11]]).road([[17, 0], [17, 21]]).road([[24, 0], [24, 21]]);
      b.town(16, 11, 5, 'c', 2, '.').town(23, 11, 3, 'k', 1, '.');
      b.put([[23, 11, 'q'], [22, 10, 'B'], [22, 12, 'B'], [31, 2, 'k'], [2, 18, 'F'], [4, 20, 'A'], [3, 3, 'C']]);
      return b.rows(); },
    units:{1:'tank*3 4,9-12,13; htank*2 6,10-10,12; inf*5 6,8-14,14; eng*2 8,10-12,12; at 9,9; art*2 2,9-4,13; apc 5,11 +inf+inf; recon 12,11; bmr 4,20',
      2:'nest 22,10; nest 22,12; inf*3 22,8-26,15; at*2 22,8-26,15; aa 25,4-29,8; art 27,3; inf*3 14,8-19,14 6; tank 30,11; mortar 26,9'}},

  prokhorovka: {name:'Prokhorovka', place:'Kursk salient', date:'12 July 1943', theme:'steppe', weather:'clear',
    p1:{nat:'su', co:'konev', funds:10000}, p2:{nat:'ger', co:'manstein', funds:0}, income:{2:.2},
    objective:{win:'hq'}, goal:'Meet the panzers head on, close the range so the Tigers lose their advantage, and take Hill 252.2.',
    brief:'One of the largest tank battles of the war. Rotmistrov\'s 5th Guards Tank Army charges across the wheat at the panzers of Army Group South. The T-34s must close fast: at range the Tigers\' 88s outshoot everything. The Psel river guards your right flank and a railway embankment cuts across the field.',
    build:() => { const b = MB(40, 24, ',', 1414);
      b.blobs('.', 16, 0, 0, 39, 23, 1, 3).blobs('T', 6, 0, 0, 39, 23, 1, 1).blobs('^', 4, 20, 8, 32, 16, 1, 2);
      b.river([[0, 2], [39, 3]], .2);
      b.road([[0, 20], [39, 4]]).road([[0, 12], [39, 12]]).road([[10, 3], [10, 23]]);
      b.rect(24, 12, 27, 14, '^').town(22, 9, 3, 'k', 1, '.').scatter('m', .15, 14, 4, 18, 20, [',', '.']);
      b.put([[35, 11, 'q'], [36, 2, 'g'], [36, 20, 'g'], [37, 6, 'e'], [3, 20, 'F'], [3, 4, 'F'], [2, 22, 'A'], [6, 6, 'C'], [14, 18, 'c'], [30, 18, 'k']]);
      return b.rows(); },
    units:{1:'tank*11 4,12-16,22; recon*2 6,10-14,14; inf*8 2,8-14,20; at*2 8,8-14,16; art*3 1,10-4,20; rkt*3 2,12-5,19; aa 5,15; bmr*2 2,21-4,22; eng 6,14',
      2:'htank 22,10-30,14; tank*4 20,6-34,16; inf*4 20,6-34,18; at*2 20,8-28,16; art*2 30,6-36,16; rkt 32,12; aa 33,10; bmr 37,6'}},

  bagration: {name:'Operation Bagration', place:'Bobruisk, Belorussia', date:'24 June 1944', theme:'normandy', weather:'clear',
    p1:{nat:'su', co:'rokossovsky', funds:6000}, p2:{nat:'ger', co:'model', funds:2000}, income:{2:.5},
    objective:{win:'hq'}, goal:'Come through the "impassable" marshes, break the line and take Bobruisk on the Berezina.',
    brief:'Three years almost to the day after Barbarossa, four Soviet fronts fall on Army Group Centre. Rokossovsky insists on two main blows, one of them straight through the Pripyat marshes, where sappers lay corduroy roads of logs. The Germans think nothing can come that way.',
    build:() => { const b = MB(40, 26, '.', 1515);
      b.blobs('T', 18, 0, 0, 39, 25, 1, 3).blobs('v', 16, 0, 14, 26, 25, 1, 3).blobs('v', 8, 0, 0, 26, 12, 1, 2);
      b.river([[28, 0], [27, 12], [29, 25]], .2);
      b.road([[0, 6], [39, 6]]).road([[0, 18], [12, 18], [20, 12], [39, 12]]).road([[32, 0], [32, 25]]);
      b.rect(12, 2, 14, 23, 'z', ['.', 'T']).rect(11, 2, 11, 23, 'w', ['.', 'T']).scatter('m', .25, 9, 2, 10, 23, ['.', 'T']);
      b.put([[13, 5, 'B'], [13, 12, 'B'], [13, 19, 'B']]);
      b.town(32, 12, 5, 'k', 2, 'x');
      b.put([[32, 11, 'q'], [36, 4, 'g'], [36, 22, 'g'], [2, 12, 'F'], [2, 20, 'A'], [5, 3, 'C'], [20, 8, 'c'], [22, 20, 'c']]);
      return b.rows(); },
    units:{1:'tank*6 2,4-8,20; mtank*2 2,4-8,20; htank*2 2,4-8,20; inf*8 2,2-9,24; eng*3 4,8-9,20; at*2 3,6-8,18; art*3 0,4-3,20; rkt*2 0,8-3,16; bmr*2 2,20-4,22; ftr 3,21',
      2:'nest 13,5; nest 13,12; nest 13,19; inf*8 12,2-14,23; at*3 15,4-20,20; tank*2 18,4-26,20; mtank 22,10; art*2 18,4-24,20; mortar*2 15,4-18,20; inf*3 30,10-35,15'}},

  vistula: {name:'Vistula–Oder', place:'Magnuszew bridgehead, Poland', date:'14 January 1945', theme:'winter', weather:'snow',
    p1:{nat:'su', co:'zhukov', funds:8000}, p2:{nat:'ger', co:'guderian', funds:1000}, income:{2:.3},
    objective:{win:'hq', limit:16}, goal:'Break out of the bridgehead and drive west to Radom by {limit}, before the panzer reserve can react.',
    brief:'The 1st Belorussian Front has packed 400 guns per kilometre into the Magnuszew bridgehead on the west bank of the Vistula. Guderian, now Chief of the General Staff, has begged for reinforcements for this front and been refused. The barrage opens at 08:30.',
    build:() => { const b = MB(40, 24, '.', 1616);
      b.blobs('T', 16, 0, 0, 39, 23, 1, 2).blobs(',', 6, 10, 0, 39, 23, 1, 2);
      b.river([[3, 0], [4, 23]], .1);
      b.road([[0, 12], [39, 12]]).road([[8, 0], [8, 23]]).road([[20, 0], [20, 23]]).road([[30, 2], [36, 12], [30, 22]]);
      b.rect(13, 3, 14, 21, 'z', ['.', 'T', ',']).rect(12, 3, 12, 21, 'w', ['.', 'T', ',']).put([[14, 6, 'B'], [14, 12, 'B'], [14, 18, 'B']]);
      b.town(36, 12, 5, 'k', 2, '.').town(22, 5, 2, 'k', 1, '.').town(22, 19, 2, 'k', 1, '.');
      b.put([[36, 12, 'q'], [38, 3, 'g'], [38, 21, 'g'], [6, 4, 'F'], [6, 20, 'A'], [7, 12, 'C']]);
      return b.rows(); },
    units:{1:'tank*8 5,3-11,21; mtank*4 5,3-11,21; htank*2 6,8-10,16; inf*8 5,2-11,22; art*4 5,4-7,20; rkt*3 5,6-7,18; eng*2 9,8-11,16; at*2 9,4-11,20; bmr*2 6,20-8,21; ftr 7,20',
      2:'nest 14,6; nest 14,12; nest 14,18; inf*8 13,3-14,21; at*3 15,4-20,20; tank*3 22,4-30,20; mtank*2 24,8-32,16; htank 30,12; art*2 24,4-32,20; rkt*2 26,6-32,18; aa 34,12'}},

  seelow: {name:'Seelow Heights', place:'The Oder front', date:'16 April 1945', theme:'spring', weather:'smoke',
    p1:{nat:'su', co:'zhukov', funds:8000}, p2:{nat:'ger', co:'heinrici', funds:1000}, income:{2:.3},
    objective:{win:'hq', limit:20}, goal:'Cross the waterlogged Oderbruch, storm the escarpment and take Seelow, the gateway to Berlin, by {limit}.',
    brief:'At 03:00 nine thousand guns open fire, and 143 searchlights are switched on to blind the defenders. Instead they light up the attackers in the smoke and mud of the Oderbruch. Heinrici has pulled his men back to the second line on the heights, so the barrage falls on empty trenches. Zhukov, furious, throws in his tank armies early.',
    build:() => { const b = MB(40, 24, '.', 1717);
      b.blobs('v', 16, 6, 0, 21, 23, 1, 2).blobs('T', 8, 26, 0, 39, 23, 1, 2);
      b.river([[4, 0], [5, 23]], .1).river([[14, 0], [15, 23]], .2);
      b.rect(22, 0, 26, 23, '^', ['.', 'v', 'T']).rect(23, 1, 23, 22, 'z').rect(21, 0, 21, 23, 'w', ['.', 'v']).scatter('m', .14, 17, 0, 20, 23, ['.', 'v']);
      b.put([[24, 4, 'B'], [24, 9, 'B'], [24, 14, 'B'], [24, 19, 'B'], [25, 11, 'B']]);
      b.road([[0, 12], [39, 12]]).road([[30, 0], [30, 23]]);
      b.town(30, 12, 5, 'k', 2, '.');
      b.put([[31, 12, 'q'], [37, 3, 'g'], [37, 20, 'g'], [7, 3, 'F'], [7, 20, 'A'], [9, 12, 'C']]);
      return b.rows(); },
    units:{1:'tank*6 6,4-12,20; mtank*4 6,4-12,20; htank*3 6,8-11,16; inf*10 6,2-13,22; eng*3 8,6-13,18; art*5 6,4-9,20; rkt*4 6,6-9,18; bmr*2 7,20-9,21; ftr 8,21; at*2 10,4-12,20',
      2:'nest 24,4; nest 24,9; nest 24,14; nest 24,19; pak 25,11; inf*8 22,1-26,22; at*4 22,3-27,21; art*3 28,4-33,20; rkt*2 30,6-34,18; htank 28,12; mtank*2 27,6-32,18; tank*2 27,4-33,20; mortar*3 25,4-28,20'}},

  berlin: {name:'The Reichstag', place:'Berlin', date:'30 April 1945', theme:'city', weather:'smoke',
    p1:{nat:'su', co:'chuikov', funds:10000}, p2:{nat:'ger', co:'heinrici', funds:2000}, income:{2:.5},
    objective:{win:'hq'}, goal:'Cross the Moltke Bridge, take the Interior Ministry, and raise the banner over the Reichstag.',
    brief:'Soviet troops are fighting through the government quarter. Across the Spree stands the Reichstag, defended by Volkssturm, Hitler Youth with Panzerfausts, and the remnants of the panzer divisions. The Zoo flak tower still commands the Tiergarten. Hitler is in his bunker under the Chancellery. Finish it.',
    build:() => { const b = MB(40, 26, 'x', 1818);
      b.blobs('U', 26, 0, 0, 39, 25, 1, 2);
      b.river([[0, 8], [39, 9]], .1);
      b.rect(6, 1, 16, 7, 'T').rect(17, 4, 23, 7, '.');
      for (const x of [4, 12, 20, 28, 35]) b.road([[x, 0], [x, 25]]);
      for (const y of [3, 14, 20]) b.road([[0, y], [39, y]]);
      b.put([[20, 4, 'q'], [8, 12, 'B'], [24, 6, 'B'], [17, 6, 'B'], [26, 11, 'k'], [14, 11, 'k'], [31, 4, 'k'], [6, 17, 'k'], [37, 0, 'g'], [16, 23, 'F'], [26, 24, 'A'], [10, 22, 'C'], [32, 20, 'C']]);
      return b.rows(); },
    units:{1:'tank*5 6,18-34,23; mtank*4 8,19-32,24; htank*3 12,20-28,24; inf*10 4,15-36,21; eng*3 10,15-30,18; at*2 14,16-26,18; art*3 8,22-30,25; rkt*3 10,23-30,25; bmr*2 24,24-28,25; ftr 25,23',
      2:'pak 8,12; nest 24,6; nest 17,6; inf*10 2,2-38,13; at*4 6,6-34,12; htank*2 16,2-26,6; tank*2 6,2-34,6; aa*2 10,4-30,8; art*2 18,0-24,2; rkt 28,1; mortar*2 12,2-30,7'}},

  kharkov: {name:'Manstein\'s Backhand Blow', place:'Kharkov, Ukraine', date:'19 February 1943', theme:'winter', weather:'snow',
    p1:{nat:'ger', co:'manstein', funds:5000}, p2:{nat:'su', co:'konev', funds:2000}, income:{2:.5},
    objective:{win:'hq'}, goal:'Let the Soviet spearheads over-reach, then cut them off and retake Kharkov.',
    brief:'After Stalingrad, the Red Army has driven Army Group South back towards the Dnieper. Its tank corps are deep in the snow, out of fuel and far from their supply lines. Manstein has waited for exactly this. Now he strikes the over-extended flanks. Many Soviet units start weakened.',
    build:() => { const b = MB(40, 24, '.', 1919);
      b.blobs('T', 14, 0, 0, 39, 23, 1, 2).blobs('^', 5, 0, 0, 39, 23, 1, 1, ['.']);
      b.river([[24, 0], [26, 23]], .2);
      b.road([[0, 12], [39, 12]]).road([[10, 0], [10, 23]]).road([[33, 0], [33, 23]]);
      b.town(34, 12, 6, 'k', 2, 'x').town(18, 6, 2, 'c', 1, '.').town(18, 18, 2, 'c', 1, '.');
      b.put([[35, 12, 'q'], [37, 3, 'g'], [37, 21, 'g'], [2, 4, 'F'], [2, 20, 'A'], [3, 12, 'Q'], [12, 3, 'C'], [12, 21, 'C']]);
      return b.rows(); },
    units:{1:'tank*5 2,6-8,18; htank*2 3,10-7,14; inf*6 1,3-9,21; art*3 0,6-3,18; rkt*2 0,8-3,16; bmr*2 2,19-4,21; aa 5,12; recon*2 6,4-8,20',
      2:'tank*5 12,4-22,20 6; inf*8 12,2-24,22 7; at*3 14,6-22,18; art*2 28,8-36,16; rkt 30,12; inf*3 32,10-37,15'}},

  villersAxis: {name:'The Ambush at Villers-Bocage', place:'Point 213', date:'13 June 1944, 08:00', theme:'normandy', weather:'clear',
    p1:{nat:'ger', co:'rommel', funds:3000}, p2:{nat:'uk', co:'monty', funds:1000}, income:{2:.3},
    objective:{win:'hq', limit:17}, goal:'Fall on the British column strung out along the road and take its tactical headquarters at the west of the town by {limit}.',
    brief:'A British armoured column has halted nose to tail on the road out of Villers-Bocage, crews out of their tanks brewing tea. A handful of Tigers of heavy Panzer battalion 101 are on Point 213, a few hundred metres away. One Tiger alone will drive down the column and through the town. Then the British will regroup.',
    build:() => { const b = MB(36, 22, 'h', 2020);
      b.blobs('.', 16, 0, 0, 35, 21, 1, 2).blobs('T', 6, 22, 0, 35, 21, 1, 2);
      b.rect(26, 4, 32, 9, '^', ['h', '.', 'T']);
      b.road([[0, 11], [35, 11]]).road([[22, 11], [29, 11], [29, 7]]).road([[18, 0], [18, 21]]);
      b.rect(14, 8, 22, 14, '.').town(18, 11, 8, 'c', 3, 'x');
      b.put([[29, 7, 'Q'], [1, 11, 'q'], [35, 11, 'F'], [0, 4, 'g'], [33, 3, 'C'], [3, 16, 'k']]);
      return b.rows(); },
    units:{1:'htank*4 26,5-31,9; tank*4 30,9-34,13; inf*5 26,8-33,13; apc*3 27,7-33,12 +inf+inf; at 28,9; art*2 31,3-33,5; mortar 30,6',
      2:'tank*4 20,11-28,11; mtank 23,10; apc*2 24,10-27,12 +inf+inf; recon 27,11; inf*4 14,8-22,14; at*2 10,9-16,13; art*2 2,9-6,13'},
    events:[{day:3, team:2, say:'The rest of 22nd Armoured Brigade comes up from the west.', spawn:'tank*2 0,9-3,13; inf*2 0,8-3,14'}]},

  wacht: {name:'Wacht am Rhein', place:'The Schnee Eifel, Ardennes', date:'16 December 1944', theme:'winter', weather:'fog',
    p1:{nat:'ger', co:'model', funds:6000}, p2:{nat:'us', co:'bradley', funds:1000}, income:{2:.35},
    objective:{win:'hq', limit:16}, goal:'Break through the thin American line in the fog and take the road junction at St Vith by {limit}.',
    brief:'Hitler\'s last gamble in the West: three armies attack through the Ardennes at dawn, under low cloud that grounds the Allied air forces. St Vith is a vital road junction held by the green 106th Division and the 7th Armored. The weather will not last. When it breaks, the fighter-bombers will come.',
    build:() => { const b = MB(40, 26, '.', 2121);
      b.blobs('T', 26, 0, 0, 39, 25, 1, 2).blobs('^', 6, 0, 0, 39, 25, 1, 2, ['.', 'T']);
      b.road([[39, 12], [8, 12]]).road([[39, 4], [20, 8], [8, 12]]).road([[39, 22], [20, 18], [8, 12]]).road([[8, 12], [0, 6]]).road([[8, 12], [0, 20]]);
      b.town(8, 12, 5, 'k', 2, '.').town(22, 7, 2, 'k', 1, '.').town(22, 18, 2, 'k', 1, '.');
      b.put([[8, 12, 'q'], [2, 2, 'e'], [2, 24, 'g'], [38, 4, 'F'], [38, 21, 'F'], [37, 12, 'Q'], [30, 8, 'c'], [30, 17, 'c']]);
      return b.rows(); },
    units:{1:'tank*4 32,2-38,22; mtank*3 33,4-38,20; htank*2 34,10-38,14; inf*8 30,2-36,24; art*3 36,4-39,20; rkt*2 36,8-39,16; at*2 32,6-36,18; recon*2 30,10-34,14',
      2:'inf*6 18,3-26,22; at*2 18,6-24,18; tank*3 6,8-12,16; mtank*2 8,10-14,14; art*2 2,8-6,16; inf*3 6,10-10,14; recon 16,12'},
    events:[{day:12, team:2, say:'A break in the clouds over the Ardennes. Allied fighter-bombers appear.', spawn:'bmr*2 2,2-4,4; ftr 3,3'}]},
};

const CAMPAIGNS = [
  {id:'west', name:'Western Front', sub:'Overlord to the Rhine · June 1944 – March 1945', side:'allies',
    missions:['pointe', 'omaha', 'pegasus', 'carentan', 'villers', 'caen', 'cobra', 'falaise', 'paris', 'arnhem', 'hurtgen', 'bastogne', 'remagen']},
  {id:'east', name:'Eastern Front', sub:'Kursk to the Reichstag · July 1943 – April 1945', side:'allies',
    missions:['prokhorovka', 'bagration', 'vistula', 'seelow', 'berlin']},
  {id:'axis', name:'The Other Side of the Hill', sub:'Three German operations', side:'axis',
    missions:['kharkov', 'villersAxis', 'wacht']},
];
/* the mission clock: historical start time and minutes per turn (one turn = both sides move once) */
const CLOCKS = {
  pointe:['1944-06-06T07:10', 60], omaha:['1944-06-06T06:30', 60], pegasus:['1944-06-06T00:16', 240], carentan:['1944-06-10T01:45', 360],
  villers:['1944-06-13T08:00', 60], caen:['1944-07-08T04:20', 120], cobra:['1944-07-25T11:00', 180], falaise:['1944-08-19T06:00', 180],
  paris:['1944-08-24T19:00', 60], arnhem:['1944-09-17T14:35', 360], hurtgen:['1944-11-02T09:00', 360], bastogne:['1944-12-20T06:00', 1440],
  remagen:['1945-03-07T13:00', 60], prokhorovka:['1943-07-12T08:30', 60], bagration:['1944-06-24T04:00', 360], vistula:['1945-01-14T08:30', 360],
  seelow:['1945-04-16T03:00', 180], berlin:['1945-04-29T06:00', 120], kharkov:['1943-02-19T06:00', 720], villersAxis:['1944-06-13T08:00', 30],
  wacht:['1944-12-16T05:30', 720],
};
for (const [id, m] of Object.entries(MISSIONS)) { m.id = id; const c = CLOCKS[id]; m.clock = {start:c[0], step:c[1]}; m.fog = ['wacht', 'hurtgen'].includes(id); }
const missionMap = m => m._map || (m._map = m.build());

/* ---------- skirmish map generator: point-symmetric, so neither side is favoured ---------- */
const THEMES = {
  normandy:{n:'Normandy bocage', base:'h', w:{'.':6, 'T':2, '^':1, ',':2}},
  winter:  {n:'Ardennes winter', base:'.', w:{'T':6, '^':2}},
  steppe:  {n:'Russian steppe',  base:',', w:{'.':5, 'T':1, '^':1}},
  city:    {n:'Ruined city',     base:'x', w:{'U':6, '.':1}},
  autumn:  {n:'Hürtgen autumn',  base:'T', w:{'.':5, '^':3}},
  holland: {n:'Dutch polder',    base:'.', w:{'h':3, 'v':3, 'T':1}},
};
function rngSeed(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function genMap(theme, W, H, seed) {
  if (theme === 'islands') return genIslands(W, H, seed);
  const T = THEMES[theme], b = MB(W, H, T.base, seed);
  for (const [c, n] of Object.entries(T.w)) b.blobs(c, Math.round(n * W * H / 120), 0, 0, W - 1, H - 1, 1, 2);
  if (b.R() < .6) b.river([[W >> 1, 0], [W >> 1, H - 1]], .3);
  b.road([[0, H >> 1], [W - 1, H >> 1]]).road([[W >> 2, 0], [W >> 2, H - 1]]).road([[(W * 3) >> 2, 0], [(W * 3) >> 2, H - 1]]);
  const ry = H >> 1;
  b.put([[1, ry, 'Q'], [2, ry - 2, 'F'], [2, ry + 2, 'F'], [1, 1, 'A']]);
  for (let i = 0; i < Math.round(W * H / 40); i++) { const x = 1 + Math.floor(b.R() * (W / 2 - 2)), y = Math.floor(b.R() * H); if (!'QFAcbr'.includes(b.get(x, y))) b.set(x, y, 'c'); }   // never over the HQ, a depot or a river
  const g = b.g, swap = {Q:'q', F:'g', A:'e', C:'k'};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < W / 2) { const c = g[y][x]; g[H - 1 - y][W - 1 - x] = swap[c] || c; }
  if (W % 2) for (let y = 0; y < H; y++) { const c = g[y][(W - 1) / 2]; if ('QFAqgek'.includes(c)) g[y][(W - 1) / 2] = '.'; }
  return b.rows();
}
/* island-hopping: a home island each, contested islands between, all point-symmetric */
function genIslands(W, H, seed) {
  const b = MB(W, H, '~', seed), ry = H >> 1, R = b.R;
  const island = (cx, cy, rx, ry2) => { for (let y = cy - ry2 - 1; y <= cy + ry2 + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) { const d = ((x - cx) / (rx + .5)) ** 2 + ((y - cy) / (ry2 + .5)) ** 2;
    if (d <= 1) b.set(x, y, R() < .45 ? 'L' : R() < .3 ? 'J' : '.'); else if (d <= 1.5 && b.get(x, y) === '~') b.set(x, y, R() < .6 ? 's' : 'R'); } };
  island(4, ry, 3, Math.min(5, ry - 2));                                     // home island
  for (let i = 0; i < 3; i++) island(9 + Math.floor(R() * (W / 2 - 12)), 3 + Math.floor(R() * (H - 6)), 1 + Math.floor(R() * 3), 1 + Math.floor(R() * 2));
  island(W >> 1, ry, 2, 2);                                                  // the contested centre
  b.put([[2, ry, 'Q'], [4, ry - 2, 'F'], [4, ry + 2, 'A'], [7, ry, 'P']]);
  for (let i = 0; i < 4; i++) { const x = 8 + Math.floor(R() * (W / 2 - 9)), y = 1 + Math.floor(R() * (H - 2)); if ('.LJ'.includes(b.get(x, y))) b.set(x, y, 'c'); }
  b.set(W >> 1, ry, 'c'); b.set((W >> 1) - 1, ry, 'p');
  const g = b.g, swap = {Q:'q', F:'g', A:'e', P:'o', C:'k'};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < W / 2) { const c = g[y][x]; g[H - 1 - y][W - 1 - x] = swap[c] || c; }
  return b.rows();
}
function skirmishUnits(rows, team) {
  if (rows.join('').split('~').length > rows.length * rows[0].length * .4) {   // mostly water: a naval and amphibious force
    const H = rows.length, hq = team === 1 ? 'Q' : 'q'; let hx = 0, hy = 0; rows.forEach((r, y) => { const x = r.indexOf(hq); if (x >= 0) { hx = x; hy = y; } });
    const d = team === 1 ? 1 : -1, land = `${Math.min(hx, hx + d * 4)},${Math.max(0, hy - 4)}-${Math.max(hx, hx + d * 4)},${Math.min(H - 1, hy + 4)}`, sea = `${Math.min(hx + d * 6, hx + d * 10)},${Math.max(0, hy - 6)}-${Math.max(hx + d * 6, hx + d * 10)},${Math.min(H - 1, hy + 6)}`;
    return `inf*3 ${land}; at ${land}; aa ${land}; art ${land}; lc*2 ${sea} +inf+tank; dd ${sea}; esc ${sea}; ftr ${land}`;
  }
  const H = rows.length, hq = team === 1 ? 'Q' : 'q';
  let hx = 0, hy = 0; rows.forEach((r, y) => { const x = r.indexOf(hq); if (x >= 0) { hx = x; hy = y; } });
  const d = team === 1 ? 1 : -1, xa = hx + d * 2, xb = hx + d * 7, y0 = Math.max(0, hy - 5), y1 = Math.min(H - 1, hy + 5);
  const r = `${Math.min(xa, xb)},${y0}-${Math.max(xa, xb)},${y1}`;
  return `inf*4 ${r}; at ${r}; tank*2 ${r}; recon ${r}; art ${r}; mortar ${r}`;
}
