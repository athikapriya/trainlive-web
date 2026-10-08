import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX, FiActivity, FiClock, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../layouts/PageHeader/PageHeader";
import TrainCard from "../../components/trains/TrainCard";
import { getTrains } from "../../services/trainApi";

import { getTrainDisplayStatus, sortTrainsByJourneyStart } from "./trainUtils";

import styles from "./Trains.module.css";
import pageStyles from "../../styles/page.module.css";

/* =========================================================
   Component
========================================================= */

function Trains() {
    const navigate = useNavigate();

    const [trains, setTrains] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");

    const [searchInput, setSearchInput] = useState("");

    const [currentTime, setCurrentTime] = useState(() => new Date());

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* =====================================================
       Load all trains once
    ===================================================== */

    useEffect(() => {
        const controller = new AbortController();

        async function loadTrains() {
            try {
                setIsLoading(true);
                setError(null);

                /*
                 * Fetch the complete train list once.
                 *
                 * Search is handled locally below, so typing
                 * in the search box does not make API requests.
                 */
                const response = await getTrains("", {
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                const data = Array.isArray(response) ? response : response?.results || [];

                setTrains(data);
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load trains:", error);

                setError("Unable to load trains.");
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
       Clock
    ===================================================== */

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    /* =====================================================
       Calculate statuses
    ===================================================== */

    const trainsWithStatus = useMemo(() => {
        const mapped = trains.map((train) => ({
            ...train,
            displayStatus: getTrainDisplayStatus(train, currentTime),
        }));

        return sortTrainsByJourneyStart(mapped);
    }, [trains, currentTime]);

    /* =====================================================
       Frontend search
    ===================================================== */

    const searchedTrains = useMemo(() => {
        const query = searchInput.trim().toLowerCase();

        if (!query) {
            return trainsWithStatus;
        }

        return trainsWithStatus.filter((train) => {
            const number = String(train.number || "").toLowerCase();
            const name = String(train.name || "").toLowerCase();
            const nameBn = String(train.name_bn || "").toLowerCase();

            return number.includes(query) || name.includes(query) || nameBn.includes(query);
        });
    }, [trainsWithStatus, searchInput]);

    /* =====================================================
       Summary
    ===================================================== */

    const summary = useMemo(() => {
        let active = 0;
        let delayed = 0;
        let scheduled = 0;

        for (const train of searchedTrains) {
            const status = train.displayStatus.status;

            if (status === "ON_TIME" || status === "DELAYED") {
                active += 1;
            }

            if (status === "DELAYED") {
                delayed += 1;
            }

            if (status === "SCHEDULED") {
                scheduled += 1;
            }
        }

        return {
            active,
            delayed,
            scheduled,
        };
    }, [searchedTrains]);

    /* =====================================================
       Filter
    ===================================================== */

    const filteredTrains = useMemo(() => {
        if (activeFilter === "ontime") {
            return searchedTrains.filter((train) => train.displayStatus.status === "ON_TIME");
        }

        if (activeFilter === "delayed") {
            return searchedTrains.filter((train) => train.displayStatus.status === "DELAYED");
        }

        return searchedTrains;
    }, [searchedTrains, activeFilter]);

    /* =====================================================
       Handlers
    ===================================================== */

    const handleTrainClick = (train) => {
        if (!train.number) {
            return;
        }

        navigate(`/trains/${encodeURIComponent(train.number)}`);
    };

    const handleSearchClear = () => {
        setSearchInput("");
    };

    /* =====================================================
       Header controls
    ===================================================== */

    const renderHeaderControls = () => (
        <div className={styles.headerControls}>
            <div className={styles.searchWrapper}>
                <FiSearch size={16} className={styles.searchIcon} />

                <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by train number or name..."
                    className={styles.searchInput}
                />

                {searchInput && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        onClick={handleSearchClear}
                        aria-label="Clear search"
                    >
                        <FiX size={15} />
                    </button>
                )}
            </div>

            <div className={styles.filterRow}>
                <button
                    type="button"
                    className={`${styles.filterButton} ${activeFilter === "all" ? styles.filterButtonActive : ""}`}
                    onClick={() => setActiveFilter("all")}
                >
                    All
                </button>

                <button
                    type="button"
                    className={`${styles.filterButton} ${activeFilter === "ontime" ? styles.filterButtonActive : ""}`}
                    onClick={() => setActiveFilter("ontime")}
                >
                    On time
                </button>

                <button
                    type="button"
                    className={`${styles.filterButton} ${activeFilter === "delayed" ? styles.filterButtonActive : ""}`}
                    onClick={() => setActiveFilter("delayed")}
                >
                    Delayed
                </button>
            </div>
        </div>
    );

    /* =====================================================
       Summary
    ===================================================== */

    const renderSummary = () => (
        <div className={styles.summary}>
            <div className={styles.summaryItem}>
                <div className={styles.summaryIcon}>
                    <FiActivity size={14} />
                </div>

                <div>
                    <strong>{summary.active}</strong>
                    <span>active</span>
                </div>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryItem}>
                <div className={styles.summaryIconDelayed}>
                    <FiAlertCircle size={14} />
                </div>

                <div>
                    <strong>{summary.delayed}</strong>
                    <span>delayed</span>
                </div>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryItem}>
                <div className={styles.summaryIconScheduled}>
                    <FiClock size={14} />
                </div>

                <div>
                    <strong>{summary.scheduled}</strong>
                    <span>scheduled</span>
                </div>
            </div>
        </div>
    );

    /* =====================================================
       Train list
    ===================================================== */

    const renderTrainList = () => {
        if (!filteredTrains.length) {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.stateIcon}>
                        <FiSearch size={21} />
                    </div>

                    <div className={styles.stateTitle}>No trains found</div>

                    <div className={styles.stateText}>Try a different search or filter.</div>
                </div>
            );
        }

        return (
            <div className={styles.list}>
                {filteredTrains.map((train) => (
                    <TrainCard
                        key={train.id || train.number}
                        train={train}
                        displayStatus={train.displayStatus}
                        onClick={() => handleTrainClick(train)}
                    />
                ))}
            </div>
        );
    };

    /* =====================================================
       Loading
    ===================================================== */

    if (isLoading) {
        return (
            <div className={pageStyles.page}>
                <PageHeader title="All trains" subtitle="Live journeys across Bangladesh">
                    {renderHeaderControls()}
                </PageHeader>

                <div className={pageStyles.content}>
                    <div className={pageStyles.contentInner}>
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Loading trains...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* =====================================================
       Error
    ===================================================== */

    if (error) {
        return (
            <div className={pageStyles.page}>
                <PageHeader title="All trains" subtitle="Live journeys across Bangladesh">
                    {renderHeaderControls()}
                </PageHeader>

                <div className={pageStyles.content}>
                    <div className={pageStyles.contentInner}>
                        <div className={styles.errorState}>{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    /* =====================================================
       Main
    ===================================================== */

    return (
        <div className={pageStyles.page}>
            <PageHeader title="All trains" subtitle="Live journeys across Bangladesh">
                {renderHeaderControls()}
            </PageHeader>

            <div className={pageStyles.content}>
                <div className={pageStyles.contentInner}>
                    {renderSummary()}
                    {renderTrainList()}
                </div>
            </div>
        </div>
    );
}

export default Trains;