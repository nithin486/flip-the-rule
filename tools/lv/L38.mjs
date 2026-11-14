import { L, P, MP, PH, CONV, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, pSpikeUp, pSpikeDown, windZone, reverseZone } from '../levelDefs.mjs';
// 38 Shatter Bridge - phase bridge over a conveyor pit with reversed controls and a crosswind.
export default L(38, 'Shatter Bridge', {
  start: [60, 413], star: [480, 140], exit: [905, 413],
  plats: [P(0, 430, 160), PH(220, 350, 90, 3, 0), PH(380, 350, 90, 3, 0.33), PH(540, 350, 90, 3, 0.66), CONV(300, 490, 400, -120), P(780, 430, 180), P(250, 96, 400, 28)],
  haz: [spikeUp(300, 490, 400), hSaw(450, 250, 0, 80, 2.6), saw(620, 250, 0, 80, 3), spikeDown(300, 124, 60), pSpikeDown(500, 124, 80, 3, 0.4), hSpikeUp(830, 430, 50)],
  zones: [reverseZone(200, 124, 480, 366), windZone(560, 124, 200, 366, 240)],
});
