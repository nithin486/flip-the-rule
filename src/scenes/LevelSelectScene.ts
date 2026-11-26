import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, W, WORLDS } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { Button, title } from '../ui/Buttons';
import { bgKey } from '../ui/Textures';
import { coverImage, view } from '../ui/Layout';

export class LevelSelectScene extends Phaser.Scene {
  private world = 1;
  constructor() { super('LevelSelect'); }
  create() {
    audio.play('menu', 57);
    this.cameras.main.fadeIn(200, 11, 11, 26);
    const wi = WORLDS.findIndex((w) => save.data.unlockedLevel >= w.first && save.data.unlockedLevel <= w.last); this.world = Math.max(1, wi + 1);
    this.draw(true);
    this.input.keyboard!.on('keydown-LEFT', () => this.shift(-1)); this.input.keyboard!.on('keydown-RIGHT', () => this.shift(1));
  }
  private back() { this.scene.start('Menu'); }
  private shift(d: number) { const n = Phaser.Math.Clamp(this.world + d, 1, WORLDS.length); if (n !== this.world) { this.world = n; audio.sfx('click'); this.draw(true); } }
  private draw(animate = false) {
    this.children.removeAll(true); this.tweens.killAll();
    const th = WORLDS[this.world - 1], P = view.portrait, VW = view.w, VH = view.h;
    coverImage(this, bgKey(this, this.world, false));
    const shade = this.add.graphics(); shade.fillGradientStyle(0x0b0b1a, 0x0b0b1a, 0x1e1b4b, 0x1e1b4b, 0.72).fillRect(0, 0, VW, VH);
    for (let i = 0; i < 3; i++) { const o = this.add.image((160 + i * 320) * VW / W, VH - 70, 'isl_' + 'abc'[i]).setAlpha(0.35).setScale(1 + i * 0.1); this.tweens.add({ targets: o, y: o.y + 10, duration: 2400 + i * 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
    this.add.image(VW / 2, VH / 2, 'vignette').setDisplaySize(VW * 1.1, VH * 1.1);
    // header
    const hy = P ? 110 : 56; const halo = this.add.image(VW / 2, hy + 4, 'glow').setScale(10, 2.6).setTint(th.accent).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: halo, alpha: 0.8, duration: 1500, yoyo: true, repeat: -1 });
    title(this, VW / 2, hy, th.name.toUpperCase(), P ? 40 : 46);
    this.add.text(VW / 2, hy + 44, `WORLD ${this.world} / ${WORLDS.length}  ·  ${th.blurb.toUpperCase()}`, { fontFamily: FONT_BODY, fontSize: '14px', color: '#e9d5ff', fontStyle: '700' }).setOrigin(0.5).setLetterSpacing(2);
    let got = 0; const n = th.last - th.first + 1; for (let id = th.first; id <= th.last; id++) got += save.stars(id);
    const bw = 260, bx = VW / 2 - bw / 2 - (P ? 30 : 0), by = hy + 62;
    const bar = this.add.graphics(); bar.fillStyle(0x000000, 0.5).fillRoundedRect(bx, by, bw, 12, 6).fillStyle(0xfbbf24, 1).fillRoundedRect(bx, by, Math.max(12, bw * got / (n * 3)), 12, 6).lineStyle(1, 0xffffff, 0.4).strokeRoundedRect(bx, by, bw, 12, 6);
    this.add.text(bx + bw + 12, by + 6, `★ ${got}/${n * 3}`, { fontFamily: FONT_BODY, fontSize: '13px', color: '#fde68a', fontStyle: '700' }).setOrigin(0, 0.5);
    new Button(this, 44, 40, '‹', () => this.back(), { w: 56, h: 46, size: 34, color: 0x475569 });
    if (P) {
      new Button(this, 70, VH - 120, '‹', () => this.shift(-1), { w: 92, h: 70, size: 44, color: th.accent }).setEnabled(this.world > 1);
      new Button(this, VW - 70, VH - 120, '›', () => this.shift(1), { w: 92, h: 70, size: 44, color: th.accent }).setEnabled(this.world < WORLDS.length);
    } else {
      new Button(this, 66, H / 2 + 10, '‹', () => this.shift(-1), { w: 52, h: 92, size: 40, color: th.accent }).setEnabled(this.world > 1);
      new Button(this, W - 66, H / 2 + 10, '›', () => this.shift(1), { w: 52, h: 92, size: 40, color: th.accent }).setEnabled(this.world < WORLDS.length);
    }
    // tiles
    const cols = P ? 3 : 5, tw = P ? 132 : 118, gap = P ? 24 : 20, x0 = VW / 2 - (Math.min(cols, n) * tw + (Math.min(cols, n) - 1) * gap) / 2 + tw / 2, y0 = P ? Math.round(VH * 0.38) : 262, rowH = tw + 74;
    for (let i = 0; i < n; i++) {
      const id = th.first + i, row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols), c = i % cols;
      const x = VW / 2 - (inRow * tw + (inRow - 1) * gap) / 2 + tw / 2 + c * (tw + gap), y = y0 + row * rowH; void x0;
      const unlocked = save.isUnlocked(id), stars = save.stars(id);
      const card = this.add.container(x, y);
      const g = this.add.graphics(); card.add(g);
      const C = Phaser.Display.Color.IntegerToColor(th.accent);
      if (unlocked) {
        g.fillStyle(th.accent, 0.28).fillRoundedRect(-tw / 2 - 6, -tw / 2 - 2, tw + 12, tw + 14, 26);
        g.fillStyle(0x000000, 0.45).fillRoundedRect(-tw / 2, -tw / 2 + 7, tw, tw, 20);
        g.fillStyle(C.clone().darken(45).color, 1).fillRoundedRect(-tw / 2, -tw / 2 + 4, tw, tw, 20);
        g.fillGradientStyle(C.clone().lighten(22).color, C.clone().lighten(22).color, C.clone().darken(10).color, C.clone().darken(10).color, 1).fillRoundedRect(-tw / 2, -tw / 2, tw, tw - 4, 20);
        g.fillStyle(0xffffff, 0.22).fillRoundedRect(-tw / 2 + 7, -tw / 2 + 5, tw - 14, tw * 0.34, { tl: 15, tr: 15, bl: 6, br: 6 });
        g.lineStyle(3, 0xffffff, 0.6).strokeRoundedRect(-tw / 2, -tw / 2, tw, tw - 4, 20);
        card.add(this.add.text(0, -20, String(id), { fontFamily: FONT_HEAD, fontSize: '46px', color: '#fff', fontStyle: '800' }).setOrigin(0.5).setStroke('#1e1b4b', 7));
        const lv = LevelSystem.get(id); const lim = save.data.settings.hardMode ? lv.flipLimit : lv.flipTarget;
        if (lim) { const cg = this.add.graphics(); cg.fillStyle(0x0b0b1a, 0.7).fillRoundedRect(-40, 3, 80, 20, 10).lineStyle(1.5, 0x67e8f9, 0.9).strokeRoundedRect(-40, 3, 80, 20, 10); card.add(cg); card.add(this.add.text(0, 13, save.data.settings.hardMode ? `⚡ ${lim} flips` : `★★★ ${lim} flip${lim === 1 ? '' : 's'}`, { fontFamily: FONT_BODY, fontSize: '12px', color: '#a5f3fc', fontStyle: '700' }).setOrigin(0.5)); }
        card.add(this.add.text(0, tw / 2 + 18, lv.name, { fontFamily: FONT_BODY, fontSize: '13px', color: '#e9d5ff', fontStyle: '700' }).setOrigin(0.5));
        for (let s = 0; s < 3; s++) card.add(this.add.image(-28 + s * 28, 40, s < stars ? 'star' : 'star_ui_off').setScale(0.5));
        const hit = this.add.zone(0, 0, tw, tw).setInteractive({ useHandCursor: true }); card.add(hit);
        hit.on('pointerover', () => this.tweens.add({ targets: card, y: y - 6, scale: 1.05, duration: 100 })); hit.on('pointerout', () => this.tweens.add({ targets: card, y, scale: 1, duration: 100 }));
        hit.on('pointerup', () => { audio.sfx('click'); audio.stopMusic(); this.scene.start('Gameplay', { levelId: id }); });
        if (id === save.data.unlockedLevel && stars === 0) { const ring = this.add.graphics(); ring.lineStyle(4, 0xfbbf24, 1).strokeRoundedRect(-tw / 2 - 7, -tw / 2 - 7, tw + 14, tw + 14, 26); card.add(ring); this.tweens.add({ targets: ring, alpha: 0.2, scale: 1.06, duration: 750, yoyo: true, repeat: -1 }); }
      } else {
        g.fillStyle(0x000000, 0.4).fillRoundedRect(-tw / 2, -tw / 2 + 6, tw, tw, 20);
        g.fillGradientStyle(0x334155, 0x334155, 0x1e293b, 0x1e293b, 0.92).fillRoundedRect(-tw / 2, -tw / 2, tw, tw - 4, 20);
        g.lineStyle(2, 0x64748b, 0.6).strokeRoundedRect(-tw / 2, -tw / 2, tw, tw - 4, 20);
        g.fillStyle(0x94a3b8, 1).fillRoundedRect(-17, -8, 34, 28, 6); g.lineStyle(5, 0x94a3b8, 1).beginPath().arc(0, -10, 11, Math.PI, 0, false).strokePath(); g.fillStyle(0x1e293b, 1).fillCircle(0, 5, 4);
        card.add(this.add.text(0, 40, String(id), { fontFamily: FONT_HEAD, fontSize: '20px', color: '#94a3b8', fontStyle: '800' }).setOrigin(0.5));
      }
      if (animate) { card.setAlpha(0).setScale(0.7); this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 320, delay: i * 55, ease: 'Back.easeOut' }); }
    }
    // world dots
    WORLDS.forEach((w, i) => { const cur = i + 1 === this.world; const d = this.add.circle(VW / 2 + (i - (WORLDS.length - 1) / 2) * 28, P ? VH - 120 : H - 34, cur ? 8 : 6, cur ? 0xfbbf24 : 0xffffff, cur ? 1 : 0.4).setStrokeStyle(2, 0x000000, 0.4).setInteractive({ useHandCursor: true }); d.on('pointerup', () => { this.world = i + 1; this.draw(true); }); });
  }
}
