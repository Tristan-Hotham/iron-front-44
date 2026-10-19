/* ============================== SERVICE RECORD ============================
   Lifetime statistics and medals, kept with campaign progress. Medals are
   period decorations awarded for feats across every mode. */
const MEDALS = [
  {id:'first', n:'Bronze Star', txt:'Win your first battle.', c:['#b8803a', '#c03030']},
  {id:'srank', n:'Distinguished Service Order', txt:'Earn an S rank in any battle.', c:['#e0d0a0', '#b02030']},
  {id:'legend', n:'Knight\'s Cross', txt:'Raise a unit to Legendary rank.', c:['#2a2a2a', '#e8e8e0']},
  {id:'core6', n:'Unit Citation', txt:'Have eight veterans in one army\'s core force.', c:['#3060c0', '#e0c050']},
  {id:'kills100', n:'Order of Glory', txt:'Destroy 100 enemy units in total.', c:['#e0a040', '#202020']},
  {id:'subs', n:'Wolf Hunter', txt:'Sink 10 U-boats or submarines.', c:['#203a78', '#e8e8e0']},
  {id:'ships', n:'Navy Cross', txt:'Sink 10 capital ships or carriers.', c:['#1c3a8a', '#e8e8e0']},
  {id:'waves5', n:'Hold Fast', txt:'Survive 5 waves in a Last Stand.', c:['#6a6a4a', '#c8a040']},
  {id:'waves15', n:'Defender of the Line', txt:'Survive 15 waves in a Last Stand.', c:['#8a2a2a', '#e0c050']},
  {id:'zed5', n:'Until Dawn', txt:'Clear 5 waves of the dead in Dead of Night.', c:['#2a2e26', '#e8c820']},
  {id:'zed12', n:'Night Watchman', txt:'Clear 12 waves of the dead in Dead of Night.', c:['#1a1a18', '#b8d040']},
  {id:'mapper', n:'Topographer\'s Badge', txt:'Save a map in the Map Builder.', c:['#4a6a3a', '#e8e0c0']},
  {id:'axis', n:'Other Side of the Hill', txt:'Win a battle as Germany or Japan.', c:['#5a5a5a', '#d8d8d0']},
  {id:'resist', n:'Order of the Cloud and Banner', txt:'Win a battle with China.', c:['#1c3a9a', '#d42a2a']},
  {id:'allcamp', n:'Victory Medal', txt:'Complete every campaign.', c:['#c8a040', '#7a3aa0']},
];
const CAMPAIGN_MEDAL = {west:['France and Germany Star', '#1c3a8a', '#d42a2a'], east:['Medal for the Capture of Berlin', '#d42a2a', '#e0c050'], axis:['Iron Cross', '#2a2a2a', '#e8e8e0'],
  china:['Medal of Victory in the War of Resistance', '#1c3a9a', '#e8e8e0'], weiss:['Iron Cross Second Class', '#5a5a5a', '#c8a040'], gelb:['Panzer Assault Badge', '#4a4a4a', '#d8d8d0'],
  sea:['1939–45 Star', '#203a78', '#e0c050'], atlantic:['Atlantic Star', '#2a5a8a', '#e8e8e0'], rising:['Greater East Asia War Medal', '#c8202a', '#e8e2d0'], pacific:['Asiatic-Pacific Campaign Medal', '#b8803a', '#3060c0'], desert:['The Africa Star', '#c8a060', '#c8202a'], italy:['Croce al Merito di Guerra', '#1c3a8a', '#e8e8e0'],
  carrier:['Distinguished Flying Cross', '#1c3a8a', '#c8202a'], foxdesert:['Ärmelband Afrika', '#e8dcb0', '#3a5a3a'], burma:['The Burma Star', '#1c2a6a', '#e08a20'], winterwar:['Winter War Medal', '#1a3e8a', '#f4f4ee'], barbarossa:['Medaille Winterschlacht im Osten', '#c8202a', '#1a1a1a'], north:['Norway and Crete Clasp', '#ba1f2e', '#1a2e6a'], italy44:['The Italy Star', '#c8202a', '#1a8a3a'], maple:['Monte Cassino Cross', '#1a3a8a', '#c8202a'], diggers:['Australia Service Medal', '#1a2a6a', '#c8a040'], philippines:['Philippine Liberation Medal', '#c8202a', '#1a3a8a'], fareast:['Medal for the Victory over Japan', '#c8202a', '#e0c050'], training:['Marksmanship Badge', '#4a5a3a', '#c8a040']};
