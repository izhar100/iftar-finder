import React, { useState, useEffect, useMemo } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { GiPathDistance } from "react-icons/gi";
import { FaMapMarkedAlt, FaRegClock, FaCheckCircle, FaSearch } from "react-icons/fa";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ShowIftar({ userLocation }) {
  const [iftarEvents, setIftarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toDateOnly = (date) => date.toISOString().split("T")[0];
  const parseDate = (dateStr) => new Date(`${dateStr}T00:00:00`);
  const formatDate = (dateStr) => {
    const d = parseDate(dateStr);
    return d.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const timeToMinutes = (timeValue) => {
    if (!timeValue || typeof timeValue !== "string") return Number.MAX_SAFE_INTEGER;
    const [hours, minutes] = timeValue.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
    return hours * 60 + minutes;
  };

  const getStatusMeta = (status) => {
    if (status === "ended") {
      return {
        label: "Ended",
        badgeClass: "bg-slate-700 text-white",
        cardClass: "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100",
      };
    }
    if (status === "today") {
      return {
        label: "Today",
        badgeClass: "bg-emerald-600 text-white",
        cardClass: "border-emerald-400 bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-50 ring-1 ring-emerald-200",
      };
    }
    return {
      label: "Upcoming",
      badgeClass: "bg-sky-600 text-white",
      cardClass: "border-sky-300 bg-gradient-to-br from-sky-50 via-blue-50 to-pink-50",
    };
  };

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return iftarEvents;

    return iftarEvents.filter((event) =>
      String(event?.location || "").toLowerCase().includes(query)
    );
  }, [iftarEvents, searchQuery]);

  useEffect(() => {
    const fetchIftarEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "iftarEvents"));
        let events = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const now = new Date();
        const today = toDateOnly(now);
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(now.getDate() - 1);
        const yesterday = toDateOnly(yesterdayDate);
        if (userLocation) {
          events = events
            .map((event) => ({
              ...event,
              distance: getDistance(
                userLocation.latitude,
                userLocation.longitude,
                event.latitude,
                event.longitude
              ),
            }))
            .filter((event) => {
              const eventDate = event.date;
              if (!eventDate) return false;

              const isYesterday = eventDate === yesterday;
              const isTodayOrFuture = eventDate >= today;
              return event.distance <= 10 && (isYesterday || isTodayOrFuture);
            })
            .map((event) => {
              let status = "upcoming";
              if (event.date === yesterday) status = "ended";
              if (event.date === today) status = "today";
              return { ...event, status };
            })
            .sort((a, b) => {
              const order = { today: 0, upcoming: 1, ended: 2 };
              if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
              if (a.status === "today") {
                return timeToMinutes(a.time) - timeToMinutes(b.time);
              }
              if (a.status === "upcoming") {
                const dayDelta = parseDate(a.date) - parseDate(b.date);
                if (dayDelta !== 0) return dayDelta;
                const timeDelta = timeToMinutes(a.time) - timeToMinutes(b.time);
                if (timeDelta !== 0) return timeDelta;
                return a.distance - b.distance;
              }
              if (a.status === "ended") return parseDate(b.date) - parseDate(a.date);
              return a.distance - b.distance;
            });
        }

        setIftarEvents(events);
        setLoading(false);
      } catch (err) {
        setError("Error fetching iftar events: " + err.message);
        setLoading(false);
      }
    };

    if (userLocation) fetchIftarEvents();
  }, [userLocation]);

  // Function to open Google Maps
  const normalizeMapUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    try {
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      return new URL(withProtocol).toString();
    } catch {
      return null;
    }
  };

  const viewOnMap = (latitude, longitude, mapUrl) => {
    const exactMapUrl = normalizeMapUrl(mapUrl);
    const url = exactMapUrl || `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm sm:mb-6">
        <h2 className="text-center text-lg font-extrabold text-emerald-700 sm:text-2xl">
          Iftar Events Near You
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Showing yesterday&apos;s ended events and all upcoming events within 10 km.
        </p>
        <div className="mt-3">
          <div className="relative mx-auto w-full max-w-xl">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by location name..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-t-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="ml-2 text-emerald-600">Loading events...</p>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : iftarEvents.length === 0 ? (
        <p className="text-center text-gray-500">No nearby events found for yesterday, today, or upcoming days.</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">
          No events match &quot;{searchQuery}&quot;. Try a different location name.
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className={`rounded-xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${getStatusMeta(event.status).cardClass}`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-emerald-800 sm:text-lg">{event.location}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusMeta(event.status).badgeClass}`}>
                  {getStatusMeta(event.status).label}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                <span className="font-medium text-emerald-700">Organiser:</span> {event.organiser || "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-emerald-700">Description:</span>{" "}
                {event.description || "No extra description provided."}
              </p>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3 sm:gap-3">
                <p className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1.5 text-gray-700">
                  <CiCalendarDate size={18} className="text-green-700" />
                  <span>{formatDate(event.date)}</span>
                </p>
                <p className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1.5 text-gray-700">
                  <IoMdTime size={18} className="text-green-700" />
                  <span>{event.time || "N/A"}</span>
                </p>
                <p className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1.5 text-gray-700">
                  <GiPathDistance size={18} className="text-green-700" />
                  <span>{event.distance.toFixed(2)} km away</span>
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => viewOnMap(event.latitude, event.longitude, event.mapUrl)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 sm:w-auto"
                >
                  <FaMapMarkedAlt size={18} /> View on Map
                </button>

                {event.status === "upcoming" && (
                  <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 sm:w-auto">
                    <FaRegClock size={14} /> Upcoming Event
                  </div>
                )}

                {event.status === "ended" && (
                  <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 sm:w-auto">
                    <FaCheckCircle size={14} /> Ended Yesterday
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
