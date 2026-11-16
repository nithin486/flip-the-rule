import Phaser from 'phaser';
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
// Keyboard focus: inside an iframe the game only receives keys after the frame has focus, so grab it on any click/tap.
window.addEventListener('pointerdown', () => { try { window.focus(); } catch { /* ignore */ } }, { capture: true });
