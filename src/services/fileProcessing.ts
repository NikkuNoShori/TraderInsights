import * as XLSX from "xlsx";
import { parse } from "papaparse";
import type {
  Trade,
  TradeType,
  TradeSide,
  TradeStatus,
  OptionDetails,
} from "@/types/trade";

interface ProcessedTradeData {
  trades: Partial<Trade>[];
  errors: string[];
}

type ProgressCallback = (progress: number) => void;

interface RawTradeData {
  symbol: string;
  quantity: string | number;
  price: string | number;
  type?: TradeType;
  side?: TradeSide;
  date?: string;
  time?: string;
  notes?: string;
  status?: TradeStatus;
  option_details?: {
    strike: string | number;
    expiration: string;
    option_type: "call" | "put";
  };
}

export async function processTradeFile(
  file: File,
  onProgress: ProgressCallback,
): Promise<ProcessedTradeData> {
  const fileType = file.name.split(".").pop()?.toLowerCase();

  try {
    onProgress(0.1);

    let data: RawTradeData[] = [];

    if (fileType === "csv") {
      data = await processCsvFile(file);
    } else if (fileType === "xlsx" || fileType === "xls") {
      data = await processExcelFile(file);
    } else {
      throw new Error("Unsupported file type");
    }

    onProgress(0.5);

    const { trades, errors } = validateAndTransformTrades(data);

    onProgress(1);

    return { trades, errors };
  } catch (error) {
    throw new Error(
      `Failed to process file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

async function processCsvFile(file: File): Promise<RawTradeData[]> {
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as RawTradeData[]),
      error: (error) => reject(error),
    });
  });
}

async function processExcelFile(file: File): Promise<RawTradeData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData as RawTradeData[]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

function validateAndTransformTrades(data: RawTradeData[]): {
  trades: Partial<Trade>[];
  errors: string[];
} {
  const trades: Partial<Trade>[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    try {
      const trade = transformRowToTrade(row);
      trades.push(trade);
    } catch (error) {
      errors.push(
        `Row ${index + 1}: ${
          error instanceof Error ? error.message : "Invalid data"
        }`,
      );
    }
  });

  return { trades, errors };
}

function transformRowToTrade(row: RawTradeData): Partial<Trade> {
  if (!row.symbol) throw new Error("Symbol is required");
  if (!row.quantity) throw new Error("Quantity is required");
  if (!row.price) throw new Error("Price is required");

  const trade: Partial<Trade> = {
    symbol: row.symbol.toUpperCase(),
    quantity: Number(row.quantity),
    price: Number(row.price),
    type: (row.type || "stock") as TradeType,
    side: (row.side || "Long") as TradeSide,
    date: row.date || new Date().toISOString().split("T")[0],
    time: row.time || new Date().toTimeString().split(" ")[0],
    entry_date: row.date || new Date().toISOString(),
    notes: row.notes || "",
    status: (row.status || "open") as TradeStatus,
    total: Number(row.quantity) * Number(row.price),
    entry_price: Number(row.price),
  };

  if (row.option_details) {
    const optionDetails: OptionDetails = {
      strike: Number(row.option_details.strike),
      expiration: row.option_details.expiration,
      option_type: row.option_details.option_type,
      contract_type: row.option_details.option_type,
    };
    trade.option_details = optionDetails;
  }

  return trade;
} 