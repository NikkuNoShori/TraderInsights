import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

export const fileValidator = z.object({
  size: z.number().max(MAX_FILE_SIZE, "File size must be less than 5MB"),
  type: z.enum(ALLOWED_FILE_TYPES as [string, ...string[]], {
    message: "File must be .xlsx, .xls, or .csv",
  }),
});

export function sanitizeTradeData(data: unknown) {
  // Remove any potentially harmful content
  if (typeof data !== "object" || !data) return null;

  // Only allow specific keys
  const allowedKeys = [
    "symbol",
    "type",
    "direction",
    "entry_date",
    "entry_price",
    "quantity",
    "exit_date",
    "exit_price",
    "portfolio_id",
    "strike_price",
    "expiration_date",
    "option_type",
    "notes",
  ];

  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>)
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.replace(/[<>]/g, "") : value,
      ]),
  );
}
