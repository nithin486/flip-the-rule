# UPSIDE DOWN RUN

Original 2D physics puzzle platformer. You can't jump: flip gravity to travel between the tops and undersides of platforms, dodge hazards, collect stars and reach the exit portal.
Phaser 3 + TypeScript + Vite. Desktop and mobile. 40 levels in 8 worlds, each with a hard flip limit + deterministic Daily Challenge. Zero binary assets: all art is drawn procedurally and all audio is synthesised (WebAudio), so there are no licences to clear and the build is ~350 KB gzipped.

## Run
    npm install
    npm run dev            # http://localhost:5173
    npm run build          # dist/ (relative paths, 2 files)
    npm run build:single   # one self-contained index.html

## Controls
Move A/D or arrows. Flip SPACE (or up/down). Restart R. Pause ESC. Touch: on-screen buttons. `?` button: text hint, then a ghost replaying a verified solution.

## Architecture (src/)
- `config/` tuning (spec starting values: 900 accel, 260 max, 1200 friction, 1000 gravity, 650 terminal, 200 ms flip cooldown, fixed 60 Hz) and world themes
- `scenes/` Boot, Preload, Menu, LevelSelect, Gameplay, Pause, LevelComplete, Settings, GameOver
- `entities/` Player, Platform (+Door, falling, moving), Hazard (Spike, Saw), Collectible, Portal (exit + teleports), Props (checkpoint, switch, gravity zone)
- `systems/` Input, Level (validation + daily), Score, Save (versioned, sanitising), Audio
- `ui/` Buttons, HUD, TouchControls, Textures
- `platform/` PlatformAdapter, LocalAdapter, CrazyGamesAdapter (SDK v3, fully guarded)
- `levels/world1..5.json` data-driven levels; `tools/*.mjs` is the authoring DSL (edit `tools/world*.mjs`, run `npm run levels`)

Physics is Arcade, stepped manually at a fixed 60 Hz for determinism. Two Arcade quirks are handled and documented in code: resting-contact jitter (cancel gravity while geometrically supported) and body-centre offset after `reset()`. Gravity flip only toggles acceleration: position and horizontal momentum are never touched.

## Verification
- `node tools/verifyLevels.mjs` (dev server running): best-first search over inputs using the real game physics, then replays the found solution from a fresh load. (v1 tool; see below for the v2 pipeline) It writes `tools/targets.json` (flip targets, par times) and `levels/solutions.json` (ghost hints).
- `node tools/qa.mjs`: the spec's QA checklist (gravity, collisions, no tunnelling, hazards, star, exit, saves incl. corrupted/outdated, progression, restart leak test).

Daily challenge = seeded pick of levels 8-30 plus left/right and up/down mirroring (gravity swapped), which preserves solvability.

## CrazyGames preparation (re-verify against live docs before submitting)
Checked at build time: total <=250 MB, <=1,500 files, initial download <=50 MB (<=20 MB for mobile homepage), relative paths only. This build: 2 files, ~1.3 MB.
SDK use limited to documented v3 calls: `init`, `game.loadingStart/Stop`, `game.gameplayStart/Stop`, `ad.requestAd('midgame'|'rewarded', {adStarted, adFinished, adError})`. Mid-roll ads only between levels (min 150 s apart); rewarded ad only for the hint ghost; game works with ads blocked. Adapter activates on a crazygames host or `?platform=crazygames`.
Still to do by hand: test inside the CrazyGames QA tool, take screenshots/metadata, choose Basic vs Full Launch, confirm font licences (Baloo 2 / Poppins are OFL on Google Fonts; the game falls back to system fonts offline). No approval or revenue is implied.


## v2: hard mode (40 levels, flip limits, new mechanics)
- **Flip limit**: every level has `flipLimit` (hard cap) and `flipTarget` (par = proven minimum). Flipping with none left ends the attempt ("OUT OF FLIPS"). The limit is the solver-proven minimum + 1 spare. Flip crystals add +1 flip.
- **New mechanics**: ice (slippery), conveyors, bounce pads, pulsing spikes, flip crystals, plus saws, moving/falling platforms, gates and portals layered by world. Worlds: Floating Islands, Dangerous Heights, Moving World, Portal Dimension, Slick Summit, Crystal Caverns, Chaos Engine, Gravity Master.
- **Pipeline**: `tools/gen.mjs` (corridor generator) -> `tools/buildHard.mjs` (runs candidates through the in-page physics solver `tools/pageSolver.js`, tightens the flip count, replays with the limit active) -> `tools/assemble.mjs` (writes `levels/world1-8.json`, `levels/solutions.json`, `tools/targets.json`). `tools/verifyMirror.mjs` proves mirrored levels by replaying the mirrored inputs. `node tools/qa.mjs` runs the QA checklist (40 levels, flip limit, crystals, saves, leaks).
## v4: hand-designed levels (current)
- All 40 levels are hand-designed (`tools/lv/LNN.mjs`), each with a different layout, and proven one at a time with `tools/proveOne.mjs` (solver + replay with the limit active). `node tools/assembleProved.mjs` writes `levels/*.json`. The old generated/mirrored set is superseded.
- Worlds (new concept every 5 levels, new background palette and a per-level sky layout): 1 basics, 2 spikes + **hidden spikes**, 3 moving platforms + saws (+hidden saws), 4 portals/switches/gates/gravity zones, 5 ice/conveyors/bounce/**wind**, 6 **phase platforms**, pulsing spikes, flip crystals, 7 **no-flip zones**, **reversed controls**, 8 everything, no spare flips (limit = par).
- Hidden hazards stay invisible until the player is ~160px away, then stay revealed until you retry or respawn, when they hide again (the surprise is there on every attempt).
