import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "owner" | "admin" | "member";

export type Permission =
  | "rbac.manage"
  | "users.manage"
  | "users.read"
  | "billing.manage"
  | "billing.read"
  | "content.manage"
  | "docs.manage"
  | "announcements.manage"
  | "support.manage"
  | "analytics.read"
  | "security.manage"
  | "security.read"
  | "system.manage"
  | "system.read"
  | "audit.read"
  | "settings.manage"
  | "settings.read"
  | "integrations.manage";

const ROLE_PERMS: Record<Role, Permission[]> = {
  owner: [
    "rbac.manage", "users.manage", "users.read", "billing.manage", "billing.read",
    "content.manage", "docs.manage", "announcements.manage", "support.manage",
    "analytics.read", "security.manage", "security.read", "system.manage", "system.read",
    "audit.read", "settings.manage", "settings.read", "integrations.manage",
  ],
  admin: [
    "users.read", "billing.read", "content.manage", "docs.manage", "announcements.manage",
    "support.manage", "analytics.read", "security.read", "system.read", "audit.read", "settings.read",
  ],
  member: [
    "users.read", "billing.read", "content.manage", "analytics.read",
    "security.read", "system.read", "settings.read",
  ],
};

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  can: (p: Permission) => boolean;
  dark: boolean;
  toggleDark: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;
};

const NovaCtx = createContext<Ctx | null>(null);

export function NovaProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem("nova:role") as Role) || "owner");
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("nova:dark") === "1");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nova:dark", dark ? "1" : "0");
  }, [dark]);

  const setRole = (r: Role) => {
    setRoleState(r);
    localStorage.setItem("nova:role", r);
  };

  const can = (p: Permission) => ROLE_PERMS[role].includes(p);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <NovaCtx.Provider value={{ role, setRole, can, dark, toggleDark: () => setDark((d) => !d), paletteOpen, setPaletteOpen }}>
      {children}
    </NovaCtx.Provider>
  );
}

export function useNova() {
  const c = useContext(NovaCtx);
  if (!c) throw new Error("useNova must be used within NovaProvider");
  return c;
}
