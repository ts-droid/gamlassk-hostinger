import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { compressImage } from "@/lib/imageCompression";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      toast.success("Bild uppladdad!");
      setUploading(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Kunde inte ladda upp bild");
      setUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vänligen välj en bildfil");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bilden är för stor. Max 10MB tillåtet.");
      return;
    }

    setUploading(true);

    try {
      // Compress image before upload
      toast.info("Komprimerar bild...");
      const compressedFile = await compressImage(file);
      
      // Read compressed file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        
        uploadMutation.mutate({
          filename: compressedFile.name,
          contentType: compressedFile.type,
          data,
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("File read error:", error);
      toast.error("Kunde inte läsa filen");
      setUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>Bild</Label>
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uppladdad bild"
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              onRemove?.();
              onChange("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <Label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="text-sm text-gray-600">Laddar upp...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Klicka för att ladda upp en bild
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF upp till 5MB
                </span>
              </>
            )}
          </Label>
        </div>
      )}
    </div>
  );
}
