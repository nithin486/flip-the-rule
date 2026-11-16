import Phaser from 'phaser';
import { COLORS, TOTAL_LEVELS, FONT_BODY, FONT_HEAD, H, PHYS, W, WORLDS, worldOfLevel } from '../config/gameConfig';
import { Collectible } from '../entities/Collectible';
import { Saw, Spike, type Rect } from '../entities/Hazard';
import { Door, Platform } from '../entities/Platform';
import { Player } from '../entities/Player';
import { ExitPortal, TelePortal } from '../entities/Portal';
import { Refill } from '../entities/Refill';
import { Checkpoint, GravityZone, Switch } from '../entities/Props';
import { platform } from '../platform';
import { audio } from '../systems/AudioSystem';
import { InputSystem, type InputFrame } from '../systems/InputSystem';
import { LevelSystem, validateLevel } from '../systems/LevelSystem';
import { save } from '../systems/SaveSystem';
import { computeResult } from '../systems/ScoreSystem';
import { bgKey, playerKey } from '../ui/Textures';
import { HUD } from '../ui/HUD';
import { TouchControls } from '../ui/TouchControls';
import type { GravityDir, LevelData, LevelResult } from '../types';

export interface GameplayInit { levelId?: number; daily?: boolean; level?: LevelData; headless?: boolean }
export interface Snap {
  px: number; py: number; vx: number; vy: number; grav: GravityDir; cd: number; t: number; elapsed: number; started: boolean;
  flips: number; collected: boolean; rf: number[]; sw: string[]; falls: Array<[number, number]>; teleCd: number; zin: boolean[]; cp: number; gr: boolean;
}
type Status = 'play' | 'dead' | 'won' | 'paused';
const PAIR_COLORS = [0xfb923c, 0x38bdf8, 0xf472b6, 0xa3e635];
const circleRect = (cx: number, cy: number, r: number, k: Rect) => {
  const x = Math.max(k.x, Math.min(cx, k.x + k.w)), y = Math.max(k.y, Math.min(cy, k.y + k.h));
  return (cx - x) ** 2 + (cy - y) ** 2 <= r * r;
};

export class GameplayScene extends Phaser.Scene {
  level!: LevelData; daily = false; fx = true; ready = false;
  player!: Player; inp!: InputSystem; hud?: HUD; touch?: TouchControls;
  platforms: Platform[] = []; doors: Door[] = []; spikes: Spike[] = []; saws: Saw[] = [];
  checkpoints: Checkpoint[] = []; switches: Switch[] = []; zones: GravityZone[] = []; teles: TelePortal[] = [];
  star?: Collectible; exit!: ExitPortal; refills: Refill[] = []; refillsTaken = 0;
  status: Status = 'play';
  t = 0; elapsed = 0; started = false; flips = 0; acc = 0; collected = false; teleCd = 0;
  cpIndex = -1; startSnap!: Snap; cpSnap: Snap | null = null; zin: boolean[] = [];
  rider: Platform | null = null; deaths = 0;
  /** When true the scene's own update loop is idle and an external driver (solver/tests) calls stepSim. */
  manual = false; hintShown = false;
  private bgDown?: Phaser.GameObjects.Image; private bgUp?: Phaser.GameObjects.Image;
  private trail?: Phaser.GameObjects.Particles.ParticleEmitter; private burst?: Phaser.GameObjects.Particles.ParticleEmitter; private dust?: Phaser.GameObjects.Particles.ParticleEmitter;
  private hintTxt?: Phaser.GameObjects.Text; private ghost?: Phaser.GameObjects.GameObject[];
  private shutdownFns: Array<() => void> = [];

  constructor() { super('Gameplay'); }

  init(d: GameplayInit) {
    this.daily = !!d.daily;
    this.level = d.level ?? (this.daily ? LevelSystem.daily() : LevelSystem.get(d.levelId ?? 1));
    this.fx = !d.headless;
    this.ready = false;
  }

