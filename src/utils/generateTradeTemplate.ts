import type { Workbook, Cell } from "exceljs";

const stockExample = {
  type: "stock",
  symbol: "AAPL",
  direction: "long",
  entry_date: "2024-01-01T10:30:00Z",
  entry_price: 190.5,
  quantity: 100,
  exit_date: "2024-01-02T15:45:00Z",
  exit_price: 195.75,
  portfolio_id: "your-portfolio-id",
  notes: "Earnings play",
};

const optionExample = {
  type: "option",
  symbol: "TSLA",
  direction: "long",
  entry_date: "2024-01-01T10:30:00Z",
  entry_price: 5.5,
  quantity: 10,
  exit_date: "2024-01-02T15:45:00Z",
  exit_price: 7.25,
  portfolio_id: "your-portfolio-id",
  strike_price: 250.0,
  expiration_date: "2024-02-16T21:00:00Z",
  option_type: "call",
  notes: "Weekly options trade",
};

export async function generateTradeTemplate(): Promise<Blob> {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Trade Template");

  // Add column headers and set widths
  const columns = [
    { header: "type", width: 8 },
    { header: "symbol", width: 6 },
    { header: "direction", width: 10 },
    { header: "entry_date", width: 20 },
    { header: "entry_price", width: 12 },
    { header: "quantity", width: 10 },
    { header: "exit_date", width: 20 },
    { header: "exit_price", width: 12 },
    { header: "portfolio_id", width: 36 },
    { header: "strike_price", width: 12 },
    { header: "expiration_date", width: 20 },
    { header: "option_type", width: 10 },
    { header: "notes", width: 40 },
  ];

  worksheet.columns = columns;

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add example data
  worksheet.addRow(Object.values(stockExample));
  worksheet.addRow(Object.values(optionExample));

  // Add data validation
  worksheet
    .getColumn("type")
    .eachCell({ includeEmpty: false }, (cell: Cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"stock,option"'],
      };
    });

  worksheet
    .getColumn("direction")
    .eachCell({ includeEmpty: false }, (cell: Cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"long,short"'],
      };
    });

  worksheet
    .getColumn("option_type")
    .eachCell({ includeEmpty: false }, (cell: Cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"call,put"'],
      };
    });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
