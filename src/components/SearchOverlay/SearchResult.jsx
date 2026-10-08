import { StationIcon, SearchTrainIcon } from "../icons/ReactIcons";

import styles from "./SearchResult.module.css";

function SearchResult({ station, train, onClick }) {
    const isStation = Boolean(station);

    const sortedStops = [...(train?.stops || [])].sort((a, b) => Number(a.stop_order || 0) - Number(b.stop_order || 0));

    const firstStop = sortedStops[0];
    const lastStop = sortedStops[sortedStops.length - 1];

    const getStationName = (stop) => {
        if (!stop) {
            return "";
        }

        return stop.station?.name_en || stop.station?.name || stop.station_name_en || stop.station_name || "";
    };

    return (
        <button type="button" className={styles.searchResult} onClick={onClick}>
            <div className={styles.searchResultIcon}>
                {isStation ? <StationIcon size={20} /> : <SearchTrainIcon size={21} />}
            </div>

            <div className={styles.searchResultContent}>
                {isStation ? (
                    <>
                        <div className={styles.searchResultName}>{station.name}</div>

                        {station.name_en && <div className={styles.searchResultSecondary}>{station.name_en}</div>}
                    </>
                ) : (
                    <>
                        <div className={styles.searchResultName}>{train.name}</div>

                        {train.name_bn && <div className={styles.searchResultSecondary}>{train.name_bn}</div>}

                        <div className={styles.searchResultMeta}>
                            Train {train.number} · {train.direction}
                        </div>

                        {firstStop && lastStop && (
                            <div className={styles.searchResultRoute}>
                                <span>{getStationName(firstStop)}</span>

                                <span className={styles.searchResultRouteArrow}>→</span>

                                <span>{getStationName(lastStop)}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <span className={styles.searchResultArrow}>›</span>
        </button>
    );
}

export default SearchResult;