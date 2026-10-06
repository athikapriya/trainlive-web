import { useMap } from "react-leaflet";
import { MdOutlineShare } from "react-icons/md";

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

    const handleShare = async () => {
        const shareUrl = "https://trainlive-web.vercel.app/";

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "TrainLive",
                    text: "Real-time train information, powered by the community.",
                    url: shareUrl,
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Share failed:", error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch (error) {
                console.error("Failed to copy share link:", error);
            }
        }
    };

    return (
        <div className="map-controls">
            {/* Share */}
            <button type="button" className="map-control" onClick={handleShare} aria-label="Share TrainLive">
                <MdOutlineShare size={21} />
            </button>

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