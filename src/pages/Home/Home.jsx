import MapView from '../../components/map/MapView'
import MapSearch from "../../components/map/MapSearch";
import BottomNav from "../../components/navigation/BottomNav";

import "../../styles/Home.css";
import "../../styles/map/MapControls.css";
import "../../styles/map/MapSearch.css";

function Home() {

    const handleReport = () => {
        console.log("Open report sheet");
    };
    
    return (
        <main className="home">
            <MapView />
            <MapSearch />

            <BottomNav onReport={handleReport} />
        </main>
    );
}

export default Home;