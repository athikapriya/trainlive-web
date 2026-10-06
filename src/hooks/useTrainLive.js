import { useCallback, useEffect, useRef, useState } from "react";

import { getLiveTrain } from "../services/liveApi";

const LIVE_POLL_INTERVAL = 10_000;

export default function useTrainLive({ trainNumber, accessToken, isAuthenticated, enabled = false }) {
    const [liveUsers, setLiveUsers] = useState([]);
    const [liveCount, setLiveCount] = useState(0);
    const [serviceDate, setServiceDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isMountedRef = useRef(true);

    const resetLiveState = useCallback(() => {
        setLiveUsers([]);
        setLiveCount(0);
        setServiceDate(null);
        setError(null);
        setIsLoading(false);
    }, []);

    const fetchLive = useCallback(async () => {
        if (!isAuthenticated || !accessToken || !trainNumber || !enabled) {
            return;
        }

        try {
            setIsLoading(true);

            const data = await getLiveTrain(trainNumber, accessToken);

            if (!isMountedRef.current) {
                return;
            }

            setLiveUsers(data.users || []);
            setLiveCount(data.live_count || 0);
            setServiceDate(data.service_date || null);
            setError(null);
        } catch (apiError) {
            if (!isMountedRef.current) {
                return;
            }

            const message = apiError?.data?.detail || apiError?.message || "Unable to load live locations.";

            setError(message);
            setLiveUsers([]);
            setLiveCount(0);
            setServiceDate(null);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [accessToken, enabled, isAuthenticated, trainNumber]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!enabled || !isAuthenticated || !accessToken || !trainNumber) {
            resetLiveState();
            return undefined;
        }

        fetchLive();

        const intervalId = window.setInterval(fetchLive, LIVE_POLL_INTERVAL);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [accessToken, enabled, fetchLive, isAuthenticated, resetLiveState, trainNumber]);

    return {
        liveUsers,
        liveCount,
        serviceDate,
        isLoading,
        error,
        refreshLive: fetchLive,
    };
}