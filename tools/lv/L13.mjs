import { L, P, MP, spikeUp, spikeDown, saw, hSaw } from '../levelDefs.mjs';
// 13 Saw Mill - a full-height hall; three saws sweep up and down in a row, and a hidden one waits at the exit lane.
export default L(13, 'Saw Mill', {
  start: [60, 463], star: [480, 130], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 960, 28)],
  haz: [saw(250, 300, 0, 130, 3), saw(440, 300, 0, 130, 3, 0.5), saw(640, 300, 0, 130, 3), hSaw(820, 400, 0, 70, 2.4), spikeUp(120, 480, 50), spikeDown(740, 124, 60)],
});
