import { L, P, laserV, laserH, saw, hSpikeUp, spikeUp, spikeDown, hSpikeDown } from '../levelDefs.mjs';
// 50 Laser Maze - three beams on different beats, a saw and a hidden spike. Read the rhythm before you move.
export default L(50, 'Laser Maze', {
  start: [60, 463], star: [480, 400], exit: [905, 141],
  plats: [P(0, 480, 960), P(0, 96, 960), P(380, 290, 200, 28)],
  haz: [hSpikeDown(820, 124, 40), laserV(250, 124, 480, 2.4, 0), laserH(380, 580, 340, 2, 0.5), laserV(700, 124, 480, 2.4, 0.4), saw(480, 200, 160, 0, 3), hSpikeUp(560, 480, 50), spikeUp(760, 480, 120), spikeDown(260, 124, 100)],
});
