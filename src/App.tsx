import "./App.css";
import { useState } from "react";
import { useStore } from "./hooks/useStore";
import logoImage from "./assets/TLT-Logo.png";
import Weather from "./components/Weather/Weather";
import { Coordinates } from "./types/coordinates";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const setCoordinates = useStore((state) => state.setCoordinates);
  let coordinates = useStore((state) => state.coordinates);
  
  const getLocation = async (address: string): Promise<Coordinates> => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ latitude: lat, longitude: lng});
        console.log("New coordinates from App", data.results[0]);
        return { latitude: lat, longitude: lng};
      } else {
        return null;
      }
    } catch (error) {
      console.error("Fel vid geokodning av adress:", error);
      return null;
    }
  };
  

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      coordinates = await getLocation(searchQuery);

      if (coordinates) {
        setResults([
          `${searchQuery} - Latitud: ${coordinates.latitude.toFixed(
            6
          )}, Longitud: ${coordinates.longitude.toFixed(6)}`,
        ]);
      } else {
        setResults([`Kunde inte hitta koordinater för: ${searchQuery}`]);
      }
      setSearchQuery("");
    }
  };

  return (
    <main className="container">
      <div className="logo-container">
        <img src={logoImage} alt="Logotypo" className="logo" />
      </div>

      <section className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Sök..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Sök
            </button>
          </div>
        </form>
      </section>
      {/* Dashboard layout with two columns */}
      <div className="dashboard-container">
        {/* Left side - Transport departures (placeholder) */}
        <div className="dashboard-left">
          <section className="transport-container">
            <h2 className="transport-title">Avgångar</h2>
            <p className="transport-placeholder">
              Avgångsinformation kommer här
            </p>
          </section>
        </div>

        {/* Right side - Weather */}
        <div className="dashboard-right">
          <Weather coordinates={coordinates} />
        </div>
      </div>
      <section className="results-container">
        <h2>Sök resultat</h2>
        {results.length > 0 ? (
          <ul className="results-list">
            {results.map((result, index) => (
              <li key={index} className="result-item">
                {result}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results">Inga resultat</p>
        )}
      </section>
    </main>
  );
};

export default App;