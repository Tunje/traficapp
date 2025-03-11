import { createContext, ReactNode, useContext } from 'react';

// Define the shape of our coordinates
export type Coordinates = { lat: number; lng: number } | null;

// Define the shape of our context
interface LocationContextType {
  getCoordinates: (address: string) => Promise<Coordinates>;
}

// Create the context with a default value
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  // Function to convert address to coordinates
  const getCoordinates = async (address: string): Promise<Coordinates> => {
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
        return { lat, lng };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  // The value that will be provided to consumers of this context
  const contextValue: LocationContextType = {
    getCoordinates
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  
  return context;
};
