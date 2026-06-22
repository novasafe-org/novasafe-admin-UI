import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge, Button, Card, PageHeader, StatTile } from "@/components/nova/ui";
import { adminApi, type CustomerUser } from "@/lib/api";
import { useLayout } from "@/context/LayoutContext";
import { ArrowLeft, Mail, ShieldCheck, ShieldOff, KeyRound } from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setPageTitle } = useLayout();

  useEffect(() => {
    if (!id) return;
    adminApi
      .getUser(id)
      .then((u) => {
        setUser(u);
        setPageTitle(u.name);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "User not found"));
    return () => setPageTitle(null);
  }, [id, setPageTitle]);

  if (error) {
    return (
      <div className="p-8">
        <Link to="/users" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to users
        </Link>
        <p className="mt-4 text-destructive">{error}</p>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-muted-foreground">Loading user…</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to users
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-primary text-primary-foreground text-xl font-semibold flex items-center justify-center">
            {user.name[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Badge tone={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
              <Badge tone="info">{user.plan}</Badge>
            </div>
          </div>
        </div>
        <Button variant="secondary" disabled>
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile
          label="Security score"
          value={user.securityScore}
          sub={user.twoFA ? "2FA enabled" : "2FA off"}
          trend={user.twoFA ? "up" : "down"}
          icon={user.twoFA ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
        />
        <StatTile label="Vault items" value={user.vaultItems} sub="Passwords, notes, cards" icon={<KeyRound className="w-4 h-4" />} />
        <StatTile label="Devices" value={user.devices} sub="Registered devices" />
        <StatTile label="Country" value={user.country} sub="Region" />
      </div>

      <Card className="p-5">
        <PageHeader eyebrow="Account" title="Profile details" />
        <dl className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="text-foreground font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last login</dt>
            <dd className="text-foreground font-medium">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="text-foreground font-mono text-xs">{user.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-foreground font-medium">{user.plan}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
