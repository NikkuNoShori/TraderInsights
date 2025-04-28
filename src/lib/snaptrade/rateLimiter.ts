import { StorageHelpers } from './storage';
import { SnapTradeError, SnapTradeErrorCode } from "./types";

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed in the window
  windowMs: number; // Time window in milliseconds
}

interface RateLimitInfo {
  count: number; // Current request count
  resetAt: number; // Timestamp when the window resets
}

export class RateLimiter {
  private static instance: RateLimiter;
  private config: RateLimitConfig;
  private requestTimestamps: number[] = [];

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      const maxRequests = parseInt(
        import.meta.env.VITE_SNAPTRADE_RATE_LIMIT_MAX || "5",
        10
      );
      const windowMinutes = parseInt(
        import.meta.env.VITE_SNAPTRADE_RATE_LIMIT_WINDOW || "15",
        10
      );

      const config = {
        maxRequests,
        windowMs: windowMinutes * 60 * 1000,
      };

      RateLimiter.instance = new RateLimiter(config);
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

  public checkRateLimit(userId: string): {
    allowed: boolean;
    resetAt: number;
    remaining: number;
  } {
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

  private cleanupOldRequests(): void {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );
  }

  async waitForSlot(): Promise<void> {
    this.cleanupOldRequests();

    if (this.requestTimestamps.length >= this.config.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = this.config.windowMs - (Date.now() - oldestRequest);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.cleanupOldRequests();
      }
    }

    this.requestTimestamps.push(Date.now());
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      await this.waitForSlot();
      return await fn();
    } catch (error) {
      if (error instanceof SnapTradeError) {
        throw error;
      }
      throw new SnapTradeError(
        `Rate limit execution failed: ${error}`,
        SnapTradeErrorCode.API_ERROR
      );
    }
  }
}

// Default rate limit configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // Maximum requests per time window
  windowMs: 60000, // 1 minute in milliseconds
};

export const rateLimiter = new RateLimiter(DEFAULT_CONFIG);

// Helper function to create rate-limited API calls
export function withRateLimit<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    return rateLimiter.execute(() => fn(...args));
  };
} 