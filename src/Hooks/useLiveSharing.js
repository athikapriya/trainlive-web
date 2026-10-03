import { useCallback, useEffect, useRef, useState } from "react";

import { sendLiveLocation, startLive, stopLive } from "../services/liveApi";

const LOCATION_UPDATE_INTERVAL = 10_000;

const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 5_000,
    timeout: 15_000,
};

function getGeolocationErrorMessage(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Location permission was denied.";
        case error.POSITION_UNAVAILABLE:
            return "Your current location could not be determined.";
        case error.TIMEOUT:
            return "Getting your location timed out.";
        default:
            return "Unable to get your current location.";
    }
}

function isTerminalLiveError(message) {
    const lowerMessage = message.toLowerCase();

    return (
        lowerMessage.includes("outside the train route") ||
        lowerMessage.includes("journey has ended") ||
        lowerMessage.includes("does not currently have an active journey")
    );
}

export default function useLiveSharing({ accessToken, isAuthenticated }) {
    const [session, setSession] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [error, setError] = useState(null);
    const [lastLocation, setLastLocation] = useState(null);

    const watchIdRef = useRef(null);
    const sessionRef = useRef(null);
    const lastSentAtRef = useRef(0);
    const isSendingRef = useRef(false);
    const stoppingRef = useRef(false);

    const clearLocationWatcher = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);

            watchIdRef.current = null;
        }
    }, []);

    const resetLocalSharingState = useCallback(
        ({ clearError = false } = {}) => {
            clearLocationWatcher();

            sessionRef.current = null;

            setSession(null);
            setIsSharing(false);
            setLastLocation(null);

            lastSentAtRef.current = 0;
            isSendingRef.current = false;
            stoppingRef.current = false;

            if (clearError) {
                setError(null);
            }
        },
        [clearLocationWatcher]
    );

    const deactivateSessionAfterError = useCallback(
        async (sessionId) => {
            if (!sessionId) {
                resetLocalSharingState();
                return;
            }

            try {
                if (accessToken) {
                    await stopLive(sessionId, accessToken);
                }
            } catch (stopError) {
                console.error("Failed to deactivate live session after error:", stopError);
            } finally {
                resetLocalSharingState();
            }
        },
        [accessToken, resetLocalSharingState]
    );

    const handlePosition = useCallback(
        async (position) => {
            const currentSession = sessionRef.current;

            if (!currentSession || stoppingRef.current || isSendingRef.current) {
                return;
            }

            const now = Date.now();

            if (lastSentAtRef.current !== 0 && now - lastSentAtRef.current < LOCATION_UPDATE_INTERVAL) {
                return;
            }

            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed,
            };

            isSendingRef.current = true;

            try {
                await sendLiveLocation(currentSession.id, location, accessToken);

                lastSentAtRef.current = now;

                setLastLocation(location);
                setError(null);
            } catch (apiError) {
                const message = apiError?.data?.detail || apiError?.message || "Unable to update your live location.";

                setError(message);

                if (apiError?.status === 400 && isTerminalLiveError(message)) {
                    await deactivateSessionAfterError(currentSession.id);
                }
            } finally {
                isSendingRef.current = false;
            }
        },
        [accessToken, deactivateSessionAfterError]
    );

    const handlePositionError = useCallback(
        async (geoError) => {
            const message = getGeolocationErrorMessage(geoError);

            setError(message);

            /*
             * Permission denial is terminal.
             * The browser will not provide usable
             * locations until permission is changed,
             * so stop the backend session too.
             */
            if (geoError.code === geoError.PERMISSION_DENIED) {
                const currentSession = sessionRef.current;

                if (currentSession) {
                    await deactivateSessionAfterError(currentSession.id);
                } else {
                    resetLocalSharingState();
                }
            }
        },
        [deactivateSessionAfterError, resetLocalSharingState]
    );

    const startSharing = useCallback(
        async (trainNumber) => {
            if (!isAuthenticated) {
                setError("Please sign in to share your live location.");

                return null;
            }

            if (!accessToken) {
                setError("Your session has expired. Please sign in again.");

                return null;
            }

            if (!trainNumber) {
                setError("No train was selected.");

                return null;
            }

            if (!navigator.geolocation) {
                setError("Location tracking is not supported by this browser.");

                return null;
            }

            if (isSharing || isStarting) {
                return null;
            }

            setIsStarting(true);
            setError(null);
            setLastLocation(null);

            stoppingRef.current = false;
            lastSentAtRef.current = 0;
            isSendingRef.current = false;

            try {
                const newSession = await startLive(trainNumber, accessToken);

                sessionRef.current = newSession;

                setSession(newSession);
                setIsSharing(true);

                watchIdRef.current = navigator.geolocation.watchPosition(
                    handlePosition,
                    handlePositionError,
                    GEOLOCATION_OPTIONS
                );

                return newSession;
            } catch (apiError) {
                const message = apiError?.data?.detail || apiError?.message || "Unable to start live sharing.";

                setError(message);

                resetLocalSharingState();

                return null;
            } finally {
                setIsStarting(false);
            }
        },
        [
            accessToken,
            handlePosition,
            handlePositionError,
            isAuthenticated,
            isSharing,
            isStarting,
            resetLocalSharingState,
        ]
    );

    const stopSharing = useCallback(async () => {
        const currentSession = sessionRef.current;

        stoppingRef.current = true;

        clearLocationWatcher();

        if (!currentSession) {
            resetLocalSharingState({
                clearError: true,
            });

            return;
        }

        setIsStopping(true);
        setError(null);

        try {
            await stopLive(currentSession.id, accessToken);
        } catch (apiError) {
            const message = apiError?.data?.detail || apiError?.message || "Unable to stop live sharing.";

            setError(message);
        } finally {
            sessionRef.current = null;

            setSession(null);
            setIsSharing(false);
            setIsStopping(false);
            setLastLocation(null);

            lastSentAtRef.current = 0;
            isSendingRef.current = false;
            stoppingRef.current = false;
        }
    }, [accessToken, clearLocationWatcher, resetLocalSharingState]);

    useEffect(() => {
        return () => {
            clearLocationWatcher();
        };
    }, [clearLocationWatcher]);

    return {
        session,
        isSharing,
        isStarting,
        isStopping,
        error,
        lastLocation,
        startSharing,
        stopSharing,
    };
}