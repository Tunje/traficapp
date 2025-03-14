import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { TrafficProps } from "../../types/coordinates";

const TrafficInfo = ({ coordinates }: TrafficProps) => {
    const [situation, setSituation] = useState(null);
    const [loading, setLoading] = useState(true);
    let stateCoordinates = useStore((state) => state.coordinates);

    const TRAFIKVERKET_API_KEY = import.meta.env.VITE_TRAFIKVERKET_API_KEY;
    const trafikverketUrl = `https://api.trafikinfo.trafikverket.se/v2/data.json`;

    useEffect(() => {
        const fetchInfo = async (longitude: number, latitude: number) => {
        const requestBody = `<REQUEST>
                        <LOGIN authenticationkey="${TRAFIKVERKET_API_KEY}"/>
                        <QUERY objecttype="Situation" schemaversion="1" limit="10">
                            <FILTER>
                                <NEAR name="Deviation.Geometry.WGS84" 
                                value="
                                ${longitude} 
                                ${latitude}
                                "/>
                            </FILTER>
                        </QUERY>
                        </REQUEST>`;
                        const headers: Headers = new Headers();
                        headers.set("Content-Type", "text/xml");
                        headers.set("Accept", "application/json");
            try {
                const result = await fetch(
                    `${trafikverketUrl}`,
                    {
                        method: "POST",
                        headers: headers,
                        body: requestBody
                    }
                );

                if (!result.ok) {
                    throw new Error("Traffic info request failed.");
                };

                const response = await result.json();
                const returnedSituations = response.RESPONSE?.RESULT?.[0]?.Situation || [];
                setSituation(returnedSituations);
                setLoading(false);
            } catch (error) {
                throw new Error("Error in fetch");
                setLoading(false);
            }
        };

        if (stateCoordinates?.latitude && stateCoordinates?.longitude) {
            fetchInfo(stateCoordinates.longitude, stateCoordinates.latitude);
        } else {
            setLoading(true);
        }
    }, [stateCoordinates]);
      
        if (loading) {
          return (
            <div className="weather-container loading">Loading traffic data...</div>
          );
        }

  return (
    <div>Your current traffic info:
        {JSON.stringify(situation)}
    </div>
  )
}

export default TrafficInfo
