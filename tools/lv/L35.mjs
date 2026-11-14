import { L, P, MP, PH, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, lockZone, reverseZone, windZone, pSpikeUp } from '../levelDefs.mjs';
// 35 Control Room - world 7 finale: a reverse chamber, a lock band, wind and hidden saws on one crossing.
export default L(35, 'Control Room', {
  start: [60, 463], star: [470, 140], exit: [905, 143],
  plats: [P(0, 480, 200), PH(260, 400, 100, 3, 0), P(420, 480, 120, 30), MP(600, 330, 100, 0, 110, 3.4), P(250, 96, 340, 28), P(740, 96, 220, 28), P(780, 480, 100, 30)],
  haz: [spikeUp(200, 480, 0.1), spikeDown(320, 124, 60), spikeUp(430, 480, 60), hSaw(520, 260, 0, 80, 2.6), saw(700, 280, 0, 90, 3), hSpikeUp(790, 480, 60), spikeDown(780, 124, 60), pSpikeUp(300, 400, 0.1)].filter((h) => h.width !== 0.1),
  zones: [reverseZone(220, 124, 280, 356), lockZone(500, 124, 120, 356), windZone(640, 124, 140, 356, -240)],
});
