import type { PlatformAdapter } from './PlatformAdapter';

/**
 * CrazyGames SDK v3 adapter. Only methods documented at docs.crazygames.com/sdk/html5-v3 are used:
 *   SDK.init(), SDK.game.loadingStart/loadingStop/gameplayStart/gameplayStop, SDK.ad.requestAd(type, callbacks).
 * Every call is guarded so the game keeps working if the SDK is missing, blocked or throws.
 * RE-VERIFY against the live docs and test inside the CrazyGames QA tool before submitting.
 */
declare global { interface Window { CrazyGames?: { SDK: any } } }
const SDK_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
const MIN_AD_GAP_MS = 150_000; // do not request mid-roll ads more often than this

export class CrazyGamesAdapter implements PlatformAdapter {
  readonly name = 'crazygames';
  hasAds = true;
  private ready = false;
  private lastAd = Date.now();
  private sdk: any = null;

  static shouldUse(): boolean {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('platform') === 'crazygames') return true;
      if (/crazygames\./i.test(location.hostname)) return true;
      if (window.self !== window.top && /crazygames\./i.test(document.referrer)) return true;
      const ao = (location as any).ancestorOrigins; if (ao) for (let i = 0; i < ao.length; i++) if (/crazygames\./i.test(ao[i])) return true;
      if (window.CrazyGames?.SDK || document.getElementById('cg-sdk')) return true;
    } catch { /* cross-origin access errors */ }
    return false;
  }

  private queue: Array<() => void> = [];
  private settled = false;
  /** Boot waits for this only briefly (see BootScene), but the SDK keeps loading in the background: calls made before it is ready
   *  (loadingStart/Stop, gameplayStart) are queued and replayed so CrazyGames still receives every event (they measure load size/time with them). */
  async init() {
    try {
      await new Promise<void>((res, rej) => {
        if (window.CrazyGames?.SDK) return res();
        // The <head> snippet in index.html normally already started loading the SDK: reuse that tag instead of loading it twice.
        const s = (document.getElementById('cg-sdk') as HTMLScriptElement | null) ?? Object.assign(document.createElement('script'), { src: SDK_URL, async: true });
        s.addEventListener('load', () => res()); s.addEventListener('error', () => rej(new Error('sdk load failed')));
        if (!s.parentNode) document.head.appendChild(s);
        else if (window.CrazyGames?.SDK) res();
        setTimeout(() => rej(new Error('sdk timeout')), 20000);
      });
      this.sdk = window.CrazyGames!.SDK;
      if (this.sdk.environment === 'disabled') throw new Error('SDK disabled on this domain');
      await Promise.race([this.sdk.init(), new Promise((_, rej) => setTimeout(() => rej(new Error('sdk init timeout')), 15000))]);
      this.ready = true; this.settled = true;
      const q = this.queue; this.queue = []; q.forEach((f) => this.safe(f));
    } catch (e) { console.warn('[CrazyGames] SDK unavailable, running without it', e); this.ready = false; this.hasAds = false; this.settled = true; this.queue = []; }
  }
  private safe(fn: () => void) {
    if (!this.ready) { if (!this.settled) this.queue.push(fn); return; }
    try { fn(); } catch (e) { console.warn('[CrazyGames]', e); }
  }
  loadingStart() { this.safe(() => this.sdk.game.loadingStart()); }
  loadingStop() { this.safe(() => this.sdk.game.loadingStop()); }
  gameplayStart() { this.safe(() => this.sdk.game.gameplayStart()); }
  gameplayStop() { this.safe(() => this.sdk.game.gameplayStop()); }
  device() {
    try { const t = this.sdk?.user?.systemInfo?.device?.type; return t === 'mobile' || t === 'tablet' || t === 'desktop' ? t : null; } catch { return null; }
  }
  readRemote() { try { return this.ready ? (this.sdk.data.getItem('save') ?? null) : null; } catch { return null; } }
  writeRemote(v: string) { try { if (this.ready) this.sdk.data.setItem('save', v); } catch { /* ignore */ } }

  private request(type: 'midgame' | 'rewarded', onStart?: () => void): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ready) return resolve(false);
      let done = false, started = false; const finish = (ok: boolean) => { if (!done) { done = true; resolve(ok); } };
      // If no ad actually starts within a few seconds (blocked, no fill, SDK silent) give up fast so the game never feels frozen.
      if (type === 'rewarded') setTimeout(() => { if (!started) finish(false); }, 4000);
      try {
        this.sdk.ad.requestAd(type, {
          adStarted: () => { started = true; onStart?.(); },
          adFinished: () => finish(true),
          adError: () => finish(false),
        });
        setTimeout(() => finish(false), 90_000); // never hang the game on a lost callback
      } catch { finish(false); }
    });
  }
  async requestMidgameAd(onStart?: () => void) {
    if (Date.now() - this.lastAd < MIN_AD_GAP_MS) return;
    await this.request('midgame', onStart); this.lastAd = Date.now();
  }
  async requestRewardedAd(onStart?: () => void) { return this.request('rewarded', onStart); }
}
