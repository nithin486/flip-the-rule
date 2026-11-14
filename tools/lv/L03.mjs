import { L, P, spikeUp, spikeDown } from '../levelDefs.mjs';
// 3 Pillars - walk the floor, hop each pillar by riding the ceiling. Spiked pillar tops, hanging spikes just after each pillar.
export default L(3, 'Pillars', {
  hint: 'Watch the flip meter in the top bar.',
  start: [70, 463], star: [480, 215], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 960), P(215, 290, 46, 190), P(470, 290, 46, 190), P(725, 290, 46, 190)],
  haz: [spikeUp(215, 290, 46), spikeUp(470, 290, 46), spikeUp(725, 290, 46), spikeDown(300, 124, 60), spikeDown(556, 124, 60)],
});
