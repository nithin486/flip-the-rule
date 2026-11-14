import { L, P, spikeUp, spikeDown, hSpikeDown, saw } from '../levelDefs.mjs';
// 17 Keyhole - a gate seals the right half; its switch sits on a high shelf above a spiked floor. Step on it, drop back, run the gate.
export default L(17, 'Keyhole', {
  start: [60, 463], star: [820, 300], exit: [905, 463],
  plats: [P(0, 480, 960), P(260, 300, 280, 28), P(560, 96, 400, 40)],
  haz: [spikeUp(260, 480, 160), spikeDown(300, 328, 60), hSpikeDown(450, 328, 50), spikeUp(760, 480, 60)],
  switches: [{ id: 'a', x: 480, y: 293, dir: 'down' }],
  doors: [{ switch: 'a', x: 640, y: 136, width: 22, height: 344 }],
});
