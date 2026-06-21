import { Button, Card, Input, PageHeader, ReadOnlyBanner, Select } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { Building2, Mail, Bell, CreditCard, Flag, Key, Plug, ShieldCheck } from "lucide-react";

const sections = [
  { icon: Building2, title: "Branding & company", desc: "Logo, brand colors, public company profile." },
  { icon: Mail, title: "Email templates", desc: "Customize transactional and marketing emails." },
  { icon: Bell, title: "Notifications", desc: "Configure alerts and notification channels." },
  { icon: CreditCard, title: "Plans & pricing", desc: "Manage your Free, Pro and Lifetime plans." },
  { icon: Flag, title: "Feature flags", desc: "Toggle features per environment or cohort." },
  { icon: Key, title: "API keys", desc: "Issue and rotate keys for your backend services." },
  { icon: Plug, title: "Integrations", desc: "Stripe, Slack, PagerDuty, Datadog and more." },
  { icon: ShieldCheck, title: "Security policies", desc: "Password rules, session timeout, IP allowlists." },
];

export default function SettingsPage() {
  const { can } = useNova();
  const canEdit = can("settings.manage");
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader eyebrow="Platform" title="Settings" description="System-wide configuration for NovaSafe." />
      {!canEdit && <ReadOnlyBanner />}

      <Card className="p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Company profile</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground block mb-1.5">Company name</label><Input defaultValue="NovaSafe, Inc." disabled={!canEdit} /></div>
          <div><label className="text-xs text-muted-foreground block mb-1.5">Public domain</label><Input defaultValue="novasafe.io" disabled={!canEdit} /></div>
          <div><label className="text-xs text-muted-foreground block mb-1.5">Support email</label><Input defaultValue="support@novasafe.io" disabled={!canEdit} /></div>
          <div><label className="text-xs text-muted-foreground block mb-1.5">Default region</label><Select disabled={!canEdit}><option>us-east-1</option><option>eu-west-1</option><option>ap-south-1</option></Select></div>
        </div>
        {canEdit && <div className="mt-4 flex justify-end"><Button>Save changes</Button></div>}
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {sections.map((s) => (
          <Card key={s.title} className="p-4 flex items-start gap-3 hover:shadow-elevated transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><s.icon className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground">{s.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
