import { useEffect, useMemo, useState } from "react";

import { getAllTrains } from "../../services/trainApi";

function getStationName(station) {
    if (!station) {
        return "";
    }

    return station.name || station.name_en || station.name_bn || "";
}

function getStationBengaliName(station) {
    if (!station) {
        return "";
    }

    return station.name_bn || station.name || station.name_en || "";
}

function getFirstLastStops(train) {
    if (!Array.isArray(train?.stops) || train.stops.length === 0) {
        return {
            first: "",
            last: "",
        };
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
    const [search, setSearch] = useState("");
    const [trains, setTrains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* =====================================================
       Load trains once
    ===================================================== */

    useEffect(() => {
        const controller = new AbortController();

        async function loadTrains() {
            try {
                setIsLoading(true);
                setError(null);

                const results = await getAllTrains({
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                setTrains(Array.isArray(results) ? results : []);
            } catch (loadError) {
                if (loadError.name === "AbortError") {
                    return;
                }

                console.error("Failed to load trains:", loadError);

                setError("Unable to load trains.");
                setTrains([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadTrains();

        return () => controller.abort();
    }, []);

    /* =====================================================
       Frontend search
    ===================================================== */

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

    const isShareMode = mode === "share";

    const title = isShareMode ? "Choose a train to share" : "Choose a train to watch";

    const description = isShareMode
        ? "Select the train you are currently travelling on."
        : "Select the train you want to see live locations for.";

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
                    onChange={(event) => {
                        setSearch(event.target.value);
                    }}
                    autoFocus
                />

                <div className="live-picker-results">
                    {isLoading && <div className="live-picker-message">Loading trains...</div>}

                    {!isLoading && error && <div className="live-picker-message error">{error}</div>}

                    {!isLoading && !error && filteredTrains.length === 0 && (
                        <div className="live-picker-message">No trains found.</div>
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
                                    onClick={() => {
                                        onSelect(train);
                                    }}
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

                                    {train.direction && <span className="live-train-direction">{train.direction}</span>}
                                </button>
                            );
                        })}
                </div>
            </section>
        </div>
    );
}

export default LiveTrainPicker;