import "./DepartureInfo.css";
import React, { useState, useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { Coordinates } from "../../types/coordinates";
import { IncomingApiData, TransportItem, NoDepartures } from '../../types/departureinfo';


const DepartureInfo: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const stateCoordinates = useStore<Coordinates>((state) => state.coordinates);
  const [transportData, setTransportData] = useState<TransportItem[] | NoDepartures>([]);
  
  useEffect(() => {
      const fetchDepartureData = async () => {
          if(!stateCoordinates) {
              setError("No Coordinates");
              return null;
          }
          setLoading(true);
          setError(null);
          try {
              const response = await fetch(
                  `http://localhost:3000/api/departure-info?latitude=${stateCoordinates.latitude}&longitude=${stateCoordinates.longitude}`
              );
              if (!response.ok) {
                  throw new Error("Fel vid hämtning av data");
              }
              const departureData = await response.json();
              console.log(departureData);
              if ("NoDepartures" in departureData) {
                const noDeparturesMessage: NoDepartures = departureData;
                setTransportData(noDeparturesMessage)
                setLoading(false);
              }
              else if (departureData) {
                const categoryMap = {
                    "train": [1, 2, 4],
                    "bus": [3, 7],
                    "subway": [5],
                    "tram": [6],
                    "ferry": [7],
                    "taxi": [9]
                };
                const getCategory = (catCode: number) => {
                    const numberedCat = Number(catCode);
                    const category = Object.entries(categoryMap).find(([key, values]) => 
                        values.includes(numberedCat))
                    return category ? category[0] : null;
                };

                //go into object, find array with the same int as catCode, and return the key that contains that array.
                const departureItems = departureData.map(({
                    Product, 
                    name, 
                    direction, 
                    time,
                    stop, 
                    Notes, 
                    rtTrack }: IncomingApiData): TransportItem => ({
                    StationName: stop,
                    TransportOperator: Product[0].operator,
                    Category: getCategory(Product[0].catCode),
                    TransportItem: name,
                    Direction: direction,
                    DepartureTime: time.slice(0,5),
                    TrainNotes: (Notes?.Note
                        .map(({ value }) => (value)) 
                        .filter(value => !["EU förordning", "Lag", "tillämpas"].some(word => value.includes(word)))),
                    TrainTrack: rtTrack 
                }));
                console.log(departureItems)
                setTransportData(departureItems);
                setLoading(false);
              } else {
                  setError("No station found in your area."); 
              }
          } catch (err) {
              console.error("Error fetching nearest station:", err);
              setError("Failed to fetch station data."); 
              setLoading(false);
          }}
          
          if (stateCoordinates) {
            fetchDepartureData();
          };
  }, [stateCoordinates]);

    if (loading || error) {
        return (
        <div className="departure-content">
            <h3>Transport avgår</h3>
            <div className="loading">
            {error ? `Error: ${error}` : "Läddar data..."}
            </div>
        </div>
        );
    };

    const departuresCheck = (transportData: any): transportData is NoDepartures => {
        return "NoDepartures" in transportData;
    };

    if (departuresCheck(transportData)) {
        return (
            <div className="departure-content">
                <h3>Transport avgår</h3>
                <div className="no-departures">
                    {transportData.NoDepartures}
                </div>
        </div>
        )
    }

  return (
    <div className="departure-content">
      <h3>Transport avgår</h3>
            {transportData.length > 0 && (
            <div className="transport-grid">
                <div className="transport-grid__origin-station">
                från {transportData[0].StationName}</div>
                    <div className="transport-header">
                        <div className="transport-header__heading">Operatör</div>
                        <div className="transport-header__heading">Transporttyp</div>
                        <div className="transport-header__heading">Destination</div>
                        <div className="transport-header__heading">Avgår</div>
                    </div>
                <div className="transport-grid-body">
                    {transportData.map((transport, index) => (
                    <div key={index} className="transport-listing">
                        <div className="transport-listing__info">
                            <div className="transport-listing__cell--type">
                                <img className="transport-icon" src={`public/transport-icons/${transport.Category}.svg`} />
                                {transport.TransportItem}
                            </div>
                            <div className="transport-listing__cell">
                                {transport.TransportOperator}
                            </div>
                            <div className="transport-listing__cell">
                                {transport.Direction}
                            </div>
                            <div className="transport-listing__cell">
                                {transport.DepartureTime}<br />
                                <strong>
                                {transport.TrainTrack !== undefined ?  
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
                    </div>
                ))}
                </div>
            </div>
        )}
        </div>
   
  );
};

export default DepartureInfo;