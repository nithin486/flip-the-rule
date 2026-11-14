import { L, P, spikeUp, spikeDown, hSpikeDown, hSpikeUp, saw, windZone } from '../levelDefs.mjs';
// 24 Gale Force - a headwind band shoves you back across a long open gap; shelves above and below give footing between gusts.
export default L(24, 'Gale Force', {
  start: [60, 413], star: [480, 150], exit: [905, 413],
  plats: [P(0, 430, 200), P(300, 96, 140, 28), P(520, 470, 120, 30), P(700, 96, 120, 28), P(780, 430, 180)],
  haz: [spikeDown(320, 124, 60), spikeUp(540, 470, 50), hSpikeDown(720, 124, 50), saw(620, 300, 0, 90, 3), spikeUp(820, 430, 50)],
  zones: [windZone(220, 124, 480, 346, -420)],
});
