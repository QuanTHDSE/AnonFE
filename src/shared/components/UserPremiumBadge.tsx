import { useEffect, useState } from "react";
import { getUserPremium } from "@/services/userService";
import { PremiumBadge } from "@/shared/components/PremiumBadge";

interface UserPremiumBadgeProps {
  userId?: string | null;
  username?: string | null;
  isAnonymous?: boolean;
  isPremium?: boolean;
  size?: number;
  className?: string;
}

/** Resolves and displays a Premium badge without exposing anonymous authors. */
export function UserPremiumBadge({
  userId,
  username,
  isAnonymous = false,
  isPremium,
  size,
  className,
}: UserPremiumBadgeProps) {
  const [resolvedPremium, setResolvedPremium] = useState(isPremium ?? false);

  useEffect(() => {
    if (isAnonymous || !userId) {
      setResolvedPremium(false);
      return;
    }

    if (isPremium !== undefined) {
      setResolvedPremium(isPremium);
      return;
    }

    let active = true;
    setResolvedPremium(false);
    void getUserPremium(userId, username).then((premium) => {
      if (active) setResolvedPremium(premium);
    });

    return () => {
      active = false;
    };
  }, [isAnonymous, isPremium, userId, username]);

  if (isAnonymous || !userId || !resolvedPremium) return null;
  return <PremiumBadge size={size} className={className} />;
}
