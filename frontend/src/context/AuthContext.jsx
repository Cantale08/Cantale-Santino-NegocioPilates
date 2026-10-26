import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNotifications } from "../hooks/useNotifications.js";
import { setUnauthorizedHandler } from "../services/apiClient.js";
import * as authService from "../services/authService.js";
import { clearToken, getToken } from "../services/tokenStorage.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const notifications = useNotifications();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) {
            return undefined;
        }
        const controller = new AbortController();

        authService
            .getProfile({ signal: controller.signal })
            .then((perfil) => {
                if (!controller.signal.aborted) {
                    setUsuario(perfil);
                }
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    clearToken();
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setUsuario(null);
            notifications.error("Tu sesión expiró. Iniciá sesión nuevamente.");
        });
        return () => setUnauthorizedHandler(null);
    }, [notifications]);

    const login = useCallback(async (credentials) => {
        const autenticado = await authService.login(credentials);
        setUsuario(autenticado);
        return autenticado;
    }, []);

    const register = useCallback(async (datos) => {
        const registrado = await authService.register(datos);
        setUsuario(registrado);
        return registrado;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            // La sesión local se cierra aunque el servidor no responda.
        }
        setUsuario(null);
    }, []);

    const value = useMemo(
        () => ({ usuario, loading, login, register, logout }),
        [usuario, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
