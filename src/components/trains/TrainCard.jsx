import { FiChevronRight } from "react-icons/fi";
import { MdTrain } from "react-icons/md";

import styles from "./TrainCard.module.css";

/* =========================================================
   Helpers
========================================================= */

function getStationName(station) {
    if (!station) {
        return null;
    }

    return station.name || station.name_en || null;
}

function getStatusClass(status) {
    if (status === "ON_TIME") {
        return styles.onTime;
    }

    if (status === "DELAYED") {
        return styles.delayed;
    }

    if (status === "COMPLETED") {
        return styles.completed;
    }

    if (status === "OFF_DAY") {
        return styles.offDay;
    }

    return styles.scheduled;
}

function getDelayClass(delayMinutes) {
    if (typeof delayMinutes !== "number" || delayMinutes <= 0) {
        return "";
    }

    if (delayMinutes >= 45) {
        return styles.delayHigh;
    }

    return styles.delayLow;
}

/* =========================================================
   Component
========================================================= */

function TrainCard({ train, displayStatus, onClick }) {
    const startStation = getStationName(train.start_station);
    const destinationStation = getStationName(train.destination_station);

    const { status, label, secondaryLabel, delayMinutes } = displayStatus;

    const statusClass = getStatusClass(status);
    const delayClass = getDelayClass(delayMinutes);

    return (
        <article className={styles.card} onClick={onClick}>
            {/* =================================================
                Header
            ================================================= */}

            <div className={styles.cardTop}>
                <div className={styles.cardMain}>
                    <div className={`${styles.stationIcon} ${styles.trainIcon}`}>
                        <MdTrain size={20} />
                    </div>

                    <div className={styles.cardText}>
                        <div className={styles.primaryText}>{train.name || "Unnamed train"}</div>

                        {train.name_bn && <div className={styles.secondaryText}>{train.name_bn}</div>}

                        <div className={styles.trainMeta}>
                            {train.number && <span className={styles.trainNumber}>{train.number}</span>}

                            {train.direction && (
                                <span className={styles.direction}>{train.direction === "UP" ? "↑ UP" : "↓ DOWN"}</span>
                            )}
                        </div>
                    </div>
                </div>

                <FiChevronRight size={16} className={styles.chevron} />
            </div>

            {/* =================================================
                Route
            ================================================= */}

            {(startStation || destinationStation) && (
                <div className={styles.trainRoute}>
                    {startStation && <span>{startStation}</span>}

                    {startStation && destinationStation && <FiChevronRight size={12} />}

                    {destinationStation && <span>{destinationStation}</span>}
                </div>
            )}

            {/* =================================================
                Footer
            ================================================= */}

            <div className={styles.cardFooter}>
                <div className={styles.metaText}>
                    {train.off_day && <span>Off day: {train.off_day}</span>}

                    {typeof train.report_count_today === "number" && (
                        <span>
                            {train.report_count_today === 0
                                ? "No reports yet"
                                : `${train.report_count_today} ${
                                      train.report_count_today === 1 ? "report" : "reports"
                                  } today`}
                        </span>
                    )}
                </div>

                <div className={styles.statusInfo}>
                    <span className={`${styles.statusBadge} ${statusClass} ${delayClass}`}>{label}</span>

                    {secondaryLabel && <span className={styles.statusSecondary}>{secondaryLabel}</span>}
                </div>
            </div>
        </article>
    );
}

export default TrainCard;