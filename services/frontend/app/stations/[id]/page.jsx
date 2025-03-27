"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WiThermometer, WiHumidity, WiStrongWind, WiBarometer, WiRain } from "react-icons/wi";

export default function StationDashboard() {
  const { id } = useParams();
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendHost =
          typeof window !== "undefined" && window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "http://ter_backend:5000";

        const response = await fetch(`${backendHost}/api/station/${id}`);

        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();
        console.log("Données reçues :", data);
        setStationData(data);
      } catch (error) {
        console.error("Erreur fetch données:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-lg font-semibold">Chargement des données...</p>;

  if (!stationData)
    return <p className="text-center mt-10 text-red-500 font-semibold">Aucune donnée trouvée pour cette station.</p>;

  // Conversion des données
  const temperatureC = stationData.t !== undefined && stationData.t !== null 
  ? (stationData.t - 273.15).toFixed(1) 
  : "N/A";
  const humidity = stationData.u ?? "N/A";
  const windSpeed = stationData.ff ?? "N/A";
  const windDirection = stationData.dd ?? "N/A";
  const pressure = stationData.pmer ? (stationData.pmer / 100).toFixed(2) : "N/A";
  const precipitation = stationData.rr_per ?? "N/A";

  return (
    <div className="p-6 w-[80%] mx-auto text-center">
      <button
  onClick={() => window.history.back()}
  className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 self-start"
>
  ← Retour
</button>

      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Station météo : {stationData.name || id}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Température */}
        <div className="p-6 bg-white border rounded-lg shadow-md flex flex-col items-center">
          <WiThermometer size={50} className="text-red-500" />
          <h2 className="text-lg font-semibold mt-2">Température</h2>
          <p className="text-2xl font-bold">{temperatureC}°C</p>
        </div>

        {/* Humidité */}
        <div className="p-6 bg-white border rounded-lg shadow-md flex flex-col items-center">
          <WiHumidity size={50} className="text-blue-500" />
          <h2 className="text-lg font-semibold mt-2">Humidité</h2>
          <p className="text-2xl font-bold">{humidity}%</p>
        </div>

        {/* Vent */}
        <div className="p-6 bg-white border rounded-lg shadow-md flex flex-col items-center">
          <WiStrongWind size={50} className="text-gray-700" />
          <h2 className="text-lg font-semibold mt-2">Vent</h2>
          <p className="text-2xl font-bold">{windSpeed} m/s</p>
          <p className="text-sm">Direction : {windDirection}°</p>
        </div>

        {/* Pression */}
        <div className="p-6 bg-white border rounded-lg shadow-md flex flex-col items-center">
          <WiBarometer size={50} className="text-green-600" />
          <h2 className="text-lg font-semibold mt-2">Pression</h2>
          <p className="text-2xl font-bold">{pressure} hPa</p>
        </div>

        {/* Précipitations */}
        <div className="p-6 bg-white border rounded-lg shadow-md flex flex-col items-center">
          <WiRain size={50} className="text-blue-400" />
          <h2 className="text-lg font-semibold mt-2">Précipitations</h2>
          <p className="text-2xl font-bold">{precipitation} mm</p>
        </div>
      </div>
    </div>
  );
}
