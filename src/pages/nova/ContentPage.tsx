import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { adminApi, type BlogPost } from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { Plus, Image, Tag, Folder, Users } from "lucide-react";

type Row = {
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  views: number;
  updated: string;
};

const columns: Column<Row>[] = [
  { key: "title", header: "Title", accessor: (p) => p.title, sortable: true, render: (p) => <span className="text-foreground font-medium">{p.title}</span> },
  { key: "author", header: "Author", accessor: (p) => p.author, sortable: true, filterable: true },
  {
    key: "category", header: "Category", accessor: (p) => p.category, sortable: true, filterable: true,
    render: (p) => <Badge tone="info">{p.category}</Badge>,
  },
  {
    key: "status", header: "Status", accessor: (p) => p.status, sortable: true, filterable: true,
    filterOptions: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }, { label: "Scheduled", value: "scheduled" }],
    render: (p) => <Badge tone={p.status === "published" ? "success" : p.status === "draft" ? "muted" : "warning"}>{p.status}</Badge>,
  },
  { key: "views", header: "Views", accessor: (p) => p.views, sortable: true, align: "right", render: (p) => p.views.toLocaleString() },
  { key: "updated", header: "Updated", accessor: (p) => p.updated, sortable: true, render: (p) => <span className="text-muted-foreground text-xs">{p.updated}</span> },
];

function mapPost(p: BlogPost): Row {
  const author = typeof p.author === "string" ? p.author : p.author?.name || "—";
  const category = typeof p.category === "string" ? p.category : p.category?.name || "—";
  return {
    id: p.id,
    title: p.title,
    author,
    category,
    status: p.status,
    views: p.viewCount ?? p.views ?? 0,
    updated: p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : "—",
  };
}

export default function ContentPage() {
  const { can } = useNova();
  const canEdit = can("content.manage");
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState({ categories: 0, tags: 0, posts: 0 });

  useEffect(() => {
    Promise.all([
      adminApi.blogPosts({ limit: "100" }),
      adminApi.blogCategories(),
      adminApi.blogTags(),
    ])
      .then(([posts, categories, tags]) => {
        setRows((posts.items || []).map(mapPost));
        setStats({
          categories: categories.items?.length ?? 0,
          tags: tags.items?.length ?? 0,
          posts: posts.total ?? posts.items?.length ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const filterOptions = useMemo(
    () => Array.from(new Set(rows.map((p) => p.category))).map((c) => ({ label: c, value: c })),
    [rows],
  );

  const cols = columns.map((c) =>
    c.key === "category" ? { ...c, filterOptions } : c,
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Manage posts, categories, authors and SEO across the NovaSafe blog."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary"><Image className="w-4 h-4" />Media</Button>
              <Button><Plus className="w-4 h-4" />New post</Button>
            </>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4 flex items-center gap-3"><Folder className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Categories</div><div className="text-xl font-semibold">{stats.categories}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Tag className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Tags</div><div className="text-xl font-semibold">{stats.tags}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Users className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Posts</div><div className="text-xl font-semibold">{stats.posts}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Image className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Listed</div><div className="text-xl font-semibold">{rows.length}</div></div></Card>
      </div>

      <DataTable columns={cols} rows={rows} rowKey={(p) => p.id} searchPlaceholder="Search posts…" />
    </div>
  );
}
