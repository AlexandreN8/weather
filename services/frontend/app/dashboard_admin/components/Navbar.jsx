import { FaRegBell } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FiChevronsLeft } from "react-icons/fi";

export default function Navbar({ onToggleSidebar, isOpen }) {
  return (
    <header className="bg-white h-16 flex items-center border-b border-gray-200 px-4">
      <button
        onClick={onToggleSidebar}
        className="relative group p-2 mr-2 transition-all duration-300"
      >
        <div className="absolute inset-0 rounded-sm bg-[#F1F5FB] opacity-0 group-hover:opacity-100 transition-opacity duration-100 scale-95 group-hover:scale-100"></div>

        <FiChevronsLeft
          className={`relative text-[25px] text-[#5D5D5D] transition-transform duration-300 ${
            isOpen ? "rotate-0" : "rotate-180"
          } group-hover:text-black`}
        />
      </button>

      {/* Searchbar */}
      <div className="flex-1 flex items-center justify-start">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Rechercher une fonctionnalité..."
            className="w-full border bg-[#F1F5FB] rounded-full py-2 px-4 pl-10 focus:outline-none placeholder-[#9D9D9D] text-[#5D5D5D] text-sm"
          />
          <svg
            className="absolute left-3 top-1.5 w-6 h-6 text-[#5D5D5D]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Notifications */}
      <div className="ml-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-[#F1F5FB] rounded-full flex items-center justify-center text-gray-600">
          <FaRegBell className="text-[25px] text-[#5D5D5D]" />
        </div>
      </div>

      {/* Profile */}
      <div className="ml-4 flex items-center space-x-3 rounded-full cursor-pointer bg-[#F1F5FB] pr-3">
        <div className="w-10 h-10 bg-[#5D5D5D] text-white rounded-full flex items-center justify-center text-gray-600">
          JD
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[#000] text-sm font-semibold">John Doe</span>
          <span className="text-[#5D5D5D] text-xs">Admin</span>
        </div>
        <FaChevronDown className="text-[15px] text-[#5D5D5D]" />
      </div>
    </header>
  );
}
