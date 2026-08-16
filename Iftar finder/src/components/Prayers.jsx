import { FaMosque, FaMoon, FaSun, FaCloudSun } from "react-icons/fa";
import { BsSunsetFill } from "react-icons/bs";

const cleanTime = (value) => (value ? value.split(" ")[0] : "N/A");

const timeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== "string") return null;
  const [hours, minutes] = timeValue.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

export const Prayers = ({ prayerData }) => {
  const { data } = prayerData || {};
  const { timings } = data || {};

  const allPrayers = [
    { value: "Fajr", icon: FaMoon, iconColor: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    { value: "Dhuhr", icon: FaSun, iconColor: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
    { value: "Asr", icon: FaCloudSun, iconColor: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
    { value: "Maghrib", icon: BsSunsetFill, iconColor: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
    { value: "Isha", icon: FaMosque, iconColor: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextPrayer = allPrayers.find((item) => timeToMinutes(cleanTime(timings?.[item.value])) > currentMinutes)?.value;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6">
      <div className="mb-4 text-center sm:mb-5">
        <h2 className="text-lg font-extrabold text-emerald-800 sm:text-xl md:text-2xl">Salah Timings</h2>
        <p className="text-sm text-slate-500">Accurate daily prayer schedule for your location</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
        {allPrayers.map((item) => {
          const isNext = item.value === nextPrayer;
          return (
            <article
              key={item.value}
              className={`rounded-xl border p-3 shadow-sm transition hover:-translate-y-0.5 sm:p-4 ${
                isNext ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200" : `${item.border} ${item.bg}`
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={item.iconColor} size={18} />
                  <h3 className="text-sm font-semibold text-slate-800 sm:text-base">{item.value}</h3>
                </div>
                {isNext && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Next
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 sm:text-sm">Starts at</p>
              <p className="mt-1 text-base font-extrabold text-slate-900 sm:text-xl">{cleanTime(timings?.[item.value])}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
