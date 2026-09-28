/* eslint-disable react/prop-types */
const ProcessCard = ({ processIcon, processTitle, boxShape, processDesc }) => {
  return (
    <div className="text-center group relative">
      <div className="inline-block m-auto relative z-10 before:absolute before:top-2 sm:before:top-4 before:-left-[6px] sm:before:-left-[10px] before:w-[152px] sm:before:w-[200px] before:h-[152px] sm:before:h-[200px] before:border-[2px] before:border-dashed before:border-PrimaryColor-0 before:rounded-full before:animate-rotate">
        <img decoding="async" loading="lazy" src={processIcon} draggable="false" className="max-w-[130px] sm:max-w-none" />
        <img decoding="async"
          loading="lazy"
          src={boxShape}
          draggable="false"
          className="absolute top-1/2 -translate-y-1/2 -right-[165px] 2xl:-right-[195px] hidden xl:block"
        />
      </div>
      <h5 className="font-AlbertSans font-semibold text-HeadingColor-0 text-xl sm:text-2xl mt-6 sm:mt-9 mb-3 sm:mb-4">
        {processTitle}
      </h5>
      <p className="font-AlbertSans text-TextColor-0 text-[15px] sm:text-base w-full sm:w-2/3 md:w-full 2xl:w-3/4 mx-auto">
        {processDesc}
      </p>
    </div>
  );
};

export default ProcessCard;
