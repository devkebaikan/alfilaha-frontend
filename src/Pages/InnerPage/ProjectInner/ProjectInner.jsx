import { FaArrowRightLong } from "react-icons/fa6";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import projectThumb from "/images/project-new-1.jpg";
import projectThumb2 from "/images/project-new-2.jpg";
import projectThumb3 from "/images/project-new-3.jpg";
import projectThumb4 from "/images/project-new-4.jpg";
import projectThumb5 from "/images/project-img5.jpg";
import projectThumb6 from "/images/project-img6.jpg";
import projectShape from "/images/project-shape.png";
import projectContentShape from "/images/project-content-shape.png";
import subTitleShape from "/images/sub-title-shape.png";
import ProjectCard from "./ProjectCard";

const ProjectData = [
  {
    id: 1,
    projectThumb: projectThumb,
    projectSubTitle: "Climate",
    projectTitle: "Cleaning Forest",
    projectUrl: "/project_details",
    buttonTitle: "View Details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
  {
    id: 2,
    projectThumb: projectThumb2,
    projectSubTitle: "Environment",
    projectTitle: "Echology Energy",
    projectUrl: "/project_details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
  {
    id: 3,
    projectThumb: projectThumb3,
    projectSubTitle: "Recycling",
    projectTitle: "Plastic Recycling",
    projectUrl: "/project_details",
    buttonTitle: "View Details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
  {
    id: 4,
    projectThumb: projectThumb4,
    projectSubTitle: "Recycling",
    projectTitle: "Ocean Cleaning",
    projectUrl: "/project_details",
    buttonTitle: "View Details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
  {
    id: 5,
    projectThumb: projectThumb5,
    projectSubTitle: "Plants",
    projectTitle: "Seedlings Plants",
    projectUrl: "/project_details",
    buttonTitle: "View Details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
  {
    id: 6,
    projectThumb: projectThumb6,
    projectSubTitle: "Energy",
    projectTitle: "Renewable Energy",
    projectUrl: "/project_details",
    buttonTitle: "View Details",
    buttonIcon: <FaArrowRightLong />,
    projectContentShape: projectContentShape,
    projectShape: projectShape,
  },
];

const ProjectInner = () => {
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Projects"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Projects"}
      />
      <section className="py-16 sm:py-20 lg:py-28 bg-surface2">
        <div className="Container">
          <div className="text-center">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
              LAYANAN KAMI
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-[1.3] sm:text-[38px] sm:leading-[48px] md:text-[40px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 px-1 sm:px-2">
              Echofy Provide Environment <br />
              Best Leading Services
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 mt-10 sm:mt-[60px]">
            {ProjectData.map(
              ({
                id,
                projectThumb,
                projectShape,
                projectContentShape,
                projectSubTitle,
                projectTitle,
                projectUrl,
                buttonTitle,
                buttonIcon,
              }) => {
                return (
                  <div key={id}>
                    <ProjectCard
                      projectThumb={projectThumb}
                      projectContentShape={projectContentShape}
                      projectShape={projectShape}
                      projectSubTitle={projectSubTitle}
                      projectTitle={projectTitle}
                      projectUrl={projectUrl}
                      buttonTitle={buttonTitle}
                      buttonIcon={buttonIcon}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectInner;
