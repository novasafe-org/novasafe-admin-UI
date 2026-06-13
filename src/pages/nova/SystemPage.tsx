import { Card, PageHeader, StatusDot, Badge } from "@/components/nova/ui";
import { services } from "@/lib/mockData";
import { Activity } from "lucide-react";

export default function SystemPage() {
  const allOps = services.every((s) => s.status === "operational");
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader eyebrow="Platform" title="System Status" description="Real-time health of every service powering NovaSafe." />

      <Card className={`p-5 mb-4 flex items-center justify-between border-l-4 ${allOps ? "border-l-success" : "border-l-warning"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${allOps ? "bg-success/15 text-success" : "bg-warning/15 text-warning"} flex items-center justify-center`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{allOps ? "All systems operational" : "Some systems are degraded"}</div>
            <div className="text-xs text-muted-foreground">Updated {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <Badge tone={allOps ? "success" : "warning"}>{allOps ? "Operational" : "Degraded"}</Badge>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Service</th><th className="text-left px-4 py-2.5">Region</th>
              <th className="text-left px-4 py-2.5">Status</th><th className="text-right px-4 py-2.5">Latency</th>
              <th className="text-right px-4 py-2.5">Uptime (90d)</th>
            </tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.region}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><StatusDot status={s.status as any} /><span className="capitalize text-xs text-muted-foreground">{s.status}</span></div></td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.latency}ms</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
