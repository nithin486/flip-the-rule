import { L, P, ICE, spikeUp, spikeDown, hSpikeUp, saw } from '../levelDefs.mjs';
// 21 Black Ice - first ice: the long runway keeps your momentum, so the spike pit at the end can't be stopped for; flip over it.
export default L(21, 'Black Ice', {
  start: [60, 463], star: [450, 150], exit: [905, 463],
  plats: [ICE(0, 480, 540), P(540, 480, 420), P(250, 96, 360, 28), P(740, 96, 220, 28)],
  haz: [spikeUp(540, 480, 60), spikeDown(300, 124, 60), spikeDown(520, 124, 60), hSpikeUp(700, 480, 60), spikeUp(820, 480, 40)],
});
