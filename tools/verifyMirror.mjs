import { createRequire } from 'module'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const all = [1,2,3,4,5,6,7,8].flatMap((w) => JSON.parse(fs.readFileSync(new URL(`../levels/world${w}.json`, import.meta.url)))); const byId = Object.fromEntries(all.map((l) => [l.id, l]));
const pairs = process.argv.slice(2).map((s) => s.split('<-').map(Number));
const hint = (l) => (l.exit.y > 320 && l.playerStart.y < 300 ? { split: 295, dropX: 910 } : {});
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 480, height: 270 } });
await p.goto('http://localhost:5173/'); await p.waitForTimeout(3500); await p.addScriptTag({ path: new URL('./pageSolver.js', import.meta.url).pathname });
for (const [m, d] of pairs) {
  const D = byId[d], M = byId[m]; let r = {};
  for (const [hw, macro, fw] of [[0.3, 8, 70], [0.3, 8, 15], [0.12, 8, 70], [0.5, 10, 15]]) { r = await p.evaluate(([l, o]) => window.__solve(l, { needStar: true, maxNodes: 90000, maxSeconds: 30, ...o }), [D, { hw, macro, fw, ...hint(D) }]).catch(() => ({})); if (r.solved && r.verified) break; }
  if (!(r.solved && r.verified)) { console.log(`${m}<-${d}: donor unsolved`); continue; }
  const inv = r.inputs.split(' ').map((a) => a.replace('L', 'x').replace('R', 'L').replace('x', 'R')).join(' ');
  const ok = await p.evaluate(([l, acts, mc]) => (async () => {
    const g = window.__ftr.game; g.scene.stop('Gameplay'); await new Promise((r) => requestAnimationFrame(r));
    g.scene.start('Gameplay', { level: l, headless: true });
    let s; for (let i = 0; i < 200; i++) { await new Promise((r) => requestAnimationFrame(r)); s = g.scene.getScene('Gameplay'); if (s && s.ready && s.level.id === l.id && s.t === 0) break; }
    s.manual = true; for (const a of acts.split(' ')) { const f = a.startsWith('F'); const d = a.slice(f ? 1 : 0); for (let i = 0; i < mc && s.status === 'play'; i++) s.stepSim({ left: d === 'L', right: d === 'R', flip: f && i === 0 }); }
    return [s.status, s.collected, s.flips];
  })(), [M, inv, r.macro]);
  console.log(`${m}<-${d}: donor flips=${r.flips} mirrored replay=${JSON.stringify(ok)} limit=${M.flipLimit}`);
}
await b.close();
