//Sudipta's departures component will go here.
import React, { useState } from 'react';
import { useEffect} from "react";
import { useStore } from "../../hooks/useStore";
import { Transport, DepartureProps } from '../../types/departureinfo';
import { RESROBOT_API_KEY } from "../config.ts";


const DepartureInfo = ({ coordinates }: DepartureProps) => {
  const [DepartureData, setDepartureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let stateCoordinates = useStore((state) => state.coordinates);
  const [transportData, setTransportData] = useState<Transport[]>([]); // Stores fetched transport data
  

  
  
  useEffect(() =>{      
    const fetchNearestStation = async () => {
    const API_KEY = RESROBOT_API_KEY;
  try {
      const response = await fetch(
          `https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${stateCoordinates?.latitude}&originCoordLong=${stateCoordinates?.longitude}&format=json&accessId=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("Fel vid hämtning av data");
      }

      const currentData = await response.json();
      const stations = currentData.stopLocationOrCoordLocation || [];
      if (stations.length > 0) {
          const nearestStation = stations[0].StopLocation.extId;
          console.log("Nearest Station", nearestStation)
        //   fetchDepartureData(nearestStation.extId); // Fetch transport data for the nearest station
        //   console.log(nearestStation.extId);
      } else {
          setError("No station found in your area."); // Set error if no stations are found
      }
  } catch (err) {
      console.error("Error fetching nearest station:", err);
      setError("Failed to fetch station data."); // Handle errors during API call
  }
};
/* const fetchDepartureData = async (stationId: number | string) => {
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
       
        }*/
  if (coordinates) {
   fetchNearestStation();
} else {
    /*----- Fallback to loading state if no coordinates are provided -----*/
    setLoading(true);
  }   
    }, [coordinates]);

        //test
      
  return (
    <div className="p-4">
      <h2 className="transport-departure">Transport Departure</h2>
      
            {/* Display user's location if available */}
            {location && <p>Your Location: {location.lat}, {location.lon}</p>}

            {/* Show loading message while fetching data */}
            {loading && <p>Loading transport data...</p>}

            {/* Display error message if there's an issue */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Render transport data in a table */}
            {transportData.length > 0 && (
            <table className="transport-table " >
                <thead>
                    <tr className="inside-table ">
                        <th className="row-heading">Transport</th>
                        <th className="row-heading">Mode</th>
                        <th className="row-heading">From</th>
                        <th className="row-heading">Departure Time</th>
                        <th className="row-heading">Destination</th>
                        <th className="row-heading">Track</th>
                    </tr>
                </thead>
                <tbody>
                    {transportData.map((transport, index) => (
                    <tr key={index} className="data-table">
                        <td className="transport-name">{transport.name}</td>
                        <td className="transport-productAtStop-catcode">{transport.ProductAtStop.catCode}</td>
                        <td className="transport-stop">{transport.stop}</td>
                        <td className="transport-time">{transport.time}</td>
                        <td className="transport-direction">{transport.direction}</td>
                        <td className="transport-ProductAtStop-line">{transport.ProductAtStop.line || "N/A"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        )}
        </div>
   
  );
};

export default DepartureInfo;



