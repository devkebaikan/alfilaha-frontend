import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import { FaArrowRightLong, FaRegCalendarCheck } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";

const EventDetails = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`
        );
        if (response.ok) {
          const data = await response.json();
          const currentEvent = data.find((e) => e.id === parseInt(id));
          setEventData(currentEvent);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-500">Memuat event...</h2>
      </div>
    );
  }

  const dateDisplay =
    eventData.date && eventData.date.includes("-") && eventData.date.split("-")[0].length === 4
      ? `${new Date(eventData.date).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(eventData.date).getMonth()]} ${new Date(eventData.date).getFullYear()}`
      : eventData.date;

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Detail Event"}
        breadCrumbIcon={<FaArrowRightLong />}
        url={"/event"}
        breadCrumbLink={"Event"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={eventData.title}
        bgImage={"/images/services-plant-1.jpg"}
      />
      <section className="py-20 lg:py-28 bg-[#f3f4f8]">
        <div className="Container">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Foto menjadi lebih besar */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[700px] overflow-hidden">
              <img
                loading="lazy"
                draggable="false"
                src={
                  eventData.image
                    ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${eventData.image}`
                    : "/images/blog-details-thumb.jpg"
                }
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt={eventData.title}
              />
              <div className="absolute top-6 left-6 bg-PrimaryColor-0 text-white font-AlbertSans px-6 py-2 rounded-full shadow-lg font-bold tracking-wide uppercase text-sm">
                {eventData.category || "Kegiatan"}
              </div>
            </div>
            
            <div className="px-6 py-10 sm:p-12 lg:p-16">
              <h1 className="font-AlbertSans font-extrabold text-left text-3xl sm:text-4xl lg:text-5xl text-HeadingColor-0 mb-8 leading-tight">
                {eventData.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-10 border-b border-gray-200 pb-8">
                <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-200">
                  <FaUserCircle className="text-2xl text-gray-400" />
                  <span className="font-AlbertSans text-gray-600 font-medium text-sm">Admin Alfilaha</span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 px-5 py-2.5 rounded-full border border-green-100 shadow-sm">
                  <FaRegCalendarCheck className="text-xl text-PrimaryColor-0" />
                  <span className="font-AlbertSans text-PrimaryColor-0 font-bold text-sm">{dateDisplay}</span>
                </div>
              </div>

              {/* KONTEN RICH TEXT EDITOR */}
              <div
                className="font-AlbertSans text-TextColor-0 prose prose-lg prose-green max-w-none text-justify leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    eventData.description ||
                    "<p>Belum ada deskripsi untuk event ini.</p>",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventDetails;
