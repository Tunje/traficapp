import React from 'react';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import L from "leaflet";
import { useStore } from "../../hooks/useStore.tsx";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./InfoMap.css";
import {UpdateMapProps, InfoMapProps} from "../../types/infomap.ts"

const UpdateMap: React.FC<UpdateMapProps> = ({ center }) => {
    const locationMap = useMap();
    
    useEffect(() => {
        if (center) {
            locationMap.setView(center, locationMap.getZoom());
        }
    }, [center, locationMap]);
    return null;
};

const InfoMap: React.FC<InfoMapProps> = ({ signage }) => {
    const stateCoordinates = useStore((state) => state.coordinates);
    const centerMap: [number, number] = [
        stateCoordinates?.latitude ?? 0, 
        stateCoordinates?.longitude?? 0];
    
    return (
        <MapContainer id="map" center={centerMap} 
        zoom={15} scrollWheelZoom={true}>
            <UpdateMap center ={centerMap} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> bidragsgivare'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {signage.length > 0 && signage.map((marker, index) => {
            return (
                <Marker key={marker.key || `marker-${index}`}
                    position={[marker.mapCoordinates[1], marker.mapCoordinates[0]]} 
                    icon={new L.Icon({
                        iconUrl: `/sev${marker.severityCode}_warning.svg`, 
                        iconSize: [36, 36], 
                        iconAnchor: [12, 41],
                        popupAnchor: [-3, -76]
                    })}>
                    <Popup>
                        <div className="popup-info">
                            <div className="popup-road-icons">
                                {marker.icons.map((icon: { iconUrl: string; popupLabel: string }, iconIndex: number) => (
                                    <div key={iconIndex}className="deviations__icon-code">
                                        <img src={icon.iconUrl} alt={marker.popupLabel} />
                                    <div className="deviations__messagecode">
                                        {icon.popupLabel}
                                    </div>
                                    </div>
                                ))}
                            </div>
                        {marker.popupMessage == "undefined" ? `` : `${marker.popupMessage}`}
                        </div>
                        </Popup>
                </Marker>
                )}
            )}
            <Marker position={centerMap}>
                <Popup>Du är här.</Popup>
            </Marker>
        </MapContainer>
  )
};

export default InfoMap;