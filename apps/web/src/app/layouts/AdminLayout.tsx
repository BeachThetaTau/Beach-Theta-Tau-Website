import { Outlet } from "react-router-dom";
import { SiteShell } from "./SiteShell";

export function AdminLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
