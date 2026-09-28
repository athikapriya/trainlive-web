import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

import { getStations } from "../../services/stationApi";
import { getTrains, getTrain } from "../../services/trainApi";
import { createReport } from "../../services/reportApi";
import useAuth from "../../hooks/useAuth";

import styles from "./ReportSubmitSheet.module.css";

function ReportSubmitSheet({ isOpen, onClose, onSubmitted }) {
    const { accessToken } = useAuth();

    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);

    const [eventTime, setEventTime] = useState("");
    const [eventType, setEventType] = useState("");
    const [note, setNote] = useState("");

    const [trains, setTrains] = useState([]);
    const [stations, setStations] = useState([]);

    const [selector, setSelector] = useState(null);

    const [trainSearch, setTrainSearch] = useState("");
    const [stationSearch, setStationSearch] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const isStationEvent = eventType === "ARRIVED" || eventType === "DEPARTED";
    const isUpdate = eventType === "UPDATE";

    useEffect(() => {
        if (isOpen) {
            setSubmitError("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (selector !== "train") {
            return;
        }

        let isMounted = true;

        const loadTrains = async () => {
            try {
                setIsLoading(true);

                const data = await getTrains(trainSearch);

                if (!isMounted) {
                    return;
                }

                setTrains(data);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                console.error("Failed to load trains:", error);
                setTrains([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTrains();

        return () => {
            isMounted = false;
        };
    }, [selector, trainSearch]);

    useEffect(() => {
        if (selector !== "station") {
            return;
        }

        if (selectedTrain?.stops?.length) {
            return;
        }

        let isMounted = true;

        const loadStations = async () => {
            try {
                setIsLoading(true);

                const data = await getStations(stationSearch);

                if (!isMounted) {
                    return;
                }

                setStations(data);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                console.error("Failed to load stations:", error);
                setStations([]);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadStations();

        return () => {
            isMounted = false;
        };
    }, [selector, stationSearch, selectedTrain]);

    const routeStations = useMemo(() => {
        if (!selectedTrain?.stops?.length) {
            return [];
        }

        return selectedTrain.stops
            .map((stop) => {
                if (stop.station) {
                    return stop.station;
                }

                if (stop.station_id) {
                    return {
                        id: stop.station_id,
                        name: stop.station_name || "",
                        name_en: stop.station_name_en || "",
                    };
                }

                return null;
            })
            .filter(Boolean);
    }, [selectedTrain]);

    const filteredRouteStations = useMemo(() => {
        const query = stationSearch.trim().toLowerCase();

        if (!query) {
            return routeStations;
        }

        return routeStations.filter((station) => {
            const name = station.name?.toLowerCase() || "";
            const nameEn = station.name_en?.toLowerCase() || "";

            return name.includes(query) || nameEn.includes(query);
        });
    }, [routeStations, stationSearch]);

    const handleEventTypeChange = (type) => {
        setEventType(type);
        setSubmitError("");

        if (type === "UPDATE") {
            setSelectedStation(null);
        }
    };

    const handleOpenTrainSelector = () => {
        setTrainSearch("");
        setSelector("train");
    };

    const handleOpenStationSelector = () => {
        if (!selectedTrain) {
            setSubmitError("Please select a train first.");
            return;
        }

        if (!selectedTrain.stops?.length) {
            setSubmitError("Unable to load this train's route. Please try selecting the train again.");
            return;
        }

        setStationSearch("");
        setSelector("station");
    };

    const handleCloseSelector = () => {
        setSelector(null);
    };

    const handleSelectTrain = async (train) => {
        setSelector(null);
        setTrainSearch("");
        setSubmitError("");
        setSelectedStation(null);

        try {
            setIsLoading(true);

            const detailedTrain = await getTrain(train.number);

            setSelectedTrain(detailedTrain || train);
        } catch (error) {
            console.error("Failed to load train route:", error);

            setSelectedTrain(train);

            setSubmitError("Unable to load this train's route. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectStation = (station) => {
        setSelectedStation(station);
        setSelector(null);
        setStationSearch("");
        setSubmitError("");
    };

    const getSubmitErrorMessage = (error) => {
        const data = error?.data;

        if (data?.detail) {
            return data.detail;
        }

        if (typeof data === "object" && data) {
            const firstError = Object.values(data)[0];

            if (Array.isArray(firstError)) {
                return firstError[0];
            }

            if (typeof firstError === "string") {
                return firstError;
            }
        }

        return error?.message || "Unable to submit the report. Please try again.";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setSubmitError("");

        if (!selectedTrain) {
            setSubmitError("Please select a train.");
            return;
        }

        if (!eventType) {
            setSubmitError("Please select what happened.");
            return;
        }

        if (!eventTime) {
            setSubmitError("Please select the event time.");
            return;
        }

        if (isStationEvent && !selectedStation) {
            setSubmitError("Please select a station.");
            return;
        }

        if (isStationEvent && selectedStation) {
            const isValidRouteStation = routeStations.some(
                (station) => String(station.id) === String(selectedStation.id)
            );

            if (!isValidRouteStation) {
                setSubmitError("Please select a station on the selected train's route.");
                return;
            }
        }

        if (isUpdate && !note.trim()) {
            setSubmitError("Please enter an update.");
            return;
        }

        if (!accessToken) {
            setSubmitError("Your session has expired. Please sign in again.");
            return;
        }

        setIsSubmitting(true);

        try {
            const now = new Date();

            const localDate = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0"),
            ].join("-");

            const eventDateTime = `${localDate}T${eventTime}:00`;

            const report = await createReport(
                {
                    trainId: selectedTrain.id,
                    stationId: isStationEvent ? selectedStation.id : null,
                    eventTime: eventDateTime,
                    eventType,
                    note: note.trim(),
                },
                {
                    accessToken,
                }
            );

            const submittedTrain = selectedTrain;
            const submittedStation = isStationEvent ? selectedStation : null;

            setSelectedTrain(null);
            setSelectedStation(null);
            setEventTime("");
            setEventType("");
            setNote("");

            setSelector(null);
            setTrainSearch("");
            setStationSearch("");

            setSubmitError("");

            if (onSubmitted) {
                onSubmitted({
                    report,
                    train: submittedTrain,
                    station: submittedStation,
                });
            } else {
                onClose();
            }
        } catch (error) {
            console.error("Report submission failed:", error);
            console.error("Report submission error data:", error?.data);

            setSubmitError(getSubmitErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectorTitle = selector === "train" ? "Select train" : "Select station";

    const selectorSubtitle = selector === "train" ? "ট্রেন নির্বাচন করুন" : "স্টেশন নির্বাচন করুন";

    const visibleStations = selectedTrain?.stops?.length ? filteredRouteStations : stations;

    return (
        <>
            <div className={`${styles.backdrop} ${isOpen ? styles.show : ""}`} onClick={onClose} />

            <section className={`${styles.sheet} ${isOpen ? styles.show : ""}`} aria-hidden={!isOpen}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.title}>Submit a report</div>

                        <div className={styles.subtitle}>রিপোর্ট জমা দিন</div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close report sheet"
                    >
                        <FiX size={18} />
                    </button>
                </header>

                <form className={styles.body} onSubmit={handleSubmit}>
                    {/* Report type */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span>What happened?</span>
                            <span className={styles.labelBn}>কী ঘটেছে?</span>
                        </label>

                        <div className={styles.statusOptions}>
                            <button
                                type="button"
                                className={`${styles.statusOption} ${eventType === "ARRIVED" ? styles.selected : ""}`}
                                onClick={() => handleEventTypeChange("ARRIVED")}
                            >
                                <span>Arrived</span>
                                <span className={styles.statusBn}>আগমন</span>
                            </button>

                            <button
                                type="button"
                                className={`${styles.statusOption} ${eventType === "DEPARTED" ? styles.selected : ""}`}
                                onClick={() => handleEventTypeChange("DEPARTED")}
                            >
                                <span>Departed</span>
                                <span className={styles.statusBn}>প্রস্থান</span>
                            </button>

                            <button
                                type="button"
                                className={`${styles.statusOption} ${eventType === "UPDATE" ? styles.selected : ""}`}
                                onClick={() => handleEventTypeChange("UPDATE")}
                            >
                                <span>Update</span>
                                <span className={styles.statusBn}>আপডেট</span>
                            </button>
                        </div>

                        {eventType === "ARRIVED" && (
                            <div className={styles.typeHint}>Report when the train arrived at a station.</div>
                        )}

                        {eventType === "DEPARTED" && (
                            <div className={styles.typeHint}>Report when the train departed from a station.</div>
                        )}

                        {isUpdate && (
                            <div className={styles.typeHint}>
                                Share a general train update or issue. No station is required.
                            </div>
                        )}
                    </div>

                    {/* Train */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span>Train</span>
                            <span className={styles.labelBn}>ট্রেন</span>
                        </label>

                        <button type="button" className={styles.selectField} onClick={handleOpenTrainSelector}>
                            <span className={selectedTrain ? styles.selectedValue : styles.placeholder}>
                                {selectedTrain
                                    ? `${selectedTrain.number} — ${selectedTrain.name_bn || selectedTrain.name}`
                                    : "Select train"}
                            </span>

                            <FiChevronDown size={16} />
                        </button>
                    </div>

                    {/* Station */}
                    {isStationEvent && (
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <span>Station</span>
                                <span className={styles.labelBn}>স্টেশন</span>
                            </label>

                            <button type="button" className={styles.selectField} onClick={handleOpenStationSelector}>
                                <span className={selectedStation ? styles.selectedValue : styles.placeholder}>
                                    {selectedStation
                                        ? selectedStation.name || selectedStation.name_en
                                        : "Select station"}
                                </span>

                                <FiChevronDown size={16} />
                            </button>
                        </div>
                    )}

                    {/* Time */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span>Time</span>
                            <span className={styles.labelBn}>সময়</span>
                        </label>

                        <input
                            type="time"
                            className={styles.input}
                            value={eventTime}
                            onChange={(event) => setEventTime(event.target.value)}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span>Notes</span>
                            <span className={styles.labelBn}>নোট</span>

                            {!isUpdate && <span className={styles.optional}>Optional · ঐচ্ছিক</span>}
                        </label>

                        <textarea
                            className={styles.textarea}
                            placeholder={
                                isUpdate ? "Share what is happening with the train…" : "Platform, crowd, delay reason…"
                            }
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            required={isUpdate}
                        />

                        {isUpdate && <div className={styles.noteHint}>Describe the update or issue clearly.</div>}
                    </div>

                    {/* Submit error */}
                    {submitError && (
                        <div className={styles.formError} role="alert">
                            {submitError}
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        <span>{isSubmitting ? "Submitting..." : "Submit report"}</span>

                        <span className={styles.submitBn}>
                            {isSubmitting ? "জমা দেওয়া হচ্ছে..." : "রিপোর্ট জমা দিন"}
                        </span>
                    </button>
                </form>

                {/* Selector */}
                {selector && (
                    <div className={styles.selectorOverlay}>
                        <div className={styles.selector}>
                            <header className={styles.selectorHeader}>
                                <div>
                                    <div className={styles.selectorTitle}>{selectorTitle}</div>

                                    <div className={styles.selectorSubtitle}>{selectorSubtitle}</div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.selectorClose}
                                    onClick={handleCloseSelector}
                                    aria-label={`Close ${selector} selector`}
                                >
                                    <FiX size={18} />
                                </button>
                            </header>

                            <div className={styles.searchBox}>
                                <FiSearch size={16} />

                                <input
                                    type="search"
                                    value={selector === "train" ? trainSearch : stationSearch}
                                    onChange={(event) => {
                                        if (selector === "train") {
                                            setTrainSearch(event.target.value);
                                        } else {
                                            setStationSearch(event.target.value);
                                        }
                                    }}
                                    placeholder={selector === "train" ? "Search train..." : "Search station..."}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.selectorList}>
                                {isLoading ? (
                                    <div className={styles.selectorMessage}>Loading…</div>
                                ) : selector === "train" ? (
                                    trains.length === 0 ? (
                                        <div className={styles.selectorMessage}>No trains found</div>
                                    ) : (
                                        trains.map((train) => (
                                            <button
                                                key={train.id}
                                                type="button"
                                                className={styles.trainOption}
                                                onClick={() => handleSelectTrain(train)}
                                            >
                                                <span className={styles.trainNumber}>{train.number}</span>

                                                <span className={styles.trainName}>{train.name_bn || train.name}</span>
                                            </button>
                                        ))
                                    )
                                ) : visibleStations.length === 0 ? (
                                    <div className={styles.selectorMessage}>
                                        {selectedTrain?.stops?.length
                                            ? "No stations found on this train's route"
                                            : "No stations found"}
                                    </div>
                                ) : (
                                    visibleStations.map((station) => (
                                        <button
                                            key={station.id}
                                            type="button"
                                            className={styles.stationOption}
                                            onClick={() => handleSelectStation(station)}
                                        >
                                            <span className={styles.stationName}>
                                                {station.name || station.name_en}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

export default ReportSubmitSheet;