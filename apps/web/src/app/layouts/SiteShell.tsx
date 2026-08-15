import type { ReactNode } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import SiteFooter from "@/shared/ui/SiteFooter/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader/SiteHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader userEmail={account?.email} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
