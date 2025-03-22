import React from "react";

export default function AlertTypeCard({
  count = 0,
  label = "Alerte",
  icon,
  backgroundColor = "bg-gray-400",
  onClick,
  selected = false, 
}) {
  const IconComponent = icon;

  const baseClasses = `
    ${backgroundColor}
    p-4 mb-4
    flex flex-col 
    md:flex-row md:items-center md:justify-between 
    cursor-pointer
    rounded-lg
    shadow-md
    hover:scale-105
    hover:shadow-lg
    transition-transform
    duration-300
  `;
  // Add border and shadow if selected
  const selectedClasses = selected
    ? "border-4 border-blue-400 transform scale-105 shadow-lg"
    : "border-4 border-transparent";

  return (
    <div onClick={onClick} className={`${baseClasses} ${selectedClasses}`}>
      <div>
        <div className="text-white text-sm">
          <span className="text-lg font-semibold mr-1">{count}</span>
          Alertes
        </div>
        <div className="text-white text-sm">{label}</div>
      </div>
      <div className="text-white text-4xl">
        {IconComponent && <IconComponent />}
      </div>
    </div>
  );
}
