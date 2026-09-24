import { apiFetch, apiFetchAll } from "./api";


export function getTrains(search = "", options = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    const queryString = params.toString();

    return apiFetchAll(
        `/api/trains/${queryString ? `?${queryString}` : ""}`,
        options
    );
}


export function getTrain(trainNumber) {
    return apiFetch(
        `/api/trains/${encodeURIComponent(trainNumber)}/`
    );
}


export function getTrainRoute(trainNumber) {
    return apiFetch(
        `/api/trains/${encodeURIComponent(trainNumber)}/route/`
    );
}


export function getTrainReports(
    trainId,
    { accessToken = null, signal } = {}
) {
    const headers = {};

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return apiFetchAll(
        `/api/reports/?train=${encodeURIComponent(trainId)}`,
        {
            headers,
            signal,
        }
    );
}