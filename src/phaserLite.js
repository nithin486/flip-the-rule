// Lean Phaser build: phaser-core (renderer, scenes, input, tweens, text, graphics, textures) + only the extras this game uses.
// Skips Matter physics, tilemaps, sound manager, curves, camera3d, spine, debug tooling... (~29% smaller gzip than the stock bundle).
import Phaser from 'phaser/src/phaser-core.js';
import Arcade from 'phaser/src/physics/arcade';
import Container from 'phaser/src/gameobjects/container/Container';
import 'phaser/src/gameobjects/container/ContainerFactory';
import Particles from 'phaser/src/gameobjects/particles';
import 'phaser/src/gameobjects/particles/ParticleEmitterFactory';
import 'phaser/src/gameobjects/shape/arc/ArcFactory';
import 'phaser/src/gameobjects/shape/rectangle/RectangleFactory';
import Zone from 'phaser/src/gameobjects/zone/Zone';
import 'phaser/src/gameobjects/zone/ZoneFactory';
import Color from 'phaser/src/display/color';
import Utils from 'phaser/src/utils';
import Scale from 'phaser/src/scale';
import Geom from 'phaser/src/geom';
import PMath from 'phaser/src/math';
import Tweens from 'phaser/src/tweens';
import Time from 'phaser/src/time';
import Input from 'phaser/src/input';

Phaser.Physics = { Arcade };
Phaser.GameObjects.Container = Container;
Phaser.GameObjects.Particles = Particles;
Phaser.GameObjects.Zone = Zone;
Phaser.Display.Color = Color;
Phaser.Utils = Utils; Phaser.Scale = Scale; Phaser.Geom = Geom; Phaser.Math = PMath; Phaser.Tweens = Tweens; Phaser.Time = Time; Phaser.Input = Input;
globalThis.Phaser = Phaser;
export default Phaser;
