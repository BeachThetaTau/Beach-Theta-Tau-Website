import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm/LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  if (account) return <Navigate to={destination ?? "/profile"} replace />;

  return (
    <div className="section-muted flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <p className="eyebrow">Members</p>
        <h1 className="section-title mt-2">Welcome back</h1>
        <p className="mt-2 text-muted">Sign in to access your chapter profile.</p>
        <LoginForm onSuccess={() => navigate(destination ?? "/profile", { replace: true })} />
      </div>
    </div>
  );
}
