import { L, P, MP, PH, spikeUp, spikeDown, hSpikeUp, hSaw, saw, lockZone, windZone } from '../levelDefs.mjs';
// 33 Locked Gale - wind pushes you into a no-flip band; commit to your gravity before the gust takes you.
export default L(33, 'Locked Gale', {
  start: [60, 413], star: [500, 300], exit: [905, 143],
  plats: [P(0, 430, 180), P(300, 470, 140, 30), P(480, 96, 160, 28), PH(560, 330, 100, 3, 0), P(740, 96, 220, 28)],
  haz: [spikeUp(320, 470, 60), spikeDown(500, 124, 60), hSaw(620, 250, 0, 80, 2.6), saw(420, 260, 0, 80, 3), hSpikeUp(700, 470, 0.1), spikeDown(780, 124, 60)].filter((h) => h.width !== 0.1),
  zones: [windZone(200, 124, 540, 346, 260), lockZone(450, 200, 160, 200)],
});
