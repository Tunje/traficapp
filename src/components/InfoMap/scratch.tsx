import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import "leaflet/dist/leaflet.css";
import "./InfoMap.css";
import L from "leaflet";

const AddMarkers = ({ signage }) => {
    const locationMap = useMap(); // Ensure useMap is imported and used inside MapContainer

    useEffect(() => {
        if (locationMap && signage.length > 0) {
            signage.forEach((marker) => {
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

    return null; // No UI elements, just adds markers
};

const InfoMap = ({ signage }) => {
    let stateCoordinates = useStore((state) => state.coordinates);
    const centerMap = [stateCoordinates?.latitude, stateCoordinates?.longitude];

    return (
        <MapContainer id="map" center={centerMap} zoom={16} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={centerMap}>
                <Popup>You are here.</Popup>
            </Marker>
            {/* <AddMarkers signage={signage} /> */}
        </MapContainer>
    );
};

export default InfoMap;
