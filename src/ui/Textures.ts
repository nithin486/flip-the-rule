import { save } from '../systems/SaveSystem';
import Phaser from 'phaser';
import { H, W, WORLDS, worldOfLevel } from '../config/gameConfig';

type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;
const hex = (n: number, a?: number) => a === undefined ? '#' + n.toString(16).padStart(6, '0') : `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
const mix = (a: number, b: number, t: number) => {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255, br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return ((ar + (br - ar) * t) << 16) | ((ag + (bg - ag) * t) << 8) | (ab + (bb - ab) * t);
};

export function canvasTex(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw) {
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, w, h)!;
  const c = t.getContext(); draw(c, w, h); t.refresh();
  return key;
}
const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};

// ---------------- player ----------------
export type Expr = 'idle' | 'blink' | 'happy' | 'dead' | 'flip';
export interface Skin { name: string; need: number; /** login-streak days needed instead of stars */ streak?: number; c0: string; c1: string; c2: string; glow: string; line: string }
/** Unlock by total stars collected (max 120). */
export const SKINS: Skin[] = [
  { name: 'Violet', need: 0, c0: '#c4b5fd', c1: '#8b5cf6', c2: '#5b21b6', glow: 'rgba(124,58,237,0.7)', line: '#2e1065' },
  { name: 'Sunset', need: 12, c0: '#fed7aa', c1: '#fb923c', c2: '#c2410c', glow: 'rgba(249,115,22,0.7)', line: '#431407' },
  { name: 'Mint', need: 30, c0: '#bbf7d0', c1: '#34d399', c2: '#047857', glow: 'rgba(16,185,129,0.7)', line: '#022c22' },
  { name: 'Bubblegum', need: 55, c0: '#fbcfe8', c1: '#f472b6', c2: '#be185d', glow: 'rgba(236,72,153,0.7)', line: '#500724' },
  { name: 'Gold', need: 90, c0: '#fef9c3', c1: '#fbbf24', c2: '#b45309', glow: 'rgba(245,158,11,0.8)', line: '#451a03' },
  { name: 'Frost', need: 0, streak: 2, c0: '#e0f2fe', c1: '#38bdf8', c2: '#0369a1', glow: 'rgba(56,189,248,0.8)', line: '#082f49' },
  { name: 'Ember', need: 0, streak: 3, c0: '#fecaca', c1: '#ef4444', c2: '#7f1d1d', glow: 'rgba(239,68,68,0.8)', line: '#450a0a' },
  { name: 'Galaxy', need: 0, streak: 5, c0: '#f5d0fe', c1: '#6366f1', c2: '#1e1b4b', glow: 'rgba(129,140,248,0.9)', line: '#020617' },
];
/** Is this skin unlocked for the current save? */
export const skinOpen = (i: number) => { const sk = SKINS[i]; if (!sk) return false; return sk.streak ? save.data.visits.best >= sk.streak : save.totalStars() >= sk.need; };
/** The next login-streak reward still locked (for "come back tomorrow" teasers). */
export const nextStreakSkin = () => SKINS.find((sk) => sk.streak && save.data.visits.best < sk.streak) ?? null;
export const playerKey = (e: Expr, look: number, skin = save.data.skin) => `p${skin}_${e}_${look}`;
export function drawPlayer(c: CanvasRenderingContext2D, e: Expr, look: number, sk: Skin) {
  const S = 44, cx = S / 2, cy = S / 2, R = 19;
  c.clearRect(0, 0, S, S);
  // soft outer glow, glossy candy body, dark outline
  c.shadowColor = sk.glow; c.shadowBlur = 7;
  const g = c.createRadialGradient(cx - 6, cy - 8, 1, cx + 2, cy + 3, R + 2);
  g.addColorStop(0, sk.c0); g.addColorStop(0.4, sk.c1); g.addColorStop(0.85, sk.c2); g.addColorStop(1, sk.line);
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  c.shadowBlur = 0;
  // rim light along the lower right edge
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
  c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 3; c.beginPath(); c.arc(cx - 1.5, cy - 1.5, R, Math.PI * 0.05, Math.PI * 0.55); c.stroke();
  // belly shade so the face reads as sitting on a sphere
  const bs = c.createLinearGradient(0, cy + 4, 0, cy + R); bs.addColorStop(0, 'rgba(0,0,0,0)'); bs.addColorStop(1, 'rgba(0,0,0,0.18)'); c.fillStyle = bs; c.fillRect(0, cy + 4, S, R);
  c.restore();
  c.lineWidth = 2.2; c.strokeStyle = sk.line; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  // glossy highlight (big soft one + sharp small one)
  c.fillStyle = 'rgba(255,255,255,0.32)'; c.beginPath(); c.ellipse(cx - 6, cy - 9, 8, 4.5, -0.55, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(cx - 9, cy - 11, 2.6, 1.6, -0.6, 0, Math.PI * 2); c.fill();
  // face
  const ex = 6.5, ey = cy - 1, off = look * 2.2;
  const eye = (x: number) => {
    if (e === 'blink') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 3.5, ey); c.lineTo(x + 3.5, ey); c.stroke(); return; }
    if (e === 'dead') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 3, ey - 3); c.lineTo(x + 3, ey + 3); c.moveTo(x + 3, ey - 3); c.lineTo(x - 3, ey + 3); c.stroke(); return; }
    if (e === 'happy') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, ey + 2, 3.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); return; }
    const big = e === 'flip' ? 5.6 : 4.8;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, ey, big, big + 0.8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(30,27,75,0.35)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, ey, big, big + 0.8, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = sk.c2; c.beginPath(); c.arc(x + off, ey + 0.6, e === 'flip' ? 3.2 : 3.7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1e1b4b'; c.beginPath(); c.arc(x + off, ey + 0.6, e === 'flip' ? 2.0 : 2.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x + off - 0.9, ey - 0.6, 0.9, 0, Math.PI * 2); c.fill();
  };
  eye(cx - ex + off * 0.4); eye(cx + ex + off * 0.4);
  // mouth
  c.strokeStyle = '#1e1b4b'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
  const mx = cx + off * 0.8;
  if (e === 'happy') { c.arc(mx, cy + 5, 5.5, 0.1 * Math.PI, 0.9 * Math.PI); }
  else if (e === 'dead') { c.moveTo(mx - 4, cy + 9); c.quadraticCurveTo(mx, cy + 5, mx + 4, cy + 9); }
  else if (e === 'flip') { c.fillStyle = '#1e1b4b'; c.arc(mx, cy + 8, 2.8, 0, Math.PI * 2); c.fill(); }
  else { c.arc(mx, cy + 6, 3.6, 0.15 * Math.PI, 0.85 * Math.PI); }
  c.stroke();
  // cheeks
  c.fillStyle = 'rgba(251,113,133,0.45)';
  c.beginPath(); c.arc(cx - 11 + off * 0.6, cy + 5, 2.6, 0, 7); c.arc(cx + 11 + off * 0.6, cy + 5, 2.6, 0, 7); c.fill();
}

// ---------------- backgrounds ----------------
/** Smooth hill silhouette through random control points (quadratic curves, not jagged lines). */
function hills(c: CanvasRenderingContext2D, rnd: () => number, base: number, amp: number, step: number) {
  const pts: Array<[number, number]> = [];
  for (let x = -step; x <= W + step * 2; x += step * (0.7 + rnd() * 0.6)) pts.push([x, base - amp * (0.25 + rnd() * 0.75)]);
  c.beginPath(); c.moveTo(-10, H + 10); c.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], [nx, ny] = pts[i + 1]; c.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2); }
  c.lineTo(W + 10, H + 10); c.closePath();
}
/** Soft cartoon cloud bank: overlapping puffs lit from above. */
function cloudBank(c: CanvasRenderingContext2D, rnd: () => number, cx: number, cy: number, w: number, lit: number, shade: number, a: number) {
  const n = 5 + Math.floor(rnd() * 4), puffs: Array<[number, number, number]> = [];
  for (let i = 0; i < n; i++) { const t = i / (n - 1); puffs.push([cx - w / 2 + t * w, cy - Math.sin(t * Math.PI) * w * 0.12 * (0.6 + rnd() * 0.6), w * (0.1 + Math.sin(t * Math.PI) * 0.12) * (0.7 + rnd() * 0.5)]); }
  c.fillStyle = hex(shade, a); c.beginPath(); for (const [x, y, r] of puffs) { c.moveTo(x + r, y + r * 0.18); c.arc(x, y + r * 0.18, r, 0, 7); } c.rect(cx - w / 2, cy, w, w * 0.06); c.fill();
  c.fillStyle = hex(lit, a * 0.8); c.beginPath(); for (const [x, y, r] of puffs) { c.moveTo(x - r * 0.08 + r * 0.8, y - r * 0.1); c.arc(x - r * 0.08, y - r * 0.1, r * 0.8, 0, 7); } c.fill();
}
function drawSky(c: CanvasRenderingContext2D, top: number, bottom: number, flipped: boolean, wid: number, variant = 0) {
  const th = WORLDS.find((w) => w.id === wid) ?? WORLDS[0];
  const accent = flipped ? mix(th.accent, 0xff2bd6, 0.5) : th.accent, rimC = flipped ? mix(th.rim, 0xd9a8ff, 0.5) : th.rim;
  const sTop = flipped ? mix(top, 0x2a0748, 0.55) : top, sBot = flipped ? mix(bottom, 0x8a1ca8, 0.45) : bottom;
  const rnd = mulberry(wid * 77 + variant * 1291 + 1);
  if (flipped) { c.save(); c.translate(0, H); c.scale(1, -1); }
  // sky: deep top, rich middle, warm glowing horizon band
  const horizon = mix(mix(sBot, rimC, 0.45), 0xffffff, 0.18);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, hex(mix(sTop, 0x000000, 0.1))); g.addColorStop(0.45, hex(mix(sTop, sBot, 0.6))); g.addColorStop(0.78, hex(sBot)); g.addColorStop(1, hex(horizon));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // big soft nebula clouds
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const x = rnd() * W, y = rnd() * H * 0.6, r = 220 + rnd() * 260, col = i % 2 ? rimC : accent;
    const ng = c.createRadialGradient(x, y, 0, x, y, r); ng.addColorStop(0, hex(col, 0.16)); ng.addColorStop(0.55, hex(col, 0.05)); ng.addColorStop(1, hex(col, 0));
    c.fillStyle = ng; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // stars: dense near the top, fading toward the horizon; a few sparkle crosses
  for (let i = 0; i < 160; i++) {
    const y = Math.pow(rnd(), 1.6) * H * 0.7, x = rnd() * W, s = rnd() * 1.4 + 0.3, a = (0.25 + rnd() * 0.7) * (1 - y / (H * 0.75));
    c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
    if (rnd() > 0.95) { const L = 5 + rnd() * 6; c.strokeStyle = hex(0xffffff, a * 0.7); c.lineWidth = 1; c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y); c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke(); }
  }
  c.globalCompositeOperation = 'source-over';
  // planet: soft halo, banded surface, terminator shadow, rim light, optional ring
  const px = 110 + rnd() * 740, py = 70 + rnd() * 80, pr = 46 + rnd() * 46, ringy = variant ? variant % 2 === 1 : wid % 2 === 1;
  const halo = c.createRadialGradient(px, py, pr * 0.9, px, py, pr * 2.4); halo.addColorStop(0, hex(rimC, 0.22)); halo.addColorStop(1, hex(rimC, 0));
  c.fillStyle = halo; c.fillRect(px - pr * 2.5, py - pr * 2.5, pr * 5, pr * 5);
  const ringPath = (front: boolean) => { c.save(); c.translate(px, py); c.rotate(-0.32); const rg = c.createLinearGradient(-pr * 2, 0, pr * 2, 0); rg.addColorStop(0, hex(rimC, 0.05)); rg.addColorStop(0.5, hex(mix(rimC, 0xffffff, 0.4), front ? 0.6 : 0.3)); rg.addColorStop(1, hex(rimC, 0.05)); c.strokeStyle = rg; c.lineWidth = 7; c.beginPath(); c.ellipse(0, 0, pr * 1.85, pr * 0.4, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke(); c.lineWidth = 2; c.strokeStyle = hex(0xffffff, front ? 0.35 : 0.15); c.beginPath(); c.ellipse(0, 0, pr * 2.05, pr * 0.46, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke(); c.restore(); };
  if (ringy) ringPath(false);
  c.save(); c.beginPath(); c.arc(px, py, pr, 0, 7); c.clip();
  const pg = c.createLinearGradient(px - pr, py - pr, px + pr, py + pr); pg.addColorStop(0, hex(mix(accent, 0xffffff, 0.45))); pg.addColorStop(0.5, hex(accent)); pg.addColorStop(1, hex(mix(accent, 0x000000, 0.6)));
  c.fillStyle = pg; c.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  for (let b = 0; b < 5; b++) { c.fillStyle = hex(b % 2 ? 0xffffff : 0x000000, 0.07 + rnd() * 0.06); c.save(); c.translate(px, py); c.rotate(-0.32); c.fillRect(-pr, -pr + b * pr * 0.42 + rnd() * 6, pr * 2, pr * (0.1 + rnd() * 0.14)); c.restore(); }
  const sh = c.createRadialGradient(px - pr * 0.45, py - pr * 0.5, pr * 0.2, px - pr * 0.2, py - pr * 0.2, pr * 1.5); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.6, 'rgba(0,0,0,0.15)'); sh.addColorStop(1, 'rgba(0,0,10,0.7)');
  c.fillStyle = sh; c.fillRect(px - pr, py - pr, pr * 2, pr * 2); c.restore();
  c.strokeStyle = hex(mix(rimC, 0xffffff, 0.4), 0.75); c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, pr - 1, Math.PI * 0.95, Math.PI * 1.6); c.stroke();
  if (ringy) ringPath(true);
  // horizon sunrise glow behind the hills
  { const hx = W * (0.3 + rnd() * 0.4), hg = c.createRadialGradient(hx, H * 0.86, 10, hx, H * 0.86, W * 0.6); hg.addColorStop(0, hex(mix(rimC, 0xffffff, 0.5), 0.45)); hg.addColorStop(0.4, hex(rimC, 0.14)); hg.addColorStop(1, hex(rimC, 0)); c.fillStyle = hg; c.fillRect(0, 0, W, H); }
  // far cloud bank, lit by the horizon glow
  for (let i = 0; i < 3; i++) cloudBank(c, rnd, rnd() * W, H * (0.5 + rnd() * 0.12), 220 + rnd() * 240, mix(horizon, 0xffffff, 0.25), mix(sBot, 0x000000, 0.1), 0.16);
  // three smooth hill layers: hazy far, darker near, each with a rim-lit crest
  for (let L = 0; L < 3; L++) {
    const base = H - 26 - (2 - L) * 44, amp = 70 - L * 14;
    hills(c, rnd, base, amp, 90 + L * 30);
    const col = mix(mix(sBot, horizon, 0.35 - L * 0.17), 0x000000, 0.25 + L * 0.22);
    const hg = c.createLinearGradient(0, base - amp, 0, H); hg.addColorStop(0, hex(col)); hg.addColorStop(1, hex(mix(col, 0x000000, 0.45)));
    c.fillStyle = hg; c.fill();
    c.strokeStyle = hex(mix(rimC, 0xffffff, 0.2), 0.18 + L * 0.12); c.lineWidth = L === 2 ? 2.5 : 1.5; c.stroke();
  }
  // gentle top/bottom darkening so the play area reads first
  const v = c.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(3,2,14,0.35)'); v.addColorStop(0.25, 'rgba(3,2,14,0)'); v.addColorStop(0.85, 'rgba(3,2,14,0)'); v.addColorStop(1, 'rgba(3,2,14,0.3)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  if (flipped) c.restore();
}
export function mulberry(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function bgKey(scene: Phaser.Scene, world: number, flipped: boolean, variant = 0) {
  const th = WORLDS.find((w) => w.id === world) ?? WORLDS[0];
  return canvasTex(scene, `bg_${world}_${variant}_${flipped ? 1 : 0}`, W, H, (c) => drawSky(c, th.skyTop, th.skyBottom, flipped, world, variant));
}

// ---------------- platforms ----------------
export type PlatKind = 'solid' | 'falling' | 'moving' | 'ice' | 'conveyor' | 'bounce' | 'phase';
export function platformKey(scene: Phaser.Scene, w: number, h: number, world: number, kind: PlatKind, dir = 1) {
  const th = WORLDS.find((x) => x.id === world) ?? WORLDS[0];
  const key = `plat_${world}_${kind}${dir < 0 ? 'L' : ''}_${w}x${h}`;
  return canvasTex(scene, key, w, h, (c) => {
    const base = kind === 'falling' ? mix(th.rock, 0xb45309, 0.55) : kind === 'moving' ? mix(th.rock, 0x0e7490, 0.4) : kind === 'ice' ? 0x5fb8e8 : kind === 'conveyor' ? mix(th.rock, 0x475569, 0.65) : kind === 'bounce' ? 0x16a34a : kind === 'phase' ? mix(th.rock, 0xc026d3, 0.35) : mix(th.rock, th.accent, 0.12);
    const rim = kind === 'falling' ? 0xfcd34d : kind === 'moving' ? 0x67e8f9 : kind === 'ice' ? 0xffffff : kind === 'conveyor' ? 0xfde047 : kind === 'bounce' ? 0x86efac : kind === 'phase' ? 0xff9bf0 : th.rim;
    const R = Math.min(10, h / 2), lip = Math.min(5, Math.max(3, h * 0.2));
    // body: lit top band, darker core, softly lit underside (both faces are walkable)
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, hex(mix(base, 0xffffff, 0.28))); g.addColorStop(0.22, hex(mix(base, 0xffffff, 0.06))); g.addColorStop(0.55, hex(mix(base, 0x000000, 0.42))); g.addColorStop(0.85, hex(mix(base, 0x000000, 0.2))); g.addColorStop(1, hex(mix(base, 0xffffff, 0.12)));
    rr(c, 0, 0, w, h, R); c.fillStyle = g; c.fill();
    c.save(); rr(c, 0, 0, w, h, R); c.clip();
    const rnd = mulberry(w * 31 + h * 7 + world);
    // carved stone blocks (staggered rows when the slab is thick enough)
    const rows = h >= 26 ? 2 : 1, rh = (h - lip * 2) / rows;
    c.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      const y0 = lip + r * rh, bw = 38 + (r % 2) * 6;
      c.strokeStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); if (r) { c.moveTo(0, y0); c.lineTo(w, y0); } for (let x = (r % 2 ? bw / 2 : bw); x < w - 6; x += bw + Math.floor(rnd() * 10)) { c.moveTo(x, y0 + 1); c.lineTo(x, y0 + rh - 1); } c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); for (let x = (r % 2 ? bw / 2 : bw) + 1; x < w - 6; x += bw + 4) { c.moveTo(x, y0 + 1); c.lineTo(x, y0 + rh - 1); } c.stroke();
    }
    // speckles + chips for a sculpted feel
    for (let i = 0; i < w / 6; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.16)'; c.fillRect(rnd() * w, lip + rnd() * (h - lip * 2), 1 + rnd() * 2.5, 1 + rnd() * 1.5); }
    // kind-specific markings
    if (kind === 'falling') { c.strokeStyle = 'rgba(30,10,0,0.55)'; c.lineWidth = 1.6; for (let x = 18; x < w; x += 30 + rnd() * 14) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 4, h * 0.35); c.lineTo(x + 4, h * 0.62); c.lineTo(x - 1, h); c.stroke(); } }
    if (kind === 'moving') { c.fillStyle = 'rgba(165,243,252,0.75)'; for (let x = 14; x < w - 8; x += 26) { c.beginPath(); c.moveTo(x, h / 2 - 4); c.lineTo(x + 8, h / 2); c.lineTo(x, h / 2 + 4); c.closePath(); c.fill(); } }
    if (kind === 'ice') { const ig = c.createLinearGradient(0, 0, w, h); ig.addColorStop(0, 'rgba(255,255,255,0.35)'); ig.addColorStop(1, 'rgba(255,255,255,0.05)'); c.fillStyle = ig; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.45)'; for (let x = -h; x < w + h; x += 26) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 6, h); c.lineTo(x + 6 + h, 0); c.lineTo(x + h, 0); c.closePath(); c.fill(); } }
    if (kind === 'conveyor') { c.fillStyle = 'rgba(15,23,42,0.55)'; c.fillRect(0, lip, w, h - lip * 2); c.fillStyle = 'rgba(253,224,71,0.95)'; for (let x = 10; x < w - 10; x += 22) { c.beginPath(); if (dir > 0) { c.moveTo(x, h / 2 - 5); c.lineTo(x + 9, h / 2); c.lineTo(x, h / 2 + 5); } else { c.moveTo(x + 9, h / 2 - 5); c.lineTo(x, h / 2); c.lineTo(x + 9, h / 2 + 5); } c.closePath(); c.fill(); } }
    if (kind === 'bounce') { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2.5; for (let x = 10; x < w - 6; x += 14) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x + 7, h / 2); c.lineTo(x, h - 6); c.stroke(); } }
    if (kind === 'phase') { c.fillStyle = 'rgba(255,155,240,0.18)'; for (let x = 0; x < w; x += 12) c.fillRect(x, 0, 6, h); }
    // inner bevel: light from above, shade below the lip
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(0, lip - 1, w, 1);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, lip, w, 2); c.fillRect(0, h - lip - 2, w, 2);
    // metal end caps with rivets
    if (w >= 40) for (const x of [0, w - 9]) { const mg = c.createLinearGradient(x, 0, x + 9, 0); mg.addColorStop(0, 'rgba(226,232,240,0.55)'); mg.addColorStop(1, 'rgba(71,85,105,0.55)'); c.fillStyle = mg; c.fillRect(x, lip, 9, h - lip * 2); if (h >= 18) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x + 4.5, h / 2, 1.6, 0, 7); c.fill(); } }
    c.restore();
    // glowing crystal lips on BOTH faces (both are walkable)
    const lipLine = (y: number) => { c.beginPath(); c.moveTo(Math.min(R, w / 2), y); c.lineTo(w - Math.min(R, w / 2), y); c.stroke(); };
    c.lineCap = 'round';
    c.lineWidth = 8; c.strokeStyle = hex(rim, 0.16); lipLine(2); lipLine(h - 2);
    c.lineWidth = 3.5; c.strokeStyle = hex(rim); c.shadowColor = hex(rim); c.shadowBlur = 12; lipLine(1.6); lipLine(h - 1.6);
    c.shadowBlur = 0; c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,0.85)'; lipLine(1.2); lipLine(h - 1.4);
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(8,6,24,0.75)'; rr(c, 0.75, 0.75, w - 1.5, h - 1.5, R); c.stroke();
  });
}
export function doorKey(scene: Phaser.Scene, w: number, h: number, color: number, bridge: boolean) {
  const key = `door_${w}x${h}_${color}_${bridge ? 1 : 0}`;
  return canvasTex(scene, key, w, h, (c) => {
    c.fillStyle = hex(color) + '55'; rr(c, 0, 0, w, h, 5); c.fill();
    c.save(); rr(c, 0, 0, w, h, 5); c.clip(); c.strokeStyle = hex(color); c.globalAlpha = 0.7; c.lineWidth = 3;
    for (let i = -h; i < w + h; i += 12) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); }
    c.restore(); c.strokeStyle = hex(color); c.lineWidth = 3; c.shadowColor = hex(color); c.shadowBlur = 8; rr(c, 1.5, 1.5, w - 3, h - 3, 5); c.stroke();
  });
}

// ---------------- one-off sprites ----------------
export function makeBaseTextures(scene: Phaser.Scene) {
  canvasTex(scene, 'dot', 8, 8, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(4, 4, 4, 0, 7); c.fill(); });
  canvasTex(scene, 'glow', 64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  canvasTex(scene, 'ring', 64, 64, (c) => { c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(32, 32, 27, 0, 7); c.stroke(); });
  canvasTex(scene, 'spark', 16, 16, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(8, 0); c.lineTo(10, 6); c.lineTo(16, 8); c.lineTo(10, 10); c.lineTo(8, 16); c.lineTo(6, 10); c.lineTo(0, 8); c.lineTo(6, 6); c.closePath(); c.fill(); });
  canvasTex(scene, 'cloud', 220, 90, (c) => {
    // soft puffy cloud: blurred white puffs (tinted per world in code)
    c.filter = 'blur(4px)';
    c.fillStyle = 'rgba(255,255,255,0.9)';
    [[60, 56, 30], [100, 42, 38], [146, 50, 32], [178, 60, 22], [34, 62, 20]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
    c.fillRect(34, 56, 150, 22);
    c.filter = 'none';
  });
  // star collectible: chunky bevelled gold star
  const starPath = (c: CanvasRenderingContext2D, R0: number, r0: number, ox = 22, oy = 23) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? r0 : R0; const x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); };
  canvasTex(scene, 'star', 44, 44, (c) => {
    c.lineJoin = 'round'; c.shadowColor = 'rgba(251,191,36,0.9)'; c.shadowBlur = 9;
    starPath(c, 19, 9); c.fillStyle = '#92400e'; c.fill(); c.shadowBlur = 0;
    const g = c.createLinearGradient(8, 4, 36, 40); g.addColorStop(0, '#fff7c2'); g.addColorStop(0.35, '#fcd34d'); g.addColorStop(0.75, '#f59e0b'); g.addColorStop(1, '#b45309');
    starPath(c, 17, 8.2); c.fillStyle = g; c.fill();
    // facets: lighter top-left half of each arm
    c.save(); starPath(c, 17, 8.2); c.clip(); c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.moveTo(22, 23); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; c.lineTo(22 + Math.cos(a) * 20, 23 + Math.sin(a) * 20); c.lineTo(22 + Math.cos(a + 0.32) * 12, 23 + Math.sin(a + 0.32) * 12); c.lineTo(22, 23); } c.fill(); c.restore();
    c.lineWidth = 1.6; c.strokeStyle = '#78350f'; starPath(c, 17, 8.2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(16, 15, 2.6, 4.2, -0.6, 0, 7); c.fill();
  });
  canvasTex(scene, 'star_ui_off', 44, 44, (c) => {
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 8.5 : 18; const x = 22 + Math.cos(a) * r, y = 23 + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath(); c.fill(); c.stroke();
  });
  // spike tile (one triangle, 20 wide x 14 tall) pointing UP: steel blade with a glowing red edge
  canvasTex(scene, 'spike', 20, 14, (c) => {
    c.lineJoin = 'round';
    c.beginPath(); c.moveTo(1, 13.5); c.lineTo(10, 0.8); c.lineTo(19, 13.5); c.closePath();
    c.fillStyle = '#7f1d1d'; c.fill();
    const l = c.createLinearGradient(1, 0, 10, 0); l.addColorStop(0, '#fca5a5'); l.addColorStop(1, '#f87171');
    c.beginPath(); c.moveTo(2, 13); c.lineTo(10, 1.6); c.lineTo(10, 13); c.closePath(); c.fillStyle = l; c.fill();
    const r = c.createLinearGradient(10, 0, 19, 0); r.addColorStop(0, '#dc2626'); r.addColorStop(1, '#7f1d1d');
    c.beginPath(); c.moveTo(10, 1.6); c.lineTo(18, 13); c.lineTo(10, 13); c.closePath(); c.fillStyle = r; c.fill();
    c.strokeStyle = '#450a0a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(1, 13.5); c.lineTo(10, 0.8); c.lineTo(19, 13.5); c.stroke();
    c.fillStyle = '#fff1f2'; c.beginPath(); c.arc(10, 2.2, 1.1, 0, 7); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(1, 12.5, 18, 1.5);
  });
  // saw blade: brushed steel disc, shaded teeth, red hub
  canvasTex(scene, 'saw', 72, 72, (c) => {
    c.translate(36, 36); const teeth = 14;
    c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < teeth * 2; i++) { const a = (i * Math.PI) / teeth, r = i % 2 ? 25 : 34; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.shadowColor = 'rgba(239,68,68,0.9)'; c.shadowBlur = 10;
    const tg = c.createLinearGradient(-34, -34, 34, 34); tg.addColorStop(0, '#f8fafc'); tg.addColorStop(0.5, '#94a3b8'); tg.addColorStop(1, '#334155');
    c.fillStyle = tg; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1e293b'; c.lineWidth = 2; c.stroke();
    const dg = c.createRadialGradient(-6, -6, 2, 0, 0, 24); dg.addColorStop(0, '#e2e8f0'); dg.addColorStop(1, '#64748b');
    c.fillStyle = dg; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); c.strokeStyle = 'rgba(15,23,42,0.6)'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, 0, 8 + i * 4, -2.4 + i * 0.3, -1.2 + i * 0.3); c.stroke(); }
    const hg = c.createRadialGradient(-3, -3, 1, 0, 0, 11); hg.addColorStop(0, '#fca5a5'); hg.addColorStop(0.6, '#dc2626'); hg.addColorStop(1, '#7f1d1d');
    c.fillStyle = hg; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.strokeStyle = '#450a0a'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#1e293b'; for (let i = 0; i < 3; i++) { const a = i * 2.094; c.beginPath(); c.arc(Math.cos(a) * 5, Math.sin(a) * 5, 1.6, 0, 7); c.fill(); }
  });
  // exit portal: spiral vortex arms + glowing core
  canvasTex(scene, 'exit_a', 96, 96, (c) => {
    c.translate(48, 48); c.lineCap = 'round';
    const cols = ['#22d3ee', '#a78bfa', '#fbbf24'];
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = cols[k]; c.shadowColor = cols[k]; c.shadowBlur = 10;
      for (let arm = 0; arm < 2; arm++) {
        c.lineWidth = 4.5 - k; c.beginPath();
        for (let t = 0; t <= 1.001; t += 0.04) { const a = arm * Math.PI + k * 2.1 + t * 4.2, r = 40 - k * 8 - t * 18; const x = Math.cos(a) * r, y = Math.sin(a) * r; t ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
      }
    }
    c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 41, 0, 7); c.stroke();
  });
  canvasTex(scene, 'exit_b', 96, 96, (c) => {
    const g = c.createRadialGradient(48, 48, 2, 48, 48, 36); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(186,230,253,0.95)'); g.addColorStop(0.6, 'rgba(6,182,212,0.6)'); g.addColorStop(1, 'rgba(124,58,237,0)');
    c.fillStyle = g; c.beginPath(); c.arc(48, 48, 36, 0, 7); c.fill();
  });
  // teleport portal (white, tinted in code)
  canvasTex(scene, 'tele', 64, 64, (c) => {
    c.translate(32, 32); c.shadowColor = '#fff'; c.shadowBlur = 10;
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 24, 24, 0, 0.4, 5.6); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 14, 14, 0, 3.4, 8.6); c.stroke();
    c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
  });
  // flip crystal (refills one flip)
  canvasTex(scene, 'crystal', 40, 48, (c) => {
    c.shadowColor = '#22d3ee'; c.shadowBlur = 10; const g = c.createLinearGradient(0, 0, 40, 48); g.addColorStop(0, '#cffafe'); g.addColorStop(0.5, '#22d3ee'); g.addColorStop(1, '#0e7490');
    c.fillStyle = g; c.strokeStyle = '#083344'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath(); c.moveTo(20, 3); c.lineTo(34, 18); c.lineTo(28, 44); c.lineTo(12, 44); c.lineTo(6, 18); c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(6, 18); c.lineTo(34, 18); c.moveTo(20, 3); c.lineTo(16, 18); c.lineTo(20, 44); c.stroke();
    c.fillStyle = '#fff'; c.font = '800 13px Poppins, sans-serif'; c.textAlign = 'center'; c.fillText('+1', 20, 34);
  });
  // checkpoint flag
  for (const on of [0, 1]) canvasTex(scene, `flag${on}`, 30, 46, (c) => {
    c.strokeStyle = '#e2e8f0'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, 44); c.lineTo(6, 4); c.stroke();
    c.fillStyle = on ? '#22c55e' : '#94a3b8'; c.beginPath(); c.moveTo(7, 5); c.lineTo(27, 12); c.lineTo(7, 21); c.closePath(); c.fill();
    c.strokeStyle = '#1e293b'; c.lineWidth = 1.5; c.stroke();
    if (on) { c.shadowColor = '#22c55e'; c.shadowBlur = 10; c.fill(); }
  });
  // switch button 40x16 (base) + cap
  for (const on of [0, 1]) canvasTex(scene, `sw${on}`, 40, 18, (c) => {
    c.fillStyle = '#475569'; rr(c, 0, 8, 40, 10, 3); c.fill();
    c.fillStyle = on ? '#22c55e' : '#f43f5e'; c.shadowColor = c.fillStyle as string; c.shadowBlur = on ? 10 : 4; rr(c, 6, on ? 6 : 1, 28, on ? 6 : 10, 4); c.fill();
    c.shadowBlur = 0; c.strokeStyle = '#0f172a'; c.lineWidth = 1.5; rr(c, 6, on ? 6 : 1, 28, on ? 6 : 10, 4); c.stroke();
  });
  // arrows for gravity zones / hints
  canvasTex(scene, 'chev', 28, 18, (c) => { c.strokeStyle = '#fff'; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(4, 14); c.lineTo(14, 4); c.lineTo(24, 14); c.stroke(); });
  canvasTex(scene, 'keycap', 96, 44, (c) => {
    c.fillStyle = 'rgba(15,23,42,0.85)'; rr(c, 1, 1, 94, 36, 9); c.fill(); c.strokeStyle = '#a78bfa'; c.lineWidth = 3; rr(c, 1.5, 1.5, 93, 35, 9); c.stroke();
    c.fillStyle = '#fff'; c.font = '600 16px Poppins, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SPACE', 48, 20);
  });
  // player variants
  SKINS.forEach((sk, si) => (['idle', 'blink', 'happy', 'dead', 'flip'] as Expr[]).forEach((e) => [-1, 0, 1].forEach((look) => canvasTex(scene, playerKey(e, look, si), 44, 44, (c) => drawPlayer(c, e, look, sk)))));
  // ---- UI polish textures ----
  canvasTex(scene, 'vignette', 480, 270, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, w * 0.62); g.addColorStop(0, 'rgba(5,3,22,0)'); g.addColorStop(1, 'rgba(5,3,22,0.72)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  canvasTex(scene, 'ray', 160, 560, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(w * 0.42, 0); c.lineTo(w * 0.58, 0); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill(); });
  const island = (key: string, w: number, h: number, top: string, rock: string, seed: number) => canvasTex(scene, key, w, h, (c) => {
    const R = mulberry(seed); const th = h * 0.2;
    const body = c.createLinearGradient(0, th, 0, h); body.addColorStop(0, rock); body.addColorStop(1, 'rgba(10,8,40,0.95)'); c.fillStyle = body;
    c.beginPath(); c.moveTo(0, th); c.lineTo(w, th);
    const n = 7; for (let i = n; i >= 0; i--) { const x = (w * i) / n, y = i === 0 || i === n ? th + 4 : th + (h - th) * (0.45 + 0.55 * R()) * (1 - Math.abs(i - n / 2) / (n / 2) * 0.75); c.lineTo(x, y); }
    c.closePath(); c.fill();
    const tg = c.createLinearGradient(0, 0, 0, th + 6); tg.addColorStop(0, top); tg.addColorStop(1, rock); c.fillStyle = tg; rr(c, 0, 0, w, th + 6, 10); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.22)'; rr(c, 6, 3, w - 12, 5, 3); c.fill();
  });
  island('isl_a', 260, 150, '#8b5cf6', '#4c1d95', 11); island('isl_b', 180, 110, '#22d3ee', '#155e75', 23); island('isl_c', 120, 80, '#f0abfc', '#86198f', 37);
  // backgrounds are built on demand by bgKey()
  void worldOfLevel;
}
