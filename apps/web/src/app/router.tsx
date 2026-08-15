import { createBrowserRouter } from "react-router-dom";
import {
  ApplyPage,
  AboutPage,
  HomePage,
  ProfessionalismPage,
  ServicePage,
  SocialPage,
} from "@/modules/marketing";
import { LoginPage, SignupPage, ForgotPasswordPage } from "@/modules/auth";
import { BrothersPage } from "@/modules/members";
import { ProfilePage } from "@/modules/profile";
import { DeliberationsPage } from "@/modules/deliberations";
import { AdminPanelPage } from "@/modules/admin";
import { RetreatPage } from "@/modules/retreat";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireRole } from "./guards/RequireRole";
import { AdminLayout } from "./layouts/AdminLayout";
import { MemberLayout } from "./layouts/MemberLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "social", element: <SocialPage /> },
      { path: "professionalism", element: <ProfessionalismPage /> },
      { path: "service", element: <ServicePage /> },
      { path: "apply", element: <ApplyPage /> },
      { path: "brothers", element: <BrothersPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MemberLayout />,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "retreat", element: <RetreatPage /> },
          { path: "delibs", element: <DeliberationsPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireRole role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "admin", element: <AdminPanelPage /> },
          { path: "admin/deliberations", element: <DeliberationsPage adminOnly /> },
        ],
      },
    ],
  },
]);
