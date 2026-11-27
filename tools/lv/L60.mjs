import { L, P, POL, DASH, laserV, saw, hSpikeUp, hSpikeDown, spikeUp, spikeDown } from '../levelDefs.mjs';
// 60 THE LAST ORB - the finale: colours, beams, a dash pad, orbs and hidden spikes on one run. No spare flips.
export default L(60, 'The Last Orb', {
  start: [60, 463], star: [470, 420], exit: [905, 141],
  plats: [P(0, 480, 180), DASH(180, 480, 80, 420), POL(380, 480, 180, 'down'), POL(380, 96, 220, 'up'), P(0, 96, 200), P(620, 480, 140), POL(700, 96, 260, 'up'), P(760, 480, 200)],
  haz: [laserV(600, 124, 480, 2.4, 0.3), saw(300, 300, 0, 140, 3), hSpikeUp(640, 480, 40), hSpikeDown(780, 124, 40), spikeDown(200, 124, 180), spikeUp(820, 480, 120)],
  orbs: [[330, 400], [700, 300]],
});
