// Automated QA for the spec's checklist. Usage: URL=http://localhost:5173/ node tools/qa.mjs
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.env.URL || 'http://localhost:5173/';
const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].flatMap((w) => JSON.parse(fs.readFileSync(new URL(`../levels/world${w}.json`, import.meta.url))));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 907, height: 510 } });
const errors = []; p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|TUNNEL/.test(m.text())) errors.push(m.text()); });
await p.goto(url); await p.waitForTimeout(3500);
const res = await p.evaluate(async (all) => {
  const g = window.__ftr.game, fr = () => new Promise((r) => requestAnimationFrame(r)), out = [];
  const ok = (name, cond, info = '') => out.push([cond ? 'PASS' : 'FAIL', name, info]);
  async function load(level, headless = true) { g.scene.stop('Gameplay'); await fr(); g.scene.start('Gameplay', { level: JSON.parse(JSON.stringify(level)), headless }); let s; for (let i = 0; i < 200; i++) { await fr(); s = g.scene.getScene('Gameplay'); if (s.ready && s.level.id === level.id && s.t === 0) break; } s.manual = true; return s; }
  const N = { left: false, right: false, flip: false }, steps = (s, f, n) => { for (let i = 0; i < n && s.status === 'play'; i++) s.stepSim({ ...f, flip: i === 0 && f.flip }); };
  const mk = (o) => Object.assign({ id: 99, world: 1, name: 't', playerStart: { x: 200, y: 440 }, gravity: 'down', flipTarget: 2, exit: { x: 900, y: 60 }, platforms: [{ x: 40, y: 480, width: 600, height: 28 }, { x: 40, y: 250, width: 600, height: 28 }], hazards: [] }, o);
  // gravity
  let s = await load(mk({}));
  ok('initial gravity down', s.player.grav === 'down');
  steps(s, N, 60); const y0 = s.player.y, x0 = s.player.x;
  s.stepSim({ ...N, right: true }); steps(s, { ...N, right: true }, 20); const vx = s.player.b.velocity.x, py = s.player.y, px = s.player.x;
  s.stepSim({ ...N, right: true, flip: true });
  ok('first flip -> up', s.player.grav === 'up'); ok('flip no teleport', Math.abs(s.player.y - py) < 12 && Math.abs(s.player.x - px) < 12, `dy=${(s.player.y - py).toFixed(1)}`);
  ok('horizontal velocity preserved', Math.abs(s.player.b.velocity.x - vx) < 20, `${vx.toFixed(0)}->${s.player.b.velocity.x.toFixed(0)}`);
  const f1 = s.flips; steps(s, { ...N, right: true, flip: true }, 1); ok('cooldown blocks immediate re-flip', s.flips === f1 && s.player.grav === 'up');
  steps(s, N, 40); ok('lands on platform underside', s.player.grav === 'up' && s.player.y > 270 && s.player.y < 310 && s.player.grounded, `y=${s.player.y.toFixed(1)}`);
  steps(s, { ...N, flip: true }, 1); ok('second flip -> down', s.player.grav === 'down'); steps(s, N, 120);
  ok('lands on top of platform', s.player.y > 440 && s.player.y < 470 && s.status === 'play', `y=${s.player.y.toFixed(1)}`);
  // no tunnelling at terminal speed: drop from high above onto a thin platform
  s = await load(mk({ playerStart: { x: 300, y: 70 }, platforms: [{ x: 40, y: 520, width: 600, height: 16 }] })); steps(s, N, 140);
  ok('no tunnelling at max fall speed', s.status === 'play' && s.player.y < 525 && s.player.y > 480, `y=${s.player.y.toFixed(1)} v=${s.player.b.velocity.y.toFixed(0)}`);
  // hazards / star / exit
  s = await load(mk({ platforms: [{ x: 40, y: 480, width: 600, height: 28 }], hazards: [{ type: 'spike', x: 180, y: 466, width: 80, dir: 'up' }] })); steps(s, N, 120); ok('spikes kill', s.status === 'dead');
  s = await load(mk({ collectible: { x: 300, y: 450 }, exit: { x: 500, y: 450 }, platforms: [{ x: 40, y: 480, width: 600, height: 28 }] })); steps(s, { ...N, right: true }, 120);
  ok('star collected', s.collected); ok('exit completes level', s.status === 'won');
  s = await load(mk({ exit: { x: 500, y: 450 }, platforms: [{ x: 40, y: 480, width: 600, height: 28 }] })); steps(s, { ...N, right: true }, 120); const w1 = s.status; steps(s, { ...N, right: true }, 10);
  ok('input stops after completion', w1 === 'won' && s.status === 'won');
  // falling platform + checkpoint + door
  s = await load(mk({ platforms: [{ x: 40, y: 480, width: 600, height: 28, kind: 'falling' }] })); steps(s, N, 120);
  ok('falling platform collapses -> player falls (death)', s.platforms[0].state === 2 && s.status === 'dead');
  s = await load(mk({ gravity: 'up', playerStart: { x: 300, y: 300 }, checkpoints: [{ x: 300, y: 300 }], platforms: [{ x: 40, y: 250, width: 600, height: 28 }] })); steps(s, N, 30);
  ok('checkpoint stores gravity direction', s.cpSnap && s.cpSnap.grav === 'up');
  // portal sanity + validation
  const lv = (await import(location.origin + '/src/systems/LevelSystem.ts')).LevelSystem;
  const probs = lv.validateAll(); ok('all 60 levels validate', probs.length === 0 && lv.count() === 60, probs.join('; '));
  ok('every level has a flip limit >= par and a ghost solution', all.every((l) => l.flipLimit + (l.refills?.length ?? 0) >= l.flipTarget && lv.solution(l.id)?.length > 3));
  // flip limit: exceeding it ends the attempt
  s = await load(mk({ flipLimit: 2, platforms: [{ x: 40, y: 480, width: 600, height: 28 }, { x: 40, y: 250, width: 600, height: 28 }] })); s.manual = true;
  for (let k = 0; k < 3; k++) { steps(s, { ...N, flip: true }, 1); steps(s, N, 30); }
  ok('third flip with limit 2 -> out of flips (death)', s.status === 'dead' || s.flips <= 2 && s.status !== 'play', `flips=${s.flips} status=${s.status}`);
  // flip crystal refills +1
  s = await load(mk({ flipLimit: 1, refills: [{ x: 300, y: 440 }], platforms: [{ x: 40, y: 480, width: 600, height: 28 }, { x: 40, y: 250, width: 600, height: 28 }] })); steps(s, { ...N, right: true }, 30);
  ok('crystal adds a flip', s.refillsTaken === 1 && s.flipCap === 2, `taken=${s.refillsTaken} cap=${s.flipCap}`);
  // saving
  const save = (await import(location.origin + '/src/systems/SaveSystem.ts'));
  localStorage.setItem('upside-down-run.save', '{not json'); ok('corrupted save does not crash', save.save.load().unlockedLevel === 1);
  ok('garbage fields sanitised', save.sanitize({ unlockedLevel: 'x', stars: { 1: 99, foo: 2 }, settings: 5 }).stars['1'] === 3);
  ok('outdated (v0) save migrates', save.sanitize({ unlockedLevel: 4, stars: { 1: 3 } }).unlockedLevel === 4);
  // progression through real win()
  save.save.reset(); s = await load(all[0], false); s.manual = true; s.collected = true; s.flips = 1; s.win(); await new Promise((r) => setTimeout(r, 300));
  ok('completing level unlocks next + saves 3 stars', save.save.data.unlockedLevel === 2 && save.save.stars(1) === 3);
  const best = save.save.data.bestScores['1']; s = await load(all[0], false); s.manual = true; s.flips = 9; s.win(); await new Promise((r) => setTimeout(r, 300));
  ok('replay does not erase a better result', save.save.stars(1) === 3 && save.save.data.bestScores['1'] === best);
  const reloaded = save.save.load(); ok('reload restores progress', reloaded.unlockedLevel === 2 && reloaded.stars['1'] === 3);
  // restart leak test
  s = await load(all[10], false); s.manual = true; const c0 = s.children.list.length;
  for (let i = 0; i < 60; i++) s.restartLevel(); ok('60 restarts: display list stable', s.children.list.length === c0, `${c0}->${s.children.list.length}`);
  const t0 = g.textures.list ? Object.keys(g.textures.list).length : 0;
  for (let i = 0; i < 8; i++) { g.scene.stop('Gameplay'); await fr(); g.scene.start('Gameplay', { levelId: 5 }); await new Promise((r) => setTimeout(r, 150)); }
  ok('scene re-creation does not leak textures', (Object.keys(g.textures.list).length - t0) < 12, `${t0}->${Object.keys(g.textures.list).length}`);
  save.save.reset();
  return out;
}, all);
let fail = 0; for (const [r, n, i] of res) { if (r === 'FAIL') fail++; console.log(r, n, i); }
console.log('console errors:', errors.length ? errors : 'none'); await b.close(); process.exit(fail || errors.length ? 1 : 0);
