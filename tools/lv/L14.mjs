import { L, P, MP, spikeUp, spikeDown, saw, hSaw } from '../levelDefs.mjs';
// 14 Crusher Alley - two lifts moving in opposite directions form a staircase; time the flips between them.
export default L(14, 'Crusher Alley', {
  start: [60, 413], star: [500, 300], exit: [905, 145],
  plats: [P(0, 430, 170), MP(250, 260, 110, 0, 140, 4, 0), MP(480, 260, 110, 0, 140, 4, 0.5), P(700, 96, 260), P(700, 440, 260, 40)],
  haz: [saw(400, 330, 0, 90, 3), hSaw(640, 250), spikeDown(740, 124, 70), spikeUp(760, 440, 60)],
});
