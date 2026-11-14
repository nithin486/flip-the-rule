import { L, P, spikeUp, spikeDown, hSpikeUp, hSpikeDown } from '../levelDefs.mjs';
// 6 Hidden Teeth - alternating shelves; the obvious landing spots hide spikes that only show when you get close.
export default L(6, 'Hidden Teeth', {
  start: [70, 433], star: [470, 290], exit: [900, 145],
  plats: [P(0, 450, 230), P(300, 96, 300), P(670, 450, 290), P(790, 96, 170)],
  haz: [spikeDown(520, 124, 50), hSpikeUp(720, 450, 60), hSpikeDown(380, 124, 60), spikeUp(900, 450, 40)],
});
