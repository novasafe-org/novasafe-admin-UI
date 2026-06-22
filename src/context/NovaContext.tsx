import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { PermissionAction } from "@/lib/api";

export type Role = "owner" | "admin" | "member";

export type Permission =
  | "rbac.manage"
  | "users.manage"
  | "users.read"
  | "billing.manage"
  | "billing.read"
  | "content.manage"
  | "content.read"
  | "changelog.manage"
  | "changelog.read"
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

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  can: (p: Permission) => boolean;
  permissions: Record<string, PermissionAction>;
  dark: boolean;
  toggleDark: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;
};

const NovaCtx = createContext<Ctx | null>(null);

function actionAllows(action: PermissionAction | undefined, permission: Permission): boolean {
  if (!action || action === "none") return false;
  if (permission.endsWith(".manage")) return action === "manage";
  return action === "read" || action === "manage";
}

export function NovaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [previewRole, setPreviewRole] = useState<Role | null>(null);
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("nova:dark") === "1");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [matrix, setMatrix] = useState<Record<string, Record<string, PermissionAction>>>({});

  const actualRole = (user?.role || "member") as Role;
  const role = previewRole && actualRole === "owner" ? previewRole : actualRole;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nova:dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    if (!user) {
      setPreviewRole(null);
      return;
    }
    if (actualRole !== "owner") setPreviewRole(null);
  }, [user, actualRole]);

  const setRole = (r: Role) => {
    if (actualRole === "owner") {
      setPreviewRole(r === "owner" ? null : r);
      localStorage.setItem("nova:role", r);
    }
  };

  const permissions = matrix[role] ?? user?.permissions ?? {};

  const can = (p: Permission) => actionAllows(permissions[p], p);

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

  useEffect(() => {
    if (!user) return;
    import("@/lib/api").then(({ adminApi }) => {
      adminApi.rbacMatrix().then((data) => setMatrix(data.matrix)).catch(() => {});
    });
  }, [user]);

  return (
    <NovaCtx.Provider
      value={{
        role,
        setRole,
        can,
        permissions,
        dark,
        toggleDark: () => setDark((d) => !d),
        paletteOpen,
        setPaletteOpen,
      }}
    >
      {children}
    </NovaCtx.Provider>
  );
}

export function useNova() {
  const c = useContext(NovaCtx);
  if (!c) throw new Error("useNova must be used within NovaProvider");
  return c;
}
