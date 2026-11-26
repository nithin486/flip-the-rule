// Usage (dev server on :5180): node tools/record-preview.cjs land store/preview-landscape.mp4 | node tools/record-preview.cjs port store/preview-portrait.mp4
// Frame-exact gameplay capture: the game loop is paused and stepped manually (2 sim steps per 30 fps frame),
// each frame screenshotted, then ffmpeg builds the MP4. Inputs = the solver-proven solutions.
const { chromium } = require('playwright'); const fs = require('fs'); const { execSync } = require('child_process');
const [mode, out] = [process.argv[2] || 'land', process.argv[3] || 'preview-landscape.mp4'];
const LEVELS = [48, 51, 58, 23, 60];
(async () => {
  const b = await chromium.launch();
  const vp = mode === 'land' ? { width: 960, height: 540 } : { width: 480, height: 720 };
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2, hasTouch: mode !== 'land', isMobile: mode !== 'land' });
  await p.addInitScript(() => { try { localStorage.setItem('upside-down-run.save', JSON.stringify({ v: 1, unlockedLevel: 60, stars: {}, settings: { music: false, sound: false } })); } catch {} });
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(2500);
  const dir = `/tmp/vid-${mode}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  let n = 0; const shot = async () => { await p.screenshot({ path: `${dir}/f${String(n++).padStart(5, '0')}.png` }); };
  for (const id of LEVELS) {
    const j = JSON.parse(fs.readFileSync(`tools/proved/L${id}.json`));
    await p.evaluate(async (id) => {
      const g = window.__ftr.game; g.loop.wake(); g.scene.getScenes(true).forEach(s => s.scene.stop()); document.getElementById('touch-ui')?.remove();
      await new Promise(r => setTimeout(r, 50)); g.scene.start('Gameplay', { levelId: id });
      for (let i = 0; i < 200; i++) { await new Promise(r => requestAnimationFrame(r)); const s = g.scene.getScene('Gameplay'); if (s && s.ready && s.level.id === id) break; }
      const s = g.scene.getScene('Gameplay'); s.manual = true; g.loop.sleep(); window.__T = performance.now();
      window.__frame = (sim) => { for (let k = 0; k < 2; k++) if (sim && sim.length) { const a = sim.shift(); if (s.status === 'play') s.stepSim(a); } window.__T += 33.333; g.step(window.__T, 33.333); return s.status; };
    }, id);
    // expand the macro inputs into per-step input frames
    const steps = []; for (const tok of j.inputs.split(' ')) for (let i = 0; i < j.macro; i++) steps.push({ left: tok.endsWith('L'), right: tok.endsWith('R'), flip: tok.startsWith('F') && i === 0 });
    await p.evaluate((st) => { window.__steps = st; }, steps);
    for (let f = 0; f < 10; f++) { await p.evaluate(() => window.__frame([])); await shot(); } // a beat to read the level
    let st = 'play'; while (st === 'play') { st = await p.evaluate(() => window.__frame(window.__steps)); await shot(); if (n > 4000) break; }
    for (let f = 0; f < 22; f++) { await p.evaluate(() => window.__frame([])); await shot(); } // win burst
  }
  await b.close();
  const W = mode === 'land' ? 1920 : 720, H = mode === 'land' ? 1080 : 1080;
  execSync(`ffmpeg -y -loglevel error -framerate 30 -i ${dir}/f%05d.png -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p" -c:v libx264 -preset slow -crf 20 -an -movflags +faststart ${out}`);
  console.log(out, n, 'frames', (n / 30).toFixed(1) + 's');
})();
