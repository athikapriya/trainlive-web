import { FiChevronDown, FiThumbsDown, FiThumbsUp } from "react-icons/fi";

function ReportCard({
    report,
    title,
    code,
    meta,
    eventLabel,
    eventClassName,
    delayLabel,
    delayClassName,
    scheduledTime,
    isExpanded,
    myVote,
    votingReport,
    onToggle,
    onVote,
    styles,
}) {
    const rightVotes = Number(report.right_votes || 0);
    const wrongVotes = Number(report.wrong_votes || 0);
    const totalVotes = rightVotes + wrongVotes;

    const trustPercentage =
        report.trust_percentage ?? (totalVotes > 0 ? Math.round((rightVotes / totalVotes) * 100) : 0);

    return (
        <article className={`${styles.reportCard} ${isExpanded ? styles.expanded : ""}`}>
            <button type="button" className={styles.reportMain} onClick={() => onToggle(report.id)}>
                <div className={styles.trainIcon}>
                    <span>{code}</span>
                </div>

                <div className={styles.reportInfo}>
                    <div className={styles.reportTop}>
                        <strong>{title}</strong>

                        {eventLabel && <span className={`${styles.eventPill} ${eventClassName}`}>{eventLabel}</span>}
                    </div>

                    {meta && <div className={styles.trainMeta}>{meta}</div>}

                    <div className={styles.reportMeta}>Reported {report.event_time_ago}</div>

                    {report.note && (
                        <div className={styles.reportNotePreview}>
                            <span>Note:</span> {report.note}
                        </div>
                    )}
                </div>

                <span className={isExpanded ? styles.expandIconExpanded : styles.expandIcon}>
                    <FiChevronDown size={16} strokeWidth={2} />
                </span>
            </button>

            <div className={styles.statusRow}>
                <span className={`${styles.delayBadge} ${delayClassName}`}>{delayLabel}</span>

                {scheduledTime && <span className={styles.scheduled}>Scheduled {scheduledTime}</span>}
            </div>

            <div className={styles.voteRow}>
                <span className={styles.voteLabel}>Is this report accurate?</span>

                <button
                    type="button"
                    className={`${styles.voteButton} ${myVote === "RIGHT" ? styles.rightSelected : ""}`}
                    onClick={() => onVote(report, "RIGHT")}
                    disabled={votingReport === report.id}
                >
                    <FiThumbsUp size={11} />
                    <span>Right</span>
                    <b>{rightVotes}</b>
                </button>

                <button
                    type="button"
                    className={`${styles.voteButton} ${myVote === "WRONG" ? styles.wrongSelected : ""}`}
                    onClick={() => onVote(report, "WRONG")}
                    disabled={votingReport === report.id}
                >
                    <FiThumbsDown size={11} />
                    <span>Wrong</span>
                    <b>{wrongVotes}</b>
                </button>
            </div>

            {isExpanded && (
                <div className={styles.expandedContent}>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <span>Event</span>
                            <strong>{eventLabel}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Reported</span>
                            <strong>{report.event_time_display || report.event_time_ago}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Scheduled</span>
                            <strong>{scheduledTime || "—"}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Delay</span>
                            <strong>{delayLabel}</strong>
                        </div>
                    </div>

                    {report.note && (
                        <div className={styles.note}>
                            <span>Traveller note</span>

                            <p>{report.note}</p>
                        </div>
                    )}

                    <div className={styles.trustCard}>
                        <div className={styles.trustHeader}>
                            <div>
                                <span>Community trust</span>

                                <small>
                                    Based on {totalVotes} vote
                                    {totalVotes === 1 ? "" : "s"}
                                </small>
                            </div>

                            <strong>{trustPercentage}%</strong>
                        </div>

                        <div className={styles.trustBar}>
                            <div
                                className={styles.trustProgress}
                                style={{
                                    width: `${trustPercentage}%`,
                                }}
                            />
                        </div>

                        <div className={styles.trustStats}>
                            <span>{rightVotes} right</span>
                            <span>{wrongVotes} wrong</span>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}

export default ReportCard;
