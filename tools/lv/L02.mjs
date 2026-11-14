import { L, P, spikeUp, spikeDown } from '../levelDefs.mjs';
// 2 Up And Over - floor -> ceiling bridge -> floor. A spike pit under the bridge and spikes at the far landing punish a careless flip.
export default L(2, 'Up And Over', {
  hint: 'Run out of flips and the attempt ends. Plan the route.',
  start: [80, 433], star: [430, 292], exit: [905, 433],
  plats: [P(0, 450, 250), P(190, 105, 440), P(650, 450, 310)],
  haz: [spikeUp(655, 450, 110), spikeDown(500, 133, 90)],
});
