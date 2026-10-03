import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MdTrain } from "react-icons/md";
import { renderToStaticMarkup } from "react-dom/server";

function createLiveTrainIcon() {
    return L.divIcon({
        className: "live-train-marker",
        html: renderToStaticMarkup(
            <div className="live-train-marker-icon">
                <MdTrain />
            </div>
        ),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });
}

function LiveUserMarkers({ users = [] }) {
    const icon = createLiveTrainIcon();

    return (
        <>
            {users.map((user) => {
                if (typeof user.latitude !== "number" || typeof user.longitude !== "number") {
                    return null;
                }

                return (
                    <Marker key={user.session_id} position={[user.latitude, user.longitude]} icon={icon}>
                        <Popup>
                            <strong>Live train location</strong>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}

export default LiveUserMarkers;