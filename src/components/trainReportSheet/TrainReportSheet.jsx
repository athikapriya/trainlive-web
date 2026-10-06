import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown, FiShare2 } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import { getReportVote, voteOnReport } from "../../services/reportApi";
import { getTrainReports } from "../../services/trainApi";
import { getSavedTrains, saveTrain, deleteSavedTrain } from "../../services/savedApi";
import styles from "../../styles/reports/ReportSheet.module.css";
import { getEventLabel, getEventClass, getDelayInfo } from "../reports/reportUtils";
import RelativeTime from "../common/RelativeTime";

function getStationCode(station) {
    const englishName = station?.name_en?.trim();

    if (englishName) {
        return englishName.slice(0, 3).toUpperCase();
    }

    const banglaName = station?.name?.trim();

    if (banglaName) {
        return banglaName.slice(0, 1);
    }

    return "—";
}

function getReportTitle(report) {
    const stationName = report?.station?.name?.trim();

    if (stationName) {
        return stationName;
    }

    return "Update";
}

function TrainReportSheet({ train, reports: initialReports = [], highlightReportId = null, onClose }) {
    const navigate = useNavigate();
    const { isAuthenticated, accessToken } = useAuth();

    const [reports, setReports] = useState(initialReports);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedReport, setExpandedReport] = useState(null);
    const [votes, setVotes] = useState({});
    const [isSaved, setIsSaved] = useState(false);
    const [savedTrainId, setSavedTrainId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [votingReport, setVotingReport] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!train?.id) {
            setReports([]);
            return;
        }

        const controller = new AbortController();

        const fetchReports = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setExpandedReport(null);

                const data = await getTrainReports(train.id, {
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                setReports(Array.isArray(data) ? data : []);
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Train reports failed:", error);
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
    }, [train, accessToken]);

    useEffect(() => {
        if (!train?.id) {
            setReports([]);
            return;
        }

        if (initialReports.length > 0) {
            setReports(initialReports);
        }
    }, [train?.id, initialReports]);

    useEffect(() => {
        if (!highlightReportId || !reports.length || !isAuthenticated) {
            return;
        }

        const reportExists = reports.some((report) => report.id === highlightReportId);

        if (reportExists) {
            setExpandedReport(highlightReportId);
        }
    }, [highlightReportId, reports, isAuthenticated]);

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
        if (!train?.id || !isAuthenticated || !accessToken) {
            setIsSaved(false);
            setSavedTrainId(null);
            return;
        }

        const controller = new AbortController();

        const loadSavedTrain = async () => {
            try {
                const data = await getSavedTrains({
                    accessToken,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) {
                    return;
                }

                const savedList = data.results || data || [];

                const saved = savedList.find((item) => Number(item.train) === Number(train.id));

                if (saved) {
                    setIsSaved(true);
                    setSavedTrainId(saved.id);
                } else {
                    setIsSaved(false);
                    setSavedTrainId(null);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error("Saved train loading failed:", error);
                console.error("Saved train error data:", error.data);

                setIsSaved(false);
                setSavedTrainId(null);
            }
        };

        loadSavedTrain();

        return () => {
            controller.abort();
        };
    }, [train, isAuthenticated, accessToken]);

    const handleLogin = () => {
        if (!train?.number) {
            navigate("/login");
            return;
        }

        navigate(`/login?train=${encodeURIComponent(train.number)}`);
    };

    const handleShareReport = async (report) => {
        const url = `${window.location.origin}/reports/${report.id}`;

        const title = `${report.train?.name || train?.name || "TrainLive"} report`;

        const text = report.note?.trim()
            ? report.note
            : `Community report for ${train?.name || `Train ${train?.number || ""}`}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text,
                    url,
                });

                return;
            }

            await navigator.clipboard.writeText(url);
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error("Share report failed:", error);
        }
    };

    const handleSaveTrain = async () => {
        if (isSaving || !train?.id) {
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

            if (isSaved && savedTrainId) {
                await deleteSavedTrain(savedTrainId, {
                    accessToken,
                });

                setIsSaved(false);
                setSavedTrainId(null);

                return;
            }

            const saved = await saveTrain(train.id, {
                accessToken,
            });

            setIsSaved(true);
            setSavedTrainId(saved.id);
        } catch (error) {
            console.error("Save train failed:", error);
            console.error("Save train error data:", error.data);

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

            await voteOnReport(report.id, vote, {
                accessToken,
            });

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

    const handleClose = () => {
        setIsClosing(true);

        setTimeout(() => {
            onClose();
        }, 300);
    };

    const reportCount = reports.length;

    return (
        <div className={`${styles.wrapper} ${isClosing ? styles.closing : ""}`}>
            <section className={styles.sheet}>
                <div className={styles.handle} />

                {/* Train header */}
                <div className={styles.header}>
                    <div className={styles.stationInfo}>
                        <div className={styles.stationTitleRow}>
                            <span className={styles.stationDot} />
                            <h2>{train?.name}</h2>
                        </div>

                        {train?.name_bn && <p>{train.name_bn}</p>}
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
                            onClick={handleSaveTrain}
                            disabled={isSaving}
                            aria-label={
                                isAuthenticated ? (isSaved ? "Unsave train" : "Save train") : "Sign in to save train"
                            }
                            title={
                                isAuthenticated ? (isSaved ? "Unsave train" : "Save train") : "Sign in to save train"
                            }
                        >
                            {isSaved ? "★" : "☆"}
                        </button>

                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={handleClose}
                            aria-label="Close train details"
                        >
                            <FiChevronDown size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.reportHeading}>
                        <div>
                            <div className={styles.headingTitleRow}>
                                <span className={styles.headingTitle}>Live reports</span>

                                <span className={styles.infoWrapper}>
                                    <span className={styles.infoIcon} tabIndex={0} aria-label="About community reports">
                                        i
                                    </span>

                                    <span className={styles.infoTooltip}>
                                        <strong>Community-based reports</strong>

                                        <span>
                                            These reports are shared by TrainLive users and may not always be accurate.
                                            <br />
                                            Please vote ✓ if the report is correct and ✕ if it is incorrect.
                                            <br />
                                            ETA is estimated from the latest community report and may vary with actual
                                            train movement.
                                        </span>

                                        <span className={styles.infoBangla}>কমিউনিটি-ভিত্তিক রিপোর্ট</span>

                                        <span>
                                            এই রিপোর্টগুলো TrainLive ব্যবহারকারীদের শেয়ার করা তথ্যের ভিত্তিতে তৈরি এবং
                                            সবসময় সঠিক নাও হতে পারে।
                                            <br />
                                            রিপোর্টটি সঠিক হলে ✓ এবং ভুল হলে ✕ ভোট দিন।
                                            <br />
                                            ETA সর্বশেষ কমিউনিটি রিপোর্টের ভিত্তিতে আনুমানিক; ট্রেনের প্রকৃত চলাচলের
                                            কারণে সময় পরিবর্তিত হতে পারে।
                                        </span>
                                    </span>
                                </span>
                            </div>

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
                            <div className={styles.emptyIcon}>🚆</div>

                            <h3>No reports yet</h3>

                            <p>Be the first to share update on this train.</p>
                        </div>
                    )}

                    {!isLoading && !error && reports.length > 0 && (
                        <div className={styles.reportList}>
                            {reports.map((report) => {
                                const station = report.station;

                                if (!isAuthenticated) {
                                    return (
                                        <article key={report.id} className={styles.reportCard}>
                                            <div className={styles.reportMain}>
                                                <div className={styles.trainIcon}>
                                                    <span>{getStationCode(station)}</span>
                                                </div>

                                                <div className={styles.reportInfo}>
                                                    <div className={styles.reportTop}>
                                                        <strong>{getReportTitle(report)}</strong>
                                                    </div>

                                                    {station?.name_en && (
                                                        <div className={styles.trainMeta}>{station.name_en}</div>
                                                    )}

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

                                const isExpanded = expandedReport === report.id;

                                const delay = report.event_type !== "UPDATE" ? getDelayInfo(report, styles) : null;

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
                                    <article
                                        key={report.id}
                                        className={`${styles.reportCard} ${isExpanded ? styles.expanded : ""}`}
                                    >
                                        <div
                                            className={styles.reportMain}
                                            onClick={() => toggleReport(report.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    toggleReport(report.id);
                                                }
                                            }}
                                        >
                                            <div className={styles.trainIcon}>
                                                <span>{getStationCode(station)}</span>
                                            </div>

                                            <div className={styles.reportInfo}>
                                                <div className={styles.reportTop}>
                                                    <strong>{getReportTitle(report)}</strong>

                                                    <div className={styles.reportTopActions}>
                                                        <span
                                                            className={`${styles.eventPill} ${getEventClass(
                                                                report.event_type,
                                                                styles
                                                            )}`}
                                                        >
                                                            {getEventLabel(report.event_type)}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className={styles.shareButton}
                                                            aria-label="Share report"
                                                            title="Share report"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleShareReport(report);
                                                            }}
                                                        >
                                                            <FiShare2 size={15} strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {station?.name_en && (
                                                    <div className={styles.trainMeta}>{station.name_en}</div>
                                                )}

                                                <div className={styles.reportMeta}>
                                                    {report.event_time_display}

                                                    {report.event_time_ago && (
                                                        <>
                                                            <span>·</span>

                                                            <RelativeTime timestamp={report.event_time} />
                                                        </>
                                                    )}
                                                </div>

                                                {report.note?.trim() && report.event_type !== "UPDATE" && (
                                                    <div className={styles.reportNotePreview}>
                                                        <span>Update:</span> {report.note}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.expandButton}>
                                                <FiChevronDown
                                                    size={18}
                                                    strokeWidth={2}
                                                    className={
                                                        isExpanded ? styles.expandIconExpanded : styles.expandIcon
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {report.event_type !== "UPDATE" && (
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
                                        )}

                                        {(() => {
                                            const currentStationId = report.station?.id;

                                            const stops = report.eta?.stops || [];

                                            const currentStopIndex = stops.findIndex(
                                                (stop) => Number(stop.station?.id) === Number(currentStationId)
                                            );

                                            const nextStop =
                                                currentStopIndex !== -1 ? stops[currentStopIndex + 1] : null;

                                            if (!nextStop) {
                                                return null;
                                            }

                                            return (
                                                <div className={styles.nextStopRow}>
                                                    <div className={styles.nextStopInfo}>
                                                        <span className={styles.nextStop}>
                                                            Next stop:{" "}
                                                            {nextStop.station?.name_en || nextStop.station?.name}
                                                        </span>

                                                        {nextStop.eta_arrival && (
                                                            <span className={styles.nextStopEta}>
                                                                ETA: {nextStop.eta_arrival}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {report.train?.number && (
                                                        <Link
                                                            to={`/trains/${encodeURIComponent(report.train.number)}`}
                                                            className={styles.trainDetailsLink}
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            Train details →
                                                        </Link>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        <div className={styles.reportBangla}>
                                            {report.event_type === "UPDATE" && report.note?.trim() ? (
                                                <div className={styles.statusSummary}>
                                                    <div className={styles.updateSummary}>{report.note}</div>
                                                </div>
                                            ) : (
                                                report.status_summary?.text && (
                                                    <div className={styles.statusSummary}>
                                                        <div>{report.status_summary.text}</div>

                                                        {report.status_summary.next_station_text && (
                                                            <div>{report.status_summary.next_station_text}</div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className={styles.voteRow}>
                                            <span className={styles.voteLabel}>Accurate?</span>

                                            <button
                                                type="button"
                                                className={`${styles.voteButton} ${
                                                    myVote === "RIGHT" ? styles.rightSelected : ""
                                                }`}
                                                disabled={votingReport === report.id}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleVote(report, "RIGHT");
                                                }}
                                            >
                                                ✓<span>সঠিক</span>
                                                <b>{rightVotes}</b>
                                            </button>

                                            <button
                                                type="button"
                                                className={`${styles.voteButton} ${
                                                    myVote === "WRONG" ? styles.wrongSelected : ""
                                                }`}
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

                                                    {report.event_type !== "UPDATE" && (
                                                        <div className={styles.detailItem}>
                                                            <span>Delay</span>

                                                            <strong>{delay.label}</strong>
                                                        </div>
                                                    )}
                                                </div>

                                                {report.note?.trim() && (
                                                    <div className={styles.note}>
                                                        <span>Traveller note</span>

                                                        <p>{report.note}</p>
                                                    </div>
                                                )}

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

export default TrainReportSheet;
