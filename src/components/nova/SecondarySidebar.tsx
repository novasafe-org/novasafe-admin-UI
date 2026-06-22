import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSecondaryNav } from "./secondaryNav";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 224;
const STORAGE_KEY = "nova.secondarySidebar.width";

export function SecondarySidebar() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const nav = getSecondaryNav(pathname);

  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const v = Number(window.localStorage.getItem(STORAGE_KEY));
    return v >= MIN_WIDTH && v <= MAX_WIDTH ? v : DEFAULT_WIDTH;
  });
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX - 64 /* primary collapsed-ish offset doesn't matter; use absolute via getBoundingClientRect below */));
      // use absolute approach: measure from aside left
      setWidth((prev) => {
        const aside = document.getElementById("nova-secondary-sidebar");
        if (!aside) return next;
        const left = aside.getBoundingClientRect().left;
        return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX - left));
      });
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.localStorage.setItem(STORAGE_KEY, String(width));
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [width]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  if (!nav) return null;

  const currentFull = `${pathname}${search}${hash}`;

  return (
    <aside
      id="nova-secondary-sidebar"
      style={{ width }}
      className="relative hidden md:flex shrink-0 h-screen sticky top-0 flex-col border-r border-border bg-card/40"
    >
      <div className="h-14 flex flex-col justify-center px-4 border-b border-border">
        <div className="text-[13px] font-semibold text-foreground leading-tight">{nav.title}</div>
        {nav.description && (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{nav.description}</div>
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
                      "w-full text-left px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors truncate",
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
      <div
        onMouseDown={startDrag}
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize"
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors"
      />
    </aside>
  );
}
