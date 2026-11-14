import { L, P, MP, spikeUp, spikeDown, hSpikeUp, hSaw, saw, gravZone } from '../levelDefs.mjs';
// 20 Nexus - world 4 finale: portal hop into an up-gravity chamber, a switch above it, and a gate before the exit.
export default L(20, 'Nexus', {
  start: [60, 413], star: [480, 400], exit: [905, 143],
  plats: [P(0, 430, 200), P(260, 330, 120, 28), P(420, 96, 200, 28), P(500, 480, 200, 30), P(700, 96, 260, 28)],
  haz: [spikeUp(260, 330, 60), saw(520, 250, 0, 90, 3), spikeDown(450, 124, 60), spikeUp(520, 480, 80), hSpikeUp(620, 480, 50), saw(800, 300, 0, 90, 2.6)],
  portals: [{ id: 'a', x: 320, y: 290, pair: 'b' }, { id: 'b', x: 600, y: 440, pair: 'a' }],
  switches: [{ id: 'a', x: 560, y: 131, dir: 'up' }],
  doors: [{ switch: 'a', x: 700, y: 124, width: 22, height: 356 }],
  zones: [gravZone(740, 124, 220, 356, 'up')],
});
