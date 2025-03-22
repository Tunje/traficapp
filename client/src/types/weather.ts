export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export interface ForecastDay {
  day: string;
  temp: number;
  rainChance: number;
  icon: string;
  description: string;
}

export interface WeatherProps {
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
}
