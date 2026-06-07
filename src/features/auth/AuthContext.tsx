import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authService, type LoginPayload } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";
import type { User } from "@/types";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  user: User | null;
  userEmail: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  refreshPremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchPremiumStatus(userId: string): Promise<boolean> {
  try {
    const res = await subscriptionService.getUserSubscriptions(userId, 1, 10);
    const now = new Date();
    return (res.items ?? []).some((s) => s.status === 0 && new Date(s.expiresAt) > now);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isPremium, setIsPremium] = useState(false);
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin";
  const userEmail = user?.email ?? null;

  // Fetch premium status whenever user changes
  useEffect(() => {
    if (!user?.id) {
      setIsPremium(false);
      return;
    }
    void fetchPremiumStatus(user.id).then(setIsPremium);
  }, [user?.id]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setIsPremium(false);
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
    setIsPremium(false);
    void authService.logout();
  };

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
  };

  const refreshPremium = useCallback(() => {
    if (user?.id) void fetchPremiumStatus(user.id).then(setIsPremium);
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        isPremium,
        user,
        userEmail,
        login,
        logout,
        refreshUser,
        refreshPremium,
      }}
    >
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
