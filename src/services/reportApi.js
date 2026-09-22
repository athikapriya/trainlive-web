import { apiFetch } from "./api";

export function getStationReports(stationId) {
    return apiFetch(
        `/api/reports/?station=${encodeURIComponent(stationId)}`
    );
}

export function getTrainReports(trainId) {
    return apiFetch(
        `/api/reports/?train=${encodeURIComponent(trainId)}`
    );
}