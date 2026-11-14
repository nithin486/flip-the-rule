import { L, P, spikeUp, spikeDown, hSpikeUp, hSaw, saw, gravZone } from '../levelDefs.mjs';
// 18 Gravity Well - an upward-gravity band over the middle of a stepped floor; riding it carries you over a spiked trench.
export default L(18, 'Gravity Well', {
  start: [60, 413], star: [480, 150], exit: [905, 143],
  plats: [P(0, 430, 200), P(290, 480, 380, 30), P(300, 96, 360, 28), P(760, 96, 200)],
  haz: [spikeUp(300, 480, 360), spikeDown(340, 124, 50), spikeDown(560, 124, 50), hSpikeUp(720, 480, 0.1), saw(440, 300, 0, 80, 3.2)].filter((h) => h.width !== 0.1),
  zones: [gravZone(330, 124, 300, 356, 'up')],
});
