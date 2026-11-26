import Phaser from 'phaser';
import { FONT_HEAD } from '../src/config/gameConfig';
import { SKINS, drawPlayer, platformKey } from '../src/ui/Textures';

/**
 * High-CTR store cover (tools only). Built for a small thumbnail on a busy portal page:
 * one huge readable character with a strong expression, a split warm/cool sky that shows the gravity flip at a glance,
 * a clear threat (saw + spikes), big title with a thick outline, few details. Text = title only (CrazyGames cover rule).
 * ?v=2 cyan/pink split, ?v=3 warm orange/blue variant (pick by measured CTR).
 */
export class CoverScene2 extends Phaser.Scene {
  constructor() { super('Cover2'); }
  create() {
    const VW = this.scale.width, VH = this.scale.height, v = new URLSearchParams(location.search).get('v') === '3' ? 3 : 2;
    const portrait = VH > VW * 1.1, square = !portrait && VW < VH * 1.2, k = Math.min(VW / 960, VH / 540) * (portrait ? 1.45 : square ? 1.25 : 1);
    const [topA, topB, botA, botB, seam] = v === 3 ? [0xff7a18, 0xff2d6f, 0x0ea5e9, 0x1e3a8a, 0xfff1a8] : [0xff3ea5, 0x7c1fa8, 0x22d3ee, 0x1d4ed8, 0xffffff];
    // split sky: upper half = "gravity up" colours, lower half = "gravity down" colours, glowing seam between
    const g = this.add.graphics();
    g.fillGradientStyle(topB, topB, topA, topA, 1).fillRect(0, 0, VW, VH / 2);
    g.fillGradientStyle(botA, botA, botB, botB, 1).fillRect(0, VH / 2, VW, VH / 2);
    const rays = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = Math.max(VW, VH); rays.fillStyle(0xffffff, 0.06).fillTriangle(VW / 2, VH / 2, VW / 2 + Math.cos(a) * r, VH / 2 + Math.sin(a) * r, VW / 2 + Math.cos(a + 0.13) * r, VH / 2 + Math.sin(a + 0.13) * r); }
    this.add.image(VW / 2, VH / 2, 'glow').setDisplaySize(VW * 1.4, 90 * k).setTint(seam).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 40; i++) this.add.image(Phaser.Math.Between(0, VW), Phaser.Math.Between(0, VH), 'spark').setScale(Phaser.Math.FloatBetween(0.4, 1.2) * k).setAlpha(Phaser.Math.FloatBetween(0.4, 0.9));
    // ceiling + floor slabs framing the action
    const pw = Math.round((portrait ? 760 : square ? 760 : 980) / (portrait ? 1.45 : square ? 1.25 : 1)), key = platformKey(this, pw, 30, v === 3 ? 7 : 4, 'solid');
    const floorY = VH - 70 * k, ceilY = (portrait ? VH * 0.3 : square ? VH * 0.38 : 90 * k);
    this.add.image(VW / 2 - (portrait || square ? 0 : 120 * k), floorY, key).setScale(k);
    this.add.image(VW / 2 + (portrait || square ? 0 : 160 * k), ceilY, key).setScale(k);
    for (let i = 0; i < 6; i++) this.add.image(VW / 2 + (60 + i * 24) * k, floorY - 22 * k, 'spike').setScale(k * 1.25);
    // danger: a big saw on the lower right
    const saw = this.add.image(VW * (portrait ? 0.78 : square ? 0.8 : 0.83), VH * (portrait ? 0.68 : square ? 0.74 : 0.66), 'saw').setScale(1.9 * k).setAngle(18);
    void saw;
    // the hero: huge, mid-flip, surprised face, motion arc from the floor
    const bx = portrait || square ? VW * 0.42 : VW * 0.6, by = portrait ? VH * 0.56 : square ? VH * 0.62 : VH * 0.5;
    const arc = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 30; i++) { const t = i / 29, x = bx - (1 - t) * 260 * k, y = floorY - 40 * k - (floorY - 40 * k - by) * Math.pow(t, 1.5); arc.fillStyle(v === 3 ? 0xfff1a8 : 0xffffff, 0.05 + 0.35 * t).fillCircle(x, y, (8 + 26 * t) * k); }
    this.add.image(bx, by, 'glow').setScale(7 * k).setTint(v === 3 ? 0xffd166 : 0xf0abfc).setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD);
    const tex = `ball_cover_${v}`;
    if (!this.textures.exists(tex)) { const cv = document.createElement('canvas'); cv.width = cv.height = 440; const c = cv.getContext('2d')!; c.scale(10, 10); drawPlayer(c, 'flip', 1, SKINS[v === 3 ? 1 : 0]); this.textures.addCanvas(tex, cv); }
    this.add.image(bx, by, tex).setScale(5.2 * k / 10).setAngle(-14);
    // big up-arrow hint of the flip
    const ar = this.add.graphics(); const ax = bx + 150 * k, ay = by - 30 * k;
    ar.fillStyle(0x000000, 0.35).fillTriangle(ax - 34 * k, ay + 6 * k, ax + 34 * k, ay + 6 * k, ax, ay - 52 * k).fillRect(ax - 14 * k, ay + 4 * k, 28 * k, 56 * k);
    ar.fillStyle(0xffffff, 1).fillTriangle(ax - 30 * k, ay, ax + 30 * k, ay, ax, ay - 50 * k).fillRect(ax - 11 * k, ay - 2 * k, 22 * k, 54 * k);
    this.add.image(bx - 150 * k, by - 90 * k, 'star').setScale(2.2 * k).setAngle(-12);
    // title
    const tsz = Math.round((portrait ? 112 : square ? 104 : 128) * (portrait || square ? VW / 800 : VW / 1920));
    const tx = portrait || square ? VW / 2 : VW * 0.23, ty = portrait ? VH * 0.09 : square ? VH * 0.1 : VH * 0.3;
    const st = { fontFamily: FONT_HEAD, fontSize: `${tsz}px`, fontStyle: '800', align: 'center' } as const;
    const a = this.add.text(tx, ty, 'UPSIDE', { ...st, color: '#ffd23f' }).setOrigin(0.5).setStroke('#1a0533', tsz / 4.2).setScale(1, -1).setShadow(0, 10, 'rgba(0,0,0,.55)', 0, true, true);
    const b = this.add.text(tx, ty + tsz * 0.95, portrait || square ? 'DOWN RUN' : 'DOWN\nRUN', { ...st, color: '#ffffff', lineSpacing: -tsz * 0.22 }).setOrigin(0.5, 0.16).setStroke('#1a0533', tsz / 4.2).setShadow(0, 10, 'rgba(0,0,0,.55)', 0, true, true);
    void a; void b;
    (window as any).__coverDone = true;
  }
}
