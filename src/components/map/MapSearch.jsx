import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { getAllStations } from "../../services/stationApi";
import { getAllTrains } from "../../services/trainApi";

import SearchOverlay from "../SearchOverlay/SearchOverlay";
import useAuth from "../../hooks/useAuth";

function MapSearch({ onStationSelect, onTrainSelect }) {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [searchType, setSearchType] = useState("stations");
    const [query, setQuery] = useState("");

    const [allStations, setAllStations] = useState([]);
    const [allTrains, setAllTrains] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ====================== user avatar section ======================

    const getUserInitial = () => {
        if (!user) {
            return "";
        }

        const name = user.full_name?.trim() || user.email?.trim() || "";

        return name.charAt(0);
    };

    const userInitial = getUserInitial();

    // ====================== load search data ======================

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (allStations.length > 0 && allTrains.length > 0) {
            return;
        }

        const controller = new AbortController();

        async function loadSearchData() {
            try {
                setIsLoading(true);
                setError(null);

                const [stations, trains] = await Promise.all([
                    allStations.length === 0
                        ? getAllStations({
                              signal: controller.signal,
                          })
                        : Promise.resolve(allStations),

                    allTrains.length === 0
                        ? getAllTrains({
                              signal: controller.signal,
                          })
                        : Promise.resolve(allTrains),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                if (allStations.length === 0) {
                    setAllStations(Array.isArray(stations) ? stations : []);
                }

                if (allTrains.length === 0) {
                    setAllTrains(Array.isArray(trains) ? trains : []);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load search data:", error);

                setError("Unable to load search data. Please try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadSearchData();

        return () => controller.abort();
    }, [isOpen, allStations.length, allTrains.length]);

    // ====================== frontend search ======================

    const stations = useMemo(() => {
        const search = query.trim().toLowerCase();

        if (!search) {
            return allStations;
        }

        return allStations.filter((station) => {
            const name = String(station.name || "").toLowerCase();
            const nameEn = String(station.name_en || "").toLowerCase();

            return name.includes(search) || nameEn.includes(search);
        });
    }, [allStations, query]);

    const trains = useMemo(() => {
        const search = query.trim().toLowerCase();

        if (!search) {
            return allTrains;
        }

        return allTrains.filter((train) => {
            const number = String(train.number || "").toLowerCase();

            const name = String(train.name || "").toLowerCase();

            const nameBn = String(train.name_bn || "").toLowerCase();

            return number.includes(search) || name.includes(search) || nameBn.includes(search);
        });
    }, [allTrains, query]);

    // ====================== open / close ======================

    const handleOpen = () => {
        setIsOpen(true);
        setQuery("");
        setError(null);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery("");
        setError(null);
    };

    // ====================== search type ======================

    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setQuery("");
        setError(null);
    };

    // ====================== result selection ======================

    const handleStationSelect = (station) => {
        setIsOpen(false);
        setQuery("");
        setError(null);

        onStationSelect(station);
    };

    const handleTrainSelect = (train) => {
        setIsOpen(false);
        setQuery("");
        setError(null);

        onTrainSelect(train);
    };

    return (
        <>
            {!isOpen && (
                <div className="map-search">
                    <button
                        type="button"
                        className="map-search-bar"
                        onClick={handleOpen}
                        aria-label="Search station or train"
                    >
                        <FiSearch className="map-search-icon" size={18} aria-hidden="true" />

                        <span className="map-search-placeholder">Search a station or train</span>

                        {!isAuthLoading && isAuthenticated && userInitial && (
                            <span className="map-search-avatar" aria-label="Account">
                                {userInitial}
                            </span>
                        )}
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