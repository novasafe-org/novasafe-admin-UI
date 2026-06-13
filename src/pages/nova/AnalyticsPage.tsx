import { Card, PageHeader, StatTile } from "@/components/nova/ui";
import { userGrowth, revenueSeries, deviceMix } from "@/lib/mockData";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const C = ["hsl(217 89% 55%)", "hsl(217 89% 70%)", "hsl(217 89% 85%)"];

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Insights" title="Analytics" description="Acquisition, retention, conversion and feature usage metrics." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="Signups (30d)" value="3,412" sub="+18% MoM" trend="up" />
        <StatTile label="Activation rate" value="64%" sub="+2.3 pts" trend="up" />
        <StatTile label="Free → Paid" value="9.2%" sub="−0.4 pts" trend="down" />
        <StatTile label="DAU / MAU" value="0.41" sub="Healthy" trend="up" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">User acquisition</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={userGrowth}>
              <defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(217 89% 55%)" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(217 89% 55%)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area dataKey="users" stroke="hsl(217 89% 55%)" fill="url(#ag)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Conversion funnel</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { stage: "Visit", n: 100000 },
              { stage: "Signup", n: 24000 },
              { stage: "Activate", n: 15400 },
              { stage: "Paid", n: 2210 },
              { stage: "Retained 30d", n: 1830 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="n" fill="hsl(217 89% 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Device usage</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={deviceMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {deviceMix.map((_, i) => <Cell key={i} fill={C[i]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Subscription metrics</h3>
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
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-3">Top searched queries</h3>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
          {["import passwords", "passkey support", "family vault", "android app crash", "billing", "2fa recovery", "browser extension", "delete account", "export csv", "sso enterprise"].map((q, i) => (
            <div key={q} className="flex justify-between py-1.5 border-b border-border">
              <span className="text-foreground">{q}</span>
              <span className="text-muted-foreground tabular-nums">{(2400 - i * 180).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
