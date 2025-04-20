import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2 } from 'lucide-react';

export function DataSettings() {
  const handleImport = () => {
    // TODO: Implement data import
    console.log('Import data');
  };

  const handleExport = () => {
    // TODO: Implement data export
    console.log('Export data');
  };

  const handleClear = () => {
    // TODO: Implement data clear
    console.log('Clear data');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Import/Export</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Import or export your trade data
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleImport}
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Clear Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete all your trade data
          </p>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
            Clear All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 