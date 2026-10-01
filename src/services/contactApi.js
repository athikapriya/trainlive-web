import { apiFetch } from "./api";

export async function submitContactMessage({ category, subject, details, email, accessToken }) {
    const headers = {};

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return apiFetch("/api/contacts/", {
        method: "POST",
        headers,
        body: JSON.stringify({
            category,
            subject,
            details,
            email,
        }),
    });
}