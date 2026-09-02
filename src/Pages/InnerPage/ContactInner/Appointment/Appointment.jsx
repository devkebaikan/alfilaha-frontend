import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import subTitleShape from "/images/sub-title-shape.png";

const Appointment = () => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    address: "",
    message: "",
  });
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setToast({ show: true, type: "success", message: "Pesan berhasil dikirim!" });
        setFormData({
          name: "",
          number: "",
          email: "",
          address: "",
          message: "",
        });
      } else {
        setToast({ show: true, type: "error", message: "Gagal mengirim pesan." });
      }
    } catch (error) {
      console.error("Error submitting message:", error);
      setToast({ show: true, type: "error", message: "Terjadi kesalahan sistem." });
    }
    
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4500);
  };

  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setToast({ show: false, type: "", message: "" })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl max-w-sm w-full mx-auto z-10"
            >
              {toast.type === "success" ? (
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5 relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50"></div>
                  <FiCheckCircle className="w-10 h-10 text-green-600 relative z-10" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5 relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50"></div>
                  <FiAlertCircle className="w-10 h-10 text-red-600 relative z-10" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {toast.type === "success" ? "Berhasil!" : "Gagal!"}
              </h3>
              <p className="text-gray-500 font-medium mb-6">
                {toast.message}
              </p>
              <button
                onClick={() => setToast({ show: false, type: "", message: "" })}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 shadow-lg ${
                  toast.type === "success"
                    ? "bg-green-600 hover:bg-green-700 hover:shadow-green-200"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-red-200"
                }`}
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <section className="py-[102px] pl-7 lg:pl-0">
        <div className="Container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <iframe
              src="https://maps.google.com/maps?q=-7.5823424,110.9985186&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="632"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg w-full"
            ></iframe>
          </div>
          <div className="mr-4">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" />
              GET IN TOUCH
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-10">
              Write Us Something
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div className="flex flex-col md:flex-row gap-7">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name*"
                  required
                  className="border border-BorderColor2-0 rounded py-2 px-6 outline-none h-[56px] w-full"
                />
                <input
                  type="text"
                  name="number"
                  id="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Your Number"
                  className="border border-BorderColor2-0 rounded py-2 px-6 outline-none h-[56px] w-full"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-7">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your E-Mail*"
                  required
                  className="border border-BorderColor2-0 rounded py-2 px-6 outline-none h-[56px] w-full"
                />
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your Address"
                  className="border border-BorderColor2-0 rounded py-2 px-6 outline-none h-[56px] w-full"
                />
              </div>
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write A Message..."
                className="border border-BorderColor2-0 rounded py-2 px-6 outline-none resize-none h-[140px] w-full"
              ></textarea>
              <div className="flex gap-2 text-TextColor-0 font-AlbertSans">
                <input type="checkbox" name="terms" id="terms" required />
                <p>I agree with the Terms & Conditions</p>
              </div>
              <div className="inline-block">
                <button type="submit" className="primary-btn2">
                  Submit Message
                  <FaArrowRightLong size={"20"} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Appointment;
