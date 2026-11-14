import Phaser from 'phaser';
export class Collectible {
  img: Phaser.GameObjects.Image; glow: Phaser.GameObjects.Image; got = false;
  constructor(public scene: Phaser.Scene, public x: number, public y: number, fx: boolean) {
    this.glow = scene.add.image(x, y, 'glow').setTint(0xfbbf24).setAlpha(0.55).setScale(1.2).setDepth(7);
    this.img = scene.add.image(x, y, 'star').setDepth(8);
    if (fx) scene.tweens.add({ targets: this.img, y: y - 5, scale: 1.1, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (fx) scene.tweens.add({ targets: this.glow, alpha: 0.25, scale: 1.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  setCollected(v: boolean) { this.got = v; this.img.setVisible(!v); this.glow.setVisible(!v); }
}
