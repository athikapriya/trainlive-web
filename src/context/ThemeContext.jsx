import { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "trainlive-theme";

export const ThemeContext = createContext(null);

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialThemePreference() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
        return savedTheme;
    }

    return "system";
}

export function ThemeProvider({ children }) {
    const [themePreference, setThemePreference] = useState(getInitialThemePreference);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (event) => {
            setSystemTheme(event.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    const theme = themePreference === "system" ? systemTheme : themePreference;

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, themePreference);
    }, [theme, themePreference]);

    const setTheme = (newTheme) => {
        if (newTheme !== "system" && newTheme !== "light" && newTheme !== "dark") {
            return;
        }

        setThemePreference(newTheme);
    };

    const toggleTheme = () => {
        setThemePreference((currentPreference) => {
            if (currentPreference === "dark") {
                return "light";
            }

            return "dark";
        });
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themePreference,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export default function useTheme() {
    return useContext(ThemeContext);
}