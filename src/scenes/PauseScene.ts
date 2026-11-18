import Phaser from 'phaser';
import { FONT_BODY, H, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title, toggle } from '../ui/Buttons';
import type { GameplayScene } from './GameplayScene';

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }
  create() {
    audio.setDuck(0.5);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.72);
    panel(this, W / 2, H / 2 + 4, 470, 470);
    title(this, W / 2, H / 2 - 186, 'PAUSED', 46);
    const resume = () => { audio.setDuck(1); const g = this.scene.get('Gameplay') as GameplayScene; this.scene.stop(); this.scene.resume('Gameplay'); g.resumeGame(); };
    new Button(this, W / 2, H / 2 - 118, 'RESUME', resume, { w: 300, h: 60, color: 0x22c55e, size: 28, solid: true });
    new Button(this, W / 2, H / 2 - 52, 'RESTART', () => { resume(); (this.scene.get('Gameplay') as GameplayScene).restartLevel(); }, { w: 300, h: 50, color: 0x3b82f6, size: 22 });
    toggle(this, W / 2 - 90, H / 2 + 14, 'Music', () => save.data.settings.music, (v) => { save.data.settings.music = v; save.save(); audio.applySettings(); });
    toggle(this, W / 2 - 90, H / 2 + 58, 'Sound effects', () => save.data.settings.sound, (v) => { save.data.settings.sound = v; save.save(); audio.applySettings(); });
    new Button(this, W / 2, H / 2 + 122, 'LEVEL SELECT', () => { audio.setDuck(1); this.scene.stop('Gameplay'); this.scene.stop(); this.scene.start('LevelSelect'); }, { w: 300, h: 46, color: 0x7c3aed, size: 20 });
    new Button(this, W / 2, H / 2 + 176, 'MAIN MENU', () => { audio.setDuck(1); this.scene.stop('Gameplay'); this.scene.stop(); this.scene.start('Menu'); }, { w: 300, h: 40, color: 0x475569, size: 18 });
    this.add.text(W / 2, H / 2 - 140, '', { fontFamily: FONT_BODY });
    this.input.keyboard!.once('keydown-P', resume);
  }
}
