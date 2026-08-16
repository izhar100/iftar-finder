import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import logo from "/iftarfinder.png";

export default function Header({ color = "green-600", isDarkTheme = false, onToggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme =
    color === "green-600"
      ? {
          accentText: "text-emerald-700",
          accentSoft: "text-emerald-600",
          accentBorder: "border-emerald-200",
          accentRing: "focus-visible:ring-emerald-500/40",
          accentBg: "bg-emerald-50",
          accentHover: "hover:text-emerald-700 hover:bg-emerald-50",
          iconBg: "bg-emerald-100",
        }
      : {
          accentText: "text-slate-700",
          accentSoft: "text-slate-600",
          accentBorder: "border-slate-200",
          accentRing: "focus-visible:ring-slate-500/40",
          accentBg: "bg-slate-50",
          accentHover: "hover:text-slate-700 hover:bg-slate-100",
          iconBg: "bg-slate-100",
        };

  return (
    <header className="w-full">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/60 bg-white/85 px-3 py-3 shadow-lg backdrop-blur-md sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logo}
              alt="Iftar Finder logo"
              className="h-10 w-10 rounded-xl border border-white/60 object-cover sm:h-11 sm:w-11"
            />
            <div className="min-w-0">
              <h1 className={`truncate text-lg font-extrabold sm:text-xl ${theme.accentText}`}>
                Iftar Finder
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Local sunset & iftar timings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${theme.accentBorder} bg-white shadow-sm transition hover:-translate-y-0.5 ${theme.accentRing} focus-visible:outline-none focus-visible:ring-4`}
              aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              type="button"
              onClick={onToggleTheme}
            >
              {isDarkTheme ? <FaSun className={`${theme.accentSoft}`} /> : <FaMoon className={`${theme.accentSoft}`} />}
            </button>
            <button
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 md:hidden ${theme.accentRing} focus-visible:outline-none focus-visible:ring-4`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <IoMdClose size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <ul className={`hidden items-center gap-1 md:flex ${theme.accentSoft}`}>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentBg} ${theme.accentText}`}>
              Home
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              About
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              Contact
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              Privacy
            </li>
          </ul>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className={`mt-3 grid gap-1 rounded-xl border ${theme.accentBorder} bg-white p-2 ${theme.accentSoft}`}>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold ${theme.accentBg} ${theme.accentText}`}>
              Home
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              About
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              Contact
            </li>
            <li className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${theme.accentHover}`}>
              Privacy
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
