import { L, P, ICE, CONV, BOUNCE, spikeUp, spikeDown, hSpikeUp, hSaw, saw, windZone } from '../levelDefs.mjs';
// 25 Storm Summit - world 5 finale: ice approach, conveyor ledge, wind chimney, bounce launch and a hidden saw at the top.
export default L(25, 'Storm Summit', {
  start: [60, 463], star: [470, 330], exit: [905, 143],
  plats: [ICE(0, 480, 260), CONV(320, 480, 200, 130), P(600, 480, 100, 30), BOUNCE(760, 480, 90), P(400, 96, 200, 28), P(740, 96, 220, 28), P(330, 300, 130, 28)],
  haz: [spikeUp(260, 480, 60), spikeDown(430, 124, 60), spikeUp(600, 480, 50), hSaw(680, 250, 0, 80, 2.6), saw(560, 250, 0, 70, 3.2), spikeDown(780, 124, 60), hSpikeUp(900, 480, 40)],
  zones: [windZone(560, 124, 160, 356, 300)],
});
