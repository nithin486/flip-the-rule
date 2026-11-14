import Phaser from 'phaser';
import type { CheckpointDef, SwitchDef, ZoneDef } from '../types';
import type { Rect } from './Hazard';

export class Checkpoint {
  img: Phaser.GameObjects.Image; active = false;
  constructor(scene: Phaser.Scene, public def: CheckpointDef) { this.img = scene.add.image(def.x, def.y + 2, 'flag0').setOrigin(0.2, 0.5).setDepth(7); }
  setActive(v: boolean) { this.active = v; this.img.setTexture(v ? 'flag1' : 'flag0'); }
}
export class Switch {
  img: Phaser.GameObjects.Image; on = false; rect: Rect;
  constructor(scene: Phaser.Scene, public def: SwitchDef, public color: number) {
    const down = def.dir !== 'up';
    this.img = scene.add.image(def.x, def.y, 'sw0').setDepth(6).setTint(color);
    if (!down) this.img.setFlipY(true);
    this.rect = { x: def.x - 20, y: def.y - 9, w: 40, h: 18 };
    // ring marker so the player sees which door it controls
    scene.add.image(def.x, def.y + (down ? -16 : 16), 'ring').setScale(0.22).setTint(color).setAlpha(0.8).setDepth(6);
  }
  setOn(v: boolean) { this.on = v; this.img.setTexture(v ? 'sw1' : 'sw0'); }
}
export class GravityZone {
  rect: Rect; chevrons: Phaser.GameObjects.Image[] = [];
  get kind() { return this.def.kind ?? 'gravity'; }
  constructor(scene: Phaser.Scene, public def: ZoneDef, fx: boolean) {
    this.rect = { x: def.x, y: def.y, w: def.width, h: def.height };
    const kind = def.kind ?? 'gravity';
    if (kind !== 'gravity') {
      const col = kind === 'lock' ? 0xff4d6d : kind === 'reverse' ? 0xffb020 : 0x7df9ff;
      scene.add.rectangle(def.x + def.width / 2, def.y + def.height / 2, def.width, def.height, col, 0.12).setStrokeStyle(2, col, 0.8).setDepth(2);
      const g = scene.add.graphics().setDepth(3); g.lineStyle(2, col, 0.35);
      if (kind === 'lock') { for (let k = -def.height; k < def.width; k += 26) g.lineBetween(def.x + Math.max(0, k), def.y + Math.max(0, -k), def.x + Math.min(def.width, k + def.height), def.y + Math.min(def.height, def.width - k)); }
      const glyph = kind === 'lock' ? '\u2715 NO FLIP' : kind === 'reverse' ? '\u00ab REVERSED \u00bb' : (def.wind ?? 0) > 0 ? 'WIND \u00bb\u00bb' : '\u00ab\u00ab WIND';
      const t = scene.add.text(def.x + def.width / 2, def.y + 14, glyph, { fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#' + col.toString(16).padStart(6, '0'), fontStyle: '700' }).setOrigin(0.5).setDepth(3).setAlpha(0.9);
      if (fx) { scene.tweens.add({ targets: t, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 }); if (kind === 'wind') { const dir = (def.wind ?? 1) > 0 ? 1 : -1; for (let i = 0; i < Math.max(2, Math.floor(def.height / 40)); i++) { const a = scene.add.text(def.x + (dir > 0 ? 0 : def.width), def.y + 30 + i * 40, dir > 0 ? '\u203a\u203a\u203a' : '\u2039\u2039\u2039', { fontFamily: 'Poppins, sans-serif', fontSize: '18px', color: '#7df9ff' }).setDepth(3).setAlpha(0.5); scene.tweens.add({ targets: a, x: def.x + (dir > 0 ? def.width : 0), duration: 1300, repeat: -1, delay: i * 260 }); } } }
      return;
    }
    const col = def.gravity === 'up' ? 0xf0abfc : 0x67e8f9;
    scene.add.rectangle(def.x + def.width / 2, def.y + def.height / 2, def.width, def.height, col, 0.16).setStrokeStyle(2, col, 0.6).setDepth(2);
    const n = Math.max(1, Math.floor(def.width / 36)), rows = Math.max(1, Math.floor(def.height / 44));
    for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
      const c = scene.add.image(def.x + (i + 0.5) * (def.width / n), def.y + (j + 0.5) * (def.height / rows), 'chev').setTint(col).setAlpha(0.55).setDepth(3);
      if (def.gravity === 'down') c.setFlipY(true);
      this.chevrons.push(c);
      if (fx) scene.tweens.add({ targets: c, y: c.y + (def.gravity === 'up' ? -10 : 10), alpha: 0.1, duration: 900, repeat: -1, delay: (j * 150) + i * 40 });
    }
  }
}
