import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, Button, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { adminApi, type CustomerUser } from "@/lib/api";
import { Download, ShieldCheck, ShieldOff, Plus } from "lucide-react";

const columns: Column<CustomerUser>[] = [
  {
    key: "name",
    header: "User",
    accessor: (u) => `${u.name} ${u.email}`,
    sortable: true,
    render: (u) => (
      <Link to={`/users/${u.id}`} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
          {u.name[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="text-foreground font-medium">{u.name}</div>
          <div className="text-xs text-muted-foreground">{u.email}</div>
        </div>
      </Link>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    accessor: (u) => u.plan,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Free", value: "Free" },
      { label: "Pro Monthly", value: "Pro Monthly" },
      { label: "Pro Yearly", value: "Pro Yearly" },
      { label: "Lifetime", value: "Lifetime" },
    ],
    render: (u) => (
      <Badge tone={u.plan === "Free" ? "muted" : u.plan === "Lifetime" ? "primary" : "info"}>{u.plan}</Badge>
    ),
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
      { label: "Invited", value: "invited" },
    ],
    render: (u) => (
      <Badge tone={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>
        {u.status}
      </Badge>
    ),
  },
  { key: "country", header: "Country", accessor: (u) => u.country, sortable: true, filterable: true },
  { key: "devices", header: "Devices", accessor: (u) => u.devices, sortable: true, align: "right" },
  { key: "vaultItems", header: "Vault", accessor: (u) => u.vaultItems, sortable: true, align: "right" },
  {
    key: "twoFA",
    header: "2FA",
    accessor: (u) => (u.twoFA ? "yes" : "no"),
    sortable: true,
    align: "center",
    render: (u) =>
      u.twoFA ? (
        <ShieldCheck className="w-4 h-4 text-success inline" />
      ) : (
        <ShieldOff className="w-4 h-4 text-muted-foreground inline" />
      ),
  },
  {
    key: "securityScore",
    header: "Score",
    accessor: (u) => u.securityScore,
    sortable: true,
    align: "right",
    render: (u) => (
      <span
        className={
          u.securityScore >= 80 ? "text-success" : u.securityScore >= 60 ? "text-warning" : "text-destructive"
        }
      >
        {u.securityScore}
      </span>
    ),
  },
  {
    key: "lastLogin",
    header: "Last login",
    accessor: (u) => (u.lastLogin ? new Date(u.lastLogin).getTime() : 0),
    sortable: true,
    render: (u) => (
      <span className="text-muted-foreground text-xs">
        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "—"}
      </span>
    ),
  },
];

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<CustomerUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = searchParams.get("status") || undefined;
  const plan = searchParams.get("plan") || undefined;

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .listUsers({
        limit: "200",
        ...(status ? { status } : {}),
        ...(plan ? { plan } : {}),
      })
      .then((res) => {
        setRows(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [status, plan]);

  const exportCsv = () => {
    const header = ["name", "email", "plan", "status", "country", "devices", "vaultItems", "twoFA", "securityScore", "lastLogin"];
    const lines = rows.map((u) =>
      [u.name, u.email, u.plan, u.status, u.country, u.devices, u.vaultItems, u.twoFA, u.securityScore, u.lastLogin ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "novasafe-users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const description = useMemo(() => {
    if (loading) return "Loading customer accounts…";
    if (error) return error;
    return `${total.toLocaleString()} accounts across all plans and regions.`;
  }, [loading, error, total]);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Customers"
        title="User directory"
        description={description}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!rows.length}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button disabled title="Customer invites are managed via the mobile app">
              <Plus className="w-4 h-4" />
              Invite user
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        searchPlaceholder="Search name or email…"
        initialPageSize={10}
      />
    </div>
  );
}
