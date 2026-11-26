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

/** Gravity orb: touching it flips gravity for free (does not count as a flip). Used once per attempt. */
export class Orb {
  img: Phaser.GameObjects.Image; glow: Phaser.GameObjects.Image; got = false;
  constructor(scene: Phaser.Scene, public x: number, public y: number, fx: boolean) {
    this.glow = scene.add.image(x, y, 'glow').setTint(0xf0abfc).setAlpha(0.55).setScale(1.2).setDepth(7);
    this.img = scene.add.image(x, y, 'orb').setDepth(8);
    if (fx) { scene.tweens.add({ targets: this.img, angle: 360, duration: 3000, repeat: -1 }); scene.tweens.add({ targets: this.glow, scale: 1.6, alpha: 0.25, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
  }
  setCollected(v: boolean) { this.got = v; this.img.setVisible(!v); this.glow.setVisible(!v); }
}
