import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Server,
  ShieldAlert,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  ReadOnlyBanner,
  Select,
  StatTile,
  StatusDot,
} from "@/components/nova/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminApi,
  type StatusIncident,
  type StatusIncidentInput,
  type StatusOverview,
  type StatusService,
} from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { cn } from "@/lib/utils";

type IncidentForm = {
  title: string;
  incidentType: "outage" | "degradation" | "maintenance" | "security";
  severityUi: "critical" | "major" | "minor";
  serviceKey: string;
  description: string;
  publicMessage: string;
  status: StatusIncidentInput["status"];
};

const EMPTY_FORM: IncidentForm = {
  title: "",
  incidentType: "degradation",
  severityUi: "minor",
  serviceKey: "api",
  description: "",
  publicMessage: "",
  status: "investigating",
};

function mapSeverity(form: IncidentForm): StatusIncidentInput["severity"] {
  if (form.incidentType === "maintenance") return "maintenance";
  if (form.incidentType === "outage" || form.incidentType === "security" || form.severityUi === "critical") {
    return "major";
  }
  if (form.severityUi === "major") return "major";
  return "degraded";
}

function overallLabel(status: StatusOverview["overallStatus"]): string {
  if (status === "major") return "Major outage detected";
  if (status === "degraded") return "Partial degradation detected";
  return "All systems operational";
}

