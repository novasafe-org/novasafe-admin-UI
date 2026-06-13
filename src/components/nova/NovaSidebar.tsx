import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, ShieldCheck, MonitorSmartphone, FileText,
  BookOpen, Megaphone, Bell, LifeBuoy, BarChart3, Activity, ScrollText,
  Lock, Settings, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNova, Permission } from "@/context/NovaContext";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: any; perm?: Permission };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/analytics", label: "Analytics", icon: BarChart3, perm: "analytics.read" },
    ],
  },
  {
    title: "Customers",
    items: [
      { to: "/users", label: "Users", icon: Users, perm: "users.read" },
      { to: "/subscriptions", label: "Subscriptions", icon: CreditCard, perm: "billing.read" },
      { to: "/devices", label: "Devices", icon: MonitorSmartphone, perm: "users.read" },
      { to: "/support", label: "Support", icon: LifeBuoy, perm: "support.manage" },
    ],
  },
  {
    title: "Security",
    items: [
      { to: "/security", label: "Security Center", icon: ShieldCheck, perm: "security.read" },
      { to: "/audit", label: "Audit Logs", icon: ScrollText, perm: "audit.read" },
      { to: "/rbac", label: "Roles & Permissions", icon: Lock, perm: "rbac.manage" },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/content", label: "Blog", icon: FileText, perm: "content.manage" },
      { to: "/docs", label: "Documentation", icon: BookOpen, perm: "docs.manage" },
      { to: "/changelog", label: "Changelog", icon: Sparkles, perm: "announcements.manage" },
      { to: "/announcements", label: "Announcements", icon: Megaphone, perm: "announcements.manage" },
    ],
  },
  {
    title: "Platform",
    items: [
      { to: "/system", label: "System Status", icon: Activity, perm: "system.read" },
      { to: "/settings", label: "Settings", icon: Settings, perm: "settings.read" },
    ],
  },
];

export function NovaSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { can } = useNova();
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 z-30 shrink-0",
        collapsed ? "w-[64px]" : "w-[244px]",
      )}
    >
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-foreground text-[14px]">NovaSafe</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {groups.map((g) => {
          const visible = g.items.filter((i) => !i.perm || can(i.perm));
          if (!visible.length) return null;
          return (
            <div key={g.title}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                  {g.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-[16px] h-[16px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2.5 m-2 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-sidebar-accent border-t border-sidebar-border pt-3"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
