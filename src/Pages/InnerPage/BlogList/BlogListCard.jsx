/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const BlogListCard = ({
  blogListImg,
  thumbContent,
  blogListTitle,
  postByIcon,
  postBy,
  postDateIcon,
  postDate,
  postFileIcon,
  postFile,
  blogListDesc,
  blogListUrl,
  blogListBtn,
  blogListBtnIcon,
}) => {
  return (
    <div className="border border-line rounded-md overflow-hidden group">
      <div className="relative overflow-hidden">
        <img decoding="async"
          loading="lazy"
          src={blogListImg}
          className="w-full h-[200px] sm:h-auto transition-all duration-500 group-hover:scale-110"
        />
        <h6 className="font-AlbertSans text-white text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded absolute top-4 sm:top-5 left-4 sm:-left-1/4 transition-all duration-500 bg-PrimaryColor-0 group-hover:sm:left-5">
          {thumbContent}
        </h6>
      </div>
      <div className="px-5 sm:px-8">
        <Link to={blogListUrl}>
          <button className="font-AlbertSans font-bold text-left text-lg sm:text-2xl 2xl:text-3xl text-HeadingColor-0 transition-all duration-500 hover:text-PrimaryColor-0 mt-9 mb-6">
            {blogListTitle}
          </button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-7">
          <h6 className="flex items-center gap-2 font-AlbertSans text-TextColor-0 font-light">
            <span className="text-4xl text-line">{postByIcon}</span>
            {postBy}
          </h6>
          <h6 className="flex items-center gap-2 font-AlbertSans text-TextColor-0 font-light">
            <span className="text-lg text-PrimaryColor-0">{postDateIcon}</span>
            {postDate}
          </h6>
          <h6 className="flex items-center gap-2 font-AlbertSans text-TextColor-0 font-light">
            <span className="text-lg text-PrimaryColor-0">{postFileIcon}</span>
            {postFile}
          </h6>
        </div>
        <p className="font-AlbertSans font-light text-TextColor-0 text-[15px] sm:text-base mb-8 leading-[1.8]">
          {blogListDesc}
        </p>
      </div>
      <div className="border-t border-line py-5 px-5 sm:px-8">
        <Link to={blogListUrl}>
          <button className="primary-btn2 !rounded !px-7 !py-3 group-hover:before:w-full group-hover:before:left-0">
            {blogListBtn} {blogListBtnIcon}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BlogListCard;
