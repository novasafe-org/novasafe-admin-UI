import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type Column } from "@/components/nova/DataTable";
import { Badge, Button, Card, Input, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNova } from "@/context/NovaContext";
import { adminApi, type FeatureFlagAuditEntry, type FeatureFlagRow } from "@/lib/api";

const ENV_ORDER = ["production", "staging", "development", "enterprise-dev"] as const;

const ENV_LABELS: Record<(typeof ENV_ORDER)[number], string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
  "enterprise-dev": "Enterprise dev",
};

type PendingToggle = {
  environment: string;
  enabled: boolean;
};

const historyColumns: Column<FeatureFlagAuditEntry>[] = [
  {
    key: "createdAt",
    header: "When",
    accessor: (row) => new Date(row.createdAt).getTime(),
    sortable: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</span>
    ),
  },
  {
    key: "actorEmail",
    header: "User",
    accessor: (row) => row.actorEmail,
    sortable: true,
    render: (row) => <span className="text-sm">{row.actorEmail}</span>,
  },
  {
    key: "environment",
    header: "Environment",
    accessor: (row) => row.environment,
    sortable: true,
    filterable: true,
    filterOptions: ENV_ORDER.map((env) => ({ label: ENV_LABELS[env], value: env })),
    render: (row) => <Badge tone="muted">{ENV_LABELS[row.environment as keyof typeof ENV_LABELS] ?? row.environment}</Badge>,
  },
  {
    key: "oldValue",
    header: "Previous",
    accessor: (row) => (row.oldValue.enabled ? "on" : "off"),
    align: "center",
    render: (row) => (
      <Badge tone={row.oldValue.enabled ? "success" : "muted"}>{row.oldValue.enabled ? "On" : "Off"}</Badge>
    ),
  },
  {
    key: "newValue",
    header: "New",
    accessor: (row) => (row.newValue.enabled ? "on" : "off"),
    align: "center",
    render: (row) => (
      <Badge tone={row.newValue.enabled ? "success" : "muted"}>{row.newValue.enabled ? "On" : "Off"}</Badge>
    ),
  },
  {
    key: "action",
    header: "Action",
    accessor: (row) => row.action,
    render: (row) => <span className="text-xs text-muted-foreground">{row.action}</span>,
  },
];

