import type { AppRole } from "@beach-theta-tau/contracts";
import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";

export function RequireRole({ role, children }: { role: AppRole; children?: ReactNode }) {
  const { account, hasRole, loading } = useAuth();

  if (loading) return <LoadingState label="Checking permissions…" />;
  if (!account) return <Navigate to="/login" replace />;
  if (!hasRole(role)) return <Navigate to="/profile" replace />;
  return children ?? <Outlet />;
}
