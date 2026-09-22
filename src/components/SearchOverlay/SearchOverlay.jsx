import { FiArrowLeft, FiSearch } from "react-icons/fi";

import SearchResult from "./SearchResult";
import styles from "./searchOverlay.module.css";

function SearchOverlay({
    searchType,
    query,
    stations,
    trains,
    isLoading,
    error,
    onClose,
    onQueryChange,
    onSearchTypeChange,
    onStationSelect,
    onTrainSelect,
}) {
    const results =
        searchType === "stations" ? stations : trains;

    const hasResults = results.length > 0;

    return (
        <div className={styles.searchOverlay}>
            <div className={styles.searchOverlayHeader}>
                <button type="button" className={styles.searchBackButton} onClick={onClose} aria-label="Close search">
                    <FiArrowLeft size={21} />
                </button>

                <div className={styles.searchInputWrapper}>
                    <FiSearch className={styles.searchInputIcon} size={18} aria-hidden="true" />
                    <input type="text" value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder={ searchType === "stations" ? "Search stations" : "Search trains" }
                        autoFocus
                        aria-label={ searchType === "stations" ? "Search stations" : "Search trains" }
                    />
                </div>
            </div>

            <div className={styles.searchSegment}>
                <button type="button" className={ searchType === "stations" ? styles.active : "" } onClick={() => onSearchTypeChange("stations")}>
                    Stations
                </button>

                <button type="button" className={ searchType === "trains" ? styles.active : ""} onClick={() => onSearchTypeChange("trains")}>
                    Trains
                </button>
            </div>

            <div className={styles.searchResults}>
                {isLoading && (
                    <div className={styles.searchEmpty}>
                        <p>
                            Loading{" "}
                            {searchType === "stations" ? "stations" : "trains"}
                            ...
                        </p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className={styles.searchEmpty}>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && 
                    !error &&
                    hasResults && (
                        <>
                            <div className={ styles.searchResultsHeader }>
                                {searchType === "stations" ? "All Stations" : "All Trains"}
                            </div>

                            <div className={ styles.searchResultList }>
                                {searchType === "stations"
                                    ? stations.map((station) => (
                                          <SearchResult key={station.id} station={station}
                                              onClick={() =>
                                                  onStationSelect(
                                                      station
                                                  )
                                              }
                                          />
                                      ))
                                    : trains.map((train) => (
                                        <SearchResult key={`${train.number}-${train.direction}`} train={train}
                                            onClick={() =>
                                                onTrainSelect(
                                                    train
                                                )
                                            }
                                        />
                                    ))}
                            </div>
                        </>
                    )}

                {!isLoading &&
                    !error &&
                    !hasResults && (
                        <div className={styles.searchEmpty}>
                            <p>
                                No{" "}
                                {searchType === "stations" ? "stations" : "trains"}{" "}
                                found.
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default SearchOverlay;