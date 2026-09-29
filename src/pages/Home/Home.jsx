import { useEffect, useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

import MapView from "../../components/map/MapView";
import MapSearch from "../../components/map/MapSearch";
import StationReportSheet from "../../components/stationReportSheet/StationReportSheet";
import TrainReportSheet from "../../components/trainReportSheet/TrainReportSheet";

import { getStation } from "../../services/stationApi";
import { getTrain, getTrainReports } from "../../services/trainApi";

import "../../styles/Home.css";
import "../../styles/map/MapControls.css";
import "../../styles/map/MapSearch.css";

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedTrainReports, setSelectedTrainReports] = useState([]);
    const [highlightStationReportId, setHighlightStationReportId] = useState(null);
    const [highlightTrainReportId, setHighlightTrainReportId] = useState(null);
    const [isRestoringStation, setIsRestoringStation] = useState(false);
    const [isRestoringTrain, setIsRestoringTrain] = useState(false);

    useEffect(() => {
        const stationId = searchParams.get("station");

        if (!stationId || selectedStation) {
            return;
        }

        let isMounted = true;

        const restoreStation = async () => {
            try {
                setIsRestoringStation(true);

                const station = await getStation(stationId);

                if (!isMounted) {
                    return;
                }

                setSelectedStation(station);

                setSearchParams(
                    {},
                    {
                        replace: true,
                    }
                );
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                console.error("Failed to restore station:", error);

                setSearchParams(
                    {},
                    {
                        replace: true,
                    }
                );
            } finally {
                if (isMounted) {
                    setIsRestoringStation(false);
                }
            }
        };

        restoreStation();

        return () => {
            isMounted = false;
        };
    }, [searchParams, selectedStation, setSearchParams]);

    useEffect(() => {
        const trainNumber = searchParams.get("train");

        if (!trainNumber || selectedTrain) {
            return;
        }

        let isMounted = true;

        const controller = new AbortController();

        const restoreTrain = async () => {
            try {
                setIsRestoringTrain(true);
                const train = await getTrain(trainNumber);

                if (!isMounted) {
                    return;
                }

                const reports = await getTrainReports(train.id, {
                    signal: controller.signal,
                });

                if (!isMounted) {
                    return;
                }

                setSelectedStation(null);
                setSelectedTrain(train);
                setSelectedTrainReports(reports);

                setSearchParams(
                    {},
                    {
                        replace: true,
                    }
                );
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                if (!isMounted) {
                    return;
                }

                console.error("Failed to restore train:", error);

                setSearchParams(
                    {},
                    {
                        replace: true,
                    }
                );
            } finally {
                if (isMounted && !controller.signal.aborted) {
                    setIsRestoringTrain(false);
                }
            }
        };

        restoreTrain();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [searchParams, selectedTrain, setSearchParams]);

    useEffect(() => {
        const submittedReport = location.state?.submittedReport;

        if (!submittedReport) {
            return;
        }

        const { report, train, station } = submittedReport;

        const reportId = report?.id || null;

        if (station) {
            setSelectedTrain(null);
            setSelectedTrainReports([]);

            setHighlightTrainReportId(null);
            setHighlightStationReportId(reportId);

            setSelectedStation(station);
        } else if (train) {
            setSelectedStation(null);

            setHighlightStationReportId(null);
            setHighlightTrainReportId(reportId);

            setSelectedTrain(train);
            setSelectedTrainReports([]);
        }

        navigate("/", {
            replace: true,
            state: null,
        });
    }, [location.state, navigate]);

    const handleStationSelect = (station) => {
        setHighlightStationReportId(null);
        setHighlightTrainReportId(null);

        setSelectedTrain(null);
        setSelectedTrainReports([]);

        setSelectedStation(station);
    };

    const handleCloseStationSheet = () => {
        setSelectedStation(null);
        setHighlightStationReportId(null);
    };

    const handleTrainSelect = async (train) => {
        setHighlightStationReportId(null);
        setHighlightTrainReportId(null);

        setSelectedStation(null);
        setSelectedTrain(train);
        setSelectedTrainReports([]);

        try {
            const reports = await getTrainReports(train.id);

            setSelectedTrainReports(reports);
        } catch (error) {
            console.error("Failed to load train reports:", error);

            setSelectedTrainReports([]);
        }
    };

    const handleCloseTrainSheet = () => {
        setSelectedTrain(null);
        setSelectedTrainReports([]);
        setHighlightTrainReportId(null);
    };

    const latestTrainReport = selectedTrainReports.length > 0 ? selectedTrainReports[0] : null;

    const selectedTrainStation = latestTrainReport?.station || null;

    return (
        <main className="home">
            <MapView selectedStation={selectedStation} selectedTrainStation={selectedTrainStation} />

            <MapSearch onStationSelect={handleStationSelect} onTrainSelect={handleTrainSelect} />

            {selectedStation && (
                <StationReportSheet
                    station={selectedStation}
                    highlightReportId={highlightStationReportId}
                    onClose={handleCloseStationSheet}
                />
            )}

            {selectedTrain && (
                <TrainReportSheet
                    train={selectedTrain}
                    reports={selectedTrainReports}
                    highlightReportId={highlightTrainReportId}
                    onClose={handleCloseTrainSheet}
                />
            )}

            {(isRestoringStation || isRestoringTrain) && <div className="station-restore-loading" aria-hidden="true" />}
        </main>
    );
}

export default Home;