import { supabase } from "@/lib/supabase";

export interface ErrorStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  component_name?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

export class ErrorTrackingService {
  private getErrorSeverity(error: Error): ErrorLog["severity"] {
    if (error.name === "TypeError" || error.name === "ReferenceError") {
      return "high";
    }
    if (error.name === "NetworkError") {
      return "medium";
    }
    if (error.name === "ValidationError") {
      return "low";
    }
    return "medium";
  }

  async logError(
    error: Error,
    metadata?: {
      componentName?: string;
      userId?: string;
      additionalData?: Record<string, unknown>;
    }
  ) {
    const errorLog: ErrorLog = {
      id: Math.random().toString(36).substring(2),
      message: error.message,
      stack: error.stack,
      component_name: metadata?.componentName,
      user_id: metadata?.userId,
      metadata: metadata?.additionalData,
      severity: this.getErrorSeverity(error),
      timestamp: new Date().toISOString(),
    };

    try {
      const { error: dbError } = await supabase
        .from("error_logs")
        .insert(errorLog);

      if (dbError) {
        console.error("Failed to log error to database:", dbError);
      }
    } catch (e) {
      console.error("Failed to log error:", e);
    }

    return errorLog;
  }

  async getErrorStats(): Promise<ErrorStats> {
    try {
      const { data, error } = await supabase
        .from("error_logs")
        .select("severity")
        .gte(
          "timestamp",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      const stats: ErrorStats = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      data?.forEach((log) => {
        const severity = log.severity as keyof ErrorStats;
        stats[severity]++;
      });

      return stats;
    } catch (error) {
      console.error("Failed to get error stats:", error);
      return {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
    }
  }

  async getRecentErrors(): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get recent errors:", error);
      return [];
    }
  }
}

export const errorTracking = new ErrorTrackingService();
