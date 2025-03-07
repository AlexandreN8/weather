"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StationPage() {
  const { id } = useParams(); // Récupère le nom de la station depuis l'URL
  const [data, setData] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.canvasjs.com/canvasjs.min.js";
    script.async = true;
    document.body.appendChild(script);

    setData([
      { label: "10:00", temperature: 15, humidity: 60 },
      { label: "11:00", temperature: 16, humidity: 58 },
      { label: "12:00", temperature: 18, humidity: 55 },
      { label: "13:00", temperature: 21, humidity: 52 },
      { label: "14:00", temperature: 23, humidity: 50 },
    ]);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.CanvasJS) {
      const tempChart = new window.CanvasJS.Chart("tempChartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: { text: `Température` },
        axisX: { title: "Heure" },
        axisY: { title: "Température (°C)", lineColor: "#FF5733" },
        data: [
          {
            type: "line",
            name: "Température",
            showInLegend: true,
            color: "#FF5733",
            dataPoints: data.map((d) => ({ label: d.label, y: d.temperature })),
          },
        ],
      });
      tempChart.render();

      const humidityChart = new window.CanvasJS.Chart("humidityChartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: { text: `Humidité` },
        axisX: { title: "Heure" },
        axisY: { title: "Humidité (%)", lineColor: "#3498DB" },
        data: [
          {
            type: "line",
            name: "Humidité",
            showInLegend: true,
            color: "#3498DB",
            dataPoints: data.map((d) => ({ label: d.label, y: d.humidity })),
          },
        ],
      });
      humidityChart.render();
    }
  }, [data, id]);

  return (
    <div className="p-6 w-[70%] mx-auto text-center">
      <h1 className="text-3xl font-bold text-blue-700">Données météo à {id}</h1>
      <p className="text-gray-600 mt-2">Température et humidité en temps réel</p>
  
      <div className="flex justify-center gap-6 mt-6">
        {/* Graphique Température */}
        <div className="w-1/2 p-4 bg-white border rounded-lg shadow-md">
          <div id="tempChartContainer" className="w-full h-[400px]"></div>
        </div>
  
        {/* Graphique Humidité */}
        <div className="w-1/2 p-4 bg-white border rounded-lg shadow-md">
          <div id="humidityChartContainer" className="w-full h-[400px]"></div>
        </div>
      </div>
    </div>
  );  
}