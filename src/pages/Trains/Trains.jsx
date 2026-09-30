import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../layouts/PageHeader/PageHeader";
import TrainCard from "../../components/trains/TrainCard";
import { getTrains } from "../../services/trainApi";

import styles from "./Trains.module.css";
import pageStyles from "../../styles/page.module.css";

/* =========================================================
   Time helpers
========================================================= */

function getTimeParts(timeString) {
    if (!timeString) {
        return null;
    }

    const parts = String(timeString).split(":");

    if (parts.length < 2) {
        return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2] || 0);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
        return null;
    }

    return {
        hours,
        minutes,
        seconds,
    };
}

function createDateWithTime(date, timeString) {
    const parts = getTimeParts(timeString);

    if (!parts) {
        return null;
    }

    const result = new Date(date);

    result.setHours(parts.hours, parts.minutes, parts.seconds, 0);

    return result;
}

/* =========================================================
   Journey helpers
========================================================= */

function getJourneyWindowForDate(train, serviceDate) {
    const stops = Array.isArray(train.stops) ? [...train.stops].sort((a, b) => a.stop_order - b.stop_order) : [];

    if (stops.length === 0) {
        return null;
    }

    const originStop = stops[0];

    if (!originStop?.scheduled_departure) {
        return null;
    }

    const journeyStart = createDateWithTime(serviceDate, originStop.scheduled_departure);

    if (!journeyStart) {
        return null;
    }

    let journeyEnd = journeyStart;

    const originParts = getTimeParts(originStop.scheduled_departure);

    for (const stop of stops) {
        const scheduledTimes = [stop.scheduled_arrival, stop.scheduled_departure];

        for (const timeString of scheduledTimes) {
            if (!timeString) {
                continue;
            }

            const timeParts = getTimeParts(timeString);

            if (!timeParts) {
                continue;
            }

            const stopDate = new Date(serviceDate);

            if (
                originParts &&
                (timeParts.hours < originParts.hours ||
                    (timeParts.hours === originParts.hours && timeParts.minutes < originParts.minutes) ||
                    (timeParts.hours === originParts.hours &&
                        timeParts.minutes === originParts.minutes &&
                        timeParts.seconds < originParts.seconds))
            ) {
                stopDate.setDate(stopDate.getDate() + 1);
            }

            const scheduledDateTime = createDateWithTime(stopDate, timeString);

            if (scheduledDateTime && scheduledDateTime > journeyEnd) {
                journeyEnd = scheduledDateTime;
            }
        }
    }

    return {
        serviceDate,
        journeyStart,
        journeyEnd,
    };
}

function isOffDay(train, date) {
    if (!train.off_day) {
        return false;
    }

    const dayName = date
        .toLocaleDateString("en-US", {
            weekday: "long",
        })
        .toLowerCase();

    return train.off_day.trim().toLowerCase() === dayName;
}

/* =========================================================
   Current journey
========================================================= */

function getCurrentJourney(train, now) {
    const today = new Date(now);

    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    /*
     * =====================================================
     * TODAY
     * =====================================================
     */

    if (!isOffDay(train, today)) {
        const todayJourney = getJourneyWindowForDate(train, today);

        if (todayJourney) {
            if (now >= todayJourney.journeyStart && now < todayJourney.journeyEnd) {
                return {
                    ...todayJourney,
                    state: "ACTIVE",
                };
            }

            if (now < todayJourney.journeyStart) {
                return {
                    ...todayJourney,
                    state: "SCHEDULED",
                };
            }

            if (now >= todayJourney.journeyEnd) {
                return {
                    ...todayJourney,
                    state: "PAST_SCHEDULED_END",
                };
            }
        }
    }

    /*
     * =====================================================
     * YESTERDAY OVERNIGHT JOURNEY
     * =====================================================
     */

    if (!isOffDay(train, yesterday)) {
        const yesterdayJourney = getJourneyWindowForDate(train, yesterday);

        if (yesterdayJourney) {
            const isOvernight = yesterdayJourney.journeyEnd > yesterdayJourney.journeyStart;

            if (isOvernight && now >= yesterdayJourney.journeyStart && now < yesterdayJourney.journeyEnd) {
                return {
                    ...yesterdayJourney,
                    state: "ACTIVE",
                };
            }

            if (isOvernight && now >= yesterdayJourney.journeyEnd) {
                return {
                    ...yesterdayJourney,
                    state: "PAST_SCHEDULED_END",
                };
            }
        }
    }

    return null;
}

