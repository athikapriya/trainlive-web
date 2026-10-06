import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

import useAuth from "../../Hooks/useAuth";
import PageHeader from "../../layouts/PageHeader/PageHeader";

import { getReport } from "../../services/reportApi";

import pageStyles from "../../styles/page.module.css";
import styles from "./ReportDetails.module.css";

function ReportDetails() {
    const { reportId } = useParams();
    const navigate = useNavigate();

    const { accessToken, isLoading: authLoading } = useAuth();

    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        let cancelled = false;

        async function loadReport() {
            try {
                setError(null);

                const report = await getReport(reportId, {
                    accessToken,
                });

                if (cancelled) {
                    return;
                }

                if (!report?.train?.number) {
                    throw new Error("This report does not have an associated train.");
                }

                const params = new URLSearchParams();
                params.set("report", report.id);

                navigate(`/trains/${encodeURIComponent(report.train.number)}?${params.toString()}`, {
                    replace: true,
                });
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load this report.");
                }
            }
        }

        loadReport();

        return () => {
            cancelled = true;
        };
    }, [reportId, accessToken, authLoading, navigate]);

    return (
        <div className={pageStyles.page}>
            <PageHeader
                title="Report details"
                subtitle={error ? "Unable to load this report" : "Community train report"}
            />

            <div className={pageStyles.content}>
                <div className={pageStyles.contentInner}>
                    {authLoading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Loading report...</span>
                        </div>
                    ) : error ? (
                        <>
                            <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                                <FiArrowLeft size={15} />

                                <span>Back</span>
                            </button>

                            <div className={styles.errorState}>
                                <div className={styles.errorIcon}>
                                    <FiFileText size={17} />
                                </div>

                                <div className={styles.errorTitle}>Report unavailable</div>

                                <div className={styles.errorMessage}>{error}</div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />

                            <span>Opening report...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportDetails;