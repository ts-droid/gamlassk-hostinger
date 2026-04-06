import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { History, RotateCcw } from "lucide-react";
import { useState } from "react";

interface VersionHistoryProps {
  contentId: number;
  onRestore: () => void;
}

export function VersionHistory({ contentId, onRestore }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const { data: history, isLoading } = trpc.cms.getContentHistory.useQuery(
    { contentId },
    { enabled: open }
  );

  const restoreMutation = trpc.cms.restoreContentVersion.useMutation({
    onSuccess: () => {
      toast.success("Version återställd!");
      setOpen(false);
      onRestore();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte återställa version");
    },
  });

  const handleRestore = (historyId: number) => {
    if (confirm("Är du säker på att du vill återställa denna version?")) {
      restoreMutation.mutate({ contentId, historyId });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <History className="h-4 w-4 mr-2" />
        Historik
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Versionshistorik</DialogTitle>
            <DialogDescription>
              Visa och återställ tidigare versioner av detta innehåll
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading && (
              <div className="text-center py-8 text-gray-500">Laddar historik...</div>
            )}

            {!isLoading && (!history || history.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Ingen historik tillgänglig
              </div>
            )}

            {history && history.length > 0 && (
              <div className="space-y-4">
                {history.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {version.userName || "Okänd användare"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString("sv-SE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        disabled={restoreMutation.isPending}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Återställ
                      </Button>
                    </div>

                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm max-h-32 overflow-y-auto">
                      {version.content ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: version.content }}
                          className="prose prose-sm max-w-none"
                        />
                      ) : (
                        <span className="text-gray-400 italic">Tomt innehåll</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Stäng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
