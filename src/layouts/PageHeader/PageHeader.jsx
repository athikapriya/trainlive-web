import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import styles from "./PageHeader.module.css";

function PageHeader({ title, subtitle, children, className = "", showBack = false, onBack }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }

        navigate(-1);
    };

    return (
        <header className={`${styles.header} ${className}`}>
            <div className={styles.inner}>
                <div className={styles.titleRow}>
                    {showBack && (
                        <button type="button" className={styles.backButton} onClick={handleBack} aria-label="Go back">
                            <FiArrowLeft size={19} />
                        </button>
                    )}

                    <div className={styles.title}>{title}</div>
                </div>

                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

                {children && <div className={styles.bottom}>{children}</div>}
            </div>
        </header>
    );
}

export default PageHeader;