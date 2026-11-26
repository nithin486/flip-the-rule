import { save } from './SaveSystem';

/**
 * Fully procedural audio (WebAudio): zero audio files, zero licensing risk, ~0 bytes of download.
 * SFX are synthesised; music is a small generative sequencer (menu / gameplay variants, per-world root note).
 * Context is created/resumed only after a user gesture.
 */
type Wave = OscillatorType;
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const PENT = [0, 2, 4, 7, 9];
const MINORP = [0, 3, 5, 7, 10];

class AudioSystem {
  private ctx: AudioContext | null = null;
  private master!: GainNode; private sfxBus!: GainNode; private musicBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;
  private timer: number | null = null;
  private track: 'menu' | 'game' | 'none' = 'none';
  private root = 57; private step = 0; private nextTime = 0;
  private duck = 1;
  /** Portal-forced mute (CrazyGames muteAudio): wins over the in-game toggles. */
  platformMuted = false;
  setPlatformMuted(m: boolean) { this.platformMuted = m; this.applySettings(); }

  /** Call from a user gesture. */
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
        this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
        this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.22; this.musicBus.connect(this.master);
        const len = this.ctx.sampleRate * 0.5; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch { this.ctx = null; return; }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.applySettings();
  }
  applySettings() {
    if (!this.ctx) return;
    const s = save.data.settings;
    const pm = this.platformMuted;
    this.sfxBus.gain.value = s.sound && !pm ? 1 : 0;
    this.musicBus.gain.value = s.music && !pm ? 0.22 * this.duck : 0;
    if (s.music && !pm && this.track !== 'none') this.startLoop(); else this.stopLoop();
  }
  /** Mute everything (e.g. while a portal ad is playing). */
  setSuspended(v: boolean) { if (!this.ctx) return; this.master.gain.value = v ? 0 : 0.9; }

  private tone(freq: number, t: number, dur: number, type: Wave = 'sine', vol = 0.3, bus: AudioNode | null = null, slideTo?: number, attack = 0.005) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus ?? this.sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  private noise(t: number, dur: number, vol: number, lp = 2000, hp = 0) {
    if (!this.ctx || !this.noiseBuf) return;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node: AudioNode = f; s.connect(f);
    if (hp) { const h = this.ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; f.connect(h); node = h; }
    node.connect(g); g.connect(this.sfxBus); s.start(t); s.stop(t + dur);
  }

  sfx(name: 'click' | 'flipUp' | 'flipDown' | 'land' | 'star' | 'portal' | 'death' | 'win' | 'checkpoint' | 'switch' | 'collapse' | 'hint' | 'boing' | 'crystal' | 'out', vel = 1) {
    if (!this.ctx || !save.data.settings.sound) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'click': this.tone(660, t, 0.07, 'triangle', 0.25); this.tone(990, t + 0.03, 0.08, 'triangle', 0.18); break;
      case 'flipUp': this.tone(220, t, 0.28, 'sawtooth', 0.12, null, 880); this.tone(440, t, 0.22, 'sine', 0.2, null, 1320); this.noise(t, 0.2, 0.08, 6000, 1500); break;
      case 'flipDown': this.tone(880, t, 0.28, 'sawtooth', 0.12, null, 220); this.tone(1320, t, 0.22, 'sine', 0.2, null, 440); this.noise(t, 0.2, 0.08, 6000, 1500); break;
      case 'land': { const v = Math.min(1, Math.max(0.15, vel)); this.tone(120, t, 0.12, 'sine', 0.35 * v, null, 60); this.noise(t, 0.07, 0.12 * v, 900); break; }
      case 'star': [0, 4, 7, 12].forEach((n, i) => this.tone(midi(76 + n), t + i * 0.06, 0.25, 'triangle', 0.22)); break;
      case 'portal': this.tone(300, t, 0.5, 'sine', 0.25, null, 1200); this.tone(450, t + 0.05, 0.5, 'triangle', 0.15, null, 1800); break;
      case 'death': this.tone(300, t, 0.45, 'sawtooth', 0.2, null, 50); this.noise(t, 0.3, 0.25, 1500); break;
      case 'win': [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => { this.tone(midi(72 + n), t + i * 0.09, 0.4, 'triangle', 0.22); this.tone(midi(60 + n), t + i * 0.09, 0.4, 'sine', 0.12); }); break;
      case 'checkpoint': this.tone(midi(79), t, 0.15, 'triangle', 0.2); this.tone(midi(84), t + 0.1, 0.25, 'triangle', 0.2); break;
      case 'switch': this.tone(200, t, 0.08, 'square', 0.15); this.tone(400, t + 0.06, 0.18, 'square', 0.12); this.noise(t, 0.12, 0.1, 3000); break;
      case 'collapse': this.noise(t, 0.4, 0.3, 700); this.tone(90, t, 0.4, 'sine', 0.3, null, 40); break;
      case 'boing': this.tone(180, t, 0.25, 'sine', 0.3, null, 700); break;
      case 'crystal': [0, 7, 12].forEach((n, i) => this.tone(midi(84 + n), t + i * 0.05, 0.18, 'sine', 0.2)); break;
      case 'out': this.tone(400, t, 0.5, 'square', 0.15, null, 70); this.noise(t, 0.35, 0.2, 1200); break;
      case 'hint': this.tone(midi(84), t, 0.12, 'sine', 0.2); this.tone(midi(88), t + 0.1, 0.2, 'sine', 0.2); break;
    }
  }

  // ---------------- music ----------------
  play(track: 'menu' | 'game', root = 57) {
    this.track = track; this.root = root;
    if (!this.ctx || !save.data.settings.music) return;
    this.startLoop();
  }
  stopMusic() { this.track = 'none'; this.stopLoop(); }
  setDuck(v: number) { this.duck = v; if (this.ctx && save.data.settings.music && !this.platformMuted) this.musicBus.gain.setTargetAtTime(0.22 * v, this.ctx.currentTime, 0.1); }
  private startLoop() {
    if (!this.ctx || this.track === 'none') return;
    this.stopLoop(); this.step = 0; this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 100);
  }
  private stopLoop() { if (this.timer !== null) { clearInterval(this.timer); this.timer = null; } }
  private schedule() {
    if (!this.ctx) return;
    const bpm = this.track === 'menu' ? 96 : 112; const spb = 60 / bpm / 2; // eighth notes
    while (this.nextTime < this.ctx.currentTime + 0.4) {
      const s = this.step, t = this.nextTime, bar = Math.floor(s / 16) % 4, pos = s % 16;
      const scale = this.track === 'menu' ? PENT : (bar % 2 ? PENT : MINORP);
      const prog = [0, 5, 3, 7][bar] % 12; // chord roots (semitones)
      const r = this.root + (this.track === 'menu' ? 12 : 0);
      if (pos % 4 === 0) { this.tone(midi(r - 12 + prog), t, spb * 3.6, 'triangle', 0.5, this.musicBus); }
      if (pos % 2 === 0) { const n = scale[(pos / 2 + bar * 3) % scale.length]; this.tone(midi(r + 12 + prog + n), t, spb * 1.6, 'sine', 0.32, this.musicBus); }
      if (this.track === 'game' && pos % 4 === 2) this.noise(t, 0.05, 0.015, 8000, 5000);
      if (pos === 0 && bar % 2 === 0) { this.tone(midi(r + 24 + prog + scale[bar % scale.length]), t + spb, spb * 5, 'triangle', 0.18, this.musicBus); }
      this.step++; this.nextTime += spb;
    }
  }
}
export const audio = new AudioSystem();
