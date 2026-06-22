import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Copy, Loader2, Trash2, Upload } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/nova/ui";
import { adminApi, type BlogMediaDto } from "@/lib/api";
import { useNova } from "@/context/NovaContext";

export default function MediaPage() {
  const { can } = useNova();
  const canEdit = can("content.manage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BlogMediaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .blogMedia({ perPage: "100" })
      .then((r) => setItems(r.items))
      .catch(() => toast.error("Failed to load media"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      await adminApi.uploadBlogMedia(file);
      toast.success("Uploaded");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await adminApi.deleteBlogMedia(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <Link to="/content" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <PageHeader
        eyebrow="Content"
        title="Media library"
        description="Upload images for blog posts. URLs are served from the admin API."
        actions={
          canEdit ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUpload(f);
                  e.target.value = "";
                }}
              />
              <Button disabled={uploading} onClick={() => inputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No media yet. Upload an image to get started.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <img src={m.url} alt={m.alt_text || m.original_name} className="w-full h-40 object-cover bg-muted" />
              <div className="p-3 space-y-2">
                <div className="text-xs font-medium truncate">{m.original_name}</div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => copyUrl(m.url)}>
                    <Copy className="w-3.5 h-3.5" />
                    Copy URL
                  </Button>
                  {canEdit && (
                    <Button type="button" variant="danger" size="sm" onClick={() => void remove(m.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
