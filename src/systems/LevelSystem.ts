import { H, TOTAL_LEVELS, W } from '../config/gameConfig';
import type { LevelData, PlatformDef } from '../types';
import w1 from '../../levels/world1.json';
import w2 from '../../levels/world2.json';
import w3 from '../../levels/world3.json';
import w4 from '../../levels/world4.json';
import w5 from "../../levels/world5.json";
import w6 from "../../levels/world6.json";
import w7 from "../../levels/world7.json";
import w8 from "../../levels/world8.json";
import w9 from "../../levels/world9.json";
import w10 from "../../levels/world10.json";
import w11 from "../../levels/world11.json";
import w12 from "../../levels/world12.json";
import solutions from '../../levels/solutions.json';

const ALL: LevelData[] = ([...w1, ...w2, ...w3, ...w4, ...w5, ...w6, ...w7, ...w8, ...w9, ...w10, ...w11, ...w12] as unknown as LevelData[]).sort((a, b) => a.id - b.id);

const isNum = (v: unknown): v is number => typeof v === 'number' && isFinite(v);
const rectOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Validates level data before loading. Returns a list of human-readable problems (empty = valid). */
export function validateLevel(l: LevelData): string[] {
  const e: string[] = [];
  const tag = `L${l?.id}`;
  if (!l || !isNum(l.id)) return ['missing id'];
  if (!l.playerStart || !isNum(l.playerStart.x) || !isNum(l.playerStart.y)) e.push(`${tag}: bad playerStart`);
  if (l.gravity !== 'up' && l.gravity !== 'down') e.push(`${tag}: gravity must be up|down`);
  if (!isNum(l.flipTarget) || l.flipTarget < 0) e.push(`${tag}: bad flipTarget`);
  if (!l.exit || !isNum(l.exit.x) || !isNum(l.exit.y)) e.push(`${tag}: bad exit`);
  if (!Array.isArray(l.platforms) || l.platforms.length === 0) e.push(`${tag}: no platforms`);
  if (!Array.isArray(l.hazards)) e.push(`${tag}: hazards must be an array`);
  (l.platforms ?? []).forEach((p, i) => {
    if (![p.x, p.y, p.width, p.height].every(isNum) || p.width <= 0 || p.height <= 0) e.push(`${tag}: platform ${i} bad rect`);
    if (p.kind === 'moving' && (!p.path || !isNum(p.path.period) || p.path.period <= 0)) e.push(`${tag}: moving platform ${i} needs path`);
  });
  const ids = new Set((l.switches ?? []).map((s) => s.id));
  (l.doors ?? []).forEach((d, i) => { if (!ids.has(d.switch)) e.push(`${tag}: door ${i} references missing switch ${d.switch}`); });
  if (l.exit?.switch && !ids.has(l.exit.switch)) e.push(`${tag}: exit references missing switch`);
  const pids = new Map((l.portals ?? []).map((p) => [p.id, p]));
  (l.portals ?? []).forEach((p) => {
    const o = pids.get(p.pair);
    if (!o || o.pair !== p.id) e.push(`${tag}: portal ${p.id} not paired with ${p.pair}`);
    const r = { x: p.x - 15, y: p.y - 15, w: 30, h: 30 };
    for (const pl of l.platforms) if (pl.kind !== 'moving' && rectOverlap(r, { x: pl.x, y: pl.y, w: pl.width, h: pl.height })) e.push(`${tag}: portal ${p.id} overlaps platform (unsafe destination)`);
  });
  if (l.playerStart) {
    const r = { x: l.playerStart.x - 16, y: l.playerStart.y - 16, w: 32, h: 32 };
    for (const pl of l.platforms ?? []) if (rectOverlap(r, { x: pl.x, y: pl.y, w: pl.width, h: pl.height })) e.push(`${tag}: player starts inside a platform`);
  }
  const inB = (x: number, y: number) => x >= 0 && x <= W && y >= 0 && y <= H;
  if (l.exit && !inB(l.exit.x, l.exit.y)) e.push(`${tag}: exit out of bounds`);
  if (l.collectible && !inB(l.collectible.x, l.collectible.y)) e.push(`${tag}: collectible out of bounds`);
  return e;
}

