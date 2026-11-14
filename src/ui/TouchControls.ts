import Phaser from 'phaser';
import { save } from '../systems/SaveSystem';
import type { InputSystem } from '../systems/InputSystem';

/**
 * On-screen controls as real DOM buttons fixed to the screen corners (outside the canvas wherever the
 * phone is wider than 16:9), so they never cover the play field. Multi-touch safe via pointer events.
 */
export class TouchControls {
  private root: HTMLDivElement;
  private shown = false;
  private sawTouch = false;
  constructor(scene: Phaser.Scene, input: InputSystem) {
    document.getElementById('touch-ui')?.remove();
    if (!document.getElementById('touch-ui-css')) {
      const st = document.createElement('style'); st.id = 'touch-ui-css';
      st.textContent = `
#touch-ui{position:fixed;inset:0;z-index:5;pointer-events:none;display:none;--s:60px}
#touch-ui .tb{position:absolute;bottom:max(10px,env(safe-area-inset-bottom,0px));pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
#touch-ui .tb::before{content:"";position:absolute;inset:-14px}
#touch-ui #tb-pad{left:max(12px,env(safe-area-inset-left,0px));display:flex;gap:calc(var(--s)*.12);height:calc(var(--s)*1.3)}
#touch-ui .ar{width:calc(var(--s)*.98);height:100%;border-radius:calc(var(--s)*.42);display:flex;align-items:center;justify-content:center;color:#fff;font:800 calc(var(--s)*.78)/1 'Baloo 2','Trebuchet MS',sans-serif;
 background:linear-gradient(160deg,rgba(255,255,255,.26),rgba(59,130,246,.36) 50%,rgba(30,41,120,.5));border:2.5px solid rgba(165,243,252,.75);
 box-shadow:0 0 16px rgba(103,232,249,.4),inset 0 0 14px rgba(255,255,255,.14);opacity:.78;transition:transform .05s,opacity .05s;text-shadow:0 0 10px rgba(103,232,249,.9)}
#touch-ui .ar.on{opacity:1;transform:scale(.94);box-shadow:0 0 26px rgba(103,232,249,.95),inset 0 0 18px rgba(255,255,255,.35)}
#touch-ui #tb-f{right:max(14px,env(safe-area-inset-right,0px));width:calc(var(--s)*1.55);height:calc(var(--s)*1.55);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;
 font:800 calc(var(--s)*.4)/1 'Baloo 2','Trebuchet MS',sans-serif;letter-spacing:.05em;opacity:.8;transition:transform .05s,opacity .05s;
 background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.32),rgba(124,58,237,.55) 55%,rgba(60,20,120,.7));border:3px solid rgba(216,180,254,.9);box-shadow:0 0 20px rgba(168,85,247,.6),inset 0 0 16px rgba(255,255,255,.16)}
#touch-ui #tb-f.on{opacity:1;transform:scale(.93);box-shadow:0 0 32px rgba(192,132,252,1),inset 0 0 20px rgba(255,255,255,.4)}`;
      document.head.appendChild(st);
    }
    scene.input.addPointer(3);
    const root = (this.root = document.createElement('div')); root.id = 'touch-ui';
    const pad = document.createElement('div'); pad.id = 'tb-pad'; pad.className = 'tb';
    const L = document.createElement('div'); L.className = 'ar'; L.textContent = '‹';
    const R = document.createElement('div'); R.className = 'ar'; R.textContent = '›';
    pad.append(L, R); root.appendChild(pad);
    const F = document.createElement('div'); F.id = 'tb-f'; F.className = 'tb'; F.textContent = 'FLIP'; root.appendChild(F);
    document.body.appendChild(root);
    // One slidable pad: a finger can roll from ‹ to › without lifting. Direction follows the finger's x position on the pad.
    const held = new Map<number, 'l' | 'r'>();
    const setDir = (id: number, d: 'l' | 'r' | null) => {
      input.touchLeft.delete(1000 + id); input.touchRight.delete(1000 + id);
      if (d === 'l') input.touchLeft.add(1000 + id); else if (d === 'r') input.touchRight.add(1000 + id);
      if (d) held.set(id, d); else held.delete(id);
      const vals = [...held.values()]; L.classList.toggle('on', vals.includes('l')); R.classList.toggle('on', vals.includes('r'));
    };
    const dirAt = (x: number) => { const r = pad.getBoundingClientRect(); return x < r.left + r.width / 2 ? 'l' : 'r'; };
    pad.addEventListener('pointerdown', (e) => { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch { /* synthetic */ } setDir(e.pointerId, dirAt(e.clientX)); });
    pad.addEventListener('pointermove', (e) => { if (held.has(e.pointerId)) { const d = dirAt(e.clientX); if (held.get(e.pointerId) !== d) setDir(e.pointerId, d); } });
    const offPad = (e: PointerEvent) => setDir(e.pointerId, null);
    pad.addEventListener('pointerup', offPad); pad.addEventListener('pointercancel', offPad); pad.addEventListener('lostpointercapture', offPad);
    F.addEventListener('pointerdown', (e) => { e.preventDefault(); input.queueFlip(); F.classList.add('on'); });
    const offF = () => F.classList.remove('on'); F.addEventListener('pointerup', offF); F.addEventListener('pointercancel', offF); F.addEventListener('pointerleave', offF);
    for (const el of [pad, F]) el.addEventListener('contextmenu', (e) => e.preventDefault());
    // Reserve gutters for the buttons so the controls never sit on top of the play field (and a thumb never hides the ball).
    const gameEl = document.getElementById('game');
    const layout = () => {
      const sz = Math.round(Math.min(84, Math.max(50, window.innerHeight * 0.16)));
      root.style.setProperty('--s', `${sz}px`);
      if (!gameEl) return;
      if (!this.shown) { gameEl.style.left = '0'; gameEl.style.right = '0'; } else {
        gameEl.style.left = `${Math.round(sz * 2.1 + 36)}px`; gameEl.style.right = `${Math.round(sz * 1.55 + 30)}px`;
      }
      const sm = scene.scale; sm.refresh(); setTimeout(() => sm.refresh(), 60); setTimeout(() => sm.refresh(), 300);
    };
    window.addEventListener('resize', layout);
    const auto = () => scene.sys.game.device.input.touch;
    const apply = () => { const m = save.data.settings.touchControls; this.shown = m === 'on' || (m === 'auto' && (auto() || this.sawTouch)); root.style.display = this.shown ? 'block' : 'none'; layout(); };
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.wasTouch && !this.sawTouch) { this.sawTouch = true; apply(); } });
    const cleanup = () => { input.touchLeft.clear(); input.touchRight.clear(); root.remove(); window.removeEventListener('resize', layout); if (gameEl) { gameEl.style.left = '0'; gameEl.style.right = '0'; } scene.scale.refresh(); };
    scene.events.once('shutdown', cleanup); scene.events.once('destroy', cleanup);
    scene.events.on('pause', () => { root.style.display = 'none'; input.touchLeft.clear(); input.touchRight.clear(); });
    scene.events.on('resume', apply);
    apply();
  }
  get visible() { return this.shown; }
}
