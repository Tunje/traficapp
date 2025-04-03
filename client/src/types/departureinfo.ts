export type TransportItem = {
    operator: string;  
    name: string; // Name plus number, i.e, "Länstrafik - Buss 430"
    time: string; // Departure time
    track?: string; // Track (if train)
    notes?: []; // Amenities (if train)
  };
