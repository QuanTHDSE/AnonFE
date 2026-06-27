import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { getUserAvatar } from "@/services/userService";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";

/**
 * Resolves the avatar to show for a post/comment author, anon-aware.
 *
 * The posts/comments APIs don't return an anon-image URL yet, so for the
 * current user's own anonymous content we substitute their anon image from
 * getMe (`anonImageUrl`). Resolution order:
 *  1. `apiAvatar` — whatever the API already returned (e.g. once the backend
 *     exposes `authorAvatarUrl` on the feed this wins for everyone).
 *  2. Anonymous + own content → the current user's anon image from getMe.
 *  3. Anonymous + someone else → `null` (caller shows initials; never reveals
 *     the real avatar of an anonymous author).
 *  4. Non-anonymous → live avatar for the current user, else fetched + cached
 *     from GET /api/v1/users/{id}.
 */
export function usePostAvatar(
  authorId: string | null | undefined,
  isAnonymous: boolean,
  apiAvatar?: string | null,
): string | null {
  const { user, userProfile, userAvatarUrl } = useAuth();
  const [fetched, setFetched] = useState<string | null>(null);

  const isOwn = Boolean(authorId && user?.id && authorId === user.id);

  useEffect(() => {
    // Only fetch for non-anonymous authors that aren't the current user.
    if (isAnonymous || !authorId || isOwn) {
      setFetched(null);
      return;
    }
    let active = true;
    void getUserAvatar(authorId).then((a) => {
      if (active) setFetched(a);
    });
    return () => {
      active = false;
    };
  }, [authorId, isAnonymous, isOwn]);

  if (apiAvatar) return apiAvatar;

  if (isAnonymous) {
    return isOwn ? toAbsoluteMediaUrl(userProfile?.anonImageUrl) : null;
  }

  return isOwn ? userAvatarUrl : fetched;
}
