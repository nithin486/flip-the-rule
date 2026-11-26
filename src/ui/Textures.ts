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
function drawPlayer(c: CanvasRenderingContext2D, e: Expr, look: number, sk: Skin) {
  const S = 44, cx = S / 2, cy = S / 2, R = 19;
  c.clearRect(0, 0, S, S);
  c.shadowColor = sk.glow; c.shadowBlur = 6;
  const g = c.createRadialGradient(cx - 6, cy - 7, 2, cx, cy, R);
  g.addColorStop(0, sk.c0); g.addColorStop(0.45, sk.c1); g.addColorStop(1, sk.c2);
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  c.shadowBlur = 0; c.lineWidth = 2; c.strokeStyle = sk.line; c.stroke();
  // shine
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(cx - 7, cy - 9, 5, 3, -0.6, 0, Math.PI * 2); c.fill();
  // face
  const ex = 6.5, ey = cy - 1, off = look * 2.2;
  const eye = (x: number) => {
    if (e === 'blink') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 3.5, ey); c.lineTo(x + 3.5, ey); c.stroke(); return; }
    if (e === 'dead') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 3, ey - 3); c.lineTo(x + 3, ey + 3); c.moveTo(x + 3, ey - 3); c.lineTo(x - 3, ey + 3); c.stroke(); return; }
    if (e === 'happy') { c.strokeStyle = '#1e1b4b'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, ey + 2, 3.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); return; }
    const big = e === 'flip' ? 5.6 : 4.8;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, ey, big, big + 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1e1b4b'; c.beginPath(); c.arc(x + off, ey + 0.6, e === 'flip' ? 2.4 : 2.9, 0, Math.PI * 2); c.fill();
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
function drawSky(c: CanvasRenderingContext2D, top: number, bottom: number, flipped: boolean, wid: number, variant = 0) {
  const th = WORLDS.find((w) => w.id === wid) ?? WORLDS[0];
  const accent = flipped ? mix(th.accent, 0xff2bd6, 0.55) : th.accent, rimC = flipped ? mix(th.rim, 0xd9a8ff, 0.5) : th.rim;
  const rnd = mulberry(wid * 77 + variant * 1291 + (flipped ? 3 : 1)), ringy = variant ? variant % 2 === 1 : wid % 2 === 1;
  const g = c.createLinearGradient(0, 0, 0, H);
  if (!flipped) { g.addColorStop(0, hex(top)); g.addColorStop(1, hex(bottom)); }
  else { g.addColorStop(0, hex(mix(bottom, 0x3b0a6b, 0.6))); g.addColorStop(1, hex(mix(top, 0x120225, 0.5))); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // nebulae
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const x = rnd() * W, y = rnd() * H, r = 160 + rnd() * 240, col = i % 3 === 0 ? rimC : accent;
    const ng = c.createRadialGradient(x, y, 0, x, y, r); ng.addColorStop(0, hex(col, 0.20)); ng.addColorStop(0.5, hex(col, 0.07)); ng.addColorStop(1, hex(col, 0));
    c.fillStyle = ng; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // stars (some with a glare cross)
  for (let i = 0; i < 190; i++) {
    const x = rnd() * W, y = rnd() * H, s = rnd() * 1.5 + 0.3, a = 0.25 + rnd() * 0.65;
    c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
    if (rnd() > 0.93) { c.strokeStyle = hex(rimC, 0.5); c.lineWidth = 1; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.moveTo(x, y - 7); c.lineTo(x, y + 7); c.stroke(); }
  }
  c.globalCompositeOperation = 'source-over';
  // planet with rim light (+ ring on odd worlds)
  const px = 120 + rnd() * 720, py = flipped ? 400 + rnd() * 80 : 70 + rnd() * 90, pr = 52 + rnd() * 52;
  if (ringy) { c.save(); c.translate(px, py); c.rotate(-0.35); c.strokeStyle = hex(rimC, 0.18); c.lineWidth = 9; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, Math.PI, Math.PI * 2); c.stroke(); c.restore(); }
  const pg = c.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
  pg.addColorStop(0, hex(mix(accent, 0xffffff, 0.15))); pg.addColorStop(0.6, hex(mix(accent, 0x000000, 0.55))); pg.addColorStop(1, hex(mix(accent, 0x000000, 0.85)));
  c.fillStyle = pg; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(px, py, pr, 0, 7); c.clip(); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.arc(px + pr * 0.38, py + pr * 0.3, pr * 1.02, 0, 7); c.fill(); c.restore();
  c.strokeStyle = hex(rimC, 0.5); c.lineWidth = 2; c.beginPath(); c.arc(px, py, pr, Math.PI * 0.95, Math.PI * 1.55); c.stroke();
  if (ringy) { c.save(); c.translate(px, py); c.rotate(-0.35); c.strokeStyle = hex(rimC, 0.4); c.lineWidth = 9; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, 0, Math.PI); c.stroke(); c.restore(); }
  // layered ridge silhouettes with a neon edge (bottom, or top when gravity is flipped)
  c.save(); if (flipped) { c.translate(0, H); c.scale(1, -1); }
  for (let L = 0; L < 3; L++) {
    const base = H - 40 - L * 46, amp = 40 + L * 12, col = mix(bottom, 0x000000, 0.45 + L * 0.18);
    c.beginPath(); c.moveTo(0, H); let x = 0; let y = base - rnd() * amp; c.lineTo(0, y);
    while (x < W) { x += 34 + rnd() * 56; y = base - rnd() * amp; c.lineTo(Math.min(x, W), y); }
    c.lineTo(W, H); c.closePath(); c.fillStyle = hex(col, 0.78); c.fill();
    if (L === 0) { c.strokeStyle = hex(accent, 0.35); c.lineWidth = 1.5; c.stroke(); }
  }
  c.restore();
  // vignette
  const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,2,12,0.6)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
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
    const base = kind === 'falling' ? mix(th.rock, 0xb45309, 0.5) : kind === 'moving' ? mix(th.rock, 0x0e7490, 0.35) : kind === 'ice' ? 0x7dd3fc : kind === 'conveyor' ? mix(th.rock, 0x475569, 0.6) : kind === 'bounce' ? 0x15803d : th.rock;
    const rim = kind === 'falling' ? 0xfcd34d : kind === 'moving' ? 0x67e8f9 : kind === 'ice' ? 0xffffff : kind === 'conveyor' ? 0xfde047 : kind === 'bounce' ? 0x86efac : kind === 'phase' ? 0xff9bf0 : th.rim;
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, hex(mix(base, 0xffffff, 0.1))); g.addColorStop(0.5, hex(mix(base, 0x000000, 0.45))); g.addColorStop(1, hex(mix(base, 0xffffff, 0.1)));
    rr(c, 0, 0, w, h, Math.min(10, h / 2)); c.fillStyle = g; c.fill();
    c.save(); rr(c, 0, 0, w, h, Math.min(10, h / 2)); c.clip();
    // rock speckles
    const rnd = mulberry(w * 31 + h * 7);
    c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1; for (let x = 36; x < w; x += 44) { c.beginPath(); c.moveTo(x, 3); c.lineTo(x, h - 3); c.stroke(); }
    if (kind === 'falling') { c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.5; for (let x = 18; x < w; x += 34) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 4, h * 0.4); c.lineTo(x + 3, h * 0.7); c.lineTo(x - 2, h); c.stroke(); } }
    if (kind === 'moving') { c.fillStyle = 'rgba(103,232,249,0.55)'; for (let x = 14; x < w - 8; x += 28) { c.beginPath(); c.moveTo(x, h / 2 - 4); c.lineTo(x + 8, h / 2); c.lineTo(x, h / 2 + 4); c.closePath(); c.fill(); } }
    if (kind === 'ice') { c.fillStyle = 'rgba(255,255,255,0.5)'; for (let x = -h; x < w + h; x += 22) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 8, h); c.lineTo(x + 8 + h, 0); c.lineTo(x + h, 0); c.closePath(); c.fill(); } }
    if (kind === 'conveyor') { c.fillStyle = 'rgba(253,224,71,0.85)'; for (let x = 10; x < w - 10; x += 24) { c.beginPath(); if (dir > 0) { c.moveTo(x, h / 2 - 5); c.lineTo(x + 9, h / 2); c.lineTo(x, h / 2 + 5); } else { c.moveTo(x + 9, h / 2 - 5); c.lineTo(x, h / 2); c.lineTo(x + 9, h / 2 + 5); } c.closePath(); c.fill(); } }
    if (kind === 'bounce') { c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2.5; for (let x = 10; x < w - 6; x += 14) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x + 7, h / 2); c.lineTo(x, h - 6); c.stroke(); } }
    c.restore();
    // glowing rims on BOTH faces: both are walkable
    c.lineCap = 'round'; c.shadowBlur = 0; c.lineWidth = 9; c.strokeStyle = hex(rim, 0.18);
    c.beginPath(); c.moveTo(Math.min(8, w / 2), 2); c.lineTo(w - Math.min(8, w / 2), 2); c.stroke(); c.beginPath(); c.moveTo(Math.min(8, w / 2), h - 2); c.lineTo(w - Math.min(8, w / 2), h - 2); c.stroke();
    c.lineWidth = 3.5; c.strokeStyle = hex(rim);
    c.shadowColor = hex(rim); c.shadowBlur = 14;
    c.beginPath(); c.moveTo(Math.min(8, w / 2), 1.5); c.lineTo(w - Math.min(8, w / 2), 1.5); c.stroke();
    c.beginPath(); c.moveTo(Math.min(8, w / 2), h - 1.5); c.lineTo(w - Math.min(8, w / 2), h - 1.5); c.stroke();
    c.shadowBlur = 0; c.lineWidth = 2; c.strokeStyle = 'rgba(11,11,26,0.7)'; rr(c, 1, 1, w - 2, h - 2, Math.min(10, h / 2)); c.stroke();
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
  canvasTex(scene, 'cloud', 200, 70, (c) => {
    c.fillStyle = 'rgba(255,255,255,0.55)';
    [[50, 46, 30], [90, 34, 34], [132, 42, 30], [160, 48, 22], [24, 50, 20]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
    c.fillRect(24, 46, 140, 24);
  });
  // star collectible (gold, 5 point) 40px
  canvasTex(scene, 'star', 44, 44, (c) => {
    c.shadowColor = '#fbbf24'; c.shadowBlur = 8; c.fillStyle = '#fbbf24'; c.strokeStyle = '#b45309'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 8.5 : 18; const x = 22 + Math.cos(a) * r, y = 23 + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(17, 16, 3, 5, -0.6, 0, 7); c.fill();
  });
  canvasTex(scene, 'star_ui_off', 44, 44, (c) => {
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 8.5 : 18; const x = 22 + Math.cos(a) * r, y = 23 + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath(); c.fill(); c.stroke();
  });
  // spike tile (one triangle, 20 wide x 14 tall) pointing UP
  canvasTex(scene, 'spike', 20, 14, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 14); g.addColorStop(0, '#fecaca'); g.addColorStop(0.35, '#ef4444'); g.addColorStop(1, '#991b1b');
    c.fillStyle = g; c.strokeStyle = '#450a0a'; c.lineWidth = 1.5; c.lineJoin = 'round'; c.beginPath(); c.moveTo(1, 13.2); c.lineTo(10, 1.2); c.lineTo(19, 13.2); c.closePath(); c.fill(); c.stroke();
  });
  // saw blade 64
  canvasTex(scene, 'saw', 72, 72, (c) => {
    c.translate(36, 36); const teeth = 12;
    c.fillStyle = '#e2e8f0'; c.strokeStyle = '#450a0a'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < teeth * 2; i++) { const a = (i * Math.PI) / teeth, r = i % 2 ? 24 : 34; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.shadowColor = '#ef4444'; c.shadowBlur = 8; c.fill(); c.shadowBlur = 0; c.stroke();
    c.fillStyle = '#ef4444'; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#7f1d1d'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
    c.strokeStyle = '#fecaca'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.lineTo(0, -5); c.moveTo(10, 6); c.lineTo(4, 3); c.moveTo(-10, 6); c.lineTo(-4, 3); c.stroke();
  });
  // exit portal layers
  canvasTex(scene, 'exit_a', 96, 96, (c) => {
    c.translate(48, 48);
    for (let i = 0; i < 3; i++) { c.strokeStyle = ['#06b6d4', '#7c3aed', '#fbbf24'][i]; c.lineWidth = 5 - i; c.shadowColor = c.strokeStyle; c.shadowBlur = 12; c.beginPath(); c.ellipse(0, 0, 40 - i * 9, 40 - i * 9, 0, i, i + 4.2); c.stroke(); }
  });
  canvasTex(scene, 'exit_b', 96, 96, (c) => {
    const g = c.createRadialGradient(48, 48, 2, 48, 48, 34); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.5, 'rgba(6,182,212,0.7)'); g.addColorStop(1, 'rgba(124,58,237,0)');
    c.fillStyle = g; c.beginPath(); c.arc(48, 48, 34, 0, 7); c.fill();
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
