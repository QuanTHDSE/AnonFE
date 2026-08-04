import { afterEach, describe, expect, it, vi } from "vitest";
import { sharePost } from "@/shared/utils/sharePost";

describe("sharePost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the native Web Share API when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });

    await expect(sharePost({ postId: "post-1", title: "Bài viết" })).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Bài viết",
      text: "Xem bài viết “Bài viết” trên Anonwork",
      url: "http://localhost:3000/posts/post-1",
    });
  });

  it("copies the post URL when native sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(sharePost({ postId: "post-2", title: "Bài khác" })).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/posts/post-2");
  });

  it("does not copy when the user cancels the native share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    vi.stubGlobal("navigator", { share, clipboard: { writeText } });

    await expect(sharePost({ postId: "post-3", title: "Bài khác" })).resolves.toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });
});
