"use client";
import { useState, useMemo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // TODO : dynamic data
  const [users, setUsers] = useState([
    { id: 100, nom: "Doe", prenom: "John", statut: "Actif", inscritLe: "10-Mar-2025", role: "Administrateur" },
    { id: 200, nom: "Doe", prenom: "Jane", statut: "Inactif", inscritLe: "11-Mar-2025", role: "Utilisateur" },
    { id: 2001, nom: "Doe", prenom: "Joseph", statut: "Actif", inscritLe: "12-Mar-2025", role: "Décisionnaire" },
    { id: 2002, nom: "Doe", prenom: "Jade", statut: "Inactif", inscritLe: "13-Mar-2025", role: "Utilisateur" },
    { id: 3333, nom: "Jos", prenom: "Jon", statut: "Actif", inscritLe: "14-Mar-2025", role: "Administrateur" },
  ]);

  const roles = ["Administrateur", "Décisionnaire", "Utilisateur"];

  const toggleDropdown = (userId) => {
    setOpenDropdown((prev) => (prev === userId ? null : userId));
  };

  // Role selection
  const selectRole = (userId, newRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );
    setOpenDropdown(null);
  };

  // Filter through namea and id
  const filteredUsers = users.filter(
    (user) =>
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm)
  );

  // Users sorting from column header
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...filteredUsers];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // Numbers
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        // Chars
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // Sort function reverse
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
          <p className="text-gray-500">Lorem ipsum lorem lorem</p>
        </div>
      </div>

      {/* 1st row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
        {/* Card 1 : total users */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-1">Inscrits</h2>
          <p className="text-gray-500 text-sm">Nombre d'utilisateurs total</p>
          <div className="flex items-center">
            <FaUsers className="text-5xl text-blue-500 mt-4 mr-4 w-[80px] h-[80px]" />
            <p className="text-4xl font-bold text-gray-800 mt-2">{users.length.toLocaleString()}</p>
          </div>
        </div>
        {/* Card 2 : role request */}
        <div className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 bg-white shadow-sm ">
          <span
            className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"
          ></span>

          <div className="sm:flex sm:justify-between sm:gap-4">
            <div className="flex items-center">
              {/* TODO Image or placeholder*/}
              <div className=" mr-4 size-16 rounded-lg bg-blue-200 text-gray-700 flex items-center justify-center">
                <FaUser className="text-white w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Demande de rôle : Décisionnaire
                </h3>
                <p className="mt-1 text-xs font-medium text-gray-600">John Doe - 20 Mars 2025</p>
              </div>
            </div>

            <div className="hidden sm:block sm:shrink-0">

            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-pretty text-gray-500">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa
              maiores deleniti consectetur nobis et eaque.
            </p>
          </div>
          <div className="flex items-center mt-4">
            <button className="text-sm font-medium text-blue-600 hover:underline mr-4">Accepter</button>
            <button className="text-sm font-medium text-red-600 hover:underline">Refuser</button>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 ">
              Utilisateurs Inscrits
            </h2>
            <p className="text-gray-500 text-sm mb-3">
              Voici la liste des utilisateurs inscrits sur la plateforme.
            </p>
          </div>
            {/* Searchbar */}
            <div className="relative mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none bg-white placeholder-[#9D9D9D] text-[#5D5D5D]"
              />
            <svg
              className="absolute left-3 top-2 w-5 h-5 text-[#5D5D5D]"
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
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th onClick={() => handleSort("id")} className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-gray-600">
                ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("nom")} className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Nom {sortConfig.key === "nom" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("prenom")} className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Prénom {sortConfig.key === "prenom" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("statut")} className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Statut {sortConfig.key === "statut" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("inscritLe")} className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Inscrit le {sortConfig.key === "inscritLe" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Rôle</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-sm text-gray-700">{user.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.nom}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.prenom}</td>
                  <td className="px-4 py-2 text-sm">
                    {user.statut === "Actif" ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Actif</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.inscritLe}</td>
                  <td className="px-4 py-2 relative">
                    <button
                      onClick={() => toggleDropdown(user.id)}
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
                      <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-10 transition-all duration-300 transform scale-95 opacity-100">
                        {roles.map((role) => (
                          <div
                            key={role}
                            onClick={() => selectRole(user.id, role)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md transition"
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <button className="text-blue-500 hover:underline">
                      <BsThreeDotsVertical className="text-gray-700" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  Aucun utilisateur ne correspond à la recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
