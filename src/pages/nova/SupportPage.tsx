import { Badge, PageHeader, StatTile } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { tickets } from "@/lib/mockData";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle } from "lucide-react";

type Ticket = (typeof tickets)[number];

const priorityTone = (p: string) => p === "urgent" ? "danger" : p === "high" ? "warning" : p === "normal" ? "info" : "muted";
const statusTone = (s: string) => s === "open" ? "warning" : s === "in_progress" ? "primary" : s === "resolved" ? "success" : "muted";

const columns: Column<Ticket>[] = [
  { key: "id", header: "Ticket", accessor: (t) => t.id, sortable: true, render: (t) => <span className="font-mono text-xs">{t.id}</span> },
  { key: "subject", header: "Subject", accessor: (t) => t.subject, sortable: true },
  { key: "user", header: "User", accessor: (t) => t.user, sortable: true, filterable: true },
  {
    key: "type", header: "Type", accessor: (t) => t.type, sortable: true, filterable: true,
    filterOptions: [{ label: "Bug", value: "Bug" }, { label: "Question", value: "Question" }, { label: "Feature Request", value: "Feature Request" }, { label: "Billing", value: "Billing" }],
    render: (t) => <Badge tone="info">{t.type}</Badge>,
  },
  {
    key: "priority", header: "Priority", accessor: (t) => t.priority, sortable: true, filterable: true,
    filterOptions: [{ label: "Urgent", value: "urgent" }, { label: "High", value: "high" }, { label: "Normal", value: "normal" }, { label: "Low", value: "low" }],
    render: (t) => <Badge tone={priorityTone(t.priority) as any}>{t.priority}</Badge>,
  },
  {
    key: "status", header: "Status", accessor: (t) => t.status, sortable: true, filterable: true,
    filterOptions: [{ label: "Open", value: "open" }, { label: "In progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }],
    render: (t) => <Badge tone={statusTone(t.status) as any}>{t.status.replace("_", " ")}</Badge>,
  },
  {
    key: "createdAt", header: "Created", accessor: (t) => new Date(t.createdAt).getTime(), sortable: true,
    render: (t) => <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</span>,
  },
];

export default function SupportPage() {
  const open = tickets.filter((t) => t.status === "open").length;
  const inprog = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Customers" title="Support Center" description="Contact requests, feedback, feature requests, and bug reports." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="Open" value={open} icon={<AlertCircle className="w-4 h-4" />} />
        <StatTile label="In progress" value={inprog} icon={<Clock className="w-4 h-4" />} />
        <StatTile label="Resolved (7d)" value={resolved} icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatTile label="Avg first response" value="2h 14m" icon={<LifeBuoy className="w-4 h-4" />} />
      </div>

      <DataTable columns={columns} rows={tickets} rowKey={(t) => t.id} searchPlaceholder="Search tickets…" />
    </div>
  );
}
