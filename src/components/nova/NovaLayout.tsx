import { Outlet } from "react-router-dom";
import { NovaSidebar } from "./NovaSidebar";
import { NovaTopbar } from "./NovaTopbar";
import { CommandPalette } from "./CommandPalette";
import { SecondarySidebar } from "./SecondarySidebar";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { LayoutProvider } from "@/context/LayoutContext";

export function NovaLayout() {
  return (
    <LayoutProvider>
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
