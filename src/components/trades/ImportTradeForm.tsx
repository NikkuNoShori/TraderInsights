import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { processFile } from '../../utils/fileProcessing';
import type { ProcessedTradeData } from '../../utils/fileProcessing';

interface ImportTradeFormProps {
  onSuccess: () => void;
}

export const ImportTradeForm: React.FC<ImportTradeFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleProcessedData = async (data: ProcessedTradeData) => {
    if (data.errors.length > 0) {
      setValidationErrors(data.errors);
      throw new Error('Validation failed. Please check the errors below.');
    }

    const batchSize = 100;
    const batches = Math.ceil(data.trades.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batch = data.trades.slice(i * batchSize, (i + 1) * batchSize);
      const { error } = await supabase.from('trades').insert(batch);
      
      if (error) throw error;
      
      setProgress(((i + 1) / batches) * 100);
    }

    toast.success(`Successfully imported ${data.trades.length} trades`);
    onSuccess();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setValidationErrors([]);

    try {
      const processedData = await processFile(file);
      await handleProcessedData(processedData);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import trades');
    } finally {
      setIsProcessing(false);
    }
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