import { L, P } from './levelDefs.mjs';
export default [
  L(1, 'First Flip', { hint: 'Press {flip} to reverse gravity, then walk to the portal.', start: [110, 436], star: [300, 300], exit: [540, 300], plats: [P(40, 470, 330), P(40, 250, 560)] }),
  L(2, 'Back Down', { hint: 'Flip again to fall back down.', start: [100, 436], star: [480, 275], exit: [860, 450], plats: [P(40, 470, 240), P(40, 230, 880), P(660, 470, 300)] }),
  L(3, 'Stepping Stones', { start: [100, 446], star: [525, 350], exit: [860, 460], plats: [P(40, 480, 200), P(40, 200, 330), P(440, 390, 170), P(700, 480, 260)] }),
  L(4, 'Optional Star', { hint: 'The star is optional. Is it worth the detour?', start: [90, 446], star: [480, 265], exit: [870, 450], plats: [P(40, 480, 920), P(300, 220, 360)] }),
  L(5, 'Zig Zag', { start: [90, 446], star: [740, 345], exit: [890, 450], plats: [P(40, 480, 190), P(140, 300, 280), P(380, 480, 250), P(600, 300, 280), P(800, 480, 160)] }),
  L(6, 'Ceiling Stairs', { hint: 'Walk off the edge while upside-down to keep rising.', start: [90, 446], star: [610, 255], exit: [880, 165], plats: [P(40, 480, 200), P(40, 390, 260), P(260, 300, 260), P(480, 210, 260), P(700, 120, 260)] }),
  L(7, 'Edge Dance', { hint: 'Flip in mid-air, right after leaving the ledge.', start: [90, 436], star: [450, 345], exit: [860, 450], plats: [P(40, 470, 210), P(300, 300, 300), P(700, 470, 260)] }),
  L(8, 'Upside Down', { grav: 'up', start: [90, 150], star: [480, 260], exit: [880, 450], plats: [P(40, 100, 330), P(380, 300, 220), P(640, 470, 320)] }),
  L(9, 'Slalom', { start: [90, 446], star: [790, 345], exit: [860, 345], plats: [P(40, 480, 170), P(280, 380, 150), P(240, 200, 260), P(560, 420, 160), P(760, 300, 180)] }),
  L(10, 'Gravity Gauntlet', { start: [90, 446], star: [480, 175], exit: [870, 450], plats: [P(40, 480, 160), P(160, 330, 200), P(300, 150, 360), P(420, 400, 180), P(560, 300, 140), P(720, 190, 240), P(720, 480, 240)] }),
];
