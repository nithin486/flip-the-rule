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
import { PreloadScene } from './scenes/PreloadScene';
import { SettingsScene } from './scenes/SettingsScene';
import { SkinsScene } from './scenes/SkinsScene';
import { LevelSystem } from './systems/LevelSystem';

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
  scene: [BootScene, PreloadScene, MenuScene, LevelSelectScene, GameplayScene, PauseScene, LevelCompleteScene, SettingsScene, SkinsScene, GameOverScene],
});
// Debug / test hooks (also used by the headless verifier).
(window as any).__ftr = { game, LevelSystem };
game.events.once('ready', () => { game.canvas.setAttribute('tabindex', '0'); game.canvas.style.outline = 'none'; });
// Keyboard focus: inside an iframe the game only receives keys after the frame has focus, so grab it on any click/tap.
window.addEventListener('pointerdown', () => { try { window.focus(); } catch { /* ignore */ } }, { capture: true });
