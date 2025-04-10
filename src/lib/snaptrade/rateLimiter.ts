import { StorageHelpers } from './storage';

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed in the window
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitInfo {
  count: number;        // Current request count
  resetAt: number;      // Timestamp when the window resets
}

export class RateLimiter {
  private static instance: RateLimiter;
  private config: RateLimitConfig;

  private constructor() {
    // Get rate limit configuration from environment variables
    const maxRequests = parseInt(
      import.meta.env.VITE_SNAPTRADE_RATE_LIMIT_MAX || "5",
      10
    );
    const windowMinutes = parseInt(
      import.meta.env.VITE_SNAPTRADE_RATE_LIMIT_WINDOW || "15",
      10
    );

    this.config = {
      maxRequests,
      windowMs: windowMinutes * 60 * 1000,
    };
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public setConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private getStorageKey(userId: string): string {
    return `rate_limit:${userId}`;
  }

  private getRateLimitInfo(userId: string): RateLimitInfo {
    const key = this.getStorageKey(userId);
    const stored = StorageHelpers.getItem(key);
    
    if (!stored) {
      return {
        count: 0,
        resetAt: Date.now() + this.config.windowMs,
      };
    }

    return JSON.parse(stored);
  }

  private saveRateLimitInfo(userId: string, info: RateLimitInfo): void {
    const key = this.getStorageKey(userId);
    StorageHelpers.setItem(key, JSON.stringify(info));
  }

  public checkRateLimit(userId: string): { allowed: boolean; resetAt: number; remaining: number } {
    const now = Date.now();
    let info = this.getRateLimitInfo(userId);

    // Reset if window has expired
    if (now >= info.resetAt) {
      info = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
    }

    const allowed = info.count < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - info.count);

    return {
      allowed,
      resetAt: info.resetAt,
      remaining,
    };
  }

  public incrementRequestCount(userId: string): void {
    const now = Date.now();
    let info = this.getRateLimitInfo(userId);

    // Reset if window has expired
    if (now >= info.resetAt) {
      info = {
        count: 1,
        resetAt: now + this.config.windowMs,
      };
    } else {
      info.count += 1;
    }

    this.saveRateLimitInfo(userId, info);
  }

  public getRemainingRequests(userId: string): number {
    const { remaining } = this.checkRateLimit(userId);
    return remaining;
  }

  public getTimeUntilReset(userId: string): number {
    const { resetAt } = this.checkRateLimit(userId);
    return Math.max(0, resetAt - Date.now());
  }
} 