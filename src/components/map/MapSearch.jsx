import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { getStations } from "../../services/stationApi";
import { getTrains } from "../../services/trainApi";

import SearchOverlay from "../SearchOverlay/SearchOverlay";


function MapSearch() {
    const [isOpen, setIsOpen] = useState(false);

    const [searchType, setSearchType] = useState("stations");
    const [query, setQuery] = useState("");

    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    // ====================== search api section ========================
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (searchType === "stations") {
                    const data = await getStations(query, {
                        signal: controller.signal,
                    });

                    setStations(data);
                } else {
                    const data = await getTrains(query, {
                        signal: controller.signal,
                    });

                    setTrains(data);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error(
                    `${searchType} search failed:`,
                    error
                );

                if (searchType === "stations") {
                    setStations([]);
                } else {
                    setTrains([]);
                }

                setError(
                    `Unable to search ${
                        searchType === "stations"
                            ? "stations"
                            : "trains"
                    }.`
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [isOpen, searchType, query]);


    // ================ open/close section ==================
    const handleOpen = () => {
        setIsOpen(true);
    };


    const handleClose = () => {
        setIsOpen(false);
        setQuery("");
        setError(null);
    };


    // ================ change search type section ==================
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setQuery("");
        setError(null);
    };


    // ================ result selecttioin section ==================
    const handleStationSelect = (station) => {
        console.log("Selected station:", station);
    };


    const handleTrainSelect = (train) => {
        console.log("Selected train:", train);
    };


    return (
        <>
            {!isOpen && (
                <div className="map-search">
                    <button type="button" className="map-search-bar" onClick={handleOpen} aria-label="Search station or train">
                        <FiSearch className="map-search-icon" size={18} aria-hidden="true" />
                        <span className="map-search-placeholder">
                            Search a station or train
                        </span>
                    </button>
                </div>
            )}


            {isOpen && (
                <SearchOverlay
                    searchType={searchType}
                    query={query}
                    stations={stations}
                    trains={trains}
                    isLoading={isLoading}
                    error={error}
                    onClose={handleClose}
                    onQueryChange={setQuery}
                    onSearchTypeChange={handleSearchTypeChange}
                    onStationSelect={handleStationSelect}
                    onTrainSelect={handleTrainSelect}
                />
            )}
        </>
    );
}

export default MapSearch;