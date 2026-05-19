import { beforeEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY, authService, createUserFromEmail } from "./authService";

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a display user from an email", () => {
    expect(createUserFromEmail("designer@example.com")).toEqual({
      email: "designer@example.com",
      name: "designer",
    });
  });

  it("stores, restores, and clears a mock session", () => {
    const user = authService.login("example@gmail.com");

    expect(user.name).toBe("example");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe("example@gmail.com");
    expect(authService.getCurrentUser()).toEqual(user);

    authService.logout();

    expect(authService.getCurrentUser()).toBeNull();
  });

  it("validates the demo credentials", () => {
    expect(authService.isValidMockLogin("example@gmail.com", "12345678")).toBe(true);
    expect(authService.isValidMockLogin("example@gmail.com", "wrong")).toBe(false);
  });
});
