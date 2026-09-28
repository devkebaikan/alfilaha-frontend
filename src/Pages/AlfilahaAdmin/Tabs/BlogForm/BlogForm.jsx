import React, { useState, useRef, useMemo, useEffect } from "react";
import { adminFetch } from "../../../../adminAuth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiArrowLeft, FiImage, FiSave } from "react-icons/fi";

const BlogForm = ({ initialData, onSave, onCancel, showToast }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const quillRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDate(initialData.date || "");
      setExcerpt(initialData.excerpt || "");
      setContent(initialData.content || "");
      setExistingImage(initialData.image || "");
    }
  }, [initialData]);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await adminFetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (response.ok) {
          const data = await response.json();
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", data.url);
          }
        }
      } catch (err) {
        console.error("Image Upload Error:", err);
        showToast("Gagal mengupload gambar sisipan.");
      }
    };
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    if (image) formData.append("image", image);

    onSave(formData, initialData?.id);
  };

  return (
    <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-line flex items-center gap-4 bg-card">
        <button
          onClick={onCancel}
          className="p-2 bg-surface2 hover:bg-surface2 text-muted rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-ink">
            {initialData ? "Edit Artikel Blog" : "Tulis Artikel Baru"}
          </h2>
          <p className="text-sm text-muted mt-1">
            Gunakan editor di bawah untuk menulis konten dengan format yang
            kaya.
          </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Judul Artikel
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Masukkan judul..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Tanggal Posting
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              {initialData
                ? "Ganti Gambar Utama (Opsional)"
                : "Upload Gambar Utama"}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                required={!initialData}
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
              />
            </div>
            {image && (
              <div className="mt-4 relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-line shadow-inner">
                <img decoding="async"
                  loading="lazy"
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!image && existingImage && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2">Gambar Saat Ini:</p>
                <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-line shadow-inner">
                  <img decoding="async"
                    loading="lazy"
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${existingImage}`}
                    alt="Existing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Cuplikan (Excerpt)
            </label>
            <textarea
              required
              rows="3"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tulis sedikit ringkasan untuk memancing pembaca..."
              className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
            ></textarea>
          </div>

          <div className="pb-12">
            <label className="block text-sm font-bold text-ink mb-2">
              Konten Artikel (Rich Text)
            </label>
            <div className="bg-card rounded-xl border border-line overflow-hidden">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                className="h-96"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-line">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {initialData ? "Simpan Perubahan" : "Publish Artikel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
