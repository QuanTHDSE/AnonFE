import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, CalendarDays, EyeOff, FileText } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import type { FeedPostItem } from "@/types";
import { PostsActivityChart } from "../components/PostsActivityChart";
import { PremiumAnalyticsPanel } from "../components/PremiumAnalyticsPanel";
import { StatsCard } from "../components/StatsCard";

function buildChartData(posts: FeedPostItem[]): { date: string; posts: number }[] {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const counts: Record<string, number> = {};
  last7.forEach((d) => (counts[d] = 0));
  posts.forEach((p) => {
    const day = p.createdAt.slice(0, 10);
    if (day in counts) counts[day]++;
  });

  return last7.map((d) => ({
    date: d.slice(5),
    posts: counts[d],
  }));
}

export function AdminDashboardView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    postService
      .getPosts({ page: 1, pageSize: 50 })
      .then((res) => {
        setPosts(res.posts);
        setTotal(res.total);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const postsToday = posts.filter((p) => p.createdAt.slice(0, 10) === today).length;
  const anonPosts = posts.filter((p) => p.isAnonymous).length;
  const activeSubjects = new Set(posts.map((p) => p.subject?.id).filter(Boolean)).size;
  const chartData = buildChartData(posts);

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">
          Xin chào, <span className="text-[#F15B29] font-bold">{user?.name}</span>. Đây là tổng quan
          hệ thống.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Tổng bài viết"
          value={isLoading ? "—" : total}
          icon={FileText}
          iconBg="bg-orange-50 text-[#F15B29]"
          loading={isLoading}
        />
        <StatsCard
          title="Hôm nay"
          value={isLoading ? "—" : postsToday}
          icon={CalendarDays}
          iconBg="bg-blue-50 text-blue-500"
          loading={isLoading}
        />
        <StatsCard
          title="Bài ẩn danh"
          value={isLoading ? "—" : anonPosts}
          icon={EyeOff}
          iconBg="bg-purple-50 text-purple-500"
          loading={isLoading}
        />
        <StatsCard
          title="Môn học"
          value={isLoading ? "—" : activeSubjects}
          icon={BookOpen}
          iconBg="bg-green-50 text-green-500"
          loading={isLoading}
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-extrabold text-gray-900 mb-1">Hoạt động bài viết</h2>
        <p className="text-sm text-gray-400 font-medium mb-6">7 ngày gần nhất</p>
        {isLoading ? (
          <div className="h-60 bg-gray-50 rounded-2xl animate-pulse" />
        ) : (
          <PostsActivityChart data={chartData} />
        )}
      </div>

      <PremiumAnalyticsPanel />
    </div>
  );
}
