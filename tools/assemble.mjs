// Assemble tools/hard/L*.json (+ mirrored fillers for any level the generator could not prove) into levels/world1-8.json
import fs from 'fs';
import { NAMES } from './gen.mjs';
const dir = new URL('./hard/', import.meta.url);
const have = {}; for (let i = 1; i <= 40; i++) { const f = new URL(`L${i}.json`, dir); if (fs.existsSync(f)) have[i] = JSON.parse(fs.readFileSync(f)); }
const mx = (x, w = 0) => Math.round(960 - x - w);
const mirror = (src, id) => {
  const l = JSON.parse(JSON.stringify(src.level));
  l.id = id; l.world = Math.ceil(id / 5); l.name = NAMES[id - 1]; delete l.hint;
  l.playerStart.x = mx(l.playerStart.x); l.exit.x = mx(l.exit.x); l.collectible.x = mx(l.collectible.x);
  for (const p of l.platforms) { p.x = mx(p.x, p.width); if (p.path) p.path.dx = -p.path.dx; if (p.kind === 'conveyor') p.speed = -p.speed; }
  for (const h of l.hazards) { if (h.type === 'spike') h.x = mx(h.x, h.width); else { h.x = mx(h.x); if (h.path) h.path.dx = -h.path.dx; } }
  for (const s of l.switches || []) s.x = mx(s.x);
  for (const d of l.doors || []) d.x = mx(d.x, d.width);
  for (const r of l.refills || []) r.x = mx(r.x);
  return { level: l, track: src.track.map(([x, y]) => [mx(x), y]) };
};
const ids = Object.keys(have).map(Number).sort((a, b) => a - b);
const used = {}, mirrored = [];
for (let id = 1; id <= 40; id++) {
  if (have[id]) continue;
  const orig = ids.filter((x) => !mirrored.some((m) => m.startsWith(x + '<-')) && !used[x]);
  let d;
  if (id >= 31) d = orig.sort((a, b) => have[b].level.flipTarget - have[a].level.flipTarget || b - a)[0];
  else d = orig.filter((x) => Math.abs(x - id) <= 6).sort((a, b) => Math.abs(a - id) - Math.abs(b - id))[0];
  d ??= orig.sort((a, b) => have[b].level.flipTarget - have[a].level.flipTarget)[0] ?? ids[0];
  used[d] = 1; have[id] = mirror(have[d], id); mirrored.push(`${id}<-${d}`);
}
const sol = {}, tg = {};
for (let w = 1; w <= 8; w++) {
  const arr = []; for (let i = (w - 1) * 5 + 1; i <= w * 5; i++) { const { level, track } = have[i]; level.world = w; arr.push(level); sol[i] = track; tg[i] = { flipTarget: level.flipTarget, parTime: level.parTime }; }
  fs.writeFileSync(new URL(`../levels/world${w}.json`, import.meta.url), JSON.stringify(arr, null, 1));
}
fs.writeFileSync(new URL('../levels/solutions.json', import.meta.url), JSON.stringify(sol));
fs.writeFileSync(new URL('./targets.json', import.meta.url), JSON.stringify(tg, null, 1));
console.log('assembled 40; generated', ids.length, 'mirrored', mirrored.join(' '));
console.log(Object.keys(tg).map((i) => `${i}:${have[i].level.flipTarget}/${have[i].level.flipLimit}`).join(' '));
