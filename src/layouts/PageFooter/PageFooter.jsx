import { useNavigate } from "react-router-dom";

import styles from "./PageFooter.module.css";

function PageFooter({ className = "" }) {
    const navigate = useNavigate();

    return (
        <footer className={`${styles.footer} ${className}`}>
            <div className={styles.brand}>
                <strong>TrainLive</strong>

                <span>Real-time train information, powered by the community.</span>
            </div>

            <nav className={styles.links} aria-label="Footer navigation">
                <button type="button" onClick={() => navigate("/about")}>
                    About
                </button>

                <button type="button" onClick={() => navigate("/contact")}>
                    Contact
                </button>

                <button type="button" onClick={() => navigate("/privacy")}>
                    Privacy
                </button>

                <button type="button" onClick={() => navigate("/terms")}>
                    Terms
                </button>
            </nav>
        </footer>
    );
}

export default PageFooter;