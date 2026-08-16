import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import ShowDate from './components/Date'
import { Prayers } from './components/Prayers';
import Loader from './components/Loader';
import SunTimes from './components/SunTimes';
import AddIftarDetails from './components/AddIftarDetails';
import ShowIftar from './components/ShowIftar';
import SehriIftarForecast from './components/SehriIftarForecast';
import { FaMosque, FaMapMarkerAlt } from "react-icons/fa";

function App() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [prayerTimingData, setPrayerTimingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const stored = localStorage.getItem("iftar-theme");
    return stored ? stored === "dark" : false;
  });
  useEffect(()=>{
    getUserLocation()
  },[])

  const getUserLocation = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position)=>{
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
    () => {
      alert("Unable to access location. Please allow location permission for nearby timings.");
    })
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  useEffect(() => {
    if (location?.latitude) {
      getPrayerTiming(location)
    }
  }, [location]);

  useEffect(() => {
    const reverseGeocode = async () => {
      if (!location?.latitude || !location?.longitude) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}&zoom=14&addressdetails=1`
        );
        const data = await response.json();
        const address = data?.address || {};
        const labelParts = [
          address.suburb || address.neighbourhood || address.village || address.town || address.city,
          address.state,
          address.country,
        ].filter(Boolean);

        setLocationName(labelParts.join(", ") || data?.display_name || "Unknown place");
      } catch {
        setLocationName("");
      }
    };

    reverseGeocode();
  }, [location]);

  useEffect(() => {
    localStorage.setItem("iftar-theme", isDarkTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkTheme);
  }, [isDarkTheme]);

  const getPrayerTiming = async (location) => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}`)
      const data = await response.json();
      if(data?.status === 'OK') {
        setLoading(false)
      }
      setPrayerTimingData(data)
    } catch (error) {
      alert(error.error)
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`min-h-screen ${isDarkTheme ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800" : "bg-gradient-to-b from-emerald-50 via-white to-amber-50"}`}>
        <div className='fixed top-0 left-0 z-50 w-full px-2 pt-2 sm:px-4'>
          <Header
            color="green-600"
            isDarkTheme={isDarkTheme}
            onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
          />
        </div>
        <div className='pt-34 sm:pt-36' />
        {
          loading
            ?
            <Loader />
            :
            <div className="space-y-4 pb-6 sm:space-y-5">
              <section className="mx-auto w-full max-w-6xl px-4">
                <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
                  isDarkTheme ? "border-slate-700 bg-slate-800/90" : "border-emerald-200 bg-white/95"
                }`}>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 sm:h-11 sm:w-11">
                      <FaMosque size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className={`text-base font-extrabold leading-snug sm:text-xl ${isDarkTheme ? "text-emerald-300" : "text-emerald-800"}`}>
                        Daily Iftar & Salah Dashboard
                      </h2>
                      <p className={`mt-1 text-sm leading-relaxed ${isDarkTheme ? "text-slate-300" : "text-slate-600"}`}>
                        Check prayer timings, sehri/iftar highlights, and nearby community iftar events.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Sehri
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Sunset
                    </span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      Iftar
                    </span>
                  </div>
                </div>
              </section>
              <div className="px-4">
                <AddIftarDetails />
              </div>
              {location && (
                <section className="mx-auto w-full max-w-6xl px-4">
                  <div className={`rounded-2xl border p-4 shadow-sm ${
                    isDarkTheme ? "border-sky-900 bg-sky-950/40" : "border-sky-200 bg-sky-50/70"
                  }`}>
                    <div className="flex items-center gap-2 text-sky-800">
                      <FaMapMarkerAlt size={15} />
                      <p className={`text-sm font-semibold ${isDarkTheme ? "text-sky-200" : ""}`}>Your Location</p>
                    </div>
                    <p className={`mt-1 text-sm font-medium ${isDarkTheme ? "text-slate-100" : "text-slate-800"}`}>
                      {locationName || "Detecting place name..."}
                    </p>
                    <p className={`mt-1 text-sm ${isDarkTheme ? "text-slate-300" : "text-slate-700"}`}>
                      Latitude: {Number(location.latitude).toFixed(5)} | Longitude: {Number(location.longitude).toFixed(5)}
                    </p>
                  </div>
                </section>
              )}
              <ShowIftar userLocation={location}/>
              <SunTimes dateData={prayerTimingData}/>
              <ShowDate dateData={prayerTimingData} />
              <Prayers prayerData={prayerTimingData} />
              <SehriIftarForecast userLocation={location} />
            </div>
        }
      </div>
      <div className={`py-4 text-center text-sm ${isDarkTheme ? "text-slate-300" : "text-slate-600"}`}>
        Created by <a className={`cursor-pointer font-semibold ${isDarkTheme ? "text-emerald-300 hover:text-emerald-200" : "text-emerald-700 hover:text-emerald-800"}`} href='https://izhar100.github.io' target='_blank' rel='noreferrer'>Ezhar Ashraf</a>
      </div>
    </>
  )
}

export default App
