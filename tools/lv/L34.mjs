import { L, P, MP, PH, ICE, CONV, spikeUp, spikeDown, hSpikeUp, hSpikeDown, hSaw, saw, lockZone, reverseZone } from '../levelDefs.mjs';
// 34 Backwards Bridge - reversed controls over an ice shelf, a lock band at the landing, and a hidden saw above the exit.
export default L(34, 'Backwards Bridge', {
  start: [60, 463], star: [470, 130], exit: [905, 463],
  plats: [ICE(0, 480, 360), P(420, 480, 120, 30), P(250, 96, 330, 28), CONV(620, 480, 340, 110)],
  haz: [spikeUp(360, 480, 60), spikeDown(300, 124, 60), hSpikeDown(480, 124, 50), spikeUp(560, 480, 50), hSaw(740, 380, 0, 80, 2.6), spikeUp(800, 480, 50), hSpikeUp(880, 480, 40)],
  zones: [reverseZone(0, 124, 360, 356), lockZone(600, 124, 160, 356)],
});
