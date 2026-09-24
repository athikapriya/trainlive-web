import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import { forgotPassword } from "../../services/authApi";

import styles from "./auth.module.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const stationId = searchParams.get("station");
    const trainNumber = searchParams.get("train");

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            const data = await forgotPassword(email);

            setSuccess(data?.detail || "If an account exists with this email, a password reset link has been sent.");
        } catch (error) {
            setError(error?.data?.detail || error?.message || "Unable to send the reset link. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const loginPath = trainNumber
        ? `/login?train=${encodeURIComponent(trainNumber)}`
        : stationId
          ? `/login?station=${encodeURIComponent(stationId)}`
          : "/login";

    return (
        <main className={styles.authPage}>
            <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
                <FiArrowLeft size={20} />
            </button>

            <div className={styles.authWrap}>
                <div className={styles.authHeader}>

                    <h1>Reset your password</h1>

                    <p>Enter the email on your account and we'll send a reset link.</p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="forgot-email">Email</label>

                        <input
                            id="forgot-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.formError} role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className={styles.formSuccess} role="status">
                            {success}
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <Link to={loginPath}>Back to sign in</Link>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;