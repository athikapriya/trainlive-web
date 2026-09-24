import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";

import styles from "./auth.module.css";

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const stationId = searchParams.get("station");
    const trainNumber = searchParams.get("train");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
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
            setError(
                error?.data?.detail || error?.message || "Unable to sign in. Please check your email and password."
            );
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

                    <h1>Sign in</h1>

                    <p>Welcome back to TrainLive</p>

                    <p className={styles.bengaliText}>সাইন ইন করে রিপোর্ট দেখুন এবং ট্রেনের সর্বশেষ তথ্য শেয়ার করুন</p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="login-email">Email</label>

                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <div className={styles.passwordLabel}>
                            <label htmlFor="login-password">Password</label>

                            <Link
                                to={
                                    stationId
                                        ? `/forgot-password?station=${encodeURIComponent(stationId)}`
                                        : trainNumber
                                          ? `/forgot-password?train=${encodeURIComponent(trainNumber)}`
                                          : "/forgot-password"
                                }
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div className={styles.passwordInput}>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
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
                    </div>

                    {error && (
                        <div className={styles.formError} role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <span>Don't have an account?</span>{" "}
                    <Link
                        to={
                            trainNumber
                                ? `/register?train=${encodeURIComponent(trainNumber)}`
                                : stationId
                                  ? `/register?station=${encodeURIComponent(stationId)}`
                                  : "/register"
                        }
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Login;