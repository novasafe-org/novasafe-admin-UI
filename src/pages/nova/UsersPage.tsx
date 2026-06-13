import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Input, PageHeader, Select, Toolbar } from "@/components/nova/ui";
import { users } from "@/lib/mockData";
import { Download, Filter, ShieldCheck, ShieldOff, Plus } from "lucide-react";

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => users.filter((u) => {
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (plan && u.plan !== plan) return false;
    if (status && u.status !== status) return false;
    return true;
  }), [q, plan, status]);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Customers"
        title="User directory"
        description={`${users.length.toLocaleString()} accounts across all plans and regions.`}
        actions={<>
          <Button variant="secondary"><Download className="w-4 h-4" />Export CSV</Button>
          <Button><Plus className="w-4 h-4" />Invite user</Button>
        </>}
      />

      <Toolbar>
        <Input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">All plans</option>
          <option>Free</option><option>Pro Monthly</option><option>Pro Yearly</option><option>Lifetime</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option><option value="suspended">Suspended</option><option value="invited">Invited</option>
        </Select>
        <Button variant="ghost"><Filter className="w-4 h-4" />More filters</Button>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {users.length}</div>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="text-left px-4 py-2.5 font-semibold">User</th>
                <th className="text-left px-4 py-2.5 font-semibold">Plan</th>
                <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold">Country</th>
                <th className="text-right px-4 py-2.5 font-semibold">Devices</th>
                <th className="text-right px-4 py-2.5 font-semibold">Vault</th>
                <th className="text-center px-4 py-2.5 font-semibold">2FA</th>
                <th className="text-right px-4 py-2.5 font-semibold">Score</th>
                <th className="text-left px-4 py-2.5 font-semibold">Last login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <Link to={`/users/${u.id}`} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{u.name[0]}</div>
                      <div>
                        <div className="text-foreground font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={u.plan === "Free" ? "muted" : u.plan === "Lifetime" ? "primary" : "info"}>{u.plan}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.country}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{u.devices}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{u.vaultItems}</td>
                  <td className="px-4 py-2.5 text-center">{u.twoFA ? <ShieldCheck className="w-4 h-4 text-success inline" /> : <ShieldOff className="w-4 h-4 text-muted-foreground inline" />}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className={u.securityScore >= 80 ? "text-success" : u.securityScore >= 60 ? "text-warning" : "text-destructive"}>{u.securityScore}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(u.lastLogin).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
