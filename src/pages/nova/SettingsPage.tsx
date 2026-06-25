import { useEffect, useState } from "react";
import { Button, Card, Input, PageHeader, ReadOnlyBanner, Select } from "@/components/nova/ui";
import { useNova } from "@/context/NovaContext";
import { useBuildMetadata } from "@/hooks/useBuildMetadata";
import { adminApi } from "@/lib/api";
import { Building2, Mail, Bell, CreditCard, Flag, Key, Plug, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

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

type Member = { id: string; email: string; name: string; role: string; status: string };

export default function SettingsPage() {
  const { can } = useNova();
  const build = useBuildMetadata();
  const canEdit = can("settings.manage");
  const canInvite = can("settings.manage");
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    adminApi.teamMembers().then(setMembers).catch(() => {});
  }, []);

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    try {
      const result = await adminApi.createInvite(email, inviteRole);
      setInviteEmail("");
      if (result.emailSent) {
        setInviteLink(null);
        toast.success(`Invite email sent to ${email}`);
      } else {
        setInviteLink(result.inviteUrl);
        toast.success("Invite created — copy the link below (email not configured)");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invite");
    }
  };

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

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Team & invites</h3>
        </div>

        <div className="space-y-2 mb-4">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="font-medium text-foreground">{m.name || m.email}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="text-xs text-muted-foreground capitalize">{m.role} · {m.status}</div>
            </div>
          ))}
          {!members.length && <p className="text-sm text-muted-foreground">No team members loaded.</p>}
        </div>

        {canInvite && (
          <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Invite email</label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@novasafe.io" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Role</label>
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </Select>
            </div>
            <Button onClick={() => void sendInvite()} disabled={!inviteEmail.trim()}>
              <UserPlus className="w-4 h-4" />Invite
            </Button>
          </div>
        )}
        {inviteLink && (
          <p className="text-xs text-muted-foreground mt-3">Invite link: {inviteLink}</p>
        )}
      </Card>

      <Card className="p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">About</h3>
        {build ? (
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Version</dt>
              <dd className="mt-1 font-mono text-foreground">v{build.version}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Build</dt>
              <dd className="mt-1 font-mono text-foreground">{build.build}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Commit</dt>
              <dd className="mt-1 font-mono text-foreground">{build.commit}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Released at</dt>
              <dd className="mt-1 text-foreground">
                {new Date(build.releasedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Loading build metadata…</p>
        )}
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
