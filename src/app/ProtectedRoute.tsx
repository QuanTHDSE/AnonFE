import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";

export function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
