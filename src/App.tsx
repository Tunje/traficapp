import "./App.css";
import { useState } from "react";
import { useStore } from "./hooks/useStore";
import logoImage from "./assets/TLT-Logo.png";
import Weather from "./components/Weather/Weather";
import { Coordinates } from "./types/coordinates";
import { useLoadingState } from "./hooks/useLoadingState";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const setCoordinates = useStore((state) => state.setCoordinates);
  let coordinates = useStore((state) => state.coordinates);
  const { loading, error, setLoading, setError } = useLoadingState();
  
  const getLocation = async (address: string): Promise<Coordinates> => {
    try {
      setLoading(true);
      setError(null);
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
        setError("Could not find coordinates for: " + address);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      setError("Error finding location");
      setLoading(false);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      coordinates = await getLocation(searchQuery);

      if (coordinates) {
        setResults([
          `${searchQuery} - Latitude: ${coordinates.latitude.toFixed(
            6
          )}, Longitude: ${coordinates.longitude.toFixed(6)}`,
        ]);
      } else {
        setResults([`Could not find coordinates for: ${searchQuery}`]);
      }
      setSearchQuery("");
    }
  };

  return (
    <main className="container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo" />
      </div>

      <section className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </section>
      {/* Dashboard layout with two columns */}
      <div className="dashboard-container">
        {/* Left side - Transport departures (placeholder) */}
        <div className="dashboard-left">
          <section className="transport-container">
            <h2 className="transport-title">Transport Departures</h2>
            <p className="transport-placeholder">
              Departure information will appear here
            </p>
          </section>
        </div>

        {/* Right side - Weather */}
        <div className="dashboard-right">
          <Weather coordinates={coordinates} />
        </div>
      </div>
      <section className="results-container">
        <h2>Search Results</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : results.length > 0 ? (
          <ul className="results-list">
            {results.map((result, index) => (
              <li key={index} className="result-item">
                {result}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results">No results to display</p>
        )}
      </section>
    </main>
  );
};

export default App;