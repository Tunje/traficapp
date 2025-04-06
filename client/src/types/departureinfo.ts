export type IncomingApiData = {
  Product: {operator: string}[];
  name: string;
  direction: string;
  time: string;
  Notes:  {Note: string[]};
  rtTrack: string;
}

export type TransportItem = {
    TransportOperator: string;  
    TransportItem: string; // Name plus number, i.e, "Länstrafik - Buss 430"
    Direction: string; // Destination
    DepartureTime: string;
    TrainNotes?: string[]; // Amenities/features (if train)
    TrainTrack?: string; // Track (if train)
  };
