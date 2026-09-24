import {
    MapContainer,
    TileLayer,
} from "react-leaflet";

import MapControls from "./MapControls";
import UserLocation from "./UserLocation";
import FlyToStation from "./FlyToStation";
import StationMarker from "./StationMarker";


function MapView({ selectedStation, selectedTrainStation }) {
    const mapStation = selectedTrainStation || selectedStation;
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

            <FlyToStation station={mapStation} />

            {mapStation && (
                <StationMarker station={mapStation} />
            )}

            <MapControls />
        </MapContainer>
    );
}

export default MapView;