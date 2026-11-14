// Procedural hard-level generator. Levels are "corridors" whose floor/ceiling exist only where the intended route needs them,
// so every window forces a flip. Hazards, moving parts, ice, portals, gates and crystals are layered on by world.
// Every candidate is then proven (or rejected) by the physics solver (tools/buildHard.mjs).
const T = 28;
export const NAMES = ['First Flip','Up And Over','Three Doors','Tight Squeeze','Window Pane', 'Double Decker','Spiked Landing','Needle Alley','Star Gazer','Skyline Rush',
  'Wobble Walk','Moving Day','Sawmill','Drift','Metronome', 'Warp Gate','Locked Out','Skip Stone','Key Master','Event Horizon',
  'Black Ice','Conveyor Chaos','Slip Stream','Frozen Gears','Whiteout', 'Crystal Clear','Pulse Rate','Shard Run','Glow Worm','Heartbeat',
  'Overclock','Rust Belt','Pressure Cooker','Meltdown','Critical Mass', 'Zero G','Flipside','Rule Breaker','Mind The Gap','Final Flip'];
export const N_TABLE = [2,3,3,4,4, 4,5,5,6,6, 5,6,6,7,7, 5,6,6,7,7, 6,6,7,7,8, 7,7,8,8,9, 7,8,8,9,9, 8,9,9,10,10];
const WW = (id) => Math.round(150 - (id - 1) * 1.6);           // overlap-zone width: 150 -> ~88
export function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function genLevel(id, seed) {
  const R = mulberry(id * 9973 + seed * 131), rnd = (a, b) => a + R() * (b - a), pick = (a) => a[Math.floor(R() * a.length)], mild = seed >= 4 ? 0.4 : 1, chance = (p) => R() < p * (p < 0.99 ? 1 : 1);
  const world = Math.ceil(id / 5), idx = (id - 1) % 5, N = N_TABLE[id - 1];
  const two = id > 5;
  const n1 = !two ? N : N >= 9 ? 6 : N >= 6 ? 4 : 2, n2 = two ? N - n1 : 0;
  const plats = [], haz = [], portals = [], switches = [], doors = [], refills = [];
  const f = { // feature flags by world
    spikes: true, spikeP: 0.25 + world * 0.08, saws: world >= 3 && chance(0.5 + world * 0.05), moving: world >= 3, portal: world === 4 || world >= 7 && chance(0.4),
    gate: world === 4 || world >= 7 && chance(0.5), ice: world >= 5, conv: world >= 5, crystal: world >= 6, pulse: world >= 6, falling: world >= 8 && chance(0.6),
  };
  let ww0 = WW(id);
  const rows = [];
  const mk = (n, dir, FT, CU, lowerY, upperY, startU, endU, rowIdx) => {
    let ww = ww0; const p1 = startU;
    const lastEnd = endU - 80;
    let pitch = n > 1 ? (lastEnd - p1) / (n - 1) : 0;
    if (n > 1 && pitch < ww + 70) { ww = Math.max(70, Math.floor(pitch - 70)); }
    const p = []; for (let i = 0; i < n; i++) p.push(Math.round(p1 + i * pitch + (i > 0 && i < n - 1 ? rnd(-10, 10) : 0)));
    const segs = []; // local u ranges
    for (let k = 0; k <= n; k++) {
      const a = k === 0 ? 30 : p[k - 1] - ww / 2, b = k === n ? endU : p[k] + ww / 2;
      segs.push({ k, a, b, mode: k % 2 });
    }
    return { n, dir, FT, CU, lowerY, upperY, p, ww, segs, rowIdx };
  };
  if (!two) {
    const FT = Math.round(rnd(450, 490)), gap = Math.round(rnd(215, 250)); rows.push(mk(n1, 1, FT, FT - gap, FT, FT - gap - T, 170, 900, 0));
    rows[0].segs[0].a = 0;
  } else {
    rows.push(mk(n1, 1, 262, 100, 262, 72, 160, 900, 0)); rows[0].segs[0].a = 0; rows[0].segs[rows[0].n].b = 862;
    rows.push(mk(n2, -1, 506, 328, 506, 300, 150, 900, 1)); rows[1].segs[0].a = 0; haz.push({ type: 'spike', x: 69, y: 286, width: 812, dir: 'up' });
  }
  const X = (row, u) => (row.dir > 0 ? u : 960 - u);
  const addSeg = (row, seg, kind = 'solid', extra = {}) => {
    const a = X(row, seg.a), b = X(row, seg.b), x = Math.min(a, b), w = Math.abs(b - a);
    const y = seg.mode === 0 ? row.lowerY : row.upperY;
    plats.push({ x: Math.round(x), y, width: Math.round(w), height: T, ...(kind !== 'solid' ? { kind } : {}), ...extra });
    return plats[plats.length - 1];
  };
  // choose special segments per row
  for (const row of rows) {
    const inner = row.segs.filter((s) => s.k > 0 && s.k < row.n);
    const used = new Set();
    const take = () => { const c = inner.filter((s) => !used.has(s.k)); if (!c.length) return null; const s = pick(c); used.add(s.k); return s; };
    row.kinds = {};
    if (f.moving && chance((0.55 + idx * 0.06) * mild)) { const s = take(); if (s) row.kinds[s.k] = ['moving', { path: { dx: Math.round(rnd(40, 70)) * (chance(0.5) ? 1 : -1), dy: 0, period: pick([4, 5, 6]), phase: Math.round(R() * 100) / 100 } }]; }
    if (f.ice && chance(0.6 * mild)) { const s = take(); if (s) row.kinds[s.k] = ['ice', {}]; }
    if (f.conv && chance(0.55 * mild)) { const s = take(); if (s) row.kinds[s.k] = ['conveyor', { speed: pick([-1, 1]) * Math.round(rnd(70, 110)) }]; }
    if (f.falling && chance(mild)) { const s = take(); if (s) row.kinds[s.k] = ['falling', {}]; }
  }
  for (const row of rows) for (const seg of row.segs) {
    const kd = row.kinds[seg.k];
    if (kd && kd[0] === 'moving') {
      // moving segment moves horizontally in WORLD x; keep its flush ends by using dx in world coordinates
      const p = addSeg(row, seg, 'moving'); p.path = { ...kd[1].path, dx: kd[1].path.dx };
    } else if (kd) addSeg(row, seg, kd[0], kd[1]); else addSeg(row, seg);
  }
  // merge touching 'solid' platforms at same y (visual cleanliness)
  const byY = {}; const out = [];
  for (const p of plats) if (!p.kind) (byY[p.y] ??= []).push(p); else out.push(p);
  for (const y of Object.keys(byY)) { const a = byY[y].sort((s, t) => s.x - t.x); let cur = null; for (const p of a) { if (cur && p.x <= cur.x + cur.width) cur.width = Math.max(cur.width, p.x + p.width - cur.x); else { cur = { ...p }; out.push(cur); } } }
  // windows: hazards, star, saws, crystals
  const windows = [];
  for (const row of rows) for (let k = 0; k < row.n; k++) windows.push({ row, k, a: row.p[k] - row.ww / 2, b: row.p[k] + row.ww / 2, destMode: (k + 1) % 2 });
  const wx = (w, u) => X(w.row, u);
  const surfY = (row, mode) => (mode === 0 ? row.FT : row.CU);
  const spikeAt = (w, ua, ub, pulse, mode) => { // spikes on destination surface of window w between local u ua..ub
    const x1 = wx(w, ua), x2 = wx(w, ub), x = Math.min(x1, x2), width = Math.round(Math.abs(x2 - x1));
    const sp = mode === 0 ? { type: 'spike', x: Math.round(x), y: w.row.FT - 14, width, dir: 'up' } : { type: 'spike', x: Math.round(x), y: w.row.CU, width, dir: 'down' };
    if (pulse) { sp.period = pick([2.4, 3, 3.6]); sp.phase = Math.round(R() * 100) / 100; }
    haz.push(sp);
  };
  for (const w of windows) {
    if (w.k === 0 && id <= 2) continue;
    if (chance(f.spikeP * mild)) {
      const swd = Math.round(rnd(28, 52) / 4) * 4;
      if (chance(0.5)) spikeAt(w, w.a, w.a + swd, f.pulse && chance(0.5), w.destMode);
      else spikeAt(w, w.b - swd, w.b, f.pulse && chance(0.5), w.destMode ^ 1);
    }
    if (f.saws && chance(0.45 * mild)) {
      const gap = w.row.FT - w.row.CU, midY = (w.row.FT + w.row.CU) / 2, dy = Math.round(gap * 0.42);
      const ux = w.a + w.row.ww * rnd(0.3, 0.7);
      haz.push({ type: 'saw', x: Math.round(wx(w, ux)), y: Math.round(midY - dy / 2), r: 20, path: { dx: 0, dy, period: pick([2.6, 3.2, 4]), phase: Math.round(R() * 100) / 100 } });
    }
  }
  // star: mid-gap of a random non-first window
  const sw = windows.filter((w) => w.k > 0 || w.row.rowIdx > 0); const sWin = pick(sw.length ? sw : windows);
  const sy = (sWin.row.FT + sWin.row.CU) / 2 + rnd(-0.2, 0.2) * (sWin.row.FT - sWin.row.CU);
  const star = [Math.round(wx(sWin, sWin.a + sWin.row.ww * rnd(0.35, 0.75))), Math.round(sy)];
  if (f.crystal) { const cw = pick(windows.filter((w) => w !== sWin)); refills.push({ x: Math.round(wx(cw, cw.a + cw.row.ww * 0.3)), y: Math.round((cw.row.FT + cw.row.CU) / 2) }); }
  // gate: switch right after an early window on the destination segment, door later on a pure segment
  if (f.gate && rows[0].n >= 2) {
    const row = rows[0], k = 1; const seg = row.segs[k + 1];
    const surf = seg.mode === 0 ? row.FT : row.CU, down = seg.mode === 0;
    const su = row.p[k] + row.ww / 2 + 40; // just beyond window k (on segment k+1)
    switches.push({ id: 'a', x: Math.round(X(row, su)), y: down ? surf - 9 : surf + 9, dir: down ? 'down' : 'up' });
    const dseg = row.segs[row.n - 1]; const du = Math.round((dseg.a + row.ww + dseg.b - row.ww / 2 - 40) / 2);
    const dsurf = dseg.mode === 0; const dx = Math.round(X(row, du)) - 11;
    if (dseg.k > k + 1) doors.push({ switch: 'a', x: dx, y: row.CU, width: 22, height: row.FT - row.CU });
    else switches.length = 0;
  }
  const r0 = rows[0], start = { x: 90, y: r0.FT - 17 };
  const last = rows[rows.length - 1]; const lastSeg = last.segs[last.n]; const eu = last.dir > 0 ? 850 : 850;
  const exit = { x: Math.round(X(last, eu)), y: (lastSeg.mode === 0 ? last.FT - 17 : last.CU + 17) };
  const hints = { 1: 'Flip gravity with {flip}. Your flips are limited!', 2: 'Run out of flips and the attempt ends. Plan the route.', 3: 'Watch the flip meter in the top bar.' };
  return {
    id, world, name: NAMES[id - 1], ...(hints[id] ? { hint: hints[id] } : {}),
    playerStart: start, gravity: 'down', flipTarget: N, flipLimit: N + 2, collectible: { x: star[0], y: star[1] },
    exit, platforms: out, hazards: haz, ...(switches.length ? { switches, doors } : {}), ...(refills.length ? { refills } : {}),
  };
}
