import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import "./TrafficInfo.css";
import { IncidentData, DeviationApiData, IncidentDeviationData, RawSignageItem, SignageItem, SituationApiData } from "../../types/trafficinfo";
import { Coordinates } from "../../types/coordinates";
import InfoMap from "../InfoMap/InfoMap";

const TrafficInfo: React.FC = () => {
    const [situation, setSituation] = useState<IncidentData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [mapSignage, setMapSignage] = useState<SignageItem[]>([]);
    const stateCoordinates = useStore<Coordinates>((state) => state.coordinates);

    useEffect(() => {
        const fetchInfo = async (longitude: number, latitude: number) => {
            try {
                const result = await fetch(`http://localhost:3000/api/traffic?latitude=${latitude}&longitude=${longitude}`);

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
            <h3>Trafikhinder</h3>
            <div className="traffic-content__grid">
                <div className="traffic-content__map">
                    <InfoMap signage={mapSignage} />
                </div>                   
            <div className="traffic-content__deviations">
            {situation.map((incident, index) => (
                <div className="deviations-item" key={index}>
                        <div className={`deviations__incident-header`}>
                                <div className="severity">
                                    <span className={`severity-bumper severity-${incident.Deviation[0].SeverityCode}`}>
                                    {incident.Deviation[0].Severity}
                                    </span>
                                </div>
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
                            <div className="deviations__times">
                                <div className="deviations__last-update"><strong>Senast uppdatering:</strong> {incident.Modified}</div>
                                <div className="deviations__end"><strong>Slutar:</strong> {incident.Deviation[0].EndTime}</div>
                            </div>
                </div>
            ))}
            </div>
        </div>
    </div>
  )
}

export default TrafficInfo