/* =========================================================
   Report ETA helper
========================================================= */

function getCompletionEta(train) {
    if (!train?.completion_eta) {
        return null;
    }

    const eta = new Date(train.completion_eta);

    if (Number.isNaN(eta.getTime())) {
        return null;
    }

    return eta;
}

/* =========================================================
   Train display status
========================================================= */

function getTrainDisplayStatus(train, now) {
    const journey = getCurrentJourney(train, now);

    const completionEta = getCompletionEta(train);

    const today = new Date(now);

    today.setHours(0, 0, 0, 0);

    /*
     * =====================================================
     * OFF DAY
     * =====================================================
     */

    if (isOffDay(train, today) && !journey && !completionEta) {
        return {
            status: "OFF_DAY",
            label: "Off day",
            secondaryLabel: "No scheduled journey today",
            delayMinutes: null,
            journeyStart: null,
        };
    }

    /*
     * =====================================================
     * SCHEDULED
     * =====================================================
     */

    if (journey && journey.state === "SCHEDULED") {
        return {
            status: "SCHEDULED",
            label: "Scheduled",
            secondaryLabel: null,
            delayMinutes: null,
            journeyStart: journey.journeyStart,
            completionEta,
        };
    }

    /*
     * =====================================================
     * REPORT-BASED ACTIVE JOURNEY
     * =====================================================
     */

    if (completionEta && now < completionEta) {
        const delayMinutes = typeof train.delay_minutes === "number" ? train.delay_minutes : null;

        /*
         * Delayed
         */
        if (delayMinutes !== null && delayMinutes > 0) {
            return {
                status: "DELAYED",
                label: train.status_label || `+${delayMinutes} min late`,
                secondaryLabel: null,
                delayMinutes,
                journeyStart: journey?.journeyStart || null,
                completionEta,
            };
        }

        /*
         * On time
         */
        return {
            status: "ON_TIME",
            label: "On time",
            secondaryLabel: null,
            delayMinutes: delayMinutes ?? 0,
            journeyStart: journey?.journeyStart || null,
            completionEta,
        };
    }

    /*
     * =====================================================
     * REPORT-BASED COMPLETION
     * =====================================================
     */

    if (completionEta && now >= completionEta) {
        return {
            status: "COMPLETED",
            label: "Journey completed",
            secondaryLabel: null,
            delayMinutes: null,
            journeyStart: journey?.journeyStart || null,
            completionEta,
        };
    }

    /*
     * =====================================================
     * NO REPORT
     * =====================================================
     */

    if (!journey) {
        return {
            status: "SCHEDULED",
            label: "Scheduled",
            secondaryLabel: null,
            delayMinutes: null,
            journeyStart: null,
        };
    }

    if (journey.state === "PAST_SCHEDULED_END") {
        return {
            status: "COMPLETED",
            label: "Journey completed",
            secondaryLabel: "No latest reports · assumed on time",
            delayMinutes: null,
            journeyStart: journey.journeyStart,
            completionEta: null,
        };
    }

    /*
     * =====================================================
     * ACTIVE — FALLBACK
     * =====================================================
     */

    const delayMinutes = typeof train.delay_minutes === "number" ? train.delay_minutes : null;

    if (delayMinutes !== null && delayMinutes > 0) {
        return {
            status: "DELAYED",
            label: train.status_label || `+${delayMinutes} min late`,
            secondaryLabel: null,
            delayMinutes,
            journeyStart: journey.journeyStart,
            completionEta,
        };
    }

    return {
        status: "ON_TIME",
        label: "On time",
        secondaryLabel: null,
        delayMinutes: delayMinutes !== null ? delayMinutes : 0,
        journeyStart: journey.journeyStart,
        completionEta,
    };
}

