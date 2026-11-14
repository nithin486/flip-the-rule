import { CrazyGamesAdapter } from './CrazyGamesAdapter';
import { LocalAdapter, type PlatformAdapter } from './PlatformAdapter';
export const platform: PlatformAdapter = CrazyGamesAdapter.shouldUse() ? new CrazyGamesAdapter() : new LocalAdapter();
export type { PlatformAdapter };
