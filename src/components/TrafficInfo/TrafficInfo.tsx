import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import "./TrafficInfo.css";
import { TrafficProps } from "../../types/coordinates";
import { IncidentData } from "../../types/trafficinfo";

const TrafficInfo = ({ coordinates }: TrafficProps) => {
    const [situation, setSituation] = useState<IncidentData[]>([]);
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
                                <NEAR name="Deviation.Geometry.WGS84" value="${longitude} ${latitude}"/>
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
                const returnedSituations = response.RESPONSE.RESULT[0].Situation || [];
                let incidents = returnedSituations.map(({ PublicationTime, ModifiedTime, Deviation }) => ({
                    Publication: PublicationTime,
                    Modified: ModifiedTime,
                    Deviation: Deviation.map(({ 
                        Id,
                        IconId,
                        Message,
                        MessageCode,
                        NumberOfLanesRestricted,
                        SeverityText,
                        LocationDescriptor,
                        TrafficRestrictionType,
                        EndTime
                     }) => ({
                            DeviationId: Id,
                            Icon: IconId,
                            Message: Message,
                            MessageCode: MessageCode,
                            RestrictedLanes: NumberOfLanesRestricted,
                            RestrictionType: TrafficRestrictionType, 
                            Severity: SeverityText,
                            LocationDescription: LocationDescriptor,
                            EndTime: EndTime
                     }))
                }));
            
                setSituation(prevIncidents => [...prevIncidents, ...incidents]);
                setLoading(false);
                console.log(incidents);
            } catch (error) {
                setLoading(false);
                console.error(error);
            }
        };

        if (stateCoordinates?.latitude && stateCoordinates?.longitude) {
            fetchInfo(stateCoordinates.longitude, stateCoordinates.latitude);
        } else {
            setLoading(true);
        }}, [stateCoordinates]);
      
        if (loading) {
          return (
            <div className="traffic-content loading">Loading traffic data...</div>
          );
        }

  return (
        <div className="traffic-content">
        <h3>Traffic Updates</h3>
        {situation.map((incident, index) => (
            <div key={index} className="traffic-content-grid">
                <div className="incident-published">Published {incident.Publication}</div>
                <div className="incident-modified">Modified {incident.Modified}</div>
                {incident.Deviation.map((deviation, devIndex) => (
                    <div key={devIndex} className="deviation-row">
                        <div className="incident-icon">{deviation.Icon}</div>
                        <div className="incident-icon">Severity {deviation.Severity}</div>
                        <div className="incident-icon">Category {deviation.MessageCode}</div>
                        <div className="incident-icon">Message {deviation.Message}</div>
                        <div className="incident-icon">End Time {deviation.EndTime}</div>
                    </div>
                ))}
            </div>
        ))}
        </div>
  )
}

export default TrafficInfo
