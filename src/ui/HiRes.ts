import Phaser from 'phaser';
import { H, W } from '../config/gameConfig';

/**
 * Sharp rendering at any frame size.
 * The game is laid out in a fixed logical space (960x540 landscape, 540xN portrait). Phaser draws that space into a canvas of
 * the same pixel size, which the browser then stretches: on a 1920x1080 CrazyGames fullscreen or a phone with a 3x screen
 * everything was soft. Here the canvas gets RES times more pixels and every camera zooms by RES, so the layout code is
 * unchanged (it still works in logical units) while vector shapes, text and procedural textures are drawn at full detail.
 */
export const hires = { res: 1 };

/** Pixels the canvas is really shown at, per logical unit (screen size x devicePixelRatio), capped for phone GPUs. */
export function pickRes(logicalW: number, logicalH: number): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const fit = Math.min(window.innerWidth / logicalW, window.innerHeight / logicalH) * dpr;
  const mobile = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
  const cap = mobile ? 1.5 : 2; // fill-rate budget: 1.5x already removes most of the blur on 3x phone screens
  // quarter steps keep texture sizes integral-friendly and avoid needless re-layouts on tiny resizes
  return Phaser.Math.Clamp(Math.ceil(fit * 4) / 4, 1, cap);
}

let patched = false;
/** Install once, before the game is created. */
export function installHiRes() {
  if (patched) return; patched = true;
  const Cam = Phaser.Cameras.Scene2D.Camera.prototype as any, Base = Phaser.Cameras.Scene2D.BaseCamera.prototype as any;
  const Mgr = Phaser.Cameras.Scene2D.CameraManager.prototype as any;
  // zoom and viewport are given in logical units by the game code
  const setZoom = Base.setZoom;
  Base.setZoom = Cam.setZoom = function (this: any, x = 1, y?: number) { return setZoom.call(this, x * hires.res, (y ?? x) * hires.res); };
  const setViewport = Base.setViewport;
  Base.setViewport = Cam.setViewport = function (this: any, x: number, y: number, w: number, h?: number) { const r = hires.res; return setViewport.call(this, x * r, y * r, w * r, (h ?? w) * r); };
  // new cameras (the scene's main one, or extra ones like the portrait UI camera) look at logical 0..w, 0..h
  const add = Mgr.add;
  Mgr.add = function (this: any, x?: number, y?: number, w?: number, h?: number, makeMain?: boolean, name?: string) {
    const r = hires.res, explicit = w !== undefined;
    const cam = explicit ? add.call(this, (x ?? 0) * r, (y ?? 0) * r, w! * r, (h ?? w!) * r, makeMain, name) : add.call(this, x, y, w, h, makeMain, name);
    const lw = explicit ? w! : this.scene.sys.scale.width / r, lh = explicit ? (h ?? w!) : this.scene.sys.scale.height / r;
    cam.setZoom(1); cam.centerOn(lw / 2, lh / 2);
    return cam;
  };
  // the scale manager resizes full-screen cameras on a resize: re-aim them at the logical centre
  const onResize = Mgr.onResize;
  Mgr.onResize = function (this: any, gameSize: any, ...rest: any[]) {
    onResize.call(this, gameSize, ...rest);
    const r = hires.res;
    for (const cam of this.cameras) if (cam.x === 0 && cam.y === 0 && Math.abs(cam.width - gameSize.width) < 1) { cam.setZoom(1); cam.centerOn(gameSize.width / r / 2, gameSize.height / r / 2); }
  };
  // text is rasterised at the real pixel density
  const Text = Phaser.GameObjects.Text.prototype as any, updateText = Text.updateText;
  Text.updateText = function (this: any) { if (this.style && this.style.resolution !== hires.res) this.style.resolution = hires.res; return updateText.call(this); };
}

/** Logical game size -> canvas size. */
export const canvasSize = (w: number, h: number) => ({ w: Math.round(w * hires.res), h: Math.round(h * hires.res) });
void W; void H;
