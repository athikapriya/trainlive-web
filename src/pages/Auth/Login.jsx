import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import useAuth from "../../Hooks/useAuth";
import styles from "./auth.module.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const from = location.state?.from;

    const stationId = searchParams.get("station");
    const trainNumber = searchParams.get("train");
    const reportIntent = searchParams.get("report") === "true";

    const liveIntent = searchParams.get("live");

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

            if (from) {
                navigate(from, {
                    replace: true,
                });

                return;
            }

            if (reportIntent) {
                navigate("/?report=true", {
                    replace: true,
                });

                return;
            }

            if (liveIntent === "show" || liveIntent === "share") {
                navigate(`/?live=${liveIntent}`, {
                    replace: true,
                });

                return;
            }

            if (trainNumber) {
                navigate(`/?train=${encodeURIComponent(trainNumber)}`, {
                    replace: true,
                });

                return;
            }

            if (stationId) {
                navigate(`/?station=${encodeURIComponent(stationId)}`, {
                    replace: true,
                });

                return;
            }

            navigate("/", {
                replace: true,
            });
        } catch (error) {
            setError(
                error?.data?.detail || error?.message || "Unable to sign in. Please check your email and password."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const forgotPasswordPath = (() => {
        if (from) {
            const params = new URLSearchParams();

            params.set("from", from);

            return `/forgot-password?${params.toString()}`;
        }

        const params = new URLSearchParams();

        if (reportIntent) {
            params.set("report", "true");
        } else if (liveIntent === "show" || liveIntent === "share") {
            params.set("live", liveIntent);
        } else if (trainNumber) {
            params.set("train", trainNumber);
        } else if (stationId) {
            params.set("station", stationId);
        }

        const query = params.toString();

        return query ? `/forgot-password?${query}` : "/forgot-password";
    })();

    const registerPath = (() => {
        if (from) {
            const params = new URLSearchParams();

            params.set("from", from);

            return `/register?${params.toString()}`;
        }

        const params = new URLSearchParams();

        if (reportIntent) {
            params.set("report", "true");
        } else if (liveIntent === "show" || liveIntent === "share") {
            params.set("live", liveIntent);
        } else if (trainNumber) {
            params.set("train", trainNumber);
        } else if (stationId) {
            params.set("station", stationId);
        }

        const query = params.toString();

        return query ? `/register?${query}` : "/register";
    })();

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

                            <Link to={forgotPasswordPath}>Forgot password?</Link>
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
                    <span>Don't have an account?</span> <Link to={registerPath}>Create an account</Link>
                </div>
            </div>
        </main>
    );
}

export default Login;