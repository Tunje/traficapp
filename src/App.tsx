import { useState } from "react";
import "./App.css";
import logoImage from "../public/TLT-Logo.png";
import Weather from "./components/Weather/Weather";
import { useLocation } from "./hooks/useLocation";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { getCoordinates } = useLocation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      const coords = await getCoordinates(searchQuery);

      if (coords) {
        setCoordinates(coords);
        setResults([
          `${searchQuery} - Latitude: ${coords.lat.toFixed(
            6
          )}, Longitude: ${coords.lng.toFixed(6)}`,
        ]);
      } else {
        setResults([`Could not find coordinates for: ${searchQuery}`]);
      }

      setSearchQuery("");
    }
  };

  return (
    <div className="container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo" />
      </div>

      <div className="search-container">
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
      </div>
      {/* Dashboard layout with two columns */}
      <div className="dashboard-container">
        {/* Left side - Transport departures (placeholder) */}
        <div className="dashboard-left">
          <div className="transport-container">
            <h2 className="transport-title">Transport Departures</h2>
            <p className="transport-placeholder">
              Departure information will appear here
            </p>
          </div>
        </div>

        {/* Right side - Weather */}
        <div className="dashboard-right">
          <Weather coordinates={coordinates} />
        </div>
      </div>

      <div className="results-container">
        <h2>Search Results</h2>
        {results.length > 0 ? (
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
      </div>
    </div>
  );
};

export default App;