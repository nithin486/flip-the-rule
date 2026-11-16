import { SAVE_KEY, SAVE_VERSION, TOTAL_LEVELS } from '../config/gameConfig';
import type { SaveData } from '../types';

/** Storage backend abstraction so a platform cloud-save adapter can be plugged in later. */
export interface SaveBackend { read(): string | null; write(v: string): void }

class LocalBackend implements SaveBackend {
  read() { try { return localStorage.getItem(SAVE_KEY); } catch { return null; } }
  write(v: string) { try { localStorage.setItem(SAVE_KEY, v); } catch { /* private mode / quota */ } }
}

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  unlockedLevel: 1,
  stars: {}, bestScores: {}, bestTimes: {}, bestFlips: {},
  totalScore: 0, skin: 0,
  settings: { music: true, sound: true, reduceMotion: false, touchControls: 'auto' },
  daily: { lastCompleted: '', streak: 0, bestStreak: 0, completed: {} },
});

const num = (v: unknown, d: number, lo = -Infinity, hi = Infinity) => (typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const numMap = (v: unknown, maxVal = Infinity): Record<string, number> => {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const id = Number(k);
    if (Number.isInteger(id) && id >= 1 && id <= TOTAL_LEVELS && typeof val === 'number' && isFinite(val)) out[k] = Math.min(maxVal, Math.max(0, val));
  }
  return out;
};

/** Defensive migration: accepts missing, corrupted and outdated (unversioned / older) data. */
export function sanitize(raw: unknown): SaveData {
  const d = defaultSave();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, any>;
  // v0 (unversioned) had the same core fields; anything older is simply re-validated field by field.
  d.unlockedLevel = Math.floor(num(r.unlockedLevel, 1, 1, TOTAL_LEVELS));
  d.stars = numMap(r.stars, 3);
  d.bestScores = numMap(r.bestScores);
  d.bestTimes = numMap(r.bestTimes);
  d.bestFlips = numMap(r.bestFlips);
  d.totalScore = Math.floor(num(r.totalScore, 0, 0));
  d.skin = Math.floor(num(r.skin, 0, 0, 4));
  const s = (r.settings && typeof r.settings === 'object') ? r.settings : {};
  d.settings.music = typeof s.music === 'boolean' ? s.music : true;
  d.settings.sound = typeof s.sound === 'boolean' ? s.sound : true;
  d.settings.reduceMotion = typeof s.reduceMotion === 'boolean' ? s.reduceMotion : false;
  d.settings.touchControls = s.touchControls === 'on' || s.touchControls === 'off' ? s.touchControls : 'auto';
  const dl = (r.daily && typeof r.daily === 'object') ? r.daily : {};
  d.daily.lastCompleted = typeof dl.lastCompleted === 'string' ? dl.lastCompleted.slice(0, 10) : '';
  d.daily.streak = Math.floor(num(dl.streak, 0, 0, 100000));
  d.daily.bestStreak = Math.floor(num(dl.bestStreak, 0, 0, 100000));
  if (dl.completed && typeof dl.completed === 'object') for (const [k, v] of Object.entries(dl.completed)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number') d.daily.completed[k] = v;
  // keep unlock consistent with recorded stars
  for (const k of Object.keys(d.stars)) if (d.stars[k] > 0) d.unlockedLevel = Math.max(d.unlockedLevel, Math.min(TOTAL_LEVELS, Number(k) + 1));
  return d;
}

export class SaveSystem {
  data: SaveData;
  constructor(private backend: SaveBackend = new LocalBackend()) { this.data = this.load(); }
  setBackend(b: SaveBackend) { this.backend = b; this.data = this.load(); }
  load(): SaveData {
    try { const t = this.backend.read(); if (!t) return defaultSave(); return sanitize(JSON.parse(t)); } catch { return defaultSave(); }
  }
  save() { try { this.backend.write(JSON.stringify(this.data)); } catch { /* ignore */ } }
  reset() { this.data = defaultSave(); this.save(); }
  stars(id: number) { return this.data.stars[String(id)] ?? 0; }
  totalStars() { return Object.values(this.data.stars).reduce((a, b) => a + b, 0); }
  isUnlocked(id: number) { return id <= this.data.unlockedLevel; }
}
export const save = new SaveSystem();
