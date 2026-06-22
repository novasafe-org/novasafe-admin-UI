import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, PageHeader, ReadOnlyBanner } from "@/components/nova/ui";
import { adminApi } from "@/lib/api";
import { useNova } from "@/context/NovaContext";
import { Plus, ExternalLink } from "lucide-react";

type Release = {
  id: string;
  version: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
};

const toneFor = (t: string) =>
  t === "feature" || t === "Feature" ? "primary" : t === "security" || t === "Security" ? "danger" : t === "bugfix" || t === "Bug Fix" ? "warning" : "info";

const labelFor = (t: string) => {
  if (t === "feature") return "Feature";
  if (t === "security") return "Security";
  if (t === "bugfix") return "Bug Fix";
  return t;
};

export default function ChangelogPage() {
  const { can } = useNova();
  const canEdit = can("changelog.manage");
  const [items, setItems] = useState<Release[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ version: "", title: "", category: "feature", summary: "" });

  const load = () => {
    adminApi.changelogList().then(setItems).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const createRelease = async () => {
    await adminApi.createChangelog(form);
    setShowForm(false);
    setForm({ version: "", title: "", category: "feature", summary: "" });
    load();
  };

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Changelog"
        description="Public release notes and product updates."
        actions={
          <>
            <Button variant="secondary" asChild>
              <a href="https://novasafe.io/changelog" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />View public page
              </a>
            </Button>
            {canEdit && (
              <Button onClick={() => setShowForm((s) => !s)}>
                <Plus className="w-4 h-4" />New release
              </Button>
            )}
          </>
        }
      />

      {!canEdit && <ReadOnlyBanner />}

      {showForm && canEdit && (
        <Card className="p-5 mb-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Version (e.g. 4.18.0)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <Input placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => void createRelease()}>Save release</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {items.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">v{c.version}</span>
                  <Badge tone={toneFor(c.category) as "primary"}>{labelFor(c.category)}</Badge>
                  <span className="text-xs text-muted-foreground">{c.publishedAt.slice(0, 10)}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.summary}</p>
              </div>
              {canEdit && <Button variant="ghost">Edit</Button>}
            </div>
          </Card>
        ))}
        {!items.length && (
          <Card className="p-8 text-center text-muted-foreground text-sm">No releases yet.</Card>
        )}
      </div>
    </div>
  );
}
