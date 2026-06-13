import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useUploadMediaMutation } from "@/hooks/use-media";
import { optimizedMediaUrl } from "@/lib/slug";
import { toast } from "sonner";

type ImageUploadDropzoneProps = {
  onUploaded: (url: string, altText?: string) => void;
  accept?: string;
  label?: string;
  compact?: boolean;
};

export function ImageUploadDropzone({
  onUploaded,
  accept = "image/*",
  label = "Drop an image or click to upload",
  compact = false,
}: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const uploadMutation = useUploadMediaMutation();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) {
        toast.error("Please choose an image file");
        return;
      }

      for (const file of list) {
        try {
          setProgress(0);
          const media = await uploadMutation.mutateAsync({
            file,
            onProgress: setProgress,
          });
          const url = optimizedMediaUrl(media.url, { width: 1400, format: "webp", quality: 85 });
          onUploaded(url, media.alt_text ?? file.name);
          toast.success("Image uploaded");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
          setProgress(null);
        }
      }
    },
    [onUploaded, uploadMutation],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
        compact ? "p-4" : "p-8"
      } ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
        {uploadMutation.isPending ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">{label}</p>
        {progress !== null && (
          <div className="w-full max-w-xs">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

type FeaturedImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
};

export function FeaturedImageField({ value, onChange }: FeaturedImageFieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground block">Featured Image</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={optimizedMediaUrl(value, { width: 640, format: "webp", quality: 85 })}
            alt="Featured"
            className="w-full aspect-video object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-card/90 text-muted-foreground hover:text-destructive shadow-card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <ImageUploadDropzone compact onUploaded={(url) => onChange(url)} label="Upload featured image" />
      )}
    </div>
  );
}
