/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const BlogCard = ({
  blogThumb,
  thumbContent,
  blogUrl,
  blogTitle,
  blogDesc,
  btnContent,
  btnIcon,
}) => {
  return (
    <div className="bg-surface2 group transition-all duration-500 hover:bg-card hover:shadow-cases rounded-md flex flex-col h-full">
      <div className="relative overflow-hidden rounded-md shrink-0">
        <img decoding="async"
          loading="lazy"
          src={blogThumb}
          className="transition-all duration-500 scale-100 group-hover:scale-110 w-full h-[200px] sm:h-[250px] lg:h-[300px] object-cover"
        />
        <div className="absolute left-3 sm:left-4 top-4 sm:top-5">
          <h6 className="font-AlbertSans text-sm uppercase text-center inline-block overflow-hidden rounded px-4 py-[8px] text-white transition-all duration-500 group-hover:text-white bg-PrimaryColor-0 relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-SecondaryColor-0 before:transition-all before:duration-500 before:-z-10 before:scale-0 group-hover:before:scale-100">
            {thumbContent}
          </h6>
        </div>
      </div>
      <div className="px-5 sm:px-7 pb-6 sm:pb-7 flex flex-col flex-1">
        <Link to={blogUrl} className="block mt-5 sm:mt-7 mb-3">
          <h3 className="font-AlbertSans text-left font-semibold text-xl sm:text-[22px] lg:text-xl xl:text-[22px] text-HeadingColor-0 line-clamp-2">
            {blogTitle}
          </h3>
        </Link>
        <p className="font-AlbertSans font-light text-TextColor-0 text-[14px] sm:text-base mb-6 sm:mb-8 leading-[1.8] line-clamp-3">
          {blogDesc}
        </p>
        <div className="mt-auto">
          <Link to={blogUrl} className="inline-block">
            <button className="primary-btn2 !rounded !px-7 !py-3">
              {btnContent}
              {btnIcon}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
