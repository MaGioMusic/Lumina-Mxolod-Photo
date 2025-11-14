import { HttpError } from '@/lib/repo/errors';

type Bucket = number[];

const buckets = new Map<string, Bucket>();

const now = () => Date.now();

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the window.
   */
  limit: number;
  /**
   * Window size in milliseconds.
   */
  windowMs: number;
  /**
   * Optional feature label to improve error messages/logging.
   */
  feature?: string;
}

const DEFAULTS: RateLimitOptions = {
  limit: 20,
  windowMs: 60_000,
};

/**
 * Minimal in-memory rate limiter suitable for local development / single instance demos.
 *
 * TODO: Replace with a shared/distributed rate limiter (Redis, Upstash, etc.) before production.
 */
export const enforceRateLimit = (key: string, options?: Partial<RateLimitOptions>) => {
  const config: RateLimitOptions = { ...DEFAULTS, ...(options ?? {}) };
  const nowMs = now();

  const timestamps = buckets.get(key) ?? [];
  const fresh = timestamps.filter((ts) => nowMs - ts <= config.windowMs);

  if (fresh.length >= config.limit) {
    const feature = config.feature ?? 'request';
    throw new HttpError(`Too many ${feature}s`, 429, 'RATE_LIMITED');
  }

  fresh.push(nowMs);
  buckets.set(key, fresh);
};


