import { L, P, spikeUp, spikeDown, hSpikeUp, hSpikeDown } from '../levelDefs.mjs';
// 9 Twin Towers - two floor-mounted towers of different height with a ceiling slab between; the valley between them hides spikes.
export default L(9, 'Twin Towers', {
  start: [60, 463], star: [470, 200], exit: [905, 145],
  plats: [P(0, 480, 960), P(240, 250, 70, 230), P(640, 330, 70, 150), P(380, 96, 220, 70), P(770, 96, 190)],
  haz: [spikeUp(240, 250, 70), spikeUp(640, 330, 70), spikeDown(420, 166, 60), hSpikeUp(420, 480, 90), hSpikeUp(780, 480, 60), hSpikeDown(820, 124, 50)],
});
