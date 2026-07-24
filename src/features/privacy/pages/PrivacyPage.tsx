import { Link } from "react-router";
import {
  Cookie,
  CreditCard,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "1. Thông tin chúng tôi thu thập",
    body: "Khi bạn đăng ký và sử dụng dịch vụ, chúng tôi thu thập các thông tin cá nhân cơ bản bao gồm email, tên người dùng (username), ảnh đại diện (avatar), bio giới thiệu, nội dung các bài viết, hình ảnh, tệp đính kèm và lịch sử tương tác (upvote, đánh giá sao, bình luận).",
  },
  {
    icon: EyeOff,
    title: "2. Bảo mật khi Đăng bài & Bình luận Ẩn danh",
    body: "Khi bạn bật tính năng 'Đăng bài ẩn danh' hoặc 'Bình luận ẩn danh', hệ thống sẽ tự động hiển thị Tên ẩn danh (Anon Alias) và Ảnh ẩn danh (Anon Image). Danh tính thực của bạn được bảo mật hoàn toàn và không hiển thị cho cộng đồng người dùng trên giao diện. Hệ thống chỉ lưu trữ mã định danh nội bộ bảo mật (authorId) để đảm bảo tuân thủ Tiêu chuẩn Cộng đồng và ngăn chặn các hành vi vi phạm pháp luật.",
  },
  {
    icon: CreditCard,
    title: "3. Dữ liệu Đăng ký & Thanh toán Premium",
    body: "Khi bạn đăng ký nâng cấp các gói Premium, chúng tôi lưu thông tin gói đăng ký, lịch sử giao dịch và thời hạn sử dụng. Mọi giao dịch tài chính đều được xử lý qua các cổng thanh toán bảo mật. Chúng tôi tuyệt đối không lưu trữ thông tin thẻ ngân hàng hoặc mật khẩu tài khoản thanh toán của bạn.",
  },
  {
    icon: Cookie,
    title: "4. Cookie & Lưu trữ phiên làm việc (Local Storage)",
    body: "Chúng tôi sử dụng Local Storage và Cookie an toàn để lưu trữ mã xác thực (JWT Token). Điều này giúp duy trì trạng thái đăng nhập tự động giữa các lần truy cập mà không yêu cầu bạn nhập lại mật khẩu liên tục. Dữ liệu này chỉ được lưu trữ cục bộ trên trình duyệt của bạn.",
  },
  {
    icon: Lock,
    title: "5. Cam kết Bảo mật & Không bán dữ liệu",
    body: "Chúng tôi cam kết KHÔNG bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích thương mại hoặc quảng cáo. Các dữ liệu hình ảnh và tệp tải lên được lưu trữ mã hóa an toàn trên dịch vụ đám mây chuyên dụng. Dữ liệu chỉ được truy xuất trong trường hợp vận hành hệ thống hoặc theo yêu cầu của cơ quan pháp luật có thẩm quyền.",
  },
  {
    icon: UserCheck,
    title: "6. Quyền của bạn & Yêu cầu xóa dữ liệu",
    body: "Bạn có toàn quyền truy cập, chỉnh sửa thông tin cá nhân trong trang Hồ sơ, cũng như xóa bài viết, bình luận, và đánh giá do mình tạo ra. Nếu bạn muốn xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân khỏi hệ thống, bạn có thể gửi yêu cầu hỗ trợ bất kỳ lúc nào.",
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-10 text-gray-900 sm:px-6 lg:px-8 selection:bg-orange-100 selection:text-[#F15B29]">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        {/* Header */}
        <div className="border-b border-gray-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#F15B29] text-xs font-bold rounded-full border border-orange-100 mb-3">
            <ShieldCheck size={14} />
            Bảo mật & Quyền riêng tư
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Chính sách quyền riêng tư
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-medium">
            Cập nhật lần cuối: 24/07/2026. Chúng tôi tôn trọng và cam kết bảo vệ dữ liệu cá nhân của bạn.
          </p>
        </div>

        {/* Highlight box */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 p-5 border border-orange-100 text-sm text-orange-900">
          <p className="font-bold flex items-center gap-2 mb-1">
            <EyeOff size={18} className="text-[#F15B29]" />
            Cam kết Ẩn danh & An toàn dữ liệu
          </p>
          <p className="text-orange-800/90 font-medium text-xs sm:text-sm leading-relaxed">
            Chúng tôi đảm bảo khi bạn chọn chế độ Đăng bài / Bình luận Ẩn danh, tên thật và thông tin cá nhân của bạn luôn được bảo vệ hoàn toàn khỏi cộng đồng người dùng.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="mt-10 space-y-8">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.title} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F15B29] flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-[#F15B29] group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                </div>
                <p className="pl-12 text-sm leading-relaxed text-gray-600 font-medium">
                  {item.body}
                </p>
              </section>
            );
          })}
        </div>

        {/* Footer Contact */}
        <div className="mt-12 pt-8 border-t border-gray-100 rounded-2xl bg-gray-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#F15B29] shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Bạn có câu hỏi về quyền riêng tư?</p>
              <p className="text-xs text-gray-500 font-medium">Liên hệ bộ phận hỗ trợ trong phần Hồ sơ tài khoản</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-5 py-2.5 bg-[#F15B29] hover:bg-[#d94b1f] text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0"
          >
            Đến trang Hồ sơ
          </Link>
        </div>
      </div>
    </div>
  );
}
