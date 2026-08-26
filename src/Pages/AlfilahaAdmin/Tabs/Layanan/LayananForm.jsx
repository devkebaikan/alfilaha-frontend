import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiX, FiImage, FiSave, FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const LayananForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        image: initialData.image || null,
      });
      if (initialData.image) {
        if (typeof initialData.image === "string") {
          setImagePreview(
            `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${initialData.image}`,
          );
        } else {
          setImagePreview(URL.createObjectURL(initialData.image));
        }
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }
    onSave(data, initialData?.id);
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Setup ReactQuill image handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await fetch(
            `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/upload`,
            {
              method: "POST",
              body: formData,
            },
          );
          if (response.ok) {
            const data = await response.json();
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", data.url);
          } else {
            console.error("Gagal mengupload gambar");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
        <button
          onClick={onCancel}
          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Layanan" : "Tambah Layanan Baru"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan editor di bawah untuk menulis konten dan mengatur layanan.
          </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Judul Layanan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
              placeholder="Misal: Pembersihan Laut"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {initialData
                ? "Ganti Gambar Utama (Opsional)"
                : "Upload Gambar Utama"} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                required={!initialData}
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-4 py-4 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 font-bold rounded-xl transition whitespace-nowrap"
                >
                  Hapus Gambar
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Preview Gambar:</p>
                <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <img
                    loading="lazy"
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pb-12">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Deskripsi / Konten (Rich Text) <span className="text-red-500">*</span>
            </label>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.description}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                className="h-96"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {initialData ? "Simpan Perubahan" : "Simpan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LayananForm;
