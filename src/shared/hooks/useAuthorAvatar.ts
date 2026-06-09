import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { getUserAvatar } from "@/services/userService";

/**
 * Resolves a post/comment author's avatar URL.
 *
 * The posts and comments APIs do not include author avatars, so this hook:
 * - returns the live avatar from auth context for the current user (so edits
 *   reflect immediately), and
 * - fetches + caches other users' avatars from GET /api/v1/users/{id}.
 *
 * Pass `null`/`undefined` for anonymous authors so we never fetch (and thus
 * never reveal) the avatar of an anonymous post.
 */
export function useAuthorAvatar(authorId?: string | null): string | null {
  const { user, userAvatarUrl } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!authorId) {
      setAvatar(null);
      return;
    }
    if (user?.id && authorId === user.id) {
      setAvatar(userAvatarUrl);
      return;
    }
    let active = true;
    void getUserAvatar(authorId).then((a) => {
      if (active) setAvatar(a);
    });
    return () => {
      active = false;
    };
  }, [authorId, user?.id, userAvatarUrl]);

  return avatar;
}
