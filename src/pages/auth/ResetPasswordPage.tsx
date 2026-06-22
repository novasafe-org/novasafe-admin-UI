import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input } from "@/components/nova/ui";
import { cn } from "@/lib/utils";

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(s, 4);
}

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => scorePassword(pw), [pw]);
  const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setDone(true);
  }

  return (
    <AuthLayout
      title={done ? "Password updated" : "Set a new password"}
      subtitle={done ? "You can now sign in with your new password." : "Choose a strong password you haven't used before."}
      footer={<Link to="/login" className="text-foreground hover:text-primary">Back to sign in</Link>}
    >
      {done ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
          <div>
            <div className="font-medium text-foreground">All done!</div>
            <div className="text-muted-foreground mt-1">Your password has been reset successfully.</div>
            <Link
              to="/login"
              className="mt-3 inline-flex h-9 px-3.5 rounded-md text-sm font-medium gradient-primary text-primary-foreground shadow-primary"
            >
              Continue to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">New password</label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full h-10 pr-10"
                autoFocus
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pw && (
              <div className="pt-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full", i < score ? strengthColors[score] : "bg-muted")} />
                  ))}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Strength: <span className="text-foreground font-medium">{strengthLabels[score]}</span></div>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Confirm password</label>
            <Input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} className="w-full h-10" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-10 justify-center">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
