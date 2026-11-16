import Phaser from 'phaser';
import { FONT_HEAD, H, W } from '../config/gameConfig';
import { platform } from '../platform';
import { makeBaseTextures } from '../ui/Textures';

/** All art is generated procedurally (original, zero licensing risk, ~0 KB of asset downloads). */
export class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }
  create() {
    this.cameras.main.setBackgroundColor('#0B0B1A');
    const t = this.add.text(W / 2, H / 2, 'UPSIDE DOWN RUN', { fontFamily: FONT_HEAD, fontSize: '48px', color: '#fff', fontStyle: '800' }).setOrigin(0.5);
    makeBaseTextures(this);
    this.tweens.add({ targets: t, alpha: 0, duration: 250, delay: 150, onComplete: () => { platform.loadingStop(); this.scene.start('Menu'); } });
  }
}
