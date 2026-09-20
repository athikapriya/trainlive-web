import { useEffect, useState } from "react";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("trainlive-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return getSystemTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trainlive-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return {
    theme,
    toggleTheme,
  };
}