import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { adminApi } from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { Plus, Image, Tag, Folder, Users, Pencil, Trash2 } from "lucide-react";

type Row = {
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  views: number;
  updated: string;
};

export default function ContentPage() {
  const navigate = useNavigate();
  const { can } = useNova();
  const canEdit = can("content.manage");
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState({ categories: 0, tags: 0, posts: 0 });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPosts = useCallback(() => {
    return Promise.all([
      adminApi.blogPosts({ perPage: "100" }),
      adminApi.blogCategories(),
      adminApi.blogTags(),
    ])
      .then(([posts, categories, tags]) => {
        setRows(
          posts.items.map((p) => ({
            id: p.id,
            title: p.title,
            author: typeof p.author === "string" ? p.author : p.author?.name || "—",
            category: p.categoryName || "—",
            status: p.status,
            views: p.viewCount ?? p.views ?? 0,
            updated: p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : "—",
          })),
        );
        setStats({
          categories: categories.items.length,
          tags: tags.items.length,
          posts: posts.total,
        });
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load blog"));
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const removePost = useCallback(
    async (row: Row) => {
      if (!canEdit) return;
      if (!confirm(`Delete “${row.title}”? This cannot be undone.`)) return;
      setDeletingId(row.id);
      try {
        await adminApi.deleteBlogPost(row.id);
        setRows((prev) => prev.filter((p) => p.id !== row.id));
        setStats((s) => ({ ...s, posts: Math.max(0, s.posts - 1) }));
        toast.success("Post deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setDeletingId(null);
      }
    },
    [canEdit],
  );

  const columns: Column<Row>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        accessor: (p) => p.title,
        sortable: true,
        render: (p) => (
          <Link to={`/content/edit/${p.id}`} className="text-foreground font-medium hover:text-primary">
            {p.title}
          </Link>
        ),
      },
      { key: "author", header: "Author", accessor: (p) => p.author, sortable: true, filterable: true },
      {
        key: "category",
        header: "Category",
        accessor: (p) => p.category,
        sortable: true,
        filterable: true,
        render: (p) => <Badge tone="info">{p.category}</Badge>,
      },
      {
        key: "status",
        header: "Status",
        accessor: (p) => p.status,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
          { label: "Scheduled", value: "scheduled" },
        ],
        render: (p) => (
          <Badge tone={p.status === "published" ? "success" : p.status === "draft" ? "muted" : "warning"}>
            {p.status}
          </Badge>
        ),
      },
      {
        key: "views",
        header: "Views",
        accessor: (p) => p.views,
        sortable: true,
        align: "right",
        render: (p) => p.views.toLocaleString(),
      },
      {
        key: "updated",
        header: "Updated",
        accessor: (p) => p.updated,
        sortable: true,
        render: (p) => <span className="text-muted-foreground text-xs">{p.updated}</span>,
      },
      {
        key: "actions",
        header: "",
        accessor: () => "",
        render: (p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              to={`/content/edit/${p.id}`}
              className="text-muted-foreground hover:text-foreground"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            {canEdit && (
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                title="Delete"
                disabled={deletingId === p.id}
                onClick={() => void removePost(p)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, deletingId, removePost],
  );

  const filterOptions = useMemo(
    () => Array.from(new Set(rows.map((p) => p.category))).map((c) => ({ label: c, value: c })),
    [rows],
  );

  const cols = columns.map((c) => (c.key === "category" ? { ...c, filterOptions } : c));

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Manage posts, categories, authors and SEO across the NovaSafe blog."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary" onClick={() => navigate("/content/media")}>
                <Image className="w-4 h-4" />
                Media
              </Button>
              <Button onClick={() => navigate("/content/new")}>
                <Plus className="w-4 h-4" />
                New post
              </Button>
            </>
          ) : undefined
        }
      />

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4 flex items-center gap-3">
          <Folder className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Categories</div>
            <div className="text-xl font-semibold">{stats.categories}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Tag className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Tags</div>
            <div className="text-xl font-semibold">{stats.tags}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Posts</div>
            <div className="text-xl font-semibold">{stats.posts}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Image className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Listed</div>
            <div className="text-xl font-semibold">{rows.length}</div>
          </div>
        </Card>
      </div>

      <DataTable columns={cols} rows={rows} rowKey={(p) => p.id} searchPlaceholder="Search posts…" />
    </div>
  );
}
