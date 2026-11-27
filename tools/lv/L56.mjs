import { L, P, spikeUp, spikeDown, laserV } from '../levelDefs.mjs';
// 56 Free Flip - roll into the orb and it flips you for free. Can you finish without pressing flip at all?
export default L(56, 'Free Flip', {
  start: [60, 463], star: [620, 260], exit: [905, 141],
  plats: [P(0, 480, 960), P(0, 96, 960)],
  haz: [laserV(700, 124, 480, 2.4, 0), spikeUp(560, 480, 400), spikeDown(60, 124, 380)],
  orbs: [[480, 463]],
});
