import { createBrowserRouter } from "react-router-dom";
import Main from "../Main/Main";
import Main2 from "../Main/Main2";
import Main3 from "../Main/Main3";
import Main4 from "../Main/Main4";
import Home1 from "../Pages/Home1/Home1";
import Home2 from "../Pages/Home2/Home2";
import Home3 from "../Pages/Home3/Home3";
import ErrorPage from "../Shared/ErrorPage/ErrorPage";
import Home4 from "../Pages/Home4/Home4";
import Home5 from "../Pages/Home5/Home5";
import AboutInner from "../Pages/InnerPage/AboutInner/AboutInner";
import ServiceInner from "../Pages/InnerPage/ServiceInner/ServiceInner";
import ServiceDetails from "../Pages/InnerPage/ServiceDetails/ServiceDetails";
import ContactInner from "../Pages/InnerPage/ContactInner/ContactInner";
import BlogList from "../Pages/InnerPage/BlogList/BlogList";
import BlogDetails from "../Pages/InnerPage/BlogDetails/BlogDetails";
import BlogGrid from "../Pages/InnerPage/BlogGrid/BlogGrid";
import ProjectInner from "../Pages/InnerPage/ProjectInner/ProjectInner";
import TeamInner from "../Pages/InnerPage/TeamInner/TeamInner";
import PricingInner from "../Pages/InnerPage/PricingInner/PricingInner";
import DonationInner from "../Pages/InnerPage/DonationInner/DonationInner";
import ServiceDetails2 from "../Pages/InnerPage/ServiceDetails/ServiceDetails2";
import ServiceDetails3 from "../Pages/InnerPage/ServiceDetails/ServiceDetails3";
import ServiceDetails4 from "../Pages/InnerPage/ServiceDetails/ServiceDetails4";
import ServiceDetails5 from "../Pages/InnerPage/ServiceDetails/ServiceDetails5";
import ServiceDetails6 from "../Pages/InnerPage/ServiceDetails/ServiceDetails6";
import AppointmentInner from "../Pages/InnerPage/Appointment/AppointmentInner";
import ProjectDetails from "../Pages/InnerPage/ProjectDetails/ProjectDetails";
import FaqInner from "../Pages/InnerPage/Faq/Accordion/FaqInner";
import Main5 from "../Main/Main5";
import TestimonialInner from "../Pages/InnerPage/TestimonialInner/TestimonialInner";
import EventInner from "../Pages/InnerPage/EventInner/EventInner";
import PesanTempat from "../Pages/InnerPage/PesanTempat/PesanTempatBaru";
import CekTanaman from "../Pages/InnerPage/CekTanaman/CekTanaman";
import KubusAlfilaha from "../Pages/InnerPage/KubusAlfilaha/KubusAlfilaha";
import PaketWisata from "../Pages/InnerPage/PaketWisata/PaketWisata";
import GaleriFull from "../Pages/InnerPage/GaleriFull/GaleriFull";
import AlfilahaAdmin from "../Pages/AlfilahaAdmin/AlfilahaAdmin";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home1 />,
      },
      {
        path: "/homeTest",
        element: <Home2 />,
      },
      {
        path: "/about",
        element: <AboutInner />,
      },
      {
        path: "/service",
        element: <ServiceInner />,
      },
      {
        path: "/service_details",
        element: <ServiceDetails />,
      },
      {
        path: "/service_details2",
        element: <ServiceDetails2 />,
      },
      {
        path: "/service_details3",
        element: <ServiceDetails3 />,
      },
      {
        path: "/service_details4",
        element: <ServiceDetails4 />,
      },
      {
        path: "/service_details5",
        element: <ServiceDetails5 />,
      },
      {
        path: "/service_details6",
        element: <ServiceDetails6 />,
      },
      {
        path: "/project",
        element: <ProjectInner />,
      },
      {
        path: "/project_details",
        element: <ProjectDetails />,
      },
      {
        path: "/donation_inner",
        element: <DonationInner />,
      },
      {
        path: "/team_inner",
        element: <TeamInner />,
      },
      {
        path: "/pricing_inner",
        element: <PricingInner />,
      },
      {
        path: "/faq_inner",
        element: <FaqInner />,
      },
      {
        path: "/blog_grid",
        element: <BlogGrid />,
      },
      {
        path: "/blog_list",
        element: <BlogList />,
      },
      {
        path: "/blog_details/:id",
        element: <BlogDetails />,
      },
      {
        path: "/appointment",
        element: <AppointmentInner />,
      },
      {
        path: "/testimonial",
        element: <TestimonialInner />,
      },
      {
        path: "/contact",
        element: <ContactInner />,
      },
      {
        path: "/event",
        element: <EventInner />,
      },
      {
        path: "/pesan-tempat",
        element: <PesanTempat />,
      },
      {
        path: "/cek-tanaman",
        element: <CekTanaman />,
      },
      {
        path: "/kubus-alfilaha",
        element: <KubusAlfilaha />,
      },
      {
        path: "/paket-wisata",
        element: <PaketWisata />,
      },
      {
        path: "/galeri",
        element: <GaleriFull />,
      },
    ],
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main2 />,
    children: [
      {
        path: "/home2",
        element: <Home2 />,
      },
    ],
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main3 />,
    children: [
      {
        path: "/home3",
        element: <Home3 />,
      },
    ],
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main4 />,
    children: [
      {
        path: "/home4",
        element: <Home4 />,
      },
    ],
  },
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main5 />,
    children: [
      {
        path: "/home5",
        element: <Home5 />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AlfilahaAdmin />,
  },
  {
    path: "/admin/:tab",
    element: <AlfilahaAdmin />,
  },
]);

export default router;
