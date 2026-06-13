import { Badge, Card, PageHeader, StatTile, Toolbar, Input, Select } from "@/components/nova/ui";
import { users, revenueSeries } from "@/lib/mockData";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SubscriptionsPage() {
  const paid = users.filter((u) => u.plan !== "Free");
  const lifetime = users.filter((u) => u.plan === "Lifetime").length;
  const proMonthly = users.filter((u) => u.plan === "Pro Monthly").length;
  const proYearly = users.filter((u) => u.plan === "Pro Yearly").length;
  const free = users.filter((u) => u.plan === "Free").length;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Billing" title="Subscriptions" description="Plan distribution, revenue and recent billing events." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="MRR" value="$48,210" sub="+8.1%" trend="up" icon={<DollarSign className="w-4 h-4" />} />
        <StatTile label="ARR" value="$578,520" sub="+11.2% YoY" trend="up" icon={<TrendingUp className="w-4 h-4" />} />
        <StatTile label="Churn rate" value="2.1%" sub="−0.3% MoM" trend="down" icon={<TrendingDown className="w-4 h-4" />} />
        <StatTile label="Failed payments" value={14} sub="Past 30 days" icon={<RefreshCw className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-4 gap-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Free</div><div className="text-2xl font-semibold mt-1 tabular-nums">{free}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Pro Monthly</div><div className="text-2xl font-semibold mt-1 tabular-nums">{proMonthly}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Pro Yearly</div><div className="text-2xl font-semibold mt-1 tabular-nums">{proYearly}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Lifetime</div><div className="text-2xl font-semibold mt-1 tabular-nums">{lifetime}</div></Card>
      </div>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold text-foreground mb-3">MRR trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueSeries}>
            <defs><linearGradient id="rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(217 89% 55%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(217 89% 55%)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="mrr" stroke="hsl(217 89% 55%)" fill="url(#rg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Toolbar>
        <Input placeholder="Search subscribers…" className="w-72" />
        <Select><option>All plans</option><option>Pro Monthly</option><option>Pro Yearly</option><option>Lifetime</option></Select>
        <Select><option>Status: any</option><option>Active</option><option>Past due</option><option>Cancelled</option></Select>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Customer</th><th className="text-left px-4 py-2.5">Plan</th><th className="text-left px-4 py-2.5">Status</th>
              <th className="text-right px-4 py-2.5">MRR</th><th className="text-left px-4 py-2.5">Next renewal</th>
            </tr></thead>
            <tbody>
              {paid.slice(0, 20).map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <div className="text-foreground font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-2.5"><Badge tone={u.plan === "Lifetime" ? "primary" : "info"}>{u.plan}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone="success">active</Badge></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">${u.plan === "Pro Monthly" ? 9 : u.plan === "Pro Yearly" ? 84 : 199}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(Date.now() + 30 * 86400000).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
