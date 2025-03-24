import { useEffect, useState } from "react";
import "./Weather.css";
import { WeatherData, ForecastDay, WeatherProps } from "../../types/weather";
import { WEATHER_API_KEY } from "../config.example";
import { useStore } from "../../hooks/useStore";

const Weather = ({ coordinates }: WeatherProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let stateCoordinates = useStore((state) => state.coordinates);

  // const API_KEY = WEATHER_API_KEY;
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getDayName = (dateStr: string) => {
    const days = [
      "Söndag",
      "Måndag",
      "Tisdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lördag",
    ];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number) => {
      try {
        /*----- Fetching current weather -----*/

        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!currentResponse.ok) {
          throw new Error("Fel vid hämtning av väderdata");
        }

        const currentData = await currentResponse.json();

        setWeatherData({
          temp: currentData.main.temp,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          city: currentData.name,
        });

        /*----- Fetch 5-day forecast -----*/

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!forecastResponse.ok) {
          throw new Error("Fel vid hämtning av väderdata");
        }

        const forecastData = await forecastResponse.json();

        /*----- Process forecast data to get one entry per day (noon time) -----*/

        const dailyForecasts: ForecastDay[] = [];
        const processedDays = new Set();

        forecastData.list.forEach((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          const time = item.dt_txt.split(" ")[1];

          /*----- Only take one reading per day (around noon) -----*/

          if (!processedDays.has(date) && time.includes("12:")) {
            processedDays.add(date);

            dailyForecasts.push({
              day: getDayName(date),
              temp: item.main.temp,
              rainChance:
                item.pop * 100 /*----- Convert from 0-1 to percentage -----*/,
              icon: item.weather[0].icon,
              description: item.weather[0].description,
            });
          }
        });

        /*----- Limit to 5 days -----*/

        setForecastData(dailyForecasts.slice(0, 5));
        setLoading(false);
      } catch (err) {
        setError("Fel vid hämtning av väderdata");
        setLoading(false);
        console.error("Väder hämtning fel:", err);
      }
    };

    /*----- If coordinates are provided, use them -----*/

    if (coordinates) {
      fetchWeatherData(stateCoordinates.latitude, stateCoordinates.longitude);
    } else {
      /*----- Fallback to loading state if no coordinates are provided -----*/
      setLoading(true);
    }
  }, [coordinates]);

  if (loading) {
    return (
      <div className="weather-container loading">
          <div className="weather-location">
            <h3>Väder</h3>
          </div>
          <div>Laddar väder data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="weather-container error">{error}</div>;
  }

  return (
    <div className="weather-container">
      {weatherData && (
        <>
          <div className="weather-location ">
            <h3>Vädret för {weatherData.city}</h3>
          </div>
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

          {/* 5-day forecast grid */}
          <div className="weather-forecast">
            {/* Grid headers */}
            <div className="forecast-grid">
              <div className="forecast-header">Dag</div>
              <div className="forecast-header">Temp</div>
              <div className="forecast-header">Regn</div>
              <div className="forecast-header"></div> {/* For icons */}
            </div>

            {/* Grid rows */}
            {forecastData &&
              forecastData.map((day, index) => (
                <div key={index} className="forecast-grid">
                  <div className="forecast-day">{day.day}</div>
                  <div className="forecast-temp">{Math.round(day.temp)}°C</div>
                  <div className="forecast-rain">
                    {Math.round(day.rainChance)}%
                  </div>
                  <div className="forecast-icon-cell">
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                      className="forecast-icon"
                    />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
