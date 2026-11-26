// Replays every proved solution in the REAL (fx-on) game scene and checks it wins within the flip limit.
import { createRequire } from 'module'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 960, height: 540 } })).newPage();
await p.goto('http://localhost:5173'); await p.waitForTimeout(3000);
let bad = 0;
for (let id = 1; id <= 60; id++) {
  const j = JSON.parse(fs.readFileSync(`tools/proved/L${id}.json`));
  const r = await p.evaluate(async ([id, j]) => {
    const g = window.__ftr.game; const fr = () => new Promise((r) => requestAnimationFrame(() => r()));
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.sys.settings.key)); await fr();
    g.scene.start('Gameplay', { levelId: id });
    for (let i = 0; i < 100; i++) { await fr(); const s = g.scene.getScene('Gameplay'); if (s && s.ready) break; }
    const s = g.scene.getScene('Gameplay'); s.manual = true; s.physics.world.isPaused = true; s.restore(s.startSnap, { keepClock: false }); s.status = 'play';
    let st = 'play'; for (const tok of j.inputs.split(' ')) { st = s.simFrames({ left: tok.endsWith('L'), right: tok.endsWith('R'), flip: tok.startsWith('F') }, j.macro); if (st !== 'play') break; }
    return { st, flips: s.flips };
  }, [id, j]);
  if (r.st !== 'won') { bad++; console.log('FAIL L' + id, JSON.stringify(r)); }
}
console.log(bad ? bad + ' failing' : 'all 60 proven solutions win in the real game scene (flip limits on)'); await b.close();
