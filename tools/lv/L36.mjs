import { L, P, MP, PH, ICE, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, pSpikeUp, pSpikeDown, windZone } from '../levelDefs.mjs';
// 36 Gauntlet - one long corridor, every obstacle type in sequence: ice, pulse, saws, wind. Limit has no spare.
export default L(36, 'Gauntlet', {
  start: [60, 463], star: [470, 140], exit: [905, 463],
  plats: [ICE(0, 480, 300), P(300, 480, 660), P(200, 96, 500, 28), P(760, 96, 200, 28)],
  haz: [spikeUp(300, 480, 60), pSpikeUp(400, 480, 80, 3, 0), spikeDown(260, 124, 50), pSpikeDown(480, 124, 70, 3, 0.5), saw(560, 300, 0, 120, 3), hSaw(660, 300, 0, 120, 3, 0.5), hSpikeUp(760, 480, 60), spikeUp(840, 480, 40)],
  zones: [windZone(520, 124, 200, 356, -220)],
});
