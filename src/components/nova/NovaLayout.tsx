import { Outlet } from "react-router-dom";
import { NovaSidebar } from "./NovaSidebar";
import { NovaTopbar } from "./NovaTopbar";
import { CommandPalette } from "./CommandPalette";

export function NovaLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <NovaSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <NovaTopbar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
