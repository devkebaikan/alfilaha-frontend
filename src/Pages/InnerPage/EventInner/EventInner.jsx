import React, { useState, useEffect } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import EventCard from "./EventCard";
import subTitleShape from "/images/sub-title-shape.png";

const EventInner = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data event dari backend", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Event & Kegiatan"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Event & Kegiatan"}
        bgImage={"/images/services-plant-1.jpg"}
        overlayClass={"bg-black/70"}
      />
      <section className="pt-28 pb-[120px]">
        <div className="Container">
          <div className="text-center mb-12">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" alt="" />
              EVENT & KEGIATAN
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Kegiatan & Acara <br className="hidden sm:block" />
              Pesantren Alfilaha
            </h1>
            <p className="font-AlbertSans text-TextColor-0 mt-4 max-w-2xl mx-auto">
              Ikuti berbagai kegiatan edukatif, workshop, dan event menarik yang
              kami selenggarakan untuk santri dan masyarakat umum.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-bold">Memuat Event...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-bold">Belum ada event saat ini.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-[60px]">
              {events.map((event) => (
                <div key={event.id}>
                  <EventCard
                    eventThumb={event.image ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${event.image}` : "/images/blog-list.png"}
                    eventDate={event.date}
                    eventCategory={event.category}
                    eventTitle={event.title}
                    eventDesc={event.description}
                    eventUrl={"/blog_details"}
                    btnIcon={<FaArrowRightLong />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EventInner;
