import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiSearch, FiShare2, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import { getRecentReports, getReportVote, voteOnReport } from "../../services/reportApi";

import PageHeader from "../../layouts/PageHeader/PageHeader";
import GuestReportCard from "../../components/reports/GuestReportCard";
import ReportCard from "../../components/reports/ReportCard";

import { getDelayInfo, getEventClass, getEventLabel } from "../../components/reports/reportUtils";

import RelativeTime from "../../components/common/RelativeTime";

import pageStyles from "../../styles/page.module.css";
import styles from "./Reports.module.css";
import reportStyles from "../../styles/reports/ReportSheet.module.css";

function getTrainNumber(report) {
    return report?.train?.number?.toString().trim() || "";
}

function getTrainName(report) {
    return report?.train?.name?.toString().trim() || "";
}

function getTrainNameBn(report) {
    return report?.train?.name_bn?.toString().trim() || "";
}

function getStationName(report) {
    return report?.station?.name?.toString().trim() || "Update";
}

function getStationEnglishName(report) {
    return report?.station?.name_en?.toString().trim() || "";
}

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

function getEventTime(report) {
    const value = report?.event_time || report?.eventTime || report?.created_at || report?.createdAt || null;

    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getStatusObject(report) {
    if (report?.status_summary && typeof report.status_summary === "object") {
        return report.status_summary;
    }

    return null;
}

function getBanglaSummary(report) {
    const summary = getStatusObject(report);

    if (summary) {
        const lines = [];

        if (typeof summary.text === "string" && summary.text.trim()) {
            lines.push(summary.text.trim());
        }

        if (typeof summary.next_station_text === "string" && summary.next_station_text.trim()) {
            lines.push(summary.next_station_text.trim());
        }

        if (lines.length) {
            return lines;
        }
    }

    if (report?.event_type === "UPDATE" && typeof report?.note === "string" && report.note.trim()) {
        return [report.note.trim()];
    }

    const stationName = getStationName(report);

    const delayMinutes = Number(summary?.delay_minutes ?? report?.delay_minutes ?? 0);

    const lines = [];

    switch (report?.event_type) {
        case "ARRIVED":
            lines.push(`${stationName} স্টেশনে ট্রেনটি পৌঁছেছে।`);
            break;

        case "DEPARTED":
            lines.push(`${stationName} স্টেশন থেকে ট্রেনটি ছেড়েছে।`);
            break;

        case "PASSED":
            lines.push(`${stationName} স্টেশন অতিক্রম করেছে।`);
            break;

        default:
            break;
    }

    if (delayMinutes > 0) {
        lines.push(`${delayMinutes} মিনিট দেরিতে চলছে।`);
    } else if (report?.event_type !== "UPDATE") {
        lines.push("সময়সূচি অনুযায়ী চলছে।");
    }

    return lines;
}

function getNextStop(report) {
    const currentStationId = report?.station?.id;

    const stops = Array.isArray(report?.eta?.stops) ? report.eta.stops : [];

    if (!currentStationId || !stops.length) {
        return null;
    }

    const currentIndex = stops.findIndex((stop) => Number(stop?.station?.id) === Number(currentStationId));

    if (currentIndex === -1) {
        return null;
    }

    return stops[currentIndex + 1] || null;
}

function getReportedTime(report) {
    if (report?.event_time_ago) {
        return report.event_time_ago;
    }

    const eventTime = getEventTime(report);

    if (eventTime) {
        return <RelativeTime value={eventTime.toISOString()} />;
    }

    if (report?.event_time_display) {
        return report.event_time_display;
    }

    return "Recently";
}

function getSafeDelayReport(report) {
    const status = getStatusObject(report);

    if (!status) {
        return report;
    }

    return {
        ...report,
        delay_minutes: report.delay_minutes ?? status.delay_minutes ?? 0,
        delay_display: report.delay_display ?? status.delay_display ?? "",
    };
}

function getReportCardStatus(report) {
    if (report?.event_type === "UPDATE") {
        return "neutral";
    }

    const status = getStatusObject(report);

    const rawDelay = report?.delay_minutes ?? status?.delay_minutes ?? 0;

    const delayMinutes = Number(rawDelay);

    if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
        return "onTime";
    }

    if (delayMinutes < 45) {
        return "mediumDelay";
    }

    return "highDelay";
}

function matchesSearch(report, query) {
    const value = query.trim().toLowerCase();

    if (!value) {
        return true;
    }

    return [getTrainNumber(report), getTrainName(report), getTrainNameBn(report)].some((field) =>
        field.toLowerCase().includes(value)
    );
}

function getReportBadge(report) {
    const stationName = getStationEnglishName(report) || getStationName(report);

    switch (report?.event_type) {
        case "ARRIVED":
            return `Arrived at ${stationName}`;

        case "DEPARTED":
            return `Departed from ${stationName}`;

        case "PASSED":
            return `Passed ${stationName}`;

        default:
            return getEventLabel(report?.event_type);
    }
}

