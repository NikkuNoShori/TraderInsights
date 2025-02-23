import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

interface ImportTradeFormProps {
  onSuccess: () => void;
}

// Validation schemas
const baseTradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
  entry_date: z.string().datetime({ message: 'Invalid entry date format' }),
  entry_price: z.number().positive('Entry price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  direction: z.enum(['long', 'short']),
  portfolio_id: z.string().uuid('Invalid portfolio ID'),
  notes: z.string().optional(),
  exit_date: z.string().datetime().optional(),
  exit_price: z.number().positive().optional(),
});

const optionTradeSchema = baseTradeSchema.extend({
  type: z.literal('option'),
  strike_price: z.number().positive('Strike price must be positive'),
  expiration_date: z.string().datetime('Invalid expiration date'),
  option_type: z.enum(['call', 'put']),
});

const stockTradeSchema = baseTradeSchema.extend({
  type: z.literal('stock'),
});

const tradeSchema = z.discriminatedUnion('type', [stockTradeSchema, optionTradeSchema]);

export const ImportTradeForm: React.FC<ImportTradeFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateTradeData = (data: unknown[]): z.infer<typeof tradeSchema>[] => {
    const errors: string[] = [];
    const validTrades = data.map((row, index) => {
      try {
        // Sanitize and transform data
        const sanitizedRow = {
          ...row,
          symbol: String(row.symbol).toUpperCase(),
          entry_price: Number(row.entry_price),
          quantity: Number(row.quantity),
          strike_price: row.strike_price ? Number(row.strike_price) : undefined,
        };
        return tradeSchema.parse(sanitizedRow);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Row ${index + 1}: ${error.errors.map(e => e.message).join(', ')}`);
        }
        return null;
      }
    }).filter((trade): trade is z.infer<typeof tradeSchema> => trade !== null);

    setValidationErrors(errors);
    return validTrades;
  };

  const processFile = async (buffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Validate data
      const validTrades = validateTradeData(jsonData);
      
      if (validationErrors.length > 0) {
        throw new Error('Validation failed. Please check the errors below.');
      }

      // Process trades in batches
      const batchSize = 100;
      const batches = Math.ceil(validTrades.length / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const batch = validTrades.slice(i * batchSize, (i + 1) * batchSize);
        const { error } = await supabase.from('trades').insert(batch);
        
        if (error) throw error;
        
        setProgress(((i + 1) / batches) * 100);
      }

      toast.success(`Successfully imported ${validTrades.length} trades`);
      onSuccess();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import trades');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        await processFile(buffer);
      } catch (error) {
        console.error('File reading error:', error);
        toast.error('Failed to read file');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="space-y-4">
      <div className="bg-light-paper dark:bg-dark-bg p-8 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border">
        <div {...getRootProps()} className={cn(
          "text-center cursor-pointer",
          isProcessing && "pointer-events-none opacity-50"
        )}>
          <input {...getInputProps()} />
          <FileSpreadsheet className="mx-auto h-12 w-12 text-light-primary dark:text-dark-primary" />
          {isDragActive ? (
            <p className="mt-2 text-light-text dark:text-dark-text">
              Drop the file here...
            </p>
          ) : (
            <>
              <p className="mt-2 text-light-text dark:text-dark-text">
                Drag & drop your trade data file here
              </p>
              <p className="text-sm text-light-muted dark:text-dark-muted">
                or click to select file
              </p>
            </>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-light-muted dark:text-dark-muted text-center">
            Processing trades... {Math.round(progress)}%
          </p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-2">
            <AlertCircle className="h-4 w-4" />
            <h4 className="font-medium">Validation Errors</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2 text-sm text-light-muted dark:text-dark-muted">
        <h4 className="font-medium text-light-text dark:text-dark-text">
          Import Requirements:
        </h4>
        <ul className="list-disc list-inside space-y-1">
          <li>File must be .xlsx, .xls, or .csv format</li>
          <li>First row must contain column headers</li>
          <li>Required columns: symbol, type, direction, entry_date, entry_price, quantity</li>
          <li>Optional columns: exit_date, exit_price, notes</li>
          <li>For options: strike_price, expiration_date, option_type (call/put)</li>
        </ul>
      </div>

      <Button
        onClick={() => window.open('/template.xlsx')}
        variant="outline"
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        Download Template
      </Button>
    </div>
  );
}; 