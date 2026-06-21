import { Badge, Card, PageHeader, StatTile } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { securitySeries, users } from "@/lib/mockData";
import { ShieldAlert, AlertTriangle, KeyRound, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Event = { id: string; event: string; user: string; ip: string; risk: string; minutesAgo: number };

const events: Event[] = [
  { id: "e1", event: "Impossible travel detected", user: "user2@acme.io", ip: "203.0.113.42", risk: "critical", minutesAgo: 3 },
  { id: "e2", event: "10 failed login attempts", user: "user5@acme.io", ip: "198.51.100.7", risk: "high", minutesAgo: 15 },
  { id: "e3", event: "New device from unknown country", user: "user9@acme.io", ip: "192.0.2.118", risk: "medium", minutesAgo: 27 },
  { id: "e4", event: "Password found in breach dataset", user: "user12@acme.io", ip: "—", risk: "high", minutesAgo: 39 },
  { id: "e5", event: "2FA disabled by user", user: "user18@acme.io", ip: "10.0.0.42", risk: "medium", minutesAgo: 51 },
  { id: "e6", event: "Account lockout — 5x failed PIN", user: "user22@acme.io", ip: "172.16.0.9", risk: "low", minutesAgo: 75 },
  { id: "e7", event: "Suspicious API key usage", user: "user31@globex.com", ip: "45.33.12.8", risk: "high", minutesAgo: 92 },
  { id: "e8", event: "Brute force attempt blocked", user: "user42@hyperion.app", ip: "185.220.101.5", risk: "critical", minutesAgo: 110 },
  { id: "e9", event: "Anomalous vault export", user: "user14@northwind.dev", ip: "8.8.4.4", risk: "high", minutesAgo: 145 },
];

const columns: Column<Event>[] = [
  { key: "event", header: "Event", accessor: (e) => e.event, sortable: true, filterable: true },
  { key: "user", header: "User", accessor: (e) => e.user, sortable: true, filterable: true },
  { key: "ip", header: "IP", accessor: (e) => e.ip, render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.ip}</span> },
  {
    key: "risk",
    header: "Risk",
    accessor: (e) => e.risk,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Critical", value: "critical" }, { label: "High", value: "high" },
      { label: "Medium", value: "medium" }, { label: "Low", value: "low" },
    ],
    render: (e) => <Badge tone={e.risk === "critical" || e.risk === "high" ? "danger" : e.risk === "medium" ? "warning" : "muted"}>{e.risk}</Badge>,
  },
  {
    key: "when",
    header: "When",
    accessor: (e) => e.minutesAgo,
    sortable: true,
    render: (e) => <span className="text-xs text-muted-foreground">{e.minutesAgo} min ago</span>,
  },
];

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

      <h3 className="font-semibold text-foreground mb-3">Recent security events</h3>
      <DataTable columns={columns} rows={events} rowKey={(e) => e.id} searchPlaceholder="Search events…" />
    </div>
  );
}