/* =========================================================
   Sorting
========================================================= */

function getJourneyGroup(status) {
    switch (status) {
        case "ON_TIME":
        case "DELAYED":
            return 1;

        case "SCHEDULED":
            return 2;

        case "COMPLETED":
            return 3;

        case "OFF_DAY":
            return 4;

        default:
            return 5;
    }
}

function sortTrainsByJourneyStart(trains) {
    return [...trains].sort((a, b) => {
        const statusA = a.displayStatus.status;

        const statusB = b.displayStatus.status;

        const groupA = getJourneyGroup(statusA);

        const groupB = getJourneyGroup(statusB);

        if (groupA !== groupB) {
            return groupA - groupB;
        }

        const startA = a.displayStatus.journeyStart;

        const startB = b.displayStatus.journeyStart;

        if (!startA && !startB) {
            return 0;
        }

        if (!startA) {
            return 1;
        }

        if (!startB) {
            return -1;
        }

        /*
         * Latest journey first.
         */

        return startB.getTime() - startA.getTime();
    });
}

/* =========================================================
   Component
========================================================= */

function Trains() {
    const navigate = useNavigate();

    const [trains, setTrains] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");

    const [searchInput, setSearchInput] = useState("");

    const [search, setSearch] = useState("");

    const [currentTime, setCurrentTime] = useState(() => new Date());

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState(null);

    /* =====================================================
       Load trains
    ===================================================== */

    useEffect(() => {
        const controller = new AbortController();

        async function loadTrains() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getTrains(search, {
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
    }, [search]);

    /* =====================================================
       Search debounce
    ===================================================== */

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    /* =====================================================
       Keep current time fresh
    ===================================================== */

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    /* =====================================================
       Status + sorting
    ===================================================== */

    const trainsWithStatus = useMemo(() => {
        const result = trains.map((train) => ({
            ...train,
            displayStatus: getTrainDisplayStatus(train, currentTime),
        }));

        return sortTrainsByJourneyStart(result);
    }, [trains, currentTime]);

    /* =====================================================
       Filter
    ===================================================== */

    const filteredTrains = useMemo(() => {
        if (activeFilter === "all") {
            return trainsWithStatus;
        }

        if (activeFilter === "ontime") {
            return trainsWithStatus.filter((train) => train.displayStatus.status === "ON_TIME");
        }

        if (activeFilter === "delayed") {
            return trainsWithStatus.filter((train) => train.displayStatus.status === "DELAYED");
        }

        return trainsWithStatus;
    }, [trainsWithStatus, activeFilter]);

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
                    placeholder="Search trains..."
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

            <div className={pageStyles.tabs}>
                <button
                    type="button"
                    className={`${pageStyles.tab} ${activeFilter === "all" ? pageStyles.tabActive : ""}`}
                    onClick={() => setActiveFilter("all")}
                >
                    All
                </button>

                <button
                    type="button"
                    className={`${pageStyles.tab} ${activeFilter === "ontime" ? pageStyles.tabActive : ""}`}
                    onClick={() => setActiveFilter("ontime")}
                >
                    On time
                </button>

                <button
                    type="button"
                    className={`${pageStyles.tab} ${activeFilter === "delayed" ? pageStyles.tabActive : ""}`}
                    onClick={() => setActiveFilter("delayed")}
                >
                    Delayed
                </button>
            </div>
        </div>
    );

    /* =====================================================
       Train list
    ===================================================== */

    const renderTrainList = () => {
        if (filteredTrains.length === 0) {
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
                <PageHeader title="All trains" subtitle="Today’s schedule · 24h window">
                    {renderHeaderControls()}
                </PageHeader>

                <div className={pageStyles.content}>
                    <div className={pageStyles.contentInner}>
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            Loading trains...
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
                <PageHeader title="All trains" subtitle="Today’s schedule · 24h window">
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
            <PageHeader title="All trains" subtitle="Today’s schedule · 24h window">
                {renderHeaderControls()}
            </PageHeader>

            <div className={pageStyles.content}>
                <div className={pageStyles.contentInner}>{renderTrainList()}</div>
            </div>
        </div>
    );
}

export default Trains;