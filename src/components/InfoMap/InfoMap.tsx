import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import { useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./InfoMap.css";

const UpdateMap = ({ center }) => {
    const locationMap = useMap();

    useEffect(() => {
        if (center) {
            locationMap.setView(center, locationMap.getZoom());
        }
    }, [center, locationMap]);
    return null;
};

const InfoMap = () => {
    let stateCoordinates = useStore((state) => state.coordinates);
    const centerMap = [stateCoordinates?.latitude, stateCoordinates?.longitude];
    return (
        <MapContainer id="map" center={centerMap} 
        zoom={16} scrollWheelZoom={true}>
            <UpdateMap center ={centerMap} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <Marker position={centerMap}>
                    <Popup>You are here.</Popup>
                </Marker>
        </MapContainer>
  )
}

export default InfoMap;