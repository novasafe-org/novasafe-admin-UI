import { PageHeader, StatTile, Card, Badge, StatusDot, Button } from "@/components/nova/ui";
import { users, devices, services, userGrowth, revenueSeries, deviceMix, securitySeries, auditLogs } from "@/lib/mockData";
import { Users, CreditCard, ShieldAlert, MonitorSmartphone, KeyRound, DollarSign, Activity, TrendingUp, Database, HardDrive } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

const PIE_COLORS = ["hsl(217 89% 55%)", "hsl(217 89% 70%)", "hsl(217 89% 85%)"];

export default function DashboardPage() {
  const activeUsers = users.filter((u) => u.status === "active").length;
  const paidUsers = users.filter((u) => u.plan !== "Free").length;
  const mrr = paidUsers * 9 + users.filter((u) => u.plan === "Pro Yearly").length * 4;
  const vaultItems = users.reduce((s, u) => s + u.vaultItems, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Control Center"
        title="Operations Dashboard"
        description="Real-time signal across customers, revenue, security and infrastructure."
        actions={<>
          <Button variant="secondary">Export</Button>
          <Button>New report</Button>
        </>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatTile label="Total users" value={users.length.toLocaleString()} sub="+3.2% WoW" trend="up" icon={<Users className="w-4 h-4" />} />
        <StatTile label="Active users" value={activeUsers.toLocaleString()} sub="+1.4% WoW" trend="up" icon={<Activity className="w-4 h-4" />} />
        <StatTile label="MRR" value={`$${(mrr * 1000).toLocaleString()}`} sub="+8.1% MoM" trend="up" icon={<DollarSign className="w-4 h-4" />} />
        <StatTile label="ARR" value={`$${(mrr * 12 * 1000).toLocaleString()}`} sub="+11.2% YoY" trend="up" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatTile label="Active subscriptions" value={paidUsers.toLocaleString()} sub="Churn 2.1%" trend="flat" icon={<CreditCard className="w-4 h-4" />} />
        <StatTile label="Vault items" value={vaultItems.toLocaleString()} sub="+1.8K today" trend="up" icon={<KeyRound className="w-4 h-4" />} />
        <StatTile label="Connected devices" value={devices.length * 240} sub="91% online" trend="up" icon={<MonitorSmartphone className="w-4 h-4" />} />
        <StatTile label="Security alerts (24h)" value={18} sub="2 critical" trend="down" icon={<ShieldAlert className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Failed logins (24h)" value={314} sub="−12% DoD" trend="down" />
        <StatTile label="Breach detections" value={47} sub="Past 7 days" />
        <StatTile label="API requests (24h)" value="14.2M" sub="p95 84ms" trend="flat" />
        <StatTile label="Storage" value="2.8 TB / 8 TB" sub="35% used" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">User growth — last 30 days</h3>
            <Badge tone="success">+12.4%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 89% 55%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(217 89% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="hsl(217 89% 55%)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="active" stroke="hsl(152 69% 45%)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Device mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={deviceMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {deviceMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Revenue, new & churn</h3>
            <Badge tone="primary">YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="new" fill="hsl(217 89% 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churn" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Security activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={securitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="failedLogins" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="alerts" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Infrastructure</h3>
            <Link to="/system" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {services.slice(0, 6).map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5">
                  <StatusDot status={s.status as any} />
                  <div>
                    <div className="text-sm text-foreground font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.region}</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-foreground font-medium tabular-nums">{s.latency}ms</div>
                  <div className="text-muted-foreground tabular-nums">{s.uptime}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Recent audit events</h3>
            <Link to="/audit" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {auditLogs.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm">
                <div className="min-w-0">
                  <div className="text-foreground font-medium font-mono text-xs">{l.action}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.actor} → {l.target}</div>
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">{new Date(l.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
