import { apiFetch } from "./api";

export async function startLive(trainNumber, accessToken) {
    return apiFetch(`/api/live/trains/${encodeURIComponent(trainNumber)}/start/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
    });
}

export async function sendLiveLocation(sessionId, { latitude, longitude, accuracy, speed }, accessToken) {
    return apiFetch(`/api/live/sessions/${encodeURIComponent(sessionId)}/location/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            latitude,
            longitude,
            accuracy,
            speed,
        }),
    });
}

export async function getLiveTrain(trainNumber, accessToken) {
    return apiFetch(`/api/live/trains/${encodeURIComponent(trainNumber)}/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function stopLive(sessionId, accessToken) {
    return apiFetch(`/api/live/sessions/${encodeURIComponent(sessionId)}/stop/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
    });
}