import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge, Button, Card, PageHeader, StatTile } from "@/components/nova/ui";
import { users, devices, auditLogs } from "@/lib/mockData";
import { useLayout } from "@/context/LayoutContext";
import { ArrowLeft, Mail, Ban, LogOut, Trash2, KeyRound, FileText, ShieldCheck, ShieldOff } from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const user = users.find((u) => u.id === id) ?? users[0];
  const userDevices = devices.filter((d) => d.user === user.email);
  const userLogs = auditLogs.filter((l) => l.target === user.email).slice(0, 8);
  const { setPageTitle } = useLayout();
  useEffect(() => {
    setPageTitle(user.name);
    return () => setPageTitle(null);
  }, [user.name, setPageTitle]);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" />Back to users</Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-primary text-primary-foreground text-xl font-semibold flex items-center justify-center">{user.name[0]}</div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Badge tone={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
              <Badge tone="info">{user.plan}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary"><Mail className="w-4 h-4" />Email</Button>
          <Button variant="secondary"><LogOut className="w-4 h-4" />Force logout</Button>
          <Button variant="secondary"><Ban className="w-4 h-4" />Suspend</Button>
          <Button variant="danger"><Trash2 className="w-4 h-4" />Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="Security score" value={user.securityScore} sub={user.twoFA ? "2FA enabled" : "2FA off"} trend={user.twoFA ? "up" : "down"} icon={user.twoFA ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />} />
        <StatTile label="Vault items" value={user.vaultItems} sub="Passwords, notes, cards" icon={<KeyRound className="w-4 h-4" />} />
        <StatTile label="Devices" value={user.devices} sub={`${userDevices.filter((d) => d.status === "online").length} online`} />
        <StatTile label="Storage" value={`${user.storageMb} MB`} sub="of 5 GB" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-3">Devices</h3>
          <div className="space-y-2">
            {userDevices.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No devices for this user.</div>}
            {userDevices.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm text-foreground font-medium">{d.type} · {d.os}</div>
                  <div className="text-xs text-muted-foreground">{d.browser} · {d.country}</div>
                </div>
                <Badge tone={d.status === "online" ? "success" : "muted"}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Account info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">ID</dt><dd className="font-mono text-xs text-foreground">{user.id}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Joined</dt><dd className="text-foreground">{new Date(user.joined).toLocaleDateString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Last login</dt><dd className="text-foreground">{new Date(user.lastLogin).toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{user.country}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="text-foreground">{user.plan}</dd></div>
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h3 className="font-semibold text-foreground mb-3">Activity</h3>
          <div className="space-y-2">
            {userLogs.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No recent activity.</div>}
            {userLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground">{l.action}</span>
                  <span className="text-muted-foreground">by {l.actor}</span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
