import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import { registerUser } from "../../services/authApi";

import styles from "./auth.module.css";

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const stationId = searchParams.get("station");
    const trainNumber = searchParams.get("train");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

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

        return error?.message || "Unable to create your account. Please try again.";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            await registerUser(fullName, email, password, confirmPassword);
            await login(email, password);
            if (trainNumber) {
                navigate(`/?train=${encodeURIComponent(trainNumber)}`, {
                    replace: true,
                });
            } else if (stationId) {
                navigate(`/?station=${encodeURIComponent(stationId)}`, {
                    replace: true,
                });
            } else {
                navigate("/", {
                    replace: true,
                });
            }
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

                    <h1>Create your account</h1>

                    <p>Share updates and help fellow riders.</p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="register-name">Full name</label>

                        <input
                            id="register-name"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="register-email">Email</label>

                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="register-password">Password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                minLength={8}
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
                        <label htmlFor="register-confirm-password">Confirm password</label>

                        <div className={styles.passwordInput}>
                            <input
                                id="register-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                                minLength={8}
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

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <span>Already have an account?</span>{" "}
                    <Link
                        to={
                            trainNumber
                                ? `/login?train=${encodeURIComponent(trainNumber)}`
                                : stationId
                                  ? `/login?station=${encodeURIComponent(stationId)}`
                                  : "/login"
                        }
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Register;