import React from "react";
import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import "./TrafficInfo.css";
import { IncidentData, DeviationApiData, IncidentDeviationData, RawSignageItem, SignageItem, SituationApiData } from "../../types/trafficinfo";
import { Coordinates } from "../../types/coordinates";
import InfoMap from "../InfoMap/InfoMap";

const TRAFIKVERKET_API_KEY = import.meta.env.VITE_TRAFIKVERKET_API_KEY;
const trafikverketUrl = `https://api.trafikinfo.trafikverket.se/v2/data.json`;

const TrafficInfo = () => {
    const [situation, setSituation] = useState<IncidentData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [mapSignage, setMapSignage] = useState<SignageItem[]>([]);
    const stateCoordinates = useStore((state) => state.coordinates) as Coordinates;

    useEffect(() => {
        const fetchInfo = async (longitude: number, latitude: number) => {
        const requestBody = `<REQUEST>
                        <LOGIN authenticationkey="${TRAFIKVERKET_API_KEY}"/>
                        <QUERY objecttype="Situation" schemaversion="1" limit="5">
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
                    throw new Error("Trafik info förfrågan misslyckad.");
                };

                const response = await result.json();
                const returnedSituations = response.RESPONSE.RESULT[0].Situation || [];

                const formattedDate = (timestamp: string): string => {
                    if (!timestamp) return "N/A";
                    const date = timestamp.slice(0,10);
                    const time = timestamp.slice(11,16);
                    return (`${date} ${time}`)};
                    const incidents: IncidentData[] = returnedSituations.map(
                        ({ PublicationTime, ModifiedTime, Deviation }: SituationApiData): IncidentData => ({
                          Publication: formattedDate(PublicationTime),
                          Modified: formattedDate(ModifiedTime),
                          Deviation: Deviation.map(
                            ({
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
                              EndTime,
                            }: DeviationApiData): IncidentDeviationData => ({
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
                              EndTime: formattedDate(EndTime),
                            })
                          ),
                        })
                      );
                      
                setSituation(incidents);
                setLoading(false);
                    //format geometry for map marker coordinates
                const cleanGeometry = (string: string): [number, number] | null => {
                    const matchTo = new RegExp(/([-+]?\d{2}\.\d{2})/g);
                    const matchedFloat = string.match(matchTo);
                    if (matchedFloat) {
                        const mapCoords: [number, number] = [
                            parseFloat(matchedFloat[0]),
                            parseFloat(matchedFloat[1])
                        ];
                        return mapCoords;
                    } return null};

                const signageArray: RawSignageItem[] = incidents.map((incident: IncidentData, mapIncidentIndex: number) => ({
                    key: `infomap-${mapIncidentIndex}`,
                    popupLabel: `${incident.Deviation[0].MessageCode}`,
                    popupMessage: `${incident.Deviation[0].Message}`,
                    severityCode: incident.Deviation[0].SeverityCode,
                    EndDate: incident.Deviation[0].EndTime,
                    mapCoordinates: cleanGeometry(`${incident.Deviation[0].Geometry}`),
                    icons: incident.Deviation
                        .filter((deviation, mapDevIndex, arraySelf) => mapDevIndex === arraySelf.findIndex(
                        d => d.MessageCode === deviation.MessageCode))
                        .map((deviation, devIconIndex) => ({
                            popupLabel: `${deviation.MessageCode}`,
                            index: `mapIcon-${devIconIndex}`,
                            iconUrl: `https://api.trafikinfo.trafikverket.se/v2/icons/data/road.infrastructure.icon/${deviation.Icon}`})
                        )}));

                        const flatArray: SignageItem[] = signageArray.flat().filter(
                            (signage)  => signage.mapCoordinates !== null) 
                            .map((signage) => ({
                                ...signage,
                                mapCoordinates: signage.mapCoordinates as [number, number]
                            }));
                        setMapSignage(flatArray);
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
        }, [mapSignage]);        

   
        if (loading) {
          return (
            <div className="traffic-content">
                <h3>Trafik hinder</h3>
                Laddar trafik data...
            </div>
          );
        }

  return (
        <div className="traffic-content">
        <h3>Trafik hinder</h3>
        <div className="traffic-content__grid">
        <div className="traffic-content__deviations">
        {situation.map((incident, index) => (
            <React.Fragment key={index}>

                    <div className={`deviations__incident-header severity-${incident.Deviation[0].SeverityCode}`}>
                            <div className={`severity`}>
                                {incident.Deviation[0].Severity}
                            </div>
                            <div className="deviations__last-update">Senast uppdatering: {incident.Modified}</div>
                            <div className="deviations__end">Slutar: {incident.Deviation[0].EndTime}</div>
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
