import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiMessageCircle } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import { submitContactMessage } from "../../services/contactApi";
import styles from "./ContactUs.module.css";

const CATEGORY_OPTIONS = [
    {
        value: "ISSUE",
        label: "Report an issue",
    },
    {
        value: "FEEDBACK",
        label: "Feedback",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];

function ContactUs() {
    const navigate = useNavigate();

    const { user, accessToken, isAuthenticated } = useAuth();

    const [category, setCategory] = useState("ISSUE");
    const [subject, setSubject] = useState("");
    const [details, setDetails] = useState("");
    const [email, setEmail] = useState(user?.email || "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [submittedMessage, setSubmittedMessage] = useState(null);


    useEffect(() => {
        if (user?.email && !email) {
            setEmail(user.email);
        }
    }, [user?.email, email]);

    function validateForm() {
        const errors = {};

        const trimmedSubject = subject.trim();
        const trimmedDetails = details.trim();
        const trimmedEmail = email.trim();

        if (!trimmedSubject) {
            errors.subject = "Please enter a subject.";
        } else if (trimmedSubject.length > 200) {
            errors.subject = "Subject cannot exceed 200 characters.";
        }

        if (!trimmedDetails) {
            errors.details = "Please tell us what happened.";
        } else if (trimmedDetails.length < 10) {
            errors.details = "Please provide a little more detail.";
        } else if (trimmedDetails.length > 5000) {
            errors.details = "Details cannot exceed 5000 characters.";
        }

        if (!trimmedEmail) {
            errors.email = "Please enter an email address.";
        } else if (!isValidEmail(trimmedEmail)) {
            errors.email = "Please enter a valid email address.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setFieldErrors({});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await submitContactMessage({
                category,
                subject: subject.trim(),
                details: details.trim(),
                email: email.trim().toLowerCase(),
                accessToken: isAuthenticated ? accessToken : null,
            });

            setSubmittedMessage(data);
        } catch (err) {
            const apiData = err?.data;

            if (apiData && typeof apiData === "object" && !Array.isArray(apiData)) {
                const apiFieldErrors = {};

                if (apiData.subject) {
                    apiFieldErrors.subject = getApiError(apiData.subject);
                }

                if (apiData.details) {
                    apiFieldErrors.details = getApiError(apiData.details);
                }

                if (apiData.email) {
                    apiFieldErrors.email = getApiError(apiData.email);
                }

                if (Object.keys(apiFieldErrors).length > 0) {
                    setFieldErrors(apiFieldErrors);
                } else {
                    setError(
                        apiData.detail ||
                            apiData.non_field_errors?.[0] ||
                            "Unable to send your message. Please try again."
                    );
                }
            } else {
                setError("Unable to connect to TrainLive. Please check your connection and try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleReset() {
        setCategory("ISSUE");
        setSubject("");
        setDetails("");
        setEmail(user?.email || "");
        setError("");
        setFieldErrors({});
        setSubmittedMessage(null);
    }

    if (submittedMessage) {
        return (
            <main className={styles.page}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                        >
                            <FiArrowLeft />
                        </button>

                        <div className={styles.headerText}>
                            <h1>Contact us</h1>
                            <p>Get help or send us feedback</p>
                        </div>
                    </header>

                    <div className={styles.successWrap}>
                        <div className={styles.successIcon}>
                            <FiCheck />
                        </div>

                        <h2>Message sent</h2>

                        <p className={styles.successEnglish}>
                            Thanks for reaching out — we'll get back to you within 24–48 hours.
                        </p>

                        <p className={styles.successBengali}>আপনার বার্তা পাঠানো হয়েছে, ধন্যবাদ।</p>

                        {submittedMessage.id && (
                            <div className={styles.referenceWrap}>
                                <span className={styles.referenceLabel}>Reference</span>

                                <span className={styles.reference}>#{formatReference(submittedMessage.id)}</span>
                            </div>
                        )}

                        <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                            Send another message
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <FiArrowLeft />
                    </button>

                    <div className={styles.headerText}>
                        <h1>Contact us</h1>
                        <p>Get help or send us feedback</p>
                    </div>
                </header>

                <div className={styles.content}>
                    <div className={styles.intro}>
                        <div className={styles.contactIcon}>
                            <FiMessageCircle />
                        </div>

                        <h2>How can we help?</h2>

                        <p className={styles.introEnglish}>
                            Report issues, share feedback, or ask us anything. We typically reply within 24–48 hours.
                        </p>

                        <p className={styles.introBengali}>সমস্যা জানান, মতামত দিন, অথবা আমাদের কিছু জিজ্ঞাসা করুন।</p>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.field}>
                            <label>What's this about?</label>

                            <div className={styles.pillOptions}>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`${styles.pillOption} ${
                                            category === option.value ? styles.pillOptionSelected : ""
                                        }`}
                                        onClick={() => setCategory(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="contact-subject">Subject</label>

                            <input
                                id="contact-subject"
                                type="text"
                                value={subject}
                                onChange={(event) => {
                                    setSubject(event.target.value);

                                    setFieldErrors((current) => ({
                                        ...current,
                                        subject: "",
                                    }));
                                }}
                                placeholder="e.g. Wrong station shown on map"
                                maxLength={200}
                                autoComplete="off"
                            />

                            {fieldErrors.subject && <p className={styles.fieldError}>{fieldErrors.subject}</p>}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="contact-details">Details</label>

                            <textarea
                                id="contact-details"
                                value={details}
                                onChange={(event) => {
                                    setDetails(event.target.value);

                                    setFieldErrors((current) => ({
                                        ...current,
                                        details: "",
                                    }));
                                }}
                                placeholder="Tell us what happened, or what you'd like to see…"
                                maxLength={5000}
                            />

                            <div className={styles.fieldBottom}>
                                {fieldErrors.details ? (
                                    <p className={styles.fieldError}>{fieldErrors.details}</p>
                                ) : (
                                    <span />
                                )}

                                <span className={styles.characterCount}>{details.length}/5000</span>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="contact-email">Email for reply</label>

                            <input
                                id="contact-email"
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);

                                    setFieldErrors((current) => ({
                                        ...current,
                                        email: "",
                                    }));
                                }}
                                placeholder="you@email.com"
                                autoComplete="email"
                                inputMode="email"
                            />

                            {isAuthenticated && user?.email && (
                                <p className={styles.fieldHint}>We'll use this email to reply to your message.</p>
                            )}

                            {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
                        </div>

                        {error && (
                            <div className={styles.formError} role="alert">
                                {error}
                            </div>
                        )}

                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send message"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function getApiError(value) {
    if (Array.isArray(value)) {
        return value[0] || "Invalid value.";
    }

    return value || "Invalid value.";
}

function formatReference(id) {
    const cleanId = String(id).replace(/-/g, "").toUpperCase();

    return `TL-${cleanId.slice(0, 6)}`;
}

export default ContactUs;