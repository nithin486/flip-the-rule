import type { LevelResult } from '../types';

/** Pure scoring so it can be unit-tested. Matches spec tables: 1000 / +500 / up to +500 / up to +250. */
export function computeResult(p: { levelId: number; daily?: boolean; flips: number; flipTarget: number; time: number; parTime: number; collected: boolean }): Omit<LevelResult, 'newBest'> {
  const base = 1000;
  const star = p.collected ? 500 : 0;
  const over = Math.max(0, p.flips - p.flipTarget);
  const efficiency = Math.max(0, 500 - over * 125);
  // light time bonus: full inside par, linearly fading to 0 over another 2x par window
  const t = p.time <= p.parTime ? 1 : Math.max(0, 1 - (p.time - p.parTime) / (p.parTime * 2));
  const time = Math.round(250 * t);
  const stars = 1 + (p.collected ? 1 : 0) + (p.flips <= p.flipTarget ? 1 : 0);
  return { levelId: p.levelId, daily: !!p.daily, flips: p.flips, time: p.time, collected: p.collected, stars, score: base + star + efficiency + time, breakdown: { base, star, efficiency, time } };
}
