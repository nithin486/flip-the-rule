import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title } from '../ui/Buttons';
import { SKINS, playerKey } from '../ui/Textures';

/** Ball skins, unlocked by total stars. Pure cosmetics. */
export class SkinsScene extends Phaser.Scene {
  constructor() { super('Skins'); }
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.82).setInteractive();
    panel(this, W / 2, H / 2, 780, 380);
    title(this, W / 2, H / 2 - 150, 'BALL SKINS', 40);
    const stars = save.totalStars();
    this.add.text(W / 2, H / 2 - 108, `Collect stars to unlock new looks   ★ ${stars} / 120`, { fontFamily: FONT_BODY, fontSize: '16px', color: '#c4b5fd', fontStyle: '600' }).setOrigin(0.5);
    const gap = 140, x0 = W / 2 - gap * 2;
    SKINS.forEach((sk, i) => {
      const x = x0 + i * gap, y = H / 2 - 20, open = stars >= sk.need, sel = save.data.skin === i;
      const card = this.add.rectangle(x, y + 8, 124, 170, 0x1a1238, 0.9).setStrokeStyle(sel ? 4 : 2, sel ? 0x22c55e : open ? 0x67e8f9 : 0x475569, 1);
      const ball = this.add.image(x, y - 22, playerKey(sel ? 'happy' : 'idle', 0, i)).setScale(1.9);
      if (!open) ball.setTint(0x222233).setAlpha(0.8);
      this.add.text(x, y + 38, sk.name, { fontFamily: FONT_HEAD, fontSize: '18px', color: open ? '#ffffff' : '#94a3b8', fontStyle: '800' }).setOrigin(0.5);
      this.add.text(x, y + 66, sel ? 'EQUIPPED' : open ? 'TAP TO USE' : `🔒 ★ ${sk.need}`, { fontFamily: FONT_BODY, fontSize: '13px', color: sel ? '#4ade80' : open ? '#a5f3fc' : '#fbbf24', fontStyle: '800' }).setOrigin(0.5);
      if (open) card.setInteractive({ useHandCursor: true }).on('pointerup', () => { save.data.skin = i; save.save(); audio.sfx('star'); this.scene.restart(); });
    });
    new Button(this, W / 2, H / 2 + 150, 'DONE', () => { this.scene.stop(); this.scene.get('Menu').scene.restart(); }, { w: 220, h: 50, size: 24, color: 0x22c55e });
  }
}
