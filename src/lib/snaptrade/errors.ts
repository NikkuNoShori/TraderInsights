import { SnapTradeErrorCode } from "./types";

export class SnapTradeError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    code: SnapTradeErrorCode,
    status: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "SnapTradeError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
