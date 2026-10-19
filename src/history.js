/* ============================== HISTORY ===================================
   The Archive's facts: vehicle and weapon specifications, what became of the
   generals, every battle's real set-up, forces, outcome and cost, what your
   victory or defeat means in the chain of operations, a glossary, and the
   war-room map of Europe. Figures are the commonly cited ones; where
   historians disagree, the text says "about". */
const SPECS = {
  // [crew, weight in tonnes, frontal armour mm, top speed km/h, number built]
  pz4:['5', '25', '80', '38', 'about 8,500 (all models)'], panther:['5', '44.8', '80 at 55°', '46', 'about 6,000'], tiger:['5', '54', '100', '38', '1,347'],
  sherman:['5', '30.3', '51 at 56°', '38', 'about 49,000 (all models)'], shermandd:['5', '32', '51 at 56°', '38 on land, 7 in water', 'about 2,000 converted'], firefly:['4', '34.8', '51 at 56°', '40', 'about 2,100'],
  m36:['5', '29', '108 (gun mantlet)', '48', '2,324'], pershing:['5', '41.9', '102', '40', '2,212'], cromwell:['5', '27.9', '76', '64', 'about 4,000'],
  churchill:['5', '40.7', '152 (Mk VII)', '20', '7,368'], t34:['4', '26.5', '45 at 60°', '53', 'about 35,000 (76 mm)'], t3485:['5', '32', '45 at 60°', '55', 'about 22,000 in the war'],
  is2:['4', '46', '120', '37', '3,854'], wirbel:['5', '22', '80', '38', '87'], crusaderaa:['3', '19.7', '40', '43', 'about 600'], calliope:['5', '34', '51 at 56°', '38', 'a few hundred launchers'],
  carrier:['3–4', '3.8', '10', '48', 'about 113,000'], puma:['4', '11.7', '30', '80', '101'], m8:['4', '7.8', '19', '90', '8,523'], daimler:['3', '7.6', '16', '80', '2,694'], ba64:['2', '2.4', '15', '80', '9,110'],
  ht251:['2 + 10', '9', '14.5', '52', 'about 15,250'], m3ht:['3 + 10', '9.3', '12.7', '72', 'about 41,000 (family)'], m16:['5', '8.9', '12.7', '72', '2,877'], zis5:['1 + cargo', '3.1', '—', '60', 'about 1,000,000 (ZiS-5 family)'],
  katyusha:['5–7', '6.2', '—', '60', 'about 6,800 BM-13'], k61:['8', '2.1', '—', 'towed', 'about 20,000'], lefh:['6', '1.98', 'shield', 'towed', 'about 11,800'], m2a1:['8', '2.26', 'shield', 'towed', '10,202'],
  pdr25:['6', '1.8', 'shield', 'towed', 'about 12,000'], m30:['8', '2.45', 'shield', 'towed', '19,266'], nebel:['3', '0.54', '—', 'towed', 'about 5,300'], mattress:['3', '1.1', '—', 'towed', 'about 1,000 rockets per battery barrage'],
  bf109:['1', '3.15', '—', '640', 'about 33,900 (all models)'], ju87:['2', '4.4', 'pilot armour', '410', 'about 6,500'], p51:['1', '4.6', '—', '703', 'about 15,500'], p47:['1', '6.0', '—', '697', '15,636'],
  spitfire:['1', '3.4', '—', '657', 'about 5,600 Mk IX'], typhoon:['1', '5.2', '—', '663', '3,317'], yak3:['1', '2.7', '—', '655', '4,848'], il2:['2', '6.2', '5–12 armoured tub', '414', '36,183'],
  lcvp:['3 + 36 troops', '8.2', '6 (ramp)', '17', '22,492'], lca:['4 + 36 troops', '9', '6–10', '13', 'about 1,900'], mfp:['up to 20', '220', 'light', '18', 'about 700'], bka:['10', '26', '7–14', '33', 'about 150'],
  fletcher:['329', '2,500', '—', '67', '175'], tribal:['190', '1,890', '—', '67', '27'], z36:['330', '3,600', '—', '68', '15 (Narvik class)'], gnevny:['197', '2,380', '—', '70', '29'],
  nest:['2–3', 'concrete', 'about 300 (Tobruk)', 'fixed', 'thousands along the Atlantic Wall'], casemate:['8–10', 'concrete', '2,000 (H677)', 'fixed', '88 mm PaK 43/41: about 2,100 guns'],
};
const SPEC_LABEL = ['Crew', 'Weight (t)', 'Front armour (mm)', 'Top speed (km/h)', 'Built'];

