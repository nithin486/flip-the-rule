import { L, P, MP, spikeUp, spikeDown, saw, hSpikeUp } from '../levelDefs.mjs';
// 11 Elevator Shaft - first moving platform: a lift rides between a low ledge and a high shelf; a saw guards the shaft.
export default L(11, 'Elevator Shaft', {
  start: [70, 433], star: [470, 400], exit: [900, 145],
  plats: [P(0, 450, 220), MP(320, 250, 120, 0, 150, 4), P(560, 96, 400), P(640, 450, 320)],
  haz: [saw(520, 270), spikeUp(700, 450, 70), hSpikeUp(820, 450, 50), spikeDown(600, 124, 60)],
});
