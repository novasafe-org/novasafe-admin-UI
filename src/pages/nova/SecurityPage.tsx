import { Card, PageHeader, StatTile, Badge } from "@/components/nova/ui";
import { securitySeries, users } from "@/lib/mockData";
import { ShieldAlert, AlertTriangle, KeyRound, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SecurityPage() {
  const twoFA = users.filter((u) => u.twoFA).length;
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Security" title="Security Center" description="Threats, anomalies and account hygiene across NovaSafe." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="Failed logins (24h)" value={314} sub="−12% DoD" trend="down" icon={<ShieldAlert className="w-4 h-4" />} />
        <StatTile label="Suspicious activity" value={42} sub="9 high risk" trend="flat" icon={<AlertTriangle className="w-4 h-4" />} />
        <StatTile label="Breached passwords" value={186} sub="In past 7 days" icon={<KeyRound className="w-4 h-4" />} />
        <StatTile label="2FA adoption" value={`${Math.round((twoFA / users.length) * 100)}%`} sub={`${twoFA} of ${users.length}`} trend="up" icon={<ShieldCheck className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Failed logins — last 14 days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={securitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="failedLogins" fill="hsl(0 84% 60%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Alerts & breaches</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={securitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line dataKey="alerts" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
              <Line dataKey="breaches" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent security events</h3>
          <Badge tone="danger">3 critical</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Event</th><th className="text-left px-4 py-2.5">User</th>
              <th className="text-left px-4 py-2.5">IP</th><th className="text-left px-4 py-2.5">Risk</th>
              <th className="text-left px-4 py-2.5">When</th>
            </tr></thead>
            <tbody>
              {[
                { e: "Impossible travel detected", u: users[2], ip: "203.0.113.42", r: "critical" },
                { e: "10 failed login attempts", u: users[5], ip: "198.51.100.7", r: "high" },
                { e: "New device from unknown country", u: users[9], ip: "192.0.2.118", r: "medium" },
                { e: "Password found in breach dataset", u: users[12], ip: "—", r: "high" },
                { e: "2FA disabled by user", u: users[18], ip: "10.0.0.42", r: "medium" },
                { e: "Account lockout — 5x failed PIN", u: users[22], ip: "172.16.0.9", r: "low" },
              ].map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2.5 text-foreground">{row.e}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.u.email}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.ip}</td>
                  <td className="px-4 py-2.5"><Badge tone={row.r === "critical" || row.r === "high" ? "danger" : row.r === "medium" ? "warning" : "muted"}>{row.r}</Badge></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{i * 12 + 3} min ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
