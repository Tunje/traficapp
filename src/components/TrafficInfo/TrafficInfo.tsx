import React from "react";
import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import "./TrafficInfo.css";
import { IncidentData } from "../../types/trafficinfo";
import InfoMap from "../InfoMap/InfoMap";

const TRAFIKVERKET_API_KEY = import.meta.env.VITE_TRAFIKVERKET_API_KEY;
const trafikverketUrl = `https://api.trafikinfo.trafikverket.se/v2/data.json`;

const TrafficInfo = () => {
    const [situation, setSituation] = useState<IncidentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapSignage, setMapSignage] = useState<any[]>([]);
    const stateCoordinates = useStore((state) => state.coordinates);


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
                    const date = timestamp.slice(0,10);
                    const time = timestamp.slice(11,16);
                    return (`${date} ${time}`)};
                    const incidents = returnedSituations.map(({ PublicationTime, ModifiedTime, Deviation }): IncidentData => ({
                        Publication: formattedDate(PublicationTime),
                        Modified: formattedDate(ModifiedTime),
                        Deviation: Deviation.map(({ 
                            Id,
                            IconId,
                            Message,
                            MessageCode,
                            NumberOfLanesRestricted,
                            Geometry,
                            SeverityCode,
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
                                Geometry: Geometry?.WGS84 || null,
                                SeverityCode: SeverityCode === undefined ? 1 : SeverityCode, 
                                Severity: SeverityText === undefined ? "Ingen påverkan" : SeverityText,
                                LocationDescription: LocationDescriptor,
                                EndTime: formattedDate(EndTime)
                        }))
                    }));
                setSituation(incidents);
                setLoading(false);
                    //format geometry for map marker coordinates
                const cleanGeometry = (string: string) => {
                    const matchTo = new RegExp(/([-+]?\d{2}\.\d{2})/g);
                    const matchedFloat = string.match(matchTo);
                    if (matchedFloat) {
                        const mapCoords = matchedFloat.map(float => parseFloat(parseFloat(float).toFixed(2)));
                        return mapCoords;
                    } return []};

                const signageArray = incidents.map(
                    (incident) => incident.Deviation.filter(
                        (deviation, index, arraySelf) => 
                            index === arraySelf.findIndex(d => d.MessageCode === deviation.MessageCode)).map(
                        (deviation, devIconIndex) => ({
                            key: `deviation-${devIconIndex}`,
                            iconUrl: `https://api.trafikinfo.trafikverket.se/v2/icons/data/road.infrastructure.icon/${deviation.Icon}`,
                            popupLabel: `${deviation.MessageCode}`,
                            popupMessage: `${deviation.Message}`,
                            mapCoordinates: cleanGeometry(`${deviation.Geometry}`)
                        })));
                        const flatArray = signageArray.flat().filter((signage) => signage.mapCoordinates.length > 0);
                        setMapSignage(flatArray);
                        // console.log("Deviations", incidents);
                        // console.log("Signage Array", signageArray);
                        // console.log("flat Signage Array", flatArray);
                        console.log("Map Markers", mapSignage);
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
        useEffect(() => {
            console.log("Updated Map Markers:", mapSignage);
        }, [mapSignage]);        

   
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
                            {incident.Deviation.filter((deviation, index, arraySelf) => index === arraySelf.findIndex(d => d.MessageCode === deviation.MessageCode))
                            .map((deviation, devIconIndex) => (
                                <div key={`${index}-${devIconIndex}`} className="deviations__icon-code">
                                    <img className="deviations__icon" src={`https://api.trafikinfo.trafikverket.se/v2/icons/data/road.infrastructure.icon/${deviation.Icon}`} alt={`${deviation.MessageCode}`} />
                                    <span className="deviations__messagecode">{deviation.MessageCode}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="deviation__description">
                            {incident.Deviation[0].LocationDescription}. {incident.Deviation[0].Message}
                        </div>
                        {incident.Deviation[0].RestrictionType == undefined ? "" : <div className="deviation__restricted-lanes">{incident.Deviation[0].RestrictionType}: {incident.Deviation[0].RestrictedLanes}</div> }

            </React.Fragment>
        ))}
        </div>

        <div className="traffic-content__map">
        <InfoMap signage={mapSignage} />
        </div>                   
        </div>
        </div>
  )
}

export default TrafficInfo
