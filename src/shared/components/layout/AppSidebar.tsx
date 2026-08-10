import {
  Bookmark,
  Crown,
  Home,
  type LucideIcon,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import Vector from "@/imports/Vector";

export type AppSidebarItem =
  | "home"
  | "leaderboard"
  | "following"
  | "premium"
  | "bookmarks"
  | "profile"
  | "subscription";

interface SidebarItemProps {
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, active = false, onClick }: SidebarItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-3 rounded-2xl cursor-pointer transition-colors ${
        active
          ? "bg-[#F15B29] text-white shadow-md shadow-orange-100"
          : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon size={24} strokeWidth={2.5} />
    </motion.div>
  );
}

export function AppSidebar({ activeItem }: { activeItem: AppSidebarItem }) {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, userAvatarUrl, user } = useAuth();
  const goProtected = (path: string) => navigate(isLoggedIn ? path : "/signin");
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-20 xl:w-24 bg-white border-r border-gray-100 flex-col items-center py-8 z-50">
      <div className="mb-10 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-10 h-10 xl:w-12 xl:h-12 flex items-center justify-center hover:opacity-80 transition-opacity">
          <Vector />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 xl:gap-6">
        <SidebarItem icon={Home} active={activeItem === "home"} onClick={() => navigate("/")} />
        <SidebarItem
          icon={TrendingUp}
          active={activeItem === "leaderboard"}
          onClick={() => navigate("/leaderboard")}
        />
        <SidebarItem
          icon={Users}
          active={activeItem === "following"}
          onClick={() => navigate("/following")}
        />
        <SidebarItem
          icon={Crown}
          active={activeItem === "premium"}
          onClick={() => navigate("/premium")}
        />
        <SidebarItem
          icon={Bookmark}
          active={activeItem === "bookmarks"}
          onClick={() => goProtected("/bookmarks")}
        />
        {isLoggedIn && (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className={`p-1 rounded-full cursor-pointer transition-all ${
                activeItem === "profile"
                  ? "ring-2 ring-[#F15B29] ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-2"
              }`}
              title="Trang cá nhân"
            >
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={user?.name ?? "avatar"}
                  className="w-9 h-9 xl:w-10 xl:h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-9 h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center ${
                    activeItem === "profile"
                      ? "bg-[#F15B29] text-white"
                      : "bg-orange-100 text-[#F15B29]"
                  }`}
                >
                  <span className="text-xs font-extrabold">{initials}</span>
                </div>
              )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create")}
              className="p-3 my-2 rounded-full cursor-pointer transition-all bg-[#F15B29] text-white shadow-lg shadow-orange-200 hover:shadow-[#F15B29]/40 flex items-center justify-center"
              title="Đăng bài"
            >
              <Plus size={24} strokeWidth={3} />
            </motion.div>
          </>
        )}
      </nav>

      {isAdmin && (
        <div className="mt-auto flex flex-col gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin")}
            className="p-3 rounded-2xl cursor-pointer transition-colors bg-gray-900 text-white hover:bg-gray-700"
            title="Admin Panel"
          >
            <Shield size={24} strokeWidth={2.5} />
          </motion.div>
        </div>
      )}
    </aside>
  );
}
