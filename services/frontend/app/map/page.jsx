"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStations, setFilteredStations] = useState([]);
  const router = useRouter();

  // Liste des stations météo en Corse
  const stations = [
    { name: "Ajaccio", lat: 41.9189, lon: 8.7381 },
    { name: "Bastia", lat: 42.6974, lon: 9.4509 },
    { name: "Calvi", lat: 42.5664, lon: 8.7575 },
    { name: "Corte", lat: 42.2986, lon: 9.1497 },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      if (window.L.DomUtil.get("map")?._leaflet_id != null) { // Vérification si la map existe, si oui on la supprime avant d'en créer une nouvelle
        window.L.DomUtil.get("map")._leaflet_id = null;
      }

      const map = window.L.map("map").setView([42.1, 9], 8); // Initialisation de la map centrée sur la Corse

      // Ajout d'une couche OpenStreetMap
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      // Ajout des marqueurs des stations
      stations.forEach((station) => {
        const marker = window.L.marker([station.lat, station.lon]).addTo(map);
        marker.bindPopup(`<b>${station.name}</b><br>Station météo`);
      });
    }

    setFilteredStations(stations);
  }, []);

  // On filtre les stations en fonction du texte entré dans la barre de recherche
  const handleSearch = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);
    setFilteredStations(stations.filter(station => station.name.toLowerCase().includes(search)));
  };

  return (
    <div className="flex w-[70%] mx-auto">
      <div className="w-1/2 p-6">
        <h1 className="w-3/4 text-3xl font-bold text-blue-700 ml-auto">Carte des stations météo</h1>
        <div id="map" className="w-3/4 h-[600px] mt-6 border rounded-lg shadow-md ml-auto"></div>
      </div>

      <div className="w-1/2 p-6 items-start">
        <h2 className="text-3xl text-orange-600 font-bold mb-6">Liste des stations</h2>
        <input
          type="text"
          placeholder="Rechercher une station..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 text-black border rounded mb-4"
        />
        <ul>
          {filteredStations.map((station, index) => (
            <li key={index}
                className="p-2 border rounded mb-2 cursor-pointer hover:bg-blue-500"
                onClick={() => router.push(`/stations/${station.name.toLowerCase()}`)}
            >
              {station.name}
            </li>
          ))}
        </ul>
      </div>
    </div>

  );
}
