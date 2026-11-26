import { L, P, laserH, laserV, spikeUp } from '../levelDefs.mjs';
// 48 Ceiling Sweep - the floor is spikes, and a beam sweeps just under the ceiling. Ride the ceiling between shots.
export default L(48, 'Ceiling Sweep', {
  start: [60, 463], star: [480, 260], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 960)],
  haz: [spikeUp(200, 480, 560), laserH(250, 710, 150, 3, 0.25, 0.45), laserV(790, 124, 400, 2, 0.6, 0.4)],
});
