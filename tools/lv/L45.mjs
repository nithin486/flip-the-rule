import { L, P, POL, hSpikeUp, hSpikeDown, spikeUp, saw } from '../levelDefs.mjs';
// 45 Polarity Test - every surface in the middle is coloured; hidden spikes wait on the obvious landings.
export default L(45, 'Polarity Test', {
  start: [60, 463], star: [470, 300], exit: [905, 141],
  plats: [P(0, 480, 180), POL(180, 480, 220, 'up'), POL(400, 480, 180, 'down'), POL(580, 480, 200, 'up'), P(780, 480, 180), P(0, 96, 160), POL(160, 96, 220, 'down'), POL(380, 96, 200, 'up'), POL(580, 96, 200, 'down'), P(780, 96, 180)],
  haz: [saw(480, 300, 0, 130, 2.8), hSpikeUp(420, 480, 50), hSpikeDown(420, 124, 50), spikeUp(800, 480, 40)],
});
