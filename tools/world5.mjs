import { L, P, FP, MP, spikeUp, spikeDown, saw } from './levelDefs.mjs';
const zone = (x, y, width, height, gravity) => ({ x, y, width, height, gravity });
export default [
  L(26, 'Zone Out', { hint: 'Glowing zones set gravity for you.', start: [90, 446], star: [600, 245], exit: [900, 450], plats: [P(40, 480, 920), P(250, 200, 540)], haz: [spikeUp(420, 480, 220)], zones: [zone(300, 330, 90, 150, 'up'), zone(700, 230, 60, 90, 'down')] }),
  L(27, 'Crumbling Bridge', { hint: 'Cracked platforms collapse. Keep moving!', start: [90, 446], star: [360, 440], exit: [900, 450], plats: [P(40, 480, 140), FP(180, 480, 120), FP(300, 480, 120), FP(420, 480, 120), FP(540, 480, 120), P(660, 480, 300), P(560, 200, 300)] }),
  L(28, 'Saw Zone', { start: [90, 446], star: [500, 175], exit: [900, 450], plats: [P(40, 480, 920), P(250, 150, 480)], haz: [saw(360, 440, 0, -240, 3), saw(560, 190, 0, 240, 3, 0.5), saw(760, 440, 0, -240, 3, 0.25)], zones: [zone(440, 300, 60, 180, 'up')] }),
  L(29, 'Portal Maze', { start: [90, 446], star: [450, 185], exit: [900, 313], plats: [P(40, 480, 200), P(40, 280, 240), P(400, 140, 260), P(700, 330, 260), P(300, 480, 360)], haz: [spikeUp(300, 480, 360)], portals: [{ id: 'a', x: 260, y: 330, pair: 'b' }, { id: 'b', x: 640, y: 190, pair: 'a' }] }),
  L(30, 'Final Flip', { hint: 'Everything you learned. Flip the rule!', start: [90, 446], star: [700, 295], exit: [900, 295], cps: [[600, 455]], plats: [P(40, 480, 200), MP(240, 480, 110, 200, 0, 5, 0.85), P(556, 480, 160), P(520, 250, 440)], haz: [spikeUp(650, 480, 50), saw(800, 300, 0, 120, 3, 0.5)] }),
];
