import { GeoJSON } from "react-leaflet";

function isValidGeoJSON(route) {
    if (!route || typeof route !== "object") {
        return false;
    }

    if (route.type === "Feature") {
        return Boolean(route.geometry);
    }

    if (route.type === "LineString" || route.type === "MultiLineString" || route.type === "FeatureCollection") {
        return true;
    }

    return false;
}

function LiveTrainRoute({ route }) {
    if (!isValidGeoJSON(route)) {
        return null;
    }

    return (
        <GeoJSON
            data={route}
            pathOptions={{
                color: "#1A73E8",
                weight: 5,
                opacity: 0.7,
            }}
        />
    );
}

export default LiveTrainRoute;