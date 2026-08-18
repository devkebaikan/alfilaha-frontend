import React, { createContext, useState, useContext, useEffect } from "react";

const SiteContext = createContext();

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
  // Ambil data dari localStorage jika ada
  const savedData = JSON.parse(localStorage.getItem("cms_home_data"));
  const savedHistory = JSON.parse(localStorage.getItem("cms_history"));

  const defaultData = {
    title: "Solusi Agrikultur Modern",
    subtitle:
      "Kami menyediakan teknologi terbaik untuk hasil panen yang lebih maksimal dan berkelanjutan bagi masa depan pertanian.",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  };

  const [homeData, setHomeData] = useState(savedData || defaultData);
  const [history, setHistory] = useState(savedHistory || []);

  // Simpan otomatis ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem("cms_home_data", JSON.stringify(homeData));
  }, [homeData]);

  useEffect(() => {
    localStorage.setItem("cms_history", JSON.stringify(history));
  }, [history]);

  const updateHomeData = (newData, actionName) => {
    setHomeData(newData);

    // Tambah log ke history
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleString("id-ID"),
      action: actionName,
      status: "Success",
    };
    setHistory([newLog, ...history]);
  };

  return (
    <SiteContext.Provider value={{ homeData, history, updateHomeData }}>
      {children}
    </SiteContext.Provider>
  );
};
