import { L, P, MP, spikeUp, spikeDown, saw, hSaw, hSpikeUp } from '../levelDefs.mjs';
// 15 Orbit Station - world 3 finale: a ring of islands, a ferry, a lift and orbiting saws.
export default L(15, 'Orbit Station', {
  start: [60, 363], star: [480, 400], exit: [905, 433],
  plats: [P(0, 380, 150), MP(210, 200, 100, 120, 0, 4), P(420, 96, 150, 28), MP(520, 330, 110, 0, 130, 3.4, 0.25), P(700, 270, 80, 28), P(780, 450, 180)],
  haz: [saw(300, 300, 0, 80, 3), saw(620, 200, 90, 0, 3.6), hSaw(560, 440, 0, 60, 2.6), spikeDown(440, 124, 60), spikeUp(810, 450, 60), hSpikeUp(880, 450, 40)],
});
