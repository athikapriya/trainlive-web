const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "trainlive_access_token";
const REFRESH_TOKEN_KEY = "trainlive_refresh_token";

let refreshPromise = null;

export class ApiError extends Error {
    constructor(message, { status, statusText, data } = {}) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

// =========================================================
// Token helpers
// =========================================================

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function storeTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    /*
     * Tell AuthContext that the session has expired.
     */
    window.dispatchEvent(new Event("trainlive-auth-expired"));
}

// =========================================================
// Refresh access token
// =========================================================

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        clearTokens();
        return null;
    }

    /*
     * Prevent multiple simultaneous refresh requests.
     *
     * Example:
     * 5 API requests return 401 at the same time.
     * Only ONE refresh request is sent.
     */
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/accounts/token/refresh/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                });

                let data = null;

                try {
                    data = await response.json();
                } catch {
                    data = null;
                }

                if (!response.ok || !data?.access) {
                    clearTokens();
                    return null;
                }

                const newAccessToken = data.access;

                /*
                 * If SimpleJWT rotates the refresh token,
                 * use the new one.
                 *
                 * Otherwise keep the existing one.
                 */
                const newRefreshToken = data.refresh || refreshToken;

                storeTokens(newAccessToken, newRefreshToken);

                return newAccessToken;
            } catch {
                clearTokens();
                return null;
            } finally {
                refreshPromise = null;
            }
        })();
    }

    return refreshPromise;
}

// =========================================================
// API request
// =========================================================

export async function apiFetch(endpoint, options = {}, allowRefresh = true) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const accessToken = getAccessToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    /*
     * Automatically attach access token.
     *
     * If the caller already supplied Authorization,
     * don't overwrite it.
     */
    if (accessToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    /*
     * Access token expired.
     *
     * Refresh it and retry the original request once.
     */
    if (response.status === 401 && allowRefresh) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
            return apiFetch(
                endpoint,
                {
                    ...options,
                    headers: {
                        ...(options.headers || {}),
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                },
                false
            );
        }

        throw new ApiError("Your session has expired. Please log in again.", {
            status: 401,
            statusText: "Unauthorized",
        });
    }

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

// =========================================================
// API request with pagination
// =========================================================

export async function apiFetchAll(endpoint, options = {}) {
    let url = endpoint;
    const results = [];

    while (url) {
        const data = await apiFetch(url, options);

        /*
         * Non-paginated response.
         */
        if (!data?.results) {
            return data;
        }

        results.push(...data.results);

        url = data.next;
    }

    return results;
}

export default API_BASE_URL;