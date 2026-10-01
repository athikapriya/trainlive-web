import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiCheck,
    FiChevronRight,
    FiHelpCircle,
    FiInfo,
    FiLock,
    FiLogIn,
    FiLogOut,
    FiMail,
    FiMoon,
    FiShield,
    FiStar,
    FiSun,
    FiUser,
    FiX,
} from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import useTheme from "../../Hooks/useTheme";

import styles from "./Profile.module.css";

function Profile() {
    const navigate = useNavigate();

    const { user, isAuthenticated, logout } = useAuth();

    const { theme, themePreference, setTheme } = useTheme();

    const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = async () => {
        await logout();

        navigate("/", {
            replace: true,
        });
    };

    const handleLogin = () => {
        navigate("/login", {
            state: {
                from: "/profile",
            },
        });
    };

    const handleRegister = () => {
        navigate("/register", {
            state: {
                from: "/profile",
            },
        });
    };

    const handleContactClick = () => {
        navigate("/contact");
    };

    const handleReviewsClick = () => {
        navigate("/reviews");
    };

    const handleFAQClick = () => {
        navigate("/faq");
    };

    const handlePrivacyClick = () => {
        navigate("/privacy");
    };

    const handleTermsClick = () => {
        navigate("/terms");
    };

    const handleAboutClick = () => {
        navigate("/about");
    };

    const getInitials = (name) => {
        if (!name) {
            return "?";
        }

        const words = name.trim().split(/\s+/);

        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    };

    const getAppearanceLabel = () => {
        if (themePreference === "system") {
            return "System";
        }

        if (themePreference === "dark") {
            return "Dark";
        }

        return "Light";
    };

    const initials = getInitials(user?.full_name);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* =========================
                    Header
                ========================= */}

                <header className={styles.header}>
                    <button type="button" className={styles.backButton} onClick={handleBack} aria-label="Go back">
                        <FiArrowLeft />
                    </button>

                    <div className={styles.headerText}>
                        <h1>Profile</h1>

                        <p>Manage your TrainLive account</p>
                    </div>
                </header>

                {isAuthenticated && user ? (
                    <>
                        {/* =========================
                            User profile
                        ========================= */}

                        <section className={styles.profileCard}>
                            <div className={styles.avatar}>{initials}</div>

                            <div className={styles.userInfo}>
                                <h2>{user.full_name}</h2>

                                <p>{user.email}</p>
                            </div>
                        </section>

                        {/* =========================
                            Account
                        ========================= */}

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Account</h3>

                            <div className={styles.list}>
                                <button
                                    type="button"
                                    className={styles.row}
                                    onClick={() => navigate("/change-password")}
                                >
                                    <span className={styles.icon}>
                                        <FiLock />
                                    </span>

                                    <span className={styles.rowContent}>
                                        <span className={styles.rowTitle}>Change password</span>

                                        <span className={styles.rowSubtitle}>Update your account password</span>
                                    </span>

                                    <FiChevronRight className={styles.chevron} />
                                </button>
                            </div>
                        </section>

                        {/* =========================
                            Support
                        ========================= */}

                        <SupportSection onContactClick={handleContactClick} onReviewsClick={handleReviewsClick} />

                        {/* =========================
                            Settings
                        ========================= */}

                        <SettingsSection
                            appearanceLabel={getAppearanceLabel()}
                            onAppearanceClick={() => setIsAppearanceOpen(true)}
                            onFAQClick={handleFAQClick}
                            onPrivacyClick={handlePrivacyClick}
                            onTermsClick={handleTermsClick}
                            onAboutClick={handleAboutClick}
                        />

                        {/* =========================
                            Sign out
                        ========================= */}

                        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                            <FiLogOut />

                            <span>Sign out</span>
                        </button>
                    </>
                ) : (
                    <>
                        {/* =========================
                            Guest
                        ========================= */}

                        <section className={styles.guestCard}>
                            <div className={styles.guestIcon}>
                                <FiUser />
                            </div>

                            <h2>Welcome to TrainLive</h2>

                            <p>
                                Sign in to manage your account, share train updates, and access your TrainLive features.
                            </p>

                            <div className={styles.authButtons}>
                                <button type="button" className={styles.primaryButton} onClick={handleLogin}>
                                    <FiLogIn />
                                    Sign in
                                </button>

                                <button type="button" className={styles.secondaryButton} onClick={handleRegister}>
                                    Create an account
                                </button>
                            </div>
                        </section>

                        {/* =========================
                            Guest support
                        ========================= */}

                        <SupportSection onContactClick={handleContactClick} onReviewsClick={handleReviewsClick} />

                        {/* =========================
                            Settings
                        ========================= */}

                        <SettingsSection
                            appearanceLabel={getAppearanceLabel()}
                            onAppearanceClick={() => setIsAppearanceOpen(true)}
                            onFAQClick={handleFAQClick}
                            onPrivacyClick={handlePrivacyClick}
                            onTermsClick={handleTermsClick}
                            onAboutClick={handleAboutClick}
                        />
                    </>
                )}
            </div>

            {/* =========================
                Appearance sheet
            ========================= */}

            <AppearanceSheet
                isOpen={isAppearanceOpen}
                themePreference={themePreference}
                currentTheme={theme}
                onSelect={setTheme}
                onClose={() => setIsAppearanceOpen(false)}
            />
        </div>
    );
}

