import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import { changePassword } from "../../services/authApi";

import styles from "./auth.module.css";

function ChangePassword() {
    const navigate = useNavigate();
    const { accessToken, isAuthenticated } = useAuth();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
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

        return error?.message || "Unable to change your password. Please try again.";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!isAuthenticated || !accessToken) {
            navigate("/login", { replace: true });
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (oldPassword === newPassword) {
            setError("New password must be different from the current password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await changePassword(accessToken, oldPassword, newPassword, confirmPassword);

            setSuccess(data?.detail || "Password changed successfully.");

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.authPage}>
            <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
                <FiArrowLeft size={20} />
            </button>

            <div className={styles.authWrap}>
                <div className={styles.authHeader}>

                    <h1>Change password</h1>

                    <p>Pick something you haven't used on TrainLive before.</p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="current-password">Current password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="current-password"
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(event) => setOldPassword(event.target.value)}
                                placeholder="Enter your current password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowOldPassword((current) => !current)}
                                aria-label={showOldPassword ? "Hide password" : "Show password"}
                            >
                                {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="new-password">New password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
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
                                onClick={() => setShowNewPassword((current) => !current)}
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>

                        <div className={styles.passwordHint}>At least 8 characters, with a number.</div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirm-new-password">Confirm new password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="confirm-new-password"
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

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? "Changing..." : "Change password"}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <Link to="/profile">Back to profile</Link>
                </div>
            </div>
        </main>
    );
}

export default ChangePassword;
