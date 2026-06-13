import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{eyebrow}</div>}
        <h1 className="text-[22px] font-semibold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bg-card border border-border rounded-xl shadow-card", className)}>{children}</div>;
}

export function StatTile({
  label, value, sub, trend, icon,
}: { label: string; value: string | number; sub?: string; trend?: "up" | "down" | "flat"; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground tabular-nums">{value}</div>
      {sub && (
        <div className={cn(
          "text-xs mt-1 font-medium",
          trend === "up" && "text-success",
          trend === "down" && "text-destructive",
          (!trend || trend === "flat") && "text-muted-foreground",
        )}>
          {sub}
        </div>
      )}
    </Card>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "warning" | "danger" | "primary" | "info" }) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary",
    info: "bg-secondary text-secondary-foreground",
  };
  return <span className={cn("inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full", tones[tone])}>{children}</span>;
}

export function StatusDot({ status }: { status: "operational" | "degraded" | "outage" | "online" | "offline" }) {
  const cls: Record<string, string> = {
    operational: "bg-success", online: "bg-success",
    degraded: "bg-warning",
    outage: "bg-destructive", offline: "bg-muted-foreground",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full", cls[status])} />;
}

export function ReadOnlyBanner() {
  return (
    <div className="mb-4 px-3 py-2 rounded-md border border-warning/30 bg-warning/10 text-warning text-xs font-medium">
      You have read-only access. Contact an Owner to make changes.
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-9 px-3 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-9 px-2.5 rounded-md border border-input bg-card text-sm text-foreground", props.className)} />;
}

export function Button({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles: Record<string, string> = {
    primary: "gradient-primary text-primary-foreground shadow-primary hover:shadow-primary-hover",
    secondary: "bg-card border border-input text-foreground hover:bg-accent",
    ghost: "text-foreground hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  return <button {...p} className={cn("h-9 px-3.5 rounded-md text-sm font-medium transition-all inline-flex items-center gap-1.5", styles[variant], className)} />;
}
