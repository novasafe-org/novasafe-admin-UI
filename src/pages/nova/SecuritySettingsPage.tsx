import { FormEvent, useState } from "react";
import { MonitorSmartphone, ShieldCheck, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Button, Input, Badge } from "@/components/nova/ui";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

const recent = [
  { id: 1, device: "MacBook Pro · Chrome", location: "Bengaluru, IN", ip: "103.21.244.18", time: "2 hours ago", current: true },
  { id: 2, device: "iPhone 15 · Safari", location: "Bengaluru, IN", ip: "103.21.244.91", time: "Yesterday, 9:14 PM", current: false },
  { id: 3, device: "Windows · Firefox", location: "Mumbai, IN", ip: "117.196.42.10", time: "3 days ago", current: false },
  { id: 4, device: "Android · NovaSafe App", location: "Bengaluru, IN", ip: "103.21.244.18", time: "1 week ago", current: false },
];

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!cur || !n1 || n1 !== n2) {
      toast.error("Please complete all fields. New passwords must match.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.changePassword(cur, n1);
      setCur(""); setN1(""); setN2("");
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <PageHeader eyebrow="Account" title="Security" description="Manage your password, sessions and 2-step verification." />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Change password</h2>
        </div>
        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Field label="Current password"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className="w-full h-10" /></Field>
          <div />
          <Field label="New password"><Input type="password" value={n1} onChange={(e) => setN1(e.target.value)} className="w-full h-10" /></Field>
          <Field label="Confirm new password"><Input type="password" value={n2} onChange={(e) => setN2(e.target.value)} className="w-full h-10" /></Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Update password"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Two-factor authentication</h2>
              <Badge tone={twoFA ? "success" : "muted"}>{twoFA ? "Enabled" : "Disabled"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg">
              Add an extra layer of security to your account by requiring a verification code in
              addition to your password.
            </p>
          </div>
          <Button variant={twoFA ? "secondary" : "primary"} onClick={() => { setTwoFA((v) => !v); toast.success(twoFA ? "2FA disabled" : "2FA enabled"); }}>
            {twoFA ? "Disable" : "Enable"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MonitorSmartphone className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Recent sessions</h2>
        </div>
        <div className="divide-y divide-border">
          {recent.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <MonitorSmartphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground flex items-center gap-2">
                  {s.device}
                  {s.current && <Badge tone="success"><CheckCircle2 className="w-3 h-3 mr-0.5" />Current</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{s.location} · {s.ip} · {s.time}</div>
              </div>
              {!s.current && (
                <button className="text-xs font-medium text-destructive hover:underline" onClick={() => toast.success("Session revoked")}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
