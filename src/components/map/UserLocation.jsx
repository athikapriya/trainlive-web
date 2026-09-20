import { useEffect, useState } from "react";
import { Circle, CircleMarker, useMap } from "react-leaflet";

function UserLocation() {
    const map = useMap();
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const handleLocationFound = (event) => {
            setLocation({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
                accuracy: event.accuracy,
            });
        };

        const handleLocationError = (event) => {
            console.error(
                "Location error:",
                event.message
            );
        };

        map.on(
            "locationfound",
            handleLocationFound
        );

        map.on(
            "locationerror",
            handleLocationError
        );

        return () => {
            map.off(
                "locationfound",
                handleLocationFound
            );

            map.off(
                "locationerror",
                handleLocationError
            );
        };
    }, [map]);

    if (!location) {
        return null;
    }

    return (
        <>
            {/* Accuracy area */}
            <Circle
                center={[
                    location.lat,
                    location.lng,
                ]}
                radius={location.accuracy}
                pathOptions={{
                    stroke: false,
                    fillColor: "#4285F4",
                    fillOpacity: 0.12,
                }}
            />

            {/* Location dot */}
            <CircleMarker
                center={[
                    location.lat,
                    location.lng,
                ]}
                radius={8}
                pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                }}
            />
        </>
    );
}

export default UserLocation;