/* =========================================================
   Support Section
========================================================= */

function SupportSection({ onContactClick, onReviewsClick }) {
    return (
        <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Support</h3>

            <div className={styles.list}>
                {/* Contact Us */}

                <button type="button" className={styles.row} onClick={onContactClick}>
                    <span className={styles.icon}>
                        <FiMail />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>Contact us</span>

                        <span className={styles.rowSubtitle}>Get help or send us feedback</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>

                {/* Rate & Review */}

                <button type="button" className={styles.row} onClick={onReviewsClick}>
                    <span className={styles.icon}>
                        <FiStar />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>Rate & review TrainLive</span>

                        <span className={styles.rowSubtitle}>Tell us what you think</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>
            </div>
        </section>
    );
}

/* =========================================================
   Settings Section
========================================================= */

function SettingsSection({
    appearanceLabel,
    onAppearanceClick,
    onFAQClick,
    onPrivacyClick,
    onTermsClick,
    onAboutClick,
}) {
    return (
        <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Settings</h3>

            <div className={styles.list}>
                {/* Appearance */}

                <button type="button" className={styles.row} onClick={onAppearanceClick}>
                    <span className={styles.icon}>
                        <FiSun />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>Appearance</span>

                        <span className={styles.rowSubtitle}>Choose how TrainLive looks</span>
                    </span>

                    <span className={styles.value}>{appearanceLabel}</span>

                    <FiChevronRight className={styles.chevron} />
                </button>

                {/* FAQ */}

                <button type="button" className={styles.row} onClick={onFAQClick}>
                    <span className={styles.icon}>
                        <FiHelpCircle />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>FAQ</span>

                        <span className={styles.rowSubtitle}>Frequently asked questions</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>

                {/* Privacy Policy */}

                <button type="button" className={styles.row} onClick={onPrivacyClick}>
                    <span className={styles.icon}>
                        <FiShield />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>Privacy Policy</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>

                {/* Terms */}

                <button type="button" className={styles.row} onClick={onTermsClick}>
                    <span className={styles.icon}>
                        <FiLock />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>Terms of Service</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>

                {/* About */}

                <button type="button" className={styles.row} onClick={onAboutClick}>
                    <span className={styles.icon}>
                        <FiInfo />
                    </span>

                    <span className={styles.rowContent}>
                        <span className={styles.rowTitle}>About TrainLive</span>

                        <span className={styles.rowSubtitle}>Learn more about TrainLive</span>
                    </span>

                    <FiChevronRight className={styles.chevron} />
                </button>
            </div>
        </section>
    );
}

/* =========================================================
   Appearance Sheet
========================================================= */

function AppearanceSheet({ isOpen, themePreference, currentTheme, onSelect, onClose }) {
    if (!isOpen) {
        return null;
    }

    const handleSelect = (value) => {
        onSelect(value);
        onClose();
    };

    return (
        <div className={styles.sheetOverlay} onClick={onClose}>
            <div className={styles.appearanceSheet} onClick={(event) => event.stopPropagation()}>
                <div className={styles.sheetHandle} />

                <div className={styles.sheetHeader}>
                    <div>
                        <h2>Appearance</h2>

                        <p>Choose how TrainLive looks</p>
                    </div>

                    <button
                        type="button"
                        className={styles.sheetClose}
                        onClick={onClose}
                        aria-label="Close appearance settings"
                    >
                        <FiX />
                    </button>
                </div>

                <div className={styles.themeOptions}>
                    <ThemeOption
                        selected={themePreference === "system"}
                        icon={<FiSun />}
                        title="System"
                        description="Follow your device settings"
                        onClick={() => handleSelect("system")}
                    />

                    <ThemeOption
                        selected={themePreference === "light"}
                        icon={<FiSun />}
                        title="Light"
                        description="Always use light mode"
                        onClick={() => handleSelect("light")}
                    />

                    <ThemeOption
                        selected={themePreference === "dark"}
                        icon={<FiMoon />}
                        title="Dark"
                        description="Always use dark mode"
                        onClick={() => handleSelect("dark")}
                    />
                </div>

                <div className={styles.currentTheme}>
                    Currently using <strong>{currentTheme === "dark" ? "dark" : "light"} mode</strong>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   Theme Option
========================================================= */

function ThemeOption({ selected, icon, title, description, onClick }) {
    return (
        <button
            type="button"
            className={`${styles.themeOption} ${selected ? styles.themeOptionSelected : ""}`}
            onClick={onClick}
        >
            <span className={styles.themeOptionIcon}>{icon}</span>

            <span className={styles.themeOptionContent}>
                <span className={styles.themeOptionTitle}>{title}</span>

                <span className={styles.themeOptionDescription}>{description}</span>
            </span>

            <span className={`${styles.radio} ${selected ? styles.radioSelected : ""}`}>{selected && <FiCheck />}</span>
        </button>
    );
}

export default Profile;