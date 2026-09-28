import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import router from "./Router/Router.jsx";
import { RouterProvider } from "react-router-dom";
import { SiteProvider } from "./Context/SiteContext.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { NotifikasiProvider } from "./Context/NotifikasiContext.jsx";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import InstallPrompt from "./Components/PWA/InstallPrompt.jsx";
import UpdatePrompt from "./Components/PWA/UpdatePrompt.jsx";
// import { HelmetProvider } from "react-helmet-async";
// import HelmetChanger from "./Shared/Helmet/Helmet.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.StrictMode>
      {/* <HelmetProvider context={HelmetChanger}> */}
      <ThemeProvider>
        <AuthProvider>
          <SiteProvider>
            <NotifikasiProvider>
              <RouterProvider router={router} />
              <InstallPrompt />
              <UpdatePrompt />
            </NotifikasiProvider>
          </SiteProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* </HelmetProvider> */}
    </React.StrictMode>
  </React.StrictMode>,
);
