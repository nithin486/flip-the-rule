import { L, P, MP, saw } from './levelDefs.mjs';
export default [
  L(16, 'Elevator', { hint: 'Moving platforms carry you along.', start: [90, 446], star: [332, 170], exit: [900, 183], plats: [P(40, 480, 222), MP(262, 480, 140, 0, -280, 6, 0.8333), P(404, 200, 556)] }),
  L(17, 'Ferry', { start: [90, 436], star: [450, 285], exit: [880, 450], plats: [P(40, 470, 170), MP(220, 470, 120, 330, 0, 7, 0.9), P(700, 470, 260), P(300, 240, 300)] }),
  L(18, 'Saw Corridor', { hint: 'Time the saws — or go over them.', start: [90, 446], star: [500, 175], exit: [900, 450], plats: [P(40, 480, 920), P(250, 150, 420)], haz: [saw(400, 440, 0, -220, 3), saw(640, 300, 0, 140, 4, 0.5)] }),
  L(19, 'Moving Ceiling', { start: [90, 446], star: [430, 298], exit: [890, 450], plats: [P(40, 480, 200), P(240, 480, 520), MP(100, 250, 170, 500, 0, 7, 0.857), P(760, 480, 200)], haz: [{ type: 'spike', x: 250, y: 466, width: 500, dir: 'up' }] }),
  L(20, 'Rhythm Gauntlet', { start: [90, 446], star: [600, 175], exit: [900, 213], plats: [P(40, 480, 160), MP(240, 470, 110, 200, 0, 5, 0.85), P(560, 480, 120), MP(720, 420, 100, 0, -200, 4, 0.5), P(840, 240, 120), P(500, 150, 200)], haz: [saw(620, 380, 0, -100, 3)] }),
];
