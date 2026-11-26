import { L, P, DASH, spikeUp, spikeDown, saw } from '../levelDefs.mjs';
// 52 Ceiling Dash - the pads hang under the ceiling too. Dash, flip, dash again.
export default L(52, 'Ceiling Dash', {
  start: [60, 463], star: [470, 180], exit: [905, 141],
  plats: [P(0, 480, 200), DASH(200, 480, 80, 440), P(0, 96, 120), DASH(400, 96, 90, 460), P(490, 96, 60), P(860, 96, 100), P(520, 480, 100)],
  haz: [saw(560, 300, 0, 120, 2.6), spikeUp(520, 480, 0.1)].filter((h) => h.width !== 0.1),
});
