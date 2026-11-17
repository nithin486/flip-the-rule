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
  36: 'No spare flips from here on. Plan every one.',
};
const dir = new URL('./proved/', import.meta.url);
const sol = {}, tg = {};
for (let w = 1; w <= 8; w++) {
  const arr = [];
  for (let i = (w - 1) * 5 + 1; i <= w * 5; i++) {
    const j = JSON.parse(fs.readFileSync(new URL(`L${i}.json`, dir)));
    const l = j.level; l.world = w;
    l.flipLimit += i <= 4 ? 3 : 0; // gentler ramp-up: extra spare flips early (solutions stay valid, 3 stars still need par)
    if (HINTS[i]) l.hint = HINTS[i]; else delete l.hint;
    arr.push(l); sol[i] = j.track; tg[i] = { flipTarget: l.flipTarget, parTime: l.parTime };
  }
  fs.writeFileSync(new URL(`../levels/world${w}.json`, import.meta.url), JSON.stringify(arr, null, 1));
}
fs.writeFileSync(new URL('../levels/solutions.json', import.meta.url), JSON.stringify(sol));
fs.writeFileSync(new URL('./targets.json', import.meta.url), JSON.stringify(tg, null, 1));
console.log(Object.keys(tg).map((i) => `${i}:${tg[i].flipTarget}`).join(' '));
