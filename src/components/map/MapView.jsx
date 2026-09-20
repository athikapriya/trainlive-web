import { MapContainer, TileLayer } from "react-leaflet";

import MapControls from "./MapControls";
import UserLocation from "./UserLocation";

function MapView() {
    return (
        <MapContainer
            center={[23.8103, 90.4125]}
            zoom={11}
            minZoom={5}
            maxZoom={19}
            zoomControl={false}
            className="map"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />

            <UserLocation />

            <MapControls />
        </MapContainer>
    );
}

export default MapView;