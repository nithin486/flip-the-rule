import Phaser from 'phaser';
import { FONT_BODY, H, TOTAL_LEVELS, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title } from '../ui/Buttons';
import { bgKey } from '../ui/Textures';

/** End-of-game summary after the final level: score, best score, Retry (replays the last level instantly) and Home. */
export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }
  create() {
    audio.play('menu', 62);
    this.add.image(W / 2, H / 2, bgKey(this, 8, true));
    panel(this, W / 2, H / 2, 560, 420);
    title(this, W / 2, H / 2 - 150, 'ALL WORLDS CLEARED!', 40, '#fde68a');
    const stars = save.totalStars();
    this.add.text(W / 2, H / 2 - 70, `Total score  ${save.data.totalScore.toLocaleString()}`, { fontFamily: FONT_BODY, fontSize: '26px', color: '#fff', fontStyle: '600' }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 28, `Best level scores summed · ★ ${stars} / ${TOTAL_LEVELS * 3}`, { fontFamily: FONT_BODY, fontSize: '16px', color: '#c4b5fd' }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 20, stars >= TOTAL_LEVELS * 3 ? 'Perfect! Every star collected. You flipped the rule.' : 'Go back and chase the missing stars — collect them all and beat each flip target.', { fontFamily: FONT_BODY, fontSize: '15px', color: '#e2e8f0', align: 'center', wordWrap: { width: 460 } }).setOrigin(0.5);
    new Button(this, W / 2 - 130, H / 2 + 120, `RETRY LEVEL ${TOTAL_LEVELS}`, () => this.scene.start('Gameplay', { levelId: TOTAL_LEVELS }), { w: 240, h: 54, size: 20, color: 0x7c3aed });
    new Button(this, W / 2 + 130, H / 2 + 120, 'HOME', () => this.scene.start('Menu'), { w: 200, h: 54, size: 24, color: 0x22c55e });
    for (let i = 0; i < 50; i++) { const c = this.add.rectangle(Phaser.Math.Between(0, W), -20, 8, 14, Phaser.Utils.Array.GetRandom([0xfbbf24, 0x7c3aed, 0x06b6d4, 0x22c55e])); this.tweens.add({ targets: c, y: H + 30, angle: 360, duration: Phaser.Math.Between(2000, 4000), delay: Phaser.Math.Between(0, 2000), repeat: -1 }); }
  }
}
