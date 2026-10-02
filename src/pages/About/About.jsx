import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronRight, FiInfo, FiMapPin, FiSave, FiUsers } from "react-icons/fi";

import styles from "./About.module.css";


function About() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* =====================================================
                    Header
                ===================================================== */}
                <header className={styles.header}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <FiArrowLeft size={19} />
                    </button>

                    <div className={styles.headerTitle}>
                        <h1>About TrainLive</h1>
                    </div>

                    <div className={styles.headerSpacer} />
                </header>

                {/* =====================================================
                    Hero
                ===================================================== */}
                <section className={styles.hero}>
                    <div className={styles.heroIcon}>
                        <FiInfo size={22} />
                    </div>

                    <span className={styles.eyebrow}>ABOUT TRAINLIVE</span>

                    <h2>
                        Built by riders,
                        <br />
                        for riders.
                    </h2>

                    <p>
                        Trains in Bangladesh often run to their own clock, and timetables can't keep up. TrainLive turns
                        what riders already know into a live map everyone can read.
                    </p>
                </section>

                {/* =====================================================
                    Community
                ===================================================== */}
                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionNumber}>01</span>

                        <div>
                            <span className={styles.sectionEyebrow}>COMMUNITY</span>

                            <h3>Real journeys, shared together</h3>
                        </div>
                    </div>

                    <div className={styles.communityCard}>
                        <div className={styles.communityIcon}>
                            <FiUsers size={20} />
                        </div>

                        <div className={styles.communityContent}>
                            <p>Riders report what they see, other riders confirm it, and you see the result live.</p>

                            <div className={styles.flow}>
                                <div className={styles.flowItem}>
                                    <span className={styles.flowNumber}>01</span>
                                    <span>Riders report</span>
                                </div>

                                <span className={styles.flowArrow}>
                                    <FiChevronRight />
                                </span>

                                <div className={styles.flowItem}>
                                    <span className={styles.flowNumber}>02</span>
                                    <span>Others confirm</span>
                                </div>

                                <span className={styles.flowArrow}>
                                    <FiChevronRight />
                                </span>

                                <div className={styles.flowItem}>
                                    <span className={styles.flowNumber}>03</span>
                                    <span>You see it live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    For every rider
                ===================================================== */}
                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionNumber}>02</span>

                        <div>
                            <span className={styles.sectionEyebrow}>FOR EVERY RIDER</span>
                            <h3>Made to be easy to follow</h3>
                        </div>
                    </div>

                    <div className={styles.body}>
                        <p>
                            TrainLive is meant for everyone who takes a train, not only people who are comfortable with
                            apps or with English.
                        </p>

                        <p>
                            Every train and station name appears in both English and Bangla, and each report comes with
                            an automatic summary in both languages. If you can read one, you can follow the other.
                        </p>
                    </div>

                    <div className={styles.languageCard}>
                        <div className={styles.languageItem}>
                            <span className={styles.languageLabel}>ENGLISH</span>
                            <strong>Dhaka</strong>
                            <span>Train & station names</span>
                        </div>

                        <div className={styles.languageDivider} />

                        <div className={styles.languageItem}>
                            <span className={styles.languageLabel}>বাংলা</span>
                            <strong className={styles.bangla}>ঢাকা</strong>
                            <span>ট্রেন ও স্টেশনের নাম</span>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    Save your trains
                ===================================================== */}
                <section className={styles.saveCard}>
                    <div className={styles.saveIcon}>
                        <FiSave size={20} />
                    </div>

                    <div>
                        <span className={styles.saveEyebrow}>YOUR JOURNEY</span>

                        <h3>
                            Keep the trains and stations
                            <br />
                            you use close by.
                        </h3>

                        <p>Save the stations and trains you use most, and their latest reports are one tap away.</p>
                    </div>
                </section>

                {/* =====================================================
                    Independent service
                ===================================================== */}
                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionNumber}>03</span>
                        <div>
                            <span className={styles.sectionEyebrow}>INDEPENDENT</span>
                            <h3>Not an official service</h3>
                        </div>
                    </div>

                    <div className={styles.notice}>
                        <div className={styles.noticeIcon}>
                            <FiMapPin size={18} />
                        </div>
                        <div>
                            <strong>TrainLive is independent.</strong>
                            <p>TrainLive is not affiliated with Bangladesh Railway.</p>
                        </div>
                    </div>
                </section>


                {/* =====================================================
                    Version
                ===================================================== */}
                <section className={styles.versionSection}>
                    <div className={styles.versionCard}>
                        <div className={styles.versionTop}>
                            <span className={styles.versionLabel}>TRAINLIVE</span>
                            <span className={styles.versionBadge}>1.0</span>
                        </div>
                        <div className={styles.versionLine} />
                        <p>Real-time train information, powered by the community.</p>
                    </div>
                </section>


                {/* =====================================================
                    Footer
                ===================================================== */}
                <footer className={styles.footer}>
                    <strong>TrainLive</strong>
                    <span>Real-time train information, powered by the community.</span>
                </footer>


            </div>
        </div>
    );
}

export default About;