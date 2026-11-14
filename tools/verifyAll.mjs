import { createRequire } from 'module'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const all = [1,2,3,4,5,6,7,8].flatMap((w) => JSON.parse(fs.readFileSync(new URL(`../levels/world${w}.json`, import.meta.url))));
const b = await chromium.launch(); const res = {};
const hint = (l) => (l.exit.y > 320 && l.playerStart.y < 300 ? { split: 295, dropX: 910 } : {});
await Promise.all([0, 1].map(async (w) => {
  const p = await b.newPage({ viewport: { width: 480, height: 270 } });
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(3500); await p.addScriptTag({ path: new URL('./pageSolver.js', import.meta.url).pathname });
  for (let i = w; i < all.length; i += 2) {
    const l = all[i];
    // real rules: flip limit ACTIVE (level kept as authored), star required
    let r = {};
    for (const [hw, macro, fw] of [[0.3, 8, 15], [0.3, 8, 70], [0.12, 8, 70], [0.5, 10, 15]]) { r = await p.evaluate(([l, o]) => window.__solve(l, { needStar: true, maxNodes: 90000, maxSeconds: 30, ...o }), [l, { hw, macro, fw, ...hint(l) }]).catch((e) => ({ err: String(e) })); if (r.solved && r.verified) break; }
    // tightness: with one flip fewer than par, the star run must be impossible (best effort)
    const t = r.solved ? await p.evaluate(([l, o]) => window.__solve(l, { needStar: true, maxNodes: 60000, maxSeconds: 20, ...o }), [{ ...l, flipLimit: Math.max(0, l.flipTarget - 1 - 0) }, { hw: 0.3, macro: 8, fw: 15, maxFlips: l.flipTarget - 1, ...hint(l) }]).catch(() => ({})) : {};
    res[l.id] = { ok: !!(r.solved && r.verified), flips: r.flips, limit: l.flipLimit, par: l.flipTarget, tighter: !!(t.solved && t.verified) };
    console.log(`L${l.id} ${l.name}: ${res[l.id].ok ? 'OK' : 'FAIL'} flips=${r.flips} par=${l.flipTarget} limit=${l.flipLimit}${res[l.id].tighter ? '  (solvable with fewer than par!)' : ''}`);
  }
}));
fs.writeFileSync('/tmp/verifyAll.json', JSON.stringify(res)); await b.close();
