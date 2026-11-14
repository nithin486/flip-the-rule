import { L, P, MP, PH, ICE, CONV, BOUNCE, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, pSpikeUp, pSpikeDown, lockZone, reverseZone, windZone } from '../levelDefs.mjs';
// 40 FLIP THE RULE - the finale: every mechanic on one long run, no spare flips.
export default L(40, 'Flip The Rule', {
  start: [60, 463], star: [480, 140], exit: [905, 143],
  plats: [ICE(0, 480, 200), PH(260, 400, 90, 3, 0), MP(400, 340, 100, 0, 110, 3.4), CONV(560, 480, 160, 120), P(220, 96, 400, 28), PH(700, 300, 80, 3, 0.4), P(740, 96, 220, 28), P(780, 480, 180, 30)],
  haz: [spikeUp(200, 480, 0.1), pSpikeUp(560, 480, 90, 3, 0.3), hSaw(450, 230, 0, 80, 2.6), saw(640, 260, 0, 90, 3), spikeDown(260, 124, 60), pSpikeDown(460, 124, 70, 3, 0.5), hSpikeUp(820, 480, 50), spikeDown(780, 124, 60)].filter((h) => h.width !== 0.1),
  refills: [[500, 220]],
  zones: [reverseZone(220, 124, 200, 356), lockZone(600, 124, 90, 356), windZone(700, 124, 120, 356, -240)],
});
