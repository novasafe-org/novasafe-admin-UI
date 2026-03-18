import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Search, Upload, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MediaPage() {
  const { media } = useApp();
  const [search, setSearch] = useState("");

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

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Media Library</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:shadow-primary-hover transition-shadow flex items-center gap-1.5">
          <Upload className="w-4 h-4" /> Upload
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl shadow-card overflow-hidden group">
            <div className="aspect-square bg-muted flex items-center justify-center relative">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1.5">
                  <button onClick={() => copyUrl(item.url)} className="p-2 bg-card rounded-lg shadow-elevated text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-card rounded-lg shadow-elevated text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatSize(item.size)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">No media files found.</div>
      )}
    </div>
  );
}
