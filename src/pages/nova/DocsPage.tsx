import { Badge, Button, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { docs } from "@/lib/mockData";
import { Plus } from "lucide-react";

type Doc = (typeof docs)[number];

const columns: Column<Doc>[] = [
  { key: "title", header: "Title", accessor: (d) => d.title, sortable: true, render: (d) => <span className="text-foreground font-medium">{d.title}</span> },
  {
    key: "section", header: "Section", accessor: (d) => d.section, sortable: true, filterable: true,
    filterOptions: Array.from(new Set(docs.map((d) => d.section))).map((s) => ({ label: s, value: s })),
  },
  {
    key: "version", header: "Version", accessor: (d) => d.version, sortable: true, filterable: true,
    filterOptions: [{ label: "v4", value: "v4" }, { label: "v3", value: "v3" }],
    render: (d) => <Badge tone="info">{d.version}</Badge>,
  },
  {
    key: "status", header: "Status", accessor: (d) => d.status, sortable: true, filterable: true,
    filterOptions: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }],
    render: (d) => <Badge tone={d.status === "published" ? "success" : "muted"}>{d.status}</Badge>,
  },
  { key: "updated", header: "Updated", accessor: (d) => d.updated, sortable: true, render: (d) => <span className="text-muted-foreground text-xs">{d.updated}</span> },
];

export default function DocsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Documentation"
        description="User guides, API docs, tutorials and knowledge base — with versioning and draft workflow."
        actions={<Button><Plus className="w-4 h-4" />New doc</Button>}
      />
      <DataTable columns={columns} rows={docs} rowKey={(d) => d.id} searchPlaceholder="Search docs…" />
    </div>
  );
}
