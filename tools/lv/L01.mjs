import { L, P, T } from '../levelDefs.mjs';
// 1 First Flip - one floor, one ceiling, one jump across the gap. Star hangs in the arc of the flip.
export default L(1, 'First Flip', {
  hint: 'Flip gravity with {flip}. Walk off the edge, then flip!',
  start: [90, 423], star: [470, 270], exit: [820, 145],
  plats: [P(0, 440, 380), P(430, 100, 530)],
});
