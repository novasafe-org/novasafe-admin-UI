import { Badge, Card, Input, PageHeader, Select, StatusDot, Toolbar } from "@/components/nova/ui";
import { devices } from "@/lib/mockData";
import { useState } from "react";

export default function DevicesPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const filtered = devices.filter((d) => (!q || d.user.includes(q) || d.os.includes(q)) && (!type || d.type === type));

  const ext = devices.filter((d) => d.type === "Browser Extension").length;
  const and = devices.filter((d) => d.type === "Android").length;
  const web = devices.filter((d) => d.type === "Web").length;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Customers" title="Devices" description="All sessions and connected installations across platforms." />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Browser extensions</div><div className="text-2xl font-semibold mt-1 tabular-nums">{ext}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Android devices</div><div className="text-2xl font-semibold mt-1 tabular-nums">{and}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Web sessions</div><div className="text-2xl font-semibold mt-1 tabular-nums">{web}</div></Card>
      </div>

      <Toolbar>
        <Input placeholder="Search user, OS, browser…" value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option>Browser Extension</option><option>Android</option><option>Web</option>
        </Select>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left px-4 py-2.5">Device</th><th className="text-left px-4 py-2.5">User</th>
              <th className="text-left px-4 py-2.5">OS</th><th className="text-left px-4 py-2.5">Browser</th>
              <th className="text-left px-4 py-2.5">Version</th><th className="text-left px-4 py-2.5">Country</th>
              <th className="text-left px-4 py-2.5">Status</th><th className="text-left px-4 py-2.5">Last active</th>
            </tr></thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <div className="text-foreground font-medium">{d.type}</div>
                    <div className="text-xs text-muted-foreground font-mono">{d.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.user}</td>
                  <td className="px-4 py-2.5 text-foreground">{d.os}</td>
                  <td className="px-4 py-2.5 text-foreground">{d.browser}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{d.version}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.country}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><StatusDot status={d.status as any} /><span className="text-xs capitalize text-muted-foreground">{d.status}</span></div></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(d.lastActive).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
