import { L, P, spikeUp, spikeDown, hSpikeUp, hSpikeDown } from '../levelDefs.mjs';
// 7 Spike Garden - one long floor studded with spike clusters, a hanging ceiling block forces a mid-run flip; hidden spike waits at the last landing.
export default L(7, 'Spike Garden', {
  start: [60, 463], star: [500, 222], exit: [905, 463],
  plats: [P(0, 480, 960), P(330, 96, 300, 80), P(690, 96, 270)],
  haz: [spikeUp(220, 480, 60), spikeUp(400, 480, 80), spikeDown(380, 176, 60), spikeDown(560, 176, 50), spikeUp(650, 480, 70), hSpikeUp(790, 480, 60), hSpikeDown(150, 124, 0.1)].slice(0, 6),
});
