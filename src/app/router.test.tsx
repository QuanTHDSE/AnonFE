import { render, screen, waitFor } from "@testing-library/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRoutes } from "./router";
import { USER_STORAGE_KEY } from "@/services/authService";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  });

  return render(
    <GoogleOAuthProvider clientId="test-google-client-id">
      <RouterProvider router={router} />
    </GoogleOAuthProvider>,
  );
}

describe("app router", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/v1/posts")) {
          return jsonResponse({
            posts: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          });
        }

        return jsonResponse({});
      }),
    );
  });

  it("redirects protected routes to sign in when logged out", async () => {
    renderRoute("/bookmarks");

    expect(await screen.findByText("Chào mừng trở lại")).toBeInTheDocument();
  });

  it("renders protected routes when a mock session exists", async () => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        id: "user-1",
        email: "example@gmail.com",
        name: "example",
        role: "user",
      }),
    );

    renderRoute("/bookmarks");

    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  it.each([
    ["/", "Explore"],
    ["/leaderboard", "Top Posts"],
    ["/history", "Hall of Fame"],
    ["/premium", "Gói cước Premium"],
    ["/register", "Tạo tài khoản"],
  ])("smoke-renders %s", async (path, text) => {
    renderRoute(path);

    await waitFor(() => expect(screen.getByRole("heading", { name: text })).toBeInTheDocument());
  });
});
