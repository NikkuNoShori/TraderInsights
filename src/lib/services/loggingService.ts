import {
  createDebugLogger,
  type DebugCategory,
  type DebugLevel,
} from "@/stores/debugStore";
import { ErrorTrackingService } from "./errorTracking";

export class LoggingService {
  private static instance: LoggingService;
  private errorService: ErrorTrackingService;
  private debugLoggers: Map<
    DebugCategory,
    ReturnType<typeof createDebugLogger>
  >;

  private constructor() {
    this.errorService = new ErrorTrackingService();
    this.debugLoggers = new Map();
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private getDebugLogger(category: DebugCategory) {
    if (!this.debugLoggers.has(category)) {
      this.debugLoggers.set(category, createDebugLogger(category));
    }
    return this.debugLoggers.get(category)!;
  }

  public debug(category: DebugCategory, message: string, ...args: any[]) {
    this.getDebugLogger(category).debug(message, ...args);
  }

  public info(category: DebugCategory, message: string, ...args: any[]) {
    this.getDebugLogger(category).info(message, ...args);
  }

  public warn(category: DebugCategory, message: string, ...args: any[]) {
    this.getDebugLogger(category).warn(message, ...args);
  }

  public error(
    category: DebugCategory,
    error: Error,
    metadata?: {
      componentName?: string;
      userId?: string;
      additionalData?: Record<string, unknown>;
    }
  ) {
    this.getDebugLogger(category).error(error.message, error);
    this.errorService.logError(error, metadata);
  }

  public async getErrorStats() {
    return this.errorService.getErrorStats();
  }

  public async getRecentErrors() {
    return this.errorService.getRecentErrors();
  }
}

export const logger = LoggingService.getInstance();
