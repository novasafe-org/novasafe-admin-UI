import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role } from "./NovaContext";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
};

type MockAccount = AuthUser & { password: string };

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "u_owner",
    name: "Nova Operator",
    email: "owner@novasafe.io",
    password: "Owner@123",
    role: "owner",
    createdAt: "2024-02-12T10:24:00Z",
    lastLogin: "2026-06-22T08:14:00Z",
  },
  {
    id: "u_admin",
    name: "Content Admin",
    email: "admin@novasafe.io",
    password: "Admin@123",
    role: "admin",
    createdAt: "2024-08-03T15:11:00Z",
    lastLogin: "2026-06-21T19:02:00Z",
  },
  {
    id: "u_member",
    name: "Read Only User",
    email: "member@novasafe.io",
    password: "Member@123",
    role: "member",
    createdAt: "2025-01-22T09:45:00Z",
    lastLogin: "2026-06-20T11:33:00Z",
  },
];

type Ctx = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "nova:auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login: Ctx["login"] = async (email, password, remember = true) => {
    await new Promise((r) => setTimeout(r, 450));
    const match = MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!match) return { ok: false, error: "Invalid email or password." };
    const { password: _p, ...u } = match;
    const session: AuthUser = { ...u, lastLogin: new Date().toISOString() };
    setUser(session);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(session));
    (remember ? sessionStorage : localStorage).removeItem(STORAGE_KEY);
    localStorage.setItem("nova:role", session.role);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthCtx.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
