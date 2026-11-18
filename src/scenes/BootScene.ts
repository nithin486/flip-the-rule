import Phaser from 'phaser';
import { platform } from '../platform';
import { audio } from '../systems/AudioSystem';

/** Boot: wait (briefly) for web fonts, init the platform SDK, then preload. */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    platform.loadingStart();
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true }); window.addEventListener('keydown', unlock);
    const fonts = Promise.race([
      Promise.all([document.fonts.load("800 24px 'Baloo 2'"), document.fonts.load("600 16px Poppins")]).catch(() => null),
      new Promise((r) => setTimeout(r, 700)),
    ]);
    // Never let a slow font/SDK request hold the game hostage: each wait is capped, total boot <= ~3s even on a dead connection.
    Promise.all([fonts, Promise.race([platform.init(), new Promise((r) => setTimeout(r, 3000))])]).finally(() => this.scene.start('Preload'));
  }
}
