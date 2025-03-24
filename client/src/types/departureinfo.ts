export type Transport = {
    ProductAtStop: any;  
    name: string; // Transport name (e.g., train number or bus route)
    time: string; // Departure time
    direction: string; // Direction of travel
    track?: string; // Track information (optional)
    stop: string; // Stop name
  };
  
  export interface DepartureProps {
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  }