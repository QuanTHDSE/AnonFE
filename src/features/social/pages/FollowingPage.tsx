import React, { useEffect, useState } from "react";
import {
  Bell,
  MessageSquare,
  MoreHorizontal,
  Search,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { filterFollowingUsers, socialService } from "@/services/socialService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { FollowingUser } from "@/types";

export function FollowingView() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [followingList, setFollowingList] = useState<FollowingUser[]>([]);

  useEffect(() => {
    void socialService.getFollowingUsers().then(setFollowingList);
  }, []);

  if (!isLoggedIn) return null; // Prevent flash

  const toggleFollow = (id: string) => {
    setFollowingList((prev) =>
      prev.map((user) => (user.id === id ? { ...user, isFollowing: !user.isFollowing } : user)),
    );
  };

  const filteredList = filterFollowingUsers(followingList, searchQuery);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="following" />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full">
        <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 pb-12">
          {/* Top Bar / Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 sticky top-0 bg-[#fafafa]/90 backdrop-blur-md z-40 py-4">
            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight">
                Following
              </h1>
              <p className="text-[#F15B29] font-semibold text-sm xl:text-base">
                People you are connected with.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 xl:gap-6">
              <div className="relative group flex-1 md:flex-none">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search following..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 xl:w-80 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
                />
              </div>

              <div className="flex items-center gap-2 xl:gap-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm"
                >
                  <MessageSquare size={20} />
                </button>
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm">
                  <Bell size={20} />
                </button>
                <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
                <div className="flex gap-2 items-center">
                  {/* Nút đăng bài ban đầu đã bị loại bỏ vì đã được chuyển sang sidebar */}

                  {/* User Profile Info */}
                  <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#F15B29]">
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 hidden sm:block">
                      {user?.name ?? "User"}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Following Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="relative mb-4 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <ImageWithFallback
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 cursor-pointer hover:underline">
                    {user.name}
                  </h3>
                  <p className="text-[#F15B29] text-sm font-medium mb-2">{user.username}</p>
                  <p className="text-gray-500 text-sm line-clamp-2">{user.bio}</p>
                </div>

                <div className="w-full flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      user.isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-red-500"
                        : "bg-[#F15B29] text-white hover:bg-[#d94a1d] shadow-md shadow-orange-100"
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck size={18} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  <button className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredList.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                <Users size={48} className="text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No users found</h3>
                <p>Try searching with a different name</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
