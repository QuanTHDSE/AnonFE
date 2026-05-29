import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";

export function AdminRoute() {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
