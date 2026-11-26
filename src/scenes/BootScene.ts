import Phaser from 'phaser';
import { platform } from '../platform';
import { audio } from '../systems/AudioSystem';
import { save } from '../systems/SaveSystem';

/** Boot: wait (briefly) for web fonts, init the platform SDK, then preload. */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    platform.loadingStart();
    const unlock = () => audio.unlock();
    // iOS: an interrupted AudioContext may only be resumed inside touchend/click, so listen to those too (every time, not once).
    for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) window.addEventListener(ev, unlock, { passive: true });
    const fonts = Promise.race([
      Promise.all([document.fonts.load("800 24px 'Baloo 2'"), document.fonts.load("600 16px Poppins")]).catch(() => null),
      new Promise((r) => setTimeout(r, 700)),
    ]);
    // Never let a slow font/SDK request hold the game hostage: each wait is capped, total boot <= ~3s even on a dead connection.
    Promise.all([fonts, Promise.race([platform.init(), new Promise((r) => setTimeout(r, 3000))])]).finally(() => { save.mergeRemote(platform.readRemote()); save.onSave = (j) => platform.writeRemote(j); save.registerVisit(); platform.progress(save.progressPct()); platform.onMuteChange((m) => audio.setPlatformMuted(m)); this.scene.start('Preload'); });
  }
}
