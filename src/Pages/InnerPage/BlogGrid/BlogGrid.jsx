import { useState, useEffect } from "react";
import { FaAngleRight, FaArrowRightLong } from "react-icons/fa6";
import BlogCard from "./BlogCard";
import { Link } from "react-router-dom";
import subTitleShape from "/images/sub-title-shape.png";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";

const BlogGrid = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`);
        if(response.ok) {
          const data = await response.json();
          setBlogs(data);
        }
      } catch(err) {
        console.error("Backend Error:", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Blog Grid"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Blog"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={"Blog Grid"}
        bgImage={"/images/blog-new-1.jpg"}
      />
      <section className="pt-28">
        <div className="Container">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-center">
            <div>
              <div>
                <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
                  <img loading="lazy" src={subTitleShape} draggable="false" />
                  BLOG TERBARU
                </h5>
                <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-3">
                  Baca Berita Terbaru <br /> dari Blog Kami
                </h1>
              </div>
            </div>
            <div className="flex lg:justify-end">
              <Link to={"/blog_details"}>
                <button className="primary-btn">
                  Lihat Semua Blog
                  <FaArrowRightLong size={"20"} />
                </button>
              </Link>
            </div>
          </div>
          <div className="mt-[60px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {blogs.length > 0 ? blogs.map((item) => {
                const dateDisplay = item.date && item.date.includes('-') && item.date.split('-')[0].length === 4 
                  ? `${new Date(item.date).getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][new Date(item.date).getMonth()]} ${new Date(item.date).getFullYear()}` 
                  : item.date;

                return (
                  <div key={item.id}>
                    <BlogCard
                      blogThumb={item.image ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}` : '/images/blog-new-1.jpg'}
                      thumbContent={dateDisplay}
                      blogUrl={"/blog_details"}
                      blogTitle={item.title}
                      blogDesc={item.excerpt}
                      btnContent={"Read More"}
                      btnIcon={<FaArrowRightLong />}
                    />
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-10 text-gray-500 font-bold">
                  Belum ada artikel blog yang tersedia saat ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div>
        <ul className="flex items-center gap-2 justify-center pb-[120px] pt-[80px]">
          <li>
            <button className="h-[50px] w-[50px] font-AlbertSans rounded-full border-BorderColor2-0 border bg-white flex justify-center items-center text-HeadingColor-0 transition-all duration-500 hover:text-white overflow-hidden relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-PrimaryColor-0 before:transition-all before:duration-500 before:scale-0 hover:before:scale-100">
              01
            </button>
          </li>
          <li>
            <button className="h-[50px] w-[50px] font-AlbertSans rounded-full border-BorderColor2-0 border bg-white flex justify-center items-center text-HeadingColor-0 transition-all duration-500 hover:text-white overflow-hidden relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-PrimaryColor-0 before:transition-all before:duration-500 before:scale-0 hover:before:scale-100">
              02
            </button>
          </li>
          <li>
            <button className="h-[50px] w-[50px] font-AlbertSans rounded-full border-BorderColor2-0 border bg-white flex justify-center items-center text-HeadingColor-0 transition-all duration-500 hover:text-white overflow-hidden relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-PrimaryColor-0 before:transition-all before:duration-500 before:scale-0 hover:before:scale-100">
              03
            </button>
          </li>
          <li>
            <button className="h-[50px] w-[50px] font-AlbertSans rounded-full border-BorderColor2-0 border bg-white flex justify-center items-center text-HeadingColor-0 transition-all duration-500 hover:text-white overflow-hidden relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-PrimaryColor-0 before:transition-all before:duration-500 before:scale-0 hover:before:scale-100">
              <FaAngleRight />
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default BlogGrid;
