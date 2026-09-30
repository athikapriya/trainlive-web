import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiInfo, FiMapPin, FiMessageCircle } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import PageHeader from "../../layouts/PageHeader/PageHeader";

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

        /* Handle overnight journeys */
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

    const { user, accessToken } = useAuth();

    const [train, setTrain] = useState(null);
    const [history, setHistory] = useState(null);
    const [reports, setReports] = useState([]);

    const [historyDays, setHistoryDays] = useState(7);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login", {
                replace: true,
                state: {
                    from: `/trains/${trainNumber}`,
                },
            });
        }
    }, [user, trainNumber, navigate]);

    useEffect(() => {
        if (!user || !accessToken) {
            return undefined;
        }

        const controller = new AbortController();

        async function loadTrain() {
            try {
                setLoading(true);
                setError("");

                const trainData = await getTrain(trainNumber);

                if (controller.signal.aborted) return;

                const reportsData = await getTrainReports(trainData.id, {
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                const allReports = Array.isArray(reportsData) ? reportsData : reportsData?.results || [];

                const today = getTodayDateKey();

                const todaysReports = allReports
                    .filter((report) => getReportDateKey(report.event_time) === today)
                    .sort((a, b) => new Date(b.event_time) - new Date(a.event_time));

                setTrain(trainData);
                setReports(todaysReports);
            } catch (err) {
                if (err.name === "AbortError") return;

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
    }, [trainNumber, user, accessToken]);

    useEffect(() => {
        if (!user || !accessToken) {
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

                if (controller.signal.aborted) return;

                setHistory(historyData);
            } catch (err) {
                if (err.name === "AbortError") return;

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
    }, [trainNumber, historyDays, user, accessToken]);

    const routeSchedule = useMemo(() => {
        return buildRouteSchedule(train?.stops || []);
    }, [train?.stops]);

    const historyItems = useMemo(() => {
        const items = Array.isArray(history?.history) ? history.history : [];

        return items.slice(0, historyDays);
    }, [history?.history, historyDays]);

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className={pageStyles.page}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <span>Loading train details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={pageStyles.page}>
                <PageHeader title="Train details" subtitle="Unable to load this train" />

                <div className={pageStyles.content}>
                    <div className={pageStyles.contentInner}>
                        <div className={styles.errorState}>{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!train) {
        return (
            <div className={pageStyles.page}>
                <PageHeader title="Train details" subtitle="Train not found" />

                <div className={pageStyles.content}>
                    <div className={pageStyles.contentInner}>
                        <div className={styles.errorState}>Train not found.</div>
                    </div>
                </div>
            </div>
        );
    }

    const offDay = train.off_day?.trim() ? train.off_day : "No off day";

    return (
        <div className={pageStyles.page}>
            <PageHeader title={train.name || `Train ${train.number}`} subtitle={train.name_bn || ""}>
                <div className={styles.headerMeta}>
                    <span className={styles.trainNumber}>{train.number}</span>

                    <span className={styles.metaPill}>{train.direction === "UP" ? "↑ UP" : "↓ DOWN"}</span>

                    <span className={styles.metaPill}>Off day: {offDay}</span>
                </div>
            </PageHeader>

            <div className={pageStyles.content}>
                <div className={pageStyles.contentInner}>
                    <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={14} />
                        <span>Back to trains</span>
                    </button>

                    {/* =================================================
                        Journey history
                    ================================================= */}

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
                                className={`${styles.historyChart} ${historyLoading ? styles.historyChartLoading : ""}`}
                            >
                                {historyItems.length ? (
                                    historyItems.map((day) => {
                                        const tooltip = getHistoryTooltip(day);

                                        return (
                                            <div key={day.service_date} className={styles.historyColumn}>
                                                <div className={styles.historyBarArea}>
                                                    <div
                                                        className={`${styles.historyBar} ${getHistoryBarClass(day)}`}
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

                    {/* =================================================
                        Route schedule
                    ================================================= */}

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

                        {routeSchedule.rows.length ? (
                            <div className={styles.routeTable}>
                                <div className={styles.routeHeader}>
                                    <div>Station</div>
                                    <div>Arrival</div>
                                    <div>Halt</div>
                                    <div>Departure</div>
                                </div>

                                <div className={styles.routeRows}>
                                    {routeSchedule.rows.map((stop, index) => {
                                        const station = stop.station;

                                        return (
                                            <div key={`${train.id}-${stop.stop_order}`} className={styles.routeRow}>
                                                <div className={styles.stationCell}>
                                                    <div
                                                        className={`${styles.stationNumber} ${
                                                            index === 0
                                                                ? styles.stationOrigin
                                                                : index === routeSchedule.rows.length - 1
                                                                  ? styles.stationDestination
                                                                  : ""
                                                        }`}
                                                    >
                                                        {stop.stop_order}
                                                    </div>

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
                                                </div>

                                                <div className={styles.timeCell}>
                                                    {formatScheduleTime(stop.scheduled_arrival)}
                                                </div>

                                                <div className={styles.haltCell}>
                                                    {stop.haltMinutes !== null ? formatDuration(stop.haltMinutes) : "—"}
                                                </div>

                                                <div className={styles.timeCell}>
                                                    {formatScheduleTime(stop.scheduled_departure)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No stop information available.</div>
                        )}
                    </section>

                    {/* =================================================
                        Community reports
                    ================================================= */}

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
                                    <div key={report.id} className={styles.reportCard}>
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

                                            {report.note && <div className={styles.reportNote}>{report.note}</div>}

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
                </div>
            </div>
        </div>
    );
}

export default TrainDetails;