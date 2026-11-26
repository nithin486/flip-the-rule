import { L, P, POL, spikeUp, hSpikeUp, spikeDown } from '../levelDefs.mjs';
// 41 Two Colours - cyan holds you while gravity points down, pink while it points up. A cyan bridge, a pink ceiling.
export default L(41, 'Two Colours', {
  start: [70, 463], star: [500, 250], exit: [905, 141],
  plats: [P(0, 480, 300), POL(300, 480, 360, 'down'), P(660, 480, 300), P(0, 96, 380), POL(380, 96, 240, 'up'), P(620, 96, 340)],
  haz: [hSpikeUp(420, 480, 40), spikeDown(700, 124, 100), spikeUp(720, 480, 60)],
});
