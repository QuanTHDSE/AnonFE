import { beforeEach, describe, expect, it, vi } from "vitest";
import { REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY } from "./apiClient";
import { USER_STORAGE_KEY, authService } from "./authService";

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and restores a session after login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            token: "access-token",
            refreshToken: "refresh-token",
            user: {
              id: "user-1",
              email: "example@gmail.com",
              username: "example",
            },
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      ),
    );

    const user = await authService.login({
      email: "example@gmail.com",
      password: "12345678",
    });

    expect(user).toEqual({
      id: "user-1",
      email: "example@gmail.com",
      name: "example",
      role: "user",
    });
    expect(user.name).toBe("example");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("access-token");
    expect(localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe("refresh-token");
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it("clears a stored session on logout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    localStorage.setItem(TOKEN_STORAGE_KEY, "access-token");
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, "refresh-token");
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        id: "user-1",
        email: "example@gmail.com",
        name: "example",
        role: "user",
      }),
    );

    await authService.logout();

    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getToken()).toBeNull();
    expect(authService.getRefreshToken()).toBeNull();
  });
});
