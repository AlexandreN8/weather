import React from "react";

const formatRelativeTime = (input) => {
  const date = new Date(input);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `il y a ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin}mn`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `il y a ${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  return `il y a ${diffDays}j`;
};

export default function AlertCard({
  title,
  description,
  name,
  time = new Date().toISOString(),
  category, 
  status = "active", // "active", "a_verifier", "resolved", or "archived"
  icon,
  onArchive // callback function to archive the alert
}) {
  // Color mapping for alert categories
  const categoryBgMap = {
    api: "bg-[#969ba9]",
    system: "bg-[#df695a]",
    database: "bg-[#8ebda8]",
    docker: "bg-[#7da6cf]",
    default: "bg-gray-100",
  };

  const cardBgClass = categoryBgMap[category] || categoryBgMap.default;

  // Status badge mapping
  const statusBadge = {
    active: { text: "En cours", className: "bg-[#AF3232] text-white" },
    a_verifier: { text: "À vérifier", className: "bg-[#FFC107] text-white" },
    resolved: { text: "Résolus", className: "bg-[#43AF32] text-white" },
    archived: { text: "Archivé", className: "bg-gray-500 text-white" },
  };

  const badge = statusBadge[status] || statusBadge.active;

  return (
    <div className="relative h-full bg-white border border-gray-200 rounded-md p-4 shadow-lg min-w-[300px] flex flex-col">
      {/* Card Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${cardBgClass} text-white p-4 rounded-md mr-3`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <h3 className="text-sm text-gray-600">{name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{formatRelativeTime(time)}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mt-4">{description}</p>

      {/* Archived Btn */}
      <div className="mt-auto flex justify-end">
        <button
          onClick={onArchive}
          disabled={!(status === "resolved" || status === "a_verifier")}
          className={`px-4 py-2 rounded-md shadow-sm focus:outline-none ${
            (status === "resolved" || status === "a_verifier")
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Archiver
        </button>
      </div>

      {/* Status Badge */}
      <div
        className={`absolute top-0 right-0 inline-block px-2 py-1 text-xs font-bold rounded-tr-md rounded-bl-md ${badge.className}`}
      >
        {badge.text}
      </div>
    </div>
  );
}
