import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

function FlyToLiveLocation({ users = [], ownLiveLocation = null, enabled = false }) {
    const map = useMap();
    const hasFlownRef = useRef(false);

    useEffect(() => {
        if (!enabled) {
            hasFlownRef.current = false;
            return;
        }

        let location = null;

        if (
            ownLiveLocation &&
            typeof ownLiveLocation.latitude === "number" &&
            typeof ownLiveLocation.longitude === "number"
        ) {
            location = {
                latitude: ownLiveLocation.latitude,
                longitude: ownLiveLocation.longitude,
            };
        } else {
            const firstUser = users.find(
                (user) => typeof user?.latitude === "number" && typeof user?.longitude === "number"
            );

            if (firstUser) {
                location = {
                    latitude: firstUser.latitude,
                    longitude: firstUser.longitude,
                };
            }
        }

        if (!location || hasFlownRef.current) {
            return;
        }

        hasFlownRef.current = true;

        map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 14), {
            duration: 1.2,
        });
    }, [enabled, map, ownLiveLocation, users]);

    return null;
}

export default FlyToLiveLocation;