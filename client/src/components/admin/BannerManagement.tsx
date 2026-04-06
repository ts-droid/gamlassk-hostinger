import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const BANNER_TYPES = [
  { value: "info", label: "Information", color: "bg-blue-100 text-blue-800" },
  { value: "warning", label: "Varning", color: "bg-yellow-100 text-yellow-800" },
  { value: "success", label: "Framgång", color: "bg-green-100 text-green-800" },
  { value: "event", label: "Evenemang", color: "bg-purple-100 text-purple-800" },
  { value: "announcement", label: "Meddelande", color: "bg-gray-100 text-gray-800" },
];

const BANNER_POSITIONS = [
  { value: "top", label: "Toppen av sidan" },
  { value: "hero", label: "Hero-sektion" },
  { value: "sidebar", label: "Sidofält" },
];

export function BannerManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as const,
    position: "top" as const,
    linkUrl: "",
    linkText: "",
    startDate: "",
    endDate: "",
    order: 0,
  });

  const { data: banners, isLoading, refetch } = trpc.banners.listAll.useQuery();
  const createBanner = trpc.banners.create.useMutation({
    onSuccess: () => {
      toast.success("Banner skapad!");
      refetch();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Fel: ${error.message}`);
    },
  });

  const updateBanner = trpc.banners.update.useMutation({
    onSuccess: () => {
      toast.success("Banner uppdaterad!");
      refetch();
      setEditingBanner(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Fel: ${error.message}`);
    },
  });

  const deleteBanner = trpc.banners.delete.useMutation({
    onSuccess: () => {
      toast.success("Banner raderad!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fel: ${error.message}`);
    },
  });

  const toggleActive = trpc.banners.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Banner-status uppdaterad!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fel: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      position: "top",
      linkUrl: "",
      linkText: "",
      startDate: "",
      endDate: "",
      order: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    if (editingBanner) {
      updateBanner.mutate({ id: editingBanner.id, ...payload });
    } else {
      createBanner.mutate(payload);
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      content: banner.content,
      type: banner.type,
      position: banner.position,
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : "",
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : "",
      order: banner.order,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill radera denna banner?")) {
      deleteBanner.mutate({ id });
    }
  };

  const getBannerTypeColor = (type: string) => {
    return BANNER_TYPES.find(t => t.value === type)?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <div>Laddar banners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Banner-hantering</h2>
          <p className="text-muted-foreground">Skapa och hantera banners för webbplatsen</p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingBanner} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingBanner(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Skapa banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Redigera banner" : "Skapa ny banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Innehåll</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value: any) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkUrl">Länk (valfritt)</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="linkText">Länktext (valfritt)</Label>
                  <Input
                    id="linkText"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="Läs mer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Startdatum (valfritt)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Slutdatum (valfritt)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="order">Prioritet (lägre = högre prioritet)</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingBanner(null);
                  resetForm();
                }}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
                  {editingBanner ? "Uppdatera" : "Skapa"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {!banners || banners.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Inga banners än. Skapa din första banner!</p>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner: any) => (
            <Card key={banner.id} className={`${!banner.active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{banner.title}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBannerTypeColor(banner.type)}`}>
                        {BANNER_TYPES.find(t => t.value === banner.type)?.label}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {BANNER_POSITIONS.find(p => p.value === banner.position)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{banner.content}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {banner.startDate && <span>Start: {new Date(banner.startDate).toLocaleString('sv-SE')}</span>}
                      {banner.endDate && <span>Slut: {new Date(banner.endDate).toLocaleString('sv-SE')}</span>}
                      <span>Prioritet: {banner.order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive.mutate({ id: banner.id, active: banner.active ? 0 : 1 })}
                    >
                      {banner.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
