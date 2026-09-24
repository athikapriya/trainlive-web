const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";


function getAuthHeaders(accessToken) {
    if (!accessToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${accessToken}`,
    };
}


async function parseError(response) {
    const error = new Error(
        `API request failed: ${response.status} ${response.statusText}`
    );

    error.status = response.status;

    try {
        error.data = await response.json();
    } catch {
        error.data = null;
    }

    return error;
}


/* =========================================================
   Saved Stations
========================================================= */

export async function getSavedStations(
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/stations/`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                ...getAuthHeaders(accessToken),
            },
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}


export async function saveStation(
    stationId,
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/stations/`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(accessToken),
            },
            body: JSON.stringify({
                station: stationId,
            }),
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}


export async function deleteSavedStation(
    savedStationId,
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/stations/${savedStationId}/`,
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                ...getAuthHeaders(accessToken),
            },
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return null;
}


/* =========================================================
   Saved Trains
========================================================= */

export async function getSavedTrains(
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/trains/`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                ...getAuthHeaders(accessToken),
            },
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}


export async function saveTrain(
    trainId,
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/trains/`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(accessToken),
            },
            body: JSON.stringify({
                train: trainId,
            }),
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}


export async function deleteSavedTrain(
    savedTrainId,
    { accessToken = null, signal } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/saved/trains/${savedTrainId}/`,
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                ...getAuthHeaders(accessToken),
            },
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return null;
}