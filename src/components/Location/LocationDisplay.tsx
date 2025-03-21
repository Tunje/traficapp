import { Coordinates } from "../../types/coordinates";

interface ResultsDisplayProps {
  results: string[];
  coordinates: Coordinates;
}

export const ResultsDisplay = ({ results, coordinates }: ResultsDisplayProps) => {
  return (
    <div className="results-container">
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
      
      {coordinates && (
        <div className="coordinates-display">
          <h3>Nuvarande position:</h3>
          <p>Latitud: {coordinates.latitude.toFixed(6)}</p>
          <p>Longitud: {coordinates.longitude.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};
