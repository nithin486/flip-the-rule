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
  settings: { music: true, sound: true, reduceMotion: false, touchControls: 'auto', hardMode: false },
  visits: { last: '', streak: 0, best: 0 },
  skipped: [],
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
  d.skin = Math.floor(num(r.skin, 0, 0, 7));
  const s = (r.settings && typeof r.settings === 'object') ? r.settings : {};
  d.settings.music = typeof s.music === 'boolean' ? s.music : true;
  d.settings.sound = typeof s.sound === 'boolean' ? s.sound : true;
  d.settings.reduceMotion = typeof s.reduceMotion === 'boolean' ? s.reduceMotion : false;
  d.settings.touchControls = s.touchControls === 'on' || s.touchControls === 'off' ? s.touchControls : 'auto';
  d.settings.hardMode = s.hardMode === true;
  const vv = (r.visits && typeof r.visits === 'object') ? r.visits : {};
  d.visits.last = typeof vv.last === 'string' ? vv.last.slice(0, 10) : '';
  d.visits.streak = Math.floor(num(vv.streak, 0, 0, 100000));
  d.visits.best = Math.floor(num(vv.best, 0, 0, 100000));
  if (Array.isArray(r.skipped)) d.skipped = r.skipped.filter((x: unknown) => Number.isInteger(x) && (x as number) >= 1 && (x as number) <= TOTAL_LEVELS).slice(0, TOTAL_LEVELS);
  const dl = (r.daily && typeof r.daily === 'object') ? r.daily : {};
  d.daily.lastCompleted = typeof dl.lastCompleted === 'string' ? dl.lastCompleted.slice(0, 10) : '';
  d.daily.streak = Math.floor(num(dl.streak, 0, 0, 100000));
  d.daily.bestStreak = Math.floor(num(dl.bestStreak, 0, 0, 100000));
  if (dl.completed && typeof dl.completed === 'object') for (const [k, v] of Object.entries(dl.completed)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number') d.daily.completed[k] = v;
  // keep unlock consistent with recorded stars
  for (const k of Object.keys(d.stars)) if (d.stars[k] > 0) d.unlockedLevel = Math.max(d.unlockedLevel, Math.min(TOTAL_LEVELS, Number(k) + 1));
  for (const k of d.skipped) d.unlockedLevel = Math.max(d.unlockedLevel, Math.min(TOTAL_LEVELS, k + 1));
  return d;
}

export class SaveSystem {
  data: SaveData;
  /** Optional mirror (portal cloud save). */
  onSave?: (json: string) => void;
  constructor(private backend: SaveBackend = new LocalBackend()) { this.data = this.load(); }
  setBackend(b: SaveBackend) { this.backend = b; this.data = this.load(); }
  load(): SaveData {
    try { const t = this.backend.read(); if (!t) return defaultSave(); return sanitize(JSON.parse(t)); } catch { return defaultSave(); }
  }
  save() { try { const j = JSON.stringify(this.data); this.backend.write(j); this.onSave?.(j); } catch { /* ignore */ } }
  /** Merge a cloud save: take it only if it holds more progress than the local one. */
  mergeRemote(json: string | null) {
    if (!json) return;
    try {
      const r = sanitize(JSON.parse(json)), prog = (d: SaveData) => d.unlockedLevel * 1000 + Object.values(d.stars).reduce((a, b) => a + b, 0);
      if (prog(r) > prog(this.data)) { this.data = r; this.backend.write(JSON.stringify(r)); }
    } catch { /* corrupt remote save: ignore */ }
  }
  reset() { this.data = defaultSave(); this.save(); }
  /** Record today's visit (local calendar day). Returns the streak and whether today is a new day. */
  visitInfo: { streak: number; newDay: boolean } = { streak: 0, newDay: false };
  registerVisit(): { streak: number; newDay: boolean } { return (this.visitInfo = this.computeVisit()); }
  private computeVisit(): { streak: number; newDay: boolean } {
    const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const now = new Date(), today = key(now), y = new Date(now); y.setDate(now.getDate() - 1);
    const v = this.data.visits;
    if (v.last === today) return { streak: v.streak, newDay: false };
    v.streak = v.last === key(y) ? v.streak + 1 : 1; v.best = Math.max(v.best, v.streak); v.last = today; this.save();
    return { streak: v.streak, newDay: true };
  }
  /** Share of the 40 levels finished (or skipped). */
  progressPct() { const done = new Set([...Object.keys(this.data.stars).filter((k) => this.data.stars[k] > 0).map(Number), ...this.data.skipped]); return (done.size / TOTAL_LEVELS) * 100; }
  stars(id: number) { return this.data.stars[String(id)] ?? 0; }
  totalStars() { return Object.values(this.data.stars).reduce((a, b) => a + b, 0); }
  isUnlocked(id: number) { return id <= this.data.unlockedLevel; }
}
export const save = new SaveSystem();
