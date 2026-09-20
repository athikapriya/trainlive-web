import MapView from "../components/map/MapView";
import MapSearch from "../components/map/MapSearch";

import "../styles/Home.css";
import "../styles/map/MapControls.css";
import "../styles/map/MapSearch.css";

function Home() {
    return (
        <main className="home">
            <MapView />
            <MapSearch />
        </main>
    );
}

export default Home;