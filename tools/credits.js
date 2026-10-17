// Writes CREDITS.md from the track and sound lists in src/music.js.  Run: node tools/credits.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src', 'music.js'), 'utf8');
const tracks = src.split('\n').filter(l => /^\s*\{file:'/.test(l)).map(l => Function('return ' + l.trim().replace(/,$/, ''))());
const sfx = Function('return ' + src.slice(src.indexOf('[', src.indexOf('SFX_CREDITS')), src.indexOf('];', src.indexOf('SFX_CREDITS')) + 1))();
const md = [
  '# Credits', '',
  'The game code is MIT-licensed (see LICENSE). The music and recorded sounds are not covered by that licence: each is public domain or used under the licence named below. All recordings come from Wikimedia Commons except where noted.', '',
  `## Music (${tracks.length} tracks, in \`music/\`)`, '',
  '| File | Title | Composer · performers | Licence |', '| --- | --- | --- | --- |',
  ...tracks.map(t => `| ${t.file} | ${t.title} | ${t.by} | ${t.lic} |`), '',
  '## Recorded sound (in `sfx/`)', '',
  '| Sound | Source | Licence |', '| --- | --- | --- |',
  ...sfx.map(([a, b, c]) => `| ${a} | ${b} | ${c} |`), '',
  '"Duet Musette" by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0. CC BY-SA recordings were re-encoded to mono Opus for size; those adaptations are shared under the same licence.', '',
];
fs.writeFileSync(path.join(root, 'CREDITS.md'), md.join('\n'));
console.log(`CREDITS.md: ${tracks.length} tracks, ${sfx.length} sounds`);
