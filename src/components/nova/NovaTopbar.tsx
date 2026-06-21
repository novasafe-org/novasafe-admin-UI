import { Search, Moon, Sun, Bell, Command } from "lucide-react";
import { useNova, Role } from "@/context/NovaContext";

export function NovaTopbar() {
  const { dark, toggleDark, role, setRole, setPaletteOpen } = useNova();

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

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="h-9 px-2.5 rounded-md border border-input bg-card text-sm text-foreground"
        title="Switch role (demo)"
      >
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </select>

      <button className="h-9 w-9 rounded-md border border-input bg-card flex items-center justify-center text-muted-foreground hover:bg-accent" title="Notifications">
        <Bell className="w-4 h-4" />
      </button>

      <button onClick={toggleDark} className="h-9 w-9 rounded-md border border-input bg-card flex items-center justify-center text-muted-foreground hover:bg-accent" title="Theme">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="h-9 px-2 rounded-md bg-card border border-input flex items-center gap-2">
        <div className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">N</div>
        <div className="text-xs leading-tight pr-1">
          <div className="font-medium text-foreground">Nova Operator</div>
          <div className="text-muted-foreground capitalize">{role}</div>
        </div>
      </div>
    </header>
  );
}
