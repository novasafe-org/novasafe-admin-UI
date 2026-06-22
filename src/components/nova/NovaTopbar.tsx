import { Search, Moon, Sun, Bell, Command } from "lucide-react";
import { useNova } from "@/context/NovaContext";
import { UserMenu } from "./UserMenu";

export function NovaTopbar() {
  const { dark, toggleDark, setPaletteOpen } = useNova();

  return (
    <header className="h-14 sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border flex items-center px-4 gap-3">
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-card text-sm text-muted-foreground hover:bg-accent w-[360px] max-w-[40vw] transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search users, posts, settings…</span>
        <span className="flex items-center gap-0.5 text-[11px] border border-border rounded px-1.5 py-0.5">
          <Command className="w-3 h-3" />K
        </span>
      </button>

      <div className="flex-1" />

      <button className="h-9 w-9 rounded-md border border-input bg-card flex items-center justify-center text-muted-foreground hover:bg-accent" title="Notifications">
        <Bell className="w-4 h-4" />
      </button>

      <button onClick={toggleDark} className="h-9 w-9 rounded-md border border-input bg-card flex items-center justify-center text-muted-foreground hover:bg-accent" title="Theme">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <UserMenu />
    </header>
  );
}
