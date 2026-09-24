import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home/Home";
import Trains from "./pages/Trains/Trains";
import Saved from "./pages/Saved/Saved";
import Profile from "./pages/Profile/Profile";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from './pages/Auth/ForgetPassword';
import ResetPassword from "./pages/Auth/ResetPassword";
import ChangePassword from './pages/Auth/ChangePassword'


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main application */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/trains" element={<Trains />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
            </Routes>
        </BrowserRouter>
    );
}


export default App;