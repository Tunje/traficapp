import "./DepartureInfo.css";
import React, { useState, useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { TransportItem, DepartureProps } from '../../types/departureinfo';


const DepartureInfo = () => {
  const [loading, setLoading] = useState(true);
  const [stationCode, setStationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stateCoordinates = useStore((state) => state.coordinates);
  const [transportData, setTransportData] = useState([]);
  
  
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
                setStationCode(station); 
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
            const incomingDepartures = await response.json();
            const departureItems = incomingDepartures.map(({ 
                Product, name, direction, time, Notes, rtTrack }) => ({
                TransportOperator: Product[0].operator,
                TransportItem: name,
                Direction: direction,
                DepartureTime: time,
                TrainNotes: (name.includes("Tåg") ? Notes : null),
                TrainTrack: (name.includes("Tåg") ? rtTrack : null)
            }));
            setTransportData(departureItems);
            console.log(transportData)
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transport Departure</h2>

            {transportData.length > 0 && (
            <table className="w-full border-collapse border border-gray-300 " >
                <thead>
                    <tr className="transport-header">
                        <th className="transport-header__cell">Operator</th>
                        <th className="transport-header__cell">Transport Name</th>
                        <th className="transport-header__cell">Destination</th>
                        <th className="transport-header__cell">Departure Time</th>
                        <th className="transport-header__cell">Track</th>
                        <th className="transport-header__cell">Amenities</th>
                    </tr>
                </thead>
                <tbody>
                    {transportData.map((transport, index) => (
                    <tr key={index} className="transport-listing">
                        <td className="transport-listning__cell">{transport.TransportOperator}</td>
                        <td className="transport-listning__cell">{transport.TransportItem}</td>
                        <td className="transport-listning__cell">{transport.Direction}</td>
                        <td className="transport-listning__cell">{transport.DepartureTime}</td>
                        <td className="transport-listning__cell">{transport.TrainTrack}</td>
                        {/* <td className="transport-listning__cell">{transport.TrainNotes}</td> */}
                    </tr>
                ))}
                </tbody>
            </table>
        )}
        </div>
   
  );
};

export default DepartureInfo;