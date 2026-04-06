import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export default function GalleryManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
  });

  const { data: photosData, refetch } = trpc.gallery.list.useQuery();

  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Bild uppladdad!");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", imageUrl: "", category: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ladda upp bild");
    },
  });

  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      toast.success("Bild uppdaterad!");
      setEditingPhoto(null);
      setFormData({ title: "", description: "", imageUrl: "", category: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera bild");
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Bild borttagen!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort bild");
    },
  });

  const handleCreate = () => {
    if (!formData.imageUrl) {
      toast.error("Vänligen ladda upp en bild");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingPhoto) return;
    updateMutation.mutate({
      id: editingPhoto.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna bild?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (photo: any) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      category: photo.category || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bildgalleri</h2>
          <p className="text-gray-600">Hantera bilder i galleriet</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ladda upp bild
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ladda upp ny bild</DialogTitle>
              <DialogDescription>
                Ladda upp en bild till galleriet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bild *</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
                />
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
                )}
              </div>
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="t.ex. Vårfesten 2023"
                />
              </div>
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beskriv bilden..."
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="t.ex. Evenemang, Historiskt, Medlemmar"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title || !formData.imageUrl}>
                Ladda upp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photosData?.map((photo) => (
          <Card key={photo.id}>
            <CardHeader className="p-0">
              <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg">{photo.title}</CardTitle>
                <div className="flex gap-1">
                  <Dialog open={editingPhoto?.id === photo.id} onOpenChange={(open) => !open && setEditingPhoto(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(photo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Redigera bild</DialogTitle>
                        <DialogDescription>
                          Uppdatera bildinformation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded" />
                        </div>
                        <div>
                          <Label htmlFor="edit-title">Titel *</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                          <Label htmlFor="edit-category">Kategori</Label>
                          <Input
                            id="edit-category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPhoto(null)}>
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
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              {photo.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{photo.description}</p>
              )}
              {photo.category && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {photo.category}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(photo.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
