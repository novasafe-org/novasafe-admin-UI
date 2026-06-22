import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { NovaSidebar } from "./NovaSidebar";
import { NovaTopbar } from "./NovaTopbar";
import { CommandPalette } from "./CommandPalette";
import { SecondarySidebar } from "./SecondarySidebar";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { LayoutProvider } from "@/context/LayoutContext";
import { useAuth } from "@/context/AuthContext";
import { useNova } from "@/context/NovaContext";

function RoleBridge() {
  const { user } = useAuth();
  const { role, setRole } = useNova();
  useEffect(() => {
    if (user && user.role !== role) setRole(user.role);
  }, [user, role, setRole]);
  return null;
}

export function NovaLayout() {
  return (
    <LayoutProvider>
      <RoleBridge />
      <div className="min-h-screen flex w-full bg-background">
        <NovaSidebar />
        <SecondarySidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <NovaTopbar />
          <div className="border-b border-border bg-background/60 backdrop-blur-sm px-6 md:px-8 py-2.5">
            <PageBreadcrumb />
          </div>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
        <CommandPalette />
      </div>
    </LayoutProvider>
  );
}

