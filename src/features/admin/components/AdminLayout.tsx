import { Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-gray-900 selection:bg-orange-100 selection:text-[#F15B29]">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
