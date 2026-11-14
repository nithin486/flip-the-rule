import { L, P, MP, spikeUp, spikeDown, hSpikeUp, hSaw, saw, reverseZone } from '../levelDefs.mjs';
// 32 Mirror Hall - controls reverse inside the hall: left becomes right while you thread spikes and a lift.
export default L(32, 'Mirror Hall', {
  start: [60, 413], star: [480, 150], exit: [905, 413],
  plats: [P(0, 430, 200), MP(300, 330, 100, 0, 100, 3.4), P(280, 96, 300, 28), P(520, 470, 160, 30), P(780, 430, 180)],
  haz: [spikeDown(320, 124, 60), spikeUp(540, 470, 60), hSaw(440, 250, 0, 80, 2.6), spikeDown(500, 124, 50), saw(700, 300, 0, 90, 3), hSpikeUp(820, 430, 50)],
  zones: [reverseZone(230, 124, 480, 346)],
});
