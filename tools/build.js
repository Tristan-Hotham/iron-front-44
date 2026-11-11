/* Node twin of build.ps1, for Linux and macOS: joins src/ in order into index.html (and dist/index.html).
   Run: node tools/build.js   Keep ORDER in step with build.ps1. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..'), src = path.join(root, 'src');
const ORDER = ['data.js','maps.js','engine.js','art.js','audio.js','music.js','sfx-credits.js','fx.js','battle.js','intel.js','history.js','theatres.js','theatres-art.js','missions2.js','history2.js','modes.js','desert.js','zombies.js','barks.js','italy.js','carrier.js','desertfox.js','burma.js','winterwar.js','barbarossa.js','norway.js','italy44.js','maple.js','anzacs.js','philippines.js','fareast.js','harden.js','medals.js','editor.js','ai.js','ui.js','title.js','difficulty.js','net.js','pad.js','basebuild.js','test.js'];
const js = ORDER.map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8'), shell = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
const page = shell.split('/*__CSS__*/').join(css).split('/*__JS__*/').join(js);
fs.writeFileSync(path.join(root, 'iron-front.html'), page);
fs.mkdirSync(path.join(root, 'dist'), {recursive:true});
const doc = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' + page + '\n</html>';
fs.writeFileSync(path.join(root, 'dist', 'index.html'), doc); fs.writeFileSync(path.join(root, 'index.html'), doc);
console.log(`built: ${page.length.toLocaleString('en-GB')} chars`);
const chk = path.join(require('os').tmpdir(), 'if44-built.js'); fs.writeFileSync(chk, js);
try { execFileSync(process.execPath, ['--check', chk], {stdio:'pipe'}); console.log('script parses'); } catch (e) { console.error('BUILD SCRIPT DOES NOT PARSE:\n' + String(e.stderr).split('\n').slice(0, 6).join('\n')); process.exitCode = 1; }
