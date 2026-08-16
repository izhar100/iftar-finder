import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaLocationArrow, FaCrosshairs, FaSearch, FaMapMarkerAlt } from "react-icons/fa";

// Fix for default marker icon not showing up in React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
    },
  });

  return !position ? null : <Marker position={position} />;
}

function MapController({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.setView([target.lat, target.lng], 14, { animate: true });
    }
  }, [map, target]);

  return null;
}

const LocationPicker = ({ onLocationSelected, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isLocating, setIsLocating] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const defaultCenter = useMemo(() => [21.4225, 39.8262], []);

  const updatePosition = (coords) => {
    setPosition(coords);
    onLocationSelected(coords);
    setFocusTarget(coords);
  };

  useEffect(() => {
    useCurrentLocation()
  }, []);

  const searchLocation = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&lang=en`
      );
      const data = await response.json();
      const mapped = Array.isArray(data?.features)
        ? data.features
            .filter((item) => Array.isArray(item?.geometry?.coordinates))
            .map((item) => {
              const [lng, lat] = item.geometry.coordinates;
              const props = item.properties || {};
              const labelParts = [
                props.name,
                props.street,
                props.city,
                props.state,
                props.country,
              ].filter(Boolean);

              return {
                id: props.osm_id || `${lat}-${lng}`,
                name: labelParts.join(", "),
                lat: Number(lat),
                lng: Number(lng),
              };
            })
            .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
        : [];

      setResults(mapped);
      if (!mapped.length) {
        setSearchError("No matching location found. Try a nearby area or landmark.");
      }
    } catch {
      setSearchError("Unable to search right now. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    updatePosition({ lat: item.lat, lng: item.lng });
    setQuery(item.name);
    setResults([]);
    setSearchError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        updatePosition(coords);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  const recenterMarker = () => {
    if (!position) return;
    setFocusTarget({ ...position });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Search location
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchLocation();
                }
              }}
              placeholder="Search area, masjid, or landmark..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
            />
          </div>
          <button
            type="button"
            onClick={searchLocation}
            className="rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {(results.length > 0 || searchError) && (
        <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
          {results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectSearchResult(item)}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-emerald-50"
                  >
                    <FaMapMarkerAlt className="mt-0.5 text-emerald-600" size={13} />
                    <span className="line-clamp-2">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-1 text-sm text-amber-700">{searchError}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <FaLocationArrow size={14} />
          {isLocating ? "Detecting..." : "Use my location"}
        </button>
        <button
          type="button"
          onClick={recenterMarker}
          disabled={!position}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            position
              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
          }`}
        >
          <FaCrosshairs size={14} />
          Recenter marker
        </button>
      </div>

      <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          {focusTarget && <MapController target={focusTarget} />}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker position={position} setLocation={updatePosition} />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">
        Tip: click anywhere on the map to place the marker precisely.
      </p>
    </div>
  );
};

export default LocationPicker;
