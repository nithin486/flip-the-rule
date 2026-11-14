import { L, P, CONV, spikeUp, spikeDown, hSpikeDown, saw } from '../levelDefs.mjs';
// 22 Treadmill - conveyors push against you on the floor and help on the ceiling shelf; spikes wait where the belt drags you.
export default L(22, 'Treadmill', {
  start: [60, 413], star: [520, 300], exit: [905, 463],
  plats: [P(0, 430, 180), CONV(240, 480, 380, -140), P(300, 96, 300, 28), CONV(700, 480, 260, 120)],
  haz: [spikeUp(180, 480, 0.1), spikeDown(340, 124, 60), spikeDown(520, 124, 50), hSpikeDown(430, 124, 40), spikeUp(740, 480, 50), saw(660, 300, 0, 80, 3)].filter((h) => h.width !== 0.1),
});
