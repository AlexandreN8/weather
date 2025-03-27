import React, { useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function CustomSelect({
  user,
  roles,
  openDropdown,
  toggleDropdown,
  onRoleSelect,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown === user.id && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown, user.id, toggleDropdown]);

  return (
    <td className="px-4 py-2 relative overflow-visible">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(openDropdown === user.id ? null : user.id);
        }}
        className="flex items-center justify-between w-[150px] gap-2 bg-[#F1F5FB] rounded-lg px-2 py-2 text-sm text-gray-700 shadow-sm hover:shadow-md transition-shadow"
      >
        <span>{user.role}</span>
        <FaChevronDown
          className={`text-gray-500 transition-transform duration-300 ${
            openDropdown === user.id ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {openDropdown === user.id && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50 transition-all duration-300"
        >
          {roles.map((role) => (
            <div
              key={role}
              onClick={() => {
                onRoleSelect(user, role);
                toggleDropdown(null);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition"
            >
              {role}
            </div>
          ))}
        </div>
      )}
    </td>
  );
}
