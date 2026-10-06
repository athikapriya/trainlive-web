import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
    FiArrowLeft,
    FiArrowRight,
    FiClock,
    FiInfo,
    FiMapPin,
    FiMessageCircle,
    FiNavigation,
    FiRadio,
} from "react-icons/fi";

import useAuth from "../../Hooks/useAuth";
import PageHeader from "../../layouts/PageHeader/PageHeader";
import PageFooter from "../../layouts/PageFooter/PageFooter";

import { getTrain, getTrainHistory, getTrainReports } from "../../services/trainApi";

import pageStyles from "../../styles/page.module.css";
import styles from "./TrainDetails.module.css";

/* =========================================================
   Station helpers
========================================================= */

function getStationName(station) {
    if (!station) return "Unknown station";

    return station.name || station.name_en || "Unknown station";
}

function getStationEnglishName(station) {
    if (!station?.name_en) return null;

    if (station.name === station.name_en) {
        return null;
    }

    return station.name_en;
}

/* =========================================================
   Time helpers
========================================================= */

function timeToMinutes(time) {
    if (!time) return null;

    const parts = time.split(":").map(Number);

    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
        return null;
    }

    return parts[0] * 60 + parts[1];
}

function formatScheduleTime(time) {
    if (!time) return "—";

    const minutes = timeToMinutes(time);

    if (minutes === null) return time;

    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatDuration(minutes) {
    if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes)) || Number(minutes) < 0) {
        return "—";
    }

    const totalMinutes = Math.round(Number(minutes));

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours === 0) {
        return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}

/* =========================================================
   ETA helpers
========================================================= */

function getEtaStopMap(report) {
    const eta = report?.eta;

    if (!eta || !Array.isArray(eta.stops)) {
        return new Map();
    }

    return new Map(eta.stops.map((stop) => [stop.station?.id, stop]));
}

function getEtaArrival(stop, etaStopMap) {
    if (!stop?.station?.id) return null;

    const etaStop = etaStopMap.get(stop.station.id);

    return etaStop?.eta_arrival || null;
}

function getEtaDeparture(stop, etaStopMap) {
    if (!stop?.station?.id) return null;

    const etaStop = etaStopMap.get(stop.station.id);

    return etaStop?.eta_departure || null;
}

function etaTimeToMinutes(value) {
    if (!value) return null;

    const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) return null;

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return null;
    }

    if (period === "AM") {
        if (hour === 12) {
            hour = 0;
        }
    } else if (hour !== 12) {
        hour += 12;
    }

    return hour * 60 + minute;
}

function isEtaStillActive(destinationEta) {
    const etaMinutes = etaTimeToMinutes(destinationEta);

    if (etaMinutes === null) {
        return false;
    }

    const now = new Date();

    const currentTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(now);

    const [currentHour, currentMinute] = currentTime.split(":").map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;

    let adjustedEtaMinutes = etaMinutes;

    if (adjustedEtaMinutes < currentMinutes - 12 * 60) {
        adjustedEtaMinutes += 24 * 60;
    }

    let adjustedCurrentMinutes = currentMinutes;

    if (adjustedCurrentMinutes < etaMinutes - 12 * 60) {
        adjustedCurrentMinutes += 24 * 60;
    }

    return adjustedCurrentMinutes < adjustedEtaMinutes;
}

/* =========================================================
   Route schedule
========================================================= */

