import { Badge, Button, Card, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { Plus, Copy, Check, X } from "lucide-react";

const modules = [
  { key: "users", label: "Users" },
  { key: "billing", label: "Billing" },
  { key: "content", label: "Content" },
  { key: "docs", label: "Documentation" },
  { key: "support", label: "Support" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
  { key: "audit", label: "Audit logs" },
  { key: "rbac", label: "RBAC" },
  { key: "settings", label: "Settings" },
];

const matrix: Record<string, Record<string, "manage" | "read" | "none">> = {
  Owner: Object.fromEntries(modules.map((m) => [m.key, "manage"])),
  Admin: { users: "read", billing: "read", content: "manage", docs: "manage", support: "manage", security: "read", system: "read", audit: "read", rbac: "none", settings: "read" },
  Member: { users: "read", billing: "read", content: "read", docs: "read", support: "read", security: "read", system: "read", audit: "none", rbac: "none", settings: "read" },
};

const cell = (v: "manage" | "read" | "none") => v === "manage"
  ? <Badge tone="success"><Check className="w-3 h-3 mr-1" />Manage</Badge>
  : v === "read"
  ? <Badge tone="info">Read</Badge>
  : <Badge tone="muted"><X className="w-3 h-3 mr-1" />None</Badge>;

export default function RBACPage() {
  const { can } = useNova();
  const canEdit = can("rbac.manage");
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Security"
        title="Roles & Permissions"
        description="Define what each role can see and change across NovaSafe modules."
        actions={canEdit && <><Button variant="secondary"><Copy className="w-4 h-4" />Clone role</Button><Button><Plus className="w-4 h-4" />New role</Button></>}
      />

      {!canEdit && <ReadOnlyBanner />}

      <Card className="overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Module</th>
              <th className="px-4 py-2.5">Owner</th>
              <th className="px-4 py-2.5">Admin</th>
              <th className="px-4 py-2.5">Member</th>
            </tr></thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.key} className="border-t border-border">
                  <td className="px-4 py-2.5 text-foreground font-medium">{m.label}</td>
                  <td className="px-4 py-2.5 text-center">{cell(matrix.Owner[m.key])}</td>
                  <td className="px-4 py-2.5 text-center">{cell(matrix.Admin[m.key])}</td>
                  <td className="px-4 py-2.5 text-center">{cell(matrix.Member[m.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {(["Owner", "Admin", "Member"] as const).map((r) => (
          <Card key={r} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{r}</h3>
              <Badge tone={r === "Owner" ? "primary" : r === "Admin" ? "info" : "muted"}>{r === "Owner" ? "Built-in" : r === "Admin" ? "Built-in" : "Built-in"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {r === "Owner" && "Full unrestricted access to billing, RBAC, infrastructure and all customer data."}
              {r === "Admin" && "Manage content, docs and support. Read-only access to analytics and users."}
              {r === "Member" && "Read-only access to dashboards, reports and content."}
            </p>
            <div className="mt-3 text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{r === "Owner" ? 4 : r === "Admin" ? 7 : 12}</span> users assigned
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
