import { L, P, spikeUp, spikeDown, hSpikeUp, hSaw, lockZone } from '../levelDefs.mjs';
// 31 Dead Zone - a no-flip band in the middle of the room: you must be mid-air going the right way before you enter it.
export default L(31, 'Dead Zone', {
  start: [60, 463], star: [480, 130], exit: [905, 463],
  plats: [P(0, 480, 960), P(0, 96, 300, 28), P(640, 96, 320, 28)],
  haz: [spikeUp(200, 480, 60), spikeDown(100, 124, 60), spikeUp(430, 480, 90), hSpikeUp(560, 480, 50), spikeDown(700, 124, 60), hSaw(780, 380, 0, 80, 2.6)],
  zones: [lockZone(340, 124, 280, 356)],
});
