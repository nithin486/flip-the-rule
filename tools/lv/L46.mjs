import { L, P, laserV, spikeUp, spikeDown } from '../levelDefs.mjs';
// 46 First Beam - a laser cuts the room in two. It fires on a beat: wait for the gap, then go.
export default L(46, 'First Beam', {
  start: [60, 463], star: [700, 170], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 960)],
  haz: [laserV(820, 124, 480, 2.4, 0.5), spikeDown(260, 124, 180), laserV(480, 124, 480, 2.4, 0), spikeUp(560, 480, 120)],
});
