const fs = require('fs');

let content = fs.readFileSync('src/Pages/InnerPage/ServiceInner/ServiceInner.jsx', 'utf8');

// Add imports
if (!content.includes('import { useState, useEffect }')) {
  content = content.replace('import { FaArrowRightLong, FaCheck } from "react-icons/fa6";', 'import React, { useState, useEffect } from "react";\nimport { FaArrowRightLong, FaCheck } from "react-icons/fa6";');
}

// Modify ServiceInner component to use state and useEffect
const dynamicComponent = `const ServiceInner = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(\`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan\`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch layanan:", error);
      }
    };
    fetchServices();
  }, []);

  // Use dynamic data if available, otherwise fallback to static data
  const displayData = services.length > 0 ? services.map(item => ({
    id: item.id,
    serviceImg: item.image ? \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/\${item.image}\` : serviceImg,
    serviceIcon: serviceIcon, // Default icon
    serviceUrl: "/service_details", // Or dynamic route if added later
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: item.title,
    serviceDesc: item.description.replace(/<[^>]+>/g, ''), // Strip HTML
    serviceShape: serviceShape,
  })) : serviceData;

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Layanan Kami"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Layanan Kami"}
        bgImage={"/images/service-banner.jpg"}
      />
      <section className="pt-28 pb-[120px] p relative z-10 bg-[#f3f3f7]">
        <div className="Container">
          <div className="text-center">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" />
              LAYANAN KAMI
            </h5>
            <h1 className="font-AlbertSans font-bold text-xl leading-6 sm:text-[38px] sm:leading-[48px] md:text-[40px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Alfilaha Menyediakan Layanan <br />
              Lingkungan Terbaik Untuk Anda
            </h1>
          </div>
          <div className="mt-[60px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {displayData.map(
                ({
                  id,
                  serviceImg,
                  serviceIcon,
                  serviceUrl,
                  serviceButton,
                  serviceButton2,
                  serviceTitle,
                  serviceDesc,
                  serviceShape,
                }) => {
                  return (
                    <div key={id}>
                      <ServiceCard
                        serviceImg={serviceImg}
                        serviceIcon={serviceIcon}
                        serviceUrl={serviceUrl}
                        serviceButton={serviceButton}
                        serviceButton2={serviceButton2}
                        serviceTitle={serviceTitle}
                        serviceDesc={serviceDesc}
                        serviceShape={serviceShape}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};`;

content = content.replace(/const ServiceInner = \(\) => \{[\s\S]*?^export default ServiceInner;/m, dynamicComponent + '\n\nexport default ServiceInner;');
// We also need to fix the JSX structure because I changed `<div key={id}>` instead of `<><div key={id}>...`. It's cleaner.

fs.writeFileSync('src/Pages/InnerPage/ServiceInner/ServiceInner.jsx', content, 'utf8');
console.log('ServiceInner updated');
