import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home/Home";
import Trains from "./pages/Trains/Trains";
import Saved from "./pages/Saved/Saved";
import Profile from "./pages/Profile/Profile";



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/trains" element={<Trains />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;