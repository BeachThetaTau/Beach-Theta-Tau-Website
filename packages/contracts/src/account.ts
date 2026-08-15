import type { AppRole } from "./roles.js";

export interface Account {
  uid: string;
  email: string | null;
  displayName: string | null;
  roles: AppRole[];
}
