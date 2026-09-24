import { createContext, useCallback, useEffect, useState } from "react";
import { loginUser, logoutUser, getCurrentUser, refreshAccessToken } from "../services/authApi";

export const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "trainlive_access_token";
const REFRESH_TOKEN_KEY = "trainlive_refresh_token";

function getStoredAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function storeTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearStoredTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(getStoredAccessToken);
    const [refreshToken, setRefreshToken] = useState(getStoredRefreshToken);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = Boolean(user && accessToken);

    /* Clear authentication */
    const clearAuthentication = useCallback(() => {
        clearStoredTokens();
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
    }, []);

    /* Refresh authentication */
    const refreshAuthentication = useCallback(async () => {
        const storedRefreshToken = getStoredRefreshToken();

        if (!storedRefreshToken) {
            clearAuthentication();
            return null;
        }

        try {
            const data = await refreshAccessToken(storedRefreshToken);
            const newAccessToken = data.access;
            const newRefreshToken = data.refresh || storedRefreshToken;

            storeTokens(newAccessToken, newRefreshToken);
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);

            return newAccessToken;
        } catch (error) {
            clearAuthentication();
            return null;
        }
    }, [clearAuthentication]);

    /* Login */
    const login = useCallback(async (email, password) => {
        const data = await loginUser(email, password);

        storeTokens(data.access, data.refresh);
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        setUser(data.user);

        return data.user;
    }, []);

    /* Logout */
    const logout = useCallback(async () => {
        const currentAccessToken = accessToken;
        const currentRefreshToken = refreshToken;

        clearAuthentication();

        if (!currentAccessToken || !currentRefreshToken) {
            return;
        }

        try {
            await logoutUser(currentAccessToken, currentRefreshToken);
        } catch (error) {
            // The local session is already cleared.
            // The server token may already be expired/invalid.
        }
    }, [accessToken, refreshToken, clearAuthentication]);

    /* Restore authentication when app starts */
    useEffect(() => {
        let isMounted = true;

        async function restoreAuthentication() {
            const storedAccessToken = getStoredAccessToken();
            const storedRefreshToken = getStoredRefreshToken();

            if (!storedAccessToken && !storedRefreshToken) {
                if (isMounted) {
                    setIsLoading(false);
                }
                return;
            }

            try {
                let currentAccessToken = storedAccessToken;

                // First try the existing access token.
                if (currentAccessToken) {
                    try {
                        const currentUser = await getCurrentUser(currentAccessToken);

                        if (isMounted) {
                            setUser(currentUser);
                            setAccessToken(currentAccessToken);
                            setRefreshToken(storedRefreshToken);
                        }

                        return;
                    } catch (error) {
                        // Access token may have expired.
                        // Try the refresh token below.
                    }
                }

                // Access token failed, so try refresh.
                if (storedRefreshToken) {
                    const data = await refreshAccessToken(storedRefreshToken);
                    const newAccessToken = data.access;
                    const newRefreshToken = data.refresh || storedRefreshToken;

                    storeTokens(newAccessToken, newRefreshToken);

                    const currentUser = await getCurrentUser(newAccessToken);

                    if (isMounted) {
                        setAccessToken(newAccessToken);
                        setRefreshToken(newRefreshToken);
                        setUser(currentUser);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    clearAuthentication();
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        restoreAuthentication();

        return () => {
            isMounted = false;
        };
    }, [clearAuthentication]);

    const value = {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuthentication,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
