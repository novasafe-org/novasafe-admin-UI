import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, StatusDot, Badge } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { adminApi, type StatusService } from "@/lib/api";
import { Activity } from "lucide-react";

type Row = {
  id: string;
  name: string;
  region: string;
  status: string;
  latency: number;
  uptime: number;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Service", accessor: (s) => s.name, sortable: true, render: (s) => <span className="font-medium text-foreground">{s.name}</span> },
  { key: "region", header: "Region", accessor: (s) => s.region, sortable: true, filterable: true },
  {
    key: "status", header: "Status", accessor: (s) => s.status, sortable: true, filterable: true,
    filterOptions: [{ label: "Operational", value: "operational" }, { label: "Degraded", value: "degraded" }, { label: "Outage", value: "outage" }],
    render: (s) => (
      <div className="flex items-center gap-2">
        <StatusDot status={s.status as "operational" | "degraded" | "outage"} />
        <span className="capitalize text-xs text-muted-foreground">{s.status}</span>
      </div>
    ),
  },
  { key: "latency", header: "Latency", accessor: (s) => s.latency, sortable: true, align: "right", render: (s) => `${s.latency}ms` },
  { key: "uptime", header: "Uptime (90d)", accessor: (s) => s.uptime, sortable: true, align: "right", render: (s) => `${s.uptime}%` },
];

function mapService(s: StatusService, index: number): Row {
  return {
    id: s.id || s.slug || String(index),
    name: s.name,
    region: s.region || "Global",
    status: s.status,
    latency: s.latencyMs ?? s.latency ?? 0,
    uptime: s.uptime90d ?? s.uptime ?? 100,
  };
}

export default function SystemPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [overall, setOverall] = useState("operational");

  useEffect(() => {
    Promise.all([adminApi.statusOverview(), adminApi.statusServices()])
      .then(([overview, servicesRes]) => {
        setOverall(overview.status || "operational");
        const list = servicesRes.services?.length ? servicesRes.services : overview.services || [];
        setRows(list.map(mapService));
      })
      .catch(() => {});
  }, []);

  const allOps = rows.length ? rows.every((s) => s.status === "operational") : overall === "operational";
  const regionFilters = useMemo(
    () => Array.from(new Set(rows.map((s) => s.region))).map((r) => ({ label: r, value: r })),
    [rows],
  );
  const cols = columns.map((c) => (c.key === "region" ? { ...c, filterOptions: regionFilters } : c));

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader eyebrow="Platform" title="System Status" description="Real-time health of every service powering NovaSafe." />

      <Card className={`p-5 mb-4 flex items-center justify-between border-l-4 ${allOps ? "border-l-success" : "border-l-warning"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${allOps ? "bg-success/15 text-success" : "bg-warning/15 text-warning"} flex items-center justify-center`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{allOps ? "All systems operational" : "Some systems are degraded"}</div>
            <div className="text-xs text-muted-foreground">Updated {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <Badge tone={allOps ? "success" : "warning"}>{allOps ? "Operational" : "Degraded"}</Badge>
      </Card>

      <DataTable columns={cols} rows={rows} rowKey={(s) => s.id} searchPlaceholder="Search services…" initialPageSize={25} />
    </div>
  );
}
