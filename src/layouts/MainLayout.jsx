import { Outlet } from "react-router-dom";

import BottomNav from "../components/navigation/BottomNav";

function MainLayout() {
    const handleReport = () => {
        console.log("Open report sheet");
    };

    return (
        <div className="app">
            <Outlet />

            <BottomNav onReport={handleReport} />
        </div>
    );
}

export default MainLayout;