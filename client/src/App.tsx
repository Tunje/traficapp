import "./App.css";
import { Coordinates } from "./types/coordinates";
import { useState } from "react";
import { useStore } from "./hooks/useStore";
import logoImage from "./assets/TLT-Logo.png";
import TrafficInfo from "./components/TrafficInfo/TrafficInfo";
import Weather from "./components/Weather/Weather";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        return { latitude: lat, longitude: lng};
      } else {
        return null;
      }
    } catch (error) {
      console.error("Fel vid geokodning av adress:", error);
      setLoading(false);
      return null;
    }
  };
  

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setLoading(true);
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
      {/* Grid layout with a logo in the top center, search bar on top, two components on the next row, and one component spanning the bottom row, as per wireframe */}
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo" />
        <div className="logo-container__title">
          <h1>TrafficJam</h1>
        </div>
      </div>

      <section className="search">
        <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Sök plats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Sök
            </button>
          </div>
        </form>
        </div>
      </section>
      
      {!loading && coordinates && (
        <>
        <section className="search-results">
        <div className="results-container">
          <h3>Sök resultat</h3>
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
          </div>
      </section>
        {/* Left side - Transport departures (placeholder) */}
          <section className="transport-departures">
            <h3>Transport Departures</h3>
            <p className="transport-placeholder">
              Departure information will appear here
            </p>
          </section>

        {/* Right side - Weather */}
        <section className="weather-updates">
          <Weather coordinates={coordinates} />
        </section>

        {/* Bottom - Traffic Situation Updates */}
      <section className="traffic-updates">
        <TrafficInfo />
        </section>
        </>
      )}
    </main>
  );
};

export default App;