import { L, P, MP, PH, ICE, BOUNCE, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, pSpikeUp, pSpikeDown, lockZone, windZone } from '../levelDefs.mjs';
// 39 Last Light - towers, ice, bounce pad and lock band: a vertical climb through a wind chimney.
export default L(39, 'Last Light', {
  start: [60, 463], star: [470, 300], exit: [905, 143],
  plats: [ICE(0, 480, 280), P(340, 340, 80, 140), BOUNCE(440, 480, 90), P(600, 250, 60, 230), P(260, 96, 340, 28), P(740, 96, 220, 28), P(700, 480, 260, 30)],
  haz: [spikeUp(340, 340, 80), spikeUp(600, 250, 60), spikeDown(300, 124, 60), hSaw(520, 330, 0, 90, 2.6), saw(680, 300, 0, 100, 3), hSpikeUp(760, 480, 60), pSpikeDown(480, 124, 70, 3, 0.5), spikeDown(780, 124, 60)],
  zones: [lockZone(430, 124, 150, 356), windZone(700, 124, 250, 356, -220)],
});
