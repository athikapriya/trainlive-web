const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
    constructor(message, { status, statusText, data } = {}) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new ApiError(`API request failed: ${response.status} ${response.statusText}`, {
            status: response.status,
            statusText: response.statusText,
            data,
        });
    }

    return data;
}

export async function apiFetchAll(endpoint, options = {}) {
    let url = endpoint;
    const results = [];

    while (url) {
        const data = await apiFetch(url, options);
        results.push(...(data.results || []));
        url = data.next;
    }

    return results;
}

export default API_BASE_URL;