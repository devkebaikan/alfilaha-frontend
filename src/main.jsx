import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import router from "./Router/Router.jsx";
import { RouterProvider } from "react-router-dom";
import { SiteProvider } from "./Context/SiteContext.jsx";
// import { HelmetProvider } from "react-helmet-async";
// import HelmetChanger from "./Shared/Helmet/Helmet.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.StrictMode>
      {/* <HelmetProvider context={HelmetChanger}> */}
      <SiteProvider>
        <RouterProvider router={router} />
      </SiteProvider>
      {/* </HelmetProvider> */}
    </React.StrictMode>
  </React.StrictMode>,
);