function buildRouteSchedule(stops = []) {
    if (!stops.length) {
        return {
            rows: [],
            totalDuration: null,
        };
    }

    const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);

    const firstDeparture = timeToMinutes(sortedStops[0]?.scheduled_departure);

    if (firstDeparture === null) {
        return {
            rows: sortedStops.map((stop) => ({
                ...stop,
                arrivalMinutes: null,
                departureMinutes: null,
                haltMinutes: null,
                durationMinutes: null,
            })),
            totalDuration: null,
        };
    }

    let previousDeparture = firstDeparture;

    const rows = sortedStops.map((stop, index) => {
        let arrivalMinutes = timeToMinutes(stop.scheduled_arrival);

        let departureMinutes = timeToMinutes(stop.scheduled_departure);

        if (index === 0) {
            arrivalMinutes = null;
        }

        if (arrivalMinutes !== null) {
            while (arrivalMinutes < previousDeparture) {
                arrivalMinutes += 24 * 60;
            }
        }

        if (departureMinutes !== null) {
            const comparisonBase = arrivalMinutes !== null ? arrivalMinutes : previousDeparture;

            while (departureMinutes < comparisonBase) {
                departureMinutes += 24 * 60;
            }
        }

        let haltMinutes = null;

        if (arrivalMinutes !== null && departureMinutes !== null) {
            haltMinutes = departureMinutes - arrivalMinutes;
        }

        let durationMinutes = null;

        if (index > 0 && arrivalMinutes !== null && previousDeparture !== null) {
            durationMinutes = arrivalMinutes - previousDeparture;
        }

        if (departureMinutes !== null) {
            previousDeparture = departureMinutes;
        } else if (arrivalMinutes !== null) {
            previousDeparture = arrivalMinutes;
        }

        return {
            ...stop,
            arrivalMinutes,
            departureMinutes,
            haltMinutes,
            durationMinutes,
        };
    });

    if (rows.length) {
        rows[0].arrivalMinutes = null;
        rows[0].haltMinutes = null;

        rows[rows.length - 1].departureMinutes = null;
        rows[rows.length - 1].haltMinutes = null;
    }

    const finalArrival = rows[rows.length - 1]?.arrivalMinutes;

    const totalDuration = finalArrival !== null && finalArrival !== undefined ? finalArrival - firstDeparture : null;

    return {
        rows,
        totalDuration,
    };
}

/* =========================================================
   Report helpers
========================================================= */

