import "./DepartureInfo.css";
import React, { useState, useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { Transport, DepartureProps } from '../../types/departureinfo';


const DepartureInfo = () => {
  const [DepartureData, setDepartureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stationCode, setStationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stateCoordinates = useStore((state) => state.coordinates);
  const [transportData, setTransportData] = useState<Transport[]>([]);
  
  
    const fetchNearestStation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:3000/api/station-location?latitude=${stateCoordinates.latitude}&longitude=${stateCoordinates.longitude}`
            );
            if (!response.ok) {
                throw new Error("Fel vid hämtning av data");
            }
            const station = await response.json();
            if (station) {
                console.log("Station ID", station);
                setStationCode(station.toString()); 
                return station;
            } else {
                setError("No station found in your area."); 
                return null;
            }
        } catch (err) {
            console.error("Error fetching nearest station:", err);
            setError("Failed to fetch station data."); 
        }};

    const fetchDepartureData = async () => {
        let station = await fetchNearestStation();
        try {
            const response = await fetch(`http://localhost:3000/api/departure-info?stationId=${station}`);
            if (!response.ok) {
                throw new Error("Fel vid hämtning av data");
            }
            const departureData = await response.json();
            console.log("Departure Data", departureData);
    
        } catch (err) {
            console.error("Error fetching transport data:", err);
            setError("Failed to fetch transport data.");
        }};

  useEffect(() => {
    if (!stateCoordinates) return;

        const fetchAllDepartureInfo = async () => {
            try {
                setLoading(true);
                await fetchDepartureData();
            } catch (error) {
                console.error("Error", error)
            } finally {
                setLoading(false);
            }
        };

        fetchAllDepartureInfo();
    }, [stateCoordinates]);

    // useEffect(() => {
    //     if (!stationCode) return;

    //     const fetchDepartureDataEffect = async () => {
    //         try {
    //             setLoading(true);
    //             await fetchDepartureData(stationCode);
    //         } catch (error) {
    //             console.error("Error", error)
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    // }, [stationCode]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transport Departure</h2>

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