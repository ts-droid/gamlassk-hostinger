import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// State is now managed outside the Dialog component to persist across open/close cycles
let persistedImportFile: File | null = null;
let persistedImportResult: any = null;

export function MemberImportExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(persistedImportFile);
  const [importResult, setImportResult] = useState<any>(persistedImportResult);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.members.importCSV.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      persistedImportResult = result;
      if (result.success) {
        toast.success(`Importerade ${result.imported} medlemmar!`);
        // Clear file after successful import
        setImportFile(null);
        persistedImportFile = null;
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(`Import misslyckades. ${result.errors.length} fel.`);
      }
    },
    onError: (error) => {
      toast.error("Import misslyckades: " + error.message);
    },
  });

  const exportMutation = trpc.members.exportExcel.useMutation({
    onSuccess: (result) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Medlemslista exporterad!");
    },
    onError: (error) => {
      toast.error("Export misslyckades: " + error.message);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      persistedImportFile = file;
      setImportResult(null);
      persistedImportResult = null;
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Välj en CSV-fil först");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      importMutation.mutate({ csvData });
    };
    reader.readAsText(importFile);
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importera och Exportera Medlemmar</DialogTitle>
          <DialogDescription>
            Hantera medlemsdata i bulk via CSV-import och Excel-export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportera Medlemmar
            </h3>
            <p className="text-sm text-gray-600">
              Exportera alla aktiva medlemmar till en Excel-fil (.xlsx)
            </p>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="w-full"
            >
              {exportMutation.isPending ? "Exporterar..." : "Exportera till Excel"}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Import Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importera Medlemmar
              </h3>
              <p className="text-sm text-gray-600">
                Importera medlemmar från en CSV-fil. Filen kan innehålla följande kolumner:
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                name, email, phone, personnummer, streetAddress, postalCode, city, memberType, joinYear
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Viktigt</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Endast namn är obligatoriskt</strong> - alla andra fält är valfria</li>
                    <li>Tomma fält hoppas över automatiskt</li>
                    <li>Personnummer (om angivet) måste vara i format YYYYMMDD eller YYYYMMDD-XXXX</li>
                    <li>Medlemmar med befintligt personnummer eller e-post hoppas över</li>
                    <li>Medlemsnummer genereras automatiskt</li>
                    <li>memberType kan vara: ordinarie, hedersmedlem, stodmedlem (standard: ordinarie)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="csv-file">Välj CSV-fil</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>

              {importFile && (
                <div className="text-sm text-gray-600">
                  Vald fil: <span className="font-medium">{importFile.name}</span>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!importFile || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? "Importerar..." : "Importera Medlemmar"}
              </Button>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="border-t pt-6">
              <Alert variant={importResult.success ? "default" : "destructive"}>
                {importResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {importResult.success ? "Import lyckades!" : "Import med fel"}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      Importerade: <strong>{importResult.imported}</strong> medlemmar
                    </p>
                    <p>
                      Överhoppade: <strong>{importResult.skipped}</strong> rader
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium mb-2">Fel:</p>
                        <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                          {importResult.errors.map((error: any, index: number) => (
                            <div key={index} className="bg-white/50 p-2 rounded">
                              <span className="font-medium">Rad {error.row}:</span> {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
