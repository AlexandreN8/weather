"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StationsByPostalCode() {
  const { code_postal } = useParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On s'assure que le code postal est récupéré et valide
    if (code_postal) {
      console.log("Code postal récupéré de l'URL:", code_postal);
      
      async function fetchStations() {
        try {
          const backendHost =
            typeof window !== "undefined" && window.location.hostname === "localhost"
              ? "http://localhost:5000"
              : "http://ter_backend:5000";
          
          console.log("Envoi de la requête API pour les stations :", `${backendHost}/api/station/postal/${code_postal}`);
          
          const response = await fetch(`${backendHost}/api/station/postal/${code_postal}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              setError("Aucune station trouvée pour ce code postal.");
              return;
            }
            throw new Error("Erreur serveur, veuillez réessayer plus tard.");
          }
          
          
          const data = await response.json();
          console.log("Données des stations reçues :", data);
          
          if (data.length === 0) {
            setError("Aucune station trouvée pour ce code postal");
          } else {
            setStations(data);
          }
        } catch (err) {
          setError(err.message);
          console.error("Erreur lors de la récupération des stations:", err);
        } finally {
          setLoading(false);
        }
      }

      fetchStations();
    } else {
      console.error("Le code postal est manquant dans l'URL");
      setLoading(false);
      setError("Code postal manquant");
    }
  }, [code_postal]);

  return (
    <div className="p-6 w-[80%] mx-auto text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Stations météo pour le code postal : {code_postal}
      </h1>

      <button
        onClick={() => window.history.back()} 
        className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Retour
      </button>

      {loading && <p className="text-gray-500">Chargement des stations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="mt-4 space-y-2">
        {stations.map((station) => (
          <li
            key={station.station_id}
            className="p-3 border rounded cursor-pointer hover:bg-blue-500 hover:text-white"
            onClick={() => window.location.href = `/stations/${station.station_id}`}
          >
            {station.name} ({station.station_id})
          </li>
        ))}
      </ul>
    </div>
  );
}