function getTodayDateKey() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function getReportDateKey(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function formatReportTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

/* =========================================================
   History helpers
========================================================= */

function getHistoryBarClass(day) {
    if (day.status === "ON_TIME") {
        return styles.historyOnTime;
    }

    if (day.status === "DELAYED") {
        if (typeof day.delay_minutes === "number" && day.delay_minutes >= 45) {
            return styles.historyDelayedHigh;
        }

        return styles.historyDelayedLow;
    }

    return styles.historyNoData;
}

function getHistoryBarHeight(day) {
    if (day.status !== "ON_TIME" && day.status !== "DELAYED") {
        return "0%";
    }

    if (day.status === "ON_TIME") {
        return "18%";
    }

    const delay = Math.max(Number(day.delay_minutes) || 0, 5);

    return `${Math.min((delay / 60) * 100, 100)}%`;
}

function formatHistoryDate(dateString) {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

function getHistoryTooltip(day) {
    const date = formatHistoryDate(day.service_date);

    if (day.status === "ON_TIME") {
        return `${date} · On time`;
    }

    if (day.status === "DELAYED") {
        return `${date} · +${formatDuration(day.delay_minutes)} late`;
    }

    if (day.status === "OFF_DAY") {
        return `${date} · Off day`;
    }

    if (day.status === "NO_SCHEDULE") {
        return `${date} · No schedule`;
    }

    return date;
}

/* =========================================================
   Component
========================================================= */

function TrainDetails() {
    const { trainNumber } = useParams();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const { user, accessToken, isLoading: authLoading } = useAuth();

    const highlightReportId = searchParams.get("report");

    const [train, setTrain] = useState(null);
    const [history, setHistory] = useState(null);
    const [reports, setReports] = useState([]);
    const [highlightedReportId, setHighlightedReportId] = useState(null);

    const [historyDays, setHistoryDays] = useState(7);

    const [loading, setLoading] = useState(true);

    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState("");

    const [, setEtaClock] = useState(0);

    /* =====================================================
       ETA clock
    ===================================================== */

    useEffect(() => {
        const interval = setInterval(() => {
            setEtaClock((value) => value + 1);
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    /* =====================================================
       Authentication
       
       IMPORTANT:
       Wait for auth restoration before redirecting.
       ===================================================== */

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/login", {
                replace: true,
                state: {
                    from: `/trains/${trainNumber}${highlightReportId ? `?report=${highlightReportId}` : ""}`,
                },
            });
        }
    }, [authLoading, user, trainNumber, highlightReportId, navigate]);

    /* =====================================================
       Train + today's reports
    ===================================================== */

    useEffect(() => {
        if (authLoading || !user || !accessToken) {
            return undefined;
        }

        const controller = new AbortController();

        async function loadTrain() {
            try {
                setLoading(true);
                setError("");

                const trainData = await getTrain(trainNumber);

                if (controller.signal.aborted) {
                    return;
                }

                const reportsData = await getTrainReports(trainData.id, {
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                const allReports = Array.isArray(reportsData) ? reportsData : reportsData?.results || [];

                const today = getTodayDateKey();

                const todaysReports = allReports
                    .filter((report) => getReportDateKey(report.event_time) === today)
                    .sort((a, b) => new Date(b.event_time) - new Date(a.event_time));

                setTrain(trainData);
                setReports(todaysReports);
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }

                console.error("Failed to load train details:", err);

                setError(err.message || "Failed to load train details.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadTrain();

        return () => controller.abort();
    }, [trainNumber, user, accessToken, authLoading]);

    /* =====================================================
       Train history
    ===================================================== */

    useEffect(() => {
        if (authLoading || !user || !accessToken) {
            return undefined;
        }

        const controller = new AbortController();

        async function loadHistory() {
            try {
                setHistoryLoading(true);

                const historyData = await getTrainHistory(trainNumber, historyDays, {
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                setHistory(historyData);
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }

                console.error("Failed to load train history:", err);

                if (!controller.signal.aborted) {
                    setHistory(null);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setHistoryLoading(false);
                }
            }
        }

        loadHistory();

        return () => controller.abort();
    }, [trainNumber, historyDays, user, accessToken, authLoading]);

    /* =====================================================
       Shared report highlighting
    ===================================================== */

    useEffect(() => {
        if (!highlightReportId || !reports.length) {
            return;
        }

        const reportExists = reports.some((report) => report.id === highlightReportId);

        if (!reportExists) {
            return;
        }

        setHighlightedReportId(highlightReportId);

        const timer = setTimeout(() => {
            const reportElement = document.querySelector(`[data-report-id="${highlightReportId}"]`);

            reportElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [highlightReportId, reports]);

    /* =====================================================
       Derived data
    ===================================================== */

    const routeSchedule = useMemo(() => buildRouteSchedule(train?.stops || []), [train?.stops]);

    const latestEtaReport = useMemo(
        () => reports.find((report) => report.event_type === "ARRIVED" || report.event_type === "DEPARTED") || null,
        [reports]
    );

    const etaStopMap = useMemo(() => getEtaStopMap(latestEtaReport), [latestEtaReport]);

    const originStop = useMemo(() => routeSchedule.rows[0] || null, [routeSchedule.rows]);

    const destinationStop = useMemo(() => {
        if (!routeSchedule.rows.length) {
            return null;
        }

        return routeSchedule.rows[routeSchedule.rows.length - 1];
    }, [routeSchedule.rows]);

    const destinationEta = useMemo(() => {
        if (!destinationStop) {
            return null;
        }

        return getEtaArrival(destinationStop, etaStopMap);
    }, [destinationStop, etaStopMap]);

    const showEta = useMemo(() => {
        if (!latestEtaReport || !destinationEta) {
            return false;
        }

        return isEtaStillActive(destinationEta);
    }, [latestEtaReport, destinationEta]);

    const historyItems = useMemo(() => {
        const items = Array.isArray(history?.history) ? history.history : [];

        return items.slice(0, historyDays);
    }, [history?.history, historyDays]);

    const latestReport = reports[0] || null;

    /* =====================================================
       Header data
       Header remains mounted even while train is loading.
    ===================================================== */

    const headerTitle = train?.name || `Train ${trainNumber}`;

    const headerSubtitle = train?.name_bn || "Train details";

    const offDay = train?.off_day?.trim() || "No off day";

    /* =====================================================
       Stable render tree

       IMPORTANT:
       No `if (!user) return null`.
       No loading early return.
       PageHeader stays mounted.
    ===================================================== */

    return (
        <div className={pageStyles.page}>
            <PageHeader title={headerTitle} subtitle={headerSubtitle}>
                {train && (
                    <div className={styles.headerMeta}>
                        <span className={styles.trainNumber}>{train.number}</span>

                        <span className={styles.metaPill}>{train.direction === "UP" ? "↑ UP" : "↓ DOWN"}</span>

                        <span className={styles.metaPill}>Off day: {offDay}</span>
                    </div>
                )}
            </PageHeader>

            <div className={styles.content}>
                <div className={pageStyles.contentInner}>
                    {/* =================================================
                        Authentication loading
                    ================================================= */}

                    {authLoading && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Loading train details...</span>
                        </div>
                    )}

                    {/* =================================================
                        Normal train loading
                    ================================================= */}

                    {!authLoading && loading && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Loading train details...</span>
                        </div>
                    )}

                    {/* =================================================
                        Error
                    ================================================= */}

                    {!authLoading && !loading && error && (
                        <div>
                            <div className={styles.errorState}>{error}</div>
                        </div>
                    )}

                    {/* =================================================
                        Train not found
                    ================================================= */}

                    {!authLoading && !loading && !error && !train && (
                        <div className={styles.errorState}>Train not found.</div>
                    )}

                    {/* =================================================
                        Main train details
                    ================================================= */}

                    {!authLoading && !loading && !error && train && (
                        <>
                            {/* Back navigation */}

                            <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                                <FiArrowLeft size={15} />

                                <span>Back to trains</span>
                            </button>

                            {/* Train hero */}

                            <section className={styles.trainHero}>
                                <div className={styles.heroGlow} />

                                <div className={styles.heroTop}>
                                    <div className={styles.trainBadge}>
                                        <FiNavigation size={17} />
                                    </div>

                                    <div className={styles.heroStatus}>
                                        <span className={styles.statusDot} />

                                        <span>Community tracked</span>
                                    </div>
                                </div>

                                <div className={styles.heroNumber}>{train.number}</div>

                                <div className={styles.heroName}>{train.name || `Train ${train.number}`}</div>

                                {train.name_bn && <div className={styles.heroNameBn}>{train.name_bn}</div>}

                                {originStop && destinationStop && (
                                    <div className={styles.heroJourney}>
                                        <div className={styles.heroStation}>
                                            <span>From</span>

                                            <strong>{getStationName(originStop.station)}</strong>
                                        </div>

                                        <div className={styles.heroArrow}>
                                            <FiArrowRight size={16} />
                                        </div>

                                        <div className={`${styles.heroStation} ${styles.heroStationRight}`}>
                                            <span>To</span>

                                            <strong>{getStationName(destinationStop.station)}</strong>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Journey snapshot */}

                            <section className={`${styles.section} ${styles.snapshotSection}`}>
                                <div className={styles.snapshotGrid}>
                                    <div className={styles.snapshotItem}>
                                        <span>Departure</span>

                                        <strong>
                                            {originStop ? formatScheduleTime(originStop.scheduled_departure) : "—"}
                                        </strong>
                                    </div>

                                    <div className={styles.snapshotDivider} />

                                    <div className={styles.snapshotItem}>
                                        <span>Arrival</span>

                                        <strong>
                                            {destinationStop
                                                ? formatScheduleTime(destinationStop.scheduled_arrival)
                                                : "—"}
                                        </strong>
                                    </div>

                                    <div className={styles.snapshotDivider} />

                                    <div className={styles.snapshotItem}>
                                        <span>Journey</span>

                                        <strong>
                                            {routeSchedule.totalDuration !== null
                                                ? formatDuration(routeSchedule.totalDuration)
                                                : "—"}
                                        </strong>
                                    </div>
                                </div>

                                {latestReport && (
                                    <div className={styles.latestActivity}>
                                        <div className={styles.latestActivityIcon}>
                                            <FiRadio size={13} />
                                        </div>

                                        <div className={styles.latestActivityContent}>
                                            <div className={styles.latestActivityLabel}>Latest community update</div>

                                            <div className={styles.latestActivityText}>
                                                {latestReport.event_type === "ARRIVED"
                                                    ? "Arrived"
                                                    : latestReport.event_type === "DEPARTED"
                                                      ? "Departed"
                                                      : "Train update"}

                                                {latestReport.station
                                                    ? ` · ${getStationName(latestReport.station)}`
                                                    : ""}
                                            </div>
                                        </div>

                                        <span className={styles.latestActivityTime}>
                                            {formatReportTime(latestReport.event_time)}
                                        </span>
                                    </div>
                                )}
                            </section>

                            {/* Journey history */}

                            <section className={`${styles.section} ${styles.historySection}`}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <div className={styles.sectionLabel}>Journey history</div>

                                        <h2 className={styles.sectionTitle}>Delay history</h2>
                                    </div>

                                    <div className={styles.historyInfo}>
                                        <FiInfo size={13} />

                                        <span>Hover a bar for details</span>
                                    </div>
                                </div>

                                <div className={styles.historySelector} role="group" aria-label="History range">
                                    {[7, 14].map((days) => (
                                        <button
                                            key={days}
                                            type="button"
                                            className={`${styles.historyOption} ${
                                                historyDays === days ? styles.historyOptionActive : ""
                                            }`}
                                            onClick={() => setHistoryDays(days)}
                                            aria-pressed={historyDays === days}
                                        >
                                            {days} days
                                        </button>
                                    ))}
                                </div>

                                <div
                                    className={`${styles.historyScroll} ${
                                        historyDays === 14 ? styles.historyScrollFourteen : ""
                                    }`}
                                >
                                    <div
                                        className={`${styles.historyChart} ${
                                            historyLoading ? styles.historyChartLoading : ""
                                        }`}
                                    >
                                        {historyItems.length ? (
                                            historyItems.map((day) => {
                                                const tooltip = getHistoryTooltip(day);

                                                return (
                                                    <div key={day.service_date} className={styles.historyColumn}>
                                                        <div className={styles.historyBarArea}>
                                                            <div
                                                                className={`${styles.historyBar} ${getHistoryBarClass(
                                                                    day
                                                                )}`}
                                                                style={{
                                                                    height: getHistoryBarHeight(day),
                                                                }}
                                                                title={tooltip}
                                                                aria-label={tooltip}
                                                            />
                                                        </div>

                                                        <div className={styles.historyDate}>
                                                            {formatHistoryDate(day.service_date)}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className={styles.historyEmpty}>No history available.</div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.historyLegend}>
                                    <span>
                                        <i className={`${styles.legendDot} ${styles.legendOnTime}`} />
                                        On time
                                    </span>

                                    <span>
                                        <i className={`${styles.legendDot} ${styles.legendLow}`} />
                                        1–44 min
                                    </span>

                                    <span>
                                        <i className={`${styles.legendDot} ${styles.legendHigh}`} />
                                        45+ min
                                    </span>
                                </div>
                            </section>

                            {/* Route */}

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <div className={styles.sectionLabel}>Route</div>

                                        <h2 className={styles.sectionTitle}>Schedule</h2>
                                    </div>

                                    {routeSchedule.totalDuration !== null && (
                                        <div className={styles.totalDuration}>
                                            <FiClock size={13} />

                                            <span>{formatDuration(routeSchedule.totalDuration)}</span>
                                        </div>
                                    )}
                                </div>

                                {showEta && (
                                    <div className={styles.etaDisclaimer}>
                                        <FiInfo size={12} />

                                        <span>
                                            ETA is estimated from the latest community report and may vary with actual
                                            train movement.
                                        </span>
                                    </div>
                                )}

                                {routeSchedule.rows.length ? (
                                    <div className={styles.routeTimeline}>
                                        {routeSchedule.rows.map((stop, index) => {
                                            const station = stop.station;

                                            const isOrigin = index === 0;

                                            const isDestination = index === routeSchedule.rows.length - 1;

                                            const etaArrival = showEta ? getEtaArrival(stop, etaStopMap) : null;

                                            const etaDeparture = showEta ? getEtaDeparture(stop, etaStopMap) : null;

                                            return (
                                                <div
                                                    key={`${train.id}-${stop.stop_order}`}
                                                    className={styles.routeItem}
                                                >
                                                    <div className={styles.routeRail}>
                                                        <div
                                                            className={`${styles.stationMarker} ${
                                                                isOrigin ? styles.stationOrigin : ""
                                                            } ${isDestination ? styles.stationDestination : ""}`}
                                                        >
                                                            {stop.stop_order}
                                                        </div>

                                                        {!isDestination && <div className={styles.railLine} />}
                                                    </div>

                                                    <div className={styles.routeContent}>
                                                        <div className={styles.stationTop}>
                                                            <div className={styles.stationNames}>
                                                                <div className={styles.stationName}>
                                                                    {getStationName(station)}
                                                                </div>

                                                                {getStationEnglishName(station) && (
                                                                    <div className={styles.stationNameEn}>
                                                                        {station.name_en}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <span className={styles.stopNumber}>
                                                                STOP {stop.stop_order}
                                                            </span>
                                                        </div>

                                                        <div className={styles.scheduleTimes}>
                                                            <div className={styles.scheduleTime}>
                                                                <span>Arrival</span>

                                                                <strong>
                                                                    {formatScheduleTime(stop.scheduled_arrival)}
                                                                </strong>

                                                                {etaArrival && (
                                                                    <small className={styles.etaTime}>
                                                                        ETA {etaArrival}
                                                                    </small>
                                                                )}
                                                            </div>

                                                            <div className={styles.scheduleTime}>
                                                                <span>Departure</span>

                                                                <strong>
                                                                    {formatScheduleTime(stop.scheduled_departure)}
                                                                </strong>

                                                                {etaDeparture && (
                                                                    <small className={styles.etaTime}>
                                                                        ETD {etaDeparture}
                                                                    </small>
                                                                )}
                                                            </div>

                                                            {stop.haltMinutes !== null && (
                                                                <div className={styles.haltTime}>
                                                                    <FiClock size={11} />

                                                                    <span>{formatDuration(stop.haltMinutes)} halt</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>No stop information available.</div>
                                )}
                            </section>

                            {/* Community reports */}

                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <div className={styles.sectionLabel}>Today</div>

                                        <h2 className={styles.sectionTitle}>Community reports</h2>
                                    </div>

                                    <div className={styles.reportCount}>
                                        {reports.length} {reports.length === 1 ? "report" : "reports"}
                                    </div>
                                </div>

                                {reports.length ? (
                                    <div className={styles.reportsList}>
                                        {reports.map((report) => (
                                            <div
                                                key={report.id}
                                                data-report-id={report.id}
                                                className={`${styles.reportCard} ${
                                                    highlightedReportId === report.id
                                                        ? styles.reportCardHighlighted
                                                        : ""
                                                }`}
                                            >
                                                <div className={styles.reportIcon}>
                                                    <FiMessageCircle size={14} />
                                                </div>

                                                <div className={styles.reportContent}>
                                                    <div className={styles.reportTop}>
                                                        <div className={styles.reportEvent}>
                                                            {report.event_type === "ARRIVED"
                                                                ? "Arrived"
                                                                : report.event_type === "DEPARTED"
                                                                  ? "Departed"
                                                                  : "Update"}
                                                        </div>

                                                        <div className={styles.reportTime}>
                                                            {formatReportTime(report.event_time)}
                                                        </div>
                                                    </div>

                                                    {report.station && (
                                                        <div className={styles.reportStationWrap}>
                                                            <FiMapPin size={11} />

                                                            <div>
                                                                <div className={styles.reportStation}>
                                                                    {getStationName(report.station)}
                                                                </div>

                                                                {getStationEnglishName(report.station) && (
                                                                    <div className={styles.reportStationEn}>
                                                                        {report.station.name_en}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {report.note && (
                                                        <div className={styles.reportNote}>{report.note}</div>
                                                    )}

                                                    {typeof report.delay_minutes === "number" && (
                                                        <div
                                                            className={`${styles.reportDelay} ${
                                                                report.delay_minutes >= 45
                                                                    ? styles.reportDelayHigh
                                                                    : report.delay_minutes > 0
                                                                      ? styles.reportDelayLow
                                                                      : styles.reportDelayOnTime
                                                            }`}
                                                        >
                                                            {report.delay_minutes > 0
                                                                ? `+${formatDuration(report.delay_minutes)} late`
                                                                : "On time"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>No reports for this train today.</div>
                                )}
                            </section>
                        </>
                    )}

                    <PageFooter />

                </div>
            </div>
        </div>
    );
}

export default TrainDetails;