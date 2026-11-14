import { L, P, PH, MP, ICE, spikeUp, spikeDown, hSaw, hSpikeUp, pSpikeUp, pSpikeDown, saw } from '../levelDefs.mjs';
// 30 Crystal Core - world 6 finale: blinking bridge over pulse spikes, a lift, hidden saws, and crystals that must be chained.
export default L(30, 'Crystal Core', {
  start: [60, 463], star: [470, 140], exit: [905, 143],
  plats: [P(0, 480, 150), PH(210, 400, 90, 3, 0), MP(360, 340, 100, 0, 120, 3.6), PH(520, 300, 90, 3, 0.5), P(280, 96, 300, 28), P(680, 480, 100, 30), P(740, 96, 220, 28), PH(790, 320, 80, 3, 0.2)],
  haz: [pSpikeDown(320, 124, 70, 3, 0.5), spikeDown(480, 124, 50), pSpikeUp(690, 480, 70, 3, 0), hSaw(450, 230, 0, 70, 2.6), hSpikeUp(800, 480, 50), saw(620, 250, 0, 90, 3.2), spikeDown(790, 124, 60)],
  refills: [[360, 250], [610, 220]],
});
