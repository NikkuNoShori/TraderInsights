import type { Trade } from "@/types/trade";
import { TradeImportError } from "./errorHandler";
import { sanitizeTradeData } from "./fileValidation";
import type { Row, Workbook, Worksheet } from "exceljs";
import type { ParseResult, ParseConfig } from "papaparse";

export interface ProcessedTradeData {
  trades: Trade[];
  errors: string[];
}

export const processExcel = async (file: File): Promise<ProcessedTradeData> => {
  try {
    const ExcelJS = await import("exceljs");
    const workbook: Workbook = new ExcelJS.Workbook();

    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new TradeImportError("No worksheet found in the Excel file");
    }

    const headers = worksheet.getRow(1).values as string[];
    const trades: Trade[] = [];
    const errors: string[] = [];

    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (rowNumber === 1) return; // Skip headers

      try {
        const rowData = row.values as unknown[];
        const trade = headers.reduce(
          (acc: Record<string, unknown>, header: string, index: number) => {
            if (header) {
              acc[header.toLowerCase().trim()] = rowData[index];
            }
            return acc;
          },
          {},
        );

        const sanitizedTrade = sanitizeTradeData(trade);
        if (sanitizedTrade) {
          trades.push(sanitizedTrade as unknown as Trade);
        }
      } catch (error) {
        errors.push(
          `Row ${rowNumber}: ${
            error instanceof Error ? error.message : "Invalid data"
          }`,
        );
      }
    });

    return { trades, errors };
  } catch (error) {
    throw new TradeImportError(
      `Failed to process Excel file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

export const processCsv = async (file: File): Promise<ProcessedTradeData> => {
  try {
    const Papa = await import("papaparse");

    return new Promise((resolve, reject) => {
      Papa.default.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<Record<string, unknown>>) => {
          const trades: Trade[] = [];
          const errors: string[] = [];

          results.data.forEach((row, index) => {
            try {
              const sanitizedTrade = sanitizeTradeData(row);
              if (sanitizedTrade) {
                trades.push(sanitizedTrade as unknown as Trade);
              }
            } catch (error) {
              errors.push(
                `Row ${index + 2}: ${
                  error instanceof Error ? error.message : "Invalid data"
                }`,
              );
            }
          });

          resolve({ trades, errors });
        },
        error: (error: Error) => {
          reject(
            new TradeImportError(`Failed to parse CSV file: ${error.message}`),
          );
        },
      });
    });
  } catch (error) {
    throw new TradeImportError(
      `Failed to process CSV file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

export const processFile = async (file: File): Promise<ProcessedTradeData> => {
  const fileType = file.name.split(".").pop()?.toLowerCase();

  switch (fileType) {
    case "csv":
      return processCsv(file);
    case "xlsx":
    case "xls":
      return processExcel(file);
    default:
      throw new TradeImportError(`Unsupported file type: ${fileType}`);
  }
};
