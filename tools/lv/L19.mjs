import { L, P, MP, spikeUp, spikeDown, hSpikeDown, hSaw, saw, gravZone } from '../levelDefs.mjs';
// 19 Two Keys - zig-zag with two gates: the first switch is on the ceiling shelf, the second is behind a portal hop.
export default L(19, 'Two Keys', {
  start: [60, 463], star: [470, 300], exit: [905, 145],
  plats: [P(0, 480, 380), P(480, 480, 480), P(0, 96, 330, 28), P(430, 330, 160, 28), P(700, 96, 260, 28)],
  haz: [spikeUp(380, 480, 100), spikeDown(120, 124, 60), spikeUp(500, 480, 60), hSpikeDown(480, 358, 60), saw(640, 300, 0, 90, 3), spikeDown(760, 124, 60)],
  switches: [{ id: 'a', x: 200, y: 131, dir: 'up' }, { id: 'b', x: 520, y: 323, dir: 'down' }],
  doors: [{ switch: 'a', x: 380, y: 124, width: 22, height: 356 }, { switch: 'b', x: 660, y: 124, width: 22, height: 356 }],
});
