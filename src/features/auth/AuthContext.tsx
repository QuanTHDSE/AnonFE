import { createContext, useContext, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import type { User } from "@/types";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const isLoggedIn = Boolean(user);
  const userEmail = user?.email ?? null;

  const login = (email: string) => {
    setUser(authService.login(email));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, userEmail, login, logout }}>
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
