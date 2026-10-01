import { apiFetch } from "./api";


// =========================================================
// Get all reviews
// =========================================================
export async function getReviews() {
    const data = await apiFetch("/api/reviews/");

    // Paginated DRF response
    if (Array.isArray(data?.results)) {
        return data.results;
    }

    // Non-paginated DRF response
    if (Array.isArray(data)) {
        return data;
    }

    return [];
}


// =========================================================
// Create review
// =========================================================
export async function createReview({
    rating,
    message,
    accessToken,
}) {
    return apiFetch("/api/reviews/", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            rating,
            message,
        }),
    });
}


// =========================================================
// Get my review
// =========================================================
export async function getMyReview(accessToken) {
    return apiFetch("/api/reviews/mine/", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}


// =========================================================
// Update my review
// =========================================================
export async function updateMyReview({
    rating,
    message,
    accessToken,
}) {
    return apiFetch("/api/reviews/mine/", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            rating,
            message,
        }),
    });
}


// =========================================================
// Delete my review
// =========================================================
export async function deleteMyReview(accessToken) {
    return apiFetch("/api/reviews/mine/", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}


// =========================================================
// Mark review helpful
// =========================================================
export async function markReviewHelpful({
    reviewId,
    accessToken,
}) {
    return apiFetch(
        `/api/reviews/${reviewId}/helpful/`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
}