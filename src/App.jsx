import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";

import Home from "./pages/Home/Home";
import Trains from "./pages/Trains/Trains";
import Profile from "./pages/Profile/Profile";
import Reports from "./pages/Reports/Reports";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from './pages/Auth/ForgetPassword';
import ResetPassword from "./pages/Auth/ResetPassword";
import ChangePassword from './pages/Auth/ChangePassword'
import TrainDetails from "./pages/TrainDetails/TrainDetails";
import ReportDetails from "./pages/ReportDetails/ReportDetails";
import Saved from "./pages/Saved/Saved";
import ContactUs from "./pages/ContactUs/ContactUs";
import Reviews from "./pages/Reviews/Reviews";
import FAQ from "./pages/FAQ/FAQ";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import About from "./pages/About/About";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main application */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/trains" element={<Trains />} />
                    <Route path="/trains/:trainNumber" element={<TrainDetails />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/reports/:reportId" element={<ReportDetails />}
                    />
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