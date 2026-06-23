import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Rocket } from "lucide-react";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/nova/ui";
import { adminApi, type ChangelogCategory, type ChangelogStatus } from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: ChangelogCategory; label: string }[] = [
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "security", label: "Security" },
  { value: "bugfix", label: "Bug Fix" },
  { value: "performance", label: "Performance" },
];

export default function ChangelogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useNova();
  const canEdit = can("changelog.manage");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ChangelogCategory>("feature");
  const [summary, setSummary] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState<ChangelogStatus>("draft");
  const [publishedAt, setPublishedAt] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    adminApi
      .changelogGet(id)
      .then((release) => {
        setVersion(release.version);
        setTitle(release.title);
        setCategory(release.category);
        setSummary(release.summary);
        setContentMarkdown(release.content_markdown || release.notes.join("\n"));
        setTags((release.tags || []).join(", "));
        setIsPublic(release.isPublic);
        setStatus(release.status);
        setPublishedAt(release.publishedAt ? release.publishedAt.slice(0, 16) : "");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load release"))
      .finally(() => setLoading(false));
  }, [id]);

  const buildPayload = (nextStatus: ChangelogStatus) => ({
    version: version.trim(),
    title: title.trim(),
    category,
    summary: summary.trim(),
    content_markdown: contentMarkdown,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    isPublic,
    status: nextStatus,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : nextStatus === "published" ? new Date().toISOString() : null,
  });

  const save = async (nextStatus: ChangelogStatus) => {
    if (!canEdit) return;
    if (!version.trim() || !title.trim()) {
      toast.error("Version and title are required");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(nextStatus);
      if (id) {
        await adminApi.updateChangelog(id, payload);
        toast.success(nextStatus === "published" ? "Release published" : "Draft saved");
      } else {
        const created = await adminApi.createChangelog(payload);
        toast.success(nextStatus === "published" ? "Release published" : "Draft saved");
        navigate(`/changelog/edit/${created.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading release…
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto">
      <div className="mb-4">
        <Link to="/changelog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to changelog
        </Link>
      </div>

      <PageHeader
        eyebrow="Release editor"
        title={id ? "Edit release" : "New release"}
        description="Compose release notes, set visibility, and publish when ready."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary" disabled={saving} onClick={() => void save("draft")}>
                <Save className="w-4 h-4" />
                Save draft
              </Button>
              <Button disabled={saving} onClick={() => void save("published")}>
                <Rocket className="w-4 h-4" />
                Publish release
              </Button>
            </>
          ) : undefined
        }
      />

      <Card className="p-6 space-y-5 border-border/80 bg-card/80 backdrop-blur-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</label>
            <Input placeholder="e.g. 1.8.0" value={version} onChange={(e) => setVersion(e.target.value)} disabled={!canEdit} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as ChangelogCategory)} disabled={!canEdit}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Release title</label>
          <Input placeholder="Passkey Support" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</label>
          <Input placeholder="Short summary for cards and listings" value={summary} onChange={(e) => setSummary(e.target.value)} disabled={!canEdit} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Release notes (markdown)</label>
          <textarea
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            disabled={!canEdit}
            rows={12}
            placeholder="- Added passkey sign-in&#10;- Improved vault sync performance"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm text-foreground",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 font-mono leading-relaxed",
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
            <Input placeholder="security, mobile" value={tags} onChange={(e) => setTags(e.target.value)} disabled={!canEdit} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visibility</label>
            <Select value={isPublic ? "public" : "internal"} onChange={(e) => setIsPublic(e.target.value === "public")} disabled={!canEdit}>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publish date</label>
            <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} disabled={!canEdit} />
          </div>
        </div>

        {status !== "draft" && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge tone={status === "published" ? "success" : "warning"}>{status}</Badge>
          </div>
        )}
      </Card>
    </div>
  );
}
