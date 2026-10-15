import Toast from "./Toast.jsx";
import "./Toast.css";

export default function ToastContainer({ notifications, onDismiss }) {
    return (
        <div className="toast-container">
            {notifications.map((notification) => (
                <Toast key={notification.id} {...notification} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
