import { useEffect } from "react";
import { useMap } from "react-leaflet";

function FlyToStation({ station }) {
    const map = useMap();

    useEffect(() => {
        if (!station) {
            return;
        }

        map.flyTo(
            [station.latitude, station.longitude],
            15,
            {
                duration: 0.9,
            }
        );
    }, [station, map]);

    return null;
}

export default FlyToStation;