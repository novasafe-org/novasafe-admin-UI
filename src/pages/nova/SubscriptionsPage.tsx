import { Badge, Card, PageHeader, StatTile } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { users, revenueSeries, User } from "@/lib/mockData";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const priceFor = (plan: User["plan"]) => plan === "Pro Monthly" ? 9 : plan === "Pro Yearly" ? 84 : plan === "Lifetime" ? 199 : 0;

const columns: Column<User>[] = [
  {
    key: "name",
    header: "Customer",
    accessor: (u) => `${u.name} ${u.email}`,
    sortable: true,
    render: (u) => (<div><div className="text-foreground font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>),
  },
  {
    key: "plan",
    header: "Plan",
    accessor: (u) => u.plan,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Pro Monthly", value: "Pro Monthly" },
      { label: "Pro Yearly", value: "Pro Yearly" },
      { label: "Lifetime", value: "Lifetime" },
    ],
    render: (u) => <Badge tone={u.plan === "Lifetime" ? "primary" : "info"}>{u.plan}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    accessor: (u) => u.status,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Active", value: "active" },
      { label: "Suspended", value: "suspended" },
    ],
    render: (u) => <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>,
  },
  {
    key: "mrr",
    header: "MRR",
    accessor: (u) => priceFor(u.plan),
    sortable: true,
    align: "right",
    render: (u) => `$${priceFor(u.plan)}`,
  },
  {
    key: "renews",
    header: "Next renewal",
    accessor: (u) => new Date(u.joined).getTime(),
    sortable: true,
    render: () => <span className="text-muted-foreground">{new Date(Date.now() + 30 * 86400000).toLocaleDateString()}</span>,
  },
];

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

      <DataTable
        columns={columns}
        rows={paid}
        rowKey={(u) => u.id}
        searchPlaceholder="Search subscribers…"
      />
    </div>
  );
}
