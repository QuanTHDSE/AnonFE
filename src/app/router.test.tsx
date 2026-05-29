import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { appRoutes } from "./router";
import { USER_STORAGE_KEY } from "@/services/authService";

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  });

  return render(<RouterProvider router={router} />);
}

describe("app router", () => {
  beforeEach(() => {
    localStorage.clear();
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
