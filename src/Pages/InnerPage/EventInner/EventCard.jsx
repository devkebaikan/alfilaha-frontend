import { Link } from "react-router-dom";

const EventCard = ({
  eventThumb,
  eventDate,
  eventCategory,
  eventTitle,
  eventDesc,
  eventUrl,
  btnIcon,
}) => {
  // Parsing Date to handle YYYY-MM-DD or existing string nicely
  let day = "",
    month = "",
    year = "";
  try {
    if (
      eventDate &&
      eventDate.includes("-") &&
      eventDate.split("-")[0].length === 4
    ) {
      const dateObj = new Date(eventDate);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      day = dateObj.getDate();
      month = months[dateObj.getMonth()];
      year = dateObj.getFullYear();
    } else {
      const parts = eventDate ? eventDate.split(" ") : [];
      if (parts.length >= 3) {
        day = parts[0];
        month = parts[1].substring(0, 3); // shorten month
        year = parts[2];
      } else {
        day = eventDate;
      }
    }
  } catch (e) {
    day = eventDate;
  }

  return (
    <div className="group rounded-md overflow-hidden bg-white border border-BorderColor2-0 transition-all duration-500 hover:shadow-lg flex flex-col h-full">
      <div className="relative overflow-hidden before:absolute before:bottom-0 before:left-0 before:bg-gradient-to-t before:from-[rgba(5,22,0,0.5)] before:to-transparent before:w-full before:h-full shrink-0">
        <img
          loading="lazy"
          src={eventThumb}
          alt={eventTitle}
          className="w-full h-64 object-cover transition-all duration-500 scale-100 group-hover:scale-110"
        />
        {eventDate && (
          <div className="absolute top-5 left-5">
            <div className="bg-PrimaryColor-0 text-white px-3 py-1.5 rounded-md font-AlbertSans shadow-md flex flex-col items-center justify-center min-w-[3.5rem]">
              <span className="text-2xl font-extrabold leading-none mb-1">
                {day}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold leading-none">
                {month} {year}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="px-7 pt-6 pb-8 flex flex-col flex-grow">
        {eventCategory && (
          <span className="text-PrimaryColor-0 font-AlbertSans font-semibold text-sm uppercase tracking-wide">
            {eventCategory}
          </span>
        )}
        <Link to={eventUrl} className="block mt-3 mb-4">
          <h3 className="font-AlbertSans font-bold text-left text-xl sm:text-[22px] lg:text-xl xl:text-[22px] text-HeadingColor-0 transition-all duration-500 hover:text-PrimaryColor-0 leading-snug">
            {eventTitle}
          </h3>
        </Link>
        <p className="font-AlbertSans text-TextColor-0 mb-6 leading-relaxed line-clamp-3 flex-grow">
          {eventDesc}
        </p>
        <Link
          to={eventUrl}
          className="inline-flex items-center gap-2 font-AlbertSans font-semibold text-PrimaryColor-0 transition-all duration-300 hover:text-HeadingColor-0 mt-auto"
        >
          Selengkapnya
          {btnIcon}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
