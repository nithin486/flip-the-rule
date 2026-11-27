import { L, P, DASH, ICE, laserV, spikeUp, spikeDown } from '../levelDefs.mjs';
// 54 Slide and Dash - ice into a pad, a beam on the far side. Too early and you dash into the laser.
export default L(54, 'Slide and Dash', {
  start: [60, 463], star: [560, 260], exit: [905, 463],
  plats: [ICE(0, 480, 300), DASH(300, 480, 90, 420), P(720, 480, 240), P(0, 96, 500), P(700, 96, 260)],
  haz: [laserV(760, 124, 480, 2.2, 0.3), spikeDown(500, 96, 0.1), spikeUp(820, 480, 40)].filter((h) => h.width !== 0.1),
});
