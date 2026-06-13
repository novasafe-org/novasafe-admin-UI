import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { announcements } from "@/lib/mockData";
import { Plus, Megaphone } from "lucide-react";

const toneFor = (t: string) => t === "Maintenance" ? "warning" : t === "Downtime" ? "danger" : t === "Feature" ? "primary" : "info";

export default function AnnouncementsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
      <PageHeader
        eyebrow="Content"
        title="Announcements"
        description="In-product banners and email notices to your users."
        actions={<Button><Plus className="w-4 h-4" />New announcement</Button>}
      />

      <div className="grid gap-3">
        {announcements.map((a) => (
          <Card key={a.id} className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge tone={toneFor(a.type) as any}>{a.type}</Badge>
                <span className="text-xs text-muted-foreground">{a.date} · Audience: {a.audience}</span>
              </div>
              <h3 className="font-medium text-foreground mt-1">{a.title}</h3>
            </div>
            <Button variant="ghost">Edit</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
