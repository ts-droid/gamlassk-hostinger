import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Download, Eye, Edit } from "lucide-react";

const CATEGORY_LABELS = {
  stadgar: "Stadgar",
  protokoll: "Protokoll",
  informationsblad: "Informationsblad",
  arsmoten: "Årsmöten",
  ovrigt: "Övrigt",
};

const ACCESS_LEVEL_LABELS = {
  public: "Publik (alla kan se)",
  members_only: "Endast medlemmar",
  admin_only: "Endast admins",
};

export default function DocumentManagement() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ovrigt" as keyof typeof CATEGORY_LABELS,
    accessLevel: "members_only" as keyof typeof ACCESS_LEVEL_LABELS,
    file: null as File | null,
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "ovrigt" as keyof typeof CATEGORY_LABELS,
    accessLevel: "members_only" as keyof typeof ACCESS_LEVEL_LABELS,
  });

  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery();
  const uploadMutation = trpc.documents.upload.useMutation();
  const updateMutation = trpc.documents.update.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error("Endast PDF-filer är tillåtna");
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Filen är för stor (max 10MB)");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.title) {
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const fileData = base64.split(',')[1]; // Remove data:application/pdf;base64, prefix

        await uploadMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          fileData,
          fileName: formData.file!.name,
          fileSize: formData.file!.size,
          category: formData.category,
          accessLevel: formData.accessLevel,
        });

        toast.success("Dokument uppladdat!");
        setIsUploadOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "ovrigt",
          accessLevel: "members_only",
          file: null,
        });
        refetch();
      };
      reader.readAsDataURL(formData.file);
    } catch (error: any) {
      toast.error(error.message || "Kunde inte ladda upp dokument");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setEditFormData({
      title: doc.title,
      description: doc.description || "",
      category: doc.category,
      accessLevel: doc.accessLevel,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingDoc || !editFormData.title) {
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingDoc.id,
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        accessLevel: editFormData.accessLevel,
      });
      toast.success("Dokument uppdaterat!");
      setIsEditOpen(false);
      setEditingDoc(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Kunde inte uppdatera dokument");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort "${title}"?`)) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Dokument borttaget");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Kunde inte ta bort dokument");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('sv-SE');
  };

  if (isLoading) {
    return <div className="p-8">Laddar dokument...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dokumenthantering</h2>
          <p className="text-muted-foreground">Ladda upp och hantera PDF-dokument</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Ladda upp dokument
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ladda upp PDF-dokument</DialogTitle>
              <DialogDescription>
                Fyll i information och välj en PDF-fil att ladda upp (max 10MB).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="T.ex. Stadgar 2024"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Valfri beskrivning av dokumentet"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessLevel">Åtkomstnivå *</Label>
                <Select value={formData.accessLevel} onValueChange={(value: any) => setFormData({ ...formData, accessLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCESS_LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">PDF-fil *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploading}>
                Avbryt
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !formData.file || !formData.title}>
                {uploading ? "Laddar upp..." : "Ladda upp"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {documents && documents.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Inga dokument uppladdade än.</p>
            </CardContent>
          </Card>
        )}
        {documents?.map((doc: any) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {doc.description || "Ingen beskrivning"}
                  </CardDescription>
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span>Kategori: {CATEGORY_LABELS[doc.category as keyof typeof CATEGORY_LABELS]}</span>
                    <span>Åtkomst: {ACCESS_LEVEL_LABELS[doc.accessLevel as keyof typeof ACCESS_LEVEL_LABELS]}</span>
                    <span>Storlek: {formatFileSize(doc.fileSize)}</span>
                    <span>Uppladdad: {formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    title="Visa dokument"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = doc.fileUrl;
                      link.download = doc.title + '.pdf';
                      link.click();
                    }}
                    title="Ladda ner"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(doc)}
                    title="Redigera"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    title="Ta bort"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Redigera dokument</DialogTitle>
            <DialogDescription>
              Ändra dokumentets metadata (filen kan inte ändras).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Titel *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="T.ex. Stadgar 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Beskrivning</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Valfri beskrivning av dokumentet"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Kategori *</Label>
              <Select value={editFormData.category} onValueChange={(value: any) => setEditFormData({ ...editFormData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-accessLevel">Åtkomstnivå *</Label>
              <Select value={editFormData.accessLevel} onValueChange={(value: any) => setEditFormData({ ...editFormData, accessLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCESS_LEVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleUpdate} disabled={!editFormData.title}>
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
