import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/nova/ui";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this page.
          {user && <> Your current role is <span className="font-medium text-foreground capitalize">{user.role}</span>.</>}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="secondary" onClick={() => nav(-1)}>
            <ArrowLeft className="w-4 h-4" />Go Back
          </Button>
          <Link to="/" className="h-9 px-3.5 rounded-md text-sm font-medium gradient-primary text-primary-foreground shadow-primary inline-flex items-center gap-1.5">
            <Home className="w-4 h-4" />Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