function overallTone(status: StatusOverview["overallStatus"]): "success" | "warning" | "danger" {
  if (status === "major") return "danger";
  if (status === "degraded") return "warning";
  return "success";
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function avgUptime(services: StatusService[]): string {
  if (!services.length) return "—";
  const avg = services.reduce((sum, s) => sum + s.uptime.last90Days, 0) / services.length;
  return `${avg.toFixed(2)}%`;
}

function ServiceCard({
  service,
  canEdit,
  onUpdate,
}: {
  service: StatusService;
  canEdit: boolean;
  onUpdate: () => void;
}) {
  const border =
    service.status === "major"
      ? "border-destructive/40 hover:border-destructive/60"
      : service.status === "degraded"
        ? "border-warning/40 hover:border-warning/60"
        : "border-border/80 hover:border-primary/30";

  return (
    <Card
      className={cn(
        "p-5 transition-all duration-200 bg-card/70 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5",
        border,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            <p className="text-[11px] text-muted-foreground font-mono">{service.key}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={service.status === "major" ? "outage" : service.status} />
          <span className="text-xs capitalize text-muted-foreground">{service.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">90-day uptime</div>
          <div className="font-semibold tabular-nums">{service.uptime.last90Days.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">30-day uptime</div>
          <div className="font-semibold tabular-nums">{service.uptime.last30Days.toFixed(2)}%</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        Last checked just now
      </div>

      {canEdit && (
        <Button variant="ghost" className="w-full mt-3 h-8 text-xs" onClick={onUpdate}>
          Update status
        </Button>
      )}
    </Card>
  );
}

function IncidentCard({
  incident,
  canEdit,
  onResolve,
  onUpdate,
  variant,
}: {
  incident: StatusIncident;
  canEdit: boolean;
  onResolve: (id: string) => void;
  onUpdate: (incident: StatusIncident) => void;
  variant: "active" | "maintenance";
}) {
  const severityTone =
    incident.severity === "major" ? "danger" : incident.severity === "maintenance" ? "info" : "warning";

  return (
    <Card className="p-5 border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/25 transition-all">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge tone={severityTone}>
          {variant === "maintenance" ? "Maintenance" : incident.severity}
        </Badge>
        <Badge tone={incident.status === "resolved" ? "success" : "warning"}>{incident.status}</Badge>
        <span className="text-xs text-muted-foreground">{incident.serviceName}</span>
      </div>

      <h4 className="text-lg font-semibold text-foreground">{incident.title}</h4>
      {incident.publicMessage && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{incident.publicMessage}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground/80">Started:</span> {formatTime(incident.startedAt)}
        </div>
        {incident.resolvedAt && (
          <div>
            <span className="font-medium text-foreground/80">Resolved:</span> {formatTime(incident.resolvedAt)}
          </div>
        )}
      </div>

      {canEdit && incident.status !== "resolved" && (
        <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border/50">
          <a
            href="https://novasafe.io/status"
            target="_blank"
            rel="noreferrer"
            className="h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View public
          </a>
          <button
            type="button"
            onClick={() => onUpdate(incident)}
            className="h-8 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => onResolve(incident.id)}
            className="h-8 px-2.5 rounded-md text-xs font-medium text-success hover:bg-success/10"
          >
            Resolve
          </button>
        </div>
      )}
    </Card>
  );
}

export default function SystemPage() {
  const { can } = useNova();
  const canEdit = can("system.manage");

  const [overview, setOverview] = useState<StatusOverview | null>(null);
  const [incidents, setIncidents] = useState<StatusIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IncidentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, inc] = await Promise.all([
        adminApi.statusOverview(),
        adminApi.statusIncidents({ page: "1", limit: "50" }),
      ]);
      setOverview(ov);
      setIncidents(inc.items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load system status";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const services = overview?.services ?? [];
  const activeIncidents = overview?.activeIncidents ?? [];
  const maintenance = overview?.scheduledMaintenance ?? [];
  const overall = overview?.overallStatus ?? "operational";

  const recentUpdates = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [incidents]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (incident: StatusIncident) => {
    setEditingId(incident.id);
    setForm({
      title: incident.title,
      incidentType: incident.severity === "maintenance" ? "maintenance" : incident.severity === "major" ? "outage" : "degradation",
      severityUi: incident.severity === "major" ? "major" : "minor",
      serviceKey: incident.serviceKey,
      description: incident.description ?? "",
      publicMessage: incident.publicMessage ?? "",
      status: incident.status,
    });
    setDialogOpen(true);
  };

  const submitIncident = async (publish: boolean) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload: StatusIncidentInput = {
      serviceKey: form.serviceKey,
      title: form.title.trim(),
      severity: mapSeverity(form),
      description: form.description.trim() || undefined,
      publicMessage: form.publicMessage.trim() || undefined,
      status: publish ? form.status : "investigating",
      isPublic: true,
    };
    try {
      if (editingId) {
        await adminApi.updateStatusIncident(editingId, payload);
        toast.success("Incident updated");
      } else {
        await adminApi.createStatusIncident(payload);
        toast.success(publish ? "Incident published" : "Incident created");
      }
      setDialogOpen(false);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resolveIncident = async (id: string) => {
    if (!window.confirm("Mark this incident as resolved?")) return;
    try {
      await adminApi.resolveStatusIncident(id);
      toast.success("Incident resolved");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resolve failed");
    }
  };

  const tone = overallTone(overall);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        eyebrow="Platform"
        title="Operations Center"
        description="Monitor services, manage incidents, and publish status updates to the public page."
        actions={
          <>
            <a
              href="https://novasafe.io/status"
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3.5 rounded-md text-sm font-medium inline-flex items-center gap-1.5 bg-card border border-input text-foreground hover:bg-accent"
            >
              <ExternalLink className="w-4 h-4" />
              Public status page
            </a>
            {canEdit && (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Create incident
              </Button>
            )}
          </>
        }
      />

      {!canEdit && <ReadOnlyBanner />}

      {error && (
        <Card className="p-4 mb-6 border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
          <p className="text-xs text-muted-foreground mt-2">
            On the VPS, set <code className="font-mono">CORE_API_URL=http://novasafe-mobile-vault:3124</code> in admin-api
            .env and restart the container.
          </p>
        </Card>
      )}

      {/* Global status banner */}
      <Card
        className={cn(
          "p-6 mb-6 border-l-4 bg-gradient-to-r from-card to-card/50",
          tone === "success" && "border-l-success",
          tone === "warning" && "border-l-warning",
          tone === "danger" && "border-l-destructive",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                tone === "success" && "bg-success/15 text-success",
                tone === "warning" && "bg-warning/15 text-warning",
                tone === "danger" && "bg-destructive/15 text-destructive",
              )}
            >
              {tone === "success" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{overallLabel(overall)}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Updated {overview?.updatedAt ? formatTime(overview.updatedAt) : "—"}
                {" · "}
                {activeIncidents.length} active incident{activeIncidents.length !== 1 ? "s" : ""}
                {" · "}
                {maintenance.length} scheduled maintenance
              </p>
            </div>
          </div>
          <Badge tone={tone}>{overall === "operational" ? "Operational" : overall}</Badge>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatTile
          label="Operational services"
          value={services.filter((s) => s.status === "operational").length}
          sub={`of ${services.length} monitored`}
          icon={<Activity className="w-4 h-4" />}
        />
        <StatTile
          label="Active incidents"
          value={activeIncidents.length}
          sub={activeIncidents.length ? "Needs attention" : "None open"}
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <StatTile
          label="Scheduled maintenance"
          value={maintenance.length}
          sub={maintenance.length ? "Upcoming" : "None scheduled"}
          icon={<CalendarClock className="w-4 h-4" />}
        />
        <StatTile
          label="90-day uptime"
          value={avgUptime(services)}
          sub="Platform average"
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* Services */}
      <section id="services" className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Services</h3>
        </div>
        {loading && !services.length ? (
          <Card className="p-10 text-center text-muted-foreground text-sm">Loading services…</Card>
        ) : services.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <Server className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">No services registered</p>
            <p className="text-sm text-muted-foreground mt-1">Core seeds a default REST API service on startup.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} canEdit={canEdit} onUpdate={() => openCreate()} />
            ))}
          </div>
        )}
      </section>

      {/* Active incidents */}
      <section id="incidents" className="mb-10">
        <h3 className="text-base font-semibold text-foreground mb-4">Active incidents</h3>
        {activeIncidents.length === 0 ? (
          <Card className="p-10 text-center border-dashed bg-card/40">
            <CheckCircle2 className="w-8 h-8 mx-auto text-success mb-3" />
            <p className="font-medium text-foreground">No active incidents</p>
            <p className="text-sm text-muted-foreground mt-1">All services are running normally.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                canEdit={canEdit}
                variant="active"
                onResolve={resolveIncident}
                onUpdate={openEdit}
              />
            ))}
          </div>
        )}
      </section>

      {/* Maintenance */}
      <section id="maintenance" className="mb-10">
        <h3 className="text-base font-semibold text-foreground mb-4">Scheduled maintenance</h3>
        {maintenance.length === 0 ? (
          <Card className="p-10 text-center border-dashed bg-card/40">
            <Wrench className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">No scheduled maintenance</p>
            <p className="text-sm text-muted-foreground mt-1">Create a maintenance window to notify users in advance.</p>
            {canEdit && (
              <Button className="mt-4" variant="secondary" onClick={() => { setForm({ ...EMPTY_FORM, incidentType: "maintenance" }); setDialogOpen(true); }}>
                Schedule maintenance
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {maintenance.map((item) => (
              <IncidentCard
                key={item.id}
                incident={item}
                canEdit={canEdit}
                variant="maintenance"
                onResolve={resolveIncident}
                onUpdate={openEdit}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent updates timeline */}
      <section>
        <h3 className="text-base font-semibold text-foreground mb-4">Recent status updates</h3>
        {recentUpdates.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">No status updates yet.</Card>
        ) : (
          <Card className="p-5 bg-card/50">
            <div className="relative pl-6 border-l border-primary/20 space-y-6">
              {recentUpdates.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <time className="text-xs text-muted-foreground tabular-nums">{formatTime(item.updatedAt)}</time>
                  <p className="text-sm font-medium text-foreground mt-0.5">{item.publicMessage || item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {item.status} · {item.serviceName}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Update incident" : "Create incident"}</DialogTitle>
            <DialogDescription>
              Publish a status update to the public status page. Users will see this on novasafe.io/status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="API latency degradation" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Incident type</label>
                <Select
                  value={form.incidentType}
                  onChange={(e) => setForm({ ...form, incidentType: e.target.value as IncidentForm["incidentType"] })}
                >
                  <option value="outage">Outage</option>
                  <option value="degradation">Degradation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security event</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</label>
                <Select
                  value={form.severityUi}
                  onChange={(e) => setForm({ ...form, severityUi: e.target.value as IncidentForm["severityUi"] })}
                  disabled={form.incidentType === "maintenance"}
                >
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Affected service</label>
              <Select value={form.serviceKey} onChange={(e) => setForm({ ...form, serviceKey: e.target.value })}>
                {services.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
                {!services.length && <option value="api">REST API</option>}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description (internal)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm"
                placeholder="Internal notes for operators…"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Public message</label>
              <textarea
                value={form.publicMessage}
                onChange={(e) => setForm({ ...form, publicMessage: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm"
                placeholder="Message shown on the public status page…"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as IncidentForm["status"] })}
              >
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" disabled={saving} onClick={() => void submitIncident(false)}>
              Save draft
            </Button>
            <Button disabled={saving} onClick={() => void submitIncident(true)}>
              Publish update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
