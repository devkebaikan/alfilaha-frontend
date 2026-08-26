const fs = require('fs');

const services = [
  {
    file: 'ServiceDetails.jsx',
    title: 'Pembersihan Laut',
    img: '/images/services-plant-1.jpg',
    desc1: 'Inovasi alternatif untuk menjaga kebersihan perairan dan memastikan kelestarian ekosistem laut yang sangat vital bagi kehidupan bumi. Kami mengedepankan pendekatan ramah lingkungan untuk masa depan yang lebih baik.',
    desc2: 'Kami terus berinovasi dalam memberikan layanan kebersihan lingkungan dengan standar tertinggi. Melalui sinergi bersama masyarakat dan relawan, kami berupaya menciptakan solusi yang terintegrasi dan memberikan dampak positif secara langsung terhadap kualitas air laut di sekitar kita.',
    feature1: 'Pembersihan Menyeluruh',
    feature1Desc: 'Proses pembersihan terpadu yang menjangkau seluruh area pesisir secara optimal.',
    feature2: 'Pengelolaan Sampah',
    feature2Desc: 'Pemilahan sampah secara efektif agar tidak mencemari lingkungan perairan laut.',
    quote: 'Komitmen kami adalah mewujudkan lingkungan laut yang bersih, sehat, dan lestari untuk generasi mendatang.'
  },
  {
    file: 'ServiceDetails2.jsx',
    title: 'Daur Ulang Sampah',
    img: '/images/services-plant-2.jpg',
    desc1: 'Layanan pengelolaan sampah organik dan anorganik untuk mengurangi volume limbah yang berakhir di tempat pembuangan akhir. Kami mengubah masalah limbah menjadi sumber daya bernilai.',
    desc2: 'Dengan sistem daur ulang yang modern, kami memfasilitasi proses konversi sampah menjadi produk-produk yang bermanfaat seperti kompos dan kerajinan. Langkah ini tidak hanya mengurangi polusi tetapi juga membuka peluang ekonomi sirkular bagi masyarakat sekitar.',
    feature1: 'Sistem Terpadu',
    feature1Desc: 'Sistem pengelolaan limbah terintegrasi dari hulu hingga hilir secara efisien.',
    feature2: 'Produk Bermanfaat',
    feature2Desc: 'Menghasilkan barang dan kompos berkualitas yang siap digunakan kembali.',
    quote: 'Mengubah barang sisa menjadi sesuatu yang berharga demi menjaga keseimbangan ekosistem.'
  },
  {
    file: 'ServiceDetails3.jsx',
    title: 'Pengurangan Emisi',
    img: '/images/services-plant-3.jpg',
    desc1: 'Program strategis yang bertujuan untuk meminimalisir emisi karbon dari aktivitas sehari-hari, guna mewujudkan udara yang lebih bersih dan menekan laju perubahan iklim.',
    desc2: 'Kami berkolaborasi dengan berbagai pihak untuk menerapkan teknologi hijau dan efisiensi energi. Dengan mengidentifikasi sumber utama emisi, kami merancang langkah pencegahan yang efektif dan berkelanjutan untuk menjaga kualitas udara.',
    feature1: 'Analisis Udara',
    feature1Desc: 'Pemantauan kualitas udara secara rutin untuk memastikan penurunan tingkat polusi.',
    feature2: 'Solusi Hijau',
    feature2Desc: 'Penerapan teknologi ramah lingkungan untuk memangkas emisi karbon harian.',
    quote: 'Setiap langkah kecil dalam mengurangi emisi memberikan dampak besar bagi kesehatan bumi.'
  },
  {
    file: 'ServiceDetails4.jsx',
    title: 'Penanaman Pohon',
    img: '/images/services-plant-4.jpg',
    desc1: 'Program penghijauan secara berkelanjutan untuk memulihkan fungsi hutan dan menyerap karbon dioksida. Kami mengajak masyarakat luas untuk ikut serta menanam pohon.',
    desc2: 'Melalui penyediaan bibit berkualitas dan pendampingan perawatan pohon, kami menjamin pertumbuhan tanaman yang optimal. Kehadiran pepohonan akan meningkatkan resapan air, mencegah erosi, dan memberikan oksigen bagi kehidupan.',
    feature1: 'Bibit Unggul',
    feature1Desc: 'Penyediaan bibit tanaman berkualitas yang adaptif terhadap kondisi iklim lokal.',
    feature2: 'Perawatan Rutin',
    feature2Desc: 'Sistem monitoring untuk memastikan setiap pohon tumbuh dengan baik dan subur.',
    quote: 'Satu pohon yang kita tanam hari ini adalah nafas kehidupan bagi masa depan.'
  },
  {
    file: 'ServiceDetails5.jsx',
    title: 'Energi Berkelanjutan',
    img: '/images/services-plant-5.jpg',
    desc1: 'Fokus pada pengembangan dan edukasi penggunaan sumber energi terbarukan seperti tenaga surya dan biogas, guna mengurangi ketergantungan pada bahan bakar fosil.',
    desc2: 'Kami menyediakan konsultasi dan pendampingan dalam instalasi teknologi energi bersih untuk kebutuhan domestik maupun pesantren. Langkah ini diyakini mampu menekan biaya operasional sekaligus melestarikan lingkungan.',
    feature1: 'Teknologi Bersih',
    feature1Desc: 'Pemanfaatan panel surya dan biogas untuk kemandirian energi yang lebih efisien.',
    feature2: 'Edukasi Mandiri',
    feature2Desc: 'Pelatihan bagi masyarakat untuk mengelola dan memelihara sumber energi mereka.',
    quote: 'Beralih ke energi bersih berarti berinvestasi pada masa depan yang lebih cerah dan sehat.'
  },
  {
    file: 'ServiceDetails6.jsx',
    title: 'Pencegahan Pemanasan',
    img: '/images/services-plant-6.jpg',
    desc1: 'Rangkaian kampanye edukasi dan tindakan nyata untuk menyadarkan masyarakat akan bahaya pemanasan global dan langkah-langkah praktis untuk mencegahnya.',
    desc2: 'Melalui seminar, lokakarya, dan aksi peduli lingkungan, kami berupaya mengubah gaya hidup masyarakat menjadi lebih ramah lingkungan. Kesadaran kolektif adalah kunci utama dalam menghadapi tantangan perubahan iklim global.',
    feature1: 'Kampanye Edukatif',
    feature1Desc: 'Penyuluhan ke berbagai lapisan masyarakat mengenai dampak pemanasan global.',
    feature2: 'Aksi Nyata',
    feature2Desc: 'Penerapan gaya hidup hijau yang langsung berdampak pada penurunan suhu bumi.',
    quote: 'Bersama kita bisa mencegah pemanasan global melalui aksi nyata dan gaya hidup berkelanjutan.'
  }
];

