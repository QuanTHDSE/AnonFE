import type {
  ChatContact,
  ChatMessage,
  FollowingUser,
  LeaderboardPost,
  Post,
  PremiumPlan,
  SavedPost,
} from "@/types";

export const createPostCategories = [
  "Marketing",
  "Graphic Design",
  "Software",
  "Photography",
  "UI/UX",
  "Architecture",
];

export const leaderboardCategories = [
  "Tất cả",
  "Công nghệ thông tin",
  "Thiết kế đồ họa",
  "Kiến trúc",
  "Nhiếp ảnh",
  "Marketing",
];

export const feedTrends = [
  "photography",
  "graphicdesign",
  "mentalhealth",
  "adventure",
  "ui/ux",
  "covid-19",
  "japanmusic",
  "workfromhome",
];

export const feedPosts: Post[] = [
  {
    id: "1",
    author: { name: "anonwork297" },
    image:
      "https://images.unsplash.com/photo-1637178627947-52eba699dfbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption: "I am strong. I am kind. I am smart. I am important. I am fearless. I am amazing.",
    tags: ["photo", "photography", "street", "calm"],
    time: "1m",
    likes: 124,
    comments: 18,
    rating: 4.5,
  },
  {
    id: "2",
    author: { name: "creative_mind" },
    image:
      "https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption: "Focusing on the little details that make a workspace feel like home.",
    tags: ["workspace", "minimalism", "productivity", "design"],
    time: "15m",
    likes: 89,
    comments: 5,
    rating: 4.2,
  },
  {
    id: "3",
    author: { name: "traveler_soul" },
    image:
      "https://images.unsplash.com/photo-1743699537171-750edd44bd87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption: "Nature always has a way of showing us how small we are.",
    tags: ["nature", "adventure", "mountains", "escape"],
    time: "1h",
    likes: 256,
    comments: 32,
    rating: 4.8,
  },
  {
    id: "4",
    author: { name: "urban_explorer" },
    image:
      "https://images.unsplash.com/photo-1598087216773-d02ad98034f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption: "Finding beauty in the concrete jungle.",
    tags: ["street", "urban", "citylife", "night"],
    time: "2h",
    likes: 142,
    comments: 12,
    rating: 4,
  },
];

export const savedPosts: SavedPost[] = [
  {
    id: "101",
    author: { name: "arch_daily" },
    image:
      "https://images.unsplash.com/photo-1695067439031-f59068994fae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Modern lines and concrete dreams. The newest addition to the downtown skyline is a masterpiece of minimalist architecture.",
    tags: ["architecture", "design", "modern", "cityscape"],
    time: "2d",
    likes: 342,
    comments: 28,
    rating: 4.8,
    savedAt: "2 days ago",
  },
  {
    id: "102",
    author: { name: "interior_vibes" },
    image:
      "https://images.unsplash.com/photo-1600494448850-6013c64ba722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Creating a cozy corner that speaks to the soul. Natural light and indoor plants are essential.",
    tags: ["interior", "home", "cozy", "plants"],
    time: "1w",
    likes: 890,
    comments: 112,
    rating: 4.9,
    savedAt: "1 week ago",
  },
  {
    id: "103",
    author: { name: "retro_lens" },
    image:
      "https://images.unsplash.com/photo-1712664435706-239fead30488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption: "Morning routine: coffee and finding the perfect shot. Film is definitely not dead.",
    tags: ["photography", "film", "vintage", "coffee"],
    time: "3w",
    likes: 56,
    comments: 4,
    rating: 4.2,
    savedAt: "2 weeks ago",
  },
  {
    id: "104",
    author: { name: "nature_explorer" },
    image:
      "https://images.unsplash.com/photo-1614691048047-17b747e3aee9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    caption:
      "Chasing the final light over the peaks. The hike was tough but this view makes it all worth it.",
    tags: ["nature", "mountains", "sunset", "hiking"],
    time: "1m",
    likes: 1205,
    comments: 89,
    rating: 5,
    savedAt: "1 month ago",
  },
];

export const leaderboardPosts: LeaderboardPost[] = [
  {
    id: "1",
    rank: 1,
    title: "Majestic Peaks at Golden Hour",
    image:
      "https://images.unsplash.com/photo-1544954617-f5c6b0d16164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    author: {
      name: "anonwork789",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    },
    likes: 15420,
    comments: 3240,
    timeAgo: "2d ago",
    trend: "up",
    category: "Nhiếp ảnh",
  },
  {
    id: "2",
    rank: 2,
    title: "Geometry in Motion: Modern Architecture",
    image:
      "https://images.unsplash.com/photo-1574848296471-28f79a036f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    author: {
      name: "creative_mind",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    },
    likes: 12350,
    comments: 2150,
    timeAgo: "5d ago",
    trend: "up",
    category: "Kiến trúc",
  },
  {
    id: "3",
    rank: 3,
    title: "Neon Nights in Cyber City",
    image:
      "https://images.unsplash.com/photo-1660619388244-b5f20987741e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    author: {
      name: "urban_explorer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    },
    likes: 10890,
    comments: 1840,
    timeAgo: "1w ago",
    trend: "same",
    category: "Thiết kế đồ họa",
  },
  {
    id: "4",
    rank: 4,
    title: "Fluid Thoughts: Abstract Series",
    image:
      "https://images.unsplash.com/photo-1658806277165-af0b60eb6733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    author: {
      name: "design_ninja",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    },
    likes: 9420,
    comments: 1230,
    timeAgo: "2w ago",
    trend: "up",
    category: "Thiết kế đồ họa",
  },
  {
    id: "5",
    rank: 5,
    title: "The Perfect Setup",
    image:
      "https://images.unsplash.com/photo-1587522384446-64daf3e2689a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    author: {
      name: "photo_master",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    },
    likes: 8750,
    comments: 980,
    timeAgo: "3w ago",
    trend: "down",
    category: "Công nghệ thông tin",
  },
];

