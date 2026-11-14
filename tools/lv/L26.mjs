import { L, P, PH, spikeUp, spikeDown, hSpikeUp, pSpikeUp, saw } from '../levelDefs.mjs';
// 26 Blink Bridge - the only bridge is phase platforms that blink in and out; a flip crystal sits mid-gap.
export default L(26, 'Blink Bridge', {
  start: [60, 413], star: [480, 150], exit: [905, 413],
  plats: [P(0, 430, 180), PH(250, 330, 100, 3, 0), PH(430, 330, 100, 3, 0.5), PH(610, 330, 100, 3, 0), P(780, 430, 180), P(300, 96, 360, 28)],
  haz: [spikeDown(340, 124, 60), spikeDown(520, 124, 60), pSpikeUp(250, 330, 60, 3, 0.5), hSpikeUp(820, 430, 50)],
  refills: [[480, 250]],
});
