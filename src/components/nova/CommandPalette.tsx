import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useNova } from "@/context/NovaContext";
import { users, blogPosts, docs, tickets } from "@/lib/mockData";
import { LayoutDashboard, Users, CreditCard, ShieldCheck, FileText, BookOpen, Settings, Activity, Megaphone, ScrollText, Sparkles, LifeBuoy, BarChart3, Lock, MonitorSmartphone } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/devices", label: "Devices", icon: MonitorSmartphone },
  { to: "/security", label: "Security Center", icon: ShieldCheck },
  { to: "/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/rbac", label: "Roles & Permissions", icon: Lock },
  { to: "/content", label: "Blog", icon: FileText },
  { to: "/docs", label: "Documentation", icon: BookOpen },
  { to: "/changelog", label: "Changelog", icon: Sparkles },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/system", label: "System Status", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useNova();
  const navigate = useNavigate();

  const go = (to: string) => {
    setPaletteOpen(false);
    navigate(to);
  };

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-start justify-center pt-24" onClick={() => setPaletteOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-[640px] max-w-[92vw] bg-popover border border-border rounded-xl shadow-elevated overflow-hidden">
        <Command label="Global search" className="[&_[cmdk-input]]:outline-none">
          <Command.Input autoFocus placeholder="Search across NovaSafe…" className="w-full px-4 py-3 bg-transparent text-sm text-foreground border-b border-border placeholder:text-muted-foreground" />
          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-muted-foreground text-center">No results.</Command.Empty>

            <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {nav.map((n) => (
                <Command.Item key={n.to} onSelect={() => go(n.to)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-foreground cursor-pointer aria-selected:bg-accent">
                  <n.icon className="w-4 h-4 text-muted-foreground" />
                  {n.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Users">
              {users.slice(0, 8).map((u) => (
                <Command.Item key={u.id} value={`user ${u.name} ${u.email}`} onSelect={() => go(`/users/${u.id}`)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-accent">
                  <div className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">{u.name[0]}</div>
                  <span className="text-foreground">{u.name}</span>
                  <span className="text-muted-foreground text-xs">{u.email}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Content">
              {blogPosts.map((p) => (
                <Command.Item key={p.id} value={`post ${p.title}`} onSelect={() => go("/content")} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-accent">
                  <FileText className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{p.title}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Docs">
              {docs.map((d) => (
                <Command.Item key={d.id} value={`doc ${d.title}`} onSelect={() => go("/docs")} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-accent">
                  <BookOpen className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{d.title}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Tickets">
              {tickets.slice(0, 6).map((t) => (
                <Command.Item key={t.id} value={`ticket ${t.subject}`} onSelect={() => go("/support")} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-accent">
                  <LifeBuoy className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{t.id}</span><span className="text-muted-foreground text-xs truncate">{t.subject}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
