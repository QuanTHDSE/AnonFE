import React from "react";
import { Outlet } from "react-router";
import { AuthProvider } from "@/features/auth/AuthContext";
import { WelcomeModal } from "@/shared/components/WelcomeModal";

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
      <WelcomeModal />
    </AuthProvider>
  );
}
