/**
 * ==============================================================================
 * INDOPHARM — SLIDING-WINDOW API RATE LIMITER
 * ==============================================================================
 * Protects authentication endpoints (login, password reset) and financial endpoints
 * against brute-force attacks and credential stuffing (Golden Rule 17).
 * ==============================================================================
 */

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Timestamp in milliseconds
  retryAfterSeconds?: number;
}

interface RequestRecord {
  timestamps: number[];
}

const RATE_LIMIT_STORE = new Map<string, RequestRecord>();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of RATE_LIMIT_STORE.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 3600 * 1000);
    if (record.timestamps.length === 0) {
      RATE_LIMIT_STORE.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Checks and records a request against a sliding-window rate limit.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const threshold = now - windowMs;

  let record = RATE_LIMIT_STORE.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    RATE_LIMIT_STORE.set(identifier, record);
  }

  // Filter out timestamps older than the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > threshold);

  if (record.timestamps.length >= options.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = options.maxRequests - record.timestamps.length;
  const resetTime = now + windowMs;

  return {
    allowed: true,
    remaining,
    resetTime,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets rate limit tracking for an identifier or clears entire store.
 */
export function resetRateLimit(identifier?: string): void {
  if (identifier) {
    RATE_LIMIT_STORE.delete(identifier);
  } else {
    RATE_LIMIT_STORE.clear();
  }
}

