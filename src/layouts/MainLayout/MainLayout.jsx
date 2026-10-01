import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import BottomNav from "../../components/navigation/BottomNav";
import ReportSubmitSheet from "../../components/reportSubmit/ReportSubmitSheet";

import Style from "./MainLayout.module.css";

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const { isAuthenticated, isLoading } = useAuth();

    const [isReportSubmitOpen, setIsReportSubmitOpen] = useState(false);

    // Pages that should not show the fixed bottom navigation.
   c

    const handleReport = () => {
        if (!isAuthenticated) {
            navigate("/login?report=true");
            return;
        }

        setIsReportSubmitOpen(true);
    };

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            return;
        }

        if (location.pathname !== "/") {
            return;
        }

        const searchParams = new URLSearchParams(location.search);
        const reportIntent = searchParams.get("report");

        if (reportIntent !== "true") {
            return;
        }

        setIsReportSubmitOpen(true);

        searchParams.delete("report");

        const newSearch = searchParams.toString();

        navigate(
            {
                pathname: "/",
                search: newSearch ? `?${newSearch}` : "",
            },
            {
                replace: true,
            }
        );
    }, [isAuthenticated, isLoading, location.pathname, location.search, navigate]);

    const handleReportSubmitted = ({ report, train, station }) => {
        setIsReportSubmitOpen(false);

        navigate("/", {
            replace: true,
            state: {
                submittedReport: {
                    report,
                    train,
                    station,
                },
            },
        });
    };

    return (
        <div className="app">
            <main className={Style.appContent}>
                <Outlet />
            </main>

            <ReportSubmitSheet
                isOpen={isReportSubmitOpen}
                onClose={() => setIsReportSubmitOpen(false)}
                onSubmitted={handleReportSubmitted}
            />

            {!hideBottomNav && <BottomNav onReport={handleReport} />}
        </div>
    );
}

export default MainLayout;