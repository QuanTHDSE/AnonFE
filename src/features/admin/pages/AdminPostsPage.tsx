import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { postService } from "@/services/postService";
import type { FeedPostItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function AdminPostsView() {
  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPosts = useCallback(async (searchVal: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await postService.getPosts({
        search: searchVal || undefined,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      setPosts(res.posts);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(search, page);
  }, [search, page, loadPosts]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(confirmDeleteId);
      setConfirmDeleteId(null);
      void loadPosts(search, page);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmPost = posts.find((p) => p.id === confirmDeleteId);

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý bài viết</h1>
        <p className="text-gray-500 font-medium mt-1">
          {total > 0 ? `${total} bài viết trong hệ thống` : "Đang tải..."}
        </p>
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-72 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-12 font-bold text-gray-500">#</TableHead>
              <TableHead className="font-bold text-gray-500">Tiêu đề</TableHead>
              <TableHead className="font-bold text-gray-500">Tác giả</TableHead>
              <TableHead className="font-bold text-gray-500">Môn học</TableHead>
              <TableHead className="font-bold text-gray-500">Ngày đăng</TableHead>
              <TableHead className="font-bold text-gray-500 text-center">Ẩn danh</TableHead>
              <TableHead className="w-16 font-bold text-gray-500" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-48" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-gray-100 rounded-full w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded-full w-4 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 bg-gray-100 rounded-xl w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : posts.map((post, idx) => (
                  <TableRow key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-bold text-gray-400 text-sm">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/posts/${post.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-gray-900 hover:text-[#F15B29] transition-colors line-clamp-1 max-w-[280px] block"
                      >
                        {post.title}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-600">
                      {post.isAnonymous ? (
                        <span className="text-gray-400 italic">Ẩn danh</span>
                      ) : (
                        (post.author?.name ?? "—")
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-100 text-[#F15B29] text-xs font-bold rounded-full">
                        {post.subject?.iconEmoji} {post.subject?.name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium">
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          post.isAnonymous ? "bg-[#F15B29]" : "bg-gray-200"
                        }`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setConfirmDeleteId(post.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa bài viết"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && posts.length === 0 && (
          <div className="py-16 text-center text-gray-400 font-medium">
            Không tìm thấy bài viết nào.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold transition-colors ${
                    p === page
                      ? "bg-[#F15B29] text-white shadow-md shadow-orange-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="rounded-3xl border-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Xóa bài viết?</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Bài viết{" "}
              <span className="font-bold text-gray-700">&ldquo;{confirmPost?.title}&rdquo;</span> sẽ
              bị xóa vĩnh viễn và không thể khôi phục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <button
              onClick={() => setConfirmDeleteId(null)}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Xóa
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
