import { L, P, spikeUp, spikeDown, hSpikeUp, hSpikeDown } from '../levelDefs.mjs';
// 10 Needle Run - a narrow channel: floor and ceiling both toothed, hidden teeth guard the safe-looking gaps.
export default L(10, 'Needle Run', {
  start: [60, 403], star: [480, 290], exit: [905, 403],
  plats: [P(0, 420, 960, 60), P(0, 130, 960, 40), P(440, 240, 80, 28)],
  haz: [spikeUp(160, 420, 70), spikeDown(260, 170, 70), spikeUp(340, 420, 50), spikeDown(560, 170, 70), spikeUp(600, 420, 60), spikeDown(700, 170, 60), hSpikeUp(760, 420, 60), hSpikeDown(380, 170, 50), hSpikeUp(480, 420, 0.1)].slice(0, 8),
});
