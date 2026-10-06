import { useEffect, useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

import MapView from "../../components/map/MapView";
import MapSearch from "../../components/map/MapSearch";
import StationReportSheet from "../../components/stationReportSheet/StationReportSheet";
import TrainReportSheet from "../../components/trainReportSheet/TrainReportSheet";
import LiveControls from "../../components/live/liveControls";

import useAuth from "../../hooks/useAuth";
import useLiveSharing from "../../hooks/useLiveSharing";
import useTrainLive from "../../hooks/useTrainLive";

import { getStation } from "../../services/stationApi";
import { getTrain, getTrainReports, getTrainRoute } from "../../services/trainApi";

import "../../styles/Home.css";
import "../../styles/map/MapControls.css";
import "../../styles/map/MapSearch.css";
import "../../styles/live/LiveControls.css";

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

    const { accessToken, isAuthenticated } = useAuth();

    /*
     * Live state
     */
    const [showLive, setShowLive] = useState(false);
    const [liveTrainNumber, setLiveTrainNumber] = useState(null);
    const [sharingTrain, setSharingTrain] = useState(null);
    const [sharingTrainRoute, setSharingTrainRoute] = useState(null);
    const [liveTrainRoute, setLiveTrainRoute] = useState(null);

    const liveAction = searchParams.get("live");

    const {
        liveUsers,
        liveCount,
        isLoading: isLiveLoading,
        error: liveError,
    } = useTrainLive({
        trainNumber: liveTrainNumber,
        accessToken,
        isAuthenticated,
        enabled: showLive,
    });

    const {
        session,
        isSharing,
        isStarting: isStartingLive,
        isStopping: isStoppingLive,
        error: sharingError,
        lastLocation,
        startSharing,
        stopSharing,
    } = useLiveSharing({
        accessToken,
        isAuthenticated,
    });

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
                    (currentParams) => {
                        const nextParams = new URLSearchParams(currentParams);
                        nextParams.delete("station");
                        return nextParams;
                    },
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
                    (currentParams) => {
                        const nextParams = new URLSearchParams(currentParams);
                        nextParams.delete("station");
                        return nextParams;
                    },
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
                    (currentParams) => {
                        const nextParams = new URLSearchParams(currentParams);
                        nextParams.delete("train");
                        return nextParams;
                    },
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
                    (currentParams) => {
                        const nextParams = new URLSearchParams(currentParams);
                        nextParams.delete("train");
                        return nextParams;
                    },
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

    /*
     * Show Live
     */
    const handleShowLive = async (train) => {
        setLiveTrainNumber(train.number);
        setShowLive(true);
        setLiveTrainRoute(null);

        try {
            const routeData = await getTrainRoute(train.number);

            setLiveTrainRoute(routeData?.route || null);
        } catch (error) {
            console.error("Failed to load live train route:", error);

            setLiveTrainRoute(null);
        }
    };

    const handleStopLive = () => {
        setShowLive(false);
        setLiveTrainNumber(null);
        setLiveTrainRoute(null);
    };

    /*
     * Share Live
     */
    const handleShareLive = async (train) => {
        const newSession = await startSharing(train.number);

        if (!newSession) {
            return null;
        }

        setSharingTrain(train);
        setSharingTrainRoute(null);

        try {
            const routeData = await getTrainRoute(train.number);

            setSharingTrainRoute(routeData?.route || null);
        } catch (error) {
            console.error("Failed to load sharing train route:", error);

            setSharingTrainRoute(null);
        }

        return newSession;
    };

    const handleStopSharing = async () => {
        await stopSharing();

        setSharingTrain(null);
        setSharingTrainRoute(null);
    };

    const handleDismissSharingStatus = () => {
        setSharingTrainRoute(null);
    };

    /*
     * Authentication → Live continuation
     *
     * The login/register page returns here with:
     *
     * /?live=show
     * /?live=share
     *
     * LiveControls consumes that intent and opens the
     * appropriate train picker.
     */
    const handleLiveActionHandled = () => {
        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                nextParams.delete("live");
                return nextParams;
            },
            {
                replace: true,
            }
        );
    };

    const latestTrainReport = selectedTrainReports.length > 0 ? selectedTrainReports[0] : null;

    const selectedTrainStation = latestTrainReport?.station || null;

    return (
        <main className="home">
            <MapView
                selectedStation={selectedStation}
                selectedTrainStation={selectedTrainStation}
                liveUsers={liveUsers}
                ownLiveLocation={lastLocation}
                showLive={showLive}
                isSharing={isSharing}
                liveTrainRoute={showLive ? liveTrainRoute : sharingTrainRoute}
            />

            <MapSearch onStationSelect={handleStationSelect} onTrainSelect={handleTrainSelect} />

            <LiveControls
                isAuthenticated={isAuthenticated}
                showLive={showLive}
                liveTrainNumber={liveTrainNumber}
                liveCount={liveCount}
                isLiveLoading={isLiveLoading}
                liveError={liveError}
                isSharing={isSharing}
                sharingTrainNumber={sharingTrain?.number}
                isStarting={isStartingLive}
                isStopping={isStoppingLive}
                sharingError={sharingError}
                lastLocation={lastLocation}
                liveAction={liveAction}
                onLiveActionHandled={handleLiveActionHandled}
                onShowLive={handleShowLive}
                onStopLive={handleStopLive}
                onShareLive={handleShareLive}
                onStopSharing={handleStopSharing}
                onDismissSharingStatus={handleDismissSharingStatus}
                onRequireAuth={(action) => {
                    navigate(`/login?live=${action}`);
                }}
            />

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