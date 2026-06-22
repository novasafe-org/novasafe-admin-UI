import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role } from "./NovaContext";
import { adminApi, type PermissionAction } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  accessToken: string;
  permissions: Record<string, PermissionAction>;
};

type Ctx = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ ok: true } | { ok: false; error: string }>;
  establishSession: (data: {
    accessToken: string;
    user: { id: string; name: string; email: string; role: string; avatar?: string; lastLogin?: string };
    permissions: Record<string, import("@/lib/api").PermissionAction>;
  }, remember?: boolean) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "nova:auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = (session: AuthUser, remember: boolean) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(session));
    (remember ? sessionStorage : localStorage).removeItem(STORAGE_KEY);
    localStorage.setItem("nova:role", session.role);
  };

  const refreshSession = async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw) as AuthUser;
      if (!cached.accessToken) return;
      const data = await adminApi.me();
      const next: AuthUser = {
        ...cached,
        ...data.user,
        role: data.user.role as Role,
        permissions: data.permissions,
        lastLogin: new Date().toISOString(),
      };
      setUser(next);
      const store = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as AuthUser;
          setUser(cached);
          await refreshSession();
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const establishSession: Ctx["establishSession"] = (data, remember = true) => {
    const session: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
      avatar: data.user.avatar,
      createdAt: new Date().toISOString(),
      lastLogin: data.user.lastLogin || new Date().toISOString(),
      accessToken: data.accessToken,
      permissions: data.permissions,
    };
    setUser(session);
    persist(session, remember);
  };

  const login: Ctx["login"] = async (email, password, remember = true) => {
    try {
      const data = await adminApi.login(email, password);
      establishSession(data, remember);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthCtx.Provider value={{ user, isAuthenticated: !!user, loading, login, establishSession, logout, refreshSession }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
