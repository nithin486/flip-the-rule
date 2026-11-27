import { L, P, POL, spikeUp, spikeDown, hSpikeUp } from '../levelDefs.mjs';
// 58 Orb Colours - an orb changes your gravity, and with it which coloured slabs are solid.
export default L(58, 'Orb Colours', {
  start: [60, 463], star: [480, 230], exit: [905, 463],
  plats: [P(0, 480, 240), POL(240, 480, 240, 'down'), POL(480, 480, 240, 'up'), P(720, 480, 240), P(0, 96, 240), POL(240, 96, 480, 'up'), P(720, 96, 240)],
  haz: [spikeDown(60, 124, 160), hSpikeUp(560, 480, 40), spikeUp(760, 480, 40)],
  orbs: [[440, 463], [680, 141]],
});
