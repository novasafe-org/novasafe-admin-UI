import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  ExternalLink,
  Search,
  ChevronDown,
  Copy,
  Pencil,
  Trash2,
  Eye,
  Rocket,
  Sparkles,
  Calendar,
  Tag,
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
  Toolbar,
} from "@/components/nova/ui";
import { adminApi, type ChangelogCategory, type ChangelogRelease, type ChangelogStatus } from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: ChangelogCategory; label: string }[] = [
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "security", label: "Security" },
  { value: "bugfix", label: "Bug Fix" },
  { value: "performance", label: "Performance" },
];

const CATEGORY_LABEL: Record<string, string> = {
  feature: "Feature",
  improvement: "Improvement",
  security: "Security",
  bugfix: "Bug Fix",
  performance: "Performance",
};

function categoryTone(cat: string): "primary" | "danger" | "warning" | "info" | "success" {
  if (cat === "security") return "danger";
  if (cat === "bugfix") return "warning";
  if (cat === "feature") return "primary";
  if (cat === "performance") return "success";
  return "info";
}

function statusTone(status: ChangelogStatus): "success" | "muted" | "warning" {
  if (status === "published") return "success";
  if (status === "scheduled") return "warning";
  return "muted";
}

function formatRelative(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function monthKey(date: string | null): string {
  if (!date) return "Unscheduled";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function noteStats(notes: string[], tags: string[]) {
  const improvements = notes.filter((n) => /improv/i.test(n)).length;
  const fixes = notes.filter((n) => /fix|bug/i.test(n)).length;
  const security = notes.filter((n) => /secur/i.test(n)).length;
  const parts: string[] = [];
  if (improvements) parts.push(`${improvements} Improvement${improvements > 1 ? "s" : ""}`);
  if (fixes) parts.push(`${fixes} Fix${fixes > 1 ? "es" : ""}`);
  if (security) parts.push(`${security} Security`);
  if (!parts.length && tags.length) parts.push(`${tags.length} tag${tags.length > 1 ? "s" : ""}`);
  if (!parts.length && notes.length) parts.push(`${notes.length} note${notes.length > 1 ? "s" : ""}`);
  return parts;
}

const emptyForm = {
  version: "",
  title: "",
  category: "feature" as ChangelogCategory,
  summary: "",
  content_markdown: "",
  tags: "",
  isPublic: true,
  publishedAt: "",
};

export default function ChangelogPage() {
  const [searchParams] = useSearchParams();
  const { can } = useNova();
  const canEdit = can("changelog.manage");

  const [items, setItems] = useState<ChangelogRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .changelogList()
      .then(setItems)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load releases"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCategoryFilter(searchParams.get("category") || "");
    setStatusFilter(searchParams.get("status") || "");
  }, [searchParams]);

  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === "published");
    const latest = [...items].sort((a, b) => {
      const da = a.publishedAt || a.createdAt;
      const db = b.publishedAt || b.createdAt;
      return new Date(db).getTime() - new Date(da).getTime();
    })[0];
    const lastPublished = published
      .map((i) => i.publishedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];
    return {
      total: items.length,
      latestVersion: latest ? `v${latest.version}` : "—",
      lastPublished: formatRelative(lastPublished ?? null),
    };
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (statusFilter) list = list.filter((i) => i.status === statusFilter);
    if (categoryFilter) list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.version.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt).getTime();
      const db = new Date(b.publishedAt || b.createdAt).getTime();
      return sort === "latest" ? db - da : da - db;
    });
    return list;
  }, [items, statusFilter, categoryFilter, search, sort]);

  const timeline = useMemo(() => {
    const map = new Map<string, ChangelogRelease[]>();
    for (const item of filtered) {
      const key = monthKey(item.publishedAt || item.createdAt);
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [filtered]);

  const saveDraft = async () => {
    if (!form.version.trim() || !form.title.trim()) {
      toast.error("Version and title are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createChangelog({
        version: form.version.trim(),
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content_markdown: form.content_markdown,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublic: form.isPublic,
        status: "draft",
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      });
      toast.success("Draft saved");
      setForm(emptyForm);
      setComposerOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const publishRelease = async () => {
    if (!form.version.trim() || !form.title.trim()) {
      toast.error("Version and title are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createChangelog({
        version: form.version.trim(),
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content_markdown: form.content_markdown,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublic: form.isPublic,
        status: "published",
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
      });
      toast.success("Release published");
      setForm(emptyForm);
      setComposerOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const duplicateRelease = async (release: ChangelogRelease) => {
    try {
      await adminApi.createChangelog({
        version: `${release.version}-copy`,
        title: `${release.title} (copy)`,
        category: release.category,
        summary: release.summary,
        content_markdown: release.content_markdown,
        tags: release.tags,
        isPublic: release.isPublic,
        status: "draft",
      });
      toast.success("Release duplicated as draft");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    }
  };

  const deleteRelease = async (release: ChangelogRelease) => {
    if (!window.confirm(`Delete release v${release.version}?`)) return;
    try {
      await adminApi.deleteChangelog(release.id);
      toast.success("Release deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Changelog"
        description="Ship release notes to your users — draft, schedule, and publish product updates."
        actions={
          <>
            <a
              href="https://novasafe.io/changelog"
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3.5 rounded-md text-sm font-medium transition-all inline-flex items-center gap-1.5 bg-card border border-input text-foreground hover:bg-accent"
            >
              <ExternalLink className="w-4 h-4" />
              View public page
            </a>
            {canEdit && (
              <Button onClick={() => setComposerOpen((o) => !o)}>
                <Plus className="w-4 h-4" />
                New release
              </Button>
            )}
          </>
        }
      />

      {!canEdit && <ReadOnlyBanner />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatTile label="Releases" value={stats.total} icon={<Sparkles className="w-4 h-4" />} />
        <StatTile label="Latest" value={stats.latestVersion} icon={<Rocket className="w-4 h-4" />} />
        <StatTile label="Published" value={stats.lastPublished} icon={<Calendar className="w-4 h-4" />} />
      </div>

      {canEdit && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out mb-6",
            composerOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <Card className="p-6 border-primary/20 bg-gradient-to-b from-card to-card/60 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">New release</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Compose a release note — save as draft or publish immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Collapse composer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Version</label>
                <Input
                  placeholder="1.8.0"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ChangelogCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Release title</label>
              <Input
                placeholder="Passkey Support"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</label>
              <Input
                placeholder="One-line summary for listings"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Release notes (markdown)</label>
              <textarea
                value={form.content_markdown}
                onChange={(e) => setForm({ ...form, content_markdown: e.target.value })}
                rows={8}
                placeholder="- Added passkey sign-in&#10;- Fixed vault sync on Android"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/40 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</label>
                <Input
                  placeholder="security, mobile"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Visibility</label>
                <Select
                  value={form.isPublic ? "public" : "internal"}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.value === "public" })}
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Publish date</label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="secondary" disabled={saving} onClick={() => void saveDraft()}>
                Save draft
              </Button>
              <Button disabled={saving} onClick={() => void publishRelease()}>
                <Rocket className="w-4 h-4" />
                Publish release
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Toolbar>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search releases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="min-w-[140px]">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as "latest" | "oldest")} className="min-w-[120px]">
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </Select>
      </Toolbar>

      {loading && (
        <Card className="p-12 text-center text-muted-foreground text-sm">Loading releases…</Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="p-14 text-center border-dashed bg-card/40">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No releases yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Create your first release note to keep users informed about product updates.
          </p>
          {canEdit && (
            <Button className="mt-6" onClick={() => setComposerOpen(true)}>
              <Plus className="w-4 h-4" />
              Create release
            </Button>
          )}
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-10">
          {timeline.map(([month, releases]) => (
            <section key={month}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">{month}</h3>
                <div className="flex-1 h-px bg-border/80" />
              </div>

              <div className="space-y-4 pl-0 sm:pl-5">
                {releases.map((release) => {
                  const meta = noteStats(release.notes, release.tags);
                  const dateLabel = release.publishedAt
                    ? new Date(release.publishedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unscheduled";

                  return (
                    <Card
                      key={release.id}
                      className={cn(
                        "group p-5 transition-all duration-200",
                        "border-border/80 bg-card/70 backdrop-blur-sm",
                        "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="font-mono text-sm font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          v{release.version}
                        </span>
                        <Badge tone={categoryTone(release.category)}>{CATEGORY_LABEL[release.category] || release.category}</Badge>
                        <span className="text-xs text-muted-foreground">{dateLabel}</span>
                        <Badge tone={statusTone(release.status)}>{release.status}</Badge>
                        {!release.isPublic && <Badge tone="muted">Internal</Badge>}
                      </div>

                      <h4 className="text-xl font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {release.title}
                      </h4>
                      {release.summary && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">{release.summary}</p>
                      )}

                      {meta.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {meta.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"
                            >
                              <Tag className="w-3 h-3" />
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1 mt-5 pt-4 border-t border-border/50 opacity-80 group-hover:opacity-100 transition-opacity">
                        {release.status === "published" && release.isPublic && (
                          <a
                            href="https://novasafe.io/changelog"
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </a>
                        )}
                        {canEdit && (
                          <>
                            <Link
                              to={`/changelog/edit/${release.id}`}
                              className="h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => void duplicateRelease(release)}
                              className="h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteRelease(release)}
                              className="h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
