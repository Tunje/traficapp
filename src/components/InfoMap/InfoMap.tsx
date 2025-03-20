import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import { useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./InfoMap.css";
import L from "leaflet";
import React from 'react';
import HeartIcon from "./heart.svg";


const UpdateMap = ({ center, signage }) => {
    const locationMap = useMap();
    
    useEffect(() => {
        if (center) {
            locationMap.setView(center, locationMap.getZoom());
        }
    }, [center, locationMap]);
    return null;
};

// const AddMapSignage = ({ signage }) => {
//     const locationMap = useMap();

//     useEffect(() => {
//         if (locationMap && signage.length > 0) {
//             signage.map((marker) => {
//                 <React.Fragment key={marker.key}>
//                 <Marker position={marker.coordinates} icon={new L.Icon({
//                     iconUrl: marker.iconUrl, 
//                     iconSize: [36, 36], 
//                     iconAnchor: [12, 41],
//                     popupAnchor: [-3, -76]})
//                     } >
//                     <Popup>{marker.popupLabel}: {marker.popupMessage}</Popup>
//                 </Marker>
//                 </React.Fragment>
//             });
//         }
//     }, [locationMap, signage]);
//     return null;
// };


const InfoMap = ({ signage }) => {
    console.log("Passed signage prop:", signage)
    const stateCoordinates = useStore((state) => state.coordinates);
    const centerMap = [stateCoordinates?.latitude, stateCoordinates?.longitude];
    
    return (
        <MapContainer id="map" center={centerMap} 
        zoom={20} scrollWheelZoom={true}>
            <UpdateMap center ={centerMap} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {signage.length > 0 && signage.map((marker) => (
                <Marker 
                    position={[marker.mapCoordinates[1], marker.mapCoordinates[0]]} 
                    icon={new L.Icon({
                        iconUrl: marker.iconUrl, 
                        iconSize: [36, 36], 
                        iconAnchor: [12, 41],
                        popupAnchor: [-3, -76]
                    })}>
                    <Popup>{marker.popupLabel}: {marker.popupMessage}</Popup>
                </Marker>
            ))}
            <Marker position={centerMap}>
                <Popup>You are here.</Popup>
            </Marker>
            
        </MapContainer>
  )
};

export default InfoMap;