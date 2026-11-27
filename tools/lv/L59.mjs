import { L, P, DASH, laserV, spikeUp, spikeDown, saw } from '../levelDefs.mjs';
// 59 Orb Rush - dash into an orb while a beam ticks; the orb throws you to the ceiling past the spikes.
export default L(59, 'Orb Rush', {
  start: [60, 463], star: [560, 200], exit: [905, 141],
  plats: [P(0, 480, 200), DASH(200, 480, 90, 420), P(290, 480, 200), P(0, 96, 960)],
  haz: [saw(800, 300, 0, 140, 2.8), laserV(700, 124, 480, 2.4, 0.2), spikeDown(200, 124, 300), spikeUp(290, 480, 0.1)].filter((h) => h.width !== 0.1),
  orbs: [[450, 463]],
});
