import { FiChevronDown } from "react-icons/fi";

function ReportSheetHeader({
    title,
    subtitle,
    isSaved,
    isSaving,
    isAuthenticated,
    onSave,
    onClose,
    saveLabel,
    unsaveLabel,
    styles,
}) {
    return (
        <>
            <div className={styles.handle} />

            <div className={styles.header}>
                <div className={styles.stationInfo}>
                    <div className={styles.stationTitleRow}>
                        <span className={styles.stationDot} />
                        <h2>{title}</h2>
                    </div>

                    {subtitle && <p>{subtitle}</p>}
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
                        onClick={onSave}
                        disabled={isSaving}
                        aria-label={
                            isAuthenticated
                                ? isSaved
                                    ? unsaveLabel
                                    : saveLabel
                                : `Sign in to ${saveLabel.toLowerCase()}`
                        }
                        title={
                            isAuthenticated
                                ? isSaved
                                    ? unsaveLabel
                                    : saveLabel
                                : `Sign in to ${saveLabel.toLowerCase()}`
                        }
                    >
                        {isSaved ? "★" : "☆"}
                    </button>

                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close report details" >
                        <FiChevronDown size={18} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </>
    );
}

export default ReportSheetHeader;