function LiveReportCard({ report, isExpanded, myVote, votingReport, onToggle, onVote, onShare }) {
    const safeReport = getSafeDelayReport(report);

    const station = safeReport?.station;
    const train = safeReport?.train;

    const stationCode = getStationCode(station);

    const stationEnglishName = getStationEnglishName(safeReport);

    const eventClassName = getEventClass(safeReport?.event_type, reportStyles);

    const delay = safeReport?.event_type !== "UPDATE" ? getDelayInfo(safeReport, reportStyles) : null;

    const nextStop = getNextStop(safeReport);
    const banglaSummary = getBanglaSummary(safeReport);

    const rightVotes = Number(safeReport?.right_votes || 0);

    const wrongVotes = Number(safeReport?.wrong_votes || 0);

    const totalVotes = Number(safeReport?.total_votes ?? rightVotes + wrongVotes);

    const trustPercentage = Number(safeReport?.trust_percentage ?? 0);

    const cardStatus = getReportCardStatus(safeReport);

    const cardStatusClass = {
        onTime: styles.reportCardOnTime,
        mediumDelay: styles.reportCardMediumDelay,
        highDelay: styles.reportCardHighDelay,
        neutral: styles.reportCardNeutral,
    }[cardStatus];

    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
        }
    }

    return (
        <article className={`${reportStyles.reportCard} ${cardStatusClass} ${isExpanded ? reportStyles.expanded : ""}`}>
            <div
                className={reportStyles.reportMain}
                role="button"
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={handleKeyDown}
            >
                <div className={reportStyles.trainIcon}>
                    <span>{train?.number || stationCode}</span>
                </div>

                <div className={reportStyles.reportInfo}>
                    <div className={reportStyles.reportTop}>
                        <div>
                            <strong>{train?.name || "Unknown train"}</strong>

                            {train?.name_bn && <span className={reportStyles.trainNameBn}>{train.name_bn}</span>}
                        </div>

                        <div className={reportStyles.reportTopActions}>
                            <span className={`${reportStyles.eventPill} ${eventClassName}`}>
                                {getReportBadge(safeReport)}
                            </span>

                            <button
                                type="button"
                                className={reportStyles.shareButton}
                                aria-label="Share report"
                                title="Share report"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onShare();
                                }}
                            >
                                <FiShare2 size={15} strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className={reportStyles.reportMeta}>
                        {safeReport?.event_time_display}

                        {safeReport?.event_time_ago && safeReport?.event_time && (
                            <>
                                <span>·</span>

                                <RelativeTime timestamp={safeReport.event_time} />
                            </>
                        )}

                        {!safeReport?.event_time_display && <>Reported {getReportedTime(safeReport)}</>}
                    </div>

                    {safeReport?.note?.trim() && safeReport?.event_type !== "UPDATE" && (
                        <div className={reportStyles.reportNotePreview}>
                            <span>Update:</span> {safeReport.note}
                        </div>
                    )}

                    {safeReport?.event_type === "UPDATE" && safeReport?.note?.trim() && (
                        <div className={reportStyles.reportNotePreview}>{safeReport.note}</div>
                    )}
                </div>

                <div className={reportStyles.expandButton}>
                    <FiChevronDown
                        size={18}
                        strokeWidth={2}
                        className={isExpanded ? reportStyles.expandIconExpanded : reportStyles.expandIcon}
                    />
                </div>
            </div>

            {delay && (
                <div className={reportStyles.statusRow}>
                    <span className={`${reportStyles.delayBadge} ${delay.className}`}>{delay.label}</span>

                    {safeReport?.scheduled_time && (
                        <span className={reportStyles.scheduled}>Scheduled {safeReport.scheduled_time}</span>
                    )}
                </div>
            )}

            {nextStop && (
                <div className={reportStyles.nextStopRow}>
                    <div className={reportStyles.nextStopInfo}>
                        <span className={reportStyles.nextStop}>
                            Next stop: {nextStop?.station?.name_en || nextStop?.station?.name || "—"}
                        </span>

                        {nextStop?.eta_arrival && (
                            <span className={reportStyles.nextStopEta}>ETA: {nextStop.eta_arrival}</span>
                        )}
                    </div>

                    {train?.number && (
                        <Link
                            to={`/trains/${encodeURIComponent(train.number)}`}
                            className={reportStyles.trainDetailsLink}
                            onClick={(event) => event.stopPropagation()}
                        >
                            Train details →
                        </Link>
                    )}
                </div>
            )}

            {banglaSummary.length > 0 && (
                <div className={reportStyles.reportBangla}>
                    <div className={reportStyles.statusSummary}>
                        {banglaSummary.map((line, index) => (
                            <div key={`${line}-${index}`}>{line}</div>
                        ))}
                    </div>
                </div>
            )}

            <div className={reportStyles.voteRow}>
                <span className={reportStyles.voteLabel}>Accurate?</span>

                <button
                    type="button"
                    className={`${reportStyles.voteButton} ${myVote === "RIGHT" ? reportStyles.rightSelected : ""}`}
                    disabled={votingReport === safeReport.id}
                    onClick={(event) => {
                        event.stopPropagation();
                        onVote(safeReport.id, "RIGHT");
                    }}
                >
                    ✓<span>সঠিক</span>
                    <b>{rightVotes}</b>
                </button>

                <button
                    type="button"
                    className={`${reportStyles.voteButton} ${myVote === "WRONG" ? reportStyles.wrongSelected : ""}`}
                    disabled={votingReport === safeReport.id}
                    onClick={(event) => {
                        event.stopPropagation();
                        onVote(safeReport.id, "WRONG");
                    }}
                >
                    ✕<span>ভুল</span>
                    <b>{wrongVotes}</b>
                </button>
            </div>

            {isExpanded && (
                <div className={reportStyles.expandedContent}>
                    <div className={reportStyles.detailGrid}>
                        <div className={reportStyles.detailItem}>
                            <span>Train</span>
                            <strong>{train?.number || "—"}</strong>
                        </div>

                        <div className={reportStyles.detailItem}>
                            <span>Station</span>
                            <strong>{stationEnglishName || getStationName(safeReport)}</strong>
                        </div>

                        <div className={reportStyles.detailItem}>
                            <span>Status</span>
                            <strong>{getEventLabel(safeReport?.event_type)}</strong>
                        </div>

                        <div className={reportStyles.detailItem}>
                            <span>Reported</span>
                            <strong>{safeReport?.event_time_display || getReportedTime(safeReport)}</strong>
                        </div>
                    </div>

                    {safeReport?.note && (
                        <div className={reportStyles.note}>
                            <span>Traveller note</span>

                            <p>{safeReport.note}</p>
                        </div>
                    )}

                    {totalVotes > 0 && (
                        <div className={reportStyles.trustCard}>
                            <div className={reportStyles.trustHeader}>
                                <div>
                                    <span>Community trust</span>

                                    <small>
                                        Based on {totalVotes} vote
                                        {totalVotes === 1 ? "" : "s"}
                                    </small>
                                </div>

                                <strong>{Math.round(trustPercentage)}%</strong>
                            </div>

                            <div className={reportStyles.trustBar}>
                                <div
                                    className={reportStyles.trustProgress}
                                    style={{
                                        width: `${Math.max(0, Math.min(100, trustPercentage))}%`,
                                    }}
                                />
                            </div>

                            <div className={reportStyles.trustStats}>
                                <span>✓ {rightVotes} সঠিক</span>

                                <span>✕ {wrongVotes} ভুল</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

function Reports() {
    const navigate = useNavigate();

    const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();

    const [reports, setReports] = useState([]);
    const [votes, setVotes] = useState({});
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [votingReport, setVotingReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const controller = new AbortController();

        async function loadReports() {
            setLoading(true);
            setError("");

            try {
                const data = await getRecentReports({
                    accessToken: isAuthenticated ? accessToken : null,
                    signal: controller.signal,
                });

                const safeReports = Array.isArray(data) ? data : [];

                const sortedReports = [...safeReports].sort((a, b) => {
                    const timeA = getEventTime(a)?.getTime() || 0;

                    const timeB = getEventTime(b)?.getTime() || 0;

                    return timeB - timeA;
                });

                setReports(sortedReports);
            } catch (requestError) {
                if (requestError?.name === "AbortError") {
                    return;
                }

                console.error("Failed to load reports:", requestError);

                setError("Unable to load reports right now. Please try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadReports();

        return () => controller.abort();
    }, [accessToken, authLoading, isAuthenticated]);

    const visibleReports = useMemo(() => {
        return reports.filter((report) => matchesSearch(report, search));
    }, [reports, search]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken || !visibleReports.length) {
            return;
        }

        const controller = new AbortController();

        async function loadVotes() {
            const results = await Promise.all(
                visibleReports.map(async (report) => {
                    try {
                        const vote = await getReportVote(report.id, {
                            accessToken,
                            signal: controller.signal,
                        });

                        return [report.id, vote?.vote || null];
                    } catch {
                        return [report.id, null];
                    }
                })
            );

            if (controller.signal.aborted) {
                return;
            }

            const nextVotes = {};

            for (const [reportId, vote] of results) {
                nextVotes[reportId] = vote;
            }

            setVotes((current) => ({
                ...current,
                ...nextVotes,
            }));
        }

        loadVotes();

        return () => controller.abort();
    }, [accessToken, isAuthenticated, visibleReports]);

    function handleLogin(report) {
        const trainNumber = getTrainNumber(report);

        if (trainNumber) {
            navigate(`/login?train=${encodeURIComponent(trainNumber)}`);
            return;
        }

        navigate("/login");
    }

    async function handleVote(reportId, vote) {
        if (!isAuthenticated || !accessToken) {
            navigate("/login");
            return;
        }

        if (!reportId || votingReport === reportId) {
            return;
        }

        setVotingReport(reportId);

        try {
            const updated = await voteOnReport(reportId, vote, {
                accessToken,
            });

            setVotes((current) => ({
                ...current,
                [reportId]: updated?.vote || vote,
            }));

            setReports((current) =>
                current.map((report) =>
                    report.id === reportId
                        ? {
                              ...report,
                              ...(updated || {}),
                          }
                        : report
                )
            );
        } catch (requestError) {
            if (requestError?.status === 401) {
                navigate("/login");
            } else {
                console.error("Failed to vote:", requestError);
            }
        } finally {
            setVotingReport(null);
        }
    }

    async function handleShare(report) {
        const trainNumber = getTrainNumber(report);

        const stationName = getStationEnglishName(report);

        const text = [
            trainNumber ? `Train ${trainNumber}` : "TrainLive report",
            stationName,
            getEventLabel(report?.event_type),
        ]
            .filter(Boolean)
            .join(" · ");

        const url = `${window.location.origin}/reports/${report.id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "TrainLive report",
                    text,
                    url,
                });

                return;
            }

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
            }
        } catch (shareError) {
            if (shareError?.name !== "AbortError") {
                console.error("Failed to share:", shareError);
            }
        }
    }

    function handleToggle(reportId) {
        setExpandedId((current) => (current === reportId ? null : reportId));
    }

    return (
        <div className={pageStyles.page}>
            <PageHeader title="All Reports" subtitle="Recent community reports">
                <div className={styles.headerControls}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} size={16} />

                        <input
                            type="search"
                            className={styles.searchInput}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by train number or name..."
                            aria-label="Search reports by train"
                        />

                        {search && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </PageHeader>

            <main className={pageStyles.content}>
                <div className={pageStyles.contentInner}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <div className={styles.sectionTitleRow}>
                                <h2>{search.trim() ? "Search Results" : "Recent Reports"}</h2>

                                <span className={reportStyles.infoWrapper}>
                                    <span
                                        className={reportStyles.infoIcon}
                                        tabIndex={0}
                                        aria-label="About community reports"
                                    >
                                        i
                                    </span>

                                    <span className={reportStyles.infoTooltip}>
                                        <strong>Community-based reports</strong>

                                        <span>
                                            These reports are shared by TrainLive users and may not always be accurate.
                                            <br />
                                            Please vote ✓ if the report is correct and ✕ if it is incorrect.
                                            <br />
                                            ETA is estimated from the latest community report and may vary with actual
                                            train movement.
                                        </span>

                                        <span className={reportStyles.infoBangla}>কমিউনিটি-ভিত্তিক রিপোর্ট</span>

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

                            <p>
                                {search.trim()
                                    ? `Reports matching “${search.trim()}”`
                                    : "Community updates from train travellers"}
                            </p>
                        </div>

                        <span className={styles.reportCount}>{visibleReports.length}</span>
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Loading reports...</span>
                        </div>
                    ) : error ? (
                        <div className={styles.errorState}>{error}</div>
                    ) : visibleReports.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.stateIcon}>🚆</div>

                            <div className={styles.stateTitle}>
                                {search.trim() ? "No matching reports" : "No reports yet"}
                            </div>

                            <div className={styles.stateText}>
                                {search.trim()
                                    ? "Try another train number or train name."
                                    : "No community reports were returned by the reports service."}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {visibleReports.map((report) => {
                                const reportId = report?.id;

                                if (!isAuthenticated) {
                                    return (
                                        <GuestReportCard
                                            key={reportId}
                                            iconText={getTrainNumber(report)}
                                            title={getTrainName(report)}
                                            meta={[
                                                getTrainNameBn(report),
                                                getTrainNumber(report) ? `Train ${getTrainNumber(report)}` : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                            reportedTime={getReportedTime(report)}
                                            onLogin={() => handleLogin(report)}
                                            styles={reportStyles}
                                        />
                                    );
                                }

                                return (
                                    <LiveReportCard
                                        key={reportId}
                                        report={report}
                                        isExpanded={expandedId === reportId}
                                        myVote={votes[reportId] || null}
                                        votingReport={votingReport}
                                        onToggle={() => handleToggle(reportId)}
                                        onVote={handleVote}
                                        onShare={() => handleShare(report)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

void ReportCard;

export default Reports;