export default function FeatureFlagDetailPage() {
  const { key } = useParams<{ key: string }>();
  const { can } = useNova();
  const canRead = can("flags.read");
  const canEdit = can("flags.manage");

  const [rows, setRows] = useState<FeatureFlagRow[]>([]);
  const [history, setHistory] = useState<FeatureFlagAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingEnv, setSavingEnv] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingToggle | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [approvalNote, setApprovalNote] = useState("");

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getFeatureFlag(key);
      setRows(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load feature flag";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const loadHistory = useCallback(async () => {
    if (!key) return;
    setHistoryLoading(true);
    try {
      const data = await adminApi.getFeatureFlagHistory(key, { limit: 50 });
      setHistory(
        data.map((entry) => ({
          ...entry,
          createdAt:
            typeof entry.createdAt === "string"
              ? entry.createdAt
              : new Date(entry.createdAt as unknown as string).toISOString(),
        })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!canRead || !key) return;
    void load();
    void loadHistory();
  }, [canRead, key, load, loadHistory]);

  const meta = rows[0];
  const envRows = useMemo(() => {
    const byEnv = new Map(rows.map((row) => [row.environment, row]));
    return ENV_ORDER.map((environment) => byEnv.get(environment)).filter(Boolean) as FeatureFlagRow[];
  }, [rows]);

  const requestToggle = (environment: string, enabled: boolean) => {
    if (!canEdit) return;
    if (environment === "production") {
      setPending({ environment, enabled });
      setConfirmText("");
      setApprovalNote("");
      return;
    }
    void applyToggle(environment, enabled);
  };

  const applyToggle = async (environment: string, enabled: boolean, note?: string) => {
    if (!key) return;
    setSavingEnv(environment);
    try {
      await adminApi.toggleFeatureFlag(key, {
        environment,
        enabled,
        ...(note ? { approvalNote: note } : {}),
      });
      toast.success(`${ENV_LABELS[environment as keyof typeof ENV_LABELS] ?? environment} updated`);
      await Promise.all([load(), loadHistory()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingEnv(null);
      setPending(null);
      setConfirmText("");
      setApprovalNote("");
    }
  };

  const confirmProductionToggle = () => {
    if (!pending || !key) return;
    if (confirmText.trim() !== key) {
      toast.error("Type the exact flag key to confirm production changes");
      return;
    }
    if (meta?.tier === "enterprise" && pending.enabled && !approvalNote.trim()) {
      toast.error("Enterprise-tier production enables require an approval note");
      return;
    }
    void applyToggle(pending.environment, pending.enabled, approvalNote.trim() || undefined);
  };

  if (!canRead) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!key) {
    return <Navigate to="/feature-flags" replace />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-4">
        <Link
          to="/feature-flags"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Feature flags
        </Link>
      </div>

      <PageHeader
        eyebrow="Platform"
        title={meta?.displayName ?? key}
        description={meta?.description ?? (loading ? "Loading…" : error ?? `Flag key: ${key}`)}
        actions={
          <Button variant="outline" size="sm" onClick={() => { void load(); void loadHistory(); }} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {!canEdit && <ReadOnlyBanner />}

      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4 mb-6">
          {error}
        </div>
      )}

      {meta && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card className="p-5 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Metadata
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge tone="muted">{meta.category}</Badge>
                <Badge tone="info">{meta.tier}</Badge>
                <Badge tone={meta.lifecycle === "released" ? "success" : "warning"}>{meta.lifecycle}</Badge>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Key</dt>
                <dd className="font-mono text-foreground">{meta.key}</dd>
                <dt className="text-muted-foreground">Owner</dt>
                <dd>{meta.owner || "—"}</dd>
                <dt className="text-muted-foreground">Catalog default</dt>
                <dd>
                  {meta.catalogDefault ? (
                    <Badge tone="success">On</Badge>
                  ) : (
                    <Badge tone="muted">Off</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-2">(per environment row)</span>
                </dd>
              </dl>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Client surfaces
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meta.clientSurfaces.map((surface) => (
                  <Badge key={surface} tone="muted">
                    {surface}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
              Environment toggles
            </div>
            <div className="space-y-3">
              {envRows.map((row) => {
                const isProd = row.environment === "production";
                const busy = savingEnv === row.environment;
                return (
                  <div
                    key={row.environment}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {ENV_LABELS[row.environment as keyof typeof ENV_LABELS] ?? row.environment}
                        {isProd && <Badge tone="danger">Production</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {row.enabled ? "Enabled" : "Disabled"}
                        {row.updatedAt && (
                          <>
                            {" "}
                            · updated {new Date(row.updatedAt).toLocaleString()}
                            {row.updatedByEmail ? ` by ${row.updatedByEmail}` : ""}
                          </>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={row.enabled}
                      disabled={!canEdit || busy}
                      onCheckedChange={(checked) => requestToggle(row.environment, checked)}
                      aria-label={`Toggle ${row.environment}`}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <PageHeader
          title="Change history"
          description={historyLoading ? "Loading audit log…" : `Last ${history.length} changes`}
        />
        {!historyLoading && (
          <DataTable
            columns={historyColumns}
            rows={history}
            rowKey={(row) => `${row.createdAt}-${row.environment}-${row.actorEmail}`}
            searchPlaceholder="Search user or environment…"
            initialPageSize={10}
            emptyMessage="No changes recorded yet."
          />
        )}
      </div>

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm production change</DialogTitle>
            <DialogDescription>
              You are about to turn <strong>{pending?.enabled ? "on" : "off"}</strong>{" "}
              <code className="text-foreground">{key}</code> in <strong>production</strong>. Type the flag key below
              to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={key}
            autoComplete="off"
            className="font-mono"
          />
          {meta?.tier === "enterprise" && pending?.enabled ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="approval-note">
                Approval note (required for enterprise tier)
              </label>
              <Input
                id="approval-note"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Ticket link or launch approval reference"
                autoComplete="off"
              />
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText.trim() !== key || savingEnv === "production"}
              onClick={confirmProductionToggle}
            >
              {savingEnv === "production" ? "Saving…" : "Confirm production change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
