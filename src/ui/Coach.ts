import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD } from '../config/gameConfig';

/**
 * In-world onboarding for the first levels: shows the keys (or the on-screen button to press) right above the ball,
 * one step at a time, and disappears as soon as the player has done it. Visuals over text, as CrazyGames' quality guide asks.
 */
export type CoachStep = 'move' | 'flip' | 'done';
export class Coach {
  step: CoachStep = 'move';
  private box: Phaser.GameObjects.Container;
  private startX: number;
  constructor(private scene: Phaser.Scene, x: number, private touch: boolean, private pulse: (w: 'pad' | 'flip' | null) => void) {
    this.startX = x;
    this.box = scene.add.container(x, 0).setDepth(44);
    this.show('move');
  }
  private keycap(x: number, label: string, w = 46) {
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(x - w / 2, -19, w, 42, 10);
    g.fillStyle(0xf8fafc, 1).fillRoundedRect(x - w / 2, -22, w, 40, 10);
    g.lineStyle(2, 0x67e8f9, 1).strokeRoundedRect(x - w / 2, -22, w, 40, 10);
    const t = this.scene.add.text(x, -2, label, { fontFamily: FONT_HEAD, fontSize: '22px', color: '#1e1b4b', fontStyle: '800' }).setOrigin(0.5);
    return [g, t];
  }
  private show(step: CoachStep) {
    this.step = step; this.box.removeAll(true); this.scene.tweens.killTweensOf(this.box);
    if (step === 'done') { this.pulse(null); this.box.setVisible(false); return; }
    const parts: Phaser.GameObjects.GameObject[] = [];
    if (this.touch) {
      const txt = step === 'move' ? 'Hold  ›  to roll' : 'Tap  FLIP!';
      const t = this.scene.add.text(0, 0, txt, { fontFamily: FONT_HEAD, fontSize: '24px', color: '#ffffff', fontStyle: '800', backgroundColor: 'rgba(30,27,75,0.85)', padding: { x: 14, y: 6 } }).setOrigin(0.5).setStroke('#1e1b4b', 4);
      parts.push(t);
      this.pulse(step === 'move' ? 'pad' : 'flip');
    } else if (step === 'move') {
      parts.push(...this.keycap(-28, '←'), ...this.keycap(28, '→'));
      parts.push(this.scene.add.text(0, 32, 'move', { fontFamily: FONT_BODY, fontSize: '15px', color: '#e0f2fe', fontStyle: '700' }).setOrigin(0.5).setStroke('#1e1b4b', 4));
    } else {
      parts.push(...this.keycap(0, 'SPACE', 110));
      parts.push(this.scene.add.text(0, 32, 'flip gravity!', { fontFamily: FONT_BODY, fontSize: '15px', color: '#f5d0fe', fontStyle: '700' }).setOrigin(0.5).setStroke('#1e1b4b', 4));
    }
    this.box.add(parts).setVisible(true).setScale(0.6).setAlpha(0);
    this.scene.tweens.add({ targets: this.box, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
    this.scene.tweens.add({ targets: this.box, scale: 1.08, duration: 520, yoyo: true, repeat: -1, delay: 240, ease: 'Sine.easeInOut' });
  }
  /** Call every frame with the ball position, gravity and flips used. `edgeX` = where the first flip should happen. */
  update(x: number, y: number, up: boolean, flips: number, edgeX: number) {
    if (this.step === 'done') return;
    if (flips > 0) { this.show('done'); return; }
    if (this.step === 'move' && x > edgeX - 40) this.show('flip');
    this.box.setPosition(Phaser.Math.Clamp(x, 80, 880), up ? y + 64 : y - 66);
  }
  destroy() { this.pulse(null); this.box.destroy(); }
}
