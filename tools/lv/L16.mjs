import { L, P, spikeUp, spikeDown, hSpikeUp, saw } from '../levelDefs.mjs';
// 16 Wormhole - a full-height wall splits the room; the only way through is the portal pair. Exiting the far portal drops you next to spikes.
export default L(16, 'Wormhole', {
  start: [60, 463], star: [700, 150], exit: [905, 463],
  plats: [P(0, 480, 960), P(430, 96, 80, 384), P(560, 96, 400, 40)],
  haz: [spikeUp(180, 480, 50), spikeUp(680, 480, 60), hSpikeUp(800, 480, 50), spikeDown(600, 136, 60)],
  portals: [{ id: 'a', x: 330, y: 450, pair: 'b' }, { id: 'b', x: 560, y: 450, pair: 'a' }],
});
