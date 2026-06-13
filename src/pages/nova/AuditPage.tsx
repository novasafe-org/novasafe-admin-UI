import { Card, Input, PageHeader, Select, Toolbar, Button } from "@/components/nova/ui";
import { auditLogs } from "@/lib/mockData";
import { Download } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Every administrative action across NovaSafe, filterable and exportable."
        actions={<Button variant="secondary"><Download className="w-4 h-4" />Export</Button>}
      />

      <Toolbar>
        <Input placeholder="Search action, actor, target…" className="w-80" />
        <Select><option>Any actor</option><option>owner@novasafe.io</option><option>admin@novasafe.io</option></Select>
        <Select><option>Any action</option><option>user.created</option><option>user.deleted</option><option>subscription.upgraded</option><option>role.changed</option></Select>
        <Select><option>Last 24h</option><option>Last 7 days</option><option>Last 30 days</option></Select>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">When</th><th className="text-left px-4 py-2.5">Actor</th>
              <th className="text-left px-4 py-2.5">Action</th><th className="text-left px-4 py-2.5">Target</th>
              <th className="text-left px-4 py-2.5">IP</th>
            </tr></thead>
            <tbody>
              {auditLogs.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-foreground">{l.actor}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{l.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.target}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
