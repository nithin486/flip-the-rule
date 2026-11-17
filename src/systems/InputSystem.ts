import Phaser from 'phaser';

export interface InputFrame { left: boolean; right: boolean; flip: boolean }

/**
 * Keyboard + touch input. FLIP is edge-triggered (keydown without repeat / pointerdown) so holding the
 * key or finger cannot toggle gravity repeatedly. A programmatic override is used by the headless solver.
 */
export class InputSystem {
  touchLeft = new Set<number>(); touchRight = new Set<number>();
  private flipQueued = false; private restartQueued = false; private pauseQueued = false;
  override: InputFrame | null = null;
  private offs: Array<() => void> = [];

  private down = new Set<string>();
  constructor(private scene: Phaser.Scene) {
    // Native key handling (not Phaser's keyboard queue): Phaser drops events that were already default-prevented by another
    // listener and only sees keys once its frame is focused. Listening on window in the capture phase never misses a press.
    const FLIP = new Set(['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'ShiftLeft', 'ShiftRight', 'Enter', 'KeyZ', 'KeyX']);
    const GAME = new Set([...FLIP, 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyR', 'KeyP']);
    const codeOf = (e: KeyboardEvent) => (e.code && e.code !== 'Unidentified' ? e.code : e.key === ' ' ? 'Space' : e.key);
    const onDown = (e: KeyboardEvent) => {
      const c = codeOf(e);
      if (!GAME.has(c)) return;
      if (c === 'Space' || c.startsWith('Arrow') || c === 'Enter') e.preventDefault(); // no page scroll / no focused-button activation
      this.down.add(c);
      if (e.repeat) return;
      if (FLIP.has(c)) this.flipQueued = true;
      else if (c === 'KeyR') this.restartQueued = true;
      else if (c === 'KeyP') this.pauseQueued = true;
    };
    const onUp = (e: KeyboardEvent) => { this.down.delete(codeOf(e)); };
    const clearKeys = () => { this.down.clear(); };
    window.addEventListener('keydown', onDown, true);
    window.addEventListener('keyup', onUp, true);
    window.addEventListener('blur', clearKeys);
    this.offs.push(() => { window.removeEventListener('keydown', onDown, true); window.removeEventListener('keyup', onUp, true); window.removeEventListener('blur', clearKeys); });
    // pointer cancellation safety nets
    const clear = () => { this.touchLeft.clear(); this.touchRight.clear(); this.down.clear(); };
    scene.game.events.on(Phaser.Core.Events.BLUR, clear);
    scene.game.events.on(Phaser.Core.Events.HIDDEN, clear);
    this.offs.push(() => { scene.game.events.off(Phaser.Core.Events.BLUR, clear); scene.game.events.off(Phaser.Core.Events.HIDDEN, clear); });
    const up = (p: Phaser.Input.Pointer) => { this.touchLeft.delete(p.id); this.touchRight.delete(p.id); };
    scene.input.on('pointerup', up); scene.input.on('pointerupoutside', up);
    this.offs.push(() => { scene.input.off('pointerup', up); scene.input.off('pointerupoutside', up); });
  }
  queueFlip() { this.flipQueued = true; }
  queueRestart() { this.restartQueued = true; }
  queuePause() { this.pauseQueued = true; }
  /** Reads (and clears) edge-triggered actions; level-triggered axes are sampled. */
  poll(): { frame: InputFrame; restart: boolean; pause: boolean } {
    let frame: InputFrame;
    if (this.override) { frame = { ...this.override }; }
    else {
      frame = {
        left: this.down.has('KeyA') || this.down.has('ArrowLeft') || this.touchLeft.size > 0,
        right: this.down.has('KeyD') || this.down.has('ArrowRight') || this.touchRight.size > 0,
        flip: this.flipQueued,
      };
    }
    const r = { frame, restart: this.restartQueued, pause: this.pauseQueued };
    this.flipQueued = false; this.restartQueued = false; this.pauseQueued = false;
    return r;
  }
  destroy() { this.offs.forEach((f) => f()); this.offs = []; }
}
