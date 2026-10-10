import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, Input, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { adminApi, type ApiTokenDto, type ServiceAccountDto } from "@/lib/api";

export default function ServiceAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useNova();
  const canManage = can("integrations.manage");
  const [account, setAccount] = useState<ServiceAccountDto | null>(null);
  const [tokens, setTokens] = useState<ApiTokenDto[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const [acc, tok] = await Promise.all([
        adminApi.getServiceAccount(id),
        adminApi.listServiceAccountTokens(id),
      ]);
      setAccount(acc);
      setTokens(tok);
    } catch {
      toast.error("Failed to load service account");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const mintToken = async () => {
    if (!id || !tokenName.trim()) return;
    try {
      const result = await adminApi.createServiceAccountToken(id, { name: tokenName.trim() });
      setNewToken(result.token);
      setTokenName("");
      toast.success("Token created — copy it now");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create token");
    }
  };

  const revoke = async (tokenId: string) => {
    if (!id) return;
    try {
      await adminApi.revokeServiceAccountToken(id, tokenId);
      toast.success("Token revoked");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed");
    }
  };

  const copyToken = async () => {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    toast.success("Copied to clipboard");
  };

  if (!account) {
    return (
      <div className="p-8 text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto">
      <Link
        to="/integrations/service-accounts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Service accounts
      </Link>

      <PageHeader
        eyebrow="Integrations"
        title={account.name}
        description={account.description || "API tokens for automation (blog posts, media, categories)."}
      />
      {!canManage && <ReadOnlyBanner />}

      <Card className="p-5 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge tone={account.status === "active" ? "success" : "muted"}>{account.status}</Badge>
          {account.defaultAuthor && (
            <span className="text-sm text-muted-foreground">
              Default author: {account.defaultAuthor.name}
              {account.defaultAuthor.email ? ` (${account.defaultAuthor.email})` : ""}
            </span>
          )}
        </div>
      </Card>

      {newToken && (
        <Card className="p-5 mb-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-2">
            <KeyRound className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">New API token</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Copy this token now. It will not be shown again.
              </p>
              <code className="mt-3 block break-all rounded-md bg-background border border-border p-3 text-xs">
                {newToken}
              </code>
              <Button className="mt-3" size="sm" onClick={copyToken}>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy token
              </Button>
            </div>
          </div>
        </Card>
      )}

      {canManage && (
        <Card className="p-5 mb-6">
          <h3 className="font-semibold mb-3">Create API token</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Token name (e.g. GitHub Actions prod)"
              className="flex-1"
            />
            <Button onClick={mintToken}>Generate token</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Prefix</th>
              <th className="text-left font-medium px-4 py-3">Last used</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.prefix}…</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.revokedAt ? (
                    <Badge tone="muted">Revoked</Badge>
                  ) : (
                    t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : "Never"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!t.revokedAt && canManage && (
                    <Button variant="outline" size="sm" onClick={() => revoke(t.id)}>
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!tokens.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No tokens yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
