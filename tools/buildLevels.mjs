import fs from 'fs';
import w1 from './world1.mjs';
const worlds = { 1: w1 };
for (const f of ['world2', 'world3', 'world4', 'world5']) { try { worlds[f.slice(5)] = (await import(`./${f}.mjs`)).default; } catch { worlds[f.slice(5)] = []; } }
let targets = {}; try { targets = JSON.parse(fs.readFileSync(new URL('./targets.json', import.meta.url))); } catch {}
for (const [w, lv] of Object.entries(worlds)) {
  for (const l of lv) { const t = targets[l.id]; if (t) { l.flipTarget = t.flipTarget; l.parTime = t.parTime; } }
  fs.writeFileSync(new URL(`../levels/world${w}.json`, import.meta.url), JSON.stringify(lv, null, 1));
}
console.log('levels written', Object.values(worlds).reduce((a, b) => a + b.length, 0));
