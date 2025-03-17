import React from "react";
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
                                <NEAR name="Deviation.Geometry.WGS84" value="${encodeURIComponent(longitude)} ${encodeURIComponent(latitude)}"/>
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

                const formattedDate = (timestamp: string): string => {
                    if (!timestamp) return "N/A";
                    let date = timestamp.slice(0,10);
                    let time = timestamp.slice(11,16);
                    return (`${date} ${time}`)};
                    let incidents = returnedSituations.map(({ PublicationTime, ModifiedTime, Deviation }) => ({
                        Publication: formattedDate(PublicationTime),
                        Modified: formattedDate(ModifiedTime),
                        Deviation: Deviation.map(({ 
                            Id,
                            IconId,
                            Message,
                            MessageCode,
                            NumberOfLanesRestricted,
                            SeverityCode,
                            SeverityText,
                            PositionalDescription,
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
                                PositionalDescription: PositionalDescription,
                                SeverityCode: SeverityCode === undefined ? 1 : SeverityCode, 
                                Severity: SeverityText === undefined ? "Ingen påverkan" : SeverityText,
                                LocationDescription: LocationDescriptor,
                                EndTime: formattedDate(EndTime)
                        }))
                    }));
                setSituation(incidents);
                setLoading(false);
                console.log("Deviations", incidents);
            } catch (error) {
                setLoading(false);
                console.error(error);
            }
        };
        console.log("situation", situation)
        if (stateCoordinates?.latitude && stateCoordinates?.longitude) {
            fetchInfo(stateCoordinates.longitude, stateCoordinates.latitude);
        } else {
            setLoading(true);
        }}, [stateCoordinates]);
      
        if (loading) {
          return (
            <div className="traffic-content">
                <h3>Traffic Updates</h3>
                Loading traffic data...
            </div>
          );
        }

  return (
        <div className="traffic-content">
        <h3>Traffic Updates</h3>
        <div className="traffic-content__grid">
        <div className="traffic-content__deviations">
        {situation.map((incident, index) => (
            <React.Fragment key={index}>

                    <div className="deviations__incident-header">
                            <div className={`severity-${incident.Deviation[0].SeverityCode}`}>
                                {incident.Deviation[0].Severity}
                            </div>
                            <div className="deviations__last-update">Senast uppdaterad: {incident.Modified}</div>
                            <div className="deviations__last-update">Slutar: {incident.Deviation[0].EndTime}</div>
                        </div>
                            <div className="deviations__signs">
                            {incident.Deviation.map((deviation, devIconIndex) => (
                                <div key={`${index}-${devIconIndex}`} className="deviations__icon-code">
                                    <img className="deviations__icon" src={`https://api.trafikinfo.trafikverket.se/v2/icons/data/road.infrastructure.icon/${deviation.Icon}`} alt={`                                    {deviation.MessageCode}`} />
                                    <span className="deviations__messagecode">{deviation.MessageCode}
                                    </span>
                                </div>
                                //If there are restricted lanes, show them inline here.
                            ))}
                        </div>
                        <div className="deviation__description">
                            {incident.Deviation[0].LocationDescription}. {incident.Deviation[0].Message}
                        </div>
            </React.Fragment>
        ))}
        </div>
        <div className="traffic-content__map">
            Map Here.
        </div>                   
        </div>
        </div>
  )
}

export default TrafficInfo
