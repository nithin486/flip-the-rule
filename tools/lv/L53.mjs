import { L, P, DASH, saw, spikeUp, spikeDown, hSpikeUp } from '../levelDefs.mjs';
// 53 Backfire - a pad that throws you LEFT, into a saw, unless you flip off it in time.
export default L(53, 'Backfire', {
  start: [60, 463], star: [300, 300], exit: [905, 141],
  plats: [P(0, 480, 380), DASH(380, 480, 120, -440), P(500, 480, 460), P(0, 96, 960)],
  haz: [hSpikeUp(560, 480, 40), saw(180, 400, 0, 0), spikeUp(620, 480, 200), spikeDown(380, 124, 200)],
});
