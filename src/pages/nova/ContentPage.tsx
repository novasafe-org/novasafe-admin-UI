import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { blogPosts } from "@/lib/mockData";
import { Plus, Image, Tag, Folder, Users } from "lucide-react";

type Post = (typeof blogPosts)[number];

const columns: Column<Post>[] = [
  { key: "title", header: "Title", accessor: (p) => p.title, sortable: true, render: (p) => <span className="text-foreground font-medium">{p.title}</span> },
  { key: "author", header: "Author", accessor: (p) => p.author, sortable: true, filterable: true },
  {
    key: "category", header: "Category", accessor: (p) => p.category, sortable: true, filterable: true,
    filterOptions: Array.from(new Set(blogPosts.map((p) => p.category))).map((c) => ({ label: c, value: c })),
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

export default function ContentPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Manage posts, categories, authors and SEO across the NovaSafe blog."
        actions={<><Button variant="secondary"><Image className="w-4 h-4" />Media</Button><Button><Plus className="w-4 h-4" />New post</Button></>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4 flex items-center gap-3"><Folder className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Categories</div><div className="text-xl font-semibold">8</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Tag className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Tags</div><div className="text-xl font-semibold">42</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Users className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Authors</div><div className="text-xl font-semibold">12</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Image className="w-5 h-5 text-primary" /><div><div className="text-xs text-muted-foreground uppercase tracking-wider">Media files</div><div className="text-xl font-semibold">318</div></div></Card>
      </div>

      <DataTable columns={columns} rows={blogPosts} rowKey={(p) => p.id} searchPlaceholder="Search posts…" />
    </div>
  );
}
