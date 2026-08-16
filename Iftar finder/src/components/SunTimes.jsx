import { BsSunriseFill, BsSunsetFill } from "react-icons/bs";
import { FaUtensils, FaMoon } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

const cleanTime = (value) => (value ? value.split(" ")[0] : "N/A");

export default function SunTimes({ dateData }) {
  const { data } = dateData || {};
  const { timings } = data || {};

  const highlights = [
    {
      label: "Sehri Ends",
      time: cleanTime(timings?.Imsak || timings?.Fajr),
      icon: FaMoon,
      iconStyle: "text-indigo-600",
      cardStyle: "border-indigo-200 bg-indigo-50/60",
    },
    {
      label: "Sunrise",
      time: cleanTime(timings?.Sunrise),
      icon: BsSunriseFill,
      iconStyle: "text-amber-500",
      cardStyle: "border-amber-200 bg-amber-50/60",
    },
    {
      label: "Sunset",
      time: cleanTime(timings?.Sunset),
      icon: BsSunsetFill,
      iconStyle: "text-orange-500",
      cardStyle: "border-orange-200 bg-orange-50/60",
    },
    {
      label: "Iftar Time",
      time: cleanTime(timings?.Maghrib || timings?.Sunset),
      icon: FaUtensils,
      iconStyle: "text-emerald-600",
      cardStyle: "border-emerald-200 bg-emerald-50/70",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:py-4">
      <div className="mb-3 flex items-center justify-center gap-2 text-center sm:mb-4">
        <IoMdTime className="text-emerald-600" size={22} />
        <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl md:text-2xl">
          Today&apos;s Key Timings
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border p-3 shadow-sm transition hover:-translate-y-0.5 sm:p-4 ${item.cardStyle}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <item.icon className={item.iconStyle} size={18} />
              <p className="text-xs font-semibold text-slate-700 sm:text-sm">{item.label}</p>
            </div>
            <p className="text-base font-extrabold text-slate-900 sm:text-lg">{item.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
