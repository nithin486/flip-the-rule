import { L, P, PH, MP, spikeUp, spikeDown, hSpikeUp, pSpikeDown, saw } from '../levelDefs.mjs';
// 28 Strobe Stairs - a rising staircase of phase platforms, each blinking out of step; crystals refund flips on the climb.
export default L(28, 'Strobe Stairs', {
  start: [60, 463], star: [480, 130], exit: [905, 143],
  plats: [P(0, 480, 140), PH(200, 400, 100, 3, 0), PH(360, 320, 100, 3, 0.35), PH(520, 240, 100, 3, 0.7), P(700, 96, 260, 28), P(620, 480, 340, 30)],
  haz: [spikeUp(640, 480, 60), pSpikeDown(380, 124, 0.1), hSpikeUp(780, 480, 50), saw(560, 360, 0, 80, 3), spikeDown(740, 124, 60)].filter((h) => h.width !== 0.1),
  refills: [[420, 250], [610, 160]],
});
