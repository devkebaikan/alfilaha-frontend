/* eslint-disable react/prop-types */
import CountUp from "react-countup";

const CounterCard = ({
  counterIcon,
  counterNumber,
  counterDesc,
  counterSuffex,
}) => {
  return (
    <div className="text-center">
      <div>
        <img
          decoding="async"
          loading="lazy"
          src={counterIcon}
          draggable="false"
          className="m-auto max-w-[68px] sm:max-w-[90px] lg:max-w-none object-contain"
        />
      </div>
      <div className="mt-3 -mb-1">
        <CountUp
          start={-11}
          end={counterNumber}
          suffix={counterSuffex}
          className="font-AlbertSans text-[30px] sm:text-[38px] lg:text-[46px] text-white font-bold"
        />
      </div>
      <p className="font-AlbertSans text-white text-[15px] sm:text-xl mt-1">
        {counterDesc}
      </p>
    </div>
  );
};

export default CounterCard;
