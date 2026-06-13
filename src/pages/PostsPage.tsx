import { usePostsQuery, useDeletePostMutation } from "@/hooks/use-posts";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PostsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data, isLoading, isError, error } = usePostsQuery({
    q: search || undefined,
    status: filterStatus === "all" ? undefined : (filterStatus as "draft" | "published" | "scheduled" | "archived"),
  });
  const deleteMutation = useDeletePostMutation();

  const posts = data?.posts ?? [];

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`"${title}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
        <Link to="/editor">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:shadow-primary-hover transition-shadow flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Post
          </motion.button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "published", "draft", "scheduled", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading posts...</span>
        </div>
      )}

      {isError && (
        <div className="py-12 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load posts"}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Updated</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-card-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{post.category || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden lg:table-cell">{new Date(post.updatedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/editor/${post.id}`)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No posts found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-success/10 text-success",
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-primary/10 text-primary",
    archived: "bg-warning/10 text-warning",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.draft}`}>{status}</span>;
}
