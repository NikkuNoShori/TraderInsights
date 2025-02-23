import { supabase } from "../supabase";

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

export interface ErrorStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export class ErrorTrackingService {
  private async logToDatabase(error: ErrorLog) {
    try {
      const { error: dbError } = await supabase
        .from("error_logs")
        .insert([error]);

      if (dbError) {
        console.error("Failed to log error to database:", dbError);
      }
    } catch (e) {
      console.error("Error logging service failed:", e);
    }
  }

  private getErrorSeverity(error: Error): ErrorLog["severity"] {
    if (
      error.message.includes("auth") ||
      error.message.includes("permission")
    ) {
      return "high";
    }
    if (
      error.message.includes("network") ||
      error.message.includes("timeout")
    ) {
      return "medium";
    }
    return "low";
  }

  async logError(
    error: Error,
    metadata?: {
      componentName?: string;
      userId?: string;
      additionalData?: Record<string, unknown>;
    }
  ) {
    try {
      const errorLog: Omit<ErrorLog, "id"> = {
        message: error.message,
        stack: error.stack,
        component_name: metadata?.componentName,
        user_id: metadata?.userId,
        metadata: metadata?.additionalData,
        severity: this.getErrorSeverity(error),
        timestamp: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from("error_logs")
        .insert([errorLog]);

      if (dbError) throw dbError;

      console.log("Error logged successfully");
    } catch (err) {
      console.error("Failed to log error:", err);
    }
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
      console.error("Error fetching error stats:", error);
      return { low: 0, medium: 0, high: 0, critical: 0 };
    }
  }

  async getRecentErrors(): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching recent errors:", error);
      return [];
    }
  }
}

export const errorTracking = new ErrorTrackingService();
