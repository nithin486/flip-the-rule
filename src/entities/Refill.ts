import Phaser from 'phaser';
/** Flip crystal: collecting it grants one extra flip for this attempt. */
export class Refill {
  img: Phaser.GameObjects.Image; glow: Phaser.GameObjects.Image; got = false;
  constructor(scene: Phaser.Scene, public x: number, public y: number, fx: boolean) {
    this.glow = scene.add.image(x, y, 'glow').setTint(0x22d3ee).setAlpha(0.5).setScale(1.1).setDepth(7);
    this.img = scene.add.image(x, y, 'crystal').setDepth(8).setScale(0.85);
    if (fx) scene.tweens.add({ targets: [this.img, this.glow], y: y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  setCollected(v: boolean) { this.got = v; this.img.setVisible(!v); this.glow.setVisible(!v); }
}
