import { useState } from 'react'
import './App.css'
import logoImage from '../logo/TLT-Logo.png'
import { useLocation } from './contexts/LocationContext'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCoordinates } = useLocation();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      try {
        const coords = await getCoordinates(searchQuery);
        
        if (coords) {
          setCoordinates(coords);
          setResults([
            `${searchQuery} - Latitude: ${coords.lat.toFixed(6)}, Longitude: ${coords.lng.toFixed(6)}`
          ]);
          setSearchQuery('');
        } else {
          setResults([`Could not find coordinates for: ${searchQuery}`]);
          setError('No results found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setResults([`Error: ${errorMessage}`]);
      } finally {
        setIsLoading(false);
      }
    }
  }
  
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
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-container">
        <h2>Search Results</h2>
        {error && <p className="error-message">{error}</p>}
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
        
        {coordinates && (
          <div className="coordinates-display">
            <h3>Current Coordinates:</h3>
            <p>Latitude: {coordinates.lat.toFixed(6)}</p>
            <p>Longitude: {coordinates.lng.toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
