import React from "react";
import { Outlet } from "react-router";
import { AuthProvider } from "@/features/auth/AuthContext";
import { WelcomeModal } from "@/shared/components/WelcomeModal";
import { ServerHealthBanner } from "@/shared/components/ServerHealthBanner";

export function RootLayout() {
  return (
    <AuthProvider>
      <ServerHealthBanner />
      <Outlet />
      <WelcomeModal />
    </AuthProvider>
  );
}
