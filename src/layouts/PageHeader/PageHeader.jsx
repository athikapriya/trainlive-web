import styles from "./PageHeader.module.css";

function PageHeader({ title, subtitle, children, className = "" }) {
    return (
        <header className={`${styles.header} ${className}`}>
            <div className={styles.inner}>
                <div className={styles.title}>{title}</div>

                {subtitle && (
                    <div className={styles.subtitle}>
                        {subtitle}
                    </div>
                )}

                {children && (
                    <div className={styles.bottom}>
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
}

export default PageHeader;