  create() {
    const problems = validateLevel(this.level);
    if (problems.length) console.warn('[level validation]', problems);
    const L = this.level, world = L.world;
    this.platforms = []; this.doors = []; this.spikes = []; this.saws = []; this.checkpoints = []; this.switches = []; this.zones = []; this.teles = []; this.refills = []; this.refillsTaken = 0;
    this.hintTxt = undefined; this.ghost = undefined; this.bgDown = this.bgUp = this.halo = undefined; this.trail = this.burst = this.dust = undefined; this.hud = undefined; this.touch = undefined; this.shutdownFns = [];
    this.status = 'play'; this.manual = false; this.hintShown = false; this.t = 0; this.elapsed = 0; this.started = false; this.flips = 0; this.acc = 0; this.collected = false; this.teleCd = 0; this.cpIndex = -1; this.cpSnap = null; this.rider = null; this.deaths = 0;

    // physics: stepped manually at a fixed 60 Hz for determinism (see stepWorld)
    const w = this.physics.world; w.pause(); w.setBounds(0, -600, W, H + 1200); w.setBoundsCollision(true, true, false, false);

    if (this.fx) this.buildBackground(world);
    if (this.fx) this.buildFx();

    // ---- level objects ----
    L.zones?.forEach((z) => this.zones.push(new GravityZone(this, z, this.fx)));
    L.hazards.forEach((h) => { if (h.type === 'spike') this.spikes.push(new Spike(this, h)); else this.saws.push(new Saw(this, h, this.fx)); });
    L.platforms.forEach((p) => this.platforms.push(new Platform(this, p, world, this.fx)));
    const swIds = (L.switches ?? []).map((s) => s.id);
    const colOf = (id: string) => [0xf43f5e, 0x22d3ee, 0xfacc15, 0xa3e635][swIds.indexOf(id) % 4];
    (L.switches ?? []).forEach((s) => this.switches.push(new Switch(this, s, colOf(s.id))));
    (L.doors ?? []).forEach((d) => this.doors.push(new Door(this, d, colOf(d.switch), this.fx)));
    (L.checkpoints ?? []).forEach((c) => this.checkpoints.push(new Checkpoint(this, c)));
    const pids = (L.portals ?? []).map((p) => p.id);
    (L.portals ?? []).forEach((p) => this.teles.push(new TelePortal(this, p, PAIR_COLORS[Math.floor(pids.indexOf(p.id) / 2) % 4], this.fx)));
    (L.refills ?? []).forEach((r) => this.refills.push(new Refill(this, r.x, r.y, this.fx)));
    if (L.collectible) this.star = new Collectible(this, L.collectible.x, L.collectible.y, this.fx);
    this.exit = new ExitPortal(this, L.exit.x, L.exit.y, !!L.exit.switch, this.fx);
    this.zin = this.zones.map(() => false);

    this.player = new Player(this, L.playerStart.x, L.playerStart.y, L.gravity);
    if (this.fx) { this.halo = this.add.image(L.playerStart.x, L.playerStart.y, 'glow').setScale(1.5).setAlpha(0.4).setBlendMode(Phaser.BlendModes.ADD).setDepth(8).setTint(L.gravity === 'up' ? 0xf0abfc : 0x67e8f9); }
    this.player.onLand = (imp) => { if (this.fx) { audio.sfx('land', imp); this.landFx(imp); } };
    const solids = [...this.platforms.map((p) => p.sprite), ...this.doors.map((d) => d.sprite)];
    solids.forEach((s) => s.setData('plat', this.platforms.find((p) => p.sprite === s) ?? null));
    this.physics.add.collider(this.player, solids, (_p, o) => this.onTouch(o as Phaser.Physics.Arcade.Image));

    this.inp = new InputSystem(this);
    if (this.fx) {
      this.touch = new TouchControls(this, this.inp);
      this.hud = new HUD(this, this.daily ? 'DAILY CHALLENGE' : `LEVEL ${L.id}`, `${WORLDS[Math.min(WORLDS.length, Math.max(1, world)) - 1].name.toUpperCase()} · ${L.name.toUpperCase()}`, !!L.collectible, {
        pause: () => this.pauseGame(), restart: () => this.restartLevel(), hint: () => { if (this.hintShown) void this.hintGhost(); else { this.hintShown = true; this.showHint(); } },
      }, WORLDS[Math.min(WORLDS.length, Math.max(1, world)) - 1].accent);
      this.hud.setFlips(0, this.flipCap, L.flipTarget);
      this.hud.setGravity(L.gravity);
      if (L.flipLimit) {
        const bn = this.add.container(W / 2, 118).setScrollFactor(0).setDepth(60).setAlpha(0);
        bn.add([this.add.rectangle(0, 0, 300, 44, 0x0b0b1a, 0.78).setStrokeStyle(2, 0x67e8f9, 0.9), this.add.text(0, -7, `FLIP LIMIT  ${L.flipLimit}`, { fontFamily: FONT_HEAD, fontSize: '20px', color: '#a5f3fc', fontStyle: '800' }).setOrigin(0.5), this.add.text(0, 13, `par ${L.flipTarget} · out of flips = restart`, { fontFamily: FONT_BODY, fontSize: '12px', color: '#e2e8f0' }).setOrigin(0.5)]);
        this.tweens.add({ targets: bn, alpha: 1, y: 112, duration: 300, hold: 1800, yoyo: true, onComplete: () => bn.destroy() });
      }
      this.showHint(true);
      const th = WORLDS[Math.min(WORLDS.length, Math.max(1, world)) - 1];
      audio.play('game', th.root);
      platform.gameplayStart();
      const blur = () => { if (this.status === 'play') this.pauseGame(); };
      this.game.events.on(Phaser.Core.Events.HIDDEN, blur); this.game.events.on(Phaser.Core.Events.BLUR, blur);
      this.shutdownFns.push(() => { this.game.events.off(Phaser.Core.Events.HIDDEN, blur); this.game.events.off(Phaser.Core.Events.BLUR, blur); });
      this.cameras.main.fadeIn(250, 11, 11, 26);
      this.events.on('fall-gone', () => audio.sfx('collapse'));
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    this.player.b.updateFromGameObject(); this.player.b.updateCenter();
    this.stepPlatformsOnly();
    this.startSnap = this.snapshot();
    this.ready = true;
  }

  private cleanup() {
    this.shutdownFns.forEach((f) => f()); this.shutdownFns = [];
    this.inp?.destroy(); this.tweens.killAll(); this.time.removeAllEvents();
    this.events.off('fall-gone'); this.events.off('fall-warn');
    if (this.fx) platform.gameplayStop();
    this.ready = false;
  }

  // ---------------------------------------------------------------- visuals
  private halo?: Phaser.GameObjects.Image;
  private buildBackground(world: number) {
    this.bgDown = this.add.image(W / 2, H / 2, bgKey(this, world, false, this.level.id)).setDepth(-20);
    this.bgUp = this.add.image(W / 2, H / 2, bgKey(this, world, true, this.level.id)).setDepth(-19).setAlpha(this.level.gravity === 'up' ? 1 : 0);
    const th = WORLDS[Math.min(WORLDS.length, Math.max(1, world)) - 1];
    this.add.image(W / 2, H / 2, 'vignette').setScale(2).setDepth(45).setScrollFactor(0).setAlpha(0.8);
    if (!save.data.settings.reduceMotion) this.add.particles(0, 0, 'glow', { x: { min: 0, max: W }, y: { min: 60, max: H }, lifespan: { min: 4000, max: 8000 }, speedY: { min: -14, max: -4 }, speedX: { min: -6, max: 6 }, scale: { start: 0.12, end: 0.02 }, alpha: { start: 0, end: 0.45, ease: 'Sine.easeInOut' }, frequency: 220, tint: th.accent, blendMode: 'ADD' }).setDepth(-17);
  }
  private buildFx() {
    this.trail = this.add.particles(0, 0, 'glow', { lifespan: 380, scale: { start: 0.42, end: 0 }, alpha: { start: 0.55, end: 0 }, frequency: 28, tint: 0x67e8f9, blendMode: 'ADD', follow: undefined }).setDepth(9);
    this.burst = this.add.particles(0, 0, 'spark', { lifespan: { min: 400, max: 900 }, speed: { min: 80, max: 360 }, scale: { start: 1.1, end: 0 }, alpha: { start: 1, end: 0 }, gravityY: 300, emitting: false, blendMode: 'ADD' }).setDepth(12);
    this.dust = this.add.particles(0, 0, 'dot', { lifespan: 380, speed: { min: 20, max: 90 }, scale: { start: 0.6, end: 0 }, alpha: { start: 0.6, end: 0 }, emitting: false }).setDepth(9);
  }
  private landFx(imp: number) {
    if (save.data.settings.reduceMotion) return;
    const p = this.player, dy = this.player.grav === 'down' ? 16 : -16;
    this.dust?.setParticleTint(0xffffff).explode(Math.round(4 + imp * 6), p.x, p.y + dy);
  }
  private flipFx() {
    const p = this.player, up = p.grav === 'up', col = up ? 0xf0abfc : 0x67e8f9;
    audio.sfx(up ? 'flipUp' : 'flipDown');
    this.hud?.setGravity(p.grav);
    this.trail?.setParticleTint(col); this.halo?.setTint(col);
    if (this.bgUp) this.tweens.add({ targets: this.bgUp, alpha: up ? 1 : 0, duration: 380 });
    if (save.data.settings.reduceMotion) return;
    const r = this.add.image(p.x, p.y, 'ring').setTint(col).setScale(0.3).setDepth(11).setAlpha(0.9);
    this.tweens.add({ targets: r, scale: 2.6, alpha: 0, duration: 420, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
    this.burst?.setParticleTint(col).explode(10, p.x, p.y);
    this.cameras.main.flash(120, up ? 240 : 103, up ? 171 : 232, up ? 252 : 249, true);
  }

  // ---------------------------------------------------------------- simulation
  /** Fixed-step physics driven manually (deterministic; also used by the headless solver). */
  private stepWorld(dt: number) {
    const w = this.physics.world, bodies = w.bodies.entries;
    for (let i = 0; i < bodies.length; i++) { const b = bodies[i]; if (b.enable) b.preUpdate(true, dt); }
    (w.tree as any).clear(); (w.tree as any).load(bodies);
    const cols = w.colliders.update();
    for (let i = 0; i < cols.length; i++) if (cols[i].active) cols[i].update();
    (w as any).stepsLastFrame = 1; w.postUpdate();
  }
  /** Geometric ground test (face-on contact within 1.2px along gravity). */
  get flipCap(): number { return this.level.flipLimit ? this.level.flipLimit + this.refillsTaken : Infinity; }
  private supportPlat(): Platform | null | 'door' {
    const P = this.player, c = P.b.center, r = P.b.halfWidth, down = P.grav === 'down';
    const test = (b: Phaser.Physics.Arcade.Body) => {
      if (!b.enable || c.x < b.x || c.x > b.x + b.width) return false;
      return down ? Math.abs(b.y - (c.y + r)) <= 1.2 : Math.abs((b.y + b.height) - (c.y - r)) <= 1.2;
    };
    for (const p of this.platforms) if (p.active && test(p.body)) return p;
    for (const d of this.doors) if (test(d.sprite.body as Phaser.Physics.Arcade.Body)) return 'door';
    return null;
  }
  private onTouch(o: Phaser.Physics.Arcade.Image) {
    const plat = o.getData('plat') as Platform | null; if (!plat) return;
    const b = this.player.b, onFace = this.player.grav === 'down' ? b.touching.down : b.touching.up;
    if (onFace) { this.rider = plat; plat.touch(); }
  }
  private stepPlatformsOnly() { for (const p of this.platforms) p.update(this.t, PHYS.step); for (const s of this.saws) s.update(this.t); }

  /** One fixed simulation step. Returns the resulting status. */
  stepSim(f: InputFrame): Status {
    if (this.status !== 'play') return this.status;
    const dt = PHYS.step, P = this.player;
    if (!this.started && (f.left || f.right || f.flip)) this.started = true;
    if (this.started) this.elapsed += dt;
    this.t += dt;
    for (const p of this.platforms) p.update(this.t, dt);
    for (const s of this.saws) s.update(this.t);
    // gravity flip: acceleration only
    for (const sp of this.spikes) sp.update(this.t, this.fx);
    const pcx = P.b.center.x, pcy = P.b.center.y;
    const inZone = (k: string) => this.zones.some((z) => z.kind === k && pcx > z.rect.x && pcx < z.rect.x + z.rect.w && pcy > z.rect.y && pcy < z.rect.y + z.rect.h);
    const lockedZone = inZone('lock'), reversed = inZone('reverse');
    const windZ = this.zones.find((z) => z.kind === 'wind' && pcx > z.rect.x && pcx < z.rect.x + z.rect.w && pcy > z.rect.y && pcy < z.rect.y + z.rect.h);
    if (f.flip && lockedZone) { if (this.fx && P.flipCooldown <= 0) { audio.sfx('out'); this.hud?.flash?.(); } f = { ...f, flip: false }; }
    if (reversed) f = { ...f, left: f.right, right: f.left };
    if (f.flip && P.flipCooldown <= 0 && this.flips >= this.flipCap) { this.outOfFlips(); return this.status; }
    if (f.flip && P.flipCooldown <= 0) { this.flips++; P.flip(); P.flipCooldown = PHYS.flipCooldownMs / 1000; if (this.fx) { this.flipFx(); this.hud?.setFlips(this.flips, this.flipCap, this.level.flipTarget); } }
    const sup = this.supportPlat();
    if (sup && sup !== 'door') { this.rider = sup; sup.touch(); }
    const kind = sup && sup !== 'door' ? sup.kind : null;
    P.drive(f, dt, !!sup && kind !== 'bounce', kind === 'ice');
    if (kind === 'bounce') { P.b.setVelocityY(P.grav === 'down' ? -640 : 640); P.squash = 0.3; if (this.fx) audio.sfx('boing'); }
    if (this.rider && this.rider.kind === 'moving' && this.rider.active) { P.x += this.rider.vx * dt; P.y += this.rider.vy * dt; }
    if (kind === 'conveyor') P.x += ((sup as Platform).def.speed ?? 90) * dt;
    if (windZ) P.b.velocity.x += (windZ.def.wind ?? 0) * dt;
    this.rider = null;
    this.stepWorld(dt);
    P.post(dt, this.fx);
    this.teleCd = Math.max(0, this.teleCd - dt);
    this.checkInteractions();
    if (this.fx) { this.trail?.setPosition(P.x, P.y); this.hud?.setTime(this.elapsed); }
    return this.status;
  }
  /** Advance `n` frames with a constant input (flip only on the first). Used by the solver. */
  simFrames(f: InputFrame, n: number): Status {
    for (let i = 0; i < n && this.status === 'play'; i++) this.stepSim(i === 0 ? f : { ...f, flip: false });
    return this.status;
  }

  private checkInteractions() {
    const P = this.player, c = P.b.center, cx = c.x, cy = c.y, r = PHYS.radius;
    // hidden hazards reveal themselves as the player closes in (and hide again on every retry/respawn)
    if (this.fx) { for (const s of this.spikes) if (!s.revealed && (cx - (s.rect.x + s.rect.w / 2)) ** 2 + (cy - (s.rect.y + s.rect.h / 2)) ** 2 < 150 ** 2 + (s.rect.w / 2) ** 2) { s.reveal(this); audio.sfx('click'); }
      for (const s of this.saws) if (!s.revealed && (cx - s.x) ** 2 + (cy - s.y) ** 2 < 170 ** 2) { s.reveal(this); audio.sfx('click'); } }
    // hazards
    for (const s of this.spikes) if (s.active && circleRect(cx, cy, r - 2, s.hit)) return this.die();
    for (const s of this.saws) if ((cx - s.x) ** 2 + (cy - s.y) ** 2 <= (s.r * 0.82 + r - 3) ** 2) return this.die();
    if (cy < -24 || cy > H + 24) return this.die();
    // collectible
    if (this.star && !this.collected && (cx - this.star.x) ** 2 + (cy - this.star.y) ** 2 <= (r + 15) ** 2) this.collect();
    // flip crystals
    for (const rf of this.refills) if (!rf.got && (cx - rf.x) ** 2 + (cy - rf.y) ** 2 <= (r + 16) ** 2) { rf.setCollected(true); this.refillsTaken++; if (this.fx) { audio.sfx('crystal'); this.burst?.setParticleTint(0x22d3ee).explode(18, rf.x, rf.y); this.hud?.setFlips(this.flips, this.flipCap, this.level.flipTarget); } }
    // switches
    for (const s of this.switches) if (!s.on && circleRect(cx, cy, r, s.rect)) this.activateSwitch(s);
    // checkpoints
    this.checkpoints.forEach((k, i) => { if (!k.active && Math.abs(cx - k.def.x) < r + 12 && Math.abs(cy - k.def.y) < 34) this.activateCheckpoint(i); });
    // gravity zones (entering forces direction)
    this.zones.forEach((z, i) => {
      if (z.kind !== 'gravity') return;
      const inside = cx > z.rect.x && cx < z.rect.x + z.rect.w && cy > z.rect.y && cy < z.rect.y + z.rect.h;
      if (inside && !this.zin[i] && P.grav !== z.def.gravity) { P.setGravityDir(z.def.gravity!); if (this.fx) { this.flipFx(); } }
      this.zin[i] = inside;
    });
    // teleports
    if (this.teleCd <= 0) for (const tp of this.teles) {
      if ((cx - tp.def.x) ** 2 + (cy - tp.def.y) ** 2 <= (r + 8) ** 2) {
        const dest = this.teles.find((o) => o.def.id === tp.def.pair)!; this.teleport(tp, dest); break;
      }
    }
    // exit
    if (!this.exit.locked && (cx - this.exit.x) ** 2 + (cy - this.exit.y) ** 2 <= (r + 14) ** 2) this.win();
  }

  private teleport(from: TelePortal, to: TelePortal) {
    const P = this.player, b = P.b, vx = b.velocity.x, vy = b.velocity.y;
    b.reset(to.def.x, to.def.y); b.updateFromGameObject(); b.updateCenter(); b.setVelocity(vx, vy); P.resync(); this.teleCd = 0.8;
    if (this.fx) {
      audio.sfx('portal');
      for (const at of [from.def, to.def]) { const r = this.add.image(at.x, at.y, 'ring').setTint(0xffffff).setScale(0.3).setDepth(11); this.tweens.add({ targets: r, scale: 1.8, alpha: 0, duration: 400, onComplete: () => r.destroy() }); }
      this.burst?.setParticleTint(0xfb923c).explode(14, to.def.x, to.def.y);
    }
  }
  private collect() {
    this.collected = true; this.star!.setCollected(true);
    if (!this.fx) return;
    audio.sfx('star'); this.hud?.setStar(true);
    this.burst?.setParticleTint(0xfbbf24).explode(26, this.star!.x, this.star!.y);
    const s = this.add.image(this.star!.x, this.star!.y, 'star').setDepth(20);
    this.tweens.add({ targets: s, x: W - 40, y: 23, scale: 0.7, duration: 500, ease: 'Cubic.easeIn', onComplete: () => s.destroy() });
  }
  private applySwitches() {
    const on = new Set(this.switches.filter((s) => s.on).map((s) => s.def.id));
    this.doors.forEach((d) => d.apply(on.has(d.def.switch)));
    if (this.level.exit.switch) { const was = this.exit.locked; this.exit.setLocked(!on.has(this.level.exit.switch)); if (was && !this.exit.locked && this.fx) this.burst?.setParticleTint(0x06b6d4).explode(20, this.exit.x, this.exit.y); }
  }
  private activateSwitch(s: Switch) {
    s.setOn(true); this.applySwitches();
    if (this.fx) { audio.sfx('switch'); this.cameras.main.shake(100, 0.002); }
  }
  private activateCheckpoint(i: number) {
    this.checkpoints.forEach((k, j) => k.setActive(j === i)); this.cpIndex = i;
    const k = this.checkpoints[i].def;
    this.cpSnap = { ...this.snapshot(), px: k.x, py: k.y - 2, vx: 0, vy: 0, cp: i, gr: false };
    if (this.fx) { audio.sfx('checkpoint'); this.burst?.setParticleTint(0x22c55e).explode(14, k.x, k.y); }
  }

  // ---------------------------------------------------------------- life cycle
  snapshot(): Snap {
    const b = this.player.b;
    return {
      px: b.center.x, py: b.center.y, vx: b.velocity.x, vy: b.velocity.y, grav: this.player.grav, cd: this.player.flipCooldown,
      t: this.t, elapsed: this.elapsed, started: this.started, flips: this.flips, collected: this.collected, rf: this.refills.map((r, i) => (r.got ? i : -1)).filter((i) => i >= 0),
      sw: this.switches.filter((s) => s.on).map((s) => s.def.id), falls: this.platforms.map((p) => [p.state, p.timer] as [number, number]),
      teleCd: this.teleCd, zin: this.zin.slice(), cp: this.cpIndex, gr: this.player.grounded,
    };
  }
  restore(s: Snap, opts: { keepClock?: boolean } = {}) {
    const P = this.player, b = P.b;
    this.t = s.t; if (!opts.keepClock) { this.elapsed = s.elapsed; this.started = s.started; }
    this.flips = s.flips; this.collected = s.collected; this.star?.setCollected(s.collected);
    this.refills.forEach((r, i) => r.setCollected((s.rf ?? []).includes(i))); this.refillsTaken = (s.rf ?? []).length;
    for (const sp of this.spikes) sp.update(s.t, this.fx);
    if (this.fx) { for (const sp of this.spikes) sp.conceal(this); for (const sw of this.saws) sw.conceal(this); }
    this.teleCd = s.teleCd; this.zin = s.zin.slice();
    this.switches.forEach((sw) => sw.setOn(s.sw.includes(sw.def.id)));
    this.platforms.forEach((p, i) => {
      p.resetState(); const [st, tm] = s.falls[i] ?? [0, 0];
      if (st === 2) { p.state = 2; p.body.enable = false; p.sprite.setAlpha(0); } else if (st === 1) { p.state = 1; p.timer = tm; }
      p.place(s.t);
    });
    this.applySwitches();
    this.doors.forEach((d) => d.apply(s.sw.includes(d.def.switch), true));
    this.rider = null; P.setGravityDir(s.grav); b.reset(s.px, s.py); b.updateFromGameObject(); b.updateCenter(); b.setVelocity(s.vx, s.vy); b.setAcceleration(0, 0); P.resync(); P.grounded = !!s.gr; P.flipCooldown = s.cd;
    P.setExpr('idle'); P.setAlpha(1).setVisible(true).setScale(1);
    for (const sw of this.saws) sw.update(this.t);
    this.status = 'play';
    if (this.fx) { this.hud?.setGravity(s.grav); this.hud?.setFlips(this.flips, this.flipCap, this.level.flipTarget); this.hud?.setStar(this.collected); if (this.bgUp) this.bgUp.setAlpha(s.grav === 'up' ? 1 : 0); this.trail?.setParticleTint(s.grav === 'up' ? 0xf0abfc : 0x67e8f9); }
  }
  restartLevel() {
    if (this.status === 'won') return;
    this.cpSnap = null; this.cpIndex = -1; this.checkpoints.forEach((k) => k.setActive(false));
    this.restore(this.startSnap); this.elapsed = 0; this.started = false; this.deaths = 0;
    if (this.fx) { audio.sfx('click'); this.cameras.main.fadeIn(180, 11, 11, 26); this.hud?.setTime(0); }
  }
  outOfFlips() {
    if (this.status !== 'play') return;
    if (this.fx) {
      audio.sfx('out');
      const t = this.add.text(W / 2, 250, 'OUT OF FLIPS!', { fontFamily: FONT_HEAD, fontSize: '64px', color: '#fb7185', fontStyle: '800' }).setOrigin(0.5).setDepth(70).setStroke('#450a0a', 10).setScale(0.6);
      this.tweens.add({ targets: t, scale: 1, duration: 200, ease: 'Back.easeOut' });
      this.tweens.add({ targets: t, alpha: 0, y: 220, delay: 650, duration: 350, onComplete: () => t.destroy() });
      this.hud?.flash();
    }
    this.die();
  }
  die() {
    if (this.status !== 'play') return;
    this.status = 'dead'; this.deaths++;
    if (!this.fx) return;
    const P = this.player; audio.sfx('death'); P.setExpr('dead'); P.b.setVelocity(0, 0); P.b.setAcceleration(0, 0);
    if (!save.data.settings.reduceMotion) { this.cameras.main.shake(220, 0.012); this.burst?.setParticleTint(0xef4444).explode(34, P.x, P.y); }
    this.tweens.add({ targets: P, alpha: 0, scale: 1.6, duration: 260 });
    this.time.delayedCall(520, () => { if (this.status === 'dead') { this.restore(this.cpSnap ?? this.startSnap, { keepClock: true }); if (!this.cpSnap) { this.flips = 0; this.hud?.setFlips(0, this.flipCap, this.level.flipTarget); } this.cameras.main.fadeIn(160, 11, 11, 26); } });
  }
  win() {
    if (this.status !== 'play') return;
    this.status = 'won';
    const L = this.level, P = this.player; P.b.setVelocity(0, 0); P.b.setAcceleration(0, 0); P.b.setGravityY(0);
    const res = computeResult({ levelId: this.daily ? 0 : L.id, daily: this.daily, flips: this.flips, flipTarget: L.flipTarget, time: this.elapsed, parTime: L.parTime ?? 30 + L.flipTarget * 6, collected: this.collected });
    (this as any).lastResult = res;
    if (!this.fx) return;
    audio.sfx('win'); P.setExpr('happy');
    this.tweens.add({ targets: P, x: this.exit.x, y: this.exit.y, scale: 0.2, angle: 360, duration: 500, ease: 'Cubic.easeIn' });
    this.burst?.setParticleTint(0xfbbf24).explode(50, this.exit.x, this.exit.y);
    this.hud?.pauseBtn.setEnabled(false);
    const result = this.commit(res);
    platform.gameplayStop();
    this.time.delayedCall(950, () => { this.scene.launch('LevelComplete', { result, level: L, daily: this.daily }); this.scene.bringToTop('LevelComplete'); });
  }
  private commit(res: Omit<LevelResult, 'newBest'>): LevelResult {
    const d = save.data, k = String(this.level.id); let newBest = false;
    if (this.daily) {
      const key = LevelSystem.dateKey();
      if (!d.daily.completed[key]) {
        d.daily.completed[key] = res.score;
        const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
        d.daily.streak = d.daily.lastCompleted === LevelSystem.dateKey(y) ? d.daily.streak + 1 : 1;
        d.daily.bestStreak = Math.max(d.daily.bestStreak, d.daily.streak); d.daily.lastCompleted = key; newBest = true;
      } else if (res.score > d.daily.completed[key]) { d.daily.completed[key] = res.score; newBest = true; }
    } else {
      // replay never erases a better result
      if (res.stars > (d.stars[k] ?? 0)) d.stars[k] = res.stars;
      if (res.score > (d.bestScores[k] ?? 0)) { d.bestScores[k] = res.score; newBest = true; }
      if (!d.bestTimes[k] || res.time < d.bestTimes[k]) d.bestTimes[k] = res.time;
      if (!d.bestFlips[k] || res.flips < d.bestFlips[k]) d.bestFlips[k] = res.flips;
      d.unlockedLevel = Math.max(d.unlockedLevel, Math.min(TOTAL_LEVELS, this.level.id + 1));
      d.totalScore = Object.values(d.bestScores).reduce((a, b) => a + b, 0);
    }
    save.save();
    return { ...res, newBest };
  }

  pauseGame() {
    if (this.status !== 'play' || !this.fx) return;
    this.status = 'paused'; platform.gameplayStop();
    this.scene.pause(); this.scene.launch('Pause', { level: this.level, daily: this.daily });
  }
  resumeGame() { this.status = 'play'; platform.gameplayStart(); }

  // ---------------------------------------------------------------- hints
  private tokens(s: string) { const touch = this.touch?.visible; return s.replace('{flip}', touch ? 'FLIP' : 'SPACE').replace('{move}', touch ? 'the arrows' : 'A / D or ←/→'); }
  /** Hint button: text hint first; then (after the platform's rewarded ad, if any) a ghost replays a verified solution. */
  async hintGhost() {
    if (this.daily || this.status !== 'play' || this.ghost) { this.showHint(); return; }
    const sol = LevelSystem.solution(this.level.id);
    if (!sol) { this.showHint(); return; }
    audio.setSuspended(false);
    const ok = await platform.requestRewardedAd(() => audio.setSuspended(true)).catch(() => false); audio.setSuspended(false);
    if (!this.sys.isActive()) return;
    // If the portal has no ad to show (blocked / no fill / embedded elsewhere) the hint is still given: a dead button is worse than a free hint.
    if (!ok) this.showHint();
    audio.sfx('hint');
    const g = this.add.graphics().setDepth(30); g.fillStyle(0xffffff, 0.35);
    sol.forEach((p, i) => { if (i % 2 === 0) g.fillCircle(p[0], p[1], 3); });
    const ball = this.add.image(sol[0][0], sol[0][1], playerKey('idle', 1)).setAlpha(0.55).setDepth(30).setTint(0xa5f3fc);
    const o = { i: 0 };
    const tw = this.tweens.add({ targets: o, i: sol.length - 1, duration: sol.length * 50, repeat: 1, onUpdate: () => { const p = sol[Math.round(o.i)]; ball.setPosition(p[0], p[1]); },
      onComplete: () => { g.destroy(); ball.destroy(); this.ghost = undefined; } });
    this.ghost = [g, ball];
    this.time.delayedCall(sol.length * 100 + 300, () => { tw.stop(); g.destroy(); ball.destroy(); this.ghost = undefined; });
  }
  showHint(auto = false) {
    const txt = this.level.hint ? this.tokens(this.level.hint) : '';
    if (!this.hintTxt) {
      this.hintTxt = this.add.text(W / 2, 74, '', { fontFamily: FONT_BODY, fontSize: '17px', color: '#fff', fontStyle: '600', backgroundColor: 'rgba(11,11,26,0.72)', padding: { x: 16, y: 8 }, align: 'center' }).setOrigin(0.5, 0).setDepth(45);
    }
    const par = this.level.flipTarget, tip = `Par is ${par} flip${par === 1 ? '' : 's'} · you have ${this.level.flipLimit ?? par}.${this.daily ? '' : '  Tap ? again to watch a ghost show the way.'}`;
    if (!txt) { if (!auto) this.hintTxt.setText(tip).setAlpha(1); else this.hintTxt.setAlpha(0); }
    else this.hintTxt.setText(auto || this.daily ? txt : `${txt}\n${tip}`).setAlpha(1);
    this.tweens.killTweensOf(this.hintTxt);
    if (txt || !auto) this.tweens.add({ targets: this.hintTxt, alpha: 0, delay: auto ? 7000 : 3500, duration: 600 });
  }

  update(_t: number, delta: number) {
    if (this.halo && this.player) this.halo.setPosition(this.player.x, this.player.y);
    if (!this.ready || this.manual) return;
    const { frame, restart, pause } = this.inp.poll();
    if (pause) this.pauseGame();
    if (this.status === 'paused') return;
    if (restart) this.restartLevel();
    if (this.status !== 'play') { if (this.status === 'dead') this.player.post(delta / 1000, true); return; }
    this.acc += Math.min(delta, 100) / 1000;
    let flip = frame.flip;
    while (this.acc >= PHYS.step) {
      this.acc -= PHYS.step;
      this.stepSim({ left: frame.left, right: frame.right, flip });
      flip = false; if (this.status !== 'play') break;
    }
  }
}
