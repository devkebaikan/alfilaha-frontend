import React from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

const BlogGrid = ({ blogs, onAddClick, onEditClick, setDeleteBlogModal }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blog Grid View</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tampilan visual grid untuk semua artikel blog.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <FiPlus className="text-lg" /> Tambah Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length > 0 ? (
          blogs.map((item) => (
            <div
              key={`grid-${item.id}`}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  loading="lazy"
                  src={
                    item.image
                      ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}`
                      : "/images/blog-new-1.jpg"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {item.date &&
                  item.date.includes("-") &&
                  item.date.split("-")[0].length === 4
                    ? `${new Date(item.date).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(item.date).getMonth()]} ${new Date(item.date).getFullYear()}`
                    : item.date}
                </div>
                <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                  ARTIKEL
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">
                  {item.excerpt
                    ? (typeof item.excerpt === 'string' ? item.excerpt.replace(/<[^>]+>/g, '') : item.excerpt)
                    : "Tidak ada kutipan yang tersedia untuk artikel ini."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() => onEditClick(item)}
                    className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
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
                    className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 font-bold">
            Belum ada blog yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogGrid;
