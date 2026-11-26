import Phaser from 'phaser';
// Fonts are bundled (no third-party font CDN: fewer requests, works offline/behind blockers, nothing external to wait for).
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import { H, W } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameplayScene } from './scenes/GameplayScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { MenuScene } from './scenes/MenuScene';
import { PauseScene } from './scenes/PauseScene';
import { HintScene } from './scenes/HintScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SettingsScene } from './scenes/SettingsScene';
import { SkinsScene } from './scenes/SkinsScene';
import { LevelSystem } from './systems/LevelSystem';
import { applyOrientation } from './ui/Layout';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W, height: H,
  backgroundColor: '#0B0B1A',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, fixedStep: true, fps: 60, tileBias: 24 } },
  input: { activePointers: 4, touch: { capture: true } },
  render: { antialias: true, roundPixels: false },
  fps: { target: 60, smoothStep: true },
  disableContextMenu: true,
  scene: [BootScene, PreloadScene, MenuScene, LevelSelectScene, GameplayScene, PauseScene, HintScene, LevelCompleteScene, SettingsScene, SkinsScene, GameOverScene],
});
// Debug / test hooks (also used by the headless verifier).
(window as any).__ftr = { game, LevelSystem };
game.events.once('ready', () => { game.canvas.setAttribute('tabindex', '0'); game.canvas.style.outline = 'none'; applyOrientation(game); });
/** Phone rotated (or the portal resized the frame across portrait/landscape): resize the game and rebuild the visible screens. */
const OVERLAYS = ['Pause', 'Hint', 'LevelComplete', 'Settings', 'Skins'];
export function relayout() {
  if (!applyOrientation(game)) return;
  const sm = game.scene, gp = sm.getScene('Gameplay') as GameplayScene;
  const live = (k: string) => sm.isActive(k) || sm.isPaused(k);
  if (live('Gameplay') && gp.level) {
    OVERLAYS.forEach((k) => { if (live(k)) sm.stop(k); });
    gp.scene.restart({ levelId: gp.daily ? undefined : gp.level.id, daily: gp.daily });
    return;
  }
  OVERLAYS.forEach((k) => { if (live(k)) sm.stop(k); });
  for (const k of ['Menu', 'LevelSelect', 'GameOver']) if (live(k)) sm.getScene(k).scene.restart();
}
let rt = 0;
window.addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(relayout, 180); });
window.addEventListener('orientationchange', () => { clearTimeout(rt); rt = window.setTimeout(relayout, 250); });
// Keyboard focus: inside an iframe the game only receives keys after the frame has focus, so grab it on any click/tap.
window.addEventListener('pointerdown', () => { try { window.focus(); } catch { /* ignore */ } }, { capture: true });
