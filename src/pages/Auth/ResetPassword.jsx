import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import { resetPassword } from "../../services/authApi";

import styles from "./auth.module.css";

function ResetPassword() {
    const navigate = useNavigate();
    const { uid, token } = useParams();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function getErrorMessage(error) {
        const data = error?.data;

        if (data?.detail) {
            return data.detail;
        }

        if (typeof data === "object" && data) {
            const firstError = Object.values(data)[0];

            if (Array.isArray(firstError)) {
                return firstError[0];
            }

            if (typeof firstError === "string") {
                return firstError;
            }
        }

        return error?.message || "Unable to reset your password. Please try again.";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await resetPassword(uid, token, newPassword, confirmPassword);

            setSuccess(data?.detail || "Password reset successfully.");

            setNewPassword("");
            setConfirmPassword("");

            // Give the user a moment to see the success message.
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.authPage}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate("/login")}
                aria-label="Back to sign in"
            >
                <FiArrowLeft size={20} />
            </button>

            <div className={styles.authWrap}>
                <div className={styles.authHeader}>

                    <h1>Choose a new password</h1>

                    <p>Pick something you haven't used on TrainLive before.</p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="reset-password">New password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="reset-password"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="Create a new password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>

                        <div className={styles.passwordHint}>At least 8 characters, with a number.</div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="reset-confirm-password">Confirm password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="reset-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repeat your new password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword((current) => !current)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
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

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting || Boolean(success)}>
                        {isSubmitting ? "Resetting..." : "Reset password"}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <span>Remember your password?</span> <Link to="/login">Sign in</Link>
                </div>
            </div>
        </main>
    );
}

export default ResetPassword;