/* what became of the generals */
const CO_FATE = {
  rommel:'Badly wounded when Spitfires strafed his car on 17 July 1944. Implicated in the 20 July plot against Hitler, he was forced to take poison on 14 October 1944 and given a state funeral.',
  guderian:'Chief of the General Staff from July 1944 until Hitler dismissed him in March 1945. Held by the Americans until 1948, then wrote "Panzer Leader".',
  manstein:'Dismissed by Hitler in March 1944. Convicted of war crimes by a British court in 1949, released in 1953, later an adviser to the West German army.',
  model:'Encircled in the Ruhr Pocket in April 1945, he dissolved Army Group B and shot himself in a wood near Duisburg rather than surrender.',
  kluge:'Relieved of command on 17 August 1944 and suspected over the 20 July plot, he took cyanide on his way back to Germany.',
  heinrici:'Retreated west against orders to save his men from the Soviets, surrendered to the British, and lived until 1971.',
  choltitz:'Surrendered Paris intact to Leclerc on 25 August 1944. Held in Britain and the US until 1947. Wrote that he disobeyed the order to destroy the city.',
  monty:'Promoted Field Marshal on 1 September 1944. Accepted the German surrender at Lüneburg Heath on 4 May 1945. Later Deputy Supreme Commander of NATO.',
  horrocks:'Led XXX Corps to the end of the war, then became Black Rod in the House of Lords and a popular television historian.',
  patton:'His Third Army ended the war in Czechoslovakia and Austria. He died after a car accident near Mannheim in December 1945.',
  bradley:'Commanded 1.3 million men in 12th Army Group. Became the first Chairman of the Joint Chiefs of Staff and a five-star General of the Army.',
  ike:'Accepted Germany\'s unconditional surrender at Reims on 7 May 1945. President of the United States from 1953 to 1961.',
  mcauliffe:'Awarded the Distinguished Service Cross for Bastogne and later commanded US Army Europe. The square in Bastogne is named after him.',
  rudder:'Wounded twice at Pointe du Hoc, he went on to command the 109th Infantry in the Bulge, and later became president of Texas A&M University.',
  hodges:'His First Army met the Soviets at the Elbe at Torgau on 25 April 1945. He was preparing to lead it in the invasion of Japan when the war ended.',
  leclerc:'Kept his oath: his division raised the tricolour over Strasbourg in November 1944. Killed in an air crash in Algeria in 1947 and made a Marshal of France.',
  zhukov:'Accepted the German surrender in Berlin on 8 May 1945 and led the Victory Parade on a white horse. Stalin then sidelined him, but he returned as Defence Minister.',
  konev:'His tanks reached Prague in May 1945. He later commanded the Warsaw Pact forces.',
  chuikov:'Took the surrender of the Berlin garrison from General Weidling on 2 May 1945 in his own headquarters. Buried at Stalingrad, at his own request, on Mamayev Kurgan.',
  rokossovsky:'Bagration made him a Marshal. He led the Victory Parade with Zhukov, then served as Poland\'s Minister of Defence.',
};

