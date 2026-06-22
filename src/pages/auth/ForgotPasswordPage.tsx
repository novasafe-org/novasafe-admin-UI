import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Input } from "@/components/nova/ui";
import { adminApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.forgotPassword(email);
      setResetUrl(data.resetUrl ?? null);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={sent ? "Check your inbox" : "Forgot your password?"}
      subtitle={
        sent
          ? "If an account exists for that email, reset instructions were sent."
          : "Enter the email associated with your account and we'll send you a reset link."
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-1 text-foreground hover:text-primary">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div>
              <div className="font-medium text-foreground">Request received</div>
              <div className="text-muted-foreground mt-1">
                If an account exists for <span className="font-medium text-foreground">{email}</span>,
                you&apos;ll receive an email with a reset link.
              </div>
              {resetUrl && (
                <div className="mt-3 p-2 rounded bg-muted text-xs break-all">
                  <span className="text-muted-foreground">Email not configured — use this link: </span>
                  <Link
                    to={`/reset-password?${resetUrl.split("?")[1] || ""}`}
                    className="text-primary hover:underline"
                  >
                    Open reset page
                  </Link>
                </div>
              )}
            </div>
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
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9"
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-10 justify-center">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
