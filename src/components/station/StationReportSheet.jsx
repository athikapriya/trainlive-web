import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { IoInformationCircle } from "react-icons/io5";

import useAuth from "../../hooks/useAuth";
import { getStationReports, getReportVote, voteOnReport } from "../../services/reportApi";
import { getSavedStations, saveStation, deleteSavedStation } from "../../services/savedApi";
import styles from "../../styles/reports/ReportSheet.module.css";
import { getEventLabel, getEventClass, getDelayInfo } from "../../components/reports/reportUtils";
import RelativeTime from "../../components/common/RelativeTime";

function StationReportSheet({ station, onClose }) {
    const navigate = useNavigate();
    const { isAuthenticated, accessToken } = useAuth();

    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedReport, setExpandedReport] = useState(null);
    const [votes, setVotes] = useState({});
    const [isSaved, setIsSaved] = useState(false);
    const [savedStationId, setSavedStationId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [votingReport, setVotingReport] = useState(null);

    useEffect(() => {
        if (!station?.id) {
            return;
        }

        const controller = new AbortController();

        const fetchReports = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setReports([]);
                setExpandedReport(null);

                const data = await getStationReports(station.id, {
                    accessToken,
                    signal: controller.signal,
                });

                setReports(data.results || []);
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Station reports failed:", error);
                setError("LOAD_FAILED");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchReports();

        return () => {
            controller.abort();
        };
    }, [station, accessToken]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken || !reports.length) {
            setVotes({});
            return;
        }

        const controller = new AbortController();

        const loadVotes = async () => {
            const voteEntries = await Promise.all(
                reports.map(async (report) => {
                    try {
                        const data = await getReportVote(report.id, {
                            accessToken,
                            signal: controller.signal,
                        });

                        return [report.id, data.vote];
                    } catch (error) {
                        if (error.name === "AbortError") {
                            return null;
                        }

                        return [report.id, null];
                    }
                })
            );

            if (controller.signal.aborted) {
                return;
            }

            const nextVotes = {};

            voteEntries.forEach((entry) => {
                if (!entry) {
                    return;
                }

                const [reportId, vote] = entry;
                nextVotes[reportId] = vote;
            });

            setVotes(nextVotes);
        };

        loadVotes();

        return () => {
            controller.abort();
        };
    }, [reports, isAuthenticated, accessToken]);

    useEffect(() => {
        if (!station?.id || !isAuthenticated || !accessToken) {
            setIsSaved(false);
            setSavedStationId(null);
            return;
        }

        const controller = new AbortController();

        const loadSavedStation = async () => {
            try {
                const data = await getSavedStations({
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                const savedList = data.results || data || [];
                const saved = savedList.find((item) => Number(item.station) === Number(station.id));

                if (saved) {
                    setIsSaved(true);
                    setSavedStationId(saved.id);
                } else {
                    setIsSaved(false);
                    setSavedStationId(null);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Saved station loading failed:", error);
                console.error("Saved station error data:", error.data);
                setIsSaved(false);
                setSavedStationId(null);
            }
        };

        loadSavedStation();

        return () => {
            controller.abort();
        };
    }, [station, isAuthenticated, accessToken]);

    const handleLogin = () => {
        if (!station?.id) {
            navigate("/login");
            return;
        }

        navigate(`/login?station=${encodeURIComponent(station.id)}`);
    };

    const handleSaveStation = async () => {
        if (isSaving || !station?.id) {
            return;
        }

        if (!isAuthenticated) {
            handleLogin();
            return;
        }

        if (!accessToken) {
            return;
        }

        try {
            setIsSaving(true);

            if (isSaved && savedStationId) {
                await deleteSavedStation(savedStationId, { accessToken });
                setIsSaved(false);
                setSavedStationId(null);
                return;
            }

            const saved = await saveStation(station.id, { accessToken });

            setIsSaved(true);
            setSavedStationId(saved.id);
        } catch (error) {
            console.error("Save station failed:", error);
            console.error("Save station error data:", error.data);

            if (error.status === 401) {
                handleLogin();
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleVote = async (report, vote) => {
        if (!isAuthenticated) {
            handleLogin();
            return;
        }

        if (!accessToken) {
            return;
        }

        const currentVote = votes[report.id];

        if (currentVote === vote || votingReport === report.id) {
            return;
        }

        try {
            setVotingReport(report.id);

            await voteOnReport(report.id, vote, { accessToken });

            setVotes((current) => ({
                ...current,
                [report.id]: vote,
            }));

            setReports((current) =>
                current.map((item) => {
                    if (item.id !== report.id) {
                        return item;
                    }

                    const previousVote = currentVote;
                    let rightVotes = item.right_votes || 0;
                    let wrongVotes = item.wrong_votes || 0;

                    if (previousVote === "RIGHT") {
                        rightVotes--;
                    }

                    if (previousVote === "WRONG") {
                        wrongVotes--;
                    }

                    if (vote === "RIGHT") {
                        rightVotes++;
                    }

                    if (vote === "WRONG") {
                        wrongVotes++;
                    }

                    const total = rightVotes + wrongVotes;
                    const trust = total > 0 ? Math.round((rightVotes / total) * 100) : null;

                    return {
                        ...item,
                        right_votes: rightVotes,
                        wrong_votes: wrongVotes,
                        total_votes: total,
                        trust_percentage: trust,
                    };
                })
            );
        } catch (error) {
            console.error("Report vote failed:", error);
        } finally {
            setVotingReport(null);
        }
    };

    const toggleReport = (reportId) => {
        if (!isAuthenticated) {
            return;
        }

        setExpandedReport((current) => (current === reportId ? null : reportId));
    };

    const reportCount = reports.length;

    return (
        <div className={styles.wrapper}>
            <section className={styles.sheet}>
                <div className={styles.handle} />

                {/* Station header */}
                <div className={styles.header}>
                    <div className={styles.stationInfo}>
                        <div className={styles.stationTitleRow}>
                            <span className={styles.stationDot} />
                            <h2>{station.name}</h2>
                        </div>

                        {station.name_en && <p>{station.name_en}</p>}
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
                            onClick={handleSaveStation}
                            disabled={isSaving}
                            aria-label={
                                isAuthenticated
                                    ? isSaved
                                        ? "Unsave station"
                                        : "Save station"
                                    : "Sign in to save station"
                            }
                            title={
                                isAuthenticated
                                    ? isSaved
                                        ? "Unsave station"
                                        : "Save station"
                                    : "Sign in to save station"
                            }
                        >
                            {isSaved ? "★" : "☆"}
                        </button>

                        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close station details" >
                            <FiChevronDown size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.reportHeading}>
                        <div>
                            <span className={styles.headingTitle}>Live reports</span>
                            <span className={styles.headingSubtitle}>Community updates</span>
                        </div>

                        <span className={styles.reportCount}>{reportCount}</span>
                    </div> 


                    {isLoading && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <span>Loading reports...</span>
                        </div>
                    )}

                    {!isLoading && error === "LOAD_FAILED" && (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>⚠️</div>
                            <h3>Unable to load reports</h3>
                        </div>
                    )}

                    {!isLoading && !error && reports.length === 0 && (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📍</div>
                            <h3>No reports today</h3>
                            <p>No one has reported an update from this station today.</p>
                        </div>
                    )}

                    {!isLoading && !error && reports.length > 0 && (
                        <div className={styles.reportList}>
                            {reports.map((report) => {
                                if (!isAuthenticated) {
                                    return (
                                        <article key={report.id} className={styles.reportCard}>
                                            <div className={styles.reportMain}>
                                                <div className={styles.trainIcon}>
                                                    <span>{report.train?.number}</span>
                                                </div>

                                                <div className={styles.reportInfo}>
                                                    <div className={styles.reportTop}>
                                                        <div>
                                                            <strong>{report.train?.name}</strong>
                                                            {report.train?.name_bn && (
                                                                <span className={styles.trainNameBn}>
                                                                    {report.train.name_bn}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={styles.trainMeta}>Train {report.train?.number}</div>

                                                    <div className={styles.reportMeta}>
                                                        Reported {report.event_time_ago}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.guestReportPrompt}>
                                                <span className={styles.guestReportLock}>🔒</span>

                                                <span>
                                                    Please{" "}
                                                    <button
                                                        type="button"
                                                        className={styles.guestLoginLink}
                                                        onClick={handleLogin}
                                                    >
                                                        sign in
                                                    </button>{" "}
                                                    to see report details.
                                                </span>
                                            </div>
                                        </article>
                                    );
                                }

                                /* Authenticated report */
                                const isExpanded = expandedReport === report.id;
                                const delay = getDelayInfo(report, styles);
                                const myVote = votes[report.id];

                                const rightVotes = report.right_votes || 0;
                                const wrongVotes = report.wrong_votes || 0;
                                const totalVotes = rightVotes + wrongVotes;

                                const trust =
                                    report.trust_percentage !== null
                                        ? report.trust_percentage
                                        : totalVotes > 0
                                          ? Math.round((rightVotes / totalVotes) * 100)
                                          : null;

                                return (
                                    <article key={report.id} className={`${styles.reportCard} ${isExpanded ? styles.expanded : ""}`}>
                                        <button type="button" className={styles.reportMain} onClick={() => toggleReport(report.id)}>
                                            <div className={styles.trainIcon}>
                                                <span>{report.train?.number}</span>
                                            </div>

                                            <div className={styles.reportInfo}>
                                                <div className={styles.reportTop}>
                                                    <div>
                                                        <strong>{report.train?.name}</strong>

                                                        {report.train?.name_bn && (
                                                            <span className={styles.trainNameBn}>
                                                                {report.train.name_bn}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className={`${styles.eventPill} ${getEventClass(report.event_type, styles)}`}>
                                                        {getEventLabel(report.event_type)}
                                                    </span>
                                                </div>

                                                <div className={styles.trainMeta}>Train {report.train?.number}</div>

                                                <div className={styles.reportMeta}>
                                                    {report.event_time_display}

                                                    {report.event_time_ago && (
                                                        <>
                                                            <span>·</span>
                                                            <RelativeTime timestamp={report.event_time} />
                                                        </>
                                                    )}
                                                </div>

                                                {report.note?.trim() && (
                                                    <div className={styles.reportNotePreview}>
                                                        <span>Update:</span> {report.note}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.expandButton}>
                                                <FiChevronDown size={18} strokeWidth={2} className={ isExpanded ? styles.expandIconExpanded : styles.expandIcon } />
                                            </div>
                                        </button>

                                        {/* Delay */}
                                        <div className={styles.statusRow}>
                                            <span className={`${styles.delayBadge} ${delay.className}`}>
                                                {delay.label}
                                            </span>

                                            {report.scheduled_time && (
                                                <span className={styles.scheduled}>
                                                    Scheduled {report.scheduled_time}
                                                </span>
                                            )}
                                        </div>

                                        {/* Vote row */}
                                        <div className={styles.voteRow}>
                                            <span className={styles.voteLabel}>Accurate?</span>

                                            <button type="button" className={`${styles.voteButton} ${myVote === "RIGHT" ? styles.rightSelected : ""}`}
                                                disabled={votingReport === report.id}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleVote(report, "RIGHT");
                                                }}
                                            >
                                                ✓<span>সঠিক</span>
                                                <b>{rightVotes}</b>
                                            </button>

                                            <button type="button" className={`${styles.voteButton} ${myVote === "WRONG" ? styles.wrongSelected : ""}`}
                                                disabled={votingReport === report.id}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleVote(report, "WRONG");
                                                }}
                                            >
                                                ✕<span>ভুল</span>
                                                <b>{wrongVotes}</b>
                                            </button>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className={styles.expandedContent}>
                                                <div className={styles.detailGrid}>
                                                    <div className={styles.detailItem}>
                                                        <span>Event</span>
                                                        <strong>{getEventLabel(report.event_type)}</strong>
                                                    </div>

                                                    <div className={styles.detailItem}>
                                                        <span>Reported</span>
                                                        <strong>{report.event_time_display}</strong>
                                                    </div>

                                                    <div className={styles.detailItem}>
                                                        <span>Scheduled</span>
                                                        <strong>{report.scheduled_time || "—"}</strong>
                                                    </div>

                                                    <div className={styles.detailItem}>
                                                        <span>Delay</span>
                                                        <strong>{delay.label}</strong>
                                                    </div>
                                                </div>

                                                {/* Traveller note */}
                                                {report.note?.trim() && (
                                                    <div className={styles.note}>
                                                        <span>Traveller note</span>
                                                        <p>{report.note}</p>
                                                    </div>
                                                )}

                                                {/* Community trust */}
                                                <div className={styles.trustCard}>
                                                    <div className={styles.trustHeader}>
                                                        <div>
                                                            <span>Community trust</span>
                                                            <small>Based on traveller votes</small>
                                                        </div>

                                                        <strong>{trust !== null ? `${trust}%` : "—"}</strong>
                                                    </div>

                                                    <div className={styles.trustBar}>
                                                        <div
                                                            className={styles.trustProgress}
                                                            style={{
                                                                width: trust !== null ? `${trust}%` : "0%",
                                                            }}
                                                        />
                                                    </div>

                                                    <div className={styles.trustStats}>
                                                        <span>✓ {rightVotes} সঠিক</span>
                                                        <span>✕ {wrongVotes} ভুল</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default StationReportSheet;