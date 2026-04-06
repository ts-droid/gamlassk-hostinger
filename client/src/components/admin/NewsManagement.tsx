import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function NewsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    publishedAt: new Date().toISOString().slice(0, 16),
  });

  const utils = trpc.useUtils();
  const { data: newsList, isLoading } = trpc.news.list.useQuery();
  
  const createMutation = trpc.news.create.useMutation({
    onSuccess: () => {
      toast.success("Nyheten har skapats!");
      utils.news.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Kunde inte skapa nyhet: " + error.message);
    },
  });

  const updateMutation = trpc.news.update.useMutation({
    onSuccess: () => {
      toast.success("Nyheten har uppdaterats!");
      utils.news.list.invalidate();
      setEditingNews(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera nyhet: " + error.message);
    },
  });

  const deleteMutation = trpc.news.delete.useMutation({
    onSuccess: () => {
      toast.success("Nyheten har raderats!");
      utils.news.list.invalidate();
    },
    onError: (error) => {
      toast.error("Kunde inte radera nyhet: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      publishedAt: new Date().toISOString().slice(0, 16),
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      publishedAt: new Date(formData.publishedAt),
    });
  };

  const handleUpdate = () => {
    if (!editingNews) return;
    updateMutation.mutate({
      id: editingNews.id,
      ...formData,
      publishedAt: new Date(formData.publishedAt),
    });
  };

  const handleEdit = (news: any) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      imageUrl: news.imageUrl || "",
      publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill radera denna nyhet?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <div>Laddar nyheter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nyhetshantering</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingNews(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Skapa nyhet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Skapa ny nyhet</DialogTitle>
              <DialogDescription>Fyll i informationen för den nya nyheten</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Rubrik</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <RichTextEditor
                label="Innehåll"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />
              <div>
                <Label htmlFor="publishedAt">Publiceringsdatum</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Avbryt</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Skapar..." : "Skapa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingNews} onOpenChange={(open) => !open && setEditingNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redigera nyhet</DialogTitle>
            <DialogDescription>Uppdatera informationen för nyheten</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Rubrik</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <RichTextEditor
              label="Innehåll"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
            <div>
              <Label htmlFor="edit-publishedAt">Publiceringsdatum</Label>
              <Input
                id="edit-publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNews(null)}>Avbryt</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Uppdaterar..." : "Uppdatera"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {newsList?.map((news) => (
          <Card key={news.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{news.title}</CardTitle>
                  <CardDescription>
                    Publicerad: {news.publishedAt ? new Date(news.publishedAt).toLocaleString("sv-SE") : "Ej publicerad"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(news)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(news.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{news.content}</p>
              {news.imageUrl && (
                <img src={news.imageUrl} alt={news.title} className="mt-4 rounded-md max-h-48 object-cover" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
