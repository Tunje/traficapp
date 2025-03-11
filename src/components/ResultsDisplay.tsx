import { Coordinates } from '../hooks/useLocation';

interface ResultsDisplayProps {
  results: string[];
  coordinates: Coordinates;
}

export const ResultsDisplay = ({ results, coordinates }: ResultsDisplayProps) => {
  return (
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
      
      {coordinates && (
        <div className="coordinates-display">
          <h3>Current Coordinates:</h3>
          <p>Latitude: {coordinates.lat.toFixed(6)}</p>
          <p>Longitude: {coordinates.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};