/* every battle: the real set-up, the forces, the stakes and what really happened */
const HISTORY = {
  pointe:{forces:['225 men of the 2nd Ranger Battalion (D, E and F Companies)', 'About 200 men of the 716th Division and 2nd Battalion, 726th Grenadier Regiment'],
    win:'With the guns destroyed, Omaha and Utah can land without heavy-calibre fire on the beaches. The Rangers must hold the Point until relief arrives from Omaha.',
    lose:'The 155 mm guns survive. Shells fall among the landing craft off Omaha and Utah all morning, and the assault waves will be thinned before they reach the sand.',
    real:'The Rangers climbed the cliff in about five minutes under fire and found the casemates empty. A patrol under Sergeants Len Lomell and Jack Kuhn found the guns hidden in an orchard lane and wrecked them with thermite grenades. The Rangers then held for two days against counter-attacks; of 225 who landed, about 90 could still fight when relieved.'},
  omaha:{forces:['34,000 men landed by nightfall: 1st and 29th Infantry Divisions, Rangers, engineers', 'About 1,800 men of the 352nd and 716th Divisions in 14 strongpoints'],
    win:'The beachhead holds. Engineers bulldoze the draws open, and men and vehicles pour inland. The link-up between the British and American beaches is now possible.',
    lose:'Bradley seriously considers diverting the follow-up waves to Utah and the British beaches. Without Omaha the Allied line has a ten-mile gap the Germans could drive into.',
    real:'For hours the landing teetered. Most DD tanks sank; units landed in the wrong places under murderous fire. Small groups led by junior officers and sergeants climbed the bluffs between the strongpoints, and destroyers came within 1,000 yards to shoot them in. About 2,400 Americans were killed, wounded or missing on Omaha that day, but by nightfall a foothold a mile and a half deep was held.'},
  pegasus:{forces:['181 men of D Company, 2nd Ox and Bucks, landed by six Horsa gliders; then 7th Parachute Battalion', 'Bridge guards of the 716th Division; 125th Panzergrenadier Regiment and Panzer IVs of 21st Panzer'],
    win:'The eastern flank of the invasion is secure. German armour cannot roll up Sword Beach from the east, and the 6th Airborne bridgehead holds.',
    lose:'21st Panzer recaptures the bridges and can strike across the Orne into the flank of Sword Beach.',
    real:'The gliders landed so close that one ended 47 metres from the bridge; both bridges were taken in about ten minutes. Lieutenant Den Brotheridge was killed in the first rush, the first Allied soldier killed by enemy fire on D-Day. The paratroopers held all day, and Lord Lovat\'s commandos arrived at about 13:00 with Piper Bill Millin playing "Blue Bonnets".'},
  carentan:{forces:['The 101st Airborne Division, later Combat Command A of the 2nd Armored Division', 'Fallschirmjäger Regiment 6 under Major von der Heydte; 17th SS Panzergrenadier Division'],
    win:'Utah and Omaha are joined into one continuous beachhead. The Allies can now shift men and supplies along the whole front.',
    lose:'The two American beachheads stay separated, and a German thrust between them could defeat each in turn.',
    real:'Lieutenant Colonel Robert Cole led a bayonet charge on the causeway on 11 June, earning the Medal of Honor. Carentan fell on 12 June. On 13 June the Germans counter-attacked at "Bloody Gulch" and nearly retook the town until the 2nd Armored arrived in the nick of time.'},
  villers:{forces:['22nd Armoured Brigade of the 7th Armoured Division: Cromwells, Fireflies and the 1st Rifle Brigade', 'Five Tigers of heavy SS Panzer Battalion 101 under Michael Wittmann, then the Panzer Lehr and 2nd Panzer Divisions'],
    win:'Operation Perch outflanks the Panzer Lehr Division, and the road to Caen from the west lies open.',
    lose:'The British are thrown back. Caen will cost another month of fighting in the ruins.',
    real:'Wittmann\'s Tiger drove down the halted column and into the town, knocking out vehicles one after another before it was disabled. In about fifteen minutes the British lost up to 14 tanks, 15 carriers and many half-tracks. The 7th Armoured withdrew; the chance to take Caen from the flank was gone.'},
  caen:{forces:['I Corps: 3rd British, 3rd Canadian and 59th Divisions, 2nd Canadian Armoured Brigade', '12th SS Panzer Division "Hitlerjugend" and 16th Luftwaffe Field Division'],
    win:'Northern Caen falls, the Orne bridges come into view, and the stage is set for the armoured attack of Operation Goodwood.',
    lose:'Caen still blocks the British front. Eisenhower\'s staff grow impatient with Montgomery\'s "set-piece" methods.',
    real:'After the bombing, which killed many French civilians and left rubble that blocked the tanks, I Corps took the northern half of Caen up to the Orne on 9 July. It cost about 3,500 British and Canadian casualties. The southern suburbs held out until Operation Atlantic later in July.'},
  cobra:{forces:['VII Corps: 1st, 4th, 9th and 30th Infantry Divisions; 2nd and 3rd Armored Divisions; 1,500 heavy bombers', 'Panzer Lehr Division (about 2,200 men and 45 tanks fit to fight) and parachute and infantry remnants'],
    win:'The front breaks open. Patton\'s Third Army will drive into Brittany and swing east across France.',
    lose:'The bocage swallows another offensive, and the Allies stay pinned in Normandy into the autumn.',
    real:'Short bombing on 24 and 25 July killed over 100 Americans, among them Lieutenant General Lesley McNair. But the carpet destroyed Panzer Lehr\'s front line, and by 27 July American armour was racing south. Within a week the front had broken.'},
  falaise:{forces:['First Canadian Army, Polish 1st Armoured Division, US Third and First Armies', 'German Seventh Army and Fifth Panzer Army, about 100,000 men inside the pocket'],
    win:'The gap is shut. Two German armies are destroyed in Normandy, and the road to Paris and the Seine lies open.',
    lose:'More of the German armies escape east to fight again on the Seine and the West Wall.',
    real:'The gap closed at Chambois on 19 August and was held by the Poles on Hill 262 against attacks from both sides. Between 20,000 and 50,000 Germans got out; about 10,000 were killed and 50,000 captured. Eisenhower wrote that he could walk for hundreds of yards on nothing but dead and decaying flesh.'},
  paris:{forces:['2e Division Blindée, about 16,000 men, with the US 4th Infantry Division; the FFI Resistance inside the city', 'About 20,000 German troops under General von Choltitz, with tanks and strongpoints'],
    win:'Paris is liberated by French soldiers. De Gaulle walks down the Champs-Élysées and France has a government again.',
    lose:'Street fighting drags on. Hitler\'s order to leave Paris "a field of ruins" may yet be carried out.',
    real:'The first half-tracks of La Nueve reached the Hôtel de Ville at 21:22 on 24 August. Choltitz surrendered on the afternoon of the 25th, having ignored Hitler\'s order to destroy the bridges and monuments. About 130 soldiers of the 2e DB and around 1,000 Resistance fighters and civilians died in the liberation.'},
  arnhem:{forces:['XXX Corps, 1st British and 82nd and 101st US Airborne Divisions: about 35,000 airborne troops', 'II SS Panzer Corps (9th and 10th SS Panzer Divisions), Kampfgruppen from all over Army Group B'],
    win:'The Rhine is crossed. The northern route into Germany around the West Wall lies open, and the war might be over by Christmas.',
    lose:'The airborne bridgehead at Arnhem is lost. The war in the West will go on through the winter.',
    real:'XXX Corps was held up at Son, Nijmegen and on "the island". Frost\'s battalion held the north end of Arnhem bridge for four days instead of two. Of about 10,000 men of the 1st Airborne Division, fewer than 2,400 were withdrawn across the Rhine; the rest were killed or captured. It was, in the phrase attributed to Lieutenant General Browning, a bridge too far.'},
  hurtgen:{forces:['US First Army: 28th Infantry Division in November, eventually nine divisions over the campaign', 'German 275th and 89th Infantry Divisions, then 116th Panzer Division'],
    win:'Schmidt and the Roer dams are within reach. The Germans can no longer flood the river in the Americans\' faces.',
    lose:'The forest bleeds another division white. The dams stay in German hands until February 1945.',
    real:'The 28th Division took Schmidt on 3 November and lost it the next day; the Kall Trail became a death trap. The Hürtgen campaign as a whole cost the Americans about 33,000 casualties, among the worst of the war in the West, for little gain.'},
  bastogne:{forces:['101st Airborne Division, Combat Command B of the 10th Armored, tank destroyers and stragglers: about 18,000 men', 'XLVII Panzer Corps: 26th Volksgrenadier Division, Panzer Lehr and later 15th Panzergrenadier Division'],
    win:'The road junction stays American. The German offensive loses its supply roads and grinds to a halt short of the Meuse.',
    lose:'The German armour gets the roads it needs, and the Meuse crossings, and Antwerp, come under threat.',
    real:'Surrounded from 21 December, the defenders held through repeated attacks. When the skies cleared on 23 December, supply drops and fighter-bombers turned the battle. The 4th Armored Division broke through on 26 December. Total American losses in the siege were about 3,000.'},
  remagen:{forces:['Combat Command B of the 9th Armored Division, with new M26 Pershings', 'A few hundred German engineers, Volkssturm and anti-aircraft gunners'],
    win:'The first Allied bridgehead over the Rhine. Five divisions cross in the next ten days, and the last natural barrier into Germany is breached.',
    lose:'The bridge goes up in your faces. The Rhine must be stormed in a full set-piece assault weeks later.',
    real:'Sergeant Alexander Drabik was the first across, at about 16:00 on 7 March 1945. The demolition charge only partly fired. The bridge carried troops for ten days, then collapsed on 17 March, killing 28 US Army engineers. Hitler had four German officers executed for failing to destroy it.'},
  prokhorovka:{forces:['5th Guards Tank Army: about 800 tanks and self-propelled guns, mostly T-34s and light T-70s', 'II SS Panzer Corps: about 290 tanks and assault guns, including fewer than 20 Tigers'],
    win:'The southern pincer of Operation Citadel is stopped. Germany will never again launch a major offensive in the East.',
    lose:'The panzers break through towards Oboyan and Kursk, and the Soviet salient could still be cut off.',
    real:'The Soviet tanks charged straight into German positions, partly across their own anti-tank ditch. The 5th Guards Tank Army lost several hundred tanks, the Germans far fewer. But the German offensive had run out of strength, and on 13 July Hitler called off Citadel. The initiative in the East passed to the Red Army for good.'},
  bagration:{forces:['Four Soviet fronts, about 1.7 million men, 5,800 tanks and 7,800 aircraft', 'Army Group Centre: about 800,000 men, very weak in armour'],
    win:'Army Group Centre collapses. The Red Army will reach the Vistula and the gates of Warsaw within six weeks.',
    lose:'The German line holds in the marshes, and the Soviet summer offensive bogs down.',
    real:'Bagration opened on 22 June 1944. In two weeks Army Group Centre lost about 28 divisions; roughly 400,000 Germans were killed, wounded or captured, a bigger defeat than Stalingrad. 57,000 prisoners were paraded through Moscow on 17 July. Model, sent to save the front, could only patch a new line far to the west.'},
  vistula:{forces:['1st Belorussian and 1st Ukrainian Fronts: about 2.2 million men, 6,500 tanks', 'Army Group A: about 450,000 men and 1,100 tanks'],
    win:'The German front in Poland disintegrates. The Red Army will reach the Oder, 70 kilometres from Berlin, in under three weeks.',
    lose:'The breakout stalls, and Germany gains months to fortify the approaches to Berlin.',
    real:'The offensive opened on 12 January 1945 and advanced up to 500 kilometres in three weeks, the fastest Soviet advance of the war. Warsaw fell on 17 January and Auschwitz was liberated on 27 January. By 3 February Soviet troops held bridgeheads on the Oder.'},
  seelow:{forces:['1st Belorussian Front: about 1 million men, 3,000 tanks, 16,000 guns and mortars', 'Ninth Army under Busse in Heinrici\'s Army Group Vistula: about 110,000 men'],
    win:'The last defensive line before Berlin breaks. Soviet tanks will reach the city\'s suburbs within four days.',
    lose:'The heights hold. Konev\'s armies, racing from the south, may reach the Reichstag before Zhukov.',
    real:'Heinrici withdrew most troops from the forward line the night before, so the huge barrage hit empty trenches, and the searchlights blinded the attackers. Zhukov threw his tank armies in early. The heights fell on 19 April at a cost of about 30,000 Soviet dead against some 12,000 German.'},
  berlin:{forces:['3rd Shock Army and 8th Guards Army, about 1.5 million men around the city', 'About 45,000 soldiers plus Volkssturm and Hitler Youth inside Berlin under Weidling'],
    win:'The Victory Banner flies over the Reichstag. Berlin\'s garrison surrenders on 2 May, and Germany capitulates within a week.',
    lose:'The government quarter holds out a few days longer, at a terrible price in lives on both sides.',
    real:'Soldiers of the 150th Rifle Division stormed the Reichstag on 30 April. Sergeants Mikhail Yegorov and Meliton Kantaria raised the Victory Banner late that night; Yevgeny Khaldei\'s famous photograph was restaged on 2 May. The Battle of Berlin cost the Red Army about 80,000 dead; tens of thousands of German soldiers and civilians died too.'},
  kharkov:{forces:['Army Group South: II SS Panzer Corps, XLVIII and LVII Panzer Corps', 'Soviet Voronezh and Southwestern Fronts, over-extended after Stalingrad'],
    win:'The Soviet spearheads are cut off and the front stabilises. The salient left behind will be the scene of the Battle of Kursk in July.',
    lose:'Army Group South is driven back to the Dnieper, a year earlier than in history.',
    real:'Manstein\'s counter-stroke began on 19 February 1943, destroyed the Soviet spearheads and retook Kharkov on 15 March. It was the last great German victory in the East, and it created the Kursk salient where Citadel would fail.'},
  villersAxis:{forces:['A handful of Tigers of heavy SS Panzer Battalion 101, then Panzer Lehr', 'The vanguard of 22nd Armoured Brigade, halted in column'],
    win:'The British outflanking move is shattered, and the Panzer Lehr line west of Caen holds.',
    lose:'British armour gets around Panzer Lehr\'s flank and into the German rear west of Caen.',
    real:'Wittmann\'s single Tiger destroyed much of A Squadron of the 4th County of London Yeomanry and the Rifle Brigade\'s vehicles in minutes. Wittmann was made a propaganda hero; he was killed on 8 August 1944 near Saint-Aignan-de-Cramesnil, probably by Fireflies.'},
  wacht:{forces:['Three German armies: about 410,000 men, 1,400 tanks and assault guns', 'About 83,000 Americans in a thin line along the "Ghost Front"'],
    win:'St Vith falls early, and the panzers have a clear road to the Meuse crossings.',
    lose:'The Americans hold the road junction, and the German timetable collapses.',
    real:'The 7th Armored Division held St Vith until 21 December, delaying the Sixth and Fifth Panzer Armies by four vital days. The Battle of the Bulge became the largest and bloodiest American battle of the war, with about 19,000 Americans killed. Germany lost its last armoured reserves in the West.'},
};

