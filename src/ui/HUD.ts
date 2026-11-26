import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, W } from '../config/gameConfig';
import { Button } from './Buttons';
import type { GravityDir } from '../types';

/** Glass top bar: controls on the left, level title in the centre, flip meter / time / star on the right. */
export class HUD {
  time: Phaser.GameObjects.Text; star: Phaser.GameObjects.Image; arrow: Phaser.GameObjects.Image; ttl: Phaser.GameObjects.Text; sub: Phaser.GameObjects.Text;
  pauseBtn: Button; restartBtn: Button; hintBtn: Button; hasStar: boolean;
  private pips: Phaser.GameObjects.Graphics; private left: Phaser.GameObjects.Text; private pipLabel: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, label: string, sub: string, hasStar: boolean, cb: { pause: () => void; restart: () => void; hint: () => void }, accent = 0x7c3aed) {
    this.hasStar = hasStar;
    const g = scene.add.graphics().setDepth(49);
    g.fillStyle(0x0b0b1a, 0.62).fillRect(0, 0, W, 50);
    g.fillStyle(0xffffff, 0.06).fillRect(0, 0, W, 24);
    g.fillStyle(accent, 1).fillRect(0, 48, W, 2);
    g.fillStyle(0xffffff, 0.25).fillRect(0, 48, W, 1);
    this.pauseBtn = new Button(scene, 30, 25, 'II', cb.pause, { w: 40, h: 34, size: 20, radius: 10, color: 0x3b82f6, depth: 50 });
    this.restartBtn = new Button(scene, 76, 25, '↻', cb.restart, { w: 40, h: 34, size: 24, radius: 10, color: 0x475569, depth: 50 });
    this.hintBtn = new Button(scene, 122, 25, '?', cb.hint, { w: 40, h: 34, size: 22, radius: 10, color: 0x0891b2, depth: 50 });
    this.ttl = scene.add.text(W / 2 - 60, 18, label, { fontFamily: FONT_HEAD, fontSize: '22px', color: '#fff', fontStyle: '800' }).setOrigin(0.5).setDepth(50).setStroke('#1e1b4b', 4);
    this.sub = scene.add.text(W / 2 - 60, 38, sub, { fontFamily: FONT_BODY, fontSize: '13px', color: '#c4b5fd', fontStyle: '600' }).setOrigin(0.5).setDepth(50);
    this.pipLabel = scene.add.text(W - 392, 14, 'FLIPS LEFT', { fontFamily: FONT_BODY, fontSize: '12px', color: '#a5b4fc', fontStyle: '600' }).setOrigin(0, 0.5).setDepth(50);
    this.pips = scene.add.graphics().setDepth(50);
    this.left = scene.add.text(W - 120, 25, '', { fontFamily: FONT_HEAD, fontSize: '20px', color: '#fff', fontStyle: '800' }).setOrigin(1, 0.5).setDepth(50);
    this.time = scene.add.text(W - 92, 25, '0:00', { fontFamily: FONT_BODY, fontSize: '18px', color: '#bae6fd', fontStyle: '600' }).setOrigin(0, 0.5).setDepth(50);
    this.star = scene.add.image(W - 22, 25, 'star_ui_off').setScale(0.7).setDepth(50).setVisible(hasStar);
    this.arrow = scene.add.image(W - 412, 25, 'chev').setScale(0.9).setDepth(50).setTint(0x67e8f9);
    this.setGravity('down');
  }
  /** `cap` may be Infinity for levels without a limit. */
  setFlips(used: number, cap: number, par: number) {
    const g = this.pips; g.clear();
    if (!isFinite(cap)) {
      // Relaxed mode: flips are free; the pips show the 3-star target (par). Gold while on target, grey once over.
      const n = Math.min(Math.max(par, 1), 16), sp = n > 11 ? 15 : 19, x0 = W - 392, over = used > par;
      for (let i = 0; i < n; i++) {
        const x = x0 + 8 + i * sp, y = 34;
        g.fillStyle(0x0b0b1a, 0.8).fillCircle(x, y, 7);
        if (i < used) { g.fillStyle(over ? 0x64748b : 0xfbbf24, 1).fillCircle(x, y, 5.5); g.fillStyle(0xffffff, 0.7).fillCircle(x - 1.6, y - 1.8, 1.8); }
        else g.lineStyle(1.5, 0xfbbf24, 0.8).strokeCircle(x, y, 5);
      }
      this.left.setText(`${used}`).setColor(over ? '#cbd5e1' : '#fde68a');
      this.pipLabel.setText(over ? `FLIPS · ★★★ needs ${par}` : `FLIPS · ★★★ in ${par}`);
      return;
    }
    const remaining = Math.max(0, cap - used), n = Math.min(cap, 16), sp = n > 11 ? 15 : 19, x0 = W - 392;
    for (let i = 0; i < n; i++) {
      const filled = i < remaining, x = x0 + 8 + i * sp, y = 34, isPar = i === cap - par - 1 && par < cap;
      g.fillStyle(0x0b0b1a, 0.8).fillCircle(x, y, 7);
      if (filled) { g.fillStyle(remaining <= 1 ? 0xfb7185 : 0x67e8f9, 1).fillCircle(x, y, 5.5); g.fillStyle(0xffffff, 0.7).fillCircle(x - 1.6, y - 1.8, 1.8); }
      else { g.lineStyle(1.5, 0x64748b, 0.8).strokeCircle(x, y, 5); }
      if (isPar && filled) g.lineStyle(1.5, 0xfbbf24, 1).strokeCircle(x, y, 7.5);
    }
    this.left.setText(`${remaining}`).setColor(remaining <= 1 ? '#fda4af' : '#ffffff');
    this.pipLabel.setText('FLIPS LEFT');
  }
  flash() { this.pips.scene.tweens.add({ targets: [this.pips, this.left], alpha: 0.2, yoyo: true, repeat: 3, duration: 90 }); }
  setTime(s: number) { const m = Math.floor(s / 60); this.time.setText(`${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`); }
  setStar(got: boolean) { this.star.setTexture(got ? 'star' : 'star_ui_off'); }
  setGravity(g: GravityDir) { this.arrow.setFlipY(g === 'down').setTint(g === 'down' ? 0x67e8f9 : 0xf0abfc); }
}
