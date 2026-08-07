import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserPremium } from "@/services/userService";
import { UserPremiumBadge } from "@/shared/components/UserPremiumBadge";

vi.mock("@/services/userService", () => ({
  getUserPremium: vi.fn(),
}));

const getUserPremiumMock = vi.mocked(getUserPremium);

describe("UserPremiumBadge", () => {
  beforeEach(() => {
    getUserPremiumMock.mockReset();
  });

  it("renders immediately when premium status is already known", () => {
    render(<UserPremiumBadge userId="user-1" isPremium />);

    expect(screen.getByLabelText("Premium")).toBeInTheDocument();
    expect(getUserPremiumMock).not.toHaveBeenCalled();
  });

  it("resolves premium status for public user displays", async () => {
    getUserPremiumMock.mockResolvedValue(true);
    render(<UserPremiumBadge userId="user-2" username="premium user" />);

    await waitFor(() => expect(screen.getByLabelText("Premium")).toBeInTheDocument());
    expect(getUserPremiumMock).toHaveBeenCalledWith("user-2", "premium user");
  });

  it("never resolves or displays premium status for anonymous authors", () => {
    render(<UserPremiumBadge userId="user-3" username="hidden" isAnonymous />);

    expect(screen.queryByLabelText("Premium")).not.toBeInTheDocument();
    expect(getUserPremiumMock).not.toHaveBeenCalled();
  });
});
