// Builds the CrazyGames upload: same dist, but the SDK <script> is loaded unconditionally (the QA tool / iframe may hide
// the referrer and Firefox has no ancestorOrigins, so host sniffing can miss it). Usage: npm run build && node tools/zipCrazyGames.mjs out.zip
import fs from 'fs'; import { execSync } from 'child_process'; import path from 'path';
const out = path.resolve(process.argv[2] || 'upside-down-run-crazygames.zip');
const tmp = fs.mkdtempSync('/tmp/cgzip-'); execSync(`cp -r dist/. ${tmp}/`);
const f = `${tmp}/index.html`; let h = fs.readFileSync(f, 'utf8');
const re = /if\(\/crazygames\\\.\|platform=crazygames\/i\.test\(a\.join\(' '\)\)\)/;
if (!re.test(h)) throw new Error('SDK snippet not found in dist/index.html');
h = h.replace(re, 'if(true)'); fs.writeFileSync(f, h);
fs.rmSync(out, { force: true }); execSync(`cd ${tmp} && zip -qr ${out} .`); console.log('wrote', out, fs.statSync(out).size, 'bytes');
