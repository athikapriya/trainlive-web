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


export function getAllTrains(options = {}) {
    return apiFetchAll(
        "/api/trains/",
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


export function getTrainHistory(
    trainNumber,
    days = 7,
    { accessToken = null, signal } = {}
) {
    const headers = {};

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return apiFetch(
        `/api/trains/${encodeURIComponent(trainNumber)}/history/?days=${days}`,
        {
            headers,
            signal,
        }
    );
}