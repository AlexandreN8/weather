"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import corseStations from "../data/corseStations"; // Import des stations corses

// Fonction pour formater le nom des stations
const formatStationName = (name) => {
  // Remplacer les underscores et tirets par des espaces et mettre en majuscule la lettre suivante
  let formattedName = name.replace(/[_-](.)/g, (match, p1) => " " + p1.toUpperCase());

  // Mettre en majuscule seulement la première lettre de chaque mot
  formattedName = formattedName
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());

  return formattedName;
};

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [filteredStations, setFilteredStations] = useState(corseStations); // Initialisation avec les stations corses
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      if (window.L.DomUtil.get("map")?._leaflet_id != null) {
        window.L.DomUtil.get("map")._leaflet_id = null;
      }

      const map = window.L.map("map").setView([41.9, 9.2], 10); // Positionner la carte sur la Corse
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      filteredStations.forEach((station) => {
        // Utilisation de geometry.coordinates pour obtenir lat et lon
        const lat = station.geometry.coordinates[1];
        const lon = station.geometry.coordinates[0];

        const marker = window.L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>${station.properties.NOM_USUEL}</b>`); // Affichage du nom de la station
        marker.on("click", () => router.push(`/stations/${station.properties.NUM_POSTE}`)); // Rediriger vers la page de la station
      });

      return () => map.remove();
    }
  }, [filteredStations]);

  const handleSearch = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);
    filterStations(search, regionFilter);
  };

  const filterStations = (search, region) => {
    let results = corseStations; // Utilisation de `corseStations` directement
    if (region !== "All") {
      results = results.filter((station) => station.region === region); // À adapter si "region" existe
    }
    results = results.filter((station) =>
      station.properties.NOM_USUEL.toLowerCase().includes(search)
    );
    setFilteredStations(results);
  };

  const handleRegionChange = (region) => {
    setRegionFilter(region);
    filterStations(searchTerm, region);
  };

  return (
    <div className="flex w-[80%] mx-auto">
      <div className="w-2/3 p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Carte des stations météo corses</h1>
        <div id="map" className="w-full h-[600px] border rounded shadow-md"></div>
      </div>

      <div className="w-1/3 p-6">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Liste des stations</h2>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 text-black border rounded mb-4"
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleRegionChange("All")}
            className={`px-4 py-2 rounded ${regionFilter === "All" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Toutes
          </button>
          <button
            onClick={() => handleRegionChange("Corse")}
            className={`px-4 py-2 rounded ${regionFilter === "Corse" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Corse
          </button>
        </div>

        <ul className="max-h-[500px] overflow-y-auto">
          {filteredStations.map((station, index) => (
            <li
              key={index}
              className="p-2 border rounded mb-2 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => router.push(`/stations/${station.properties.NUM_POSTE}`)} // Lien vers la page de la station
            >
              {formatStationName(station.properties.NOM_USUEL)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
