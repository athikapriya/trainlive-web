import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiMapPin, FiStar } from "react-icons/fi";
import { MdTrain } from "react-icons/md";

import useAuth from "../../hooks/useAuth";

import { getSavedStations, getSavedTrains, deleteSavedStation, deleteSavedTrain } from "../../services/savedApi";

import styles from "./Saved.module.css";

function Saved() {
    const navigate = useNavigate();

    const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState("stations");

    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deletingId, setDeletingId] = useState(null);


    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated || !accessToken) {
            setStations([]);
            setTrains([]);
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadSavedItems() {
            try {
                setIsLoading(true);
                setError(null);

                const [savedStationsResponse, savedTrainsResponse] = await Promise.all([
                    getSavedStations({
                        accessToken,
                        signal: controller.signal,
                    }),

                    getSavedTrains({
                        accessToken,
                        signal: controller.signal,
                    }),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                const savedStations = Array.isArray(savedStationsResponse)
                    ? savedStationsResponse
                    : savedStationsResponse?.results || [];

                const savedTrains = Array.isArray(savedTrainsResponse)
                    ? savedTrainsResponse
                    : savedTrainsResponse?.results || [];

                setStations(savedStations);
                setTrains(savedTrains);
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load saved items:", error);

                setError("Unable to load your saved stations and trains.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadSavedItems();

        return () => {
            controller.abort();
        };
    }, [accessToken, isAuthenticated, authLoading]);


    const handleStationClick = (savedStation) => {
        const station = savedStation.station_details;

        if (!station?.id) {
            return;
        }

        navigate(`/?station=${station.id}`);
    };

    const handleTrainClick = (savedTrain) => {
        const train = savedTrain.train_details;

        if (!train?.number) {
            return;
        }

        navigate(`/?train=${train.number}`);
    };


    const handleRemoveStation = async (event, savedStation) => {
        event.stopPropagation();

        if (deletingId === `station-${savedStation.id}`) {
            return;
        }

        try {
            setDeletingId(`station-${savedStation.id}`);

            await deleteSavedStation(savedStation.id, {
                accessToken,
            });

            setStations((current) => current.filter((item) => item.id !== savedStation.id));
        } catch (error) {
            console.error("Failed to remove saved station:", error);
        } finally {
            setDeletingId(null);
        }
    };


    const handleRemoveTrain = async (event, savedTrain) => {
        event.stopPropagation();

        if (deletingId === `train-${savedTrain.id}`) {
            return;
        }

        try {
            setDeletingId(`train-${savedTrain.id}`);

            await deleteSavedTrain(savedTrain.id, {
                accessToken,
            });

            setTrains((current) => current.filter((item) => item.id !== savedTrain.id));
        } catch (error) {
            console.error("Failed to remove saved train:", error);
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading || isLoading) {
        return (
            <main className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Saved</div>

                    <div className={styles.headerSubtitle}>Your stations & trains</div>

                    <div className={styles.tabs}>
                        <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
                            Stations
                        </button>

                        <button type="button" className={styles.tab}>
                            Trains
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />

                        <span>Loading saved items...</span>
                    </div>
                </div>
            </main>
        );
    }


    if (!isAuthenticated) {
        return (
            <main className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Saved</div>

                    <div className={styles.headerSubtitle}>Your stations & trains</div>
                </div>

                <div className={styles.content}>
                    <div className={styles.authState}>
                        <div className={styles.stateIcon}>
                            <FiStar size={25} />
                        </div>

                        <h2 className={styles.stateTitle}>Sign in to save</h2>

                        <p className={styles.stateText}>
                            Save stations and trains to keep them close for your next journey.
                        </p>

                        <button type="button" className={styles.primaryButton} onClick={() => navigate("/login")}>
                            Sign in
                        </button>

                        <button type="button" className={styles.secondaryButton} onClick={() => navigate("/register")}>
                            Create account
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Saved</div>

                    <div className={styles.headerSubtitle}>Your stations & trains</div>
                </div>

                <div className={styles.content}>
                    <div className={styles.emptyState}>
                        <div className={styles.stateIcon}>
                            <FiStar size={25} />
                        </div>

                        <h2 className={styles.stateTitle}>Something went wrong</h2>

                        <p className={styles.stateText}>{error}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>Saved</div>

                <div className={styles.headerSubtitle}>Your stations & trains</div>

                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "stations" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("stations")}
                    >
                        Stations
                    </button>

                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "trains" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("trains")}
                    >
                        Trains
                    </button>
                </div>
            </div>

            <div className={styles.content}>

                {activeTab === "stations" && (
                    <>
                        {stations.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.stateIcon}>
                                    <FiMapPin size={25} />
                                </div>

                                <h2 className={styles.stateTitle}>No saved stations yet</h2>

                                <p className={styles.stateText}>Save a station from search results to pin it here.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {stations.map((savedStation) => {
                                    const station = savedStation.station_details;

                                    if (!station) {
                                        return null;
                                    }

                                    const isDeleting = deletingId === `station-${savedStation.id}`;

                                    return (
                                        <article
                                            key={savedStation.id}
                                            className={styles.card}
                                            onClick={() => handleStationClick(savedStation)}
                                        >
                                            <div className={styles.cardTop}>
                                                <div className={styles.cardMain}>
                                                    <div className={styles.stationIcon}>
                                                        <FiMapPin size={18} />
                                                    </div>

                                                    <div className={styles.cardText}>
                                                        <div className={styles.primaryText}>{station.name}</div>

                                                        {station.name_en && (
                                                            <div className={styles.secondaryText}>
                                                                {station.name_en}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={styles.starButton}
                                                    disabled={isDeleting}
                                                    onClick={(event) => handleRemoveStation(event, savedStation)}
                                                    aria-label="Remove saved station"
                                                >
                                                    <FiStar size={18} fill="currentColor" />
                                                </button>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <span>{savedStation.report_count_today ?? 0} reports today</span>

                                                <FiChevronRight size={17} />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "trains" && (
                    <>
                        {trains.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={`${styles.stateIcon} ${styles.trainStateIcon}`}>
                                    <MdTrain size={27} />
                                </div>

                                <h2 className={styles.stateTitle}>No saved trains yet</h2>

                                <p className={styles.stateText}>Save a train from search results to pin it here.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {trains.map((savedTrain) => {
                                    const train = savedTrain.train_details;

                                    if (!train) {
                                        return null;
                                    }

                                    const isDeleting = deletingId === `train-${savedTrain.id}`;

                                    return (
                                        <article
                                            key={savedTrain.id}
                                            className={styles.card}
                                            onClick={() => handleTrainClick(savedTrain)}
                                        >
                                            <div className={styles.cardTop}>
                                                <div className={styles.cardMain}>
                                                    <div className={`${styles.stationIcon} ${styles.trainIcon}`}>
                                                        <MdTrain size={21} />
                                                    </div>

                                                    <div className={styles.cardText}>
                                                        <div className={styles.primaryText}>{train.name}</div>

                                                        {train.name_bn && (
                                                            <div className={styles.secondaryText}>{train.name_bn}</div>
                                                        )}

                                                        <div className={styles.trainMeta}>
                                                            <span className={styles.trainNumber}>#{train.number}</span>

                                                            {train.direction && (
                                                                <span className={styles.direction}>
                                                                    {train.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={styles.starButton}
                                                    disabled={isDeleting}
                                                    onClick={(event) => handleRemoveTrain(event, savedTrain)}
                                                    aria-label="Remove saved train"
                                                >
                                                    <FiStar size={18} fill="currentColor" />
                                                </button>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <span>{savedTrain.report_count_today ?? 0} reports today</span>

                                                <FiChevronRight size={17} />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default Saved;