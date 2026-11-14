import Phaser from 'phaser';
import { FONT_BODY, FONT_HEAD } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';

export interface BtnOpts { w?: number; h?: number; color?: number; textColor?: string; font?: 'head' | 'body'; size?: number; radius?: number; sfx?: boolean; depth?: number; solid?: boolean }

export class Button extends Phaser.GameObjects.Container {
  bg: Phaser.GameObjects.Graphics; txt: Phaser.GameObjects.Text; w: number; h: number; color: number; r: number;
  private enabled = true; private solid = false;
  constructor(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, o: BtnOpts = {}) {
    super(scene, x, y);
    this.solid = !!o.solid; this.w = o.w ?? 220; this.h = o.h ?? 56; this.color = o.color ?? 0x7c3aed; this.r = o.radius ?? 16;
    this.bg = scene.add.graphics();
    this.txt = scene.add.text(0, -1, label, { fontFamily: o.font === 'body' ? FONT_BODY : FONT_HEAD, fontSize: `${o.size ?? 26}px`, color: o.textColor ?? '#ffffff', fontStyle: '800' }).setOrigin(0.5);
    this.txt.setShadow(0, 2, 'rgba(0,0,0,0.35)', 0, false, true);
    this.add([this.bg, this.txt]); this.draw(false);
    this.setSize(this.w, this.h).setInteractive({ useHandCursor: true });
    this.on('pointerover', () => { if (this.enabled) { this.draw(true); scene.tweens.add({ targets: this, scale: 1.05, duration: 90 }); } });
    this.on('pointerout', () => { this.draw(false); scene.tweens.add({ targets: this, scale: 1, duration: 90 }); });
    this.on('pointerdown', () => { if (this.enabled) this.setScale(0.95); });
    this.on('pointerup', () => { if (!this.enabled) return; this.setScale(1.05); if (o.sfx !== false) audio.sfx('click'); onClick(); });
    scene.add.existing(this); if (o.depth !== undefined) this.setDepth(o.depth);
  }
  draw(hover: boolean) {
    const g = this.bg, w = this.w, h = this.h, c = this.color, r = this.r;
    g.clear();
    const C = Phaser.Display.Color.IntegerToColor(c);
    if (!this.solid || !this.enabled) {
      // neon glass: dark translucent body, bright coloured edge, soft glow
      const edge = this.enabled ? C.clone().lighten(hover ? 38 : 24).color : 0x64748b;
      if (this.enabled) { g.fillStyle(c, hover ? 0.34 : 0.18).fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, r + 7); g.fillStyle(c, hover ? 0.22 : 0.1).fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, r + 3); }
      const top = this.enabled ? C.clone().darken(hover ? 48 : 62).color : 0x1e293b, bot = this.enabled ? C.clone().darken(hover ? 66 : 78).color : 0x0f172a;
      g.fillGradientStyle(top, top, bot, bot, 0.95).fillRoundedRect(-w / 2, -h / 2, w, h, r);
      g.fillStyle(edge, hover ? 0.28 : 0.16).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.34, { tl: r - 3, tr: r - 3, bl: 4, br: 4 });
      g.lineStyle(3, edge, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      g.lineStyle(1, 0xffffff, hover ? 0.55 : 0.28).strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, Math.max(4, r - 4));
      return;
    }
    const dark = C.clone().darken(42).color, mid = C.clone().darken(8).color, light = C.clone().lighten(hover ? 34 : 20).color;
    g.fillStyle(c, hover ? 0.5 : 0.32).fillRoundedRect(-w / 2 - 9, -h / 2 - 7, w + 18, h + 20, r + 9);
    g.fillStyle(0x000000, 0.4).fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
    g.fillStyle(dark, 1).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, r);
    g.fillGradientStyle(light, light, mid, mid, 1).fillRoundedRect(-w / 2, -h / 2, w, h - 4, r);
    g.fillStyle(0xffffff, hover ? 0.36 : 0.26).fillRoundedRect(-w / 2 + 7, -h / 2 + 4, w - 14, (h - 4) * 0.36, { tl: r - 5, tr: r - 5, bl: 6, br: 6 });
    g.lineStyle(2.5, 0xffffff, hover ? 0.85 : 0.55).strokeRoundedRect(-w / 2, -h / 2, w, h - 4, r);
  }
  setLabel(t: string) { this.txt.setText(t); return this; }
  setEnabled(v: boolean) { this.enabled = v; this.draw(false); this.setAlpha(v ? 1 : 0.7); if (this.input) this.input.cursor = v ? 'pointer' : 'default'; return this; }
}

export function title(scene: Phaser.Scene, x: number, y: number, text: string, size = 56, color = '#ffffff') {
  const t = scene.add.text(x, y, text, { fontFamily: FONT_HEAD, fontSize: `${size}px`, color, fontStyle: '800' }).setOrigin(0.5);
  t.setStroke('#2e1065', Math.max(4, size / 6)).setShadow(0, 4, 'rgba(124,58,237,0.65)', Math.max(6, size / 4), true, true);
  if (color === '#ffffff') { const gr = t.context.createLinearGradient(0, 0, 0, t.height); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#e9d5ff'); gr.addColorStop(1, '#c4b5fd'); t.setFill(gr); }
  return t;
}
export const body = (scene: Phaser.Scene, x: number, y: number, text: string, size = 18, color = '#e2e8f0') =>
  scene.add.text(x, y, text, { fontFamily: FONT_BODY, fontSize: `${size}px`, color, fontStyle: '500', align: 'center' }).setOrigin(0.5);

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, alpha = 0.92) {
  const g = scene.add.graphics();
  g.fillStyle(0x7c3aed, 0.18).fillRoundedRect(x - w / 2 - 10, y - h / 2 - 10, w + 20, h + 26, 36);
  g.fillStyle(0x000000, 0.45).fillRoundedRect(x - w / 2, y - h / 2 + 10, w, h, 28);
  g.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x0b0b1a, 0x0b0b1a, alpha).fillRoundedRect(x - w / 2, y - h / 2, w, h, 28);
  g.fillStyle(0xffffff, 0.06).fillRoundedRect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h * 0.22, { tl: 22, tr: 22, bl: 10, br: 10 });
  g.lineStyle(3, 0xa78bfa, 1).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 28);
  g.lineStyle(1, 0x67e8f9, 0.35).strokeRoundedRect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, 23);
  return g;
}

/** Toggle switch used in settings. */
export function toggle(scene: Phaser.Scene, x: number, y: number, label: string, get: () => boolean, set: (v: boolean) => void) {
  const c = scene.add.container(x, y);
  const t = scene.add.text(-170, 0, label, { fontFamily: FONT_BODY, fontSize: '20px', color: '#fff', fontStyle: '600' }).setOrigin(0, 0.5);
  const g = scene.add.graphics(); const knob = scene.add.circle(0, 0, 13, 0xffffff);
  const hit = scene.add.rectangle(0, 0, 400, 44, 0x000000, 0.001).setInteractive({ useHandCursor: true });
  const draw = () => { const on = get(); g.clear().fillStyle(on ? 0x22c55e : 0x475569, 1).fillRoundedRect(110, -16, 62, 32, 16); knob.setPosition(on ? 156 : 126, 0); };
  hit.on('pointerup', () => { set(!get()); audio.sfx('click'); draw(); });
  c.add([hit, t, g, knob]); draw();
  return c;
}
