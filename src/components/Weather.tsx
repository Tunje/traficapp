import { useEffect, useState } from "react";
import "./weather.css";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = "6fe1ad8098a23d7d131693c3b31d5e04";

  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        setWeatherData({
          temp: data.main.temp,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
        });
        setLoading(false);
      } catch (err) {
        setError("Error fetching weather data");
        setLoading(false);
        console.error("Weather fetch error:", err);
      }
    };

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
          },
          (err) => {
            setError("Unable to get location. Please allow location access.");
            setLoading(false);
            console.error("Geolocation error:", err);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  if (loading) {
    return (
      <div className="weather-container loading">Loading weather data...</div>
    );
  }

  if (error) {
    return <div className="weather-container error">{error}</div>;
  }

  return (
    <div className="weather-container">
      {weatherData && (
        <>
          <div className="weather-location">{weatherData.city}</div>
          <div className="weather-info">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
              alt={weatherData.description}
              className="weather-icon"
            />
            <div className="weather-details">
              <div className="weather-temp">
                {Math.round(weatherData.temp)}°C
              </div>
              <div className="weather-desc">{weatherData.description}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
