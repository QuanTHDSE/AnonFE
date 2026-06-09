import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authService, type LoginPayload } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";
import { roleService } from "@/services/roleService";
import { userService, type UserProfile } from "@/services/userService";
import type { User } from "@/types";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  refreshProfile: () => void;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdminFromApi, setIsAdminFromApi] = useState(false);
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin" || isAdminFromApi;
  const userEmail = user?.email ?? null;
  const userAvatarUrl = userProfile?.avatarUrl ?? null;

  // Fetch full profile (avatar, bio, etc.) whenever user changes
  useEffect(() => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }
    userService
      .getMe()
      .then(setUserProfile)
      .catch(() => setUserProfile(null));
  }, [user?.id]);

  // Fetch premium status whenever user changes
  useEffect(() => {
    if (!user?.id) {
      setIsPremium(false);
      return;
    }
    void fetchPremiumStatus(user.id).then(setIsPremium);
  }, [user?.id]);

  // Check admin role via roles API (JWT claim may not reflect roles assigned after login)
  useEffect(() => {
    if (!user?.id) {
      setIsAdminFromApi(false);
      return;
    }
    roleService
      .getUserRoles(user.id)
      .then((roles) => {
        setIsAdminFromApi(roles.some((r) => r.name.toLowerCase() === "admin"));
      })
      .catch(() => setIsAdminFromApi(false));
  }, [user?.id]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setUserProfile(null);
      setIsPremium(false);
      setIsAdminFromApi(false);
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
    setUserProfile(null);
    setIsPremium(false);
    setIsAdminFromApi(false);
    void authService.logout();
  };

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
  };

  const refreshProfile = useCallback(() => {
    if (user?.id)
      userService
        .getMe()
        .then(setUserProfile)
        .catch(() => {});
  }, [user?.id]);

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
        userProfile,
        userEmail,
        userAvatarUrl,
        login,
        logout,
        refreshUser,
        refreshProfile,
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
