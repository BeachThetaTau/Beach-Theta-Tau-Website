import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { account, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking your account…" />;
  if (!account) return <Navigate to="/login" replace state={{ from: location }} />;
  return children ?? <Outlet />;
}
