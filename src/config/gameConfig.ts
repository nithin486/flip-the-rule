// Central tuning + design tokens. Physics values follow the spec's starting targets.
export const W = 960;
export const H = 540;

export const PHYS = {
  moveAccel: 900,        // px/s^2 horizontal acceleration (ground)
  airAccel: 700,         // air control
  maxSpeedX: 260,        // px/s
  friction: 1200,        // px/s^2 ground friction when no input
  airFriction: 220,      // px/s^2 in air
  gravity: 1000,         // px/s^2
  maxSpeedY: 650,        // px/s terminal velocity
  flipCooldownMs: 200,   // input cooldown between flips
  step: 1 / 60,          // fixed update
  radius: 17,            // player body radius
} as const;

export const COLORS = {
  purple: 0x7c3aed, blue: 0x3b82f6, cyan: 0x06b6d4, gold: 0xfbbf24,
  green: 0x22c55e, red: 0xef4444, dark: 0x0b0b1a, white: 0xffffff,
};
export const HEX = {
  purple: '#7C3AED', blue: '#3B82F6', cyan: '#06B6D4', gold: '#FBBF24',
  green: '#22C55E', red: '#EF4444', dark: '#0B0B1A', white: '#FFFFFF',
};

export const FONT_HEAD = "'Baloo 2', 'Trebuchet MS', 'Segoe UI', sans-serif";
export const FONT_BODY = "Poppins, 'Segoe UI', Arial, sans-serif";

export const SAVE_KEY = 'upside-down-run.save';
export const SAVE_VERSION = 1;

export interface WorldTheme {
  id: number; name: string; first: number; last: number; blurb: string;
  skyTop: number; skyBottom: number; rock: number; rim: number; accent: number; root: number;
}
export const WORLDS: WorldTheme[] = [
  { id: 1, name: 'Floating Islands', first: 1, last: 5, blurb: 'Flip between floor and ceiling', skyTop: 0x050419, skyBottom: 0x2b1a78, rock: 0x1b1450, rim: 0x8be9ff, accent: 0x7c5cff, root: 57 },
  { id: 2, name: 'Dangerous Heights', first: 6, last: 10, blurb: 'Two floors, spikes, one star', skyTop: 0x12040e, skyBottom: 0x7a1233, rock: 0x3a0b22, rim: 0xff7a93, accent: 0xff3d5a, root: 55 },
  { id: 3, name: 'Moving World', first: 11, last: 15, blurb: 'Nothing stands still', skyTop: 0x021419, skyBottom: 0x07607a, rock: 0x062c38, rim: 0x5cf2ff, accent: 0x12d6f0, root: 60 },
  { id: 4, name: 'Portal Dimension', first: 16, last: 20, blurb: 'Portals, switches and gates', skyTop: 0x12041f, skyBottom: 0x7a1a93, rock: 0x2e0a45, rim: 0xff8cf2, accent: 0xe040fb, root: 52 },
  { id: 5, name: 'Slick Summit', first: 21, last: 25, blurb: 'Ice, conveyors, bounce pads', skyTop: 0x04121f, skyBottom: 0x1e6fb0, rock: 0x0f3552, rim: 0xb6f0ff, accent: 0x4cc9ff, root: 59 },
  { id: 6, name: 'Crystal Caverns', first: 26, last: 30, blurb: 'Flip crystals and pulse spikes', skyTop: 0x02140f, skyBottom: 0x0b6b57, rock: 0x073a30, rim: 0x6dffd2, accent: 0x1de9b6, root: 54 },
  { id: 7, name: 'Chaos Engine', first: 31, last: 35, blurb: 'Everything at once', skyTop: 0x160603, skyBottom: 0x93310c, rock: 0x45180a, rim: 0xffb86b, accent: 0xff7a1a, root: 53 },
  { id: 8, name: 'Gravity Master', first: 36, last: 40, blurb: 'Only masters finish', skyTop: 0x050505, skyBottom: 0x4a3200, rock: 0x241a05, rim: 0xffe36b, accent: 0xffc400, root: 50 },
  { id: 9, name: 'Polarity Park', first: 41, last: 45, blurb: 'Cyan holds you down, pink holds you up', skyTop: 0x04061c, skyBottom: 0x223a8f, rock: 0x161a46, rim: 0x9ff3ff, accent: 0x22d3ee, root: 56 },
  { id: 10, name: 'Laser Lab', first: 46, last: 50, blurb: 'Beams fire on a beat', skyTop: 0x0b0410, skyBottom: 0x6b1035, rock: 0x2c0f22, rim: 0xff8aa5, accent: 0xff2d55, root: 51 },
  { id: 11, name: 'Dash Drive', first: 51, last: 55, blurb: 'Dash pads fling you sideways', skyTop: 0x140612, skyBottom: 0xb04a1a, rock: 0x3d1b0b, rim: 0xffc58a, accent: 0xff8a3d, root: 58 },
  { id: 12, name: 'Orb Odyssey', first: 56, last: 60, blurb: 'Orbs flip you for free', skyTop: 0x040313, skyBottom: 0x3e1d93, rock: 0x1d1442, rim: 0xd8c8ff, accent: 0xa855f7, root: 49 },
];
export const TOTAL_LEVELS = 60;
export const worldOfLevel = (id: number): WorldTheme => WORLDS.find((w) => id >= w.first && id <= w.last) ?? WORLDS[0];
