/* ============================== INTEL =====================================
   The Armoury's historical notes, mission ranks and first-time tips. */
const UNIT_INFO = {
  // infantry and teams, by army
  'ger:inf':'A Grenadier squad was built around its MG 42, the "Hitler\'s buzzsaw" that fired 1,200 rounds a minute; the riflemen carried Mauser Kar98k bolt-actions.',
  'us:inf':'The US rifle squad carried the semi-automatic M1 Garand, the first self-loading rifle adopted as an army\'s standard service rifle, backed by a Browning Automatic Rifle.',
  'uk:inf':'British sections were built around the Bren light machine gun, accurate and reliable, with riflemen carrying the Lee-Enfield No. 4.',
  'su:inf':'Soviet strelki fought in mass, many armed with the PPSh-41 submachine gun and its 71-round drum, ideal for street fighting.',
  'fr:inf':'The Régiment de Marche du Tchad was raised in French Africa and fought from Normandy to Berchtesgaden in American equipment.',
  'ger:at':'The Panzerschreck ("tank terror") fired an 88 mm rocket; its blast shield was added after crews were burned by the backblast.',
  'us:at':'The M1A1 Bazooka gave American infantry their first real answer to tanks. Its name came from a comedian\'s home-made trombone.',
  'uk:at':'The PIAT used a huge spring instead of a rocket, so it had no backblast and could be fired from inside buildings.',
  'su:at':'The PTRD-41 was a 2-metre single-shot anti-tank rifle. By 1944 it could no longer stop a Panther from the front, but it still pierced flanks and trucks.',
  'fr:at':'Free French tank-hunter teams used the American bazooka.',
  'ger:eng':'Pioniere cleared obstacles and assaulted bunkers with demolition charges and the Flammenwerfer 41.',
  'us:eng':'At Omaha the Special Engineer Task Force had to blow sixteen gaps through the obstacles under fire; they cleared six. Bangalore torpedoes cut the wire.',
  'uk:eng':'Royal Engineers breached minefields and wire with Bangalore torpedoes and mine detectors, often ahead of the infantry.',
  'su:eng':'Assault sapper brigades wore steel breastplates and led the storm of fortified cities with satchel charges.',
  'fr:eng':'Engineers of the 2e DB cleared the barricades on the way into Paris.',
  'ger:mortar':'The 8 cm Granatwerfer 34 was feared for its accuracy; mortars caused most infantry casualties in Normandy.',
  'us:mortar':'The M1 81 mm mortar gave a battalion its own artillery, firing over hedgerows the guns could not see past.',
  'uk:mortar':'The ML 3-inch mortar was the battalion\'s heavy weapon, carried on Universal Carriers.',
  'su:mortar':'The Red Army fielded mortars in huge numbers; the 82-PM-41 could be towed on wheels.',
  'fr:mortar':'The 2e DB\'s mortar sections used American 81 mm tubes.',
  // vehicles and guns, by sprite recipe
  puma:'The Sd.Kfz. 234/2 Puma was an eight-wheeled armoured car with a 5 cm gun, able to drive as fast backwards as forwards.',
  ht251:'The Sd.Kfz. 251 "Hanomag" half-track carried a Panzergrenadier squad into battle alongside the tanks.',
  pz4:'The Panzer IV was the workhorse of the Panzerwaffe; by 1944 the long 7.5 cm gun and side skirts made the Ausf. H a match for the Sherman.',
  panther:'The Panther combined sloped armour and the very long 7.5 cm KwK 42. It outclassed most Allied tanks but was mechanically fragile.',
  tiger:'The Tiger I\'s 88 mm gun and 100 mm front armour made it the most feared tank in Normandy. Only about 1,350 were built.',
  lefh:'The 10.5 cm leFH 18 was the standard German divisional howitzer.',
  nebel:'The Nebelwerfer\'s six rockets screamed in flight; Allied soldiers called it the "Moaning Minnie".',
  wirbel:'The Wirbelwind put a quad 2 cm Flakvierling in an open turret on a Panzer IV hull.',
  bf109:'The Messerschmitt Bf 109 served from Spain to the end of the war; the G-6 carried a 30 mm cannon through the propeller hub.',
  ju87:'The Ju 87 Stuka\'s siren, the "Jericho trumpet", was a terror weapon in 1940. By 1944 it survived only where the Luftwaffe still had air cover.',
  mfp:'The Marinefährprahm was a German landing barge, armed and robust, used along every coast of occupied Europe.',
  z36:'The Narvik-class destroyers mounted 15 cm guns, as heavy as a light cruiser\'s.',
  nest:'Tobruk pits were small concrete rings with an MG 42 on a pivot. At Omaha they were sited to fire along the beach, not out to sea.',
  casemate:'WN-61 at Colleville and WN-72 at Vierville held 88 mm guns in casemates angled to enfilade the sand. The one at WN-61 was knocked out by a DD tank.',
  m8:'The M8 Greyhound armoured car was fast and quiet, the eyes of American cavalry reconnaissance.',
  m3ht:'The M3 half-track carried a rifle squad and an M2 .50 calibre machine gun.',
  sherman:'Over 49,000 Shermans were built. Reliable and easy to repair, but its 75 mm gun struggled against Panthers and Tigers.',
  shermandd:'Duplex Drive Shermans swam ashore on canvas screens. At Omaha most of those launched far out sank in the swell.',
  m36:'The M36 Jackson tank destroyer\'s 90 mm gun could kill a Panther; its open turret left the crew exposed.',
  pershing:'The M26 Pershing arrived in early 1945; one of the first crossed the Ludendorff Bridge at Remagen.',
  m2a1:'The M2A1 105 mm howitzer was the backbone of American divisional artillery; US time-on-target fire was feared by the Germans.',
  calliope:'The T34 Calliope mounted sixty 4.5-inch rocket tubes over a Sherman\'s turret.',
  m16:'The M16 carried four .50 calibre machine guns, the "meat chopper", deadly against aircraft and infantry.',
  p51:'The P-51 Mustang with its Rolls-Royce Merlin could escort bombers all the way to Berlin. Black and white invasion stripes marked Allied aircraft from D-Day.',
  p47:'The P-47 Thunderbolt was huge and rugged, the great fighter-bomber of the Normandy campaign.',
  lcvp:'The Higgins boat carried 36 men or a jeep; Eisenhower said Andrew Higgins was "the man who won the war for us".',
  fletcher:'American destroyers came close to Omaha Beach on D-Day, scraping the bottom, to fire point-blank into the strongpoints.',
  daimler:'The Daimler armoured car carried a 2-pounder gun, unusual firepower for a reconnaissance vehicle.',
  carrier:'The Universal Carrier, or Bren Carrier, was the most produced armoured vehicle of the war: about 113,000.',
  cromwell:'The Cromwell was the fastest tank in Normandy, reaching 40 mph, but under-gunned with its 75 mm.',
  firefly:'The Sherman Firefly squeezed the 17-pounder anti-tank gun into a Sherman turret: the one Allied tank in Normandy that could reliably kill a Tiger.',
  churchill:'The Churchill was slow but heavily armoured and could climb slopes no other tank could; its variants carried flamethrowers and bridges.',
  pdr25:'The QF 25-pounder sat on a circular firing platform so the crew could swing it all the way round. British artillery was the best-organised of the war.',
  mattress:'The Land Mattress rocket launcher fired thirty-two 3-inch rockets in a few seconds.',
  crusaderaa:'The Crusader AA mounted a 40 mm Bofors on an obsolete tank chassis.',
  spitfire:'The Spitfire Mk IX, with its two-stage Merlin, restored the RAF\'s edge over the Fw 190 in 1942.',
  typhoon:'Typhoons of 2nd Tactical Air Force hunted tanks with RP-3 rockets, flying from "cab rank" patrols over the battlefield.',
  lca:'The Landing Craft Assault was lower and better armoured than the Higgins boat, and carried British and Commonwealth troops onto Gold, Juno and Sword.',
  tribal:'The Tribal-class destroyers were large, powerfully armed and fought on every front.',
  ba64:'The BA-64 was a small four-wheeled armoured car based on the GAZ jeep.',
  zis5:'The ZiS-5 truck carried much of the Red Army\'s supply, alongside American Lend-Lease Studebakers.',
  t34:'The T-34 shocked the Germans in 1941 with sloped armour, wide tracks and a 76 mm gun, and was built in enormous numbers.',
  t3485:'The T-34-85 added a three-man turret and an 85 mm gun, the main Soviet tank from 1944.',
  is2:'The IS-2\'s 122 mm gun could knock out a Tiger or a Panther, though it fired only a few rounds a minute.',
  m30:'The M-30 122 mm howitzer served in the Red Army for decades after the war.',
  katyusha:'The BM-13 Katyusha fired sixteen rockets in seconds. The Germans called it "Stalin\'s organ".',
  k61:'The 61-K 37 mm gun was the Red Army\'s standard light anti-aircraft gun.',
  yak3:'The Yak-3 was one of the lightest and most agile fighters of the war.',
  il2:'The Il-2 Shturmovik was armoured like a tank around its engine and cockpit. Over 36,000 were built, the most of any military aircraft.',
  bka:'Project 1125 armoured river boats carried T-34 turrets and fought on the Volga, the Danube and the Spree.',
  gnevny:'Gnevny-class destroyers fought in the Baltic, the Black Sea and on the Arctic convoys.',
};
function unitInfo(nat, role) { const d = udef(nat, role); if (!d) return ''; return UNIT_INFO[nat + ':' + role] || UNIT_INFO[d.shape] || ''; }

