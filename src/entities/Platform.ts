import Phaser from 'phaser';
import type { PlatformDef, DoorDef } from '../types';
import { doorKey, platformKey } from '../ui/Textures';
import { pathAt } from './path';

export type FallState = 0 | 1 | 2; // intact, warning, gone

export class Platform {
  sprite: Phaser.Physics.Arcade.Image;
  state: FallState = 0; timer = 0;
  readonly kind: 'solid' | 'falling' | 'moving' | 'ice' | 'conveyor' | 'bounce' | 'phase'; phaseOn = true;
  readonly bx: number; readonly by: number;
  vx = 0; vy = 0;
  constructor(public scene: Phaser.Scene, public def: PlatformDef, world: number, public fx: boolean) {
    this.kind = def.kind ?? 'solid';
    this.bx = def.x + def.width / 2; this.by = def.y + def.height / 2;
    const key = platformKey(scene, def.width, def.height, world, this.kind, (def.speed ?? 1) < 0 ? -1 : 1);
    this.sprite = scene.physics.add.image(this.bx, this.by, key);
    this.sprite.setDepth(5);
    const b = this.sprite.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false); b.setImmovable(true); b.pushable = false;
    b.setSize(def.width, def.height);
  }
  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  get active() { return this.state !== 2 && this.phaseOn; }

  /** Place + set velocity for this step (kinematic path). */
  update(t: number, dt: number) {
    const b = this.body;
    if (this.kind === 'moving' && this.def.path) {
      const a = pathAt(this.bx, this.by, this.def.path, t), n = pathAt(this.bx, this.by, this.def.path, t + dt);
      if (this.first) { b.reset(a.x, a.y); this.first = false; }
      this.vx = (n.x - a.x) / dt; this.vy = (n.y - a.y) / dt;
      b.setVelocity(this.vx, this.vy);
    }
    if (this.kind === 'phase') {
      const per = this.def.period ?? 3, ph = ((t / per + (this.def.phase ?? 0)) % 1 + 1) % 1;
      this.phaseOn = ph < 0.6; b.enable = this.phaseOn;
      if (this.fx) this.sprite.setAlpha(this.phaseOn ? (ph > 0.5 ? 0.45 + 0.35 * Math.sin(t * 40) : 1) : 0.16);
    }
    if (this.kind === 'falling') {
      if (this.state === 1) {
        this.timer -= dt;
        if (this.fx) { this.sprite.setAngle(Math.sin(this.timer * 90) * 1.2); this.sprite.setTint(0xffe4a0); }
        if (this.timer <= 0) this.collapse();
      }
    }
  }
  private first = true;
  touch() { if (this.kind === 'falling' && this.state === 0) { this.state = 1; this.timer = 0.5; if (this.fx) this.scene.events.emit('fall-warn', this); } }
  collapse() {
    this.state = 2; this.body.enable = false;
    if (this.fx) { this.scene.events.emit('fall-gone', this); this.scene.tweens.add({ targets: this.sprite, y: this.sprite.y + 260, alpha: 0, angle: 8, duration: 700, ease: 'Quad.easeIn' }); }
  }
  resetState() {
    this.phaseOn = true; this.state = 0; this.timer = 0; this.body.enable = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setAlpha(1).setAngle(0).clearTint();
    this.sprite.setPosition(this.bx, this.by); this.body.reset(this.bx, this.by); this.first = true;
  }
  place(t: number) {
    if (this.kind === 'moving' && this.def.path) { const a = pathAt(this.bx, this.by, this.def.path, t); this.body.reset(a.x, a.y); this.first = false; }
  }
}

export class Door {
  sprite: Phaser.Physics.Arcade.Image; open = false;
  constructor(scene: Phaser.Scene, public def: DoorDef, color: number, private fx: boolean) {
    const key = doorKey(scene, def.width, def.height, color, !!def.bridge);
    this.sprite = scene.physics.add.image(def.x + def.width / 2, def.y + def.height / 2, key);
    this.sprite.setDepth(4);
    const b = this.sprite.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false); b.setImmovable(true); b.setSize(def.width, def.height);
    this.apply(false, true);
  }
  /** `on` = linked switch active. Doors vanish when on; bridges appear when on. */
  apply(on: boolean, instant = false) {
    const solid = this.def.bridge ? on : !on;
    this.open = !solid;
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = solid;
    if (instant || !this.fx) this.sprite.setAlpha(solid ? 1 : 0.12);
    else this.sprite.scene.tweens.add({ targets: this.sprite, alpha: solid ? 1 : 0.12, duration: 250 });
  }
}
