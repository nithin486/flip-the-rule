import { L, P, POL, spikeUp, saw } from '../levelDefs.mjs';
// 42 Wrong Colour - the floor is a spike pit, the ceiling has a cyan hole: tap gravity down and back up to hop it.
export default L(42, 'Wrong Colour', {
  start: [60, 463], star: [510, 230], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 240), POL(240, 96, 200, 'up'), POL(440, 96, 130, 'down'), POL(570, 96, 190, 'up'), P(760, 96, 200)],
  haz: [saw(505, 200, 0, 90, 2.6), spikeUp(250, 480, 510)],
});
