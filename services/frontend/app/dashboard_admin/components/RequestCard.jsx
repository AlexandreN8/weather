'use client';
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import RoleChangeModal from "./RoleChangeModal";
import { toast } from "react-toastify";

export default function RequestCard({ request, className, onRemoveRequest }) {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [actionType, setActionType] = useState(""); // "Accepter" or "Refuser"

      const handleActionClick = (action) => {
        setActionType(action);
        setIsModalOpen(true);
      };

      const handleCloseModal = () => setIsModalOpen(false);

      const handleConfirmModal = async () => {
        const newStatus = actionType === "Accepter" ? "accepted" : "refused";
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("authToken");
    
        try {
          // Update user's role if action = "Accepter"
          if (actionType === "Accepter") {
            const userResponse = await fetch(
              `${backendUrl}/api/admin/users/${request.id_user}/role`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ role: request.desired_role }),
              }
            );
            if (!userResponse.ok) {
              throw new Error("Erreur lors de la mise à jour du rôle de l'utilisateur.");
            }
            const userData = await userResponse.json();
          }
    
          // Update request status
          const requestResponse = await fetch(
            `${backendUrl}/api/admin/role-requests/${request.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );
          if (!requestResponse.ok) {
            throw new Error("Erreur lors de la mise à jour du statut de la demande.");
          }
          const requestData = await requestResponse.json();
          toast.success("Demande mise à jour avec succès.");

          // Remove the request from the list
          if (onRemoveRequest){
            onRemoveRequest(request.id);
          }
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        } finally {
          setIsModalOpen(false);
        }
      };

      // Format date to be in the form "DD MMM YYYY" 
      function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        const year = date.getFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[date.getMonth()];
        return `${day} ${month} ${year}`;
      }

      return (
        <div className={`relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 bg-white shadow-sm ${className}`}>
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
              <h3 className="text-xl font-bold text-[#191919] sm:text-xl">
                Demande de rôle : {request.desired_role || "Undefined"}
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-600 capitalize">{request.fname} {" "} {request.lname} - {formatDate(request.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-pretty text-gray-500">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa
            maiores deleniti consectetur nobis et eaque.
          </p>
        </div>
        <div className="flex items-center mt-4 absolute bottom-4 left-8">
          <button 
            className="text-white text-sm font-medium bg-blue-500 px-2 py-1 rounded-lg hover:opacity-90 mr-4"
            onClick={() => handleActionClick("Accepter")}
          >
            Accepter
          </button>
          
          <button 
            className="text-white text-sm font-medium bg-red-500 px-2 py-1 rounded-lg hover:opacity-90"
            onClick={() => handleActionClick("Refuser")}
          >
            Refuser
          </button>
        </div>

        {/* Modal */}
        <RoleChangeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmModal}
          userName={`${request.fname} ${request.lname}`}
          role={request.desired_role || "Rôle par défaut"}
          actionType={actionType}
        />

      </div>
    );
}