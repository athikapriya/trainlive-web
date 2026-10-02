import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronRight, FiMail, FiShield } from "react-icons/fi";

import styles from "./Privacy.module.css";

/* =========================================================
   Privacy Policy Page
========================================================= */

function Privacy() {
    const navigate = useNavigate();

    const handleContact = () => {
        navigate("/contact");
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

                    <div className={styles.headerTitle}>Privacy Policy</div>

                    <div className={styles.headerSpacer} />
                </header>

                {/* =====================================================
                    Hero
                ===================================================== */}
                <section className={styles.hero}>
                    <div className={styles.heroGlow} />

                    <div className={styles.heroIcon}>
                        <FiShield />
                    </div>

                    <div className={styles.heroContent}>
                        <span className={styles.heroEyebrow}>TRAINLIVE PRIVACY</span>

                        <h1>
                            Your privacy,
                            <span> clearly explained.</span>
                        </h1>

                        <p>
                            A plain-language explanation of what TrainLive collects, why we use it, and the choices you
                            have.
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
                        TrainLive is a community-powered live train tracker. This policy explains what information we
                        collect, why we collect it, who can see it, and the choices you have.
                    </p>

                    <p>
                        We have tried to keep this policy plain and short. If anything is unclear, you can contact us
                        through the app or by email.
                    </p>
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
                        If you have a question about this policy, write to us at{" "}
                        <a href="mailto:trainlive.team@gmail.com">trainlive.team@gmail.com</a> or use{" "}
                        <strong>You → Contact us</strong> in the app.
                    </p>
                </section>

                {/* =====================================================
                    2. Information We Collect
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="02" />

                    <h2>Information we collect</h2>

                    <PolicyItem title="Account information">
                        When you register, we collect your name and your email address or phone number. We also store
                        your password in a protected form, so we cannot read it.
                    </PolicyItem>

                    <PolicyItem title="Reports you submit">
                        This includes the train, the station, the time, whether the train arrived or was delayed, how
                        late it was, and any note you add.
                    </PolicyItem>

                    <PolicyItem title="Your votes">
                        We record when you mark another rider's report as সঠিক (right) or ভুল (wrong), so each person
                        can vote only once on a report.
                    </PolicyItem>

                    <PolicyItem title="Location, only when you share live">
                        If you choose <strong>Share live</strong> and confirm you are on a train, we read your device
                        location. We do this only while sharing is switched on, and only when you are within about 500
                        metres of that train's route. We do not collect your location in the background or at any other
                        time.
                    </PolicyItem>

                    <PolicyItem title="Messages you send us">
                        If you use Contact us or leave a review, we keep your subject, message, email address and rating
                        so we can reply and improve the app.
                    </PolicyItem>

                    <PolicyItem title="Basic technical information">
                        We may collect your device type, app version and crash information so we can fix bugs.
                    </PolicyItem>

                    <div className={styles.notice}>
                        <strong>What we do not collect</strong>
                        <span>We do not collect your contacts, photos or microphone data.</span>
                    </div>
                </section>

                {/* =====================================================
                    3. How We Use Information
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="03" />

                    <h2>How we use your information</h2>

                    <ul>
                        <li>To show train positions and station reports on the map.</li>

                        <li>To show how many riders agree with each report.</li>

                        <li>To calculate each train's 7-day and 14-day punctuality.</li>

                        <li>To run your account, including sign-in and password reset.</li>

                        <li>To reply to your messages and fix problems.</li>

                        <li>To detect and block spam, fake reports and misuse.</li>
                    </ul>

                    <p className={styles.emphasis}>
                        We do not sell your personal information, and we do not use it for advertising.
                    </p>
                </section>

                {/* =====================================================
                    4. What Other Riders Can See
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="04" />

                    <h2>What other riders can see</h2>

                    <p>
                        Other riders can see the reports you submit, with the name or handle attached to them. They can
                        also see the vote counts on each report.
                    </p>

                    <div className={styles.privacyHighlight}>
                        <div className={styles.highlightIcon}>
                            <FiShield />
                        </div>

                        <div>
                            <strong>Your exact position is never shown.</strong>

                            <p>
                                When several riders share live on the same train, their signals are combined into a
                                single marker on the route. Your email address, phone number and password are never
                                shown to other riders.
                            </p>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    5. How Long We Keep Information
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="05" />

                    <h2>How long we keep information</h2>

                    <ul>
                        <li>
                            Reports appear on the map and station pages for 24 hours. We keep them longer in summarised
                            form to build each train's punctuality charts.
                        </li>

                        <li>
                            Live location data is used to place the train marker and is not kept as a personal location
                            history.
                        </li>

                        <li>Account details stay until you delete your account.</li>

                        <li>
                            Messages to our support team are kept only as long as needed to handle the request and
                            maintain our support records.
                        </li>
                    </ul>

                    <p className={styles.smallNote}>
                        Retention periods may change as TrainLive develops. We will update this policy if our data
                        practices materially change.
                    </p>
                </section>

                {/* =====================================================
                    6. Who We Share Information With
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="06" />

                    <h2>Who we share information with</h2>

                    <p>
                        We share information only with the service providers that help us run TrainLive, such as
                        hosting, map, and email or SMS providers, and only as needed for them to do that job.
                    </p>

                    <p>We may also disclose information if the law requires us to do so.</p>

                    <div className={styles.notice}>
                        <strong>About our service providers</strong>
                        <span>
                            We will identify the relevant providers here as our production infrastructure is finalized.
                        </span>
                    </div>
                </section>

                {/* =====================================================
                    7. Your Choices and Rights
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="07" />

                    <h2>Your choices and rights</h2>

                    <ul>
                        <li>
                            <strong>Turn off sharing.</strong> You can turn off Share live at any time. Location
                            collection stops when sharing is switched off.
                        </li>

                        <li>
                            <strong>Deny location permission.</strong> You can deny location permission in your phone
                            settings. You can still browse the map and add reports.
                        </li>

                        <li>
                            <strong>Change your password.</strong> You can change your password from You → Change
                            password.
                        </li>

                        <li>
                            <strong>Request your data.</strong> You can ask for a copy of your data, correction of
                            inaccurate information, or deletion of your account by contacting us.
                        </li>
                    </ul>

                    <p>
                        When we delete your account, we remove your account details and the reports and votes linked to
                        it, except where we must keep something to meet a legal duty.
                    </p>
                </section>

                {/* =====================================================
                    8. Security
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="08" />

                    <h2>Security</h2>

                    <p>
                        We use reasonable technical measures to protect your information, including encrypted
                        connections and protected password storage.
                    </p>

                    <p>
                        No online service is completely secure, so we cannot promise absolute security. Please keep your
                        password private.
                    </p>
                </section>

                {/* =====================================================
                    9. Children
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="09" />

                    <h2>Children</h2>

                    <p>TrainLive is not designed for children under 13 years of age.</p>

                    <p>
                        If you believe a child has given us personal information, please contact us and we will review
                        the information and take appropriate action.
                    </p>
                </section>

                {/* =====================================================
                    10. Changes
                ===================================================== */}
                <section className={styles.policySection}>
                    <SectionNumber number="10" />

                    <h2>Changes to this policy</h2>

                    <p>
                        If we make a significant change, we will tell you in the app before it takes effect. The dates
                        at the top of this page show when this policy was published and last updated.
                    </p>
                </section>

                {/* =====================================================
                    11. Contact
                ===================================================== */}
                <section className={styles.contactCard}>
                    <div className={styles.contactIcon}>
                        <FiMail />
                    </div>

                    <div className={styles.contactContent}>
                        <span className={styles.contactEyebrow}>PRIVACY QUESTIONS?</span>

                        <h2>We're here to help.</h2>

                        <p>If you have a question about your privacy or your TrainLive account, contact us.</p>

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

                    <span>Real-time train information, powered by the community.</span>
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

export default Privacy;