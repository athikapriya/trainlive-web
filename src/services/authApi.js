const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

async function parseResponse(response) {
    let data = null;

    try {
        data = await response.json();
    } catch {
        // Response has no JSON body.
    }

    if (!response.ok) {
        const error = new Error(
            data?.detail ||
            `API request failed: ${response.status} ${response.statusText}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}


// =========================================================
// Login
// =========================================================
export async function loginUser(email, password) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/login/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Register
// =========================================================
export async function registerUser(
    fullName,
    email,
    password,
    confirmPassword
) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/register/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: fullName,
                email,
                password,
                confirm_password: confirmPassword,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Get current user
// =========================================================
export async function getCurrentUser(accessToken) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/me/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return parseResponse(response);
}


// =========================================================
// Refresh access token
// =========================================================
export async function refreshAccessToken(refreshToken) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/token/refresh/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: refreshToken,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Logout
// =========================================================
export async function logoutUser(accessToken, refreshToken) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/logout/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                refresh: refreshToken,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Forgot password
// =========================================================
export async function forgotPassword(email) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/password/forgot/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Reset password
// =========================================================
export async function resetPassword(
    uid,
    token,
    newPassword,
    confirmPassword
) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/password/reset/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid,
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }
    );

    return parseResponse(response);
}


// =========================================================
// Change password
// =========================================================
export async function changePassword(
    accessToken,
    oldPassword,
    newPassword,
    confirmPassword
) {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/password/change/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }
    );

    return parseResponse(response);
}