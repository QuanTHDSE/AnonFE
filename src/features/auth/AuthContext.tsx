import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authService, type LoginPayload } from "@/services/authService";
import type { User } from "@/types";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userEmail: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const isLoggedIn = Boolean(user);
  const userEmail = user?.email ?? null;

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = async (payload: LoginPayload) => {
    const loggedInUser = await authService.login(payload);
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    void authService.logout();
  };

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, userEmail, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
