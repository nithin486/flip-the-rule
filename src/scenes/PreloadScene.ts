import Phaser from 'phaser';
import { FONT_HEAD, H, W } from '../config/gameConfig';
import { platform } from '../platform';
import { save } from '../systems/SaveSystem';
import { makeBaseTextures } from '../ui/Textures';
import { applyOrientation, view } from '../ui/Layout';

/** All art is generated procedurally (original, zero licensing risk, ~0 KB of asset downloads). */
export class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }
  create() {
    applyOrientation(this.game); // the portal SDK now knows the device class
    this.cameras.main.setBackgroundColor('#0B0B1A');
    const t = this.add.text(view.w / 2, view.h / 2, 'UPSIDE DOWN RUN', { fontFamily: FONT_HEAD, fontSize: '48px', color: '#fff', fontStyle: '800' }).setOrigin(0.5);
    makeBaseTextures(this);
    document.getElementById('boot-splash')?.remove();
    this.tweens.add({ targets: t, alpha: 0, duration: 150, delay: 0, onComplete: () => { platform.loadingStop();
      // CrazyGames full integration: new players land directly in gameplay (level 1 teaches the one mechanic); returning players get the menu.
      const fresh = save.data.unlockedLevel <= 1 && save.totalStars() === 0 && save.data.totalScore === 0;
      if (fresh) this.scene.start('Gameplay', { levelId: 1 }); else this.scene.start('Menu'); } });
  }
}
