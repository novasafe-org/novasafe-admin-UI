import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AdminBrand, AdminLogo } from "@/components/brand/AdminLogo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col w-[44%] xl:w-[40%] relative overflow-hidden p-12 text-primary-foreground gradient-primary">
        <Link to="/" className="flex items-center gap-3 z-10">
          <AdminLogo size="lg" className="ring-1 ring-white/20 rounded-xl bg-white/5" />
          <div className="leading-tight">
            <div className="font-semibold text-[15px]">NovaSafe</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80">Admin Portal</div>
          </div>
        </Link>

        <div className="mt-auto z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            The control center for modern password security.
          </h2>
          <p className="mt-3 text-sm text-white/85 leading-relaxed">
            Manage users, subscriptions, devices, content and security policies — all from one
            polished, enterprise-grade workspace.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-xs">
            {[
              { k: "12.4M", v: "Vaults secured" },
              { k: "99.99%", v: "Uptime SLA" },
              { k: "SOC 2", v: "Type II" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg bg-white/10 backdrop-blur p-3 ring-1 ring-white/10">
                <div className="font-semibold text-base">{s.k}</div>
                <div className="opacity-80">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* decorative orbs */}
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-[320px] h-[320px] rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-border">
          <Link to="/">
            <AdminBrand size="sm" subtitle="Admin" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
        <div className="px-6 py-4 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border">
          <span>© {new Date().getFullYear()} NovaSafe, Inc.</span>
          <div className="flex gap-4">
            <a className="hover:text-foreground" href="#">Privacy</a>
            <a className="hover:text-foreground" href="#">Terms</a>
            <a className="hover:text-foreground" href="#">Status</a>
          </div>
        </div>
      </div>
    </div>
  );
}
