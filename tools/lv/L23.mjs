import { L, P, BOUNCE, spikeUp, spikeDown, hSpikeUp, saw } from '../levelDefs.mjs';
// 23 Trampoline Park - pads launch you over a tall wall; hidden spikes sit on the shelf where the launch lands.
export default L(23, 'Trampoline Park', {
  start: [60, 463], star: [400, 150], exit: [905, 463],
  plats: [P(0, 480, 300), BOUNCE(330, 480, 90), P(470, 250, 70, 230), P(540, 480, 150), BOUNCE(690, 480, 90), P(780, 480, 180), P(250, 96, 260, 28)],
  haz: [spikeUp(470, 250, 70), spikeDown(300, 124, 50), spikeDown(460, 124, 50), hSpikeUp(580, 480, 60), saw(620, 360, 0, 70, 3), spikeUp(820, 480, 50)],
});
