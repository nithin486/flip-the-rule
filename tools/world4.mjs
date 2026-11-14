import { L, P, spikeUp } from './levelDefs.mjs';
const sw = (id, x, y, dir) => ({ id, x, y, dir });
export default [
  L(21, 'First Switch', { hint: 'Touch a switch to open its matching door.', start: [90, 446], star: [420, 275], exit: [880, 450], plats: [P(40, 480, 920), P(200, 224, 300)], switches: [sw('a', 330, 251, 'up')], doors: [{ switch: 'a', x: 620, y: 290, width: 24, height: 190 }] }),
  L(22, 'Portal Hop', { hint: 'Portals keep your momentum.', start: [90, 446], star: [150, 345], exit: [900, 217], plats: [P(40, 480, 200), P(40, 300, 300), P(660, 172, 300)], portals: [{ id: 'a', x: 300, y: 345, pair: 'b' }, { id: 'b', x: 760, y: 217, pair: 'a' }] }),
  L(23, 'Bridge Builder', { start: [90, 446], star: [150, 285], exit: [900, 450], plats: [P(40, 480, 260), P(100, 250, 300), P(640, 480, 320), { x: 300, y: 480, width: 340, height: 28, kind: 'solid' }], switches: [sw('b', 250, 277, 'up')], doors: [{ switch: 'b', x: 300, y: 480, width: 340, height: 28, bridge: true }] }),
  L(24, 'Twin Portals', { start: [90, 446], star: [150, 305], exit: [900, 450], plats: [P(40, 480, 200), P(40, 260, 260), P(560, 260, 260), P(260, 480, 380), P(660, 480, 300)], haz: [spikeUp(260, 480, 380)], portals: [{ id: 'a', x: 270, y: 305, pair: 'b' }, { id: 'b', x: 700, y: 305, pair: 'a' }] }),
  L(25, 'Lock And Key', { start: [90, 446], star: [450, 275], exit: [900, 450], exitSwitch: 'b', plats: [P(40, 480, 920), P(200, 224, 260)], switches: [sw('a', 300, 251, 'up'), sw('b', 800, 471, 'down')], doors: [{ switch: 'a', x: 560, y: 290, width: 24, height: 190 }] }),
];
