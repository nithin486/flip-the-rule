/* Injected into the running game page. Best-first search over macro inputs using the REAL game physics
 * (the same stepSim() the player uses), with snapshot/restore for branching. Then re-verifies the found
 * solution by replaying it from a fresh level load. */
window.__solve = async function (level, opts) {
  opts = Object.assign({ hw: 0.12, macro: 8, maxNodes: 120000, needStar: false, maxSeconds: 90, maxFlips: 99, fw: 70, kq: 1 }, opts);
  const g = window.__ftr.game;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  async function load() {
    g.scene.stop('Gameplay'); await frame();
    g.scene.start('Gameplay', { level: JSON.parse(JSON.stringify(level)), headless: true });
    for (let i = 0; i < 200; i++) { await frame(); const s = g.scene.getScene('Gameplay'); if (s && s.ready && s.level && s.level.id === level.id && s.t === 0) { s.manual = true; return s; } }
    throw new Error('level failed to load');
  }
  let s = await load();
  const lcm = (a, b) => { const gcd = (x, y) => (y ? gcd(y, x % y) : x); return (a / gcd(a, b)) * b; };
  let P = 1; const periods = [];
  for (const p of level.platforms) if (p.path) periods.push(p.path.period);
  for (const h of level.hazards) if (h.type === 'saw' && h.path) periods.push(h.path.period);
  for (const x of periods) P = lcm(P, Math.max(1, Math.round(x)));
  const hasT = periods.length > 0;
  const R = opts.macro;
  const ACTS = [];
  for (const f of [0, 1]) for (const d of [0, 1, -1]) ACTS.push({ l: d < 0, r: d > 0, f: !!f });
  const key = (sn) => {
    const sw = sn.sw.join(',');
    const falls = sn.falls.map((a) => a[0]).join('');
    return [Math.round(sn.px / (7 * opts.kq)), Math.round(sn.py / (7 * opts.kq)), Math.round(sn.vx / (45 * opts.kq)), Math.round(sn.vy / (90 * opts.kq)), sn.grav[0], sn.collected ? 1 : 0, sw, falls, sn.teleCd > 0 ? 1 : 0, sn.cd > 0 ? 1 : 0, sn.cp, sn.flips, String(sn.rf), sn.zin.join(''), hasT ? Math.floor((sn.t % P) * 5) : 0].join('|');
  };
  // binary heap
  const heap = [];
  const push = (n) => { heap.push(n); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p].c <= heap[i].c) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l].c < heap[m].c) m = l; if (r < heap.length && heap[r].c < heap[m].c) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const start = s.snapshot();
  const seen = new Map(); seen.set(key(start), 0);
  push({ snap: start, c: 0, flips: 0, frames: 0, parent: null, act: null });
  let nodes = 0, found = null, bestH = null; const t0 = performance.now();
  while (heap.length && nodes < opts.maxNodes) {
    if ((performance.now() - t0) / 1000 > opts.maxSeconds) break;
    const n = pop(); nodes++;
    if (n.frames > 60 * 70) continue;
    for (const a of ACTS) {
      const wantFlip = a.f;
      s.restore(n.snap, { keepClock: false });
      s.status = 'play';
      const st = s.simFrames({ left: a.l, right: a.r, flip: wantFlip }, R);
      if (st === 'dead') continue;
      const fl = n.flips + (wantFlip && n.snap.cd <= 0 ? 1 : 0);
      if (st === 'won') {
        if (opts.needStar && !s.collected) continue;
        if (s.flips > opts.maxFlips) continue;
        found = { parent: n, act: a, flips: s.flips, frames: n.frames + R }; break;
      }
      const sn = s.snapshot();
      if (sn.flips > opts.maxFlips) continue;
      if (wantFlip && sn.flips === n.snap.flips) continue; // flip was refused by cooldown: identical to no-flip branch
      const k = key(sn); const cost = sn.flips * opts.fw + n.frames + R; const hh = (opts.split && sn.py < opts.split ? Math.abs(sn.px - opts.dropX) + Math.abs(opts.dropX - level.exit.x) : Math.abs(sn.px - level.exit.x)) * opts.hw;
      if (seen.has(k) && seen.get(k) <= cost) continue;
      seen.set(k, cost);
      if (!bestH || hh < bestH.h) bestH = { h: Math.round(hh), x: Math.round(sn.px), y: Math.round(sn.py), f: sn.flips, g: sn.grav };
      push({ snap: sn, c: cost + hh, g: cost, flips: sn.flips, frames: n.frames + R, parent: n, act: a });
    }
    if (found) break;
  }
  const out = { nodes, ms: Math.round(performance.now() - t0), solved: false, bestH };
  if (!found) return out;
  const acts = [found.act]; for (let n = found.parent; n && n.parent; n = n.parent) acts.push(n.act);
  acts.reverse();
  // Replay from a fresh load with the exact same macro sequence.
  s = await load();
  const track = []; let f = 0; let ok = false;
  track.push([Math.round(s.player.x), Math.round(s.player.y)]);
  for (const a of acts) {
    for (let i = 0; i < R && s.status === 'play'; i++) {
      s.stepSim({ left: a.l, right: a.r, flip: a.f && i === 0 }); f++;
      if (f % 3 === 0) track.push([Math.round(s.player.x), Math.round(s.player.y)]);
    }
  }
  ok = s.status === 'won';
  out.solved = true; out.verified = ok; out.flips = s.flips; out.seconds = +(f / 60).toFixed(2); out.collected = s.collected; out.taken = s.refillsTaken; out.macro = R;
  out.inputs = acts.map((a) => (a.f ? 'F' : '') + (a.l ? 'L' : a.r ? 'R' : '.')).join(' ');
  out.track = track;
  return out;
};
