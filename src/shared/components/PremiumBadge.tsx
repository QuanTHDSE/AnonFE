import { BadgeCheck } from "lucide-react";

interface PremiumBadgeProps {
  size?: number;
  className?: string;
}

/** Blue verified checkmark for premium subscribers */
export function PremiumBadge({ size = 15, className = "" }: PremiumBadgeProps) {
  return (
    <BadgeCheck
      size={size}
      className={`shrink-0 ${className}`}
      color="#3b82f6"
      fill="#dbeafe"
      aria-label="Premium"
    />
  );
}