export class LevelSystem {
  static all() { return ALL; }
  /** Verified solver replay (x,y every 3 frames) used by the ghost hint. */
  static solution(id: number): number[][] | null { return ((solutions as unknown as Record<string, number[][]>)[String(id)]) ?? null; }
  static count() { return Math.min(TOTAL_LEVELS, ALL.length); }
  static get(id: number): LevelData {
    const l = ALL.find((x) => x.id === id) ?? ALL[0];
    return JSON.parse(JSON.stringify(l));
  }
  static validateAll(): string[] { return ALL.flatMap(validateLevel); }

  // ---- Deterministic daily challenge ----
  static dateKey(d = new Date()): string { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
  static hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /** Same puzzle for everybody on a given UTC date: a seeded pick of a mid/late level + symmetric mirror transforms (solvability preserving). */
  static daily(key = LevelSystem.dateKey()): LevelData {
    const h = LevelSystem.hash('ftr:' + key);
    const pool = ALL.filter((l) => l.id >= 12);
    const base = JSON.parse(JSON.stringify(pool[h % pool.length])) as LevelData;
    const mx = (h >> 8) & 1, my = (h >> 9) & 1;
    const out = LevelSystem.mirror(base, !!mx, !!my);
    out.name = `Daily · ${out.name}`;
    out.id = base.id; // keep id for theming; progress is tracked separately
    return out;
  }
  static mirror(l: LevelData, mx: boolean, my: boolean): LevelData {
    if (!mx && !my) return l;
    const fx = (x: number, w = 0) => (mx ? W - x - w : x);
    const fy = (y: number, h = 0) => (my ? H - y - h : y);
    const o: LevelData = JSON.parse(JSON.stringify(l));
    const pt = (p: { x: number; y: number }) => { p.x = fx(p.x); p.y = fy(p.y); };
    pt(o.playerStart); pt(o.exit); if (o.collectible) pt(o.collectible);
    if (my) o.gravity = o.gravity === 'up' ? 'down' : 'up';
    const path = (p?: { dx: number; dy: number }) => { if (p) { if (mx) p.dx = -p.dx; if (my) p.dy = -p.dy; } };
    for (const p of o.platforms as PlatformDef[]) { p.x = fx(p.x, p.width); p.y = fy(p.y, p.height); path(p.path); }
    for (const h of o.hazards) {
      if (h.type === 'saw') { h.x = fx(h.x); h.y = fy(h.y); path(h.path); } else if (h.type === 'laser') { h.x = fx(h.x, h.width); h.y = fy(h.y, h.height); } else {
        const horiz = h.dir === 'up' || h.dir === 'down';
        if (horiz) { h.x = fx(h.x, h.width); h.y = fy(h.y, 14); if (my) h.dir = h.dir === 'up' ? 'down' : 'up'; }
        else { h.x = fx(h.x, 14); h.y = fy(h.y, h.width); if (mx) h.dir = h.dir === 'left' ? 'right' : 'left'; }
      }
    }
    (o.checkpoints ?? []).forEach(pt);
    (o.refills ?? []).forEach(pt);
    (o.orbs ?? []).forEach(pt);
    if (mx) for (const p of o.platforms as PlatformDef[]) if ((p.kind === 'conveyor' || p.kind === 'boost') && p.speed) p.speed = -p.speed;
    if (my) for (const p of o.platforms as PlatformDef[]) if (p.kind === 'polar') p.pol = p.pol === 'up' ? 'down' : 'up';
    (o.switches ?? []).forEach((s) => { pt(s); if (my && s.dir) s.dir = s.dir === 'up' ? 'down' : 'up'; });
    (o.doors ?? []).forEach((d) => { d.x = fx(d.x, d.width); d.y = fy(d.y, d.height); });
    (o.portals ?? []).forEach(pt);
    (o.zones ?? []).forEach((z) => { z.x = fx(z.x, z.width); z.y = fy(z.y, z.height); if (my && z.gravity) z.gravity = z.gravity === 'up' ? 'down' : 'up'; if (mx && z.wind) z.wind = -z.wind; });
    return o;
  }
}
