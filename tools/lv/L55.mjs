import { L, P, DASH, POL, hSpikeDown, saw, spikeUp } from '../levelDefs.mjs';
// 55 Dash Circuit - a floor pad, a pink island to hang from, a ceiling pad home; a hidden spike waits near the end.
export default L(55, 'Dash Circuit', {
  start: [60, 463], star: [480, 390], exit: [905, 141],
  plats: [P(0, 480, 160), DASH(160, 480, 80, 440), POL(400, 300, 160, 'up'), P(560, 480, 120), DASH(560, 96, 100, 440), P(660, 96, 300), P(0, 96, 200)],
  haz: [saw(300, 260, 0, 120, 2.8), hSpikeDown(760, 124, 40), spikeUp(560, 480, 30)],
});
