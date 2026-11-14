import { L, P, PH, MP, spikeUp, spikeDown, hSaw, hSpikeUp, pSpikeUp, pSpikeDown, saw } from '../levelDefs.mjs';
// 29 Heartbeat - a ceiling and floor that pulse in opposition, with a moving lift between; time each flip to the beat.
export default L(29, 'Heartbeat', {
  start: [60, 413], star: [500, 280], exit: [905, 413],
  plats: [P(0, 430, 160), P(220, 96, 220, 28), MP(300, 360, 110, 0, 110, 3.6), P(560, 470, 120, 30), P(560, 96, 140, 28), PH(740, 330, 90, 3, 0), P(800, 430, 160)],
  haz: [pSpikeDown(240, 124, 80, 3, 0), pSpikeUp(570, 470, 90, 3, 0.5), hSaw(500, 250, 0, 70, 2.8), hSpikeUp(840, 430, 50), saw(660, 260, 0, 80, 3.4), pSpikeDown(580, 124, 60, 3, 0.5)],
  refills: [[480, 200]],
});
