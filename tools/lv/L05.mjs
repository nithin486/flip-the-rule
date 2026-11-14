import { L, P, spikeUp, spikeDown } from '../levelDefs.mjs';
// 5 Skyline Rush - no floor at all: four floating islands (one walkable on both faces). Falling off the bottom is death. Star dangles under the middle island.
export default L(5, 'Skyline Rush', {
  start: [70, 383], star: [580, 420], exit: [900, 145],
  plats: [P(0, 400, 190), P(240, 96, 170), P(480, 270, 200, 40), P(740, 96, 220)],
  haz: [spikeUp(520, 270, 70), spikeDown(300, 124, 60), spikeDown(620, 310, 40), spikeUp(0, 400, 0.1)].slice(0, 3),
});
