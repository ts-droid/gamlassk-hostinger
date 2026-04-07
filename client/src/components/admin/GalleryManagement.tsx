import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function tagsToInput(value: unknown) {
  return normalizeTags(value).join(", ");
}

export default function GalleryManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    album: "",
    tagsInput: "",
  });

  const { data: photosData, refetch } = trpc.gallery.list.useQuery();
  const albums = Array.from(
    new Set((photosData || []).map((photo) => photo.category).filter(Boolean))
  ) as string[];
  const knownTags = Array.from(
    new Set((photosData || []).flatMap((photo) => normalizeTags(photo.tags)))
  );

  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Bild uppladdad!");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", imageUrl: "", album: "", tagsInput: "" });
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
      setFormData({ title: "", description: "", imageUrl: "", album: "", tagsInput: "" });
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

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl,
      category: formData.album || undefined,
      tags: normalizeTags(formData.tagsInput),
    });
  };

  const handleUpdate = () => {
    if (!editingPhoto) return;

    updateMutation.mutate({
      id: editingPhoto.id,
      title: formData.title,
      description: formData.description || undefined,
      category: formData.album || undefined,
      tags: normalizeTags(formData.tagsInput),
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
      album: photo.category || "",
      tagsInput: tagsToInput(photo.tags),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bildgalleri</h2>
          <p className="text-gray-600">Hantera bilder, album och taggar i galleriet</p>
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
                Ladda upp en bild, placera den i ett album och märk upp den med taggar.
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
                  <img src={formData.imageUrl} alt="Preview" className="mt-2 h-48 w-full rounded object-cover" />
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
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  list="gallery-albums"
                  value={formData.album}
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  placeholder="t.ex. Vårfest 2024"
                />
                <datalist id="gallery-albums">
                  {albums.map((album) => (
                    <option key={album} value={album} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="tags">Taggar</Label>
                <Input
                  id="tags"
                  list="gallery-tags"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="t.ex. 2024, Södertälje, spelare"
                />
                <datalist id="gallery-tags">
                  {knownTags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-500">Separera flera taggar med komma.</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {photosData?.map((photo) => (
          <Card key={photo.id}>
            <CardHeader className="p-0">
              <img src={photo.imageUrl} alt={photo.title} className="h-48 w-full object-cover" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between">
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
                          Uppdatera titel, album och taggar för bilden.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <img src={formData.imageUrl} alt="Preview" className="h-48 w-full rounded object-cover" />
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
                          <Label htmlFor="edit-album">Album</Label>
                          <Input
                            id="edit-album"
                            list="gallery-albums"
                            value={formData.album}
                            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-tags">Taggar</Label>
                          <Input
                            id="edit-tags"
                            list="gallery-tags"
                            value={formData.tagsInput}
                            onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
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
              {photo.description ? (
                <p className="mb-2 line-clamp-2 text-sm text-gray-600">{photo.description}</p>
              ) : null}
              {photo.category ? (
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  Album: {photo.category}
                </span>
              ) : null}
              {normalizeTags(photo.tags).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {normalizeTags(photo.tags).map((tag) => (
                    <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-gray-500">
                {new Date(photo.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