function stat(p) { return (p.stats = Object.assign({battles:0, wins:0, kills:0, lost:0, subs:0, ships:0, waves:0, maps:0}, p.stats || {})); }
function award(p, id) { p.medals = p.medals || {}; if (p.medals[id]) return null; p.medals[id] = Date.now(); return id; }
/* called after every game; returns the medals newly won */
function recordGame(won) {
  const p = loadProg(), s = stat(p), got = [], add = id => { const a = award(p, id); if (a) got.push(a); };
  s.battles++; if (won) s.wins++;
  const human = !G.teams[1].ai ? 1 : 2;
  s.kills += G.stats[human].kills; s.lost += G.stats[human].lost;
  s.subs += G.sunkSubs && G.sunkSubs[human] || 0; s.ships += G.sunkBig && G.sunkBig[human] || 0;
  if (won) add('first');
  if (G.mission && p.rank && p.rank[G.mission.id] === 'S') add('srank');
  if (G.units.some(u => u.team === human && rankOf(u) >= 3)) add('legend');
  if (Object.values(p.core || {}).some(l => l.length >= 8)) add('core6');
  if (s.kills >= 100) add('kills100'); if (s.subs >= 10) add('subs'); if (s.ships >= 10) add('ships');
  if (G.waves && G.waves.std !== false) { if (G.waves.zed) { const held = G.waves.best || 0; s.zed = Math.max(s.zed || 0, held); if (held >= 5) add('zed5'); if (held >= 12) add('zed12'); }   // standard settings only: a 200,000 war chest or easy waves earn no medal
    else { const held = Math.max(0, G.waves.n - 1); s.waves = Math.max(s.waves, held); if (held >= 5) add('waves5'); if (held >= 15) add('waves15'); } }
  if (won && ['ger', 'ger40', 'jp'].includes(G.teams[human].nat)) add('axis');
  if (won && G.teams[human].nat === 'cn') add('resist');
  for (const c of CAMPAIGNS) if (c.missions.every(id => p.done[id])) add('camp:' + c.id);
  if (CAMPAIGNS.every(c => c.missions.every(id => p.done[id]))) add('allcamp');
  saveProg(p);
  return got;
}
function medalName(id) { if (id.startsWith('camp:')) return (CAMPAIGN_MEDAL[id.slice(5)] || ['Campaign Medal'])[0]; const m = MEDALS.find(x => x.id === id); return m ? m.n : id; }
/* a ribbon bar and medal, drawn in pixels */
function medalCanvas(id, s = 1) {
  const c = mkCanvas(40 * s, 56 * s), g = c.getContext('2d'); g.scale(s, s);
  const m = MEDALS.find(x => x.id === id), cm = id.startsWith('camp:') && CAMPAIGN_MEDAL[id.slice(5)], cols = m ? m.c : cm ? [cm[1], cm[2]] : ['#888', '#ccc'];
  for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? cols[1] : cols[0]; g.fillRect(8 + i * 4.8, 2, 4.8, 22); }   // ribbon
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(8, 20, 24, 4);
  g.fillStyle = '#c8a040'; g.fillRect(18, 24, 4, 4);
  const cross = id === 'legend' || id === 'axis' || cm && cm[0] === 'Iron Cross';
  if (cross) { g.fillStyle = '#1a1a1a'; g.fillRect(14, 32, 12, 20); g.fillRect(10, 36, 20, 12); g.strokeStyle = '#e8e8e0'; g.lineWidth = 1.2; g.strokeRect(14, 32, 12, 20); }
  else if (id === 'kills100' || id === 'resist' || (cm && /Berlin|Victory/.test(cm[0]))) { g.fillStyle = '#d8b040'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12; g.lineTo(20 + Math.cos(a) * r, 42 + Math.sin(a) * r); } g.fill(); }
  else { const gr = g.createRadialGradient(17, 38, 2, 20, 42, 12); gr.addColorStop(0, '#f0d890'); gr.addColorStop(1, '#a87a30'); g.fillStyle = gr; g.beginPath(); g.arc(20, 42, 11, 0, 7); g.fill(); g.strokeStyle = '#6a4a1a'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#8a6a2a'; g.beginPath(); g.arc(20, 42, 5, 0, 7); g.fill(); }
  return c;
}
function openRecord() {
  const p = loadProg(), s = stat(p), el = $('#reclist'); el.innerHTML = '';
  const st = document.createElement('div'); st.className = 'recstats';
  st.innerHTML = [['Battles', s.battles], ['Victories', s.wins], ['Enemy destroyed', s.kills], ['Own losses', s.lost], ['U-boats sunk', s.subs], ['Capital ships sunk', s.ships], ['Best Last Stand', s.waves + ' waves'], ['Best Dead of Night', (s.zed || 0) + ' waves'], ['Battles won', Object.keys(p.done).length + ' of ' + Object.keys(MISSIONS).length]].map(([a, b]) => `<div><b>${b}</b><span>${a}</span></div>`).join('');
  el.append(st);
  const all = [...MEDALS.map(m => [m.id, m.n, m.txt]), ...CAMPAIGNS.map(c => ['camp:' + c.id, (CAMPAIGN_MEDAL[c.id] || ['Campaign medal'])[0], `Complete ${c.name}.`])];
  const grid = document.createElement('div'); grid.className = 'medgrid';
  for (const [id, n, txt] of all) { const d = document.createElement('div'), has = p.medals && p.medals[id]; d.className = 'medal' + (has ? '' : ' locked');
    d.append(medalCanvas(id, 1.5)); const t = document.createElement('div'); t.innerHTML = `<b>${n}</b><small>${txt}</small>`; d.append(t); grid.append(d); }
  el.append(grid); show('record');
}
