import { createContext, useCallback, useMemo, useRef, useState } from "react";
import ToastContainer from "../components/ui/ToastContainer.jsx";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id) => {
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);

    const notify = useCallback((type, message) => {
        setNotifications((current) => [...current, { id: nextId.current++, type, message }]);
    }, []);

    const api = useMemo(
        () => ({
            success: (message) => notify("success", message),
            error: (message) => notify("error", message)
        }),
        [notify]
    );

    return (
        <NotificationContext.Provider value={api}>
            {children}
            <ToastContainer notifications={notifications} onDismiss={dismiss} />
        </NotificationContext.Provider>
    );
}
