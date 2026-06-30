import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, ShieldCheck, MonitorSmartphone, FileText,
  BookOpen, Megaphone, LifeBuoy, BarChart3, Activity, ScrollText,
  Lock, Settings, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { AdminBrand, AdminLogo } from "@/components/brand/AdminLogo";
import { useNova, Permission } from "@/context/NovaContext";
import { useLayout } from "@/context/LayoutContext";
import { getSecondaryNav } from "./secondaryNav";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
      { to: "/changelog", label: "Changelog", icon: Sparkles, perm: "changelog.read" },
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
  const { primaryCollapsed, setPrimaryCollapsed, togglePrimary } = useLayout();
  const { can } = useNova();
  const { pathname } = useLocation();
  const collapsed = primaryCollapsed;

  const handleNavClick = (to: string) => {
    // Auto-collapse primary when navigating to a route that has a secondary sidebar
    if (to !== pathname && getSecondaryNav(to)) {
      setPrimaryCollapsed(true);
    }
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 z-30 shrink-0",
        collapsed ? "w-[64px]" : "w-[244px]",
      )}
    >
      <button
        onClick={togglePrimary}
        className="h-14 flex items-center px-4 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {collapsed ? <AdminLogo size="sm" /> : <AdminBrand size="sm" subtitle="Admin" />}
        </div>
      </button>

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
                  const link = (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => handleNavClick(item.to)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                        collapsed && "justify-center px-0",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                      )}
                    >
                      <item.icon className="w-[16px] h-[16px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                  if (collapsed) {
                    return (
                      <TooltipProvider key={item.to} delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }
                  return link;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <button
        onClick={togglePrimary}
        className={cn(
          "flex items-center gap-2.5 m-2 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-sidebar-accent border-t border-sidebar-border pt-3",
          collapsed && "justify-center",
        )}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
