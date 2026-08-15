import { Navigate, useNavigate } from "react-router-dom";
import { SignupForm } from "../components/SignupForm/SignupForm";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { account } = useAuth();
  const navigate = useNavigate();

  if (account) return <Navigate to="/profile" replace />;

  return (
    <div className="section-muted flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <p className="eyebrow">Members</p>
        <h1 className="section-title mt-2">Create your account</h1>
        <p className="mt-2 text-muted">Join the Xi Epsilon member directory.</p>
        <SignupForm onSuccess={() => navigate("/profile", { replace: true })} />
      </div>
    </div>
  );
}
