import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD, H, TOTAL_LEVELS, W } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { save } from '../systems/SaveSystem';
import { Button, body } from '../ui/Buttons';
import { SKINS, bgKey, nextStreakSkin, playerKey, platformKey } from '../ui/Textures';
import { coverImage, view } from '../ui/Layout';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    audio.play('menu', 57);
    this.cameras.main.fadeIn(300, 11, 11, 26);
    if (view.portrait) { this.createPortrait(); return; }
    this.add.image(W / 2, H / 2, bgKey(this, 1, false));
    const up = this.add.image(W / 2, H / 2, bgKey(this, 1, true)).setAlpha(0);

    const shade = this.add.graphics(); shade.fillGradientStyle(0x0b0b2e, 0x0b0b2e, 0x2e1065, 0x2e1065, 0.28, 0.28, 0.5, 0.5).fillRect(0, 0, W, H);
    // --- atmosphere: soft light shafts, drifting clouds, twinkles ---
    for (let i = 0; i < 3; i++) {
      const r = this.add.image(220 + i * 260, -40, 'ray').setOrigin(0.5, 0).setAlpha(0.07).setBlendMode(Phaser.BlendModes.ADD).setScale(1.6, 1.4).setAngle(-14 + i * 9);
      this.tweens.add({ targets: r, angle: r.angle + 6, alpha: 0.03, duration: 5200 + i * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    for (let i = 0; i < 4; i++) {
      const cl = this.add.image(Phaser.Math.Between(0, W), 120 + i * 110, 'cloud').setScale(1.4 + i * 0.3).setAlpha(0.12).setTint(0xc4b5fd);
      this.tweens.add({ targets: cl, x: cl.x + (i % 2 ? -140 : 140), duration: 26000 + i * 6000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    for (let i = 0; i < 22; i++) { const st = this.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 260), 'spark').setScale(Phaser.Math.FloatBetween(0.3, 0.7)).setAlpha(0.1).setTint(i % 3 ? 0xffffff : 0x67e8f9); this.tweens.add({ targets: st, alpha: 0.85, duration: Phaser.Math.Between(900, 2200), delay: Phaser.Math.Between(0, 2000), yoyo: true, repeat: -1 }); }
    const parallax: Array<{ o: Phaser.GameObjects.Image; k: number; bx: number }> = [];
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { const dx = (p.worldX - W / 2) / W; parallax.forEach((q) => { q.o.x = q.bx - dx * 18 * q.k; }); });
    this.add.image(W / 2, H / 2, 'vignette').setScale(2).setDepth(40).setAlpha(0.75);

    // --- logo: "UPSIDE" flips upside-down now and then ---
    const flip = this.add.text(0, 0, 'UPSIDE', { fontFamily: FONT_HEAD, fontSize: '80px', color: '#fbbf24', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14).setShadow(0, 7, 'rgba(10,0,30,.55)', 0, true, true);
    const rule = this.add.text(0, 0, 'DOWN RUN', { fontFamily: FONT_HEAD, fontSize: '80px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14).setShadow(0, 7, 'rgba(10,0,30,.55)', 0, true, true);
    const gold = flip.context.createLinearGradient(0, 0, 0, flip.height); gold.addColorStop(0, '#fff7ad'); gold.addColorStop(0.5, '#fbbf24'); gold.addColorStop(1, '#f59e0b'); flip.setFill(gold);
    const wh = rule.context.createLinearGradient(0, 0, 0, rule.height); wh.addColorStop(0, '#ffffff'); wh.addColorStop(1, '#c4b5fd'); rule.setFill(wh);
    const halo = this.add.image(W / 2, 74, 'glow').setScale(12, 3.2).setTint(0xa78bfa).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(-1);
    this.tweens.add({ targets: halo, alpha: 0.85, scaleX: 13, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    { const gap = 22, tw = flip.width + rule.width + gap, x0 = W / 2 - tw / 2; flip.setPosition(x0 + flip.width / 2, 70); rule.setPosition(x0 + flip.width + gap + rule.width / 2, 70); }
    this.tweens.add({ targets: flip, scaleY: { from: 1, to: -1 }, duration: 520, ease: 'Back.easeInOut', yoyo: true, hold: 2200, repeatDelay: 3200, repeat: -1, onYoyo: () => this.tweens.add({ targets: up, alpha: 0.9, duration: 400 }), onRepeat: () => this.tweens.add({ targets: up, alpha: 0, duration: 400 }) });
    this.add.text(W / 2, 128, 'You can\'t jump. Flip gravity — but every flip counts.', { fontFamily: FONT_BODY, fontSize: '19px', color: '#f5f3ff', fontStyle: '600' }).setOrigin(0.5).setShadow(0, 2, 'rgba(0,0,0,.6)', 4);

    // --- hero showcase (left): the ball flips between two stone slabs, star and exit portal close by ---
    const sx = 250, topY = 236, botY = 446, slab = platformKey(this, 300, 30, 1, 'solid');
    const stage = this.add.image(sx, (topY + botY) / 2, 'glow').setScale(7, 5.2).setTint(0x7c3aed).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: stage, alpha: 0.55, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const sh1 = this.add.image(sx, botY, 'glow').setTint(0x02010a).setAlpha(0.5).setDisplaySize(360, 70), sh2 = this.add.image(sx, topY, 'glow').setTint(0x02010a).setAlpha(0.5).setDisplaySize(360, 70);
    const pBot = this.add.image(sx, botY, slab), pTop = this.add.image(sx, topY, slab);
    [sh1, sh2, pBot, pTop].forEach((o) => parallax.push({ o, k: 0.6, bx: o.x }));
    const portal = this.add.image(sx + 128, topY + 52, 'exit_b').setScale(0.75), portalA = this.add.image(sx + 128, topY + 52, 'exit_a').setScale(0.62);
    this.tweens.add({ targets: portalA, angle: 360, duration: 4000, repeat: -1 }); this.tweens.add({ targets: portal, scale: 0.9, alpha: 0.7, duration: 900, yoyo: true, repeat: -1 });
    const star = this.add.image(sx - 118, topY + 70, 'star').setScale(1.25); this.tweens.add({ targets: star, y: star.y + 10, angle: 8, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const BS = 2, R = 19 * BS, ballHalo = this.add.image(sx, botY - 15 - R, 'glow').setScale(2.6).setAlpha(0.45).setTint(0x67e8f9).setBlendMode(Phaser.BlendModes.ADD);
    const ball = this.add.image(sx - 40, botY - 15 - R, playerKey('idle', 1)).setScale(BS);
    const trail = this.add.particles(0, 0, 'glow', { lifespan: 420, scale: { start: 0.9, end: 0 }, alpha: { start: 0.5, end: 0 }, frequency: 30, tint: 0x67e8f9, blendMode: 'ADD', follow: ball }).setDepth(-0.5);
    const loop = () => {
      ball.setTexture(playerKey('flip', 1)); trail.setParticleTint(0xf0abfc); ballHalo.setTint(0xf0abfc);
      this.tweens.add({ targets: ball, y: topY + 15 + R, duration: 620, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipUp'), onComplete: () => {
        ball.setFlipY(true).setTexture(playerKey('idle', 1)); this.tweens.add({ targets: ball, scaleY: BS * 0.82, duration: 80, yoyo: true });
        this.tweens.add({ targets: ball, x: sx + 40, duration: 900, ease: 'Sine.easeInOut' });
        this.time.delayedCall(1200, () => { ball.setTexture(playerKey('flip', -1)); trail.setParticleTint(0x67e8f9); ballHalo.setTint(0x67e8f9); this.tweens.add({ targets: ball, y: botY - 15 - R, duration: 620, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipDown'), onComplete: () => {
          ball.setFlipY(false).setTexture(playerKey('happy', -1)); this.tweens.add({ targets: ball, scaleY: BS * 0.82, duration: 80, yoyo: true });
          this.tweens.add({ targets: ball, x: sx - 40, duration: 900, ease: 'Sine.easeInOut' });
          this.time.delayedCall(1200, loop);
        } }); });
      } });
    };
    { const f = () => ballHalo.setPosition(ball.x, ball.y); this.events.on('update', f); this.events.once('shutdown', () => this.events.off('update', f)); }
    this.time.delayedCall(900, loop);

    // --- badge ---
    const badge = this.add.container(W / 2 + 160, 168).setDepth(2);
    const bgr = this.add.graphics(); bgr.fillStyle(0x0b0b1a, 0.55).fillRoundedRect(-170, -14, 340, 28, 14).lineStyle(1.5, 0x67e8f9, 0.8).strokeRoundedRect(-170, -14, 340, 28, 14);
    badge.add([bgr, this.add.text(0, 0, `${TOTAL_LEVELS} LEVELS  ·  8 WORLDS  ·  DAILY CHALLENGE`, { fontFamily: FONT_BODY, fontSize: '13px', color: '#a5f3fc', fontStyle: '800' }).setOrigin(0.5)]);

    // --- buttons ---
    const next = Math.min(TOTAL_LEVELS, save.data.unlockedLevel);
    const started = save.totalStars() > 0 || save.data.unlockedLevel > 1;
    const play = new Button(this, W / 2 + 160, 248, started ? `PLAY · Level ${next}` : 'PLAY', () => this.go('Gameplay', { levelId: next }), { w: 340, h: 82, size: 38, color: 0x22c55e, radius: 24, solid: true });
    this.tweens.add({ targets: play, scale: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    new Button(this, W / 2 + 160, 338, 'LEVEL SELECT', () => this.go('LevelSelect'), { w: 340, h: 58, size: 24, color: 0x7c3aed });
    const done = !!save.data.daily.completed[LevelSystem.dateKey()];
    new Button(this, W / 2 + 160, 406, done ? 'DAILY CHALLENGE ✓' : 'DAILY CHALLENGE', () => this.go('Gameplay', { daily: true }), { w: 340, h: 58, size: 24, color: 0x3b82f6 });
    new Button(this, W / 2 + 160 - 87, 474, 'SKINS', () => this.scene.launch('Skins', { from: 'Menu' }), { w: 166, h: 52, size: 22, color: 0xdb2777 });
    new Button(this, W / 2 + 160 + 87, 474, 'SETTINGS', () => this.scene.launch('Settings', { from: 'Menu' }), { w: 166, h: 52, size: 22, color: 0x475569 });

    // --- progress ---
    const s = save.totalStars();
    const pill = (x: number, y: number, w: number, label: string, col: number, tc: string) => {
      const g = this.add.graphics().setDepth(3); g.fillStyle(0x0b0b1a, 0.62).fillRoundedRect(x - w / 2, y - 16, w, 32, 16).lineStyle(2, col, 0.9).strokeRoundedRect(x - w / 2, y - 16, w, 32, 16);
      return this.add.text(x, y, label, { fontFamily: FONT_BODY, fontSize: '15px', color: tc, fontStyle: '700' }).setOrigin(0.5).setDepth(3);
    };
    pill(sx, 512, 340, `★ ${s} / ${TOTAL_LEVELS * 3}    ·    Score ${save.data.totalScore.toLocaleString()}${save.data.visits.streak > 1 ? `    ·    🔥 ${save.data.visits.streak}` : ''}`, 0xfbbf24, '#fef3c7');
    // Login streak reward / teaser (D1 hook): a streak-only skin unlocks on day 2, 3 and 5.
    const vi = save.visitInfo, got = vi.newDay ? SKINS.findIndex((sk) => sk.streak === vi.streak) : -1, nxt = nextStreakSkin();
    if (got >= 0 || nxt) {
      const msg = got >= 0 ? `🎁 Day ${vi.streak} in a row! New skin unlocked: ${SKINS[got].name.toUpperCase()}` : `🎁 Play tomorrow too: ${nxt!.streak}-day streak unlocks the ${nxt!.name.toUpperCase()} skin`;
      const t = this.add.text(sx, 176, msg, { fontFamily: FONT_BODY, fontSize: '13px', color: '#fff7ed', fontStyle: '700', wordWrap: { width: 300 }, align: 'center' }).setOrigin(0.5).setDepth(5);
      { const b = t.getBounds(), pl = this.add.graphics().setDepth(4); pl.fillStyle(0x000000, 0.3).fillRoundedRect(b.x - 14, b.y - 6, b.width + 28, b.height + 16, 16).fillGradientStyle(0xf97316, 0xf97316, 0xc2410c, 0xc2410c, 0.95).fillRoundedRect(b.x - 14, b.y - 8, b.width + 28, b.height + 16, 16).lineStyle(2, 0xfed7aa, 0.9).strokeRoundedRect(b.x - 14, b.y - 8, b.width + 28, b.height + 16, 16); }
      if (got >= 0) { save.data.skin = got; save.save(); this.tweens.add({ targets: t, scale: 1.08, yoyo: true, repeat: 3, duration: 300 }); }
    }
    this.input.keyboard!.on('keydown-ENTER', () => this.go('Gameplay', { levelId: next }));
    this.input.keyboard!.on('keydown-SPACE', () => this.go('Gameplay', { levelId: next }));
  }
  /** Phones held upright: stacked logo, the flipping ball, then big thumb-sized buttons. */
  private createPortrait() {
    const VW = view.w, VH = view.h, cx = VW / 2;
    coverImage(this, bgKey(this, 1, false));
    const up = coverImage(this, bgKey(this, 1, true)).setAlpha(0);
    const shade = this.add.graphics(); shade.fillGradientStyle(0x0b0b2e, 0x0b0b2e, 0x2e1065, 0x2e1065, 0.25, 0.25, 0.55, 0.55).fillRect(0, 0, VW, VH);
    for (let i = 0; i < 3; i++) { const cl = this.add.image(Phaser.Math.Between(0, VW), VH * (0.2 + i * 0.18), 'cloud').setScale(1.3 + i * 0.3).setAlpha(0.12).setTint(0xc4b5fd); this.tweens.add({ targets: cl, x: cl.x + (i % 2 ? -120 : 120), duration: 24000 + i * 5000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
    for (let i = 0; i < 22; i++) { const st = this.add.image(Phaser.Math.Between(0, VW), Phaser.Math.Between(0, VH * 0.5), 'spark').setScale(Phaser.Math.FloatBetween(0.3, 0.8)).setAlpha(0.1); this.tweens.add({ targets: st, alpha: 0.9, duration: Phaser.Math.Between(900, 2200), delay: Phaser.Math.Between(0, 2000), yoyo: true, repeat: -1 }); }
    const ly = Math.round(VH * 0.1);
    const flip = this.add.text(cx, ly, 'UPSIDE', { fontFamily: FONT_HEAD, fontSize: '84px', color: '#fbbf24', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14);
    const rule = this.add.text(cx, ly + 84, 'DOWN RUN', { fontFamily: FONT_HEAD, fontSize: '76px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', 14);
    const gold = flip.context.createLinearGradient(0, 0, 0, flip.height); gold.addColorStop(0, '#fff7ad'); gold.addColorStop(0.5, '#fbbf24'); gold.addColorStop(1, '#f59e0b'); flip.setFill(gold);
    const wh = rule.context.createLinearGradient(0, 0, 0, rule.height); wh.addColorStop(0, '#ffffff'); wh.addColorStop(1, '#c4b5fd'); rule.setFill(wh);
    this.tweens.add({ targets: flip, scaleY: { from: 1, to: -1 }, duration: 500, ease: 'Back.easeInOut', yoyo: true, hold: 1800, repeatDelay: 1800, repeat: -1, onYoyo: () => this.tweens.add({ targets: up, alpha: 1, duration: 400 }), onRepeat: () => this.tweens.add({ targets: up, alpha: 0, duration: 400 }) });
    this.add.text(cx, ly + 150, 'You can\'t jump. Flip gravity!', { fontFamily: FONT_BODY, fontSize: '22px', color: '#f5f3ff', fontStyle: '600' }).setOrigin(0.5).setShadow(0, 2, 'rgba(0,0,0,.5)', 3);
    // flipping ball between two platforms
    const key = platformKey(this, 240, 26, 1, 'solid'), top = Math.round(VH * 0.33), bot = top + 150;
    this.add.image(cx, bot, key); this.add.image(cx, top, key);
    const ballGlow = this.add.image(cx, bot - 46, 'glow').setScale(2.2).setAlpha(0.45).setTint(0x67e8f9).setBlendMode(Phaser.BlendModes.ADD);
    const ball = this.add.image(cx, bot - 46, playerKey('idle', 1)).setScale(1.7);
    { const f = () => ballGlow.setPosition(ball.x, ball.y); this.events.on('update', f); this.events.once('shutdown', () => this.events.off('update', f)); }
    const loop = () => {
      this.tweens.add({ targets: ball, y: top + 46, duration: 650, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipUp'), onComplete: () => { ball.setFlipY(true); this.time.delayedCall(1000, () => this.tweens.add({ targets: ball, y: bot - 46, duration: 650, ease: 'Quad.easeIn', onStart: () => audio.sfx('flipDown'), onComplete: () => { ball.setFlipY(false); this.time.delayedCall(1000, loop); } })); } });
    };
    this.time.delayedCall(900, loop);
    // buttons
    const next = Math.min(TOTAL_LEVELS, save.data.unlockedLevel);
    const started = save.totalStars() > 0 || save.data.unlockedLevel > 1;
    let y = Math.round(VH * 0.6);
    const play = new Button(this, cx, y, started ? `PLAY · Level ${next}` : 'PLAY', () => this.go('Gameplay', { levelId: next }), { w: 440, h: 100, size: 44, color: 0x22c55e, radius: 26, solid: true });
    this.tweens.add({ targets: play, scale: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    y += 104; new Button(this, cx, y, 'LEVEL SELECT', () => this.go('LevelSelect'), { w: 440, h: 72, size: 28, color: 0x7c3aed });
    const done = !!save.data.daily.completed[LevelSystem.dateKey()];
    y += 88; new Button(this, cx, y, done ? 'DAILY CHALLENGE ✓' : 'DAILY CHALLENGE', () => this.go('Gameplay', { daily: true }), { w: 440, h: 72, size: 28, color: 0x3b82f6 });
    y += 88; new Button(this, cx - 112, y, 'SKINS', () => this.scene.launch('Skins', { from: 'Menu' }), { w: 212, h: 66, size: 24, color: 0xdb2777 });
    new Button(this, cx + 112, y, 'SETTINGS', () => this.scene.launch('Settings', { from: 'Menu' }), { w: 212, h: 66, size: 24, color: 0x475569 });
    // progress + streak
    const s = save.totalStars();
    const pill = (x: number, py: number, w: number, label: string, col: number, tc: string) => {
      const g = this.add.graphics().setDepth(3); g.fillStyle(0x0b0b1a, 0.7).fillRoundedRect(x - w / 2, py - 18, w, 36, 18).lineStyle(2, col, 0.9).strokeRoundedRect(x - w / 2, py - 18, w, 36, 18);
      return this.add.text(x, py, label, { fontFamily: FONT_BODY, fontSize: '17px', color: tc, fontStyle: '700' }).setOrigin(0.5).setDepth(3);
    };
    const vs = save.data.visits.streak;
    pill(cx, Math.min(VH - 36, y + 70), 420, `★ ${s} / ${TOTAL_LEVELS * 3}${vs > 1 ? `    ·    🔥 ${vs}-day streak` : ''}`, 0xfbbf24, '#fef3c7');
    const vi = save.visitInfo, got = vi.newDay ? SKINS.findIndex((sk) => sk.streak === vi.streak) : -1, nxt = nextStreakSkin();
    if (got >= 0 || nxt) {
      const msg = got >= 0 ? `🎁 Day ${vi.streak} in a row! New skin unlocked: ${SKINS[got].name.toUpperCase()}` : `🎁 Play tomorrow too: a ${nxt!.streak}-day streak unlocks the ${nxt!.name.toUpperCase()} skin`;
      const t = this.add.text(cx, top - 56, msg, { fontFamily: FONT_BODY, fontSize: '16px', color: '#fff7ed', fontStyle: '700', wordWrap: { width: 460 }, align: 'center' }).setOrigin(0.5).setDepth(5);
      { const b = t.getBounds(), pl = this.add.graphics().setDepth(4); pl.fillStyle(0x000000, 0.3).fillRoundedRect(b.x - 14, b.y - 6, b.width + 28, b.height + 16, 16).fillGradientStyle(0xf97316, 0xf97316, 0xc2410c, 0xc2410c, 0.95).fillRoundedRect(b.x - 14, b.y - 8, b.width + 28, b.height + 16, 16).lineStyle(2, 0xfed7aa, 0.9).strokeRoundedRect(b.x - 14, b.y - 8, b.width + 28, b.height + 16, 16); }
      if (got >= 0) { save.data.skin = got; save.save(); this.tweens.add({ targets: t, scale: 1.06, yoyo: true, repeat: 3, duration: 300 }); }
    }
  }
  private go(scene: string, data?: object) { audio.stopMusic(); this.cameras.main.fadeOut(180, 11, 11, 26); this.time.delayedCall(190, () => this.scene.start(scene, data)); }
}
