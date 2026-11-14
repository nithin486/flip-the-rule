import Phaser from 'phaser';
import type { PortalDef } from '../types';

export class ExitPortal {
  a: Phaser.GameObjects.Image; b: Phaser.GameObjects.Image; locked = false; label?: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, public x: number, public y: number, locked: boolean, fx: boolean) {
    this.b = scene.add.image(x, y, 'exit_b').setDepth(7).setScale(1.2);
    this.a = scene.add.image(x, y, 'exit_a').setDepth(8);
    if (fx) {
      scene.tweens.add({ targets: this.a, angle: 360, duration: 4000, repeat: -1 });
      scene.tweens.add({ targets: this.b, scale: 1.45, alpha: 0.7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.setLocked(locked);
  }
  setLocked(v: boolean) { this.locked = v; this.a.setAlpha(v ? 0.25 : 1); this.b.setAlpha(v ? 0.1 : 0.9); if (v) this.a.setTint(0x64748b); else this.a.clearTint(); }
}
export class TelePortal {
  img: Phaser.GameObjects.Image; glow: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, public def: PortalDef, color: number, fx: boolean) {
    this.glow = scene.add.image(def.x, def.y, 'glow').setTint(color).setAlpha(0.6).setScale(1.1).setDepth(7);
    this.img = scene.add.image(def.x, def.y, 'tele').setTint(color).setDepth(8);
    if (fx) { scene.tweens.add({ targets: this.img, angle: -360, duration: 2500, repeat: -1 }); scene.tweens.add({ targets: this.glow, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 }); }
  }
}
