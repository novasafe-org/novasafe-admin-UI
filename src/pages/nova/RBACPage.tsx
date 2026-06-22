import { useEffect, useState } from "react";
import { Badge, Button, Card, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { adminApi, type PermissionAction } from "@/lib/api";
import { Check, X } from "lucide-react";

const cell = (v: PermissionAction) =>
  v === "manage" ? (
    <Badge tone="success"><Check className="w-3 h-3 mr-1" />Manage</Badge>
  ) : v === "read" ? (
    <Badge tone="info">Read</Badge>
  ) : (
    <Badge tone="muted"><X className="w-3 h-3 mr-1" />None</Badge>
  );

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export default function RBACPage() {
  const { can } = useNova();
  const canEdit = can("rbac.manage");
  const [permissions, setPermissions] = useState<Array<{ key: string; module: string; label: string }>>([]);
  const [roles, setRoles] = useState<Array<{ key: string; name: string; description: string }>>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, PermissionAction>>>({});

  const load = () => {
    adminApi.rbacMatrix().then((data) => {
      setPermissions(data.permissions);
      setRoles(data.roles);
      setMatrix(data.matrix);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    acc[p.module] ??= [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const cycleAction = async (roleKey: string, permissionKey: string) => {
    if (!canEdit || roleKey === "owner") return;
    const current = matrix[roleKey]?.[permissionKey] ?? "none";
    const next: PermissionAction = current === "none" ? "read" : current === "read" ? "manage" : "none";
    await adminApi.updatePermission(roleKey, permissionKey, next);
    load();
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Security"
        title="Roles & Permissions"
        description="Define what each role can see and change across NovaSafe modules."
      />

      {!canEdit && <ReadOnlyBanner />}

      {Object.entries(grouped).map(([module, perms]) => (
        <Card key={module} className="overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="font-semibold capitalize text-foreground">{module}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                  <th className="text-left px-4 py-2.5">Permission</th>
                  {roles.map((r) => (
                    <th key={r.key} className="px-4 py-2.5">{roleLabels[r.key] || r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.key} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{p.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.key}</div>
                    </td>
                    {roles.map((r) => (
                      <td key={r.key} className="px-4 py-2.5 text-center">
                        {canEdit && r.key !== "owner" ? (
                          <button type="button" className="inline-flex" onClick={() => void cycleAction(r.key, p.key)}>
                            {cell(matrix[r.key]?.[p.key] ?? "none")}
                          </button>
                        ) : (
                          cell(matrix[r.key]?.[p.key] ?? "none")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <div className="grid md:grid-cols-3 gap-4">
        {roles.map((r) => (
          <Card key={r.key} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{r.name}</h3>
              <Badge tone={r.key === "owner" ? "primary" : r.key === "admin" ? "info" : "muted"}>Built-in</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
