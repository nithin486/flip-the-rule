// Assemble tools/proved/L*.json (hand-designed, solver-proven) into levels/world1-8.json, solutions.json, targets.json
import fs from 'fs';
const HINTS = {
  1: 'Flip gravity with {flip}. Your flips are limited!',
  6: 'Some spikes are hidden until you get close. Expect them on safe-looking landings.',
  11: 'Moving platforms carry you - time your flip to ride them.',
  12: 'Saws patrol the gaps. Watch their rhythm.',
  16: 'Portals link two places. Step in one, come out the other.',
  17: 'Step on the switch to open the gate.',
  18: 'Gravity zones override gravity inside their glow.',
  21: 'Ice keeps your momentum - you will not stop on a dime.',
  22: 'Conveyors drag you along. Use them or fight them.',
  23: 'Bounce pads launch you high. Mind where you land.',
  24: 'Wind pushes you sideways inside its band.',
  26: 'Phase platforms blink in and out. Wait for solid.',
  27: 'Pulsing spikes are safe only half the time.',
  28: 'Flip crystals refill one flip. Collect them on the way.',
  31: 'In a no-flip zone your flip is ignored. Commit before you enter.',
  32: 'Inside a reversed zone, left and right swap.',
  9: 'No spare flips from here on. Plan every one.',
  41: 'Cyan slabs hold you only while gravity points DOWN. Pink ones only while it points UP.',
  43: 'No floor in the middle: hop from colour to colour.',
  46: 'Lasers fire on a beat. Watch them blink, then cross while they are off.',
  48: 'Beams can sweep along the ceiling too.',
  51: 'Dash pads fling you sideways - fast enough to clear a pit.',
  53: 'Some pads throw you LEFT. Flip off them in time.',
  56: 'Orbs flip your gravity for free. They do not count as flips.',
  58: 'An orb flip changes which coloured slabs are solid.',
};
const dir = new URL('./hard/', import.meta.url); // hardened copies of ./proved (tools/harden.mjs)
const sol = {}, tg = {};
/** Spare flips on top of the proven minimum: generous while learning, none on each world's finale. */
const spare = (i) => (i <= 3 ? 2 : i <= 8 ? 1 : 0);
for (let w = 1; w <= 12; w++) {
  const arr = [];
  for (let i = (w - 1) * 5 + 1; i <= w * 5; i++) {
    const j = JSON.parse(fs.readFileSync(new URL(`L${i}.json`, dir)));
    const l = j.level; l.world = w; l.hazards = l.hazards.map(({ auto, ...h }) => h);
    // proveOne wrote limit = (par - crystals taken, min 1) + 1; rebuild it with the difficulty curve
    // (levels 36-40 were proven with SPARE=0, so their stored limit is already the minimum)
    const base = i >= 36 && i <= 40 ? l.flipLimit : Math.max(1, l.flipLimit - 1);
    l.flipLimit = base + spare(i);
    if (HINTS[i]) l.hint = HINTS[i]; else delete l.hint;
    arr.push(l); sol[i] = j.track; tg[i] = { flipTarget: l.flipTarget, parTime: l.parTime };
  }
  fs.writeFileSync(new URL(`../levels/world${w}.json`, import.meta.url), JSON.stringify(arr, null, 1));
}
fs.writeFileSync(new URL('../levels/solutions.json', import.meta.url), JSON.stringify(sol));
fs.writeFileSync(new URL('./targets.json', import.meta.url), JSON.stringify(tg, null, 1));
console.log(Object.keys(tg).map((i) => `${i}:${tg[i].flipTarget}`).join(' '));
