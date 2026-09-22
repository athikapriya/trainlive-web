import { StationIcon, SearchTrainIcon } from "../icons/ReactIcons";

import styles from "./SearchResult.module.css";


function SearchResult({ station, train, onClick }) {
    const isStation = Boolean(station);

    const sortedStops = [...(train?.stops || [])].sort(
        (a, b) => a.stop_order - b.stop_order
    );

    const firstStop = sortedStops[0];
    const lastStop = sortedStops[sortedStops.length - 1];
    const reportCount = isStation ? station.report_count_today : train.report_count_today;

    const reportText =
        reportCount === 0
            ? "No reports today"
            : `${reportCount} ${
                  reportCount === 1 ? "report" : "reports"
              } today`;

    return (
        <button type="button" className={styles.searchResult} onClick={onClick}>
            <div className={styles.searchResultIcon}>
                {isStation ? (
                    <StationIcon size={20} />
                ) : (
                    <SearchTrainIcon size={21} />
                )}
            </div>

            <div className={styles.searchResultContent}>
                {isStation ? (
                    <>
                        <div className={styles.searchResultName}>
                            {station.name}
                        </div>

                        {station.name_en && (
                            <div className={styles.searchResultSecondary}>
                                {station.name_en}
                            </div>
                        )}

                        <div className={styles.searchResultReports}>
                            {reportText}
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.searchResultName}>
                            {train.name}
                        </div>

                        {train.name_bn && (
                            <div className={styles.searchResultSecondary}>
                                {train.name_bn}
                            </div>
                        )}

                        <div className={styles.searchResultMeta}>
                            Train {train.number} · {train.direction}
                        </div>

                        {firstStop && lastStop && (
                            <div className={styles.searchResultRoute}>
                                <span>
                                    {firstStop.station.name_en ||
                                        firstStop.station.name}
                                </span>

                                <span className={ styles.searchResultRouteArrow}>
                                    →
                                </span>

                                <span>
                                    {lastStop.station.name_en || lastStop.station.name}
                                </span>
                            </div>
                        )}

                        <div className={styles.searchResultReports}>
                            {reportText}
                        </div>
                    </>
                )}
            </div>

            <span className={styles.searchResultArrow}>
                ›
            </span>
        </button>
    );
}

export default SearchResult;