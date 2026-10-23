import { useState } from "react";
import { FiEdit, FiTrash2, FiCalendar, FiX, FiFileText } from "react-icons/fi";

const getExcerpt = (description, max = 140) => {
  const text = (
    description && description.replace
      ? description.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
      : description || ""
  ).toString();
  if (!text) return "Tidak ada kutipan yang tersedia untuk artikel ini.";
  if (text.length <= max) return text;
  const chunk = text.slice(0, max);
  const sentenceEnd = chunk.lastIndexOf(". ");
  const wordEnd = chunk.lastIndexOf(" ");
  const cutPoint =
    sentenceEnd >= 60 ? sentenceEnd + 1 : wordEnd > 40 ? wordEnd : max;
  return `${chunk.slice(0, cutPoint).trim()}…`;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = String(date);
  return d.includes("-") && d.split("-")[0].length === 4
    ? `${new Date(d).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(d).getMonth()]} ${new Date(d).getFullYear()}`
    : d;
};

const BlogGrid = ({ blogs, onAddClick, onEditClick, setDeleteBlogModal }) => {
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink">Blog Grid View</h2>
          <p className="text-sm text-muted mt-1">
            Tampilan visual grid untuk semua artikel blog.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
        >
          + Tambah Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length > 0 ? (
          blogs.map((item) => (
            <div
              key={`grid-${item.id}`}
              onClick={() => setSelectedBlog(item)}
              className="bg-card border border-line rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden bg-surface2">
                <img decoding="async"
                  loading="lazy"
                  src={
                    item.image
                      ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}`
                      : "/images/blog-new-1.jpg"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/blog-new-1.jpg";
                  }}
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {formatDate(item.date)}
                </div>
                <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                  ARTIKEL
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-ink mb-3 group-hover:text-green-600 dark:text-green-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted text-sm mb-6 line-clamp-2 flex-1">
                  {getExcerpt(item.excerpt || item.content)}
                </p>
                <div
                  className="flex items-center justify-between pt-4 border-t border-line mt-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEditClick(item)}
                    className="text-green-600 dark:text-green-300 hover:text-white hover:bg-green-600 bg-green-50 dark:bg-green-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                  >
                    <FiEdit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteBlogModal({
                        show: true,
                        id: item.id,
                        title: item.title,
                      })
                    }
                    className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 dark:bg-red-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted font-bold">
            Belum ada blog yang ditambahkan.
          </div>
        )}
      </div>

      {/* MODAL DETAIL ARTIKEL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedBlog(null)}
          ></div>

          <div className="bg-card rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-line flex justify-between items-center bg-card relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#DCFCE7] dark:bg-[#12331F] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-ink tracking-tight">
                  Detail Artikel
                </h3>
                <p className="text-sm text-muted font-medium mt-1">
                  Informasi lengkap isi artikel blog.
                </p>
              </div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 p-2.5 rounded-full transition-all relative z-10"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="rounded-2xl overflow-hidden bg-surface2 border border-line shadow-inner h-52 sm:h-64 mb-6 relative">
                {selectedBlog.image ? (
                  <img loading="lazy" decoding="async"
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedBlog.image}`}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted bg-surface2">
                    <FiFileText size={48} className="opacity-20" />
                  </div>
                )}
              </div>

              <h4 className="text-2xl font-bold text-[#263238] dark:text-[#E2E8E6] mb-3">
                {selectedBlog.title}
              </h4>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-bold mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
                  <FiCalendar /> {formatDate(selectedBlog.date)}
                </span>
              </div>

              <div
                className="prose prose-lg max-w-none text-justify leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: selectedBlog.content ||
                    (selectedBlog.excerpt || "Belum ada isi artikel untuk blog ini."),
                }}
              />
            </div>

            <div className="px-8 py-5 border-t border-line bg-surface2 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  onEditClick(selectedBlog);
                }}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <FiEdit /> Edit Artikel
              </button>
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-6 py-2.5 bg-card text-ink hover:bg-surface2 border border-line font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
};

export default BlogGrid;