import { L, P, spikeUp, spikeDown } from './levelDefs.mjs';
export default [
  L(11, 'Spike Intro', { hint: 'Red spikes are deadly. Go over them — upside-down.', start: [90, 446], star: [600, 275], exit: [880, 450], plats: [P(40, 480, 920), P(300, 230, 360)], haz: [spikeUp(400, 480, 120)] }),
  L(12, 'Ceiling Teeth', { start: [90, 446], star: [560, 245], exit: [900, 450], plats: [P(40, 480, 920), P(40, 200, 880)], haz: [spikeUp(300, 480, 40), spikeUp(640, 480, 40), spikeDown(470, 228, 40), spikeDown(790, 228, 40)] }),
  L(13, 'Spiked Stairs', { hint: 'Flip before you reach the spikes!', start: [70, 446], star: [610, 255], exit: [880, 165], plats: [P(40, 480, 200), P(40, 390, 260), P(260, 300, 260), P(480, 210, 260), P(700, 120, 260)], haz: [spikeUp(130, 480, 105), spikeUp(60, 390, 220), spikeUp(280, 300, 220), spikeUp(500, 210, 220)] }),
  L(14, 'Checkpoint Run', { hint: 'Flags save your progress and your gravity.', start: [70, 446], star: [560, 245], exit: [900, 450], cps: [[380, 455]], plats: [P(40, 480, 920), P(100, 220, 820)], haz: [spikeUp(180, 480, 70), spikeUp(430, 480, 60), spikeDown(720, 248, 70)] }),
  L(15, 'Spike Canyon', { start: [90, 446], star: [500, 385], exit: [870, 450], plats: [P(40, 480, 300), P(420, 340, 160), P(380, 160, 300), P(760, 480, 200)], haz: [spikeUp(420, 340, 160)] }),
];
