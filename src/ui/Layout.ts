import Phaser from 'phaser';
import { H, W } from '../config/gameConfig';
import { platform } from '../platform';
import { hires, pickRes } from './HiRes';

/**
 * Orientation support. Landscape: the classic 960x540 game. Portrait (phones held upright): the game canvas becomes
 * 540 wide and as tall as the screen's aspect needs; gameplay zooms in and follows the ball, menus reflow, overlays scale to fit.
 * Most mobile players hold the phone upright, so a landscape-only game loses many of them at the rotate prompt.
 */
export const PW = 540;
export const view = { w: W, h: H, portrait: false };

function isMobile(): boolean {
  const d = platform.device();
  if (d) return d !== 'desktop';
  // Only when the portal SDK cannot tell us (local / other hosts): coarse primary pointer = phone or tablet.
  try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
}
export function wantPortrait(): boolean { return isMobile() && window.innerHeight > window.innerWidth * 1.05; }
function portraitHeight(): number { return Phaser.Math.Clamp(Math.round(PW * window.innerHeight / Math.max(1, window.innerWidth)), 780, 1240); }

/** Applies the orientation to the game size. Returns true when the orientation (or portrait height) changed. */
export function applyOrientation(game: Phaser.Game): boolean {
  const p = wantPortrait(), w = p ? PW : W, h = p ? portraitHeight() : H, res = pickRes(w, h);
  if (p === view.portrait && w === view.w && Math.abs(h - view.h) < 24 && res === hires.res && game.scale.width === Math.round(w * res)) return false;
  view.portrait = p; view.w = w; view.h = h; hires.res = res;
  game.scale.setGameSize(Math.round(w * res), Math.round(h * res)); game.scale.refresh();
  return true;
}

/** Overlay scenes are laid out for 960x540 around a centred panel: in portrait, zoom the camera so that panel fits the narrow screen. */
export function fitOverlay(scene: Phaser.Scene, contentW: number, contentH: number) {
  const cam = scene.cameras.main;
  if (!view.portrait) { cam.setZoom(1); cam.centerOn(W / 2, H / 2); return; }
  const z = Math.min(view.w / (contentW + 24), view.h / (contentH + 40), 1.25);
  cam.setZoom(z); cam.centerOn(W / 2, H / 2);
  // stretch the full-screen dimmer so it covers the taller portrait screen
  for (const o of scene.children.list) {
    const g = o as any;
    if (g.type === 'Rectangle' && g.width === W && g.height === H) { g.setSize(4000, 4000); g.setPosition(W / 2, H / 2); g.setOrigin(0.5); }
    else if (g.type === 'Image' && Math.abs(g.displayWidth - W) < 2 && Math.abs(g.displayHeight - H) < 2) g.setScale(Math.max(1, view.h / z / H));
  }
}

/** Full-screen background image that covers the current view (portrait or landscape). */
export function coverImage(scene: Phaser.Scene, key: string) {
  const img = scene.add.image(view.w / 2, view.h / 2, key);
  const s = Math.max(view.w / img.width, view.h / img.height); img.setScale(s);
  return img;
}
