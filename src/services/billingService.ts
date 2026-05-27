import type { PremiumPlan } from "@/types";

const premiumPlans: PremiumPlan[] = [
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

export const billingService = {
  async getPremiumPlans(): Promise<PremiumPlan[]> {
    return premiumPlans;
  },
};