const GLOSSARY = [
  ['Atlantic Wall', 'The German coastal fortifications from Norway to Spain. Rommel added millions of mines and beach obstacles in the first half of 1944.'],
  ['Widerstandsnest (WN)', '"Resistance nest": a German strongpoint, typically bunkers, Tobruk pits, trenches and wire around one or two guns. Omaha had fourteen.'],
  ['Tobruk pit', 'A small concrete ring for a machine gun or mortar, named after Italian positions at Tobruk in 1941.'],
  ['Bocage', 'The Norman hedgerow country: small fields boxed in by earth banks topped with thick hedges, a natural fortress for the defender.'],
  ['Rhinoceros', 'Steel teeth welded to the front of Shermans by Sergeant Curtis Culin, cut from German beach obstacles, to bulldoze through hedgerows.'],
  ['DD tank', 'Duplex Drive: a Sherman with a canvas flotation screen and two propellers, meant to swim ashore with the first wave.'],
  ['Bangalore torpedo', 'Lengths of pipe packed with explosive, pushed under barbed wire and detonated to blow a gap.'],
  ['Bailey bridge', 'A British prefabricated steel bridge of standard panels that could be built by hand without heavy equipment. Over 2,500 were built in Italy and North-West Europe.'],
  ['Panzerfaust', 'A cheap, disposable German anti-tank rocket. By 1945 even Hitler Youth and Volkssturm carried them.'],
  ['Zimmerit', 'A ridged anti-magnetic paste applied to German tanks from 1943 to stop magnetic mines sticking.'],
  ['Hinterhalt camouflage', '"Ambush" scheme: German armour from 1944 was painted dark yellow with olive green and red-brown patches, sometimes with light dots.'],
  ['Invasion stripes', 'Black and white bands painted on Allied aircraft on the eve of D-Day so that ships and troops would not shoot at them.'],
  ['Volkssturm', 'The German home guard of 1944–45, men aged 16 to 60 not already serving.'],
  ['Katyusha', 'Soviet rocket launchers on trucks. The Germans called them "Stalin\'s organs".'],
  ['Kampfgruppe', 'A German ad hoc battle group, usually named after its commander and made up from whatever units were to hand.'],
  ['Fallschirmjäger', 'German paratroopers, used mostly as elite infantry after the heavy losses on Crete in 1941.'],
  ['Time on target', 'An American artillery technique: many batteries timing their fire so all shells land at the same moment.'],
  ['Guards', 'Soviet honorific given to units that distinguished themselves in battle: "Guards" divisions and tank armies.'],
];

