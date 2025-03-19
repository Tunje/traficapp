import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import { useEffect } from 'react';
import { useStore } from "../../hooks/useStore";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./InfoMap.css";
import L from "leaflet";


const UpdateMap = ({ center }) => {
    const locationMap = useMap();
    
    useEffect(() => {
        if (center) {
            locationMap.setView(center, locationMap.getZoom());
        }
    }, [center, locationMap]);
    return null;
};

const AddMapSignage = ({ signage }) => {
    const locationMap = useMap();

    useEffect(() => {
        if (locationMap && signage.length > 0) {
            signage.map((marker) => {
                const makeIcon = L.icon({
                    iconUrl: marker.iconUrl,
                    iconSize: [36, 36],
                    iconAnchor: [22, 94],
                    popupAnchor: [-3, -76]            
                });

                L.marker(marker.mapCoordinates, { icon: makeIcon })
                .bindPopup(`${marker.popupLabel}: ${marker.popupMessage}`)
                .addTo(locationMap);
            });
        }
    }, [locationMap, signage]);
    console.log(signage);
    return null;
};

const InfoMap = ({ signage }) => {
    const stateCoordinates = useStore((state) => state.coordinates);
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
                <AddMapSignage signage={signage} />
        </MapContainer>
  )
};

export default InfoMap;