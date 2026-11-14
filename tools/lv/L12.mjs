import { L, P, MP, spikeUp, spikeDown, saw, hSaw } from '../levelDefs.mjs';
// 12 Ferry - the only bridge across a wide void is a sliding ferry platform; saws patrol the crossing, one hidden.
export default L(12, 'Ferry', {
  start: [60, 413], star: [480, 150], exit: [905, 413],
  plats: [P(0, 430, 180), MP(260, 300, 130, 230, 0, 5), P(760, 430, 200), P(300, 96, 340, 40)],
  haz: [saw(480, 230, 0, 70, 3), hSaw(700, 330), spikeDown(420, 136, 60), spikeUp(800, 430, 50)],
});
