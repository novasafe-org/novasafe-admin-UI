import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { changelog } from "@/lib/mockData";
import { Plus, ExternalLink } from "lucide-react";

const toneFor = (t: string) => t === "Feature" ? "primary" : t === "Security" ? "danger" : t === "Bug Fix" ? "warning" : "info";

export default function ChangelogPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Changelog"
        description="Public release notes and product updates."
        actions={<><Button variant="secondary"><ExternalLink className="w-4 h-4" />View public page</Button><Button><Plus className="w-4 h-4" />New release</Button></>}
      />

      <div className="space-y-4">
        {changelog.map((c) => (
          <Card key={c.version} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">v{c.version}</span>
                  <Badge tone={toneFor(c.type) as any}>{c.type}</Badge>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.body}</p>
              </div>
              <Button variant="ghost">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
