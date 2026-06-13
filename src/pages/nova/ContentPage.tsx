import { Badge, Button, Card, Input, PageHeader, Select, Toolbar } from "@/components/nova/ui";
import { blogPosts } from "@/lib/mockData";
import { Plus, Image, Tag, Folder, Users } from "lucide-react";

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

      <Toolbar>
        <Input placeholder="Search posts…" className="w-72" />
        <Select><option>All categories</option><option>Security</option><option>Guides</option><option>Product</option><option>Research</option></Select>
        <Select><option>Any status</option><option>Published</option><option>Draft</option><option>Scheduled</option></Select>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Title</th><th className="text-left px-4 py-2.5">Author</th>
              <th className="text-left px-4 py-2.5">Category</th><th className="text-left px-4 py-2.5">Status</th>
              <th className="text-right px-4 py-2.5">Views</th><th className="text-left px-4 py-2.5">Updated</th>
            </tr></thead>
            <tbody>
              {blogPosts.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 text-foreground font-medium">{p.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.author}</td>
                  <td className="px-4 py-2.5"><Badge tone="info">{p.category}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone={p.status === "published" ? "success" : p.status === "draft" ? "muted" : "warning"}>{p.status}</Badge></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{p.views.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{p.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
