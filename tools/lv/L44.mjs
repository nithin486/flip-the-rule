import { L, P, POL, MP, saw, spikeUp, spikeDown, hSpikeUp } from '../levelDefs.mjs';
// 44 Colour Lift - a saw guards the middle; pink slabs on the ceiling and a cyan slab that only holds you on the way down.
export default L(44, 'Colour Lift', {
  start: [60, 463], star: [480, 170], exit: [905, 141],
  plats: [P(0, 480, 260), POL(260, 480, 200, 'up'), P(460, 480, 160), POL(620, 480, 140, 'up'), P(760, 480, 200), P(0, 96, 200), POL(200, 96, 300, 'up'), POL(500, 96, 180, 'down'), POL(680, 96, 280, 'up')],
  haz: [hSpikeUp(470, 480, 40), saw(480, 300, 0, 120, 3), spikeUp(500, 480, 60), spikeDown(300, 124, 60)],
});
