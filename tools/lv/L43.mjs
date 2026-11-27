import { L, P, POL, spikeDown, saw } from '../levelDefs.mjs';
// 43 Swap Stairs - no floor in the middle: hop between a cyan step (stand on top) and a pink step (hang underneath).
export default L(43, 'Swap Stairs', {
  start: [60, 463], star: [470, 330], exit: [905, 463],
  plats: [P(0, 480, 200), POL(250, 380, 140, 'down'), POL(430, 250, 140, 'up'), POL(610, 380, 140, 'down'), P(780, 480, 180), P(0, 96, 960)],
  haz: [saw(520, 420, 0, -110, 3), spikeDown(200, 124, 520)],
});
