import { L, P, laserV, spikeUp, spikeDown, saw } from '../levelDefs.mjs';
// 47 Two Beats - two beams take turns. Cross the first on the floor, the second on the ceiling.
export default L(47, 'Two Beats', {
  start: [60, 463], star: [490, 300], exit: [905, 141],
  plats: [P(0, 480, 960), P(0, 96, 960)],
  haz: [saw(490, 210, 0, 160, 3.2), laserV(330, 124, 480, 2.4, 0), laserV(650, 124, 480, 2.4, 0.5), spikeUp(400, 480, 520), spikeDown(120, 124, 160)],
});
