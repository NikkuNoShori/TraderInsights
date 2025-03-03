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
    },
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

    console.error("Error logged:", errorLog);
    return errorLog;
  }

  async getErrorStats(): Promise<ErrorStats> {
    // TODO: Implement actual error stats fetching
    return {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
  }

  async getRecentErrors(): Promise<ErrorLog[]> {
    // TODO: Implement actual error logs fetching
    return [];
  }
}

export const errorTracking = new ErrorTrackingService();
