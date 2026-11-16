import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, TOTAL_LEVELS, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { save } from '../systems/SaveSystem';
import { Button, body } from '../ui/Buttons';
import { bgKey, playerKey, platformKey } from '../ui/Textures';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    audio.play('menu', 57);
    this.cameras.main.fadeIn(300, 11, 11, 26);
    this.add.image(W / 2, H / 2, bgKey(this, 1, false));
    const up = this.add.image(W / 2, H / 2, bgKey(this, 1, true)).setAlpha(0);

    const shade = this.add.graphics(); shade.fillGradientStyle(0x0b0b2e, 0x0b0b2e, 0x2e1065, 0x2e1065, 0.62).fillRect(0, 0, W, H);
    // --- atmosphere: god-rays, parallax islands, twinkling stars ---
    const parallax: Array<{ o: Phaser.GameObjects.Image; k: number; bx: number; by: number }> = [];
    for (let i = 0; i < 4; i++) {
      const r = this.add.image(140 + i * 230, -30, 'ray').setOrigin(0.5, 0).setAlpha(0.09 + (i % 2) * 0.04).setBlendMode(Phaser.BlendModes.ADD).setScale(1.3, 1.5).setAngle(-12 + i * 8);
      this.tweens.add({ targets: r, angle: r.angle + 7, alpha: r.alpha * 0.5, duration: 4200 + i * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    const isl: Array<[string, number, number, number, number]> = [['isl_a', 90, 250, 0.7, 0.5], ['isl_b', 860, 120, 0.7, 0.8], ['isl_c', 520, 70, 0.55, 1.1], ['isl_b', 70, 130, 0.5, 1.3], ['isl_c', 900, 430, 0.8, 0.9]];
    isl.forEach(([k, x, y, sc, par], i) => {
      const o = this.add.image(x, y, k).setScale(sc).setAlpha(0.8).setDepth(0); parallax.push({ o, k: par, bx: x, by: y });
      this.tweens.add({ targets: o, y: y + 12 + i * 2, duration: 2600 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    for (let i = 0; i < 26; i++) { const st = this.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 300), 'spark').setScale(Phaser.Math.FloatBetween(0.3, 0.8)).setAlpha(0.1).setTint(i % 3 ? 0xffffff : 0x67e8f9); this.tweens.add({ targets: st, alpha: 0.9, duration: Phaser.Math.Between(900, 2200), delay: Phaser.Math.Between(0, 2000), yoyo: true, repeat: -1 }); }
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { const dx = (p.x - W / 2) / W, dy = (p.y - H / 2) / H; parallax.forEach((q) => { q.o.x = q.bx - dx * 26 * q.k; }); void dy; });
    this.add.image(W / 2, H / 2, 'vignette').setScale(2).setDepth(40).setAlpha(0.9);

    // --- logo: "UPSIDE" literally flips upside-down ---
    const flip = this.add.text(W / 2 - 175, 92, 'UPSIDE', { fontFamily: FONT_HEAD, fontSize: '78px', color: '#fbbf24', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14).setShadow(0, 6, 'rgba(0,0,0,.4)', 0, true, true);
    const rule = this.add.text(W / 2 + 120, 92, 'DOWN RUN', { fontFamily: FONT_HEAD, fontSize: '78px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14).setShadow(0, 6, 'rgba(0,0,0,.4)', 0, true, true);
    const gold = flip.context.createLinearGradient(0, 0, 0, flip.height); gold.addColorStop(0, '#fff7ad'); gold.addColorStop(0.5, '#fbbf24'); gold.addColorStop(1, '#f59e0b'); flip.setFill(gold);
    const wh = rule.context.createLinearGradient(0, 0, 0, rule.height); wh.addColorStop(0, '#ffffff'); wh.addColorStop(1, '#c4b5fd'); rule.setFill(wh);
    const halo = this.add.image(W / 2, 100, 'glow').setScale(11, 3.6).setTint(0xa78bfa).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(-1);
    this.tweens.add({ targets: halo, alpha: 0.9, scaleX: 12, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    { const gap = 22, tw = flip.width + rule.width + gap, x0 = W / 2 - tw / 2; flip.setX(x0 + flip.width / 2).setY(88); rule.setX(x0 + flip.width + gap + rule.width / 2).setY(88); }
    this.tweens.add({ targets: flip, scaleY: { from: 1, to: -1 }, duration: 500, ease: 'Back.easeInOut', yoyo: true, hold: 1800, repeatDelay: 1800, repeat: -1, onYoyo: () => this.tweens.add({ targets: up, alpha: 1, duration: 400 }), onRepeat: () => this.tweens.add({ targets: up, alpha: 0, duration: 400 }) });
    this.add.text(W / 2, 150, 'You can\'t jump. Flip gravity \u2014 but every flip counts.', { fontFamily: FONT_BODY, fontSize: '18px', color: '#f5f3ff', fontStyle: '600' }).setOrigin(0.5).setShadow(0, 2, 'rgba(0,0,0,.5)', 3);

    // --- animated character shuttling between floor and ceiling platforms ---
    const key = platformKey(this, 240, 26, 1, 'solid');
    this.add.image(190, 470, key); this.add.image(190, 330, key);
    const ball = this.add.image(190, 470 - 13 - 19, playerKey('idle', 1));
    const loop = () => {
      ball.setTexture(playerKey('flip', 1));
      this.tweens.add({ targets: ball, y: 330 + 13 + 19, duration: 650, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipUp'), onComplete: () => { ball.setFlipY(true).setTexture(playerKey('idle', 1)); this.tweens.add({ targets: ball, scaleY: 0.8, duration: 80, yoyo: true }); this.time.delayedCall(1100, () => { ball.setTexture(playerKey('flip', 1)); this.tweens.add({ targets: ball, y: 470 - 32, duration: 650, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipDown'), onComplete: () => { ball.setFlipY(false).setTexture(playerKey('happy', 1)); this.tweens.add({ targets: ball, scaleY: 0.8, duration: 80, yoyo: true }); this.time.delayedCall(1100, loop); } }); }); } });
    };
    this.time.delayedCall(900, loop);
    this.add.image(780, 470, key).setScale(0.6, 1); this.add.image(770, 440, 'star').setScale(1.1);
    this.tweens.add({ targets: this.children.list[this.children.list.length - 1], y: 430, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });

    // --- polish: glow orbs, vignette, difficulty badge ---
    for (let i = 0; i < 16; i++) {
      const o = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(2, 5), i % 2 ? 0x67e8f9 : 0xf0abfc, 0.0).setDepth(1);
      this.tweens.add({ targets: o, alpha: { from: 0, to: 0.65 }, y: o.y - Phaser.Math.Between(60, 160), duration: Phaser.Math.Between(2400, 5200), delay: Phaser.Math.Between(0, 3000), repeat: -1, ease: 'Sine.easeInOut', yoyo: true });
    }
    const vg = this.add.graphics().setDepth(0); vg.fillStyle(0x000000, 0.28).fillRect(0, 0, W, 26).fillRect(0, H - 26, W, 26);
    const badge = this.add.container(W / 2, 184).setDepth(2);
    badge.add([this.add.rectangle(0, 0, 330, 26, 0x0b0b1a, 0.6).setStrokeStyle(2, 0x67e8f9, 0.9), this.add.text(0, 0, `${TOTAL_LEVELS} LEVELS  ·  8 WORLDS  ·  LIMITED FLIPS`, { fontFamily: FONT_BODY, fontSize: '13px', color: '#a5f3fc', fontStyle: '800' }).setOrigin(0.5)]);
    this.tweens.add({ targets: badge, alpha: 0.75, duration: 1100, yoyo: true, repeat: -1 });

    // --- buttons ---
    const next = Math.min(TOTAL_LEVELS, save.data.unlockedLevel);
    const started = save.totalStars() > 0 || save.data.unlockedLevel > 1;
    const play = new Button(this, W / 2 + 150, 262, started ? `PLAY · Level ${next}` : 'PLAY', () => this.go('Gameplay', { levelId: next }), { w: 330, h: 78, size: 38, color: 0x22c55e, radius: 22, solid: true });
    this.tweens.add({ targets: play, scale: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    new Button(this, W / 2 + 150, 350, 'LEVEL SELECT', () => this.go('LevelSelect'), { w: 330, h: 56, size: 24, color: 0x7c3aed });
    const done = !!save.data.daily.completed[LevelSystem.dateKey()];
    new Button(this, W / 2 + 150, 418, done ? 'DAILY CHALLENGE ✓' : 'DAILY CHALLENGE', () => this.go('Gameplay', { daily: true }), { w: 330, h: 56, size: 24, color: 0x3b82f6 });
    new Button(this, 190, 250, 'BALL SKINS', () => this.scene.launch('Skins'), { w: 190, h: 44, size: 18, color: 0xdb2777 });
    new Button(this, W / 2 + 150, 486, 'SETTINGS', () => this.scene.launch('Settings', { from: 'Menu' }), { w: 330, h: 50, size: 22, color: 0x475569 });

    // --- progress ---
    const s = save.totalStars();
    const pill = (x: number, y: number, w: number, label: string, col: number, tc: string) => {
      const g = this.add.graphics().setDepth(3); g.fillStyle(0x0b0b1a, 0.62).fillRoundedRect(x - w / 2, y - 16, w, 32, 16).lineStyle(2, col, 0.9).strokeRoundedRect(x - w / 2, y - 16, w, 32, 16);
      return this.add.text(x, y, label, { fontFamily: FONT_BODY, fontSize: '15px', color: tc, fontStyle: '700' }).setOrigin(0.5).setDepth(3);
    };
    pill(190, 500, 300, `★ ${s} / ${TOTAL_LEVELS * 3}    ·    Score ${save.data.totalScore.toLocaleString()}`, 0xfbbf24, '#fef3c7');
    if (save.data.daily.streak > 0) pill(112, 30, 190, `🔥 Daily streak ${save.data.daily.streak}`, 0xf97316, '#ffedd5');
    this.input.keyboard!.on('keydown-ENTER', () => this.go('Gameplay', { levelId: next }));
    this.input.keyboard!.on('keydown-SPACE', () => this.go('Gameplay', { levelId: next }));
  }
  private go(scene: string, data?: object) { audio.stopMusic(); this.cameras.main.fadeOut(180, 11, 11, 26); this.time.delayedCall(190, () => this.scene.start(scene, data)); }
}
