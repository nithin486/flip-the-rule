import Phaser from 'phaser';
import { FONT_HEAD } from '../src/config/gameConfig';
import { SKINS, bgKey, drawPlayer, platformKey } from '../src/ui/Textures';

/**
 * Store cover renderer (tools only, not part of the game build): draws the cover at the current game size
 * (1920x1080, 800x1200, 800x800) from the game's own procedural art. Text = the title only, per CrazyGames cover rules.
 */
export class CoverScene extends Phaser.Scene {
  constructor() { super('Cover'); }
  create() {
    const VW = this.scale.width, VH = this.scale.height, k = Math.min(VW / 960, VH / 540) * (VW < VH ? 1.35 : 1), cx = VW / 2;
    const bg = this.add.image(cx, VH / 2, bgKey(this, 1, false)); bg.setScale(Math.max(VW / bg.width, VH / bg.height));
    const up = this.add.image(cx, VH / 2, bgKey(this, 4, true)); up.setScale(Math.max(VW / up.width, VH / up.height)).setAlpha(0.55).setBlendMode(Phaser.BlendModes.SCREEN);
    const shade = this.add.graphics(); shade.fillGradientStyle(0x0b0b2e, 0x0b0b2e, 0x2e1065, 0x2e1065, 0.35).fillRect(0, 0, VW, VH);
    for (let i = 0; i < 70; i++) this.add.image(Phaser.Math.Between(0, VW), Phaser.Math.Between(0, VH), 'spark').setScale(Phaser.Math.FloatBetween(0.4, 1.4) * k).setAlpha(Phaser.Math.FloatBetween(0.3, 0.9));
    const portrait = VH > VW * 1.1, square = !portrait && VW < VH * 1.2;
    // ceiling + floor platforms, the ball mid-flip with a glowing arc trail
    const pw = Math.round((portrait ? 680 : square ? 640 : 760) * k / (portrait ? 1.35 : 1)), ph = Math.round(30 * k);
    const ceilY = portrait ? VH * 0.47 : square ? VH * 0.43 : VH * 0.36, floorY = portrait ? VH * 0.86 : square ? VH * 0.87 : VH * 0.88;
    const plx = portrait || square ? cx : VW * 0.62;
    const key = platformKey(this, Math.round(pw / k), 26, 1, 'solid');
    this.add.image(plx - pw * 0.18, floorY, key).setScale(k);
    this.add.image(plx + pw * 0.22, ceilY, key).setScale(k);
    // spikes on the floor and a portal on the ceiling
    for (let i = 0; i < 4; i++) this.add.image(plx + pw * 0.12 + i * 22 * k, floorY - 20 * k, 'spike').setScale(k * 1.2);
    const ex = plx + pw * 0.56, ey = ceilY + 46 * k;
    this.add.image(ex, ey, 'exit_b').setScale(1.5 * k).setAlpha(0.9); this.add.image(ex, ey, 'exit_a').setScale(1.25 * k);
    const bx = plx - pw * 0.05, by = (ceilY + floorY) / 2 + 10 * k;
    const g = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 26; i++) { const t = i / 25; const x = bx - (1 - t) * 210 * k, y = floorY - 40 * k - (floorY - 40 * k - by) * Math.pow(t, 1.6); g.fillStyle(0x67e8f9, 0.08 + 0.32 * t).fillCircle(x, y, (6 + 16 * t) * k); }
    this.add.image(bx, by, 'glow').setScale(4.4 * k).setTint(0xf0abfc).setAlpha(0.75).setBlendMode(Phaser.BlendModes.ADD);
    // crisp hi-res ball: redraw the same vector art at 8x instead of upscaling the 44px game texture
    if (!this.textures.exists('ball_hi')) { const cv = document.createElement('canvas'); cv.width = cv.height = 352; const c = cv.getContext('2d')!; c.scale(8, 8); drawPlayer(c, 'flip', 1, SKINS[0]); this.textures.addCanvas('ball_hi', cv); }
    this.add.image(bx, by, 'ball_hi').setScale(3.4 * k / 8).setAngle(-12);
    const ring = this.add.image(bx, by, 'ring').setScale(3.2 * k).setTint(0xf0abfc).setAlpha(0.5);
    void ring;
    this.add.image(plx + pw * 0.05, ceilY + 110 * k, 'star').setScale(1.8 * k);
    // title: "UPSIDE" literally upside down
    const tsz = Math.round((portrait ? 128 : square ? 118 : 150) * (portrait ? VW / 800 : square ? VW / 800 : VW / 1920)) ;
    const tx = portrait || square ? cx : VW * 0.27, ty = portrait ? VH * 0.11 : square ? VH * 0.12 : VH * 0.3;
    const a = this.add.text(tx, ty, 'UPSIDE', { fontFamily: FONT_HEAD, fontSize: `${tsz}px`, color: '#fbbf24', fontStyle: '800' }).setOrigin(0.5).setStroke('#2e1065', tsz / 5.5).setScale(1, -1).setShadow(0, 8, 'rgba(0,0,0,.45)', 6, true, true);
    const b = this.add.text(tx, ty + tsz * (portrait || square ? 0.98 : 1.0), portrait || square ? 'DOWN RUN' : 'DOWN\nRUN', { fontFamily: FONT_HEAD, fontSize: `${tsz}px`, color: '#ffffff', fontStyle: '800', align: 'center', lineSpacing: -tsz * 0.25 }).setOrigin(0.5, 0.18).setStroke('#2e1065', tsz / 5.5).setShadow(0, 8, 'rgba(0,0,0,.45)', 6, true, true);
    const gold = a.context.createLinearGradient(0, 0, 0, a.height); gold.addColorStop(0, '#f59e0b'); gold.addColorStop(0.5, '#fbbf24'); gold.addColorStop(1, '#fff7ad'); a.setFill(gold);
    const wh = b.context.createLinearGradient(0, 0, 0, b.height); wh.addColorStop(0, '#ffffff'); wh.addColorStop(1, '#c4b5fd'); b.setFill(wh);
    this.add.image(tx, ty + tsz * 0.5, 'glow').setScale(tsz / 9, tsz / 22).setTint(0xa78bfa).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD).setDepth(-1);
    (window as any).__coverDone = true;
  }
}
