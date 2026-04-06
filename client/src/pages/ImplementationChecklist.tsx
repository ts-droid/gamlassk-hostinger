import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ImplementationChecklist() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  const { data: tasks, isLoading, refetch } = trpc.implementationTasks.list.useQuery();
  const { data: stats } = trpc.implementationTasks.stats.useQuery();
  const toggleStatus = trpc.implementationTasks.toggleStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Status uppdaterad");
    },
    onError: (error) => {
      toast.error(`Fel: ${error.message}`);
    },
  });

  const isAdmin = user?.role === "admin";

  const handleToggleTask = (taskId: number, currentStatus: string) => {
    if (!isAdmin) {
      toast.error("Endast administratörer kan uppdatera status");
      return;
    }

    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    toggleStatus.mutate({ taskId, status: newStatus });
  };

  const filteredTasks = selectedPhase === "all" 
    ? tasks 
    : tasks?.filter(t => t.phase === selectedPhase);

  const phases = Array.from(new Set(tasks?.map(t => t.phase) || []));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || ""}>
        {priority === "high" ? "Hög" : priority === "medium" ? "Medel" : "Låg"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[oklch(0.98_0.02_250)] to-white py-12">
        <div className="container">
          <div className="text-center">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.98_0.02_250)] to-white py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[oklch(0.25_0.08_250)] mb-2">
            Implementeringsplan
          </h1>
          <p className="text-lg text-gray-600">
            Följ framstegen för utvecklingen av Gamla SSK:s webbplats
          </p>
        </div>

        {/* Overall Progress */}
        {stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Total framsteg</CardTitle>
              <CardDescription>
                {stats.completed} av {stats.total} uppgifter slutförda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Framsteg</span>
                    <span className="text-sm font-medium">{stats.progress}%</span>
                  </div>
                  <Progress value={stats.progress} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Slutförda</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-600">Pågående</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Väntande</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Progress */}
        {stats && stats.phases.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Framsteg per fas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.phases.map((phase) => (
                  <div key={phase.phase}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{phase.phase}</span>
                      <span className="text-sm text-gray-600">
                        {phase.completed}/{phase.total} ({phase.progress}%)
                      </span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Filter */}
        <Tabs value={selectedPhase} onValueChange={setSelectedPhase} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Alla</TabsTrigger>
            {phases.map((phase) => (
              <TabsTrigger key={phase} value={phase}>
                {phase}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks && filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      {isAdmin ? (
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => handleToggleTask(task.id, task.status)}
                          className="w-5 h-5"
                        />
                      ) : (
                        getStatusIcon(task.status)
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`font-semibold text-lg ${task.status === "completed" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          {task.estimatedHours && (
                            <Badge variant="outline">
                              {task.estimatedHours}h
                            </Badge>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">{task.phase}</span>
                        {task.completedAt && (
                          <span>
                            Slutförd: {new Date(task.completedAt).toLocaleDateString("sv-SE")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Inga uppgifter hittades</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Note */}
        {!isAdmin && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tips:</strong> Logga in som administratör för att uppdatera status på uppgifter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
