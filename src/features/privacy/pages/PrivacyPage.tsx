import { Link } from "react-router";

const points = [
  {
    title: "Thông tin chúng tôi thu thập",
    body: "Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký, tạo bài viết, tương tác và gửi phản hồi. Đây có thể là tên, email, ảnh đại diện, nội dung đăng tải và cài đặt tài khoản.",
  },
  {
    title: "Mục đích sử dụng",
    body: "Thông tin được sử dụng để vận hành dịch vụ, cá nhân hóa trải nghiệm, cải thiện nội dung, bảo mật tài khoản và hỗ trợ người dùng hiệu quả hơn.",
  },
  {
    title: "Bảo vệ dữ liệu",
    body: "Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, thay đổi hoặc mất mát.",
  },
  {
    title: "Quyền của bạn",
    body: "Bạn có thể xem, chỉnh sửa hoặc yêu cầu xóa thông tin trong phần hồ sơ. Nếu cần hỗ trợ, hãy liên hệ với bộ phận hỗ trợ của chúng tôi.",
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <Link
          to="/"
          className="text-sm font-semibold text-[#F15B29] transition hover:text-[#d94b1f]"
        >
          ← Quay về trang chủ
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Chính sách quyền riêng tư
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật lần cuối: 14/07/2026. Chúng tôi tôn trọng dữ liệu cá nhân và cam kết bảo vệ quyền
          riêng tư của bạn.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
          {points.map((item) => (
            <section key={item.title}>
              <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-2">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
          Nếu bạn có câu hỏi về quyền riêng tư, vui lòng liên hệ bộ phận hỗ trợ qua email trong phần
          hồ sơ tài khoản.
        </div>
      </div>
    </div>
  );
}
