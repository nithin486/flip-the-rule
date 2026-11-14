import { L, P, spikeUp, spikeDown } from '../levelDefs.mjs';
// 4 Window Pane - a wall with a narrow window. Thread the window mid-flip; the star sits in the window itself.
export default L(4, 'Window Pane', {
  start: [70, 453], star: [480, 305], exit: [885, 145],
  plats: [P(0, 470, 960), P(380, 92, 76, 168), P(380, 340, 76, 130), P(500, 92, 460)],
  haz: [spikeUp(380, 340, 76), spikeDown(380, 260, 76), spikeUp(560, 470, 150), spikeUp(300, 470, 50)],
});
