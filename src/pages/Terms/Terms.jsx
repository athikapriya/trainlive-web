import { useNavigate } from "react-router-dom";

import { FiArrowLeft, FiChevronRight, FiFileText, FiMail, FiShield } from "react-icons/fi";

import styles from "./Terms.module.css";

/* =========================================================
   Terms of Service Page
========================================================= */

function Terms() {
    const navigate = useNavigate();

    const handleContact = () => {
        navigate("/contact");
    };

    const handlePrivacy = () => {
        navigate("/privacy");
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

                    <div className={styles.headerTitle}>Terms of Service</div>

                    <div className={styles.headerSpacer} />
                </header>

                {/* =====================================================
                    Hero
                ===================================================== */}
                <section className={styles.hero}>
                    <div className={styles.heroGlow} />

                    <div className={styles.heroIcon}>
                        <FiFileText />
                    </div>

                    <div className={styles.heroContent}>
                        <span className={styles.heroEyebrow}>TRAINLIVE TERMS</span>

                        <h1>
                            Simple rules,
                            <span> clearly explained.</span>
                        </h1>

                        <p>
                            The terms that apply when you create an account or use TrainLive and its community-powered
                            train information.
                        </p>
                    </div>
                </section>

                {/* =====================================================
                    Policy Meta
                ===================================================== */}
                <section className={styles.policyMeta}>
                    <div className={styles.metaItem}>
                        <span>Effective date</span>
                        <strong>October 1, 2026</strong>
                    </div>

                    <div className={styles.metaDivider} />

                    <div className={styles.metaItem}>
                        <span>Last updated</span>
                        <strong>October 1, 2026</strong>
                    </div>
                </section>

                {/* =====================================================
                    Introduction
                ===================================================== */}
                <section className={styles.introCard}>
                    <p>
                        These terms are the agreement between you and TrainLive. By creating an account or using the
                        app, you agree to them.
                    </p>

                    <p>If you do not agree with these terms, please do not use TrainLive.</p>
                </section>

                {/* =====================================================
                    1. Who We Are
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="01" />

                    <h2>Who we are</h2>

                    <p>
                        TrainLive is operated by <strong>Athika Chowdhury Priya</strong>, under the name{" "}
                        <strong>TrainLive</strong>, based in Bajitpur, Kishoreganj, Bangladesh.
                    </p>

                    <p>
                        You can reach us at <a href="mailto:trainlive.team@gmail.com">trainlive.team@gmail.com</a> or
                        through <strong>You → Contact us</strong> in the app.
                    </p>
                </section>

                {/* =====================================================
                    2. What TrainLive Does
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="02" />

                    <h2>What TrainLive does</h2>

                    <p>
                        TrainLive is a community-powered live train tracker. Riders report what they see at stations and
                        can share their position while on a train.
                    </p>

                    <p>
                        We combine this information into a live map, station and train reports, and punctuality charts.
                    </p>
                </section>

                {/* =====================================================
                    3. Not Official Railway Information
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="03" />

                    <h2>This is not official railway information</h2>

                    <div className={styles.notice}>
                        <strong>Important</strong>

                        <span>TrainLive is community-powered and is not an official railway information service.</span>
                    </div>

                    <p>
                        Everything on TrainLive comes from riders. It does not come from Bangladesh Railway, and
                        TrainLive is not affiliated with or endorsed by Bangladesh Railway.
                    </p>

                    <p>Train positions, times and delays may be late, incomplete or wrong.</p>

                    <p>
                        Do not rely on TrainLive alone for a decision you cannot reverse, such as a non-refundable
                        ticket or a tight connection. Check with the railway as well.
                    </p>
                </section>

                {/* =====================================================
                    4. Your Account
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="04" />

                    <h2>Your account</h2>

                    <ul>
                        <li>You must give accurate details when you register.</li>

                        <li>
                            You are responsible for keeping your password private and for everything done through your
                            account.
                        </li>

                        <li>Keep one account per person.</li>

                        <li>
                            You must be at least <strong>13 years old</strong> to use TrainLive.
                        </li>

                        <li>Tell us right away if you think someone else has accessed your account.</li>
                    </ul>
                </section>

                {/* =====================================================
                    5. Reporting and Voting Rules
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="05" />

                    <h2>Reporting and voting rules</h2>

                    <p>When you submit a report or vote on one, you agree to the following rules.</p>

                    <div className={styles.ruleList}>
                        <PolicyItem title="Report only what you saw">
                            Submit a report only for a train and station you actually observed or were on.
                        </PolicyItem>

                        <PolicyItem title="Be accurate">
                            Do not guess, exaggerate, or copy someone else's report.
                        </PolicyItem>

                        <PolicyItem title="Vote honestly">
                            Mark a report সঠিক (right) or ভুল (wrong) only if you have a good reason to. Do not vote to
                            push a false report up or a true one down.
                        </PolicyItem>

                        <PolicyItem title="Keep notes civil">
                            Notes on reports must not be abusive, threatening, hateful or unlawful, and must not include
                            other people's personal information.
                        </PolicyItem>
                    </div>
                </section>

                {/* =====================================================
                    6. Live Location Sharing
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="06" />

                    <h2>Live location sharing</h2>

                    <p>Share live is optional. You may use it only when you are actually on the train you select.</p>

                    <p>
                        It works only while you are within about 500 metres of that train's route, and you can stop
                        sharing at any time.
                    </p>

                    <p>Do not use Share live to mislead other riders or to spoof a position.</p>

                    <div className={styles.linkCard}>
                        <div className={styles.linkIcon}>
                            <FiShield />
                        </div>

                        <div className={styles.linkContent}>
                            <strong>How we handle your location</strong>

                            <span>
                                Read the TrainLive Privacy Policy for details about location collection and use.
                            </span>
                        </div>

                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={handlePrivacy}
                            aria-label="Open Privacy Policy"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </section>

                {/* =====================================================
                    7. What You Must Not Do
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="07" />

                    <h2>What you must not do</h2>

                    <ul>
                        <li>Submit false, misleading or spam reports.</li>

                        <li>Use fake locations, bots, scripts or automated tools to post, vote or scrape data.</li>

                        <li>Run more than one account to influence votes.</li>

                        <li>Pretend to be railway staff or another person.</li>

                        <li>Harass or abuse other riders.</li>

                        <li>Try to break, probe or overload TrainLive or its systems.</li>

                        <li>Copy, resell or republish TrainLive data in bulk without our written permission.</li>

                        <li>Use TrainLive for anything unlawful.</li>
                    </ul>
                </section>

                {/* =====================================================
                    8. Your Content
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="08" />

                    <h2>Your content</h2>

                    <p>You keep ownership of the reports, notes and reviews you submit.</p>

                    <p>
                        By submitting them, you give TrainLive a free, worldwide, non-exclusive right to store, display,
                        combine and use them to run and improve the service.
                    </p>

                    <p>For example, your reports can feed the live map and the 7-day and 14-day punctuality charts.</p>

                    <p>
                        This permission continues for reports already used in summaries after you delete your account.
                        We will not use your content to advertise to others.
                    </p>
                </section>

                {/* =====================================================
                    9. Our Rights Over Content and Accounts
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="09" />

                    <h2>Our rights over content and accounts</h2>

                    <p>
                        We may remove reports, notes or reviews that break these terms or that we reasonably believe are
                        false or harmful.
                    </p>

                    <p>
                        We may warn, limit or suspend an account that breaks these terms. Where we can, we will tell you
                        why.
                    </p>

                    <p>You can stop using TrainLive and delete your account at any time by contacting us.</p>
                </section>

                {/* =====================================================
                    10. Availability and Changes
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="10" />

                    <h2>Availability and changes to the service</h2>

                    <p>
                        We work to keep TrainLive running, but we cannot promise it will always be available or
                        error-free.
                    </p>

                    <p>
                        We may change, pause or remove features at any time, for example during maintenance or as the
                        app develops.
                    </p>
                </section>

                {/* =====================================================
                    11. Disclaimer
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="11" />

                    <h2>Disclaimer</h2>

                    <p>
                        TrainLive is provided "as is" and "as available". To the extent the law allows, we do not
                        promise that the information on it is accurate, complete or up to date, or that the service will
                        be uninterrupted.
                    </p>
                </section>

                {/* =====================================================
                    12. Limit of Liability
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="12" />

                    <h2>Limit of our liability</h2>

                    <p>
                        To the extent the law allows, TrainLive and
                        <strong> Athika Chowdhury Priya</strong> are not responsible for any loss or damage that results
                        from using or being unable to use the app.
                    </p>

                    <p>
                        This includes a missed train, a wrong delay estimate, or a travel decision you made based on
                        rider reports.
                    </p>

                    <p>Nothing in these terms limits liability that the law does not allow us to limit.</p>
                </section>

                {/* =====================================================
                    13. Changes to These Terms
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="13" />

                    <h2>Changes to these terms</h2>

                    <p>If we make a significant change, we will tell you in the app before it takes effect.</p>

                    <p>
                        If you keep using TrainLive after the change takes effect, you accept the new terms. The date at
                        the top shows when they were last updated.
                    </p>
                </section>

                {/* =====================================================
                    14. Governing Law
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="14" />

                    <h2>Governing law</h2>

                    <p>These terms are governed by the laws of Bangladesh.</p>

                    <p className={styles.smallNote}>
                        The specific court or forum for disputes should be confirmed with a qualified lawyer before
                        publishing a final legal version of these terms.
                    </p>
                </section>

                {/* =====================================================
                    15. Contact
                ===================================================== */}
                <section className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <FiMail />
                    </div>

                    <div className={styles.contactContent}>
                        <span className={styles.contactEyebrow}>QUESTIONS ABOUT THESE TERMS?</span>

                        <h2>We're here to help.</h2>

                        <p>If you have a question about these terms or your TrainLive account, contact us.</p>

                        <a href="mailto:trainlive.team@gmail.com" className={styles.email}>
                            trainlive.team@gmail.com
                        </a>
                    </div>

                    <button type="button" className={styles.contactButton} onClick={handleContact}>
                        Contact us
                        <FiChevronRight />
                    </button>
                </section>

                {/* =====================================================
                    Footer
                ===================================================== */}
                <footer className={styles.footer}>
                    <strong>TrainLive</strong>

                    <span>Community-powered train information</span>
                </footer>
            </div>
        </div>
    );
}

/* =========================================================
   Reusable Section Number
========================================================= */

function SectionNumber({ number }) {
    return <span className={styles.sectionNumber}>{number}</span>;
}

/* =========================================================
   Reusable Policy Item
========================================================= */

function PolicyItem({ title, children }) {
    return (
        <div className={styles.policyItem}>
            <h3>{title}</h3>

            <p>{children}</p>
        </div>
    );
}

export default Terms;