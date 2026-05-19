import React from "react";
import { Outlet } from "react-router";
import { AuthProvider } from "@/features/auth/AuthContext";

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
