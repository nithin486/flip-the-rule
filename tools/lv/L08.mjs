import { L, P, spikeUp, spikeDown, hSpikeUp, hSpikeDown } from '../levelDefs.mjs';
// 8 Step Ladder - rising stairs; flipping at each step is wrong, spikes sit on each tread and one hides under a tread.
export default L(8, 'Step Ladder', {
  start: [60, 463], star: [610, 160], exit: [905, 145],
  plats: [P(0, 480, 200), P(260, 400, 140), P(460, 310, 140), P(660, 96, 300), P(700, 480, 260)],
  haz: [spikeUp(300, 400, 50), spikeUp(500, 310, 50), spikeDown(480, 338, 40), hSpikeUp(760, 480, 70), hSpikeDown(720, 124, 60)],
});
