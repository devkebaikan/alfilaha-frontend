import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Main from "../Main/Main";
import Main2 from "../Main/Main2";
import Main3 from "../Main/Main3";
import Main4 from "../Main/Main4";
import Main5 from "../Main/Main5";
import ErrorPage from "../Shared/ErrorPage/ErrorPage";

// Semua halaman dimuat lazy (code-split) supaya bundel awal tetap ringan dan
// tiap halaman hanya diunduh saat benar-benar dibuka. Layout (Main*) tetap
// eager karena kecil dan dipakai sebagai kerangka.
const Home1 = lazy(() => import("../Pages/Home1/Home1"));
const Home2 = lazy(() => import("../Pages/Home2/Home2"));
const Home3 = lazy(() => import("../Pages/Home3/Home3"));
const Home4 = lazy(() => import("../Pages/Home4/Home4"));
const Home5 = lazy(() => import("../Pages/Home5/Home5"));
const AboutInner = lazy(
  () => import("../Pages/InnerPage/AboutInner/AboutInner"),
);
const ServiceInner = lazy(
  () => import("../Pages/InnerPage/ServiceInner/ServiceInner"),
);
const ServiceDetails = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails"),
);
const DynamicServiceDetails = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/DynamicServiceDetails"),
);
const ContactInner = lazy(
  () => import("../Pages/InnerPage/ContactInner/ContactInner"),
);
const BlogList = lazy(() => import("../Pages/InnerPage/BlogList/BlogList"));
const BlogDetails = lazy(
  () => import("../Pages/InnerPage/BlogDetails/BlogDetails"),
);
const BlogGrid = lazy(() => import("../Pages/InnerPage/BlogGrid/BlogGrid"));
const ProjectInner = lazy(
  () => import("../Pages/InnerPage/ProjectInner/ProjectInner"),
);
const TeamInner = lazy(() => import("../Pages/InnerPage/TeamInner/TeamInner"));
const PricingInner = lazy(
  () => import("../Pages/InnerPage/PricingInner/PricingInner"),
);
const DonationInner = lazy(
  () => import("../Pages/InnerPage/DonationInner/DonationInner"),
);
const ServiceDetails2 = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails2"),
);
const ServiceDetails3 = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails3"),
);
const ServiceDetails4 = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails4"),
);
const ServiceDetails5 = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails5"),
);
const ServiceDetails6 = lazy(
  () => import("../Pages/InnerPage/ServiceDetails/ServiceDetails6"),
);
const AppointmentInner = lazy(
  () => import("../Pages/InnerPage/Appointment/AppointmentInner"),
);
const ProjectDetails = lazy(
  () => import("../Pages/InnerPage/ProjectDetails/ProjectDetails"),
);
const FaqInner = lazy(
  () => import("../Pages/InnerPage/Faq/Accordion/FaqInner"),
);
const TestimonialInner = lazy(
  () => import("../Pages/InnerPage/TestimonialInner/TestimonialInner"),
);
const EventInner = lazy(
  () => import("../Pages/InnerPage/EventInner/EventInner"),
);
const EventDetails = lazy(
  () => import("../Pages/InnerPage/EventDetails/EventDetails"),
);
const PesanTempat = lazy(
  () => import("../Pages/InnerPage/PesanTempat/PesanTempatBaru"),
);
const CekTanaman = lazy(
  () => import("../Pages/InnerPage/CekTanaman/CekTanaman"),
);
const KubusAlfilaha = lazy(
  () => import("../Pages/InnerPage/KubusAlfilaha/KubusAlfilaha"),
);
const PaketWisata = lazy(
  () => import("../Pages/InnerPage/PaketWisata/PaketWisata"),
);
const GaleriFull = lazy(
  () => import("../Pages/InnerPage/GaleriFull/GaleriFull"),
);
const AlfilahaAdmin = lazy(
  () => import("../Pages/AlfilahaAdmin/AlfilahaAdmin"),
);
const Search = lazy(() => import("../Pages/InnerPage/Search/Search"));
const Pendaftaran = lazy(
  () => import("../Pages/InnerPage/Pendaftaran/Pendaftaran"),
);
const StatusPendaftaran = lazy(
  () => import("../Pages/InnerPage/Pendaftaran/StatusPendaftaran"),
);
const LoginSantri = lazy(
  () => import("../Pages/InnerPage/Pendaftaran/LoginSantri"),
);
const TanamanDetail = lazy(
  () => import("../Pages/InnerPage/Tanaman/TanamanDetail"),
);
const KoleksiTanaman = lazy(
  () => import("../Pages/InnerPage/Tanaman/KoleksiTanaman"),
);
const TanamanRiwayat = lazy(
  () => import("../Pages/InnerPage/Tanaman/TanamanRiwayat"),
);
const KoleksiTernak = lazy(
  () => import("../Pages/InnerPage/Peternakan/KoleksiTernak"),
);
const TernakDetail = lazy(
  () => import("../Pages/InnerPage/Peternakan/TernakDetail"),
);
const TernakRiwayat = lazy(
  () => import("../Pages/InnerPage/Peternakan/TernakRiwayat"),
);
const KoleksiKelas = lazy(
  () => import("../Pages/InnerPage/Kelas/KoleksiKelas"),
);
const KelasDetail = lazy(() => import("../Pages/InnerPage/Kelas/KelasDetail"));
const RegisterInternal = lazy(
  () => import("../Pages/InnerPage/Auth/RegisterInternal"),
);
const LoginInternal = lazy(
  () => import("../Pages/InnerPage/Auth/LoginInternal"),
);
const DashboardSantri = lazy(
  () => import("../Pages/InnerPage/DashboardSantri/DashboardSantri"),
);

