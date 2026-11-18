/** Everything portal-specific lives behind this interface. */
export interface PlatformAdapter {
  readonly name: string;
  init(): Promise<void>;
  loadingStart(): void;
  loadingStop(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  /** Natural-break (between levels) ad. Always resolves, even if no ad is shown or ads are blocked. */
  requestMidgameAd(onStart?: () => void): Promise<void>;
  /** Player-initiated rewarded ad. Resolves true if the reward should be granted. */
  requestRewardedAd(onStart?: () => void): Promise<boolean>;
  readonly hasAds: boolean;
  /** Device class from the portal SDK (CrazyGames forbids touch-sniffing); null = unknown, fall back to own detection. */
  device(): 'mobile' | 'tablet' | 'desktop' | null;
  /** Portal cloud save (CrazyGames Data module). */
  readRemote(): string | null;
  writeRemote(v: string): void;
}

export class LocalAdapter implements PlatformAdapter {
  readonly name = 'local';
  readonly hasAds = false;
  async init() {}
  device() { return null; } readRemote() { return null; } writeRemote(_v: string) {}
  loadingStart() {} loadingStop() {} gameplayStart() {} gameplayStop() {}
  async requestMidgameAd() {}
  async requestRewardedAd() { return true; } // no ads locally: hint is free
}
