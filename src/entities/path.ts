import type { PathDef } from '../types';
/** Deterministic ping-pong path: smooth 0..1..0 over `period` seconds. */
export const pathS = (p: PathDef, t: number) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (t / p.period + (p.phase ?? 0)));
export const pathAt = (bx: number, by: number, p: PathDef, t: number) => { const s = pathS(p, t); return { x: bx + p.dx * s, y: by + p.dy * s }; };
