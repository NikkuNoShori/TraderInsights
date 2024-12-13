import * as XLSX from 'xlsx';

const stockExample = {
  type: 'stock',
  symbol: 'AAPL',
  direction: 'long',
  entry_date: '2024-01-01T10:30:00Z',
  entry_price: 190.50,
  quantity: 100,
  exit_date: '2024-01-02T15:45:00Z',
  exit_price: 195.75,
  portfolio_id: 'your-portfolio-id',
  notes: 'Earnings play',
};

const optionExample = {
  type: 'option',
  symbol: 'TSLA',
  direction: 'long',
  entry_date: '2024-01-01T10:30:00Z',
  entry_price: 5.50,
  quantity: 10,
  exit_date: '2024-01-02T15:45:00Z',
  exit_price: 7.25,
  portfolio_id: 'your-portfolio-id',
  strike_price: 250.00,
  expiration_date: '2024-02-16T21:00:00Z',
  option_type: 'call',
  notes: 'Weekly options trade',
};

export function generateTradeTemplate(): Blob {
  const worksheet = XLSX.utils.json_to_sheet([stockExample, optionExample]);
  
  // Add column widths
  const colWidths = [
    { wch: 8 },  // type
    { wch: 6 },  // symbol
    { wch: 10 }, // direction
    { wch: 20 }, // entry_date
    { wch: 12 }, // entry_price
    { wch: 10 }, // quantity
    { wch: 20 }, // exit_date
    { wch: 12 }, // exit_price
    { wch: 36 }, // portfolio_id
    { wch: 12 }, // strike_price
    { wch: 20 }, // expiration_date
    { wch: 10 }, // option_type
    { wch: 40 }, // notes
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trade Template');

  // Generate buffer
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
} 