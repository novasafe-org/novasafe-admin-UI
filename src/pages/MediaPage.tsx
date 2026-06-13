import { useMediaQuery, useUploadMediaMutation, useDeleteMediaMutation, useDeleteUnusedMediaMutation } from "@/hooks/use-media";
import { optimizedMediaUrl } from "@/lib/slug";
import { motion } from "framer-motion";
import { Search, Upload, Copy, Loader2, Trash2, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function MediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { data: media = [], isLoading, isError, error } = useMediaQuery();
  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const deleteUnusedMutation = useDeleteUnusedMediaMutation();

  const filtered = media.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleUpload = async (files: FileList | File[] | null) => {
    if (!files?.length) return;
    try {
      for (const file of Array.from(files)) {
        setUploadProgress(0);
        await uploadMutation.mutateAsync({
          file,
          onProgress: setUploadProgress,
        });
      }
      toast.success(files.length === 1 ? "File uploaded" : `${files.length} files uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(`"${name}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed — image may still be in use");
    }
  };

  const handleCleanup = async () => {
    try {
      const removed = await deleteUnusedMutation.mutateAsync();
      toast.success(removed ? `Removed ${removed} unused file(s)` : "No unused files found");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cleanup failed");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Media Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanup}
            disabled={deleteUnusedMutation.isPending}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Clean unused
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="px-4 py-2 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary flex items-center gap-1.5 disabled:opacity-50"
          >
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </motion.button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>

      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:border-primary/40 transition-colors"
      >
        Drag and drop images here to upload
        {uploadProgress !== null && (
          <div className="mt-3 max-w-xs mx-auto">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs mt-1 tabular-nums">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm" />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading media...</span>
        </div>
      )}

      {isError && (
        <div className="py-12 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load media"}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl shadow-card overflow-hidden group">
              <div className="aspect-square bg-muted relative overflow-hidden">
                {item.type.startsWith("image/") ? (
                  <img
                    src={optimizedMediaUrl(item.url, { width: 400, format: "webp", quality: 80 })}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{item.type}</div>
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => copyUrl(item.url)} className="p-2 bg-card rounded-lg shadow-elevated text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-card rounded-lg shadow-elevated text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatSize(item.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">No media files found.</div>
      )}
    </div>
  );
}
