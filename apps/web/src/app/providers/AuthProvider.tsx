import type { Account, AppRole } from "@beach-theta-tau/contracts";
import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeToAccount } from "@/modules/auth/api/auth.service";

export interface AuthContextValue {
  account: Account | null;
  loading: boolean;
  error: Error | null;
  hasRole: (role: AppRole) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return subscribeToAccount(
      (nextAccount) => {
        setAccount(nextAccount);
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      loading,
      error,
      hasRole: (role) => account?.roles.includes(role) ?? false,
    }),
    [account, error, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
