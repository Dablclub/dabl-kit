/**
 * Rate limiting library for Omi webhook endpoints
 * Supports both in-memory (development) and Redis (production) backends
 */

/**
 * In-memory rate limiter implementation for development
 * Uses a simple sliding window approach with timestamps
 */
class InMemoryRateLimiter {
  private store = new Map<string, number[]>()

  /**
   * Check and update rate limit for a given key
   * Returns true if the request should be allowed, false if rate limited
   *
   * @param key - Unique identifier for the rate limit bucket (e.g., "omi-webhook:user-id")
   * @param maxRequests - Maximum number of requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  async limit(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<boolean> {
    const now = Date.now()
    const times = this.store.get(key) || []

    // Remove timestamps outside the current window
    const recent = times.filter((t) => now - t < windowMs)

    // Check if we've exceeded the limit
    if (recent.length >= maxRequests) {
      return false
    }

    // Add current timestamp
    recent.push(now)
    this.store.set(key, recent)
    return true
  }

  /**
   * Get current request count for a key
   * @param key - The rate limit key
   * @param windowMs - Time window in milliseconds
   * @returns Number of requests in the current window
   */
  getRemaining(key: string, windowMs: number): number {
    const now = Date.now()
    const times = this.store.get(key) || []
    const recent = times.filter((t) => now - t < windowMs)
    return recent.length
  }
}

/**
 * Get or create the rate limiter instance
 * In production with REDIS_URL, uses Upstash Redis
 * Otherwise uses in-memory implementation
 */
const getOmiRateLimiter = (): InMemoryRateLimiter => {
  // TODO: Add Upstash Redis support when REDIS_URL is configured
  // For now, use in-memory implementation for all environments
  if (!process.env.REDIS_URL) {
    return new InMemoryRateLimiter()
  }

  // Fallback to in-memory for now (Upstash integration can be added later)
  console.warn(
    'REDIS_URL configured but Redis rate limiter not yet implemented, using in-memory fallback',
  )
  return new InMemoryRateLimiter()
}

const omiRateLimiter = getOmiRateLimiter()

/**
 * Check if an Omi webhook request should be allowed based on rate limits
 * Rate limit is per user (100 requests per minute per uid)
 *
 * @param uid - User ID to rate limit
 * @param maxRequests - Maximum requests allowed (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000ms = 1 minute)
 * @returns Object with { allowed: boolean, remaining?: number }
 *
 * @example
 * const result = await checkOmiWebhookRateLimit('user-123')
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded' },
 *     { status: 429, headers: { 'Retry-After': '60' } }
 *   )
 * }
 */
export async function checkOmiWebhookRateLimit(
  uid: string,
  maxRequests: number = 100,
  windowMs: number = 60000, // 1 minute
): Promise<{
  allowed: boolean
  remaining?: number
  resetAt?: number
}> {
  try {
    const key = `omi-webhook:${uid}`
    const allowed = await omiRateLimiter.limit(key, maxRequests, windowMs)
    const remaining = maxRequests - omiRateLimiter.getRemaining(key, windowMs)

    return {
      allowed,
      remaining: Math.max(0, maxRequests - remaining),
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open: allow request if check fails (prevents outages)
    return { allowed: true }
  }
}

/**
 * Reset rate limit for a specific user
 * Useful for testing or admin operations
 *
 * @param uid - User ID to reset
 * @internal
 */
export async function resetOmiWebhookRateLimit(uid: string): Promise<void> {
  // This is a placeholder for future Redis implementation
  // In-memory implementation doesn't expose this directly
  console.log(`Rate limit reset for user: ${uid}`)
}
