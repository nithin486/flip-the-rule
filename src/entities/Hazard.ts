import Phaser from 'phaser';
import type { SawDef, SpikeDef } from '../types';
import { pathAt } from './path';

export interface Rect { x: number; y: number; w: number; h: number }

export interface Spike extends SpikeUpdate {}
export class Spike {
  rect: Rect; hit: Rect; active = true; revealed = false; private imgs: Phaser.GameObjects.Image[] = [];
  constructor(scene: Phaser.Scene, public def: SpikeDef) {
    const horiz = def.dir === 'up' || def.dir === 'down';
    const w = horiz ? def.width : 14, h = horiz ? 14 : def.width;
    this.rect = { x: def.x, y: def.y, w, h };
    // forgiving hit box: shrink along the strip and back off the tips
    const inset = 3;
    this.hit = horiz
      ? { x: def.x + inset, y: def.y + (def.dir === 'up' ? 5 : 0), w: w - inset * 2, h: h - 5 }
      : { x: def.x + (def.dir === 'left' ? 5 : 0), y: def.y + inset, w: w - 5, h: h - inset * 2 };
    const n = Math.max(1, Math.round(def.width / 20));
    const rot = { up: 0, right: 90, down: 180, left: 270 }[def.dir];
    for (let i = 0; i < n; i++) {
      const off = (i + 0.5) * (def.width / n);
      const cx = horiz ? def.x + off : def.x + 7, cy = horiz ? def.y + 7 : def.y + off;
      const img = scene.add.image(cx, cy, 'spike').setAngle(rot).setDepth(6); this.imgs.push(img);
      img.setScale(def.width / n / 20, 1);
      if (def.hidden) img.setAlpha(0.0);
    }
    if (!def.hidden) this.revealed = true;
  }
  /** Hidden spikes go back into hiding on every new attempt, so the surprise is there each time the level is played. */
  conceal(scene: Phaser.Scene) { if (!this.def.hidden || !this.revealed) return; this.revealed = false; for (const i of this.imgs) { scene.tweens.killTweensOf(i); i.setAlpha(0).setScale(i.scaleX, 1); } }
  reveal(scene: Phaser.Scene) { if (this.revealed) return; this.revealed = true; for (const i of this.imgs) { i.setAlpha(1).setTint(0xffffff); scene.tweens.add({ targets: i, scaleY: { from: 1.7, to: 1 }, duration: 260, ease: 'Back.easeOut' }); } }
}

export interface SpikeUpdate { update(t: number, fx: boolean): void }
Spike.prototype.update = function (this: Spike, t: number, fx: boolean) {
  const p = this.def.period; if (!p) return;
  const ph = ((t / p + (this.def.phase ?? 0)) % 1 + 1) % 1;
  this.active = ph < 0.5;
  if (fx && this.revealed) { const warn = ph > 0.42 && ph < 0.5 ? 1 : 0; const a = this.active ? 1 : (ph > 0.9 ? 0.6 : 0.22); for (const i of (this as any).imgs) { i.setAlpha(a); i.setTint(warn ? 0xffffff : 0xffffff); } }
};
export class Saw {
  x: number; y: number; r: number; img: Phaser.GameObjects.Image; revealed = false; private track?: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene, public def: SawDef, private fx: boolean) {
    this.r = def.r ?? 24; this.x = def.x; this.y = def.y;
    if (def.path) {
      const g = scene.add.graphics().setDepth(1); this.track = g; if (def.hidden) g.setAlpha(0);
      const x2 = def.x + def.path.dx, y2 = def.y + def.path.dy;
      g.lineStyle(3, 0xef4444, 0.45);
      const len = Math.hypot(def.path.dx, def.path.dy), n = Math.max(1, Math.floor(len / 14));
      for (let i = 0; i < n; i += 2) { const a = i / n, b = Math.min(1, (i + 1) / n); g.lineBetween(def.x + def.path.dx * a, def.y + def.path.dy * a, def.x + def.path.dx * b, def.y + def.path.dy * b); }
      g.fillStyle(0xef4444, 0.6); g.fillCircle(def.x, def.y, 4); g.fillCircle(x2, y2, 4);
    }
    this.img = scene.add.image(def.x, def.y, 'saw').setDepth(7).setDisplaySize(this.r * 2.9, this.r * 2.9);
    if (def.hidden) this.img.setAlpha(0); else this.revealed = true;
  }
  conceal(scene: Phaser.Scene) { if (!this.def.hidden || !this.revealed) return; this.revealed = false; scene.tweens.killTweensOf(this.img); this.img.setAlpha(0).setDisplaySize(this.r * 2.9, this.r * 2.9); this.track?.setAlpha(0); }
  reveal(scene: Phaser.Scene) { if (this.revealed) return; this.revealed = true; this.img.setAlpha(1); this.track?.setAlpha(1); scene.tweens.add({ targets: this.img, scale: { from: this.img.scale * 1.5, to: this.img.scale }, duration: 260, ease: 'Back.easeOut' }); }
  update(t: number) {
    if (this.def.path) { const p = pathAt(this.def.x, this.def.y, this.def.path, t); this.x = p.x; this.y = p.y; }
    if (this.fx) { this.img.setPosition(this.x, this.y); this.img.rotation = t * 7; }
  }
}
