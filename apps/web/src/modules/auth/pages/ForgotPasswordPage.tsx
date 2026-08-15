import { Navigate } from "react-router-dom";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm/ForgotPasswordForm";
import { useAuth } from "../hooks/useAuth";

export function ForgotPasswordPage() {
  const { account } = useAuth();

  if (account) return <Navigate to="/profile" replace />;

  return (
    <div className="section-muted flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <p className="eyebrow">Members</p>
        <h1 className="section-title mt-2">Reset your password</h1>
        <p className="mt-2 text-muted">
          Enter the email tied to your account and we'll send you a secure link to set a new
          password.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
