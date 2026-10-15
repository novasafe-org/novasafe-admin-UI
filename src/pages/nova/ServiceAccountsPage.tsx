import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, Input, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { adminApi, type PermissionAction, type ServiceAccountDto } from "@/lib/api";

const BLOG_PERMISSIONS = [
  { key: "content.manage", label: "Content — manage (blog automation)" },
  { key: "content.read", label: "Content — read" },
] as const;

export default function ServiceAccountsPage() {
  const { can } = useNova();
  const canManage = can("integrations.manage");
  const [items, setItems] = useState<ServiceAccountDto[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("NovaSafe Team");
  const [authorEmail, setAuthorEmail] = useState("blog@novasafe.io");

  const load = () => {
    adminApi.listServiceAccounts().then(setItems).catch(() => toast.error("Failed to load service accounts"));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    try {
      await adminApi.createServiceAccount({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: [
          { permissionKey: "content.manage", action: "manage" as PermissionAction },
          { permissionKey: "content.read", action: "read" as PermissionAction },
        ],
        defaultAuthor: {
          id: "blog-automation",
          name: authorName.trim() || "NovaSafe Team",
          email: authorEmail.trim() || undefined,
        },
      });
      toast.success("Service account created");
      setShowCreate(false);
      setName("");
      setDescription("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        eyebrow="Platform"
        title="Service accounts"
        description="Machine credentials for blog automation and integrations. API tokens call the same admin-api blog routes as the UI."
        actions={
          canManage ? (
            <Button onClick={() => setShowCreate((v) => !v)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New service account
            </Button>
          ) : undefined
        }
      />
      {!canManage && <ReadOnlyBanner />}

      {showCreate && canManage && (
        <Card className="p-5 mb-6 space-y-4">
          <h3 className="font-semibold">Create service account</h3>
          <p className="text-sm text-muted-foreground">
            Grants: {BLOG_PERMISSIONS.map((p) => p.label).join(", ")}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Blog automation" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="GitHub Actions" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Default author name</label>
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Default author email</label>
              <Input value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Permissions</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{row.name}</div>
                  {row.description && <div className="text-xs text-muted-foreground">{row.description}</div>}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={row.status === "active" ? "success" : "muted"}>{row.status}</Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {row.permissions.map((p) => p.permissionKey).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/integrations/service-accounts/${row.id}`} className="text-primary hover:underline">
                    Manage tokens
                  </Link>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No service accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
