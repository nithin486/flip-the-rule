import Phaser from 'phaser';
import { FONT_BODY, H, W } from '../config/gameConfig';
import type { GameplayScene } from './GameplayScene';
import { audio } from '../systems/AudioSystem';
import { platform } from '../platform';
import { Button, panel, title } from '../ui/Buttons';

/**
 * Hint panel. The rewarded ad is requested here (a paused overlay), never on the active gameplay screen, as CrazyGames requires.
 * The tip is always free (the non-ad alternative). The ghost needs a video ad on portals that serve ads; if the ad fails or is blocked
 * there is NO reward - the player just sees a notice and can still use the free tip.
 */
export class HintScene extends Phaser.Scene {
  constructor() { super('Hint'); }
  create(data: { tip: string; canGhost: boolean }) {
    audio.setDuck(0.5);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.72).setInteractive();
    panel(this, W / 2, H / 2, 620, 410);
    title(this, W / 2, H / 2 - 156, 'HINT', 44);
    this.add.text(W / 2, H / 2 - 100, data.tip, { fontFamily: FONT_BODY, fontSize: '19px', color: '#e2e8f0', fontStyle: '600', align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5, 0);
    const gp = this.scene.get('Gameplay') as GameplayScene;
    const close = (ghost: boolean) => { audio.setDuck(1); this.scene.stop(); this.scene.resume('Gameplay'); gp.resumeGame(); if (ghost) gp.playGhost(); };
    const note = this.add.text(W / 2, H / 2 + 22, '', { fontFamily: FONT_BODY, fontSize: '15px', color: '#fbbf24', fontStyle: '600', align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5, 0);
    if (data.canGhost) {
      const needsAd = platform.hasAds;
      const gb = new Button(this, W / 2, H / 2 + 108, needsAd ? '▶  WATCH AD · SHOW GHOST' : 'SHOW GHOST', async () => {
        if (!needsAd) return close(true);
        gb.setEnabled(false); gb.setLabel('Loading video…');
        const ok = await platform.requestRewardedAd(() => audio.setSuspended(true)).catch(() => false);
        audio.setSuspended(false);
        if (!this.sys.isActive()) return;
        if (ok) close(true);
        else { gb.setEnabled(true); gb.setLabel('▶  WATCH AD · SHOW GHOST'); note.setText('No video is available right now - try again in a moment. The tip above is always free.'); }
      }, { w: 380, h: 52, size: 20, color: 0x0891b2, solid: true });
    }
    new Button(this, W / 2, H / 2 + 166, 'BACK TO GAME', () => close(false), { w: 260, h: 44, size: 18, color: 0x475569 });
    this.input.keyboard!.once('keydown-P', () => close(false));
  }
}
