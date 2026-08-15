import { Outlet } from "react-router-dom";
import { SiteShell } from "./SiteShell";

export function MemberLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
