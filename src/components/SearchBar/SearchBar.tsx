import { useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { Coordinates } from '../hooks/useLocation';

interface SearchBarProps {
  onSearchResults: (results: string[], coordinates: Coordinates) => void;
}

export const SearchBar = ({ onSearchResults }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCoordinates } = useLocation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      try {
        const coords = await getCoordinates(searchQuery);
        
        if (coords) {
          onSearchResults(
            [`${searchQuery} - Latitude: ${coords.lat.toFixed(6)}, Longitude: ${coords.lng.toFixed(6)}`],
            coords
          );
          setSearchQuery('');
        } else {
          onSearchResults([`Could not find coordinates for: ${searchQuery}`], null);
          setError('No results found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onSearchResults([`Error: ${errorMessage}`], null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
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
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
