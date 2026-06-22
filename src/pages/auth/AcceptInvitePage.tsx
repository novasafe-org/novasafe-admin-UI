import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input } from "@/components/nova/ui";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(s, 4);
}

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const { establishSession } = useAuth();

  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invite, setInvite] = useState<{ email: string; roleKey: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const score = useMemo(() => scorePassword(pw), [pw]);
  const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

  useEffect(() => {
    if (!token) {
      setError("Missing invite token.");
      setValidating(false);
      return;
    }
    adminApi
      .validateInvite(token)
      .then((data) => {
        setInvite(data);
        setName(data.email.split("@")[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Invalid invite"))
      .finally(() => setValidating(false));
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const data = await adminApi.acceptInvite({ token, name, password: pw });
      establishSession(data);
      setDone(true);
      toast.success("Account created — welcome!");
      setTimeout(() => nav("/", { replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept invite");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <AuthLayout title="Checking invite…" subtitle="Please wait.">
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </AuthLayout>
    );
  }

  if (!invite && error) {
    return (
      <AuthLayout title="Invalid invite" subtitle={error} footer={<Link to="/login">Back to sign in</Link>}>
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Ask your workspace owner to send a new invite.</span>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={done ? "You're all set" : "Join NovaSafe Admin"}
      subtitle={
        done
          ? "Redirecting to your dashboard…"
          : `Create your password for ${invite?.email} (${invite?.roleKey} role).`
      }
      footer={<Link to="/login" className="text-foreground hover:text-primary">Back to sign in</Link>}
    >
      {done ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
          <div className="font-medium text-foreground">Account ready</div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Display name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
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
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : "Create account"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
