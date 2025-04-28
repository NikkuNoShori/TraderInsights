import { AxiosError } from "axios";
import { SnapTradeError, SnapTradeErrorCode } from "./types";

export function handleError(error: unknown): SnapTradeError {
  if (error instanceof SnapTradeError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        return new SnapTradeError(
          "Authentication failed",
          SnapTradeErrorCode.NOT_AUTHENTICATED,
          401
        );
      case 403:
        return new SnapTradeError(
          "Invalid credentials",
          SnapTradeErrorCode.INVALID_CREDENTIALS,
          403
        );
      case 429:
        return new SnapTradeError(
          "Rate limit exceeded",
          SnapTradeErrorCode.RATE_LIMIT_ERROR,
          429
        );
      default:
        return new SnapTradeError(
          message || "API request failed",
          SnapTradeErrorCode.API_ERROR,
          status || 500
        );
    }
  }

  if (error instanceof Error) {
    return new SnapTradeError(
      error.message,
      SnapTradeErrorCode.UNKNOWN_ERROR,
      500
    );
  }

  return new SnapTradeError(
    "An unknown error occurred",
    SnapTradeErrorCode.UNKNOWN_ERROR,
    500
  );
}

export class ErrorHandler {
  static handleError(error: unknown, context: string): never {
    if (error instanceof SnapTradeError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new SnapTradeError(
        `${context}: ${error.message}`,
        SnapTradeErrorCode.API_ERROR
      );
    }

    throw new SnapTradeError(
      `${context}: Unknown error occurred`,
      SnapTradeErrorCode.UNKNOWN_ERROR
    );
  }

  static isAuthError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      (error.code === SnapTradeErrorCode.NOT_AUTHENTICATED ||
        error.code === SnapTradeErrorCode.INVALID_CREDENTIALS)
    );
  }

  static isConfigError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.CONFIGURATION_ERROR
    );
  }

  static isStorageError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.STORAGE_ERROR
    );
  }

  static isApiError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.API_ERROR
    );
  }

  static createError(
    message: string,
    code: SnapTradeErrorCode
  ): SnapTradeError {
    return new SnapTradeError(message, code);
  }

  static wrapError(error: unknown, context: string): SnapTradeError {
    if (error instanceof SnapTradeError) {
      return error;
    }

    if (error instanceof Error) {
      return new SnapTradeError(
        `${context}: ${error.message}`,
        SnapTradeErrorCode.API_ERROR
      );
    }

    return new SnapTradeError(
      `${context}: Unknown error occurred`,
      SnapTradeErrorCode.UNKNOWN_ERROR
    );
  }
}

// Helper functions for common error scenarios
export const errorHelpers = {
  handleAuthError: (error: unknown, context: string): never => {
    if (ErrorHandler.isAuthError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },

  handleConfigError: (error: unknown, context: string): never => {
    if (ErrorHandler.isConfigError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },

  handleStorageError: (error: unknown, context: string): never => {
    if (ErrorHandler.isStorageError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },

  handleApiError: (error: unknown, context: string): never => {
    if (ErrorHandler.isApiError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },
};