const categoriesHtml = `
                <h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-PrimaryColor-0">
                  Kategori Layanan
                </h4>
                <ul className="mt-8">
                  <li>
                    <Link to={"/service_details"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details' || !window.location ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details' || !window.location ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pembersihan Laut
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details2"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details2' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details2' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Daur Ulang Sampah
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details3"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details3' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details3' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pengurangan Emisi
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details4"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details4' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details4' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Penanaman Pohon
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details5"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details5' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details5' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Energi Berkelanjutan
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details6"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details6' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details6' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pencegahan Pemanasan
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                </ul>
`;

const basePath = 'src/Pages/InnerPage/ServiceDetails/';

for (const service of services) {
  let content = fs.readFileSync(basePath + service.file, 'utf8');

  // BreadCrumb replacements
  content = content.replace(/breadCrumbTitle=\{["'].+?["']\}/, `breadCrumbTitle={"${service.title}"}`);
  content = content.replace(/breadCrumbLink=\{["'].+?["']\}/, `breadCrumbLink={"Layanan Kami"}`);
  content = content.replace(/breadCrumbContent=\{["'].+?["']\}/, `breadCrumbContent={"${service.title}"}`);

  // Image replacement
  content = content.replace(/import serviceDetailsThumb from ["'].+?["'];/, `import serviceDetailsThumb from "${service.img}";`);

  // Title replacement
  content = content.replace(/<h2 className="font-AlbertSans font-bold text-\[24px\] sm:text-4xl text-HeadingColor-0 mt-8">[\s\S]*?<\/h2>/, `<h2 className="font-AlbertSans font-bold text-[24px] sm:text-4xl text-HeadingColor-0 mt-8">\n                ${service.title}\n              </h2>`);

  // Paragraphs
  content = content.replace(/<p className="font-AlbertSans text-TextColor-0 mt-6">[\s\S]*?<\/p>/, `<p className="font-AlbertSans text-TextColor-0 mt-6">\n                ${service.desc1}\n              </p>`);
  
  content = content.replace(/<p className="font-AlbertSans text-TextColor-0 mt-7 mb-11">[\s\S]*?<\/p>/, `<p className="font-AlbertSans text-TextColor-0 mt-7 mb-11">\n                ${service.desc2}\n              </p>`);

  // Features
  content = content.replace(/<h6 className="font-AlbertSans font-semibold text-\[22px\] text-HeadingColor-0">[\s\S]*?<\/h6>/, `<h6 className="font-AlbertSans font-semibold text-[22px] text-HeadingColor-0">\n                      ${service.feature1}\n                    </h6>`);
  
  let h6Count = 0;
  content = content.replace(/<h6 className="font-AlbertSans font-semibold text-\[22px\] text-HeadingColor-0">[\s\S]*?<\/h6>/g, (match) => {
    h6Count++;
    if (h6Count === 1) return `<h6 className="font-AlbertSans font-semibold text-[22px] text-HeadingColor-0">\n                      ${service.feature1}\n                    </h6>`;
    if (h6Count === 2) return `<h6 className="font-AlbertSans font-semibold text-[22px] text-HeadingColor-0">\n                      ${service.feature2}\n                    </h6>`;
    return match;
  });

  let pCount = 0;
  content = content.replace(/<p className="font-AlbertSans text-TextColor-0 mt-3">[\s\S]*?<\/p>/g, (match) => {
    pCount++;
    if (pCount === 1) return `<p className="font-AlbertSans text-TextColor-0 mt-3">\n                      ${service.feature1Desc}\n                    </p>`;
    if (pCount === 2) return `<p className="font-AlbertSans text-TextColor-0 mt-3">\n                      ${service.feature2Desc}\n                    </p>`;
    return match;
  });

  // Quote
  content = content.replace(/<p className="font-AlbertSans italic text-lg sm:text-\[22px\] leading-8 text-white">[\s\S]*?<\/p>/, `<p className="font-AlbertSans italic text-lg sm:text-[22px] leading-8 text-white">\n                    ${service.quote}\n                  </p>`);

  // Categories Sidebar
  content = content.replace(/<h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-\[2px\] before:bg-PrimaryColor-0">[\s\S]*?<\/ul>/, categoriesHtml.trim());

  fs.writeFileSync(basePath + service.file, content, 'utf8');
}
console.log('Update successful');
