import { L, P, MP, PH, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, pSpikeUp, pSpikeDown, lockZone, reverseZone } from '../levelDefs.mjs';
// 37 Switchback - a zig-zag of three tiers joined by portals, with a gate, lock band and hidden saws.
export default L(37, 'Switchback', {
  start: [60, 463], star: [820, 300], exit: [905, 143],
  plats: [P(0, 480, 960), P(0, 300, 640, 28), P(0, 96, 960, 28)],
  haz: [spikeUp(200, 480, 70), hSpikeUp(500, 480, 70), spikeDown(300, 328, 60), hSaw(760, 400, 0, 70, 2.6), spikeUp(200, 300, 50), pSpikeUp(420, 300, 80, 3, 0), spikeDown(700, 124, 60), hSpikeDown(820, 124, 50)],
  portals: [{ id: 'a', x: 900, y: 440, pair: 'b' }, { id: 'b', x: 60, y: 260, pair: 'a' }],
  zones: [lockZone(600, 328, 160, 152)],
});
