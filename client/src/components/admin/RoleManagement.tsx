import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Plus, Pencil, Trash2 } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_all", label: "Hantera allt", description: "Full åtkomst till alla funktioner" },
  { id: "manage_roles", label: "Hantera roller", description: "Skapa, redigera och ta bort roller" },
  { id: "manage_users", label: "Hantera användare", description: "Tilldela roller till användare" },
  { id: "manage_news", label: "Hantera nyheter", description: "Skapa, redigera och ta bort nyheter" },
  { id: "manage_members", label: "Hantera medlemmar", description: "Godkänna och hantera medlemsansökningar" },
  { id: "view_members", label: "Visa medlemmar", description: "Se medlemsregister med kontaktuppgifter" },
];

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function RoleManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const { data: rolesData, refetch } = trpc.roles.list.useQuery();
  const createMutation = trpc.roles.create.useMutation({
    onSuccess: () => {
      toast.success("Roll skapad!");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", permissions: [] });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skapa roll");
    },
  });

  const updateMutation = trpc.roles.update.useMutation({
    onSuccess: () => {
      toast.success("Roll uppdaterad!");
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: [] });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera roll");
    },
  });

  const deleteMutation = trpc.roles.delete.useMutation({
    onSuccess: () => {
      toast.success("Roll borttagen!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort roll");
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingRole) return;
    updateMutation.mutate({
      id: editingRole.id,
      ...formData,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna roll?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: normalizePermissions(role.permissions),
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rollhantering</h2>
          <p className="text-gray-600">Hantera roller och behörigheter</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Skapa ny roll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Skapa ny roll</DialogTitle>
              <DialogDescription>
                Skapa en anpassad roll med specifika behörigheter
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rollnamn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="t.ex. eventadmin"
                />
              </div>
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beskriv rollens ansvar och behörigheter"
                />
              </div>
              <div>
                <Label>Behörigheter *</Label>
                <div className="space-y-3 mt-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {permission.label}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || formData.permissions.length === 0}>
                Skapa roll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rolesData?.map((role) => (
          <Card 
            key={role.id}
            className="cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => handleEdit(role)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.name}
                      {role.isCustom === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Systemroll
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role.isCustom === 1 ? (
                    <>
                    <Dialog open={editingRole?.id === role.id} onOpenChange={(open) => !open && setEditingRole(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Redigera roll</DialogTitle>
                          <DialogDescription>
                            Uppdatera rollens namn, beskrivning och behörigheter
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Rollnamn *</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Beskrivning</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Behörigheter *</Label>
                            <div className="space-y-3 mt-2">
                              {AVAILABLE_PERMISSIONS.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                  <Checkbox
                                    id={`edit-${permission.id}`}
                                    checked={formData.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`edit-${permission.id}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {permission.label}
                                    </label>
                                    <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingRole(null)}>
                            Avbryt
                          </Button>
                          <Button onClick={handleUpdate}>
                            Spara ändringar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                    </>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(role);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {normalizePermissions(role.permissions).map((permission) => {
                  const permDef = AVAILABLE_PERMISSIONS.find(p => p.id === permission);
                  return (
                    <span
                      key={permission}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                    >
                      {permDef?.label || permission}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
