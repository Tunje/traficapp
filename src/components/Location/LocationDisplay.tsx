import { Coordinates } from "../../types/coordinates";

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
          <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
          <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};
