import { useEffect, useMemo, useState } from "react";
import { FaMoon, FaUtensils } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";

const cleanTime = (value) => (value ? value.split(" ")[0] : "N/A");
const toYmd = (date) => date.toISOString().split("T")[0];

export default function SehriIftarForecast({ userLocation }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dateRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1); // future days start from tomorrow

    const end = new Date(start);
    end.setDate(start.getDate() + 29); // total 30 days

    return { start, end };
  }, []);

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!userLocation?.latitude || !userLocation?.longitude) return;

      setLoading(true);
      setError("");

      try {
        const monthsToFetch = [
          {
            month: dateRange.start.getMonth() + 1,
            year: dateRange.start.getFullYear(),
          },
        ];

        const endMonth = dateRange.end.getMonth() + 1;
        const endYear = dateRange.end.getFullYear();
        const hasSecondMonth =
          monthsToFetch[0].month !== endMonth || monthsToFetch[0].year !== endYear;

        if (hasSecondMonth) {
          monthsToFetch.push({ month: endMonth, year: endYear });
        }

        const responses = await Promise.all(
          monthsToFetch.map(({ month, year }) =>
            fetch(
              `https://api.aladhan.com/v1/calendar?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&method=2&month=${month}&year=${year}`
            )
          )
        );

        const payloads = await Promise.all(responses.map((res) => res.json()));
        const allDays = payloads.flatMap((item) => item?.data || []);

        const startYmd = toYmd(dateRange.start);
        const endYmd = toYmd(dateRange.end);

        const parsed = allDays
          .map((item) => ({
            date: item?.date?.gregorian?.date,
            hijri: item?.date?.hijri?.date,
            weekday: item?.date?.gregorian?.weekday?.en,
            sehri: cleanTime(item?.timings?.Imsak || item?.timings?.Fajr),
            iftar: cleanTime(item?.timings?.Maghrib || item?.timings?.Sunset),
          }))
          .filter((item) => {
            if (!item.date) return false;
            const [d, m, y] = item.date.split("-");
            const ymd = `${y}-${m}-${d}`;
            return ymd >= startYmd && ymd <= endYmd;
          })
          .slice(0, 30);

        setRows(parsed);
      } catch {
        setError("Unable to load 30-day timings right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [userLocation, dateRange]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8">
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <BsCalendar2Date className="text-emerald-700" />
          <h2 className="text-center text-lg font-extrabold text-emerald-800 sm:text-2xl">
            Sehri & Iftar Forecast (Next 30 Days)
          </h2>
        </div>
        <p className="mt-1 text-center text-sm text-slate-600">
          Daily fasting timings to help you plan ahead.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-600">Loading 30-day timings...</p>
      ) : error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((item) => (
            <article
              key={`${item.date}-${item.sehri}-${item.iftar}`}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {item.weekday || "Day"} - {item.date || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">{item.hijri || "N/A"} AH</p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-xs font-semibold text-indigo-700">
                      <FaMoon size={12} /> Sehri
                    </p>
                    <p className="text-sm font-bold text-slate-900">{item.sehri}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700">
                      <FaUtensils size={12} /> Iftar
                    </p>
                    <p className="text-sm font-bold text-slate-900">{item.iftar}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