/* ---------- the war-room map of Europe (lon, lat) ---------- */
const EUROPE = {
  land:[
    [[-6.5, 43.5], [-1.8, 43.4], [-1.2, 46], [-2.2, 47.2], [-4.5, 47.9], [-4.7, 48.4], [-3, 48.8], [-1.6, 48.7], [-1.4, 49.7], [-1.2, 49.35], [-0.2, 49.3], [0.2, 49.5], [1.5, 50.2], [1.6, 50.9], [2.5, 51.1], [3.6, 51.4], [4.2, 52], [4.7, 52.9], [5.6, 53.4], [7, 53.6], [8.6, 53.9], [8.6, 55], [8.1, 56.6], [10.6, 57.7], [10.3, 56.2], [10.9, 55.4], [10, 54.6], [11, 54], [12.5, 54.4], [14.2, 53.9], [16.5, 54.6], [18.6, 54.7], [19.7, 54.5], [21.1, 55.3], [21, 56.5], [22, 57.6], [24, 57.3], [23.5, 59], [28, 59.6], [30, 60.5], [40.5, 60.5], [40.5, 42.8], [-6.5, 42.8]],
    [[-5.7, 50], [-3.5, 50.4], [-1.1, 50.7], [1.4, 51.2], [1.7, 52.6], [0.2, 53.4], [-0.2, 54.2], [-1.2, 54.6], [-1.6, 55.6], [-2.5, 56], [-2, 57.6], [-4, 57.6], [-5.6, 58.5], [-6.5, 58.4], [-6.5, 56.6], [-5.6, 55.4], [-4.8, 54.8], [-3.2, 54.9], [-3, 53.9], [-3, 53.3], [-4.6, 53.3], [-4.6, 52.8], [-4.1, 52.4], [-5.3, 51.8], [-3.2, 51.4], [-4.5, 51.2]],
    [[5, 58.2], [7, 58], [8.5, 58.2], [10.5, 59], [11.2, 58.4], [12.6, 56], [14.2, 55.4], [16.4, 56.6], [16.7, 57.9], [18.8, 59.3], [18.8, 60.5], [5, 60.5]],
  ],
  sea:[
    [[27.6, 42.8], [28.6, 44.2], [29.7, 45.3], [30.7, 46.5], [32.6, 46], [33.6, 44.5], [35.5, 45], [36.6, 45.4], [38.2, 44.5], [39.8, 43.5], [40.5, 42.8]],
    [[12.3, 45.4], [13.6, 45.8], [14.8, 45], [16, 43.5], [18, 42.8], [14, 42.8], [13.5, 43.6], [12.4, 44.5]],
    [[3, 42.8], [3.1, 43.2], [4.5, 43.4], [6.3, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.5, 42.8]],
    [[21.1, 55.3], [21.4, 54.8], [20, 54.4], [19.7, 54.5]],
  ],
  cities:[['London', -0.13, 51.5], ['Paris', 2.35, 48.86], ['Berlin', 13.4, 52.52], ['Moscow', 37.6, 55.75], ['Warsaw', 21, 52.23], ['Kiev', 30.5, 50.45], ['Brussels', 4.35, 50.85], ['Vienna', 16.37, 48.2], ['Prague', 14.42, 50.08], ['Minsk', 27.56, 53.9]],
};
const MISSION_LONLAT = {
  pointe:[-0.99, 49.4], omaha:[-0.87, 49.37], pegasus:[-0.27, 49.24], carentan:[-1.25, 49.3], villers:[-0.65, 49.08], caen:[-0.37, 49.18], cobra:[-1.09, 49.12], falaise:[0.11, 48.81],
  paris:[2.35, 48.86], arnhem:[5.91, 51.98], hurtgen:[6.4, 50.68], bastogne:[5.72, 50], remagen:[7.23, 50.58], prokhorovka:[36.47, 51.04], bagration:[29.22, 53.14], vistula:[21.43, 51.76],
  seelow:[14.38, 52.53], berlin:[13.38, 52.52], kharkov:[36.23, 49.99], villersAxis:[-0.65, 49.08], wacht:[6.12, 50.28],
};
/* draws the map; view = [lonMin, latMin, lonMax, latMax] */
function drawWarMap(c, campaign, current, view) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  const [x0, y0, x1, y1] = view || [-6.5, 43, 40.5, 60.5], k = Math.cos((y0 + y1) / 2 * Math.PI / 180);
  const sx = W / ((x1 - x0) * k), sy = H / (y1 - y0), s = Math.min(sx, sy), ox = (W - (x1 - x0) * k * s) / 2, oy = (H - (y1 - y0) * s) / 2;
  const P = (lon, lat) => [ox + (lon - x0) * k * s, oy + (y1 - lat) * s];
  // paper and sea
  g.fillStyle = '#9fb3b8'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${hrand(i, 1) * .05})`; g.fillRect(hrand(i, 2) * W, hrand(i, 3) * H, 2, 2); }
  const poly = (pts, fill, stroke, lw = 1.5) => { g.beginPath(); pts.forEach(([a, b], i) => { const [x, y] = P(a, b); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  for (const l of EUROPE.land) poly(l, '#e3d6b0', '#7d7458', 3);
  for (const l of EUROPE.land) poly(l, '#e3d6b0', '#e3d6b0', 1.2);     // fill again with a thin land-coloured edge so seams between land shapes vanish, leaving the outer coastline
  for (const sPoly of EUROPE.sea) poly(sPoly, '#9fb3b8', '#7d7458');
  // graticule
  g.strokeStyle = 'rgba(80,70,50,.15)'; g.lineWidth = 1;
  const gs = x1 - x0 > 90 ? 30 : x1 - x0 > 30 ? 10 : 5;
  for (let lon = Math.ceil(x0 / gs) * gs; lon <= x1; lon += gs) { const [a] = P(lon, 0); g.beginPath(); g.moveTo(a, 0); g.lineTo(a, H); g.stroke(); }
  for (let lat = Math.ceil(y0 / gs) * gs; lat <= y1; lat += gs) { const [, b] = P(0, lat); g.beginPath(); g.moveTo(0, b); g.lineTo(W, b); g.stroke(); }
  for (const [lon, lat] of EUROPE.islets || []) { const [x, y] = P(lon, lat); g.fillStyle = '#e3d6b0'; g.strokeStyle = '#7d7458'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); g.stroke(); }
  g.font = `${Math.max(10, W / 80)}px "Special Elite", monospace`; g.fillStyle = '#4a4232';
  const world = x1 - x0 > 100, major = ['London', 'Moscow', 'Tokyo', 'Shanghai', 'Singapore', 'Honolulu', 'New York', 'Montevideo', 'Stalingrad', 'Manila'];
  for (const [n, lon, lat] of EUROPE.cities) { const [x, y] = P(lon, lat); if (x < 0 || y < 0 || x > W || y > H || (world && !major.includes(n))) continue; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); g.fillText(n, x + 5, y - 4); }
  if (!campaign) return;
  // the operation's route: arrows from battle to battle, done in red, to come in grey
  const prog = loadProg(), ids = campaign.missions;
  for (let i = 1; i < ids.length; i++) {
    const [ax, ay] = P(...MISSION_LONLAT[ids[i - 1]]), [bx, by] = P(...MISSION_LONLAT[ids[i]]), done = prog.done[ids[i]];
    g.strokeStyle = done ? '#a8322a' : 'rgba(60,54,40,.55)'; g.lineWidth = done ? 3 : 2; g.setLineDash(done ? [] : [6, 5]);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
    const a = Math.atan2(by - ay, bx - ax); g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(bx - Math.cos(a) * 8, by - Math.sin(a) * 8); g.lineTo(bx - Math.cos(a) * 18 - Math.sin(a) * 6, by - Math.sin(a) * 18 + Math.cos(a) * 6); g.lineTo(bx - Math.cos(a) * 18 + Math.sin(a) * 6, by - Math.sin(a) * 18 - Math.cos(a) * 6); g.fill();
  }
  ids.forEach((id, i) => {
    const [x, y] = P(...MISSION_LONLAT[id]), cur = id === current, done = prog.done[id];
    g.fillStyle = cur ? '#d6b25a' : done ? '#a8322a' : '#4a4232'; g.strokeStyle = '#1a1814'; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y, cur ? 9 : 6, 0, 7); g.fill(); g.stroke();
    if (cur) { g.strokeStyle = '#d6b25a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 15 + Math.sin(performance.now() / 300) * 3, 0, 7); g.stroke(); }
    g.fillStyle = '#1a1814'; g.font = `bold ${Math.max(10, W / 70)}px "Courier Prime", monospace`; g.fillText(String(i + 1), x - 3, y + 4);
  });
}
/* the view that frames a campaign's battles */
function campaignView(c) {
  const pts = c.missions.map(id => MISSION_LONLAT[id]);
  let x0 = Math.min(...pts.map(p => p[0])), x1 = Math.max(...pts.map(p => p[0])), y0 = Math.min(...pts.map(p => p[1])), y1 = Math.max(...pts.map(p => p[1]));
  const padX = Math.max(2.5, (x1 - x0) * .25), padY = Math.max(1.6, (y1 - y0) * .3);
  x0 -= padX; x1 += padX; y0 -= padY; y1 += padY;
  const k = Math.cos((y0 + y1) / 2 * Math.PI / 180), want = 1 / .42;   // widen the narrow axis to the map's shape
  if ((x1 - x0) * k / (y1 - y0) < want) { const c = (x0 + x1) / 2, w = (y1 - y0) * want / k / 2; x0 = c - w; x1 = c + w; }
  else { const c = (y0 + y1) / 2, h = (x1 - x0) * k / want / 2; y0 = c - h; y1 = c + h; }
  return [x0, y0, x1, y1];
}
