import { useState } from 'react'
import './App.css'
import logoImage from '../logo/TLT-Logo.png'
import axios from 'axios';

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchQuery.trim()) {
      const coords = await geocodeAddress(searchQuery);
      
      if (coords) {
        setCoordinates(coords);
        setResults([
          `${searchQuery} - Latitude: ${coords.lat.toFixed(6)}, Longitude: ${coords.lng.toFixed(6)}`
        ]);
      } else {
        setResults([`Could not find coordinates for: ${searchQuery}`]);
      }
      
      setSearchQuery('');
    }
  }
  const geocodeAddress = async (address: string) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
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
  )
}

export default App
