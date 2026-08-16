import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import LocationPicker from "./LocationPicker";
import { FaMapMarkedAlt, FaRegClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

export default function AddIftarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    mapUrl: "",
    organiser: "",
    time: "",
    date: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      location: "",
      mapUrl: "",
      organiser: "",
      time: "",
      date: "",
      description: "",
      latitude: "",
      longitude: "",
    });
  };

  const openModal = () => {
    setIsOpen(true);
    setMessage({ type: "", text: "" });
  };

  const closeModal = () => {
    setIsOpen(false);
    setMessage({ type: "", text: "" });
  };

  const addIftar = async (data) => {
    await addDoc(collection(db, "iftarEvents"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.latitude || !formData.longitude) {
      setMessage({ type: "error", text: "Please select the exact event location on the map." });
      return;
    }

    setLoading(true);

    try {
      await addIftar({
        ...formData,
        mapUrl: formData.mapUrl.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      setMessage({ type: "success", text: "Iftar details added successfully." });
      resetForm();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to add iftar details." });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const isSubmitDisabled =
    loading ||
    !formData.location.trim() ||
    !formData.organiser.trim() ||
    !formData.date ||
    !formData.time ||
    !formData.latitude ||
    !formData.longitude;

  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={openModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 sm:w-auto"
        >
          <FaMapMarkedAlt />
          Add Iftar Details
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-t-2xl border border-white/70 bg-white shadow-2xl sm:rounded-2xl">
            <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-4 sm:p-5">
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <IoMdClose size={22} />
              </button>

              <h2 className="text-xl font-extrabold text-emerald-700 sm:text-2xl">Share An Iftar Event</h2>
              <p className="mt-1 text-sm text-slate-600">
                Fill the details below and drop a precise map pin so people can find the event quickly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[85dvh] space-y-4 overflow-y-auto p-4 sm:max-h-[78vh] sm:space-y-5 sm:p-5">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-bold text-slate-700">Step 1: Basic details</p>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Location Name</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Masjid Al Noor Hall"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Google Maps URL (Recommended for accuracy)
                  </label>
                  <input
                    type="url"
                    name="mapUrl"
                    value={formData.mapUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://maps.google.com/?q=..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                  />
                  {!formData.mapUrl.trim() && (
                    <p className="mt-1 text-xs text-amber-700">
                      Recommended: add the exact Google Maps link to help users reach the correct masjid location.
                    </p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Organiser</label>
                    <input
                      type="text"
                      name="organiser"
                      value={formData.organiser}
                      onChange={handleChange}
                      placeholder="e.g., Community Youth Group"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                    <div className="relative">
                      <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={today}
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Iftar Time</label>
                  <div className="relative">
                    <FaRegClock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-bold text-slate-700">Step 2: Pin exact location</p>
                <LocationPicker
                  onLocationSelected={handleLocationChange}
                  initialPosition={
                    formData.latitude && formData.longitude
                      ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
                      : null
                  }
                />

                {formData.latitude && formData.longitude ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <FaCheckCircle />
                    <span>
                      Selected: {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700">Select a point on the map before submitting.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Any notes about food, parking, or family arrangement..."
                  className="h-28 w-full resize-y rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                />
              </div>

              {message.text && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.type === "error"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`w-full rounded-lg px-5 py-2.5 font-semibold text-white transition sm:w-auto ${
                    isSubmitDisabled
                      ? "cursor-not-allowed bg-emerald-300"
                      : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Iftar Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
    );
}
