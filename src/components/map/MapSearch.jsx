import { FiSearch } from "react-icons/fi";

function MapSearch() {
    return (
        <div className="map-search">
            <div className="map-search-bar">
                <FiSearch className="map-search-icon" size={18} aria-hidden="true" />
                <input type="text" className="map-search-input" placeholder="Search a station or train" aria-label="Search station or train" />
            </div>
        </div>
    );
}

export default MapSearch;