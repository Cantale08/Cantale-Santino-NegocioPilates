import { useEffect } from "react";
import { AlertCircleIcon, CheckCircleIcon, CloseIcon } from "./Icons.jsx";
import "./Toast.css";

const DURATIONS = { success: 5000, error: 8000 };

export default function Toast({ id, type, message, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), DURATIONS[type]);
        return () => clearTimeout(timer);
    }, [id, type, onDismiss]);

    const isError = type === "error";

    return (
        <div className={`toast toast--${type}`} role={isError ? "alert" : "status"}>
            {isError ? <AlertCircleIcon size={22} /> : <CheckCircleIcon size={22} />}
            <p className="toast__message">{message}</p>
            <button
                type="button"
                className="toast__close"
                onClick={() => onDismiss(id)}
                aria-label="Cerrar notificación"
            >
                <CloseIcon size={18} />
            </button>
        </div>
    );
}