/* ---------- mission rank, Advance Wars style ---------- */
function missionScore(m) {
  const o = G.objective, par = o.limit ? o.limit * .7 : o.days ? o.days + 1 : (m && m.par) || 14;
  const speed = o.win === 'survive' ? 100 : Math.round(clamp(100 * par / Math.max(par, G.day), 20, 100));
  const st = G.stats[1], power = Math.round(clamp(50 + (st.kills - st.lost) * 4, 0, 100));
  const alive = G.units.filter(u => u.team === 1).length, tech = Math.round(clamp(100 * alive / Math.max(1, alive + st.lost) * 1.25, 0, 100));
  const total = speed + power + tech, rank = total >= 270 ? 'S' : total >= 230 ? 'A' : total >= 180 ? 'B' : total >= 130 ? 'C' : 'D';
  return {speed, power, tech, total, rank};
}
const RANK_ORDER = 'DCBAS';

/* ---------- first-time tips ---------- */
const TIPS_SEEN = (() => { try { return new Set(JSON.parse(localStorage.getItem('if44tips') || '[]')); } catch (e) { return new Set(); } })();
function tip(id, html) {
  if (FAST || TIPS_SEEN.has(id) || !SET.tips || TIP_Q.some(q => q.id === id)) return;
  TIP_Q.push({id, html}); if ($('#tip').hidden) tipNext();      // notes queue up rather than replacing each other, and each stays until "Got it"
}
const TIP_Q = [];
function tipNext() {
  const el = $('#tip'), q = TIP_Q.shift(); if (!q) { el.hidden = true; return; }
  TIPS_SEEN.add(q.id); try { localStorage.setItem('if44tips', JSON.stringify([...TIPS_SEEN])); } catch (e) {}   // seen once it is actually shown
  el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
  el.innerHTML = `<b>Field note</b><span>${q.html}</span><button>Got it${TIP_Q.length ? ` (${TIP_Q.length} more)` : ''}</button>`; el.hidden = false;
  el.querySelector('button').onclick = tipNext;
}
function tipsReset() { TIPS_SEEN.clear(); try { localStorage.removeItem('if44tips'); } catch (e) {} }
