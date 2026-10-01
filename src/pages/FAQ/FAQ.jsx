import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronDown, FiMessageCircle, FiSearch } from "react-icons/fi";

import faqData from "./faqData";

import styles from "./FAQ.module.css";

/* =========================================================
   FAQ Page
========================================================= */

function FAQ() {
    const navigate = useNavigate();

    const [openId, setOpenId] = useState(null);

    const handleToggle = (id) => {
        setOpenId((currentId) => (currentId === id ? null : id));
    };

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
                        <FiArrowLeft />
                    </button>

                    <div className={styles.headerTitle}>Help Center</div>

                    <div className={styles.headerSpacer} />
                </header>

                {/* =====================================================
                    Hero
                ===================================================== */}
                <section className={styles.hero}>
                    <div className={styles.heroGlow} />

                    <div className={styles.heroIcon}>
                        <FiMessageCircle />
                    </div>

                    <div className={styles.heroContent}>
                        <span className={styles.heroEyebrow}>TRAINLIVE HELP</span>

                        <h1>
                            How can we
                            <span> help?</span>
                        </h1>

                        <p>Find quick answers about TrainLive, community reports, and live train information.</p>
                    </div>
                </section>

                {/* =====================================================
                    FAQ Heading
                ===================================================== */}
                <section className={styles.faqSection}>
                    <div className={styles.sectionHeading}>
                        <div>
                            <span className={styles.sectionEyebrow}>NEED TO KNOW</span>

                            <h2>Frequently asked questions</h2>
                        </div>

                        <span className={styles.questionCount}>{faqData.length}</span>
                    </div>

                    {/* =================================================
                        FAQ List
                    ================================================= */}
                    <div className={styles.faqList}>
                        {faqData.map((faq, index) => {
                            const isOpen = openId === faq.id;

                            return (
                                <article
                                    key={faq.id}
                                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.questionButton}
                                        onClick={() => handleToggle(faq.id)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${faq.id}`}
                                    >
                                        <span className={styles.questionNumber}>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <span className={styles.questionText}>{faq.question}</span>

                                        <span className={styles.chevronWrapper}>
                                            <FiChevronDown
                                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                                            />
                                        </span>
                                    </button>

                                    <div
                                        id={`faq-answer-${faq.id}`}
                                        className={`${styles.answerWrapper} ${isOpen ? styles.answerWrapperOpen : ""}`}
                                    >
                                        <div className={styles.answerInner}>
                                            <div className={styles.answerAccent} />

                                            <p className={styles.answer}>{faq.answer}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* =====================================================
                    Contact Card
                ===================================================== */}
                <section className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <FiSearch />
                    </div>

                    <div className={styles.contactContent}>
                        <span className={styles.contactEyebrow}>STILL NEED HELP?</span>

                        <h2>We’re here to help.</h2>

                        <p>Can't find what you're looking for? Send us a message and we'll take a look.</p>

                        <a href="mailto:trainlive.team@gmail.com" className={styles.email}>
                            trainlive.team@gmail.com
                        </a>
                    </div>

                    <button type="button" className={styles.contactButton} onClick={() => navigate("/contact")}>
                        Contact us
                    </button>
                </section>

                {/* =====================================================
                    Footer Note
                ===================================================== */}
                <footer className={styles.footer}>
                    <strong>TrainLive</strong>

                    <span>Community-powered train information</span>
                </footer>
            </div>
        </div>
    );
}

export default FAQ;