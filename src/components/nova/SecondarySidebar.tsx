import { useLocation, useNavigate } from "react-router-dom";
import { getSecondaryNav } from "./secondaryNav";
import { cn } from "@/lib/utils";

export function SecondarySidebar() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const nav = getSecondaryNav(pathname);
  if (!nav) return null;

  const currentFull = `${pathname}${search}${hash}`;

  return (
    <aside className="hidden md:flex w-[224px] shrink-0 h-screen sticky top-0 flex-col border-r border-border bg-card/40">
      <div className="h-14 flex flex-col justify-center px-4 border-b border-border">
        <div className="text-[13px] font-semibold text-foreground leading-tight">{nav.title}</div>
        {nav.description && (
          <div className="text-[11px] text-muted-foreground mt-0.5">{nav.description}</div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {nav.groups.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                {g.title}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = currentFull === item.to ||
                  (item.to.includes("?") && currentFull.startsWith(item.to.split("?")[0]) && search.includes(item.to.split("?")[1] ?? ""));
                return (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                      active && "bg-accent text-foreground font-medium",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
