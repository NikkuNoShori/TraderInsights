import { supabase } from "../supabase";

interface LoginAttempt {
  ip: string;
  timestamp: number;
  success: boolean;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

class AuthRateLimitService {
  private attempts: Map<string, LoginAttempt[]> = new Map();

  private cleanOldAttempts(ip: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(ip) || [];
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < ATTEMPT_WINDOW
    );
    this.attempts.set(ip, recentAttempts);
  }

  private isLockedOut(ip: string): boolean {
    this.cleanOldAttempts(ip);
    const attempts = this.attempts.get(ip) || [];
    const failedAttempts = attempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= MAX_ATTEMPTS) {
      const mostRecentFailure = Math.max(
        ...failedAttempts.map((a) => a.timestamp)
      );
      const timeSinceLastFailure = Date.now() - mostRecentFailure;
      return timeSinceLastFailure < LOCKOUT_DURATION;
    }

    return false;
  }

  private getRemainingAttempts(ip: string): number {
    this.cleanOldAttempts(ip);
    const attempts = this.attempts.get(ip) || [];
    const failedAttempts = attempts.filter((attempt) => !attempt.success);
    return Math.max(0, MAX_ATTEMPTS - failedAttempts.length);
  }

  private getLockoutRemainingTime(ip: string): number {
    const attempts = this.attempts.get(ip) || [];
    const failedAttempts = attempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= MAX_ATTEMPTS) {
      const mostRecentFailure = Math.max(
        ...failedAttempts.map((a) => a.timestamp)
      );
      return Math.max(0, LOCKOUT_DURATION - (Date.now() - mostRecentFailure));
    }

    return 0;
  }

  async recordLoginAttempt(ip: string, success: boolean): Promise<void> {
    this.cleanOldAttempts(ip);

    const attempts = this.attempts.get(ip) || [];
    attempts.push({
      ip,
      timestamp: Date.now(),
      success,
    });

    this.attempts.set(ip, attempts);

    // Log the attempt in the database for monitoring
    try {
      await supabase.from("auth_attempts").insert({
        ip_address: ip,
        success,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log auth attempt:", error);
    }
  }

  async checkLoginAllowed(ip: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockoutRemaining: number;
  }> {
    if (this.isLockedOut(ip)) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutRemaining: this.getLockoutRemainingTime(ip),
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.getRemainingAttempts(ip),
      lockoutRemaining: 0,
    };
  }

  // For monitoring and analytics
  async getLoginAttempts(
    ip: string,
    timeWindow: number = ATTEMPT_WINDOW
  ): Promise<LoginAttempt[]> {
    this.cleanOldAttempts(ip);
    const attempts = this.attempts.get(ip) || [];
    const now = Date.now();
    return attempts.filter((attempt) => now - attempt.timestamp < timeWindow);
  }
}

export const authRateLimit = new AuthRateLimitService();