export const historicalLeaderboardPosts: Record<string, LeaderboardPost[]> = {
  "2026-02": [
    {
      id: "h1",
      rank: 1,
      title: "Analog Memories: A Vintage Collection",
      image:
        "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      author: {
        name: "retro_lens",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      },
      likes: 21450,
      comments: 4120,
      timeAgo: "Feb 2026",
      trend: "same",
      category: "Nhiếp ảnh",
    },
  ],
  "2026-01": [
    {
      id: "h4",
      rank: 1,
      title: "Cosmic Cafe: A Cozy Corner",
      image:
        "https://images.unsplash.com/photo-1739723745132-97df9db49db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      author: {
        name: "coffee_aesthetic",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      },
      likes: 25100,
      comments: 5400,
      timeAgo: "Jan 2026",
      trend: "same",
      category: "Thiết kế đồ họa",
    },
  ],
};

export const availableLeaderboardMonths = [
  { value: "2026-02", label: "Tháng 2 - 2026" },
  { value: "2026-01", label: "Tháng 1 - 2026" },
  { value: "2025-12", label: "Tháng 12 - 2025" },
  { value: "2025-11", label: "Tháng 11 - 2025" },
];

export const followingUsers: FollowingUser[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    username: "@sjenkins",
    avatar:
      "https://images.unsplash.com/photo-1744901581831-3ffe7d3d05f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150",
    bio: "Product Designer at TechCorp. Love typography and minimalist design.",
    isFollowing: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    username: "@mchen_dev",
    avatar:
      "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150",
    bio: "Frontend enthusiast. Building the future of web.",
    isFollowing: true,
  },
  {
    id: "3",
    name: "Emma Watson",
    username: "@emmaw",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150",
    bio: "Creative Director. Exploring nature and design.",
    isFollowing: true,
  },
];

export const chatContacts: ChatContact[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    avatar:
      "https://images.unsplash.com/photo-1744901581831-3ffe7d3d05f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    lastMessage: "Hey, are we still on for the design review tomorrow?",
    time: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar:
      "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150",
    lastMessage: "I just pushed the latest updates to the repo.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Emma Watson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=150",
    lastMessage: "Thanks for the help!",
    time: "Yesterday",
    unread: 0,
    online: true,
  },
];

export const chatMessages: Record<string, ChatMessage[]> = {
  "1": [
    {
      id: "m1",
      senderId: "1",
      text: "Hi there! Have you had a chance to look at the latest mockups?",
      time: "10:15 AM",
      status: "read",
    },
    {
      id: "m2",
      senderId: "me",
      text: "Yes! They look great. I have a few minor tweaks in mind though.",
      time: "10:20 AM",
      status: "read",
    },
    {
      id: "m3",
      senderId: "1",
      text: "Awesome. Can we discuss them during our meeting?",
      time: "10:25 AM",
      status: "read",
    },
    {
      id: "m4",
      senderId: "1",
      text: "Hey, are we still on for the design review tomorrow?",
      time: "10:30 AM",
      status: "delivered",
    },
  ],
};

export const premiumPlans: PremiumPlan[] = [
  {
    name: "Cơ bản",
    price: { monthly: "0", yearly: "0" },
    description: "Dành cho người dùng mới trải nghiệm.",
    features: [
      { name: "Đăng bài cơ bản", included: true },
      { name: "Tương tác & nhắn tin", included: true },
      { name: "Huy hiệu xác minh", included: false },
      { name: "Chỉnh sửa bài viết", included: false },
      { name: "Tăng đề xuất hiển thị", included: false },
      { name: "Không quảng cáo", included: false },
    ],
    buttonText: "Đang sử dụng",
    buttonStyle: "bg-gray-100 text-gray-500 cursor-default",
  },
  {
    name: "Premium",
    price: { monthly: "150.000", yearly: "1.500.000" },
    description: "Nâng cấp trải nghiệm sáng tạo của bạn.",
    popular: true,
    features: [
      { name: "Đăng bài cơ bản", included: true },
      { name: "Tương tác & nhắn tin", included: true },
      { name: "Huy hiệu xác minh", included: true },
      { name: "Chỉnh sửa bài viết", included: true },
      { name: "Tăng đề xuất hiển thị (Vừa)", included: true },
      { name: "Không quảng cáo", included: false },
    ],
    buttonText: "Nâng cấp Premium",
    buttonStyle: "bg-[#F15B29] hover:bg-[#d94a1d] text-white shadow-md shadow-orange-200",
  },
  {
    name: "Premium+",
    price: { monthly: "300.000", yearly: "3.000.000" },
    description: "Quyền năng tối đa cho nhà sáng tạo.",
    features: [
      { name: "Đăng bài cơ bản", included: true },
      { name: "Tương tác & nhắn tin", included: true },
      { name: "Huy hiệu xác minh", included: true },
      { name: "Chỉnh sửa bài viết", included: true },
      { name: "Tăng đề xuất hiển thị (Tối đa)", included: true },
      { name: "Không quảng cáo", included: true },
    ],
    buttonText: "Nâng cấp Premium+",
    buttonStyle: "bg-gray-900 hover:bg-gray-800 text-white shadow-md shadow-gray-300",
  },
];
