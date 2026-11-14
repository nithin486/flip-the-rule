// Usage: node tools/buildHard.mjs [ids...]  (dev server on URL, default :5173). Generates candidates, proves them with the physics solver,
// tightens the flip count, and writes tools/hard/L<id>.json (accepted level + solution track).
import { createRequire } from 'module';
import fs from 'fs';
import { genLevel, N_TABLE } from './gen.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.env.URL || 'http://localhost:5173/';
const dir = new URL('./hard/', import.meta.url); fs.mkdirSync(dir, { recursive: true });
const ids = process.argv.slice(2).map(Number); const todo = (ids.length ? ids : Array.from({ length: 40 }, (_, i) => i + 1)).filter((i) => !fs.existsSync(new URL(`L${i}.json`, dir)) || ids.length);
const SEEDS = +(process.env.SEEDS || 10);
const b = await chromium.launch();
const hint = (l) => (l.exit.y > 320 && l.playerStart.y < 300 ? { split: 295, dropX: 910 } : {});
const strip = (l) => { const c = JSON.parse(JSON.stringify(l)); delete c.flipLimit; return c; };
await Promise.all([0, 1, 2, 3].map(async (w) => {
  const p = await b.newPage({ viewport: { width: 480, height: 270 } });
  await p.goto(url); await p.waitForTimeout(3500); await p.addScriptTag({ path: new URL('./pageSolver.js', import.meta.url).pathname });
  for (let i = w; i < todo.length; i += 4) {
    const id = todo[i], N = N_TABLE[id - 1]; let best = null;
    for (let seed = +(process.env.S0 || 1); seed <= SEEDS && !(best && best.level.flipTarget >= N); seed++) {
      const lv = genLevel(id, seed);
      let r = null;
      for (const [hw, macro] of [[0.3, 8], [0.12, 8], [0.5, 10]]) {
        r = await p.evaluate(([l, hw, macro, H]) => window.__solve(l, { needStar: true, hw, macro, maxNodes: 70000, maxSeconds: 25, ...H }), [strip(lv), hw, macro, hint(lv)]).catch((e) => ({ err: String(e) }));
        if (r.solved && r.verified) break;
      }
      if (!(r && r.solved && r.verified)) { console.log(`L${id} seed${seed}: unsolved`); continue; }
      let cur = r;
      // tighten: keep asking for fewer flips until the solver cannot find one
      for (let k = 0; k < 4; k++) {
        const t = await p.evaluate(([l, mf, H]) => window.__solve(l, { needStar: true, hw: 0.3, macro: 8, maxNodes: 70000, maxSeconds: 25, maxFlips: mf, ...H }), [strip(lv), cur.flips - 1, hint(lv)]).catch(() => ({}));
        if (t.solved && t.verified && t.flips < cur.flips) cur = t; else break;
      }
      const K = cur.flips;
      console.log(`L${id} seed${seed}: K=${K} (want>=${N - 1}) t=${cur.seconds}s taken=${cur.taken}`);
      if (best && K <= best.level.flipTarget) continue;
      if (K < Math.max(2, Math.ceil(N * +(process.env.RATIO || 0.6))) || K > N + 3) continue;
      const limit = Math.max(1, K - (cur.taken || 0)) + 1;
      lv.flipTarget = K; lv.flipLimit = limit; lv.parTime = Math.round(cur.seconds * 1.7 + 10);
      // confirm solvable with the limit ACTIVE using the real rule (replay)
      const ok = await p.evaluate(([l, acts, mc]) => (async () => {
        const g = window.__ftr.game; g.scene.stop('Gameplay'); await new Promise((r) => requestAnimationFrame(r));
        g.scene.start('Gameplay', { level: l, headless: true });
        let s; for (let i = 0; i < 200; i++) { await new Promise((r) => requestAnimationFrame(r)); s = g.scene.getScene('Gameplay'); if (s && s.ready && s.level.id === l.id && s.t === 0) break; }
        s.manual = true; const R = mc; const A = acts.split(' ');
        for (const a of A) { const f = a.startsWith('F'); const d = a.slice(f ? 1 : 0); for (let i = 0; i < R && s.status === 'play'; i++) s.stepSim({ left: d === 'L', right: d === 'R', flip: f && i === 0 }); }
        return s.status === 'won' && s.collected;
      })(), [lv, cur.inputs, cur.macro]).catch(() => false);
      if (!ok) { console.log(`L${id} seed${seed}: limit replay FAILED`); continue; }
      if (!best || K > best.level.flipTarget) best = { level: lv, track: cur.track };
    }
    if (best) { fs.writeFileSync(new URL(`L${id}.json`, dir), JSON.stringify(best)); console.log(`== L${id} ACCEPTED K=${best.level.flipTarget} limit=${best.level.flipLimit}`); }
    else console.log(`== L${id} NO CANDIDATE`);
  }
  await p.close();
}));
await b.close();
