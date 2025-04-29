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
        return new SnapTradeError({
          message: "Authentication failed",
          code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          originalError: error,
        });
      case 403:
        return new SnapTradeError({
          message: "Invalid credentials",
          code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          originalError: error,
        });
      case 429:
        return new SnapTradeError({
          message: "Rate limit exceeded",
          code: SnapTradeErrorCode.API_ERROR,
          originalError: error,
        });
      default:
        return new SnapTradeError({
          message: message || "API request failed",
          code: SnapTradeErrorCode.API_ERROR,
          originalError: error,
        });
    }
  }

  if (error instanceof Error) {
    return new SnapTradeError({
      message: error.message,
      code: SnapTradeErrorCode.API_ERROR,
      originalError: error,
    });
  }

  return new SnapTradeError({
    message: "An unknown error occurred",
    code: SnapTradeErrorCode.API_ERROR,
  });
}

export class ErrorHandler {
  static handleError(error: unknown, context: string): never {
    if (error instanceof SnapTradeError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new SnapTradeError({
        message: `${context}: ${error.message}`,
        code: SnapTradeErrorCode.API_ERROR,
        originalError: error,
      });
    }

    throw new SnapTradeError({
      message: `${context}: Unknown error occurred`,
      code: SnapTradeErrorCode.API_ERROR,
    });
  }

  static isAuthError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.AUTHENTICATION_ERROR
    );
  }

  static isApiError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.API_ERROR
    );
  }

  static isNetworkError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.NETWORK_ERROR
    );
  }

  static isValidationError(error: unknown): boolean {
    return (
      error instanceof SnapTradeError &&
      error.code === SnapTradeErrorCode.VALIDATION_ERROR
    );
  }

  static createError(
    message: string,
    code: SnapTradeErrorCode,
    originalError?: unknown
  ): SnapTradeError {
    return new SnapTradeError({ message, code, originalError });
  }

  static wrapError(error: unknown, context: string): SnapTradeError {
    if (error instanceof SnapTradeError) {
      return error;
    }

    if (error instanceof Error) {
      return new SnapTradeError({
        message: `${context}: ${error.message}`,
        code: SnapTradeErrorCode.API_ERROR,
        originalError: error,
      });
    }

    return new SnapTradeError({
      message: `${context}: Unknown error occurred`,
      code: SnapTradeErrorCode.API_ERROR,
    });
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

  handleApiError: (error: unknown, context: string): never => {
    if (ErrorHandler.isApiError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },

  handleNetworkError: (error: unknown, context: string): never => {
    if (ErrorHandler.isNetworkError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },

  handleValidationError: (error: unknown, context: string): never => {
    if (ErrorHandler.isValidationError(error)) {
      throw error;
    }
    throw ErrorHandler.wrapError(error, context);
  },
};
