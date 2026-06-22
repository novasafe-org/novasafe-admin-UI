import { Link } from "react-router-dom";
import { Mail, Calendar, Clock, Shield, KeyRound } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/nova/ui";
import { useAuth } from "@/context/AuthContext";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Personal information and account details."
        actions={
          <Link to="/profile/security" className="h-9 px-3.5 rounded-md border border-input bg-card text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5">
            <Shield className="w-4 h-4" />Security
          </Link>
        }
      />

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary text-primary-foreground text-lg font-semibold flex items-center justify-center">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
              <Badge tone="primary">{user.role.toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</div>
          <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
          <Row icon={<KeyRound className="w-4 h-4" />} label="User ID" value={user.id} mono />
          <Row icon={<Shield className="w-4 h-4" />} label="Role" value={user.role} cap />
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Activity</div>
          <Row icon={<Calendar className="w-4 h-4" />} label="Member since" value={fmtDate(user.createdAt)} />
          <Row icon={<Clock className="w-4 h-4" />} label="Last login" value={fmtDate(user.lastLogin)} />
          <Row icon={<Shield className="w-4 h-4" />} label="2FA" value="Enabled" />
        </Card>
      </div>
    </div>
  );
}

function Row({ icon, label, value, mono, cap }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; cap?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground w-32">{label}</span>
      <span className={`text-sm text-foreground flex-1 ${mono ? "font-mono text-xs" : ""} ${cap ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
