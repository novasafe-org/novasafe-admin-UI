import { Badge, Button, Card, Input, PageHeader, Select, Toolbar } from "@/components/nova/ui";
import { docs } from "@/lib/mockData";
import { Plus } from "lucide-react";

export default function DocsPage() {
  const sections = Array.from(new Set(docs.map((d) => d.section)));
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Documentation"
        description="User guides, API docs, tutorials and knowledge base — with versioning and draft workflow."
        actions={<Button><Plus className="w-4 h-4" />New doc</Button>}
      />

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <Card className="p-5 md:col-span-1">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Sections</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between px-2 py-1.5 rounded-md bg-accent text-foreground font-medium">All<span className="text-muted-foreground">{docs.length}</span></li>
            {sections.map((s) => (
              <li key={s} className="flex justify-between px-2 py-1.5 rounded-md hover:bg-accent text-muted-foreground cursor-pointer">
                {s}<span>{docs.filter((d) => d.section === s).length}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="md:col-span-3">
          <Toolbar>
            <Input placeholder="Search docs…" className="w-72" />
            <Select><option>All versions</option><option>v4</option><option>v3</option></Select>
            <Select><option>Any status</option><option>Published</option><option>Draft</option></Select>
          </Toolbar>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="text-left px-4 py-2.5">Title</th><th className="text-left px-4 py-2.5">Section</th>
                <th className="text-left px-4 py-2.5">Version</th><th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Updated</th>
              </tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 text-foreground font-medium">{d.title}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{d.section}</td>
                    <td className="px-4 py-2.5"><Badge tone="info">{d.version}</Badge></td>
                    <td className="px-4 py-2.5"><Badge tone={d.status === "published" ? "success" : "muted"}>{d.status}</Badge></td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{d.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
