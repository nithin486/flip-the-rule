export type GravityDir = 'up' | 'down';
export interface Vec { x: number; y: number }
export interface PathDef { dx: number; dy: number; period: number; phase?: number }

export interface PlatformDef {
  x: number; y: number; width: number; height: number; // top-left
  kind?: 'solid' | 'falling' | 'moving' | 'ice' | 'conveyor' | 'bounce' | 'phase'; period?: number; phase?: number;
  path?: PathDef;
  speed?: number; // conveyor belt speed, px/s (signed)
}
export interface SpikeDef { type: 'spike'; x: number; y: number; width: number; dir: 'up' | 'down' | 'left' | 'right'; period?: number; phase?: number; hidden?: boolean } // period => pulsing: dangerous for the first half of each cycle // x,y = top-left of the base strip
export interface SawDef { type: 'saw'; x: number; y: number; r?: number; path?: PathDef; hidden?: boolean } // x,y centre
export type HazardDef = SpikeDef | SawDef;
export interface SwitchDef { id: string; x: number; y: number; dir?: 'up' | 'down' }
export interface DoorDef { switch: string; x: number; y: number; width: number; height: number; bridge?: boolean }
export interface PortalDef { id: string; x: number; y: number; pair: string }
export interface ZoneDef { x: number; y: number; width: number; height: number; gravity?: GravityDir; kind?: 'gravity' | 'lock' | 'reverse' | 'wind'; wind?: number }
export interface CheckpointDef { x: number; y: number }

export interface LevelData {
  id: number; world: number; name: string;
  hint?: string;
  playerStart: Vec;
  gravity: GravityDir;
  flipTarget: number;   // par: perfect-star flip count (verified minimum)
  flipLimit?: number;   // hard cap: one flip more and you are out (restart/checkpoint)
  parTime?: number; // seconds, light time bonus reference
  collectible?: Vec;
  refills?: Vec[];      // flip crystals: +1 flip each
  exit: Vec & { switch?: string };
  platforms: PlatformDef[];
  hazards: HazardDef[];
  checkpoints?: CheckpointDef[];
  switches?: SwitchDef[];
  doors?: DoorDef[];
  portals?: PortalDef[];
  zones?: ZoneDef[];
}

export interface SaveData {
  version: number;
  unlockedLevel: number;
  stars: Record<string, number>;
  bestScores: Record<string, number>;
  bestTimes: Record<string, number>;
  bestFlips: Record<string, number>;
  totalScore: number;
  settings: { music: boolean; sound: boolean; reduceMotion: boolean; touchControls: 'auto' | 'on' | 'off' };
  daily: { lastCompleted: string; streak: number; bestStreak: number; completed: Record<string, number> };
}

export interface LevelResult {
  levelId: number; daily: boolean;
  flips: number; time: number; collected: boolean;
  stars: number; score: number; breakdown: { base: number; star: number; efficiency: number; time: number };
  newBest: boolean;
}
