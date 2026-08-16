import { useEffect, useState } from "react";
import { BsCalendarDate } from "react-icons/bs";
import { FaMoon } from "react-icons/fa";
import { IoTime } from "react-icons/io5";

export default function ShowDate({ dateData }) {
  const { data } = dateData || {};
  const { date } = data || {};
  const { hijri, gregorian } = date || {};
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-1 sm:py-2">
      <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-rose-700">
            <IoTime size={18} />
            <p className="text-sm font-semibold">Current Time</p>
          </div>
          <p
            className="text-2xl font-extrabold text-rose-800 md:text-3xl"
            style={{ fontFamily: "'DSEG7 Classic', monospace" }}
          >
            {formattedTime}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-emerald-700">
            <BsCalendarDate size={16} />
            <p className="text-sm font-semibold">Gregorian Date</p>
          </div>
          <p className="text-base font-bold text-slate-900 sm:text-lg">{gregorian?.date || "N/A"}</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-indigo-700">
            <FaMoon size={15} />
            <p className="text-sm font-semibold">Hijri Date</p>
          </div>
          <p className="text-base font-bold text-slate-900 sm:text-lg">
            {hijri?.date ? `${hijri.date} AH` : "N/A"}
          </p>
        </div>
      </div>
    </section>
  );
}
