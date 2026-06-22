import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Shield, User as UserIcon } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function UserMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-9 pl-1.5 pr-2 rounded-md bg-card border border-input flex items-center gap-2 hover:bg-accent transition-colors">
          <div className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div className="text-xs leading-tight pr-0.5 text-left hidden sm:block">
            <div className="font-medium text-foreground">{user.name}</div>
            <div className="text-muted-foreground capitalize">{user.role}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="text-sm font-medium text-foreground">{user.name}</div>
          <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav("/profile")}>
          <UserIcon className="w-4 h-4 mr-2" />My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => nav("/profile/security")}>
          <Shield className="w-4 h-4 mr-2" />Security
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => { logout(); toast.success("Signed out"); nav("/login", { replace: true }); }}
        >
          <LogOut className="w-4 h-4 mr-2" />Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
