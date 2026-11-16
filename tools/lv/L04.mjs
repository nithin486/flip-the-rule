import { L, P, spikeUp, spikeDown } from '../levelDefs.mjs';
// 4 Window Pane - a wall with a narrow window. Thread the window mid-flip; the star sits in the window itself.
export default L(4, 'Window Pane', {
  start: [70, 453], star: [418, 296], exit: [885, 145],
  plats: [P(0, 470, 960), P(380, 92, 76, 128), P(380, 372, 76, 98), P(500, 92, 460)],
  haz: [spikeUp(380, 372, 76), spikeDown(380, 220, 76), spikeUp(560, 470, 150), spikeUp(300, 470, 50)],
});
