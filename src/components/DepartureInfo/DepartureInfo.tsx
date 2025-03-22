//Sudipta's departures component will go here.
import React, { useState } from 'react';
import { useEffect} from "react";
import { useStore } from "../../hooks/useStore";

type Location = {
  lat: number;
  lon: number;
};

type Transport = {
  ProductAtStop: any;  
  name: string; // Transport name (e.g., train number or bus route)
  time: string; // Departure time
  direction: string; // Direction of travel
  track?: string; // Track information (optional)
  stop: string; // Stop name
};


const DepartureInfo = ({ coordinates }) => {
  const [DepartureData, setDepartureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let stateCoordinates = useStore((state) => state.coordinates);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null); // Stores user's location
  const [transportData, setTransportData] = useState<Transport[]>([]); // Stores fetched transport data
  

  const API_KEY = `9ddd8ace-4853-44ee-955e-4a1c4bda39f3`;
  const API_URL = `https://api.resrobot.se/v2.1/location.name?`;

  

  useEffect(() => {

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              setLocation({ lat, lon }); // Save user location
              fetchNearestStation(lat, lon); // Fetch nearest station based on user's location
          },
          (error) => {
              console.error("Error getting location:", error);
              setError("Failed to get location."); // Set error message if geolocation fails
          }
      );
  } else {
      setError("Geolocation is not supported by your browser."); // Inform the user if geolocation is unavailable
  }
}, []);
    
const fetchNearestStation = async (lat: number, lon: number) => {
  try {
      const apiKey = `9ddd8ace-4853-44ee-955e-4a1c4bda39f3`; // API key for authentication
      const response = await axios.get(
          `https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${lat}&originCoordLong=${lon}&format=json&accessId=${apiKey}`
      );

      const stations = response.data.stopLocationOrCoordLocation || [];
      if (stations.length > 0) {
          const nearestStation = stations[0].StopLocation;
          fetchDepartureData(nearestStation.extId); // Fetch transport data for the nearest station
          console.log(nearestStation.extId);
      } else {
          setError("No station found in your area."); // Set error if no stations are found
      }
  } catch (err) {
      console.error("Error fetching nearest station:", err);
      setError("Failed to fetch station data."); // Handle errors during API call
  }
};
const fetchDepartureData = async (stationId: number | string) => {
  try {
      setLoading(true); // Set loading state while fetching data
      const apiKey = `9ddd8ace-4853-44ee-955e-4a1c4bda39f3`;;
      const duration = 30; // Time duration to fetch upcoming departures
      const journey = 5; // Max number of journeys to fetch
      const products = 412; // Type of transport services included
      const response = await axios.get(
          `https://api.resrobot.se/v2.1/departureBoard?id=${stationId}&format=json&accessId=${apiKey}&products=${products}&maxJourneys=${journey}&duration=${duration}`
      );
      setTransportData(response.data.Departure || []); // Store fetched transport data
  } catch (err) {
      console.error("Error fetching transport data:", err);
      setError("Failed to fetch transport data."); // Handle errors
  } finally {
      setLoading(false); // Reset loading state once request completes
  }
      
        };

        //test
      
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transport Departure</h2>
      
            {/* Display user's location if available */}
            {location && <p>Your Location: {location.lat}, {location.lon}</p>}

            {/* Show loading message while fetching data */}
            {loading && <p>Loading transport data...</p>}

            {/* Display error message if there's an issue */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Render transport data in a table */}
            {transportData.length > 0 && (
            <table className="w-full border-collapse border border-gray-300 " >
                <thead>
                    <tr className="bg-gray-200 ">
                        <th className="border border-gray-300 px-4 py-2">Transport</th>
                        <th className="border border-gray-300 px-4 py-2">Mode</th>
                        <th className="border border-gray-300 px-4 py-2">From</th>
                        <th className="border border-gray-300 px-4 py-2">Departure Time</th>
                        <th className="border border-gray-300 px-4 py-2">Destination</th>
                        <th className="border border-gray-300 px-4 py-2">Track</th>
                    </tr>
                </thead>
                <tbody>
                    {transportData.map((transport, index) => (
                    <tr key={index} className="text-center border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{transport.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{transport.ProductAtStop.catCode}</td>
                        <td className="border border-gray-300 px-4 py-2">{transport.stop}</td>
                        <td className="border border-gray-300 px-4 py-2">{transport.time}</td>
                        <td className="border border-gray-300 px-4 py-2">{transport.direction}</td>
                        <td className="border border-gray-300 px-4 py-2">{transport.ProductAtStop.line || "N/A"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        )}
        </div>
   
  );
};

export default DepartureInfo;


export default DepartureInfo
