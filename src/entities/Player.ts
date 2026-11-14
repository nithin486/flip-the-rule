import Phaser from 'phaser';
import { PHYS } from '../config/gameConfig';
import type { GravityDir } from '../types';
import { playerKey, type Expr } from '../ui/Textures';
import type { InputFrame } from '../systems/InputSystem';

const TEX = 44;

/** Physics-driven circular character. Gravity flips change acceleration only; position is never touched. */
export class Player extends Phaser.Physics.Arcade.Sprite {
  grav: GravityDir = 'down';
  flipCooldown = 0;           // seconds
  private expr: Expr = 'idle';
  private exprTimer = 0;
  private blinkTimer = 2;
  private wasGrounded = false;
  private look = 0;
  grounded = false;
  supportedNow = false;
  prevVy = 0;
  onLand?: (impact: number) => void;
  squash = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, grav: GravityDir) {
    super(scene, x, y, playerKey('idle', 0));
    scene.add.existing(this); scene.physics.add.existing(this);
    const b = this.body as Phaser.Physics.Arcade.Body;
    b.setCircle(PHYS.radius, TEX / 2 - PHYS.radius, TEX / 2 - PHYS.radius);
    b.setMaxVelocity(PHYS.maxSpeedX, PHYS.maxSpeedY);
    b.setBounce(0, 0); b.setCollideWorldBounds(true);
    b.pushable = true;
    // The squash/stretch is purely visual: stop Arcade from resizing the circle body with the sprite scale, so the real game
    // runs exactly the same physics as the headless solver that proves each level.
    (b as any).updateBounds = function (this: Phaser.Physics.Arcade.Body) {
      const sp = this.gameObject as Phaser.GameObjects.Sprite, t = (this as any).transform;
      t.x = sp.x; t.y = sp.y; t.rotation = sp.angle; t.scaleX = 1; t.scaleY = 1; t.displayOriginX = sp.displayOriginX; t.displayOriginY = sp.displayOriginY;
    };
    this.setDepth(10);
    this.setGravityDir(grav);
  }
  get b() { return this.body as Phaser.Physics.Arcade.Body; }

  setGravityDir(g: GravityDir) {
    this.grav = g;
    this.b.setGravityY(g === 'down' ? PHYS.gravity : -PHYS.gravity); // world gravity is 0; per-body only
    this.setFlipY(g === 'up');
  }
  /** Toggle only the acceleration direction. Velocity (incl. horizontal momentum) is preserved. */
  flip() { this.setGravityDir(this.grav === 'down' ? 'up' : 'down'); this.setExpr('flip', 0.28); }
  setExpr(e: Expr, dur = 0) { this.expr = e; this.exprTimer = dur; this.refreshTex(); }

  /** Per-step movement from input. */
  drive(f: InputFrame, dt: number, supported = false, slippery = false) {
    const b = this.b;
    // Resting contact: Arcade re-penetrates by a fraction of a pixel every few frames, which shows up as buzzing.
    // While geometrically supported we simply cancel gravity for the step (it is restored the instant support is lost or on flip).
    const gs = this.grav === 'down' ? 1 : -1, along = b.velocity.y * gs;
    if (supported && along >= 0 && along < 80) { b.setGravityY(0); b.setVelocityY(0); this.supportedNow = true; }
    else { b.setGravityY(gs * PHYS.gravity); this.supportedNow = false; }
    const dir = (f.right ? 1 : 0) - (f.left ? 1 : 0);
    const g = this.grounded || this.supportedNow;
    if (dir !== 0) {
      b.setAccelerationX(dir * (g ? PHYS.moveAccel * (slippery ? 0.3 : 1) : PHYS.airAccel));
      b.setDragX(0);
      // turning on the ground feels snappier with a touch of extra braking
      if (g && Math.sign(b.velocity.x) === -dir) b.setDragX((slippery ? 90 : PHYS.friction) * 0.6);
      this.look = dir;
    } else {
      b.setAccelerationX(0);
      b.setDragX(g ? (slippery ? 70 : PHYS.friction) : PHYS.airFriction);
    }
    this.flipCooldown = Math.max(0, this.flipCooldown - dt);
  }

  /** Called after the physics step. */
  post(dt: number, fx: boolean) {
    const b = this.b;
    const g = this.supportedNow || (this.grav === 'down' ? (b.blocked.down || b.touching.down) : (b.blocked.up || b.touching.up));
    this.grounded = g;
    if (g && !this.wasGrounded && Math.abs(this.prevVy) > 120) { this.onLand?.(Math.min(1, Math.abs(this.prevVy) / 600)); this.squash = Math.min(0.35, Math.abs(this.prevVy) / 1800); }
    this.wasGrounded = g; if (!this.supportedNow) this.prevVy = b.velocity.y;
    if (!fx) return;
    // visuals
    this.exprTimer > 0 && (this.exprTimer -= dt, this.exprTimer <= 0 && this.setExpr('idle'));
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0 && this.expr === 'idle') { this.setExpr('blink', 0.12); this.blinkTimer = 1.5 + Math.random() * 3; }
    this.squash *= 0.86;
    const stretch = Math.min(0.18, Math.abs(b.velocity.y) / 4200);
    this.setScale(1 + this.squash * 0.9 - stretch * 0.5, 1 - this.squash + stretch);
    const lk = Math.abs(b.velocity.x) > 20 ? Math.sign(b.velocity.x) : this.look;
    if (lk !== this.lastLook) { this.lastLook = lk; this.refreshTex(); }
  }
  private lastLook = 0;
  /** After a teleport/restore: avoid fake landing effects. */
  resync() { this.grounded = false; this.wasGrounded = true; this.prevVy = 0; this.flipCooldown = 0; this.squash = 0; }
  private refreshTex() { this.setTexture(playerKey(this.expr, this.lastLook)); }
}
