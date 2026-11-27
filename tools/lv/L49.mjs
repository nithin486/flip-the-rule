import { L, P, MP, laserH, spikeUp, spikeDown, hSpikeUp } from '../levelDefs.mjs';
// 49 Beam Lift - ride the lift through a horizontal beam: time it so the beam is off when you pass.
export default L(49, 'Beam Lift', {
  start: [60, 463], star: [480, 210], exit: [905, 141],
  plats: [P(0, 480, 300), MP(380, 420, 160, 0, -220, 4), P(640, 480, 320), P(0, 96, 300), P(640, 96, 320)],
  haz: [hSpikeUp(660, 480, 40), laserH(300, 640, 300, 2.5, 0, 0.5), spikeUp(300, 540, 0.1), spikeDown(300, 124, 340), spikeUp(700, 480, 200)].filter((h) => h.width !== 0.1),
});
