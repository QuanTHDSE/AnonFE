export type SharePostResult = "shared" | "copied" | "cancelled";

interface SharePostOptions {
  postId: string;
  title: string;
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the legacy copy path when clipboard permission is denied.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Không thể sao chép liên kết bài viết.");
  }
}

export async function sharePost({ postId, title }: SharePostOptions): Promise<SharePostResult> {
  const url = new URL(`/posts/${postId}`, window.location.origin).toString();

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `Xem bài viết “${title}” trên Anonwork`,
        url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyText(url);
  return "copied";
}
