import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title } from '../ui/Buttons';
import { SKINS, playerKey, skinOpen } from '../ui/Textures';
import { fitOverlay, view } from '../ui/Layout';

/** Ball skins: star skins unlock with total stars, streak skins with consecutive days played. Pure cosmetics. */
export class SkinsScene extends Phaser.Scene {
  constructor() { super('Skins'); }
  create(data: { from?: string } = {}) {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.85).setInteractive();
    const P = view.portrait, cols = P ? 2 : 4, rows = Math.ceil(SKINS.length / cols), gx = 160, gy = 168;
    const pw = P ? 400 : 760, ph = P ? rows * gy + 190 : 500;
    panel(this, W / 2, H / 2, pw, ph);
    title(this, W / 2, H / 2 - ph / 2 + 40, 'BALL SKINS', 40);
    const stars = save.totalStars(), streak = save.data.visits.streak;
    this.add.text(W / 2, H / 2 - ph / 2 + 80, P ? `★ ${stars} / 120   ·   🔥 ${streak}-day streak` : `★ ${stars} / 120 stars   ·   🔥 ${streak}-day streak (play every day!)`, { fontFamily: FONT_BODY, fontSize: '15px', color: '#c4b5fd', fontStyle: '600' }).setOrigin(0.5);
    const x0 = W / 2 - gx * (cols - 1) / 2, y0 = H / 2 - ph / 2 + 176;
    SKINS.forEach((sk, i) => {
      const x = x0 + (i % cols) * gx, y = y0 + Math.floor(i / cols) * gy, open = skinOpen(i), sel = save.data.skin === i;
      const card = this.add.rectangle(x, y + 6, 140, 152, sk.streak ? 0x2a1236 : 0x1a1238, 0.92).setStrokeStyle(sel ? 4 : 2, sel ? 0x22c55e : open ? 0x67e8f9 : sk.streak ? 0xf97316 : 0x475569, 1);
      const ball = this.add.image(x, y - 22, playerKey(sel ? 'happy' : 'idle', 0, i)).setScale(1.7);
      if (!open) ball.setTint(0x222233).setAlpha(0.8);
      this.add.text(x, y + 28, sk.name, { fontFamily: FONT_HEAD, fontSize: '18px', color: open ? '#ffffff' : '#94a3b8', fontStyle: '800' }).setOrigin(0.5);
      const lock = sk.streak ? `🔒 ${sk.streak}-day streak` : `🔒 ★ ${sk.need}`;
      this.add.text(x, y + 54, sel ? 'EQUIPPED' : open ? 'TAP TO USE' : lock, { fontFamily: FONT_BODY, fontSize: '13px', color: sel ? '#4ade80' : open ? '#a5f3fc' : '#fbbf24', fontStyle: '800' }).setOrigin(0.5);
      if (open) card.setInteractive({ useHandCursor: true }).on('pointerup', () => { save.data.skin = i; save.save(); audio.sfx('star'); this.scene.restart(data); });
    });
    new Button(this, W / 2, H / 2 + ph / 2 - 38, 'DONE', () => { this.scene.stop(); if ((data.from ?? 'Menu') === 'Menu') this.scene.get('Menu').scene.restart(); }, { w: 220, h: 50, size: 24, color: 0x22c55e });
    fitOverlay(this, pw, ph);
  }
}
