import { Button, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { auditLogs } from "@/lib/mockData";
import { Download } from "lucide-react";

type Log = (typeof auditLogs)[number];

const actionOptions = Array.from(new Set(auditLogs.map((l) => l.action))).map((a) => ({ label: a, value: a }));
const actorOptions = Array.from(new Set(auditLogs.map((l) => l.actor))).map((a) => ({ label: a, value: a }));

const columns: Column<Log>[] = [
  {
    key: "timestamp",
    header: "When",
    accessor: (l) => new Date(l.timestamp).getTime(),
    sortable: true,
    render: (l) => <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</span>,
  },
  { key: "actor", header: "Actor", accessor: (l) => l.actor, sortable: true, filterable: true, filterOptions: actorOptions },
  {
    key: "action",
    header: "Action",
    accessor: (l) => l.action,
    sortable: true,
    filterable: true,
    filterOptions: actionOptions,
    render: (l) => <span className="font-mono text-xs text-primary">{l.action}</span>,
  },
  { key: "target", header: "Target", accessor: (l) => l.target, sortable: true, filterable: true },
  { key: "ip", header: "IP", accessor: (l) => l.ip, render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.ip}</span> },
];

export default function AuditPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Every administrative action across NovaSafe, filterable and exportable."
        actions={<Button variant="secondary"><Download className="w-4 h-4" />Export</Button>}
      />

      <DataTable
        columns={columns}
        rows={auditLogs}
        rowKey={(l) => l.id}
        searchPlaceholder="Search action, actor, target…"
        initialPageSize={25}
      />
    </div>
  );
}
