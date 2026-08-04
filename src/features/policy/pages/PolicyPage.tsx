import { Link } from "react-router";
import {
  AlertTriangle,
  FileCheck,
  HelpCircle,
  Lock,
  MessageSquare,
  Shield,
  ShieldAlert,
  UserX,
} from "lucide-react";

const sections = [
  {
    icon: Shield,
    title: "1. Nguyên tắc sử dụng chung",
    content:
      "Khi đăng ký và sử dụng ứng dụng, bạn đồng ý tuân thủ Tiêu chuẩn Cộng đồng và quy định pháp luật hiện hành. Bạn tuyệt đối không sử dụng dịch vụ để truyền tải nội dung vi phạm bản quyền, quấy rối, phỉ báng, lừa đảo, phát tán mã độc hoặc làm ảnh hưởng xấu đến các thành viên khác.",
  },
  {
    icon: ShieldAlert,
    title: "2. Cam kết Bản quyền & Trách nhiệm Nội dung đăng tải",
    content:
      "Bằng việc đăng tải bài viết, hình ảnh hoặc tệp đính kèm lên nền tảng, người dùng khẳng định và cam kết rằng mình là chủ sở hữu hợp pháp hoặc đã có đầy đủ sự cho phép/bản quyền sử dụng đối với toàn bộ tệp, hình ảnh và nội dung đó. Người dùng chịu hoàn toàn trách nhiệm trước pháp luật nếu nội dung mình đăng tải vi phạm quyền sở hữu trí tuệ của bên thứ ba.",
  },
  {
    icon: AlertTriangle,
    title: "3. Quy trình Xử lý Vi phạm Bản quyền & Gỡ bỏ Nội dung",
    content:
      "Khi nhận được báo cáo vi phạm bản quyền hợp lệ từ chủ sở hữu, chúng tôi có toàn quyền ẩn hoặc xóa nội dung vi phạm khỏi hệ thống mà không cần thông báo trước. Đối với các tài khoản cố tình vi phạm nhiều lần (Repeat Infringer), nền tảng sẽ áp dụng các biện pháp chế tài như tạm khóa hoặc khóa tài khoản vĩnh viễn.",
  },
  {
    icon: UserX,
    title: "4. Quy định về Đăng bài & Bình luận Ẩn danh",
    content:
      "Tính năng ẩn danh được thiết kế để bảo vệ sự riêng tư cá nhân khi đóng góp ý kiến. Tuy nhiên, tính năng này không được dùng làm công cụ để phát tán nội dung vi phạm bản quyền, bôi nhọ, phỉ báng hoặc vi phạm pháp luật. Hệ thống có quyền khóa tài khoản nếu phát hiện hành vi lạm dụng chế độ ẩn danh.",
  },
  {
    icon: Lock,
    title: "5. Bảo mật Tài khoản & Giới hạn Trách nhiệm Nền tảng",
    content:
      "Nền tảng đóng vai trò là hạ tầng kết nối chia sẻ nội dung do người dùng tự tạo (UGC). Chúng tôi được miễn trừ trách nhiệm bồi thường đối với các tranh chấp bản quyền phát sinh trực tiếp từ việc người dùng tự ý đăng tải nội dung vi phạm. Người dùng có trách nhiệm tự bảo quản thông tin đăng nhập tài khoản của mình.",
  },
];

export function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-10 text-gray-900 sm:px-6 lg:px-8 selection:bg-orange-100 selection:text-[#F15B29]">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        {/* Header */}
        <div className="border-b border-gray-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#F15B29] text-xs font-bold rounded-full border border-orange-100 mb-3">
            <FileCheck size={14} />
            Điều khoản & Quy định
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Điều khoản sử dụng
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-medium">
            Cập nhật lần cuối: 24/07/2026. Xin vui lòng đọc kỹ các cam kết về nội dung và bản quyền
            trước khi đăng tải.
          </p>
        </div>

        {/* Highlight box for Copyright Commitment */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 border border-amber-200/70 text-sm text-amber-900">
          <p className="font-bold flex items-center gap-2 mb-1 text-amber-950">
            <ShieldAlert size={18} className="text-[#F15B29]" />
            Cam kết quan trọng về Bản quyền
          </p>
          <p className="text-amber-900/90 font-medium text-xs sm:text-sm leading-relaxed">
            Khi bấm nút <strong>"Đăng bài"</strong>, bạn cam kết rằng mọi hình ảnh, tệp tin và nội
            dung do bạn tải lên hoàn toàn thuộc sở hữu của bạn hoặc đã có sự cho phép hợp pháp. Bạn
            chịu hoàn toàn trách nhiệm trước pháp luật nếu có tranh chấp bản quyền xảy ra.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="mt-10 space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F15B29] flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-[#F15B29] group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                </div>
                <p className="pl-12 text-sm leading-relaxed text-gray-600 font-medium">
                  {section.content}
                </p>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 rounded-2xl bg-gray-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#F15B29] shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Góp ý & Thắc mắc về điều khoản bản quyền?
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Liên hệ bộ phận quản trị trong phần Hồ sơ tài khoản
              </p>
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
