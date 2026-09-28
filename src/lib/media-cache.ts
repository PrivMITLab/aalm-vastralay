/**
 * 👑 AALM VASTRALAY — IN-MEMORY MEDIA ASSET CACHE
 *
 * Lightweight TTL + LRU cache to prevent repeated database and B2 queries
 * for recently accessed media assets in serverless / Node.js runtimes.
 */

export interface CachedMediaAsset {
  id: string;
  fileId: string | null;
  fileName: string;
  servableUrl: string;
  sizeBytes: number;
  mimeType: string;
  source: string;
  folder: string;
  uploadedBy: string | null;
  createdAt: Date;
}

const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  asset: CachedMediaAsset;
  expiresAt: number;
}

class MediaMemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, asset: CachedMediaAsset): void {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      asset,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  get(key: string): CachedMediaAsset | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.asset;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const mediaCache = new MediaMemoryCache();
