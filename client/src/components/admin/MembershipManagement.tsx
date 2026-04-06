import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function MembershipManagement() {
  const utils = trpc.useUtils();
  const { data: applications, isLoading } = trpc.membership.list.useQuery();

  const updateStatusMutation = trpc.membership.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status uppdaterad!");
      utils.membership.list.invalidate();
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera status: " + error.message);
    },
  });

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return <div>Laddar medlemsansökningar...</div>;
  }

  const pendingApplications = applications?.filter((app) => app.status === "pending") || [];
  const processedApplications = applications?.filter((app) => app.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Medlemsansökningar</h2>
        
        {pendingApplications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Väntande ansökningar</h3>
            <div className="grid gap-4">
              {pendingApplications.map((app) => (
                <Card key={app.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>
                          {app.email} {app.phone && `• ${app.phone}`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100">
                        Väntande
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {app.message && (
                      <p className="text-sm text-gray-700 mb-4">{app.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-4">
                      Inlämnad: {new Date(app.createdAt).toLocaleString("sv-SE")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(app.id, "approved")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Godkänn
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(app.id, "rejected")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Avslå
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {processedApplications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Behandlade ansökningar</h3>
            <div className="grid gap-4">
              {processedApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>
                          {app.email} {app.phone && `• ${app.phone}`}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={app.status === "approved" ? "default" : "destructive"}
                      >
                        {app.status === "approved" ? "Godkänd" : "Avslagen"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {app.message && (
                      <p className="text-sm text-gray-700 mb-2">{app.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Inlämnad: {new Date(app.createdAt).toLocaleString("sv-SE")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {applications?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Inga medlemsansökningar ännu
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
