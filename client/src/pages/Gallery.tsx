import { trpc } from "@/lib/trpc";
import { useMemo, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Loader2, Tag, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCMSContent } from "@/hooks/useCMSContent";

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

export default function Gallery() {
  const { getContent } = useCMSContent("gallery");
  const { user, isAuthenticated } = useAuth();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [albumFilter, setAlbumFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos, refetch } = trpc.gallery.list.useQuery();
  const { data: rolesData } = trpc.roles.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const currentRole = rolesData?.find((role) => role.id === user?.roleId);
  const rolePermissions = normalizePermissions(currentRole?.permissions);
  const canManageGallery = Boolean(
    user?.role === "admin" &&
      (rolePermissions.includes("manage_all") || rolePermissions.includes("manage_gallery"))
  );

  const uploadMutation = trpc.gallery.upload.useMutation({
    onSuccess: () => {
      toast.success("Bild uppladdad!");
      setUploadDialogOpen(false);
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ladda upp bild");
      setUploading(false);
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Bild borttagen");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort bild");
    },
  });

  const albums = useMemo(
    () => Array.from(new Set((photos || []).map((photo) => photo.category).filter(Boolean))) as string[],
    [photos]
  );
  const tags = useMemo(
    () => Array.from(new Set((photos || []).flatMap((photo) => normalizeTags(photo.tags)))).sort(),
    [photos]
  );

  const filteredPhotos = (photos || []).filter((photo) => {
    const matchesAlbum = albumFilter === "all" || photo.category === albumFilter;
    const matchesTag = tagFilter === "all" || normalizeTags(photo.tags).includes(tagFilter);
    return matchesAlbum && matchesTag;
  });

  const lightboxSlides = filteredPhotos.map((photo) => ({
    src: photo.originalUrl || photo.mediumUrl || photo.imageUrl,
    alt: photo.title,
    title: photo.title,
    description: photo.description,
  }));

  const handleFileSelect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("Välj en bild att ladda upp");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bilden är för stor (max 10MB)");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Endast bildfiler är tillåtna");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) {
        toast.error("Kunde inte läsa bilden");
        setUploading(false);
        return;
      }

      uploadMutation.mutate({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        category: (formData.get("album") as string) || undefined,
        tags: normalizeTags((formData.get("tags") as string) || ""),
        imageBase64: base64,
      });
    };

    reader.onerror = () => {
      toast.error("Kunde inte läsa bilden");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna bild?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SiteHeader currentPath="/gallery" />
      <PageHero
        title={getContent("hero_title", "Bildgalleri")}
        description={getContent("hero_description", "Bilder från föreningens evenemang och aktiviteter. Filtrera på album eller taggar för att hitta rätt snabbare.")}
        actions={
          canManageGallery ? (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  <Upload className="mr-2 h-5 w-5" />
                  {getContent("upload_button_label", "Ladda upp bild")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{getContent("upload_dialog_title", "Ladda upp bild")}</DialogTitle>
                  <DialogDescription>
                    {getContent("upload_dialog_description", "Placera bilden i ett album och märk upp den med taggar för årtal, platser och personer.")}
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
                    <p className="mt-1 text-sm text-gray-500">Max 10MB</p>
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
                    <Label htmlFor="album">Album</Label>
                    <Input
                      id="album"
                      name="album"
                      list="gallery-albums-public"
                      disabled={uploading}
                      placeholder="T.ex. Historiska bilder"
                    />
                    <datalist id="gallery-albums-public">
                      {albums.map((album) => (
                        <option key={album} value={album} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <Label htmlFor="tags">Taggar</Label>
                    <Input
                      id="tags"
                      name="tags"
                      list="gallery-tags-public"
                      disabled={uploading}
                      placeholder="T.ex. 1998, Södertälje, Anders"
                    />
                    <datalist id="gallery-tags-public">
                      {tags.map((tag) => (
                        <option key={tag} value={tag} />
                      ))}
                    </datalist>
                    <p className="mt-1 text-xs text-gray-500">Separera flera taggar med komma.</p>
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

      <div className="container py-8">
        {(albums.length > 0 || tags.length > 0) ? (
            <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="font-medium">{getContent("album_filter_label", "Album:")}</label>
              <Select value={albumFilter} onValueChange={setAlbumFilter}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder={getContent("album_filter_all_label", "Alla album")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getContent("album_filter_all_label", "Alla album")}</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album} value={album}>
                      {album}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="flex items-center gap-2 font-medium">
                <Tag className="h-4 w-4" />
                {getContent("tag_filter_label", "Tagg:")}
              </label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder={getContent("tag_filter_all_label", "Alla taggar")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getContent("tag_filter_all_label", "Alla taggar")}</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {!filteredPhotos.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg text-gray-500">{getContent("empty_state_title", "Inga bilder att visa")}</p>
              {canManageGallery ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {getContent("empty_state_cta", "Ladda upp första bilden")}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {canManageGallery ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-semibold">{photo.title}</h3>
                      {photo.description ? (
                        <p className="line-clamp-2 text-sm opacity-90">{photo.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold">{photo.title}</h3>
                    {photo.category ? (
                      <p className="text-sm text-gray-600">{getContent("photo_album_prefix", "Album")}: {photo.category}</p>
                    ) : null}
                  </div>
                  {normalizeTags(photo.tags).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {normalizeTags(photo.tags).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setTagFilter(tag);
                          }}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
