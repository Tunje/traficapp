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
                DepartureTime: time.slice(0,5),
                TrainNotes: (name.includes("Tåg") ? 
                    Notes.Note
                    .map(({ value }) => (value)) 
                    .filter(value => !["EU förordning", "Lag", "tillämpas"].some(word => value.includes(word)))
                    : ""),
                TrainTrack: (name.includes("Tåg") ? rtTrack : "")
            }));
            setTransportData(departureItems);
            console.log(incomingDepartures)
            console.log(departureItems)
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
    <div className="departure-content">
      <h3>Transport Departures</h3>

            {transportData.length > 0 && (
            <div className="transport-grid">
                    <div className="transport-header">
                        <div className="transport-header__heading">Operator</div>
                        <div className="transport-header__heading">Transport</div>
                        <div className="transport-header__heading">Destination</div>
                        <div className="transport-header__heading">Departs</div>
                    </div>
                <div className="transport-grid-body">
                    {transportData.map((transport, index) => (
                    <div key={index} className="transport-listing">
                        <div className="transport-listing__cell">
                            {transport.TransportOperator}
                        </div>
                        <div className="transport-listing__cell">
                            {transport.TransportItem}
                        </div>
                        <div className="transport-listing__cell">
                            {transport.Direction}
                        </div>
                        <div className="transport-listing__cell">
                            {transport.DepartureTime}<br />
                            <strong>{transport.TrainTrack !== "" ? 
                            `Spår ${transport.TrainTrack}` : ""}</strong>
                        </div>
                        <div className="transport-listning__train-notes">
                            {Array.isArray(transport.TrainNotes) ? (
                                transport.TrainNotes
                                .filter((note, index, arraySelf) => index === arraySelf.findIndex(n => n === note))
                                .map((note, index, arraySelf) => (
                                <ul className="transport-listing__cell-train-note" key={index}>
                                    <li>{note}
                                        {index < arraySelf.length -1 && ","}
                                    </li>
                                </ul>))
                            ) : ""}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        )}
        </div>
   
  );
};

export default DepartureInfo;