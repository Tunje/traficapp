export type Coordinates = {
    latitude: number,
    longitude: number
} | null;


export interface TrafficProps {
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  }
  