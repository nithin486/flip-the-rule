import Phaser from 'phaser';

export interface InputFrame { left: boolean; right: boolean; flip: boolean }

/**
 * Keyboard + touch input. FLIP is edge-triggered (keydown without repeat / pointerdown) so holding the
 * key or finger cannot toggle gravity repeatedly. A programmatic override is used by the headless solver.
 */
export class InputSystem {
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  touchLeft = new Set<number>(); touchRight = new Set<number>();
  private flipQueued = false; private restartQueued = false; private pauseQueued = false;
  override: InputFrame | null = null;
  private offs: Array<() => void> = [];

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    const add = (n: string, code: number) => { this.keys[n] = kb.addKey(code, true, false); };
    const K = Phaser.Input.Keyboard.KeyCodes;
    add('A', K.A); add('D', K.D); add('LEFT', K.LEFT); add('RIGHT', K.RIGHT);
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') this.flipQueued = true;
      else if (e.code === 'KeyR') this.restartQueued = true;
      else if (e.code === 'KeyP') this.pauseQueued = true;
    };
    kb.on('keydown', onDown);
    this.offs.push(() => kb.off('keydown', onDown));
    // prevent page scroll on game keys
    kb.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
    // pointer cancellation safety nets
    const clear = () => { this.touchLeft.clear(); this.touchRight.clear(); };
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
      const k = this.keys;
      frame = {
        left: k.A.isDown || k.LEFT.isDown || this.touchLeft.size > 0,
        right: k.D.isDown || k.RIGHT.isDown || this.touchRight.size > 0,
        flip: this.flipQueued,
      };
    }
    const r = { frame, restart: this.restartQueued, pause: this.pauseQueued };
    this.flipQueued = false; this.restartQueued = false; this.pauseQueued = false;
    return r;
  }
  destroy() { this.offs.forEach((f) => f()); this.offs = []; const kb = this.scene.input.keyboard; if (kb) { kb.removeCapture('SPACE,UP,DOWN,LEFT,RIGHT'); Object.values(this.keys).forEach((k) => kb.removeKey(k, true)); } }
}
