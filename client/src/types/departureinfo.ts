export interface NoDepartures {
  NoDepartures: string;
}

export type IncomingApiData = {
  StationName: string;
  Product: {operator: string}[];
  name: string;
  direction: string;
  time: string;
  stop: string;
  Notes:  {Note: string[]};
  rtTrack: string;
}

export interface TransportItem {
    StationName: string;
    TransportOperator: string;  
    TransportItem: string; // Name plus number, i.e, "Länstrafik - Buss 430"
    Direction: string; // Destination
    DepartureTime: string;
    TrainNotes?: string[]; // Amenities/features (if train)
    TrainTrack?: string; // Track (if train)
  };
