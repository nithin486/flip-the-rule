// Level authoring DSL. Coordinates: platforms top-left; points are centres. T = platform thickness.
export const T = 28;
export const P = (x, y, width, height = T, extra = {}) => ({ x, y, width, height, ...extra });
export const MP = (x, y, width, dx, dy, period, phase = 0) => P(x, y, width, T, { kind: 'moving', path: { dx, dy, period, phase } });
export const FP = (x, y, width) => P(x, y, width, T, { kind: 'falling' });
export const spikeUp = (x, topY, width) => ({ type: 'spike', x, y: topY - 14, width, dir: 'up' });
export const spikeDown = (x, bottomY, width) => ({ type: 'spike', x, y: bottomY, width, dir: 'down' });
export const saw = (x, y, dx = 0, dy = 0, period = 4, phase = 0, r = 22) => ({ type: 'saw', x, y, r, ...(dx || dy ? { path: { dx, dy, period, phase } } : {}) });
export const L = (id, name, o) => ({
  id, world: Math.ceil(id / 5), name,
  ...(o.hint ? { hint: o.hint } : {}),
  playerStart: { x: o.start[0], y: o.start[1] }, gravity: o.grav ?? 'down', flipTarget: o.flips ?? 2,
  ...(o.star ? { collectible: { x: o.star[0], y: o.star[1] } } : {}),
  exit: { x: o.exit[0], y: o.exit[1], ...(o.exitSwitch ? { switch: o.exitSwitch } : {}) },
  platforms: o.plats, hazards: o.haz ?? [],
  ...(o.cps ? { checkpoints: o.cps.map(([x, y]) => ({ x, y })) } : {}),
  ...(o.switches ? { switches: o.switches } : {}), ...(o.doors ? { doors: o.doors } : {}),
  ...(o.portals ? { portals: o.portals } : {}), ...(o.zones ? { zones: o.zones } : {}),
  ...(o.refills ? { refills: o.refills.map(([x, y]) => ({ x, y })) } : {}),
});

// v3 extras
export const hSpikeUp = (x, topY, width) => ({ ...spikeUp(x, topY, width), hidden: true });
export const hSpikeDown = (x, bottomY, width) => ({ ...spikeDown(x, bottomY, width), hidden: true });
export const hSaw = (x, y, dx = 0, dy = 0, period = 4, phase = 0, r = 22) => ({ ...saw(x, y, dx, dy, period, phase, r), hidden: true });
export const pSpikeUp = (x, topY, width, period = 3, phase = 0) => ({ ...spikeUp(x, topY, width), period, phase });
export const pSpikeDown = (x, bottomY, width, period = 3, phase = 0) => ({ ...spikeDown(x, bottomY, width), period, phase });
export const PH = (x, y, width, period = 3, phase = 0) => P(x, y, width, T, { kind: 'phase', period, phase });
export const ICE = (x, y, width) => P(x, y, width, T, { kind: 'ice' });
export const CONV = (x, y, width, speed) => P(x, y, width, T, { kind: 'conveyor', speed });
export const BOUNCE = (x, y, width) => P(x, y, width, T, { kind: 'bounce' });
export const lockZone = (x, y, width, height) => ({ x, y, width, height, kind: 'lock' });
export const reverseZone = (x, y, width, height) => ({ x, y, width, height, kind: 'reverse' });
export const windZone = (x, y, width, height, wind) => ({ x, y, width, height, kind: 'wind', wind });
export const gravZone = (x, y, width, height, gravity) => ({ x, y, width, height, gravity });
