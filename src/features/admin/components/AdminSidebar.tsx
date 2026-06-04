import { ArrowLeft, BookOpen, FileText, LayoutDashboard, LogOut, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import Vector from "@/imports/Vector";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Bài viết", icon: FileText, path: "/admin/posts" },
  { label: "Môn học", icon: BookOpen, path: "/admin/subjects" },
  { label: "Người dùng", icon: Users, path: "/admin/users" },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    void logout();
    navigate("/signin");
  };

  return (
    <aside className="sticky top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col py-8 z-50 shrink-0">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center shrink-0">
          <Vector />
        </div>
        <div>
          <p className="font-extrabold text-gray-900 text-sm leading-tight">Admin Panel</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield size={10} className="text-[#F15B29]" />
            <p className="text-[10px] font-bold text-[#F15B29] uppercase tracking-wide">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive =
            path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

          return (
            <motion.div
              key={path}
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors font-semibold text-sm ${
                isActive
                  ? "bg-[#F15B29] text-white shadow-md shadow-orange-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 space-y-1 border-t border-gray-100 pt-4 mt-4">
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span>Về trang chủ</span>
        </motion.div>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer text-red-500 hover:bg-red-50 font-semibold text-sm transition-colors"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Đăng xuất</span>
        </motion.div>
      </div>
    </aside>
  );
}
