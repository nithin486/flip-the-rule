import Phaser from 'phaser';
import { FONT_BODY, H, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { Button, panel, title, toggle } from '../ui/Buttons';

export class SettingsScene extends Phaser.Scene {
  private confirm = false;
  constructor() { super('Settings'); }
  create() {
    this.confirm = false;
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0b1a, 0.78).setInteractive();
    panel(this, W / 2, H / 2, 600, 470);
    title(this, W / 2, H / 2 - 200, 'SETTINGS', 42);
    const s = save.data.settings; const up = () => { save.save(); audio.applySettings(); };
    toggle(this, W / 2 - 120, H / 2 - 135, 'Music', () => s.music, (v) => { s.music = v; up(); });
    toggle(this, W / 2 - 120, H / 2 - 90, 'Sound effects', () => s.sound, (v) => { s.sound = v; up(); });
    toggle(this, W / 2 - 120, H / 2 - 45, 'Reduce motion & flashes', () => s.reduceMotion, (v) => { s.reduceMotion = v; up(); });
    const modes = ['auto', 'on', 'off'] as const;
    const tc = new Button(this, W / 2 + 60, H / 2 + 5, '', () => { s.touchControls = modes[(modes.indexOf(s.touchControls) + 1) % 3]; tc.setLabel(`Touch controls: ${s.touchControls.toUpperCase()}`); up(); }, { w: 320, h: 40, size: 18, color: 0x475569, font: 'body' });
    tc.setLabel(`Touch controls: ${s.touchControls.toUpperCase()}`);
    this.add.text(W / 2, H / 2 + 75, 'CONTROLS\nMove: A / D or ← →     Flip gravity: SPACE (or ↑ / ↓)\nRestart: R     Pause: P     Touch: on-screen buttons', { fontFamily: FONT_BODY, fontSize: '15px', color: '#e2e8f0', align: 'center', lineSpacing: 6 }).setOrigin(0.5);
    const reset = new Button(this, W / 2 - 150, H / 2 + 165, 'RESET PROGRESS', () => {
      if (!this.confirm) { this.confirm = true; reset.setLabel('SURE? CLICK AGAIN'); reset.color = 0xef4444; reset.draw(false); return; }
      save.reset(); audio.applySettings(); this.scene.get('Menu').scene.restart(); this.scene.stop();
    }, { w: 250, h: 44, size: 16, color: 0x7f1d1d });
    new Button(this, W / 2 + 150, H / 2 + 165, 'DONE', () => this.scene.stop(), { w: 220, h: 50, size: 24, color: 0x22c55e });
  }
}
