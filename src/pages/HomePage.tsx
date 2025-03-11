import { useState } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { Coordinates } from '../hooks/useLocation';

export const HomePage = () => {
  const [results, setResults] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates>(null);

  const handleSearchResults = (newResults: string[], newCoordinates: Coordinates) => {
    setResults(newResults);
    setCoordinates(newCoordinates);
  };

  return (
    <div className="container">
      <Header />
      <SearchBar onSearchResults={handleSearchResults} />
      <ResultsDisplay results={results} coordinates={coordinates} />
    </div>
  );
};
