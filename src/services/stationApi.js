import { apiFetch, apiFetchAll } from "./api";


export function getStations(search = "", options = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    const queryString = params.toString();
    
    return apiFetchAll(
        `/api/stations/${queryString ? `?${queryString}` : ""}`,
        options
    );
}


export function getStation(stationId) {
    return apiFetch(
        `/api/stations/${stationId}/`
    );
}