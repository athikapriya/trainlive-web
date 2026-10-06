import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../Hooks/useAuth";

import { createReview, getMyReview, getReviews, markReviewHelpful, updateMyReview } from "../../services/reviewApi";

import Style from "./Reviews.module.css";

// =========================================================
// Star Icon
// =========================================================
function StarIcon({ filled = false, className = "" }) {
    return (
        <svg
            className={`${Style.star} ${filled ? Style.filled : ""} ${className}`}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

// =========================================================
// Back Icon
// =========================================================
function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

// =========================================================
// Helpful Icon
// =========================================================
function HelpfulIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
    );
}

// =========================================================
// Loading Skeleton
// =========================================================
function ReviewSkeleton() {
    return (
        <div className={Style.reviewCard}>
            <div className={Style.skeletonTop}>
                <div className={Style.skeletonAvatar} />

                <div className={Style.skeletonInfo}>
                    <div className={Style.skeletonLineSmall} />
                    <div className={Style.skeletonLineTiny} />
                </div>
            </div>

            <div className={Style.skeletonLine} />
            <div className={Style.skeletonLine} />
            <div className={Style.skeletonLineShort} />
        </div>
    );
}

// =========================================================
// Format Date
// =========================================================
function formatReviewDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

// =========================================================
// Reviews Page
// =========================================================
function Reviews() {
    const navigate = useNavigate();

    const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showWriteReview, setShowWriteReview] = useState(false);

    const [myReview, setMyReview] = useState(null);

    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");

    const [hoverRating, setHoverRating] = useState(0);

    const [fieldError, setFieldError] = useState("");
    const [submitError, setSubmitError] = useState("");

    const [helpfulLoading, setHelpfulLoading] = useState(null);

    const [toast, setToast] = useState("");

    // =====================================================
    // Load reviews
    // =====================================================
    useEffect(() => {
        let mounted = true;

        async function loadReviews() {
            try {
                setLoading(true);

                const data = await getReviews();

                if (mounted) {
                    setReviews(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);

                if (mounted) {
                    setReviews([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadReviews();

        return () => {
            mounted = false;
        };
    }, []);

    // =====================================================
    // Load user's own review
    // =====================================================
    useEffect(() => {
        if (authLoading || !isAuthenticated || !accessToken) {
            return;
        }

        let mounted = true;

        async function loadMyReview() {
            try {
                const data = await getMyReview(accessToken);

                if (!mounted) {
                    return;
                }

                setMyReview(data);
                setRating(data?.rating || 0);
                setMessage(data?.message || "");
            } catch (error) {
                // 404 simply means the user has not reviewed yet.
                if (error?.status !== 404) {
                    console.error("Failed to load my review:", error);
                }

                if (mounted) {
                    setMyReview(null);
                }
            }
        }

        loadMyReview();

        return () => {
            mounted = false;
        };
    }, [authLoading, isAuthenticated, accessToken]);

    // =====================================================
    // Rating statistics
    // =====================================================
    const ratingStats = useMemo(() => {
        const total = reviews.length;

        if (!total) {
            return {
                average: 0,
                total: 0,
                distribution: {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0,
                },
            };
        }

        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        let totalRating = 0;

        reviews.forEach((review) => {
            const value = Number(review.rating);

            if (value >= 1 && value <= 5) {
                distribution[value] += 1;
                totalRating += value;
            }
        });

        return {
            average: totalRating / total,
            total,
            distribution,
        };
    }, [reviews]);

    // =====================================================
    // Toast
    // =====================================================
    function showToast(message) {
        setToast(message);

        window.setTimeout(() => {
            setToast("");
        }, 2500);
    }

    // =====================================================
    // Open review form
    // =====================================================
    function handleWriteReview() {
        if (!isAuthenticated) {
            navigate("/login?review=true");
            return;
        }

        setSubmitError("");
        setFieldError("");

        setShowWriteReview(true);

        window.setTimeout(() => {
            document.getElementById("reviewMessage")?.focus();
        }, 100);
    }

    // =====================================================
    // Select rating
    // =====================================================
    function handleRating(value) {
        setRating(value);
        setFieldError("");
    }

    // =====================================================
    // Submit review
    // =====================================================
    async function handleSubmitReview(event) {
        event.preventDefault();

        if (!isAuthenticated || !accessToken) {
            navigate("/login?review=true");
            return;
        }

        const cleanMessage = message.trim();

        if (!rating) {
            setFieldError("Please select a star rating.");
            return;
        }

        if (!cleanMessage) {
            setFieldError("Please write something about your experience.");
            return;
        }

        if (cleanMessage.length < 5) {
            setFieldError("Please write a little more about your experience.");
            return;
        }

        setSubmitting(true);
        setSubmitError("");
        setFieldError("");

        try {
            let savedReview;

            if (myReview) {
                savedReview = await updateMyReview({
                    rating,
                    message: cleanMessage,
                    accessToken,
                });
            } else {
                savedReview = await createReview({
                    rating,
                    message: cleanMessage,
                    accessToken,
                });
            }

            setMyReview(savedReview);

            setReviews((currentReviews) => {
                const exists = currentReviews.some((review) => review.id === savedReview.id);

                if (exists) {
                    return currentReviews.map((review) => (review.id === savedReview.id ? savedReview : review));
                }

                return [savedReview, ...currentReviews];
            });

            setShowWriteReview(false);

            showToast(myReview ? "Your review was updated." : "Thanks for reviewing TrainLive!");
        } catch (error) {
            console.error("Failed to submit review:", error);

            const data = error?.data;

            const messageError = data?.message?.[0] || data?.detail || "Unable to submit your review right now.";

            setSubmitError(messageError);
        } finally {
            setSubmitting(false);
        }
    }

    // =====================================================
    // Helpful
    // =====================================================
    async function handleHelpful(review) {
        if (!isAuthenticated || !accessToken) {
            navigate("/login?review=true");
            return;
        }

        if (review.is_helpful) {
            return;
        }

        setHelpfulLoading(review.id);

        try {
            const result = await markReviewHelpful({
                reviewId: review.id,
                accessToken,
            });

            setReviews((currentReviews) =>
                currentReviews.map((item) =>
                    item.id === review.id
                        ? {
                              ...item,
                              is_helpful: true,
                              helpful_count: result.helpful_count ?? Number(item.helpful_count || 0) + 1,
                          }
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to mark review helpful:", error);

            if (error?.data?.non_field_errors?.[0]) {
                showToast(error.data.non_field_errors[0]);
            } else if (error?.data?.detail) {
                showToast(error.data.detail);
            } else {
                showToast("Unable to mark this review as helpful.");
            }
        } finally {
            setHelpfulLoading(null);
        }
    }

    // =====================================================
    // Render stars
    // =====================================================
    function renderStars(value, sizeClass = "") {
        return (
            <div className={`${Style.stars} ${sizeClass}`} aria-label={`${value} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= value} />
                ))}
            </div>
        );
    }

    // =====================================================
    // Render rating bars
    // =====================================================
    function renderRatingBars() {
        return [5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats.distribution[star] || 0;

            const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;

            return (
                <div className={Style.ratingBarRow} key={star}>
                    <span className={Style.ratingBarNumber}>{star}</span>

                    <StarIcon filled />

                    <div className={Style.ratingBarTrack}>
                        <div
                            className={Style.ratingBarFill}
                            style={{
                                width: `${percentage}%`,
                            }}
                        />
                    </div>

                    <span className={Style.ratingBarCount}>{count}</span>
                </div>
            );
        });
    }

    // =====================================================
    // Page
    // =====================================================
    return (
        <div className={Style.page}>
            <div className={Style.container}>
                {/* =========================================
                    Top Bar
                ========================================= */}
                <header className={Style.topBar}>
                    <button
                        type="button"
                        className={Style.backButton}
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <BackIcon />
                    </button>

                    <h1 className={Style.pageTitle}>Ratings & reviews</h1>

                    <div className={Style.topBarSpacer} />
                </header>

                {/* =========================================
                    Rating Hero
                ========================================= */}
                <section className={Style.ratingHero}>
                    <div className={Style.ratingBigCol}>
                        <div className={Style.ratingBig}>
                            {ratingStats.total ? ratingStats.average.toFixed(1) : "—"}
                        </div>

                        <div className={Style.ratingStarsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon key={star} filled={ratingStats.average >= star - 0.25} />
                            ))}
                        </div>

                        <div className={Style.ratingCount}>
                            {ratingStats.total} {ratingStats.total === 1 ? "review" : "reviews"}
                        </div>
                    </div>

                    <div className={Style.ratingBars}>{renderRatingBars()}</div>
                </section>

                {/* =========================================
                    Write Review Button
                ========================================= */}
                <div className={Style.writeButtonWrap}>
                    <button type="button" className={Style.primaryButton} onClick={handleWriteReview}>
                        {myReview ? "Edit your review" : "Write a review"}
                    </button>
                </div>

                {/* =========================================
                    Write Review Card
                ========================================= */}
                {showWriteReview && (
                    <section className={Style.writeReviewCard}>
                        <div className={Style.writeHeader}>
                            <div>
                                <h2>{myReview ? "Edit your review" : "Share your experience"}</h2>

                                <p>Your feedback helps make TrainLive better for everyone.</p>
                            </div>

                            <button
                                type="button"
                                className={Style.closeWrite}
                                onClick={() => setShowWriteReview(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Star Picker */}
                        <div className={Style.starPicker}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className={Style.starButton}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => handleRating(star)}
                                    aria-label={`${star} stars`}
                                >
                                    <StarIcon filled={star <= (hoverRating || rating)} />
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmitReview}>
                            <div className={Style.field}>
                                <textarea
                                    id="reviewMessage"
                                    className={Style.textarea}
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    maxLength={2000}
                                    placeholder="Share your experience with TrainLive… / আপনার অভিজ্ঞতা লিখুন"
                                    rows={5}
                                />

                                <div className={Style.characterCount}>{message.length}/2000</div>
                            </div>

                            {fieldError && <div className={Style.error}>{fieldError}</div>}

                            {submitError && <div className={Style.error}>{submitError}</div>}

                            <button type="submit" className={Style.primaryButton} disabled={submitting}>
                                {submitting ? "Posting…" : myReview ? "Update review" : "Post review"}
                            </button>
                        </form>
                    </section>
                )}

                {/* =========================================
                    Reviews Header
                ========================================= */}
                <div className={Style.sectionHeader}>
                    <h2>Recent reviews</h2>

                    {loading && <span>Loading…</span>}
                </div>

                {/* =========================================
                    Reviews
                ========================================= */}
                <section className={Style.reviewsList}>
                    {loading ? (
                        <>
                            <ReviewSkeleton />
                            <ReviewSkeleton />
                            <ReviewSkeleton />
                        </>
                    ) : reviews.length === 0 ? (
                        <div className={Style.emptyState}>
                            <div className={Style.emptyStars}>
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                            </div>

                            <h3>No reviews yet</h3>

                            <p>Be the first to share your experience with TrainLive.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <article className={Style.reviewCard} key={review.id}>
                                <div className={Style.reviewTop}>
                                    <div className={Style.reviewUser}>
                                        <div className={Style.userAvatar}>
                                            {(review.user_name || "U").charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className={Style.reviewName}>
                                                {review.user_name || "TrainLive user"}
                                            </div>

                                            {renderStars(Number(review.rating))}
                                        </div>
                                    </div>

                                    <time className={Style.reviewDate}>{formatReviewDate(review.created_at)}</time>
                                </div>

                                <p className={Style.reviewText}>{review.message}</p>

                                <button
                                    type="button"
                                    className={`${Style.helpfulButton} ${review.is_helpful ? Style.helpfulActive : ""}`}
                                    disabled={helpfulLoading === review.id || review.is_helpful}
                                    onClick={() => handleHelpful(review)}
                                >
                                    <HelpfulIcon />

                                    <span>{review.is_helpful ? "Helpful" : "Helpful"}</span>

                                    {Number(review.helpful_count || 0) > 0 && <span>({review.helpful_count})</span>}
                                </button>
                            </article>
                        ))
                    )}
                </section>
            </div>

            {/* =============================================
                Toast
            ============================================= */}
            {toast && <div className={Style.toast}>{toast}</div>}
        </div>
    );
}

export default Reviews;