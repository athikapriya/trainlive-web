import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

const THEME_KEY = "trainlive-theme";

function getInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

document.documentElement.setAttribute("data-theme", getInitialTheme());

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);