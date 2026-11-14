import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, TOTAL_LEVELS, W } from '../config/gameConfig';
import { platform } from '../platform';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title } from '../ui/Buttons';
import type { LevelData, LevelResult } from '../types';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() { super('LevelComplete'); }
  create(d: { result: LevelResult; level: LevelData; daily: boolean }) {
    const { result: r, level, daily } = d;
    audio.setDuck(0.6);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.7);
    panel(this, W / 2, H / 2 + 6, 560, 508);
    title(this, W / 2, H / 2 - 178, daily ? 'DAILY COMPLETE!' : 'LEVEL COMPLETE!', 44, '#fde68a');
    this.add.text(W / 2, H / 2 - 132, level.name, { fontFamily: FONT_BODY, fontSize: '16px', color: '#c4b5fd', fontStyle: '600' }).setOrigin(0.5);
    // stars pop in sequence
    for (let i = 0; i < 3; i++) {
      const x = W / 2 + (i - 1) * 92, y = H / 2 - 70 + (i === 1 ? -14 : 0);
      this.add.image(x, y, 'star_ui_off').setScale(1.5);
      if (i < r.stars) {
        const s = this.add.image(x, y, 'star').setScale(0).setAngle(-40);
        this.tweens.add({ targets: s, scale: 1.6, angle: 0, duration: 380, delay: 350 + i * 330, ease: 'Back.easeOut', onStart: () => this.time.delayedCall(0, () => audio.sfx('star')) });
      }
    }
    const rows: Array<[string, string]> = [
      ['Flips', `${r.flips} of ${level.flipLimit ?? '∞'} allowed  ·  par ${level.flipTarget}`], ['Time', `${r.time.toFixed(1)}s`], ['Star collected', r.collected ? 'Yes  +500' : 'No'],
      ['Efficiency', `+${r.breakdown.efficiency}`], ['Time bonus', `+${r.breakdown.time}`],
    ];
    rows.forEach(([a, b], i) => {
      this.add.text(W / 2 - 200, H / 2 + 10 + i * 26, a, { fontFamily: FONT_BODY, fontSize: '17px', color: '#cbd5e1', fontStyle: '500' }).setOrigin(0, 0.5);
      this.add.text(W / 2 + 200, H / 2 + 10 + i * 26, b, { fontFamily: FONT_BODY, fontSize: '17px', color: '#fff', fontStyle: '600' }).setOrigin(1, 0.5);
    });
    const sc = this.add.text(W / 2, H / 2 + 150, '0', { fontFamily: FONT_HEAD, fontSize: '46px', color: '#fbbf24', fontStyle: '800' }).setOrigin(0.5).setStroke('#451a03', 7);
    const o = { v: 0 }; this.tweens.add({ targets: o, v: r.score, duration: 900, delay: 300, onUpdate: () => sc.setText(`SCORE ${Math.round(o.v).toLocaleString()}`) });
    if (r.newBest) this.add.text(W / 2 + 232, H / 2 + 148, 'NEW BEST!', { fontFamily: FONT_HEAD, fontSize: '20px', color: '#22c55e', fontStyle: '800' }).setOrigin(0.5).setAngle(-8);
    if (!daily) this.add.text(W / 2, H / 2 + 184, `Best ${(save.data.bestScores[String(level.id)] ?? r.score).toLocaleString()}`, { fontFamily: FONT_BODY, fontSize: '14px', color: '#94a3b8' }).setOrigin(0.5);

    const gp = this.scene.get('Gameplay');
    const replay = () => { this.scene.stop(); gp.scene.restart({ levelId: level.id, daily }); };
    const next = async () => {
      this.input.enabled = false;
      await platform.requestMidgameAd(() => audio.setSuspended(true)).catch(() => {}); audio.setSuspended(false);
      this.scene.stop();
      if (daily) { this.scene.stop('Gameplay'); this.scene.start('Menu'); }
      else if (level.id >= TOTAL_LEVELS) { this.scene.stop('Gameplay'); this.scene.start('GameOver'); }
      else gp.scene.restart({ levelId: level.id + 1 });
    };
    new Button(this, W / 2 - 150, H / 2 + 224, daily ? 'MENU' : 'REPLAY', () => { if (daily) { this.scene.stop('Gameplay'); this.scene.stop(); this.scene.start('Menu'); } else replay(); }, { w: 200, h: 50, size: 22, color: 0x475569 });
    const nb = new Button(this, W / 2 + 90, H / 2 + 224, daily ? 'DONE' : (level.id >= TOTAL_LEVELS ? 'FINISH' : 'NEXT LEVEL ›'), () => void next(), { w: 270, h: 58, size: 28, color: 0x22c55e, solid: true });
    this.tweens.add({ targets: nb, scale: 1.05, duration: 600, yoyo: true, repeat: -1 });
    this.input.keyboard!.once('keydown-ENTER', () => void next());
    this.input.keyboard!.once('keydown-SPACE', () => void next());
    // confetti
    for (let i = 0; i < 40; i++) {
      const c = this.add.rectangle(Phaser.Math.Between(0, W), -20, 8, 14, Phaser.Utils.Array.GetRandom([0xfbbf24, 0x7c3aed, 0x06b6d4, 0x22c55e, 0xef4444])).setAngle(Phaser.Math.Between(0, 360));
      this.tweens.add({ targets: c, y: H + 30, angle: c.angle + 360, x: c.x + Phaser.Math.Between(-80, 80), duration: Phaser.Math.Between(1500, 3000), delay: Phaser.Math.Between(0, 900) });
    }
  }
}
