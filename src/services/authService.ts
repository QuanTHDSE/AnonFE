import type { User } from "@/types";

export const AUTH_STORAGE_KEY = "anon.mockUser";

export const MOCK_CREDENTIALS = {
  email: "example@gmail.com",
  password: "12345678",
} as const;

export function createUserFromEmail(email: string): User {
  return {
    email,
    name: email.split("@")[0] || "User",
  };
}

export const authService = {
  getCurrentUser(): User | null {
    const email = localStorage.getItem(AUTH_STORAGE_KEY);
    return email ? createUserFromEmail(email) : null;
  },

  isValidMockLogin(email: string, password: string) {
    return email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password;
  },

  login(email: string): User {
    localStorage.setItem(AUTH_STORAGE_KEY, email);
    return createUserFromEmail(email);
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
