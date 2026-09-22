const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";


export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
        );
    }
    return response.json();
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