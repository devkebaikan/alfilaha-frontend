import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import projectDetailsThumb from "/images/project-details-thumb.jpg";
import projectDetailsListThumb from "/images/project-details-item-images.jpg";
import { FaArrowRightLong, FaCircleCheck } from "react-icons/fa6";

const ProjectDetails = () => {
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Project Details"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Project"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={"Echology Energy"}
      />
      <section className="py-16 sm:py-20 lg:py-[120px]">
        <div className="Container">
          <img decoding="async"
            loading="lazy"
            src={projectDetailsThumb}
            draggable="false"
            className="w-full h-[200px] sm:h-[320px] lg:h-auto object-cover rounded-lg"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-[70px] mt-8 lg:mt-12">
            <div className="lg:col-span-2">
              <h2 className="font-AlbertSans font-bold text-3xl sm:text-4xl text-HeadingColor-0">
                Rapidiously Formulate efficient
              </h2>
              <p className="font-AlbertSans text-TextColor-0 mt-6">
                Alternative innovation to ethical network environmental
                whiteboard pursue compelling results premier methods
                empowerment. Dramatically architect go forward opportunities
                before user-centric partner Credibly implement exceptional
              </p>
              <p className="font-AlbertSans text-TextColor-0 mt-7 mb-9">
                Continually fashion orthogonal leadership skills whereas
                wireless metrics. Uniquely syndicate exceptio opportunities with
                interdependent users. Globally enhance fully tested
                meta-services rather than pan solutions. Proactively integrate
                client-integrate go forward architectures and turnkey
                meta-services. Interactively harness integrated ROI whereas
                frictionless products.
              </p>
              <h2 className="font-AlbertSans font-semibold text-[28px] text-HeadingColor-0 mt-[52px]">
                Quickly Parallel Task
              </h2>
              <p className="font-AlbertSans text-TextColor-0 mt-6">
                Methods empowerment. Dramatically architect go forward
                opportunities credibly revolutionize front-end initiatives for
                interoperable outsourcing. Conveniently repurpose market-driven
                deliverables without holistic potentialitiess distinctively
                integrate
              </p>
              <div className="grid gap-7 grid-cols-1 lg:grid-cols-1 md:grid-cols-2 items-center xl:grid-cols-2 mt-12">
                <div>
                  <img decoding="async"
                    loading="lazy"
                    src={projectDetailsListThumb}
                    draggable="false"
                  />
                </div>
                <div>
                  <h2 className="font-AlbertSans font-semibold text-[28px] text-HeadingColor-0">
                    Project Benifits
                  </h2>
                  <ul className="flex flex-col gap-[14px] mt-7">
                    <li className="flex gap-3 items-center font-AlbertSans text-TextColor-0">
                      <FaCircleCheck
                        size={"20"}
                        className="text-PrimaryColor-0"
                      />
                      Innovate wireless market
                    </li>
                    <li className="flex gap-3 items-center font-AlbertSans text-TextColor-0">
                      <FaCircleCheck
                        size={"20"}
                        className="text-PrimaryColor-0"
                      />
                      Productivate resource sucking
                    </li>
                    <li className="flex gap-3 items-center font-AlbertSans text-TextColor-0">
                      <FaCircleCheck
                        size={"20"}
                        className="text-PrimaryColor-0"
                      />
                      Proactively unleash oriented communities
                    </li>
                    <li className="flex gap-3 items-center font-AlbertSans text-TextColor-0">
                      <FaCircleCheck
                        size={"20"}
                        className="text-PrimaryColor-0"
                      />
                      Credibly develop progressive archi
                    </li>
                    <li className="flex gap-3 items-center font-AlbertSans text-TextColor-0">
                      <FaCircleCheck
                        size={"20"}
                        className="text-PrimaryColor-0"
                      />
                      Phosfluorescently to customer
                    </li>
                  </ul>
                </div>
              </div>
              <h2 className="font-AlbertSans font-semibold text-[28px] text-PrimaryColor-0 mt-[44px]">
                Competently architect intermandated deliverables client niches
                continually underwhelm
              </h2>
              <p className="font-AlbertSans text-TextColor-0 text-[15px] sm:text-base mt-5 leading-[1.8]">
                Appropriately communicate economically sound e-commerce after
                enterprise services. Dramatically target cross-media solutions
                and error-free platforms. Monotonectally pontificate 24/365
                human capital and dynamic potentialities compellingly pursue
              </p>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-lg overflow-hidden bg-surface2 dark:bg-PrimaryColor-0/10 mb-7">
                <div className="mx-5 sm:mx-9 pt-6 sm:pt-9 border-b border-dashed border-line pb-4">
                  <p className="font-AlbertSans text-TextColor-0">Clients :</p>
                  <h5 className="font-AlbertSans font-medium text-HeadingColor-0 pt-1">
                    Holquim Group & Company
                  </h5>
                </div>
                <div className="mx-5 sm:mx-9 pt-3 border-b border-dashed border-line pb-4">
                  <p className="font-AlbertSans text-TextColor-0">Category :</p>
                  <h5 className="font-AlbertSans font-medium text-HeadingColor-0 pt-1">
                    Dust Recycling
                  </h5>
                </div>
                <div className="mx-9 pt-3 border-b border-dashed border-line pb-4">
                  <p className="font-AlbertSans text-TextColor-0">
                    Starting Date :
                  </p>
                  <h5 className="font-AlbertSans font-medium text-HeadingColor-0 pt-1">
                    02 January, 2024
                  </h5>
                </div>
                <div className="mx-9 pt-3 border-b border-dashed border-line pb-4">
                  <p className="font-AlbertSans text-TextColor-0">
                    Ending Date :
                  </p>
                  <h5 className="font-AlbertSans font-medium text-HeadingColor-0 pt-1">
                    05 June, 2024
                  </h5>
                </div>
                <div className="mx-5 sm:mx-9 pt-3">
                  <p className="font-AlbertSans text-TextColor-0">
                    Project Value :
                  </p>
                  <h5 className="font-AlbertSans font-medium text-HeadingColor-0 pt-1 pb-8">
                    $5,000
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetails;
