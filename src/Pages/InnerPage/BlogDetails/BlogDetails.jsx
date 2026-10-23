import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import blog_detailsThumb from "/images/blog-details-thumb.jpg";
import itemthumb from "/images/post-1.png";
import itemthumb3 from "/images/post-3.png";
import { IoSearch } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaArrowRightLong,
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaRegCalendarCheck,
  FaRegFolderOpen,
  FaXTwitter,
} from "react-icons/fa6";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`,
        );
        if (response.ok) {
          const data = await response.json();
          setAllBlogs(data);
          const currentBlog = data.find((b) => b.id === parseInt(id));
          setBlog(currentBlog);
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold text-muted">Memuat artikel...</h2>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      return `${new Date(dateStr).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(dateStr).getMonth()]} ${new Date(dateStr).getFullYear()}`;
    }
    return dateStr;
  };

  const dateDisplay = formatDate(blog.date);

  const currentIndex = allBlogs.findIndex((b) => b.id === parseInt(id));
  const previousBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex !== -1 && currentIndex < allBlogs.length - 1
      ? allBlogs[currentIndex + 1]
      : null;

  const recentBlogs = allBlogs.filter((b) => b.id !== parseInt(id)).slice(0, 3);

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Blog Details"}
        breadCrumbIcon={<FaArrowRightLong />}
        url={"/blog_grid"}
        breadCrumbLink={"Blog"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={blog.title}
        bgImage={"/images/blog-new-1.jpg"}
      />
      <section className="py-28">
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="border border-line rounded-md overflow-hidden">
                <div className="relative">
                  <img decoding="async"
                    loading="lazy"
                    draggable="false"
                    src={
                      blog.image
                        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${blog.image}`
                        : blog_detailsThumb
                    }
                    className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover"
                    style={{ maxHeight: "500px" }}
                  />
                  <h6 className="font-AlbertSans text-white px-5 py-2 rounded absolute top-5 left-5 bg-PrimaryColor-0">
                    Informasi
                  </h6>
                </div>
                <div className="px-4 sm:px-8">
                  <h2 className="font-AlbertSans font-bold text-left text-lg sm:text-2xl 2xl:text-3xl text-HeadingColor-0 mt-9 mb-6">
                    {blog.title}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-7 border-b border-BorderColor1-0 pb-7">
                    <h6 className="flex items-center gap-2 font-AlbertSans text-TextColor-0 font-light">
                      <FaUserCircle className="text-4xl text-[#dedede]" />
                      Admin Alfilaha
                    </h6>
                    <h6 className="flex items-center gap-2 font-AlbertSans text-TextColor-0 font-light">
                      <FaRegCalendarCheck className="text-lg text-PrimaryColor-0" />
                      {dateDisplay}
                    </h6>
                  </div>

                  {/* KONTEN RICH TEXT EDITOR DIRENDER DI SINI */}
                  <div
                    className="font-AlbertSans font-light text-TextColor-0 prose prose-lg max-w-none text-justify"
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content ||
                        blog.excerpt ||
                        "<p>Tidak ada konten.</p>",
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:justify-between border-t border-BorderColor1-0 mt-9 py-5 px-4 sm:px-8">
                  <div>
                    <h6 className="font-AlbertSans text-lg font-medium">
                      <Link to={"/"}>
                        <button className="font-AlbertSans font-normal text-sm px-5 py-2 text-HeadingColor-0 rounded bg-surface2 transition-all duration-500 hover:bg-PrimaryColor-0 hover:text-white mr-2 ml-1">
                          Environmental
                        </button>
                      </Link>
                      <Link to={"/"}>
                        <button className="font-AlbertSans font-normal text-sm px-5 py-2 text-HeadingColor-0 rounded bg-surface2 transition-all duration-500 hover:bg-PrimaryColor-0 hover:text-white">
                          Cleaning
                        </button>
                      </Link>
                    </h6>
                  </div>
                  <div>
                    <ul className="flex justify-center items-center gap-2">
                      <li>
                        <Link to={"/"}>
                          <button className="text-white w-9 h-9 rounded-full bg-[#1673ea] flex justify-center items-center">
                            <FaFacebookF size={"13"} />
                          </button>
                        </Link>
                      </li>
                      <li>
                        <Link to={"/"}>
                          <button className="text-white w-9 h-9 rounded-full bg-[#38ceff] flex justify-center items-center">
                            <FaXTwitter size={"13"} />
                          </button>
                        </Link>
                      </li>
                      <li>
                        <Link to={"/"}>
                          <button className="text-white w-9 h-9 rounded-full bg-[#0b4ab1] flex justify-center items-center">
                            <FaLinkedinIn size={"13"} />
                          </button>
                        </Link>
                      </li>
                      <li>
                        <Link to={"/"}>
                          <button className="text-white w-9 h-9 rounded-full bg-[#e92928] flex justify-center items-center">
                            <FaPinterestP size={"13"} />
                          </button>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-[60px]">
                <div className="rounded-md bg-surface2 pt-8 pb-10 px-9">
                  {previousBlog ? (
                    <>
                      <button className="font-AlbertSans font-medium text-lg text-HeadingColor-0 flex items-center gap-2">
                        <FaAnglesLeft size={"14"} />
                        Previous Post
                      </button>
                      <Link
                        to={`/blog_details/${previousBlog.id}`}
                        className="flex flex-col sm:flex-row lg:flex-col xl:flex-row xl:items-center gap-5 sm:items-center lg:items-start mt-5"
                      >
                        <div>
                          <img decoding="async"
                            loading="lazy"
                            draggable="false"
                            src={
                              previousBlog.image
                                ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${previousBlog.image}`
                                : itemthumb
                            }
                            className="w-[81px] h-[80px] object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-AlbertSans font-medium sm:text-lg md:text-base 2xl:text-lg text-HoverColor-0 sm:leading-[26px] line-clamp-2">
                            {previousBlog.title}
                          </h4>
                          <p className="font-AlbertSans text-sm text-SecondaryColor-0 mt-1">
                            {formatDate(previousBlog.date)}
                          </p>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="h-full flex items-center text-muted">
                      Tidak ada artikel sebelumnya
                    </div>
                  )}
                </div>
                <div className="rounded-md bg-surface2 pt-8 pb-10 px-9 flex flex-col items-end">
                  {nextBlog ? (
                    <>
                      <button className="font-AlbertSans font-medium text-lg text-HeadingColor-0 flex items-center gap-2">
                        Next Post
                        <FaAnglesRight size={"14"} />
                      </button>
                      <Link
                        to={`/blog_details/${nextBlog.id}`}
                        className="flex flex-col sm:flex-row lg:flex-col xl:flex-row xl:items-center gap-5 sm:items-center lg:items-start mt-5 text-right"
                      >
                        <div className="flex-1">
                          <h4 className="font-AlbertSans font-medium sm:text-lg md:text-base 2xl:text-lg text-HoverColor-0 sm:leading-[26px] line-clamp-2">
                            {nextBlog.title}
                          </h4>
                          <p className="font-AlbertSans text-sm text-SecondaryColor-0 mt-1">
                            {formatDate(nextBlog.date)}
                          </p>
                        </div>
                        <div>
                          <img decoding="async"
                            loading="lazy"
                            draggable="false"
                            src={
                              nextBlog.image
                                ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${nextBlog.image}`
                                : itemthumb3
                            }
                            className="w-[81px] h-[80px] object-cover rounded"
                          />
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="h-full flex items-center text-muted">
                      Tidak ada artikel selanjutnya
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <div className="relative inline-block w-full mb-7 p-4 sm:p-8 lg:p-6 xl:p-8 rounded-md bg-surface2">
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search here..."
                  required
                  className="w-full h-[56px] p-6 rounded font-AlbertSans"
                />
                <button
                  type="submit"
                  className=" text-xl text-white rounded h-[56px] w-[56px] bg-PrimaryColor-0 transition-all duration-500 flex items-center justify-center hover:hue-rotate-[360deg] absolute right-7 inset-y-0 my-auto"
                >
                  <IoSearch />
                </button>
              </div>
              <div className="bg-surface2 rounded-md px-4 sm:px-8 lg:px-6 xl:px-8 pt-7 pb-4 mb-7">
                <h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-PrimaryColor-0">
                  Categories
                </h4>
                <ul className="mt-8">
                  <li>
                    <Link to={"/service_details"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Ocean Cleaning
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details2"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Dust Recycling
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details3"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Plant Seedlings
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details4"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Renewable Energy
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details5"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Environmental
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details6"}>
                      <button className="w-full font-AlbertSans text-left text-HeadingColor-0 transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded bg-card mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white">
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                          Forest Cleaning
                        </span>
                        <FaArrowRightLong className="text-PrimaryColor-0 transition-all duration-500 group-hover:text-white" />
                      </button>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="px-4 sm:px-8 lg:px-6 xl:px-8 bg-surface2 rounded-md pt-7 pb-4 mb-7">
                <h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-PrimaryColor-0">
                  Artikel Terbaru
                </h4>
                {recentBlogs.length > 0 ? (
                  recentBlogs.map((rb, idx) => (
                    <Link
                      to={`/blog_details/${rb.id}`}
                      key={rb.id}
                      className="block w-full"
                    >
                      <button
                        className={`w-full group flex gap-4 ${idx === 0 ? "mb-6" : "my-6"}`}
                      >
                        <div>
                          <img decoding="async"
                            loading="lazy"
                            draggable="false"
                            src={
                              rb.image
                                ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${rb.image}`
                                : itemthumb
                            }
                            className="w-[81px] h-[80px] object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h6 className="font-AlbertSans font-medium text-lg lg:text-base 2xl:text-lg leading-6 text-HeadingColor-0 transition-all duration-500 group-hover:text-PrimaryColor-0 line-clamp-2">
                            {rb.title}
                          </h6>
                          <p className="font-AlbertSans text-PrimaryColor-0 text-sm mt-1">
                            {formatDate(rb.date)}
                          </p>
                        </div>
                      </button>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted text-sm pb-4">
                    Belum ada artikel lain.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetails;
