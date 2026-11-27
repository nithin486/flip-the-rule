import { L, P, DASH, spikeDown, laserV } from '../levelDefs.mjs';
// 51 First Dash - a dash pad flings you over a pit too wide to roll across. The ceiling above it is all spikes.
export default L(51, 'First Dash', {
  start: [60, 463], star: [480, 400], exit: [905, 463],
  plats: [P(0, 480, 220), DASH(220, 480, 90, 460), P(700, 480, 260), P(0, 96, 960)],
  haz: [laserV(760, 124, 480, 2.6, 0.3), spikeDown(260, 124, 480)],
});
