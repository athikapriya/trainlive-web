function GuestReportCard({ iconText, title, meta, reportedTime, onLogin, styles }) {
    return (
        <article className={styles.reportCard}>
            <div className={styles.reportMain}>
                <div className={styles.trainIcon}>
                    <span>{iconText}</span>
                </div>

                <div className={styles.reportInfo}>
                    <div className={styles.reportTop}>
                        <strong>{title}</strong>
                    </div>

                    {meta && <div className={styles.trainMeta}>{meta}</div>}

                    <div className={styles.reportMeta}>Reported {reportedTime}</div>
                </div>
            </div>

            <div className={styles.guestReportPrompt}>
                <span className={styles.guestReportLock}>🔒</span>

                <span>
                    Please{" "}
                    <button type="button" className={styles.guestLoginLink} onClick={onLogin}>
                        sign in
                    </button>{" "}
                    to see report details.
                </span>
            </div>
        </article>
    );
}

export default GuestReportCard;
