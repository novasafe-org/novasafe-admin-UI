import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/context/NovaContext";
import { ReactNode } from "react";

export function RoleGuard({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children ?? <Outlet />}</>;
}
