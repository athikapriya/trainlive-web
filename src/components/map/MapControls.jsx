import { useMap } from "react-leaflet";

import { MyLocationIcon } from "../icons/ReactIcons";


function MapControls() {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    const handleLocation = () => {
        map.locate({
            setView: true,
            maxZoom: 16,
            enableHighAccuracy: true,
        });
    };

    return (
        <div className="map-controls">

            {/* Your location */}
            <button type="button" className="map-control" onClick={handleLocation} aria-label="Your location">
                <MyLocationIcon size={21} />
            </button>

            {/* Zoom */}
            <div className="zoom-control">

                <button type="button" className="map-control zoom-button" onClick={handleZoomIn} aria-label="Zoom in">
                    +
                </button>

                <button type="button" className="map-control zoom-button" onClick={handleZoomOut} aria-label="Zoom out">
                    −
                </button>

            </div>

        </div>
    );
}

export default MapControls;