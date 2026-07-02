import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import { DataTable, type Column } from "@/components/nova/DataTable";
import { Badge, Button, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { adminApi, type FeatureFlagMatrixRow } from "@/lib/api";

function envBadge(enabled: boolean) {
  return (
    <Badge tone={enabled ? "success" : "muted"} className="min-w-[4.5rem] justify-center">
      {enabled ? "On" : "Off"}
    </Badge>
  );
}

const columns: Column<FeatureFlagMatrixRow>[] = [
  {
    key: "flag",
    header: "Flag",
    accessor: (row) => `${row.displayName} ${row.key}`,
    sortable: true,
    render: (row) => (
      <Link to={`/feature-flags/${row.key}`} className="block min-w-0">
        <div className="font-medium text-foreground">{row.displayName}</div>
        <div className="text-xs text-muted-foreground font-mono">{row.key}</div>
      </Link>
    ),
  },
  {
    key: "category",
    header: "Category",
    accessor: (row) => row.category,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Product", value: "product" },
      { label: "Platform", value: "platform" },
      { label: "Experiment", value: "experiment" },
    ],
    render: (row) => <Badge tone="muted">{row.category}</Badge>,
  },
  {
    key: "tier",
    header: "Tier",
    accessor: (row) => row.tier,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Personal", value: "personal" },
      { label: "Teams", value: "teams" },
      { label: "Enterprise", value: "enterprise" },
    ],
    render: (row) => <Badge tone="info">{row.tier}</Badge>,
  },
  {
    key: "production",
    header: "Production",
    accessor: (row) => (row.production ? "on" : "off"),
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "On", value: "on" },
      { label: "Off", value: "off" },
    ],
    align: "center",
    render: (row) => envBadge(row.production),
  },
  {
    key: "staging",
    header: "Staging",
    accessor: (row) => (row.staging ? "on" : "off"),
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "On", value: "on" },
      { label: "Off", value: "off" },
    ],
    align: "center",
    render: (row) => envBadge(row.staging),
  },
  {
    key: "development",
    header: "Development",
    accessor: (row) => (row.development ? "on" : "off"),
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "On", value: "on" },
      { label: "Off", value: "off" },
    ],
    align: "center",
    render: (row) => envBadge(row.development),
  },
  {
    key: "lastChanged",
    header: "Last changed",
    accessor: (row) => (row.lastChanged ? new Date(row.lastChanged).getTime() : 0),
    sortable: true,
    render: (row) => (
      <div className="text-xs text-muted-foreground">
        {row.lastChanged ? (
          <>
            <div>{new Date(row.lastChanged).toLocaleString()}</div>
            {row.lastChangedBy && <div>{row.lastChangedBy}</div>}
          </>
        ) : (
          "—"
        )}
      </div>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    accessor: (row) => row.owner,
    sortable: true,
    render: (row) => <span className="text-sm text-muted-foreground">{row.owner}</span>,
  },
];

export default function FeatureFlagsPage() {
  const { can } = useNova();
  const canRead = can("flags.read");
  const canEdit = can("flags.manage");

  const [rows, setRows] = useState<FeatureFlagMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!canRead) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminApi
      .listFeatureFlagMatrix()
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load feature flags");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canRead, refreshKey]);

  const description = useMemo(() => {
    if (loading) return "Loading catalog and environment overrides…";
    if (error) return error;
    return `${rows.length} flags across production, staging, and development.`;
  }, [loading, error, rows.length]);

  if (!canRead) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Platform"
        title="Feature flags"
        description={description}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {!canEdit && <ReadOnlyBanner />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.key}
          searchPlaceholder="Search flag name or key…"
          initialPageSize={15}
          emptyMessage="No feature flags match your filters."
        />
      )}

      {loading && !error && (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading feature flags…</div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-4">
          {error}
        </div>
      )}
    </div>
  );
}
