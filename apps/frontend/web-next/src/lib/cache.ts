/**
 * Simple in-memory cache with TTL for client-side data caching.
 * This cache persists across navigation since it's at module level.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// Default TTL: 30 seconds
const DEFAULT_TTL = 30 * 1000;

/**
 * Get a cached value if it exists and hasn't expired.
 */
export function getFromCache<T>(key: string, ttlMs: number = DEFAULT_TTL): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.timestamp > ttlMs;
  
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store a value in the cache.
 */
export function setInCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string): void {
  // If exact match, delete it
  if (cache.has(keyOrPrefix)) {
    cache.delete(keyOrPrefix);
    return;
  }

  // Otherwise, delete all keys starting with prefix
  for (const key of cache.keys()) {
    if (key.startsWith(keyOrPrefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Helper to fetch with caching. Returns cached data if available,
 * otherwise calls the fetch function and caches the result.
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const cached = getFromCache<T>(key, ttlMs);
  
  if (cached !== null) {
    return cached;
  }

  const data = await fetchFn();
  setInCache(key, data);
  return data;
}
