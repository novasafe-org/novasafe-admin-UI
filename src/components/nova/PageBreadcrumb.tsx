import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  analytics: "Analytics",
  users: "Users",
  subscriptions: "Subscriptions",
  devices: "Devices",
  support: "Support",
  security: "Security Center",
  audit: "Audit Logs",
  rbac: "Roles & Permissions",
  content: "Blog",
  docs: "Documentation",
  changelog: "Changelog",
  announcements: "Announcements",
  system: "System Status",
  settings: "Settings",
};

export function PageBreadcrumb() {
  const { pathname } = useLocation();
  const { pageTitle } = useLayout();
  const segs = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; to: string }[] = [{ label: "Home", to: "/" }];
  let acc = "";
  segs.forEach((s, i) => {
    acc += `/${s}`;
    const isLast = i === segs.length - 1;
    const label = isLast && pageTitle
      ? pageTitle
      : LABELS[s] ?? decodeURIComponent(s);
    crumbs.push({ label, to: acc });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-muted-foreground overflow-x-auto">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.to} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            {isLast ? (
              <span className="text-foreground font-medium">{i === 0 ? <Home className="w-3.5 h-3.5" /> : c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-foreground transition-colors">
                {i === 0 ? <Home className="w-3.5 h-3.5" /> : c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
