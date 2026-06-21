import { Link } from "react-router-dom";
import { Badge, Button, PageHeader } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { users, User } from "@/lib/mockData";
import { Download, ShieldCheck, ShieldOff, Plus } from "lucide-react";

const columns: Column<User>[] = [
  {
    key: "name",
    header: "User",
    accessor: (u) => `${u.name} ${u.email}`,
    sortable: true,
    render: (u) => (
      <Link to={`/users/${u.id}`} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{u.name[0]}</div>
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
    render: (u) => <Badge tone={u.plan === "Free" ? "muted" : u.plan === "Lifetime" ? "primary" : "info"}>{u.plan}</Badge>,
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
    render: (u) => <Badge tone={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>{u.status}</Badge>,
  },
  {
    key: "country",
    header: "Country",
    accessor: (u) => u.country,
    sortable: true,
    filterable: true,
  },
  { key: "devices", header: "Devices", accessor: (u) => u.devices, sortable: true, align: "right" },
  { key: "vaultItems", header: "Vault", accessor: (u) => u.vaultItems, sortable: true, align: "right" },
  {
    key: "twoFA",
    header: "2FA",
    accessor: (u) => (u.twoFA ? "yes" : "no"),
    sortable: true,
    align: "center",
    render: (u) => (u.twoFA ? <ShieldCheck className="w-4 h-4 text-success inline" /> : <ShieldOff className="w-4 h-4 text-muted-foreground inline" />),
  },
  {
    key: "securityScore",
    header: "Score",
    accessor: (u) => u.securityScore,
    sortable: true,
    align: "right",
    render: (u) => <span className={u.securityScore >= 80 ? "text-success" : u.securityScore >= 60 ? "text-warning" : "text-destructive"}>{u.securityScore}</span>,
  },
  {
    key: "lastLogin",
    header: "Last login",
    accessor: (u) => new Date(u.lastLogin).getTime(),
    sortable: true,
    render: (u) => <span className="text-muted-foreground text-xs">{new Date(u.lastLogin).toLocaleDateString()}</span>,
  },
];

export default function UsersPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Customers"
        title="User directory"
        description={`${users.length.toLocaleString()} accounts across all plans and regions.`}
        actions={<>
          <Button variant="secondary"><Download className="w-4 h-4" />Export CSV</Button>
          <Button><Plus className="w-4 h-4" />Invite user</Button>
        </>}
      />

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        searchPlaceholder="Search name or email…"
        initialPageSize={10}
      />
    </div>
  );
}
