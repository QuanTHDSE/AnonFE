import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  loading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, iconBg, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0" />
        <div className="space-y-2 flex-1 pt-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-start gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
