// Usage: node tools/proveOne.mjs 1 [2 3...]   (dev server on :5173)
// Loads tools/lv/L<NN>.mjs, proves it with the physics solver, tightens the flip count, sets flipTarget/flipLimit,
// replays it with the limit ACTIVE, writes tools/proved/L<N>.json and a screenshot (SP env dir).
import { createRequire } from 'module'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const url = process.env.URL || 'http://localhost:5173/'; const SP = process.env.SP || '/tmp';
const hint = (l) => (l.exit.y > 320 && l.playerStart.y < 300 && l.__split ? { split: 295, dropX: 910 } : {});
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 960, height: 540 } });
await p.goto(url); await p.waitForTimeout(3500); await p.addScriptTag({ path: new URL('./pageSolver.js', import.meta.url).pathname });
for (const id of process.argv.slice(2).map(Number)) {
  const mod = await import(`./lv/L${String(id).padStart(2, '0')}.mjs?${Date.now()}`); const lv = mod.default; const split = lv.__split; delete lv.__split;
  const strip = JSON.parse(JSON.stringify(lv)); delete strip.flipLimit; delete strip.flipTarget;
  const H = split ? { split: 295, dropX: split } : {};
  let r = {}; const t0 = Date.now();
  for (const [hw, macro, fw] of [[0.3, 8, 15], [0.3, 8, 70], [0.12, 8, 70], [0.5, 10, 15], [0.05, 8, 70]]) {
    r = await p.evaluate(([l, o]) => window.__solve(l, { needStar: !!l.collectible, maxNodes: 120000, maxSeconds: 40, ...o }), [strip, { hw, macro, fw, ...H }]).catch((e) => ({ err: String(e) }));
    if (r.solved && r.verified) break;
  }
  if (!(r.solved && r.verified)) { console.log(`L${id} ${lv.name}: UNSOLVED  ${JSON.stringify(r.bestH || r.err || '')}`); continue; }
  let cur = r;
  for (let k = 0; k < 6; k++) {
    const t = await p.evaluate(([l, mf, o]) => window.__solve(l, { needStar: !!l.collectible, maxNodes: 120000, maxSeconds: 40, hw: 0.3, macro: 8, fw: 15, maxFlips: mf, ...o }), [strip, cur.flips - 1, H]).catch(() => ({}));
    if (t.solved && t.verified && t.flips < cur.flips) cur = t; else break;
  }
  const K = cur.flips, taken = cur.taken || 0;
  lv.flipTarget = K; lv.flipLimit = Math.max(1, K - taken) + (process.env.SPARE !== undefined ? +process.env.SPARE : 1); lv.parTime = Math.round(cur.seconds * 1.7 + 10);
  const ok = await p.evaluate(([l, acts, mc]) => (async () => {
    const g = window.__ftr.game; g.scene.stop('Gameplay'); await new Promise((r) => requestAnimationFrame(r));
    g.scene.start('Gameplay', { level: l, headless: true });
    let s; for (let i = 0; i < 200; i++) { await new Promise((r) => requestAnimationFrame(r)); s = g.scene.getScene('Gameplay'); if (s && s.ready && s.level.id === l.id && s.t === 0) break; }
    s.manual = true; for (const a of acts.split(' ')) { const f = a.startsWith('F'); const d = a.slice(f ? 1 : 0); for (let i = 0; i < mc && s.status === 'play'; i++) s.stepSim({ left: d === 'L', right: d === 'R', flip: f && i === 0 }); }
    return s.status === 'won' && (!l.collectible || s.collected);
  })(), [lv, cur.inputs, cur.macro]).catch(() => false);
  console.log(`L${id} ${lv.name}: ${ok ? 'PROVEN' : 'REPLAY-FAILED'}  par=${K} limit=${lv.flipLimit} taken=${taken} sol=${cur.seconds}s nodes=${cur.nodes} wall=${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (ok) fs.writeFileSync(new URL(`./proved/L${id}.json`, import.meta.url), JSON.stringify({ level: lv, track: cur.track, inputs: cur.inputs, macro: cur.macro }));
  // screenshot with the solution path drawn
  await p.evaluate(([l, track]) => { const g = window.__ftr.game; g.scene.stop('Gameplay'); g.scene.start('Gameplay', { level: l }); window.__track = track; }, [lv, cur.track]);
  await p.waitForTimeout(2300);
  await p.evaluate(() => { const s = window.__ftr.game.scene.getScene('Gameplay'); const g = s.add.graphics().setDepth(90); g.lineStyle(3, 0x00ff88, 0.9); const t = window.__track; if (t && t.length) { g.beginPath(); g.moveTo(t[0][0], t[0][1]); for (const q of t) g.lineTo(q[0], q[1]); g.strokePath(); } });
  await p.screenshot({ path: `${SP}/lv_${id}.png` });
  await p.evaluate(() => window.__ftr.game.scene.stop('Gameplay')); await p.waitForTimeout(400);
}
await b.close();
