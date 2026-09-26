import { Outlet } from "react-router-dom";

import BottomNav from "../../components/navigation/BottomNav";
import Style from './MainLayout.module.css';

function MainLayout() {
    const handleReport = () => {
        console.log("Open report sheet");
    };

    return (
        <div className="app">
            <main className={Style.appContent}>
                <Outlet />
            </main>

            <BottomNav onReport={handleReport} />
        </div>
    );
}

export default MainLayout;