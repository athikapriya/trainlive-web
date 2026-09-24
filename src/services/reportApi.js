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


export async function getStationReports(
    stationId,
    {
        accessToken = null,
        signal,
    } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/reports/?station=${encodeURIComponent(
            stationId
        )}`,
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


export async function getReportVote(
    reportId,
    {
        accessToken = null,
        signal,
    } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/reports/${reportId}/vote/`,
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


export async function voteOnReport(
    reportId,
    vote,
    {
        accessToken = null,
        signal,
    } = {}
) {
    const response = await fetch(
        `${API_BASE_URL}/api/reports/${reportId}/vote/`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(accessToken),
            },
            body: JSON.stringify({
                vote,
            }),
            signal,
        }
    );

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}