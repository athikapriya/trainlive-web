import { useEffect, useMemo, useState } from "react";

import { getAllTrains } from "../../services/trainApi";
import { getActiveLiveTrains } from "../../services/liveApi";
import useAuth from "../../hooks/useAuth";

function getStationName(station) {
    if (!station) return "";

    return station.name || station.name_en || station.name_bn || "";
}

function getStationBengaliName(station) {
    if (!station) return "";

    return station.name_bn || station.name || station.name_en || "";
}

function getFirstLastStops(train) {
    if (!Array.isArray(train?.stops) || train.stops.length === 0) {
        return { first: "", last: "" };
    }

    const stops = [...train.stops].sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0));

    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    const firstStation = firstStop?.station || firstStop;
    const lastStation = lastStop?.station || lastStop;

    return {
        first: getStationBengaliName(firstStation) || getStationName(firstStation),
        last: getStationBengaliName(lastStation) || getStationName(lastStation),
    };
}

function getTrainDisplayName(train) {
    return train?.name_bn || train?.name || `Train ${train?.number || ""}`;
}

function getTrainEnglishName(train) {
    if (!train?.name_bn || !train?.name) {
        return "";
    }

    return train.name;
}

function LiveTrainPicker({ mode, onSelect, onClose }) {
    const { accessToken } = useAuth();

    const [search, setSearch] = useState("");
    const [trains, setTrains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isShareMode = mode === "share";

    // Share Live loads all trains.
    // Show Live polls for currently shared trains every five seconds.
    useEffect(() => {
        const controller = new AbortController();

        let isFirstLoad = true;
        let allTrainsCache = null;
        let isFetching = false;

        async function loadTrains() {
            if (isFetching || controller.signal.aborted) {
                return;
            }

            isFetching = true;

            try {
                if (isFirstLoad) {
                    setIsLoading(true);
                    setError(null);
                }

                let activeTrainNumbers = null;

                if (!isShareMode) {
                    if (!accessToken) {
                        setTrains([]);
                        setError("Please sign in to watch live trains.");
                        return;
                    }

                    const activeResult = await getActiveLiveTrains(accessToken, { signal: controller.signal });

                    if (controller.signal.aborted) {
                        return;
                    }

                    activeTrainNumbers = new Set((activeResult?.trains || []).map((item) => String(item.train_number)));
                }

                // Fetch the full train list only once per picker opening.
                if (allTrainsCache === null) {
                    const allTrains = await getAllTrains({
                        signal: controller.signal,
                    });

                    if (controller.signal.aborted) {
                        return;
                    }

                    allTrainsCache = Array.isArray(allTrains) ? allTrains : [];
                }

                const visibleTrains =
                    activeTrainNumbers === null
                        ? allTrainsCache
                        : allTrainsCache.filter((train) => activeTrainNumbers.has(String(train.number)));

                setTrains(visibleTrains);
                setError(null);
            } catch (loadError) {
                if (loadError.name === "AbortError" || controller.signal.aborted) {
                    return;
                }

                console.error("Failed to load trains:", loadError);

                // Preserve the last successful results during a temporary
                // polling error.
                setError((previousError) => (isFirstLoad ? "Unable to load trains. Please try again." : previousError));
            } finally {
                isFetching = false;

                if (!controller.signal.aborted) {
                    if (isFirstLoad) {
                        setIsLoading(false);
                    }

                    isFirstLoad = false;
                }
            }
        }

        loadTrains();

        const intervalId = !isShareMode && accessToken ? window.setInterval(loadTrains, 5000) : null;

        return () => {
            controller.abort();

            if (intervalId !== null) {
                window.clearInterval(intervalId);
            }
        };
    }, [mode, accessToken, isShareMode]);

    // Search the currently available trains.
    const filteredTrains = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return trains;
        }

        return trains.filter((train) => {
            const number = String(train.number || "").toLowerCase();
            const name = String(train.name || "").toLowerCase();
            const nameBn = String(train.name_bn || "").toLowerCase();

            return number.includes(query) || name.includes(query) || nameBn.includes(query);
        });
    }, [trains, search]);

    const title = isShareMode ? "Choose a train to share" : "Choose a train to watch";

    const description = isShareMode
        ? "Select the train you are currently travelling on."
        : "Choose a train that is currently being shared live.";

    return (
        <div className="live-picker-backdrop">
            <section className="live-picker" role="dialog" aria-modal="true" aria-label={title}>
                <div className="live-picker-header">
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>

                    <button type="button" className="live-picker-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <input
                    type="search"
                    className="live-picker-search"
                    placeholder="Search train number or name"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    autoFocus
                />

                <div className="live-picker-results">
                    {isLoading && (
                        <div className="live-picker-message">
                            {isShareMode ? "Loading trains..." : "Finding trains being shared live..."}
                        </div>
                    )}

                    {!isLoading && error && <div className="live-picker-message error">{error}</div>}

                    {!isLoading && !error && filteredTrains.length === 0 && (
                        <div className="live-picker-message">
                            {search.trim()
                                ? "No matching trains found."
                                : isShareMode
                                  ? "No trains found."
                                  : "No trains are currently being shared live."}
                        </div>
                    )}

                    {!isLoading &&
                        !error &&
                        filteredTrains.map((train) => {
                            const { first, last } = getFirstLastStops(train);
                            const displayName = getTrainDisplayName(train);
                            const englishName = getTrainEnglishName(train);

                            return (
                                <button
                                    type="button"
                                    className="live-train-option"
                                    key={train.id}
                                    onClick={() => onSelect(train)}
                                >
                                    <span className="live-train-number">{train.number}</span>

                                    <span className="live-train-info">
                                        <span className="live-train-name">{displayName}</span>

                                        {englishName && <span className="live-train-name-en">{englishName}</span>}

                                        {first && last && (
                                            <span className="live-train-route">
                                                {first}
                                                <span className="live-train-route-arrow">→</span>
                                                {last}
                                            </span>
                                        )}
                                    </span>

                                    {!isShareMode && (
                                        <span className="live-status-badge">
                                            <span className="live-status-dot" />
                                            <span className="live-status-text">LIVE</span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                </div>
            </section>
        </div>
    );
}

export default LiveTrainPicker;