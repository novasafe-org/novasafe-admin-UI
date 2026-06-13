import { Badge, Card, Input, PageHeader, Select, StatTile, Toolbar } from "@/components/nova/ui";
import { tickets } from "@/lib/mockData";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const priorityTone = (p: string) => p === "urgent" ? "danger" : p === "high" ? "warning" : p === "normal" ? "info" : "muted";
const statusTone = (s: string) => s === "open" ? "warning" : s === "in_progress" ? "primary" : s === "resolved" ? "success" : "muted";

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

      <Toolbar>
        <Input placeholder="Search tickets…" className="w-72" />
        <Select><option>All types</option><option>Bug</option><option>Question</option><option>Feature Request</option><option>Billing</option></Select>
        <Select><option>Any status</option><option>Open</option><option>In progress</option><option>Resolved</option><option>Closed</option></Select>
        <Select><option>Any priority</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></Select>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Ticket</th><th className="text-left px-4 py-2.5">Subject</th>
              <th className="text-left px-4 py-2.5">User</th><th className="text-left px-4 py-2.5">Type</th>
              <th className="text-left px-4 py-2.5">Priority</th><th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Created</th>
            </tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{t.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{t.subject}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.user}</td>
                  <td className="px-4 py-2.5"><Badge tone="info">{t.type}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone={priorityTone(t.priority) as any}>{t.priority}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone={statusTone(t.status) as any}>{t.status.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
