import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Upload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function Gallery() {
  const { user, isAuthenticated } = useAuth();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos, refetch } = trpc.gallery.list.useQuery();
  const uploadMutation = trpc.gallery.upload.useMutation({
    onSuccess: () => {
      toast.success('Bild uppladdad!');
      setUploadDialogOpen(false);
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte ladda upp bild');
      setUploading(false);
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success('Bild borttagen');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte ta bort bild');
    },
  });

  const categories = Array.from(new Set(photos?.map(p => p.category).filter(Boolean))) as string[];
  
  const filteredPhotos = categoryFilter === "all" 
    ? photos 
    : photos?.filter(p => p.category === categoryFilter);

  // Prepare lightbox slides
  const lightboxSlides = filteredPhotos?.map(photo => ({
    src: photo.originalUrl || photo.mediumUrl || photo.imageUrl,
    alt: photo.title,
    title: photo.title,
    description: photo.description,
  })) || [];

  const handleFileSelect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
      toast.error('Välj en bild att ladda upp');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bilden är för stor (max 10MB)');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Endast bildfiler är tillåtna');
      return;
    }

    setUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) {
        toast.error('Kunde inte läsa bilden');
        setUploading(false);
        return;
      }

      uploadMutation.mutate({
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        category: formData.get('category') as string || undefined,
        imageBase64: base64,
      });
    };
    reader.onerror = () => {
      toast.error('Kunde inte läsa bilden');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number) => {
    if (confirm('Är du säker på att du vill ta bort denna bild?')) {
      deleteMutation.mutate({ id });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader currentPath="/gallery" />
      <PageHero
        title="Bildgalleri"
        description="Bilder från föreningens evenemang och aktiviteter."
        actions={
          isAdmin ? (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Ladda upp bild
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ladda upp bild</DialogTitle>
                  <DialogDescription>
                    Bilden kommer automatiskt att komprimeras och optimeras
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFileSelect} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Välj bild</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      required
                      disabled={uploading}
                    />
                    <p className="text-sm text-gray-500 mt-1">Max 10MB</p>
                  </div>
                  <div>
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      disabled={uploading}
                      placeholder="T.ex. Vårfest 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      name="description"
                      disabled={uploading}
                      placeholder="Valfri beskrivning av bilden"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      name="category"
                      disabled={uploading}
                      placeholder="T.ex. Evenemang, Matcher, Historiskt"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Laddar upp...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Ladda upp
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      {/* Filter */}
      <div className="container py-8">
        {categories.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <label className="font-medium">Kategori:</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alla kategorier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Gallery Grid */}
        {!filteredPhotos || filteredPhotos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Inga bilder att visa</p>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Ladda upp första bilden
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => (
              <Card
                key={photo.id}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.thumbnailUrl || photo.mediumUrl || photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-lg">{photo.title}</h3>
                      {photo.description && (
                        <p className="text-sm opacity-90 line-clamp-2">{photo.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
      />
      <SiteFooter />
    </div>
  );
}