// Fallback ringan saat chunk halaman sedang diunduh.
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
  </div>
);

const page = (Komponen) => (
  <Suspense fallback={<LoadingFallback />}>
    <Komponen />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Main />,
    children: [
      {
        path: "/",
        element: page(Home1),
      },
      {
        path: "/homeTest",
        element: page(Home2),
      },
      {
        path: "/about",
        element: page(AboutInner),
      },
      {
        path: "/service",
        element: page(ServiceInner),
      },
      {
        path: "/service/:id",
        element: page(DynamicServiceDetails),
      },
      {
        path: "/service_details",
        element: page(ServiceDetails),
      },
      {
        path: "/service_details2",
        element: page(ServiceDetails2),
      },
      {
        path: "/service_details3",
        element: page(ServiceDetails3),
      },
      {
        path: "/service_details4",
        element: page(ServiceDetails4),
      },
      {
        path: "/service_details5",
        element: page(ServiceDetails5),
      },
      {
        path: "/service_details6",
        element: page(ServiceDetails6),
      },
      {
        path: "/project",
        element: page(ProjectInner),
      },
      {
        path: "/project_details",
        element: page(ProjectDetails),
      },
      {
        path: "/https://beramalbersama.com/home",
        element: page(DonationInner),
      },
      {
        path: "/team_inner",
        element: page(TeamInner),
      },
      {
        path: "/pricing_inner",
        element: page(PricingInner),
      },
      {
        path: "/faq_inner",
        element: page(FaqInner),
      },
      {
        path: "/blog_grid",
        element: page(BlogGrid),
      },
      {
        path: "/blog_list",
        element: page(BlogList),
      },
      {
        path: "/blog_details/:id",
        element: page(BlogDetails),
      },
      {
        path: "/appointment",
        element: page(AppointmentInner),
      },
      {
        path: "/testimonial",
        element: page(TestimonialInner),
      },
      {
        path: "/contact",
        element: page(ContactInner),
      },
      {
        path: "/event",
        element: page(EventInner),
      },
      {
        path: "/event_details/:id",
        element: page(EventDetails),
      },
      {
        path: "/pesan-tempat",
        element: page(PesanTempat),
      },
      {
        path: "/cek-tanaman",
        element: page(CekTanaman),
      },
      {
        path: "/kubus-alfilaha",
        element: page(KubusAlfilaha),
      },
      {
        path: "/paket-wisata",
        element: page(PaketWisata),
      },
      {
        path: "/galeri",
        element: page(GaleriFull),
      },
      {
        path: "/search",
        element: page(Search),
      },
      {
        path: "/pendaftaran",
        element: page(Pendaftaran),
      },
      {
        path: "/status-pendaftaran",
        element: page(StatusPendaftaran),
      },
      {
        path: "/login-santri",
        element: page(LoginSantri),
      },
      {
        path: "/tanaman/:id",
        element: page(TanamanDetail),
      },
      {
        path: "/tanaman/:id/riwayat",
        element: page(TanamanRiwayat),
      },
      {
        path: "/koleksi-tanaman",
        element: page(KoleksiTanaman),
      },
      {
        path: "/peternakan/:jenis",
        element: page(TernakDetail),
      },
      {
        path: "/peternakan/:jenis/riwayat",
        element: page(TernakRiwayat),
      },
      {
        path: "/peternakan",
        element: page(KoleksiTernak),
      },
      {
        path: "/kelas",
        element: page(KoleksiKelas),
      },
      {
        path: "/kelas/:id",
        element: page(KelasDetail),
      },
      {
        path: "/register-petani",
        element: page(RegisterInternal),
      },
      {
        path: "/login-perawatan",
        element: page(LoginInternal),
      },
      {
        path: "/dashboard-santri",
        element: page(DashboardSantri),
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
        element: page(Home2),
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
        element: page(Home3),
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
        element: page(Home4),
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
        element: page(Home5),
      },
    ],
  },
  {
    path: "/admin",
    element: page(AlfilahaAdmin),
  },
  {
    path: "/admin/:tab",
    element: page(AlfilahaAdmin),
  },
]);

export default router;
