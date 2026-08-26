import CounterCard from "./CounterCard";
import counterIcon from "/images/counter-icon.png";
import counterIcon2 from "/images/counter-icon2.png";
import counterIcon3 from "/images/counter-icon3.png";
import counterIcon4 from "/images/counter-icon4.png";

const counterData = [
  {
    id: 1,
    counterIcon: counterIcon,
    counterNumber: 100,
    counterDesc: "Anggota Tim",
    counterSuffex: "+",
  },
  {
    id: 2,
    counterIcon: counterIcon2,
    counterNumber: 960,
    counterDesc: "Pekerjaan Selesai",
    counterSuffex: "+",
  },
  {
    id: 3,
    counterIcon: counterIcon3,
    counterNumber: 38,
    counterDesc: "Penghargaan",
    counterSuffex: "",
  },
  {
    id: 4,
    counterIcon: counterIcon4,
    counterNumber: 4,
    counterDesc: "Rata-rata Penilaian",
    counterSuffex: ".7",
  },
];

const Counter = () => {
  return (
    <section className="relative z-10 py-28 bg-[url('/images/counter-bg-new.jpg')] bg-no-repeat bg-cover bg-center before:absolute before:inset-0 before:bg-black/60 before:-z-10">
      <div className="Container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-0 lg:grid-cols-4 items-center justify-center">
          {counterData.map(
            ({
              id,
              counterIcon,
              counterNumber,
              counterDesc,
              counterSuffex,
            }) => {
              return (
                <div key={id}>
                  <CounterCard
                    counterIcon={counterIcon}
                    counterNumber={counterNumber}
                    counterDesc={counterDesc}
                    counterSuffex={counterSuffex}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
};

export default Counter;
