"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";
import { toast } from "react-toastify";

import CreateUserModal from "../components/CreateUserModal";
import RequestCardsCarousel from "../components/RequestCardsCarousel";
import CustomSelect from "../components/CustomSelect";
import UserRoleChangeModal from "../components/UserRoleChangeModal";

export default function UsersPage() {
  // State for the users
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleRequests, setRoleRequests] = useState([]);

  // State for the role modal
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState(null);
  const [newRoleForUser, setNewRoleForUser] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const roles = ["Administrateur", "Décisionnaire", "Utilisateur"];

  // Format date to be in the form "DD MMM YYYY" 
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const year = date.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    return `${day} ${month} ${year}`;
  }

  const toggleDropdown = (userId) => {
    setOpenDropdown((prev) => (prev === userId ? null : userId));
  };

  // Handle role select for the table
  const handleRoleSelect = (user, newRole) => {
    if (user.role === newRole) {
      // no change
      return;
    }
    // open confirm modal
    setSelectedUserForRoleChange(user);
    setNewRoleForUser(newRole);
    setRoleChangeModalOpen(true);
  };

  // Handle confirm role change for the table
  const handleConfirmRoleChange = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("authToken");
  
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/users/${selectedUserForRoleChange.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRoleForUser }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du rôle de l'utilisateur.");
      }
      const data = await response.json();
      toast.success("Rôle de l'utilisateur mis à jour avec succès !");
      // Update the user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserForRoleChange.id
            ? { ...user, role: newRoleForUser }
            : user
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setRoleChangeModalOpen(false);
      setSelectedUserForRoleChange(null);
      setNewRoleForUser("");
    }
  };

  // Handle cancel role change for the table
  const handleCancelRoleChange = () => {
    setRoleChangeModalOpen(false);
    setSelectedUserForRoleChange(null);
    setNewRoleForUser("");
  };

  // Callback function to update the users list when a new user is created
  const handleUserCreated = (newUser) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]); // add user to the list
    setTotalUsers((prevTotal) => prevTotal + 1); // inc user count
  };

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // define the start and end of the range to fetch
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = currentPage * itemsPerPage;
        
        // TODO: stored token will be meaningfull when we will have a login page
        const token = localStorage.getItem("authToken"); 
        const res = await fetch(`${backendUrl}/api/admin/users?start=${start}&end=${end}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        } else {
          console.error("Erreur lors de la récupération des utilisateurs :", res.statusText);
        }
      } catch (err) {
        console.error("Erreur lors de la requête de récupération des utilisateurs :", err);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Search users
  useEffect(() => {
    const fetchData = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("authToken");
  
      if (searchTerm.trim() === "") {
        // Empty search mean we fetch users normally
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = currentPage * itemsPerPage;
        try {
          const res = await fetch(`${backendUrl}/api/admin/users?start=${start}&end=${end}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users || []);
          } else {
            console.error("Erreur lors de la récupération des utilisateurs :", res.statusText);
          }
        } catch (err) {
          console.error("Erreur lors de la requête de récupération des utilisateurs :", err);
        }
      } else {
        setCurrentPage(1);
        try {
          const res = await fetch(`${backendUrl}/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users || []);
          } else {
            console.error("Erreur lors de la recherche :", res.statusText);
          }
        } catch (err) {
          console.error("Erreur lors de la requête de recherche :", err);
        }
      }
    };
  
    fetchData();
  }, [searchTerm, currentPage]);
  
  // Get the total number of users from the backend
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${backendUrl}/api/admin/users/count`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setTotalUsers(data.totalUsers || 0);
        } else {
          console.error("Erreur lors de la récupération du nombre total d'utilisateurs :", res.statusText);
        }
      } catch (err) {
        console.error("Erreur lors de la requête du nombre d'utilisateurs :", err);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch all role request
  useEffect(() => {
    const fetchRoleRequests = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${backendUrl}/api/admin/role-requests/open`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setRoleRequests(data.requests || []);
        } else {
          console.error("Erreur lors de la récupération des demandes de rôle :", res.statusText);
        }
      } catch (err) {
        console.error("Erreur lors de la requête de récupération des demandes de rôle :", err);
      }
    }

    fetchRoleRequests();
  }, []);

  // Callback to remove a request from the list
  const removeRequest = (requestId) => {
    setRoleRequests((prevRequests) =>
      prevRequests.filter((req) => req.id !== requestId)
    );
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
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // Sort function for the table headers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Total number of pages based on number of users
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const paginatedUsers = sortedUsers; // current page

  // Pagination range 
  const getPaginationRange = () => {
    const totalPageNumbersToShow = 5;
    if (totalPages <= totalPageNumbersToShow) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    const siblingCount = 1;
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;
    const pages = [];
    pages.push(1);
    if (showLeftEllipsis) {
      pages.push("left-ellipsis");
    }
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    if (showRightEllipsis) {
      pages.push("right-ellipsis");
    }
    if (totalPages !== 1) {
      pages.push(totalPages);
    }
    return pages;
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Display the user creation modal
  const toggleModalVisibility = () => {
    setOpenModal((prev) => !prev);
  };

  return (
    <div>
      {openModal && (
        <CreateUserModal 
          onClose={toggleModalVisibility} 
          onUserCreated={handleUserCreated} 
        />
      )}
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191919]">Utilisateurs</h1>
          <p className="text-gray-500">Voici la liste des utilisateurs récupérée dynamiquement depuis le back-end.</p>
        </div>
      </div>

      {/* 1st row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1 : total users */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col">
          <h2 className="text-sm font-semibold text-[#5D5D5D] uppercase mb-1">Inscrits</h2>
          <p className="text-[#191919] font-bold text-xl">Nombre total d'utilisateurs</p>
          <div className="flex items-center">
            <FaUsers className="text-5xl text-blue-500 mt-4 mr-4 w-[80px] h-[80px]" />
            <p className="text-5xl font-bold text-gray-800 mt-3">{totalUsers.toLocaleString()}</p>
          </div>
        </div>

        {/* Card 2 : role request */}
        <div className="md:col-span-2 ">
          {roleRequests.length > 0 ? (
            <RequestCardsCarousel 
              requests={roleRequests} 
              removeRequest={removeRequest}
            />
          ) : (
            <div className="p-4 flex items-center justify-center border border-gray-100 font-semibold text-[#5D5D5D] rounded-lg bg-white shadow-sm h-full">
              <p>Aucune demande de rôle en cours.</p>
            </div>
          )}
        </div>
      </div>

      {/* Search and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#191919]">Utilisateurs Inscrits</h2>
          <p className="text-gray-500 text-sm mb-3">Liste des utilisateurs récupérée depuis la base de données.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative md:mt-0">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none bg-white placeholder-[#9D9D9D] text-[#5D5D5D]"
            />
            <svg
              className="absolute left-3 top-2 w-5 h-5 text-[#9D9D9D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="group">
            <button 
              className="bg-white py-2 px-2 flex items-center justify-center border border-gray-200 rounded-lg text-white hover:bg-blue-700 transition-colors duration-500"
              onClick={toggleModalVisibility}  
            >
              <IoPersonAddSharp className="w-5 h-5 text-blue-600 group-hover:text-white " />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto mt-6">
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
              <th className=" px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Statut
              </th>
              <th  className="hidden md:table-cell px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Inscrit le
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Rôle</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-sm text-gray-700">{user.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.nom}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{user.prenom}</td>
                  <td className="px-4 py-2 text-sm">
                    {user.status ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Actif</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Inactif</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-2 text-sm text-gray-700">{formatDate(user.created_at)}</td>
                  <CustomSelect
                    user={user}
                    roles={roles}
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                    onRoleSelect={handleRoleSelect}
                  />
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
            {Math.min(currentPage * itemsPerPage, sortedUsers.length)} sur {totalUsers} utilisateurs
          </p>
          <div className="flex items-center space-x-1">
            {getPaginationRange().map((item, index) => {
              if (item === "left-ellipsis" || item === "right-ellipsis") {
                return (
                  <span key={index} className="px-2 py-1 text-sm text-gray-500">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(item)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === item ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role change modal */}
      {roleChangeModalOpen && selectedUserForRoleChange && (
        <UserRoleChangeModal
          isOpen={roleChangeModalOpen}
          onClose={handleCancelRoleChange}
          onConfirm={handleConfirmRoleChange}
          userName={`${selectedUserForRoleChange.nom} ${selectedUserForRoleChange.prenom}`}
          currentRole={selectedUserForRoleChange.role}
          newRole={newRoleForUser}
        />
      )}
    </div>
  );
}
