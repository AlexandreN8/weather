"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WiThermometer, WiHumidity, WiStrongWind, WiBarometer, WiRain } from "react-icons/wi";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

export default function StationDashboard() {
  const { id } = useParams();
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [showSevenDays, setShowSevenDays] = useState(false); // Afficher les 7 derniers jours ou non

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

  useEffect(() => {
    async function fetchHistory() {
      try {
        const backendHost =
          typeof window !== "undefined" && window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "http://ter_backend:5000";

        const endpoint = showSevenDays
          ? `${backendHost}/api/station/history/7d/${id}`  // Affiche les 7 derniers jours
          : `${backendHost}/api/station/history/24h/${id}`; // Affiche les 24 dernières heures

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Erreur lors de la récupération des données historiques");

        const data = await response.json();
        console.log("Données historiques :", data);  // Ajout du log pour vérifier les données
        setHistoryData(data);
      } catch (error) {
        console.error("Erreur fetch historique:", error);
      }
    }

    if (stationData) fetchHistory();
  }, [stationData, showSevenDays]); // Recharger les données lorsque l'état showSevenDays change

  useEffect(() => {
    if (historyData) {
      // Enregistrement de Chart.js et création des graphiques uniquement si les paramètres concernés sont disponibles
      Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);
  
      // Fonction pour détruire les anciens graphiques 
      const destroyChart = (chartId) => {
        const chart = Chart.getChart(chartId);
        if (chart) {
          chart.destroy();
        }
      };
  
      const ctxTemp = document.getElementById("tempChart")?.getContext("2d");
      const ctxHumidity = document.getElementById("humidityChart")?.getContext("2d");
      const ctxWind = document.getElementById("windChart")?.getContext("2d");  // Contexte pour le graphique du vent
  
      // On détruit les anciens graphes pour afficher ceux de la période demandée
      destroyChart("tempChart");
      destroyChart("humidityChart");
      destroyChart("windChart");
  
      // Température
      if (ctxTemp && historyData.some((data) => data.t)) {
        let labels, temperatureData;
  
        if (showSevenDays) {
          // Données par jour + moyenne
          const groupedByDay = historyData.reduce((acc, data) => {
            const date = new Date(data.reference_time);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            if (!acc[day]) acc[day] = [];
            acc[day].push(data.t - 273.15); // Passage de la température en °C
            return acc;
          }, {});
  
          // Moyenne pour chaque jour 
          labels = Object.keys(groupedByDay);
          temperatureData = labels.map(day => {
            const temps = groupedByDay[day];
            return (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
          });
        } else {
          // Affichage sur 24h
          labels = historyData.map((data) => new Date(data.reference_time).toLocaleTimeString());
          temperatureData = historyData.map((data) => (data.t - 273.15).toFixed(1));
        }
  
        new Chart(ctxTemp, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Température (°C)",
                data: temperatureData,
                borderColor: "red",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
        });
      }
  
      // Humidité
      if (ctxHumidity && historyData.some((data) => data.u)) {
        let labels, humidityData;
  
        if (showSevenDays) {
          // Grouper les données par jour et calculer la moyenne
          const groupedByDay = historyData.reduce((acc, data) => {
            const date = new Date(data.reference_time);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            if (!acc[day]) acc[day] = [];
            acc[day].push(data.u); // Humidité
            return acc;
          }, {});
  
          // Calculer la moyenne pour chaque jour
          labels = Object.keys(groupedByDay);
          humidityData = labels.map(day => {
            const humidityValues = groupedByDay[day];
            return (humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length).toFixed(1);
          });
        } else {
          // Affichage sur 24h
          labels = historyData.map((data) => new Date(data.reference_time).toLocaleTimeString());
          humidityData = historyData.map((data) => data.u);
        }
  
        new Chart(ctxHumidity, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Humidité (%)",
                data: humidityData,
                borderColor: "blue",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
        });
      }
  
      // Vent (force du vent)
      if (ctxWind && historyData.some((data) => data.ff)) {
        let labels, windSpeedData;
  
        if (showSevenDays) {
          // Grouper les données par jour et calculer la moyenne
          const groupedByDay = historyData.reduce((acc, data) => {
            const date = new Date(data.reference_time);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            if (!acc[day]) acc[day] = [];
            acc[day].push(data.ff); // Force du vent
            return acc;
          }, {});
  
          // Calculer la moyenne pour chaque jour
          labels = Object.keys(groupedByDay);
          windSpeedData = labels.map(day => {
            const windSpeeds = groupedByDay[day];
            return (windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toFixed(1);
          });
        } else {
          // Affichage sur 24h
          labels = historyData.map((data) => new Date(data.reference_time).toLocaleTimeString());
          windSpeedData = historyData.map((data) => data.ff);
        }
  
        new Chart(ctxWind, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Vitesse du vent (m/s)",
                data: windSpeedData,
                borderColor: "green",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
        });
      }
    }
  }, [historyData, showSevenDays]); // Données selon la periode demandée
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

  // Récupération de la date de la dernière donnée
  const lastDataTime = historyData?.length
    ? new Date(historyData[historyData.length - 1].reference_time).toLocaleString()
    : "Non disponible";

    return (
      <div className="p-6 w-[90%] mx-auto text-center">
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 self-start"
        >
          ← Retour
        </button>
    
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Station météo : {stationData.name || id}
        </h1>
    
        <p className="text-lg font-semibold mb-4">Dernière mise à jour : {lastDataTime}</p>
    
        <div className="grid grid-cols-1 gap-6 mt-4">
          {/* Informations météo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Température */}
            <div className="p-4 bg-white border rounded-lg shadow-md flex flex-col items-center">
              <WiThermometer size={40} className="text-red-500" />
              <h2 className="text-sm font-semibold mt-2">Température</h2>
              <p className="text-lg font-bold">{temperatureC}°C</p>
            </div>
    
            {/* Humidité */}
            <div className="p-4 bg-white border rounded-lg shadow-md flex flex-col items-center">
              <WiHumidity size={40} className="text-blue-500" />
              <h2 className="text-sm font-semibold mt-2">Humidité</h2>
              <p className="text-lg font-bold">{humidity}%</p>
            </div>
    
            {/* Vent */}
            <div className="p-4 bg-white border rounded-lg shadow-md flex flex-col items-center">
              <WiStrongWind size={40} className="text-gray-700" />
              <h2 className="text-sm font-semibold mt-2">Vent</h2>
              <p className="text-lg font-bold">{windSpeed} m/s</p>
              <p className="text-sm">Direction : {windDirection}°</p>
            </div>
    
            {/* Pression */}
            <div className="p-4 bg-white border rounded-lg shadow-md flex flex-col items-center">
              <WiBarometer size={40} className="text-green-600" />
              <h2 className="text-sm font-semibold mt-2">Pression</h2>
              <p className="text-lg font-bold">{pressure} hPa</p>
            </div>
    
            {/* Précipitations */}
            <div className="p-4 bg-white border rounded-lg shadow-md flex flex-col items-center">
              <WiRain size={40} className="text-blue-400" />
              <h2 className="text-sm font-semibold mt-2">Précipitations</h2>
              <p className="text-lg font-bold">{precipitation} mm</p>
            </div>
          </div>
    
          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyData && historyData.some((data) => data.t) && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center">Température ({showSevenDays ? '7 jours' : '24h'})</h2>
                <canvas id="tempChart" width="400" height="200"></canvas>
              </div>
            )}
    
            {historyData && historyData.some((data) => data.u) && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center">Humidité ({showSevenDays ? '7 jours' : '24h'})</h2>
                <canvas id="humidityChart" width="400" height="200"></canvas>
              </div>      
            )}
    
            {historyData && historyData.some((data) => data.ff) && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center">Vent ({showSevenDays ? '7 jours' : '24h'})</h2>
                <canvas id="windChart" width="400" height="200"></canvas>
              </div>
            )}
          </div>
        </div>
    
        {/* Bouton pour changer de période */}
        <button
          onClick={() => setShowSevenDays(!showSevenDays)}
          className="mt-6 py-2 px-4 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
        >
          Afficher les {showSevenDays ? "24 dernières heures" : "7 derniers jours"}
        </button>
      </div>
    );
    
}
