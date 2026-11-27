import { L, P, spikeDown, saw } from '../levelDefs.mjs';
// 57 Orb Relay - no floor in the middle: orbs hanging in the air bounce you up and down across the pit.
export default L(57, 'Orb Relay', {
  start: [60, 463], star: [480, 300], exit: [905, 463],
  plats: [P(0, 480, 200), P(760, 480, 200), P(0, 96, 960)],
  haz: [saw(480, 420, 160, 0, 3), spikeDown(300, 124, 360)],
  orbs: [[260, 400], [480, 200], [700, 380]],
});
