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

                const formattedDate = (timestamp: string): string => {
                    let date = timestamp.slice(0,10);
                    let time = timestamp.slice(11,16);
                    return (`${date} ${time}`)};
                    //For all severity codes in all the Deviations, get the highest one, and return the severity text for that code. This goes into the Severity Ranking property in the top incident object

                    let incidents = returnedSituations.map(({ PublicationTime, ModifiedTime, Deviation }) => ({
                        Publication: formattedDate(PublicationTime),
                        Modified: formattedDate(ModifiedTime),
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
                                EndTime: formattedDate(EndTime)
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
        {situation.map((incident, index) => (
            <React.Fragment key={index}>
            <div className="traffic-content__grid">

                <div className="traffic-content__deviations">
                    <div className="deviations__incident-header">
                            {incident.Deviation.map((deviation, devIconIndex) => (
                                <div key={`${index}-${devIconIndex}`} className="deviations__icon-code">
                                    <img className="deviations__icon" src={`https://api.trafikinfo.trafikverket.se/v2/icons/data/road.infrastructure.icon/${deviation.Icon}`} alt={`                                    {deviation.MessageCode}`} />
                                    <span className="deviations__messagecode">{deviation.MessageCode}
                                    </span>
                                </div>
                            ))}
                            <div className="severity">{incident.Deviation[0].Severity} </div>
                            <div className="deviations__last-update">Last Updated: {incident.Modified}</div>
                        </div>
                </div>
            </div>                   
            </React.Fragment>
        ))}
        <div className="traffic-content__map">
            Map Here.
        </div>
        </div>
  )
}

export default TrafficInfo
