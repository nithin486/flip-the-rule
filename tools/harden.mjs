// Hardens proven levels without breaking them: lines every platform face the proven route never comes near with spikes
// (some hidden), so any off-route move is punished. Spikes do not change physics, so the proven inputs still win;
// verifyFx replays them in the real game to make sure. Writes tools/hard/L<N>.json (read by assembleProved).
import fs from 'fs';
const R = 17;                       // player radius
const FIRST = 4;                    // levels 1-3 stay gentle (first minute)
const margin = (i) => (i < 11 ? 40 : i < 21 ? 28 : 20); // px of clearance kept around the proven route
const near = (a, b, d) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < d * d;
let total = 0;
for (let i = 1; i <= 60; i++) {
  const j = JSON.parse(fs.readFileSync(new URL(`./proved/L${i}.json`, import.meta.url)));
  if (i < FIRST) { fs.writeFileSync(new URL(`./hard/L${i}.json`, import.meta.url), JSON.stringify(j)); continue; }
  const l = j.level, M = margin(i);
  // dense route: interpolate the 3-frame track to <=4 px steps
  const pts = [];
  for (let k = 0; k < j.track.length; k++) {
    const [x, y] = j.track[k], n = j.track[k + 1];
    pts.push({ x, y });
    if (n) { const d = Math.hypot(n[0] - x, n[1] - y), s = Math.ceil(d / 4); for (let q = 1; q < s; q++) pts.push({ x: x + (n[0] - x) * q / s, y: y + (n[1] - y) * q / s }); }
  }
  const keep = [l.playerStart, l.exit, l.collectible, ...(l.checkpoints ?? []), ...(l.switches ?? []), ...(l.refills ?? []), ...(l.orbs ?? []), ...(l.portals ?? [])].filter(Boolean);
  const add = [];
  const faces = [];
  for (const p of l.platforms) {
    const k = p.kind ?? 'solid';
    if (!['solid', 'ice', 'conveyor'].includes(k) || p.width < 60) continue;
    if (p.y > 110) faces.push({ p, dir: 'up', y: p.y - 14 });          // strip sits on top
    if (p.y + p.height < 440) faces.push({ p, dir: 'down', y: p.y + p.height }); // strip hangs below
  }
  const existing = l.hazards.filter((h) => h.type === 'spike');
  let n = 0;
  for (const f of faces) {
    const x0 = f.p.x, x1 = f.p.x + f.p.width; const blocked = [];
    const sy0 = f.y, sy1 = f.y + 14;
    for (const q of pts) { if (q.x < x0 - R - M || q.x > x1 + R + M) continue; const dy = q.y < sy0 ? sy0 - q.y : q.y > sy1 ? q.y - sy1 : 0; if (dy < R + M) blocked.push([q.x - R - M, q.x + R + M]); }
    for (const h of existing) if (h.dir === f.dir && Math.abs(h.y - f.y) < 20) blocked.push([h.x - 6, h.x + h.width + 6]);
    for (const h of l.hazards) if (h.type === 'saw' && !h.path && Math.abs(h.y - (f.y + 7)) < 40) blocked.push([h.x - 30, h.x + 30]);
    for (const q of keep) if (Math.abs(q.y - (f.y + 7)) < 90) blocked.push([q.x - 80, q.x + 80]);
    for (const d of l.doors ?? []) blocked.push([d.x - 20, d.x + d.width + 20]);
    for (const z of l.zones ?? []) if (z.y < sy1 && z.y + z.height > sy0) blocked.push([z.x - 10, z.x + z.width + 10]);
    blocked.sort((a, b) => a[0] - b[0]);
    let cur = x0 + 4;
    const free = [];
    for (const [a, b] of blocked) { if (a > cur) free.push([cur, Math.min(a, x1 - 4)]); cur = Math.max(cur, b); if (cur >= x1) break; }
    if (cur < x1 - 4) free.push([cur, x1 - 4]);
    for (const [a, b] of free) {
      const w = Math.floor((b - a) / 20) * 20; if (w < 40) continue;
      const sx = Math.round(a + (b - a - w) / 2);
      // every third new strip hides until you are close: safe-looking ledges are not safe
      const hidden = (i >= 6) && ((sx + i) % 3 === 0);
      add.push({ type: 'spike', x: sx, y: f.y, width: w, dir: f.dir, ...(hidden ? { hidden: true } : {}), auto: 1 }); n++;
    }
  }
  l.hazards = [...l.hazards.filter((h) => !h.auto), ...add];
  total += n; console.log(`L${i}: +${n} spike strips (margin ${M})`);
  fs.writeFileSync(new URL(`./hard/L${i}.json`, import.meta.url), JSON.stringify(j));
}
console.log('total', total);
