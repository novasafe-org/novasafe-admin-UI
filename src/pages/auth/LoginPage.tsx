import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input } from "@/components/nova/ui";
import { useAuth, MOCK_ACCOUNTS } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const res = await login(email, password, remember);
    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    toast.success("Welcome back!");
    nav(loc.state?.from || "/", { replace: true });
  }

  function fillDemo(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    setDemoOpen(false);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to NovaSafe Admin Portal"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <span className="text-foreground font-medium">Contact your workspace owner</span>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Email</label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-input accent-primary"
          />
          Remember me for 30 days
        </label>

        <Button type="submit" disabled={loading} className="w-full h-10 justify-center">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign In"}
        </Button>

        <button
          type="button"
          onClick={() => setDemoOpen((v) => !v)}
          className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          {demoOpen ? "Hide demo credentials" : "Demo Credentials"}
        </button>

        {demoOpen && (
          <div className="mt-2 rounded-lg border border-border bg-muted/40 divide-y divide-border overflow-hidden">
            {MOCK_ACCOUNTS.map((a) => (
              <div key={a.email} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0">
                  {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                    {a.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider font-semibold">
                      {a.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">
                    {a.email} / {a.password}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`${a.email} / ${a.password}`, a.email)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                  title="Copy"
                >
                  {copied === a.email ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo(a.email, a.password)}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}
