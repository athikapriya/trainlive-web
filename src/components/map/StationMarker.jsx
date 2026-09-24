import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

function StationMarker({ station }) {
    const icon = useMemo(() => {
        return L.divIcon({
            className: "station-marker-icon",
            html: `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="#d93025"
                >
                    <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
                    />
                </svg>
            `,
            iconSize: [42, 42],
            iconAnchor: [21, 42],
        });
    }, []);

    return (
        <Marker
            position={[
                station.latitude,
                station.longitude,
            ]}
            icon={icon}
        />
    );
}

export default StationMarker;