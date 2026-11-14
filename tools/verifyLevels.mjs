// Usage: node tools/verifyLevels.mjs [ids...]   (dev server must be on :5173)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.env.URL || 'http://localhost:5173/';
const ids = process.argv.slice(2).map(Number);
const all = [1, 2, 3, 4, 5].flatMap((w) => JSON.parse(fs.readFileSync(new URL(`../levels/world${w}.json`, import.meta.url))));
const todo = all.filter((l) => !ids.length || ids.includes(l.id));
const b = await chromium.launch(); const results = {};
const sol = fs.existsSync(new URL('./solutions.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('./solutions.json', import.meta.url))) : {};
const targets = fs.existsSync(new URL('./targets.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('./targets.json', import.meta.url))) : {};
await Promise.all([0, 1, 2, 3].map(async (w) => {
  const p = await b.newPage({ viewport: { width: 480, height: 270 } });
  await p.goto(url); await p.waitForTimeout(3500); await p.addScriptTag({ path: new URL('./pageSolver.js', import.meta.url).pathname });
  for (let i = w; i < todo.length; i += 4) {
    const lv = todo[i];
    let star = { solved: false, nodes: 0 };
    for (const [hw, macro] of [[0.12, 8], [0.3, 14], [0.5, 10], [0.3, 8]]) { star = await p.evaluate(([l, hw, macro]) => window.__solve(l, { needStar: true, hw, macro, maxNodes: 80000, maxSeconds: 30 }), [lv, hw, macro]).catch((e) => ({ err: String(e) })); if (star.solved && star.verified) break; }
    const any = lv.collectible && !(star.solved && star.verified) ? await p.evaluate(([l]) => window.__solve(l, { needStar: false, maxNodes: 60000, maxSeconds: 40 }), [lv]).catch((e) => ({ err: String(e) })) : star;
    results[lv.id] = { star, any };
    console.log(`L${lv.id} ${lv.name}: star=${star.solved ? `${star.flips}f ${star.seconds}s ok=${star.verified}` : 'NO (' + star.nodes + ')'}  any=${any.solved ? `${any.flips}f ${any.seconds}s ok=${any.verified}` : 'NO'}  ${star.ms}ms`);
    if (star.solved && star.verified) { sol[lv.id] = star.track; targets[lv.id] = { flipTarget: Math.max(star.flips, any.solved ? any.flips : 0) === star.flips ? star.flips + (lv.id > 10 ? 1 : 0) : star.flips, parTime: Math.round(star.seconds * 1.6 + 8) }; }
    else if (any.solved && any.verified) { sol[lv.id] = any.track; targets[lv.id] = { flipTarget: any.flips + 1, parTime: Math.round(any.seconds * 1.6 + 8) }; }
  }
  await p.close();
}));
fs.writeFileSync(new URL('./solutions.json', import.meta.url), JSON.stringify(sol));
fs.writeFileSync(new URL('./targets.json', import.meta.url), JSON.stringify(targets, null, 1));
fs.writeFileSync(new URL('./lastResults.json', import.meta.url), JSON.stringify(results));
await b.close();
