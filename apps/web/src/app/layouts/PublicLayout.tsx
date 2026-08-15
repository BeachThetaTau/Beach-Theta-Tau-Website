import { Outlet } from "react-router-dom";
import { SiteShell } from "./SiteShell";

export function PublicLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
