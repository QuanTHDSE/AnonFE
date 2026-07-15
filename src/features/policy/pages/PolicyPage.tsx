import { Link } from "react-router";

const sections = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content:
      "Chúng tôi có thể thu thập thông tin bạn cung cấp khi đăng ký, tạo bài viết, tương tác và liên hệ hỗ trợ. Các dữ liệu này có thể bao gồm email, tên hiển thị, nội dung bạn đăng và các cài đặt tài khoản.",
  },
  {
    title: "2. Cách chúng tôi sử dụng thông tin",
    content:
      "Thông tin được sử dụng để vận hành trải nghiệm, cải thiện nội dung, bảo vệ tài khoản, hỗ trợ người dùng và cung cấp các tính năng như lưu bài viết, theo dõi và nhắn tin.",
  },
  {
    title: "3. Bảo mật dữ liệu",
    content:
      "Chúng tôi áp dụng các biện pháp kỹ thuật và quản trị phù hợp để bảo vệ dữ liệu của bạn. Tuy nhiên, không có hệ thống nào hoàn toàn không thể bị rò rỉ nên bạn nên bảo vệ mật khẩu và thông báo ngay nếu phát hiện hoạt động bất thường.",
  },
  {
    title: "4. Quyền riêng tư và kiểm soát",
    content:
      "Bạn có thể xem, cập nhật hoặc xóa thông tin tài khoản của mình trong phần hồ sơ. Nếu có câu hỏi về dữ liệu cá nhân, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.",
  },
  {
    title: "5. Điều khoản sử dụng",
    content:
      "Khi sử dụng dịch vụ, bạn đồng ý không đăng nội dung vi phạm pháp luật, gây quấy rối, lừa đảo hoặc làm ảnh hưởng đến cộng đồng. Chúng tôi có quyền hạn chế hoặc khóa tài khoản nếu phát hiện hành vi vi phạm.",
  },
];

export function PolicyPage() {
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
          Chính sách sử dụng và bảo mật
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật lần cuối: 14/07/2026. Chúng tôi cam kết bảo vệ dữ liệu cá nhân và tạo ra môi
          trường sử dụng an toàn, minh bạch.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
              <p className="mt-2">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
          Nếu bạn cần hỗ trợ hoặc có góp ý, hãy liên hệ với chúng tôi qua email hỗ trợ trong phần hồ
          sơ tài khoản.
        </div>
      </div>
    </div>
  );
}
