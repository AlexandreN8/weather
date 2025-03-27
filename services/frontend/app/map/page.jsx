"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import villes from "../data/villes";

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [filteredCities, setFilteredCities] = useState(villes);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      if (window.L.DomUtil.get("map")?._leaflet_id != null) {
        window.L.DomUtil.get("map")._leaflet_id = null;
      }

      const map = window.L.map("map").setView([46.5, 2.5], 6);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      filteredCities.forEach((city) => {
        const marker = window.L.marker([city.lat, city.lon]).addTo(map);
        marker.bindPopup(`<b>${city.name}</b>`);
        marker.on("click", () => router.push(`/${city.code_postal}`)); 
      });

      return () => map.remove();
    }
  }, [filteredCities]);

  const handleSearch = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);
    filterCities(search, regionFilter);
  };

  const filterCities = (search, region) => {
    let results = villes;
    if (region !== "All") {
      results = results.filter((city) => city.region === region);
    }
    results = results.filter((city) =>
      city.name.toLowerCase().includes(search)
    );
    setFilteredCities(results);
  };

  const handleRegionChange = (region) => {
    setRegionFilter(region);
    filterCities(searchTerm, region);
  };

  return (
    <div className="flex w-[80%] mx-auto">
      <div className="w-2/3 p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Carte des villes</h1>
        <div id="map" className="w-full h-[600px] border rounded shadow-md"></div>
      </div>

      <div className="w-1/3 p-6">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Liste des villes</h2>
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
            onClick={() => handleRegionChange("France")}
            className={`px-4 py-2 rounded ${regionFilter === "France" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            France
          </button>
          <button
            onClick={() => handleRegionChange("Corse")}
            className={`px-4 py-2 rounded ${regionFilter === "Corse" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Corse
          </button>
        </div>

        <ul className="max-h-[500px] overflow-y-auto">
          {filteredCities.map((city, index) => (
            <li
              key={index}
              className="p-2 border rounded mb-2 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => router.push(`/${city.code_postal}`)} 
            >
              {city.name} ({city.code_postal})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
