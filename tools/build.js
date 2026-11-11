// Node twin of build.ps1, for Linux and macOS: joins src/ in the same order into index.html (and dist/, iron-front.html).
//   node tools/build.js
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const root = path.join(__dirname, '..'), src = path.join(root, 'src');
// keep this list in step with build.ps1
const order = fs.readFileSync(path.join(root, 'build.ps1'), 'utf8').match(/\$order = (.+)/)[1].match(/'([\w.-]+)'/g).map(s => s.slice(1, -1));
const js = order.map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');
const shell = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
const page = shell.split('/*__CSS__*/').join(css).split('/*__JS__*/').join(js);
const doc = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' + page + '\n</html>';
fs.writeFileSync(path.join(root, 'iron-front.html'), page);
fs.mkdirSync(path.join(root, 'dist'), {recursive: true});
fs.writeFileSync(path.join(root, 'dist', 'index.html'), doc);
fs.writeFileSync(path.join(root, 'index.html'), doc);
console.log('built: ' + page.length.toLocaleString('en-GB') + ' chars');
const chk = path.join(os.tmpdir(), 'if44-built.js'); fs.writeFileSync(chk, js);
try { cp.execFileSync(process.execPath, ['--check', chk], {stdio: 'pipe'}); console.log('script parses'); }
catch (e) { console.error('BUILD SCRIPT DOES NOT PARSE:\n' + String(e.stderr).split('\n').slice(0, 6).join('\n')); process.exitCode = 1; }
