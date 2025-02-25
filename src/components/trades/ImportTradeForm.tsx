import { Upload } from "lucide-react";
import { useState, useCallback } from "@/lib/react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/utils";
import { processTradeFile } from "@/lib/services/fileProcessing";
import type { Trade } from "@/types/trade";
import { useTradeStore } from "@/stores/tradeStore";

interface ImportTradeFormProps {
  onClose: () => void;
}

interface FileProcessingResult {
  trades: Partial<Trade>[];
  errors: string[];
}

export function ImportTradeForm({ onClose }: ImportTradeFormProps) {
  const { user } = useAuthStore();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { importTrades } = useTradeStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setProgress(0);
      setValidationErrors([]);

      try {
        const file = acceptedFiles[0];
        const data: FileProcessingResult = await processTradeFile(file, (progress: number) => {
          setProgress(Math.round(progress * 100));
        });

        if (data.errors.length > 0) {
          setValidationErrors(data.errors);
          return;
        }

        importTrades(data.trades);
        toast.addToast("Successfully imported trades", "success");
      } catch (error) {
        console.error("Import error:", error);
        toast.addToast(
          error instanceof Error ? error.message : "Failed to import trades",
          "error",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [importTrades, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200",
          isDragActive ? "border-primary bg-primary/10" : "border-border"
        )}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="space-y-2">
            <div className="text-sm">Processing file...</div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <div className="space-y-2">
            <p>Drag and drop a trade file here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, XLSX, XLS
            </p>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Validation Errors</h4>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setValidationErrors([])}
          disabled={validationErrors.length === 0}
        >
          Clear Errors
        </Button>
      </div>

      <div className="space-y-2 text-sm text-light-muted dark:text-dark-muted">
        <h4 className="font-medium text-light-text dark:text-dark-text">
          Import Requirements:
        </h4>
        <ul className="list-disc list-inside space-y-1">
          <li>File must be .xlsx, .xls, or .csv format</li>
          <li>First row must contain column headers</li>
          <li>
            Required columns: symbol, type, side, entry_date, entry_price,
            quantity
          </li>
          <li>Optional columns: exit_date, exit_price, notes</li>
          <li>
            For options: strike_price, expiration_date, option_type (call/put)
          </li>
        </ul>
      </div>

      <Button
        onClick={() => window.open("/template.xlsx")}
        variant="outline"
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        Download Template
      </Button>
    </div>
  );
}
