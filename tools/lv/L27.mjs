import { L, P, PH, spikeUp, spikeDown, hSpikeDown, pSpikeUp, pSpikeDown, saw } from '../levelDefs.mjs';
// 27 Pulse Floor - a long floor of pulsing spike beds: safe and deadly in turn. Cross on the beat, or hop via the ceiling.
export default L(27, 'Pulse Floor', {
  start: [60, 463], star: [480, 150], exit: [905, 463],
  plats: [P(0, 480, 960), P(250, 96, 460, 28), PH(400, 330, 120, 3, 0.3)],
  haz: [pSpikeUp(200, 480, 90, 3, 0), pSpikeUp(360, 480, 90, 3, 0.4), pSpikeUp(520, 480, 90, 3, 0.8), pSpikeUp(700, 480, 90, 3, 0.2), spikeDown(300, 124, 50), hSpikeDown(560, 124, 50), spikeUp(840, 480, 40)],
  refills: [[620, 300]],
});
