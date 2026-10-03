import { MapContainer, TileLayer } from "react-leaflet";

import MapControls from "./MapControls";
import UserLocation from "./UserLocation";
import FlyToStation from "./FlyToStation";
import StationMarker from "./StationMarker";
import LiveUserMarkers from "./LiveUserMarkers";
import LiveTrainRoute from "./LiveTrainRoute";
import FlyToLiveLocation from "./FlyToLiveLocation";

function MapView({
    selectedStation,
    selectedTrainStation,
    liveUsers,
    ownLiveLocation,
    showLive,
    isSharing,
    liveTrainRoute,
}) {
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

            <FlyToLiveLocation users={liveUsers} ownLiveLocation={ownLiveLocation} enabled={showLive || isSharing} />

            {liveTrainRoute && <LiveTrainRoute route={liveTrainRoute} />}

            {mapStation && <StationMarker station={mapStation} />}

            {showLive && <LiveUserMarkers users={liveUsers} />}

            {isSharing &&
                ownLiveLocation &&
                typeof ownLiveLocation.latitude === "number" &&
                typeof ownLiveLocation.longitude === "number" && (
                    <LiveUserMarkers
                        users={[
                            {
                                session_id: "own-live-location",
                                latitude: ownLiveLocation.latitude,
                                longitude: ownLiveLocation.longitude,
                                accuracy: ownLiveLocation.accuracy,
                                speed: ownLiveLocation.speed,
                            },
                        ]}
                    />
                )}

            <MapControls />
        </MapContainer>
    );
}

export default MapView;